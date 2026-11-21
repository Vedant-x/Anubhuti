/* Anubhuti — app shell, router, family profiles, settings, library, compass. */
(function (G) {
  const D = (G.Disha = G.Disha || {});
  const { esc, $, $$, icon, toast, sheet, confirmSheet, placePicker, initials, lsGet, lsSet } = D.ui;
  const A = D.astro, S = D.store;
  const DEFAULT_PLACE = D.PLACES[0];

  const NAV = [
    ['Daily', [['home', 'Home', 'today'], ['today', 'Daily panchang', 'sun'], ['calendar', 'Muhurat calendar', 'calendar']]],
    ['Studios', [['vastu', 'Vastu studio', 'vastu'], ['kundli', 'Kundli', 'kundli'], ['numerology', 'Numerology', 'numbers'], ['tarot', 'Tarot', 'star'], ['compare', 'Compare', 'people']]],
    ['Knowledge', [['nakshatras', '27 Nakshatras', 'moon'], ['remedies', 'Remedies', 'lamp'], ['library', 'Library', 'library']]],
    ['Tools', [['ask', 'Ask Anubhuti', 'ask'], ['calc', 'Calculators', 'numbers'], ['compass', 'Compass', 'compass']]],
    ['Practice', [['clients', 'Clients', 'book'], ['people', 'Family vault', 'people']]],
    ['App', [['prefs', 'Settings', 'prefs'], ['help', 'Help & guide', 'info']]],
  ];
  const TABS = [['home', 'Home', 'today'], ['vastu', 'Vastu', 'vastu'], ['kundli', 'Kundli', 'kundli'], ['tarot', 'Tarot', 'star'], ['ask', 'Ask', 'ask']];
  const BRAND = '<img class="brand-mark" src="@@LOGO@@" alt="Anubhuti logo" width="44" height="44">';

  const app = {
    route: 'today', views: {}, cleanup: null, chartCache: new Map(),
    settings() { return S.state.settings; },
    profiles() { return S.state.profiles; },
    activeProfile() { const id = S.state.settings.activeProfile; return S.state.profiles.find((p) => p.id === id) || S.state.profiles[0] || null; },
    place() { return S.state.settings.place || (app.activeProfile() && app.activeProfile().currentPlace) || DEFAULT_PLACE; },
    tz() { return app.place().tz; },
    h24() { return !!S.state.settings.h24; },
    time(jd, tz) { return A.fmtTime(jd, tz == null ? app.tz() : tz, { h24: app.h24() }); },
    chart(p) {
      if (!p) return null;
      A.setNodeMode(S.state.settings.node);
      const key = p.id + ':' + p.dob + p.tob + p.place.lat + p.place.lon + p.place.tz + ':' + (S.state.settings.node || 'mean');
      if (!app.chartCache.has(key)) app.chartCache.set(key, A.chart(p));
      return app.chartCache.get(key);
    },
    go(r) { if (location.hash !== '#' + r) location.hash = r; else app.render(); },
  };
  D.app = app;

  /* ---------- shell ---------- */
  function shell() {
    const navHtml = NAV.map(([g, items]) => '<div class="nav-label">' + g + '</div>' + items.map(([r, l, ic]) => '<a href="#' + r + '" data-r="' + r + '">' + icon(ic) + '<span>' + l + '</span></a>').join('')).join('');
    document.getElementById('root').innerHTML =
      '<div class="app">' +
      '<aside class="rail" aria-label="Main"><a class="brand" href="#home">' + BRAND + '<div><div class="brand-name">Anubhuti</div><div class="brand-sub">Where creativity meets spirituality</div></div></a>' +
      '<nav class="nav">' + navHtml + '</nav><div class="rail-foot"><button class="who" data-act="who"></button><div class="sync" id="sync"><span class="dot"></span><span></span></div></div></aside>' +
      '<div class="topbar"><a class="brand" href="#home">' + BRAND + '<div class="brand-name">Anubhuti</div></a><button class="who" data-act="who"></button></div>' +
      '<main class="main" id="main"><div class="main-inner"><div id="guide"></div><div id="view"></div></div></main>' +
      '<nav class="tabbar" aria-label="Main">' + TABS.map(([r, l, ic]) => '<a href="#' + r + '" data-r="' + r + '">' + icon(ic) + '<span>' + l + '</span></a>').join('') + '<button data-act="more">' + icon('more') + '<span>More</span></button></nav>' +
      '</div>';
    document.addEventListener('click', (e) => {
      const a = e.target.closest('[data-act]');
      if (!a) return;
      if (a.dataset.act === 'who') pickProfile();
      if (a.dataset.act === 'more') moreSheet();
    });
  }
  function updateChrome() {
    $$('[data-r]').forEach((a) => { if (a.dataset.r === app.route) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    const p = app.activeProfile();
    $$('.who').forEach((b) => {
      b.innerHTML = p ? '<span class="avatar">' + esc(initials(p.name)) + '</span><span class="grow"><b style="display:block;font-size:.88rem;line-height:1.2">' + esc(p.name) + '</b><span class="tiny muted">' + esc(p.relation || 'Active profile') + '</span></span>'
        : '<span class="avatar">+</span><span class="grow small"><b>Add a person</b></span>';
    });
    const sy = $('#sync');
    if (sy) {
      sy.classList.toggle('cloud', S.state.mode === 'cloud');
      sy.lastElementChild.textContent = S.state.mode === 'cloud' ? 'Synced to your Claude account' : S.state.cloudNote || (S.hasClaude ? 'Saved in this browser' : 'Saved in this browser (offline copy)');
    }
    const th = S.state.settings.theme || 'light'; // bright by default, even on dark-mode devices
    if (th === 'light' || th === 'dark') document.documentElement.setAttribute('data-theme', th); else document.documentElement.removeAttribute('data-theme');
  }
  function moreSheet() {
    const items = [['today', 'Daily panchang', 'sun'], ['calendar', 'Muhurat calendar', 'calendar'], ['numerology', 'Numerology', 'numbers'], ['compare', 'Compare', 'people'], ['people', 'Family vault', 'people'], ['clients', 'Clients', 'book'], ['nakshatras', '27 Nakshatras', 'moon'], ['remedies', 'Remedies', 'lamp'], ['calc', 'Calculators', 'numbers'], ['compass', 'Compass', 'compass'], ['library', 'Library', 'library'], ['prefs', 'Settings', 'prefs'], ['help', 'Help & guide', 'info']];
    const s = sheet('<h2>More</h2><div class="grid g2" style="gap:6px">' + items.map(([r, l, ic]) => '<a class="btn" style="justify-content:flex-start" href="#' + r + '" data-close>' + icon(ic) + l + '</a>').join('') + '</div>');
    s.el.addEventListener('click', (e) => { if (e.target.closest('a')) s.close(); });
  }

  /* ---------- routing ---------- */
  app.render = function () {
    const r = (location.hash || '#home').slice(1) || 'home';
    app.route = app.views[r] ? r : 'home';
    app.renderGuide && app.renderGuide(app.route);
    if (app.cleanup) { try { app.cleanup(); } catch (e) { /* ignore */ } app.cleanup = null; }
    const el = $('#view');
    el.innerHTML = '';
    updateChrome();
    try { app.cleanup = app.views[app.route].render(el, app) || null; }
    catch (e) { console.error(e); el.innerHTML = '<div class="card"><h2>Something went wrong</h2><p class="muted">' + esc(e.message) + '</p></div>'; }
    window.scrollTo(0, 0);
  };
  let rerenderTimer;
  app.refresh = () => { clearTimeout(rerenderTimer); rerenderTimer = setTimeout(() => { const v = app.views[app.route]; if (v && v.onData) { updateChrome(); v.onData(); } else app.render(); }, 60); };

  /* ---------- profiles ---------- */
  function pickProfile() {
    const ps = app.profiles(), cur = app.activeProfile();
    if (!ps.length) return editProfile();
    const s = sheet('<h2>Whose chart?</h2><div class="stack-sm">' + ps.map((p) => '<button class="who' + (cur && p.id === cur.id ? ' active' : '') + '" data-id="' + p.id + '" style="' + (cur && p.id === cur.id ? 'border-color:var(--saffron)' : '') + '"><span class="avatar">' + esc(initials(p.name)) + '</span><span class="grow"><b>' + esc(p.name) + '</b><br><span class="tiny muted">' + esc(fmtDob(p)) + '</span></span></button>').join('') +
      '</div><div class="sheet-actions"><a class="btn" href="#people" data-close>Manage family</a><button class="btn primary" data-new>' + icon('plus') + 'Add person</button></div>');
    s.el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-id]');
      if (b) { S.saveSettings({ activeProfile: b.dataset.id }); s.close(); toast('Showing ' + (app.activeProfile() || {}).name); }
      if (e.target.closest('[data-new]')) { s.close(); editProfile(); }
    });
  }
  function fmtDob(p) {
    const [y, m, d] = p.dob.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
    return dt + (p.tobUnknown ? ' · time unknown' : ' · ' + p.tob) + ' · ' + (p.place.name || '').replace(', India', '');
  }
  app.fmtDob = fmtDob;
  function editProfile(p, after) {
    const isNew = !p;
    p = p ? JSON.parse(JSON.stringify(p)) : { name: '', gender: 'male', dob: '', tob: '', place: { ...DEFAULT_PLACE }, relation: '' };
    const s = sheet(
      '<h2>' + (isNew ? 'New kundli' : 'Edit ' + esc(p.name)) + '</h2><p class="small muted" style="margin:-8px 0 12px">' + (isNew ? 'Enter the birth details once. The kundli is saved with the relation, so you can open it any time from Kundli or the Family Vault.' : 'Changes are saved to this person’s kundli.') + '</p><form class="stack" id="pf" novalidate>' +
      '<label class="field"><span>Full name (as you use it)</span><input class="input" id="pf-name" required autocomplete="off" value="' + esc(p.name) + '" placeholder="e.g. Ananya Rao"></label>' +
      '<div class="grid g2"><label class="field"><span>Relation</span><input class="input" id="pf-rel" list="pf-rel-opts" value="' + esc(p.relation || '') + '" placeholder="Choose or type"><datalist id="pf-rel-opts">' + ['Self', 'Spouse', 'Husband', 'Wife', 'Mother', 'Father', 'Son', 'Daughter', 'Brother', 'Sister', 'Grandmother', 'Grandfather', 'Friend', 'Client', 'Prospective match'].map((r) => '<option value="' + r + '"></option>').join('') + '</datalist></label>' +
      '<label class="field"><span>Gender (used for Kua)</span><select class="input" id="pf-gender"><option value="male">Male</option><option value="female">Female</option></select></label></div>' +
      '<div class="grid g2"><label class="field"><span>Date of birth</span><input class="input" type="date" id="pf-dob" required value="' + esc(p.dob) + '"></label>' +
      '<label class="field"><span>Time of birth (to the second if known)</span><input class="input" type="time" step="1" id="pf-tob" value="' + esc(p.tobUnknown ? '' : p.tob) + '"></label></div>' +
      '<label class="check"><input type="checkbox" id="pf-unk" ' + (p.tobUnknown ? 'checked' : '') + '> I don’t know the birth time (uses 12:00; lagna and houses will be unreliable)</label>' +
      '<label class="field combo"><span>Place of birth (town, area, district, state)</span><input class="input" id="pf-place" autocomplete="off" value="' + esc(p.place.name || '') + '" placeholder="e.g. Andheri West, Mumbai or a village name"></label>' +
      '<div class="row" style="gap:6px"><button type="button" class="btn sm accent" id="pf-find">' + icon('search') + 'Find exact location</button><button type="button" class="btn sm" id="pf-here">' + icon('pin') + 'Use my current location</button></div><div id="pf-res" class="stack-sm"></div>' +
      '<div class="grid g3"><label class="field"><span>Latitude (N +)</span><input class="input mono" id="pf-lat" value="' + p.place.lat + '" placeholder="19.0760 or 19°04′34″N"></label><label class="field"><span>Longitude (E +)</span><input class="input mono" id="pf-lon" value="' + p.place.lon + '" placeholder="72.8777 or 72°52′40″E"></label><label class="field"><span>UTC offset (h)</span><input class="input mono" id="pf-tz" inputmode="decimal" value="' + p.place.tz + '"></label></div>' +
      '<p class="note">For the most accurate kundli, use “Find exact location” for the actual birthplace (not just the nearest city). Coordinates can be decimals or degrees-minutes-seconds. Births in India between 1 Sep 1942 and 15 Oct 1945 used war time (UTC+6:30); Anubhuti applies it automatically.</p>' +
      '<label class="field"><span>Rituals and remedies to remember (optional)</span><textarea class="input" id="pf-rit" rows="2" placeholder="e.g. Monday Shiva abhishek; wears pearl">' + esc(p.rituals || '') + '</textarea></label>' +
      '<p class="tiny" style="color:var(--bad)" id="pf-err" hidden></p>' +
      '<div class="sheet-actions">' + (isNew ? '' : '<button type="button" class="btn danger" data-del style="margin-right:auto">' + icon('trash') + 'Delete</button>') + '<button type="button" class="btn" data-close>Cancel</button><button class="btn primary" type="submit">' + icon('check') + (isNew ? 'Save kundli' : 'Save changes') + '</button></div></form>');
    const f = s.el;
    $('#pf-gender', f).value = p.gender === 'female' ? 'female' : 'male';
    const fill = (pl) => { $('#pf-place', f).value = pl.name; $('#pf-lat', f).value = (+pl.lat).toFixed(4); $('#pf-lon', f).value = (+pl.lon).toFixed(4); if (pl.tz != null && isFinite(pl.tz)) $('#pf-tz', f).value = pl.tz; $('#pf-res', f).innerHTML = '<div class="small" style="color:var(--good)">' + icon('check') + ' Using ' + esc(pl.name) + ' (' + (+pl.lat).toFixed(4) + ', ' + (+pl.lon).toFixed(4) + (pl.tz != null ? ', UTC' + (pl.tz >= 0 ? '+' : '') + pl.tz : '') + ')</div>'; };
    $('#pf-find', f).addEventListener('click', async () => {
      const q = $('#pf-place', f).value.trim(), out = $('#pf-res', f);
      if (q.length < 3) { out.innerHTML = '<div class="small">Type the birthplace first.</div>'; return; }
      out.innerHTML = '<span class="thinking"><i></i><i></i><i></i> Finding ' + esc(q) + '…</span>';
      try {
        const res = await app.geocode(q, $('#pf-dob', f).value, $('#pf-tob', f).value);
        if (!res.length) { out.innerHTML = '<div class="small">No match found. Add the district or state, or enter coordinates.</div>'; return; }
        out.innerHTML = '<div class="small muted">Tap the right place:</div>' + res.map((r, i) => '<button type="button" class="btn sm" style="justify-content:flex-start;white-space:normal;text-align:left" data-g="' + i + '">' + icon('pin') + esc(r.name) + ' <span class="muted mono">' + (+r.lat).toFixed(4) + ', ' + (+r.lon).toFixed(4) + (r.tz != null ? ' · UTC' + (r.tz >= 0 ? '+' : '') + r.tz : '') + '</span></button>').join('');
        out.querySelectorAll('[data-g]').forEach((b) => b.addEventListener('click', () => fill(res[+b.dataset.g])));
      } catch (e) { out.innerHTML = '<div class="small">' + esc(e.message || 'Location search is not available here.') + ' Enter the coordinates instead.</div>'; }
    });
    $('#pf-here', f).addEventListener('click', () => {
      const out = $('#pf-res', f);
      if (!navigator.geolocation) { out.innerHTML = '<div class="small">Location is not available on this device.</div>'; return; }
      out.innerHTML = '<span class="thinking"><i></i><i></i><i></i> Getting your location…</span>';
      navigator.geolocation.getCurrentPosition((pos) => fill({ name: $('#pf-place', f).value.trim() || 'Current location', lat: pos.coords.latitude, lon: pos.coords.longitude, tz: -new Date().getTimezoneOffset() / 60 }),
        () => { out.innerHTML = '<div class="small">Location permission was refused or is blocked in this view. Use “Find exact location” or type the coordinates.</div>'; }, { enableHighAccuracy: true, timeout: 15000 });
    });
    placePicker($('#pf-place', f), (pl) => { $('#pf-lat', f).value = pl.lat; $('#pf-lon', f).value = pl.lon; $('#pf-tz', f).value = pl.tz; });
    f.querySelector('[data-del]') && f.querySelector('[data-del]').addEventListener('click', async () => {
      s.close();
      if (await confirmSheet('Delete ' + p.name + '?', 'Their saved details will be removed from Disha. This cannot be undone.', 'Delete', true)) { S.deleteProfile(p.id); toast('Deleted'); }
    });
    $('#pf', f).addEventListener('submit', (e) => {
      e.preventDefault();
      const err = $('#pf-err', f);
      const name = $('#pf-name', f).value.trim(), dob = $('#pf-dob', f).value, unk = $('#pf-unk', f).checked, tob = $('#pf-tob', f).value;
      const lat = app.parseCoord($('#pf-lat', f).value), lon = app.parseCoord($('#pf-lon', f).value); let tz = parseFloat($('#pf-tz', f).value);
      const inIndia = lat > 6 && lat < 37.5 && lon > 68 && lon < 97.5;
      if (inIndia && tz === 5.5 && dob >= '1942-09-01' && dob <= '1945-10-14') { tz = 6.5; toast('Birth during Indian war time: using UTC+6:30'); }
      const msg = !name ? 'Enter a name.' : !/^\d{4}-\d{2}-\d{2}$/.test(dob) ? 'Enter the date of birth.' : !unk && !tob ? 'Enter the birth time, or tick “I don’t know the birth time”.' : !(Math.abs(lat) <= 90 && Math.abs(lon) <= 180 && Math.abs(tz) <= 14) ? 'Check the latitude, longitude and UTC offset.' : '';
      if (msg) { err.textContent = msg; err.hidden = false; err.scrollIntoView({ block: 'center', behavior: 'smooth' }); toast(msg); const fld = !name ? '#pf-name' : !/^\d{4}-\d{2}-\d{2}$/.test(dob) ? '#pf-dob' : !unk && !tob ? '#pf-tob' : '#pf-lat'; const fe = $(fld, f); fe && fe.focus(); return; }
      Object.assign(p, { name, dob, tob: unk ? '12:00' : tob, tobUnknown: unk, gender: $('#pf-gender', f).value, relation: $('#pf-rel', f).value.trim(), rituals: $('#pf-rit', f).value.trim(), place: { name: $('#pf-place', f).value.trim() || lat.toFixed(2) + ', ' + lon.toFixed(2), lat, lon, tz } });
      const saved = S.saveProfile(p);
      if (isNew || !S.state.settings.activeProfile) S.saveSettings({ activeProfile: saved.id });
      s.close(); toast((isNew ? 'Kundli saved: ' : 'Updated: ') + name + (p.relation ? ' (' + p.relation + ')' : ''), 4000);
      after && after(saved);
    });
  }
  app.editProfile = editProfile;
  app.parseCoord = function (v) {
    const t = String(v == null ? '' : v).trim().toUpperCase();
    if (!t) return NaN;
    if (/^[-+]?\d+(\.\d+)?$/.test(t)) return parseFloat(t);
    const n = (t.match(/\d+(\.\d+)?/g) || []).map(Number);
    if (!n.length) return NaN;
    const deg = n[0] + (n[1] || 0) / 60 + (n[2] || 0) / 3600;
    return /[SW]/.test(t) || t.startsWith('-') ? -deg : deg;
  };
  app.geocode = async function (q, date, time) {
    const sample = S.caps.sample;
    if (sample && sample.json) {
      const r = await sample.json('Find the geographic coordinates of this birthplace: "' + q + '". Reply with only a JSON array of up to 3 best matches, most likely first, each {"name": "Place, District, State, Country", "lat": number (decimal degrees, north positive, 4 decimals), "lon": number (decimal degrees, east positive, 4 decimals), "tz": number (UTC offset in hours in effect at that place on ' + (date || 'the birth date') + ' at ' + (time || '12:00') + ' local time, including daylight saving or war time if any)}. If you do not know the place, return [].', { modelTier: 'quick' });
      return (Array.isArray(r) ? r : []).filter((x) => x && isFinite(x.lat) && isFinite(x.lon)).slice(0, 3);
    }
    if (!S.hasClaude) {
      const res = await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&q=' + encodeURIComponent(q), { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('Location search failed.');
      const j = await res.json();
      return j.map((x) => ({ name: x.display_name, lat: +x.lat, lon: +x.lon, tz: x.address && x.address.country_code === 'in' ? (date >= '1942-09-01' && date <= '1945-10-14' ? 6.5 : 5.5) : null }));
    }
    throw new Error('Location search needs a moment to connect.');
  };
  app.pickProfile = pickProfile;

  /* A reusable "who" bar for studio pages. */
  app.profileBar = function (opts) {
    const p = app.activeProfile();
    if (!p) return '<div class="card row-between"><div><h3>Add someone to begin</h3><p class="muted small">Birth date, time and place give you the kundli, dasha, numerology and daily guidance.</p></div><button class="btn primary" data-act-add>' + icon('plus') + 'Add a person</button></div>';
    return '<div class="row" style="gap:12px"><span class="avatar" style="width:40px;height:40px;font-size:1rem">' + esc(initials(p.name)) + '</span><div class="grow"><b>' + esc(p.name) + '</b> <span class="muted small">' + esc(p.relation || '') + '</span><div class="small muted">' + esc(fmtDob(p)) + '</div></div>' +
      '<button class="btn sm" data-act="who">Switch</button><button class="btn sm ghost" data-act-edit>' + icon('edit') + 'Edit</button>' + (opts && opts.extra ? opts.extra : '') + '</div>';
  };
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-act-add]')) editProfile();
    if (e.target.closest('[data-act-edit]')) { const p = app.activeProfile(); p && editProfile(p); }
  });

  /* ---------- Family vault ---------- */
  app.views.people = {
    render(el) {
      const draw = () => {
        const ps = app.profiles(), cur = app.activeProfile();
        el.innerHTML = '<div class="page-head"><div><div class="kicker">Family vault</div><h1>People you read for</h1><p class="lede">Each person’s birth details power their kundli, numerology and daily guidance. ' + (S.state.mode === 'cloud' ? 'They are stored privately in your Claude account and follow you across devices.' : 'They are stored in this browser.') + '</p></div><button class="btn primary" data-new>' + icon('plus') + 'Add person</button></div>' +
          (ps.length ? '<div class="people">' + ps.map((p) => {
            const ch = app.chart(p), n = D.numerology.dobNumbers(p.dob);
            return '<div class="card person' + (cur && cur.id === p.id ? ' active' : '') + '"><span class="avatar" style="width:44px;height:44px;font-size:1.05rem">' + esc(initials(p.name)) + '</span><div class="grow stack-sm"><div class="row-between"><b>' + esc(p.name) + '</b>' + (cur && cur.id === p.id ? '<span class="chip accent">Active</span>' : '') + '</div><div class="small muted">' + esc(fmtDob(p)) + '</div>' +
              '<div class="row small" style="gap:6px"><span class="chip">Lagna ' + D.SIGNS[ch.lagna].sa + '</span><span class="chip">Moon ' + D.SIGNS[ch.moonSign].sa + '</span><span class="chip">' + D.NAKSHATRAS[ch.moonNak].name + '</span><span class="chip">Mulank ' + n.mulank + '</span></div>' +
              '<div class="row" style="gap:6px;margin-top:4px"><button class="btn sm" data-use="' + p.id + '">Make active</button><button class="btn sm ghost" data-edit="' + p.id + '">' + icon('edit') + 'Edit</button></div></div></div>';
          }).join('') + '</div>'
            : '<div class="card empty">' + icon('people') + '<div><h3>No one here yet</h3><p>Add yourself first, then family members.</p></div><button class="btn primary" data-new>' + icon('plus') + 'Add person</button></div>');
      };
      draw();
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-new]')) editProfile();
        const u = e.target.closest('[data-use]'); if (u) { S.saveSettings({ activeProfile: u.dataset.use }); toast('Active profile changed'); }
        const ed = e.target.closest('[data-edit]'); if (ed) editProfile(app.profiles().find((p) => p.id === ed.dataset.edit));
      });
      this.onData = draw;
    },
  };

  /* ---------- Settings ---------- */
  app.views.prefs = {
    onData() { /* keep the form as the person left it */ },
    render(el) {
      const st = S.state.settings, pl = app.place();
      el.innerHTML = '<div class="page-head"><div><div class="kicker">Settings</div><h1>Make Anubhuti yours</h1></div></div><div class="grid g2">' +
        '<div class="card stack"><h3>Appearance</h3><div class="field"><span>Theme</span><div class="seg" id="theme">' + [['light', 'Bright'], ['dark', 'Dark'], ['system', 'Match device']].map(([v, l]) => '<button data-v="' + v + '" aria-pressed="' + ((st.theme || 'light') === v) + '">' + l + '</button>').join('') + '</div></div>' +
        '<div class="field"><span>Kundli style</span><div class="seg" id="cstyle">' + [['north', 'North Indian'], ['south', 'South Indian']].map(([v, l]) => '<button data-v="' + v + '" aria-pressed="' + ((st.chartStyle || 'north') === v) + '">' + l + '</button>').join('') + '</div></div>' +
        '<div class="field"><span>Rahu / Ketu</span><div class="seg" id="node"><button data-v="mean" aria-pressed="' + ((st.node || 'mean') === 'mean') + '">Mean node</button><button data-v="true" aria-pressed="' + (st.node === 'true') + '">True node</button></div><span class="small muted">Most Indian panchangs use the mean node; KP and some software use the true node.</span></div>' +
        '<div class="field"><span>Clock</span><div class="seg" id="clock"><button data-v="12" aria-pressed="' + !st.h24 + '">12-hour</button><button data-v="24" aria-pressed="' + !!st.h24 + '">24-hour</button></div></div></div>' +
        '<div class="card stack"><h3>Branding on reports</h3><label class="field"><span>Name printed on Kundli and Vastu reports</span><input class="input" id="cons" value="' + esc(st.consultant == null ? 'Vastu Acharya Rashmi Pathre' : st.consultant) + '" placeholder="Leave empty for no name"></label><p class="small muted">Reports show “Prepared with Anubhuti by …”.</p></div>' +
        '<div class="card stack"><h3>Your location</h3><p class="small muted">Used for Today’s panchang, Rahu Kaal, choghadiya and the calendar.</p><label class="field combo"><span>City</span><input class="input" id="loc" autocomplete="off" value="' + esc(pl.name) + '"></label><p class="small mono muted" id="loc-meta">' + pl.lat.toFixed(2) + ', ' + pl.lon.toFixed(2) + ' · UTC' + (pl.tz >= 0 ? '+' : '') + pl.tz + '</p></div>' +
        '<div class="card stack"><h3>Ask Anubhuti</h3><div class="field"><span>Answer depth</span><div class="seg" id="depth">' + [['quick', 'Fast'], ['default', 'Balanced'], ['complex', 'Deep']].map(([v, l]) => '<button data-v="' + v + '" aria-pressed="' + ((st.depth || 'default') === v) + '">' + l + '</button>').join('') + '</div></div><p class="small muted">Ask Anubhuti runs on your own Claude account when this page is open in Claude. Deep answers take longer.</p>' +
        '<label class="check"><input type="checkbox" id="speak" ' + (st.autoSpeak ? 'checked' : '') + '> Read answers aloud automatically</label></div>' +
        '<div class="card stack"><h3>Backup</h3><p class="small muted">' + (S.state.mode === 'cloud' ? 'Your data syncs privately to your Claude account. A backup file is still handy.' : 'Your data lives in this browser. Keep a backup file so you never lose it.') + '</p><div class="row"><button class="btn" id="bk-dl">' + icon('download') + 'Download backup</button><button class="btn" id="bk-copy">' + icon('copy') + 'Copy backup</button><label class="btn">' + icon('upload') + 'Restore from file<input type="file" accept=".json,application/json" id="bk-file" hidden></label></div><details><summary class="small">Paste a backup instead</summary><textarea class="input mono" id="bk-paste" rows="4" placeholder="Paste backup JSON"></textarea><button class="btn sm" id="bk-import" style="margin-top:6px">Restore</button></details></div>' +
        '<div class="card stack span2"><h3>How Anubhuti calculates</h3><p class="small muted">Planet positions are computed in the page from published orbital elements (accurate to a fraction of a degree for 1800–2050) with the Lahiri ayanamsa and mean lunar nodes. Sunrise uses the Sun’s upper limb with standard refraction. Vastu zones, entrances and devtas follow widely used modern conventions; numerology uses Chaldean name values. Schools differ: use this as a guide alongside a trusted acharya, not as a substitute.</p></div></div>';
      const seg = (id, fn) => $('#' + id, el).addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; $$('#' + id + ' button', el).forEach((x) => x.setAttribute('aria-pressed', x === b)); fn(b.dataset.v); });
      seg('theme', (v) => S.saveSettings({ theme: v }));
      seg('cstyle', (v) => S.saveSettings({ chartStyle: v }));
      seg('clock', (v) => S.saveSettings({ h24: v === '24' }));
      seg('node', (v) => { S.saveSettings({ node: v }); toast(v === 'true' ? 'Using the true node' : 'Using the mean node'); });
      seg('depth', (v) => S.saveSettings({ depth: v }));
      $('#speak', el).addEventListener('change', (e) => S.saveSettings({ autoSpeak: e.target.checked }));
      $('#cons', el).addEventListener('change', (e) => { S.saveSettings({ consultant: e.target.value.trim() }); toast('Saved'); });
      placePicker($('#loc', el), (p) => { S.saveSettings({ place: p }); $('#loc-meta', el).textContent = p.lat.toFixed(2) + ', ' + p.lon.toFixed(2) + ' · UTC' + (p.tz >= 0 ? '+' : '') + p.tz; toast('Location set to ' + p.name); });
      $('#bk-dl', el).addEventListener('click', async () => {
        const r = await S.download('disha-backup-' + A.todayStr(app.tz()) + '.json', JSON.stringify(S.exportAll(), null, 1), 'application/json');
        if (r === 'unavailable') D.ui.copyText(JSON.stringify(S.exportAll()));
      });
      $('#bk-copy', el).addEventListener('click', () => D.ui.copyText(JSON.stringify(S.exportAll())));
      const restore = (txt) => { try { S.importAll(JSON.parse(txt)); toast('Backup restored'); } catch (e) { toast(e.message || 'That backup could not be read.'); } };
      $('#bk-file', el).addEventListener('change', (e) => { const f = e.target.files[0]; if (!f) return; f.text().then(restore); });
      $('#bk-import', el).addEventListener('click', () => restore($('#bk-paste', el).value));
    },
  };

  /* ---------- Library ---------- */
  app.views.library = {
    onData() {},
    render(el) {
      const cats = [['zones', '16 zones'], ['padas', '32 entrances'], ['devtas', '45 devtas'], ['naks', '27 nakshatras'], ['planets', 'Navagraha'], ['signs', '12 rashis'], ['numbers', 'Numbers 1–9'], ['rooms', 'Room guide']];
      let cat = lsGet('libcat', 'zones'), q = '';
      el.innerHTML = '<div class="page-head"><div><div class="kicker">Library</div><h1>Reference shelf</h1><p class="lede">Everything Anubhuti uses, in one searchable place.</p></div></div>' +
        '<div class="row" style="margin-bottom:14px"><div class="combo grow" style="max-width:360px"><input class="input" id="lq" placeholder="Search everything (e.g. Kubera, Rohini, toilet)"></div><div class="seg" id="lc">' + cats.map(([v, l]) => '<button data-v="' + v + '" aria-pressed="' + (v === cat) + '">' + l + '</button>').join('') + '</div></div><div id="lr" class="lib-grid"></div>';
      const items = () => {
        const out = [];
        const add = (c, title, sub, chips, body) => out.push({ c, title, sub, chips, body, text: (title + ' ' + sub + ' ' + body + ' ' + chips.join(' ')).toLowerCase() });
        D.ZONES.forEach((z) => add('zones', z.name + ' (' + z.id + ')', z.sa, [z.el, z.planet, z.deity], '<b>' + esc(z.theme) + '</b><br><span class="small">Good for: ' + esc(z.good) + '</span><br><span class="small muted">Avoid: ' + esc(z.avoid) + '</span><br><span class="small muted">Colours: ' + esc(z.colors) + '</span>'));
        D.PADAS.forEach((p) => add('padas', p.code + ' · ' + p.name, 'Entrance pada', [p.q], esc(p.effect)));
        Object.entries(D.DEVTAS).forEach(([n, m]) => add('devtas', n, '45 devta mandala', [], esc(m)));
        D.NAKSHATRAS.forEach((n, i) => add('naks', (i + 1) + '. ' + n.name, A.fmtDeg(i * 360 / 27 % 30).replace(/″.*/, '') + ' ' + D.SIGNS[Math.floor(i * 360 / 27 / 30)].sa, [n.lord], 'Ruled by ' + n.lord + '. Deity: ' + esc(n.deity) + '.'));
        Object.entries(D.PLANETS).forEach(([n, p]) => add('planets', n + ' · ' + p.sa, p.day, [p.gem.split(' (')[0]], 'Gem: ' + esc(p.gem) + '<br>Colour: ' + esc(p.color) + '<br>Metal: ' + p.metal + '<br>Mantra: <i>' + esc(p.mantra) + '</i><br>Deity: ' + esc(p.deity) + '<br>Exalted in ' + D.SIGNS[p.exalt].en + (p.own.length ? '; owns ' + p.own.map((s) => D.SIGNS[s].en).join(', ') : '')));
        D.SIGNS.forEach((s, i) => add('signs', (i + 1) + '. ' + s.en, s.sa, [s.el, s.lord], 'Lord: ' + s.lord + '. Element: ' + s.el + '.'));
        Object.entries(D.NUMBER_TRAITS).forEach(([n, t]) => add('numbers', 'Number ' + n, D.NUMBER_PLANET[n], [t.days], '<b>' + esc(t.kw) + '</b><br>Strengths: ' + esc(t.plus) + '<br>Watch for: ' + esc(t.minus) + '<br>Colours: ' + esc(t.colors) + '<br>Direction: ' + t.dir));
        Object.values(D.ROOMS).forEach((r) => add('rooms', r.label, 'Room placement', [], r.rule === 'pada' ? 'Judged by the 32 entrance padas. Good padas: ' + D.PADAS.filter((p) => p.q === 'good').map((p) => p.code).join(', ') + '.' : 'Ideal: <b>' + r.good.join(', ') + '</b><br>Acceptable: ' + r.ok.join(', ') + '<br>Avoid: ' + r.avoid.map((z) => (z === 'C' ? 'Centre' : z)).join(', ')));
        return out;
      };
      const all = items();
      const draw = () => {
        const list = q ? all.filter((i) => i.text.includes(q)) : all.filter((i) => i.c === cat);
        $('#lr', el).innerHTML = list.length ? list.map((i) => '<div class="lib-item"><div class="t1"><b>' + esc(i.title) + '</b><span class="tiny muted">' + esc(i.sub) + '</span></div>' + (i.chips.length ? '<div class="row" style="gap:4px">' + i.chips.map((c) => '<span class="chip ' + (c === 'good' ? 'good' : c === 'avoid' ? 'bad' : c === 'neutral' ? 'ok' : '') + '">' + esc(c) + '</span>').join('') + '</div>' : '') + '<div class="small">' + i.body + '</div></div>').join('') : '<div class="empty">Nothing matches “' + esc(q) + '”.</div>';
      };
      $('#lc', el).addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; cat = b.dataset.v; lsSet('libcat', cat); q = ''; $('#lq', el).value = ''; $$('#lc button', el).forEach((x) => x.setAttribute('aria-pressed', x === b)); draw(); });
      $('#lq', el).addEventListener('input', (e) => { q = e.target.value.trim().toLowerCase(); draw(); });
      draw();
    },
  };

  /* ---------- Compass ---------- */
  app.views.compass = {
    onData() {},
    render(el) {
      let heading = 0, live = false, listener = null;
      el.innerHTML = '<div class="page-head"><div><div class="kicker">Compass</div><h1>Vastu compass</h1><p class="lede">Stand at the centre of the home, hold your phone flat, and read the zone you are facing. Keep it away from steel, magnets and electronics.</p></div></div>' +
        '<div class="compass-wrap"><div class="card"><svg class="compass-svg" id="csvg" viewBox="-220 -220 440 440"></svg></div><div class="panel"><div class="card stack"><div class="stat"><span class="label">Facing</span><span class="value" id="c-deg">0°</span><span class="sub" id="c-zone"></span></div>' +
        '<button class="btn primary" id="c-live">' + icon('compass') + 'Use phone compass</button><p class="small muted" id="c-msg"></p>' +
        '<label class="field"><span>Or turn it by hand</span><input type="range" min="0" max="359" value="0" id="c-man"></label></div>' +
        '<div class="card stack"><h3>Set your plan’s north</h3><p class="small muted">Face the wall that is at the <b>top</b> of your floor plan, hold the phone upright toward it, then tap below. Anubhuti sets north for your open Vastu project.</p><button class="btn" id="c-use">' + icon('north') + 'Use this reading in Vastu</button></div></div></div>';
      const svg = $('#csvg', el);
      const draw = () => {
        let s = '<g transform="rotate(' + -heading + ')">';
        for (let i = 0; i < 16; i++) {
          const z = D.ZONES[i], a0 = i * 22.5 - 11.25, a1 = a0 + 22.5;
          const p = (a, r) => [r * Math.sin(a * Math.PI / 180), -r * Math.cos(a * Math.PI / 180)];
          const [x0, y0] = p(a0, 200), [x1, y1] = p(a1, 200), [x2, y2] = p(a1, 120), [x3, y3] = p(a0, 120);
          s += '<path d="M' + x0 + ' ' + y0 + ' A200 200 0 0 1 ' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + ' A120 120 0 0 0 ' + x3 + ' ' + y3 + 'Z" fill="var(--el-' + z.el.toLowerCase() + ')" opacity="' + (i % 2 ? .16 : .26) + '" stroke="var(--paper)" stroke-width="1.5"/>';
          const [tx, ty] = p(i * 22.5, 160);
          s += '<text x="' + tx + '" y="' + ty + '" text-anchor="middle" dominant-baseline="middle" font-size="' + (z.id.length === 1 ? 20 : 12) + '" font-weight="' + (z.id.length === 1 ? 700 : 600) + '" fill="' + (z.id === 'N' ? 'var(--bad)' : 'var(--ink)') + '" transform="rotate(' + (i * 22.5) + ' ' + tx + ' ' + ty + ')">' + z.id + '</text>';
        }
        for (let i = 0; i < 32; i++) {
          const a = 315 + i * 11.25 + 5.625, pd = D.PADAS[i];
          const tx = 210 * Math.sin(a * Math.PI / 180), ty = -210 * Math.cos(a * Math.PI / 180);
          s += '<text x="' + tx + '" y="' + ty + '" text-anchor="middle" dominant-baseline="middle" font-size="8.5" fill="' + (pd.q === 'good' ? 'var(--good)' : 'var(--muted)') + '" transform="rotate(' + a + ' ' + tx + ' ' + ty + ')">' + pd.code + '</text>';
        }
        for (let d = 0; d < 360; d += 5) { const r1 = d % 45 === 0 ? 100 : d % 15 === 0 ? 108 : 112; s += '<line x1="' + 118 * Math.sin(d * Math.PI / 180) + '" y1="' + -118 * Math.cos(d * Math.PI / 180) + '" x2="' + r1 * Math.sin(d * Math.PI / 180) + '" y2="' + -r1 * Math.cos(d * Math.PI / 180) + '" stroke="var(--muted)" stroke-width="' + (d % 45 ? 1 : 2) + '"/>'; }
        s += '</g><path d="M0 -205 L9 -178 L-9 -178Z" fill="var(--saffron)"/><line x1="0" y1="-176" x2="0" y2="-70" stroke="var(--saffron)" stroke-width="2"/><circle r="64" fill="var(--paper)" stroke="var(--line)"/>' +
          '<text y="-6" text-anchor="middle" font-family="var(--font-display)" font-size="34" fill="var(--ink)">' + Math.round(heading) + '°</text><text y="22" text-anchor="middle" font-size="12" fill="var(--muted)">' + D.ZONES[D.vastu.zoneIndex(heading)].name + '</text>';
        svg.innerHTML = s;
        const z = D.ZONES[D.vastu.zoneIndex(heading)], pd = D.PADAS[D.vastu.padaIndex(heading)];
        $('#c-deg', el).textContent = Math.round(heading) + '°';
        $('#c-zone', el).innerHTML = esc(z.name) + ' · ' + esc(z.theme) + '<br>Entrance pada: <b>' + pd.code + ' ' + pd.name + '</b> <span class="chip ' + (pd.q === 'good' ? 'good' : pd.q === 'neutral' ? 'ok' : 'bad') + '">' + pd.q + '</span>';
      };
      const onOrient = (e) => {
        let h = null;
        if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading;
        else if (e.absolute && typeof e.alpha === 'number') h = 360 - e.alpha;
        if (h == null) return;
        heading = ((h % 360) + 360) % 360; live = true; $('#c-man', el).value = Math.round(heading); draw();
      };
      $('#c-live', el).addEventListener('click', async () => {
        const msg = $('#c-msg', el);
        try {
          if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            const r = await DeviceOrientationEvent.requestPermission(); if (r !== 'granted') throw new Error('denied');
          }
          if (!('ondeviceorientationabsolute' in window) && !('ondeviceorientation' in window)) throw new Error('none');
          listener = onOrient;
          window.addEventListener('deviceorientationabsolute', listener); window.addEventListener('deviceorientation', listener);
          msg.textContent = 'Listening… move the phone in a figure-of-eight once to calibrate.';
          setTimeout(() => { if (!live) msg.textContent = 'No compass reading here. Phone sensors only work when Anubhuti is opened directly in a phone browser (for example from the downloaded file or your own website). Use the slider instead.'; }, 2500);
        } catch (e) {
          msg.textContent = 'The compass is not available in this view. Open Anubhuti directly in your phone’s browser, or turn the dial by hand.';
        }
      });
      $('#c-man', el).addEventListener('input', (e) => { heading = +e.target.value; draw(); });
      $('#c-use', el).addEventListener('click', () => {
        S.saveSettings({ pendingNorth: Math.round(((360 - heading) % 360) * 10) / 10 });
        toast('North set from compass. Opening Vastu…'); app.go('vastu');
      });
      draw();
      return () => { if (listener) { window.removeEventListener('deviceorientationabsolute', listener); window.removeEventListener('deviceorientation', listener); } };
    },
  };

  /* ---------- boot ---------- */
  app.start = function () {
    shell();
    A.setNodeMode(S.state.settings.node);
    S.on(() => { A.setNodeMode(S.state.settings.node); app.chartCache.clear(); app.refresh(); });
    window.addEventListener('hashchange', app.render);
    app.render();
  };
})(window);
