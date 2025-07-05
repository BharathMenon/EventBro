# Eventbro Prototype

## Setup

1. Install dependencies:
   ```sh
   npm install express body-parser nodemailer node-fetch dotenv
   ```
2. Create a `.env` file in the root directory with:
   ```env
   EMAIL_USER=your_gmail_address@gmail.com
   EMAIL_PASS=your_gmail_app_password
   PORT=3000
   JIGSAWSTACK_API_KEY=your_jigsawstack_api_key
   ```
   - Use a Gmail App Password for `EMAIL_PASS` if 2FA is enabled.
   - Replace with your actual JigsawStack API key.

3. Start the server:
   ```sh
   node server.js
   ```

4. Open [http://localhost:](http://localhost:3000) in your browser.

## Notes
- The JigsawStack API calls are mocked in `server.js`. Replace with real API calls for production.
- All sensitive info is loaded from `.env`.
- The frontend is in `public/index.html`.
- The backend is in `server.js`.
3000