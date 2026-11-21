/* Anubhuti — Vastu studio view (canvas + panel). */
(function (G) {
  const D = (G.Disha = G.Disha || {});
  const { esc, $, $$, icon, toast, confirmSheet, lsGet, lsSet } = D.ui;
  const V = D.vastu, S = D.store, app = D.app, N = D.numerology;
  const D2R = Math.PI / 180;
  const ELEM_REMEDY = {
    Water: 'Bring in the water element: a blue strip or blue décor along the cut line, a small clean water bowl, and keep this side open and clutter-free.',
    Air: 'Bring in the air element: healthy green plants, wooden items and good ventilation; a green strip along the cut line.',
    Fire: 'Bring in the fire element: warm red/orange lighting, a copper strip along the cut line, or keep a lamp or electrical appliance here.',
    Earth: 'Bring in the earth element: yellow or earthy tones, heavier furniture, and a brass strip along the cut line.',
    Space: 'Keep it open and light: white or metallic décor, a brass strip along the cut line, and no clutter.',
  };
  const ROOM_LETTER = { entrance: 'E', kitchen: 'K', master: 'MB', bedroom: 'B', toilet: 'T', puja: 'P', living: 'L', dining: 'D', study: 'S', stairs: 'St', store: 'Sr', sump: 'W', ohtank: 'OT', septic: 'Sp', locker: '₹', garage: 'G', balcony: 'Bl', electric: 'El' };

  function hexA(hex, a) {
    const h = hex.replace('#', '').trim();
    if (h.length !== 6) return 'rgba(128,128,128,' + a + ')';
    return 'rgba(' + parseInt(h.slice(0, 2), 16) + ',' + parseInt(h.slice(2, 4), 16) + ',' + parseInt(h.slice(4, 6), 16) + ',' + a + ')';
  }
  function palette() {
    const cs = getComputedStyle(document.documentElement), v = (n) => cs.getPropertyValue(n).trim();
    return { bg: v('--canvas-bg'), paper: v('--paper'), ink: v('--ink'), muted: v('--muted'), line: v('--line-2'), saffron: v('--saffron'), sink: v('--saffron-ink'), good: v('--good'), warn: v('--warn'), bad: v('--bad'), indigo: v('--indigo'),
      el: { Water: v('--el-water'), Air: v('--el-air'), Fire: v('--el-fire'), Earth: v('--el-earth'), Space: v('--el-space') }, font: v('--font-body') || 'system-ui' };
  }

  /* ---------- drawing (shared by screen and export) ---------- */
  function drawScene(ctx, o) {
    const { proj, img, scale, ox, oy, ratio, w, h, layers, ana, sel, mode, draft, kua, hover } = o;
    const C = palette();
    const S2 = (p) => [p[0] * scale + ox, p[1] * scale + oy];
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
    const iw = (proj.image && proj.image.w) || (img && img.naturalWidth) || 1200, ih = (proj.image && proj.image.h) || (img && img.naturalHeight) || 900;
    // image
    ctx.save(); ctx.setTransform(ratio * scale, 0, 0, ratio * scale, ratio * ox, ratio * oy);
    if (img && img.complete && img.naturalWidth) { ctx.globalAlpha = layers.imgAlpha == null ? 1 : layers.imgAlpha; ctx.drawImage(img, 0, 0, iw, ih); ctx.globalAlpha = 1; }
    else { ctx.fillStyle = C.paper; ctx.fillRect(0, 0, iw, ih); ctx.strokeStyle = C.line; ctx.lineWidth = 1 / scale; for (let x = 0; x <= iw; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ih); ctx.stroke(); } for (let y = 0; y <= ih; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(iw, y); ctx.stroke(); } }
    ctx.restore();
    const pts = proj.outline, sp = pts.map(S2), c = ana.center, sc = S2(c), north = proj.north || 0, unset = proj.north == null && !o.exporting;
    const polyPath = () => { ctx.beginPath(); sp.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
    if (layers.dim) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h); sp.slice().reverse().forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.fillStyle = hexA(C.bg.startsWith('#') ? C.bg : '#f3f5f9', 0.62); ctx.fill('evenodd'); ctx.restore(); }
    const far = Math.hypot(w, h) * 2;
    const ray = (deg, r) => [sc[0] + r * Math.sin(deg * D2R), sc[1] - r * Math.cos(deg * D2R)];
    // mandala
    if (layers.devtas) drawMandala(ctx, proj, ana, S2, C, scale, north);
    // zones
    if (layers.zones && !unset) {
      ctx.save(); polyPath(); ctx.clip();
      for (let i = 0; i < 16; i++) {
        const a0 = i * 22.5 - 11.25 + north, a1 = a0 + 22.5;
        const z = D.ZONES[i], col = C.el[z.el];
        const isSel = sel === i;
        if (layers.tint || isSel) {
          ctx.beginPath(); ctx.moveTo(sc[0], sc[1]);
          for (let a = a0; a <= a1 + 0.01; a += 2.5) { const p = ray(a, far); ctx.lineTo(p[0], p[1]); }
          ctx.closePath(); ctx.fillStyle = hexA(col, isSel ? 0.4 : i % 2 ? 0.13 : 0.22); ctx.fill();
        }
      }
      ctx.strokeStyle = hexA(C.ink.startsWith('#') ? C.ink : '#141a2e', 0.55); ctx.setLineDash([5, 4]); ctx.lineWidth = 1;
      for (let i = 0; i < 16; i++) { const p = ray(i * 22.5 + 11.25 + north, far); ctx.beginPath(); ctx.moveTo(sc[0], sc[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); }
      ctx.setLineDash([]);
      const screenR = Math.max(...sp.map((q) => Math.hypot(q[0] - sc[0], q[1] - sc[1])));
      if (layers.labels && (screenR > 150 || o.exporting)) {
        ctx.font = '600 12px ' + C.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (let i = 0; i < 16; i++) {
          const a = i * 22.5 + north, d = V.rayDist(c, a, pts) * scale, p = ray(a, Math.max(26, d * 0.66));
          const z = ana.zones[i];
          const txt = D.ZONES[i].id;
          ctx.fillStyle = hexA(C.paper.startsWith('#') ? C.paper : '#ffffff', 0.85);
          const tw = ctx.measureText(txt).width + 10; ctx.fillRect(p[0] - tw / 2, p[1] - 9, tw, 18);
          ctx.fillStyle = z.status === 'cut' ? C.bad : z.status === 'extended' ? C.good : C.ink; ctx.fillText(txt, p[0], p[1]);
        }
      }
      ctx.restore();
    }
    // outline
    ctx.lineWidth = 2.5; ctx.strokeStyle = C.saffron; polyPath(); ctx.stroke();
    // ring
    const R = Math.max(...sp.map((p) => Math.hypot(p[0] - sc[0], p[1] - sc[1]))) + 18;
    let tip = null, handle = null;
    if (layers.ring && !unset) {
      ctx.lineWidth = 1; ctx.strokeStyle = C.line; ctx.beginPath(); ctx.arc(sc[0], sc[1], R, 0, Math.PI * 2); ctx.stroke();
      if (layers.padas) {
        ctx.beginPath(); ctx.arc(sc[0], sc[1], R + 20, 0, Math.PI * 2); ctx.stroke();
        ctx.font = '600 9px ' + C.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (let i = 0; i < 32; i++) {
          const b0 = 315 + i * 11.25, a = b0 + north, p1 = ray(a, R), p2 = ray(a, R + 20);
          ctx.strokeStyle = C.line; ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
          const pd = D.PADAS[i], m = ray(a + 5.625, R + 10);
          ctx.fillStyle = pd.q === 'good' ? C.good : pd.q === 'neutral' ? C.warn : C.muted;
          ctx.save(); ctx.translate(m[0], m[1]); ctx.rotate((a + 5.625) * D2R); ctx.fillText(pd.code, 0, 0); ctx.restore();
        }
      }
      const zr = R + (layers.padas ? 34 : 14);
      ctx.font = '700 12px ' + C.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let i = 0; i < 16; i++) { const p = ray(i * 22.5 + north, zr); ctx.fillStyle = i === 0 ? C.bad : i % 4 === 0 ? C.ink : C.muted; ctx.font = (i % 2 ? '600 10px ' : '700 13px ') + C.font; ctx.fillText(D.ZONES[i].id, p[0], p[1]); }
      // kua arcs
      if (kua) {
        V.DIR8.forEach((d, i) => {
          const good = kua.dirs.includes(d), a0 = i * 45 - 22.5 + north, a1 = a0 + 45;
          ctx.beginPath(); ctx.arc(sc[0], sc[1], R - 6, (a0 - 90) * D2R, (a1 - 90) * D2R); ctx.lineWidth = 6; ctx.strokeStyle = hexA(good ? C.good : C.bad, good ? 0.75 : 0.35); ctx.stroke();
        });
        ctx.lineWidth = 1;
      }
      // north arrow
      const t = ray(north, zr + 22), l = ray(north - 4, zr + 8), r = ray(north + 4, zr + 8);
      ctx.fillStyle = C.bad; ctx.beginPath(); ctx.moveTo(t[0], t[1]); ctx.lineTo(l[0], l[1]); ctx.lineTo(r[0], r[1]); ctx.closePath(); ctx.fill();
      tip = zr + 36;
    }
    if (!o.exporting) { // draggable north handle
      const hr = tip || R + 30, hp = ray(north, hr), base = ray(north, R + 2);
      ctx.save(); ctx.strokeStyle = C.bad; ctx.lineWidth = 2; ctx.setLineDash(unset ? [4, 4] : []); ctx.beginPath(); ctx.moveTo(base[0], base[1]); ctx.lineTo(hp[0], hp[1]); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(hp[0], hp[1], o.hover && o.hover.kind === 'north' ? 14 : 12, 0, Math.PI * 2); ctx.fillStyle = C.bad; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.paper; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = '700 12px ' + C.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('N', hp[0], hp[1] + 0.5); ctx.restore();
      handle = hp;
    }
    if (unset) {
      const msg = 'Direction not set: drag the red N to north, or enter the degree in Step 4';
      ctx.font = '600 13px ' + C.font; const tw = Math.min(w - 20, ctx.measureText(msg).width + 24);
      ctx.fillStyle = C.ink; ctx.fillRect((w - tw) / 2, 12, tw, 30); ctx.fillStyle = C.paper; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(msg, w / 2, 27, tw - 16);
    }
    // centre
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(sc[0], sc[1], 7, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sc[0] - 12, sc[1]); ctx.lineTo(sc[0] + 12, sc[1]); ctx.moveTo(sc[0], sc[1] - 12); ctx.lineTo(sc[0], sc[1] + 12); ctx.stroke();
    // handles
    if (mode === 'select' && !o.exporting) {
      sp.forEach((p, i) => { ctx.beginPath(); ctx.arc(p[0], p[1], hover && hover.kind === 'vertex' && hover.i === i ? 8 : 6, 0, Math.PI * 2); ctx.fillStyle = C.paper; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.saffron; ctx.stroke(); });
      sp.forEach((p, i) => { const q = sp[(i + 1) % sp.length], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; ctx.beginPath(); ctx.arc(m[0], m[1], 4.5, 0, Math.PI * 2); ctx.fillStyle = hexA(C.saffron.startsWith('#') ? C.saffron : '#e0861b', 0.85); ctx.fill(); ctx.strokeStyle = C.paper; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(m[0] - 2.5, m[1]); ctx.lineTo(m[0] + 2.5, m[1]); ctx.moveTo(m[0], m[1] - 2.5); ctx.lineTo(m[0], m[1] + 2.5); ctx.stroke(); });
    }
    // draft outline
    if (draft && draft.length) {
      ctx.strokeStyle = C.saffron; ctx.setLineDash([6, 4]); ctx.lineWidth = 2; ctx.beginPath(); draft.map(S2).forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); ctx.setLineDash([]);
      draft.map(S2).forEach((p) => { ctx.beginPath(); ctx.arc(p[0], p[1], 5, 0, Math.PI * 2); ctx.fillStyle = C.saffron; ctx.fill(); });
    }
    // A-B-C-D centre points and diagonals
    if (proj.abcd && proj.abcd.length && layers.abcd !== false) {
      const q = proj.abcd.map(S2);
      ctx.save(); ctx.setLineDash([6, 4]); ctx.lineWidth = 1.6; ctx.strokeStyle = C.indigo || C.ink;
      if (q.length >= 3) { ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); ctx.lineTo(q[2][0], q[2][1]); ctx.stroke(); }
      if (q.length === 4) { ctx.beginPath(); ctx.moveTo(q[1][0], q[1][1]); ctx.lineTo(q[3][0], q[3][1]); ctx.stroke(); }
      ctx.setLineDash([]);
      q.forEach((pp, i) => { ctx.beginPath(); ctx.arc(pp[0], pp[1], 10, 0, Math.PI * 2); ctx.fillStyle = C.indigo || C.ink; ctx.fill(); ctx.fillStyle = C.paper; ctx.font = '700 11px ' + C.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('ABCD'[i], pp[0], pp[1] + 0.5); });
      ctx.restore();
    }
    if (o.rectDraft) { const a = S2(o.rectDraft[0]), z = S2(o.rectDraft[1]); ctx.save(); ctx.setLineDash([6, 4]); ctx.strokeStyle = C.indigo || C.saffron; ctx.lineWidth = 2; ctx.strokeRect(Math.min(a[0], z[0]), Math.min(a[1], z[1]), Math.abs(z[0] - a[0]), Math.abs(z[1] - a[1])); ctx.restore(); }
    if (o.tmpLine && o.tmpLine.length) {
      const q = o.tmpLine.map(S2); ctx.save(); ctx.strokeStyle = C.bad; ctx.lineWidth = 2; ctx.beginPath(); q.forEach((pp, i) => (i ? ctx.lineTo(pp[0], pp[1]) : ctx.moveTo(pp[0], pp[1]))); ctx.stroke();
      q.forEach((pp) => { ctx.beginPath(); ctx.arc(pp[0], pp[1], 5, 0, Math.PI * 2); ctx.fillStyle = C.bad; ctx.fill(); }); ctx.restore();
    }
    if (layers.dims && proj.scale && proj.scale.ppu) {
      ctx.save(); ctx.font = '600 11px ' + C.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      pts.forEach((pp, i) => { const q = pts[(i + 1) % pts.length], len = Math.hypot(q[0] - pp[0], q[1] - pp[1]) / proj.scale.ppu, m = S2([(pp[0] + q[0]) / 2, (pp[1] + q[1]) / 2]); const t = len.toFixed(1) + ' ' + proj.scale.unit; const tw = ctx.measureText(t).width + 8; ctx.fillStyle = C.ink; ctx.fillRect(m[0] - tw / 2, m[1] - 9, tw, 18); ctx.fillStyle = C.paper; ctx.fillText(t, m[0], m[1]); });
      ctx.restore();
    }
    // rooms
    if (layers.rooms) {
      ana.rooms.forEach((r) => {
        const p = S2([r.x, r.y]), col = unset ? C.muted : r.q === 'good' ? C.good : r.q === 'avoid' ? C.bad : r.q === 'ok' ? C.warn : C.muted;
        const isSelR = o.selRoom === r.id;
        ctx.beginPath(); ctx.arc(p[0], p[1], isSelR ? 16 : 13, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.paper; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = '700 10px ' + C.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ROOM_LETTER[r.type] || '•', p[0], p[1] + 0.5);
        if (layers.roomLabels) { ctx.font = '600 11px ' + C.font; const t = r.label; const tw = ctx.measureText(t).width + 8; ctx.fillStyle = hexA(C.paper.startsWith('#') ? C.paper : '#ffffff', 0.9); ctx.fillRect(p[0] - tw / 2, p[1] + 16, tw, 16); ctx.fillStyle = C.ink; ctx.fillText(t, p[0], p[1] + 24); }
      });
    }
    return { R, sc, handle };
  }

  function drawMandala(ctx, proj, ana, S2, C, scale, north) {
    const b = ana.bbox, k = ((Math.round(north / 90) % 4) + 4) % 4;
    const cw = (b.x1 - b.x0) / 9, ch = (b.y1 - b.y0) / 9;
    const rot = (r, c) => { for (let i = 0; i < k; i++) { const t = r; r = c; c = 8 - t; } return [r, c]; };
    const rect = (cell) => {
      const w = cell.w || 1, h = cell.h || 1;
      const cs = [rot(cell.r, cell.c), rot(cell.r + h - 1, cell.c + w - 1), rot(cell.r, cell.c + w - 1), rot(cell.r + h - 1, cell.c)];
      const r0 = Math.min(...cs.map((x) => x[0])), r1 = Math.max(...cs.map((x) => x[0])), c0 = Math.min(...cs.map((x) => x[1])), c1 = Math.max(...cs.map((x) => x[1]));
      return [b.x0 + c0 * cw, b.y0 + r0 * ch, b.x0 + (c1 + 1) * cw, b.y0 + (r1 + 1) * ch];
    };
    const cellPx = Math.min(cw, ch) * scale;
    ctx.save(); ctx.lineWidth = 1; ctx.strokeStyle = hexA(C.sink.startsWith('#') ? C.sink : '#9a5200', 0.7);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const label = (txt, x, y, maxPx) => {
      if (cellPx < 18) return;
      const t = maxPx < 46 ? txt.slice(0, 4) : txt;
      ctx.font = '600 ' + Math.max(8, Math.min(11, maxPx / 5)) + 'px ' + C.font; ctx.fillStyle = C.sink; ctx.fillText(t, x, y);
    };
    V.MANDALA.forEach((cell) => {
      const [x0, y0, x1, y1] = rect(cell), a = S2([x0, y0]), z = S2([x1, y1]);
      ctx.fillStyle = cell.name === 'Brahma' ? hexA(C.saffron.startsWith('#') ? C.saffron : '#e0861b', 0.12) : 'transparent';
      if (cell.name === 'Brahma') ctx.fillRect(a[0], a[1], z[0] - a[0], z[1] - a[1]);
      ctx.strokeRect(a[0], a[1], z[0] - a[0], z[1] - a[1]);
      if (cell.tri) {
        const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, gx = (b.x0 + b.x1) / 2, gy = (b.y0 + b.y1) / 2;
        const ox = mx > gx ? x1 : x0, oy = my > gy ? y1 : y0, ix = mx > gx ? x0 : x1, iy = my > gy ? y0 : y1;
        const o = S2([ox, oy]), i2 = S2([ix, iy]); ctx.beginPath(); ctx.moveTo(o[0], o[1]); ctx.lineTo(i2[0], i2[1]); ctx.stroke();
        const names = k % 2 ? [cell.tri[1], cell.tri[0]] : cell.tri;
        const th = [[ox, oy], [ix, oy], [ix, iy]], tv = [[ox, oy], [ox, iy], [ix, iy]];
        [[th, names[0]], [tv, names[1]]].forEach(([tri, n]) => { const cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3, cy = (tri[0][1] + tri[1][1] + tri[2][1]) / 3, p = S2([cx, cy]); label(n, p[0], p[1], cellPx * 1.4); });
      } else {
        const p = S2([(x0 + x1) / 2, (y0 + y1) / 2]);
        label(cell.name, p[0], p[1], Math.min(z[0] - a[0], z[1] - a[1]) * (cell.w ? 1.6 : 1.4));
      }
    });
    ctx.restore();
  }

  function loadImage(src) {
    return new Promise((res) => { if (!src) return res(null); const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
  }
  async function renderPng(proj, opts) {
    const img = await loadImage(S.imageSrc(proj.image));
    const iw = (proj.image && proj.image.w) || 1200, ih = (proj.image && proj.image.h) || 900;
    const ana = V.analyze(proj), pad = 110, sc = Math.min(1, 1600 / Math.max(iw, ih));
    const w = Math.round(iw * sc + pad * 2), h = Math.round(ih * sc + pad * 2);
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const p = app.activeProfile(), kua = p && opts && opts.kua ? N.kua(p.dob, p.gender) : null;
    drawScene(cv.getContext('2d'), { proj, img, scale: sc, ox: pad, oy: pad, ratio: 1, w, h, ana, sel: null, mode: 'export', exporting: true, kua, layers: Object.assign({ zones: true, tint: true, labels: true, ring: true, padas: true, rooms: true, roomLabels: true, dim: true, devtas: false }, opts && opts.layers) });
    return new Promise((r) => cv.toBlob((b) => r(b), 'image/png'));
  }

  function summaryText(proj) {
    const a = V.analyze(proj);
    const lines = ['Vastu plan "' + proj.name + '": north set at ' + (proj.north || 0).toFixed(1) + '° on the drawing. Balance score ' + a.score + '/100.'];
    lines.push('Zone areas (actual % vs % expected for the full rectangle): ' + a.zones.map((z) => z.id + ' ' + z.pct.toFixed(1) + '/' + z.ePct.toFixed(1) + (z.status !== 'balanced' ? ' ' + z.status : '')).join(', ') + '.');
    if (a.rooms.length) lines.push('Rooms: ' + a.rooms.map((r) => r.label + ' in ' + r.zone + (r.pada ? ' (' + r.pada.code + ' ' + r.pada.name + ')' : '') + ' = ' + r.q).join('; ') + '.');
    if (a.issues.length) lines.push('Flags: ' + a.issues.map((i) => i.text).join(' '));
    return lines.join('\n');
  }

  /* ---------- the view ---------- */
  app.views.vastu = {
    render(el) {
      const st = S.state;
      let proj = null, img = null, mode = 'select', roomType = 'kitchen', sel = null, selRoom = null, draft = null, hover = null;
      let tab = lsGet('vtab', 'steps'); if (tab === 'setup') tab = 'steps';
      let lastScene = null, rectDraft = null, tmpLine = null, stepOpen = null, lastMeasure = null, calibPx = null;
      const narrow = window.innerWidth < 640;
      const layers = Object.assign({ zones: true, tint: true, labels: true, ring: true, padas: !narrow, devtas: false, rooms: true, roomLabels: !narrow, dim: true, kua: false, abcd: true, dims: true, imgAlpha: 1 }, lsGet('vlayers', {}));
      if (lsGet('vKua', false)) { layers.kua = true; lsSet('vKua', false); }
      const view = { scale: 1, ox: 0, oy: 0 };
      let canvas, ctx, ana, dpr = Math.max(1, window.devicePixelRatio || 1), ro;

      if (!st.projects.length && !st.settings.sampleSeeded) {
        const s = S.saveProject(V.samplePlan(), true); S.saveSettings({ sampleSeeded: true, vastuCurrent: s.id });
      }
      const pick = () => st.projects.find((p) => p.id === st.settings.vastuCurrent) || st.projects[0] || null;

      el.innerHTML = '<div class="page-head"><div><div class="kicker">Vastu studio</div><h1 id="v-title">Floor plan analysis</h1><p class="lede">Upload a plan, drag the outline onto the outer walls, point north, and mark rooms. Anubhuti maps the 16 zones, 32 entrances and 45 devtas and checks every placement.</p></div>' +
        '<div class="row"><select class="input" id="v-proj" style="width:auto;max-width:240px" aria-label="Project"></select><button class="btn" id="v-blank">' + icon('outline') + 'Draw without image</button><label class="btn primary">' + icon('upload') + 'Upload plan<input type="file" accept="image/*" id="v-file" hidden></label></div></div>' +
        '<div id="v-body"></div>';
      const body = $('#v-body', el);

      function fillProjects() {
        const s = $('#v-proj', el);
        s.innerHTML = st.projects.map((p) => '<option value="' + p.id + '"' + (proj && p.id === proj.id ? ' selected' : '') + '>' + esc(p.name) + '</option>').join('') + (st.projects.length ? '' : '<option>No projects yet</option>');
      }
      function empty() {
        body.innerHTML = '<div class="card empty">' + icon('vastu') + '<div><h3>No floor plans yet</h3><p>Upload a photo or scan of your plan, or start from the sample.</p></div><div class="row"><label class="btn primary">' + icon('upload') + 'Upload plan<input type="file" accept="image/*" class="v-file2" hidden></label><button class="btn" id="v-sample">Load sample plan</button></div></div>';
        $('#v-sample', body).addEventListener('click', () => { const s = S.saveProject(V.samplePlan(), true); S.saveSettings({ vastuCurrent: s.id }); open(s); });
        $('.v-file2', body).addEventListener('change', onFile);
      }
      async function open(p) {
        proj = p; sel = null; selRoom = null; draft = null; mode = 'select'; rectDraft = null; tmpLine = null; calibPx = null;
        if (!proj) { fillProjects(); return empty(); }
        if (st.settings.vastuCurrent !== proj.id) S.saveSettings({ vastuCurrent: proj.id });
        if (st.settings.pendingNorth != null) { proj.north = st.settings.pendingNorth; S.saveSettings({ pendingNorth: null }); commit(); toast('North set to ' + proj.north + '° from the compass'); }
        fillProjects();
        layout();
        img = await loadImage(S.imageSrc(proj.image));
        if (proj.image && !img && proj.image.dropped) toast('This plan’s image was not saved in browser storage. Upload it again; the outline and rooms are kept.');
        fit(); draw(); panel();
      }
      function layout() {
        body.innerHTML = '<div class="vastu"><div class="stack"><div class="stage" id="stage"><canvas id="cv" aria-label="Floor plan with Vastu overlays"></canvas>' +
          '<div class="stage-tools"><div class="seg" id="v-mode" style="background:color-mix(in srgb, var(--paper) 90%, transparent)"><button data-m="select" aria-pressed="true" title="Move corners, centre and rooms">' + icon('pointer') + '</button><button data-m="outline" title="Trace a new outline">' + icon('outline') + '</button><button data-m="room" title="Place rooms">' + icon('door') + '</button></div></div>' +
          '<div class="stage-tools right"><button class="btn icon" data-z="in" aria-label="Zoom in">' + icon('zin') + '</button><button class="btn icon" data-z="out" aria-label="Zoom out">' + icon('zout') + '</button><button class="btn icon" data-z="fit" aria-label="Fit">' + icon('fit') + '</button></div>' +
          '<div class="stage-hint" id="hint" hidden></div></div>' +
          '<div class="row small muted" id="v-status"></div></div><div class="panel" id="panel"></div></div>';
        canvas = $('#cv', body); ctx = canvas.getContext('2d');
        ro && ro.disconnect();
        ro = new ResizeObserver(() => { size(); draw(); }); ro.observe($('#stage', body));
        size(); bindCanvas();
        $('#v-mode', body).addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setMode(b.dataset.m); });
        body.querySelectorAll('[data-z]').forEach((b) => b.addEventListener('click', () => { if (b.dataset.z === 'fit') fit(); else zoomAt(b.dataset.z === 'in' ? 1.25 : 0.8, canvas.clientWidth / 2, canvas.clientHeight / 2); draw(); }));
      }
      function size() { if (!canvas) return; const r = canvas.getBoundingClientRect(); canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr); }
      function fit() {
        if (!canvas || !proj) return;
        const w = canvas.clientWidth, h = canvas.clientHeight, c = V.center(proj);
        const R = Math.max(40, ...proj.outline.map((p) => Math.hypot(p[0] - c[0], p[1] - c[1])));
        const extra = layers.ring ? (layers.padas ? 100 : 78) : 50;
        view.scale = Math.max(0.03, (Math.min(w, h) / 2 - extra) / R);
        view.ox = w / 2 - c[0] * view.scale; view.oy = h / 2 - c[1] * view.scale;
      }
      function zoomAt(f, sx, sy) { const ix = (sx - view.ox) / view.scale, iy = (sy - view.oy) / view.scale; view.scale = Math.max(0.03, Math.min(20, view.scale * f)); view.ox = sx - ix * view.scale; view.oy = sy - iy * view.scale; }
      function kuaNow() { const p = app.activeProfile(); return layers.kua && p ? N.kua(p.dob, p.gender) : null; }
      function draw() {
        if (!ctx || !proj) return;
        ana = V.analyze(proj);
        lastScene = drawScene(ctx, { proj, img, scale: view.scale, ox: view.ox, oy: view.oy, ratio: dpr, w: canvas.clientWidth, h: canvas.clientHeight, layers, ana, sel, selRoom, mode, draft, hover, kua: kuaNow(), rectDraft, tmpLine });
        const stEl = $('#v-status', body);
        if (stEl) stEl.innerHTML = '<span>North ' + (proj.north || 0).toFixed(1) + '°</span><span>·</span><span>Score ' + ana.score + '/100</span><span>·</span><span>' + (st.mode === 'cloud' ? 'Saved to your account' : 'Saved in this browser') + '</span>';
      }
      function setHint(t) { const h = $('#hint', body); if (!h) return; h.hidden = !t; h.textContent = t || ''; }
      function setMode(m) {
        mode = m; draft = m === 'outline' ? [] : null;
        $$('#v-mode button', body).forEach((b) => b.setAttribute('aria-pressed', b.dataset.m === m));
        canvas.classList.toggle('placing', m !== 'select');
        rectDraft = null; tmpLine = (m === 'calib' || m === 'measure') ? [] : null;
        setHint({ outline: 'Click each outer corner in order. Double-click or press Enter to finish, Esc to cancel.', room: 'Click where the ' + D.ROOMS[roomType].label.toLowerCase() + ' is. Pick another item in the Rooms tab.', center4: 'Click the plot corners A, B, C, D in order (clockwise). Anubhuti joins A–C and B–D.', centerRect: 'Drag a rectangle over the main body of the plot. Its centre becomes the Brahmasthan.', boundRect: 'Drag a rectangle along the outer walls.', calib: 'Click both ends of a wall whose real length you know.', measure: 'Click two points to measure the distance.' }[m] || '');
        if (m === 'room' && tab !== 'rooms') { tab = 'rooms'; lsSet('vtab', tab); panel(); }
        draw();
      }
      let saveTimer;
      function commit(now) { if (!proj) return; clearTimeout(saveTimer); saveTimer = setTimeout(() => S.saveProject(proj, true), now ? 0 : 250); }

      /* ---- pointer ---- */
      function bindCanvas() {
        const pointers = new Map();
        let drag = null, moved = false, pinch = null, lastTap = 0;
        const local = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
        const toImg = (s) => [(s[0] - view.ox) / view.scale, (s[1] - view.oy) / view.scale];
        const hit = (s) => {
          if (!proj) return null;
          const S2 = (p) => [p[0] * view.scale + view.ox, p[1] * view.scale + view.oy];
          if (lastScene && lastScene.handle && Math.hypot(lastScene.handle[0] - s[0], lastScene.handle[1] - s[1]) < 18) return { kind: 'north' };
          if (layers.rooms) for (const r of (proj.rooms || []).slice().reverse()) { const p = S2([r.x, r.y]); if (Math.hypot(p[0] - s[0], p[1] - s[1]) < 15) return { kind: 'room', id: r.id }; }
          if (mode !== 'select') return null;
          const sp = proj.outline.map(S2);
          for (let i = 0; i < sp.length; i++) if (Math.hypot(sp[i][0] - s[0], sp[i][1] - s[1]) < 11) return { kind: 'vertex', i };
          for (let i = 0; i < sp.length; i++) { const q = sp[(i + 1) % sp.length], m = [(sp[i][0] + q[0]) / 2, (sp[i][1] + q[1]) / 2]; if (Math.hypot(m[0] - s[0], m[1] - s[1]) < 9) return { kind: 'mid', i }; }
          const c = S2(V.center(proj)); if (Math.hypot(c[0] - s[0], c[1] - s[1]) < 13) return { kind: 'center' };
          return null;
        };
        canvas.addEventListener('pointerdown', (e) => {
          canvas.setPointerCapture(e.pointerId); pointers.set(e.pointerId, local(e)); moved = false;
          if (pointers.size === 2) { const [a, b] = Array.from(pointers.values()); pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s: view.scale, mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] }; drag = null; return; }
          const s = local(e), h = hit(s);
          if ((mode === 'centerRect' || mode === 'boundRect') && !(h && h.kind === 'room')) { drag = { kind: 'rect', a: toImg(s) }; return; }
          if (h && h.kind === 'mid') { proj.outline.splice(h.i + 1, 0, toImg(s)); drag = { kind: 'vertex', i: h.i + 1 }; }
          else if (h) drag = h;
          else drag = { kind: 'pan', s, ox: view.ox, oy: view.oy };
          if (h && h.kind === 'room') { selRoom = h.id; if (tab !== 'rooms') { tab = 'rooms'; lsSet('vtab', tab); } panel(); }
        });
        canvas.addEventListener('pointermove', (e) => {
          const s = local(e);
          if (pointers.has(e.pointerId)) pointers.set(e.pointerId, s);
          if (pinch && pointers.size === 2) {
            const [a, b] = Array.from(pointers.values()), d = Math.hypot(a[0] - b[0], a[1] - b[1]);
            const f = (pinch.s * d) / pinch.d / view.scale; zoomAt(f, pinch.mid[0], pinch.mid[1]); draw(); return;
          }
          if (!drag) { const h = hit(s); const key = h ? h.kind + (h.i != null ? h.i : '') : ''; if (key !== (hover ? hover.kind + (hover.i != null ? hover.i : '') : '')) { hover = h; canvas.style.cursor = h ? (h.kind === 'north' ? 'grab' : h.kind === 'room' || h.kind === 'vertex' || h.kind === 'center' ? 'move' : 'copy') : mode === 'select' ? 'grab' : 'crosshair'; draw(); } return; }
          moved = true;
          const ip = toImg(s);
          if (drag.kind === 'pan') { if (mode !== 'select' && Math.hypot(s[0] - drag.s[0], s[1] - drag.s[1]) < 4) { moved = false; return; } view.ox = drag.ox + s[0] - drag.s[0]; view.oy = drag.oy + s[1] - drag.s[1]; canvas.style.cursor = 'grabbing'; }
          else if (drag.kind === 'vertex') proj.outline[drag.i] = ip;
          else if (drag.kind === 'center') proj.center = ip;
          else if (drag.kind === 'room') { const r = proj.rooms.find((x) => x.id === drag.id); if (r) { r.x = ip[0]; r.y = ip[1]; } }
          else if (drag.kind === 'rect') rectDraft = [drag.a, ip];
          else if (drag.kind === 'north' && lastScene) { let a = Math.atan2(s[0] - lastScene.sc[0], -(s[1] - lastScene.sc[1])) / D2R; a = ((a % 360) + 360) % 360; proj.north = e.shiftKey ? Math.round(a) : Math.round(a * 2) / 2; const ni = $('#v-north', body); if (ni) ni.value = proj.north; updDial(); }
          draw();
        });
        const up = (e) => {
          const s = local(e);
          pointers.delete(e.pointerId);
          if (pinch) { if (pointers.size < 2) pinch = null; return; }
          const d = drag; drag = null; canvas.style.cursor = '';
          if (!d) return;
          if (d.kind === 'rect') {
            const r = rectDraft; rectDraft = null;
            if (!moved || !r || Math.abs(r[1][0] - r[0][0]) < 5 || Math.abs(r[1][1] - r[0][1]) < 5) { draw(); return; }
            const x0 = Math.min(r[0][0], r[1][0]), x1 = Math.max(r[0][0], r[1][0]), y0 = Math.min(r[0][1], r[1][1]), y1 = Math.max(r[0][1], r[1][1]);
            if (mode === 'centerRect') { proj.center = [(x0 + x1) / 2, (y0 + y1) / 2]; proj.centerMode = 'rect'; markDone('center'); toast('Centre set from the rectangle'); }
            else { proj.outline = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]; if (proj.centerMode !== 'abcd' && proj.centerMode !== 'rect') delete proj.center; markDone('boundary'); toast('Boundary set'); }
            commit(true); setMode('select'); fit(); draw(); panel(); return;
          }
          if (moved && d.kind === 'north') { proj.sideRef = Object.assign({}, proj.sideRef, { deg: '' }); markDone('side'); commit(true); panel(); toast('North set to ' + proj.north + '° on the drawing'); return; }
          if (moved && d.kind !== 'pan') { commit(); panel(); return; }
          if (moved) return;
          // a click
          const ip = toImg(s), now = Date.now(), dbl = now - lastTap < 320; lastTap = now;
          if (mode === 'outline') {
            if (dbl && draft.length >= 3) return finishOutline();
            draft.push(ip); draw(); return;
          }
          if (mode === 'center4' && d.kind === 'pan') {
            proj.abcd = (proj.abcd || []).slice(0, 3); proj.abcd.push(ip);
            if (proj.abcd.length === 4) { const c = intersect(proj.abcd[0], proj.abcd[2], proj.abcd[1], proj.abcd[3]); if (c) { proj.center = c; proj.centerMode = 'abcd'; markDone('center'); toast('Centre found where A–C and B–D cross'); setMode('select'); } else toast('The diagonals do not cross. Click the corners in order around the plot.'); }
            commit(true); draw(); panel(); return;
          }
          if ((mode === 'calib' || mode === 'measure') && d.kind === 'pan') {
            tmpLine.push(ip);
            if (tmpLine.length === 2) {
              const px = Math.hypot(tmpLine[1][0] - tmpLine[0][0], tmpLine[1][1] - tmpLine[0][1]);
              if (mode === 'calib') { calibPx = px; tab = 'tools'; lsSet('vtab', tab); setHint('Now type the real length in the Tools panel.'); }
              else { lastMeasure = px; toast(proj.scale ? 'Distance: ' + (px / proj.scale.ppu).toFixed(2) + ' ' + proj.scale.unit : 'Distance: ' + Math.round(px) + ' px (calibrate the scale for real units)'); tmpLine = []; }
              panel();
            }
            draw(); return;
          }
          if (mode === 'room' && d.kind === 'pan') {
            proj.rooms = proj.rooms || [];
            const r = { id: S.uid(), type: roomType, x: ip[0], y: ip[1] };
            proj.rooms.push(r); selRoom = r.id; commit(); draw(); panel();
            const ev = V.evaluateRoom(r, proj, V.center(proj), V.bbox(proj.outline));
            toast(ev.label + ' in ' + ev.zoneName + ': ' + (ev.q === 'good' ? 'ideal' : ev.q === 'avoid' ? 'not recommended' : ev.q === 'ok' ? 'acceptable' : 'neutral'));
            return;
          }
          if (d.kind === 'vertex' && dbl && proj.outline.length > 3) { proj.outline.splice(d.i, 1); commit(); draw(); panel(); return; }
          if (d.kind === 'pan') { // click on a zone selects it
            if (V.inPoly(ip[0], ip[1], proj.outline)) { sel = V.zoneIndex(V.bearingOf(ip[0], ip[1], V.center(proj), proj.north || 0)); selRoom = null; if (tab !== 'zones') { tab = 'zones'; lsSet('vtab', tab); } panel(); draw(); }
            else if (sel != null) { sel = null; panel(); draw(); }
          }
        };
        canvas.addEventListener('pointerup', up);
        canvas.addEventListener('pointercancel', (e) => { pointers.delete(e.pointerId); pinch = null; drag = null; });
        canvas.addEventListener('wheel', (e) => { e.preventDefault(); const s = local(e); zoomAt(Math.exp(-e.deltaY * 0.0015), s[0], s[1]); draw(); }, { passive: false });
        canvas.addEventListener('pointerleave', () => { if (hover) { hover = null; draw(); } });
      }
      function finishOutline() {
        if (draft && draft.length >= 3) { proj.outline = draft.map((p) => [p[0], p[1]]); if (proj.centerMode !== 'abcd' && proj.centerMode !== 'rect') delete proj.center; markDone('boundary'); commit(true); toast('Boundary set with ' + draft.length + ' corners'); }
        setMode('select'); fit(); draw(); panel();
      }
      const onKey = (e) => {
        if (!proj || /input|textarea|select/i.test(document.activeElement && document.activeElement.tagName)) return;
        if (mode === 'outline' && e.key === 'Enter') finishOutline();
        if (e.key === 'Escape' && mode !== 'select') setMode('select');
        if ((e.key === 'Delete' || e.key === 'Backspace') && selRoom) { proj.rooms = proj.rooms.filter((r) => r.id !== selRoom); selRoom = null; commit(); draw(); panel(); }
      };
      document.addEventListener('keydown', onKey);

      /* ---- panel ---- */
      function dialSvg(n) {
        let s = '<svg class="dial" id="dial" viewBox="-66 -66 132 132" role="slider" aria-label="North direction" aria-valuemin="0" aria-valuemax="359" aria-valuenow="' + Math.round(n) + '" tabindex="0"><circle r="62" fill="var(--paper-2)" stroke="var(--line-2)"/>';
        for (let d = 0; d < 360; d += 15) { const r1 = d % 90 ? 56 : 50; s += '<line x1="' + 60 * Math.sin(d * D2R) + '" y1="' + -60 * Math.cos(d * D2R) + '" x2="' + r1 * Math.sin(d * D2R) + '" y2="' + -r1 * Math.cos(d * D2R) + '" stroke="var(--muted)" stroke-width="' + (d % 90 ? 1 : 1.8) + '"/>'; }
        s += '<path d="M0 -66 L4 -60 L-4 -60Z" fill="var(--muted)"/><g transform="rotate(' + n + ')"><path d="M0 -54 L8 -10 L0 -16 L-8 -10Z" fill="var(--bad)"/><path d="M0 54 L8 10 L0 16 L-8 10Z" fill="var(--line-2)"/><text y="-26" text-anchor="middle" font-size="11" font-weight="700" fill="var(--paper)" dy="12" style="display:none">N</text></g><circle r="5" fill="var(--paper)" stroke="var(--ink)"/></svg>';
        return s;
      }
      function scoreRing(score) {
        const r = 26, c = 2 * Math.PI * r, col = score >= 80 ? 'var(--good)' : score >= 60 ? 'var(--warn)' : 'var(--bad)';
        return '<svg class="score-ring" viewBox="0 0 64 64"><circle cx="32" cy="32" r="' + r + '" fill="none" stroke="var(--sunk)" stroke-width="6"/><circle cx="32" cy="32" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="6" stroke-linecap="round" stroke-dasharray="' + (c * score) / 100 + ' ' + c + '" transform="rotate(-90 32 32)"/><text x="32" y="37" text-anchor="middle" font-family="var(--font-display)" font-size="17" fill="var(--ink)">' + score + '</text></svg>';
      }
      function panel() {
        const pn = $('#panel', body); if (!pn || !proj) return;
        ana = V.analyze(proj);
        const tabs = [['steps', 'Steps'], ['zones', 'Zones'], ['rooms', 'Rooms'], ['report', 'Report'], ['tools', 'Tools']];
        let h = '<div class="card"><div class="tabs" role="tablist">' + tabs.map(([v, l]) => '<button role="tab" data-tab="' + v + '" aria-selected="' + (tab === v) + '">' + l + '</button>').join('') + '</div>';
        const done = proj.done || {}, fp = (q) => (q ? '(' + (proj.scale ? (q[0] / proj.scale.ppu).toFixed(1) + ', ' + (q[1] / proj.scale.ppu).toFixed(1) + ' ' + proj.scale.unit : Math.round(q[0]) + ', ' + Math.round(q[1])) + ')' : '—');
        if (tab === 'steps') {
          const steps = [['upload', 'Upload map', 'upload', !!proj.image], ['center', 'Mark centre (A, B, C, D)', 'pin', !!done.center], ['boundary', 'Mark boundary', 'outline', !!done.boundary], ['side', 'Select side & degree', 'compass', !!done.side], ['zones', 'View 16 zones', 'vastu', !!(done.center && done.boundary && done.side)]];
          const openStep = stepOpen || (steps.find((x) => !x[3]) || steps[4])[0];
          h += '<div class="steps">' + steps.map(([k, label, ic, ok], i) => {
            let b = '<button class="step' + (openStep === k ? ' open' : '') + (ok ? ' ok' : '') + '" data-step="' + k + '"><span class="step-n">' + (ok ? icon('check') : i + 1) + '</span>' + icon(ic) + '<span class="grow">' + label + '</span></button>';
            if (openStep !== k) return b;
            b += '<div class="step-body stack-sm">';
            if (k === 'upload') b += '<label class="field"><span>Project name</span><input class="input" id="v-name" value="' + esc(proj.name) + '"></label><div class="row" style="gap:6px"><label class="btn sm">' + icon('image') + 'Change image<input type="file" accept="image/*" class="v-change" hidden></label><button class="btn sm" data-act-v="blank">' + icon('outline') + 'Draw without image</button></div><p class="note">Use a clear, straight-on photo or scan. Changing the image keeps your markings and rescales them.</p><button class="btn sm primary" data-step="center">Next: mark centre</button>';
            if (k === 'center') {
              b += '<div class="seg" style="width:100%;display:grid;grid-template-columns:repeat(3,1fr)">' + [['center4', 'pin', '4 points'], ['centerRect', 'vastu', 'Rectangle'], ['auto', 'star', 'Auto']].map(([m, ic2, l]) => '<button data-cm="' + m + '" aria-pressed="' + (mode === m || (m === 'auto' && proj.centerMode === 'auto' && mode === 'select') || (m === 'center4' && proj.centerMode === 'abcd' && mode === 'select') || (m === 'centerRect' && proj.centerMode === 'rect' && mode === 'select')) + '" style="display:flex;gap:6px;justify-content:center;align-items:center">' + icon(ic2) + l + '</button>').join('') + '</div>' +
                '<p class="note">' + ({ center4: 'Click the four plot corners A, B, C, D in order. The diagonals A–C and B–D cross at the Brahmasthan.', centerRect: 'Drag a rectangle over the main body of the plot (ignore small extensions). Its centre is used.', auto: 'Anubhuti uses the centre of gravity of the boundary you mark.' }[mode === 'center4' || mode === 'centerRect' ? mode : proj.centerMode === 'rect' ? 'centerRect' : proj.centerMode === 'abcd' ? 'center4' : 'auto']) + '</p>' +
                '<div class="grid g2 small" style="gap:4px 12px">' + ['A', 'B', 'C', 'D'].map((L, i) => '<div><b>' + L + ':</b> <span class="mono">' + fp(proj.abcd && proj.abcd[i]) + '</span></div>').join('') + '</div>' +
                '<div class="small">Centre: <span class="mono">' + fp(V.center(proj)) + '</span> <span class="muted">(' + ({ abcd: 'from A-B-C-D', rect: 'from rectangle', auto: 'auto', undefined: 'auto' }[proj.centerMode] || (proj.center ? 'moved by hand' : 'auto')) + ')</span></div>' +
                '<div class="grid g2" style="gap:6px"><button class="btn sm" data-act-v="abcd-undo"' + (proj.abcd && proj.abcd.length ? '' : ' disabled') + '>' + icon('left') + 'Undo</button><button class="btn sm danger" data-act-v="abcd-reset">' + icon('refresh') + 'Reset</button></div>' +
                '<button class="btn sm primary" data-act-v="done-center">Use this centre</button>';
            }
            if (k === 'boundary') b += '<div class="grid g2" style="gap:6px"><button class="btn sm" data-act-v="trace">' + icon('outline') + 'Trace corners</button><button class="btn sm" data-act-v="boundRect">' + icon('vastu') + 'Rectangle</button><button class="btn sm" data-act-v="useabcd"' + (proj.abcd && proj.abcd.length === 4 ? '' : ' disabled') + '>' + icon('pin') + 'Use A-B-C-D</button><button class="btn sm" data-act-v="rect">' + icon('fit') + 'Image edges</button></div><p class="note">Drag the orange corner dots onto the outer walls. Drag a small + on an edge to add a corner; double-click a corner to remove it. Include extensions and leave out cuts.</p><button class="btn sm primary" data-act-v="done-boundary">Boundary is correct</button>';
            if (k === 'side') {
              const sr = proj.sideRef || { side: 'top', deg: '' };
              b += '<div class="field"><span>Which side of the drawing did you measure?</span><div class="seg" style="width:100%;display:grid;grid-template-columns:repeat(4,1fr)">' + [['top', 'Top'], ['right', 'Right'], ['bottom', 'Bottom'], ['left', 'Left']].map(([v, l]) => '<button data-side="' + v + '" aria-pressed="' + (sr.side === v) + '">' + l + '</button>').join('') + '</div></div>' +
                '<label class="field"><span>Compass degree when facing out of that side</span><input class="input mono" id="v-sdeg" type="number" step="0.5" min="0" max="359.9" placeholder="e.g. 95" value="' + (sr.deg === '' || sr.deg == null ? '' : sr.deg) + '"></label>' +
                '<input type="range" id="v-sdeg-r" min="0" max="359.5" step="0.5" value="' + (sr.deg === '' || sr.deg == null ? 0 : sr.deg) + '" aria-label="Side degree">' +
                '<div class="row" style="gap:4px">' + [-5, -1, -0.5, 0.5, 1, 5].map((d) => '<button class="btn sm" data-sd="' + d + '">' + (d > 0 ? '+' : '') + d + '°</button>').join('') + '</div>' +
                '<div class="row" style="gap:4px">' + [['N', 0], ['NE', 45], ['E', 90], ['SE', 135], ['S', 180], ['SW', 225], ['W', 270], ['NW', 315]].map(([l, d]) => '<button class="btn sm ghost" data-sdp="' + d + '" title="' + d + '°">' + l + '</button>').join('') + '</div>' +
                '<div class="small" id="v-sres">' + (sr.deg !== '' && sr.deg != null ? sideText(sr) : 'Stand inside, face the chosen side’s wall (often the main door), hold the phone flat and read the degree.') + '</div>' +
                '<hr class="sep"><div class="field"><span>Or set north directly</span><div class="row" style="gap:14px;align-items:center">' + dialSvg(proj.north || 0) +
                '<div class="stack-sm grow"><div class="row" style="gap:6px"><input class="input mono" id="v-north" type="number" step="0.5" min="0" max="359.5" value="' + (proj.north == null ? '' : proj.north) + '" placeholder="not set" style="width:92px"><span class="small muted">° north</span></div><div class="row" style="gap:4px">' + [-5, -1, 1, 5].map((d) => '<button class="btn sm" data-nd="' + d + '">' + (d > 0 ? '+' : '') + d + '</button>').join('') + '</div><a class="small" href="#compass">Measure with the compass</a></div></div></div>' +
                '<p class="note">You can also drag the red <b>N</b> handle on the plan to where north is.</p><button class="btn sm primary" data-act-v="done-side"' + (proj.north == null ? ' disabled' : '') + '>Direction is set</button>';
            }
            if (k === 'zones') b += '<div class="row" style="gap:12px">' + scoreRing(ana.score) + '<div class="small">' + ana.issues.filter((x) => x.sev === 'high').length + ' major and ' + ana.issues.filter((x) => x.sev === 'medium').length + ' minor findings.</div></div><div class="grid g2" style="gap:6px"><button class="btn sm" data-tab="zones">16 zones & bar chart</button><button class="btn sm" data-tab="rooms">Mark rooms & objects</button><button class="btn sm" data-tab="report">Report</button><button class="btn sm" data-tab="tools">Tools & layers</button></div>';
            return b + '</div>';
          }).join('') + '</div>';
        } else if (tab === 'zones') {
          const z = sel != null ? ana.zones[sel] : null;
          const max = Math.max(...ana.zones.map((x) => Math.max(x.pct, x.ePct))) * 1.1;
          h += '<div class="row" style="gap:12px;margin-bottom:10px">' + scoreRing(ana.score) + '<div class="small"><b>How complete is each direction?</b><br><span class="muted">The coloured bar is the zone’s actual size; the black tick is its size in a complete rectangle.</span></div></div>' +
            '<div class="bars">' + ana.zones.map((x) => '<div class="bar-row' + (sel === x.i ? ' sel' : '') + '" data-zone="' + x.i + '"><b>' + x.id + '</b><div class="track"><div class="fill" style="width:' + (x.pct / max) * 100 + '%;background:' + (x.status === 'cut' ? 'var(--bad)' : x.status === 'weak' ? 'var(--warn)' : x.status === 'extended' ? 'var(--indigo)' : 'var(--el-' + x.info.el.toLowerCase() + ')') + '"></div><div class="ideal" style="left:' + (x.ePct / max) * 100 + '%"></div></div><span class="num tiny" style="text-align:right">' + Math.round(x.ratio * 100) + '%</span></div>').join('') + '</div>' +
            '<div class="legend" style="margin-top:8px"><span><i style="background:var(--bad)"></i>Missing part (cut)</span><span><i style="background:var(--warn)"></i>Slightly short</span><span><i style="background:var(--indigo)"></i>Sticks out (extension)</span></div><p class="note" style="margin-top:6px">100% means the zone is as big as it would be in a complete rectangle. A “cut” means part of that direction is missing from the house; an “extension” means it sticks out.</p>';
          if (z) {
            h += '<hr class="sep" style="margin:12px 0"><div class="zone-card stack-sm" style="border-color:var(--el-' + z.info.el.toLowerCase() + ')"><div class="row-between"><h3>' + esc(z.info.name) + ' <span class="muted small">' + esc(z.info.sa) + '</span></h3><span class="chip ' + (z.status === 'cut' ? 'bad' : z.status === 'weak' ? 'ok' : z.status === 'extended' ? 'accent' : 'good') + '">' + z.status + '</span></div>' +
              '<div><b>' + esc(z.info.theme) + '</b></div><dl class="kv small"><dt>Element</dt><dd>' + z.info.el + '</dd><dt>Planet</dt><dd>' + esc(z.info.planet) + '</dd><dt>Deity</dt><dd>' + esc(z.info.deity) + '</dd><dt>Good for</dt><dd>' + esc(z.info.good) + '</dd><dt>Avoid</dt><dd>' + esc(z.info.avoid) + '</dd><dt>Colours</dt><dd>' + esc(z.info.colors) + '</dd><dt>Area</dt><dd>' + z.pct.toFixed(1) + '% (normal ' + z.ePct.toFixed(1) + '%)</dd></dl>' +
              (z.status === 'cut' || z.status === 'weak' ? '<div class="callout small"><b>Balancing idea:</b> ' + esc(ELEM_REMEDY[z.info.el]) + '</div>' : '') +
              (ana.rooms.filter((r) => r.zone === z.id).length ? '<div class="small">In this zone: ' + ana.rooms.filter((r) => r.zone === z.id).map((r) => esc(r.label)).join(', ') + '</div>' : '') + '</div>';
          } else h += '<p class="small muted" style="margin-top:10px">Tap a bar or a zone on the plan for details.</p>';
        } else if (tab === 'rooms') {
          const r = selRoom && ana.rooms.find((x) => x.id === selRoom);
          const palBtn = ([k, v]) => '<button data-rt="' + k + '" aria-pressed="' + (mode === 'room' && roomType === k) + '">' + icon(v.icon) + '<span>' + v.label + '</span></button>';
          h += '<p class="small muted" style="margin-bottom:8px">Choose a room or object, then click its spot on the plan. Each one is checked against its ideal zones.</p><h4 style="margin-bottom:6px">Rooms</h4><div class="room-palette">' + Object.entries(D.ROOMS).filter(([, v]) => v.group !== 'object').map(palBtn).join('') + '</div><h4 style="margin:12px 0 6px">Objects</h4><div class="room-palette">' + Object.entries(D.ROOMS).filter(([, v]) => v.group === 'object').map(palBtn).join('') + '</div>';
          if (r) h += '<hr class="sep" style="margin:12px 0"><div class="stack-sm"><div class="row-between"><h3>' + esc(r.label) + '</h3><span class="chip ' + (r.q === 'good' ? 'good' : r.q === 'avoid' ? 'bad' : r.q === 'ok' ? 'ok' : '') + '">' + ({ good: 'ideal', avoid: 'avoid', ok: 'acceptable', neutral: 'neutral' }[r.q]) + '</span></div><div class="small">' + esc(r.zoneName) + ' zone · bearing ' + r.bearing.toFixed(0) + '°' + (r.inCenter ? ' · in Brahmasthan' : '') + '</div><div class="small">' + esc(r.why) + '</div>' +
            '<label class="field"><span>Label</span><input class="input" id="v-rlabel" value="' + esc(r.label) + '"></label><button class="btn sm danger" data-rm-room="' + r.id + '">' + icon('trash') + 'Remove</button></div>';
          h += '<hr class="sep" style="margin:12px 0"><h4 style="margin-bottom:6px">Placed (' + ana.rooms.length + ')</h4>' + (ana.rooms.length ? ana.rooms.map((x) => '<div class="issue" style="cursor:pointer" data-sel-room="' + x.id + '"><span class="dot-q ' + (x.q === 'good' ? 'good' : x.q === 'avoid' ? 'avoid' : 'ok') + '"></span><div class="grow"><b>' + esc(x.label) + '</b> <span class="muted">· ' + x.zone + (x.pada ? ' · ' + x.pada.code : '') + '</span><div class="tiny muted">' + esc(x.why) + '</div></div></div>').join('') : '<p class="small muted">No rooms marked yet.</p>');
        } else if (tab === 'tools') {
          const area = proj.scale ? ana.area / (proj.scale.ppu * proj.scale.ppu) : null;
          h += '<div class="stack"><div class="field"><span>Layers</span><div class="grid g2" style="gap:6px">' + [['zones', '16 zones'], ['tint', 'Element colours'], ['labels', 'Zone labels'], ['ring', 'Compass ring'], ['padas', '32 entrances'], ['devtas', '45 devtas'], ['rooms', 'Rooms & objects'], ['roomLabels', 'Names'], ['abcd', 'A-B-C-D points'], ['dims', 'Wall lengths'], ['dim', 'Dim outside'], ['kua', 'My Kua directions']].map(([k, l]) => '<label class="check small"><input type="checkbox" data-layer="' + k + '"' + (layers[k] ? ' checked' : '') + '>' + l + '</label>').join('') + '</div></div>' +
            '<label class="field"><span>Plan image strength</span><input type="range" min="0.15" max="1" step="0.05" id="v-alpha" value="' + (layers.imgAlpha == null ? 1 : layers.imgAlpha) + '"></label>' +
            '<div class="field"><span>Scale</span><div class="small">' + (proj.scale ? '1 ' + proj.scale.unit + ' = ' + proj.scale.ppu.toFixed(2) + ' px · plot area <b>' + area.toFixed(1) + ' sq ' + proj.scale.unit + '</b>' + (proj.scale.unit === 'ft' ? ' (' + (area / 9).toFixed(1) + ' sq yd / gaj, ' + (area / 10.7639).toFixed(1) + ' m²)' : ' (' + (area * 10.7639).toFixed(0) + ' sq ft)') : 'Not calibrated. Calibrate to see wall lengths, plot area and real distances.') + '</div>' +
            (calibPx != null ? '<div class="row" style="gap:6px"><input class="input mono" id="v-clen" type="number" step="0.1" min="0.1" placeholder="Real length" style="width:120px"><select class="input" id="v-cunit" style="width:auto"><option value="ft">feet</option><option value="m">metres</option></select><button class="btn sm primary" data-act-v="calib-save">Save scale</button></div>' : '<div class="row" style="gap:6px"><button class="btn sm" data-act-v="calib">' + icon('fit') + 'Calibrate scale</button>' + (proj.scale ? '<button class="btn sm ghost" data-act-v="calib-clear">Clear</button>' : '') + '</div>') + '</div>' +
            '<div class="field"><span>Measure</span><div class="row" style="gap:6px"><button class="btn sm" data-act-v="measure">' + icon('pointer') + 'Measure distance</button>' + (lastMeasure != null ? '<span class="small">Last: <b>' + (proj.scale ? (lastMeasure / proj.scale.ppu).toFixed(2) + ' ' + proj.scale.unit : Math.round(lastMeasure) + ' px') + '</b></span>' : '') + '</div></div>' +
            '<div class="field"><span>Shortcuts</span><p class="small muted">Scroll or pinch to zoom · drag empty space to pan · Esc cancels a tool · Enter finishes tracing · Delete removes the selected room</p></div>' +
            '<div class="row-between"><button class="btn sm danger" data-act-v="delete">' + icon('trash') + 'Delete project</button>' + (proj.sample ? '<span class="chip">Sample</span>' : '') + '</div></div>';
        } else {
          const hi = ana.issues.filter((i) => i.sev === 'high'), me = ana.issues.filter((i) => i.sev === 'medium'), go = ana.issues.filter((i) => i.sev === 'good');
          const p = app.activeProfile(), k = p ? N.kua(p.dob, p.gender) : null;
          h += '<div class="row" style="gap:12px;margin-bottom:10px">' + scoreRing(ana.score) + '<div><b>' + esc(proj.name) + '</b><div class="small muted">' + hi.length + ' major, ' + me.length + ' minor findings</div></div></div>' +
            (ana.issues.length ? ana.issues.sort((a, b) => ({ high: 0, medium: 1, good: 2 }[a.sev] - { high: 0, medium: 1, good: 2 }[b.sev])).map((i) => '<div class="issue"><span class="dot-q ' + (i.sev === 'high' ? 'bad' : i.sev === 'medium' ? 'ok' : 'good') + '"></span><span>' + esc(i.text) + '</span></div>').join('') : '<p class="small">No cuts, extensions or misplaced rooms detected.</p>') +
            (k ? '<hr class="sep" style="margin:12px 0"><div class="small"><b>' + esc(p.name.split(' ')[0]) + '’s Kua ' + k.kua + '</b> (' + k.group + '): best directions ' + k.dirs.join(', ') + '. Sleep with the head toward ' + k.dirs[1] + ' or ' + k.dirs[0] + '.</div>' : '') +
            '<hr class="sep" style="margin:12px 0"><div class="stack-sm"><button class="btn" data-act-v="png">' + icon('image') + 'Download annotated plan</button><button class="btn" data-act-v="report">' + icon('download') + 'Download full report</button><a class="btn accent" href="#ask" data-act-v="ask">' + icon('ask') + 'Ask Anubhuti about this plan</a></div>' + (go.length ? '' : '');
        }
        if (proj.north == null && (tab === 'zones' || tab === 'report' || tab === 'rooms')) h = h.replace('<div class="card"><div class="tabs"', '<div class="card"><div class="callout small" style="margin-bottom:10px;border-color:var(--saffron);background:var(--saffron-soft)"><b>Choose the direction first.</b> Zones and checks depend on north. Set it in Steps → Select side &amp; degree, or drag the red N on the plan.</div><div class="tabs"');
        h += '</div>';
        pn.innerHTML = h;
        bindPanel(pn);
      }
      function bindPanel(pn) {
        $$('[data-tab]', pn).forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; lsSet('vtab', tab); if (tab !== 'rooms' && mode === 'room') setMode('select'); panel(); }));
        const nm = $('#v-name', pn); nm && nm.addEventListener('change', () => { proj.name = nm.value.trim() || 'Untitled plan'; delete proj.sample; commit(true); fillProjects(); });
        const ni = $('#v-north', pn); ni && ni.addEventListener('input', () => { const v = parseFloat(ni.value); if (isFinite(v)) { proj.north = ((v % 360) + 360) % 360; draw(); updDial(); commit(); const dn = pn.querySelector('[data-act-v="done-side"]'); if (dn) dn.disabled = false; } });
        $$('[data-nd]', pn).forEach((b) => b.addEventListener('click', () => { proj.north = (((proj.north || 0) + +b.dataset.nd) % 360 + 360) % 360; ni.value = proj.north; draw(); updDial(); commit(); const dn = pn.querySelector('[data-act-v="done-side"]'); if (dn) dn.disabled = false; }));
        const dial = $('#dial', pn);
        if (dial) {
          let dragging = false;
          const setFrom = (e) => { const r = dial.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2; let a = Math.atan2(x, -y) / D2R; a = ((a % 360) + 360) % 360; proj.north = e.shiftKey ? Math.round(a) : Math.round(a * 2) / 2; ni.value = proj.north; draw(); updDial(); };
          dial.addEventListener('pointerdown', (e) => { dragging = true; dial.setPointerCapture(e.pointerId); setFrom(e); });
          dial.addEventListener('pointermove', (e) => { if (dragging) setFrom(e); });
          dial.addEventListener('pointerup', () => { dragging = false; commit(); panelSoon(); });
          dial.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { proj.north = ((proj.north || 0) + 1) % 360; } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { proj.north = ((proj.north || 0) + 359) % 360; } else return; e.preventDefault(); ni.value = proj.north; draw(); updDial(); commit(); });
        }
        $$('[data-layer]', pn).forEach((c) => c.addEventListener('change', () => { layers[c.dataset.layer] = c.checked; lsSet('vlayers', layers); if (c.dataset.layer === 'kua' && c.checked && !app.activeProfile()) toast('Add a person in the Family vault to see Kua directions.'); if (c.dataset.layer === 'ring' || c.dataset.layer === 'padas') fit(); draw(); }));
        $$('[data-step]', pn).forEach((b) => b.addEventListener('click', () => { stepOpen = stepOpen === b.dataset.step && b.classList.contains('step') ? '__none' : b.dataset.step; panel(); }));
        $$('[data-cm]', pn).forEach((b) => b.addEventListener('click', () => {
          const m = b.dataset.cm;
          if (m === 'auto') { delete proj.center; proj.centerMode = 'auto'; markDone('center'); commit(true); setMode('select'); toast('Centre set to the centre of gravity of the boundary'); panel(); return; }
          if (m === 'center4' && proj.abcd && proj.abcd.length === 4) proj.abcd = [];
          stepOpen = 'center'; setMode(m); panel();
        }));
        $$('[data-side]', pn).forEach((b) => b.addEventListener('click', () => { proj.sideRef = Object.assign({ deg: '' }, proj.sideRef, { side: b.dataset.side }); applySide(); panel(); }));
        const sd = $('#v-sdeg', pn); sd && sd.addEventListener('input', () => { const v = parseFloat(sd.value); proj.sideRef = Object.assign({ side: 'top' }, proj.sideRef, { deg: isFinite(v) ? v : '' }); applySide(); const r = $('#v-sres', pn); if (r && isFinite(v)) r.innerHTML = sideText(proj.sideRef); const n = $('#v-north', pn); if (n) n.value = proj.north; const r2 = $('#v-sdeg-r', pn); if (r2 && isFinite(v)) r2.value = v; updDial(); if (isFinite(v)) enableDone(); });
        const enableDone = () => { const dn = pn.querySelector('[data-act-v="done-side"]'); if (dn) dn.disabled = false; };
        const setSideDeg = (v) => { v = ((v % 360) + 360) % 360; proj.sideRef = Object.assign({ side: 'top' }, proj.sideRef, { deg: Math.round(v * 10) / 10 }); applySide(); const r = $('#v-sres', pn); if (r) r.innerHTML = sideText(proj.sideRef); const n1 = $('#v-sdeg', pn); if (n1) n1.value = proj.sideRef.deg; const n2 = $('#v-sdeg-r', pn); if (n2) n2.value = proj.sideRef.deg; const n = $('#v-north', pn); if (n) n.value = proj.north; updDial(); enableDone(); };
        const sr2 = $('#v-sdeg-r', pn); sr2 && sr2.addEventListener('input', () => setSideDeg(+sr2.value));
        $$('[data-sd]', pn).forEach((b) => b.addEventListener('click', () => { const cur = proj.sideRef && proj.sideRef.deg !== '' && proj.sideRef.deg != null ? +proj.sideRef.deg : 0; setSideDeg(cur + +b.dataset.sd); }));
        $$('[data-sdp]', pn).forEach((b) => b.addEventListener('click', () => setSideDeg(+b.dataset.sdp)));
        const al = $('#v-alpha', pn); al && al.addEventListener('input', () => { layers.imgAlpha = +al.value; lsSet('vlayers', layers); draw(); });
        const ch = pn.querySelector('.v-change'); ch && ch.addEventListener('change', changeImage);
        $$('[data-zone]', pn).forEach((b) => b.addEventListener('click', () => { const i = +b.dataset.zone; sel = sel === i ? null : i; draw(); panel(); }));
        $$('[data-rt]', pn).forEach((b) => b.addEventListener('click', () => { roomType = b.dataset.rt; setMode('room'); panel(); }));
        $$('[data-sel-room]', pn).forEach((b) => b.addEventListener('click', () => { selRoom = b.dataset.selRoom; draw(); panel(); }));
        const rl = $('#v-rlabel', pn); rl && rl.addEventListener('change', () => { const r = proj.rooms.find((x) => x.id === selRoom); if (r) { r.label = rl.value.trim() || undefined; commit(true); draw(); panel(); } });
        const rm = pn.querySelector('[data-rm-room]'); rm && rm.addEventListener('click', () => { proj.rooms = proj.rooms.filter((r) => r.id !== rm.dataset.rmRoom); selRoom = null; commit(true); draw(); panel(); });
        $$('[data-act-v]', pn).forEach((b) => b.addEventListener('click', async (e) => {
          const a = b.dataset.actV;
          if (a === 'trace') { stepOpen = 'boundary'; setMode('outline'); }
          if (a === 'boundRect') { stepOpen = 'boundary'; setMode('boundRect'); }
          if (a === 'useabcd' && proj.abcd && proj.abcd.length === 4) { proj.outline = proj.abcd.map((q) => [q[0], q[1]]); markDone('boundary'); commit(true); fit(); draw(); panel(); toast('Boundary set from A-B-C-D'); }
          if (a === 'abcd-undo' && proj.abcd && proj.abcd.length) { proj.abcd.pop(); if (proj.centerMode === 'abcd') { delete proj.center; proj.centerMode = 'auto'; proj.done = Object.assign({}, proj.done, { center: false }); } if (mode !== 'center4') setMode('center4'); commit(true); draw(); panel(); }
          if (a === 'abcd-reset') { proj.abcd = []; delete proj.center; proj.centerMode = 'auto'; proj.done = Object.assign({}, proj.done, { center: false }); commit(true); setMode('select'); draw(); panel(); }
          if (a === 'done-center') { if (!proj.centerMode) proj.centerMode = proj.center ? 'manual' : 'auto'; markDone('center'); stepOpen = null; setMode('select'); commit(true); panel(); }
          if (a === 'done-boundary') { markDone('boundary'); stepOpen = null; setMode('select'); commit(true); panel(); }
          if (a === 'done-side') { markDone('side'); stepOpen = null; commit(true); panel(); toast('All set. Explore the 16 zones.'); }
          if (a === 'blank') newBlank();
          if (a === 'calib') { calibPx = null; setMode('calib'); }
          if (a === 'calib-save') { const len = parseFloat(($('#v-clen', pn) || {}).value); if (!(len > 0)) { toast('Type the real length first.'); return; } proj.scale = { ppu: calibPx / len, unit: $('#v-cunit', pn).value }; calibPx = null; setMode('select'); commit(true); draw(); panel(); toast('Scale saved'); }
          if (a === 'calib-clear') { delete proj.scale; commit(true); draw(); panel(); }
          if (a === 'measure') { lastMeasure = null; setMode('measure'); }
          if (a === 'rect') { const iw = (proj.image && proj.image.w) || 1200, ih = (proj.image && proj.image.h) || 900; proj.outline = [[iw * 0.04, ih * 0.04], [iw * 0.96, ih * 0.04], [iw * 0.96, ih * 0.96], [iw * 0.04, ih * 0.96]]; if (proj.centerMode !== 'abcd' && proj.centerMode !== 'rect') delete proj.center; commit(true); fit(); draw(); panel(); }
          if (a === 'center') { delete proj.center; commit(true); draw(); panel(); }
          if (a === 'delete') { if (await confirmSheet('Delete “' + proj.name + '”?', 'The plan, outline and rooms will be removed. This cannot be undone.', 'Delete', true)) { S.deleteProject(proj.id); const n = st.projects[0] || null; S.saveSettings({ vastuCurrent: n ? n.id : null }); open(n); } }
          if (a === 'png') { b.disabled = true; const blob = await renderPng(proj, { kua: layers.kua, layers: { devtas: layers.devtas } }); b.disabled = false; const r = await S.download(slug(proj.name) + '-vastu.png', blob, 'image/png'); if (r === 'unavailable') toast('Downloads are not available in this view.'); }
          if (a === 'report') { b.disabled = true; const html = await reportHtml(proj); b.disabled = false; const r = await S.download(slug(proj.name) + '-vastu-report.html', html, 'text/html'); if (r === 'unavailable') toast('Downloads are not available in this view.'); }
          if (a === 'ask') lsSet('askPreset', 'vastu');
        }));
      }
      let pTimer; const panelSoon = () => { clearTimeout(pTimer); pTimer = setTimeout(panel, 60); };
      function updDial() { const d = $('#dial', body); if (d) { const g = d.querySelector('g'); g.setAttribute('transform', 'rotate(' + (proj.north || 0) + ')'); d.setAttribute('aria-valuenow', Math.round(proj.north || 0)); } }
      function markDone(k) { proj.done = Object.assign({}, proj.done, { [k]: true }); }
      function intersect(a, b, c, d) {
        const den = (a[0] - b[0]) * (c[1] - d[1]) - (a[1] - b[1]) * (c[0] - d[0]);
        if (Math.abs(den) < 1e-9) return null;
        const t = ((a[0] - c[0]) * (c[1] - d[1]) - (a[1] - c[1]) * (c[0] - d[0])) / den;
        return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
      }
      const SIDE_ANG = { top: 0, right: 90, bottom: 180, left: 270 };
      function applySide() { const r = proj.sideRef; if (!r || r.deg === '' || r.deg == null || !isFinite(r.deg)) return; proj.north = Math.round((((SIDE_ANG[r.side || 'top'] - r.deg) % 360 + 360) % 360) * 10) / 10; draw(); commit(); }
      function sideText(r) { const z = D.ZONES[V.zoneIndex(r.deg)], pd = D.PADAS[V.padaIndex(r.deg)]; return 'The <b>' + r.side + '</b> side faces <b>' + z.name + '</b> (' + (+r.deg).toFixed(1) + '°) · ' + z.id + '-facing. Entrance pada if the door is central: ' + pd.code + ' ' + pd.name + '. North is now at <b>' + (proj.north || 0) + '°</b> on the drawing.'; }
      async function newBlank() {
        const p = S.saveProject({ name: 'Drawn plan ' + (st.projects.length + 1), blank: true, image: { w: 1200, h: 900 }, north: null, outline: [[150, 120], [1050, 120], [1050, 780], [150, 780]], rooms: [], done: {} }, true);
        S.saveSettings({ vastuCurrent: p.id }); tab = 'steps'; lsSet('vtab', tab); stepOpen = 'boundary'; await open(p);
        setHint('Trace your plot on the grid, or drag the corners. Each grid square is 50 px; calibrate the scale in Tools.');
      }
      async function changeImage(e) {
        const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
        toast('Replacing the image…');
        try {
          const im = await S.saveImage(f), ow = (proj.image && proj.image.w) || im.w, oh = (proj.image && proj.image.h) || im.h, sx = im.w / ow, sy = im.h / oh;
          const sc = (q) => [q[0] * sx, q[1] * sy];
          proj.outline = proj.outline.map(sc); if (proj.center) proj.center = sc(proj.center); if (proj.abcd) proj.abcd = proj.abcd.map(sc);
          (proj.rooms || []).forEach((r) => { r.x *= sx; r.y *= sy; });
          if (proj.scale) proj.scale = { ...proj.scale, ppu: proj.scale.ppu * sx };
          proj.image = im; delete proj.blank; delete proj.sample;
          commit(true); img = await loadImage(S.imageSrc(im)); fit(); draw(); panel(); toast('Image replaced; markings kept');
        } catch (err) { toast(err.message || 'That image could not be loaded.'); }
      }
      const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'plan';

      async function onFile(e) {
        const f = e.target.files && e.target.files[0]; e.target.value = '';
        if (!f) return;
        toast('Preparing your plan…');
        try {
          const image = await S.saveImage(f);
          const iw = image.w, ih = image.h;
          const p = S.saveProject({ name: f.name.replace(/\.[^.]+$/, '').slice(0, 60) || 'My plan', image, north: null, outline: [[iw * 0.08, ih * 0.08], [iw * 0.92, ih * 0.08], [iw * 0.92, ih * 0.92], [iw * 0.08, ih * 0.92]], rooms: [] }, true);
          S.saveSettings({ vastuCurrent: p.id });
          tab = 'steps'; lsSet('vtab', tab); stepOpen = 'center';
          await open(p);
          setHint('Step 2: mark the centre with A-B-C-D, a rectangle or Auto.');
          setTimeout(() => setHint(''), 7000);
        } catch (err) { toast(err.message || 'That image could not be loaded.'); }
      }
      $('#v-file', el).addEventListener('change', onFile);
      $('#v-blank', el).addEventListener('click', () => newBlank());
      $('#v-proj', el).addEventListener('change', (e) => { const p = st.projects.find((x) => x.id === e.target.value); if (p) open(p); });

      if (lsGet('vastuBlank', false)) { lsSet('vastuBlank', false); setTimeout(() => newBlank(), 0); } else open(pick());
      this.onData = () => { fillProjects(); if (!proj && st.projects.length) open(pick()); else if (proj && !st.projects.find((x) => x.id === proj.id)) open(pick()); else draw(); };
      return () => { document.removeEventListener('keydown', onKey); ro && ro.disconnect(); clearTimeout(saveTimer); if (proj) S.saveProject(proj, true); };
    },
  };

  async function reportHtml(proj) {
    const blob = await renderPng(proj, { kua: true });
    const dataUrl = await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
    const a = V.analyze(proj), p = app.activeProfile(), k = p ? N.kua(p.dob, p.gender) : null;
    const css = 'body{font-family:system-ui,sans-serif;color:#141a2e;max-width:960px;margin:32px auto;padding:0 20px;line-height:1.5}h1,h2{font-family:Georgia,serif;font-weight:400}table{border-collapse:collapse;width:100%;font-size:14px}td,th{border-bottom:1px solid #d8dee8;padding:6px 8px;text-align:left}img{max-width:100%;border:1px solid #d8dee8;border-radius:8px}.bad{color:#c0392f}.good{color:#1b8456}.muted{color:#667089}';
    return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vastu report · ' + esc(proj.name) + '</title><style>' + css + '</style></head><body>' +
      '<h1>Vastu report: ' + esc(proj.name) + '</h1><p class="muted">North at ' + (proj.north || 0).toFixed(1) + '° on the drawing · balance score ' + a.score + '/100 · generated ' + new Date().toLocaleDateString('en-IN') + '</p><img src="' + dataUrl + '" alt="Annotated floor plan">' +
      '<h2>Findings</h2><ul>' + (a.issues.map((i) => '<li class="' + (i.sev === 'high' ? 'bad' : i.sev === 'good' ? 'good' : '') + '">' + esc(i.text) + '</li>').join('') || '<li>No cuts, extensions or misplaced rooms detected.</li>') + '</ul>' +
      '<h2>Zones</h2><table><tr><th>Zone</th><th>Theme</th><th>Area</th><th>Normal</th><th>Status</th></tr>' + a.zones.map((z) => '<tr><td>' + z.info.name + '</td><td>' + esc(z.info.theme) + '</td><td>' + z.pct.toFixed(1) + '%</td><td>' + z.ePct.toFixed(1) + '%</td><td class="' + (z.status === 'cut' ? 'bad' : z.status === 'extended' ? 'good' : '') + '">' + z.status + '</td></tr>').join('') + '</table>' +
      (a.rooms.length ? '<h2>Rooms</h2><table><tr><th>Room</th><th>Zone</th><th>Verdict</th><th>Note</th></tr>' + a.rooms.map((r) => '<tr><td>' + esc(r.label) + '</td><td>' + r.zoneName + (r.pada ? ' (' + r.pada.code + ' ' + r.pada.name + ')' : '') + '</td><td class="' + (r.q === 'avoid' ? 'bad' : r.q === 'good' ? 'good' : '') + '">' + r.q + '</td><td>' + esc(r.why) + '</td></tr>').join('') + '</table>' : '') +
      (k ? '<h2>Kua directions for ' + esc(p.name) + '</h2><p>Kua ' + k.kua + ' (' + k.group + '): ' + k.dirs.map((d, i) => D.KUA_LABELS[i] + ' ' + d).join(' · ') + '</p>' : '') +
      '<p class="muted">Traditional guidance from popular Vastu conventions (16 zones, 32 entrance padas). Consult a practitioner before structural changes.</p></body></html>';
  }

  D.vastuView = { renderPng, summaryText };
})(window);
