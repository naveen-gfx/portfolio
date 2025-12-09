// --- 1. FAIL-SAFE ANIMATION TRIGGER ---
// We add this class immediately. 
// CSS will use this to know that JS is ready to handle animations.
document.body.classList.add('js-loaded');

// --- Gemini API Configuration ---
const apiKey = ""; // API key will be injected by the environment

async function callGemini(prompt) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) throw new Error('API call failed');
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error("Gemini Error:", error);
        return null;
    }
}

// --- Feature 2: Magic Message Polish ---
const polishBtn = document.getElementById('polish-btn');
const messageInput = document.getElementById('contact-message');

if (polishBtn && messageInput) {
    polishBtn.addEventListener('click', async () => {
        const originalText = messageInput.value;
        if (!originalText.trim()) {
            messageInput.placeholder = "Please type something first to polish!";
            return;
        }

        const originalBtnContent = polishBtn.innerHTML;
        polishBtn.innerHTML = '<div class="spinner w-3 h-3 border-violet-400"></div> Polishing...';
        polishBtn.disabled = true;

        const prompt = `Rewrite the following contact form message to be more professional, polite, and persuasive, but keep it concise: "${originalText}"`;
        
        const result = await callGemini(prompt);

        polishBtn.innerHTML = originalBtnContent;
        polishBtn.disabled = false;

        if (result) {
            messageInput.value = result.trim();
        }
    });
}

// --- Existing UI Scripts ---
const cursorDot = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');

if (cursorDot && cursorOutline) {
    window.addEventListener('mousemove', function(e) {
        const posX = e.clientX;
        const posY = e.clientY;
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
        cursorOutline.animate({ left: `${posX}px`, top: `${posY}px` }, { duration: 500, fill: "forwards" });
    });

    document.querySelectorAll('a, button, input, textarea, .glass-panel').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.style.width = '60px';
            cursorOutline.style.height = '60px';
            cursorOutline.style.backgroundColor = 'rgba(255,255,255,0.1)';
        });
        el.addEventListener('mouseleave', () => {
            cursorOutline.style.width = '40px';
            cursorOutline.style.height = '40px';
            cursorOutline.style.backgroundColor = 'transparent';
        });
    });
}

const themeBtn = document.getElementById('theme-toggle');
const body = document.body;

if (themeBtn) {
    const themeIcon = themeBtn.querySelector('i');
    themeBtn.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        if(body.classList.contains('light-mode')) {
            themeIcon.classList.remove('ri-moon-line');
            themeIcon.classList.add('ri-sun-line');
        } else {
            themeIcon.classList.remove('ri-sun-line');
            themeIcon.classList.add('ri-moon-line');
        }
    });
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));

let statsRun = false;
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !statsRun) {
            runStats();
            statsRun = true;
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stat-number');
if(statsSection) {
        statsObserver.observe(statsSection.closest('section'));
}

function runStats() {
    document.querySelectorAll('.stat-number').forEach(stat => {
        const target = +stat.getAttribute('data-target');
        let count = 0;
        const inc = target / 50; 
        const timer = setInterval(() => {
            count += inc;
            if (count >= target) {
                stat.innerText = target + "+";
                clearInterval(timer);
            } else {
                stat.innerText = Math.ceil(count);
            }
        }, 30);
    });
}

// --- NEW: Card Stack Auto Rotation ---
const stack = document.querySelector('.card-stack');
function rotateCards() {
    if(!stack) return;
    const cards = Array.from(stack.children);
    if(cards.length > 0) {
        // To rotate the stack so the "next card comes up":
        // The last element is visually on top (z-index 5).
        // We move it to the beginning of the list (z-index 1).
        // This reveals the element that was previously 2nd from last (now last/top).
        const topCard = cards[cards.length - 1];
        stack.prepend(topCard);
    }
}

let cardInterval = setInterval(rotateCards, 3000); // Rotate every 3 seconds

// Pause rotation on hover so users can read the cards
if(stack) {
    stack.addEventListener('mouseenter', () => clearInterval(cardInterval));
    stack.addEventListener('mouseleave', () => cardInterval = setInterval(rotateCards, 3000));
}
