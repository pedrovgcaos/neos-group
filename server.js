// Neos Group — servidor do site + painel admin.
//   npm start  → http://localhost:3000   (admin em /admin)
// Roda como servidor Node comum (local/VPS) ou como função da Vercel (api/index.js).
// Variáveis de ambiente: PORT, DATA_DIR, ADMIN_PASSWORD, ADMIN_PASSWORD_RESET, SITE_URL, BLOB_READ_WRITE_TOKEN
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const { renderPage, render404, pageUrl, LANGS } = require('./lib/render');
const buildSeed = require('./lib/seed');
const createStorage = require('./lib/storage');

const ROOT = __dirname;
const DATA = path.resolve(process.env.DATA_DIR || path.join(ROOT, 'data'));
const PUBLIC = path.join(ROOT, 'public');
const ADMIN = path.join(ROOT, 'admin');
const SESSION_HOURS = 12;
const MAX_BACKUPS = 40;
const CONTENT_TTL = process.env.BLOB_READ_WRITE_TOKEN ? 5000 : Infinity; // várias instâncias na Vercel → relê a cada 5 s

/* ------------------------------------------------------------------ storage */

if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('Vercel sem BLOB_READ_WRITE_TOKEN: conecte um Blob store (privado) ao projeto.');
}
const store = createStorage(DATA);

let contentCache = null;
let contentAt = 0;
async function getContent() {
  if (contentCache && Date.now() - contentAt < CONTENT_TTL) return contentCache;
  let c = await store.getJSON('content');
  if (!c) { c = buildSeed(); await store.setJSON('content', c); }
  contentCache = c;
  contentAt = Date.now();
  return c;
}
async function setContent(c) {
  await store.setJSON('content', c);
  contentCache = c;
  contentAt = Date.now();
}

function hashPassword(pw, salt = crypto.randomBytes(16).toString('hex')) {
  return { salt, hash: crypto.scryptSync(String(pw), salt, 64).toString('hex') };
}
async function checkPassword(pw) {
  const a = await store.getJSON('auth');
  if (!a) return false;
  const h = crypto.scryptSync(String(pw), a.salt, 64);
  const ref = Buffer.from(a.hash, 'hex');
  return h.length === ref.length && crypto.timingSafeEqual(h, ref);
}

let SECRET = null;
let readyPromise = null;
function ready() {
  if (!readyPromise) {
    readyPromise = (async () => {
      let s = await store.getJSON('secret');
      if (!s) { s = { key: crypto.randomBytes(32).toString('hex') }; await store.setJSON('secret', s); }
      SECRET = s.key;

      const hasAuth = !!(await store.getJSON('auth'));
      if (!hasAuth || process.env.ADMIN_PASSWORD_RESET) {
        if (process.env.ADMIN_PASSWORD) {
          await store.setJSON('auth', hashPassword(process.env.ADMIN_PASSWORD));
        } else if (store.kind === 'fs') {
          const pw = crypto.randomBytes(6).toString('base64url');
          await store.setJSON('auth', hashPassword(pw));
          fs.writeFileSync(path.join(DATA, 'admin-password.txt'), `Senha inicial do painel /admin: ${pw}\nTroque em Configurações > Senha e apague este arquivo.\n`);
          console.log(`\n  Senha inicial do admin: ${pw}  (salva em data/admin-password.txt)\n`);
        } else {
          console.error('Defina a variável ADMIN_PASSWORD para criar a senha do painel.');
        }
      }
      await getContent();
    })().catch((e) => { readyPromise = null; throw e; });
  }
  return readyPromise;
}

/* ------------------------------------------------------------------ sessions */

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return body + '.' + mac;
}
function verify(token) {
  if (!token || !token.includes('.')) return null;
  const [body, mac] = token.split('.');
  const expect = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  if (mac.length !== expect.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expect))) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString());
    return p.exp > Date.now() ? p : null;
  } catch { return null; }
}
function cookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}
const isHttps = (req) => req.headers['x-forwarded-proto'] === 'https' || !!(req.socket && req.socket.encrypted);
const authed = (req) => !!verify(cookies(req).neos_admin);

/* ------------------------------------------------------------------ rate limit */

