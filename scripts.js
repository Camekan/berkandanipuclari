// scripts.js (with debug logs and audio safeguard)
lucide.createIcons();
console.log('Lucide icons loaded.'); // Debug: Confirm Lucide

const html = document.documentElement;
const toggleBtn = document.getElementById('theme-toggle');
const langToggle = document.getElementById('lang-toggle');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        console.log('Mobile menu toggled.');
    });
} else {
    console.warn('Mobile menu toggle not found.');
}

function toggleTheme() {
    html.classList.toggle('dark');
    localStorage.theme = html.classList.contains('dark') ? 'dark' : 'light';
    console.log('Theme toggled to', localStorage.theme); // Debug: Confirm toggle
}

if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.classList.add('dark');
} else {
    html.classList.remove('dark');
}
if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTheme);
} else {
    console.warn('Theme toggle button not found.');
}

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
    console.log('Language toggled to', html.getAttribute('lang')); // Debug
    // Re-render
    renderBlog();
    renderComments();
    renderDownloads();
}

if (localStorage.lang === 'en') {
    toggleLanguage();
}
if (langToggle) {
    langToggle.addEventListener('click', toggleLanguage);
} else {
    console.warn('Language toggle button not found.');
}

function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).innerText;
    const cleanText = text.replace(/^"|"$/g, '');
    navigator.clipboard.writeText(cleanText).then(() => {
        const toast = document.getElementById('toast');
        toast.classList.remove('translate-y-40', 'opacity-0');
        setTimeout(() => {
            toast.classList.add('translate-y-40', 'opacity-0');
        }, 3000);
        console.log('Copied to clipboard:', cleanText); // Debug
    }).catch(err => console.error('Clipboard error:', err));
}

// AUDIO PLAYER (with safeguard)
let currentAudio = null;
let currentId = null;

function toggleAudio(id) {
    const audio = document.getElementById('audio-' + id);
    if (!audio) {
        console.warn(`Audio file for ID ${id} is missing.`);
        return;
    }
    const icon = document.getElementById('icon-' + id);
    const btn = document.getElementById('btn-' + id);

    if (currentAudio === audio && !audio.paused) {
        audio.pause();
        const currentIcon = document.getElementById('icon-' + id);
        if (currentIcon) currentIcon.setAttribute('data-lucide', 'play-circle');
        btn.classList.remove('audio-playing');
        currentAudio = null;
        currentId = null;
        console.log(`Paused audio ${id}`);
    } else {
        if (currentAudio && currentAudio !== audio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            const oldIcon = document.getElementById('icon-' + currentId);
            const oldBtn = document.getElementById('btn-' + currentId);
            if (oldIcon) oldIcon.setAttribute('data-lucide', 'play-circle');
            if (oldBtn) oldBtn.classList.remove('audio-playing');
        }

        audio.play().catch(error => console.error(`Error playing audio ${id}:`, error));
        icon.setAttribute('data-lucide', 'pause-circle');
        btn.classList.add('audio-playing');
        currentAudio = audio;
        currentId = id;
        console.log(`Playing audio ${id}`);
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
        console.log(`Audio ${id} ended.`);
    };
}

// INIT
document.addEventListener('DOMContentLoaded', function() {
    initThemeWithAutoDetection();
    renderBlog();
    renderComments();
    renderDownloads();
    console.log('Page loaded and initialized.');
});

// Rest of the script remains the same (search, blog, comments, chatbot, downloads)...
// (Copy the full JS from previous response, adding the console logs as shown for debugging)
