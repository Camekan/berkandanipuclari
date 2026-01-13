// === ICONS & INIT ===
lucide.createIcons();
const html = document.documentElement;

// === SEARCH FUNCTIONALITY ===
function toggleSearch() {
    const modal = document.getElementById('search-modal');
    modal.classList.toggle('active');
    if (modal.classList.contains('active')) {
        document.getElementById('search-input').focus();
    } else {
        document.getElementById('search-input').value = '';
        const lang = document.documentElement.getAttribute('lang') || 'tr';
        document.getElementById('search-results').innerHTML = lang === 'tr' 
            ? '<p class="text-slate-500 text-sm font-medium">Aramaya başlamak için yazmaya başlayın...</p>' 
            : '<p class="text-slate-500 text-sm font-medium">Start typing to search...</p>';
    }
    lucide.createIcons();
}

const searchableContent = [
    { 
        title: '6. Sınıf Full Rehber', 
        titleEn: '6th Grade Full Guide', 
        type: 'material', 
        link: '#downloads', 
        level: 'A1-A2',
        keywords: 'materyal download indir pdf book kitap'
    },
    { 
        title: 'Öğretmen Kasam', 
        titleEn: 'Teacher Vault', 
        type: 'material', 
        link: '#downloads', 
        level: 'Teacher',
        keywords: 'materyal ders planı lesson plan'
    },
    { title: 'Yol Haritası', titleEn: 'Roadmap', type: 'section', link: '#roadmap', keywords: 'plan program level seviye' },
    { title: 'Promptlar', titleEn: 'Prompts', type: 'section', link: '#prompts', keywords: 'ai chatgpt komut' },
    { title: 'Blog', titleEn: 'Blog', type: 'section', link: '#blog', keywords: 'yazı makale article' },
    { title: 'Faydalı Linkler', titleEn: 'Useful Links', type: 'section', link: '#useful-links', keywords: 'link kaynak resource dictionary' },
    { title: 'AI ile İngilizce Öğrenme', titleEn: 'Learn English with AI', type: 'blog', link: '#blog', keywords: 'yapay zeka' }
];

function performSearch(query) {
    const results = document.getElementById('search-results');
    const lang = document.documentElement.getAttribute('lang') || 'tr';
    
    if (query.length < 2) {
        results.innerHTML = lang === 'tr' 
            ? '<p class="text-slate-500 text-sm font-medium">Aramaya başlamak için yazmaya başlayın...</p>'
            : '<p class="text-slate-500 text-sm font-medium">Start typing to search...</p>';
        return;
    }
    
    const lowerQuery = query.toLowerCase();

    const filtered = searchableContent.filter(item => {
        const title = lang === 'tr' ? item.title.toLowerCase() : item.titleEn.toLowerCase();
        return title.includes(lowerQuery) || (item.keywords && item.keywords.includes(lowerQuery));
    });
    
    if (filtered.length === 0) {
        results.innerHTML = lang === 'tr'
            ? '<p class="text-slate-500 text-sm font-medium">Sonuç bulunamadı.</p>'
            : '<p class="text-slate-500 text-sm font-medium">No results found.</p>';
        return;
    }
    
    results.innerHTML = filtered.map(item => `
        <a href="${item.link}" onclick="toggleSearch()" class="block p-4 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer transition-colors">
            <h4 class="font-bold mb-1 text-slate-900 dark:text-white">${lang === 'tr' ? item.title : item.titleEn}</h4>
            <p class="text-sm text-slate-600 dark:text-slate-400">${item.type} ${item.level || ''}</p>
        </a>
    `).join('');
}

// === THEME MANAGEMENT ===
function initThemeWithAutoDetection() {
    const savedTheme = localStorage.getItem('theme');
    const hour = new Date().getHours();
    
    if (savedTheme) {
        if (savedTheme === 'dark') html.classList.add('dark');
        else html.classList.remove('dark');
    } else if (hour >= 20 || hour < 7) {
        html.classList.add('dark');
    }
}

document.getElementById('theme-toggle').addEventListener('click', function() {
    html.classList.toggle('dark');
    localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
});

// === LANGUAGE MANAGEMENT ===
function toggleLanguage() {
    if (html.getAttribute('lang') === 'tr') {
        html.setAttribute('lang', 'en');
        document.title = "Berkan's Tips | English & AI";
        localStorage.lang = 'en';
    } else {
        html.setAttribute('lang', 'tr');
        document.title = "Berkan'dan İpuçları | English & AI";
        localStorage.lang = 'tr';
    }
    
    setTimeout(() => {
        renderBlog();
        renderComments();
        renderDownloads();
    }, 100);
}

if (localStorage.lang === 'en') {
    toggleLanguage(); 
}
document.getElementById('lang-toggle').addEventListener('click', toggleLanguage);