const buckets = new Map();
function limited(key, max, windowMs) {
  const now = Date.now();
  const b = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  b.push(now);
  buckets.set(key, b);
  return b.length > max;
}
setInterval(() => buckets.clear(), 60 * 60 * 1000).unref();
const ipOf = (req) => String(req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || '').split(',')[0].trim();

/* ------------------------------------------------------------------ helpers */

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon', '.avif': 'image/avif',
  '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.pdf': 'application/pdf',
};
const SVG_CSP = "default-src 'none'; style-src 'unsafe-inline'";

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', ...headers });
  res.end(body);
}
const json = (res, status, obj) => send(res, status, JSON.stringify(obj), { 'Content-Type': MIME['.json'], 'Cache-Control': 'no-store' });

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(Object.assign(new Error('Arquivo grande demais.'), { status: 413 })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}
async function readJsonBody(req, limit = 100 * 1024) {
  const raw = await readBody(req, limit);
  try { return JSON.parse(raw || '{}'); } catch { throw Object.assign(new Error('JSON inválido'), { status: 400 }); }
}

function serveFile(req, res, baseDir, rel, cache) {
  const file = path.normalize(path.join(baseDir, rel));
  if (!file.startsWith(baseDir + path.sep) && file !== baseDir) return false;
  let stat;
  try { stat = fs.statSync(file); } catch { return false; }
  if (!stat.isFile()) return false;
  const ext = path.extname(file).toLowerCase();
  const etag = `"${stat.size.toString(36)}-${stat.mtimeMs.toString(36)}"`;
  const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': cache, ETag: etag };
  if (ext === '.svg') headers['Content-Security-Policy'] = SVG_CSP;
  if (req.headers['if-none-match'] === etag) { send(res, 304, '', headers); return true; }
  res.writeHead(200, { 'X-Content-Type-Options': 'nosniff', ...headers, 'Content-Length': stat.size });
  if (req.method === 'HEAD') res.end(); else fs.createReadStream(file).pipe(res);
  return true;
}

function origin(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, '');
  return (isHttps(req) ? 'https' : 'http') + '://' + (req.headers['x-forwarded-host'] || req.headers.host || 'localhost');
}

// versão dos arquivos CSS/JS (quebra o cache do navegador quando mudam)
function assetVersion() {
  if (process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_GIT_COMMIT_SHA) {
    return String(process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_GIT_COMMIT_SHA).slice(-10);
  }
  try {
    return ['css/site.css', 'js/site.js'].map((f) => fs.statSync(path.join(PUBLIC, 'assets', f)).mtimeMs.toString(36).replace('.', '')).join('');
  } catch { return '1'; }
}

function stamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
}
async function backupCurrent(reason) {
  const name = `content-${stamp()}-${crypto.randomBytes(2).toString('hex')}${reason ? '-' + reason : ''}.json`;
  await store.saveBackup(name, await getContent());
  const old = (await store.listBackups()).slice(MAX_BACKUPS);
  for (const b of old) await store.deleteBackup(b.name);
}

function validateContent(c) {
  if (!c || typeof c !== 'object') return 'Conteúdo vazio.';
  if (!c.settings || typeof c.settings !== 'object') return 'Configurações ausentes.';
  if (!Array.isArray(c.pages) || !c.pages.length) return 'Nenhuma página.';
  const slugs = new Set();
  for (const p of c.pages) {
    if (!p.id || !Array.isArray(p.sections)) return `Página inválida: ${p.name || p.id}`;
    const slug = String(p.slug || '');
    if (!/^[a-z0-9-]*(\/[a-z0-9-]+)*$/.test(slug)) return `Slug inválido na página "${p.name}": use letras minúsculas, números e hífens.`;
    if (slug === 'es' || slug.startsWith('es/') || /^(admin|api|assets|uploads|lib)(\/|$)/.test(slug)) return `Slug reservado na página "${p.name}".`;
    if (slugs.has(slug)) return `Slug repetido: "${slug || '(home)'}".`;
    slugs.add(slug);
  }
  if (!slugs.has('')) return 'É necessário ter uma página com slug vazio (página inicial).';
  return null;
}

