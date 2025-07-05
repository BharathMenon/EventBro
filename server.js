import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import path from 'path';
import { JigsawStack } from 'jigsawstack';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

const jigsaw = JigsawStack({ apiKey: process.env.JIGSAWSTACK_API_KEY });

// Helper: Call JigsawStack Web Search API
async function searchEvents(query) {
  // Uses the official JigsawStack SDK
  const data = await jigsaw.web.search({
    query: query,
    ai_overview: true,
    safe_search: 'moderate',
    auto_scrape: false
  });
  console.log('JigsawStack Web Search API response:', JSON.stringify(data, null, 2));
  return (data.results || []).slice(0, 5).map(r => ({ title: r.title, url: r.url }));
}

// Helper: Call JigsawStack AI Web Scraper API
async function extractEventDetails(url) {
  // Uses the official JigsawStack SDK
  const data = await jigsaw.web.ai_scrape({
    url,
    element_prompts: [
      'event name',
      'event date in YYYY-MM-DD format',
      'event location',
      'link to the event'
    ]
  });
  console.log(`JigsawStack Scraper API response for ${url}:`, JSON.stringify(data, null, 2));
  const ctx = data.context || {};
  return {
    name: ctx['event name'] ? (Array.isArray(ctx['event name']) ? ctx['event name'][0] : ctx['event name']) : 'Unknown',
    date: ctx['event date in YYYY-MM-DD format'] ? (Array.isArray(ctx['event date in YYYY-MM-DD format']) ? ctx['event date in YYYY-MM-DD format'][0] : ctx['event date in YYYY-MM-DD format']) : '',
    location: ctx['event location'] ? (Array.isArray(ctx['event location']) ? ctx['event location'][0] : ctx['event location']) : '',
    link: ctx['link to the event'] ? (Array.isArray(ctx['link to the event']) ? ctx['link to the event'][0] : ctx['link to the event']) : url
  };
}

// Helper: Send email with event list
async function sendEventEmail(to, events) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const html = `<h2>Your Eventbro Results</h2><ul>${events.map(e => `<li><a href="${e.link}">${e.name}</a> - ${e.date} - ${e.location}</li>`).join('')}</ul>`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Your Eventbro Event Results',
    html
  });
}

// POST /find-events endpoint
app.post('/find-events', async (req, res) => {
  try {
    const { prompt, city, email } = req.body;
    if (!prompt || !city || !email) return res.status(400).json({ error: 'Missing fields' });

    // Combine prompt and city
    // Make the query more specific to the city for better search results
    const searchQuery = `${prompt} happening in ${city}. Only provide the links for the events`;

    // 1. Search for event pages
    const searchResults = await searchEvents(searchQuery);

    // 2. Scrape each result for event details
    const eventDetails = await Promise.all(searchResults.map(r => extractEventDetails(r.url)));

    // 3. Filter for future events in the specified city
    const today = new Date().toISOString().slice(0, 10);
    const filtered = eventDetails.filter(e =>
      typeof e.location === 'string' &&
      e.location.toLowerCase().includes(city.toLowerCase()) &&
      e.date >= today
    );

    // 4. Send email
    // await sendEventEmail(email, filtered);

    // 5. Return JSON
    res.json({ events: filtered });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve frontend HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Eventbro server running on port ${PORT}`);
});
