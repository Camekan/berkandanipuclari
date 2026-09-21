// ==========================================
// CONFIGURATION
// ==========================================
'use strict';

const BLOGGER_URL = "https://berkandanipuclari.blogspot.com"; 
const BACKEND_URL = "https://berkan-ai-backend.lanselam.workers.dev"; 
// ==========================================

// === SAFE STORAGE WRAPPER ===
const storage = {
    get: (key) => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn('Storage unavailable', e);
            return null;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn('Storage failed', e);
        }
    }
};

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
    fetchBloggerPosts();
    fetchLatestVideo();
    initLanguage();
    tryAutoplayMusic(); 
});

// === 1. MUSIC & AUDIO LOGIC ===
let isMusicPlaying = false;

function tryAutoplayMusic() {
    const bgMusic = document.getElementById('bg-music');
    if (!bgMusic) return;

    const playPromise = bgMusic.play();
    
    if (playPromise !== undefined) {
        playPromise.then(_ => {
            isMusicPlaying = true;
            updateMusicUI(true);
        }).catch(error => {
            console.log("Autoplay prevented by browser policy.");
            const startMusicOnInteraction = () => {
                bgMusic.play().catch(e => console.error("Audio play failed:", e));
                isMusicPlaying = true;
                updateMusicUI(true);
                document.removeEventListener('click', startMusicOnInteraction);
            };
            document.addEventListener('click', startMusicOnInteraction);
        });
    }
}

function toggleBgMusic() {
    const bgMusic = document.getElementById('bg-music');
    if (!bgMusic) return;

    if (bgMusic.paused) {
        bgMusic.play().catch(e => console.error("Play failed:", e));
        isMusicPlaying = true;
    } else {
        bgMusic.pause();
        isMusicPlaying = false;
    }
    updateMusicUI(isMusicPlaying);
}

function updateMusicUI(isPlaying) {
    const btn = document.getElementById('music-btn');
    if (btn) {
        if (isPlaying) {
            btn.innerText = "|| Pause Music";
        } else {
            btn.innerText = "► Play Music";
        }
    }
}

function toggleAudio(id) {
    const audio = document.getElementById('audio-' + id);
    const btn = document.querySelector(`button[onclick="toggleAudio('${id}')"]`);

    if (audio.paused) {
        document.querySelectorAll('audio').forEach(a => { 
            if (a.id !== 'bg-music' && a !== audio) { 
                a.pause(); 
                a.currentTime = 0; 
                const otherId = a.id.replace('audio-', '');
                const otherBtn = document.querySelector(`button[onclick="toggleAudio('${otherId}')"]`);
                if(otherBtn) otherBtn.innerText = "Play";
            } 
        });
        
        audio.play().then(() => {
            if(btn) btn.innerText = "Pause";
        }).catch(err => {
            console.warn("Audio play failed:", err);
        });
        
        audio.onended = () => {
            if(btn) btn.innerText = "Play";
        };
    } else {
        audio.pause();
        if(btn) btn.innerText = "Play";
    }
}

// === 2. LANGUAGE ===
function initLanguage() {
    const html = document.documentElement;
    const savedLang = storage.get('lang') || 'tr';
    html.setAttribute('lang', savedLang);
    
    document.getElementById('lang-toggle').onclick = () => {
        const current = html.getAttribute('lang');
        const next = current === 'tr' ? 'en' : 'tr';
        html.setAttribute('lang', next);
        storage.set('lang', next);
    };
}

// === 3. BLOGGER FEED (Modernized with Images) ===
function fetchBloggerPosts() {
    const container = document.getElementById('blog-posts');
    const script = document.createElement('script');
    
    const timeout = setTimeout(() => {
        if (container.innerHTML.includes('Loading posts...')) {
            container.innerHTML = '<p>Yazılar yüklenemedi / Posts unavailable.</p>';
        }
    }, 8000);

    script.src = `${BLOGGER_URL}/feeds/posts/default?alt=json-in-script&max-results=3&callback=displayBloggerPosts`;
    
    script.onerror = () => {
        clearTimeout(timeout);
        container.innerHTML = '<p>Blog servisine erişilemiyor.</p>';
    };

    document.body.appendChild(script);
}

