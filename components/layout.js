/**
 * layout.js — Shared layout components (nav, footer)
 * Usage: import { renderNav, renderFooter } from '../components/layout.js';
 */

/**
 * @param {Object} opts
 * @param {string}   opts.logoHref   — href for the logo link
 * @param {Array}    opts.links       — [{ label, href }]
 * @param {string}  [opts.activeHref] — href to mark active
 */
const translations = {
    en: {
        nav_about: 'About',
        nav_works: 'Works',
        nav_exhibitions: 'Exhibitions',
        nav_process: 'Process',
        nav_contact: 'Contact',
        nav_portfolio: '→ Portfolio',
        nav_gallery: '→ Gallery',
        footer_rights: 'All rights reserved.',
        lang_toggle: 'FR',
    },
    fr: {
        nav_about: 'À propos',
        nav_works: 'Œuvres',
        nav_exhibitions: 'Expositions',
        nav_process: 'Démarche',
        nav_contact: 'Contact',
        nav_portfolio: '→ Portfolio',
        nav_gallery: '→ Galerie',
        footer_rights: 'Tous droits réservés.',
        lang_toggle: 'EN',
    },
};

export function getCurrentLang() {
    return localStorage.getItem('mk_lang') || 'fr';
}

export function setLang(lang) {
    localStorage.setItem('mk_lang', lang);
    document.documentElement.lang = lang;
    document.dispatchEvent(new CustomEvent('langchange', {detail: {lang}}));
}

export function t(key) {
    const lang = getCurrentLang();
    return (translations[lang] && translations[lang][key]) || translations.en[key] || key;
}

export function applyTranslations(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const val = (translations[lang] && translations[lang][key]) || translations.en[key];
        if (val !== undefined) {
            el.innerHTML = val;
        }
    });
    document.querySelectorAll('[data-lang]').forEach(el => {
        el.style.display = el.getAttribute('data-lang') === lang ? '' : 'none';
    });
}

export function initLang() {
    const lang = getCurrentLang();
    document.documentElement.lang = lang;
    applyTranslations(lang);
}

export function renderNav({logoHref = '#', links = [], activeHref = ''} = {}) {
    const items = links.map(({label, href, i18nKey}) => {
        const active = href === activeHref ? ' class="active"' : '';
        const di18n = i18nKey ? ` data-i18n="${i18nKey}"` : '';
        return `<li><a href="${href}"${active}${di18n}>${label}</a></li>`;
    }).join('\n    ');

    const nav = document.createElement('nav');
    nav.innerHTML = `
  <a href="${logoHref}" class="nav-logo">Marc Kanani</a>
  <ul class="nav-links">
    ${items}
  </ul>
  <button class="lang-toggle" id="lang-toggle" aria-label="Toggle language">${t('lang_toggle')}</button>`;
    document.body.prepend(nav);

    document.getElementById('lang-toggle').addEventListener('click', () => {
        const next = getCurrentLang() === 'en' ? 'fr' : 'en';
        setLang(next);
        document.getElementById('lang-toggle').textContent = t('lang_toggle');
        applyTranslations(next);
    });

    document.addEventListener('langchange', ({detail: {lang}}) => {
        applyTranslations(lang);
    });

    initLang();
}

/**
 * @param {Object} opts
 * @param {string} [opts.year]
 */
export function renderFooter({year = new Date().getFullYear()} = {}) {
    const footer = document.createElement('footer');
    footer.innerHTML = `
  <p>© ${year} Marc Kanani. <span data-i18n="footer_rights">${t('footer_rights')}</span></p>
  <p>Paris, France</p>`;
    document.body.appendChild(footer);
}
