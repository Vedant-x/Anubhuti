/* Anubhuti — astronomy and Jyotish calculations. Runs fully in the browser.
   Planets: JPL Keplerian elements (1800–2050). Moon: main terms of Meeus ch. 47.
   Sidereal positions use the Lahiri (Chitrapaksha) ayanamsa; nodes are mean nodes. */
(function (G) {
  const D = (G.Disha = G.Disha || {});
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const norm = (a) => ((a % 360) + 360) % 360;
  const sin = (d) => Math.sin(d * D2R), cos = (d) => Math.cos(d * D2R);

  /* ---------- time ---------- */
  function jdUTC(y, m, d, hours) {
    if (m <= 2) { y -= 1; m += 12; }
    const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5 + hours / 24;
  }
  function jdLocal(dateStr, timeStr, tz) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const [hh, mm, ss] = (timeStr || '00:00').split(':').map(Number);
    return jdUTC(y, m, d, hh + (mm || 0) / 60 + (ss || 0) / 3600 - tz);
  }
  /* ΔT = TT − UT in seconds (Espenak & Meeus; recent years from observed values) */
  function deltaT(jd) {
    const y = 2000 + (jd - 2451545) / 365.25;
    let t;
    if (y >= 2015 && y < 2050) return 67.6 + (Math.min(y, 2025) - 2015) * 0.16 + Math.max(0, y - 2025) * 0.1;
    if (y >= 2005 && y < 2015) { t = y - 2005; return 64.7 + t * 0.29; }
    if (y >= 1986 && y < 2005) { t = y - 2000; return 63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t ** 3 + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5; }
    if (y >= 1961 && y < 1986) { t = y - 1975; return 45.45 + 1.067 * t - t * t / 260 - t ** 3 / 718; }
    if (y >= 1941 && y < 1961) { t = y - 1950; return 29.07 + 0.407 * t - t * t / 233 + t ** 3 / 2547; }
    if (y >= 1920 && y < 1941) { t = y - 1920; return 21.2 + 0.84493 * t - 0.0761 * t * t + 0.0020936 * t ** 3; }
    if (y >= 1900 && y < 1920) { t = y - 1900; return -2.79 + 1.494119 * t - 0.0598939 * t * t + 0.0061966 * t ** 3 - 0.000197 * t ** 4; }
    if (y >= 1860 && y < 1900) { t = y - 1860; return 7.62 + 0.5737 * t - 0.251754 * t * t + 0.01680668 * t ** 3 - 0.0004473624 * t ** 4 + t ** 5 / 233174; }
    if (y >= 1800 && y < 1860) { t = y - 1800; return 13.72 - 0.332447 * t + 0.0068612 * t * t + 0.0041116 * t ** 3 - 0.00037436 * t ** 4 + 0.0000121272 * t ** 5 - 0.0000001699 * t ** 6 + 0.000000000875 * t ** 7; }
    if (y >= 2050) { const u = (y - 1820) / 100; return -20 + 32 * u * u - 0.5628 * (2150 - y); }
    const u = (y - 1820) / 100; return -20 + 32 * u * u;
  }
  const tt = (jd) => jd + deltaT(jd) / 86400;
  function jdToLocal(jd, tz) {
    const ms = (jd - 2440587.5) * 86400000 + tz * 3600000;
    const t = new Date(ms);
    return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), h: t.getUTCHours(), mi: t.getUTCMinutes(), wd: t.getUTCDay(), date: t };
  }
  const pad = (n) => String(n).padStart(2, '0');
  function fmtTime(jd, tz, opts) {
    if (jd == null || !isFinite(jd)) return '—';
    const t = jdToLocal(jd + 30 / 86400, tz); // round to nearest minute
    const h12 = opts && opts.h24 ? null : ((t.h + 11) % 12) + 1;
    return h12 == null ? pad(t.h) + ':' + pad(t.mi) : h12 + ':' + pad(t.mi) + (t.h < 12 ? ' am' : ' pm');
  }
  function fmtDate(jd, tz) {
    const t = jdToLocal(jd, tz);
    return t.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  }
  const T = (jd) => (jd - 2451545.0) / 36525;

  /* ---------- ayanamsa & precession ---------- */
  const precession = (t) => 1.396971 * t + 0.0003086 * t * t;
  const pA = (t) => (5029.0966 * t + 1.11113 * t * t - 0.000006 * t * t * t) / 3600;
  const LAHIRI_T0 = (2435553.5 - 2451545) / 36525, LAHIRI_A0 = 23.250182778 - 0.004658035;
  /* Lahiri (Chitrapaksha) ayanamsa for a JD in UT */
  const ayanamsa = (jd) => LAHIRI_A0 + pA(T(tt(jd))) - pA(LAHIRI_T0);

  /* ---------- planets (heliocentric, J2000 ecliptic) ---------- */
  const EL = {
    Mercury: [0.38709927, 0.20563593, 7.00497902, 252.2503235, 77.45779628, 48.33076593, 0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081],
    Venus: [0.72333566, 0.00677672, 3.39467605, 181.9790995, 131.60246718, 76.67984255, 0.0000039, -0.00004107, -0.0007889, 58517.81538729, 0.00268329, -0.27769418],
    EM: [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0, 0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0],
    Mars: [1.52371034, 0.0933941, 1.84969142, -4.55343205, -23.94362959, 49.55953891, 0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343],
    Jupiter: [5.202887, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909, -0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106],
    Saturn: [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448, -0.0012506, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794],
  };
  function helio(name, t) {
    const e = EL[name];
    const a = e[0] + e[6] * t, ecc = e[1] + e[7] * t, I = e[2] + e[8] * t, L = e[3] + e[9] * t, wb = e[4] + e[10] * t, node = e[5] + e[11] * t;
    const w = wb - node;
    let M = norm(L - wb) * D2R; if (M > Math.PI) M -= 2 * Math.PI;
    let E = M + ecc * Math.sin(M);
    for (let i = 0; i < 12; i++) E -= (E - ecc * Math.sin(E) - M) / (1 - ecc * Math.cos(E));
    const xp = a * (Math.cos(E) - ecc), yp = a * Math.sqrt(1 - ecc * ecc) * Math.sin(E);
    const cw = cos(w), sw = sin(w), cO = cos(node), sO = sin(node), cI = cos(I), sI = sin(I);
    return [
      (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp,
      (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp,
      sw * sI * xp + cw * sI * yp,
    ];
  }
  /* tropical longitude of date */
  function geoLon(name, jd) {
    const t = T(tt(jd)), earth = helio('EM', t);
    if (name === 'Sun') return norm(Math.atan2(-earth[1], -earth[0]) * R2D + precession(t));
    const p = helio(name, t);
    return norm(Math.atan2(p[1] - earth[1], p[0] - earth[0]) * R2D + precession(t));
  }
  const MOON_TERMS = [
    [0, 0, 1, 0, 6288774], [2, 0, -1, 0, 1274027], [2, 0, 0, 0, 658314], [0, 0, 2, 0, 213618], [0, 1, 0, 0, -185116], [0, 0, 0, 2, -114332],
    [2, 0, -2, 0, 58793], [2, -1, -1, 0, 57066], [2, 0, 1, 0, 53322], [2, -1, 0, 0, 45758], [0, 1, -1, 0, -40923], [1, 0, 0, 0, -34720],
    [0, 1, 1, 0, -30383], [2, 0, 0, -2, 15327], [0, 0, 1, 2, -12528], [0, 0, 1, -2, 10980], [4, 0, -1, 0, 10675], [0, 0, 3, 0, 10034],
    [4, 0, -2, 0, 8548], [2, 1, -1, 0, -7888], [2, 1, 0, 0, -6766], [1, 0, -1, 0, -5163], [1, 1, 0, 0, 4987], [2, -1, 1, 0, 4036],
    [2, 0, 2, 0, 3994], [4, 0, 0, 0, 3861], [2, 0, -3, 0, 3665], [0, 1, -2, 0, -2689], [2, 0, -1, 2, -2602], [2, -1, -2, 0, 2390],
    [1, 0, 1, 0, -2348], [2, -2, 0, 0, 2236], [0, 1, 2, 0, -2120], [0, 2, 0, 0, -2069], [2, -2, -1, 0, 2048], [2, 0, 1, -2, -1773],
    [2, 0, 0, 2, -1595], [4, -1, -1, 0, 1215], [0, 0, 2, 2, -1110], [3, 0, -1, 0, -892], [2, 1, 1, 0, -810], [4, -1, -2, 0, 759],
    [0, 2, -1, 0, -713], [2, 2, -1, 0, -700], [2, 1, -2, 0, 691], [2, -1, 0, -2, 596], [4, 0, 1, 0, 549], [0, 0, 4, 0, 537],
  ];
  function moonLon(jd) {
    const t = T(tt(jd));
    const Lp = 218.3164477 + 481267.88123421 * t - 0.0015786 * t * t;
    const Dm = 297.8501921 + 445267.1114034 * t - 0.0018819 * t * t;
    const M = 357.5291092 + 35999.0502909 * t - 0.0001536 * t * t;
    const Mp = 134.9633964 + 477198.8675055 * t + 0.0087414 * t * t;
    const F = 93.272095 + 483202.0175233 * t - 0.0036539 * t * t;
    const E = 1 - 0.002516 * t - 0.0000074 * t * t;
    const A1 = 119.75 + 131.849 * t, A2 = 53.09 + 479264.29 * t;
    let s = 0;
    for (const [d, m, mp, f, c] of MOON_TERMS) {
      let k = c; if (Math.abs(m) === 1) k *= E; else if (Math.abs(m) === 2) k *= E * E;
      s += k * sin(d * Dm + m * M + mp * Mp + f * F);
    }
    s += 3958 * sin(A1) + 1962 * sin(Lp - F) + 318 * sin(A2);
    return norm(Lp + s / 1e6);
  }
  const meanNode = (jd) => { const t = T(tt(jd)); return norm(125.0445479 - 1934.1362891 * t + 0.0020754 * t * t); };
  function trueNode(jd) {
    const t = T(tt(jd));
    const Dm = 297.8501921 + 445267.1114034 * t, M = 357.5291092 + 35999.0502909 * t, Mp = 134.9633964 + 477198.8675055 * t, F = 93.272095 + 483202.0175233 * t;
    return norm(meanNode(jd) - 1.4979 * sin(2 * (Dm - F)) - 0.15 * sin(M) - 0.1226 * sin(2 * Dm) + 0.1176 * sin(2 * F) - 0.0801 * sin(2 * (Mp - F)));
  }
  let NODE_MODE = 'mean';
  const nodeLon = (jd) => (NODE_MODE === 'true' ? trueNode(jd) : meanNode(jd));
  const obliquity = (jd) => 23.4392911 - 0.0130042 * T(jd);
  function lst(jd, lon) {
    const t = T(jd);
    return norm(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * t * t + lon);
  }
  function ascendantTrop(jd, lat, lon) {
    const r = lst(jd, lon), e = obliquity(jd);
    return norm(Math.atan2(cos(r), -(sin(r) * cos(e) + Math.tan(lat * D2R) * sin(e))) * R2D);
  }

  /* sidereal longitudes of all grahas */
  function siderealAll(jd) {
    const ay = ayanamsa(jd), out = {};
    for (const p of ['Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']) out[p] = norm(geoLon(p, jd) - ay);
    out.Moon = norm(moonLon(jd) - ay);
    out.Rahu = norm(nodeLon(jd) - ay);
    out.Ketu = norm(out.Rahu + 180);
    return out;
  }
  const sunSid = (jd) => norm(geoLon('Sun', jd) - ayanamsa(jd));
  const moonSid = (jd) => norm(moonLon(jd) - ayanamsa(jd));

  /* ---------- sunrise / sunset ---------- */
  function sunAlt(jd, lat, lon) {
    const lam = geoLon('Sun', jd), e = obliquity(jd);
    const dec = Math.asin(sin(e) * sin(lam)) * R2D;
    const ra = norm(Math.atan2(cos(e) * sin(lam), cos(lam)) * R2D);
    const H = lst(jd, lon) - ra;
    return Math.asin(sin(lat) * sin(dec) + cos(lat) * cos(dec) * cos(H)) * R2D;
  }
  function crossing(f, a, b, rising) {
    let fa = f(a);
    for (let i = 0; i < 40; i++) {
      const m = (a + b) / 2, fm = f(m);
      if ((fm > 0) === (fa > 0)) { a = m; fa = fm; } else b = m;
    }
    return (a + b) / 2;
  }
  /* sunrise/sunset for a local calendar date (YYYY-MM-DD) */
  function sunTimes(dateStr, place) {
    const j0 = jdLocal(dateStr, '00:00', place.tz);
    const f = (j) => sunAlt(j, place.lat, place.lon) + 0.833;
    let rise = null, set = null, prev = f(j0);
    const step = 1 / 96;
    for (let j = j0 + step; j <= j0 + 1 + 1e-9; j += step) {
      const v = f(j);
      if (rise == null && prev < 0 && v >= 0) rise = crossing(f, j - step, j, true);
      if (set == null && prev > 0 && v <= 0) set = crossing(f, j - step, j, false);
      prev = v;
    }
    return { rise, set, dayStart: j0 };
  }

  /* ---------- panchang ---------- */
  const NAK = 360 / 27;
  function tithiIndex(jd) { return Math.floor(norm(moonSid(jd) - sunSid(jd)) / 12); }
  function nakIndex(jd) { return Math.floor(moonSid(jd) / NAK); }
  function yogaIndex(jd) { return Math.floor(norm(moonSid(jd) + sunSid(jd)) / NAK); }
  function karanaIndex(jd) { return Math.floor(norm(moonSid(jd) - sunSid(jd)) / 6); }
  function karanaName(k) {
    if (k === 0) return 'Kimstughna';
    if (k >= 57) return ['Shakuni', 'Chatushpada', 'Naga'][k - 57];
    return D.KARANAS_MOV[(k - 1) % 7];
  }
  function nextChange(fn, jd, maxHours) {
    const cur = fn(jd), step = 1 / 24;
    for (let j = jd + step; j < jd + (maxHours || 36) / 24; j += step) {
      if (fn(j) !== cur) {
        let a = j - step, b = j;
        for (let i = 0; i < 30; i++) { const m = (a + b) / 2; if (fn(m) === cur) a = m; else b = m; }
        return b;
      }
    }
    return null;
  }
  function prevChange(fn, jd, maxHours) {
    const cur = fn(jd), step = 1 / 24;
    for (let j = jd - step; j > jd - (maxHours || 36) / 24; j -= step) {
      if (fn(j) !== cur) {
        let a = j, b = j + step;
        for (let i = 0; i < 30; i++) { const m = (a + b) / 2; if (fn(m) === cur) b = m; else a = m; }
        return b;
      }
    }
    return null;
  }
  function tithiName(i) { return (i < 15 ? 'Shukla ' : 'Krishna ') + (i === 29 ? 'Amavasya' : D.TITHIS[i % 15]); }
  /* lunar month (amanta) at jd: from the Sun's sign at the preceding new moon */
  function lunarMonth(jd) {
    const el = (j) => norm(moonSid(j) - sunSid(j));
    let j = jd - el(jd) / 12.19; // approx days since new moon
    for (let i = 0; i < 6; i++) { let e = el(j); if (e > 180) e -= 360; j -= e / 12.19; }
    const sign = Math.floor(sunSid(j) / 30);
    return { name: D.MONTHS[(sign + 1) % 12], newMoon: j };
  }

  function panchang(dateStr, place, atJd) {
    const st = sunTimes(dateStr, place);
    const ref = atJd != null ? atJd : st.rise != null ? st.rise : jdLocal(dateStr, '06:00', place.tz);
    const ti = tithiIndex(ref), ni = nakIndex(ref), yi = yogaIndex(ref), ki = karanaIndex(ref);
    const wd = jdToLocal(st.rise != null ? st.rise : ref, place.tz).wd;
    const sun = sunSid(ref), moon = moonSid(ref);
    const nextDay = addDays(dateStr, 1);
    const st2 = sunTimes(nextDay, place);
    return {
      date: dateStr, place, ref, rise: st.rise, set: st.set, nextRise: st2.rise,
      vara: { index: wd, name: D.VARAS[wd][0], sa: D.VARAS[wd][1], lord: D.VARAS[wd][2] },
      tithi: { index: ti, name: tithiName(ti), paksha: ti < 15 ? 'Shukla' : 'Krishna', ends: nextChange(tithiIndex, ref, 30) },
      nakshatra: { index: ni, name: D.NAKSHATRAS[ni].name, lord: D.NAKSHATRAS[ni].lord, pada: Math.floor((moon % NAK) / (NAK / 4)) + 1, ends: nextChange(nakIndex, ref, 30) },
      yoga: { index: yi, name: D.YOGAS[yi], bad: D.BAD_YOGAS.includes(yi), ends: nextChange(yogaIndex, ref, 30) },
      karana: { index: ki, name: karanaName(ki), ends: nextChange(karanaIndex, ref, 18) },
      sunSign: Math.floor(sun / 30), moonSign: Math.floor(moon / 30), sun, moon,
      month: lunarMonth(ref).name,
      periods: dayPeriods(st.rise, st.set, st2.rise, wd),
    };
  }

  const RAHU = [8, 2, 7, 5, 6, 4, 3], YAMA = [5, 4, 3, 2, 1, 7, 6], GULIKA = [7, 6, 5, 4, 3, 2, 1];
  const CHOG = ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'];
  const CHOG_Q = { Udveg: 'bad', Char: 'ok', Labh: 'good', Amrit: 'good', Kaal: 'bad', Shubh: 'good', Rog: 'bad' };
  const CHOG_DAY_START = [0, 3, 6, 2, 5, 1, 4]; // index into CHOG for Sun..Sat
  const CHOG_NIGHT_START = ['Shubh', 'Char', 'Kaal', 'Udveg', 'Amrit', 'Rog', 'Labh'];
  const HORA_SEQ = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];
  const VARA_LORD_IDX = [0, 3, 6, 2, 5, 1, 4]; // weekday lord position in HORA_SEQ
  function dayPeriods(rise, set, nextRise, wd) {
    if (rise == null || set == null) return null;
    const day = set - rise, part = day / 8, night = (nextRise || rise + 1) - set;
    const seg = (n) => ({ start: rise + (n - 1) * part, end: rise + n * part });
    const mu = day / 15;
    const chogDay = [], chogNight = [];
    for (let i = 0; i < 8; i++) {
      const nm = CHOG[(CHOG_DAY_START[wd] + i) % 7];
      chogDay.push({ name: nm, q: CHOG_Q[nm], start: rise + i * part, end: rise + (i + 1) * part });
    }
    let ni = CHOG.indexOf(CHOG_NIGHT_START[wd]);
    for (let i = 0; i < 8; i++) {
      const nm = CHOG[ni];
      chogNight.push({ name: nm, q: CHOG_Q[nm], start: set + (i * night) / 8, end: set + ((i + 1) * night) / 8 });
      ni = (ni + 5) % 7;
    }
    const horas = [];
    let hi = VARA_LORD_IDX[wd];
    for (let i = 0; i < 24; i++) {
      const isDay = i < 12, len = isDay ? day / 12 : night / 12, base = isDay ? rise : set, k = isDay ? i : i - 12;
      horas.push({ lord: HORA_SEQ[hi], start: base + k * len, end: base + (k + 1) * len, day: isDay });
      hi = (hi + 1) % 7;
    }
    return {
      rahu: seg(RAHU[wd]), yamaganda: seg(YAMA[wd]), gulika: seg(GULIKA[wd]),
      abhijit: { start: rise + 7 * mu, end: rise + 8 * mu, wednesday: wd === 3 },
      brahma: { start: rise - (2 * night) / 15, end: rise - night / 15 },
      chogDay, chogNight, horas,
    };
  }

  function addDays(dateStr, n) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const t = new Date(Date.UTC(y, m - 1, d + n));
    return t.getUTCFullYear() + '-' + pad(t.getUTCMonth() + 1) + '-' + pad(t.getUTCDate());
  }

  /* ---------- birth chart ---------- */
  function dignity(planet, sign) {
    const P = D.PLANETS[planet];
    if (!P) return '';
    if (planet !== 'Rahu' && planet !== 'Ketu') {
      if (P.exalt === sign) return 'Exalted';
      if ((P.exalt + 6) % 12 === sign) return 'Debilitated';
      if (P.own.includes(sign)) return 'Own sign';
    }
    const lord = D.SIGNS[sign].lord;
    if (lord === planet) return 'Own sign';
    if (P.friends.includes(lord)) return 'Friendly';
    if (P.enemies.includes(lord)) return 'Enemy';
    return 'Neutral';
  }
  const DASHA_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  const DASHA_YRS = [7, 20, 6, 10, 7, 18, 16, 19, 17];
  const YEAR = 365.25;
  function kpLords(lon) {
    const n = Math.floor(lon / NAK), within = lon - n * NAK;
    const li = n % 9; let acc = 0, sub = null, subsub = null;
    for (let k = 0; k < 9; k++) {
      const idx = (li + k) % 9, span = (NAK * DASHA_YRS[idx]) / 120;
      if (within < acc + span) {
        sub = DASHA_LORDS[idx];
        let acc2 = acc;
        for (let q = 0; q < 9; q++) {
          const id2 = (idx + q) % 9, span2 = (span * DASHA_YRS[id2]) / 120;
          if (within < acc2 + span2) { subsub = DASHA_LORDS[id2]; break; }
          acc2 += span2;
        }
        break;
      }
      acc += span;
    }
    return { sign: D.SIGNS[Math.floor(lon / 30)].lord, star: DASHA_LORDS[li], sub, subsub };
  }
  function vimshottari(moonLon, birthJd) {
    const n = Math.floor(moonLon / NAK), frac = (moonLon - n * NAK) / NAK, li = n % 9;
    let start = birthJd - frac * DASHA_YRS[li] * YEAR;
    const out = [];
    for (let k = 0; k < 10; k++) {
      const i = (li + k) % 9, len = DASHA_YRS[i] * YEAR;
      const md = { lord: DASHA_LORDS[i], start, end: start + len, sub: [] };
      let s2 = start;
      for (let j = 0; j < 9; j++) {
        const a = (i + j) % 9, l2 = (len * DASHA_YRS[a]) / 120;
        const ad = { lord: DASHA_LORDS[a], start: s2, end: s2 + l2, sub: [] };
        let s3 = s2;
        for (let q = 0; q < 9; q++) {
          const b = (a + q) % 9, l3 = (l2 * DASHA_YRS[b]) / 120;
          ad.sub.push({ lord: DASHA_LORDS[b], start: s3, end: s3 + l3 });
          s3 += l3;
        }
        md.sub.push(ad); s2 += l2;
      }
      out.push(md); start += len;
    }
    return { balance: { lord: DASHA_LORDS[li], years: (1 - frac) * DASHA_YRS[li] }, periods: out };
  }
  function currentDasha(v, jd) {
    for (const md of v.periods) if (jd >= md.start && jd < md.end) {
      for (const ad of md.sub) if (jd >= ad.start && jd < ad.end) {
        for (const pd of ad.sub) if (jd >= pd.start && jd < pd.end) return { md, ad, pd };
        return { md, ad };
      }
      return { md };
    }
    return null;
  }

  function chart(profile) { return chartAt(jdLocal(profile.dob, profile.tob || '12:00', profile.place.tz), profile.place); }
  function chartAt(jd, place) {
    const profile = { place };
    const sid = siderealAll(jd), sid2 = siderealAll(jd + 0.5);
    const ay = ayanamsa(jd);
    const asc = norm(ascendantTrop(jd, profile.place.lat, profile.place.lon) - ay);
    const lagna = Math.floor(asc / 30);
    const planets = {};
    for (const p of D.PLANET_ORDER) {
      const lon = sid[p], sign = Math.floor(lon / 30), nk = Math.floor(lon / NAK);
      let retro = false;
      if (p === 'Rahu' || p === 'Ketu') retro = true;
      else if (p !== 'Sun' && p !== 'Moon') { let dd = sid2[p] - lon; if (dd > 180) dd -= 360; if (dd < -180) dd += 360; retro = dd < 0; }
      planets[p] = {
        lon, sign, deg: lon % 30, house: ((sign - lagna + 12) % 12) + 1, retro,
        nak: nk, nakName: D.NAKSHATRAS[nk].name, pada: Math.floor((lon % NAK) / (NAK / 4)) + 1,
        navamsa: Math.floor((lon * 9) / 30) % 12, dignity: dignity(p, sign), kp: kpLords(lon),
      };
    }
    // combustion (approximate orbs)
    const ORB = { Moon: 12, Mars: 17, Mercury: 13, Jupiter: 11, Venus: 9, Saturn: 15 };
    for (const p in ORB) { let d = Math.abs(planets[p].lon - planets.Sun.lon); d = Math.min(d, 360 - d); planets[p].combust = d < ORB[p]; }
    const ch = {
      jd, ayanamsa: ay, asc, lagna, ascNak: Math.floor(asc / NAK), ascNavamsa: Math.floor((asc * 9) / 30) % 12, ascKp: kpLords(asc), planets,
      moonSign: planets.Moon.sign, moonNak: planets.Moon.nak, dasha: vimshottari(planets.Moon.lon, jd),
    };
    ch.yogas = yogas(ch);
    ch.cusps = placidus(jd, place.lat, place.lon);
    ch.kp = kpHouses(ch);
    ch.ashtaka = ashtakavarga(ch);
    ch.strength = strength(ch);
    return ch;
  }

  /* ---------- Placidus cusps (KP) ---------- */
  function placidus(jd, lat, lon) {
    const ramc = lst(jd, lon), e = obliquity(jd), ay = ayanamsa(jd);
    const toLam = (ra) => norm(Math.atan2(sin(ra), cos(ra) * cos(e)) * R2D);
    const cusp = (f, above, start) => {
      let ra = ramc + start, lam = 0;
      for (let i = 0; i < 40; i++) {
        lam = toLam(ra);
        const dec = Math.asin(sin(e) * sin(lam)) * R2D;
        const x = Math.max(-1, Math.min(1, Math.tan(lat * D2R) * Math.tan(dec * D2R)));
        const ad = Math.asin(x) * R2D;
        ra = above ? ramc + f * (90 + ad) : ramc + 180 - f * (90 - ad);
      }
      return toLam(ra);
    };
    const c = new Array(13);
    c[1] = ascendantTrop(jd, lat, lon); c[10] = toLam(ramc);
    c[11] = cusp(1 / 3, true, 30); c[12] = cusp(2 / 3, true, 60); c[2] = cusp(2 / 3, false, 120); c[3] = cusp(1 / 3, false, 150);
    c[4] = norm(c[10] + 180); c[5] = norm(c[11] + 180); c[6] = norm(c[12] + 180); c[7] = norm(c[1] + 180); c[8] = norm(c[2] + 180); c[9] = norm(c[3] + 180);
    return c.map((x) => (x == null ? null : norm(x - ay)));
  }
  function kpHouses(ch) {
    const C = ch.cusps, P = ch.planets, planets = D.PLANET_ORDER;
    const houseOf = (lon) => { for (let h = 1; h <= 12; h++) { const a = C[h], b = C[h === 12 ? 1 : h + 1], span = norm(b - a); if (norm(lon - a) < span) return h; } return 1; };
    const occ = {}; for (let h = 1; h <= 12; h++) occ[h] = [];
    const pHouse = {}; planets.forEach((p) => { const h = houseOf(P[p].lon); pHouse[p] = h; occ[h].push(p); });
    const starOf = (p) => P[p].kp.star;
    const houses = [];
    for (let h = 1; h <= 12; h++) {
      const owner = D.SIGNS[Math.floor(C[h] / 30)].lord;
      const L2 = occ[h], L1 = planets.filter((p) => L2.includes(starOf(p)));
      const L4 = [owner], L3 = planets.filter((p) => starOf(p) === owner);
      houses.push({ h, cusp: C[h], kp: kpLords(C[h]), owner, occupants: L2, L1, L2, L3, L4, all: Array.from(new Set(L1.concat(L2, L3, L4))) });
    }
    const sig = {}; planets.forEach((p) => { sig[p] = houses.filter((x) => x.all.includes(p)).map((x) => x.h); });
    return { houses, pHouse, sig };
  }
  const KP_EVENTS = [ // name, main cusp, supporting houses, denying houses
    ['Marriage', 7, [2, 7, 11], [1, 6, 10]], ['Job / career', 10, [2, 6, 10, 11], [5, 8, 12]], ['Business', 7, [7, 10, 11], [6, 8, 12]],
    ['Property / home', 4, [4, 11, 12], [3, 5, 10]], ['Vehicle', 4, [4, 11], [3, 8, 12]], ['Children', 5, [2, 5, 11], [1, 4, 10]], ['Higher education', 9, [4, 9, 11], [3, 8, 12]],
    ['Foreign travel / settling', 12, [3, 9, 12], [4, 11]], ['Health trouble', 6, [1, 6, 8, 12], [5, 11]], ['Wealth gains', 11, [2, 6, 11], [5, 8, 12]],
  ];
  function kpEvents(ch, jd) {
    const sig = ch.kp.sig, cd = currentDasha(ch.dasha, jd);
    const lords = cd ? Array.from(new Set([cd.md.lord, cd.ad.lord, cd.pd && cd.pd.lord].filter(Boolean))) : [];
    return KP_EVENTS.map(([name, cuspNo, pos, neg]) => {
      const sup = D.PLANET_ORDER.filter((p) => pos.filter((h) => sig[p].includes(h)).length >= 2);
      const active = lords.filter((l) => pos.filter((h) => sig[l].includes(h)).length >= 2);
      const csl = ch.kp.houses[cuspNo - 1].kp.sub, cslSig = sig[csl] || [];
      const posN = pos.filter((h) => cslSig.includes(h)).length, negN = neg.filter((h) => cslSig.includes(h)).length;
      const promise = posN >= 1 && posN > negN;
      return { name, cusp: cuspNo, houses: pos, against: neg, supporters: sup, active, csl, cslHouses: cslSig, promise };
    });
  }

  /* ---------- Ashtakavarga ---------- */
  const AV = { // contributor order: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Lagna
    Sun: [[1, 2, 4, 7, 8, 9, 10, 11], [3, 6, 10, 11], [1, 2, 4, 7, 8, 9, 10, 11], [3, 5, 6, 9, 10, 11, 12], [5, 6, 9, 11], [6, 7, 12], [1, 2, 4, 7, 8, 9, 10, 11], [3, 4, 6, 10, 11, 12]],
    Moon: [[3, 6, 7, 8, 10, 11], [1, 3, 6, 7, 10, 11], [2, 3, 5, 6, 9, 10, 11], [1, 3, 4, 5, 7, 8, 10, 11], [1, 4, 7, 8, 10, 11, 12], [3, 4, 5, 7, 9, 10, 11], [3, 5, 6, 11], [3, 6, 10, 11]],
    Mars: [[3, 5, 6, 10, 11], [3, 6, 11], [1, 2, 4, 7, 8, 10, 11], [3, 5, 6, 11], [6, 10, 11, 12], [6, 8, 11, 12], [1, 4, 7, 8, 9, 10, 11], [1, 3, 6, 10, 11]],
    Mercury: [[5, 6, 9, 11, 12], [2, 4, 6, 8, 10, 11], [1, 2, 4, 7, 8, 9, 10, 11], [1, 3, 5, 6, 9, 10, 11, 12], [6, 8, 11, 12], [1, 2, 3, 4, 5, 8, 9, 11], [1, 2, 4, 7, 8, 9, 10, 11], [1, 2, 4, 6, 8, 10, 11]],
    Jupiter: [[1, 2, 3, 4, 7, 8, 9, 10, 11], [2, 5, 7, 9, 11], [1, 2, 4, 7, 8, 10, 11], [1, 2, 4, 5, 6, 9, 10, 11], [1, 2, 3, 4, 7, 8, 10, 11], [2, 5, 6, 9, 10, 11], [3, 5, 6, 12], [1, 2, 4, 5, 6, 7, 9, 10, 11]],
    Venus: [[8, 11, 12], [1, 2, 3, 4, 5, 8, 9, 11, 12], [3, 5, 6, 9, 11, 12], [3, 5, 6, 9, 11], [5, 8, 9, 10, 11], [1, 2, 3, 4, 5, 8, 9, 10, 11], [3, 4, 5, 8, 9, 10, 11], [1, 2, 3, 4, 5, 8, 9, 11]],
    Saturn: [[1, 2, 4, 7, 8, 10, 11], [3, 6, 11], [3, 5, 6, 10, 11, 12], [6, 8, 9, 10, 11, 12], [5, 6, 11, 12], [6, 11, 12], [3, 5, 6, 11], [1, 3, 4, 6, 10, 11]],
  };
  function ashtakavarga(ch) {
    const P = ch.planets, refs = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].map((p) => P[p].sign).concat([ch.lagna]);
    const bav = {}, sav = new Array(12).fill(0);
    for (const pl in AV) {
      const row = new Array(12).fill(0);
      AV[pl].forEach((list, ci) => list.forEach((n) => { row[(refs[ci] + n - 1) % 12]++; }));
      bav[pl] = row; row.forEach((v, i) => (sav[i] += v));
    }
    return { bav, sav, total: sav.reduce((a, b) => a + b, 0) };
  }

  /* ---------- simplified planet strength (not full Shadbala) ---------- */
  function strength(ch) {
    const P = ch.planets, out = {};
    const DIG = { Sun: 10, Mars: 10, Jupiter: 1, Mercury: 1, Moon: 4, Venus: 4, Saturn: 7 };
    const DS = { Exalted: 30, 'Own sign': 25, Friendly: 18, Neutral: 12, Enemy: 6, Debilitated: 0 };
    for (const p of ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']) {
      const q = P[p];
      let s = DS[q.dignity] || 10;
      const dist = Math.min(Math.abs(q.house - DIG[p]), 12 - Math.abs(q.house - DIG[p]));
      s += 20 * (1 - dist / 6);
      if (q.retro && p !== 'Sun' && p !== 'Moon') s += 8;
      if (q.combust) s -= 12;
      if (p === 'Moon') { const el = norm(P.Moon.lon - P.Sun.lon); s += (el > 180 ? 360 - el : el) / 180 * 15; }
      if ([1, 4, 7, 10].includes(q.house)) s += 10; else if ([5, 9].includes(q.house)) s += 8; else if ([6, 8, 12].includes(q.house)) s -= 5;
      if (q.navamsa === q.sign) s += 6; // vargottama
      s += ((ch.ashtaka ? ch.ashtaka.bav[p][q.sign] : 4) - 4) * 3;
      out[p] = Math.max(0, Math.min(100, Math.round(s * 1.15)));
    }
    return out;
  }

  /* ---------- Varshphal (Tajik annual chart) ---------- */
  function varshphal(profile, year) {
    const natal = chart(profile), target = natal.planets.Sun.lon;
    let jd = jdLocal(year + profile.dob.slice(4), profile.tob || '12:00', profile.place.tz);
    for (let i = 0; i < 8; i++) { let d = norm(sunSid(jd) - target); if (d > 180) d -= 360; jd -= d / 0.98565; }
    const v = chartAt(jd, profile.place);
    const age = year - +profile.dob.slice(0, 4);
    const muntha = (natal.lagna + age) % 12;
    return { jd, chart: v, age, muntha, munthaHouse: ((muntha - v.lagna + 12) % 12) + 1, munthaLord: D.SIGNS[muntha].lord, natal };
  }

  function yogas(ch) {
    const P = ch.planets, L = ch.lagna, res = [];
    const houseFrom = (s, ref) => ((s - ref + 12) % 12) + 1;
    const kendra = [1, 4, 7, 10];
    // Gajakesari
    const jm = houseFrom(P.Jupiter.sign, P.Moon.sign);
    res.push({ name: 'Gajakesari Yoga', present: kendra.includes(jm), kind: 'good', why: 'Jupiter is in house ' + jm + ' from the Moon' + (kendra.includes(jm) ? ' (a kendra). Brings wisdom, respect and lasting reputation.' : '; it needs a kendra (1, 4, 7, 10).') });
    res.push({ name: 'Budhaditya Yoga', present: P.Sun.sign === P.Mercury.sign, kind: 'good', why: P.Sun.sign === P.Mercury.sign ? 'Sun and Mercury together in ' + D.SIGNS[P.Sun.sign].en + '. Sharp intellect and communication.' + (P.Mercury.combust ? ' Mercury is combust, which weakens it.' : '') : 'Sun and Mercury are in different signs.' });
    res.push({ name: 'Chandra-Mangala Yoga', present: P.Moon.sign === P.Mars.sign, kind: 'good', why: P.Moon.sign === P.Mars.sign ? 'Moon and Mars conjunct. Earning drive and enterprise.' : 'Moon and Mars are in different signs.' });
    const mp = { Mars: 'Ruchaka', Mercury: 'Bhadra', Jupiter: 'Hamsa', Venus: 'Malavya', Saturn: 'Sasa' };
    for (const p in mp) {
      const h = P[p].house, strong = P[p].dignity === 'Exalted' || P[p].dignity === 'Own sign';
      if (kendra.includes(h) && strong) res.push({ name: mp[p] + ' Yoga (Pancha Mahapurusha)', present: true, kind: 'good', why: p + ' is ' + P[p].dignity.toLowerCase() + ' in house ' + h + ' from the lagna.' });
    }
    const near = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].filter((p) => { const h = houseFrom(P[p].sign, P.Moon.sign); return h === 2 || h === 12; });
    const withMoon = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].filter((p) => P[p].sign === P.Moon.sign);
    res.push({ name: 'Kemadruma Dosha', present: near.length === 0 && withMoon.length === 0, kind: 'bad', why: near.length || withMoon.length ? 'Cancelled: planets support the Moon (' + near.concat(withMoon).join(', ') + ').' : 'No planet in the 2nd or 12th from the Moon. Emotional ups and downs; reduced by a strong Moon or kendra planets.' });
    // Manglik
    const mh = P.Mars.house, mhm = houseFrom(P.Mars.sign, P.Moon.sign), MH = [1, 2, 4, 7, 8, 12];
    const man = MH.includes(mh), manM = MH.includes(mhm);
    res.push({ name: 'Manglik (Kuja) Dosha', present: man || manM, kind: 'bad', why: 'Mars is in house ' + mh + ' from the lagna and ' + mhm + ' from the Moon. ' + (man || manM ? 'Counts as Manglik ' + (man && manM ? 'from both' : man ? 'from the lagna' : 'from the Moon') + '. Many cancellations exist (e.g. Mars in own/exalted sign, or a Manglik partner).' : 'Not Manglik.') });
    // Kaal Sarp
    const seven = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const ds = seven.map((p) => norm(P[p].lon - P.Rahu.lon));
    const ks = ds.every((d) => d < 180) || ds.every((d) => d > 180);
    res.push({ name: 'Kaal Sarp Dosha', present: ks, kind: 'bad', why: ks ? 'All seven planets lie on one side of the Rahu-Ketu axis.' : 'Planets fall on both sides of the Rahu-Ketu axis.' });
    // Guru-Chandal
    const gc = P.Jupiter.sign === P.Rahu.sign;
    res.push({ name: 'Guru-Chandal Dosha', present: gc, kind: 'bad', why: gc ? 'Jupiter conjunct Rahu. Can confuse judgement and beliefs.' : 'Jupiter and Rahu are not together.' });
    // Vipreet raj (lords of 6, 8, 12 in 6, 8, 12)
    const lordOf = (h) => D.SIGNS[(L + h - 1) % 12].lord;
    const dus = [6, 8, 12];
    const vr = dus.filter((h) => { const l = lordOf(h); return l && P[l] && dus.includes(P[l].house); });
    if (vr.length) res.push({ name: 'Vipreet Raj Yoga', present: true, kind: 'good', why: 'Lord of house ' + vr.join(', ') + ' sits in a dusthana. Success after difficulty.' });
    // Dhana yoga: lords of 2/11 with 1/5/9 lords
    const tr = [1, 5, 9].map(lordOf), dh = [2, 11].map(lordOf);
    const dy = tr.some((a) => dh.some((b) => a !== b && P[a] && P[b] && P[a].sign === P[b].sign));
    if (dy) res.push({ name: 'Dhana Yoga', present: true, kind: 'good', why: 'A wealth-house lord (2 or 11) joins a trikona lord (1, 5 or 9).' });
    // Raj yoga: a kendra lord joins a trikona lord
    const kl = [1, 4, 7, 10].map(lordOf), tl = [5, 9].map(lordOf).concat([lordOf(1)]);
    const rj = [];
    kl.forEach((a) => tl.forEach((b) => { if (a !== b && P[a] && P[b] && P[a].sign === P[b].sign) { const k = [a, b].sort().join(' + '); if (!rj.includes(k)) rj.push(k); } }));
    if (rj.length) res.push({ name: 'Raj Yoga', present: true, kind: 'good', why: 'Kendra and trikona lords join: ' + rj.join(', ') + '. Authority, success and recognition.' });
    // Neecha bhanga
    ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].forEach((p) => {
      if (P[p].dignity !== 'Debilitated') return;
      const disp = D.SIGNS[P[p].sign].lord;
      const hL = P[disp] ? P[disp].house : 0, hM = P[disp] ? houseFrom(P[disp].sign, P.Moon.sign) : 0;
      if (kendra.includes(hL) || kendra.includes(hM)) res.push({ name: 'Neecha Bhanga Raj Yoga (' + p + ')', present: true, kind: 'good', why: p + ' is debilitated but its dispositor ' + disp + ' is in a kendra, cancelling the weakness.' });
    });
    const ben = ['Mercury', 'Jupiter', 'Venus'];
    const adhi = ben.filter((p) => [6, 7, 8].includes(houseFrom(P[p].sign, P.Moon.sign)));
    res.push({ name: 'Adhi Yoga', present: adhi.length >= 2, kind: 'good', why: adhi.length >= 2 ? adhi.join(', ') + ' in the 6th/7th/8th from the Moon. Leadership and comfort.' : 'Needs two or more benefics in the 6th, 7th or 8th from the Moon.' });
    const am = ben.filter((p) => P[p].house === 10 || houseFrom(P[p].sign, P.Moon.sign) === 10);
    if (am.length) res.push({ name: 'Amala Yoga', present: true, kind: 'good', why: am.join(', ') + ' in the 10th from lagna or Moon. Good reputation and clean character.' });
    const two = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].filter((p) => houseFrom(P[p].sign, P.Moon.sign) === 2), twelve = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].filter((p) => houseFrom(P[p].sign, P.Moon.sign) === 12);
    if (two.length && twelve.length) res.push({ name: 'Durudhara Yoga', present: true, kind: 'good', why: 'Planets on both sides of the Moon (' + two.concat(twelve).join(', ') + '). Wealth and support.' });
    else if (two.length) res.push({ name: 'Sunapha Yoga', present: true, kind: 'good', why: two.join(', ') + ' in the 2nd from the Moon. Self-made wealth.' });
    else if (twelve.length) res.push({ name: 'Anapha Yoga', present: true, kind: 'good', why: twelve.join(', ') + ' in the 12th from the Moon. Good health and charm.' });
    const pitra = ['Sun'].some((p) => P[p].sign === P.Rahu.sign || P[p].sign === P.Ketu.sign) || P.Sun.house === 9 && (P.Saturn.sign === P.Sun.sign);
    res.push({ name: 'Pitra Dosha (Sun-node)', present: pitra, kind: 'bad', why: pitra ? 'The Sun joins Rahu/Ketu (or Saturn in the 9th). Traditionally linked with ancestral karma; shraddha and tarpan help.' : 'The Sun is not afflicted by the nodes.' });
    const grahan = P.Moon.sign === P.Rahu.sign || P.Moon.sign === P.Ketu.sign;
    res.push({ name: 'Grahan Dosha (Moon-node)', present: grahan, kind: 'bad', why: grahan ? 'The Moon is with Rahu or Ketu. Can unsettle the mind; Shiva worship and Monday fasts are traditional remedies.' : 'The Moon is free of the nodes.' });
    return res;
  }

  /* Sade Sati / Dhaiya status from transiting Saturn against natal Moon sign */
  function saturnStatus(moonSign, jd) {
    const sat = Math.floor(norm(geoLon('Saturn', jd) - ayanamsa(jd)) / 30);
    const h = ((sat - moonSign + 12) % 12) + 1;
    if (h === 12) return { active: true, phase: 'Sade Sati, rising phase (Saturn 12th from Moon)', sat };
    if (h === 1) return { active: true, phase: 'Sade Sati, peak phase (Saturn over the Moon)', sat };
    if (h === 2) return { active: true, phase: 'Sade Sati, setting phase (Saturn 2nd from Moon)', sat };
    if (h === 4) return { active: true, phase: 'Kantaka Shani / Dhaiya (Saturn 4th from Moon)', sat };
    if (h === 8) return { active: true, phase: 'Ashtama Shani / Dhaiya (Saturn 8th from Moon)', sat };
    return { active: false, phase: 'No Sade Sati or Dhaiya now (Saturn ' + h + ' from Moon)', sat };
  }
  function tarabala(birthNak, todayNak) {
    const c = ((todayNak - birthNak + 27) % 27) % 9;
    return { index: c, ...Object.fromEntries(['name', 'q', 'note'].map((k, i) => [k, D.TARA[c][i]])) };
  }
  function chandrabala(birthMoonSign, todayMoonSign) {
    const h = ((todayMoonSign - birthMoonSign + 12) % 12) + 1;
    return { house: h, good: [1, 3, 6, 7, 10, 11].includes(h) };
  }

  /* month of panchang data at sunrise (for calendar & muhurat) */
  function monthDays(year, month, place) {
    const days = [];
    const n = new Date(Date.UTC(year, month, 0)).getUTCDate();
    let prevSunSign = null;
    const d0 = year + '-' + pad(month) + '-01';
    const r0 = sunTimes(addDays(d0, -1), place).rise;
    if (r0) prevSunSign = Math.floor(sunSid(r0) / 30);
    const refs = [];
    for (let d = 1; d <= n + 1; d++) {
      const ds = addDays(d0, d - 1), st = sunTimes(ds, place);
      refs.push({ ds, st, ref: st.rise != null ? st.rise : jdLocal(ds, '06:00', place.tz) });
    }
    for (let d = 1; d <= n; d++) {
      const { ds, st, ref } = refs[d - 1];
      const ti = tithiIndex(ref), ni = nakIndex(ref), yi = yogaIndex(ref);
      const tiNext = tithiIndex(refs[d].ref);
      const prevTi = d > 1 ? tithiIndex(refs[d - 2].ref) : tithiIndex(jdLocal(addDays(d0, -1), '06:00', place.tz));
      const span = prevTi === ti ? [] : [ti]; // vriddhi tithi: mark only its first sunrise
      if ((tiNext - ti + 30) % 30 === 2) span.push((ti + 1) % 30); // kshaya tithi: begins and ends before next sunrise
      const ss = Math.floor(sunSid(ref) / 30);
      const wd = new Date(Date.UTC(year, month - 1, d)).getUTCDay();
      const tags = [];
      const has = (...xs) => span.some((x) => xs.includes(x));
      if (has(14)) tags.push('Purnima');
      if (has(29)) tags.push('Amavasya');
      if (has(10, 25)) tags.push('Ekadashi');
      if (has(12, 27)) tags.push('Pradosh');
      if (has(3)) tags.push('Vinayaka Chaturthi');
      if (has(18)) tags.push('Sankashti Chaturthi');
      if (has(7, 22)) tags.push('Ashtami');
      if (prevSunSign != null && ss !== prevSunSign) tags.push(D.SIGNS[ss].sa + ' Sankranti');
      prevSunSign = ss;
      days.push({ date: ds, d, wd, tithi: ti, nak: ni, yoga: yi, rise: st.rise, set: st.set, moonSign: Math.floor(moonSid(ref) / 30), tags });
    }
    return days;
  }
  function muhuratScore(day, activity, natal) {
    const A = D.MUHURAT[activity];
    if (!A) return null;
    const reasons = [];
    let score = 0;
    const t15 = day.tithi % 15;
    if (A.nak.includes(day.nak)) { score += 2; reasons.push(D.NAKSHATRAS[day.nak].name + ' is a favoured nakshatra'); }
    else reasons.push(D.NAKSHATRAS[day.nak].name + ' is not in the favoured list');
    if (A.days.includes(day.wd)) { score += 1; reasons.push(D.VARAS[day.wd][0] + ' suits this'); }
    if ([3, 8, 13].includes(t15)) { score -= 2; reasons.push('Rikta tithi (' + D.TITHIS[t15] + ')'); }
    if (day.tithi === 29) { score -= 3; reasons.push('Amavasya'); }
    if (D.BAD_YOGAS.includes(day.yoga)) { score -= 1; reasons.push(D.YOGAS[day.yoga] + ' yoga is inauspicious'); }
    if ([1, 2, 4, 6, 9, 10, 11, 12].includes(t15) || day.tithi === 14) { score += 1; reasons.push('Good tithi (' + tithiName(day.tithi) + ')'); }
    if (natal) {
      const tb = tarabala(natal.moonNak, day.nak);
      if (tb.q === 'good') { score += 1; reasons.push('Tarabala: ' + tb.name); } else if (tb.q === 'bad') { score -= 2; reasons.push('Tarabala: ' + tb.name + ' (unfavourable)'); }
      const cb = chandrabala(natal.moonSign, day.moonSign);
      if (cb.good) { score += 1; reasons.push('Chandrabala good (Moon in ' + cb.house + ')'); } else { score -= 1; reasons.push('Chandrabala weak (Moon in ' + cb.house + ')'); }
    }
    return { score, level: score >= 4 ? 'great' : score >= 2 ? 'good' : score >= 0 ? 'fair' : 'avoid', reasons };
  }

  function transits(jd) {
    const s = siderealAll(jd), s2 = siderealAll(jd + 0.5), out = {};
    for (const p of D.PLANET_ORDER) {
      let dd = s2[p] - s[p]; if (dd > 180) dd -= 360; if (dd < -180) dd += 360;
      out[p] = { lon: s[p], sign: Math.floor(s[p] / 30), deg: s[p] % 30, retro: p === 'Rahu' || p === 'Ketu' || dd < 0, nak: Math.floor(s[p] / NAK) };
    }
    return out;
  }

  function nowJd() { return Date.now() / 86400000 + 2440587.5; }
  function todayStr(tz) { const t = jdToLocal(nowJd(), tz); return t.y + '-' + pad(t.m) + '-' + pad(t.d); }
  function fmtDeg(x) { const d = Math.floor(x), m = Math.floor((x - d) * 60), s = Math.round(((x - d) * 60 - m) * 60); return d + '°' + pad(m) + '′' + (s === 60 ? '59' : pad(s)) + '″'; }

  D.astro = {
    norm, jdUTC, jdLocal, jdToLocal, fmtTime, fmtDate, fmtDeg, addDays, nowJd, todayStr, ayanamsa,
    siderealAll, sunSid, moonSid, ascendantTrop, sunTimes, panchang, tithiName, lunarMonth, chart, vimshottari, currentDasha,
    saturnStatus, tarabala, chandrabala, monthDays, muhuratScore, transits, kpLords, dignity, yogas,
    deltaT, setNodeMode: (m) => { NODE_MODE = m === 'true' ? 'true' : 'mean'; }, nodeMode: () => NODE_MODE, lstAt: (jd, lon) => lst(jd, lon),
    DASHA_LORDS, DASHA_YRS, prevChange, nextChange, tithiIndex, nakIndex, chartAt, placidus, kpEvents, varshphal, ashtakavarga, AV,
  };
})(typeof window !== 'undefined' ? window : globalThis);
