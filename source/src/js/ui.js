/* Anubhuti — small UI toolkit: escaping, icons, toasts, sheets, place picker. */
(function (G) {
  const D = (G.Disha = G.Disha || {});
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const P = {
    today: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    vastu: '<rect x="3" y="3" width="18" height="18" rx="1.5"/><path d="M3 12h18M12 3v18M3 3l18 18M21 3L3 21"/>',
    kundli: '<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 3l18 18M21 3L3 21M12 3l9 9-9 9-9-9z"/>',
    numbers: '<path d="M9 3L7 21M17 3l-2 18M4 8.5h17M3 15.5h17"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/><circle cx="12" cy="15" r="1.6"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    library: '<path d="M4 19.5V5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zm0 0A2 2 0 006 21.5h13"/><path d="M9 7h6"/>',
    people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14.6c2.4.2 4 1.8 4.5 4.4"/>',
    ask: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    prefs: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>', download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    upload: '<path d="M12 20V9M7 13l5-5 5 5M5 4h14"/>', mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21"/>',
    speaker: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>', send: '<path d="M4 12l16-8-6 16-2.5-6.5z"/><path d="M11.5 13.5L20 4"/>',
    left: '<path d="M15 5l-7 7 7 7"/>', right: '<path d="M9 5l7 7-7 7"/>', close: '<path d="M6 6l12 12M18 6L6 18"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>', zin: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5M8.5 11h5M11 8.5v5"/>',
    zout: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5M8.5 11h5"/>', fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>', copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3"/>',
    star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>', moon: '<path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/>',
    pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0113 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>', north: '<path d="M12 3l5 16-5-3.5L7 19z"/>',
    pointer: '<path d="M5 3l14 7-6 2-2 6z"/>', outline: '<path d="M4 6l7-3 9 4-2 11-12 2z"/><circle cx="4" cy="6" r="1.5"/><circle cx="20" cy="7" r="1.5"/><circle cx="18" cy="18" r="1.5"/>',
    door: '<path d="M6 21V4h10v17M4 21h16"/><circle cx="13" cy="12.5" r=".9"/>', flame: '<path d="M12 21c-4 0-6.5-2.6-6.5-6.2 0-3.3 2.4-5 3.5-8.3 1.6 1.4 2.2 3 2.2 4.5 1-1 1.6-2.3 1.6-4C16.2 9 18.5 11.6 18.5 15c0 3.5-2.6 6-6.5 6z"/>',
    bed: '<path d="M3 18V7M3 13h18v5M21 18v-3a3 3 0 00-3-3h-7v1"/><circle cx="7" cy="10.5" r="1.8"/>', drop: '<path d="M12 3.5s6 6.5 6 10.5a6 6 0 01-12 0c0-4 6-10.5 6-10.5z"/>',
    lamp: '<path d="M12 4c1.2 1.5 1.8 2.6 1.8 3.6a1.8 1.8 0 01-3.6 0c0-1 .6-2.1 1.8-3.6zM6 13h12l-2 5H8zM12 11v2M9 21h6"/>', sofa: '<path d="M4 11V8a2 2 0 012-2h12a2 2 0 012 2v3M2.5 12.5a1.5 1.5 0 013 0V15h13v-2.5a1.5 1.5 0 013 0V18h-19zM5 18v2M19 18v2"/>',
    plate: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3.5"/>', book: '<path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5zM12 6.5v13"/>',
    stairs: '<path d="M4 20h4v-4h4v-4h4V8h4"/>', box: '<path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9"/>',
    well: '<ellipse cx="12" cy="8" rx="7" ry="2.5"/><path d="M5 8v8c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V8"/>', tank: '<rect x="5" y="4" width="14" height="10" rx="2"/><path d="M8 14v6M16 14v6M5 9h14"/>',
    safe: '<rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="12" cy="12" r="3.5"/><path d="M12 8.5v1M12 14.5v1"/>', car: '<path d="M4 16v-4l2-5h12l2 5v4zM4 16v2M20 16v2"/><circle cx="8" cy="13.5" r="1"/><circle cx="16" cy="13.5" r="1"/>',
    sun: '<circle cx="12" cy="12" r="3.5"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>', bolt: '<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>',
    refresh: '<path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>', search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  };
  const icon = (name, cls) => '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || '') + '</svg>';

  let toastTimer;
  function toast(msg, ms) {
    let t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, ms || 3200);
  }

  /* Modal sheet. content: html string. Returns {el, close}. */
  function sheet(html, opts) {
    const back = document.createElement('div');
    back.className = 'sheet-back';
    back.innerHTML = '<div class="sheet" role="dialog" aria-modal="true">' + html + '</div>';
    document.body.appendChild(back);
    const close = () => { back.remove(); document.removeEventListener('keydown', onKey); opts && opts.onClose && opts.onClose(); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    back.addEventListener('mousedown', (e) => { if (e.target === back) close(); });
    back.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
    const first = back.querySelector('input, select, textarea, button');
    first && setTimeout(() => first.focus(), 30);
    return { el: back.querySelector('.sheet'), close };
  }
  function confirmSheet(title, body, okLabel, danger) {
    return new Promise((resolve) => {
      let done = false;
      const s = sheet('<h2>' + esc(title) + '</h2><p class="muted">' + esc(body) + '</p><div class="sheet-actions"><button class="btn" data-close>Cancel</button><button class="btn ' + (danger ? 'primary' : 'accent') + '" data-ok>' + esc(okLabel || 'OK') + '</button></div>', { onClose: () => { if (!done) resolve(false); } });
      s.el.querySelector('[data-ok]').addEventListener('click', () => { done = true; resolve(true); s.close(); });
    });
  }

  /* Place combobox: filters D.PLACES; calls onPick(place). */
  function placePicker(input, onPick) {
    const wrap = input.closest('.combo');
    let list = null, hi = -1, items = [];
    const close = () => { list && list.remove(); list = null; hi = -1; };
    const render = () => {
      const q = input.value.trim().toLowerCase();
      items = (q ? D.PLACES.filter((p) => p.name.toLowerCase().includes(q)) : D.PLACES).slice(0, 40);
      close();
      if (!items.length) return;
      list = document.createElement('div'); list.className = 'combo-list'; list.setAttribute('role', 'listbox');
      list.innerHTML = items.map((p, i) => '<button type="button" role="option" data-i="' + i + '">' + esc(p.name) + ' <span class="muted tiny">' + p.lat.toFixed(2) + ', ' + p.lon.toFixed(2) + '</span></button>').join('');
      wrap.appendChild(list);
      list.addEventListener('mousedown', (e) => { const b = e.target.closest('button'); if (b) { e.preventDefault(); pick(+b.dataset.i); } });
    };
    const pick = (i) => { const p = items[i]; if (!p) return; input.value = p.name; close(); onPick({ ...p }); };
    input.addEventListener('focus', render);
    input.addEventListener('input', render);
    input.addEventListener('blur', () => setTimeout(close, 120));
    input.addEventListener('keydown', (e) => {
      if (!list) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); hi = (hi + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        $$('button', list).forEach((b, i) => b.classList.toggle('hi', i === hi));
        const b = list.children[hi]; b && b.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') { e.preventDefault(); pick(hi < 0 ? 0 : hi); } else if (e.key === 'Escape') close();
    });
  }

  /* Minimal, safe markdown for AI answers. */
  function md(text) {
    const lines = esc(text).split('\n');
    let out = '', inList = null;
    const inline = (s) => s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<i>$2</i>').replace(/`([^`]+)`/g, '<code class="mono">$1</code>');
    const endList = () => { if (inList) { out += '</' + inList + '>'; inList = null; } };
    for (const raw of lines) {
      const l = raw.trimEnd();
      let m;
      if ((m = l.match(/^#{1,3}\s+(.*)/))) { endList(); out += '<h4>' + inline(m[1]) + '</h4>'; }
      else if ((m = l.match(/^\s*[-*•]\s+(.*)/))) { if (inList !== 'ul') { endList(); out += '<ul>'; inList = 'ul'; } out += '<li>' + inline(m[1]) + '</li>'; }
      else if ((m = l.match(/^\s*\d+[.)]\s+(.*)/))) { if (inList !== 'ol') { endList(); out += '<ol>'; inList = 'ol'; } out += '<li>' + inline(m[1]) + '</li>'; }
      else if (!l.trim()) { endList(); }
      else { endList(); out += '<p>' + inline(l) + '</p>'; }
    }
    endList();
    return out;
  }

  const initials = (name) => String(name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
  const lsGet = (k, d) => { try { const v = localStorage.getItem('disha:ui:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem('disha:ui:' + k, JSON.stringify(v)); } catch (e) { /* ignore */ } };

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); toast('Copied'); return true; }
    catch (e) {
      const s = sheet('<h2>Copy this</h2><textarea class="input mono" rows="10" readonly>' + esc(text) + '</textarea><div class="sheet-actions"><button class="btn primary" data-close>Done</button></div>');
      const ta = s.el.querySelector('textarea'); ta.focus(); ta.select();
      return false;
    }
  }

  D.ui = { esc, $, $$, icon, toast, sheet, confirmSheet, placePicker, md, initials, lsGet, lsSet, copyText };
  D.toast = toast;
})(window);
