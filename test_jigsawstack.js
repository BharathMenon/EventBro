import 'dotenv/config';
import { JigsawStack } from 'jigsawstack';

async function testJigsawStackAPIs() {
  const apiKey = process.env.JIGSAWSTACK_API_KEY;
  if (!apiKey) {
    console.error('JIGSAWSTACK_API_KEY is missing in .env');
    return;
  }

  const jigsaw = JigsawStack({ apiKey });

  // Test Web Search API
  try {
    const searchData = await jigsaw.web.search({
      query: 'Tech events in San Francisco',
      ai_overview: true,
      safe_search: 'moderate',
      auto_scrape: false
    });
    console.log('Web Search API response:', JSON.stringify(searchData, null, 2));
  } catch (err) {
    console.error('Web Search API error:', err);
  }

  // Test AI Web Scraper API
  try {
    const scrapeData = await jigsaw.web.ai_scrape({
      url: 'https://www.meetup.com/',
      element_prompts: [
        'event name',
        'event date in YYYY-MM-DD format',
        'event location',
        'link to the event'
      ]
    });
    console.log('AI Web Scraper API response:', JSON.stringify(scrapeData, null, 2));
  } catch (err) {
    console.error('AI Web Scraper API error:', err);
  }
}

testJigsawStackAPIs();
