// Générateur du site statique Swiss Knowhow.
// Lit data/magazines/*.json (+ data/images.json) et écrit le site dans docs/.
// Usage : node tools/build.mjs
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { THEMES, TYPES, CANTONS } from './themes.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// SKH_OUT / SKH_DATA : dossiers alternatifs (tests de sécurité) ; par défaut docs/ et data/
const OUT = process.env.SKH_OUT || path.join(ROOT, 'docs');
const DATA = process.env.SKH_DATA || path.join(ROOT, 'data');
const SITE_NAME = 'Swiss Knowhow';
const SITE_URL = 'https://swissknowhow.ch';
// Racine du site une fois en ligne (domaine swissknowhow.ch) ; SKH_BASE=/site/ pour un aperçu sur github.io
const SITE_BASE = process.env.SKH_BASE || '/';
// Version des fichiers CSS/JS (empreinte du contenu) : force les navigateurs à recharger après chaque mise à jour
const assetVersion = (rel) => {
  try { return crypto.createHash('md5').update(fs.readFileSync(path.join(OUT, rel))).digest('hex').slice(0, 8); } catch { return '1'; }
};
// Feuille des couleurs de thème (remplace les styles inline, interdits par la CSP)
fs.mkdirSync(path.join(OUT, 'assets', 'css'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'assets', 'css', 'themes.css'), '/* Généré par tools/build.mjs — couleurs des thèmes */\n'
  + Object.entries(THEMES).map(([id, t]) => `.th-${id}{--c:${t.color}}`).join('\n')
  + '\n.th-none{--c:#64748b}\n.th-red{--c:var(--red)}\n'
  + [0, 1, 2, 3, 4].map((i) => `.hero-bg img.hero-i${i}{--i:${i}}`).join('\n') + '\n');
// Politique de sécurité du contenu : tout est servi par le site lui-même (sauf la mesure d'audience ci-dessous), aucun script ni style inline.
// (frame-ancestors ne fonctionne pas en <meta> : voir app.js pour la protection anti-iframe)
// Mesure d'audience sans cookie (Umami Cloud, offre gratuite, région UE) : pages vues + événements envoyés par app.js
// (téléchargements de PDF, clics vers les sites des entreprises). Tant que websiteId est vide, rien n'est chargé
// et la CSP reste fermée à tout domaine tiers.
const ANALYTICS = { src: 'https://cloud.umami.is/script.js', endpoint: 'https://gateway.umami.is', websiteId: 'da916621-2ece-4fbe-b046-e0bec5dde0f2', domain: 'swissknowhow.ch' };
if (!ANALYTICS.websiteId) ANALYTICS.src = '';
const AN_ORIGIN = ANALYTICS.src ? new URL(ANALYTICS.src).origin : '';
const CSP = `default-src 'none'; script-src 'self'${AN_ORIGIN ? ` ${AN_ORIGIN}` : ''}; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'${AN_ORIGIN ? ` ${new URL(ANALYTICS.endpoint || ANALYTICS.src).origin}` : ''}; manifest-src 'self'; base-uri 'none'; form-action 'self'; object-src 'none'; upgrade-insecure-requests`;
const THEMES_V = assetVersion('assets/css/themes.css');
const INIT_V = assetVersion('assets/js/theme-init.js');
const CSS_V = assetVersion('assets/css/style.css');
const JS_V = assetVersion('assets/js/app.js');

