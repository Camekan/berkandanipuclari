// ==========================================
// CONFIGURATION
// ==========================================
const BLOGGER_URL = "https://berkandanipuclari.blogspot.com"; 
const BACKEND_URL = "https://berkan-ai-backend.lanselam.workers.dev"; // Your worker URL
// ==========================================

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
});

// === 1. MUSIC & AUDIO LOGIC ===
let isMusicPlaying = false;

function tryAutoplayMusic() {
    const bgMusic = document.getElementById('bg-music');
    if (!bgMusic) return;

    // Try to play automatically
    const playPromise = bgMusic.play();
    
    if (playPromise !== undefined) {
        playPromise.then(_ => {
            // Autoplay started!
            isMusicPlaying = true;
            updateMusicUI(true);
        }).catch(error => {
            // Autoplay blocked by browser. Wait for first click.
            const startMusicOnInteraction = () => {
                bgMusic.play();
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
        bgMusic.play();
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
        musicIcon.setAttribute('data-lucide', 'pause');
        btn.classList.add('audio-playing', 'border-indigo-400');
    } else {
        musicIcon.setAttribute('data-lucide', 'music');
        btn.classList.remove('audio-playing', 'border-indigo-400');
    }
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

function toggleAudio(id) {
    const audio = document.getElementById('audio-' + id);
    const icon = document.getElementById('icon-' + id);
    const btn = document.getElementById('btn-' + id);

    if (audio.paused) {
        // Stop others
        document.querySelectorAll('audio').forEach(a => { 
            if (a.id !== 'bg-music' && a !== audio) { 
                a.pause(); 
                a.currentTime = 0; 
                // Reset other icons
                const otherId = a.id.replace('audio-', '');
                const otherIcon = document.getElementById('icon-' + otherId);
                if(otherIcon) otherIcon.setAttribute('data-lucide', 'play-circle');
                const otherBtn = document.getElementById('btn-' + otherId);
                if(otherBtn) otherBtn.classList.remove('animate-pulse', 'bg-indigo-100');
            } 
        });
        
        audio.play();
        icon.setAttribute('data-lucide', 'pause-circle');
        btn.classList.add('animate-pulse', 'bg-indigo-100');
        
        audio.onended = () => {
            icon.setAttribute('data-lucide', 'play-circle');
            btn.classList.remove('animate-pulse', 'bg-indigo-100');
            if(typeof lucide !== 'undefined') lucide.createIcons();
        };
    } else {
        audio.pause();
        icon.setAttribute('data-lucide', 'play-circle');
        btn.classList.remove('animate-pulse', 'bg-indigo-100');
    }
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

// === 2. THEME & LANGUAGE ===
function initTheme() {
    const html = document.documentElement;
    const hour = new Date().getHours();
    // Auto dark mode if user hasn't set preference (7PM - 7AM)
    const isNight = hour >= 19 || hour < 7;
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && isNight)) {
        html.classList.add('dark');
    }
    
    document.getElementById('theme-toggle').onclick = () => {
        html.classList.toggle('dark');
        localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
    };
}

function initLanguage() {
    const html = document.documentElement;
    const savedLang = localStorage.getItem('lang') || 'tr';
    html.setAttribute('lang', savedLang);
    
    document.getElementById('lang-toggle').onclick = () => {
        const current = html.getAttribute('lang');
        const next = current === 'tr' ? 'en' : 'tr';
        html.setAttribute('lang', next);
        localStorage.setItem('lang', next);
    };
}

// === 3. BLOGGER FEED ===
function fetchBloggerPosts() {
    const script = document.createElement('script');
    script.src = `${BLOGGER_URL}/feeds/posts/default?alt=json-in-script&max-results=3&callback=displayBloggerPosts`;
    document.body.appendChild(script);
}

window.displayBloggerPosts = function(data) {
    const container = document.getElementById('blog-posts');
    if (!container) return;

    if (!data.feed || !data.feed.entry) {
        container.innerHTML = '<p class="text-center text-slate-500 w-full col-span-full">Henüz yazı bulunamadı.</p>';
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
            <article class="premium-box p-0 rounded-3xl overflow-hidden group cursor-pointer h-full flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all" onclick="window.open('${link}', '_blank')">
                <div class="h-48 overflow-hidden relative">
                    <img src="${img}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="${title}">
                    <div class="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-bold">
                        ${dateStr}
                    </div>
                </div>
                <div class="p-6 flex-grow flex flex-col">
                    <h3 class="font-heading font-bold text-xl text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-primary-600 transition-colors">${title}</h3>
                    <p class="text-slate-500 dark:text-slate-400 text-sm mb-4 flex-grow line-clamp-3">${snippet}</p>
                    <div class="text-primary-600 dark:text-primary-400 font-bold text-sm mt-auto flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span class="lang-tr">Devamını Oku</span><span class="lang-en">Read More</span> <i data-lucide="arrow-right" class="w-4 h-4"></i>
                    </div>
                </div>
            </article>
        `;
    }).join('');
    
    if(typeof lucide !== 'undefined') lucide.createIcons();
};

// === 4. YOUTUBE (BACKEND FETCH) ===
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
        const iframe = document.getElementById('latest-video');
        if(iframe && !iframe.src) {
            iframe.src = "https://www.youtube.com/embed/videoseries?list=PLdjrP3ZbJABbPN1aipZwB7zf1CsjB2ZZo";
        }
    }
}

// === 5. CHATBOT (REAL GEMINI BACKEND) ===
function toggleChatbot() {
    document.getElementById('chatbot-window').classList.toggle('active');
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const container = document.getElementById('chat-messages');
    const sendBtn = document.getElementById('send-btn');
    const msg = input.value.trim();
    
    if (!msg) return;

    // UI Updates
    input.value = '';
    sendBtn.disabled = true;
    
    // Add User Message
    container.innerHTML += `
        <div class="bg-primary-600 text-white p-3 rounded-xl rounded-tr-none ml-auto max-w-[85%] shadow-md mb-3">
            ${msg}
        </div>
    `;
    container.scrollTop = container.scrollHeight;

    // Add Loading Bubble
    const loadingId = 'loading-' + Date.now();
    container.innerHTML += `
        <div id="${loadingId}" class="bg-slate-100 dark:bg-slate-700 text-slate-500 p-3 rounded-xl rounded-tl-none mr-auto max-w-[85%] shadow-sm mb-3 flex gap-1">
            <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
            <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
            <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
        </div>
    `;
    container.scrollTop = container.scrollHeight;

    try {
        // CALL WORKER
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
        
        // CATCH THE REPLY (This now works because Worker sends { reply: "..." })
        const reply = data.reply || data.response || "Sorry, I received an empty response from the server.";

        // Remove loading
        document.getElementById(loadingId).remove();

        // Render Markdown Response
        let htmlReply = reply;
        if(typeof marked !== 'undefined') {
            htmlReply = marked.parse(reply);
        }
        
        container.innerHTML += `
            <div class="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white p-3 rounded-xl rounded-tl-none mr-auto max-w-[85%] shadow-sm mb-3 prose prose-sm dark:prose-invert">
                ${htmlReply}
            </div>
        `;

    } catch (error) {
        console.error("Chatbot Error:", error);
        document.getElementById(loadingId).remove();
        container.innerHTML += `
            <div class="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl rounded-tl-none mr-auto max-w-[85%] mb-3 text-xs font-bold">
                Connection Error: ${error.message}. Please check your internet or try again later.
            </div>
        `;
    }

    sendBtn.disabled = false;
    container.scrollTop = container.scrollHeight;
}

// === 6. UI UTILS & SCROLLSPY (FIXED) ===
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
        { t: "YouTube Channel", l: "#social-feeds" }
    ];

    const filtered = data.filter(i => i.t.toLowerCase().includes(query.toLowerCase()));
    
    if(filtered.length === 0) {
        resultsContainer.innerHTML = '<div class="p-3 text-slate-500 text-sm">Sonuç bulunamadı.</div>';
        return;
    }

    filtered.forEach(item => {
        resultsContainer.innerHTML += `
            <div class="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl cursor-pointer" onclick="window.location.href='${item.l}'; toggleSearch();">
                <span class="font-bold text-slate-800 dark:text-slate-200">${item.t}</span>
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

// --- NEW SCROLLSPY (INTERSECTION OBSERVER) ---
function initScrollSpy() {
    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px', // Trigger exactly when section is in middle of screen
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active from all
                document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
                
                // Add active to current
                const id = entry.target.getAttribute('id');
                const link = document.querySelector(`.nav-link[href="#${id}"]`);
                if (link) link.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('section[id]').forEach((section) => {
        observer.observe(section);
    });
}
