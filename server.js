require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '32kb' }));
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;
const CACHE_TTL_MS = 10 * 60 * 1000;

const schemeCache = new Map();
const inFlight = new Map();

if (!process.env.GROQ_API_KEY || !process.env.TAVILY_API_KEY) {
    console.error('CRITICAL: GROQ_API_KEY or TAVILY_API_KEY is missing from .env');
    process.exit(1);
}

// Helper to normalize the profile from the frontend
function normalizeProfile(p = {}) {
    return {
        age: p.age === '' || p.age === undefined ? null : Number(p.age),
        gender: p.gender === 'unset' ? null : (p.gender || null),
        income: p.income === '' || p.income === 'unset' ? null : Number(p.income),
        caste: p.caste === 'unset' ? null : (p.caste || null),
        occupation: p.occupation === 'unset' ? null : (p.occupation || null),
        degree: p.degree === 'unset' ? null : (p.degree || null),
        state: p.state === 'unset' ? null : (p.state || null),
        maritalStatus: p.maritalStatus === 'unset' ? null : (p.maritalStatus || null)
    };
}

function isComplete(p) {
    const base = Number.isFinite(p.age) && !!p.gender && !!p.occupation && Number.isFinite(p.income) && !!p.caste;
    return p.occupation === 'student' ? (base && !!p.degree) : base;
}

// Health Check Endpoint
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ---------------------------------------------------------
// 1. CHAT ENDPOINT (Handled by Groq)
// ---------------------------------------------------------
app.post('/api/chat', async (req, res) => {
    try {
        const { userText = '', currentProfile = {} } = req.body;
        
        const systemPrompt = `You are JanScheme AI. Update profile based on user input. Only ask for missing compulsory fields: Age, Gender, Income, Caste, Occupation (and Degree if Student).
        Current Profile: ${JSON.stringify(normalizeProfile(currentProfile))}
        User says: "${userText.slice(0, 500)}"
        Output valid JSON exactly like this: {"reply": "Your next question", "profile": {"age": 20, "gender": "male", "income": 100000, "caste": "sc", "occupation": "student", "degree": "ug", "state": "Delhi", "maritalStatus": "single"}}`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "openai/gpt-oss-120b",
                messages: [{ role: "user", content: systemPrompt }],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        res.json(JSON.parse(data.choices[0].message.content));
    } catch (e) {
        console.error(e);
        res.status(503).json({ reply: 'Temporarily busy.' });
    }
});

// ---------------------------------------------------------
// 2. LIVE SCHEME SEARCH ENGINE (Tavily + Groq RAG Pipeline)
// ---------------------------------------------------------
app.post('/api/schemes', async (req, res) => {
    try {
        const profile = normalizeProfile(req.body?.currentProfile);
        if (!isComplete(profile)) {
            return res.status(400).json({ error: 'Incomplete profile parameters.' });
        }

        const key = Object.values(profile).join('|');
        if (schemeCache.has(key) && (Date.now() - schemeCache.get(key).createdAt < CACHE_TTL_MS)) {
            return res.json({ ...schemeCache.get(key).value, cached: true });
        }
        if (inFlight.has(key)) {
            return res.json({ ...(await inFlight.get(key)), cached: true });
        }

        const searchPromise = (async () => {
            // STEP 1: Fetch Live Web Data using Tavily
            let query = `Indian government welfare schemes and scholarships for ${profile.gender} ${profile.occupation} age ${profile.age} income ${profile.income} caste ${profile.caste}`;
            if (profile.state) query += ` in ${profile.state}`;
            if (profile.maritalStatus) query += ` marital status ${profile.maritalStatus}`;
            
            const tavilyRes = await fetch('https://api.tavily.com/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    api_key: process.env.TAVILY_API_KEY,
                    query: query,
                    search_depth: "basic",
                    max_results: 5
                })
            });

            if (!tavilyRes.ok) {
                const errText = await tavilyRes.text();
                throw new Error(`Tavily Search API Error (${tavilyRes.status}): ${errText}`);
            }

            const tavilyData = await tavilyRes.json();
            const results = tavilyData.results || [];
            
            const searchSnippets = results.map(r => `Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content}`).join('\n\n');
            const sources = results.map(r => ({ title: r.title, uri: r.url }));

            // STEP 2: Pass Web Data to Groq
            const extractionPrompt = `You are a data extractor. Read these live internet search results and extract EXACTLY 3 government schemes.
Output ONLY valid JSON matching this structure:
{
  "schemes": [
    {
      "name": "Scheme Name",
      "desc": "Short description",
      "benefits": ["Benefit 1", "Benefit 2"],
      "docs": ["Doc 1", "Doc 2"],
      "link": "https://official-link.gov.in"
    }
  ]
}

SEARCH RESULTS:
${searchSnippets || "No online results found."}`;

            const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    model: "openai/gpt-oss-120b",
                    messages: [{ role: "user", content: extractionPrompt }],
                    response_format: { type: "json_object" }
                })
            });

            if (!groqRes.ok) {
                const errText = await groqRes.text();
                throw new Error(`Groq API Error (${groqRes.status}): ${errText}`);
            }

            const groqData = await groqRes.json();
            const content = groqData.choices?.[0]?.message?.content;
            
            if (!content) {
                throw new Error("Groq returned an empty response choices payload.");
            }

            const parsedJSON = JSON.parse(content);
            parsedJSON.sources = sources;
            return parsedJSON;
        })();

        inFlight.set(key, searchPromise);
        const result = await searchPromise;
        schemeCache.set(key, { createdAt: Date.now(), value: result });
        res.json(result);
    } catch (error) {
        console.error("Backend Scheme Search Error:", error.message);
        res.status(500).json({ error: error.message || 'Search execution failed.' });
    } finally {
        inFlight.delete(Object.values(normalizeProfile(req.body?.currentProfile)).join('|'));
    }
});

app.listen(PORT, () => {
    console.log(`🚀 JanScheme RAG Engine is running!`);
    console.log(`🌐 Open in your browser: http://localhost:${PORT}`);
});