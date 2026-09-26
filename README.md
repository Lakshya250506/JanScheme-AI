**Live Demo:** [https://janscheme-ai.onrender.com/](https://janscheme-ai.onrender.com/)

*(Note: Hosted on Render's free tier. The server spins down when inactive, so it may take ~50 seconds to load the very first time you open it).*

# 🏛️ JanScheme AI: Smart Welfare Discovery Engine

JanScheme AI is an intelligent, real-time Retrieval-Augmented Generation (RAG) pipeline designed to bridge the information gap in government welfare. By dynamically extracting user demographics through natural conversation, the engine queries the live web to find and summarize highly relevant, localized government schemes and scholarships.

## 🚀 Key Features
* **Conversational Profiling:** Uses an LLM to naturally converse with users and autonomously build a JSON-structured demographic profile.
* **Live Web Grounding (RAG):** Integrates the Tavily Search API to fetch up-to-date government schemes, eliminating LLM hallucinations.
* **High-Speed Inference:** Powered by Groq's LPU architecture for near-instantaneous LLM responses.
* **Smart Auto-Parsing:** Features a custom fuzzy-matching algorithm to handle user misspellings and map them directly to system parameters.
* **Responsive UI:** A modern, accessible interface with a dual Light/Dark theme built on Tailwind CSS.

## 🛠️ Tech Stack
* **Backend:** Node.js, Express.js
* **AI/LLM:** Groq API
* **Search Engine:** Tavily Search API
* **Frontend:** HTML5, Tailwind CSS, Vanilla JavaScript

## 💻 Local Setup
1. Clone the repository.
2. Install dependencies by running `npm install` in your terminal.
3. Create a `.env` file in the root directory and add your API keys:
   ```env
   GROQ_API_KEY=your_groq_key_here
   TAVILY_API_KEY=your_tavily_key_here
   PORT=3000
