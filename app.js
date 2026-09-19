// --- 1. SCHEME DATABASE ---
const schemeDatabase = [
    { id: 1, name: "PM Kisan Samman Nidhi", desc: "Income support of ₹6,000 per year to all landholding farmer families.", minAge: 18, maxAge: 100, gender: "any", maxIncome: 9999999, occupation: "farmer", benefits: ["₹6,000 per year", "Direct bank transfer in 3 installments"], docs: ["Aadhaar Card", "Bank Account Details", "Land Holding Papers"], link: "https://pmkisan.gov.in/" },
    { id: 2, name: "Pradhan Mantri Mudra Yojana (PMMY)", desc: "Loans up to ₹10 lakh to non-corporate, non-farm small/micro enterprises.", minAge: 18, maxAge: 65, gender: "any", maxIncome: 9999999, occupation: "business", benefits: ["Collateral-free loan", "Shishu (up to ₹50k), Kishore (₹50k-₹5L), Tarun (₹5L-₹10L)"], docs: ["Identity Proof", "Business Plan", "Address Proof"], link: "https://www.mudra.org.in/" },
    { id: 3, name: "Sukanya Samriddhi Yojana", desc: "A savings scheme targeted at the parents of girl children.", minAge: 0, maxAge: 10, gender: "female", maxIncome: 9999999, occupation: "any", benefits: ["High interest rate (approx 8%)", "Tax benefits under 80C"], docs: ["Girl Child Birth Certificate", "Parent Identity Proof"], link: "https://www.indiapost.gov.in/" },
    { id: 4, name: "PM SVANidhi", desc: "Special micro-credit facility for street vendors to resume their livelihoods.", minAge: 18, maxAge: 99, gender: "any", maxIncome: 300000, occupation: "business", benefits: ["Working capital loan up to ₹10,000", "Interest subsidy of 7%"], docs: ["Vending Certificate", "Aadhaar linked Bank Account"], link: "https://pmsvanidhi.mohua.gov.in/" },
    { id: 5, name: "National Scholarship Portal", desc: "Scholarships for students from economically weaker sections.", minAge: 15, maxAge: 30, gender: "any", maxIncome: 250000, occupation: "student", benefits: ["Tuition fee reimbursement", "Maintenance allowance"], docs: ["Income Certificate", "Previous Marksheet", "Aadhaar Card"], link: "https://scholarships.gov.in/" },
    { id: 6, name: "Ayushman Bharat (PM-JAY)", desc: "Health insurance cover of ₹5 lakh per family per year.", minAge: 0, maxAge: 100, gender: "any", maxIncome: 250000, occupation: "any", benefits: ["₹5 lakh/year cashless health cover", "Covers pre-existing conditions"], docs: ["Ration Card", "Aadhaar Card", "SECC Verification"], link: "https://pmjay.gov.in/" },
    { id: 7, name: "Pradhan Mantri Awas Yojana (PMAY)", desc: "Financial assistance and interest subsidy for housing.", minAge: 18, maxAge: 100, gender: "any", maxIncome: 1800000, occupation: "any", benefits: ["Interest subsidy up to 6.5%", "Up to ₹2.67 lakh subsidy"], docs: ["Income Proof", "Property Documents", "Aadhaar Card"], link: "https://pmaymis.gov.in/" },
    { id: 8, name: "Atal Pension Yojana", desc: "Guaranteed monthly pension scheme for unorganized sector workers.", minAge: 18, maxAge: 40, gender: "any", maxIncome: 9999999, occupation: "any", benefits: ["Guaranteed pension ₹1,000-₹5,000/month", "Govt co-contribution for eligible subscribers"], docs: ["Aadhaar Card", "Bank Account", "Mobile Number"], link: "https://npscra.nsdl.co.in/" },
    { id: 9, name: "PM Jan Dhan Yojana", desc: "Zero-balance bank account with insurance and overdraft facility.", minAge: 10, maxAge: 100, gender: "any", maxIncome: 9999999, occupation: "any", benefits: ["Zero balance account", "₹2 lakh accident insurance", "Overdraft up to ₹10,000"], docs: ["Aadhaar Card", "Address Proof"], link: "https://pmjdy.gov.in/" },
    { id: 10, name: "Beti Bachao Beti Padhao", desc: "Welfare support for the survival, protection, and education of the girl child.", minAge: 0, maxAge: 18, gender: "female", maxIncome: 9999999, occupation: "student", benefits: ["Educational support", "Community awareness resources"], docs: ["Girl Child Birth Certificate", "School Enrollment Proof"], link: "https://wcd.nic.in/bbbp-schemes" }
];

const GEMINI_API_KEY = "REMOVED_FOR_SECURITY";

// --- 2. THEME TOGGLE LOGIC ---
function initTheme() {
    const savedTheme = localStorage.getItem('janscheme_theme') || 'dark';
    const htmlEl = document.documentElement;
    if (savedTheme === 'dark') {
        htmlEl.classList.add('dark');
        updateThemeUI(true);
    } else {
        htmlEl.classList.remove('dark');
        updateThemeUI(false);
    }
}

