// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================
'use strict';
const BLOGGER_URL = "https://berkandanipuclari.blogspot.com"; 
const BACKEND_URL = "https://berkan-ai-backend.lanselam.workers.dev"; // Your worker URL
const MAX_MESSAGE_LENGTH = 500;
const SNIPPET_LENGTH = 100;
const BLOGGER_TIMEOUT_MS = 10000;
const API_TIMEOUT_MS = 15000;

// State Management
const audioState = new Map(); // Tracks playing audio elements

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Safe Storage Wrapper (Fixes Crash if Cookies/Storage Blocked)
const storage = {
    get: (key) => {
        try { return localStorage.getItem(key); } 
        catch(e) { return null; }
    },
    set: (key, val) => {
        try { localStorage.setItem(key, val); } 
        catch(e) { console.warn('Storage failed/blocked'); }
    }
};

// HTML Escaping Utility
function escapeHtml(unsafe) {
    if (!unsafe) return "";
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// Clipboard Fallback for Older Browsers
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        showToast();
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
    }
    document.body.removeChild(textArea);
}

function showToast() {
    const toast = document.getElementById('toast');
    if(toast) {
        toast.classList.remove('opacity-0', 'translate-y-40');
        setTimeout(() => toast.classList.add('opacity-0', 'translate-y-40'), 3000);
    }
}

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if(typeof lucide !== 'undefined') lucide.createIcons();
    
    // Auto-Run Functions
    fetchBloggerPosts();
    fetchLatestVideo();
    initTheme();
    initLanguage();
    tryAutoplayMusic(); 
    initScrollSpy(); 
    initMobileMenu();
    
    // Set a generic welcome message
    const initialMsg = document.querySelector('#chat-messages div');
    if(initialMsg) {
        initialMsg.innerText = "Hello! I am Berkan's AI Assistant. How can I help you with your English today?";
    }
});

function initMobileMenu() {
    // Close mobile menu when a link is clicked
    document.querySelectorAll('.mobile-menu a').forEach(link => {
        link.addEventListener('click', () => {
            document.getElementById('mobile-menu').classList.remove('active');
        });
    });
}

// ==========================================
// 1. MUSIC & AUDIO LOGIC
// ==========================================
let isBgMusicPlaying = false;

function tryAutoplayMusic() {
    const bgMusic = document.getElementById('bg-music');
    if (!bgMusic) return;

    const playPromise = bgMusic.play();
    
    if (playPromise !== undefined) {
        playPromise.then(_ => {
            isBgMusicPlaying = true;
            updateMusicUI(true);
        }).catch(error => {
            // Autoplay blocked - waiting for interaction
            const startMusicOnInteraction = () => {
                bgMusic.play().catch(e => console.warn('Audio play failed:', e));
                isBgMusicPlaying = true;
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
        bgMusic.play().then(() => {
            isBgMusicPlaying = true;
            updateMusicUI(true);
        }).catch(err => {
            console.warn('Audio play failed:', err);
        });
    } else {
        bgMusic.pause();
        isBgMusicPlaying = false;
        updateMusicUI(false);
    }
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
        // Stop all other audios using state management or query
        document.querySelectorAll('audio').forEach(a => { 
            if (a.id !== 'bg-music' && a !== audio) { 
                a.pause(); 
                a.currentTime = 0; 
                // Reset UI for others
                const otherId = a.id.replace('audio-', '');
                const otherIcon = document.getElementById('icon-' + otherId);
                if(otherIcon) otherIcon.setAttribute('data-lucide', 'play-circle');
                const otherBtn = document.getElementById('btn-' + otherId);
                if(otherBtn) otherBtn.classList.remove('animate-pulse', 'bg-indigo-100');
            } 
        });
        
        audio.play().then(() => {
            icon.setAttribute('data-lucide', 'pause-circle');
            btn.classList.add('animate-pulse', 'bg-indigo-100');
            // Update State Map
            audioState.set(id, true);
        }).catch(err => {
            console.warn("Audio play error", err);
        });
        
        audio.onended = () => {
            icon.setAttribute('data-lucide', 'play-circle');
            btn.classList.remove('animate-pulse', 'bg-indigo-100');
            audioState.set(id, false);
            if(typeof lucide !== 'undefined') lucide.createIcons();
        };
    } else {
        audio.pause();
        icon.setAttribute('data-lucide', 'play-circle');
        btn.classList.remove('animate-pulse', 'bg-indigo-100');
        audioState.set(id, false);
    }
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

// ==========================================
// 2. THEME & LANGUAGE
// ==========================================
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

// ==========================================
// 3. BLOGGER FEED
// ==========================================
function fetchBloggerPosts() {
    const script = document.createElement('script');
    script.src = `${BLOGGER_URL}/feeds/posts/default?alt=json-in-script&max-results=3&callback=displayBloggerPosts`;
    
    // Error Handling
    script.onerror = () => {
        const container = document.getElementById('blog-posts');
        if(container) container.innerHTML = '<p class="text-center text-slate-500 w-full col-span-full">Blog yüklenemedi / Blog unavailable</p>';
    };

    // Timeout fallback
    setTimeout(() => {
        const container = document.getElementById('blog-posts');
        if (container && container.innerHTML.includes('animate-spin')) {
            script.onerror();
        }
    }, BLOGGER_TIMEOUT_MS);

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
        const snippet = contentDiv.innerText.substring(0, SNIPPET_LENGTH) + '...';

        return `
            <article class="premium-box p-0 rounded-3xl overflow-hidden group cursor-pointer h-full flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all" onclick="window.open('${link}', '_blank', 'noopener,noreferrer')">
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

// ==========================================
// 4. YOUTUBE
// ==========================================
async function fetchLatestVideo() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
        const response = await fetch(BACKEND_URL, { 
            method: 'GET',
            signal: controller.signal 
        }); 
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error('API Error');

        const data = await response.json();
        
        if (data && data.videoId) {
            const iframe = document.getElementById('latest-video');
            if(iframe) {
                iframe.src = `https://www.youtube.com/embed/${data.videoId}?rel=0`;
            }
        }
    } catch (e) {
        if (e.name === 'AbortError') {
            console.error("YouTube Fetch timed out");
        } else {
            console.error("Video fetch error:", e);
        }
    }
}

