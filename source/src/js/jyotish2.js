/* Anubhuti — advanced Jyotish: divisional charts, Jaimini karakas, drishti, avasthas, Yogini dasha,
   Sade Sati timeline, detailed Mangal dosha, extra yogas, and South Indian 10-porutham matching. */
(function (G) {
  const D = (G.Disha = G.Disha || {});
  const A = D.astro;
  const SEVEN = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

  /* ---------- Shodashvarga (Parashara) ---------- */
  const VARGAS = [
    [1, 'Rashi (D1)', 'Body, overall life'], [2, 'Hora (D2)', 'Wealth'], [3, 'Drekkana (D3)', 'Siblings, courage'], [4, 'Chaturthamsha (D4)', 'Home, property, fortune'],
    [7, 'Saptamsha (D7)', 'Children, progeny'], [9, 'Navamsha (D9)', 'Marriage, dharma, inner strength'], [10, 'Dashamsha (D10)', 'Career, status'], [12, 'Dwadashamsha (D12)', 'Parents'],
    [16, 'Shodashamsha (D16)', 'Vehicles, comforts'], [20, 'Vimshamsha (D20)', 'Spiritual practice'], [24, 'Chaturvimshamsha (D24)', 'Education, learning'], [27, 'Bhamsha (D27)', 'Strengths and weaknesses'],
    [30, 'Trimshamsha (D30)', 'Misfortunes, health risks'], [40, 'Khavedamsha (D40)', 'Maternal legacy, auspiciousness'], [45, 'Akshavedamsha (D45)', 'Paternal legacy, character'], [60, 'Shashtiamsha (D60)', 'Past karma, overall results'],
  ];
  function varga(lon, n) {
    const s = Math.floor(lon / 30), d = lon - s * 30, odd = s % 2 === 0;
    switch (n) {
      case 1: return s;
      case 2: return odd ? (d < 15 ? 4 : 3) : (d < 15 ? 3 : 4);
      case 3: return (s + [0, 4, 8][Math.min(2, Math.floor(d / 10))]) % 12;
      case 4: return (s + [0, 3, 6, 9][Math.min(3, Math.floor(d / 7.5))]) % 12;
      case 7: { const k = Math.min(6, Math.floor(d / (30 / 7))); return (odd ? s + k : s + 6 + k) % 12; }
      case 9: return Math.floor((lon * 9) / 30) % 12;
      case 10: { const k = Math.min(9, Math.floor(d / 3)); return (odd ? s + k : s + 8 + k) % 12; }
      case 12: return (s + Math.min(11, Math.floor(d / 2.5))) % 12;
      case 16: return ([0, 4, 8][s % 3] + Math.min(15, Math.floor(d / (30 / 16)))) % 12;
      case 20: return ([0, 8, 4][s % 3] + Math.min(19, Math.floor(d / 1.5))) % 12;
      case 24: return ((odd ? 4 : 3) + Math.min(23, Math.floor(d / 1.25))) % 12;
      case 27: return ([0, 3, 6, 9][s % 4] + Math.min(26, Math.floor(d / (30 / 27)))) % 12;
      case 30: return odd ? (d < 5 ? 0 : d < 10 ? 10 : d < 18 ? 8 : d < 25 ? 2 : 6) : (d < 5 ? 1 : d < 12 ? 5 : d < 20 ? 11 : d < 25 ? 9 : 7);
      case 40: return ((odd ? 0 : 6) + Math.min(39, Math.floor(d / 0.75))) % 12;
      case 45: return ([0, 4, 8][s % 3] + Math.min(44, Math.floor(d / (30 / 45)))) % 12;
      case 60: return (s + Math.min(59, Math.floor(d * 2))) % 12;
    }
    return s;
  }
  /* a chart-shaped object for drawing a varga with the existing chart renderers */
  function vargaChart(ch, n) {
    const planets = {};
    for (const p of D.PLANET_ORDER) { const q = ch.planets[p], vs = varga(q.lon, n); planets[p] = { ...q, navamsa: vs, vsign: vs, dignity: A.dignity(p, vs) }; }
    return { ...ch, ascNavamsa: varga(ch.asc, n), planets };
  }

  /* ---------- Jaimini chara karakas (7-karaka scheme) ---------- */
  const KARAKA = [['Atmakaraka', 'The soul; your deepest desire and life lesson'], ['Amatyakaraka', 'Career, advisers, how you earn'], ['Bhratrikaraka', 'Siblings, courage, initiative'], ['Matrikaraka', 'Mother, home, emotional security'], ['Putrakaraka', 'Children, creativity, intelligence'], ['Gnatikaraka', 'Obstacles, rivals, disease'], ['Darakaraka', 'Spouse and partnerships']];
  function charaKarakas(ch) {
    return SEVEN.map((p) => ({ p, d: ch.planets[p].deg })).sort((a, b) => b.d - a.d).map((x, i) => ({ planet: x.p, deg: x.d, karaka: KARAKA[i][0], meaning: KARAKA[i][1] }));
  }

  /* ---------- Vedic drishti ---------- */
  const SPECIAL = { Mars: [4, 8], Jupiter: [5, 9], Saturn: [3, 10], Rahu: [5, 9], Ketu: [5, 9] };
  function aspects(ch) {
    const byHouse = {}; for (let h = 1; h <= 12; h++) byHouse[h] = [];
    const byPlanet = {};
    for (const p of D.PLANET_ORDER) {
      const h = ch.planets[p].house, offs = [7].concat(SPECIAL[p] || []);
      const hs = offs.map((o) => ((h + o - 2) % 12) + 1);
      byPlanet[p] = { houses: hs, planets: D.PLANET_ORDER.filter((q) => q !== p && hs.includes(ch.planets[q].house)) };
      hs.forEach((x) => byHouse[x].push(p));
    }
    return { byHouse, byPlanet };
  }

  /* ---------- Baladi avastha ---------- */
  const BALADI = [['Bala', 'infant', 25], ['Kumara', 'youth', 50], ['Yuva', 'adult', 100], ['Vriddha', 'old', 10], ['Mrita', 'dead', 0]];
  function avastha(lon) { const s = Math.floor(lon / 30), k = Math.min(4, Math.floor((lon % 30) / 6)), i = s % 2 === 0 ? k : 4 - k; return { name: BALADI[i][0], gloss: BALADI[i][1], pct: BALADI[i][2] }; }

  /* ---------- Yogini dasha ---------- */
  const YOGINI = [['Mangala', 'Moon', 1], ['Pingala', 'Sun', 2], ['Dhanya', 'Jupiter', 3], ['Bhramari', 'Mars', 4], ['Bhadrika', 'Mercury', 5], ['Ulka', 'Saturn', 6], ['Siddha', 'Venus', 7], ['Sankata', 'Rahu', 8]];
  function yogini(ch) {
    const NAK = 360 / 27, moon = ch.planets.Moon.lon, n = Math.floor(moon / NAK), frac = (moon - n * NAK) / NAK;
    const start = (n + 1 + 3) % 8 === 0 ? 7 : ((n + 1 + 3) % 8) - 1;
    let t = ch.jd - frac * YOGINI[start][2] * 365.25;
    const out = [];
    for (let k = 0; k < 32; k++) {
      const i = (start + k) % 8, len = YOGINI[i][2] * 365.25, md = { name: YOGINI[i][0], lord: YOGINI[i][1], years: YOGINI[i][2], start: t, end: t + len, sub: [] };
      let s2 = t; for (let j = 0; j < 8; j++) { const a = (i + j) % 8, l2 = (len * YOGINI[a][2]) / 36; md.sub.push({ name: YOGINI[a][0], lord: YOGINI[a][1], start: s2, end: s2 + l2 }); s2 += l2; }
      out.push(md); t += len; if (t > ch.jd + 110 * 365.25) break;
    }
    return { balance: { name: YOGINI[start][0], years: (1 - frac) * YOGINI[start][2] }, periods: out };
  }

  /* ---------- Sade Sati timeline ---------- */
  function sadeSatiTimeline(ch, years) {
    const out = []; let cur = null;
    const end = ch.jd + (years || 100) * 365.25;
    for (let j = ch.jd; j <= end; j += 5) {
      const sat = Math.floor(A.siderealAll(j).Saturn / 30), h = ((sat - ch.moonSign + 12) % 12) + 1;
      const phase = h === 12 ? 'Rising' : h === 1 ? 'Peak' : h === 2 ? 'Setting' : h === 4 ? 'Kantaka (Dhaiya)' : h === 8 ? 'Ashtama (Dhaiya)' : null;
      if (phase !== (cur && cur.phase)) { if (cur) { cur.end = j; out.push(cur); } cur = phase ? { phase, start: j } : null; }
    }
    if (cur) { cur.end = end; out.push(cur); }
    // merge rising/peak/setting into Sade Sati spans
    const spans = []; let sp = null;
    out.forEach((x) => { const isSS = ['Rising', 'Peak', 'Setting'].includes(x.phase); if (isSS) { if (sp && x.start - sp.end < 40) { sp.end = x.end; sp.parts.push(x); } else { sp = { kind: 'Sade Sati', start: x.start, end: x.end, parts: [x] }; spans.push(sp); } } else spans.push({ kind: x.phase, start: x.start, end: x.end, parts: [x] }); });
    return spans;
  }

  /* ---------- Mangal dosha in depth ---------- */
  const MH = [1, 2, 4, 7, 8, 12];
  function mangal(ch) {
    const P = ch.planets, mars = P.Mars, from = (ref) => ((mars.sign - ref + 12) % 12) + 1;
    const refs = [['Lagna', ch.lagna], ['Moon', P.Moon.sign], ['Venus', P.Venus.sign]].map(([n, r]) => ({ n, h: from(r), hit: MH.includes(from(r)) }));
    const hits = refs.filter((r) => r.hit);
    const cancel = [];
    if ([0, 7].includes(mars.sign)) cancel.push('Mars is in its own sign (' + D.SIGNS[mars.sign].en + ')');
    if (mars.sign === 9) cancel.push('Mars is exalted in Capricorn');
    const hL = mars.house, sg = mars.sign;
    if ((hL === 2 && [2, 5].includes(sg)) || (hL === 4 && [0, 7].includes(sg)) || (hL === 7 && [3, 9].includes(sg)) || (hL === 8 && [8, 11].includes(sg)) || (hL === 12 && [1, 6].includes(sg))) cancel.push('Mars in house ' + hL + ' in ' + D.SIGNS[sg].en + ' is a classical exception');
    const jm = ((mars.sign - P.Jupiter.sign + 12) % 12) + 1;
    if (jm === 1) cancel.push('Jupiter is with Mars'); else if ([5, 7, 9].includes(jm)) cancel.push('Jupiter aspects Mars');
    if ([3, 4].includes(ch.lagna)) cancel.push('Mars is a yogakaraka for ' + D.SIGNS[ch.lagna].en + ' lagna');
    if (P.Mars.sign === P.Moon.sign) cancel.push('Mars is with the Moon (Chandra-Mangal)');
    const present = hits.length > 0, cancelled = present && cancel.length > 0;
    const level = !present ? 'none' : cancelled ? 'cancelled' : hits.length >= 2 ? 'strong' : 'mild';
    return { refs, hits, cancel, present, cancelled, level, effective: present && !cancelled };
  }
  function malefics(ch) { // for dosha samya: Saturn, Rahu, Ketu, Mars in Manglik houses from lagna or Moon
    const out = [];
    ['Saturn', 'Rahu', 'Ketu', 'Mars'].forEach((p) => { const q = ch.planets[p], hl = q.house, hm = ((q.sign - ch.moonSign + 12) % 12) + 1; if (MH.includes(hl) || MH.includes(hm)) out.push(p); });
    return out;
  }
  function mangalMatch(cb, cg) {
    const a = mangal(cb), b = mangal(cg);
    let verdict, level;
    if (a.effective === b.effective) { verdict = a.effective ? 'Both are Manglik, so the dosha balances out (dosha samya).' : 'Neither has an active Mangal dosha.'; level = 'good'; }
    else {
      const other = a.effective ? cg : cb, bal = malefics(other);
      if (bal.filter((x) => x !== 'Mars').length >= 1) { verdict = 'Only one is Manglik, but the other chart has ' + bal.join(', ') + ' in Manglik houses, which balances it (dosha samya).'; level = 'ok'; }
      else { verdict = 'Only one partner has an active Mangal dosha and it is not balanced in the other chart. Traditionally remedies (Mangal shanti, Kumbh vivah) are advised before marriage.'; level = 'bad'; }
    }
    return { boy: a, girl: b, verdict, level };
  }

  /* ---------- extra yogas ---------- */
  function extraYogas(ch) {
    const P = ch.planets, L = ch.lagna, res = [];
    const lordOf = (h) => D.SIGNS[(L + h - 1) % 12].lord;
    const strong = (p) => ['Exalted', 'Own sign'].includes(P[p].dignity);
    // Parivartana
    const seen = new Set();
    SEVEN.forEach((a) => SEVEN.forEach((b) => { if (a < b && D.SIGNS[P[a].sign].lord === b && D.SIGNS[P[b].sign].lord === a) { const k = a + '-' + b; if (!seen.has(k)) { seen.add(k); res.push({ name: 'Parivartana Yoga (' + a + ' ↔ ' + b + ')', present: true, kind: 'good', why: a + ' and ' + b + ' sit in each other’s signs (houses ' + P[a].house + ' and ' + P[b].house + '): the two houses support each other strongly.' }); } } }));
    const l9 = lordOf(9), l1 = lordOf(1);
    const lak = P[l9] && strong(l9) && [1, 4, 5, 7, 9, 10].includes(P[l9].house) && P[l1] && !['Debilitated'].includes(P[l1].dignity);
    res.push({ name: 'Lakshmi Yoga', present: !!lak, kind: 'good', why: lak ? '9th lord ' + l9 + ' is strong in a kendra or trikona with a healthy lagna lord: wealth, grace and good fortune.' : 'Needs a strong 9th lord in a kendra or trikona.' });
    const good = [1, 2, 4, 5, 7, 9, 10];
    const sar = ['Jupiter', 'Venus', 'Mercury'].every((p) => good.includes(P[p].house)) && !['Debilitated', 'Enemy'].includes(P.Jupiter.dignity);
    res.push({ name: 'Saraswati Yoga', present: sar, kind: 'good', why: sar ? 'Jupiter, Venus and Mercury are all in kendras, trikonas or the 2nd: learning, eloquence and the arts.' : 'Needs Jupiter, Venus and Mercury in kendras, trikonas or the 2nd house.' });
    const mj = ((P.Moon.sign - P.Jupiter.sign + 12) % 12) + 1, shak = [6, 8, 12].includes(mj) && ![1, 4, 7, 10].includes(P.Moon.house);
    res.push({ name: 'Shakata Yoga', present: shak, kind: 'bad', why: shak ? 'The Moon is ' + mj + ' from Jupiter: fortunes rise and fall like a cart wheel; steady effort brings stability.' : 'The Moon is not in the 6th, 8th or 12th from Jupiter (or is protected in a kendra).' });
    return res;
  }

  /* ---------- South Indian 10 porutham ---------- */
  const RAJJU = ['Pada (feet)', 'Kati (waist)', 'Nabhi (navel)', 'Kantha (neck)', 'Shiro (head)'];
  const RAJJU_OF = (n) => [0, 1, 2, 3, 4, 3, 2, 1, 0][n % 9];
  const VEDHA = [[0, 17], [1, 16], [2, 15], [3, 14], [5, 21], [6, 20], [7, 19], [8, 18], [9, 26], [10, 25], [11, 24], [12, 23], [4, 13], [4, 22], [13, 22]];
  function porutham(cb, cg) {
    const bn = cb.moonNak, gn = cg.moonNak, cnt = ((bn - gn + 27) % 27) + 1; // count from bride's star to groom's
    const bs = cb.moonSign, gs = cg.moonSign, rd = ((bs - gs + 12) % 12) + 1;
    const lb = D.SIGNS[bs].lord, lg = D.SIGNS[gs].lord, P = D.PLANETS;
    const relq = (a, b) => (a === b || P[a].friends.includes(b) ? 'f' : P[a].enemies.includes(b) ? 'e' : 'n');
    const GANA = 'DMRMDMDDRRMMDRDRDRRMMDRRMMD';
    const rows = [
      ['Dina', [2, 4, 6, 8, 9, 11, 13, 15, 18, 20, 24, 26].includes(cnt), 'Daily harmony and health (count ' + cnt + ' from the bride’s star)'],
      ['Gana', GANA[bn] === GANA[gn] || (GANA[bn] === 'D' && GANA[gn] === 'M') || (GANA[bn] === 'M' && GANA[gn] === 'D'), 'Temperament'],
      ['Mahendra', [4, 7, 10, 13, 16, 19, 22, 25].includes(cnt), 'Prosperity and children'],
      ['Stree Deergha', cnt > 13, 'Long, happy married life for the bride (count over 13)'],
      ['Yoni', null, 'Physical compatibility'],
      ['Rasi', ![2, 6, 8, 12].includes(rd) || (bs === gs && bn !== gn), 'Family growth (signs ' + rd + ' apart)'],
      ['Rasi Adhipati', relq(lb, lg) !== 'e' && relq(lg, lb) !== 'e', 'Friendship of Moon-sign lords (' + lb + ' / ' + lg + ')'],
      ['Vashya', null, 'Mutual attraction'],
      ['Rajju', RAJJU_OF(bn) !== RAJJU_OF(gn), 'Longevity of the husband; most important (' + RAJJU[RAJJU_OF(bn)] + ' / ' + RAJJU[RAJJU_OF(gn)] + ')'],
      ['Vedha', !VEDHA.some(([x, y]) => (x === bn && y === gn) || (x === gn && y === bn)), 'No mutually afflicting stars'],
    ];
    const m = D.kundli.milan(cb, cg);
    rows[4][1] = m.rows[3][2] >= 2; rows[7][1] = m.rows[1][2] >= 1;
    return { rows, count: rows.filter((r) => r[1]).length, rajjuOk: rows[8][1], vedhaOk: rows[9][1] };
  }

  /* ---------- overall marriage verdict ---------- */
  function verdict(cb, cg) {
    const m = D.kundli.milan(cb, cg), mm = mangalMatch(cb, cg), po = porutham(cb, cg);
    const issues = [], strengths = [];
    if (m.total >= 28) strengths.push('Very high guna score (' + m.total + '/36)'); else if (m.total >= 18) strengths.push('Acceptable guna score (' + m.total + '/36)'); else issues.push('Guna score is below 18 (' + m.total + '/36)');
    if (m.rows[7][2] === 0 && !m.cancel.nadi) issues.push('Nadi dosha (not cancelled)'); else if (m.rows[7][2] === 0) strengths.push('Nadi dosha is cancelled');
    if (m.rows[6][2] === 0 && !m.cancel.bhakoot) issues.push('Bhakoot dosha (not cancelled)'); else if (m.rows[6][2] === 0) strengths.push('Bhakoot dosha is cancelled');
    if (mm.level === 'bad') issues.push('Unbalanced Mangal dosha'); else strengths.push(mm.level === 'good' ? 'Mangal dosha is balanced' : 'Mangal dosha balanced by the other chart');
    if (!po.rajjuOk) issues.push('Rajju dosha (same rajju)'); if (!po.vedhaOk) issues.push('Vedha dosha');
    strengths.push(po.count + ' of 10 poruthams agree');
    const level = issues.length === 0 ? 'great' : issues.length === 1 && m.total >= 18 ? 'good' : issues.length <= 2 && m.total >= 18 ? 'ok' : 'bad';
    const text = { great: 'Highly recommended match', good: 'Good match with one point to review', ok: 'Workable match; review the flagged points with an astrologer', bad: 'Not recommended without remedies and expert review' }[level];
    return { m, mm, po, issues, strengths, level, text };
  }

  D.j2 = { VARGAS, varga, vargaChart, charaKarakas, aspects, avastha, yogini, sadeSatiTimeline, mangal, mangalMatch, extraYogas, porutham, verdict, RAJJU };
})(typeof window !== 'undefined' ? window : globalThis);