function toggleTheme() {
    const htmlEl = document.documentElement;
    const isDark = htmlEl.classList.toggle('dark');
    localStorage.setItem('janscheme_theme', isDark ? 'dark' : 'light');
    updateThemeUI(isDark);
}

function updateThemeUI(isDark) {
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');
    if (!icon || !text) return;
    
    if (isDark) {
        icon.className = 'fa-solid fa-sun text-amber-400 text-sm';
        text.innerText = 'Light Mode';
    } else {
        icon.className = 'fa-solid fa-moon text-blue-600 text-sm';
        text.innerText = 'Dark Mode';
    }
}

// Init theme immediately on load
initTheme();

// --- 3. LOGIC & FUNCTIONS ---
function loadPersona(type) {
    if (type === 'farmer') {
        document.getElementById('form-age').value = 45;
        document.getElementById('form-gender').value = "male";
        document.getElementById('form-income').value = 100000;
        document.getElementById('form-occupation').value = "farmer";
    } else if (type === 'student') {
        document.getElementById('form-age').value = 19;
        document.getElementById('form-gender').value = "female";
        document.getElementById('form-income').value = 300000;
        document.getElementById('form-occupation').value = "student";
    } else if (type === 'vendor') {
        document.getElementById('form-age').value = 35;
        document.getElementById('form-gender').value = "any";
        document.getElementById('form-income').value = 100000;
        document.getElementById('form-occupation').value = "business";
    }
    evaluateSchemes();
}

function evaluateSchemes() {
    const age = parseInt(document.getElementById('form-age').value) || 0;
    const gender = document.getElementById('form-gender').value;
    const income = parseInt(document.getElementById('form-income').value);
    const occupation = document.getElementById('form-occupation').value;

    const matched = schemeDatabase.filter(scheme => {
        const ageMatch = age === 0 || (age >= scheme.minAge && age <= scheme.maxAge);
        const genderMatch = scheme.gender === "any" || scheme.gender === gender;
        const incomeMatch = income <= scheme.maxIncome;
        const occMatch = scheme.occupation === "any" || scheme.occupation === occupation;
        return ageMatch && genderMatch && incomeMatch && occMatch;
    });

    renderSchemes(matched);
}

function renderSchemes(schemes) {
    const container = document.getElementById('schemes-container');
    document.getElementById('match-count').innerText = schemes.length;
    container.innerHTML = '';

    if (schemes.length === 0) {
        container.innerHTML = '<p class="text-sm text-slate-500 dark:text-slate-400">No strict matches found. Try adjusting criteria or ask the AI.</p>';
        return;
    }

    schemes.forEach(scheme => {
        const div = document.createElement('div');
        div.className = "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm cursor-pointer transition";
        div.onclick = () => openModal(scheme);
        div.innerHTML = `
            <h3 class="font-bold text-slate-800 dark:text-slate-100">${scheme.name}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">${scheme.desc}</p>
            <div class="mt-2 text-xs text-blue-600 dark:text-blue-400 font-bold">View Details →</div>
        `;
        container.appendChild(div);
    });
}

function openModal(scheme) {
    document.getElementById('modal-title').innerText = scheme.name;
    document.getElementById('modal-desc').innerText = scheme.desc;
    document.getElementById('modal-link').href = scheme.link;
    document.getElementById('modal-benefits').innerHTML = scheme.benefits.map(b => `<li>${b}</li>`).join('');
    document.getElementById('modal-docs').innerHTML = scheme.docs.map(d => `<li><i class="fa-solid fa-check text-emerald-500 mr-2"></i>${d}</li>`).join('');
    document.getElementById('scheme-modal').classList.replace('hidden', 'flex');
}

function closeModal() { document.getElementById('scheme-modal').classList.replace('flex', 'hidden'); }

// --- 4. CHATBOT & GUIDED MOCK AI INTEGRATION ---
const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

