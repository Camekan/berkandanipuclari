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
    { title: '6. Sınıf Full Rehber', titleEn: '6th Grade Full Guide', type: 'material', link: '#downloads', level: 'A1-A2' },
    { title: 'Öğretmen Kasam', titleEn: 'Teacher Vault', type: 'material', link: '#downloads', level: 'Teacher' },
    { title: 'Yol Haritası', titleEn: 'Roadmap', type: 'section', link: '#roadmap' },
    { title: 'Promptlar', titleEn: 'Prompts', type: 'section', link: '#prompts' },
    { title: 'Blog', titleEn: 'Blog', type: 'section', link: '#blog' },
    { title: 'AI ile İngilizce Öğrenme', titleEn: 'Learn English with AI', type: 'blog', link: '#blog' }
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
    
    const filtered = searchableContent.filter(item => {
        const searchIn = lang === 'tr' ? item.title.toLowerCase() : item.titleEn.toLowerCase();
        return searchIn.includes(query.toLowerCase());
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

// === BLOG ===
const blogPosts = [
    {
        id: 1,
        title: 'AI ile İngilizce Nasıl Öğrenilir?',
        titleEn: 'How to Learn English with AI?',
        excerpt: 'Yapay zekanın gücünü kullanarak İngilizce öğrenmeyi nasıl hızlandırabilirsiniz?',
        excerptEn: 'How can you accelerate English learning using the power of AI?',
        date: '13 Ocak 2026',
        dateEn: 'January 13, 2026',
        content: 'ChatGPT ve Claude gibi AI araçları ile konuşma pratiği yapabilir...',
        contentEn: 'With AI tools like ChatGPT and Claude, you can practice conversations...'
    },
    {
        id: 2,
        title: '10 Dakikada Kelime Öğrenme Teknikleri',
        titleEn: 'Word Learning Techniques in 10 Minutes',
        excerpt: 'Günde sadece 10 dakika ayırarak kelime dağarcığınızı nasıl genişletebilirsiniz?',
        excerptEn: 'How can you expand your vocabulary by dedicating just 10 minutes a day?',
        date: '10 Ocak 2026',
        dateEn: 'January 10, 2026',
        content: 'Spaced repetition tekniği ve Quizlet kullanarak etkili kelime öğrenme yöntemleri...',
        contentEn: 'Effective vocabulary learning methods using spaced repetition and Quizlet...'
    },
    {
        id: 3,
        title: 'Speaking Pratiği için 5 Altın İpucu',
        titleEn: '5 Golden Tips for Speaking Practice',
        excerpt: 'Konuşma becerinizi geliştirmek için mutlaka denemeniz gereken 5 yöntem.',
        excerptEn: '5 methods you must try to improve your speaking skills.',
        date: '5 Ocak 2026',
        dateEn: 'January 5, 2026',
        content: 'Shadowing tekniği, AI conversation partners ve daha fazlası...',
        contentEn: 'Shadowing technique, AI conversation partners and more...'
    }
];

function renderBlog() {
    const lang = document.documentElement.getAttribute('lang') || 'tr';
    const blogSection = document.getElementById('blog-posts');
    if (!blogSection) return;
    
    blogSection.innerHTML = blogPosts.map(post => `
        <article class="premium-box p-6 rounded-3xl cursor-pointer hover:scale-105 transition-transform" onclick="openBlogPost(${post.id})">
            <div class="h-48 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl mb-4"></div>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-2">${lang === 'tr' ? post.date : post.dateEn}</p>
            <h3 class="font-heading font-bold text-xl mb-3 text-slate-900 dark:text-white">${lang === 'tr' ? post.title : post.titleEn}</h3>
            <p class="text-slate-600 dark:text-slate-400 mb-4">${lang === 'tr' ? post.excerpt : post.excerptEn}</p>
            <button class="text-primary-600 dark:text-primary-400 font-bold hover:underline">
                ${lang === 'tr' ? 'Devamını Oku →' : 'Read More →'}
            </button>
        </article>
    `).join('');
    lucide.createIcons();
}

function openBlogPost(id) {
    const post = blogPosts.find(p => p.id === id);
    const lang = document.documentElement.getAttribute('lang') || 'tr';
    alert(`${lang === 'tr' ? post.title : post.titleEn}\n\n${lang === 'tr' ? post.content : post.contentEn}`);
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
const downloadMaterials = [
    { id: 1, title: '6. Sınıf Full Rehber', level: 'beginner', size: '2.4 MB', url: '#' },
    { id: 2, title: 'Teacher Vault', level: 'teacher', size: '45 MB', url: '#' }
];

function renderDownloads(filter = 'all') {
    const grid = document.getElementById('downloads-grid');
    if (!grid) return;
    
    const filtered = filter === 'all' ? downloadMaterials : downloadMaterials.filter(m => m.level === filter);
    const lang = document.documentElement.getAttribute('lang') || 'tr';

    grid.innerHTML = filtered.map(m => `
        <div class="premium-box p-6 rounded-3xl">
            <h3 class="font-bold text-lg mb-2 text-slate-900 dark:text-white">${m.title}</h3>
            <button class="w-full bg-primary-600 text-white py-3 rounded-xl font-bold btn-3d">
                ${lang === 'tr' ? 'İndir' : 'Download'}
            </button>
        </div>
    `).join('');
}

function filterDownloads(level) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('button').classList.add('active');
    renderDownloads(level);
}

// === CHATBOT ===
function toggleChatbot() {
    document.getElementById('chatbot-window').classList.toggle('active');
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if(!msg) return;
    
    const div = document.getElementById('chat-messages');
    div.innerHTML += `<div class="flex justify-end mb-3"><div class="bg-primary-600 text-white px-4 py-2 rounded-2xl">${msg}</div></div>`;
    input.value = '';
    
    setTimeout(() => {
        div.innerHTML += `<div class="flex mb-3"><div class="bg-slate-100 dark:bg-slate-700 px-4 py-2 rounded-2xl">I'm an AI assistant. How can I help?</div></div>`;
        div.scrollTop = div.scrollHeight;
    }, 1000);
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

// === INIT ===
document.addEventListener('DOMContentLoaded', function() {
    initThemeWithAutoDetection();
    renderBlog();
    renderComments();
    renderDownloads();
    
    const chatInput = document.getElementById('chat-input');
    if(chatInput) chatInput.addEventListener('keypress', e => { if(e.key === 'Enter') sendMessage(); });
});

// === AUDIO PLAYER (FIXED) ===
let currentAudio = null;
let currentId = null;

function toggleAudio(id) {
    const audio = document.getElementById('audio-' + id);
    const icon = document.getElementById('icon-' + id);
    const btn = document.getElementById('btn-' + id);

    // 1. If clicking the SAME audio that is playing:
    if (currentAudio === audio && !audio.paused) {
        audio.pause();
        // Fix: Always re-fetch the current icon because Lucide replaces it
        const currentIcon = document.getElementById('icon-' + id);
        if (currentIcon) currentIcon.setAttribute('data-lucide', 'play-circle');
        btn.classList.remove('audio-playing');
        currentAudio = null;
        currentId = null;
    } 
    // 2. If clicking a NEW audio or starting stopped audio:
    else {
        // Stop the previous one if it exists
        if (currentAudio && currentAudio !== audio) {
            currentAudio.pause();
            currentAudio.currentTime = 0; // Reset previous
            
            // Fix: Find the OLD icon using the stored ID
            const oldIcon = document.getElementById('icon-' + currentId);
            const oldBtn = document.getElementById('btn-' + currentId);
            
            if (oldIcon) oldIcon.setAttribute('data-lucide', 'play-circle');
            if (oldBtn) oldBtn.classList.remove('audio-playing');
        }

        // Play the new one
        audio.play();
        icon.setAttribute('data-lucide', 'pause-circle'); // Change icon to Pause
        btn.classList.add('audio-playing'); // Add pulse animation

        // Update globals
        currentAudio = audio;
        currentId = id;
    }
    
    // Refresh icons (Lucide needs this to re-render the SVG when attribute changes)
    lucide.createIcons();

    // Reset icon when audio finishes naturally
    audio.onended = function() {
        // Fix: Must find the FRESH icon element because the old one was replaced by Lucide
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
