// ==========================================
// CONFIGURATION
// ==========================================
'use strict';

const BLOGGER_URL = "https://berkandanipuclari.blogspot.com"; 
const BACKEND_URL = "https://berkan-ai-backend.lanselam.workers.dev"; // Your worker URL
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
    if(typeof lucide !== 'undefined') lucide.createIcons();
    
    // Auto-Run Functions
    fetchBloggerPosts();
    fetchLatestVideo();
    initTheme();
    initLanguage();
    tryAutoplayMusic(); 
    initScrollSpy(); 
    
    // Set a generic welcome message
    const initialMsg = document.querySelector('#chat-messages div');
    if(initialMsg) {
        initialMsg.innerHTML = "Hello! I am Berkan's AI Assistant. How can I help you with your English today?";
    }
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
    const musicIcon = document.getElementById('music-icon');
    const btn = document.querySelector('.music-widget button');
    
    if (isPlaying) {
        if (musicIcon) musicIcon.setAttribute('data-lucide', 'pause');
        if (btn) btn.classList.add('audio-playing');
    } else {
        if (musicIcon) musicIcon.setAttribute('data-lucide', 'music');
        if (btn) btn.classList.remove('audio-playing');
    }
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

function toggleAudio(id) {
    const audio = document.getElementById('audio-' + id);
    const icon = document.getElementById('icon-' + id);
    const btn = document.getElementById('btn-' + id);

    if (!audio) return;

    if (audio.paused) {
        // Pause all other audio
        document.querySelectorAll('audio').forEach(a => { 
            if (a.id !== 'bg-music' && a !== audio) { 
                a.pause(); 
                a.currentTime = 0; 
                
                // Reset other icons
                const otherId = a.id.replace('audio-', '');
                const otherIcon = document.getElementById('icon-' + otherId);
                const otherBtn = document.getElementById('btn-' + otherId);
                
                if(otherIcon) otherIcon.setAttribute('data-lucide', 'play-circle');
                if(otherBtn) otherBtn.classList.remove('animate-pulse');
            } 
        });
        
        audio.play().then(() => {
            // Update Current Icon to Pause
            if (icon) icon.setAttribute('data-lucide', 'pause-circle');
            if (btn) btn.classList.add('animate-pulse');
            if(typeof lucide !== 'undefined') lucide.createIcons();
        }).catch(err => {
            console.warn("Audio play failed:", err);
        });
        
        // Reset when finished
        audio.onended = () => {
            if (icon) icon.setAttribute('data-lucide', 'play-circle');
            if (btn) btn.classList.remove('animate-pulse');
            if(typeof lucide !== 'undefined') lucide.createIcons();
        };
    } else {
        audio.pause();
        if (icon) icon.setAttribute('data-lucide', 'play-circle');
        if (btn) btn.classList.remove('animate-pulse');
        if(typeof lucide !== 'undefined') lucide.createIcons();
    }
}

// === 2. THEME & LANGUAGE ===
function initTheme() {
    const html = document.documentElement;
    const hour = new Date().getHours();
    const isNight = hour >= 19 || hour < 7;
    
    const savedTheme = storage.get('theme');
    if (savedTheme === 'dark' || (!savedTheme && isNight)) {
        html.classList.add('dark');
    }
    
    document.getElementById('theme-toggle').onclick = () => {
        html.classList.toggle('dark');
        storage.set('theme', html.classList.contains('dark') ? 'dark' : 'light');
    };
}

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

// === 3. BLOGGER FEED ===
function fetchBloggerPosts() {
    const container = document.getElementById('blog-posts');
    const script = document.createElement('script');
    
    // Safety timeout in case Blogger script hangs
    const timeout = setTimeout(() => {
        if (container && container.innerHTML.includes('animate-spin')) {
            container.innerHTML = '<div class="col-span-full">Yazılar yüklenemedi / Posts unavailable.</div>';
        }
    }, 8000);

    script.src = `${BLOGGER_URL}/feeds/posts/default?alt=json-in-script&max-results=3&callback=displayBloggerPosts`;
    
    script.onerror = () => {
        clearTimeout(timeout);
        if (container) container.innerHTML = '<div class="col-span-full">Blog servisine erişilemiyor.</div>';
    };

    document.body.appendChild(script);
}