function appendMessage(text, sender) {
    const div = document.createElement('div');
    const isAI = sender === 'ai';
    div.className = `${isAI ? 'ai-message' : 'user-message'} max-w-[85%] text-sm self-${isAI ? 'start' : 'end'}`;
    div.innerHTML = `<p class="leading-relaxed">${text}</p>`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// GUIDED Smart Offline Mock Engine
function getMockAIResponse(userText) {
    const t = userText.toLowerCase();
    let age = null, gender = null, occupation = null, income = null;

    if (t.match(/\b(\d{1,3})\b/)) age = parseInt(t.match(/\b(\d{1,3})\b/)[1]);
    if (t.includes("female") || t.includes("woman") || t.includes("girl") || t.includes("she")) gender = "female";
    else if (t.includes("male") || t.includes("man") || t.includes("boy") || t.includes("he")) gender = "male";

    if (t.includes("student") || t.includes("study") || t.includes("college") || t.includes("school")) { occupation = "student"; income = 100000; }
    else if (t.includes("farmer") || t.includes("farm") || t.includes("agriculture")) occupation = "farmer";
    else if (t.includes("vendor") || t.includes("business") || t.includes("shop") || t.includes("trade")) occupation = "business";

    let currentAge = age || parseInt(document.getElementById('form-age').value) || 0;
    let currentGender = gender || document.getElementById('form-gender').value;
    let currentOcc = occupation || document.getElementById('form-occupation').value;

    applyProfileToForm({ age, gender, occupation, income });

    if (!currentAge || currentAge === 0) {
        return "I have updated your details! To find the most accurate schemes, could you please tell me your age?";
    } else if (currentOcc === "any" && !t.includes("any")) {
        return `Got it! You are ${currentAge} years old. Now, what is your primary occupation? (e.g., student, farmer, or small business owner)`;
    } else if (currentGender === "any" && !t.includes("any") && !t.includes("all")) {
        return "Thank you! Finally, are you looking for schemes specifically for women, men, or general schemes for anyone?";
    }

    if (currentOcc === "student") {
        if (currentAge <= 18) return "Perfect! Based on your full profile, you qualify for the National Scholarship Portal and Beti Bachao Beti Padhao. Check the left panel!";
        else return "Perfect! I have updated your full profile. Check the left panel for schemes you qualify for, like PM Jan Dhan Yojana!";
    } else if (currentOcc === "farmer") {
        return "Perfect! As an agricultural worker, I've matched you with PM Kisan Samman Nidhi and MGNREGA. Check the left panel!";
    } else if (currentOcc === "business") {
        return "Excellent! For small business owners, schemes like PM SVANidhi and Pradhan Mantri Mudra Yojana offer working capital loans. Check the left panel!";
    }

    return `Thanks! I've set your profile. Please check the matching schemes on the left panel. Let me know if you want to change anything!`;
}

async function callGeminiAPI(userText) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "REMOVED_FOR_SECURITY") return getMockAIResponse(userText);

    const prompt = `You are JanScheme AI. The user said: "${userText}"
Respond with JSON:
{
  "reply": "a short, helpful reply. If the user hasn't provided their age or occupation, politely ask them for it.",
  "profile": { "age": <number or null>, "gender": "male"|"female"|"any"|null, "occupation": "farmer"|"student"|"business"|"any"|null, "income": <number or null> }
}`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } })
        });
        if (!response.ok) return getMockAIResponse(userText);
        const data = await response.json();
        let parsed = JSON.parse(data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim());
        applyProfileToForm(parsed.profile);
        return parsed.reply || getMockAIResponse(userText);
    } catch (e) { return getMockAIResponse(userText); }
}

function applyProfileToForm(profile) {
    if (!profile) return;
    let updated = false;
    if (profile.age !== null && profile.age !== undefined) { document.getElementById('form-age').value = profile.age; updated = true; }
    if (profile.gender) { document.getElementById('form-gender').value = profile.gender; updated = true; }
    if (profile.occupation) { document.getElementById('form-occupation').value = profile.occupation; updated = true; }
    if (profile.income !== null && profile.income !== undefined) {
        let bracket = "9999999";
        if (profile.income < 100000) bracket = "100000";
        else if (profile.income < 300000) bracket = "300000";
        else if (profile.income < 800000) bracket = "800000";
        document.getElementById('form-income').value = bracket; updated = true;
    }
    if (updated) evaluateSchemes();
}

sendBtn.addEventListener('click', async () => {
    const text = chatInput.value.trim();
    if (!text) return;
    appendMessage(text, 'user');
    chatInput.value = '';

    const loadId = Date.now();
    appendMessage("Typing...", 'ai');
    const aiMsgDiv = chatBox.lastChild;
    aiMsgDiv.id = `load-${loadId}`;

    const reply = await callGeminiAPI(text);
    aiMsgDiv.innerHTML = `<p class="leading-relaxed">${reply}</p>`;
    
    const speakerBtn = document.createElement('button');
    speakerBtn.className = "mt-3 flex items-center gap-1.5 text-[10px] uppercase font-extrabold tracking-wider text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition cursor-pointer bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm";
    speakerBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> Listen';
    speakerBtn.onclick = () => speakText(reply);
    aiMsgDiv.appendChild(speakerBtn);
});
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendBtn.click(); });

// --- 5. VOICE AI ---
const micBtn = document.getElementById('mic-btn');
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-IN';
    recognition.onstart = () => { micBtn.classList.add('mic-active'); chatInput.placeholder = "Listening..."; };
    recognition.onresult = (event) => { chatInput.value = event.results[0][0].transcript; sendBtn.click(); };
    recognition.onend = () => { micBtn.classList.remove('mic-active'); chatInput.placeholder = "Type your answer..."; };
    micBtn.addEventListener('click', () => recognition.start());
} else { micBtn.style.display = 'none'; }

function speakText(text) {
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'en-IN'; speech.rate = 1;
    window.speechSynthesis.speak(speech);
}