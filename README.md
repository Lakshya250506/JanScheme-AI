# JanScheme AI - Live Government Scheme Discovery

## What changed
- Migrated from deprecated `@google/generative-ai` to the current `@google/genai` SDK.
- Uses `gemini-2.5-flash-lite` for low-cost/high-throughput requests.
- Uses Google Search grounding for live web discovery.
- Separates profile extraction from scheme search, so normal chat does not trigger web search.
- Adds exponential backoff + jitter for transient 429/5xx failures.
- Adds 5-minute server-side caching.
- De-duplicates simultaneous searches for the same profile.
- Returns grounding sources to the frontend.
- Keeps the Gemini key server-side in `.env`.
- Serves the frontend and API from the same Express server for easier deployment.

## Setup
1. Install Node.js 20+.
2. Copy `.env.example` to `.env`.
3. Put your NEW Gemini API key in `.env`.
4. Run:
   npm install
   npm start
5. Open http://localhost:3000

Backend health check:
http://localhost:3000/api/health

## Security
Never commit `.env`. If an API key has ever been uploaded to GitHub, a chat, screenshot, or public repo, revoke it and create a new key.
