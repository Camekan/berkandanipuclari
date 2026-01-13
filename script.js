// ==========================================
// AYARLAR
// ==========================================
const BLOGGER_URL = "https://berkandanipuclari.blogspot.com"; 
// ==========================================

// İkonları Başlat
if(typeof lucide !== 'undefined') lucide.createIcons();

// ==========================================
// 1. BLOGGER VERİSİNİ ÇEKME (JSONP YÖNTEMİ)
// ==========================================
function loadBloggerPosts() {
    const script = document.createElement('script');
    // 'callback=displayBloggerPosts' parametresi, veriyi aldıktan sonra aşağıdaki fonksiyonu çalıştırır.
    script.src = `${BLOGGER_URL}/feeds/posts/default?alt=json-in-script&max-results=3&callback=displayBloggerPosts`;
    script.onerror = function() {
        document.getElementById('blog-posts').innerHTML = '<p class="text-center text-red-500 col-span-full">Blog verisi yüklenirken hata oluştu. (Blogger erişilemiyor)</p>';
    };
    document.body.appendChild(script);
}

// Bu fonksiyon otomatik olarak çalışacak (Blogger'dan cevap gelince)
window.displayBloggerPosts = function(data) {
    const container = document.getElementById('blog-posts');
    if (!container) return;

    if (!data.feed || !data.feed.entry || data.feed.entry.length === 0) {
        container.innerHTML = '<p class="text-center text-slate-500 col-span-full">Henüz yazı bulunmuyor.</p>';
        return;
    }

    container.innerHTML = data.feed.entry.map(post => {
        // Başlık
        const title = post.title.$t;
        
        // Tarih ve Saat (Zaman Eklendi)
        const dateObj = new Date(post.published.$t);
        const dateStr = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

        // Link
        const link = post.link.find(l => l.rel === 'alternate').href;

        // Resim (Yüksek Kalite)
        let img = 'https://images.unsplash.com/photo-1499750310159-52f8f6032d59?w=800&q=80';
        if (post.media$thumbnail) {
            img = post.media$thumbnail.url.replace(/\/s[0-9]+.*?\//, '/w600/');
        }

        // Kısa Özet
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = post.content ? post.content.$t : (post.summary ? post.summary.$t : '');
        const excerpt = (tempDiv.textContent || tempDiv.innerText || '').substring(0, 100) + '...';

        return `
            <article class="premium-box p-6 rounded-3xl flex flex-col h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-xl transition-all" onclick="window.open('${link}', '_blank')">
                <div class="h-48 bg-gray-200 rounded-2xl mb-4 overflow-hidden relative">
                    <img src="${img}" class="w-full h-full object-cover transition-transform hover:scale-110 duration-500">
                    <div class="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">Blogger</div>
                </div>
                <div class="flex items-center gap-3 text-xs font-bold text-slate-400 mb-3">
                    <span class="flex items-center gap-1"><i data-lucide="calendar" class="w-3 h-3"></i> ${dateStr}</span>
                    <span class="flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> ${timeStr}</span>
                </div>
                <h3 class="font-heading font-bold text-xl mb-2 text-slate-900 dark:text-white leading-tight">${title}</h3>
                <p class="text-sm text-slate-600 dark:text-slate-400 flex-grow mb-4">${excerpt}</p>
                <button class="text-blue-600 font-bold hover:underline text-left mt-auto flex items-center gap-1">
                    Oku <i data-lucide="external-link" class="w-4 h-4"></i>
                </button>
            </article>
        `;
    }).join('');
    
    if(typeof lucide !== 'undefined') lucide.createIcons();
};

// ==========================================
// DİĞER FONKSİYONLAR
// ==========================================

// Search
const searchData = [
    { title: '6. Sınıf Rehberi', url: '#downloads', type: 'Materyal' },
    { title: 'Yol Haritası', url: '#roadmap', type: 'Bölüm' },
    { title: 'Blog', url: BLOGGER_URL, type: 'Link' }
];

function toggleSearch() {
    const modal = document.getElementById('search-modal');
    modal.classList.toggle('active');
    if(modal.classList.contains('active')) document.getElementById('search-input').focus();
}

function performSearch(query) {
    const res = document.getElementById('search-results');
    if(!query) { res.innerHTML = ''; return; }
    
    const filtered = searchData.filter(i => i.title.toLowerCase().includes(query.toLowerCase()));
    if(filtered.length === 0) { res.innerHTML = '<p class="text-slate-500">Sonuç yok.</p>'; return; }
    
    res.innerHTML = filtered.map(i => `
        <a href="${i.url}" class="block p-3 bg-slate-100 dark:bg-slate-800 rounded-xl mb-2">
            <div class="font-bold dark:text-white">${i.title}</div>
            <div class="text-xs text-slate-500">${i.type}</div>
        </a>
    `).join('');
}

// Chatbot
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if(!msg) return;
    
    const box = document.getElementById('chat-messages');
    box.innerHTML += `<div class="text-right mb-2"><span class="bg-blue-600 text-white px-3 py-2 rounded-xl inline-block">${msg}</span></div>`;
    input.value = '';
    box.scrollTop = box.scrollHeight;

    try {
        const res = await fetch("https://berkan-ai-backend.lanselam.workers.dev/", {
            method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({message: msg})
        });
        const data = await res.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Hata oluştu.";
        box.innerHTML += `<div class="mb-2"><span class="bg-slate-200 dark:bg-slate-700 px-3 py-2 rounded-xl inline-block dark:text-white">${reply}</span></div>`;
        box.scrollTop = box.scrollHeight;
    } catch(e) { console.error(e); }
}

// İndirilenler Listesi
function renderDownloads() {
    const list = [
        { title: '6. Sınıf Paketi', size: '2 MB' },
        { title: 'Teacher Vault', size: '45 MB' },
        { title: 'B1 Speaking', size: '1.2 MB' }
    ];
    document.getElementById('downloads-grid').innerHTML = list.map(i => `
        <div class="premium-box p-6 rounded-2xl bg-white dark:bg-slate-800">
            <div class="flex justify-between mb-4"><i data-lucide="file-text" class="text-blue-600"></i> <span class="text-xs font-bold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">${i.size}</span></div>
            <h3 class="font-bold text-lg mb-2 dark:text-white">${i.title}</h3>
            <button class="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700">İndir</button>
        </div>
    `).join('');
    if(typeof lucide !== 'undefined') lucide.createIcons();
}

// Başlangıç
document.addEventListener('DOMContentLoaded', () => {
    // 1. Blogları Yükle
    loadBloggerPosts();
    
    // 2. İndirilenleri Yükle
    renderDownloads();
    
    // 3. Tema Ayarı
    if(localStorage.theme === 'dark') document.documentElement.classList.add('dark');
    document.getElementById('theme-toggle').onclick = () => {
        document.documentElement.classList.toggle('dark');
        localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    };
    
    // 4. Chat Enter Tuşu
    document.getElementById('chat-input').addEventListener('keypress', e => {
        if(e.key === 'Enter') sendMessage();
    });
});
