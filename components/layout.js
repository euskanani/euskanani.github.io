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
export function renderNav({ logoHref = '#', links = [], activeHref = '' } = {}) {
  const items = links.map(({ label, href }) => {
    const active = href === activeHref ? ' class="active"' : '';
    return `<li><a href="${href}"${active}>${label}</a></li>`;
  }).join('\n    ');

  const nav = document.createElement('nav');
  nav.innerHTML = `
  <a href="${logoHref}" class="nav-logo">Marc Kanani</a>
  <ul class="nav-links">
    ${items}
  </ul>`;
  document.body.prepend(nav);
}

/**
 * @param {Object} opts
 * @param {string} [opts.year]
 */
export function renderFooter({ year = new Date().getFullYear() } = {}) {
  const footer = document.createElement('footer');
  footer.innerHTML = `
  <p>© ${year} Marc Kanani. All rights reserved.</p>
  <p>Paris, France</p>`;
  document.body.appendChild(footer);
}
