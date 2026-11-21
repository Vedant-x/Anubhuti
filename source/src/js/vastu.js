/* Anubhuti — Vastu studio: floor plan, north, 16 zones, 32 padas, 45 devtas, rooms, zone balance. */
(function (G) {
  const D = (G.Disha = G.Disha || {});
  const norm = (a) => ((a % 360) + 360) % 360;
  const R2D = 180 / Math.PI, D2R = Math.PI / 180;
  const ZONE_IDS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const DIR8 = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

  /* ---------- geometry ---------- */
  function polyArea(pts) { let a = 0; for (let i = 0; i < pts.length; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length]; a += x1 * y2 - x2 * y1; } return a / 2; }
  function centroid(pts) {
    const A = polyArea(pts); if (Math.abs(A) < 1e-6) return bboxCenter(pts);
    let cx = 0, cy = 0;
    for (let i = 0; i < pts.length; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length], f = x1 * y2 - x2 * y1; cx += (x1 + x2) * f; cy += (y1 + y2) * f; }
    return [cx / (6 * A), cy / (6 * A)];
  }
  function bbox(pts) { const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]); return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) }; }
  function bboxCenter(pts) { const b = bbox(pts); return [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2]; }
  function inPoly(x, y, pts) {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  const bearingOf = (x, y, c, north) => norm(Math.atan2(x - c[0], -(y - c[1])) * R2D - north);
  const zoneIndex = (b) => Math.floor(norm(b + 11.25) / 22.5);
  const padaIndex = (b) => Math.floor(norm(b - 315) / 11.25);
  const dir8Index = (b) => Math.floor(norm(b + 22.5) / 45);
  function rayDist(c, angDeg, pts) { // distance from c along image angle to polygon edge (max hit)
    const dx = Math.sin(angDeg * D2R), dy = -Math.cos(angDeg * D2R); let best = 0;
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
      const ex = x2 - x1, ey = y2 - y1, den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-9) continue;
      const t = ((x1 - c[0]) * ey - (y1 - c[1]) * ex) / den, u = ((x1 - c[0]) * dy - (y1 - c[1]) * dx) / den;
      if (t > 0 && u >= 0 && u <= 1) best = Math.max(best, t);
    }
    return best;
  }

  /* Smallest rectangle (any rotation) around the outline, so a slightly tilted or
     hand-traced plan is compared with its own rectangle, not a skewed box. */
  function hull(pts) {
    const P = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const p of P) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (const p of P.slice().reverse()) { while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  function minRect(pts) {
    const H = hull(pts); let best = null;
    for (let i = 0; i < H.length; i++) {
      const a = H[i], b = H[(i + 1) % H.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 1e-9) continue;
      const ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L;
      let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
      for (const p of H) { const u = p[0] * ux + p[1] * uy, v = -p[0] * uy + p[1] * ux; u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v); }
      const area = (u1 - u0) * (v1 - v0);
      if (!best || area < best.area) best = { area, ux, uy, u0, u1, v0, v1 };
    }
    return best;
  }
  const inRect = (x, y, r) => { const u = x * r.ux + y * r.uy, v = -x * r.uy + y * r.ux; return u >= r.u0 && u <= r.u1 && v >= r.v0 && v <= r.v1; };
  /* ---------- analysis ---------- */
  function center(p) { return p.center || centroid(p.outline); }
  function analyze(p) {
    const pts = p.outline, c = center(p), north = p.north || 0, b = bbox(pts);
    const W = b.x1 - b.x0, H = b.y1 - b.y0, step = Math.max(W, H) / 240;
    const act = new Array(16).fill(0), exp = new Array(16).fill(0);
    let tot = 0, totE = 0;
    const mr = minRect(pts);
    const rc = [[mr.u0, mr.v0], [mr.u1, mr.v0], [mr.u1, mr.v1], [mr.u0, mr.v1]].map(([u, v]) => [u * mr.ux - v * mr.uy, u * mr.uy + v * mr.ux]);
    const rb = bbox(rc), st2 = Math.max(rb.x1 - rb.x0, rb.y1 - rb.y0) / 240;
    for (let y = rb.y0 + st2 / 2; y < rb.y1; y += st2) for (let x = rb.x0 + st2 / 2; x < rb.x1; x += st2) {
      const z = zoneIndex(bearingOf(x, y, c, north));
      if (inRect(x, y, mr)) { exp[z]++; totE++; }
      if (inPoly(x, y, pts)) { act[z]++; tot++; }
    }
    const zones = ZONE_IDS.map((id, i) => {
      const pct = tot ? (act[i] / tot) * 100 : 0, ePct = totE ? (exp[i] / totE) * 100 : 0;
      const ratio = ePct ? pct / ePct : 1, gap = ePct - pct;
      // small drawing wobbles are ignored: a zone must be clearly short (or long) by share of the whole plot
      const status = ratio < 0.75 && gap > 1.5 ? 'cut' : ratio < 0.88 && gap > 0.8 ? 'weak' : ratio > 1.15 && -gap > 1.5 ? 'extended' : 'balanced';
      return { id, i, pct, ePct, ratio, status, info: D.ZONES[i] };
    });
    const rooms = (p.rooms || []).map((r) => evaluateRoom(r, p, c, b));
    const issues = [];
    zones.forEach((z) => {
      if (z.status === 'cut') issues.push({ sev: ['NE', 'SW', 'N', 'E'].includes(z.id) ? 'high' : 'medium', text: z.info.name + ' has a missing part (a “cut”): about ' + Math.round((1 - z.ratio) * 100) + '% of this zone is missing. This zone looks after ' + z.info.theme.toLowerCase() + '.' });
      if (z.status === 'extended' && ['SW', 'SE', 'S', 'NW'].includes(z.id)) issues.push({ sev: 'medium', text: z.info.name + ' sticks out (an “extension”) by about ' + Math.round((z.ratio - 1) * 100) + '%. Extensions here are traditionally not good.' });
      if (z.status === 'extended' && ['NE', 'N', 'E'].includes(z.id)) issues.push({ sev: 'good', text: z.info.name + ' sticks out (an “extension”). This is traditionally lucky.' });
    });
    rooms.forEach((r) => { if (r.q === 'avoid') issues.push({ sev: 'high', text: r.label + ' in ' + r.zoneName + ': ' + r.why }); });
    const score = Math.max(0, Math.round(100 - issues.reduce((a, i) => a + (i.sev === 'high' ? 12 : i.sev === 'medium' ? 6 : i.sev === 'good' ? -3 : 0), 0)));
    return { center: c, bbox: b, zones, rooms, issues, score: Math.min(100, score), area: Math.abs(polyArea(pts)) };
  }
  function evaluateRoom(r, p, c, b) {
    const R = D.ROOMS[r.type] || { label: r.type };
    const bear = bearingOf(r.x, r.y, c, p.north || 0), zi = zoneIndex(bear), zid = ZONE_IDS[zi];
    const W = b.x1 - b.x0, H = b.y1 - b.y0;
    const inCenter = Math.abs(r.x - c[0]) < W / 6 && Math.abs(r.y - c[1]) < H / 6;
    const out = { ...r, label: r.label || R.label, bearing: bear, zone: zid, zoneName: D.ZONES[zi].name, inCenter };
    if (R.rule === 'pada') {
      const pi = padaIndex(bear), pd = D.PADAS[pi];
      return { ...out, pada: pd, q: pd.q === 'good' ? 'good' : pd.q === 'neutral' ? 'ok' : 'avoid', why: pd.code + ' ' + pd.name + ': ' + pd.effect };
    }
    if (inCenter && R.avoid && R.avoid.includes('C')) return { ...out, q: 'avoid', why: 'It sits in the Brahmasthan (centre), which should stay open and light.' };
    if (R.good && R.good.includes(zid)) return { ...out, q: 'good', why: 'Ideal zone for a ' + R.label.toLowerCase() + '.' };
    if (R.avoid && R.avoid.includes(zid)) return { ...out, q: 'avoid', why: 'Traditionally avoided here. Better zones: ' + R.good.join(', ') + '.' };
    if (R.ok && R.ok.includes(zid)) return { ...out, q: 'ok', why: 'Acceptable. Ideal zones: ' + R.good.join(', ') + '.' };
    return { ...out, q: 'neutral', why: 'Neutral placement. Ideal zones: ' + (R.good || []).join(', ') + '.' };
  }

  /* 45-devta mandala cells for a north-up 9x9 grid (row 0 = north side) */
  function mandalaCells() {
    const cells = [];
    const north = ['Roga', 'Naga', 'Mukhya', 'Bhallat', 'Soma', 'Bhujag', 'Aditi', 'Diti', 'Shikhi'];
    north.forEach((n, i) => cells.push({ r: 0, c: i, name: n }));
    ['Parjanya', 'Jayant', 'Mahendra', 'Surya', 'Satya', 'Bhrisha', 'Antariksha'].forEach((n, i) => cells.push({ r: i + 1, c: 8, name: n }));
    cells.push({ r: 8, c: 8, name: 'Anil' });
    ['Pusha', 'Vitatha', 'Grihakshat', 'Yama', 'Gandharva', 'Bhringraj', 'Mriga'].forEach((n, i) => cells.push({ r: 8, c: 7 - i, name: n }));
    cells.push({ r: 8, c: 0, name: 'Pitra' });
    ['Dauvarik', 'Sugreev', 'Pushpdant', 'Varun', 'Asur', 'Shosh', 'Papyakshma'].forEach((n, i) => cells.push({ r: 7 - i, c: 0, name: n }));
    cells.push({ r: 3, c: 3, w: 3, h: 3, name: 'Brahma' });
    cells.push({ r: 1, c: 3, w: 3, h: 2, name: 'Bhudhar' });
    cells.push({ r: 3, c: 6, w: 2, h: 3, name: 'Aryama' });
    cells.push({ r: 6, c: 3, w: 3, h: 2, name: 'Vivasvan' });
    cells.push({ r: 3, c: 1, w: 2, h: 3, name: 'Mitra' });
    // corner 2x2 blocks split along the diagonal into two triangles
    cells.push({ r: 1, c: 6, w: 2, h: 2, tri: ['Apa', 'Apavatsa'], corner: 'NE' });
    cells.push({ r: 6, c: 6, w: 2, h: 2, tri: ['Savitra', 'Savitri'], corner: 'SE' });
    cells.push({ r: 6, c: 1, w: 2, h: 2, tri: ['Jaya', 'Indra'], corner: 'SW' });
    cells.push({ r: 1, c: 1, w: 2, h: 2, tri: ['Rajayakshma', 'Rudra'], corner: 'NW' });
    return cells;
  }
  const MANDALA = mandalaCells();

  /* ---------- sample plan ---------- */
  function samplePlan() {
    const W = 1200, H = 900, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d');
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, H);
    x.strokeStyle = '#e9edf3'; x.lineWidth = 1;
    for (let i = 0; i < W; i += 30) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); }
    for (let i = 0; i < H; i += 30) { x.beginPath(); x.moveTo(0, i); x.lineTo(W, i); x.stroke(); }
    const outer = [[100, 100], [860, 100], [860, 230], [1100, 230], [1100, 800], [100, 800]];
    const rooms = [
      [100, 100, 520, 430, 'Living'], [520, 100, 860, 360, 'Bedroom 2'], [860, 230, 1100, 470, 'Study'], [520, 360, 860, 560, 'Dining'],
      [860, 470, 1100, 800, 'Kitchen'], [100, 430, 480, 800, 'Master bedroom'], [480, 620, 640, 800, 'Toilet'], [640, 560, 860, 800, 'Store'], [480, 430, 520, 620, ''],
    ];
    x.fillStyle = '#f7f8fb'; x.beginPath(); outer.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.closePath(); x.fill();
    x.strokeStyle = '#3d4456'; x.lineWidth = 3;
    rooms.forEach(([a, b, cc, d]) => x.strokeRect(a, b, cc - a, d - b));
    x.lineWidth = 9; x.beginPath(); outer.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.closePath(); x.stroke();
    x.fillStyle = '#ffffff'; x.fillRect(535, 92, 70, 16); // door gap
    x.strokeStyle = '#3d4456'; x.lineWidth = 2; x.beginPath(); x.arc(535, 108, 70, 0, Math.PI / 2); x.stroke();
    x.fillStyle = '#5b6478'; x.font = '600 26px system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    rooms.forEach(([a, b, cc, d, n]) => n && x.fillText(n, (a + cc) / 2, (b + d) / 2));
    x.font = '500 18px system-ui, sans-serif'; x.fillStyle = '#8a92a6'; x.fillText('Main door', 570, 140);
    x.textAlign = 'left'; x.fillText('Sample plan · 2BHK with a cut in one corner', 100, 850);
    return {
      name: 'Sample: 2BHK house', sample: true, north: 8, done: { center: true, boundary: true, side: true }, centerMode: 'auto', sideRef: { side: 'top', deg: 352 },
      image: { data: c.toDataURL('image/jpeg', 0.85), w: W, h: H },
      outline: outer,
      rooms: [
        { id: 'r1', type: 'entrance', x: 570, y: 104 }, { id: 'r2', type: 'kitchen', x: 980, y: 640 }, { id: 'r3', type: 'master', x: 290, y: 615 },
        { id: 'r4', type: 'toilet', x: 560, y: 710 }, { id: 'r5', type: 'living', x: 310, y: 265 }, { id: 'r6', type: 'study', x: 980, y: 350 },
        { id: 'r7', type: 'store', x: 750, y: 680 }, { id: 'r8', type: 'bedroom', x: 690, y: 230 },
      ],
    };
  }

  D.vastu = { analyze, evaluateRoom, centroid, bbox, inPoly, bearingOf, zoneIndex, padaIndex, dir8Index, rayDist, polyArea, samplePlan, MANDALA, ZONE_IDS, DIR8, center };
})(window);
