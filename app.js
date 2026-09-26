let lastSearchProfile = null;
let searchInProgress = false;
let searchTimer = null;

function initTheme() {
    const isDark = (localStorage.getItem('janscheme_theme') || 'dark') === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    updateThemeUI(isDark);
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('janscheme_theme', isDark ? 'dark' : 'light');
    updateThemeUI(isDark);
}

function updateThemeUI(isDark) {
    const icon = document.getElementById('theme-icon');
    const label = document.getElementById('theme-text');
    if (!icon || !label) return;
    icon.className = isDark ? 'fa-solid fa-sun text-amber-400 text-sm' : 'fa-solid fa-moon text-blue-600 text-sm';
    label.innerText = isDark ? 'Light Mode' : 'Dark Mode';
}

initTheme();

function toggleDegree() {
    const occ = document.getElementById('form-occupation').value;
    const degCont = document.getElementById('degree-container');
    if (occ === 'student') {
        degCont.classList.remove('hidden');
    } else {
        degCont.classList.add('hidden');
        document.getElementById('form-degree').value = 'unset';
    }
}

function getCurrentProfile() {
    return {
        age: document.getElementById('form-age').value,
        gender: document.getElementById('form-gender').value,
        income: document.getElementById('form-income').value,
        caste: document.getElementById('form-caste').value,
        occupation: document.getElementById('form-occupation').value,
        degree: document.getElementById('form-degree').value,
        state: document.getElementById('form-state').value,
        maritalStatus: document.getElementById('form-marital').value
    };
}

function profileIsComplete(p) {
    const baseComplete = Boolean(p.age && p.gender !== 'unset' && p.income !== 'unset' && p.caste !== 'unset' && p.occupation !== 'unset');
    if (p.occupation === 'student') return baseComplete && p.degree !== 'unset';
    return baseComplete;
}

function loadPersona(type) {
    const p = {
        farmer: { age: 45, gender: 'male', income: '100000', caste: 'obc', occupation: 'farmer', degree: 'unset', state: 'Maharashtra', marital: 'married' },
        student: { age: 19, gender: 'female', income: '300000', caste: 'general', occupation: 'student', degree: 'ug', state: 'Delhi', marital: 'single' }
    };
    if (!p[type]) return;
    document.getElementById('form-age').value = p[type].age;
    document.getElementById('form-gender').value = p[type].gender;
    document.getElementById('form-income').value = p[type].income;
    document.getElementById('form-caste').value = p[type].caste;
    document.getElementById('form-occupation').value = p[type].occupation;
    document.getElementById('form-state').value = p[type].state;
    document.getElementById('form-marital').value = p[type].marital;
    
    toggleDegree();
    if(type === 'student') document.getElementById('form-degree').value = p[type].degree;
    
    evaluateSchemes(true);
}

function scheduleSchemeSearch() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => evaluateSchemes(false), 500);
}

