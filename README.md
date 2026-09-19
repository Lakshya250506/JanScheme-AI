# 🏛️ JanScheme AI - Smart Welfare Discovery Engine

**Built for Hack Devengers 2.0 (Open Innovation Track)**

Millions of Indian citizens miss out on vital government welfare schemes, grants, and scholarships because the information is buried in complex, English-heavy websites. **JanScheme AI** solves this by providing a dual-interface, voice-first AI assistant that instantly matches users with the schemes they are eligible for based on their unique profile.

## ✨ Key Features Built in 24 Hours

* **Dual Input Engine:** Users can either use the guided dropdown forms (for fast, structured input) or chat naturally with the AI to explain their situation.
* **Smart Bi-Directional Sync:** Powered by Google Gemini, the chatbot doesn't just reply—it reads the user's natural language (e.g., *"I'm a 24-year-old female student"*) and automatically extracts that data to update the UI form in real-time.
* **Voice-First Accessibility:** Integrated with the browser's native Web Speech API, allowing users to speak their queries and hear the AI's responses read aloud.
* **Instant Offline-Ready Engine:** The core matching algorithm runs instantly on the client side using a local database of 14 major Indian schemes, ensuring lightning-fast results without loading screens.
* **Premium Modern UI:** Built with Tailwind CSS featuring glassmorphism, smooth animations, and a sleek dark mode aesthetic.

## 🛠️ Tech Stack

* **Frontend:** HTML5, Vanilla JavaScript, Tailwind CSS (via CDN)
* **AI & Intelligence:** Google Gemini API (`gemini-3.6-flash` model)
* **Voice Capabilities:** Web Speech API (Speech-to-Text & Text-to-Speech)
* **Typography & Icons:** Plus Jakarta Sans, FontAwesome

##  How the AI Works (Architecture)

To make the chatbot "smart", the application sends a heavily structured prompt to the Gemini API. It instructs the LLM to return a strict JSON object containing two things:
1. A short, empathetic conversational reply.
2. A `profile` object containing extracted variables (Age, Gender, Income, Occupation). 

The JavaScript frontend parses this JSON, prints the chat message, and instantly updates the DOM form elements using the extracted variables, triggering the local filtering algorithm to display matching scheme cards.

##  How to Run Locally

1. Clone or download this repository.
2. Open the `app.js` file in any text editor.
3. Replace the `GEMINI_API_KEY` variable at the top of the file with your own active Google Gemini API key.
4. Open `index.html` in any modern web browser. (No `npm install` or backend server required!)
