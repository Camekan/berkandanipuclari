lucide.createIcons();
const html = document.documentElement;
const toggleBtn = document.getElementById('theme-toggle');
const langToggle = document.getElementById('lang-toggle');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
});

function toggleTheme() {
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        localStorage.theme = 'light';
    } else {
        html.classList.add('dark');
        localStorage.theme = 'dark';
    }
}

if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.classList.add('dark');
} else {
    html.classList.remove('dark');
}
toggleBtn.addEventListener('click', toggleTheme);

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
}

if (localStorage.lang === 'en') {
    toggleLanguage(); // Apply immediately if stored as en
}
langToggle.addEventListener('click', toggleLanguage);

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

/* --- AUDIO PLAYER LOGIC (FIXED) --- */
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

// === AUTO DARK MODE DETECTION ===
function initThemeWithAutoDetection() {
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    const hour = new Date().getHours();
   
    if (savedTheme) {
        if (savedTheme === 'dark') html.classList.add('dark');
        else html.classList.remove('dark');
    } else if (hour >= 20 || hour < 7) {
        html.classList.add('dark');
    }
}
// Update your existing theme toggle
document.getElementById('theme-toggle').addEventListener('click', function() {
    const html = document.documentElement;
    html.classList.toggle('dark');
    localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
});
// === SEARCH FUNCTIONALITY ===
function toggleSearch() {
    const modal = document.getElementById('search-modal');
    modal.classList.toggle('active');
    if (modal.classList.contains('active')) {
        document.getElementById('search-input').focus();
    } else {
        document.getElementById('search-input').value = '';
        document.getElementById('search-results').innerHTML = '<p class="text-slate-500 text-sm font-medium lang-tr">Aramaya başlamak için yazmaya başlayın...</p><p class="text-slate-500 text-sm font-medium lang-en">Start typing to search...</p>';
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
            <h4 class="font-bold mb-1">${lang === 'tr' ? item.title : item.titleEn}</h4>
            <p class="text-sm text-slate-600 dark:text-slate-400">${item.type} ${item.level || ''}</p>
        </a>
    `).join('');
}
// === BLOG SECTION ===
const blogPosts = [
    {
        id: 1,
        title: 'AI ile İngilizce Nasıl Öğrenilir?',
        titleEn: 'How to Learn English with AI?',
        excerpt: 'Yapay zekanın gücünü kullanarak İngilizce öğrenmeyi nasıl hızlandırabilirsiniz?',
        excerptEn: 'How can you accelerate English learning using the power of AI?',
        date: '13 Ocak 2026',
        dateEn: 'January 13, 2026',
        content: 'ChatGPT ve Claude gibi AI araçları ile konuşma pratiği yapabilir, writing düzeltmeleri alabilir ve kişiselleştirilmiş ders planları oluşturabilirsiniz...',
        contentEn: 'With AI tools like ChatGPT and Claude, you can practice conversations, get writing corrections, and create personalized lesson plans...'
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
            <h3 class="font-heading font-bold text-xl mb-3">${lang === 'tr' ? post.title : post.titleEn}</h3>
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
// === COMMENTS SECTION WITH MULTILINGUAL PROFANITY FILTER ===
const badWordsTR = ['kötü', 'aptal', 'salak', 'ahmak', 'gerizekalı'];
const badWordsEN = ['bad', 'stupid', 'idiot', 'fool', 'dumb'];
const allBadWords = [...badWordsTR, ...badWordsEN];
let comments = [];
function filterProfanity(text) {
    let filtered = text;
    allBadWords.forEach(word => {
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
   
    const filteredName = filterProfanity(name);
    const filteredText = filterProfanity(text);
   
    comments.unshift({
        name: filteredName,
        text: filteredText,
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
        container.innerHTML = `<p class="text-center text-slate-500">${lang === 'tr' ? 'Henüz yorum yok. İlk yorumu siz yapın!' : 'No comments yet. Be the first to comment!'}</p>`;
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
// === AI CHATBOT ===
function toggleChatbot() {
    const window = document.getElementById('chatbot-window');
    window.classList.toggle('active');
    lucide.createIcons();
}
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;
   
    const messagesDiv = document.getElementById('chat-messages');
    const lang = document.documentElement.getAttribute('lang') || 'tr';
   
    messagesDiv.innerHTML += `
        <div class="flex justify-end mb-3">
            <div class="bg-primary-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%] font-medium">${message}</div>
        </div>
    `;
   
    input.value = '';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
   
    // Simple responses (replace with Claude API)
    setTimeout(() => {
        const responses = {
            tr: [
                'Merhaba! Size nasıl yardımcı olabilirim?',
                'İngilizce öğrenme konusunda soru sormak isterseniz buradayım!',
                'Materyaller hakkında bilgi almak için "materyaller" yazabilirsiniz.',
                'Daha fazla bilgi için blog bölümünü ziyaret edebilirsiniz.'
            ],
            en: [
                'Hello! How can I help you?',
                'I\'m here if you want to ask about English learning!',
                'You can type "materials" to get info about materials.',
                'Visit the blog section for more information.'
            ]
        };
       
        const randomResponse = responses[lang][Math.floor(Math.random() * responses[lang].length)];
       
        messagesDiv.innerHTML += `
            <div class="flex mb-3">
                <div class="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-2xl rounded-tl-sm max-w-[80%] font-medium">${randomResponse}</div>
            </div>
        `;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }, 1000);
}
// Enter key support for chatbot
document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
    }
});
// === DOWNLOADS SECTION WITH FILTERS ===
const downloadMaterials = [
    { id: 1, title: '6. Sınıf Full Rehber.docx', level: 'beginner', size: '2.4 MB', type: 'docx', url: 'https://your-drive-link-here.com/file1' },
    { id: 2, title: 'Öğretmen Kasam-20260113T004914Z-3-001.zip', level: 'teacher', size: '45.2 MB', type: 'zip', url: 'https://your-drive-link-here.com/file2' },
    { id: 3, title: 'Grammar Basics A1-A2.pdf', level: 'beginner', size: '1.8 MB', type: 'pdf', url: 'https://your-drive-link-here.com/file3' },
    { id: 4, title: 'IELTS Preparation C1.pdf', level: 'advanced', size: '3.2 MB', type: 'pdf', url: 'https://your-drive-link-here.com/file4' },
    { id: 5, title: 'Speaking Practice B1-B2.docx', level: 'intermediate', size: '1.5 MB', type: 'docx', url: 'https://your-drive-link-here.com/file5' }
];
function renderDownloads(filter = 'all') {
    const grid = document.getElementById('downloads-grid');
    if (!grid) return;
   
    const lang = document.documentElement.getAttribute('lang') || 'tr';
    const filtered = filter === 'all' ? downloadMaterials : downloadMaterials.filter(m => m.level === filter);
   
    grid.innerHTML = filtered.map(m => `
        <div class="premium-box p-6 rounded-3xl">
            <div class="flex items-start justify-between mb-4">
                <div class="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                    <i data-lucide="file-text" class="w-6 h-6 text-primary-600 dark:text-primary-400"></i>
                </div>
                <span class="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-bold uppercase">${m.size}</span>
            </div>
            <h3 class="font-bold text-lg mb-2 text-slate-900 dark:text-white">${m.title}</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-4 uppercase font-bold">${m.level}</p>
            <button onclick="downloadFile(${m.id})" class="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 btn-3d">
                <i data-lucide="download" class="w-5 h-5"></i>
                ${lang === 'tr' ? 'İndir' : 'Download'}
            </button>
        </div>
    `).join('');
   
    lucide.createIcons();
}
function filterDownloads(level) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderDownloads(level);
}
function downloadFile(id) {
    const file = downloadMaterials.find(m => m.id === id);
    if (file && file.url) {
        window.open(file.url, '_blank');
    } else {
        const lang = document.documentElement.getAttribute('lang') || 'tr';
        alert(lang === 'tr'
            ? `${file.title} indiriliyor... (Demo - gerçek link ekleyin)`
            : `Downloading ${file.title}... (Demo - add real link)`);
    }
}
// === INITIALIZE EVERYTHING ===
document.addEventListener('DOMContentLoaded', function() {
    initThemeWithAutoDetection();
    renderBlog();
    renderComments();
    renderDownloads();
});
// Update language toggle to re-render content
document.getElementById('lang-toggle').addEventListener('click', function() {
    setTimeout(() => {
        renderBlog();
        renderComments();
        renderDownloads();
    }, 100);
});