// === BLOG RENDERER (Updated to use Shared Data) ===
function renderBlog() {
    const lang = document.documentElement.getAttribute('lang') || 'tr';
    const blogSection = document.getElementById('blog-posts');
    
    // Safety check: if element or data missing, stop
    if (!blogSection || typeof blogPosts === 'undefined') return;
    
    // Take the latest 3 posts from the shared data
    const latestPosts = blogPosts.slice(0, 3);
    
    blogSection.innerHTML = latestPosts.map(post => `
        <article class="premium-box p-6 rounded-3xl cursor-pointer hover:scale-105 transition-transform" onclick="window.location.href='blog-post.html?id=${post.id}'">
            <div class="h-48 bg-gradient-to-br ${post.gradient} rounded-2xl mb-4"></div>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-2">${post.date[lang]}</p>
            <h3 class="font-heading font-bold text-xl mb-3 text-slate-900 dark:text-white">${post.title[lang]}</h3>
            <p class="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">${post.excerpt[lang]}</p>
            <button class="text-primary-600 dark:text-primary-400 font-bold hover:underline">
                ${lang === 'tr' ? 'Devamını Oku →' : 'Read More →'}
            </button>
        </article>
    `).join('');
    lucide.createIcons();
}

// === COMMENTS ===
const badWords = ['bad', 'stupid', 'kötü', 'salak'];
let comments = [];

function filterProfanity(text) {
    let filtered = text;
    badWords.forEach(word => {
        const regex = new RegExp(word, 'gi');
        filtered = filtered.replace(regex, '*'.repeat(word.length));
    });
    return filtered;
}

function addComment() {
    const name = document.getElementById('comment-name').value.trim();
    const text = document.getElementById('comment-text').value.trim();
    const lang = document.documentElement.getAttribute('lang') || 'tr';
    
    if (!name || !text) {
        alert(lang === 'tr' ? 'Lütfen tüm alanları doldurun!' : 'Please fill all fields!');
        return;
    }
    
    comments.unshift({
        name: filterProfanity(name),
        text: filterProfanity(text),
        date: new Date().toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US')
    });
    
    document.getElementById('comment-name').value = '';
    document.getElementById('comment-text').value = '';
    renderComments();
    alert(lang === 'tr' ? 'Yorumunuz eklendi!' : 'Your comment has been added!');
}

function renderComments() {
    const container = document.getElementById('comments-list');
    if (!container) return;
    
    if (comments.length === 0) {
        const lang = document.documentElement.getAttribute('lang') || 'tr';
        container.innerHTML = `<p class="text-center text-slate-500">${lang === 'tr' ? 'Henüz yorum yok.' : 'No comments yet.'}</p>`;
        return;
    }
    
    container.innerHTML = comments.map(c => `
        <div class="premium-box p-6 rounded-3xl">
            <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 bg-gradient-to-br from-primary-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    ${c.name[0].toUpperCase()}
                </div>
                <div>
                    <p class="font-bold text-slate-900 dark:text-white">${c.name}</p>
                    <p class="text-sm text-slate-500">${c.date}</p>
                </div>
            </div>
            <p class="text-slate-700 dark:text-slate-300">${c.text}</p>
        </div>
    `).join('');
}

// === DOWNLOADS ===
// Put your Google Drive links here
const downloadMaterials = [
    { 
        id: 1, 
        title: '6. Sınıf Full Rehber', 
        level: 'beginner', 
        size: '2.4 MB', 
        url: 'https://drive.google.com/your-real-link-1' 
    },
    { 
        id: 2, 
        title: 'Teacher Vault', 
        level: 'teacher', 
        size: '45 MB', 
        url: 'https://drive.google.com/your-real-link-2' 
    },
    { 
        id: 3, 
        title: 'B1 Speaking', 
        level: 'intermediate', 
        size: '1.2 MB', 
        url: 'https://drive.google.com/your-real-link-3' 
    }
];

function renderDownloads(filter = 'all') {
    const grid = document.getElementById('downloads-grid');
    if (!grid) return;
    
    const filtered = filter === 'all' ? downloadMaterials : downloadMaterials.filter(m => m.level === filter);
    const lang = document.documentElement.getAttribute('lang') || 'tr';

    grid.innerHTML = filtered.map(m => `
        <div class="premium-box p-6 rounded-3xl">
            <div class="flex items-start justify-between mb-4">
                <div class="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                    <i data-lucide="file-text" class="w-6 h-6 text-primary-600 dark:text-primary-400"></i>
                </div>
                <span class="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-bold uppercase text-slate-600 dark:text-slate-300">${m.size}</span>
            </div>
            <h3 class="font-bold text-lg mb-2 text-slate-900 dark:text-white">${m.title}</h3>
            <button onclick="downloadFile(${m.id})" class="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-bold btn-3d flex items-center justify-center gap-2">
                <i data-lucide="download" class="w-5 h-5"></i>
                ${lang === 'tr' ? 'İndir' : 'Download'}
            </button>
        </div>
    `).join('');
    
    lucide.createIcons();
}

