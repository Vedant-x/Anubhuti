/* Anubhuti — Kundli studio. */
(function (G) {
  const D = (G.Disha = G.Disha || {});
  const { esc, $, $$, icon, toast, lsGet, lsSet } = D.ui;
  const A = D.astro, app = D.app, S = D.store;

  /* ---------- chart drawings ---------- */
  const NH = [ // North Indian house polygons (400 box), house 1 at top, anticlockwise
    [[200, 0], [300, 100], [200, 200], [100, 100]], [[0, 0], [200, 0], [100, 100]], [[0, 0], [100, 100], [0, 200]],
    [[0, 200], [100, 100], [200, 200], [100, 300]], [[0, 200], [100, 300], [0, 400]], [[0, 400], [100, 300], [200, 400]],
    [[200, 400], [100, 300], [200, 200], [300, 300]], [[200, 400], [300, 300], [400, 400]], [[400, 400], [300, 300], [400, 200]],
    [[400, 200], [300, 300], [200, 200], [300, 100]], [[400, 200], [300, 100], [400, 0]], [[400, 0], [300, 100], [200, 0]],
  ];
  const SOUTH_POS = { 11: [0, 0], 0: [1, 0], 1: [2, 0], 2: [3, 0], 3: [3, 1], 4: [3, 2], 5: [3, 3], 6: [2, 3], 7: [1, 3], 8: [0, 3], 9: [0, 2], 10: [0, 1] };
  function bodiesBySign(ch, which) {
    const by = {}; for (let i = 0; i < 12; i++) by[i] = [];
    for (const p of D.PLANET_ORDER) {
      const q = ch.planets[p], s = which === 'd9' ? q.navamsa : which === 'moon' ? q.sign : q.sign;
      by[s].push({ t: D.PLANETS[p].abbr + (q.retro && p !== 'Rahu' && p !== 'Ketu' ? '℞' : ''), p, deg: which === 'd1' ? Math.floor(q.deg) : null, cls: q.dignity === 'Exalted' ? 'ex' : q.dignity === 'Debilitated' ? 'de' : '' });
    }
    return by;
  }
  function northSvg(ch, which, title) {
    const lag = which === 'd9' ? ch.ascNavamsa : which === 'moon' ? ch.moonSign : ch.lagna;
    const by = bodiesBySign(ch, which);
    let s = '<svg class="chart-svg" viewBox="-6 -6 412 412" role="img" aria-label="' + esc(title) + '"><rect x="0" y="0" width="400" height="400" fill="var(--paper)" stroke="var(--ink-2)" stroke-width="1.5"/>' +
      '<path d="M0 0L400 400M400 0L0 400M200 0L400 200L200 400L0 200Z" fill="none" stroke="var(--ink-2)" stroke-width="1.2"/>';
    NH.forEach((poly, i) => {
      const sign = (lag + i) % 12;
      const cx = poly.reduce((a, p) => a + p[0], 0) / poly.length, cy = poly.reduce((a, p) => a + p[1], 0) / poly.length;
      const inner = poly.slice().sort((a, b) => Math.hypot(a[0] - 200, a[1] - 200) - Math.hypot(b[0] - 200, b[1] - 200))[0];
      const nx = cx + (inner[0] - cx) * 0.62, ny = cy + (inner[1] - cy) * 0.62;
      if (i === 0) s += '<path d="' + 'M' + poly.map((p) => p.join(' ')).join('L') + 'Z" fill="var(--saffron-soft)" opacity=".6"/>';
      s += '<text x="' + nx + '" y="' + ny + '" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="var(--muted)" font-weight="600">' + (sign + 1) + '</text>';
      const items = by[sign], fs = items.length > 3 ? 11.5 : 13.5, lh = fs + 2;
      const y0 = (i === 0 || i === 6 ? cy - 6 : cy) - ((items.length - 1) * lh) / 2;
      items.forEach((it, k) => { s += '<text x="' + cx + '" y="' + (y0 + k * lh) + '" text-anchor="middle" dominant-baseline="middle" font-size="' + fs + '" font-weight="650" fill="' + (it.cls === 'ex' ? 'var(--good)' : it.cls === 'de' ? 'var(--bad)' : 'var(--ink)') + '">' + it.t + (it.deg != null ? '<tspan font-size="9" fill="var(--muted)" font-weight="500"> ' + it.deg + '°</tspan>' : '') + '</text>'; });
      if (i === 0) s += '<text x="' + cx + '" y="' + (cy - 38) + '" text-anchor="middle" font-size="10" fill="var(--saffron-ink)" font-weight="700" letter-spacing=".08em">LAGNA</text>';
    });
    return s + '</svg>';
  }
  function southSvg(ch, which, title) {
    const lag = which === 'd9' ? ch.ascNavamsa : which === 'moon' ? ch.moonSign : ch.lagna;
    const by = bodiesBySign(ch, which);
    let s = '<svg class="chart-svg" viewBox="-6 -6 412 412" role="img" aria-label="' + esc(title) + '"><rect x="0" y="0" width="400" height="400" fill="var(--paper)" stroke="var(--ink-2)" stroke-width="1.5"/>';
    for (let sign = 0; sign < 12; sign++) {
      const [c, r] = SOUTH_POS[sign], x = c * 100, y = r * 100;
      s += '<rect x="' + x + '" y="' + y + '" width="100" height="100" fill="' + (sign === lag ? 'var(--saffron-soft)' : 'none') + '" stroke="var(--ink-2)" stroke-width="1.1"/>';
      s += '<text x="' + (x + 6) + '" y="' + (y + 14) + '" font-size="10.5" fill="var(--muted)" font-weight="600">' + D.SIGNS[sign].sa.slice(0, 4) + '</text>';
      if (sign === lag) s += '<line x1="' + (x + 72) + '" y1="' + y + '" x2="' + (x + 100) + '" y2="' + (y + 28) + '" stroke="var(--saffron-ink)" stroke-width="1.5"/><text x="' + (x + 94) + '" y="' + (y + 96) + '" text-anchor="end" font-size="9.5" fill="var(--saffron-ink)" font-weight="700">ASC</text>';
      const items = by[sign], fs = items.length > 3 ? 11.5 : 13;
      items.forEach((it, k) => { s += '<text x="' + (x + 50) + '" y="' + (y + 34 + k * (fs + 3) - Math.max(0, items.length - 3) * 4) + '" text-anchor="middle" font-size="' + fs + '" font-weight="650" fill="' + (it.cls === 'ex' ? 'var(--good)' : it.cls === 'de' ? 'var(--bad)' : 'var(--ink)') + '">' + it.t + (it.deg != null ? '<tspan font-size="9" fill="var(--muted)" font-weight="500"> ' + it.deg + '°</tspan>' : '') + '</text>'; });
    }
    s += '<text x="200" y="192" text-anchor="middle" font-family="var(--font-display)" font-size="20" fill="var(--ink)">' + esc(title) + '</text><text x="200" y="214" text-anchor="middle" font-size="11" fill="var(--muted)">Anubhuti</text>';
    return s + '</svg>';
  }
  /* KP chart: North style = houses from Placidus cusps (cusp sign + degree per house);
     South style = signs fixed, with planets and cusp markers placed by longitude. */
  function kpChartSvg(kv) {
    const C = kv.cusps, K = kv.kp, P = kv.planets;
    const deg = (x) => Math.floor(x % 30) + '°' + String(Math.floor(((x % 30) % 1) * 60)).padStart(2, '0');
    if ((S.state.settings.chartStyle || 'north') === 'south') {
      let s = '<svg class="chart-svg" viewBox="-6 -6 412 412" role="img" aria-label="KP chart"><rect x="0" y="0" width="400" height="400" fill="var(--paper)" stroke="var(--ink-2)" stroke-width="1.5"/>';
      for (let sign = 0; sign < 12; sign++) {
        const [c, r] = SOUTH_POS[sign], x = c * 100, y = r * 100;
        s += '<rect x="' + x + '" y="' + y + '" width="100" height="100" fill="none" stroke="var(--ink-2)" stroke-width="1.1"/><text x="' + (x + 6) + '" y="' + (y + 13) + '" font-size="10" fill="var(--muted)" font-weight="600">' + D.SIGNS[sign].sa.slice(0, 4) + '</text>';
        const items = [];
        for (let h = 1; h <= 12; h++) if (Math.floor(C[h] / 30) === sign) items.push({ t: 'C' + h + ' ' + deg(C[h]), cusp: true, l: C[h] });
        D.PLANET_ORDER.forEach((p) => { if (P[p].sign === sign) items.push({ t: D.PLANETS[p].abbr + ' ' + deg(P[p].lon), l: P[p].lon }); });
        items.sort((a2, b2) => a2.l - b2.l).forEach((it, k) => { s += '<text x="' + (x + 50) + '" y="' + (y + 30 + k * 12.5) + '" text-anchor="middle" font-size="' + (items.length > 5 ? 9.5 : 11) + '" font-weight="' + (it.cusp ? 700 : 650) + '" fill="' + (it.cusp ? 'var(--saffron-ink)' : 'var(--ink)') + '">' + it.t + '</text>'; });
      }
      return s + '<text x="200" y="196" text-anchor="middle" font-family="var(--font-display)" font-size="20" fill="var(--ink)">KP</text><text x="200" y="216" text-anchor="middle" font-size="10" fill="var(--muted)">C = cusp</text></svg>';
    }
    let s = '<svg class="chart-svg" viewBox="-6 -6 412 412" role="img" aria-label="KP chart"><rect x="0" y="0" width="400" height="400" fill="var(--paper)" stroke="var(--ink-2)" stroke-width="1.5"/><path d="M0 0L400 400M400 0L0 400M200 0L400 200L200 400L0 200Z" fill="none" stroke="var(--ink-2)" stroke-width="1.2"/>';
    NH.forEach((poly, i) => {
      const h = i + 1, cx = poly.reduce((a2, q) => a2 + q[0], 0) / poly.length, cy = poly.reduce((a2, q) => a2 + q[1], 0) / poly.length;
      const inner = poly.slice().sort((a2, b2) => Math.hypot(a2[0] - 200, a2[1] - 200) - Math.hypot(b2[0] - 200, b2[1] - 200))[0];
      const nx = cx + (inner[0] - cx) * 0.62, ny = cy + (inner[1] - cy) * 0.62;
      if (i === 0) s += '<path d="M' + poly.map((q) => q.join(' ')).join('L') + 'Z" fill="var(--saffron-soft)" opacity=".6"/>';
      s += '<text x="' + nx + '" y="' + (ny - 5) + '" text-anchor="middle" font-size="11.5" fill="var(--muted)" font-weight="700">' + (Math.floor(C[h] / 30) + 1) + '</text><text x="' + nx + '" y="' + (ny + 7) + '" text-anchor="middle" font-size="8.5" fill="var(--saffron-ink)">' + deg(C[h]) + '</text>';
      const items = D.PLANET_ORDER.filter((p) => K.pHouse[p] === h), fs = items.length > 3 ? 10.5 : 12, lh = fs + 2;
      const y0 = (i === 0 || i === 6 ? cy - 4 : cy) - ((items.length - 1) * lh) / 2 - (i === 0 ? 0 : 6);
      items.forEach((p, k) => { s += '<text x="' + cx + '" y="' + (y0 + k * lh) + '" text-anchor="middle" font-size="' + fs + '" font-weight="650" fill="var(--ink)">' + D.PLANETS[p].abbr + (P[p].retro && p !== 'Rahu' && p !== 'Ketu' ? '℞' : '') + '<tspan font-size="8.5" fill="var(--muted)" font-weight="500"> ' + deg(P[p].lon) + '</tspan></text>'; });
    });
    return s + '</svg>';
  }
  const chartSvg = (ch, which, title) => ((S.state.settings.chartStyle || 'north') === 'south' ? southSvg : northSvg)(ch, which, title);

  /* ---------- Ashtakoota (gun milan) with standard tables ---------- */
  const VARNA_RANK = { Cancer: 4, Scorpio: 4, Pisces: 4, Aries: 3, Leo: 3, Sagittarius: 3, Taurus: 2, Virgo: 2, Capricorn: 2, Gemini: 1, Libra: 1, Aquarius: 1 };
  const VARNA_N = { 4: 'Brahmin', 3: 'Kshatriya', 2: 'Vaishya', 1: 'Shudra' };
  const YONI_ANIMALS = ['Horse', 'Elephant', 'Sheep', 'Serpent', 'Dog', 'Cat', 'Rat', 'Cow', 'Buffalo', 'Tiger', 'Deer', 'Monkey', 'Mongoose', 'Lion'];
  const YONI_SA = ['Ashwa', 'Gaja', 'Mesha', 'Sarpa', 'Shwan', 'Marjar', 'Mushak', 'Gau', 'Mahish', 'Vyaghra', 'Mriga', 'Vanar', 'Nakul', 'Simha'];
  const YONI_OF = [0, 1, 2, 3, 3, 4, 5, 2, 5, 6, 6, 7, 8, 9, 8, 9, 10, 10, 4, 11, 12, 11, 13, 0, 13, 7, 1]; // per nakshatra
  const YONI_M = [
    [4, 2, 2, 3, 2, 2, 2, 1, 0, 1, 3, 3, 2, 1], [2, 4, 3, 3, 2, 2, 2, 2, 3, 1, 2, 3, 2, 0], [2, 3, 4, 2, 1, 2, 1, 3, 3, 1, 2, 0, 3, 1],
    [3, 3, 2, 4, 2, 1, 1, 1, 1, 2, 2, 2, 0, 2], [2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 0, 2, 1, 1], [2, 2, 2, 1, 2, 4, 0, 2, 2, 1, 3, 3, 2, 1],
    [2, 2, 1, 1, 1, 0, 4, 2, 2, 2, 2, 2, 1, 2], [1, 2, 3, 1, 2, 2, 2, 4, 3, 0, 3, 2, 2, 1], [0, 3, 3, 1, 2, 2, 2, 3, 4, 1, 2, 2, 2, 1],
    [1, 1, 1, 2, 1, 1, 2, 0, 1, 4, 1, 1, 2, 1], [3, 2, 2, 2, 0, 3, 2, 3, 2, 1, 4, 2, 2, 1], [3, 3, 0, 2, 2, 3, 2, 2, 2, 1, 2, 4, 3, 2],
    [2, 2, 3, 0, 1, 2, 1, 2, 2, 2, 2, 3, 4, 2], [1, 0, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 2, 4],
  ];
  const VASHYA_G = ['Chatushpada', 'Manav', 'Jalachara', 'Vanachara', 'Keeta'];
  const VASHYA_M = [[2, 1, 1, 0.5, 1], [1, 2, 0.5, 0, 1], [1, 0.5, 2, 1, 1], [0.5, 0, 1, 2, 0], [1, 1, 1, 0, 2]]; // groom row, bride column
  const GANA = 'DMRMDMDDRRMMDRDRDRRMMDRRMMD'.split('');
  const GANA_N = { D: 'Deva', M: 'Manushya', R: 'Rakshasa' };
  const GANA_M = { D: { D: 6, M: 6, R: 1 }, M: { D: 5, M: 6, R: 0 }, R: { D: 1, M: 0, R: 6 } };
  const NADI = [0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2];
  const NADI_N = ['Adi (Vata)', 'Madhya (Pitta)', 'Antya (Kapha)'];
  const TARA_N = ['Janma', 'Sampat', 'Vipat', 'Kshema', 'Pratyari', 'Sadhaka', 'Vadha', 'Mitra', 'Ati-mitra'];
  function vashyaGroup(sign, deg) {
    if ([0, 1].includes(sign) || (sign === 8 && deg >= 15) || (sign === 9 && deg < 15)) return 0;
    if ([2, 5, 6, 10].includes(sign) || (sign === 8 && deg < 15)) return 1;
    if ([3, 11].includes(sign) || (sign === 9 && deg >= 15)) return 2;
    if (sign === 4) return 3;
    return 4;
  }
  function rel(a, b) { const P = D.PLANETS[a]; if (a === b) return 'f'; if (P.friends.includes(b)) return 'f'; if (P.enemies.includes(b)) return 'e'; return 'n'; }
  const RELW = { f: 'friend', n: 'neutral', e: 'enemy' };
  function milan(boy, girl, names) {
    const B = (names && names[0]) || 'The boy', Gl = (names && names[1]) || 'the girl';
    const bm = boy.planets.Moon, gm = girl.planets.Moon, rows = [], det = [];
    // 1 Varna
    const bv = VARNA_RANK[D.SIGNS[bm.sign].en], gv = VARNA_RANK[D.SIGNS[gm.sign].en], vs = bv >= gv ? 1 : 0;
    rows.push(['Varna', 1, vs, 'Work and ego']);
    det.push(B + ' is of ' + VARNA_N[bv] + ' varna and ' + Gl + ' of ' + VARNA_N[gv] + ' varna. ' + (vs ? 'The groom’s varna is equal to or higher than the bride’s, which traditionally brings natural respect for each other’s roles. They support each other’s work and ambitions, and household decisions are taken without ego clashes.' : 'The bride’s varna is higher than the groom’s, which traditionally hints at ego or different outlooks about work and status. Respecting each other’s strengths and setting shared goals keeps this in balance.'));
    // 2 Vashya
    const vb = vashyaGroup(bm.sign, bm.deg), vg = vashyaGroup(gm.sign, gm.deg), vsh = VASHYA_M[vb][vg];
    rows.push(['Vashya', 2, vsh, 'Dominance and attraction']);
    det.push(B + ' comes under ' + VASHYA_G[vb] + ' vashya and ' + Gl + ' under ' + VASHYA_G[vg] + ' vashya. ' + (vsh === 2 ? 'The same vashya gives easy attraction and give-and-take; neither tries to control the other, and they work as one unit.' : vsh >= 1 ? 'These groups get along well: there is mutual attraction and support, with only occasional tussles over who decides. Talking things through keeps the balance.' : vsh > 0 ? 'These groups are only partly compatible: one may feel the other is too dominant at times. Giving each other space and respect helps a great deal.' : 'These groups traditionally do not influence each other well: one partner may feel controlled or unheard. Patience and clear communication are important.'));
    // 3 Tara
    const tb = ((bm.nak - gm.nak + 27) % 27) % 9, tg = ((gm.nak - bm.nak + 27) % 27) % 9, bad = [2, 4, 6];
    const ts = (bad.includes(tb) ? 0 : 1.5) + (bad.includes(tg) ? 0 : 1.5);
    rows.push(['Tara', 3, ts, 'Destiny and well-being']);
    det.push('Counting the birth stars both ways, ' + B + ' falls in ' + TARA_N[tb] + ' tara and ' + Gl + ' in ' + TARA_N[tg] + ' tara. ' + (ts === 3 ? 'Both are favourable: they bring good fortune to each other, handle hard times together with confidence, and enjoy happiness and harmony at home.' : ts > 0 ? 'One count is favourable and the other is not: luck and health are mostly supportive, but one partner may need extra care during difficult periods. Mutual support makes up for it.' : 'Both counts fall in unfavourable taras (Vipat, Pratyari or Vadha): traditionally this asks for care with health and fortune. Remedies and a strong overall match reduce its effect.'));
    // 4 Yoni
    const yb = YONI_OF[bm.nak], yg = YONI_OF[gm.nak], ys = YONI_M[yb][yg];
    rows.push(['Yoni', 4, ys, 'Mentality and intimacy']);
    det.push('The boy’s yoni is ' + YONI_SA[yb] + ' (' + YONI_ANIMALS[yb].toLowerCase() + ') and the girl’s is ' + YONI_SA[yg] + ' (' + YONI_ANIMALS[yg].toLowerCase() + '). ' + (ys === 4 ? 'The same yoni gives deep physical and temperamental harmony; they understand each other’s needs naturally.' : ys === 3 ? 'These are friendly yonis: good physical compatibility and an easy temperament together.' : ys === 2 ? 'These yonis are neutral to each other: compatibility is average and grows with care and affection.' : ys === 1 ? 'These yonis are not natural friends: instincts and temperaments differ, and ego or jealousy can creep in. Setting egos aside and adjusting to each other keeps the relationship sustaining.' : 'These yonis are natural enemies (Yoni dosha): there can be strong differences in temperament and intimacy. Understanding, patience and remedies are recommended.'));
    // 5 Graha Maitri
    const lb = D.SIGNS[bm.sign].lord, lg = D.SIGNS[gm.sign].lord, r1 = rel(lb, lg), r2 = rel(lg, lb), k = [r1, r2].sort().join('');
    const gms = { ff: 5, fn: 4, nn: 3, ef: 1, en: 0.5, ee: 0 }[k];
    rows.push(['Graha Maitri', 5, gms, 'Mental compatibility']);
    det.push('The boy’s Moon sign lord is ' + lb + ' and the girl’s is ' + lg + '. ' + lb + ' treats ' + lg + ' as ' + (r1 === 'e' ? 'an ' : 'a ') + RELW[r1] + ', and ' + lg + ' treats ' + lb + ' as ' + (r2 === 'e' ? 'an ' : 'a ') + RELW[r2] + '. ' + (gms >= 4 ? 'Their minds work on the same wavelength: they share views, enjoy each other’s company and resolve differences easily.' : gms === 3 ? 'A neutral relationship: friendly enough, though they will need to make an effort to understand each other’s viewpoint.' : 'This is not a favourable planetary friendship: there may be attraction, but differences in outlook and routine can cause friction. It takes conscious effort from both; if the other kootas match well, the alliance can still be considered.'));
    // 6 Gana
    const gb = GANA[bm.nak], gg = GANA[gm.nak], gs = GANA_M[gb][gg];
    rows.push(['Gana', 6, gs, 'Temperament (guna level)']);
    det.push(B + ' is of ' + GANA_N[gb] + ' gana and ' + Gl + ' of ' + GANA_N[gg] + ' gana. ' + (gs === 6 ? (gb === gg ? 'Both share the same gana: an excellent match of nature, values and philosophy. They understand each other’s qualities and are always there for each other.' : 'Deva and Manushya natures blend well: gentle and practical temperaments complement each other.') : gs === 5 ? 'Manushya and Deva temperaments are compatible: a little adjustment brings a durable relationship.' : gs === 1 ? 'Deva and Rakshasa temperaments differ sharply: one is gentle, the other forceful. This is Gana dosha; patience and respect are needed.' : 'Manushya and Rakshasa temperaments clash (Gana dosha): arguments can arise over small things. Calm communication and remedies help.'));
    // 7 Bhakoot
    const d = ((gm.sign - bm.sign + 12) % 12) + 1, d2 = ((bm.sign - gm.sign + 12) % 12) + 1;
    let bk = [2, 12, 5, 9, 6, 8].includes(d) ? 0 : 7;
    const sameLord = lb === lg, friendly = r1 === 'f' && r2 === 'f';
    rows.push(['Bhakoot', 7, bk, 'Love and family welfare']);
    det.push('The boy’s Moon sign is ' + D.SIGNS[bm.sign].sa + ' (' + D.SIGNS[bm.sign].en + ') and the girl’s is ' + D.SIGNS[gm.sign].sa + ' (' + D.SIGNS[gm.sign].en + '), ' + d + '/' + d2 + ' apart. ' + (bk ? 'This is a favourable placement: love, mutual support, family welfare and prosperity grow together.' : 'This is a Bhakoot dosha placement (' + ({ 2: '2/12: extra expenses', 12: '2/12: extra expenses', 5: '5/9: differences about children and beliefs', 9: '5/9: differences about children and beliefs', 6: '6/8: health and disputes', 8: '6/8: health and disputes' }[d]) + '). ' + (sameLord || friendly ? 'However, the dosha is cancelled because both Moon signs have ' + (sameLord ? 'the same lord' : 'mutually friendly lords') + '.' : 'It is cancelled when both Moon signs share the same lord or friendly lords, which is not the case here.')));
    // 8 Nadi
    const nb = NADI[bm.nak], ng = NADI[gm.nak], ns = nb === ng ? 0 : 8;
    const nadiCancel = nb === ng && ((bm.sign === gm.sign && bm.nak !== gm.nak) || (bm.nak === gm.nak && (bm.sign !== gm.sign || bm.pada !== gm.pada)));
    rows.push(['Nadi', 8, ns, 'Health and progeny']);
    det.push('The boy’s nadi is ' + NADI_N[nb] + ' and the girl’s is ' + NADI_N[ng] + '. ' + (ns ? 'Different nadis are considered ideal: good health, harmony and healthy children. Both will encourage each other in their careers and social life.' : 'Both share the same nadi (Nadi dosha), traditionally the most important dosha for health and children. ' + (nadiCancel ? 'It is cancelled here because the Moon signs or nakshatra padas differ.' : 'Common remedies are Nadi dosha nivaran puja and the Mahamrityunjaya mantra; an astrologer should review it.')));
    const total = rows.reduce((a2, r) => a2 + r[2], 0);
    return { rows, details: det, total, cancel: { bhakoot: !bk && (sameLord || friendly), nadi: nadiCancel },
      verdict: total >= 28 ? ['good', 'Excellent match'] : total >= 18 ? ['ok', 'Acceptable match'] : ['bad', 'Below the usual 18 points'] };
  }
  /* Tabbed gun milan view: Details + one tab per koota with its own explanation */
  function renderMilan(box, boyP, girlP) {
    const m = milan(app.chart(boyP), app.chart(girlP), [boyP.name.split(' ')[0], girlP.name.split(' ')[0]]);
    const tabs = ['Details'].concat(m.rows.map((r) => r[0]));
    let cur = 0;
    const draw = () => {
      let body;
      if (cur === 0) body = '<h3 style="text-align:center;margin:6px 0 12px">Guna Milan result in detail</h3><div class="table-wrap"><table class="t milan-t"><thead><tr><th>Guna</th><th>Maximum</th><th>Obtained</th><th>Area of life</th></tr></thead><tbody>' + m.rows.map((r, i) => '<tr data-k="' + (i + 1) + '" style="cursor:pointer"><td><b>' + r[0] + '</b></td><td class="num">' + r[1] + '</td><td class="num"><span class="chip ' + (r[2] >= r[1] * 0.75 ? 'good' : r[2] === 0 ? 'bad' : 'ok') + '">' + r[2].toFixed(1) + '</span></td><td>' + r[3] + '</td></tr>').join('') + '</tbody><tfoot><tr><td colspan="2"><b>Total</b></td><td class="num" colspan="2"><span class="milan-total">' + m.total.toFixed(1) + '</span><span class="muted">/36</span> <span class="chip ' + m.verdict[0] + '">' + m.verdict[1] + '</span></td></tr></tfoot></table></div><p class="note" style="margin-top:8px">Tap a row or a tab for its full explanation. Groom: ' + esc(boyP.name) + ' · Bride: ' + esc(girlP.name) + '.</p>';
      else { const r = m.rows[cur - 1]; body = '<h3 style="text-align:center;margin:6px 0 12px">' + r[0] + ' (' + r[3] + ') interpretation</h3><div class="row" style="justify-content:center;margin-bottom:10px"><span class="chip ' + (r[2] >= r[1] * 0.75 ? 'good' : r[2] === 0 ? 'bad' : 'ok') + '" style="font-size:.9rem">' + r[2].toFixed(1) + ' of ' + r[1] + ' points</span></div><p class="milan-text">' + esc(m.details[cur - 1]) + '</p><div class="row" style="justify-content:center;margin-top:12px"><a class="btn accent sm" href="#ask" data-askk="' + (cur - 1) + '">' + icon('ask') + 'Ask Anubhuti about ' + r[0] + '</a></div>'; }
      box.innerHTML = '<div class="tabs milan-tabs" role="tablist">' + tabs.map((t, i) => '<button role="tab" data-mt="' + i + '" aria-selected="' + (i === cur) + '">' + t.toUpperCase() + '</button>').join('') + '</div><div class="milan-body">' + body + '</div>';
      box.querySelectorAll('[data-mt]').forEach((b) => b.addEventListener('click', () => { cur = +b.dataset.mt; draw(); }));
      box.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => { cur = +b.dataset.k; draw(); }));
      const ak = box.querySelector('[data-askk]'); ak && ak.addEventListener('click', () => { const i = +ak.dataset.askk; lsSet('askDraft', 'In the match between ' + boyP.name + ' and ' + girlP.name + ', ' + m.rows[i][0] + ' scored ' + m.rows[i][2] + ' of ' + m.rows[i][1] + '. ' + m.details[i] + ' Explain what this means for them and suggest practical remedies.'); });
      const at = box.querySelector('[aria-selected="true"]'); at && at.scrollIntoView({ block: 'nearest', inline: 'center' });
    };
    draw();
    return m;
  }

  function matchExtras(boyP, girlP) {
    const cb = app.chart(boyP), cg = app.chart(girlP), v = D.j2.verdict(cb, cg), mm = v.mm, po = v.po;
    const mrow = (who, x) => '<tr><td><b>' + esc(who) + '</b></td><td>' + x.refs.map((r) => r.n + ' ' + r.h).join(' · ') + '</td><td><span class="chip ' + ({ none: 'good', cancelled: 'good', mild: 'ok', strong: 'bad' }[x.level]) + '">' + ({ none: 'not Manglik', cancelled: 'cancelled', mild: 'mild', strong: 'strong' }[x.level]) + '</span></td><td class="small">' + esc(x.cancel.join('; ') || '—') + '</td></tr>';
    return '<div class="card stack verdict ' + v.level + '" style="margin-top:14px"><div class="row-between"><h3>Overall verdict</h3><span class="chip ' + v.level + '" style="font-size:.9rem">' + v.text + '</span></div><div class="grid g2"><div><h4 style="margin-bottom:4px">Strengths</h4>' + v.strengths.map((x) => '<div class="issue"><span class="dot-q good"></span><span>' + esc(x) + '</span></div>').join('') + '</div><div><h4 style="margin-bottom:4px">Points to review</h4>' + (v.issues.length ? v.issues.map((x) => '<div class="issue"><span class="dot-q bad"></span><span>' + esc(x) + '</span></div>').join('') : '<p class="small">None.</p>') + '</div></div></div>' +
      '<div class="card stack" style="margin-top:14px"><h3>Mangal dosha matching</h3><div class="table-wrap"><table class="t"><thead><tr><th>Person</th><th>Mars house from Lagna · Moon · Venus</th><th>Status</th><th>Cancellations</th></tr></thead><tbody>' + mrow(boyP.name, mm.boy) + mrow(girlP.name, mm.girl) + '</tbody></table></div><div class="callout small"><span class="chip ' + mm.level + '">' + ({ good: 'balanced', ok: 'balanced by the other chart', bad: 'not balanced' }[mm.level]) + '</span> ' + esc(mm.verdict) + '</div></div>' +
      '<div class="card stack" style="margin-top:14px"><div class="row-between"><h3>Dashakoot / 10 porutham (South Indian)</h3><span class="chip ' + (po.count >= 7 ? 'good' : po.count >= 5 ? 'ok' : 'bad') + '">' + po.count + ' / 10</span></div><div class="table-wrap"><table class="t"><thead><tr><th>Porutham</th><th>Result</th><th>What it checks</th></tr></thead><tbody>' + po.rows.map((r) => '<tr><td><b>' + r[0] + '</b></td><td>' + (r[1] ? '<span class="chip good">agrees</span>' : '<span class="chip bad">does not</span>') + '</td><td class="small">' + esc(r[2]) + '</td></tr>').join('') + '</tbody></table></div><p class="note">Rajju and Vedha are treated as essential in South India. Counts start from the bride’s nakshatra.</p></div>';
  }

  /* ---------- guidance ---------- */
  function guidance(ch) {
    const lagLord = D.SIGNS[ch.lagna].lord, P = ch.planets;
    const fifth = D.SIGNS[(ch.lagna + 4) % 12].lord, ninth = D.SIGNS[(ch.lagna + 8) % 12].lord;
    const weak = D.PLANET_ORDER.filter((p) => P[p].dignity === 'Debilitated' || P[p].combust);
    const strong = D.PLANET_ORDER.filter((p) => P[p].dignity === 'Exalted' || P[p].dignity === 'Own sign');
    const cd = A.currentDasha(ch.dasha, A.nowJd());
    return { lagLord, fifth, ninth, weak, strong, cd };
  }

  /* ---------- report ---------- */
  function reportHtml(p, ch) {
    const css = ':root{--paper:#fff;--paper-2:#f5f7fa;--ink:#141a2e;--ink-2:#39425a;--muted:#667089;--line:#d8dee8;--saffron-soft:#fbecd8;--saffron-ink:#9a5200;--good:#1b8456;--bad:#c0392f;--font-display:Georgia,serif}body{font-family:system-ui,sans-serif;color:#141a2e;max-width:900px;margin:32px auto;padding:0 20px;line-height:1.5}h1,h2{font-family:Georgia,serif;font-weight:400}table{border-collapse:collapse;width:100%;font-size:14px}td,th{border-bottom:1px solid #d8dee8;padding:6px 8px;text-align:left}.charts{display:grid;grid-template-columns:1fr 1fr;gap:20px}.chart-svg{width:100%;height:auto}.muted{color:#667089}@media print{body{margin:0}}';
    const g = guidance(ch);
    const rows = D.PLANET_ORDER.map((n) => { const q = ch.planets[n]; return '<tr><td>' + n + '</td><td>' + D.SIGNS[q.sign].en + '</td><td>' + A.fmtDeg(q.deg) + '</td><td>' + q.nakName + ' ' + q.pada + '</td><td>' + q.house + '</td><td>' + q.dignity + (q.retro ? ', retrograde' : '') + (q.combust ? ', combust' : '') + '</td><td>' + q.kp.star + ' / ' + q.kp.sub + '</td></tr>'; }).join('');
    const das = ch.dasha.periods.slice(0, 9).map((m) => '<tr><td>' + m.lord + '</td><td>' + A.fmtDate(m.start, p.place.tz) + '</td><td>' + A.fmtDate(m.end, p.place.tz) + '</td></tr>').join('');
    const yg = ch.yogas.filter((y) => y.present).map((y) => '<li><b>' + esc(y.name) + '</b>: ' + esc(y.why) + '</li>').join('');
    return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kundli · ' + esc(p.name) + '</title><style>' + css + '</style></head><body>' +
      '<h1>Kundli of ' + esc(p.name) + '</h1><p class="muted">' + esc(app.fmtDob(p)) + ' · ' + p.place.lat.toFixed(2) + ', ' + p.place.lon.toFixed(2) + ' · Lahiri ayanamsa ' + A.fmtDeg(ch.ayanamsa) + '</p>' +
      '<p><b>Lagna:</b> ' + D.SIGNS[ch.lagna].en + ' ' + A.fmtDeg(ch.asc % 30) + ' · <b>Moon sign:</b> ' + D.SIGNS[ch.moonSign].en + ' · <b>Nakshatra:</b> ' + D.NAKSHATRAS[ch.moonNak].name + ' pada ' + ch.planets.Moon.pada + '</p>' +
      '<div class="charts"><div><h2>Rashi (D1)</h2>' + northSvg(ch, 'd1', 'Rashi') + '</div><div><h2>Navamsa (D9)</h2>' + northSvg(ch, 'd9', 'Navamsa') + '</div></div>' +
      '<h2>Planets</h2><table><tr><th>Graha</th><th>Sign</th><th>Degree</th><th>Nakshatra</th><th>House</th><th>Condition</th><th>KP star/sub</th></tr>' + rows + '</table>' +
      '<h2>Vimshottari dasha</h2><table><tr><th>Mahadasha</th><th>From</th><th>To</th></tr>' + das + '</table>' +
      '<h2>Yogas and doshas</h2><ul>' + (yg || '<li>None of the checked yogas are present.</li>') + '</ul>' +
      '<h2>Notes</h2><p>Lagna lord: ' + g.lagLord + '. Strong planets: ' + (g.strong.join(', ') || 'none') + '. Planets needing support: ' + (g.weak.join(', ') || 'none') + '.</p>' +
      '<p class="muted">Prepared with Anubhuti' + (S.state.settings.consultant ? ' by ' + esc(S.state.settings.consultant) : '') + ' on ' + new Date().toLocaleDateString('en-IN') + '. Calculations: JPL orbital elements, Lahiri ayanamsa, mean nodes, whole-sign houses.</p></body></html>';
  }

  function dms(v, pos, neg) { const a = Math.abs(v), d = Math.floor(a), m = Math.floor((a - d) * 60), sc = Math.round(((a - d) * 60 - m) * 60); return d + '°' + String(m).padStart(2, '0') + '′' + String(sc === 60 ? 59 : sc).padStart(2, '0') + '″' + (v >= 0 ? pos : neg); }
  function birthDetails(p, ch) {
    const tz = p.place.tz, st = A.sunTimes(p.dob, p.place), lst = A.lstAt(ch.jd, p.place.lon);
    const ut = A.jdToLocal(ch.jd, 0), wd = A.jdToLocal(ch.jd, tz).wd, vedicWd = st.rise != null && ch.jd < st.rise ? (wd + 6) % 7 : wd;
    const pad = (n) => String(n).padStart(2, '0');
    return '<div class="card" style="margin-top:16px"><div class="card-head"><h3>Birth details as calculated</h3><span class="small muted">Check these against the birth certificate</span></div><dl class="kv" style="grid-template-columns:auto 1fr auto 1fr;gap:6px 18px">' +
      '<dt>Date & time</dt><dd>' + esc(p.dob.split('-').reverse().join('-')) + ' ' + esc(p.tobUnknown ? 'unknown (12:00 used)' : p.tob) + '</dd><dt>Place</dt><dd>' + esc(p.place.name) + '</dd>' +
      '<dt>Latitude</dt><dd class="num">' + dms(p.place.lat, 'N', 'S') + ' (' + (+p.place.lat).toFixed(4) + ')</dd><dt>Longitude</dt><dd class="num">' + dms(p.place.lon, 'E', 'W') + ' (' + (+p.place.lon).toFixed(4) + ')</dd>' +
      '<dt>Time zone</dt><dd class="num">UTC' + (tz >= 0 ? '+' : '') + tz + '</dd><dt>Universal time</dt><dd class="num">' + pad(ut.h) + ':' + pad(ut.mi) + ' UT · ΔT ' + A.deltaT(ch.jd).toFixed(1) + ' s</dd>' +
      '<dt>Local sidereal time</dt><dd class="num">' + pad(Math.floor(lst / 15)) + 'h ' + pad(Math.floor((lst / 15 % 1) * 60)) + 'm</dd><dt>Sunrise that day</dt><dd class="num">' + A.fmtTime(st.rise, tz) + '</dd>' +
      '<dt>Vedic weekday</dt><dd>' + D.VARAS[vedicWd][0] + (vedicWd !== wd ? ' <span class="small muted">(born before sunrise, so the previous day’s vara)</span>' : '') + '</dd><dt>Settings</dt><dd>Lahiri ' + A.fmtDeg(ch.ayanamsa) + ' · ' + (A.nodeMode() === 'true' ? 'true' : 'mean') + ' node · whole-sign houses</dd></dl>' +
      '<p class="note" style="margin-top:10px">Accuracy: Moon within a few arc-seconds, Sun and inner planets within about a minute of arc, Jupiter and Saturn within a few minutes (1800–2050). A 4-minute error in birth time shifts the lagna by about 1°, so an exact time and birthplace matter most.</p></div>';
  }

  /* ---------- view ---------- */
  app.views.kundli = {
    render(el) {
      let tab = lsGet('ktab', 'overview');
      const draw = () => {
        const p = app.activeProfile();
        el.innerHTML = '<div class="page-head"><div><div class="kicker">Kundli</div><h1>Birth chart</h1></div>' + (p ? '<div class="row"><button class="btn" id="k-dl">' + icon('download') + 'Download report</button><a class="btn accent" href="#ask" id="k-ask">' + icon('ask') + 'Ask about this chart</a></div>' : '') + '</div>' +
          '<div class="card" style="margin-bottom:16px">' + app.profileBar() + '</div>' + savedStrip();
        if (!p) return;
        const ch = app.chart(p), P = ch.planets;
        const tabs = [['overview', 'Charts'], ['vargas', 'Divisional charts'], ['planets', 'Planets'], ['jaimini', 'Karakas & aspects'], ['dasha', 'Dasha'], ['yogas', 'Yogas & doshas'], ['kp', 'KP system'], ['ashtaka', 'Ashtakavarga & strength'], ['transit', 'Transits'], ['varsha', 'Varshphal'], ['lalkitab', 'Lal Kitab'], ['prashna', 'Prashna'], ['match', 'Match making']];
        el.insertAdjacentHTML('beforeend', '<div class="tabs" role="tablist">' + tabs.map(([v, l]) => '<button role="tab" data-tab="' + v + '" aria-selected="' + (tab === v) + '">' + l + '</button>').join('') + '</div><div id="kbody"></div>');
        const body = $('#kbody', el);
        if (p.tobUnknown) body.insertAdjacentHTML('beforebegin', '<div class="callout" style="margin-bottom:12px">Birth time is unknown, so the lagna, houses and navamsa are approximate. Moon sign, nakshatra and dasha are close but can shift if the Moon changed nakshatra that day.</div>');
        const g = guidance(ch);
        if (tab === 'overview') {
          body.innerHTML = '<div class="grid g4" style="margin-bottom:16px">' +
            fact('Lagna', D.SIGNS[ch.lagna].sa + ' ' + Math.floor(ch.asc % 30) + '°', D.SIGNS[ch.lagna].en + ' rising · lord ' + g.lagLord) +
            fact('Moon sign (Rashi)', D.SIGNS[ch.moonSign].sa, D.SIGNS[ch.moonSign].en + ' · lord ' + D.SIGNS[ch.moonSign].lord) +
            fact('Nakshatra', D.NAKSHATRAS[ch.moonNak].name, 'pada ' + P.Moon.pada + ' · lord ' + D.NAKSHATRAS[ch.moonNak].lord) +
            fact('Running dasha', g.cd ? g.cd.md.lord + ' › ' + g.cd.ad.lord : '—', g.cd ? 'until ' + A.fmtDate(g.cd.ad.end, p.place.tz) : '') + '</div>' +
            '<div class="charts"><div class="card"><div class="card-head"><h3>Rashi chart (D1)</h3><span class="tiny muted">℞ retrograde · green exalted · red debilitated</span></div>' + chartSvg(ch, 'd1', 'Rashi') + '</div>' +
            '<div class="card"><div class="card-head"><h3>Navamsa (D9)</h3><span class="tiny muted">Marriage, dharma, inner strength</span></div>' + chartSvg(ch, 'd9', 'Navamsa') + '</div>' +
            '<div class="card"><div class="card-head"><h3>Chandra chart</h3><span class="tiny muted">Houses counted from the Moon</span></div>' + chartSvg(ch, 'moon', 'Chandra') + '</div>' +
            '<div class="card stack"><h3>At a glance</h3><dl class="kv"><dt>Strong</dt><dd>' + (g.strong.map((x) => x + ' (' + P[x].dignity.toLowerCase() + ')').join(', ') || 'No exalted or own-sign planets') + '</dd><dt>Needs support</dt><dd>' + (g.weak.map((x) => x + ' (' + (P[x].dignity === 'Debilitated' ? 'debilitated' : 'combust') + ')').join(', ') || 'None debilitated or combust') + '</dd>' +
            '<dt>Lucky stones</dt><dd>' + [g.lagLord, g.fifth, g.ninth].filter((x, i, a) => a.indexOf(x) === i).map((x) => D.PLANETS[x].gem + ' <span class="muted small">(' + x + ')</span>').join('<br>') + '<div class="small muted">From lagna, 5th and 9th lords. Consult before wearing.</div></dd>' +
            '<dt>Mantra now</dt><dd>' + (g.cd ? '<i>' + D.PLANETS[g.cd.md.lord].mantra + '</i> <span class="small muted">for the ' + g.cd.md.lord + ' mahadasha</span>' : '—') + '</dd>' +
            '<dt>Ayanamsa</dt><dd class="num">Lahiri ' + A.fmtDeg(ch.ayanamsa) + '</dd></dl></div></div>' + birthDetails(p, ch);
        } else if (tab === 'planets') {
          body.innerHTML = '<div class="card"><div class="table-wrap"><table class="t"><thead><tr><th>Graha</th><th>Sign</th><th>Degree</th><th>Nakshatra</th><th>House</th><th>Condition</th><th>KP sign / star / sub / sub-sub</th></tr></thead><tbody>' +
            '<tr><td><b>Lagna</b></td><td>' + D.SIGNS[ch.lagna].en + '</td><td class="num">' + A.fmtDeg(ch.asc % 30) + '</td><td>' + D.NAKSHATRAS[ch.ascNak].name + '</td><td>1</td><td></td><td>' + ch.ascKp.sign + ' / ' + ch.ascKp.star + ' / ' + ch.ascKp.sub + ' / ' + ch.ascKp.subsub + '</td></tr>' +
            D.PLANET_ORDER.map((n) => { const q = P[n]; return '<tr><td><b>' + n + '</b> <span class="muted small">' + D.PLANETS[n].sa + '</span></td><td>' + D.SIGNS[q.sign].en + '</td><td class="num">' + A.fmtDeg(q.deg) + '</td><td>' + q.nakName + ' <span class="muted">' + q.pada + '</span></td><td>' + q.house + '</td><td><span class="chip ' + (q.dignity === 'Exalted' || q.dignity === 'Own sign' ? 'good' : q.dignity === 'Debilitated' || q.dignity === 'Enemy' ? 'bad' : '') + '">' + q.dignity + '</span> ' + (q.retro && n !== 'Rahu' && n !== 'Ketu' ? '<span class="chip ok">Retro</span> ' : '') + (q.combust ? '<span class="chip bad">Combust</span>' : '') + '</td><td>' + q.kp.sign + ' / ' + q.kp.star + ' / ' + q.kp.sub + ' / ' + q.kp.subsub + '</td></tr>'; }).join('') +
            '</tbody></table></div><p class="note" style="margin-top:12px">Houses are whole-sign from the lagna. KP lords use the Vimshottari proportions within each nakshatra. Nodes are mean nodes.</p></div>';
        } else if (tab === 'dasha' && lsGet('kdsys', 'vim') === 'yog') {
          const yg = D.j2.yogini(ch), now = A.nowJd();
          body.innerHTML = '<div class="seg" id="k-dsys" style="margin-bottom:12px"><button data-v="vim" aria-pressed="false">Vimshottari (120 yrs)</button><button data-v="yog" aria-pressed="true">Yogini (36 yrs)</button></div><div class="card"><div class="card-head"><h3>Yogini dasha</h3><span class="small muted">Balance at birth: ' + yg.balance.name + ' ' + yg.balance.years.toFixed(2) + ' years</span></div><div class="dasha-list">' +
            yg.periods.filter((m) => m.end > ch.jd).slice(0, 14).map((m) => { const isNow = now >= m.start && now < m.end, prog = Math.max(0, Math.min(1, (now - m.start) / (m.end - m.start))); return '<div class="dasha-row' + (isNow ? ' now' : '') + '" style="cursor:default"><b>' + m.name + ' <span class="muted small">' + m.lord + '</span></b><span class="bar"><i style="width:' + prog * 100 + '%"></i></span><span class="small num muted">' + A.fmtDate(m.start, p.place.tz) + ' → ' + A.fmtDate(m.end, p.place.tz) + '</span></div>' + (isNow ? '<div class="dasha-list" style="margin:2px 0 8px 18px">' + m.sub.map((a) => '<div class="dasha-row' + (now >= a.start && now < a.end ? ' now' : '') + '" style="cursor:default"><span>' + m.name + ' › <b>' + a.name + '</b></span><span class="small muted">' + a.lord + '</span><span class="small num muted">' + A.fmtDate(a.start, p.place.tz) + ' → ' + A.fmtDate(a.end, p.place.tz) + '</span></div>').join('') + '</div>' : ''); }).join('') +
            '</div><p class="note" style="margin-top:12px">Yogini dasha is widely used alongside Vimshottari, especially for timing in North India. Mangala (Moon) 1, Pingala (Sun) 2, Dhanya (Jupiter) 3, Bhramari (Mars) 4, Bhadrika (Mercury) 5, Ulka (Saturn) 6, Siddha (Venus) 7, Sankata (Rahu) 8 years.</p></div>';
        } else if (tab === 'dasha') {
          const now = A.nowJd(), cd = g.cd, open = lsGet('kopen', cd ? cd.md.lord : null);
          body.innerHTML = '<div class="seg" id="k-dsys" style="margin-bottom:12px"><button data-v="vim" aria-pressed="true">Vimshottari (120 yrs)</button><button data-v="yog" aria-pressed="false">Yogini (36 yrs)</button></div><div class="card"><div class="card-head"><h3>Vimshottari dasha</h3><span class="small muted">Balance at birth: ' + ch.dasha.balance.lord + ' ' + ch.dasha.balance.years.toFixed(2) + ' years</span></div><div class="dasha-list">' +
            ch.dasha.periods.slice(0, 9).map((m) => {
              const isNow = cd && cd.md === m, prog = Math.max(0, Math.min(1, (now - m.start) / (m.end - m.start)));
              let s = '<button class="dasha-row' + (isNow ? ' now' : '') + '" data-md="' + m.lord + '"><b>' + m.lord + '</b><span class="bar"><i style="width:' + prog * 100 + '%"></i></span><span class="small num muted">' + A.fmtDate(m.start, p.place.tz) + ' → ' + A.fmtDate(m.end, p.place.tz) + '</span></button>';
              if (open === m.lord) s += '<div style="margin:2px 0 8px 18px" class="dasha-list">' + m.sub.map((a) => { const n2 = cd && cd.ad === a; return '<div class="dasha-row' + (n2 ? ' now' : '') + '" style="cursor:default"><span>' + m.lord + ' › <b>' + a.lord + '</b></span><span class="small muted">' + (n2 && cd.pd ? 'now in ' + cd.pd.lord + ' pratyantar' : '') + '</span><span class="small num muted">' + A.fmtDate(a.start, p.place.tz) + ' → ' + A.fmtDate(a.end, p.place.tz) + '</span></div>'; }).join('') + '</div>';
              return s;
            }).join('') + '</div><p class="note" style="margin-top:12px">Tap a mahadasha to see its antardashas. Year length 365.25 days.</p></div>';
        } else if (tab === 'yogas') {
          const allY = ch.yogas.concat(D.j2.extraYogas(ch)), pres = allY.filter((y) => y.present), abs = allY.filter((y) => !y.present);
          const mg = D.j2.mangal(ch), ss = D.j2.sadeSatiTimeline(ch, 100), nowJ = A.nowJd();
          body.innerHTML = '<div class="grid g2"><div class="card"><h3 style="margin-bottom:6px">Present in this chart</h3>' + (pres.length ? pres.map(yogaRow).join('') : '<p class="muted small">None of the checked yogas are present.</p>') + '</div><div class="card"><h3 style="margin-bottom:6px">Checked, not present</h3>' + abs.map(yogaRow).join('') + '</div></div>' +
            '<div class="grid g2" style="margin-top:16px"><div class="card stack"><div class="row-between"><h3>Mangal dosha in depth</h3><span class="chip ' + ({ none: 'good', cancelled: 'good', mild: 'ok', strong: 'bad' }[mg.level]) + '">' + ({ none: 'not Manglik', cancelled: 'present but cancelled', mild: 'mild', strong: 'strong' }[mg.level]) + '</span></div>' +
            '<div class="table-wrap"><table class="t"><thead><tr><th>Counted from</th><th>Mars in house</th><th>Manglik?</th></tr></thead><tbody>' + mg.refs.map((r) => '<tr><td>' + r.n + '</td><td class="num">' + r.h + '</td><td>' + (r.hit ? '<span class="chip bad">yes</span>' : '<span class="chip good">no</span>') + '</td></tr>').join('') + '</tbody></table></div>' +
            (mg.cancel.length ? '<div class="small"><b>Cancellations found:</b><ul style="margin:4px 0 0;padding-left:18px">' + mg.cancel.map((c) => '<li>' + esc(c) + '</li>').join('') + '</ul></div>' : mg.present ? '<p class="small">No classical cancellation applies. Marrying a partner who is also Manglik balances it.</p>' : '') + '</div>' +
            '<div class="card stack"><h3>Sade Sati and Dhaiya timeline</h3><p class="small muted">Now: ' + esc(A.saturnStatus(ch.moonSign, nowJ).phase) + '. Moon sign ' + D.SIGNS[ch.moonSign].en + '.</p><div class="table-wrap" style="max-height:320px;overflow-y:auto"><table class="t"><thead><tr><th>Period</th><th>From</th><th>To</th></tr></thead><tbody>' +
            ss.map((x) => '<tr class="' + (nowJ >= x.start && nowJ < x.end ? 'now' : '') + '"><td><b>' + esc(x.kind) + '</b></td><td class="num">' + A.fmtDate(x.start, p.place.tz) + '</td><td class="num">' + A.fmtDate(x.end, p.place.tz) + '</td></tr>').join('') + '</tbody></table></div><p class="note">Sade Sati: Saturn in the 12th, 1st and 2nd from the Moon (about 7½ years). Dhaiya: Saturn in the 4th or 8th (about 2½ years).</p></div></div>';
        } else if (tab === 'transit') {
          const tr = A.transits(A.nowJd());
          body.innerHTML = '<div class="card"><div class="card-head"><h3>Today’s planets over your chart</h3><span class="small muted">Counted from lagna and from Moon</span></div><div class="table-wrap"><table class="t"><thead><tr><th>Graha</th><th>Transit sign</th><th>From lagna</th><th>From Moon</th><th>Natal position</th></tr></thead><tbody>' +
            D.PLANET_ORDER.map((n) => { const t = tr[n]; const hl = ((t.sign - ch.lagna + 12) % 12) + 1, hm = ((t.sign - ch.moonSign + 12) % 12) + 1; const goodM = { Sun: [3, 6, 10, 11], Moon: [1, 3, 6, 7, 10, 11], Mars: [3, 6, 11], Mercury: [2, 4, 6, 8, 10, 11], Jupiter: [2, 5, 7, 9, 11], Venus: [1, 2, 3, 4, 5, 8, 9, 11, 12], Saturn: [3, 6, 11], Rahu: [3, 6, 11], Ketu: [3, 6, 11] }[n]; return '<tr><td><b>' + n + '</b></td><td>' + D.SIGNS[t.sign].en + ' ' + Math.floor(t.deg) + '°' + (t.retro && n !== 'Rahu' && n !== 'Ketu' ? ' ℞' : '') + '</td><td>' + hl + '</td><td>' + hm + ' <span class="chip ' + (goodM.includes(hm) ? 'good' : 'bad') + '">' + (goodM.includes(hm) ? 'favourable' : 'challenging') + '</span></td><td class="muted">' + D.SIGNS[P[n].sign].en + ', house ' + P[n].house + '</td></tr>'; }).join('') +
            '</tbody></table></div><p class="note" style="margin-top:12px">Favourable houses from the Moon follow classical gochar rules (e.g. Jupiter in 2, 5, 7, 9, 11; Saturn in 3, 6, 11). Vedha exceptions are not applied.</p></div>';
        } else if (tab === 'match') {
          const others = app.profiles().filter((x) => x.id !== p.id);
          const sel = lsGet('kmatch', others[0] && others[0].id);
          const o = others.find((x) => x.id === sel) || others[0];
          if (!o) { body.innerHTML = '<div class="card empty">' + icon('people') + '<div><h3>Add a second person</h3><p>Gun milan compares two people’s Moon nakshatras.</p></div><button class="btn primary" data-act-add>' + icon('plus') + 'Add person</button></div>'; }
          else {
            const pBoy = (p.gender || 'male') === 'male';
            const boy = pBoy ? p : o, girl = pBoy ? o : p;
            body.innerHTML = '<div class="card stack"><div class="row"><label class="field"><span>Match ' + esc(p.name.split(' ')[0]) + ' with</span><select class="input" id="k-other">' + others.map((x) => '<option value="' + x.id + '"' + (x.id === o.id ? ' selected' : '') + '>' + esc(x.name) + '</option>').join('') + '</select></label></div>' +
              '<div id="k-milan"></div></div>';
            renderMilan($('#k-milan', body), boy, girl);
            $('#k-milan', body).insertAdjacentHTML('afterend', matchExtras(boy, girl));
            $('#k-other', body).addEventListener('change', (e) => { lsSet('kmatch', e.target.value); draw(); });
          }
        }
        if (tab === 'vargas') {
          const n = +lsGet('kvarga', 9), meta = D.j2.VARGAS.find((v) => v[0] === n) || D.j2.VARGAS[5], vc = D.j2.vargaChart(ch, n);
          const vargottama = D.PLANET_ORDER.filter((x) => vc.planets[x].vsign === ch.planets[x].sign);
          body.innerHTML = '<div class="row" style="margin-bottom:12px"><label class="field"><span>Divisional chart</span><select class="input" id="k-varga">' + D.j2.VARGAS.map((v) => '<option value="' + v[0] + '"' + (v[0] === n ? ' selected' : '') + '>' + v[1] + ': ' + v[2] + '</option>').join('') + '</select></label></div>' +
            '<div class="charts"><div class="card"><div class="card-head"><h3>' + meta[1] + '</h3><span class="tiny muted">' + meta[2] + '</span></div>' + chartSvg(vc, 'd9', meta[1].split(' ')[0]) + '</div>' +
            '<div class="card"><div class="table-wrap"><table class="t"><thead><tr><th>Graha</th><th>D1 sign</th><th>' + meta[1].match(/\(D\d+\)/)[0].slice(1, -1) + ' sign</th><th>Condition</th></tr></thead><tbody><tr><td><b>Lagna</b></td><td>' + D.SIGNS[ch.lagna].en + '</td><td>' + D.SIGNS[vc.ascNavamsa].en + '</td><td></td></tr>' +
            D.PLANET_ORDER.map((x) => '<tr><td><b>' + x + '</b></td><td>' + D.SIGNS[ch.planets[x].sign].en + '</td><td>' + D.SIGNS[vc.planets[x].vsign].en + '</td><td>' + (n !== 1 && vargottama.includes(x) ? '<span class="chip good">same sign (vargottama-like)</span> ' : '') + '<span class="chip ' + (['Exalted', 'Own sign'].includes(vc.planets[x].dignity) ? 'good' : vc.planets[x].dignity === 'Debilitated' ? 'bad' : '') + '">' + vc.planets[x].dignity + '</span></td></tr>').join('') + '</tbody></table></div><p class="note" style="margin-top:10px">Divisional charts follow Parashara’s rules. They need an accurate birth time: D9 shifts every 13 minutes or so, D60 every 2 minutes.</p></div></div>';
          $('#k-varga', body).addEventListener('change', (e) => { lsSet('kvarga', e.target.value); draw(); });
        } else if (tab === 'jaimini') {
          const ck = D.j2.charaKarakas(ch), asp = D.j2.aspects(ch);
          body.innerHTML = '<div class="grid g2"><div class="card"><div class="card-head"><h3>Chara karakas (Jaimini)</h3><span class="small muted">By degree within the sign</span></div><div class="table-wrap"><table class="t"><thead><tr><th>Karaka</th><th>Planet</th><th>Degree</th><th>Signifies</th></tr></thead><tbody>' + ck.map((k) => '<tr><td><b>' + k.karaka + '</b></td><td>' + k.planet + '</td><td class="num">' + A.fmtDeg(k.deg) + '</td><td class="small">' + k.meaning + '</td></tr>').join('') + '</tbody></table></div>' +
            '<p class="note" style="margin-top:8px">Karakamsha (Atmakaraka in D9): ' + D.SIGNS[ch.planets[ck[0].planet].navamsa].en + '. Seven-karaka scheme (Rahu excluded).</p></div>' +
            '<div class="card"><div class="card-head"><h3>Avasthas and bhava chalit</h3><span class="small muted">Planet age state · Placidus house</span></div><div class="table-wrap"><table class="t"><thead><tr><th>Graha</th><th>Avastha</th><th>Results</th><th>Rashi house</th><th>Bhava (Placidus)</th></tr></thead><tbody>' +
            D.PLANET_ORDER.map((x) => { const av = D.j2.avastha(ch.planets[x].lon); return '<tr><td><b>' + x + '</b></td><td>' + av.name + ' <span class="muted small">(' + av.gloss + ')</span></td><td class="num">' + av.pct + '%</td><td class="num">' + ch.planets[x].house + '</td><td class="num">' + ch.kp.pHouse[x] + (ch.kp.pHouse[x] !== ch.planets[x].house ? ' <span class="chip ok">shifts</span>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div></div>' +
            '<div class="card span2"><div class="card-head"><h3>Aspects (drishti)</h3><span class="small muted">Full aspects: all planets 7th; Mars 4, 8; Jupiter 5, 9; Saturn 3, 10; Rahu/Ketu 5, 9</span></div><div class="grid g2"><div class="table-wrap"><table class="t"><thead><tr><th>Planet</th><th>Aspects houses</th><th>Aspects planets</th></tr></thead><tbody>' +
            D.PLANET_ORDER.map((x) => '<tr><td><b>' + x + '</b> <span class="muted small">H' + ch.planets[x].house + '</span></td><td class="num">' + asp.byPlanet[x].houses.join(', ') + '</td><td>' + (asp.byPlanet[x].planets.join(', ') || '—') + '</td></tr>').join('') + '</tbody></table></div><div class="table-wrap"><table class="t"><thead><tr><th>House</th><th>Aspected by</th></tr></thead><tbody>' +
            Array.from({ length: 12 }, (_, i) => '<tr><td><b>' + (i + 1) + '</b> <span class="muted small">' + D.SIGNS[(ch.lagna + i) % 12].en + '</span></td><td>' + (asp.byHouse[i + 1].map((x) => '<span class="chip ' + (['Jupiter', 'Venus', 'Mercury', 'Moon'].includes(x) ? 'good' : ['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun'].includes(x) ? 'bad' : '') + '">' + x + '</span>').join(' ') || '—') + '</td></tr>').join('') + '</tbody></table></div></div></div></div>';
        }
        if (tab === 'kp') {
          const mode = lsGet('kpAyan', 'kp'), kv = A.kpView(ch, mode), K = kv.kp, KP = kv.planets, ev = A.kpEvents(kv, A.nowJd());
          const pl = app.place(), rp = A.rulingPlanets(A.nowJd(), pl, mode);
          body.innerHTML = '<div class="row-between" style="margin-bottom:12px"><div class="seg" id="k-kpay"><button data-v="kp" aria-pressed="' + (mode !== 'lahiri') + '">KP (Krishnamurti) ayanamsa</button><button data-v="lahiri" aria-pressed="' + (mode === 'lahiri') + '">Lahiri ayanamsa</button></div><span class="small muted num">' + kv.ayanamsaName + ' ' + A.fmtDeg(kv.ayanamsaUsed) + ' · Placidus houses</span></div>' +
            '<div class="charts" style="margin-bottom:16px"><div class="card"><div class="card-head"><h3>KP chart (bhava chalit)</h3><span class="tiny muted">Houses from Placidus cusps · cusp sign and degree in each house</span></div>' + kpChartSvg(kv) + '</div>' +
            '<div class="card stack"><div class="card-head" style="margin:0"><h3>Ruling planets now</h3><span class="tiny muted">' + esc(pl.name.replace(', India', '')) + ' · ' + A.fmtTime(A.nowJd(), pl.tz) + '</span></div><div class="table-wrap"><table class="t"><tbody>' + rp.rows.map((r) => '<tr><td>' + r[0] + '</td><td><b>' + r[1] + '</b></td></tr>').join('') + '</tbody></table></div>' +
            '<div class="row" style="gap:6px">' + rp.set.map((x) => '<span class="chip accent">' + x + '</span>').join('') + '</div><p class="note">Ruling planets at the moment of judgement confirm which significators will give results now. Lagna ' + D.SIGNS[rp.ascSign].en + ', Moon in ' + D.NAKSHATRAS[rp.moonNak].name + '.</p><button class="btn sm" id="k-rp">' + icon('refresh') + 'Refresh</button></div></div>' +
            '<div class="card" style="margin-bottom:16px"><div class="card-head"><h3>Cusps (Placidus)</h3><span class="small muted">KP sign / star / sub / sub-sub lord of each cusp</span></div><div class="table-wrap"><table class="t"><thead><tr><th>House</th><th>Cusp</th><th>Sign lord</th><th>Star lord</th><th>Sub lord</th><th>Sub-sub</th><th>Occupants</th></tr></thead><tbody>' +
            K.houses.map((x) => '<tr><td><b>' + x.h + '</b></td><td class="num">' + D.SIGNS[Math.floor(x.cusp / 30)].en.slice(0, 3) + ' ' + A.fmtDeg(x.cusp % 30) + '</td><td>' + x.kp.sign + '</td><td>' + x.kp.star + '</td><td><b>' + x.kp.sub + '</b></td><td>' + x.kp.subsub + '</td><td>' + (x.occupants.join(', ') || '—') + '</td></tr>').join('') + '</tbody></table></div></div>' +
            '<div class="grid g2"><div class="card"><div class="card-head"><h3>Planets</h3><span class="small muted">KP positions and lords</span></div><div class="table-wrap"><table class="t"><thead><tr><th>Planet</th><th>Position</th><th>House</th><th>Star / Sub / Sub-sub</th><th>Signifies</th></tr></thead><tbody>' +
            D.PLANET_ORDER.map((n) => '<tr><td><b>' + n + '</b></td><td class="num">' + D.SIGNS[KP[n].sign].en.slice(0, 3) + ' ' + A.fmtDeg(KP[n].deg) + '</td><td class="num">' + K.pHouse[n] + '</td><td>' + KP[n].kp.star + ' / ' + KP[n].kp.sub + ' / ' + KP[n].kp.subsub + '</td><td class="num">' + K.sig[n].join(', ') + '</td></tr>').join('') + '</tbody></table></div>' +
            '<details style="margin-top:10px"><summary class="small">House-wise significators (4 levels)</summary><div class="table-wrap" style="margin-top:8px"><table class="t"><thead><tr><th>House</th><th>L1 in star of occupants</th><th>L2 occupants</th><th>L3 in star of owner</th><th>L4 owner</th></tr></thead><tbody>' + K.houses.map((x) => '<tr><td>' + x.h + '</td><td>' + (x.L1.join(', ') || '—') + '</td><td>' + (x.L2.join(', ') || '—') + '</td><td>' + (x.L3.join(', ') || '—') + '</td><td>' + x.L4.join(', ') + '</td></tr>').join('') + '</tbody></table></div></details></div>' +
            '<div class="card"><div class="card-head"><h3>Life-event scan</h3><span class="small muted">Promise from the main cusp sub lord, timing from the running dasha</span></div>' +
            ev.map((e) => '<div class="yoga"><span class="dot-q ' + (e.promise ? 'good' : 'neutral') + '" style="margin-top:7px"></span><div class="grow"><div class="row-between"><b>' + e.name + '</b>' + (e.active.length && e.promise ? '<span class="chip great">active now</span>' : e.promise ? '<span class="chip good">promised</span>' : '<span class="chip">weak promise</span>') + '</div><div class="small muted">Cusp ' + e.cusp + ' sub lord ' + e.csl + ' signifies ' + (e.cslHouses.join(', ') || 'none') + '. Needs ' + e.houses.join(', ') + '. Strong significators: ' + (e.supporters.join(', ') || 'none') + (e.active.length ? '. Running dasha lord(s) ' + e.active.join(', ') + ' connect' + (e.active.some((x) => rp.set.includes(x)) ? ' and are ruling planets now' : '') + '.' : '.') + '</div></div></div>').join('') + '</div></div>' +
            '<p class="note" style="margin-top:12px">KP uses Placidus houses and the Krishnamurti ayanamsa (about 6′ less than Lahiri). The event scan is a quick guide; a KP astrologer also weighs ruling planets and sub-sub lords.</p>';
          $$('#k-kpay button', body).forEach((bt) => bt.addEventListener('click', () => { lsSet('kpAyan', bt.dataset.v); draw(); }));
          $('#k-rp', body).addEventListener('click', () => draw());
        } else if (tab === 'ashtaka') {
          const AV = ch.ashtaka, PL = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
          const signs = Array.from({ length: 12 }, (_, i) => (ch.lagna + i) % 12);
          body.innerHTML = '<div class="card" style="margin-bottom:16px"><div class="card-head"><h3>Ashtakavarga</h3><span class="small muted">Bindus per sign, columns start from the lagna · total ' + AV.total + '</span></div><div class="table-wrap"><table class="t"><thead><tr><th></th>' + signs.map((sg, i) => '<th title="' + D.SIGNS[sg].en + '">H' + (i + 1) + '<br><span style="font-weight:500">' + D.SIGNS[sg].sa.slice(0, 4) + '</span></th>').join('') + '<th>Total</th></tr></thead><tbody>' +
            PL.map((pl) => '<tr><td><b>' + pl + '</b></td>' + signs.map((sg) => { const v = AV.bav[pl][sg]; return '<td class="num" style="' + (sg === P[pl].sign ? 'background:var(--saffron-soft);font-weight:700' : '') + '">' + v + '</td>'; }).join('') + '<td class="num">' + AV.bav[pl].reduce((a, b) => a + b, 0) + '</td></tr>').join('') +
            '<tr><td><b>SAV</b></td>' + signs.map((sg) => { const v = AV.sav[sg]; return '<td class="num"><span class="chip ' + (v >= 30 ? 'good' : v < 25 ? 'bad' : '') + '">' + v + '</span></td>'; }).join('') + '<td class="num"><b>' + AV.total + '</b></td></tr></tbody></table></div>' +
            '<p class="note" style="margin-top:10px">Highlighted cells: the planet’s own sign. Houses with 28+ SAV bindus give good results; 30+ are strong, under 25 weak. Saturn and Jupiter transits through high-bindu signs tend to go well.</p></div>' +
            '<div class="card"><div class="card-head"><h3>Planet strength index</h3><span class="small muted">Simplified: dignity, directional strength, house, retrogression, combustion, vargottama and own bindus. Not full Shadbala.</span></div><div class="bars">' +
            PL.map((pl) => { const v = ch.strength[pl]; return '<div class="bar-row" style="grid-template-columns:76px minmax(0,1fr) 40px;cursor:default"><b>' + pl + '</b><div class="track"><div class="fill" style="width:' + v + '%;background:' + (v >= 60 ? 'var(--good)' : v >= 40 ? 'var(--saffron)' : 'var(--bad)') + '"></div></div><span class="num small">' + v + '</span></div>'; }).join('') + '</div></div>';
        } else if (tab === 'varsha') {
          const yr = +(lsGet('kyear', 0) || new Date().getFullYear());
          const v = A.varshphal(p, yr), vc = v.chart;
          body.innerHTML = '<div class="row" style="margin-bottom:12px"><label class="field"><span>Year</span><input class="input mono" type="number" id="k-year" min="' + (+p.dob.slice(0, 4) + 1) + '" max="' + (+p.dob.slice(0, 4) + 120) + '" value="' + yr + '" style="width:120px"></label><span class="small muted" style="align-self:flex-end;padding-bottom:9px">Age ' + v.age + ' completes · any year up to 120</span></div>' +
            '<div class="charts"><div class="card"><div class="card-head"><h3>Varsha chart ' + yr + '</h3><span class="tiny muted">Solar return at the birth place</span></div>' + chartSvg(vc, 'd1', 'Varsha ' + yr) + '</div>' +
            '<div class="card stack"><h3>Year at a glance</h3><dl class="kv"><dt>Varsha pravesh</dt><dd>' + A.fmtDate(v.jd, p.place.tz) + ', ' + A.fmtTime(v.jd, p.place.tz) + '</dd><dt>Varsha lagna</dt><dd>' + D.SIGNS[vc.lagna].en + ' (lord ' + D.SIGNS[vc.lagna].lord + ')</dd><dt>Muntha</dt><dd>' + D.SIGNS[v.muntha].en + ' in house ' + v.munthaHouse + ' · lord ' + v.munthaLord + ' <span class="chip ' + ([6, 8, 12, 4].includes(v.munthaHouse) ? 'bad' : [9, 10, 11, 1, 5].includes(v.munthaHouse) ? 'good' : 'ok') + '">' + ([6, 8, 12, 4].includes(v.munthaHouse) ? 'challenging' : [9, 10, 11, 1, 5].includes(v.munthaHouse) ? 'favourable' : 'mixed') + '</span></dd>' +
            '<dt>Moon</dt><dd>' + D.SIGNS[vc.moonSign].en + ', ' + D.NAKSHATRAS[vc.moonNak].name + '</dd><dt>Strong this year</dt><dd>' + (D.PLANET_ORDER.filter((n) => vc.planets[n].dignity === 'Exalted' || vc.planets[n].dignity === 'Own sign').join(', ') || '—') + '</dd><dt>In kendras</dt><dd>' + (D.PLANET_ORDER.filter((n) => [1, 4, 7, 10].includes(vc.planets[n].house)).join(', ') || '—') + '</dd></dl>' +
            '<p class="note">Tajik annual chart. Muntha advances one sign per year from the natal lagna; it is favourable in houses 1, 5, 9, 10, 11 and difficult in 4, 6, 8, 12.</p></div></div>';
          $('#k-year', body).addEventListener('change', (e) => { lsSet('kyear', e.target.value); draw(); });
        } else if (tab === 'lalkitab') {
          const lk = Object.assign({}, ch, { lagna: 0, ascNavamsa: 0, moonSign: 0 });
          body.innerHTML = '<div class="charts"><div class="card"><div class="card-head"><h3>Lal Kitab chart</h3><span class="tiny muted">Aries fixed in house 1; planets by sign</span></div>' + northSvg(lk, 'd1', 'Lal Kitab') + '</div>' +
            '<div class="card"><h3 style="margin-bottom:8px">Planets and remedies</h3>' + D.PLANET_ORDER.map((n) => { const h = P[n].sign + 1, L = D.LALKITAB[n], pk = L.pakka.includes(h); return '<div class="yoga"><span class="dot-q ' + (pk ? 'good' : 'neutral') + '" style="margin-top:7px"></span><div><b>' + n + ' in house ' + h + '</b>' + (pk ? ' <span class="chip good">pakka ghar</span>' : '') + '<div class="small muted">Permanent house ' + L.pakka.join(', ') + '. ' + esc(L.remedy) + '</div></div></div>'; }).join('') +
            '<p class="note" style="margin-top:10px">Lal Kitab remedies are simple and low-cost; do one at a time for 40–43 days and avoid them during a planet’s favourable placement.</p></div></div>';
        } else if (tab === 'prashna') {
          const pl = app.place(), nowLocal = A.jdToLocal(A.nowJd(), pl.tz);
          const pp = { id: 'prashna-' + nowLocal.y + nowLocal.m + nowLocal.d + nowLocal.h + nowLocal.mi, name: 'Prashna', dob: nowLocal.y + '-' + String(nowLocal.m).padStart(2, '0') + '-' + String(nowLocal.d).padStart(2, '0'), tob: String(nowLocal.h).padStart(2, '0') + ':' + String(nowLocal.mi).padStart(2, '0'), place: pl };
          const pc = app.chart(pp);
          const lagLord = D.SIGNS[pc.lagna].lord, moonH = pc.planets.Moon.house;
          body.innerHTML = '<div class="charts"><div class="card"><div class="card-head"><h3>Prashna chart</h3><span class="tiny muted">Cast for ' + pp.tob + ' at ' + esc(pl.name.replace(', India', '')) + '</span></div>' + chartSvg(pc, 'd1', 'Prashna') + '</div>' +
            '<div class="card stack"><h3>Reading the question</h3><dl class="kv"><dt>Prashna lagna</dt><dd>' + D.SIGNS[pc.lagna].en + ' · lord ' + lagLord + ' in house ' + pc.planets[lagLord].house + '</dd><dt>Moon</dt><dd>House ' + moonH + ', ' + D.NAKSHATRAS[pc.moonNak].name + ' <span class="chip ' + ([1, 4, 7, 10, 5, 9, 11].includes(moonH) ? 'good' : 'bad') + '">' + ([1, 4, 7, 10, 5, 9, 11].includes(moonH) ? 'supports the question' : 'obstacles') + '</span></dd><dt>Lagna lord</dt><dd>' + pc.planets[lagLord].dignity + (pc.planets[lagLord].combust ? ', combust' : '') + '</dd>' +
            '<dt>KP ruling sub</dt><dd>Lagna cusp sub lord ' + pc.kp.houses[0].kp.sub + ' signifies houses ' + (pc.kp.sig[pc.kp.houses[0].kp.sub] || []).join(', ') + '</dd></dl>' +
            '<p class="note">Hold the question clearly in mind, then open this tab. A strong lagna lord and a Moon in a kendra or trikona suggest a favourable answer. For a detailed reading, ask Anubhuti about this Prashna.</p><button class="btn sm" id="k-pre">' + icon('refresh') + 'Recast for now</button></div></div>';
          $('#k-pre', body).addEventListener('click', () => draw());
        }
        $$('#k-dsys button', el).forEach((b) => b.addEventListener('click', () => { lsSet('kdsys', b.dataset.v); draw(); }));
        $$('[data-tab]', el).forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; lsSet('ktab', tab); draw(); }));
        $$('[data-md]', el).forEach((b) => b.addEventListener('click', () => { const cur = lsGet('kopen', null); lsSet('kopen', cur === b.dataset.md ? null : b.dataset.md); draw(); }));
        const dl = $('#k-dl', el); dl && dl.addEventListener('click', async () => { const r = await S.download('kundli-' + p.name.replace(/\W+/g, '-').toLowerCase() + '.html', reportHtml(p, ch), 'text/html'); if (r === 'saved') toast('Report saved'); else if (r === 'unavailable') toast('Downloads are not available in this view.'); });
        const ak = $('#k-ask', el); ak && ak.addEventListener('click', () => lsSet('askPreset', 'chart'));
      };
      const savedStrip = () => {
        const ps = app.profiles(), cur = app.activeProfile();
        if (!ps.length) return '';
        return '<div class="saved-strip" aria-label="Saved kundlis"><span class="tiny muted" style="align-self:center;white-space:nowrap">Saved kundlis (' + ps.length + ')</span>' + ps.map((x) => '<button class="saved-k' + (cur && cur.id === x.id ? ' on' : '') + '" data-pick="' + x.id + '"><span class="avatar">' + esc(D.ui.initials(x.name)) + '</span><span><b>' + esc(x.name.split(' ')[0]) + '</b><small>' + esc(x.relation || 'No relation') + '</small></span></button>').join('') + '<button class="saved-k new" data-act-add><span class="avatar">+</span><span><b>New kundli</b><small>Enter details</small></span></button></div>';
      };
      el.addEventListener('click', (e) => { const b = e.target.closest('[data-pick]'); if (b) { S.saveSettings({ activeProfile: b.dataset.pick }); } });
      const fact = (l, v, s) => '<div class="card"><div class="stat"><span class="label">' + l + '</span><span class="value">' + esc(v) + '</span><span class="sub">' + esc(s) + '</span></div></div>';
      const yogaRow = (y) => '<div class="yoga"><span class="dot-q ' + (y.present ? (y.kind === 'good' ? 'good' : 'bad') : 'neutral') + '" style="margin-top:7px;' + (y.present ? '' : 'opacity:.35') + '"></span><div><b>' + esc(y.name) + '</b><div class="small muted">' + esc(y.why) + '</div></div></div>';
      draw();
      this.onData = draw;
    },
  };
  D.kundli = { northSvg, southSvg, kpChartSvg, milan, renderMilan, matchExtras, reportHtml, guidance };
})(window);
