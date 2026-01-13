// ==========================================
// CONFIGURATION
// ==========================================
const BLOGGER_URL = "https://berkandanipuclari.blogspot.com"; 
// ==========================================

// === ICONS & INIT ===
if(typeof lucide !== 'undefined') lucide.createIcons();
const html = document.documentElement;

// === 1. LANGUAGE TOGGLE (FIXED) ===
function toggleLanguage() {
    // Switch the attribute on the HTML tag
    const currentLang = html.getAttribute('lang');
    const newLang = currentLang === 'tr' ? 'en' : 'tr';
    
    html.setAttribute('lang', newLang);
    localStorage.lang = newLang;
}

// Apply saved language on load
if (localStorage.lang === 'en') {
    html.setAttribute('lang', 'en');
} else {
    html.setAttribute('lang', 'tr');
}

document.getElementById('lang-toggle')?.addEventListener('click', toggleLanguage);

// === 2. COPY TO CLIPBOARD (FIXED) ===
function copyToClipboard(elementId) {
    const textElement = document.getElementById(elementId);
    if (!textElement) return;
    
    // Remove quotes if present
    const textToCopy = textElement.innerText.replace(/^"|"$/g, '');
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        // Show Toast
        const toast = document.getElementById('toast');
        toast.classList.remove('translate-y-40', 'opacity-0'); // Show
        setTimeout(() => {
            toast.classList.add('translate-y-40', 'opacity-0'); // Hide after 3s
        }, 3000);
    }).catch(err => console.error('Copy failed:', err));
}

// === 3. BLOGGER FEED (DYNAMIC) ===
async function fetchBloggerPosts() {
    const container = document.getElementById('blog-posts');
    if (!container) return; 

    // Using JSONP to avoid CORS errors
    const script = document.createElement('script');
    script.src = `${BLOGGER_URL}/feeds/posts/default?alt=json-in-script&max-results=3&callback=displayBloggerPosts`;
    script.onerror = () => {
        container.innerHTML = '<p class="text-center text-red-500 col-span-full">Blog verisi yüklenemedi.</p>';
    };
    document.body.appendChild(script);
}

// Callback function for Blogger
window.displayBloggerPosts = function(data) {
    const container = document.getElementById('blog-posts');
    if (!container) return;

    if (!data.feed || !data.feed.entry || data.feed.entry.length === 0) {
        container.innerHTML = '<p class="text-center text-slate-500 col-span-full">Henüz yazı yok.</p>';
        return;
    }

    container.innerHTML = data.feed.entry.map(post => {
        const title = post.title.$t;
        const dateObj = new Date(post.published.$t);
        const dateStr = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        
        // Find Link
        const link = post.link.find(l => l.rel === 'alternate').href;

        // Find Image (High Res)
        let img = 'https://images.unsplash.com/photo-1499750310159-52f8f6032d59?w=800&q=80';
        if (post.media$thumbnail) {
            img = post.media$thumbnail.url.replace(/\/s[0-9]+.*?\//, '/w600/');
        }

        // Create Excerpt
        const div = document.createElement('div');
        div.innerHTML = post.content ? post.content.$t : (post.summary ? post.summary.$t : '');
        const excerpt = (div.textContent || div.innerText || '').substring(0, 100) + '...';

        return `
            <article class="premium-box p-6 rounded-3xl flex flex-col h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-xl transition-all group" onclick="window.open('${link}', '_blank')">
                <div class="h-48 bg-gray-200 rounded-2xl mb-4 overflow-hidden relative">
                    <img src="${img}" class="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500">
                    <div class="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">Blogger</div>
                </div>
                <div class="flex items-center gap-2 text-xs font-bold text-slate-400 mb-3">
                    <i data-lucide="calendar" class="w-3 h-3"></i> ${dateStr}
                    <i data-lucide="clock" class="w-3 h-3 ml-2"></i> ${timeStr}
                </div>
                <h3 class="font-heading font-bold text-xl mb-2 text-slate-900 dark:text-white leading-tight">${title}</h3>
                <p class="text-sm text-slate-600 dark:text-slate-400 flex-grow mb-4">${excerpt}</p>
                <button class="text-blue-600 font-bold hover:underline text-left mt-auto flex items-center gap-1">
                    <span class="lang-tr">Devamını Oku</span><span class="lang-en">Read More</span> <i data-lucide="external-link" class="w-4 h-4"></i>
                </button>
            </article>
        `;
    }).join('');
    
    if(typeof lucide !== 'undefined') lucide.createIcons();
};

// === 4. YOUTUBE AUTO UPDATE ===
async function fetchLatestVideo() {
    try {
        const response = await fetch("https://berkan-ai-backend.lanselam.workers.dev/");
        const data = await response.json();
        if (data.videoId) {
            const iframe = document.getElementById('latest-video');
            if (iframe) iframe.src = `https://www.youtube.com/embed/${data.videoId}`;
        }
    } catch (e) { console.error(e); }
}

// === 5. SEARCH & UI ===
function toggleSearch() {
    const modal = document.getElementById('search-modal');
    modal.classList.toggle('active');
    if (modal.classList.contains('active')) setTimeout(() => document.getElementById('search-input').focus(), 100);
    else document.getElementById('search-input').value = '';
}

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
    // Init functions
    fetchBloggerPosts();
    fetchLatestVideo();
    
    // Theme Init
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && new Date().getHours() >= 20)) {
        html.classList.add('dark');
    }
    document.getElementById('theme-toggle').onclick = () => {
        html.classList.toggle('dark');
        localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
    };

    // Chatbot Toggle
    const chatWindow = document.getElementById('chatbot-window');
    document.querySelectorAll('.chatbot-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => chatWindow.classList.toggle('active'));
    });

    if(typeof lucide !== 'undefined') lucide.createIcons();
});

// Audio Helper
function toggleAudio(id) {
    const audio = document.getElementById('audio-' + id);
    if(audio.paused) {
        document.querySelectorAll('audio').forEach(a => { if(a !== audio) { a.pause(); a.currentTime = 0; } });
        audio.play();
    } else {
        audio.pause();
    }
}