window.displayBloggerPosts = function(data) {
    const container = document.getElementById('blog-posts');
    if (!container) return;

    if (!data.feed || !data.feed.entry) {
        container.innerHTML = '<p>Henüz yazı bulunamadı.</p>';
        return;
    }

    // Maps original modern image fetching logic into our hybrid grid structure
    container.innerHTML = data.feed.entry.map(post => {
        const title = post.title.$t;
        const link = post.link.find(l => l.rel === 'alternate').href;
        const dateObj = new Date(post.published.$t);
        const dateStr = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
        
        // Fetch Image exactly like the original code did
        let img = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80';
        if (post.media$thumbnail) {
            img = post.media$thumbnail.url.replace(/\/s[0-9]+.*?\//, '/w600/');
        }
        
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = post.content ? post.content.$t : post.summary.$t;
        const snippet = contentDiv.innerText.substring(0, 100) + '...';

        return `
            <div class="blog-card">
                <img src="${img}" alt="${title}" class="blog-img">
                <div class="blog-content">
                    <h3><a href="${link}" target="_blank">${title}</a></h3>
                    <p>${snippet}</p>
                    <a href="${link}" target="_blank" style="font-size: 13px; font-weight: bold;">Read More &raquo;</a>
                </div>
            </div>
        `;
    }).join('');
};

// === 4. YOUTUBE ===
async function fetchLatestVideo() {
    try {
        const response = await fetch(BACKEND_URL); 
        const data = await response.json();
        
        if (data && data.videoId) {
            const iframe = document.getElementById('latest-video');
            if(iframe) {
                iframe.src = `https://www.youtube.com/embed/${data.videoId}?rel=0`;
            }
        }
    } catch (e) {
        console.error("Video fetch error:", e);
    }
}

// === 5. CHATBOT ===
let isProcessing = false;

async function sendMessage() {
    if (isProcessing) return;

    const input = document.getElementById('chat-input');
    const container = document.getElementById('chat-messages');
    const sendBtn = document.getElementById('send-btn');
    
    const msg = input.value.trim().substring(0, 500);
    if (!msg || msg.length < 2) return;

    isProcessing = true;
    input.value = '';
    sendBtn.disabled = true;
    sendBtn.innerText = "Wait...";
    
    const safeMsg = msg.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    container.innerHTML += `
        <div class="chat-msg">
            <span class="chat-you">You:</span> ${safeMsg}
        </div>
    `;
    container.scrollTop = container.scrollHeight;

    const loadingId = 'loading-' + Date.now();
    container.innerHTML += `
        <div id="${loadingId}" class="chat-msg" style="color: #94a3b8; font-style: italic;">
            Camekans AI is typing...
        </div>
    `;
    container.scrollTop = container.scrollHeight;

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json' 
            },
            body: JSON.stringify({ message: msg })
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const data = await response.json();
        const reply = data.reply || "Sorry, I received an empty response.";

        document.getElementById(loadingId).remove();

        let htmlReply = reply;
        if(typeof marked !== 'undefined') {
            htmlReply = marked.parse(reply);
        }
        if(typeof DOMPurify !== 'undefined') {
            htmlReply = DOMPurify.sanitize(htmlReply);
        }
        
        container.innerHTML += `
            <div class="chat-msg">
                <span class="chat-ai">Camekans AI:</span> ${htmlReply}
            </div>
        `;

    } catch (error) {
        const loader = document.getElementById(loadingId);
        if(loader) loader.remove();
        
        let errorText = "Error: Please try again later.";
        if (error.name === 'TypeError') errorText = "Network error. Please check your connection.";

        container.innerHTML += `
            <div class="chat-msg" style="color: #ef4444;">
                <strong>System:</strong> ${errorText}
            </div>
        `;
        console.error(error);
    }

    sendBtn.disabled = false;
    sendBtn.innerText = "Send";
    isProcessing = false;
    container.scrollTop = container.scrollHeight;
}

// === 6. UI UTILS ===
function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).innerText.replace(/^"|"$/g, '');
    navigator.clipboard.writeText(text).then(() => {
        alert("Text copied to clipboard!");
    });
}
