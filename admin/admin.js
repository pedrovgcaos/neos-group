/* Neos Group — painel admin (sem dependências). Os formulários são gerados a partir de /lib/schemas.js */
(function () {
  'use strict';
  const SCHEMAS = window.NEOS_SCHEMAS;
  const ICONS = window.NEOS_ICONS;
  const $ = (s, r = document) => r.querySelector(s);

  let content = null;
  let uploadMax = 3 * 1024 * 1024;
  let dirty = false;
  let view = { kind: 'page', id: 'home' };
  const openSections = new Set();
  const openItems = new WeakSet();

  /* ------------------------------------------------------------------ util */

  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else if (k === 'value') n.value = v;
      else if (k === 'checked') n.checked = !!v;
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (const k of kids.flat()) if (k != null && k !== false) n.append(k.nodeType ? k : document.createTextNode(String(k)));
    return n;
  }

  async function api(method, url, body) {
    const r = await fetch(url, {
      method, credentials: 'same-origin',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    let j = null;
    try { j = await r.json(); } catch { /* sem corpo */ }
    if (r.status === 401 && url !== '/api/login') { showLogin(); throw new Error('Sessão expirada. Entre novamente.'); }
    if (!r.ok || (j && j.ok === false)) throw new Error((j && j.error) || `Erro ${r.status}`);
    return j;
  }

  let toastTimer;
  function toast(msg, isErr) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.toggle('is-err', !!isErr);
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-on'), isErr ? 5000 : 2600);
  }

  const i18nText = (v) => (v && typeof v === 'object' ? (v.en || v.es || '') : (v || ''));
  const uid = (p) => `${p}-${Math.random().toString(36).slice(2, 8)}`;
  const clone = (o) => JSON.parse(JSON.stringify(o));

  function markDirty() {
    dirty = true;
    $('#dirty').hidden = false;
    $('#save').disabled = false;
  }
  function clearDirty() {
    dirty = false;
    $('#dirty').hidden = true;
    $('#save').disabled = true;
  }

  function makeDefault(fields) {
    const o = {};
    for (const f of fields) {
      switch (f.type) {
        case 'i18n': case 'i18nText': case 'lines': case 'table': o[f.key] = { en: '', es: '' }; break;
        case 'list': case 'buttons': o[f.key] = []; break;
        case 'button': o[f.key] = null; break;
        case 'bool': o[f.key] = false; break;
        case 'object': o[f.key] = makeDefault(f.fields); break;
        case 'select': o[f.key] = f.options[0][0]; break;
        default: o[f.key] = '';
      }
    }
    return o;
  }
  const newButton = () => ({ label: { en: '', es: '' }, href: '', style: 'primary', newTab: false });

  /* ------------------------------------------------------------------ campos */

  function field(f, obj, onChange) {
    const wrap = el('div', { class: 'f' });
    const label = (forId) => el('label', forId ? { for: forId } : { class: 'f__label' }, f.label);
    const help = f.help ? el('p', { class: 'f__help', text: f.help }) : null;
    const id = uid('f');
    const set = (v) => { obj[f.key] = v; onChange(); };

    switch (f.type) {
      case 'text':
      case 'url': {
        const inp = el('input', { id, type: 'text', value: obj[f.key] || '', list: f.type === 'url' ? 'link-suggestions' : null, spellcheck: f.type === 'url' ? 'false' : null,
          oninput: (e) => set(e.target.value) });
        wrap.append(label(id), inp);
        break;
      }
      case 'i18n':
      case 'i18nText':
      case 'lines':
      case 'table': {
        if (!obj[f.key] || typeof obj[f.key] !== 'object') obj[f.key] = { en: obj[f.key] || '', es: '' };
        const v = obj[f.key];
        const multi = f.type !== 'i18n';
        const grid = el('div', { class: 'i18n' });
        for (const lang of ['en', 'es']) {
          const attrs = { value: v[lang] || '', 'aria-label': `${f.label} (${lang.toUpperCase()})`, oninput: (e) => { v[lang] = e.target.value; onChange(); } };
          const input = multi ? el('textarea', Object.assign({ rows: f.type === 'table' ? 8 : f.type === 'lines' ? 4 : 3 }, attrs)) : el('input', Object.assign({ type: 'text' }, attrs));
          if (multi) input.value = v[lang] || '';
          grid.append(el('div', null, input, el('span', { class: 'lang-tag', text: lang === 'en' ? 'EN' : 'ES' })));
        }
        wrap.append(label(), grid);
        if (f.type === 'lines' && !f.help) wrap.append(el('p', { class: 'f__help', text: 'Um item por linha.' }));
        if (f.type === 'table') wrap.append(el('p', { class: 'f__help', text: 'Uma linha por linha da tabela; separe as colunas com | . A primeira linha é o cabeçalho.' }));
        if (f.type === 'i18nText') wrap.append(el('p', { class: 'f__help', text: 'Deixe uma linha em branco para criar um novo parágrafo.' }));
        break;
      }
      case 'select': {
        const sel = el('select', { id, onchange: (e) => set(e.target.value) },
          f.options.map(([val, lab]) => el('option', { value: val, selected: obj[f.key] === val ? true : null }, lab)));
        sel.value = obj[f.key] || f.options[0][0];
        wrap.append(label(id), sel);
        break;
      }
      case 'bool': {
        const sw = el('label', { class: 'switch' },
          el('input', { type: 'checkbox', checked: !!obj[f.key], onchange: (e) => set(e.target.checked) }), el('i'), el('span', { text: f.label }));
        wrap.append(sw);
        break;
      }
      case 'color': {
        const txt = el('input', { type: 'text', value: obj[f.key] || '', style: 'max-width:140px', oninput: (e) => { set(e.target.value); if (/^#[0-9a-f]{6}$/i.test(e.target.value)) pick.value = e.target.value; } });
        const pick = el('input', { type: 'color', value: /^#[0-9a-f]{6}$/i.test(obj[f.key] || '') ? obj[f.key] : '#000000', oninput: (e) => { txt.value = e.target.value; set(e.target.value); } });
        wrap.append(label(), el('div', { class: 'color-row' }, pick, txt));
        break;
      }
      case 'icon': {
        const box = el('div', { class: 'icon-pick', role: 'group', 'aria-label': f.label });
        const names = Object.keys(ICONS).filter((n) => !['arrow', 'chevron'].includes(n));
        names.forEach((n) => {
          const b = el('button', { type: 'button', title: n, 'aria-label': n, 'aria-pressed': String(obj[f.key] === n),
            html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[n]}</svg>`,
            onclick: () => { set(n); box.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); } });
          box.append(b);
        });
        wrap.append(label(), box);
        break;
      }
      case 'image':
        wrap.append(label(), imageField(obj, f.key, onChange));
        break;
      case 'button':
        wrap.append(label(), buttonField(obj, f.key, onChange, true));
        break;
      case 'buttons': {
        if (!Array.isArray(obj[f.key])) obj[f.key] = [];
        wrap.append(label(), listField(obj[f.key], {
          itemTitle: (b) => i18nText(b.label) || '(botão sem texto)',
          render: (b, ch) => { const holder = { b }; return buttonField(holder, 'b', ch, false, b); },
          create: newButton, addLabel: '+ Adicionar botão',
        }, onChange));
        break;
      }
      case 'list': {
        if (!Array.isArray(obj[f.key])) obj[f.key] = [];
        wrap.append(label(), listField(obj[f.key], {
          itemTitle: (it) => {
            const v = f.itemLabel ? it[f.itemLabel] : '';
            return (typeof v === 'object' ? i18nText(v) : v) || '(sem título)';
          },
          render: (it, ch) => fields(f.fields, it, ch),
          create: () => makeDefault(f.fields), addLabel: '+ Adicionar item',
        }, onChange));
        break;
      }
      case 'object': {
        if (!obj[f.key] || typeof obj[f.key] !== 'object') obj[f.key] = makeDefault(f.fields);
        const det = el('details', { class: 'panel', style: 'margin-top:16px' },
          el('summary', { class: 'panel__head' }, el('h2', { text: f.label })),
          el('div', { class: 'panel__body' }, fields(f.fields, obj[f.key], onChange)));
        if (f.open) det.open = true;
        return det;
      }
      default:
        wrap.append(label(), el('p', { class: 'f__help', text: 'Tipo de campo desconhecido: ' + f.type }));
    }
    if (help) wrap.append(help);
    return wrap;
  }

  function fields(list, obj, onChange) {
    const frag = el('div');
    list.forEach((f) => frag.append(field(f, obj, onChange)));
    return frag;
  }

  function imageField(obj, key, onChange) {
    const prev = el('div', { class: 'img-prev' });
    const url = el('input', { type: 'text', value: obj[key] || '', placeholder: 'Sem imagem — envie um arquivo ou cole uma URL', spellcheck: 'false',
      oninput: (e) => { obj[key] = e.target.value.trim(); paint(); onChange(); } });
    const file = el('input', { type: 'file', accept: 'image/*,.svg,.ico', hidden: true, onchange: upload });
    const up = el('button', { class: 'b b--ghost b--sm', type: 'button', onclick: () => file.click() }, 'Enviar imagem');
    const rm = el('button', { class: 'b b--danger b--sm', type: 'button', onclick: () => { obj[key] = ''; url.value = ''; paint(); onChange(); } }, 'Remover');
    function paint() {
      prev.innerHTML = '';
      if (obj[key]) prev.append(el('img', { src: obj[key], alt: '' }));
      else prev.append('Sem imagem');
      rm.hidden = !obj[key];
    }
    async function upload() {
      const f = file.files[0];
      if (!f) return;
      if (f.size > 25 * 1024 * 1024) { toast('Arquivo acima de 25 MB. Use uma imagem menor.', true); return; }
      up.disabled = true; up.textContent = 'Enviando…';
      try {
        const dataUrl = await prepareImage(f);
        if (dataUrl.length * 0.75 > uploadMax) throw new Error(`A imagem continua acima de ${(uploadMax / 1048576).toFixed(1)} MB mesmo reduzida. Use um arquivo menor.`);
        const j = await api('POST', '/api/upload', { name: f.name, dataUrl });
        obj[key] = j.url; url.value = j.url; paint(); onChange();
        toast('Imagem enviada. Clique em "Salvar alterações" para publicar.');
      } catch (e) { toast(e.message, true); }
      up.disabled = false; up.textContent = 'Enviar imagem'; file.value = '';
    }
    paint();
    return el('div', { class: 'img-field' }, prev, el('div', { class: 'img-ctrl' }, url, el('div', { class: 'img-ctrl__btns' }, up, rm, file)));
  }

  // Fotos grandes são reduzidas no navegador (lado maior até 2400 px) antes do envio:
  // deixa o site mais rápido e respeita o limite de 4,5 MB por requisição da Vercel.
  const readAsDataUrl = (blob) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob); });
  async function prepareImage(f) {
    const raster = /^image\/(png|jpeg|webp)$/.test(f.type);
    if (!raster) return readAsDataUrl(f);
    const bmp = await createImageBitmap(f).catch(() => null);
    if (!bmp) return readAsDataUrl(f);
    const MAX = 2400;
    const scale = Math.min(1, MAX / Math.max(bmp.width, bmp.height));
    if (scale === 1 && f.size <= 1.5 * 1024 * 1024) return readAsDataUrl(f);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const type = f.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp'; // webp mantém transparência de PNG
    let q = 0.86, out;
    do { out = await new Promise((r) => canvas.toBlob(r, type, q)); q -= 0.12; } while (out && out.size > uploadMax * 0.9 && q > 0.4);
    return readAsDataUrl(out || f);
  }

  // botão: { label{en,es}, href, style, newTab }
  function buttonField(obj, key, onChange, nullable) {
    const box = el('div');
    function paint() {
      box.innerHTML = '';
      const b = obj[key];
      if (!b) {
        if (nullable) box.append(el('button', { class: 'b b--ghost b--sm', type: 'button', onclick: () => { obj[key] = newButton(); onChange(); paint(); } }, '+ Adicionar botão'));
        return;
      }
      if (!b.label || typeof b.label !== 'object') b.label = { en: b.label || '', es: '' };
      const body = el('div', { class: 'btn-field' });
      body.append(field({ key: 'label', type: 'i18n', label: 'Texto do botão' }, b, onChange));
      const row = el('div', { class: 'btn-field__row' },
        field({ key: 'href', type: 'url', label: 'Link (hiperlink)', help: 'Ex.: /request-a-quote, /#contact, https://…, mailto:…, tel:…' }, b, onChange),
        field({ key: 'style', type: 'select', label: 'Estilo', options: [['primary', 'Principal (amarelo)'], ['secondary', 'Contorno'], ['link', 'Link sublinhado']] }, b, onChange),
        el('div', { class: 'f' }, el('label', { class: 'switch' }, el('input', { type: 'checkbox', checked: !!b.newTab, onchange: (e) => { b.newTab = e.target.checked; onChange(); } }), el('i'), el('span', { text: 'Nova aba' }))));
      body.append(row);
      if (nullable) body.append(el('div', null, el('button', { class: 'b b--danger b--sm', type: 'button', onclick: () => { obj[key] = null; onChange(); paint(); } }, 'Remover botão')));
      box.append(body);
    }
    paint();
    return box;
  }

  // lista genérica com reordenação
  function listField(arr, opts, onChange) {
    const box = el('div');
    function paint() {
      box.innerHTML = '';
      const list = el('div', { class: 'list' });
      arr.forEach((it, i) => {
        const titleEl = el('span', null);
        const setTitle = () => { titleEl.textContent = opts.itemTitle(it); };
        setTitle();
        const head = el('div', { class: 'list-item__head' },
          el('div', { class: 'list-item__title', onclick: () => { if (openItems.has(it)) openItems.delete(it); else openItems.add(it); paint(); } }, el('small', { text: `${i + 1}.` }), titleEl),
          el('button', { class: 'b b--icon', type: 'button', title: 'Mover para cima', 'aria-label': 'Mover para cima', disabled: i === 0 ? true : null, onclick: () => { arr.splice(i - 1, 0, arr.splice(i, 1)[0]); onChange(); paint(); } }, '↑'),
          el('button', { class: 'b b--icon', type: 'button', title: 'Mover para baixo', 'aria-label': 'Mover para baixo', disabled: i === arr.length - 1 ? true : null, onclick: () => { arr.splice(i + 1, 0, arr.splice(i, 1)[0]); onChange(); paint(); } }, '↓'),
          el('button', { class: 'b b--icon', type: 'button', title: 'Duplicar', 'aria-label': 'Duplicar', onclick: () => { const c = clone(it); arr.splice(i + 1, 0, c); openItems.add(c); onChange(); paint(); } }, '⧉'),
          el('button', { class: 'b b--icon', type: 'button', title: 'Excluir', 'aria-label': 'Excluir', onclick: () => { if (confirm('Excluir este item?')) { arr.splice(i, 1); onChange(); paint(); } } }, '✕'),
          el('button', { class: 'b b--icon', type: 'button', title: openItems.has(it) ? 'Recolher' : 'Editar', 'aria-expanded': String(openItems.has(it)), onclick: () => { if (openItems.has(it)) openItems.delete(it); else openItems.add(it); paint(); } }, openItems.has(it) ? '▴' : '✎'));
        const item = el('div', { class: 'list-item' }, head);
        if (openItems.has(it)) item.append(el('div', { class: 'list-item__body' }, opts.render(it, () => { setTitle(); onChange(); }, i)));
        list.append(item);
      });
      box.append(list, el('button', { class: 'b b--ghost b--sm list-add', type: 'button', onclick: () => { const n = opts.create(); arr.push(n); openItems.add(n); onChange(); paint(); } }, opts.addLabel));
    }
    paint();
    return box;
  }

  /* ------------------------------------------------------------------ navegação */

  function setView(v) {
    view = v;
    renderSide();
    renderView();
    $('.side').classList.remove('is-open');
    window.scrollTo(0, 0);
  }

  function renderSide() {
    const nav = $('#side-nav');
    nav.innerHTML = '';
    const item = (label, v, small) => el('button', { class: 'side__item', type: 'button', 'aria-current': String(JSON.stringify(view) === JSON.stringify(v)), onclick: () => setView(v) },
      el('span', { text: label }), small ? el('small', { text: small }) : null);

    nav.append(el('p', { class: 'side__group', text: 'Páginas' }));
    content.pages.forEach((p) => nav.append(item(p.name || p.id, { kind: 'page', id: p.id }, '/' + (p.slug || ''))));
    nav.append(el('button', { class: 'side__item', type: 'button', onclick: addPage }, el('span', { text: '+ Nova página', style: 'color:var(--brand)' })));

    nav.append(el('p', { class: 'side__group', text: 'Configurações gerais' }));
    SCHEMAS.settings.forEach((g) => nav.append(item(g.label, { kind: 'settings', key: g.key })));

    nav.append(el('p', { class: 'side__group', text: 'Dados' }));
    nav.append(item('Leads (formulários)', { kind: 'leads' }));
    nav.append(item('Imagens enviadas', { kind: 'media' }));
    nav.append(item('Histórico / backups', { kind: 'backups' }));
    nav.append(item('Senha de acesso', { kind: 'account' }));
  }

  function updateSuggestions() {
    const dl = $('#link-suggestions');
    dl.innerHTML = '';
    const opts = new Set();
    content.pages.forEach((p) => {
      const base = '/' + (p.slug || '');
      opts.add(base);
      p.sections.forEach((s) => { if (s.data && s.data.anchor) opts.add((p.slug ? base : '/') + '#' + s.data.anchor); });
    });
    const C = content.settings.contact || {};
    if (C.email) opts.add('mailto:' + C.email);
    if (C.phoneHref) opts.add(C.phoneHref);
    opts.forEach((o) => dl.append(el('option', { value: o })));
  }

  function renderView() {
    updateSuggestions();
    const v = $('#view');
    v.innerHTML = '';
    if (view.kind === 'page') return renderPage(v);
    if (view.kind === 'settings') return renderSettings(v);
    if (view.kind === 'leads') return renderLeads(v);
    if (view.kind === 'media') return renderMedia(v);
    if (view.kind === 'backups') return renderBackups(v);
    if (view.kind === 'account') return renderAccount(v);
  }

  function setTitle(t, sub) {
    $('#view-title').textContent = t;
    $('#view-sub').textContent = sub || '';
  }

  /* ------------------------------------------------------------------ páginas */

  function renderPage(v) {
    const page = content.pages.find((p) => p.id === view.id) || content.pages[0];
    if (!page) return;
    const url = '/' + (page.slug || '');
    setTitle(page.name, `EN: ${url}   ·   ES: /es${url === '/' ? '/' : url}`);
    $('#preview-link').href = url;

    // configurações da página
    const det = el('details', { class: 'panel' },
      el('summary', { class: 'panel__head' }, el('h2', { text: 'Configurações da página (nome, endereço, SEO)' })),
      el('div', { class: 'panel__body' }, fields(SCHEMAS.page, page, () => { markDirty(); renderSide(); setTitle(page.name, ''); }),
        el('div', { class: 'row-actions', style: 'margin-top:18px' },
          el('button', { class: 'b b--ghost b--sm', type: 'button', onclick: () => duplicatePage(page) }, 'Duplicar página'),
          page.slug ? el('button', { class: 'b b--danger b--sm', type: 'button', onclick: () => deletePage(page) }, 'Excluir página') : null)));
    v.append(det);

    v.append(el('p', { class: 'hint', html: 'Arraste pelo <b>⋮⋮</b> (ou use ↑ ↓) para mudar a <b>ordem das seções</b>. O interruptor liga/desliga a seção no site. Clique na seção para editar textos, imagens e links. Nada é publicado até você clicar em <b>Salvar alterações</b>.' }));

    const listBox = el('div', { class: 'secs' });
    v.append(listBox);

    let dragFrom = null;
    page.sections.forEach((s, i) => {
      const type = SCHEMAS.types[s.type] || { label: s.type, fields: [] };
      const titleEl = el('div', { class: 'sec-card__title' });
      const refreshTitle = () => { titleEl.textContent = i18nText(s.data && s.data[type.summary || 'title']) || type.label; };
      refreshTitle();
      const isOpen = openSections.has(s.id);
      const toggleOpen = () => { if (openSections.has(s.id)) openSections.delete(s.id); else openSections.add(s.id); keepScroll(renderView); };

      const card = el('div', { class: 'sec-card' + (s.enabled === false ? ' is-off' : ''), 'data-i': i });
      const handle = el('span', { class: 'handle', title: 'Arraste para reordenar', 'aria-hidden': 'true', text: '⋮⋮' });
      handle.addEventListener('mousedown', () => { card.draggable = true; });
      handle.addEventListener('touchstart', () => { card.draggable = true; }, { passive: true });
      card.addEventListener('dragstart', (e) => { dragFrom = i; card.classList.add('is-dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)); });
      card.addEventListener('dragend', () => { card.draggable = false; card.classList.remove('is-dragging'); listBox.querySelectorAll('.sec-card').forEach((c) => c.classList.remove('drop-before', 'drop-after')); });
      card.addEventListener('dragover', (e) => {
        if (dragFrom == null) return;
        e.preventDefault();
        const r = card.getBoundingClientRect();
        const after = e.clientY > r.top + r.height / 2;
        listBox.querySelectorAll('.sec-card').forEach((c) => c.classList.remove('drop-before', 'drop-after'));
        card.classList.add(after ? 'drop-after' : 'drop-before');
      });
      card.addEventListener('drop', (e) => {
        e.preventDefault();
        if (dragFrom == null) return;
        const r = card.getBoundingClientRect();
        let to = i + (e.clientY > r.top + r.height / 2 ? 1 : 0);
        const moved = page.sections.splice(dragFrom, 1)[0];
        if (dragFrom < to) to--;
        page.sections.splice(to, 0, moved);
        dragFrom = null;
        markDirty();
        keepScroll(renderView);
      });

      const move = (d) => { const j = i + d; if (j < 0 || j >= page.sections.length) return; page.sections.splice(j, 0, page.sections.splice(i, 1)[0]); markDirty(); keepScroll(renderView); };

      card.append(el('div', { class: 'sec-card__head' },
        handle,
        el('span', { class: 'sec-card__pos', text: String(i + 1) }),
        el('div', { class: 'sec-card__info', onclick: toggleOpen }, el('div', { class: 'sec-card__type', text: type.label }), titleEl),
        el('div', { class: 'sec-card__tools' },
          el('label', { class: 'switch', title: 'Mostrar no site' }, el('input', { type: 'checkbox', checked: s.enabled !== false, onchange: (e) => { s.enabled = e.target.checked; card.classList.toggle('is-off', !s.enabled); markDirty(); } }), el('i'), el('span', { class: 'sr-only', text: 'Visível' })),
          el('button', { class: 'b b--icon', type: 'button', title: 'Mover para cima', 'aria-label': 'Mover para cima', disabled: i === 0 ? true : null, onclick: () => move(-1) }, '↑'),
          el('button', { class: 'b b--icon', type: 'button', title: 'Mover para baixo', 'aria-label': 'Mover para baixo', disabled: i === page.sections.length - 1 ? true : null, onclick: () => move(1) }, '↓'),
          el('button', { class: 'b b--icon', type: 'button', title: 'Duplicar seção', 'aria-label': 'Duplicar seção', onclick: () => { const c = clone(s); c.id = uid(s.type); page.sections.splice(i + 1, 0, c); openSections.add(c.id); markDirty(); keepScroll(renderView); } }, '⧉'),
          el('button', { class: 'b b--icon', type: 'button', title: 'Excluir seção', 'aria-label': 'Excluir seção', onclick: () => { if (confirm(`Excluir a seção "${titleEl.textContent}"?`)) { page.sections.splice(i, 1); markDirty(); keepScroll(renderView); } } }, '✕'),
          el('button', { class: 'b b--icon', type: 'button', title: isOpen ? 'Recolher' : 'Editar', 'aria-expanded': String(isOpen), onclick: toggleOpen }, isOpen ? '▴' : '✎'))));

      if (isOpen) {
        const body = el('div', { class: 'sec-card__body' });
        if (type.help) body.append(el('p', { class: 'hint', text: type.help }));
        body.append(fields(type.fields, s.data, () => { markDirty(); refreshTitle(); }));
        card.append(body);
      }
      listBox.append(card);
    });

    // adicionar seção
    const sel = el('select', { 'aria-label': 'Tipo de seção' }, Object.entries(SCHEMAS.types).map(([k, t]) => el('option', { value: k }, t.label)));
    v.append(el('div', { class: 'add-sec' }, sel, el('button', { class: 'b b--ghost', type: 'button', onclick: () => {
      const t = SCHEMAS.types[sel.value];
      const s = { id: uid(sel.value), type: sel.value, enabled: true, data: Object.assign(makeDefault(t.fields), clone(t.defaults || {})) };
      page.sections.push(s);
      openSections.add(s.id);
      markDirty();
      renderView();
      setTimeout(() => { const cards = document.querySelectorAll('.sec-card'); cards[cards.length - 1].scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 30);
    } }, '+ Adicionar seção')));
  }

  function keepScroll(fn) { const y = window.scrollY; fn(); window.scrollTo(0, y); }

  function addPage() {
    const name = prompt('Nome da nova página:');
    if (!name) return;
    let slug = prompt('Endereço (slug) da página — só letras minúsculas, números e hífens:', name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    if (slug == null) return;
    slug = slug.trim().replace(/^\/+|\/+$/g, '');
    if (content.pages.some((p) => (p.slug || '') === slug)) { toast('Já existe uma página com esse endereço.', true); return; }
    const id = uid('page');
    const T = SCHEMAS.types;
    content.pages.push({
      id, name, slug, seo: { title: { en: name, es: '' }, description: { en: '', es: '' } },
      sections: [
        { id: uid('pageHero'), type: 'pageHero', enabled: true, data: Object.assign(makeDefault(T.pageHero.fields), clone(T.pageHero.defaults), { title: { en: name, es: '' } }) },
        { id: uid('cta'), type: 'cta', enabled: true, data: Object.assign(makeDefault(T.cta.fields), clone(T.cta.defaults)) },
      ],
    });
    markDirty();
    setView({ kind: 'page', id });
  }
  function duplicatePage(page) {
    const c = clone(page);
    c.id = uid('page');
    c.name = page.name + ' (cópia)';
    c.slug = (page.slug || 'home') + '-copia';
    c.sections.forEach((s) => { s.id = uid(s.type); });
    content.pages.push(c);
    markDirty();
    setView({ kind: 'page', id: c.id });
  }
  function deletePage(page) {
    if (!confirm(`Excluir a página "${page.name}"? Links que apontam para ela deixarão de funcionar.`)) return;
    content.pages = content.pages.filter((p) => p !== page);
    markDirty();
    setView({ kind: 'page', id: content.pages[0].id });
  }

  /* ------------------------------------------------------------------ configurações */

  function renderSettings(v) {
    const g = SCHEMAS.settings.find((x) => x.key === view.key);
    setTitle(g.label, 'Vale para todas as páginas, nos dois idiomas.');
    $('#preview-link').href = '/';
    if (!content.settings[g.key]) content.settings[g.key] = makeDefault(g.fields);
    const hints = {
      tracking: 'O botão de envio de todos os formulários faz <code>dataLayer.push({ event, form_name, form_type, form_id, page_path, page_language })</code> quando o formulário é válido. Após a resposta do servidor dispara também <code>&lt;evento&gt;_success</code> ou <code>&lt;evento&gt;_error</code>. Nenhum dado pessoal (nome, e-mail, telefone) é enviado ao dataLayer.',
      header: 'Links internos começando com / são convertidos automaticamente para a versão em espanhol (/es/…) quando o visitante está em ES.',
      forms: 'Todos os envios ficam salvos em <b>Leads</b>. Para receber por e-mail/CRM, configure um webhook (Zapier, Make, n8n, HubSpot…).',
    };
    if (hints[g.key]) v.append(el('p', { class: 'hint', html: hints[g.key] }));
    v.append(el('div', { class: 'panel' }, el('div', { class: 'panel__body', style: 'border-top:0' }, fields(g.fields, content.settings[g.key], markDirty))));
  }

  /* ------------------------------------------------------------------ dados */

  async function renderLeads(v) {
    setTitle('Leads', 'Envios dos formulários de contato e newsletter.');
    v.append(el('div', { class: 'row-actions' }, el('a', { class: 'b b--ghost b--sm', href: '/api/leads.csv' }, 'Baixar CSV (Excel)'), el('button', { class: 'b b--ghost b--sm', type: 'button', onclick: renderView }, 'Atualizar')));
    const box = el('div', { class: 'tbl-wrap' }, el('p', { class: 'empty', text: 'Carregando…' }));
    v.append(box);
    try {
      const leads = await api('GET', '/api/leads');
      box.innerHTML = '';
      if (!leads.length) { box.append(el('p', { class: 'empty', text: 'Nenhum envio ainda. Os formulários do site aparecem aqui assim que alguém enviar.' })); return; }
      const fmt = (d) => new Date(d).toLocaleString('pt-BR');
      box.append(el('table', { class: 't' },
        el('thead', null, el('tr', null, ['Data', 'Tipo', 'Nome', 'E-mail', 'Telefone', 'Empresa', 'Cidade/Estado', 'Mensagem', 'Origem'].map((h) => el('th', { text: h })))),
        el('tbody', null, leads.map((l) => el('tr', null,
          el('td', { text: fmt(l.createdAt) }),
          el('td', null, el('span', { class: 'badge' + (l.type === 'newsletter' ? ' badge--news' : ''), text: l.type === 'newsletter' ? 'Newsletter' : 'Contato' })),
          el('td', { text: l.name }), el('td', null, el('a', { href: 'mailto:' + l.email, text: l.email })), el('td', { text: l.phone }),
          el('td', { text: l.company }), el('td', { text: [l.city, l.state].filter(Boolean).join(' / ') }),
          el('td', { class: 'msg', text: l.message }), el('td', { text: `${l.form || ''} · ${(l.lang || '').toUpperCase()} · ${l.page || ''}` }))))));
    } catch (e) { box.innerHTML = ''; box.append(el('p', { class: 'empty', text: e.message })); }
  }

  async function renderMedia(v) {
    setTitle('Imagens enviadas', 'Clique em "Copiar link" para reutilizar uma imagem em outro campo.');
    const box = el('div', { class: 'tbl-wrap' }, el('p', { class: 'empty', text: 'Carregando…' }));
    v.append(box);
    try {
      const files = await api('GET', '/api/uploads');
      box.innerHTML = '';
      if (!files.length) { box.append(el('p', { class: 'empty', text: 'Nenhuma imagem enviada ainda. Use o botão "Enviar imagem" em qualquer campo de imagem.' })); return; }
      box.append(el('table', { class: 't' },
        el('thead', null, el('tr', null, ['Prévia', 'Arquivo', 'Tamanho', ''].map((h) => el('th', { text: h })))),
        el('tbody', null, files.map((f) => el('tr', null,
          el('td', null, el('div', { class: 'img-prev', style: 'width:96px;height:64px' }, el('img', { src: f.url, alt: '' }))),
          el('td', null, el('a', { href: f.url, target: '_blank', rel: 'noopener', text: f.url })),
          el('td', { text: (f.size / 1024).toFixed(0) + ' KB' }),
          el('td', null, el('button', { class: 'b b--ghost b--sm', type: 'button', onclick: () => navigator.clipboard.writeText(f.url).then(() => toast('Link copiado.')) }, 'Copiar link')))))));
    } catch (e) { box.innerHTML = ''; box.append(el('p', { class: 'empty', text: e.message })); }
  }

  async function renderBackups(v) {
    setTitle('Histórico / backups', 'Uma cópia do conteúdo é guardada a cada salvamento (últimas 40).');
    v.append(el('div', { class: 'row-actions' },
      el('button', { class: 'b b--danger b--sm', type: 'button', onclick: async () => {
        if (!confirm('Substituir TODO o conteúdo pelo texto original do projeto? Um backup do conteúdo atual será criado antes.')) return;
        try { await api('POST', '/api/content/reset', {}); await reload(); toast('Conteúdo padrão restaurado.'); } catch (e) { toast(e.message, true); }
      } }, 'Restaurar conteúdo padrão')));
    const box = el('div', { class: 'tbl-wrap' }, el('p', { class: 'empty', text: 'Carregando…' }));
    v.append(box);
    try {
      const list = await api('GET', '/api/backups');
      box.innerHTML = '';
      if (!list.length) { box.append(el('p', { class: 'empty', text: 'Ainda não há backups. Eles são criados automaticamente a cada salvamento.' })); return; }
      const when = (n) => { const m = /content-(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/.exec(n); return m ? `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}:${m[6]} UTC` : n; };
      box.append(el('table', { class: 't' },
        el('thead', null, el('tr', null, ['Salvo em', 'Arquivo', ''].map((h) => el('th', { text: h })))),
        el('tbody', null, list.map((b) => el('tr', null, el('td', { text: when(b.name) }), el('td', { text: b.name }),
          el('td', null, el('button', { class: 'b b--ghost b--sm', type: 'button', onclick: async () => {
            if (dirty && !confirm('Há alterações não salvas que serão perdidas. Continuar?')) return;
            if (!confirm('Restaurar esta versão? O conteúdo atual vira um backup antes.')) return;
            try { await api('POST', '/api/backups/restore', { name: b.name }); await reload(); toast('Versão restaurada.'); } catch (e) { toast(e.message, true); }
          } }, 'Restaurar')))))));
    } catch (e) { box.innerHTML = ''; box.append(el('p', { class: 'empty', text: e.message })); }
  }

  function renderAccount(v) {
    setTitle('Senha de acesso', '');
    const cur = el('input', { type: 'password', autocomplete: 'current-password' });
    const nxt = el('input', { type: 'password', autocomplete: 'new-password', minlength: '8' });
    const nx2 = el('input', { type: 'password', autocomplete: 'new-password' });
    v.append(el('form', { class: 'panel', onsubmit: async (e) => {
      e.preventDefault();
      if (nxt.value !== nx2.value) { toast('As senhas novas não conferem.', true); return; }
      try { await api('POST', '/api/password', { current: cur.value, next: nxt.value }); toast('Senha alterada.'); e.target.reset(); } catch (err) { toast(err.message, true); }
    } }, el('div', { class: 'panel__body', style: 'border-top:0;max-width:420px' },
      el('div', { class: 'f' }, el('label', { text: 'Senha atual' }), cur),
      el('div', { class: 'f' }, el('label', { text: 'Nova senha (mín. 8 caracteres)' }), nxt),
      el('div', { class: 'f' }, el('label', { text: 'Repita a nova senha' }), nx2),
      el('div', { class: 'f' }, el('button', { class: 'b b--primary', type: 'submit' }, 'Alterar senha')))));
  }

  /* ------------------------------------------------------------------ salvar / sessão */

  async function save() {
    const btn = $('#save');
    btn.disabled = true; btn.textContent = 'Salvando…';
    try {
      const j = await api('PUT', '/api/content', content);
      content.updatedAt = j.updatedAt;
      clearDirty();
      toast('Alterações salvas e publicadas.');
    } catch (e) {
      toast(e.message, true);
      btn.disabled = false;
    }
    btn.textContent = 'Salvar alterações';
  }

  async function reload() {
    content = await api('GET', '/api/content');
    clearDirty();
    if (view.kind === 'page' && !content.pages.some((p) => p.id === view.id)) view = { kind: 'page', id: content.pages[0].id };
    renderSide();
    renderView();
  }

  function showLogin() {
    $('#app').hidden = true;
    $('#login').hidden = false;
    $('#pw').focus();
  }

  async function start() {
    try { const s = await api('GET', '/api/session'); if (s.uploadMax) uploadMax = s.uploadMax; } catch { /* usa o padrão */ }
    $('#login').hidden = true;
    $('#app').hidden = false;
    await reload();
  }

  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    $('#login-err').textContent = '';
    try { await api('POST', '/api/login', { password: $('#pw').value }); $('#pw').value = ''; await start(); }
    catch (err) { $('#login-err').textContent = err.message; }
  });
  $('#logout').addEventListener('click', async () => {
    if (dirty && !confirm('Há alterações não salvas. Sair mesmo assim?')) return;
    await api('POST', '/api/logout', {}).catch(() => {});
    clearDirty();
    showLogin();
  });
  $('#save').addEventListener('click', save);
  $('#side-toggle').addEventListener('click', () => $('.side').classList.toggle('is-open'));
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); if (dirty) save(); }
  });
  window.addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  fetch('/api/session', { credentials: 'same-origin' }).then((r) => (r.ok ? start() : showLogin())).catch(showLogin);
})();
