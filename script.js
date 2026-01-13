// ==========================================
// CONFIGURATION
// ==========================================
const BLOGGER_URL = "https://berkandanipuclari.blogspot.com"; 
// ==========================================

// === ICONS & INIT ===
if(typeof lucide !== 'undefined') lucide.createIcons();
const html = document.documentElement;

// === FETCH BLOGGER POSTS ===
async function fetchBloggerPosts() {
    const container = document.getElementById('blog-posts');
    if (!container) return; // Stop if not on homepage

    try {
        // Fetch JSON feed from Blogger
        const res = await fetch(`${BLOGGER_URL}/feeds/posts/default?alt=json&max-results=3`);
        if (!res.ok) throw new Error('Blogger feed failed');
        
        const data = await res.json();
        
        // If no posts found
        if (!data.feed || !data.feed.entry || data.feed.entry.length === 0) {
            container.innerHTML = '<p class="text-center col-span-full text-slate-500">Henüz yazı yok. (No posts yet)</p>';
            return;
        }

        // Render Posts
        container.innerHTML = data.feed.entry.map(post => {
            // 1. Get Title
            const title = post.title.$t;
            
            // 2. Get Date
            const date = new Date(post.published.$t).toLocaleDateString('tr-TR', {
                day: 'numeric', month: 'long', year: 'numeric'
            });

            // 3. Get Link (Find the one that is 'alternate' aka the real link)
            const linkObj = post.link.find(l => l.rel === 'alternate');
            const link = linkObj ? linkObj.href : '#';

            // 4. Get Image
            // Blogger thumbnails are small (/s72-c/). We replace it with /w600/ to get high quality.
            let img = 'https://images.unsplash.com/photo-1499750310159-52f8f6032d59?w=800&q=80'; // Fallback image
            if (post.media$thumbnail) {
                img = post.media$thumbnail.url.replace(/\/s[0-9]+.*?\//, '/w600/'); 
            }

            // 5. Get Excerpt (Clean HTML tags)
            const rawContent = post.content ? post.content.$t : (post.summary ? post.summary.$t : '');
            const div = document.createElement('div');
            div.innerHTML = rawContent;
            const text = div.textContent || div.innerText || '';
            const excerpt = text.substring(0, 100) + '...';

            return `
                <article class="premium-box p-6 rounded-3xl flex flex-col h-full hover:scale-105 transition-transform cursor-pointer bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-orange-400" onclick="window.open('${link}', '_blank')">
                    <div class="h-48 bg-gray-200 rounded-2xl mb-4 overflow-hidden relative">
                        <img src="${img}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110" alt="${title}" onerror="this.src='https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'">
                        <div class="absolute top-2 right-2 bg-white/90 dark:bg-black/80 px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                            Blogger
                        </div>
                    </div>
                    <span class="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1">
                        <i data-lucide="calendar" class="w-3 h-3"></i> ${date}
                    </span>
                    <h3 class="font-heading font-bold text-xl mb-3 text-slate-900 dark:text-white leading-tight">${title}</h3>
                    <p class="text-slate-600 dark:text-slate-400 mb-4 text-sm flex-grow line-clamp-3">${excerpt}</p>
                    <button class="text-orange-500 font-bold hover:underline text-left mt-auto flex items-center gap-1">
                        Devamını Oku <i data-lucide="external-link" class="w-4 h-4"></i>
                    </button>
                </article>
            `;
        }).join('');
        
        if(typeof lucide !== 'undefined') lucide.createIcons();

    } catch (error) {
        console.error("Blogger Error:", error);
        container.innerHTML = `
            <div class="col-span-full text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-600">
                <p>Blog yazıları yüklenemedi. (Check Blogger URL in script.js)</p>
            </div>`;
    }
}

// === SEARCH FUNCTIONALITY ===
function toggleSearch() {
    const modal = document.getElementById('search-modal');
    modal.classList.toggle('active');
    if (modal.classList.contains('active')) {
        setTimeout(() => document.getElementById('search-input').focus(), 100);
    } else {
        document.getElementById('search-input').value = '';
    }
}

const searchableContent = [
    { title: '6. Sınıf Full Rehber', link: '#downloads', type: 'Material' },
    { title: 'Öğretmen Kasası', link: '#downloads', type: 'Material' },
    { title: 'Yol Haritası (Roadmap)', link: '#roadmap', type: 'Section' },
    { title: 'Blog', link: 'https://berkandanipuclari.blogspot.com/', type: 'External' }
];

function performSearch(query) {
    const results = document.getElementById('search-results');
    if (!query || query.length < 2) {
        results.innerHTML = '<p class="text-slate-500 text-sm">Yazmaya başlayın...</p>';
        return;
    }
    const lower = query.toLowerCase();
    const filtered = searchableContent.filter(x => x.title.toLowerCase().includes(lower));
    
    if (filtered.length === 0) {
        results.innerHTML = '<p class="text-slate-500 text-sm">Sonuç yok.</p>';
        return;
    }

    results.innerHTML = filtered.map(item => `
        <a href="${item.link}" class="block p-4 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600">
            <h4 class="font-bold text-slate-900 dark:text-white">${item.title}</h4>
            <span class="text-xs text-slate-500 uppercase font-bold">${item.type}</span>
        </a>
    `).join('');
}

// === THEME & LANG ===
function initThemeWithAutoDetection() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && new Date().getHours() >= 20)) html.classList.add('dark');
}

document.getElementById('theme-toggle')?.addEventListener('click', () => {
    html.classList.toggle('dark');
    localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
});

document.getElementById('lang-toggle')?.addEventListener('click', () => {
    const isTr = html.getAttribute('lang') === 'tr';
    html.setAttribute('lang', isTr ? 'en' : 'tr');
    localStorage.lang = isTr ? 'en' : 'tr';
});
if (localStorage.lang === 'en') html.setAttribute('lang', 'en');


// === YOUTUBE AUTO UPDATE ===
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

// === CHATBOT ===
function toggleChatbot() { document.getElementById('chatbot-window')?.classList.toggle('active'); }
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if(!msg) return;
    const div = document.getElementById('chat-messages');
    div.innerHTML += `<div class="flex justify-end mb-3"><div class="bg-primary-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%]">${msg}</div></div>`;
    input.value = '';
    div.scrollTop = div.scrollHeight;

    try {
        const res = await fetch("https://berkan-ai-backend.lanselam.workers.dev/", {
            method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({message: msg})
        });
        const data = await res.json();
        
        let aiText = "Hata oluştu.";
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            aiText = data.candidates[0].content.parts[0].text;
        }

        div.innerHTML += `<div class="flex mb-3"><div class="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-2xl rounded-tl-sm max-w-[80%]">${aiText}</div></div>`;
        div.scrollTop = div.scrollHeight;
    } catch(e) { console.error(e); }
}

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
    initThemeWithAutoDetection();
    fetchBloggerPosts(); // <--- HERE IS THE NEW FUNCTION
    fetchLatestVideo();
    
    // Audio Players
    const audios = document.querySelectorAll('audio');
    audios.forEach(a => {
        a.onplay = () => {
            audios.forEach(b => { if(b !== a) { b.pause(); b.currentTime = 0; } });
        };
    });
    
    const chatInput = document.getElementById('chat-input');
    if(chatInput) chatInput.addEventListener('keypress', e => { if(e.key === 'Enter') sendMessage(); });
    
    if(typeof lucide !== 'undefined') lucide.createIcons();
});

// Audio Toggle Helper
function toggleAudio(id) {
    const audio = document.getElementById('audio-' + id);
    if(audio.paused) audio.play();
    else audio.pause();
}