window.displayBloggerPosts = function(data) {
    const container = document.getElementById('blog-posts');
    if (!container) return;

    if (!data.feed || !data.feed.entry) {
        container.innerHTML = '<div class="col-span-full">Henüz yazı bulunamadı.</div>';
        return;
    }

    container.innerHTML = data.feed.entry.map(post => {
        const title = post.title.$t;
        const link = post.link.find(l => l.rel === 'alternate').href;
        const dateObj = new Date(post.published.$t);
        const dateStr = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
        
        let img = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80';
        if (post.media$thumbnail) {
            img = post.media$thumbnail.url.replace(/\/s[0-9]+.*?\//, '/w600/');
        }

        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = post.content ? post.content.$t : post.summary.$t;
        const snippet = contentDiv.innerText.substring(0, 100) + '...';

        return `
            <article onclick="window.open('${link}', '_blank')">
                <div>
                    <img src="${img}" alt="${title}">
                    <div>${dateStr}</div>
                </div>
                <div>
                    <h3>${title}</h3>
                    <p>${snippet}</p>
                    <div>
                        <span class="lang-tr">Devamını Oku &raquo;</span>
                        <span class="lang-en">Read More &raquo;</span>
                    </div>
                </div>
            </article>
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
function toggleChatbot() {
    document.getElementById('chatbot-window').classList.toggle('active');
}

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
    
    const safeMsg = msg.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    container.innerHTML += `
        <div class="bg-primary-600">
            ${safeMsg}
        </div>
    `;
    container.scrollTop = container.scrollHeight;

    const loadingId = 'loading-' + Date.now();
    container.innerHTML += `
        <div id="${loadingId}" class="bg-slate-100" style="color:#5577a0; font-style:italic;">
            AI Assistant is typing...
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
            <div class="bg-slate-100">
                ${htmlReply}
            </div>
        `;

    } catch (error) {
        const loader = document.getElementById(loadingId);
        if(loader) loader.remove();
        
        let errorText = "Error: Please try again later.";
        if (error.name === 'TypeError') errorText = "Network error. Please check your connection.";

        container.innerHTML += `
            <div class="bg-red-100">
                <strong>System:</strong> ${errorText}
            </div>
        `;
        console.error(error);
    }

    sendBtn.disabled = false;
    isProcessing = false;
    container.scrollTop = container.scrollHeight;
}

// === 6. UI UTILS ===
function toggleSearch() {
    const modal = document.getElementById('search-modal');
    modal.classList.toggle('active');
    if (modal.classList.contains('active')) {
        setTimeout(() => document.getElementById('search-input').focus(), 100);
    }
}

function performSearch(query) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';
    
    if (query.length < 2) return;

    const data = [
        { t: "Ders Planı (Lesson Plan)", l: "#prompts" },
        { t: "Quiz Hazırlayıcı", l: "#prompts" },
        { t: "Roadmap Level 1", l: "#roadmap" },
        { t: "Download: Teacher Vault", l: "#downloads" },
        { t: "Blog Posts", l: "#blog" },
        { t: "YouTube Channel", l: "#social-feeds" },
        { t: "FAQ", l: "#faq" }
    ];

    const filtered = data.filter(i => i.t.toLowerCase().includes(query.toLowerCase()));
    
    if(filtered.length === 0) {
        resultsContainer.innerHTML = '<div style="padding:8px 12px; font-size:12px; color:#5577a0;">Sonuç bulunamadı.</div>';
        return;
    }

    filtered.forEach(item => {
        resultsContainer.innerHTML += `
            <div onclick="window.location.href='${item.l}'; toggleSearch();">
                ${item.t}
            </div>
        `;
    });
}

function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).innerText.replace(/^"|"$/g, '');
    navigator.clipboard.writeText(text).then(() => {
        const toast = document.getElementById('toast');
        toast.classList.remove('opacity-0', 'translate-y-40');
        setTimeout(() => toast.classList.add('opacity-0', 'translate-y-40'), 3000);
    });
}

// --- ACCURATE SCROLLSPY ---
function initScrollSpy() {
    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px', 
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
                
                const id = entry.target.getAttribute('id');
                const link = document.querySelector(`.nav-link[href="#${id}"]`);
                if (link) link.classList.add('active');
            }
        });
    }, observerOptions);

    // Target div sections acting as sections in index_2.html
    document.querySelectorAll('.section[id], #hero').forEach((section) => {
        observer.observe(section);
    });
}