async function evaluateSchemes(force = false) {
    const profile = getCurrentProfile();

    if (!profileIsComplete(profile)) {
        document.getElementById('match-count').innerText = '0';
        document.getElementById('schemes-container').innerHTML = Array(3).fill(0).map(() => `
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm animate-pulse">
                <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
                <div class="h-2 bg-slate-100 dark:bg-slate-800 rounded w-full mb-2"></div>
                <div class="h-2 bg-slate-100 dark:bg-slate-800 rounded w-5/6 mb-4"></div>
                <div class="h-3 bg-blue-100 dark:bg-blue-900/30 rounded w-24"></div>
            </div>
        `).join('');
        return;
    }

    if (!force && JSON.stringify(profile) === JSON.stringify(lastSearchProfile)) return;
    if (searchInProgress) return;

    searchInProgress = true;
    lastSearchProfile = { ...profile };
    
    document.getElementById('schemes-container').innerHTML = Array(3).fill(0).map(() => `
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm animate-pulse">
            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
            <div class="h-2 bg-slate-100 dark:bg-slate-800 rounded w-full mb-2"></div>
            <div class="h-2 bg-slate-100 dark:bg-slate-800 rounded w-5/6 mb-4"></div>
            <div class="h-3 bg-blue-100 dark:bg-blue-900/30 rounded w-24"></div>
        </div>
    `).join('');

    try {
        const response = await fetch('/api/schemes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentProfile: profile })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `Server Error ${response.status}`);
        renderSchemes(data.schemes || [], data.sources || []);
    } catch (error) {
        document.getElementById('schemes-container').innerHTML = `<p class="text-sm text-red-500 p-4 text-center">Unable to fetch schemes: ${escapeHtml(error.message)}</p>`;
    } finally {
        searchInProgress = false;
    }
}

function escapeHtml(val) {
    return String(val ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
}

function renderSchemes(schemes, sources = []) {
    const container = document.getElementById('schemes-container');
    document.getElementById('match-count').innerText = schemes.length;
    container.innerHTML = '';

    if (!schemes.length) {
        container.innerHTML = '<p class="text-sm text-slate-500 p-4 text-center">No matching schemes were found. Try adjusting parameters.</p>';
        return;
    }

    schemes.forEach(scheme => {
        const div = document.createElement('div');
        div.className = 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm cursor-pointer transition';
        div.onclick = () => openModal(scheme);
        div.innerHTML = `<h3 class="font-bold text-slate-800 dark:text-slate-100">${escapeHtml(scheme.name)}</h3><p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">${escapeHtml(scheme.desc)}</p><div class="mt-2 text-xs text-blue-600 dark:text-blue-400 font-bold">View Details →</div>`;
        container.appendChild(div);
    });
}

function openModal(scheme) {
    document.getElementById('modal-title').innerText = scheme.name || 'Scheme';
    document.getElementById('modal-desc').innerText = scheme.desc || '';
    document.getElementById('modal-link').href = scheme.link || '#';
    document.getElementById('modal-benefits').innerHTML = (scheme.benefits || []).map(b => `<li>${escapeHtml(b)}</li>`).join('');
    document.getElementById('modal-docs').innerHTML = (scheme.docs || []).map(d => `<li><i class="fa-solid fa-check text-emerald-500 mr-2"></i>${escapeHtml(d)}</li>`).join('');
    document.getElementById('scheme-modal').classList.replace('hidden', 'flex');
}

function closeModal() { document.getElementById('scheme-modal').classList.replace('flex', 'hidden'); }

document.getElementById('scheme-modal').addEventListener('click', (e) => {
    if (e.target.id === 'scheme-modal') closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !document.getElementById('scheme-modal').classList.contains('hidden')) closeModal();
});

function appendMessage(text, sender, isRawHtml = false) {
    const div = document.createElement('div');
    div.className = `${sender === 'ai' ? 'ai-message' : 'user-message'} max-w-[85%] text-sm self-${sender === 'ai' ? 'start' : 'end'}`;
    div.innerHTML = `<p class="leading-relaxed">${isRawHtml ? text : escapeHtml(text)}</p>`;
    
    const chatBox = document.getElementById('chat-box');
    chatBox.appendChild(div);
    chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
    
    return div;
}

// Fallback LLM Mapper
function setFormValueFuzzy(selectId, aiValue) {
    const select = document.getElementById(selectId);
    if (!select || aiValue == null) return;
    
    const aiStr = String(aiValue).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!aiStr || aiStr === 'unset' || aiStr === 'null') return;

    for (let option of select.options) {
        if (option.value == aiValue) {
            select.value = option.value;
            return;
        }
    }

    for (let option of select.options) {
        const optVal = String(option.value).toLowerCase();
        const optText = option.text.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (optVal !== 'unset' && (optVal.includes(aiStr) || aiStr.includes(optVal) || optText.includes(aiStr) || aiStr.includes(optText))) {
            select.value = option.value;
            return;
        }
    }
}

const sendBtn = document.getElementById('send-btn');
const chatInput = document.getElementById('chat-input');

