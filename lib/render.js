// Renderiza as páginas do site a partir de data/content.json (HTML gerado no servidor, bom para SEO).
const ICONS = require('./icons');

const LANGS = ['en', 'es'];

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function pageUrl(slug, lang) {
  const s = (slug || '').replace(/^\/+|\/+$/g, '');
  if (lang === 'es') return s ? `/es/${s}` : '/es/';
  return s ? `/${s}` : '/';
}

function createCtx(content, lang) {
  const S = content.settings || {};

  const t = (v) => {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    return (v[lang] && String(v[lang]).trim()) ? v[lang] : (v.en || '');
  };
  const et = (v) => esc(t(v));
  const lines = (v) => t(v).split('\n').map((l) => l.trim()).filter(Boolean);
  const paras = (v) => t(v).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    .map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('');

  const href = (h) => {
    if (!h) return '#';
    h = String(h).trim();
    if (lang === 'es' && h.startsWith('/') && !h.startsWith('//')
      && !/^\/es(\/|$|#|\?)/.test(h) && !/^\/(assets|uploads|api|admin)\//.test(h)) {
      if (h === '/') return '/es/';
      if (h.startsWith('/#') || h.startsWith('/?')) return '/es/' + h.slice(1);
      return '/es' + h;
    }
    return h;
  };

  const icon = (name, cls = '') =>
    `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.check}</svg>`;

  const button = (b, cls = '') => {
    if (!b || !t(b.label)) return '';
    const style = b.style || 'primary';
    const target = b.newTab ? ' target="_blank" rel="noopener"' : '';
    const arrow = style === 'link' ? '' : '';
    return `<a class="btn btn--${esc(style)} ${cls}" href="${esc(href(b.href))}"${target}>${et(b.label)}${arrow}</a>`;
  };
  const buttons = (list, cls = '') => {
    const html = (list || []).map((b) => button(b)).join('');
    return html ? `<div class="btn-row ${cls}">${html}</div>` : '';
  };

  const img = (src, alt, cls = '', eager = false) => src
    ? `<img class="${cls}" src="${esc(src)}" alt="${esc(alt || '')}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`
    : '';

  return { S, lang, t, et, lines, paras, href, icon, button, buttons, img, content };
}

/* ------------------------------------------------------------------ sections */

function secHead(c, d, opts = {}) {
  const eb = c.t(d.eyebrow), ti = c.t(d.title), tx = c.t(d.text);
  if (!eb && !ti && !tx) return '';
  const tag = opts.h1 ? 'h1' : 'h2';
  return `<header class="sec-head ${opts.cls || ''}" data-reveal>
    ${eb ? `<p class="eyebrow">${esc(eb)}</p>` : ''}
    ${ti ? `<${tag}>${esc(ti)}</${tag}>` : ''}
    ${tx && !opts.noText ? `<div class="sec-lead">${c.paras(d.text)}</div>` : ''}
  </header>`;
}

function diagram(c, d) {
  const L = c.lines(d.diagramLabels);
  const lab = (i, x, y, anchor = 'middle') => L[i] ? `<text class="dg-label" x="${x}" y="${y}" text-anchor="${anchor}">${esc(L[i])}</text>` : '';
  let plates = '';
  for (let x = 826; x <= 996; x += 10) plates += `<line x1="${x}" y1="154" x2="${x}" y2="206"/>`;
  return `<div class="hero-diagram" aria-hidden="true">
  <svg viewBox="0 0 1200 270" preserveAspectRatio="xMidYMid meet" focusable="false">
    <g class="dg-pipe">
      <path d="M0 48 H115 V72"/><path d="M200 186 H290"/><path d="M440 186 H490 V96 H585"/>
      <path d="M720 90 H1176"/><path d="M620 216 V234 H788 V180 H800"/><path d="M1024 180 H1060 V90"/>
    </g>
    <g class="dg-flow">
      <path d="M0 48 H115 V72"/><path d="M200 186 H290"/><path d="M440 186 H490 V96 H585"/>
      <path d="M720 90 H1176"/><path class="dg-flow--sludge" d="M620 216 V234 H788 V180 H800"/><path d="M1024 180 H1060 V90"/>
    </g>
    <g class="dg-liquid">
      <rect class="dg-level" x="32" y="112" width="166" height="86"/>
      <rect class="dg-level dg-level--b" x="292" y="102" width="146" height="96"/>
      <path class="dg-level dg-level--c" d="M523 98 H717 V149 L639 212 H601 L523 149 Z"/>
    </g>
    <path class="dg-sludge" d="M588 200 H652 L639 212 H601 Z"/>
    <g class="dg-unit">
      <path d="M30 70 V200 H200 V70"/>
      <path d="M290 70 V200 H440 V70"/>
      <rect x="350" y="28" width="30" height="20" rx="2"/><path d="M365 48 V168"/>
      <g class="dg-impeller"><path d="M341 170 H389"/><path d="M341 166 V174 M389 166 V174"/></g>
      <path d="M520 70 H720 V150 L640 216 H600 L520 150 Z"/>
      <path d="M598 70 V128 H642 V70"/>
      <rect x="800" y="146" width="16" height="68" rx="1"/><rect x="1006" y="146" width="16" height="68" rx="1"/>
      <path d="M816 150 H1006 M816 210 H1006"/>
      <g class="dg-plates">${plates}</g>
      <path d="M808 214 V240 M1014 214 V240"/>
      <path d="M1166 82 L1180 90 L1166 98"/>
    </g>
    <g class="dg-cake"><rect x="860" y="226" width="22" height="9" rx="1"/><rect x="900" y="230" width="26" height="8" rx="1"/><rect x="944" y="227" width="20" height="9" rx="1"/></g>
    ${lab(0, 115, 262)}${lab(1, 365, 262)}${lab(2, 620, 262)}${lab(3, 911, 262)}${lab(4, 1176, 74, 'end')}
  </svg>
</div>`;
}

const R = {};

R.hero = (c, s) => {
  const d = s.data;
  return `<div class="hero-bg">${d.background ? c.img(d.background, '', 'hero-bg__img', true) : ''}<div class="hero-grid-lines"></div></div>
  <div class="wrap hero-inner">
    <div class="hero-copy" data-load>
      ${d.heroLogo ? `<img class="hero-logo" src="${esc(d.heroLogo)}" alt="${esc(c.S.brand?.siteName || '')}">` : ''}
      ${c.t(d.eyebrow) ? `<p class="eyebrow">${c.et(d.eyebrow)}</p>` : ''}
      <h1>${c.et(d.title)}</h1>
      ${c.t(d.text) ? `<div class="hero-lead">${c.paras(d.text)}</div>` : ''}
      ${c.buttons(d.buttons)}
    </div>
  </div>
  ${d.showDiagram !== false ? `<div class="wrap">${diagram(c, d)}</div>` : ''}`;
};

R.pageHero = (c, s) => {
  const d = s.data;
  const media = d.compact ? '' : `<div class="ph-media" data-load>
      ${d.image ? c.img(d.image, c.t(d.title), 'ph-img', true) : `<div class="plate plate--hero">${c.icon(d.icon || 'factory', 'plate__ico')}</div>`}
    </div>`;
  return `<div class="hero-grid-lines"></div>
  <div class="wrap ph-grid ${d.compact ? 'ph-grid--compact' : ''}">
    <div class="ph-copy" data-load>
      ${c.t(d.eyebrow) ? `<p class="eyebrow">${c.et(d.eyebrow)}</p>` : ''}
      <h1>${c.et(d.title)}</h1>
      ${c.t(d.text) ? `<div class="hero-lead">${c.paras(d.text)}</div>` : ''}
      ${c.buttons(d.buttons)}
    </div>
    ${media}
  </div>`;
};

R.logos = (c, s) => {
  const d = s.data;
  const items = (d.items || []).filter((i) => i.name || i.image).map((i) => {
    const inner = i.image ? `<img src="${esc(i.image)}" alt="${esc(i.name)}" loading="lazy">` : `<span class="wordmark">${esc(i.name)}</span>`;
    return `<li>${i.url ? `<a href="${esc(i.url)}" target="_blank" rel="noopener">${inner}</a>` : inner}</li>`;
  }).join('');
  return `<div class="wrap logos" data-reveal>
    ${c.t(d.title) ? `<h2 class="logos__title">${c.et(d.title)}</h2>` : ''}
    <ul class="logos__row">${items}</ul>
  </div>`;
};

R.products = (c, s) => {
  const d = s.data;
  const rows = (d.items || []).map((p) => {
    const link = p.button && p.button.href ? c.href(p.button.href) : '';
    const label = p.button ? c.t(p.button.label) : '';
    const thumb = p.image ? c.img(p.image, c.t(p.title), 'prod__img') : `<span class="plate">${c.icon(p.icon || 'factory', 'plate__ico')}</span>`;
    return `<li class="prod" data-reveal>
      <div class="prod__thumb">${thumb}</div>
      <h3 class="prod__title">${link ? `<a href="${esc(link)}" class="prod__link">${c.et(p.title)}</a>` : c.et(p.title)}</h3>
      <div class="prod__text">${c.paras(p.text)}</div>
      ${label ? `<span class="prod__more" aria-hidden="true">${esc(label)}${c.icon('arrow', 'prod__arrow')}</span>` : ''}
    </li>`;
  }).join('');
  return `<div class="wrap">${secHead(c, d)}<ul class="prod-list">${rows}</ul></div>`;
};

R.features = (c, s) => {
  const d = s.data;
  const items = (d.items || []).map((f) => `<li class="feat" data-reveal>
      <span class="feat__ico">${c.icon(f.icon || 'check')}</span>
      <h3>${c.et(f.title)}</h3>
      <div class="feat__text">${c.paras(f.text)}</div>
    </li>`).join('');
  const n = (d.items || []).length;
  return `<div class="wrap">${secHead(c, d)}<ul class="feat-grid ${n % 3 === 0 || n > 4 ? 'cols-3' : n === 4 ? 'cols-4' : 'cols-' + n}">${items}</ul></div>`;
};

function metricsRow(c, list, cls = '') {
  if (!list || !list.length) return '';
  return `<ul class="metrics ${cls}">${list.map((m) => {
    const raw = String(m.value || '');
    const match = raw.match(/^([^\d]*)([\d.,]+)(.*)$/);
    const num = match ? `<span class="metric__num" data-count="${esc(match[2].replace(/,/g, ''))}" data-prefix="${esc(match[1])}" data-suffix="${esc(match[3])}">${esc(raw)}</span>` : `<span class="metric__num">${esc(raw)}</span>`;
    return `<li class="metric">${num}<span class="metric__label">${c.et(m.label)}</span></li>`;
  }).join('')}</ul>`;
}

R.richText = (c, s) => {
  const d = s.data;
  if (d.image) {
    return `<div class="wrap rt rt--media ${d.reverse ? 'rt--reverse' : ''}">
      <div class="rt__copy" data-reveal>${secHead(c, d, { noText: true })}<div class="prose">${c.paras(d.text)}</div>${metricsRow(c, d.metrics, 'metrics--inline')}</div>
      <figure class="rt__fig" data-reveal>${c.img(d.image, c.t(d.imageCaption) || c.t(d.title))}${c.t(d.imageCaption) ? `<figcaption>${c.et(d.imageCaption)}</figcaption>` : ''}</figure>
    </div>`;
  }
  return `<div class="wrap rt">
    <div class="rt__head">${secHead(c, d, { noText: true })}</div>
    <div class="rt__body" data-reveal><div class="prose">${c.paras(d.text)}</div>${metricsRow(c, d.metrics, 'metrics--inline')}</div>
  </div>`;
};

function galleryGrid(c, images, cls = '') {
  const list = (images || []).filter((i) => i && i.src);
  if (!list.length) return '';
  return `<ul class="gal ${cls}">${list.map((i) => `<li><figure>
      <button type="button" class="gal__btn" data-lightbox="${esc(i.src)}" data-caption="${c.et(i.caption)}">${c.img(i.src, c.t(i.caption))}</button>
      ${c.t(i.caption) ? `<figcaption>${c.et(i.caption)}</figcaption>` : ''}
    </figure></li>`).join('')}</ul>`;
}

R.systems = (c, s) => {
  const d = s.data;
  const items = (d.items || []).map((it) => {
    const lists = (it.lists || []).map((l) => {
      const li = c.lines(l.items);
      if (!li.length) return '';
      return `<div class="sys__list">${c.t(l.label) ? `<h4>${c.et(l.label)}</h4>` : ''}<ul class="ticks">${li.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
    }).join('');
    return `<article class="sys" data-reveal>
      <h3>${c.et(it.title)}</h3>
      <div class="sys__text">${c.paras(it.text)}</div>
      ${lists ? `<div class="sys__lists">${lists}</div>` : ''}
      ${galleryGrid(c, it.images, 'gal--sm')}
      ${it.button ? c.button(it.button, 'sys__btn') : ''}
    </article>`;
  }).join('');
  const n = (d.items || []).length;
  return `<div class="wrap">${secHead(c, d)}<div class="sys-grid cols-${Math.min(n, 3)}">${items}</div></div>`;
};

R.table = (c, s) => {
  const d = s.data;
  const rows = c.lines(d.table).map((r) => r.split('|').map((x) => x.trim()));
  if (!rows.length) return '';
  const [headRow, ...body] = rows;
  return `<div class="wrap">${secHead(c, d)}
    <div class="table-wrap" data-reveal tabindex="0" role="region" aria-label="${c.et(d.title)}">
      <table class="tbl">
        <thead><tr>${headRow.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
        <tbody>${body.map((r) => `<tr>${r.map((cell, i) => i === 0 ? `<th scope="row">${esc(cell)}</th>` : `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </div>
  </div>`;
};

R.steps = (c, s) => {
  const d = s.data;
  const items = (d.items || []);
  return `<div class="wrap">${secHead(c, d)}
    <ol class="steps cols-${items.length}" data-reveal data-steps>
      ${items.map((it, i) => `<li class="step">
        <span class="step__num">${String(i + 1).padStart(2, '0')}</span>
        <h3>${c.et(it.title)}</h3>
        <div class="step__text">${c.paras(it.text)}</div>
      </li>`).join('')}
    </ol>
  </div>`;
};

R.details = (c, s) => {
  const d = s.data;
  return `<div class="wrap split">
    <div class="split__head">${secHead(c, d)}</div>
    <dl class="dlist" data-reveal>${(d.items || []).map((it) => `<div class="dlist__row"><dt>${c.et(it.title)}</dt><dd>${c.paras(it.text)}</dd></div>`).join('')}</dl>
  </div>`;
};

R.applications = (c, s) => {
  const d = s.data;
  return `<div class="wrap">${secHead(c, d)}
    <div class="apps">${(d.groups || []).map((g) => `<div class="app" data-reveal>
      <h3>${c.et(g.title)}</h3>
      <ul class="ticks">${c.lines(g.items).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    </div>`).join('')}</div>
  </div>`;
};

R.gallery = (c, s) => {
  const d = s.data;
  const grid = galleryGrid(c, d.images);
  if (!grid) return null; // sem imagens, a seção não aparece
  return `<div class="wrap">${secHead(c, d)}<div data-reveal>${grid}</div></div>`;
};

R.metrics = (c, s) => {
  const d = s.data;
  return `<div class="wrap metrics-band">
    ${secHead(c, d, { cls: 'sec-head--compact' })}
    <div data-reveal>${metricsRow(c, d.items, 'metrics--band')}</div>
  </div>`;
};

R.mvv = (c, s) => {
  const d = s.data;
  return `<div class="wrap">${secHead(c, d)}
    <div class="mvv" data-reveal>
      <div class="mvv__block"><h3>${c.et(d.missionTitle)}</h3><div class="mvv__statement">${c.paras(d.mission)}</div></div>
      <div class="mvv__block"><h3>${c.et(d.visionTitle)}</h3><div class="mvv__statement">${c.paras(d.vision)}</div></div>
    </div>
    ${(d.values || []).length ? `<div class="values" data-reveal>
      <h3 class="values__title">${c.et(d.valuesTitle)}</h3>
      <ul class="values__list">${d.values.map((v) => `<li><strong>${c.et(v.title)}</strong>${c.paras(v.text)}</li>`).join('')}</ul>
    </div>` : ''}
  </div>`;
};

R.cta = (c, s) => {
  const d = s.data;
  return `<div class="wrap cta" data-reveal>
    <div class="cta__copy">
      ${c.t(d.eyebrow) ? `<p class="eyebrow">${c.et(d.eyebrow)}</p>` : ''}
      <h2>${c.et(d.title)}</h2>
      ${c.t(d.text) ? `<div class="cta__text">${c.paras(d.text)}</div>` : ''}
    </div>
    ${c.buttons(d.buttons, 'cta__btns')}
  </div>`;
};

function contactLines(c, cls = '') {
  const C = c.S.contact || {};
  return `<ul class="contact-lines ${cls}">
    ${C.phone ? `<li>${c.icon('phone')}<a href="${esc(C.phoneHref || 'tel:' + C.phone.replace(/[^\d+]/g, ''))}">${esc(C.phone)}</a></li>` : ''}
    ${C.email ? `<li>${c.icon('mail')}<a href="mailto:${esc(C.email)}">${esc(C.email)}</a></li>` : ''}
    ${c.t(C.address) ? `<li>${c.icon('pin')}<span>${c.et(C.address)}</span></li>` : ''}
  </ul>`;
}

R.contact = (c, s, page) => {
  const d = s.data;
  const F = c.S.forms || {};
  const L = F.labels || {};
  const ev = (c.S.tracking && c.S.tracking.dataLayerEvent) || 'form_submit';
  const field = (name, type, req, extra = '') => `<div class="field field--${name}">
      <label for="${s.id}-${name}">${c.et(L[name])}${req ? ' <span class="req" aria-hidden="true">*</span>' : ''}</label>
      ${type === 'textarea'
        ? `<textarea id="${s.id}-${name}" name="${name}" rows="5"${req ? ' required' : ''}></textarea>`
        : `<input id="${s.id}-${name}" name="${name}" type="${type}"${req ? ' required' : ''}${extra}>`}
    </div>`;
  const form = `<form class="lead-form" data-reveal novalidate
      data-form-name="${esc(d.formName || 'contact_form')}" data-event="${esc(ev)}" data-lang="${c.lang}" data-page="${esc(page.id)}"
      data-msg-sending="${c.et(F.sending)}" data-msg-success="${c.et(F.success)}" data-msg-error="${c.et(F.error)}" data-msg-invalid="${c.et(F.invalid)}">
      <div class="form-grid">
        ${field('name', 'text', true, ' autocomplete="name"')}
        ${field('email', 'email', true, ' autocomplete="email"')}
        ${field('phone', 'tel', false, ' autocomplete="tel"')}
        ${field('company', 'text', false, ' autocomplete="organization"')}
        ${field('city', 'text', false, ' autocomplete="address-level2"')}
        ${field('state', 'text', false, ' autocomplete="address-level1"')}
        ${field('message', 'textarea', true)}
      </div>
      <div class="hp" aria-hidden="true"><label>Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
      <div class="form-foot">
        <p class="form-note">${c.et(F.requiredNote)}</p>
        <button type="submit" class="btn btn--primary" data-submit>${c.et(d.submitLabel) || 'Send'}</button>
      </div>
      <p class="form-status" role="status" aria-live="polite"></p>
    </form>`;
  const aside = d.showAside ? `<aside class="quick" data-reveal>
      <h3>${c.et(d.asideTitle)}</h3>
      ${c.paras(d.asideText)}
      ${contactLines(c, 'contact-lines--light')}
      ${d.asideButton ? c.button(d.asideButton, 'quick__btn') : ''}
    </aside>` : '';
  return `<div class="wrap contact ${d.showAside ? 'contact--aside' : ''}">
    <div class="contact__main">${secHead(c, d)}${form}</div>
    ${aside}
  </div>`;
};

R.contactCards = (c, s) => {
  const d = s.data;
  const C = c.S.contact || {};
  const cards = (d.cards || []).map((k) => {
    let ico = 'pin', lines = '', link = C.mapUrl || '#', ext = true;
    if (k.kind === 'phone') { ico = 'phone'; lines = `<p>${esc(C.phone)}</p>`; link = C.phoneHref || ('tel:' + String(C.phone || '').replace(/[^\d+]/g, '')); ext = false; }
    else if (k.kind === 'email') { ico = 'mail'; lines = `<p>${esc(C.email)}</p>`; link = 'mailto:' + (C.email || ''); ext = false; }
    else { lines = `<p>${c.et(C.address)}</p>`; }
    return `<li class="ccard" data-reveal>
      <span class="feat__ico">${c.icon(ico)}</span>
      <h3>${c.et(k.title)}</h3>
      ${lines}
      ${c.t(k.buttonLabel) ? `<a class="btn btn--secondary btn--sm" href="${esc(link)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${c.et(k.buttonLabel)}</a>` : ''}
    </li>`;
  }).join('');
  return `<div class="wrap">${secHead(c, d)}<ul class="ccards">${cards}</ul></div>`;
};

function renderSection(c, s, page) {
  const fn = R[s.type];
  if (!fn) return '';
  const inner = fn(c, s, page);
  if (inner == null) return '';
  const d = s.data || {};
  const theme = d.theme || 'white';
  return `<section class="sec sec--${s.type} theme-${esc(theme)}"${d.anchor ? ` id="${esc(d.anchor)}"` : ''}>${inner}</section>`;
}

/* ------------------------------------------------------------------ layout */

function header(c, page) {
  const H = c.S.header || {};
  const B = c.S.brand || {};
  const items = (H.nav || []).map((n, i) => {
    const kids = (n.children || []).filter((k) => c.t(k.label));
    if (!kids.length) return `<li class="nav__item"><a href="${esc(c.href(n.href))}">${c.et(n.label)}</a></li>`;
    return `<li class="nav__item has-sub">
      <a href="${esc(c.href(n.href))}">${c.et(n.label)}</a>
      <button type="button" class="sub-toggle" aria-expanded="false" aria-controls="sub-${i}" aria-label="${c.et(n.label)}">${c.icon('chevron')}</button>
      <ul class="sub" id="sub-${i}">${kids.map((k) => `<li><a href="${esc(c.href(k.href))}">${c.et(k.label)}</a></li>`).join('')}</ul>
    </li>`;
  }).join('');
  const langs = H.showLanguageSwitch !== false ? `<div class="lang" aria-label="Language">${LANGS.map((l) =>
    `<a href="${esc(pageUrl(page ? page.slug : '', l))}" hreflang="${l}" lang="${l}"${l === c.lang ? ' aria-current="true"' : ''}>${l.toUpperCase()}</a>`).join('')}</div>` : '';
  return `<header class="site-header" id="site-header">
  <div class="wrap hdr">
    <a class="brand" href="${c.lang === 'es' ? '/es/' : '/'}">${B.logo ? `<img src="${esc(B.logo)}" alt="${esc(B.siteName || '')}" width="160" height="62">` : esc(B.siteName || '')}</a>
    <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle__bars" aria-hidden="true"><i></i><i></i><i></i></span><span class="sr-only">${c.et(c.S.ui && c.S.ui.menu) || 'Menu'}</span></button>
    <nav class="nav" id="site-nav" aria-label="Main">
      <ul class="nav__list">${items}</ul>
      <div class="nav__actions">${langs}${H.cta ? c.button(H.cta, 'btn--sm') : ''}</div>
    </nav>
  </div>
</header>`;
}

function footer(c) {
  const F = c.S.footer || {};
  const B = c.S.brand || {};
  const C = c.S.contact || {};
  const N = F.newsletter || {};
  const phoneHref = C.phoneHref || ('tel:' + String(C.phone || '').replace(/[^\d+]/g, ''));
  return `<footer class="site-footer">
  <div class="wrap foot">
    <div class="foot__brand">
      ${B.logoLight ? `<img src="${esc(B.logoLight)}" alt="${esc(B.siteName || '')}" width="170" height="66" loading="lazy">` : `<strong>${esc(B.siteName || '')}</strong>`}
      ${c.paras(F.tagline)}
    </div>
    <div class="foot__col">
      <h2>${c.et(F.quickLinksTitle)}</h2>
      <ul class="foot__links">${(F.quickLinks || []).map((l) => `<li><a href="${esc(c.href(l.href))}">${c.et(l.label)}</a></li>`).join('')}</ul>
    </div>
    <div class="foot__col">
      <h2>${c.et(F.contactTitle)}</h2>
      <ul class="foot__contact">
        ${c.t(C.address) ? `<li>${c.icon('pin')}<div><span>${c.et(C.address)}</span>${C.mapUrl ? `<a href="${esc(C.mapUrl)}" target="_blank" rel="noopener">${c.et(F.mapLabel)}</a>` : ''}</div></li>` : ''}
        ${C.phone ? `<li>${c.icon('phone')}<div><span>${esc(C.phone)}</span><a href="${esc(phoneHref)}">${c.et(F.callLabel)}</a></div></li>` : ''}
        ${C.email ? `<li>${c.icon('mail')}<div><span>${esc(C.email)}</span><a href="mailto:${esc(C.email)}">${c.et(F.emailLabel)}</a></div></li>` : ''}
      </ul>
    </div>
    ${N.show !== false ? `<div class="foot__col foot__news">
      <h2>${c.et(N.title)}</h2>
      ${c.paras(N.text)}
      <form class="news-form" novalidate data-form-name="newsletter" data-event="${esc((c.S.tracking && c.S.tracking.dataLayerEvent) || 'form_submit')}" data-lang="${c.lang}"
        data-msg-success="${c.et(N.success)}" data-msg-error="${c.et(c.S.forms && c.S.forms.error)}" data-msg-invalid="${c.et(c.S.forms && c.S.forms.invalid)}">
        <label class="sr-only" for="news-email">${c.et(N.placeholder)}</label>
        <div class="news-form__row">
          <input id="news-email" type="email" name="email" required placeholder="${c.et(N.placeholder)}" autocomplete="email">
          <button type="submit" class="btn btn--primary btn--sm" data-submit>${c.et(N.button)}</button>
        </div>
        <div class="hp" aria-hidden="true"><input type="text" name="website" tabindex="-1" autocomplete="off"></div>
        <p class="form-status" role="status" aria-live="polite"></p>
      </form>
    </div>` : ''}
  </div>
  <div class="wrap foot__legal"><p>${c.et(F.legal)}</p></div>
</footer>`;
}

function themeVars(B) {
  const ok = (v) => /^#[0-9a-f]{3,8}$/i.test(v || '');
  const v = [];
  if (ok(B.colorNavy)) v.push(`--navy:${B.colorNavy}`);
  if (ok(B.colorBrand)) v.push(`--brand:${B.colorBrand}`);
  if (ok(B.colorFlow)) v.push(`--flow:${B.colorFlow}`);
  if (ok(B.colorAccent)) v.push(`--accent:${B.colorAccent}`);
  return v.length ? `<style>:root{${v.join(';')}}</style>` : '';
}

function documentShell(c, { page, title, description, body, origin, status }) {
  const B = c.S.brand || {};
  const G = (c.S.tracking && c.S.tracking.gtmId || '').trim();
  const gtmOk = /^GTM-[A-Z0-9]+$/i.test(G);
  const slug = page ? page.slug : null;
  const canonical = slug != null ? origin + pageUrl(slug, c.lang) : '';
  const alt = slug != null ? LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${esc(origin + pageUrl(slug, l))}">`).join('')
    + `<link rel="alternate" hreflang="x-default" href="${esc(origin + pageUrl(slug, 'en'))}">` : '';
  const og = c.S.seo && c.S.seo.ogImage;
  const C = c.S.contact || {};
  const ld = {
    '@context': 'https://schema.org', '@type': 'Organization', name: B.siteName || 'Neos Group', url: origin + '/',
    logo: B.logo ? origin + B.logo : undefined, email: C.email || undefined, telephone: C.phone || undefined,
    address: { '@type': 'PostalAddress', addressLocality: 'Dallas', addressRegion: 'TX', addressCountry: 'US' },
  };
  return `<!doctype html>
<html lang="${c.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${status === 404 ? '<meta name="robots" content="noindex">' : ''}
${canonical ? `<link rel="canonical" href="${esc(canonical)}">` : ''}
${alt}
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${canonical ? `<meta property="og:url" content="${esc(canonical)}">` : ''}
${og ? `<meta property="og:image" content="${esc(/^https?:/.test(og) ? og : origin + og)}">` : ''}
<meta property="og:locale" content="${c.lang === 'es' ? 'es_US' : 'en_US'}">
<meta name="theme-color" content="${esc(B.colorNavy || '#0C1E35')}">
${B.favicon ? `<link rel="icon" href="${esc(B.favicon)}">` : ''}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,300..800&display=swap">
<link rel="stylesheet" href="/assets/css/site.css?v=${esc(c.assetV || 1)}">
${themeVars(B)}
<script>window.dataLayer=window.dataLayer||[];document.documentElement.classList.add('js');</script>
${gtmOk ? `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${esc(G)}');</script>` : ''}
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
</head>
<body>
${gtmOk ? `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${esc(G)}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>` : ''}
<a class="skip" href="#main">Skip to content</a>
${header(c, page)}
<main id="main">
${body}
</main>
${footer(c)}
<dialog class="lightbox" id="lightbox"><button type="button" class="lightbox__close" aria-label="Close">×</button><img alt=""><p></p></dialog>
<script src="/assets/js/site.js?v=${esc(c.assetV || 1)}" defer></script>
</body>
</html>`;
}

function renderPage({ content, page, lang, origin, assetV }) {
  const c = createCtx(content, lang);
  c.assetV = assetV;
  const body = (page.sections || []).filter((s) => s.enabled !== false).map((s) => renderSection(c, s, page)).join('\n');
  const seo = page.seo || {};
  const suffix = (c.S.seo && c.S.seo.titleSuffix) || '';
  const title = (c.t(seo.title) || page.name || '') + suffix;
  const description = c.t(seo.description) || c.t(c.S.seo && c.S.seo.description);
  return documentShell(c, { page, title, description, body, origin });
}

function render404({ content, lang, origin, assetV }) {
  const c = createCtx(content, lang);
  c.assetV = assetV;
  const U = c.S.ui || {};
  const body = `<section class="sec sec--pageHero theme-dark"><div class="hero-grid-lines"></div><div class="wrap ph-grid ph-grid--compact"><div class="ph-copy" data-load>
    <p class="eyebrow">404</p><h1>${c.et(U.notFoundTitle) || 'Page not found'}</h1><div class="hero-lead">${c.paras(U.notFoundText)}</div>
    <div class="btn-row"><a class="btn btn--primary" href="${lang === 'es' ? '/es/' : '/'}">${c.et(U.backHome) || 'Home'}</a></div>
  </div></div></section>`;
  return documentShell(c, { page: null, title: (c.t(U.notFoundTitle) || 'Not found') + ((c.S.seo && c.S.seo.titleSuffix) || ''), description: '', body, origin, status: 404 });
}

module.exports = { renderPage, render404, pageUrl, LANGS, esc };