function filterDownloads(level) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('button').classList.add('active');
    renderDownloads(level);
}

function downloadFile(id) {
    const file = downloadMaterials.find(m => m.id === id);
    if (file && file.url) {
        window.open(file.url, '_blank');
    }
}

// === CHATBOT & API ===
function toggleChatbot() {
    document.getElementById('chatbot-window').classList.toggle('active');
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if(!msg) return;
    
    const div = document.getElementById('chat-messages');
    
    // 1. Show User Message
    div.innerHTML += `
        <div class="flex justify-end mb-3">
            <div class="bg-primary-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%] font-medium">${msg}</div>
        </div>
    `;
    input.value = '';
    div.scrollTop = div.scrollHeight;
    
    // 2. Call Cloudflare Backend
    try {
        const backendUrl = "https://berkan-ai-backend.lanselam.workers.dev/"; 
        
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg })
        });

        const data = await response.json();
        
        if (data.error) throw new Error(data.error);

        // Get the AI text safely
        let aiResponse = "Hata: Cevap alınamadı.";
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]) {
             aiResponse = data.candidates[0].content.parts[0].text;
        }

        div.innerHTML += `
            <div class="flex mb-3">
                <div class="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-2xl rounded-tl-sm max-w-[80%] font-medium">${aiResponse}</div>
            </div>
        `;
    } catch (error) {
        div.innerHTML += `<div class="text-red-500 text-xs">Connection Error: ${error.message}</div>`;
    }
    div.scrollTop = div.scrollHeight;
}

// === COPY CLIPBOARD ===
function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).innerText;
    const cleanText = text.replace(/^"|"$/g, '');
    navigator.clipboard.writeText(cleanText).then(() => {
        const toast = document.getElementById('toast');
        toast.classList.remove('translate-y-40', 'opacity-0');
        setTimeout(() => {
            toast.classList.add('translate-y-40', 'opacity-0');
        }, 3000);
    });
}

// === YOUTUBE AUTO-UPDATE ===
async function fetchLatestVideo() {
    try {
        const backendUrl = "https://berkan-ai-backend.lanselam.workers.dev/"; 
        const response = await fetch(backendUrl);
        const data = await response.json();

        if (data.videoId) {
            const iframe = document.getElementById('latest-video');
            if (iframe) {
                iframe.src = `https://www.youtube.com/embed/${data.videoId}`;
            }
        }
    } catch (error) {
        console.error("Error fetching video:", error);
    }
}

// === INIT ===
document.addEventListener('DOMContentLoaded', function() {
    initThemeWithAutoDetection();
    
    // Blog render is now safe because we included blog-data.js in HTML
    renderBlog();
    
    renderComments();
    renderDownloads();
    
    // Auto-update YouTube on load
    fetchLatestVideo();
    
    const chatInput = document.getElementById('chat-input');
    if(chatInput) chatInput.addEventListener('keypress', e => { if(e.key === 'Enter') sendMessage(); });
});

// === AUDIO PLAYER ===
let currentAudio = null;
let currentId = null;

function toggleAudio(id) {
    const audio = document.getElementById('audio-' + id);
    const icon = document.getElementById('icon-' + id);
    const btn = document.getElementById('btn-' + id);

    if (currentAudio === audio && !audio.paused) {
        audio.pause();
        const currentIcon = document.getElementById('icon-' + id);
        if (currentIcon) currentIcon.setAttribute('data-lucide', 'play-circle');
        btn.classList.remove('audio-playing');
        currentAudio = null;
        currentId = null;
    } else {
        if (currentAudio && currentAudio !== audio) {
            currentAudio.pause();
            currentAudio.currentTime = 0; 
            
            const oldIcon = document.getElementById('icon-' + currentId);
            const oldBtn = document.getElementById('btn-' + currentId);
            
            if (oldIcon) oldIcon.setAttribute('data-lucide', 'play-circle');
            if (oldBtn) oldBtn.classList.remove('audio-playing');
        }

        audio.play();
        icon.setAttribute('data-lucide', 'pause-circle'); 
        btn.classList.add('audio-playing'); 

        currentAudio = audio;
        currentId = id;
    }
    
    lucide.createIcons();

    audio.onended = function() {
        const freshIcon = document.getElementById('icon-' + id);
        const freshBtn = document.getElementById('btn-' + id);
        
        if (freshIcon) freshIcon.setAttribute('data-lucide', 'play-circle');
        if (freshBtn) freshBtn.classList.remove('audio-playing');
        
        lucide.createIcons();
        
        if (currentAudio === audio) {
            currentAudio = null;
            currentId = null;
        }
    };
}
