# JanScheme AI - Live Government Scheme Discovery

## Architecture & Features
* **Modern SDK:** Migrated from deprecated `@google/generative-ai` to the current `@google/genai` SDK.
* **Fast & Cost-Effective:** Uses `gemini-2.5-flash-lite` for low-cost, high-throughput requests.
* **Live Web Grounding:** Uses Google Search grounding for real-time web discovery.
* **Optimized Execution:** Separates profile extraction from scheme search, ensuring normal chat does not trigger unnecessary web searches.
* **Resilience:** Adds exponential backoff and jitter for transient 429/5xx failures.
* **Performance:** Adds 5-minute server-side caching and de-duplicates simultaneous searches for the same profile.
* **Frontend Integration:** Returns grounding sources to the frontend. Serves the frontend and API from the same Express server for easier deployment.
* **Security:** Keeps the Gemini key strictly server-side in the `.env` file.

## Setup Instructions
1. Install Node.js 20+.
2. Copy `.env.example` to `.env`.
3. Put your NEW Gemini API key in `.env`.
4. Run the following commands in your terminal:
   ```bash
   npm install
   npm start
