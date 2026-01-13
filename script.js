// === ICONS & INIT ===
const html = document.documentElement;

// === SEARCH FUNCTIONALITY ===
function toggleSearch() {
    const modal = document.getElementById('search-modal');
    if(!modal) return;
    modal.classList.toggle('active');
    if (modal.classList.contains('active')) {
        setTimeout(() => document.getElementById('search-input').focus(), 100);
    } else {
        document.getElementById('search-input').value = '';
    }
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

const searchableContent = [
    { title: '6. Sınıf Full Rehber', titleEn: '6th Grade Full Guide', link: 'index.html#downloads', keywords: 'materyal download pdf' },
    { title: 'Yol Haritası', titleEn: 'Roadmap', link: 'index.html#roadmap', keywords: 'plan seviye' },
    { title: 'Promptlar', titleEn: 'Prompts', link: 'index.html#prompts', keywords: 'ai chatgpt' },
    { title: 'Blog', titleEn: 'Blog', link: 'blog.html', keywords: 'yazı makale' }
];

function performSearch(query) {
    const results = document.getElementById('search-results');
    if (!results) return;
    
    const lang = document.documentElement.getAttribute('lang') || 'tr';
    if (query.length < 2) {
        results.innerHTML = lang === 'tr' ? '<p class="text-slate-500 text-sm">Yazmaya başlayın...</p>' : '<p class="text-slate-500 text-sm">Start typing...</p>';
        return;
    }
    
    const lower = query.toLowerCase();
    const filtered = searchableContent.filter(item => {
        const title = lang === 'tr' ? item.title.toLowerCase() : item.titleEn.toLowerCase();
        return title.includes(lower) || item.keywords.includes(lower);
    });
    
    results.innerHTML = filtered.length === 0 
        ? (lang === 'tr' ? '<p class="text-slate-500 text-sm">Sonuç yok.</p>' : '<p class="text-slate-500 text-sm">No results.</p>')
        : filtered.map(item => `
            <a href="${item.link}" class="block p-3 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 cursor-pointer">
                <h4 class="font-bold text-slate-900 dark:text-white">${lang === 'tr' ? item.title : item.titleEn}</h4>
            </a>`).join('');
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

function toggleLanguage() {
    const isTr = html.getAttribute('lang') === 'tr';
    html.setAttribute('lang', isTr ? 'en' : 'tr');
    localStorage.lang = isTr ? 'en' : 'tr';
    
    // Re-render components that depend on language
    renderBlogWidget();
    initBlogPage(); 
    renderDownloads();
}
document.getElementById('lang-toggle')?.addEventListener('click', toggleLanguage);
if (localStorage.lang === 'en') html.setAttribute('lang', 'en');

// === BLOG DATA (The Single Source of Truth) ===
const blogPosts = [
    {
        id: 1,
        category: 'ai',
        title: 'AI ile İngilizce Nasıl Öğrenilir?',
        titleEn: 'How to Learn English with AI?',
        excerpt: 'Yapay zekanın gücünü kullanarak İngilizce öğrenmeyi nasıl hızlandırabilirsiniz?',
        excerptEn: 'How can you accelerate English learning using the power of AI?',
        date: '13 Ocak 2026',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
        content: `
            <p>Yapay zeka (AI) dil öğreniminde devrim yaratıyor. Artık sadece gramer kitaplarına bağlı kalmak zorunda değilsiniz.</p>
            <h3>1. ChatGPT ile Konuşma Pratiği</h3>
            <p>ChatGPT'yi bir konuşma partneri olarak kullanın. Ona şu promptu verin:</p>
            <div class="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl font-mono text-sm mb-4">"Let's roleplay. You are a waiter at a cafe, and I am a customer. Ask me what I want to order."</div>
            <h3>2. Telaffuz için Araçlar</h3>
            <p>Metinlerinizi seslendirmek için <strong>ElevenLabs</strong> veya <strong>OpenAI Voice</strong> kullanın. Kendi sesinizi kaydedip karşılaştırın.</p>
        `,
        contentEn: `
            <p>Artificial Intelligence (AI) is revolutionizing language learning. You no longer have to rely solely on grammar books.</p>
            <h3>1. Speaking Practice with ChatGPT</h3>
            <p>Use ChatGPT as a conversation partner. Give it this prompt:</p>
            <div class="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl font-mono text-sm mb-4">"Let's roleplay. You are a waiter at a cafe, and I am a customer. Ask me what I want to order."</div>
        `
    },
    {
        id: 2,
        category: 'vocab',
        title: '10 Dakikada Kelime Öğrenme Teknikleri',
        titleEn: 'Word Learning Techniques in 10 Minutes',
        excerpt: 'Günde sadece 10 dakika ayırarak kelime dağarcığınızı nasıl genişletebilirsiniz?',
        excerptEn: 'How can you expand your vocabulary by dedicating just 10 minutes a day?',
        date: '10 Ocak 2026',
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
        content: `<p>Kelime ezberlemek zor değil, sadece doğru yöntemi bulmanız gerekiyor. Spaced Repetition (Aralıklı Tekrar) en etkili yöntemdir.</p>`,
        contentEn: `<p>Memorizing words isn't hard, you just need the right method. Spaced Repetition is the most effective way.</p>`
    },
    {
        id: 3,
        category: 'grammar',
        title: 'Speaking Pratiği için 5 Altın İpucu',
        titleEn: '5 Golden Tips for Speaking Practice',
        excerpt: 'Konuşma becerinizi geliştirmek için mutlaka denemeniz gereken 5 yöntem.',
        excerptEn: '5 methods you must try to improve your speaking skills.',
        date: '5 Ocak 2026',
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
        content: `<p>Konuşurken hata yapmaktan korkmayın. Kendi kendinize konuşun ve sesinizi kaydedin.</p>`,
        contentEn: `<p>Don't be afraid to make mistakes when speaking. Talk to yourself and record your voice.</p>`
    }
];

// === HOMEPAGE WIDGET LOGIC ===
function renderBlogWidget() {
    const container = document.getElementById('blog-posts');
    if (!container) return; // Not on index.html

    const lang = html.getAttribute('lang') || 'tr';
    
    // Take the latest 3 posts
    container.innerHTML = blogPosts.slice(0, 3).map(post => `
        <article class="premium-box p-6 rounded-3xl cursor-pointer hover:scale-105 transition-transform flex flex-col h-full" onclick="window.location.href='blog.html?id=${post.id}'">
            <div class="h-48 bg-gray-200 rounded-2xl mb-4 overflow-hidden">
                <img src="${post.image}" class="w-full h-full object-cover">
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-2 font-bold">${post.date}</p>
            <h3 class="font-heading font-bold text-xl mb-3 text-slate-900 dark:text-white leading-tight">
                ${lang === 'tr' ? post.title : post.titleEn}
            </h3>
            <p class="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 text-sm flex-grow">
                ${lang === 'tr' ? post.excerpt : post.excerptEn}
            </p>
            <button class="text-primary-600 dark:text-primary-400 font-bold hover:underline text-left mt-auto flex items-center gap-1">
                ${lang === 'tr' ? 'Devamını Oku' : 'Read More'} <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
        </article>
    `).join('');
    
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

// === BLOG PAGE LOGIC (blog.html) ===
function initBlogPage() {
    const listView = document.getElementById('blog-list-view');
    if (!listView) return; // Not on blog.html

    renderCategories();

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    const category = urlParams.get('category') || 'all';

    if (postId) {
        showBlogPost(parseInt(postId));
    } else {
        renderBlogList(category);
    }
}

function renderCategories() {
    const container = document.getElementById('category-list');
    if (!container) return;

    const lang = html.getAttribute('lang') || 'tr';
    const categories = [
        { id: 'all', tr: 'Tümü', en: 'All' },
        { id: 'ai', tr: 'Yapay Zeka', en: 'Artificial Intelligence' },
        { id: 'grammar', tr: 'Gramer', en: 'Grammar' },
        { id: 'vocab', tr: 'Kelime', en: 'Vocabulary' }
    ];

    const currentCat = new URLSearchParams(window.location.search).get('category') || 'all';

    container.innerHTML = categories.map(cat => `
        <button onclick="filterBlog('${cat.id}')" 
            class="category-btn text-left px-4 py-3 rounded-xl font-bold transition-all border border-transparent 
            ${currentCat === cat.id ? 'active' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}">
            ${lang === 'tr' ? cat.tr : cat.en}
        </button>
    `).join('');
}

function filterBlog(category) {
    // Update URL without reload if possible, or just rerender
    const newUrl = new URL(window.location);
    newUrl.searchParams.delete('id');
    newUrl.searchParams.set('category', category);
    window.history.pushState({}, '', newUrl);
    
    renderCategories(); // Update active button
    renderBlogList(category);
}

function renderBlogList(category) {
    const listView = document.getElementById('blog-list-view');
    const singleView = document.getElementById('blog-single-view');
    const container = document.getElementById('blog-grid');
    const lang = html.getAttribute('lang') || 'tr';

    listView.classList.remove('hidden');
    singleView.classList.add('hidden');

    const filtered = category === 'all' ? blogPosts : blogPosts.filter(p => p.category === category);

    if(filtered.length === 0) {
        container.innerHTML = `<p class="col-span-full text-center text-slate-500">Post found.</p>`;
        return;
    }

    container.innerHTML = filtered.map(post => `
        <article class="premium-box p-6 rounded-3xl cursor-pointer hover:scale-105 transition-transform flex flex-col h-full" onclick="showBlogPost(${post.id})">
            <div class="h-56 bg-gray-200 rounded-2xl mb-4 overflow-hidden">
                <img src="${post.image}" class="w-full h-full object-cover">
            </div>
            <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-black text-primary-600 uppercase tracking-wider bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-md">${post.category}</span>
                <span class="text-xs font-bold text-slate-400">${post.date}</span>
            </div>
            <h3 class="font-heading font-bold text-2xl mb-3 text-slate-900 dark:text-white leading-tight">
                ${lang === 'tr' ? post.title : post.titleEn}
            </h3>
            <p class="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 text-sm flex-grow">
                ${lang === 'tr' ? post.excerpt : post.excerptEn}
            </p>
            <button class="text-primary-600 dark:text-primary-400 font-bold hover:underline text-left mt-auto flex items-center gap-1">
                ${lang === 'tr' ? 'Okumaya Başla' : 'Start Reading'} <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
        </article>
    `).join('');
    
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

function showBlogPost(id) {
    const post = blogPosts.find(p => p.id === id);
    if (!post) return;

    // Update URL
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('id', id);
    window.history.pushState({}, '', newUrl);

    const listView = document.getElementById('blog-list-view');
    const singleView = document.getElementById('blog-single-view');
    const lang = html.getAttribute('lang') || 'tr';

    listView.classList.add('hidden');
    singleView.classList.remove('hidden');

    // Fill Content
    document.getElementById('post-image').src = post.image;
    document.getElementById('post-category').textContent = post.category;
    document.querySelector('.date-text').textContent = post.date;
    document.getElementById('post-title').textContent = lang === 'tr' ? post.title : post.titleEn;
    document.getElementById('post-content').innerHTML = lang === 'tr' ? post.content : (post.contentEn || post.content);

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showBlogList() {
    const newUrl = new URL(window.location);
    newUrl.searchParams.delete('id');
    window.history.pushState({}, '', newUrl);
    
    const cat = newUrl.searchParams.get('category') || 'all';
    renderBlogList(cat);
}

// === DOWNLOADS LOGIC ===
const downloadMaterials = [
    { id: 1, title: '6. Sınıf Full Rehber', level: 'beginner', size: '2.4 MB', url: '#' },
    { id: 2, title: 'Teacher Vault', level: 'teacher', size: '45 MB', url: '#' },
    { id: 3, title: 'B1 Speaking', level: 'intermediate', size: '1.2 MB', url: '#' }
];

function renderDownloads(filter = 'all') {
    const grid = document.getElementById('downloads-grid');
    if (!grid) return;
    
    const filtered = filter === 'all' ? downloadMaterials : downloadMaterials.filter(m => m.level === filter);
    grid.innerHTML = filtered.map(m => `
        <div class="premium-box p-6 rounded-3xl">
            <div class="flex items-start justify-between mb-4">
                <div class="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                    <i data-lucide="file-text" class="w-6 h-6 text-primary-600 dark:text-primary-400"></i>
                </div>
                <span class="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-bold uppercase text-slate-600 dark:text-slate-300">${m.size}</span>
            </div>
            <h3 class="font-bold text-lg mb-2 text-slate-900 dark:text-white">${m.title}</h3>
            <button class="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-bold btn-3d flex items-center justify-center gap-2">
                <i data-lucide="download" class="w-5 h-5"></i> İndir
            </button>
        </div>
    `).join('');
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

function filterDownloads(level) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('button').classList.add('active');
    renderDownloads(level);
}

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
    
    try {
        const res = await fetch("https://berkan-ai-backend.lanselam.workers.dev/", {
            method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({message: msg})
        });
        const data = await res.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Hata oluştu.";
        div.innerHTML += `<div class="flex mb-3"><div class="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-2xl rounded-tl-sm max-w-[80%]">${aiText}</div></div>`;
        div.scrollTop = div.scrollHeight;
    } catch(e) { console.error(e); }
}

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    initThemeWithAutoDetection();
    
    // Logic split based on page
    if (window.location.pathname.includes('blog.html')) {
        initBlogPage();
    } else {
        renderBlogWidget(); // Homepage widget
        fetchLatestVideo();
    }
    
    renderDownloads();
    
    const chatInput = document.getElementById('chat-input');
    if(chatInput) chatInput.addEventListener('keypress', e => { if(e.key === 'Enter') sendMessage(); });
    
    if(typeof lucide !== 'undefined') lucide.createIcons();
});

// Audio Player
function toggleAudio(id) {
    const audio = document.getElementById('audio-' + id);
    if(audio.paused) {
        document.querySelectorAll('audio').forEach(a => { if(a !== audio) { a.pause(); a.currentTime = 0; }});
        audio.play();
        document.getElementById('icon-'+id).setAttribute('data-lucide', 'pause-circle');
    } else {
        audio.pause();
        document.getElementById('icon-'+id).setAttribute('data-lucide', 'play-circle');
    }
    if(typeof lucide !== 'undefined') lucide.createIcons();
}