function csvCell(v) {
  const s = String(v == null ? '' : v);
  return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

/* ------------------------------------------------------------------ API */

const UPLOAD_TYPES = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'image/gif': '.gif', 'image/svg+xml': '.svg', 'image/x-icon': '.ico', 'image/vnd.microsoft.icon': '.ico', 'image/avif': '.avif' };
// a Vercel aceita no máximo 4,5 MB por requisição; o painel reduz as fotos antes de enviar
const UPLOAD_MAX = store.kind === 'blob' ? 3.2 * 1024 * 1024 : 10 * 1024 * 1024;

async function api(req, res, p) {
  const method = req.method;

  // ---- público
  if (p === '/api/lead' && method === 'POST') {
    if (limited('lead:' + ipOf(req), 8, 10 * 60 * 1000)) return json(res, 429, { ok: false, error: 'Too many requests' });
    const b = await readJsonBody(req, 50 * 1024);
    if (b.website) return json(res, 200, { ok: true }); // honeypot
    const clip = (v, n = 500) => String(v == null ? '' : v).trim().slice(0, n);
    const lead = {
      id: crypto.randomUUID(), createdAt: new Date().toISOString(),
      type: b.type === 'newsletter' ? 'newsletter' : 'contact',
      form: clip(b.form, 60), page: clip(b.page, 200), lang: LANGS.includes(b.lang) ? b.lang : 'en',
      name: clip(b.name, 120), email: clip(b.email, 160), phone: clip(b.phone, 40), company: clip(b.company, 160),
      city: clip(b.city, 80), state: clip(b.state, 80), message: clip(b.message, 5000),
    };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) return json(res, 400, { ok: false, error: 'email' });
    if (lead.type === 'contact' && (!lead.name || !lead.message)) return json(res, 400, { ok: false, error: 'required' });
    await store.addLead(lead);
    const content = await getContent();
    const hook = content.settings.forms && content.settings.forms.webhookUrl;
    if (hook && /^https:\/\//.test(hook)) {
      // aguarda (máx. 5 s) para a função serverless não ser encerrada antes do envio
      await fetch(hook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead), signal: AbortSignal.timeout(5000) })
        .catch((e) => console.error('Webhook falhou:', e.message));
    }
    return json(res, 200, { ok: true });
  }

  if (p === '/api/login' && method === 'POST') {
    if (limited('login:' + ipOf(req), 10, 15 * 60 * 1000)) return json(res, 429, { ok: false, error: 'Muitas tentativas. Aguarde 15 minutos.' });
    const b = await readJsonBody(req);
    if (!(await store.getJSON('auth'))) return json(res, 503, { ok: false, error: 'Senha do painel não configurada. Defina a variável ADMIN_PASSWORD no servidor.' });
    if (!(await checkPassword(b.password || ''))) return json(res, 401, { ok: false, error: 'Senha incorreta.' });
    const token = sign({ exp: Date.now() + SESSION_HOURS * 3600e3 });
    return send(res, 200, JSON.stringify({ ok: true }), {
      'Content-Type': MIME['.json'], 'Cache-Control': 'no-store',
      'Set-Cookie': `neos_admin=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}${isHttps(req) ? '; Secure' : ''}`,
    });
  }
  if (p === '/api/logout' && method === 'POST') {
    return send(res, 200, '{"ok":true}', { 'Content-Type': MIME['.json'], 'Cache-Control': 'no-store', 'Set-Cookie': 'neos_admin=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0' });
  }

  // ---- protegido
  if (!authed(req)) return json(res, 401, { ok: false, error: 'Não autenticado.' });
  if (method !== 'GET' && !/^application\/json/.test(req.headers['content-type'] || '')) return json(res, 415, { ok: false, error: 'Content-Type deve ser JSON.' });

  if (p === '/api/session' && method === 'GET') return json(res, 200, { ok: true, storage: store.kind, uploadMax: UPLOAD_MAX });

  if (p === '/api/content' && method === 'GET') {
    contentAt = 0; // o painel sempre lê a versão mais recente
    return json(res, 200, await getContent());
  }

  if (p === '/api/content' && method === 'PUT') {
    const b = await readJsonBody(req, 4 * 1024 * 1024);
    const err = validateContent(b);
    if (err) return json(res, 400, { ok: false, error: err });
    await backupCurrent();
    b.updatedAt = new Date().toISOString();
    await setContent(b);
    return json(res, 200, { ok: true, updatedAt: b.updatedAt });
  }

  if (p === '/api/content/reset' && method === 'POST') {
    await backupCurrent('antes-reset');
    await setContent(buildSeed());
    return json(res, 200, { ok: true });
  }

  if (p === '/api/upload' && method === 'POST') {
    const b = await readJsonBody(req, Math.ceil(UPLOAD_MAX * 1.4) + 4096);
    const m = /^data:([\w/+.-]+);base64,(.+)$/.exec(b.dataUrl || '');
    if (!m || !UPLOAD_TYPES[m[1]]) return json(res, 400, { ok: false, error: 'Formato não suportado. Use PNG, JPG, WEBP, GIF, SVG, AVIF ou ICO.' });
    const buf = Buffer.from(m[2], 'base64');
    if (buf.length > UPLOAD_MAX) return json(res, 413, { ok: false, error: `Arquivo acima de ${(UPLOAD_MAX / 1048576).toFixed(1)} MB.` });
    const baseName = String(b.name || 'imagem').replace(/\.[^.]+$/, '').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'imagem';
    const fname = `${baseName}-${crypto.randomBytes(4).toString('hex')}${UPLOAD_TYPES[m[1]]}`;
    const url = await store.saveUpload(fname, buf, m[1]);
    return json(res, 200, { ok: true, url });
  }

  if (p === '/api/uploads' && method === 'GET') return json(res, 200, await store.listUploads());

  if (p === '/api/leads' && method === 'GET') return json(res, 200, await store.listLeads());
  if (p === '/api/leads.csv' && method === 'GET') {
    const cols = ['createdAt', 'type', 'form', 'lang', 'name', 'email', 'phone', 'company', 'city', 'state', 'message', 'page'];
    const leads = await store.listLeads();
    const csv = '﻿' + [cols.join(';'), ...leads.map((l) => cols.map((c) => csvCell(l[c])).join(';'))].join('\r\n');
    return send(res, 200, csv, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="leads-neos-${stamp()}.csv"`, 'Cache-Control': 'no-store' });
  }

  if (p === '/api/backups' && method === 'GET') {
    return json(res, 200, (await store.listBackups()).map(({ name, size }) => ({ name, size })));
  }
  if (p === '/api/backups/restore' && method === 'POST') {
    const b = await readJsonBody(req);
    const name = path.basename(String(b.name || ''));
    if (!/^content-.*\.json$/.test(name)) return json(res, 404, { ok: false, error: 'Backup não encontrado.' });
    const data = await store.getBackup(name);
    if (!data) return json(res, 404, { ok: false, error: 'Backup não encontrado.' });
    const err = validateContent(data);
    if (err) return json(res, 400, { ok: false, error: err });
    await backupCurrent('antes-restaurar');
    await setContent(data);
    return json(res, 200, { ok: true });
  }

  if (p === '/api/password' && method === 'POST') {
    const b = await readJsonBody(req);
    if (!(await checkPassword(b.current || ''))) return json(res, 400, { ok: false, error: 'Senha atual incorreta.' });
    if (String(b.next || '').length < 8) return json(res, 400, { ok: false, error: 'A nova senha precisa ter pelo menos 8 caracteres.' });
    await store.setJSON('auth', hashPassword(b.next));
    if (store.kind === 'fs') { try { fs.unlinkSync(path.join(DATA, 'admin-password.txt')); } catch { /* já removido */ } }
    return json(res, 200, { ok: true });
  }

  return json(res, 404, { ok: false, error: 'Rota não encontrada.' });
}

/* ------------------------------------------------------------------ router */

function sitemap(req, content) {
  const o = origin(req);
  const urls = content.pages.map((pg) => {
    const alts = LANGS.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${o}${pageUrl(pg.slug, l)}"/>`).join('');
    return LANGS.map((l) => `<url><loc>${o}${pageUrl(pg.slug, l)}</loc>${alts}<lastmod>${(content.updatedAt || new Date().toISOString()).slice(0, 10)}</lastmod></url>`).join('');
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`;
}

// Na Vercel as páginas ficam alguns segundos em cache na CDN (alterações do painel aparecem em até ~1 min)
const PAGE_CACHE = process.env.VERCEL ? 'public, max-age=0, s-maxage=10, stale-while-revalidate=60' : 'no-cache';

async function handle(req, res) {
  const u = new URL(req.url, 'http://x');
  let p;
  try { p = decodeURIComponent(u.pathname); } catch { return send(res, 400, 'Bad request'); }

  // arquivos estáticos (na Vercel /assets é servido direto pela CDN)
  if (req.method === 'GET' || req.method === 'HEAD') {
    if (p.startsWith('/assets/') && serveFile(req, res, PUBLIC, p, 'public, max-age=86400')) return;
    if (/^\/lib\/(schemas|icons)\.js$/.test(p) && serveFile(req, res, ROOT, p, 'no-cache')) return;
    if (p === '/admin') return send(res, 301, '', { Location: '/admin/' });
    if (p.startsWith('/admin/')) {
      const rel = p === '/admin/' ? '/index.html' : p.slice('/admin'.length);
      if (serveFile(req, res, ADMIN, rel, 'no-cache')) return;
    }
  }

  await ready();

  if (p.startsWith('/api/')) return api(req, res, p);
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');

  if (p.startsWith('/uploads/')) {
    const fname = p.slice('/uploads/'.length);
    if (store.kind === 'fs') {
      if (serveFile(req, res, store.uploadsDir, '/' + fname, 'public, max-age=604800')) return;
    } else {
      const f = await store.readUpload(fname);
      if (f) {
        const headers = { 'Content-Type': f.contentType, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' };
        if (/svg/.test(f.contentType)) headers['Content-Security-Policy'] = SVG_CSP;
        res.writeHead(200, headers);
        if (req.method === 'HEAD') return res.end();
        const { Readable } = require('stream');
        return Readable.fromWeb(f.stream).pipe(res);
      }
    }
    return send(res, 404, 'Not found', { 'Content-Type': MIME['.txt'] });
  }

  const content = await getContent();
  if (p === '/favicon.ico') {
    const fav = content.settings.brand && content.settings.brand.favicon;
    return send(res, 302, '', { Location: fav || '/assets/img/favicon.svg' });
  }
  if (p === '/robots.txt') return send(res, 200, `User-agent: *\nDisallow: /admin/\nDisallow: /api/\nSitemap: ${origin(req)}/sitemap.xml\n`, { 'Content-Type': MIME['.txt'] });
  if (p === '/sitemap.xml') return send(res, 200, sitemap(req, content), { 'Content-Type': MIME['.xml'], 'Cache-Control': PAGE_CACHE });

  // páginas
  let lang = 'en';
  let slug = p;
  if (p === '/es') return send(res, 301, '', { Location: '/es/' });
  if (p.startsWith('/es/')) { lang = 'es'; slug = p.slice(3); }
  slug = slug.replace(/^\/+|\/+$/g, '');
  const page = content.pages.find((pg) => (pg.slug || '') === slug);
  const headers = { 'Content-Type': MIME['.html'], 'Content-Language': lang };
  if (!page) return send(res, 404, render404({ content, lang, origin: origin(req), assetV: assetVersion() }), { ...headers, 'Cache-Control': 'no-cache' });
  return send(res, 200, renderPage({ content, page, lang, origin: origin(req), assetV: assetVersion() }), { ...headers, 'Cache-Control': PAGE_CACHE });
}

function handler(req, res) {
  return handle(req, res).catch((e) => {
    if (!e.status || e.status >= 500) console.error(e);
    if (!res.headersSent) json(res, e.status || 500, { ok: false, error: e.status ? e.message : 'Erro interno.' });
  });
}

module.exports = handler;

if (require.main === module) {
  const PORT = Number(process.env.PORT) || 3000;
  ready().then(() => {
    http.createServer(handler).listen(PORT, () => {
      console.log(`Neos Group rodando em http://localhost:${PORT}  (admin: http://localhost:${PORT}/admin/)`);
    });
  });
}
