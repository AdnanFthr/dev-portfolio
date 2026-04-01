/**
 * i18n.js - Internationalization Module
 * Handles language switching and translation loading
 */

const I18n = (function() {
    'use strict';

    const state = {
        currentLang: 'id',
        translations: {}
    };

    async function loadTranslations(lang) {
        try {
            const response = await fetch(`./data/${lang}.json`);
            if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
            state.translations[lang] = await response.json();
            return state.translations[lang];
        } catch (error) {
            console.error('Error loading translations:', error);
            return null;
        }
    }

    function getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    function updateContent(lang) {
        const t = state.translations[lang];
        if (!t) return;

        document.documentElement.lang = lang;
        document.documentElement.dataset.lang = lang;

        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            const value = getNestedValue(t, key);
            
            if (value !== undefined) {
                // Handle HTML content for specific keys
                if (key.includes('p1') || key.includes('p2') || key.includes('desc') || key.includes('intro')) {
                    el.innerHTML = value;
                } else {
                    el.textContent = value;
                }
            }
        });

        // Update typing animation texts
        if (t.typing && window.TypingAnimation) {
            window.TypingAnimation.setTexts(t.typing);
        }

        // Update lang switcher UI
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        state.currentLang = lang;
        localStorage.setItem('portfolio-lang', lang);
    }

    async function switchLanguage(lang) {
        if (lang === state.currentLang) return;
        
        if (!state.translations[lang]) {
            await loadTranslations(lang);
        }
        
        updateContent(lang);
    }

    async function init() {
        const savedLang = localStorage.getItem('portfolio-lang') || 'id';
        
        // Load both languages
        await Promise.all([
            loadTranslations('id'),
            loadTranslations('en')
        ]);

        // Setup event listeners
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => switchLanguage(btn.dataset.lang));
        });

        // Apply initial language
        updateContent(savedLang);
    }

    return {
        init,
        switchLanguage,
        getCurrentLang: () => state.currentLang,
        getTranslations: () => state.translations[state.currentLang]
    };
})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', I18n.init);
} else {
    I18n.init();
}