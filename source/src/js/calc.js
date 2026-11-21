/* Anubhuti — Vastu calculators: Aayadi, degree finder, door facing, area units, plot proportion. */
(function (G) {
  const D = (G.Disha = G.Disha || {});
  const { esc, $, $$, icon, lsGet, lsSet } = D.ui;
  const A = D.astro, V = D.vastu, app = D.app;
  const VARA = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function aayadi(L, B, ownerNak) {
    const area = Math.round(L * B);
    const m = (x, n) => { const r = x % n; return r === 0 ? n : r; };
    const aaya = m(area * 8, 12), vyaya = m(area * 9, 10), yoni = m(area * 3, 8), nak = m(area * 8, 27), vara = m(area * 9, 7), tithi = m(area * 8, 30);
    const checks = [
      ['Aaya ' + aaya + ' vs Vyaya ' + vyaya, aaya > vyaya, 'Income (aaya) should exceed expense (vyaya).'],
      ['Yoni: ' + D.AAYADI.yoni[yoni - 1], D.AAYADI.goodYoni.includes(yoni - 1), 'Dhwaja, Simha, Vrishabha and Gaja yonis are auspicious.'],
      ['Vara: ' + VARA[vara - 1], [1, 3, 4, 5].includes(vara - 1), 'Monday, Wednesday, Thursday and Friday are favoured.'],
      ['Tithi: ' + (tithi === 30 ? 'Amavasya' : A.tithiName(tithi - 1)), ![4, 9, 14, 19, 24, 29, 30].includes(tithi), 'Rikta tithis (4, 9, 14) and Amavasya are avoided.'],
      ['Nakshatra: ' + D.NAKSHATRAS[nak - 1].name, ownerNak == null ? true : A.tarabala(ownerNak, nak - 1).q !== 'bad', ownerNak == null ? 'Add a person to check it against their birth star.' : 'Checked by Tarabala with the owner’s birth star: ' + A.tarabala(ownerNak, nak - 1).name + '.'],
    ];
    return { area, aaya, vyaya, yoni, nak, vara, tithi, checks, score: checks.filter((c) => c[1]).length };
  }
  function suggest(L, B, ownerNak) {
    const out = [];
    for (let dl = -3; dl <= 3; dl += 0.5) for (let db = -3; db <= 3; db += 0.5) {
      const l = L + dl, b = B + db; if (l <= 0 || b <= 0) continue;
      const r = aayadi(l, b, ownerNak);
      if (r.score === 5) out.push({ l, b, area: r.area, d: Math.abs(dl) + Math.abs(db) });
    }
    return out.sort((a, c) => a.d - c.d).slice(0, 8);
  }
  const UNITS = [['sqft', 'Square feet', 1], ['sqm', 'Square metres', 10.7639], ['sqyd', 'Square yards (gaj)', 9], ['acre', 'Acres', 43560], ['hectare', 'Hectares', 107639], ['guntha', 'Guntha', 1089], ['cent', 'Cents', 435.6], ['marla', 'Marla', 272.25], ['kanal', 'Kanal', 5445]];

  app.views.calc = {
    onData() {},
    render(el) {
      const p = app.activeProfile(), natal = p ? app.chart(p) : null;
      const st = Object.assign({ L: 40, B: 30, deg: 92, door: 95, area: 1200, unit: 'sqft' }, lsGet('calc', {}));
      el.innerHTML = '<div class="page-head"><div><div class="kicker">Vastu calculators</div><h1>Measure, check, convert</h1><p class="lede">Quick tools for plot dimensions, compass readings and land units.</p></div></div>' +
        '<div class="grid g2">' +
        '<div class="card stack span2"><div class="card-head" style="margin:0"><h3>Aayadi calculator</h3><span class="small muted">Is this plot or room size auspicious?' + (p ? ' Checked for ' + esc(p.name.split(' ')[0]) + '.' : '') + '</span></div>' +
        '<div class="row"><label class="field"><span>Length (ft)</span><input class="input mono" id="c-l" type="number" step="0.5" min="1" value="' + st.L + '" style="width:120px"></label><label class="field"><span>Breadth (ft)</span><input class="input mono" id="c-b" type="number" step="0.5" min="1" value="' + st.B + '" style="width:120px"></label></div><div id="c-ay"></div>' +
        '<p class="note">Uses one common Aayadi rule set (area × 8 mod 12 for aaya, × 9 mod 10 for vyaya, × 3 mod 8 for yoni, × 8 mod 27 for nakshatra, × 9 mod 7 for vara, × 8 mod 30 for tithi). Regional texts differ; confirm with your sthapati.</p></div>' +
        '<div class="card stack"><h3>Degree finder</h3><p class="small muted">What zone and entrance pada is a compass degree?</p><input type="range" min="0" max="359.5" step="0.5" id="c-deg" value="' + st.deg + '"><div class="row"><input class="input mono" id="c-degn" type="number" step="0.5" value="' + st.deg + '" style="width:110px"><span class="small muted">degrees</span></div><div id="c-dego"></div></div>' +
        '<div class="card stack"><h3>Which way does my home face?</h3><p class="small muted">Stand at the main door looking out and read the compass.</p><div class="row"><input class="input mono" id="c-door" type="number" step="0.5" min="0" max="359.5" value="' + st.door + '" style="width:110px"><span class="small muted">degrees</span></div><div id="c-dooro"></div></div>' +
        '<div class="card stack"><h3>Land area converter</h3><div class="row"><input class="input mono" id="c-area" type="number" step="any" min="0" value="' + st.area + '" style="width:140px"><select class="input" id="c-unit" style="width:auto">' + UNITS.map(([k, l]) => '<option value="' + k + '"' + (st.unit === k ? ' selected' : '') + '>' + l + '</option>').join('') + '</select></div><div id="c-areao"></div></div>' +
        '<div class="card stack"><h3>Plot proportion</h3><p class="small muted">Uses the Aayadi length and breadth above.</p><div id="c-prop"></div></div>' +
        '</div>';
      const save = () => lsSet('calc', st);
      const drawAy = () => {
        const r = aayadi(st.L, st.B, natal ? natal.moonNak : null);
        $('#c-ay', el).innerHTML = '<div class="row" style="gap:18px;margin:4px 0 8px"><div class="stat"><span class="label">Area</span><span class="value">' + r.area + ' sq ft</span></div><div class="stat"><span class="label">Verdict</span><span class="value"><span class="chip ' + (r.score === 5 ? 'great' : r.score >= 4 ? 'good' : r.score >= 3 ? 'ok' : 'bad') + '" style="font-size:.9rem">' + r.score + ' / 5 rules met</span></span></div></div>' +
          r.checks.map((c) => '<div class="issue"><span class="dot-q ' + (c[1] ? 'good' : 'bad') + '"></span><div><b>' + esc(c[0]) + '</b><div class="tiny muted">' + esc(c[2]) + '</div></div></div>').join('') +
          (r.score < 5 ? (() => { const sg = suggest(st.L, st.B, natal ? natal.moonNak : null); return sg.length ? '<h4 style="margin-top:10px">Nearby sizes that meet all five</h4><div class="row" style="gap:6px;margin-top:6px">' + sg.map((x) => '<button class="btn sm" data-lb="' + x.l + 'x' + x.b + '">' + x.l + ' × ' + x.b + ' <span class="muted">(' + x.area + ')</span></button>').join('') + '</div>' : '<p class="small muted">No size within ±3 ft meets all five rules.</p>'; })() : '');
        const ratio = Math.max(st.L, st.B) / Math.min(st.L, st.B);
        $('#c-prop', el).innerHTML = '<div class="stat"><span class="label">Ratio</span><span class="value">1 : ' + ratio.toFixed(2) + '</span><span class="sub">' + (ratio <= 1.05 ? 'Square: the most balanced plot shape.' : ratio <= 1.5 ? 'Good rectangle; length up to 1.5× breadth is ideal.' : ratio <= 2 ? 'Acceptable, but long plots can feel unbalanced.' : 'Very elongated (over 1:2): traditionally avoided; divide into compact blocks.') + '</span></div>';
      };
      const drawDeg = () => {
        const d = ((st.deg % 360) + 360) % 360, z = D.ZONES[V.zoneIndex(d)], pd = D.PADAS[V.padaIndex(d)], d8 = V.DIR8[V.dir8Index(d)];
        $('#c-dego', el).innerHTML = '<dl class="kv"><dt>16-zone</dt><dd>' + esc(z.name) + ' <span class="small muted">' + esc(z.theme) + '</span></dd><dt>8-direction</dt><dd>' + d8 + '</dd><dt>Element</dt><dd>' + z.el + ' · ' + esc(z.planet) + '</dd><dt>Pada</dt><dd>' + pd.code + ' ' + pd.name + ' <span class="chip ' + (pd.q === 'good' ? 'good' : pd.q === 'neutral' ? 'ok' : 'bad') + '">' + pd.q + '</span><div class="small muted">' + esc(pd.effect) + '</div></dd><dt>Devta</dt><dd>' + pd.name + ': ' + esc(D.DEVTAS[pd.name] || '') + '</dd></dl>';
      };
      const drawDoor = () => {
        const d = ((st.door % 360) + 360) % 360, z = D.ZONES[V.zoneIndex(d)], pd = D.PADAS[V.padaIndex(d)];
        $('#c-dooro', el).innerHTML = '<div class="stat"><span class="label">Your home is</span><span class="value">' + esc(z.name) + '-facing</span><span class="sub">Main door in pada ' + pd.code + ' ' + pd.name + ': ' + esc(pd.effect) + '</span></div>' +
          '<p class="small" style="margin-top:6px">Best door padas on this side: ' + D.PADAS.filter((x) => x.code[0] === pd.code[0] && x.q === 'good').map((x) => x.code + ' ' + x.name).join(', ') + '.</p><p class="note">In the Vastu studio, choose the side of the drawing with the door and enter ' + d.toFixed(1) + '° under Step 4.</p>';
      };
      const drawArea = () => {
        const f = UNITS.find((u) => u.unit === st.unit || u[0] === st.unit)[2], sqft = st.area * f;
        $('#c-areao', el).innerHTML = '<div class="table-wrap"><table class="t"><tbody>' + UNITS.filter((u) => u[0] !== st.unit).map((u) => '<tr><td>' + u[1] + '</td><td class="num" style="text-align:right">' + (sqft / u[2]).toLocaleString('en-IN', { maximumFractionDigits: u[2] > 1000 ? 4 : 2 }) + '</td></tr>').join('') + '</tbody></table></div><p class="note">Bigha and biswa vary by state, so they are left out.</p>';
      };
      const num = (id, k, fn) => $(id, el).addEventListener('input', (e) => { const v = parseFloat(e.target.value); if (isFinite(v)) { st[k] = v; save(); fn(); } });
      num('#c-l', 'L', drawAy); num('#c-b', 'B', drawAy);
      $('#c-deg', el).addEventListener('input', (e) => { st.deg = +e.target.value; $('#c-degn', el).value = st.deg; save(); drawDeg(); });
      $('#c-degn', el).addEventListener('input', (e) => { const v = parseFloat(e.target.value); if (isFinite(v)) { st.deg = v; $('#c-deg', el).value = v; save(); drawDeg(); } });
      num('#c-door', 'door', drawDoor); num('#c-area', 'area', drawArea);
      $('#c-unit', el).addEventListener('change', (e) => { st.unit = e.target.value; save(); drawArea(); });
      el.addEventListener('click', (e) => { const b = e.target.closest('[data-lb]'); if (b) { const [l, w] = b.dataset.lb.split('x').map(Number); st.L = l; st.B = w; $('#c-l', el).value = l; $('#c-b', el).value = w; save(); drawAy(); } });
      drawAy(); drawDeg(); drawDoor(); drawArea();
    },
  };
  D.calc = { aayadi };
})(window);
