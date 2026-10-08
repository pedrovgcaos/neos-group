// Armazenamento do conteúdo, leads, backups, senha e imagens enviadas.
//  - Local / VPS: pasta data/ (padrão)
//  - Vercel: Vercel Blob PRIVADO (ativado automaticamente quando existe BLOB_READ_WRITE_TOKEN)
const fs = require('fs');
const path = require('path');

const MIME = {
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.avif': 'image/avif',
};
const leadName = (lead) => `${lead.createdAt.replace(/[:.]/g, '-')}-${lead.id}.json`;

/* ------------------------------------------------------------------ disco local */

function fsStorage(dataDir) {
  const UPLOADS = path.join(dataDir, 'uploads');
  const BACKUPS = path.join(dataDir, 'backups');
  const LEADS = path.join(dataDir, 'leads');
  for (const d of [dataDir, UPLOADS, BACKUPS, LEADS]) fs.mkdirSync(d, { recursive: true });

  const write = (file, text) => {
    const tmp = file + '.' + process.pid + '.tmp';
    fs.writeFileSync(tmp, text);
    fs.renameSync(tmp, file);
  };
  const read = (file) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; } };

  // migração: versões antigas guardavam todos os leads em data/leads.json
  const legacy = path.join(dataDir, 'leads.json');
  if (fs.existsSync(legacy)) {
    (read(legacy) || []).forEach((l) => write(path.join(LEADS, leadName(l)), JSON.stringify(l)));
    fs.renameSync(legacy, legacy + '.migrado');
  }

  return {
    kind: 'fs',
    uploadsDir: UPLOADS,
    async getJSON(key) { return read(path.join(dataDir, key + '.json')); },
    async setJSON(key, obj) { write(path.join(dataDir, key + '.json'), JSON.stringify(obj, null, 2)); },

    async addLead(lead) { write(path.join(LEADS, leadName(lead)), JSON.stringify(lead)); },
    async listLeads() {
      return fs.readdirSync(LEADS).filter((f) => f.endsWith('.json')).sort().reverse()
        .map((f) => read(path.join(LEADS, f))).filter(Boolean);
    },

    async deleteLead(id) {
      const f = fs.readdirSync(LEADS).find((x) => x.endsWith(`-${id}.json`));
      if (f) fs.unlinkSync(path.join(LEADS, f));
      return !!f;
    },

    async saveBackup(name, obj) { write(path.join(BACKUPS, name), JSON.stringify(obj)); },
    async listBackups() {
      return fs.readdirSync(BACKUPS).filter((f) => /^content-.*\.json$/.test(f)).sort().reverse()
        .map((name) => ({ name, size: fs.statSync(path.join(BACKUPS, name)).size }));
    },
    async getBackup(name) { return read(path.join(BACKUPS, path.basename(name))); },
    async deleteBackup(name) { try { fs.unlinkSync(path.join(BACKUPS, path.basename(name))); } catch { /* já removido */ } },

    async saveUpload(fname, buf) { fs.writeFileSync(path.join(UPLOADS, fname), buf); return '/uploads/' + fname; },
    async listUploads() {
      return fs.readdirSync(UPLOADS).filter((f) => !f.startsWith('.')).map((f) => {
        const st = fs.statSync(path.join(UPLOADS, f));
        return { url: '/uploads/' + f, size: st.size, mtime: st.mtimeMs };
      }).sort((a, b) => b.mtime - a.mtime);
    },
    async deleteUpload(fname) {
      const file = path.join(UPLOADS, path.basename(fname));
      if (!fs.existsSync(file)) return false;
      fs.unlinkSync(file);
      return true;
    },
    readUpload: null, // servido direto do disco pelo servidor
  };
}

/* ------------------------------------------------------------------ Vercel Blob (privado) */

function blobStorage() {
  const B = require('@vercel/blob');

  async function getText(pathname, useCache) {
    try {
      const r = await B.get(pathname, { access: 'private', useCache });
      if (!r || r.statusCode !== 200 || !r.stream) return null;
      return await new Response(r.stream).text();
    } catch (e) {
      if (e && /not.?found/i.test(e.name + e.message)) return null;
      throw e;
    }
  }
  const putText = (pathname, text) => B.put(pathname, text, {
    access: 'private', allowOverwrite: true, addRandomSuffix: false, contentType: 'application/json', cacheControlMaxAge: 60,
  });
  async function listAll(prefix) {
    const out = [];
    let cursor;
    do {
      const r = await B.list({ prefix, cursor, limit: 1000 });
      out.push(...r.blobs);
      cursor = r.hasMore ? r.cursor : undefined;
    } while (cursor);
    return out;
  }
  async function mapLimit(items, n, fn) {
    const out = new Array(items.length);
    let i = 0;
    await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) { const k = i++; out[k] = await fn(items[k]); }
    }));
    return out;
  }

  return {
    kind: 'blob',
    async getJSON(key) { const t = await getText(`data/${key}.json`, false); return t ? JSON.parse(t) : null; },
    async setJSON(key, obj) { await putText(`data/${key}.json`, JSON.stringify(obj)); },

    async addLead(lead) { await putText(`data/leads/${leadName(lead)}`, JSON.stringify(lead)); },
    async listLeads() {
      const blobs = (await listAll('data/leads/')).sort((a, b) => (a.pathname < b.pathname ? 1 : -1));
      const items = await mapLimit(blobs, 8, async (b) => { const t = await getText(b.pathname, true); return t ? JSON.parse(t) : null; });
      return items.filter(Boolean);
    },

    async deleteLead(id) {
      const b = (await listAll('data/leads/')).find((x) => x.pathname.endsWith(`-${id}.json`));
      if (b) await B.del(b.url);
      return !!b;
    },

    async saveBackup(name, obj) { await putText(`data/backups/${name}`, JSON.stringify(obj)); },
    async listBackups() {
      return (await listAll('data/backups/')).map((b) => ({ name: b.pathname.slice('data/backups/'.length), size: b.size, url: b.url }))
        .filter((b) => /^content-.*\.json$/.test(b.name)).sort((a, b) => (a.name < b.name ? 1 : -1));
    },
    async getBackup(name) { const t = await getText(`data/backups/${path.basename(name)}`, true); return t ? JSON.parse(t) : null; },
    async deleteBackup(name) {
      const b = (await this.listBackups()).find((x) => x.name === name);
      if (b) await B.del(b.url);
    },

    async saveUpload(fname, buf, contentType) {
      await B.put(`uploads/${fname}`, buf, { access: 'private', addRandomSuffix: false, contentType });
      return '/uploads/' + fname;
    },
    async listUploads() {
      return (await listAll('uploads/')).map((b) => ({ url: '/' + b.pathname, size: b.size, mtime: new Date(b.uploadedAt).getTime() }))
        .sort((a, b) => b.mtime - a.mtime);
    },
    async deleteUpload(fname) {
      const b = (await listAll('uploads/')).find((x) => x.pathname === `uploads/${path.basename(fname)}`);
      if (b) await B.del(b.url);
      return !!b;
    },
    // imagens privadas são entregues pela função, com cache longo na CDN (nomes são únicos)
    async readUpload(fname) {
      const r = await B.get(`uploads/${path.basename(fname)}`, { access: 'private' }).catch(() => null);
      if (!r || r.statusCode !== 200) return null;
      return { stream: r.stream, contentType: r.blob.contentType || MIME[path.extname(fname).toLowerCase()] || 'application/octet-stream' };
    },
  };
}

module.exports = function createStorage(dataDir) {
  return process.env.BLOB_READ_WRITE_TOKEN ? blobStorage() : fsStorage(dataDir);
};