sendBtn.addEventListener('click', async () => {
    const text = chatInput.value.trim();
    if (!text || sendBtn.disabled) return;

    appendMessage(text, 'user');
    chatInput.value = '';

    const aiMessage = appendMessage('<div class="typing-dots"><span></span><span></span><span></span></div>', 'ai', true);
    sendBtn.disabled = true;

    // --- NEW FEATURE: Frontend Auto-Parser (Prevents AI from getting stuck on words like "General") ---
    const textLower = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    
    const autoSet = (id, keywords, val) => {
        const el = document.getElementById(id);
        if (el && (el.value === 'unset' || el.value === '')) {
            // Check if the user text contains any of the exact target keywords
            if (keywords.some(k => textLower.includes(k) || textLower === k)) {
                el.value = val;
            }
        }
    };

    // Force map misspellings directly into the UI dropdowns
    autoSet('form-caste', ['general', 'gen', 'open'], 'general');
    autoSet('form-caste', ['obc', 'backward'], 'obc');
    autoSet('form-caste', ['sc', 'scheduled caste', 'dalit'], 'sc');
    autoSet('form-caste', ['st', 'scheduled tribe', 'adivasi'], 'st');
    autoSet('form-caste', ['minority', 'muslim', 'sikh', 'christian', 'jain'], 'minority');

    autoSet('form-gender', ['male', 'boy', 'man', 'guy'], 'male');
    autoSet('form-gender', ['female', 'girl', 'woman', 'lady'], 'female');

    autoSet('form-occupation', ['student', 'study', 'college', 'school'], 'student');
    autoSet('form-occupation', ['farmer', 'kisan', 'agriculture'], 'farmer');
    autoSet('form-occupation', ['business', 'vendor', 'shop'], 'business');
    autoSet('form-occupation', ['unemployed', 'no job', 'jobless'], 'unemployed');

    if (document.getElementById('form-income').value === 'unset') {
        if (textLower.match(/1 lakh|one lakh|100000/)) document.getElementById('form-income').value = '100000';
        else if (textLower.match(/3 lakh|three lakh|300000/)) document.getElementById('form-income').value = '300000';
        else if (textLower.match(/8 lakh|eight lakh|800000/)) document.getElementById('form-income').value = '800000';
    }

    if (document.getElementById('form-age').value === '') {
        const ageMatch = textLower.match(/\b([1-9][0-9])\b/);
        if (ageMatch && parseInt(ageMatch[1]) < 100) {
            document.getElementById('form-age').value = ageMatch[1];
        }
    }
    
    if (document.getElementById('form-occupation').value === 'student') {
        toggleDegree();
        autoSet('form-degree', ['school', '10th', '12th'], 'school');
        autoSet('form-degree', ['ug', 'undergrad', 'bachelor', 'degree', 'btech', 'bsc', 'ba'], 'ug');
        autoSet('form-degree', ['pg', 'postgrad', 'master', 'mtech', 'msc', 'ma'], 'pg');
    }
    // --- END AUTO PARSER ---

    // Invisible Prompt Injection to stop asking optional questions
    const hiddenInstruction = "\n[System: Do NOT ask for optional fields like state or marital status. If Age, Gender, Income, Caste, and Occupation are known, reply EXACTLY with: 'I have all the details needed! Checking schemes for you now...']";
    const payloadText = text + hiddenInstruction;

    try {
        const response = await fetch('/api/chat', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            // Gets the updated auto-parsed profile so the AI sees the forms are already filled
            body: JSON.stringify({ userText: payloadText, currentProfile: getCurrentProfile() }) 
        });
        const data = await response.json();
        
        if(data.profile) {
            if(data.profile.age != null) document.getElementById('form-age').value = data.profile.age;
            ['gender', 'income', 'caste', 'occupation', 'state', 'maritalStatus'].forEach(key => {
                setFormValueFuzzy(`form-${key === 'maritalStatus' ? 'marital' : key}`, data.profile[key]);
            });
            toggleDegree();
            if(data.profile.degree != null) setFormValueFuzzy('form-degree', data.profile.degree);
            scheduleSchemeSearch();
        }

        aiMessage.innerHTML = `<p class="leading-relaxed">${escapeHtml(data.reply)}</p>`;
        
        const chatBox = document.getElementById('chat-box');
        chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
    } catch {
        aiMessage.innerHTML = `<p class="leading-relaxed text-red-500">Error connecting to AI.</p>`;
    } finally {
        sendBtn.disabled = false;
    }
});

chatInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendBtn.click(); });

['form-age', 'form-gender', 'form-income', 'form-caste', 'form-occupation', 'form-degree', 'form-state', 'form-marital'].forEach(id => {
    document.getElementById(id).addEventListener('change', scheduleSchemeSearch);
});