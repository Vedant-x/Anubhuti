/* Anubhuti — storage and platform capabilities.
   Inside a Claude artifact viewer: private per-user cloud storage (db), uploaded
   floor plans (assets), downloads, Ask Anubhuti (sample), voice (dictation, tts).
   Anywhere else (a saved file, GitHub Pages): browser storage and native downloads. */
(function (G) {
  const D = (G.Disha = G.Disha || {});
  const LS_KEY = 'disha:v1';
  const listeners = new Set();
  const EXTRA = { clients: 'c_', reminders: 'r_', readings: 't_' }; // simple collections
  const state = { profiles: [], projects: [], clients: [], reminders: [], readings: [], settings: {}, mode: 'local', cloudNote: '' };
  const caps = { db: null, user: null, assets: null, downloads: null, sample: null, tts: null, dictation: null, sampleImages: false, sampleTools: false };
  const hasClaude = typeof window !== 'undefined' && window.claude && typeof window.claude.use === 'function';
  let uid = null, unsub = null, cloudReady = false;

  const uidGen = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  function emit() { listeners.forEach((fn) => { try { fn(state); } catch (e) { console.error(e); } }); }

  const extras = () => { const o = {}; for (const k in EXTRA) o[k] = state[k]; return o; };
  /* ---------- local ---------- */
  function loadLocal() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) { const j = JSON.parse(raw); state.profiles = j.profiles || []; state.projects = j.projects || []; state.settings = j.settings || {}; for (const k in EXTRA) state[k] = j[k] || []; }
    } catch (e) { /* storage blocked: start empty */ }
  }
  function saveLocal() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(Object.assign({ profiles: state.profiles, projects: state.projects, settings: state.settings }, extras())));
      return true;
    } catch (e) {
      try { // retry without embedded images when the quota is full
        const slim = state.projects.map((p) => (p.image && p.image.data ? { ...p, image: { ...p.image, data: null, dropped: true } } : p));
        localStorage.setItem(LS_KEY, JSON.stringify(Object.assign({ profiles: state.profiles, projects: slim, settings: state.settings }, extras())));
        D.toast && D.toast('Browser storage is full, so floor plan images were not saved.');
      } catch (e2) { /* ignore */ }
      return false;
    }
  }

  /* ---------- cloud (db) ---------- */
  const writeChains = {};
  const pending = {};
  const dirty = new Set();
  const pendingTimer = (id) => !!pending[id];
  function docRef(id) { return caps.db.collection('data/users/' + uid).doc(id); }
  function cloudWrite(id, body, debounceMs) {
    if (!cloudReady) return;
    clearTimeout(pending[id]);
    dirty.add(id);
    pending[id] = setTimeout(() => {
      pending[id] = null;
      const prev = writeChains[id] || Promise.resolve();
      const p = prev.then(() => (body === null ? docRef(id).delete() : docRef(id).set(JSON.parse(JSON.stringify(body)))));
      const settled = (writeChains[id] = p.catch(() => {}));
      settled.then(() => { if (writeChains[id] === settled && !pendingTimer(id)) dirty.delete(id); });
      p.catch((e) => {
          console.warn('save failed', id, e);
          if (e && e.code === 'invalid_argument' && JSON.stringify(body || {}).length < 250000 && cloudReady) {
            cloudReady = false; state.mode = 'local'; unsub && unsub(); saveLocal();
            state.cloudNote = 'This page can’t save to your account (view-only access), so Anubhuti saves in this browser.'; emit();
            return;
          }
          if (e && e.code === 'quota_exceeded') D.toast && D.toast('Cloud storage is full. Delete an old project or profile.');
          else if (e && e.code === 'invalid_argument' && body && JSON.stringify(body).length > 250000) D.toast && D.toast('That item is too large to save to the cloud.');
        });
    }, debounceMs || 0);
  }
  function applyDocs(snap) {
    const profiles = [], projects = []; let settings = null; const imgs = {}; const ex = {}; for (const k in EXTRA) ex[k] = [];
    snap.docs.forEach((d) => {
      const raw = d.data(); if (!raw) return;
      const v = JSON.parse(JSON.stringify(raw)); // snapshots are frozen; keep an editable copy
      if (d.id === 'settings') settings = v;
      else if (d.id.startsWith('p_')) profiles.push(v);
      else if (d.id.startsWith('v_')) projects.push(v);
      else if (d.id.startsWith('img_')) imgs[d.id.slice(4)] = v.data;
      else { for (const k in EXTRA) if (d.id.startsWith(EXTRA[k])) ex[k].push(v); }
    });
    projects.forEach((p) => { if (p.image && p.image.doc && imgs[p.id]) p.image = { ...p.image, data: imgs[p.id] }; });
    return Object.assign({ profiles, projects, settings }, ex);
  }
  async function initCloud() {
    if (!caps.db || !caps.user) return;
    try { uid = await caps.user.id(); } catch (e) { uid = null; }
    if (!uid) return;
    try { if ((await caps.user.can('data.write')) === false) { state.cloudNote = 'Saved in this browser (you have view-only access to this page)'; emit(); return; } } catch (e) { /* unknown: try cloud */ }
    let first = true;
    const timer = setTimeout(() => { if (first) { state.cloudNote = 'Cloud sync is taking a while; working from this browser for now.'; emit(); } }, 10000);
    const adopt = (got) => {
      // items with unsaved local edits keep their local version
      const keep = (list, prefix, incoming) => {
        const byId = Object.fromEntries(list.map((x) => [x.id, x]));
        const out = incoming.map((x) => (dirty.has(prefix + x.id) && byId[x.id] ? byId[x.id] : x));
        list.forEach((x) => { if (dirty.has(prefix + x.id) && !out.find((y) => y.id === x.id)) out.push(x); });
        return out;
      };
      state.profiles = keep(state.profiles, 'p_', got.profiles).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      const localImg = Object.fromEntries(state.projects.map((p) => [p.id, p.image]));
      state.projects = keep(state.projects, 'v_', got.projects)
        .map((p) => (p.image && !p.image.data && !p.image.url && !p.image.asset && localImg[p.id] ? { ...p, image: localImg[p.id] } : p))
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      for (const k in EXTRA) state[k] = keep(state[k], EXTRA[k], got[k]).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      if (got.settings && !dirty.has('settings')) state.settings = got.settings;
      saveLocal(); emit();
    };
    unsub = caps.db.collection('data/users/' + uid).onSnapshot((snap) => {
      const got = applyDocs(snap);
      if (first && snap.metadata.fromCache) { if (got.profiles.length || got.projects.length) adopt(got); return; }
      if (first) {
        first = false; clearTimeout(timer); cloudReady = true; state.mode = 'cloud'; state.cloudNote = '';
        const empty = !got.profiles.length && !got.projects.length && !got.settings && Object.keys(EXTRA).every((k) => !got[k].length);
        if (empty && (state.profiles.length || state.projects.length || Object.keys(EXTRA).some((k) => state[k].length))) {
          // first visit with cloud: move this browser's data up
          state.profiles.forEach((p) => cloudWrite('p_' + p.id, p));
          state.projects.forEach((p) => writeProject(p));
          for (const k in EXTRA) state[k].forEach((x) => cloudWrite(EXTRA[k] + x.id, x));
          cloudWrite('settings', state.settings);
          emit();
          return;
        }
      }
      adopt(got);
    }, (e) => { clearTimeout(timer); cloudReady = false; state.mode = 'local'; state.cloudNote = e.code === 'revoked' ? '' : 'Cloud sync stopped; changes are kept in this browser.'; emit(); });
  }
  function writeProject(p) {
    if (!cloudReady) return;
    const body = { ...p };
    if (body.image && body.image.data && !body.image.asset) {
      cloudWrite('img_' + p.id, { data: body.image.data });
      body.image = { ...body.image, data: null, doc: true };
    }
    cloudWrite('v_' + p.id, body, 700);
  }

  /* ---------- public API ---------- */
  const store = {
    state, caps, hasClaude, uid: uidGen,
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    saveProfile(p) {
      p.id = p.id || uidGen(); p.createdAt = p.createdAt || Date.now(); p.updatedAt = Date.now();
      const i = state.profiles.findIndex((x) => x.id === p.id);
      if (i >= 0) state.profiles[i] = p; else state.profiles.push(p);
      saveLocal(); cloudWrite('p_' + p.id, p); emit(); return p;
    },
    deleteProfile(id) {
      state.profiles = state.profiles.filter((x) => x.id !== id);
      if (state.settings.activeProfile === id) store.saveSettings({ activeProfile: state.profiles[0] ? state.profiles[0].id : null });
      saveLocal(); cloudWrite('p_' + id, null); emit();
    },
    saveProject(p, quiet) {
      p.id = p.id || uidGen(); p.createdAt = p.createdAt || Date.now(); p.updatedAt = Date.now();
      const i = state.projects.findIndex((x) => x.id === p.id);
      if (i >= 0) state.projects[i] = p; else state.projects.unshift(p);
      saveLocal(); writeProject(p); if (!quiet) emit(); return p;
    },
    deleteProject(id) {
      const p = state.projects.find((x) => x.id === id);
      state.projects = state.projects.filter((x) => x.id !== id);
      saveLocal(); cloudWrite('v_' + id, null);
      if (p && p.image && p.image.doc) cloudWrite('img_' + id, null);
      if (p && p.image && p.image.asset && caps.assets) caps.assets.delete(p.image.asset).catch(() => {});
      emit();
    },
    saveSettings(patch) { state.settings = Object.assign({}, state.settings, patch); saveLocal(); cloudWrite('settings', state.settings, 400); emit(); },
    saveItem(kind, x) {
      x.id = x.id || uidGen(); x.createdAt = x.createdAt || Date.now(); x.updatedAt = Date.now();
      const list = state[kind], i = list.findIndex((y) => y.id === x.id);
      if (i >= 0) list[i] = x; else list.push(x);
      saveLocal(); cloudWrite(EXTRA[kind] + x.id, x); emit(); return x;
    },
    deleteItem(kind, id) { state[kind] = state[kind].filter((y) => y.id !== id); saveLocal(); cloudWrite(EXTRA[kind] + id, null); emit(); },
    exportAll() { return Object.assign({ app: 'Anubhuti', version: 2, exportedAt: new Date().toISOString(), profiles: state.profiles, projects: state.projects, settings: state.settings }, extras()); },
    importAll(j) {
      if (!j || !Array.isArray(j.profiles)) throw new Error('This does not look like an Anubhuti backup.');
      j.profiles.forEach((p) => store.saveProfile(p));
      (j.projects || []).forEach((p) => store.saveProject(p, true));
      for (const k in EXTRA) (j[k] || []).forEach((x) => store.saveItem(k, x));
      if (j.settings) store.saveSettings(j.settings);
      emit();
    },

    /* Floor plan image: uploaded asset when available, else a compressed data URL. */
    async saveImage(fileOrBlob) {
      const scaled = await downscale(fileOrBlob, 1600, 0.82);
      if (caps.assets) {
        try {
          const r = await caps.assets.upload(scaled.blob);
          return { asset: r.id, url: r.url, w: scaled.w, h: scaled.h };
        } catch (e) { console.warn('asset upload failed', e); }
      }
      let small = scaled;
      if (scaled.dataUrl.length > 240000) small = await downscale(fileOrBlob, 1100, 0.7);
      if (small.dataUrl.length > 240000) small = await downscale(fileOrBlob, 900, 0.6);
      return { data: small.dataUrl, w: small.w, h: small.h };
    },
    imageSrc(img) { if (!img) return null; return img.data || img.url || (img.asset ? '/_blob/' + img.asset : null); },

    async download(filename, data, mime) {
      if (caps.downloads) {
        try { await caps.downloads.save({ filename, data }); return 'saved'; }
        catch (e) { if (e && e.code === 'declined') return 'declined'; console.warn(e); }
      }
      if (!hasClaude) {
        const blob = data instanceof Blob ? data : new Blob([data], { type: mime || 'application/octet-stream' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        return 'saved';
      }
      return 'unavailable';
    },
  };

  function downscale(file, max, q) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.round(img.naturalWidth * s), h = Math.round(img.naturalHeight * s);
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        const dataUrl = c.toDataURL('image/jpeg', q);
        c.toBlob((blob) => resolve({ blob, dataUrl, w, h }), 'image/jpeg', q);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file could not be read as an image.')); };
      img.src = url;
    });
  }

  loadLocal();
  store.ready = (async () => {
    if (!hasClaude) return;
    const use = (n) => window.claude.use(n).catch(() => null);
    const [db, user, assets, downloads, sample, tts, dictation] = await Promise.all(['db', 'user', 'assets', 'downloads', 'sample', 'tts', 'dictation'].map(use));
    Object.assign(caps, { db, user, assets, downloads, sample, tts, dictation });
    if (sample && sample.limits) {
      try { const l = await sample.limits(); caps.sampleImages = !!l.images; caps.sampleTools = !!l.tools; } catch (e) { /* none */ }
    }
    emit();
    initCloud();
  })();
  D.store = store;
})(window);