// ==========================================
// 5. CHATBOT
// ==========================================
function toggleChatbot() {
    document.getElementById('chatbot-window').classList.toggle('active');
}

let isProcessing = false; // Rate limiting

async function sendMessage() {
    if (isProcessing) return; // Prevent double submit
    
    const input = document.getElementById('chat-input');
    const container = document.getElementById('chat-messages');
    const sendBtn = document.getElementById('send-btn');
    
    // Sanitize Input (Limit length)
    const rawMsg = input.value.trim().substring(0, MAX_MESSAGE_LENGTH);
    
    if (!rawMsg || rawMsg.length < 2) return;

    input.value = '';
    isProcessing = true;
    sendBtn.disabled = true;
    
    // Use HTML escaping utility for user message
    const safeUserMsg = escapeHtml(rawMsg);
    
    container.innerHTML += `
        <div class="bg-primary-600 text-white p-3 rounded-xl rounded-tr-none ml-auto max-w-[85%] shadow-md mb-3">
            ${safeUserMsg}
        </div>
    `;
    container.scrollTop = container.scrollHeight;

    const loadingId = 'loading-' + Date.now();
    container.innerHTML += `
        <div id="${loadingId}" class="bg-slate-100 dark:bg-slate-700 text-slate-500 p-3 rounded-xl rounded-tl-none mr-auto max-w-[85%] shadow-sm mb-3 flex gap-1">
            <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
            <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
            <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
        </div>
    `;
    container.scrollTop = container.scrollHeight;

    // Use AbortController for Fetch Timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json' 
            },
            body: JSON.stringify({ message: rawMsg }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const data = await response.json();
        const reply = data.reply || "Sorry, I received an empty response.";

        document.getElementById(loadingId).remove();

        // Security: Sanitize HTML Output with DOMPurify
        let cleanReply = DOMPurify.sanitize(reply);
        let htmlReply = cleanReply;
        
        if(typeof marked !== 'undefined') {
            // Parse Markdown then sanitize again
            htmlReply = DOMPurify.sanitize(marked.parse(cleanReply));
        }
        
        container.innerHTML += `
            <div class="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white p-3 rounded-xl rounded-tl-none mr-auto max-w-[85%] shadow-sm mb-3 prose prose-sm dark:prose-invert">
                ${htmlReply}
            </div>
        `;

    } catch (error) {
        document.getElementById(loadingId).remove();
        
        let errorMsg = 'Error: Something went wrong. Try again later.';
        if (error.name === 'TypeError') errorMsg = 'Network error. Please check your connection.';
        if (error.name === 'AbortError') errorMsg = 'Request timed out. Server took too long.';
        
        container.innerHTML += `
            <div class="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl rounded-tl-none mr-auto max-w-[85%] mb-3 text-xs font-bold">
                ${errorMsg}
            </div>
        `;
        console.error("Chat error:", error);
    }

    sendBtn.disabled = false;
    isProcessing = false;
    container.scrollTop = container.scrollHeight;
}

// ==========================================
// 6. UI UTILS
// ==========================================
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
    
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }

    navigator.clipboard.writeText(text).then(() => {
        showToast();
    }, (err) => {
        console.error('Async: Could not copy text: ', err);
        fallbackCopyTextToClipboard(text);
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

    document.querySelectorAll('section[id]').forEach((section) => {
        observer.observe(section);
    });
}