// ---------- utilitaires ----------
// Meta description : ≤ 160 caractères, coupée au mot près.
const metaDesc = (s) => {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim();
  if (t.length <= 160) return t;
  return t.slice(0, 158).replace(/\s+\S*$/, '').replace(/[\s,;:.\-–—(]+$/, '') + '…';
};
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fold = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const slugify = (s) => fold(s).replace(/&/g, ' et ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const uniq = (a) => [...new Set(a.filter(Boolean))];
const SITEMAP = []; // pages indexables (hors redirections et 404)
const write = (rel, content) => {
  if (typeof content === 'string' && content.includes('<!--CANONICAL-->')) {
    const url = `${process.env.SKH_SITE_URL || 'https://swissknowhow.ch'}/${rel.replace(/index\.html$/, '')}`;
    content = content.replace('<!--CANONICAL-->', `<link rel="canonical" href="${url}">\n<meta property="og:url" content="${url}">`);
    if (rel.endsWith('index.html')) SITEMAP.push(rel.replace(/index\.html$/, ''));
  }
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
};
const exists = (rel) => fs.existsSync(path.join(OUT, rel));
const domainOf = (w) => fold(w).replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').trim();
// Lien « site web » : uniquement http(s) vers un nom de domaine valide ; toute autre valeur ne produit pas de lien
const webUrl = (w) => {
  const v = String(w || '').trim().replace(/^\/+/, '');
  const u = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const x = new URL(u);
    return /^https?:$/.test(x.protocol) && /^([a-z0-9-]+\.)+[a-z]{2,}$/i.test(x.hostname) && !x.username && !x.password ? x.href : '';
  } catch { return ''; }
};
const telUrl = (p) => 'tel:' + p.replace(/[^+\d]/g, '').replace(/^00/, '+');
const initials = (name) => fold(name).replace(/[^a-z0-9]+/g, ' ').replace(/\b(sa|ag|sarl|gmbh|ltd|inc|the|la|le|les|l|d|de|du|des|et|en|un|une|a|au|aux|der|die|das|und|im|il)\b/g, ' ').trim().split(/\s+/).filter((w) => /^[a-z0-9]/.test(w)).slice(0, 2).reduce((acc, w, _, all) => acc + (all.length === 1 ? w.slice(0, 2) : w[0]).toUpperCase(), '') || '•';
// PDF publics hébergés sur swissknowhow.ch (data/sources.json) : prioritaires sur Google Drive
const SOURCES = fs.existsSync(path.join(DATA, 'sources.json')) ? JSON.parse(fs.readFileSync(path.join(DATA, 'sources.json'), 'utf8')) : {};
// PDF hébergés avec le site (docs/wp-content/uploads/…, mêmes chemins que l'ancien WordPress) :
// liens relatifs, valables sur github.io comme sur swissknowhow.ch. Repli : URL d'origine sur swissknowhow.ch.
const pdfLinks = (m) => {
  const src = SOURCES[m.slug];
  if (src?.pdf) {
    const name = decodeURIComponent(src.pdf.split('/').pop());
    const rel = src.pdf.includes('/wp-content/uploads/') ? 'wp-content/uploads/' + src.pdf.split('/wp-content/uploads/')[1] : '';
    if (rel && exists(rel)) {
      const sizeMB = Math.round(fs.statSync(path.join(OUT, rel)).size / 1e5) / 10;
      const url = PH_ROOT + rel;
      return { download: url, read: url, name, sizeMB };
    }
    const f = m.files.find((x) => x.name === name);
    return { download: src.pdf, read: src.pdf, name, sizeMB: Number(f?.sizeMB) || '' };
  }
  // Pas de PDF public pour ce numéro (les fichiers Google Drive sont privés) : pas de bouton
  return null;
};
const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;

// ---------- chargement ----------
const magFiles = fs.existsSync(path.join(DATA, 'magazines'))
  ? fs.readdirSync(path.join(DATA, 'magazines')).filter((f) => f.endsWith('.json'))
  : [];
// Texte intégral des interviews : data/texts/<magazine>.json → { "<slug article>": { lang, pages, blocks: [{t, x}] } }
const TEXTS = {};
if (fs.existsSync(path.join(DATA, 'texts'))) {
  for (const f of fs.readdirSync(path.join(DATA, 'texts')).filter((x) => x.endsWith('.json'))) {
    try { TEXTS[f.replace(/\.json$/, '')] = JSON.parse(fs.readFileSync(path.join(DATA, 'texts', f), 'utf8')); } catch (e) { console.warn('Texte invalide', f, e.message); }
  }
}
const images = fs.existsSync(path.join(DATA, 'images.json')) ? JSON.parse(fs.readFileSync(path.join(DATA, 'images.json'), 'utf8')) : { articles: {}, companies: {} };

const magazines = [];
const articles = [];
const companyMap = new Map(); // slug -> merged company
const domainIndex = new Map(); // domaine web -> slug canonique

for (const f of magFiles) {
  let m;
  try { m = JSON.parse(fs.readFileSync(path.join(DATA, 'magazines', f), 'utf8')); } catch (e) { console.warn('JSON invalide', f, e.message); continue; }
  // Identifiants assainis : ils servent dans les chemins et les URL
  m.slug = slugify(m.slug || f.replace(/\.json$/, ''));
  m.year = Number.parseInt(m.year, 10) || 0;
  m.articles ||= []; m.companies ||= []; m.files ||= []; m.themes ||= [];
  magazines.push(m);
}
magazines.sort((a, b) => (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title, 'fr'));

const validThemes = (t) => uniq((t || []).filter((x) => THEMES[x]));

// Fusion des entreprises : même slug ou même domaine web = même entreprise.
// Les magazines sont triés du plus récent au plus ancien : la première valeur non vide l'emporte.
const orgWords = (n) => fold(n).split(/\s[–-]\s/)[0].replace(/[^a-z0-9]+/g, ' ').replace(/\b(sa|ag|sarl|gmbh|ltd|cie|co|groupe|group|the|la|le|les|l|d|de|du|des|et|und|der|die|das|ville|stadt|commune|canton)\b/g, ' ').trim().split(/\s+/).filter(Boolean);
const sameOrg = (a, b) => {
  const x = orgWords(a), y = orgWords(b || '');
  return !!x.length && !!y.length && (x[0] === y[0] || x.join('').startsWith(y.join('')) || y.join('').startsWith(x.join('')));
};
const companyAlias = new Map(); // `${mag}:${slugLocal}` -> slug canonique
// Doublons connus (même organisation nommée différemment selon les numéros)
const ALIASES = fs.existsSync(path.join(DATA, 'aliases.json')) ? JSON.parse(fs.readFileSync(path.join(DATA, 'aliases.json'), 'utf8')) : {};
for (const m of magazines) {
  for (const c of m.companies) {
    if (!c.name) continue;
    let key = slugify(c.slug || c.name);
    key = ALIASES[key] || key;
    const dom = c.website ? domainOf(c.website) : '';
    // Même site web = même entreprise, sauf domaines partagés par plusieurs services (vd.ch, bern.ch…)
    if (dom && domainIndex.has(dom) && sameOrg(c.name, companyMap.get(domainIndex.get(dom))?.name)) key = domainIndex.get(dom);
    companyAlias.set(`${m.slug}:${c.slug || slugify(c.name)}`, key);
    let t = companyMap.get(key);
    if (!t) {
      t = { slug: key, name: c.name, sector: '', description: '', address: '', postalCode: '', city: '', canton: '', country: '', phone: '', email: '', website: '', contacts: [], themes: [], appearances: [], advertiserOnly: true };
      companyMap.set(key, t);
    }
    if (dom && !domainIndex.has(dom)) domainIndex.set(dom, key);
    for (const k of ['sector', 'address', 'postalCode', 'city', 'canton', 'country', 'phone', 'email', 'website', 'notice']) if (!t[k] && c[k]) t[k] = String(c[k]).trim();
    if ((c.description || '').length > (t.description || '').length * 1.4 || !t.description) t.description = c.description || t.description;
    t.themes = uniq([...t.themes, ...validThemes(c.themes)]);
    for (const p of c.contacts || []) if (p?.name && !t.contacts.some((x) => fold(x.name) === fold(p.name))) t.contacts.push(p);
    t.advertiserOnly = t.advertiserOnly && !!c.advertiserOnly;
    t.appearances.push({ magazine: m.slug, page: c.page || '', articles: [] });
    const img = images.companies?.[`${m.slug}:${c.slug}`];
    if (img?.length) t.images = uniq([...(t.images || []), ...img]);
  }
}
const resolveCompany = (mag, s) => companyAlias.get(`${mag}:${s}`) || (companyMap.has(slugify(s)) ? slugify(s) : null);

const articleSlugs = new Set();
for (const m of magazines) {
  m.articleSlugs = [];
  for (const a of m.articles) {
    if (!a.title) continue;
    let s = slugify(a.slug || `${m.slug}-${a.title}`).slice(0, 90);
    while (articleSlugs.has(s)) s += '-2';
    articleSlugs.add(s);
    const art = { ...a, slug: s, magazine: m.slug, themes: validThemes(a.themes).length ? validThemes(a.themes) : validThemes(m.themes).slice(0, 1) };
    const body = TEXTS[m.slug]?.[a.slug];
    if (body?.blocks?.length) art.body = body;
    art.companies = uniq((a.companies || []).map((x) => resolveCompany(m.slug, x)));
    art.images = images.articles?.[`${m.slug}:${a.slug}`] || [];
    for (const cs of art.companies) {
      const c = companyMap.get(cs);
      const ap = c.appearances.find((x) => x.magazine === m.slug);
      if (ap) ap.articles.push(s); else c.appearances.push({ magazine: m.slug, page: a.page || '', articles: [s] });
      c.advertiserOnly = false;
      if (!c.images?.length && art.images.length) c.images = art.images.slice(0, 2);
      c.themes = uniq([...c.themes, ...art.themes]);
    }
    articles.push(art);
    m.articleSlugs.push(s);
  }
}
const companies = [...companyMap.values()].sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
for (const c of companies) {
  if (!c.themes.length) c.themes = validThemes(magazines.find((m) => m.slug === c.appearances[0]?.magazine)?.themes).slice(0, 1);
  if (c.canton) c.canton = c.canton.toUpperCase().slice(0, 2);
}
const magBySlug = Object.fromEntries(magazines.map((m) => [m.slug, m]));
const artBySlug = Object.fromEntries(articles.map((a) => [a.slug, a]));
for (const m of magazines) {
  m.cover = exists(`assets/covers/${m.slug}.webp`) ? `assets/covers/${m.slug}.webp` : '';
  m.companySlugs = companies.filter((c) => c.appearances.some((x) => x.magazine === m.slug)).map((c) => c.slug);
}

// ---------- gabarits ----------
const themeIcon = (id, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${THEMES[id]?.icon || ''}</svg>`;
const ICONS = {
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  download: '<path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M4 19h16"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5zM4 21.5V4.5M8 7h8"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  map: '<path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
};
const icon = (n, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[n]}</svg>`;

const NAV = [
  ['', 'Accueil'],
  ['entreprises/', 'Annuaire'],
  ['articles/', 'Articles'],
  ['themes/', 'Thèmes'],
  ['magazines/', 'Magazines PDF'],
  ['contact/', 'Contact'],
];

function layout({ depth, root, noindex = false, title, description = '', active = '', body, jsonld = '', image = '' }) {
  const r = root ?? '../'.repeat(depth);
  // Titre ≤ 70 caractères quand c'est possible : la marque n'est ajoutée que si elle tient (Google tronque au-delà).
  const fullTitle = title ? (`${title} · ${SITE_NAME}`.length <= 70 ? `${title} · ${SITE_NAME}` : title) : `${SITE_NAME} — L'annuaire du savoir-faire suisse`;
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(metaDesc(description))}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(metaDesc(description))}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:locale" content="fr_CH">
<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">
${image ? `<meta property="og:image" content="${esc(`${SITE_URL}/${image}`)}">` : ''}
${noindex ? '<meta name="robots" content="noindex">' : '<!--CANONICAL-->'}
<meta name="theme-color" content="#FF0000">
<link rel="icon" href="${r}assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="${r}assets/fonts/inter-latin-567244.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${r}assets/css/style.css?v=${CSS_V}">
<link rel="stylesheet" href="${r}assets/css/themes.css?v=${THEMES_V}">
<script src="${r}assets/js/theme-init.js?v=${INIT_V}"></script>
${ANALYTICS.src ? `<script defer src="${ANALYTICS.src}" data-website-id="${ANALYTICS.websiteId}" data-domains="${ANALYTICS.domain}"></script>` : ''}
${jsonld ? `<script type="application/ld+json">${jsonld}</script>` : ''}
</head>
<body data-root="${r}">
<a class="skip" href="#main">Aller au contenu</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="${r}" aria-label="${SITE_NAME} — accueil">
      <span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#FF0000"/><path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z" fill="#fff"/></svg></span>
      <span class="brand-text">Swiss <b>Knowhow</b></span>
    </a>
    <nav class="main-nav" aria-label="Navigation principale">
      ${NAV.map(([href, label]) => `<a href="${r}${href}"${active === href ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
    </nav>
    <div class="header-actions">
      <button class="search-trigger" type="button" data-search-open aria-label="Rechercher">${icon('search')}<span>Rechercher…</span><kbd>Ctrl K</kbd></button>
      <button class="icon-btn" type="button" data-theme-toggle aria-label="Basculer le thème clair/sombre">${icon('moon')}</button>
      <button class="icon-btn menu-btn" type="button" data-menu aria-label="Menu" aria-expanded="false">${icon('menu')}</button>
    </div>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div>
      <a class="brand" href="${r}"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#FF0000"/><path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z" fill="#fff"/></svg></span><span class="brand-text">Swiss <b>Knowhow</b></span></a>
      <p>Le magazine du savoir-faire suisse : entreprises, institutions et acteurs de l'économie, de l'horlogerie, de la santé et des grands travaux.</p>
    </div>
    <div>
      <h3>Explorer</h3>
      ${NAV.map(([href, label]) => `<a href="${r}${href}">${label}</a>`).join('')}
    </div>
    <div>
      <h3>Thèmes</h3>
      ${Object.entries(THEMES).slice(0, 6).map(([id, t]) => `<a href="${r}themes/${id}/">${esc(t.label)}</a>`).join('')}
    </div>
  </div>
  <div class="wrap footer-bottom">© ${new Date().getFullYear()} ${SITE_NAME} · Une marque de Com Consulting Sàrl, Faubourg du Lac 2, CH-2000 Neuchâtel · <a href="mailto:info@comconsulting.ch">info@comconsulting.ch</a> · <a href="${r}mentions-legales/">Mentions légales, IA &amp; confidentialité</a> · Sans cookie</div>
</footer>
<div class="search-overlay" data-search-overlay hidden>
  <div class="search-panel" role="dialog" aria-modal="true" aria-label="Recherche">
    <div class="search-field">${icon('search')}<input type="search" placeholder="Entreprise, personne, ville, thème, article…" autocomplete="off" data-search-input aria-label="Rechercher"><button type="button" class="icon-btn" data-search-close aria-label="Fermer">${icon('close')}</button></div>
    <div class="search-results" data-search-results></div>
  </div>
</div>
<script src="${r}assets/js/app.js?v=${JS_V}" defer></script>
</body>
</html>`;
}

const themeChip = (id, r) => THEMES[id] ? `<a class="chip ${thc(id)}" href="${r}themes/${id}/">${themeIcon(id)}${esc(THEMES[id].label)}</a>` : '';
// Visuels de thème (photos générées par IA) : docs/assets/themes/<id>.webp
const themePhoto = (id) => (id && exists(`assets/themes/${id}.webp`) ? `assets/themes/${id}.webp` : '');
let PH_ROOT = '';
// Couleur d'un thème via une classe (th-<id>) définie dans assets/css/themes.css : aucun style inline (CSP stricte)
const thc = (id) => (THEMES[id] ? `th-${id}` : 'th-none');
// Images générées par IA (assets/themes/) : toujours signalées (AI Act, art. 50)
const AI_IMG = "Image d'illustration générée par IA";
const placeholder = (name, themeId, cls = '') => {
  const photo = themePhoto(themeId);
  return `<div class="ph ${thc(themeId)} ${photo ? 'ph-photo ' : ''}${cls}">${photo ? `<img src="${PH_ROOT}${photo}" alt="${AI_IMG}" loading="lazy" decoding="async"><span class="ai-badge">Image IA</span>` : ''}<span class="ph-mono" aria-hidden="true">${esc(initials(name))}</span>${themeId && !photo ? themeIcon(themeId, 'ph-ico') : ''}</div>`;
};
const img = (src, alt, r, cls = '') => `<img class="${cls}" src="${r}${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async">`;
const location = (c) => [c.postalCode && c.city ? `${c.postalCode} ${c.city}` : c.city, c.canton && CANTONS[c.canton] ? CANTONS[c.canton] : (c.country && c.country !== 'Suisse' ? c.country : '')].filter(Boolean).join(' · ');

function magCover(m, r, cls = '') {
  if (m.cover) return `<div class="cover ${cls}">${img(m.cover, `Couverture — ${m.title}`, r)}</div>`;
  return `<div class="cover cover-gen ${THEMES[m.themes?.[0]] ? thc(m.themes[0]) : 'th-red'} ${cls}" aria-hidden="true"><span class="cg-brand">SWISS<br>KNOWHOW</span><span class="cg-title">${esc(m.series || m.title)}</span><span class="cg-year">${m.year || ''}</span>${m.themes?.[0] ? themeIcon(m.themes[0], 'cg-ico') : ''}</div>`;
}

function companyCard(c, r) {
  const th = c.themes[0];
  const media = c.images?.length ? img(c.images[0], c.name, r, 'card-img') : placeholder(c.name, th, 'card-img');
  return `<a class="card company-card" href="${r}entreprises/${c.slug}/" data-name="${esc(fold(c.name))}" data-themes="${esc(c.themes.join(' '))}" data-canton="${esc(c.canton)}" data-letter="${esc((fold(c.name).match(/[a-z]/) || ['#'])[0])}" data-q="${esc(fold([c.name, c.sector, c.city, c.canton, CANTONS[c.canton] || '', c.contacts.map((p) => p.name).join(' ')].join(' ')))}">
  <div class="card-media">${media}</div>
  <div class="card-body">
    <h3>${esc(c.name)}</h3>
    ${c.sector ? `<p class="muted">${esc(c.sector)}</p>` : ''}
    ${location(c) ? `<p class="meta">${icon('pin', 'ico sm')}${esc(location(c))}</p>` : ''}
    <div class="card-tags">${c.themes.slice(0, 2).map((id) => `<span class="tag ${thc(id)}">${esc(THEMES[id].label.split(/[ ,&]/)[0])}</span>`).join('')}${c.advertiserOnly ? '<span class="tag tag-muted">Annonceur</span>' : ''}</div>
  </div>
</a>`;
}

function articleCard(a, r, { showMag = true } = {}) {
  const m = magBySlug[a.magazine];
  const th = a.themes[0];
  const media = a.images?.length ? img(a.images[0], a.title, r, 'card-img') : placeholder(a.title, th, 'card-img');
  return `<a class="card article-card" href="${r}articles/${a.slug}/" data-themes="${esc(a.themes.join(' '))}" data-type="${esc(a.type || '')}" data-mag="${esc(a.magazine)}" data-q="${esc(fold([a.title, a.subtitle, a.region, (a.people || []).map((p) => p.name).join(' '), m?.title].join(' ')))}">
  <div class="card-media">${media}${a.type && TYPES[a.type] ? `<span class="badge">${TYPES[a.type]}${a.body ? ' · texte intégral' : ''}</span>` : ''}</div>
  <div class="card-body">
    <h3>${esc(a.title)}</h3>
    ${a.subtitle ? `<p class="muted clamp2">${esc(a.subtitle)}</p>` : ''}
    ${showMag && m ? `<p class="meta">${icon('book', 'ico sm')}${esc(m.series || m.title)} ${m.year || ''}${a.page ? ` · p. ${esc(a.page)}` : ''}</p>` : ''}
  </div>
</a>`;
}

function magCard(m, r) {
  const f = pdfLinks(m);
  return `<article class="mag-card" data-series="${esc(m.series || '')}" data-q="${esc(fold([m.title, m.series, m.region, m.year].join(' ')))}">
  <a href="${r}magazines/${m.slug}/" class="mag-cover-link">${magCover(m, r)}</a>
  <div class="mag-body">
    <p class="eyebrow">${esc(m.series || '')}${m.year ? ` · ${m.year}` : ''}</p>
    <h3><a href="${r}magazines/${m.slug}/">${esc(m.title)}</a></h3>
    <p class="meta">${plural(m.articleSlugs.length, 'article', 'articles')} · ${plural(m.companySlugs.length, 'entreprise', 'entreprises')}</p>
    <div class="mag-actions">
      ${f ? `<a class="btn btn-primary btn-sm" href="${esc(f.download)}" download target="_blank" rel="noopener">${icon('download', 'ico sm')}PDF${f.sizeMB ? ` · ${f.sizeMB} Mo` : ''}</a>
      <a class="btn btn-ghost btn-sm" href="${esc(f.read)}" target="_blank" rel="noopener">${icon('eye', 'ico sm')}Lire</a>` : ''}
    </div>
  </div>
</article>`;
}

const sectionHead = (title, link, r, linkLabel = 'Tout voir') => `<div class="section-head"><h2>${title}</h2>${link ? `<a class="link-arrow" href="${r}${link}">${linkLabel}${icon('arrow', 'ico sm')}</a>` : ''}</div>`;
const crumbs = (items, r) => `<nav class="crumbs" aria-label="Fil d'Ariane"><a href="${r}">Accueil</a>${items.map(([href, label]) => href ? `<a href="${r}${href}">${esc(label)}</a>` : `<span aria-current="page">${esc(label)}</span>`).join('')}</nav>`;

// ---------- pages ----------
function pageHome() {
  const r = ''; PH_ROOT = r;
  const withImg = articles.filter((a) => a.images?.length && a.type !== 'annonce');
  // Une : un article par thème, en privilégiant ceux qui ont une vraie photo
  const pool = [...withImg, ...articles.filter((a) => !a.images?.length && a.type !== 'annonce' && a.summary)];
  const featured = [];
  for (const a of pool) {
    if (featured.length >= 6) break;
    if (!featured.some((f) => f.themes[0] === a.themes[0] || f.magazine === a.magazine)) featured.push(a);
  }
  for (const a of pool) if (featured.length < 6 && !featured.includes(a)) featured.push(a);
  const featCompanies = companies.filter((c) => c.images?.length && !c.advertiserOnly).slice(0, 8);
  const heroImgs = uniq([exists('assets/themes/hero.webp') ? 'assets/themes/hero.webp' : '', ...Object.keys(THEMES).map(themePhoto), ...withImg.flatMap((a) => a.images.slice(0, 1))]).slice(0, 5);
  const themeCounts = Object.keys(THEMES).map((id) => [id, companies.filter((c) => c.themes.includes(id)).length, articles.filter((a) => a.themes.includes(id)).length]);
  const body = `
<section class="hero">
  <div class="hero-bg" aria-hidden="true">${heroImgs.map((s, i) => `<img src="${esc(s)}" alt="" class="hero-i${i}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}>`).join('')}</div>
  ${heroImgs.some((s) => s.startsWith('assets/themes/')) ? `<p class="hero-ai-note">${heroImgs.every((s) => s.startsWith('assets/themes/')) ? "Images d'illustration générées par IA" : "Certaines images d'illustration sont générées par IA"}</p>` : ''}
  <div class="wrap hero-inner">
    <p class="eyebrow light">Le magazine du savoir-faire suisse</p>
    <h1>L'annuaire des entreprises<br>qui font la Suisse.</h1>
    <p class="lead">${plural(companies.length, 'entreprise', 'entreprises')}, ${plural(articles.length, 'article', 'articles')} et ${plural(magazines.length, 'magazine', 'magazines')} : horlogerie, industrie, santé, grands travaux, collectivités.</p>
    <form class="hero-search" action="${r}recherche/" role="search">
      ${icon('search')}
      <input type="search" name="q" placeholder="Rechercher une entreprise, une ville, une personne…" aria-label="Rechercher" data-hero-search autocomplete="off">
      <button class="btn btn-primary" type="submit">Rechercher</button>
    </form>
    <div class="hero-quick">${['horlogerie', 'sante', 'construction', 'collectivites', 'energie'].map((id) => `<a href="${r}themes/${id}/">${esc(THEMES[id].label.split(' &')[0])}</a>`).join('')}</div>
  </div>
</section>
<section class="wrap stats">
  <div><b>${companies.length}</b><span>entreprises & institutions</span></div>
  <div><b>${articles.length}</b><span>articles & interviews</span></div>
  <div><b>${magazines.length}</b><span>magazines à télécharger</span></div>
  <div><b>${uniq(companies.map((c) => c.canton)).length}</b><span>cantons représentés</span></div>
</section>
<section class="wrap section">
  ${sectionHead('Explorer par thème', 'themes/', r)}
  <div class="theme-grid">
    ${themeCounts.filter(([, c, a]) => c + a > 0).map(([id, c, a]) => `<a class="theme-card ${thc(id)}${themePhoto(id) ? ' has-photo' : ''}" href="${r}themes/${id}/">${themePhoto(id) ? `<img class="tc-img" src="${r}${themePhoto(id)}" alt="${AI_IMG}" loading="lazy"><span class="ai-badge">Image IA</span>` : ''}${themeIcon(id, 'theme-ico')}<h3>${esc(THEMES[id].label)}</h3><p>${plural(c, 'entreprise', 'entreprises')} · ${plural(a, 'article', 'articles')}</p></a>`).join('')}
  </div>
</section>
<section class="section band">
  <div class="wrap">
    ${sectionHead('Derniers magazines', 'magazines/', r, 'Tous les PDF')}
    <div class="mag-rail">${magazines.slice(0, 8).map((m) => magCard(m, r)).join('')}</div>
  </div>
</section>
<section class="wrap section">
  ${sectionHead('À la une', 'articles/', r, 'Tous les articles')}
  <div class="grid grid-3">${featured.map((a) => articleCard(a, r)).join('')}</div>
</section>
${featCompanies.length ? `<section class="wrap section">
  ${sectionHead("Dans l'annuaire", 'entreprises/', r, "Tout l'annuaire")}
  <div class="grid grid-4">${featCompanies.map((c) => companyCard(c, r)).join('')}</div>
</section>` : ''}`;
  write('index.html', layout({ depth: 0, title: '', description: `Annuaire Swiss Knowhow : ${companies.length} entreprises, ${articles.length} articles et ${magazines.length} magazines PDF sur le savoir-faire suisse.`, active: '', body, image: heroImgs[0] }));
}

function filterBar({ withThemes = true, cantons = [], extra = '' }) {
  return `<div class="filters" data-filters>
  <div class="filter-search">${icon('search')}<input type="search" placeholder="Filtrer…" data-filter-q aria-label="Filtrer la liste"></div>
  ${withThemes ? `<select data-filter-theme aria-label="Thème"><option value="">Tous les thèmes</option>${Object.entries(THEMES).map(([id, t]) => `<option value="${id}">${esc(t.label)}</option>`).join('')}</select>` : ''}
  ${cantons.length ? `<select data-filter-canton aria-label="Canton"><option value="">Tous les cantons</option>${cantons.map((c) => `<option value="${c}">${esc(CANTONS[c] || c)}</option>`).join('')}</select>` : ''}
  ${extra}
  <span class="filter-count" data-filter-count></span>
</div>`;
}

function pageCompanies() {
  const r = '../'; PH_ROOT = r;
  const cantons = uniq(companies.map((c) => c.canton)).filter((c) => CANTONS[c]).sort((a, b) => CANTONS[a].localeCompare(CANTONS[b], 'fr'));
  const letters = uniq(companies.map((c) => (fold(c.name).match(/[a-z]/) || ['#'])[0])).sort();
  const body = `
<section class="page-head wrap">
  ${crumbs([[null, 'Annuaire']], r)}
  <h1>Annuaire des entreprises</h1>
  <p class="lead">${plural(companies.length, 'entreprise, institution ou organisation présentée', 'entreprises, institutions et organisations présentées')} dans les magazines Swiss Knowhow, avec leurs coordonnées.</p>
</section>
<section class="wrap">
  ${filterBar({ cantons, extra: `<label class="toggle"><input type="checkbox" data-filter-noads> Masquer les annonceurs seuls</label>` })}
  <div class="letters" data-letters>${['', ...letters].map((l) => `<button type="button" data-letter="${l}"${l ? '' : ' aria-pressed="true"'}>${l ? l.toUpperCase() : 'Tout'}</button>`).join('')}</div>
  <div class="grid grid-4" data-list>${companies.map((c) => companyCard(c, r)).join('')}</div>
  <p class="empty" data-empty hidden>Aucune entreprise ne correspond à ces critères.</p>
</section>`;
  write('entreprises/index.html', layout({ depth: 1, title: 'Annuaire des entreprises', description: `Annuaire de ${companies.length} entreprises suisses présentées dans Swiss Knowhow : coordonnées, secteurs, articles.`, active: 'entreprises/', body }));
}

function pageCompany(c) {
  const r = '../../'; PH_ROOT = r;
  const th = c.themes[0];
  const apps = c.appearances.map((ap) => ({ ...ap, m: magBySlug[ap.magazine] })).filter((x) => x.m);
  const arts = uniq(apps.flatMap((x) => x.articles)).map((s) => artBySlug[s]).filter(Boolean);
  const related = companies.filter((o) => o !== c && o.themes.some((t) => c.themes.includes(t)) && (o.canton && o.canton === c.canton)).slice(0, 4);
  const addr = [c.address, [c.postalCode, c.city].filter(Boolean).join(' ')].filter(Boolean);
  const mapQ = encodeURIComponent([c.name, ...addr, c.country || 'Suisse'].join(', '));
  const jsonld = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Organization', name: c.name, description: c.description || undefined,
    url: webUrl(c.website) || undefined, telephone: c.phone || undefined, email: c.email || undefined,
    address: addr.length ? { '@type': 'PostalAddress', streetAddress: c.address || undefined, postalCode: c.postalCode || undefined, addressLocality: c.city || undefined, addressRegion: c.canton || undefined, addressCountry: c.country || 'CH' } : undefined,
  }).replace(/[<>&]/g, (ch) => '\\u00' + ch.charCodeAt(0).toString(16));
  const gallery = (c.images || []).slice(0, 6);
  const body = `
<section class="detail-hero ${THEMES[th] ? thc(th) : 'th-red'}">
  <div class="wrap detail-hero-inner">
    <div class="detail-media">${gallery.length ? img(gallery[0], c.name, r, 'detail-img') : placeholder(c.name, th, 'detail-img')}</div>
    <div class="detail-text">
      ${crumbs([['entreprises/', 'Annuaire'], [null, c.name]], r)}
      <h1>${esc(c.name)}</h1>
      ${c.sector ? `<p class="lead">${esc(c.sector)}</p>` : ''}
      ${location(c) ? `<p class="meta">${icon('pin', 'ico sm')}${esc(location(c))}</p>` : ''}
      <div class="chips">${c.themes.map((id) => themeChip(id, r)).join('')}</div>
    </div>
  </div>
</section>
<div class="wrap detail-grid">
  <article class="detail-main">
    ${c.description ? `<section><h2>Présentation</h2><p class="prose">${esc(c.description)}</p><p class="ai-note">${icon('info', 'ico sm')}Texte rédigé avec l'aide de l'IA à partir de l'édition imprimée du magazine. <a href="${r}mentions-legales/#ia">En savoir plus</a></p></section>` : ''}
    ${gallery.length > 1 ? `<section><h2>Photos</h2><div class="gallery">${gallery.map((s) => `<a href="${r}${esc(s)}" data-lightbox>${img(s, c.name, r)}</a>`).join('')}</div></section>` : ''}
    ${arts.length ? `<section><h2>Articles</h2><div class="grid grid-2">${arts.map((a) => articleCard(a, r)).join('')}</div></section>` : ''}
    <section><h2>Parutions</h2><ul class="appear-list">${apps.map((x) => `<li><a href="${r}magazines/${x.m.slug}/">${magCover(x.m, r, 'xs')}<span><b>${esc(x.m.title)}</b><span class="muted">${x.m.year || ''}${x.page ? ` · page ${esc(x.page)}` : ''}</span></span></a>${pdfLinks(x.m) ? `<a class="btn btn-ghost btn-sm" href="${esc(pdfLinks(x.m).read)}" target="_blank" rel="noopener">${icon('eye', 'ico sm')}PDF</a>` : ''}</li>`).join('')}</ul></section>
  </article>
  <aside class="detail-side">
    <div class="contact-card">
      <h2>Coordonnées</h2>
      ${c.notice ? `<p class="co-notice">${icon('info', 'ico sm')}<span>${esc(c.notice)}</span></p>` : ''}
      ${addr.length ? `<p class="ci">${icon('pin')}<span>${addr.map(esc).join('<br>')}${c.country && c.country !== 'Suisse' ? `<br>${esc(c.country)}` : ''}</span></p>` : ''}
      ${c.phone ? `<p class="ci">${icon('phone')}<a href="${telUrl(c.phone)}">${esc(c.phone)}</a></p>` : ''}
      ${c.email ? `<p class="ci">${icon('mail')}${/^[^\s@<>"']+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(c.email) ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : `<span>${esc(c.email)}</span>`}</p>` : ''}
      ${c.website ? `<p class="ci">${icon('web')}${webUrl(c.website) ? `<a href="${esc(webUrl(c.website))}" target="_blank" rel="noopener">${esc(c.website.replace(/^https?:\/\//, ''))}</a>` : `<span>${esc(c.website)}</span>`}</p>` : ''}
      ${!addr.length && !c.phone && !c.email && !c.website ? '<p class="muted">Coordonnées non communiquées dans le magazine.</p>' : ''}
      ${addr.length ? `<a class="btn btn-ghost btn-block" href="https://www.google.com/maps/search/?api=1&query=${mapQ}" target="_blank" rel="noopener">${icon('map', 'ico sm')}Voir sur la carte</a>` : ''}
      ${webUrl(c.website) ? `<a class="btn btn-primary btn-block" href="${esc(webUrl(c.website))}" target="_blank" rel="noopener">${icon('web', 'ico sm')}Site web</a>` : ''}
      <a class="report-link" href="${reportMail(`Fiche ${c.name}`, `entreprises/${c.slug}/`)}">${icon('mail', 'ico sm')}Signaler une erreur ou demander une modification</a>
    </div>
    ${c.contacts.length ? `<div class="contact-card"><h2>Interlocuteurs</h2>${c.contacts.map((p) => `<p class="ci">${icon('user')}<span><b>${esc(p.name)}</b>${p.role ? `<br><span class="muted">${esc(p.role)}</span>` : ''}</span></p>`).join('')}</div>` : ''}
  </aside>
</div>
${related.length ? `<section class="wrap section">${sectionHead('Dans le même secteur et la même région', '', r)}<div class="grid grid-4">${related.map((o) => companyCard(o, r)).join('')}</div></section>` : ''}`;
  write(`entreprises/${c.slug}/index.html`, layout({ depth: 2, title: [c.name, [c.sector, c.city].filter(Boolean).join(', ')].filter(Boolean).join(' – ').slice(0, 70), description: c.description || `${c.name}${c.sector ? ' — ' + c.sector : ''}${c.city ? ', ' + c.city : ''}`, active: 'entreprises/', body, jsonld, image: gallery[0] }));
}

function pageArticles() {
  const r = '../'; PH_ROOT = r;
  const list = articles.filter((a) => a.type !== 'annonce');
  const typeSel = `<select data-filter-type aria-label="Type"><option value="">Tous les types</option>${Object.entries(TYPES).filter(([k]) => k !== 'annonce').map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select>`;
  const magSel = `<select data-filter-mag aria-label="Magazine"><option value="">Tous les magazines</option>${magazines.map((m) => `<option value="${m.slug}">${esc(m.title)}</option>`).join('')}</select>`;
  const body = `
<section class="page-head wrap">
  ${crumbs([[null, 'Articles']], r)}
  <h1>Articles & interviews</h1>
  <p class="lead">${plural(list.length, 'article', 'articles')} issus des magazines : interviews de dirigeants et d'élus, publireportages, dossiers thématiques.</p>
</section>
<section class="wrap">
  ${filterBar({ extra: typeSel + magSel })}
  <div class="grid grid-3" data-list>${list.map((a) => articleCard(a, r)).join('')}</div>
  <p class="empty" data-empty hidden>Aucun article ne correspond à ces critères.</p>
</section>`;
  write('articles/index.html', layout({ depth: 1, title: 'Articles & interviews', description: `${list.length} articles, interviews et publireportages Swiss Knowhow sur les entreprises suisses, à filtrer par thème, type et magazine.`, active: 'articles/', body }));
}

let articleTitleCount = null; // slug → titre de page désambiguïsé
function pageArticle(a) {
  const r = '../../'; PH_ROOT = r;
  if (!articleTitleCount) {
    // Titres d'articles identiques d'une édition à l'autre : on ajoute l'édition, ou seulement l'année si cela suffit à les distinguer et évite de dépasser 70 caractères.
    articleTitleCount = new Map();
    const groups = new Map();
    for (const o of articles) { if (!groups.has(o.title)) groups.set(o.title, []); groups.get(o.title).push(o); }
    for (const [t, os] of groups) {
      if (os.length < 2) continue;
      const years = os.map((o) => magBySlug[o.magazine]?.year);
      const yearsUnique = years.every(Boolean) && new Set(years).size === years.length;
      for (const o of os) {
        const om = magBySlug[o.magazine];
        if (!om) continue;
        const full = `${t} (${om.series || om.title}${om.year ? ' ' + om.year : ''})`;
        articleTitleCount.set(o.slug, full.length > 70 && yearsUnique ? `${t} (${om.year})` : full);
      }
    }
  }
  const m = magBySlug[a.magazine];
  const th = a.themes[0];
  const cos = a.companies.map((s) => companyMap.get(s)).filter(Boolean);
  const same = articles.filter((o) => o !== a && o.type !== 'annonce' && o.themes.some((t) => a.themes.includes(t))).slice(0, 3);
  const f = m ? pdfLinks(m) : null;
  const body = `
<article>
<header class="article-head wrap narrow">
  ${crumbs([['articles/', 'Articles'], [null, a.title]], r)}
  <p class="eyebrow">${a.type && TYPES[a.type] ? TYPES[a.type] : 'Article'}${a.region ? ` · ${esc(a.region)}` : ''}</p>
  <h1>${esc(a.title)}</h1>
  ${a.subtitle ? `<p class="lead">${esc(a.subtitle)}</p>` : ''}
  <div class="chips">${a.themes.map((id) => themeChip(id, r)).join('')}</div>
</header>
<div class="wrap article-media">${a.images?.length ? img(a.images[0], a.title, r, 'article-img') : placeholder(a.title, th, 'article-img')}</div>
<div class="wrap narrow article-body">
  ${a.body ? `<div class="summary-box"><p class="eyebrow">En bref</p><p>${esc(a.summary || '')}</p><p class="ai-note">${icon('info', 'ico sm')}Texte rédigé avec l'aide de l'IA à partir de l'édition imprimée du magazine. <a href="${r}mentions-legales/#ia">En savoir plus</a></p></div>` : `<p class="prose">${esc(a.summary || '')}</p><p class="ai-note">${icon('info', 'ico sm')}Texte rédigé avec l'aide de l'IA à partir de l'édition imprimée du magazine. <a href="${r}mentions-legales/#ia">En savoir plus</a></p>`}
  ${a.quote ? `<blockquote>« ${esc(a.quote.replace(/^[«"“\s]+|[»"”\s]+$/g, ''))} »${a.people?.[0] ? `<cite>— ${esc(a.people[0].name)}</cite>` : ''}</blockquote>` : ''}
  ${a.body ? `<section class="full-text" lang="${esc(a.body.lang || a.language || 'fr')}">
    <h2>${a.type === 'interview' ? 'L\'interview intégrale' : 'Texte intégral'}</h2>
    ${a.body.blocks.map((b) => b.t === 'q' ? `<p class="ft-q">${esc(b.x)}</p>` : b.t === 'h' ? `<h3>${esc(b.x)}</h3>` : `<p>${esc(b.x)}</p>`).join('\n    ')}
    ${a.body.note ? `<p class="ft-note">${esc(a.body.note)}</p>` : ''}
    <p class="ft-source">Texte paru dans ${esc(m?.title || '')}${a.body.pages ? `, ${esc(a.body.pages)}` : (a.page ? `, p. ${esc(a.page)}` : '')}. Retranscrit de l'édition imprimée avec une assistance informatique (IA), sans réécriture ; en cas d'écart, la version imprimée fait foi.</p>
  </section>` : ''}
  ${a.images?.length > 1 ? `<div class="gallery">${a.images.slice(1, 7).map((s) => `<a href="${r}${esc(s)}" data-lightbox>${img(s, a.title, r)}</a>`).join('')}</div>` : ''}
  ${a.people?.length ? `<h2>Personnes citées</h2><ul class="people">${a.people.map((p) => `<li>${icon('user')}<span><b>${esc(p.name)}</b>${p.role ? `<span class="muted">${esc(p.role)}</span>` : ''}</span></li>`).join('')}</ul>` : ''}
  ${m ? `<div class="source-box">
    <a href="${r}magazines/${m.slug}/">${magCover(m, r, 'sm')}</a>
    <div><p class="eyebrow">Paru dans</p><h3><a href="${r}magazines/${m.slug}/">${esc(m.title)}</a></h3><p class="muted">${m.year || ''}${a.page ? ` · page ${esc(a.page)}` : ''}${a.language ? ` · article original en ${({ fr: 'français', de: 'allemand', it: 'italien', en: 'anglais' })[a.language] || esc(a.language)}` : ''}</p>
    <a class="report-link" href="${reportMail(`Article ${a.title}`, `articles/${a.slug}/`)}">${icon('mail', 'ico sm')}Signaler une erreur</a>
    ${f ? `<a class="btn btn-primary btn-sm" href="${esc(f.read)}" target="_blank" rel="noopener">${icon('book', 'ico sm')}Lire l'article complet</a> <a class="btn btn-ghost btn-sm" href="${esc(f.download)}" download target="_blank" rel="noopener">${icon('download', 'ico sm')}PDF</a>` : ''}</div>
  </div>` : ''}
</div>
</article>
${cos.length ? `<section class="wrap section">${sectionHead(cos.length > 1 ? 'Entreprises citées' : 'Entreprise citée', '', r)}<div class="grid grid-4">${cos.map((c) => companyCard(c, r)).join('')}</div></section>` : ''}
${same.length ? `<section class="wrap section">${sectionHead('Sur le même thème', `themes/${th}/`, r)}<div class="grid grid-3">${same.map((o) => articleCard(o, r)).join('')}</div></section>` : ''}`;
  const jsonld = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.summary, isPartOf: m ? { '@type': 'PublicationIssue', name: m.title, datePublished: m.year ? String(m.year) : undefined } : undefined }).replace(/[<>&]/g, (ch) => '\\u00' + ch.charCodeAt(0).toString(16));
  write(`articles/${a.slug}/index.html`, layout({ depth: 2, title: articleTitleCount.get(a.slug) || a.title, description: a.summary || a.subtitle || '', active: 'articles/', body, jsonld, image: a.images?.[0] }));
}

function pageThemes() {
  const r = '../'; PH_ROOT = r;
  const body = `
<section class="page-head wrap">
  ${crumbs([[null, 'Thèmes']], r)}
  <h1>Thèmes</h1>
  <p class="lead">Parcourez l'annuaire et les articles par secteur d'activité.</p>
</section>
<section class="wrap"><div class="theme-grid large">
${Object.entries(THEMES).map(([id, t]) => {
    const nc = companies.filter((c) => c.themes.includes(id)).length;
    const na = articles.filter((a) => a.themes.includes(id)).length;
    return `<a class="theme-card ${thc(id)}${themePhoto(id) ? ' has-photo' : ''}" href="${r}themes/${id}/">${themePhoto(id) ? `<img class="tc-img" src="${r}${themePhoto(id)}" alt="${AI_IMG}" loading="lazy"><span class="ai-badge">Image IA</span>` : ''}${themeIcon(id, 'theme-ico')}<h3>${esc(t.label)}</h3><p>${plural(nc, 'entreprise', 'entreprises')} · ${plural(na, 'article', 'articles')}</p></a>`;
  }).join('')}
</div></section>`;
  write('themes/index.html', layout({ depth: 1, title: 'Thèmes', description: 'Les thèmes de Swiss Knowhow : horlogerie, industrie, santé, construction, énergie, collectivités…', active: 'themes/', body }));
}

function pageTheme(id) {
  const r = '../../'; PH_ROOT = r;
  const t = THEMES[id];
  const cs = companies.filter((c) => c.themes.includes(id));
  const as = articles.filter((a) => a.themes.includes(id) && a.type !== 'annonce');
  const ms = magazines.filter((m) => m.themes.includes(id));
  const body = `
<section class="theme-hero ${thc(id)}${themePhoto(id) ? ' has-photo' : ''}">
  ${themePhoto(id) ? `<img class="th-bg" src="${r}${themePhoto(id)}" alt="${AI_IMG}" fetchpriority="high"><span class="ai-badge">Image IA</span>` : ''}
  <div class="wrap">
    ${crumbs([['themes/', 'Thèmes'], [null, t.label]], r)}
    <div class="theme-hero-row">${themeIcon(id, 'theme-ico xl')}<div><h1>${esc(t.label)}</h1><p class="lead">${plural(cs.length, 'entreprise', 'entreprises')} · ${plural(as.length, 'article', 'articles')} · ${plural(ms.length, 'magazine', 'magazines')}</p></div></div>
  </div>
</section>
${as.length ? `<section class="wrap section">${sectionHead('Articles', '', r)}<div class="grid grid-3">${as.map((a) => articleCard(a, r)).join('')}</div></section>` : ''}
${cs.length ? `<section class="wrap section">${sectionHead('Entreprises', '', r)}
  ${filterBar({ withThemes: false })}
  <div class="grid grid-4" data-list>${cs.map((c) => companyCard(c, r)).join('')}</div><p class="empty" data-empty hidden>Aucun résultat.</p></section>` : ''}
${ms.length ? `<section class="section band"><div class="wrap">${sectionHead('Magazines', 'magazines/', r, 'Tous les PDF')}<div class="mag-rail">${ms.map((m) => magCard(m, r)).join('')}</div></div></section>` : ''}`;
  write(`themes/${id}/index.html`, layout({ depth: 2, title: t.label, description: `${t.label} : ${cs.length} entreprises et ${as.length} articles dans l'annuaire Swiss Knowhow.`, active: 'themes/', body }));
}

function pageMagazines() {
  const r = '../'; PH_ROOT = r;
  const series = uniq(magazines.map((m) => m.series));
  const body = `
<section class="page-head wrap">
  ${crumbs([[null, 'Magazines PDF']], r)}
  <h1>Magazines à télécharger</h1>
  <p class="lead">Toutes les éditions de Swiss Knowhow en PDF intégral. Cliquez sur une couverture pour voir le sommaire, ou téléchargez directement.</p>
</section>
<section class="wrap">
  <div class="filters" data-filters>
    <div class="filter-search">${icon('search')}<input type="search" placeholder="Filtrer les magazines…" data-filter-q aria-label="Filtrer"></div>
    <div class="seg" data-filter-series role="group" aria-label="Collection"><button type="button" data-v="" aria-pressed="true">Toutes</button>${series.map((s) => `<button type="button" data-v="${esc(s)}">${esc(s)}</button>`).join('')}</div>
    <span class="filter-count" data-filter-count></span>
  </div>
  <div class="mag-grid" data-list>${magazines.map((m) => magCard(m, r)).join('')}</div>
  <p class="empty" data-empty hidden>Aucun magazine.</p>
</section>`;
  write('magazines/index.html', layout({ depth: 1, title: 'Magazines PDF', description: `Téléchargez les ${magazines.length} éditions PDF de Swiss Knowhow : horlogerie, économie régionale, collectivités, santé, énergie, grands travaux.`, active: 'magazines/', body }));
}

function pageMagazine(m) {
  const r = '../../'; PH_ROOT = r;
  const arts = m.articleSlugs.map((s) => artBySlug[s]).filter((a) => a && a.type !== 'annonce');
  const cos = m.companySlugs.map((s) => companyMap.get(s));
  const body = `
<section class="mag-hero">
  <div class="wrap mag-hero-inner">
    ${magCover(m, r, 'lg')}
    <div>
      ${crumbs([['magazines/', 'Magazines PDF'], [null, m.title]], r)}
      <p class="eyebrow">${esc(m.series || '')}${m.year ? ` · ${m.year}` : ''}${m.region ? ` · ${esc(m.region)}` : ''}</p>
      <h1>${esc(m.title)}</h1>
      ${m.description ? `<p class="lead">${esc(m.description)}</p>` : ''}
      <div class="chips">${m.themes.map((id) => themeChip(id, r)).join('')}</div>
      ${(() => { const f = pdfLinks(m); if (!f) return `<p class="muted">PDF intégral disponible sur demande : <a href="mailto:${PUBLISHER.email}">${PUBLISHER.email}</a></p>`; return f ? `<div class="file-list"><div class="file-row"><span>${icon('book')}<span><b>PDF intégral</b><span class="muted">${esc(f.name)}${f.sizeMB ? ` · ${f.sizeMB} Mo` : ''}</span></span></span><span class="file-actions"><a class="btn btn-primary btn-sm" href="${esc(f.download)}" download target="_blank" rel="noopener">${icon('download', 'ico sm')}Télécharger</a><a class="btn btn-ghost btn-sm" href="${esc(f.read)}" target="_blank" rel="noopener">${icon('eye', 'ico sm')}Lire en ligne</a></span></div></div>` : ''; })()}
    </div>
  </div>
</section>
${arts.length ? `<section class="wrap section">${sectionHead(`Sommaire · ${plural(arts.length, 'article', 'articles')}`, '', r)}<div class="grid grid-3">${arts.map((a) => articleCard(a, r, { showMag: false })).join('')}</div></section>` : ''}
${cos.length ? `<section class="wrap section">${sectionHead(`Entreprises de ce numéro · ${cos.length}`, '', r)}${filterBar({ withThemes: false })}<div class="grid grid-4" data-list>${cos.map((c) => companyCard(c, r)).join('')}</div><p class="empty" data-empty hidden>Aucun résultat.</p></section>` : ''}`;
  write(`magazines/${m.slug}/index.html`, layout({ depth: 2, title: m.title, description: m.description || m.title, active: 'magazines/', body, image: m.cover }));
}

function pageSearch() {
  const r = '../';
  const body = `
<section class="page-head wrap">
  ${crumbs([[null, 'Recherche']], r)}
  <h1>Recherche</h1>
  <form class="hero-search page-search" role="search" data-nosubmit>${icon('search')}<input type="search" name="q" placeholder="Entreprise, personne, ville, thème, article…" aria-label="Rechercher" data-page-search autofocus autocomplete="off"></form>
</section>
<section class="wrap"><div class="search-page-results" data-page-results></div></section>`;
  write('recherche/index.html', layout({ depth: 1, noindex: true, title: 'Recherche', description: 'Rechercher dans l’annuaire Swiss Knowhow.', active: '', body }));
}

const PUBLISHER = { name: 'Com Consulting Sàrl', address: 'Faubourg du Lac 2', city: 'CH-2000 Neuchâtel', phone: '+41 (0)32 967 95 83', email: 'info@comconsulting.ch' };

// Lien e-mail pré-rempli pour signaler une erreur sur une page
const reportMail = (what, rel) => esc(`mailto:${PUBLISHER.email}?subject=${encodeURIComponent(`Signalement – ${what}`.slice(0, 140))}&body=${encodeURIComponent(`Page : ${SITE_URL}/${rel}\n\nCorrection ou demande :\n`)}`);

function pageLegal() {
  const r = '../';
  PH_ROOT = r;
  const nAI = Object.keys(THEMES).filter(themePhoto).length + (exists('assets/themes/hero.webp') ? 1 : 0);
  const body = `
<section class="page-head wrap narrow">
  ${crumbs([[null, 'Mentions légales']], r)}
  <h1>Mentions légales, transparence IA &amp; confidentialité</h1>
  <p class="lead">Ce que vous devez savoir sur l'éditeur de ce site, sur l'usage de l'intelligence artificielle et sur vos données.</p>
</section>
<div class="wrap narrow legal">
  <section id="editeur"><h2>Éditeur et responsabilité éditoriale</h2>
    <p>${esc(SITE_NAME)} est une marque de <b>${esc(PUBLISHER.name)}</b>, ${esc(PUBLISHER.address)}, ${esc(PUBLISHER.city)}, Suisse — ${esc(PUBLISHER.phone)} — <a href="mailto:${PUBLISHER.email}">${PUBLISHER.email}</a>. ${esc(PUBLISHER.name)} assume la responsabilité éditoriale du contenu publié sur ce site.</p>
    <p>Le site reprend le contenu des éditions imprimées du magazine Swiss Knowhow (${magazines.length} numéros). Les coordonnées des entreprises sont celles publiées dans ces éditions ; elles peuvent avoir changé depuis.</p>
  </section>
  <section id="ia"><h2>Usage de l'intelligence artificielle</h2>
    <p>Conformément au principe de transparence (notamment l'article 50 du règlement européen sur l'IA), nous indiquons clairement les contenus produits avec l'aide de l'IA :</p>
    <ul>
      <li><b>Images d'illustration</b> : ${nAI} visuels (page d'accueil et pages thématiques) sont <b>générés par IA</b>. Ils portent la mention « Image IA » et sont marqués comme tels dans leurs métadonnées. Ils ne représentent pas des lieux, personnes ou événements réels précis. Toutes les autres photos proviennent des éditions imprimées du magazine.</li>
      <li><b>Résumés et présentations</b> : les résumés d'articles (« En bref ») et les textes de présentation des entreprises ont été <b>rédigés avec l'aide de l'IA</b> à partir des éditions imprimées. Ils portent une mention à cet effet.</li>
      <li><b>Interviews</b> : le texte intégral des interviews est celui paru dans le magazine, <b>retranscrit avec une assistance informatique</b> (extraction et remise en ordre du texte des PDF), sans réécriture. En cas d'écart, la version imprimée fait foi.</li>
      <li><b>Données de l'annuaire</b> : l'extraction des coordonnées, le classement par thème, la correction des coquilles et la sélection des photos ont été réalisés avec l'aide d'outils d'IA, puis contrôlés.</li>
    </ul>
    <p>Malgré ces contrôles, des erreurs peuvent subsister. Chaque fiche et chaque article proposent un lien « Signaler une erreur ».</p>
  </section>
  <section id="confidentialite"><h2>Protection des données</h2>
    <p><b>Visiteurs.</b> Ce site ne dépose <b>aucun cookie</b> et n'utilise <b>aucun outil de publicité ou de réseau social</b>. Les polices de caractères sont hébergées sur le site.</p>
    ${ANALYTICS.src ? `<p id="audience"><b>Mesure d'audience.</b> Pour connaître la fréquentation du site (pages consultées, provenance, type d'appareil, téléchargements de magazines et clics vers les sites des entreprises), nous utilisons <a href="https://umami.is/privacy" target="_blank" rel="noopener">Umami Cloud</a>, avec un stockage des statistiques dans l'Union européenne. Ce service <b>ne dépose aucun cookie</b>, ne stocke aucune donnée sur votre appareil, ne suit pas les visiteurs d'un site à l'autre et ne produit que des statistiques agrégées et anonymes. Vous pouvez bloquer ce comptage avec un bloqueur de contenu, sans conséquence sur l'usage du site.</p>` : `<p id="audience"><b>Mesure d'audience.</b> Aucune mesure d'audience n'est active sur ce site.</p>`}
    <p>Si vous utilisez le bouton « mode sombre », votre préférence est enregistrée uniquement dans votre navigateur (stockage local, clé <code>skh-theme</code>) ; vous pouvez l'effacer à tout moment depuis les réglages de votre navigateur.</p>
    <p><b>Hébergement.</b> Le site est hébergé par GitHub Pages (GitHub, Inc., États-Unis). Comme tout hébergeur, GitHub peut enregistrer des données techniques de connexion (adresse IP, navigateur) à des fins de sécurité et de fonctionnement, selon sa <a href="https://docs.github.com/fr/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener">déclaration de confidentialité</a>.</p>
    <p><b>Personnes et entreprises citées.</b> Les noms, fonctions et coordonnées professionnelles publiés proviennent des éditions imprimées du magazine. Toute personne concernée peut demander la <b>rectification</b> ou la <b>suppression</b> de ses données en écrivant à <a href="mailto:${PUBLISHER.email}">${PUBLISHER.email}</a> ; nous y donnons suite dans les meilleurs délais, conformément à la loi fédérale sur la protection des données (nLPD).</p>
  </section>
  <section id="droits"><h2>Propriété intellectuelle</h2>
    <p>Les textes, photos et magazines publiés sur ce site sont la propriété de ${esc(PUBLISHER.name)} ou de leurs auteurs respectifs. Toute reproduction nécessite une autorisation préalable.</p>
  </section>
</div>`;
  write('mentions-legales/index.html', layout({ depth: 1, title: 'Mentions légales, IA & confidentialité', description: `Éditeur, usage de l'intelligence artificielle et protection des données sur ${SITE_NAME}.`, active: '', body }));
}

function pageContact() {
  const r = '../';
  PH_ROOT = r;
  const body = `
<section class="page-head wrap">
  ${crumbs([[null, 'Contact']], r)}
  <h1>Contact & éditeur</h1>
  <p class="lead">Swiss Knowhow est une marque de la société d'édition ${PUBLISHER.name}, à Neuchâtel. Depuis une vingtaine d'années, ses magazines présentent les entreprises et les institutions qui incarnent la qualité et le savoir-faire suisses.</p>
</section>
<div class="wrap detail-grid">
  <article class="detail-main">
    <section><h2>Paraître dans Swiss Knowhow</h2><p class="prose">Entreprise, institution ou collectivité, vous souhaitez présenter votre savoir-faire dans une prochaine édition (horlogerie, santé, grands travaux, économie régionale) ou mettre à jour votre fiche dans l'annuaire ? Écrivez-nous en précisant le nom de votre organisation et la fiche concernée.</p>
    <p><a class="btn btn-primary" href="mailto:${PUBLISHER.email}?subject=${encodeURIComponent('Annuaire Swiss Knowhow')}">${icon('mail', 'ico sm')}Écrire à la rédaction</a></p></section>
    <section><h2>Nos collections</h2><div class="chips">${uniq(magazines.map((m) => m.series)).map((s) => `<a class="chip th-red" href="${r}magazines/">${esc(s)}</a>`).join('')}</div></section>
  </article>
  <aside class="detail-side">
    <div class="contact-card">
      <h2>${esc(PUBLISHER.name)}</h2>
      <p class="ci">${icon('pin')}<span>${esc(PUBLISHER.address)}<br>${esc(PUBLISHER.city)}<br>Suisse</span></p>
      <p class="ci">${icon('phone')}<a href="${telUrl(PUBLISHER.phone)}">${esc(PUBLISHER.phone)}</a></p>
      <p class="ci">${icon('mail')}<a href="mailto:${PUBLISHER.email}">${PUBLISHER.email}</a></p>
      <p class="ci">${icon('web')}<a href="${SITE_URL}" target="_blank" rel="noopener">swissknowhow.ch</a></p>
      <a class="btn btn-ghost btn-block" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(PUBLISHER.address + ', ' + PUBLISHER.city)}" target="_blank" rel="noopener">${icon('map', 'ico sm')}Voir sur la carte</a>
    </div>
  </aside>
</div>`;
  write('contact/index.html', layout({ depth: 1, title: 'Contact', description: `Contacter ${PUBLISHER.name}, éditeur du magazine Swiss Knowhow à Neuchâtel.`, active: 'contact/', body }));
}

// Anciennes adresses du site WordPress swissknowhow.ch → nouvelles pages (évite les liens morts après la bascule)
function pageRedirects() {
  const map = {
    'qui-sommes-nous': 'contact/', 'magazines-pro': 'magazines/', 'revue-regional': 'magazines/', 'accueil': '',
    'category/horlogerie': 'themes/horlogerie/', 'category/sante': 'themes/sante/', 'category/economie': 'themes/economie/',
    'category/region': 'magazines/', 'category/pro': 'magazines/', 'category/articles': 'articles/',
  };
  for (const [slug, src] of Object.entries(SOURCES)) {
    const m = /^https:\/\/swissknowhow\.ch\/([^/]+)\/$/.exec(src.page || '');
    if (m && magBySlug[slug]) map[m[1]] = `magazines/${slug}/`;
  }
  let n = 0;
  for (const [from, to] of Object.entries(map)) {
    if (exists(`${from}/index.html`)) continue; // ne jamais écraser une vraie page
    const r = '../'.repeat(from.split('/').length);
    write(`${from}/index.html`, `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Page déplacée · ${SITE_NAME}</title>
<meta name="robots" content="noindex"><link rel="canonical" href="${SITE_URL}/${to}">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta http-equiv="refresh" content="0; url=${r}${to}"></head>
<body><p>Cette page a été déplacée : <a href="${r}${to}">continuer</a>.</p></body></html>`);
    n++;
  }
  return n;
}

function page404() {
  const body = `<section class="page-head wrap"><h1>Page introuvable</h1><p class="lead">Cette page n'existe pas ou a été déplacée.</p><p><a class="btn btn-primary" href="${SITE_BASE}">Retour à l'accueil</a></p></section>`;
  write('404.html', layout({ depth: 0, root: SITE_BASE, noindex: true, title: 'Page introuvable', body }));
}

function searchIndex() {
  const idx = [];
  for (const c of companies) idx.push({ t: 'e', u: `entreprises/${c.slug}/`, n: c.name, d: [c.sector, location(c)].filter(Boolean).join(' · '), i: c.images?.[0] || '', th: c.themes[0] || '', k: [c.sector, c.city, c.canton, CANTONS[c.canton], c.contacts.map((p) => `${p.name} ${p.role || ''}`).join(' '), c.themes.map((t) => THEMES[t].label).join(' '), c.description].filter(Boolean).join(' ') });
  for (const a of articles) if (a.type !== 'annonce') idx.push({ t: 'a', u: `articles/${a.slug}/`, n: a.title, d: [TYPES[a.type], magBySlug[a.magazine]?.title].filter(Boolean).join(' · '), i: a.images?.[0] || '', th: a.themes[0] || '', k: [a.subtitle, a.region, (a.people || []).map((p) => `${p.name} ${p.role || ''}`).join(' '), a.themes.map((t) => THEMES[t].label).join(' '), a.summary].filter(Boolean).join(' ') });
  for (const m of magazines) idx.push({ t: 'm', u: `magazines/${m.slug}/`, n: m.title, d: [m.series, m.year].filter(Boolean).join(' · '), i: m.cover || '', th: m.themes[0] || '', k: [m.region, m.description, m.files.map((f) => f.name).join(' ')].filter(Boolean).join(' ') });
  for (const [id, t] of Object.entries(THEMES)) idx.push({ t: 't', u: `themes/${id}/`, n: t.label, d: 'Thème', i: '', th: id, k: '' });
  write('assets/search-index.json', JSON.stringify(idx));
  return idx.length;
}

// ---------- génération ----------
// Repart de zéro pour les pages générées (les assets statiques sont conservés)
for (const d of ['entreprises', 'articles', 'themes', 'magazines', 'recherche', 'contact', 'mentions-legales']) fs.rmSync(path.join(OUT, d), { recursive: true, force: true });
// … ainsi que les pages de redirection générées précédemment
for (const base of ['', 'category']) {
  const dir = path.join(OUT, base);
  if (!fs.existsSync(dir)) continue;
  for (const d of fs.readdirSync(dir)) {
    const f = path.join(dir, d, 'index.html');
    if (fs.existsSync(f) && fs.readFileSync(f, 'utf8').includes('<title>Page déplacée')) fs.rmSync(path.join(dir, d), { recursive: true, force: true });
  }
}
pageHome();
pageCompanies();
companies.forEach(pageCompany);
pageArticles();
articles.forEach(pageArticle);
pageThemes();
Object.keys(THEMES).forEach(pageTheme);
pageMagazines();
magazines.forEach(pageMagazine);
pageSearch();
pageContact();
pageLegal();
page404();
const nRedirects = pageRedirects();
const n = searchIndex();
write('.nojekyll', '');
const expires = new Date(Date.now() + 365 * 864e5).toISOString().replace(/\.\d+Z$/, 'Z');
write('.well-known/security.txt', `Contact: mailto:${PUBLISHER.email}\nExpires: ${expires}\nPreferred-Languages: fr, de, en\nCanonical: ${SITE_URL}/.well-known/security.txt\n`);
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /recherche/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${SITEMAP.sort().map((u) => `  <url><loc>${SITE_URL}/${u}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log(`Sitemap : ${SITEMAP.length} pages`);
// Couleurs des thèmes pour le JS de recherche
write('assets/themes.json', JSON.stringify(Object.fromEntries(Object.entries(THEMES).map(([id, t]) => [id, { label: t.label, color: t.color }]))));
console.log(`Redirections d'anciennes adresses : ${nRedirects}`);
console.log(`Site généré : ${magazines.length} magazines, ${articles.length} articles, ${companies.length} entreprises, ${n} entrées de recherche → docs/`);
