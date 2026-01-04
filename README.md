# Israel Tech Daily Newsletter Bot

This bot fetches the latest tech news from Israel (Startups, M&A, IPOs) and emails a summary of the top 5 articles daily at 11:00 AM PST.

## Prerequisites

- **Node.js**: You need Node.js installed on your machine.
- **Email Account**: An email account with SMTP access (e.g., Gmail with App Password).

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   - Rename `.env.example` to `.env`
   - Fill in your email details:
     ```
     EMAIL_SERVICE=gmail
     EMAIL_USER=your-email@gmail.com
     EMAIL_PASS=your-app-password
     EMAIL_TO=recipient@example.com
     ```
   
   > **Note for Gmail Users**: You must use an [App Password](https://support.google.com/accounts/answer/185833?hl=en) if you have 2-Step Verification enabled.

## Running the Bot

To start the scheduler (keeps running in terminal):
```bash
npm start
```

## Testing

To run a one-off test immediately (bypass scheduler):
You can uncomment `runTask();` in `src/scheduler.ts` and run `npm start`, or create a separate test script.
