/* Anubhuti — Today dashboard and Muhurat calendar. */
(function (G) {
  const D = (G.Disha = G.Disha || {});
  const { esc, $, $$, icon, toast, lsGet, lsSet } = D.ui;
  const A = D.astro, app = D.app;

  function moonSvg(tithi) {
    // illuminated fraction from elongation; waxing lights the right side
    const el = (tithi + 0.5) * 12, k = (1 - Math.cos(el * Math.PI / 180)) / 2, waxing = el < 180;
    const r = 30, rx = Math.abs(1 - 2 * k) * r;
    const lit = 'var(--saffron)', dark = 'var(--sunk)';
    const sweepOuter = waxing ? 1 : 0, sweepInner = (k > 0.5) === waxing ? 0 : 1;
    return '<svg class="moon-phase" viewBox="-37 -37 74 74" aria-label="Moon ' + Math.round(k * 100) + '% lit"><circle r="' + r + '" fill="' + dark + '" stroke="var(--line-2)"/>' +
      '<path d="M0 ' + -r + ' A' + r + ' ' + r + ' 0 0 ' + sweepOuter + ' 0 ' + r + ' A' + rx + ' ' + r + ' 0 0 ' + sweepInner + ' 0 ' + -r + 'Z" fill="' + lit + '"/></svg>';
  }

  function timeline(pc, tz) {
    const P = pc.periods; if (!P) return '';
    const start = pc.rise - 1 / 24, end = pc.set + 1 / 24, span = end - start;
    const pos = (j) => Math.max(0, Math.min(100, ((j - start) / span) * 100));
    const band = (a, b, color, title) => '<div class="band" title="' + esc(title) + '" style="left:' + pos(a) + '%;width:' + (pos(b) - pos(a)) + '%;background:' + color + '"></div>';
    let s = '<div class="timeline" role="img" aria-label="Day timeline from sunrise to sunset">';
    P.chogDay.forEach((c) => { s += band(c.start, c.end, c.q === 'good' ? 'color-mix(in srgb, var(--good) 16%, transparent)' : c.q === 'bad' ? 'color-mix(in srgb, var(--bad) 10%, transparent)' : 'color-mix(in srgb, var(--warn) 10%, transparent)', c.name); });
    s += band(P.rahu.start, P.rahu.end, 'repeating-linear-gradient(45deg, color-mix(in srgb, var(--bad) 55%, transparent) 0 6px, color-mix(in srgb, var(--bad) 30%, transparent) 6px 12px)', 'Rahu Kaal');
    s += band(P.yamaganda.start, P.yamaganda.end, 'color-mix(in srgb, var(--bad) 28%, transparent)', 'Yamaganda');
    s += band(P.gulika.start, P.gulika.end, 'color-mix(in srgb, var(--warn) 40%, transparent)', 'Gulika');
    s += band(P.abhijit.start, P.abhijit.end, 'color-mix(in srgb, var(--good) 65%, transparent)', 'Abhijit');
    const now = A.nowJd();
    if (now > start && now < end) s += '<div class="now" style="left:' + pos(now) + '%"></div>';
    s += '</div><div class="tl-labels">';
    s += '<span style="left:' + pos(pc.rise) + '%">↑ ' + app.time(pc.rise, tz) + '</span>';
    s += '<span style="left:' + pos((pc.rise + pc.set) / 2) + '%">noon ' + app.time((pc.rise + pc.set) / 2, tz) + '</span>';
    s += '<span style="left:' + pos(pc.set) + '%">↓ ' + app.time(pc.set, tz) + '</span></div>';
    s += '<div class="legend"><span><i style="background:color-mix(in srgb, var(--bad) 55%, transparent)"></i>Rahu Kaal ' + app.time(P.rahu.start, tz) + '–' + app.time(P.rahu.end, tz) + '</span><span><i style="background:color-mix(in srgb, var(--bad) 28%, transparent)"></i>Yamaganda ' + app.time(P.yamaganda.start, tz) + '–' + app.time(P.yamaganda.end, tz) + '</span><span><i style="background:color-mix(in srgb, var(--warn) 40%, transparent)"></i>Gulika ' + app.time(P.gulika.start, tz) + '–' + app.time(P.gulika.end, tz) + '</span><span><i style="background:color-mix(in srgb, var(--good) 65%, transparent)"></i>Abhijit ' + app.time(P.abhijit.start, tz) + '–' + app.time(P.abhijit.end, tz) + (P.abhijit.wednesday ? ' (not used on Wednesday)' : '') + '</span></div>';
    return s;
  }

  function personal(p, pc, now) {
    if (!p) return '<div class="card stack"><h3>Your day</h3><p class="muted small">Add your birth details to see Tarabala, Chandrabala, your running dasha and personal day number here.</p><button class="btn primary" data-act-add>' + icon('plus') + 'Add yourself</button></div>';
    const ch = app.chart(p);
    const tb = A.tarabala(ch.moonNak, A.nakIndex(now));
    const cb = A.chandrabala(ch.moonSign, Math.floor(A.moonSid(now) / 30));
    const ss = A.saturnStatus(ch.moonSign, now);
    const cd = A.currentDasha(ch.dasha, now);
    const cyc = D.numerology.personalCycles(p.dob, pc.date);
    const tone = tb.q === 'good' && cb.good ? ['good', 'A supportive day'] : tb.q === 'bad' && !cb.good ? ['bad', 'Go gently today'] : ['ok', 'A mixed day'];
    return '<div class="card stack"><div class="row-between"><h3>' + esc(p.name.split(' ')[0]) + '’s day</h3><span class="chip ' + tone[0] + '">' + tone[1] + '</span></div>' +
      '<dl class="kv"><dt>Tarabala</dt><dd>' + tb.name + ' <span class="chip ' + (tb.q === 'good' ? 'good' : tb.q === 'bad' ? 'bad' : 'ok') + '">' + tb.q + '</span><div class="small muted">' + esc(tb.note) + '</div></dd>' +
      '<dt>Chandrabala</dt><dd>Moon in house ' + cb.house + ' from your Moon <span class="chip ' + (cb.good ? 'good' : 'bad') + '">' + (cb.good ? 'good' : 'weak') + '</span></dd>' +
      '<dt>Dasha</dt><dd>' + (cd ? cd.md.lord + ' › ' + cd.ad.lord + (cd.pd ? ' › ' + cd.pd.lord : '') + '<div class="small muted">' + cd.ad.lord + ' antardasha until ' + A.fmtDate(cd.ad.end, p.place.tz) + '</div>' : '—') + '</dd>' +
      '<dt>Shani</dt><dd>' + esc(ss.phase) + '</dd>' +
      '<dt>Numbers</dt><dd>Personal day <b>' + cyc.day + '</b> · month ' + cyc.month + ' · year ' + cyc.year + '<div class="small muted">' + esc(D.NUMBER_TRAITS[cyc.day].kw) + '</div></dd></dl></div>';
  }

  app.views.today = {
    render(el) {
      const st = { date: lsGet('openDate', null) || A.todayStr(app.tz()) };
      lsSet('openDate', null);
      const draw = () => {
        const place = app.place(), tz = place.tz;
        const pc = A.panchang(st.date, place);
        const isToday = st.date === A.todayStr(tz);
        const now = isToday ? A.nowJd() : pc.ref;
        const P = pc.periods;
        const tr = A.transits(now);
        const nowChog = P && P.chogDay.concat(P.chogNight).find((c) => now >= c.start && now < c.end);
        const nowHora = P && P.horas.find((h) => now >= h.start && now < h.end);
        const dt = new Date(st.date + 'T12:00:00Z').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
        el.innerHTML =
          '<div class="page-head"><div><div class="kicker">' + (isToday ? 'Today' : 'Panchang') + ' · ' + esc(place.name.replace(', India', '')) + '</div><h1>' + esc(dt) + '</h1></div>' +
          '<div class="row"><button class="btn icon" data-d="-1" aria-label="Previous day">' + icon('left') + '</button><input type="date" class="input" id="td" value="' + st.date + '" style="width:auto"><button class="btn icon" data-d="1" aria-label="Next day">' + icon('right') + '</button>' + (isToday ? '' : '<button class="btn" data-today>Today</button>') + '<a class="btn ghost" href="#prefs">' + icon('pin') + 'Change place</a></div></div>' +
          '<div class="hero-day">' +
          '<div class="card raised stack"><div class="row" style="gap:16px;align-items:center">' + moonSvg(pc.tithi.index) + '<div class="grow"><div class="small muted">' + esc(pc.month) + ' · ' + pc.tithi.paksha + ' paksha · ' + pc.vara.sa + '</div><div class="tithi-big">' + esc(pc.tithi.name) + '</div><div class="small muted">until ' + app.time(pc.tithi.ends, tz) + (pc.tithi.ends && A.jdToLocal(pc.tithi.ends, tz).d !== A.jdToLocal(pc.ref, tz).d ? ' (next day)' : '') + '</div></div></div>' +
          '<div class="grid g4" style="gap:12px">' +
          stat('Nakshatra', pc.nakshatra.name, 'pada ' + pc.nakshatra.pada + ' · till ' + app.time(pc.nakshatra.ends, tz)) +
          stat('Yoga', pc.yoga.name, (pc.yoga.bad ? 'inauspicious · ' : '') + 'till ' + app.time(pc.yoga.ends, tz)) +
          stat('Karana', pc.karana.name, 'till ' + app.time(pc.karana.ends, tz)) +
          stat('Moon · Sun', D.SIGNS[pc.moonSign].sa, 'Sun in ' + D.SIGNS[pc.sunSign].sa) + '</div>' +
          '<hr class="sep">' + timeline(pc, tz) + '</div>' +
          personal(app.activeProfile(), pc, now) + '</div>' +
          '<div class="grid g2" style="margin-top:16px">' +
          '<div class="card"><div class="card-head"><h3>Choghadiya</h3><span class="small muted">' + (nowChog ? 'Now: <b>' + nowChog.name + '</b>' : '') + (nowHora ? ' · Hora of <b>' + nowHora.lord + '</b>' : '') + '</span></div>' +
          (P ? '<h4 style="margin-bottom:6px">Day</h4><div class="chog">' + P.chogDay.map((c) => chogCell(c, now, tz)).join('') + '</div><h4 style="margin:12px 0 6px">Night</h4><div class="chog">' + P.chogNight.map((c) => chogCell(c, now, tz)).join('') + '</div>' : '<p class="muted">No sunrise at this latitude today.</p>') +
          '<p class="note" style="margin-top:12px">Amrit, Shubh and Labh are good for starting things; Char suits travel; avoid Udveg, Kaal and Rog for new work.</p></div>' +
          '<div class="card"><div class="card-head"><h3>Hora (planetary hours)</h3><span class="small muted">Brahma muhurta ' + (P ? app.time(P.brahma.start, tz) + '–' + app.time(P.brahma.end, tz) : '—') + '</span></div>' +
          (P ? '<div class="table-wrap"><table class="t"><thead><tr><th>Day hora</th><th>Time</th><th>Night hora</th><th>Time</th></tr></thead><tbody>' + P.horas.slice(0, 12).map((h, i) => { const n = P.horas[12 + i]; return '<tr class="' + ((now >= h.start && now < h.end) || (now >= n.start && now < n.end) ? 'now' : '') + '"><td>' + h.lord + '</td><td class="num">' + app.time(h.start, tz) + '</td><td>' + n.lord + '</td><td class="num">' + app.time(n.start, tz) + '</td></tr>'; }).join('') + '</tbody></table></div>' : '') + '</div></div>' +
          '<div class="card" style="margin-top:16px"><div class="card-head"><h3>Planets now (gochar)</h3><span class="small muted">Sidereal, Lahiri · ' + (isToday ? 'live' : 'at sunrise') + '</span></div><div class="planet-strip">' +
          D.PLANET_ORDER.map((p) => { const t = tr[p], pr = app.activeProfile(), ch = pr && app.chart(pr); const h = ch ? ((t.sign - ch.moonSign + 12) % 12) + 1 : null; return '<div title="' + p + ' at ' + A.fmtDeg(t.deg) + ' ' + D.SIGNS[t.sign].en + '"><div class="pg">' + D.PLANETS[p].sa + (t.retro && p !== 'Rahu' && p !== 'Ketu' ? ' <span class="tiny" style="color:var(--bad)">R</span>' : '') + '</div><div class="ps">' + D.SIGNS[t.sign].sa + ' ' + Math.floor(t.deg) + '°</div><div class="ps">' + D.NAKSHATRAS[t.nak].name + '</div>' + (h ? '<div class="ps">' + h + ' from Moon</div>' : '') + '</div>'; }).join('') + '</div></div>' +
          '<div class="row" style="margin-top:16px"><a class="btn accent" href="#ask" data-brief>' + icon('ask') + 'Ask Anubhuti for my daily brief</a><a class="btn" href="#calendar">' + icon('calendar') + 'Find a muhurat</a></div>';
        el.querySelectorAll('[data-d]').forEach((b) => b.addEventListener('click', () => { st.date = A.addDays(st.date, +b.dataset.d); draw(); }));
        const t = el.querySelector('[data-today]'); t && t.addEventListener('click', () => { st.date = A.todayStr(app.tz()); draw(); });
        $('#td', el).addEventListener('change', (e) => { if (e.target.value) { st.date = e.target.value; draw(); } });
        const br = el.querySelector('[data-brief]'); br && br.addEventListener('click', () => { lsSet('askPreset', 'brief'); });
      };
      const stat = (l, v, s) => '<div class="stat"><span class="label">' + l + '</span><span class="value" style="font-size:1.15rem">' + esc(v) + '</span><span class="sub">' + esc(s) + '</span></div>';
      const chogCell = (c, now, tz) => '<div class="' + c.q + (now >= c.start && now < c.end ? ' is-now' : '') + '"><b>' + c.name + '</b>' + app.time(c.start, tz) + '</div>';
      draw();
      const iv = setInterval(() => { if (st.date === A.todayStr(app.tz()) && document.visibilityState === 'visible') draw(); }, 60000);
      this.onData = draw;
      return () => clearInterval(iv);
    },
  };

  /* ---------- Calendar ---------- */
  app.views.calendar = {
    render(el) {
      const t = A.todayStr(app.tz()).split('-').map(Number);
      const st = { y: t[0], m: t[1], act: lsGet('calAct', ''), sel: null };
      const draw = () => {
        const place = app.place(), tz = place.tz;
        const days = A.monthDays(st.y, st.m, place);
        const p = app.activeProfile(), natal = p ? app.chart(p) : null;
        const scored = st.act ? days.map((d) => ({ ...d, mu: A.muhuratScore(d, st.act, natal) })) : days;
        const first = new Date(Date.UTC(st.y, st.m - 1, 1)).getUTCDay();
        const today = A.todayStr(tz);
        const mname = new Date(Date.UTC(st.y, st.m - 1, 15)).toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' });
        const best = st.act ? scored.filter((d) => d.mu.level === 'great' || d.mu.level === 'good').sort((a, b) => b.mu.score - a.mu.score) : [];
        el.innerHTML =
          '<div class="page-head"><div><div class="kicker">Muhurat calendar · ' + esc(place.name.replace(', India', '')) + '</div><h1>' + mname + '</h1><p class="lede">Tithi and nakshatra at sunrise for every day, with vrats and Sankranti. Pick an activity to find favourable days' + (p ? ', personalised with ' + esc(p.name.split(' ')[0]) + '’s Tarabala and Chandrabala.' : '.') + '</p></div>' +
          '<div class="row"><button class="btn icon" data-m="-1" aria-label="Previous month">' + icon('left') + '</button><button class="btn" data-m="0">This month</button><button class="btn icon" data-m="1" aria-label="Next month">' + icon('right') + '</button></div></div>' +
          '<div class="row" style="margin-bottom:14px"><label class="field" style="min-width:260px"><span>Find good days for</span><select class="input" id="act"><option value="">Just show the panchang</option>' + Object.entries(D.MUHURAT).map(([k, v]) => '<option value="' + k + '"' + (st.act === k ? ' selected' : '') + '>' + v.label + '</option>').join('') + '</select></label>' +
          (st.act ? '<div class="legend" style="align-self:flex-end;padding-bottom:8px"><span><i style="background:color-mix(in srgb, var(--good) 40%, var(--paper))"></i>Excellent</span><span><i style="background:var(--good-soft)"></i>Good</span><span><i style="background:var(--sunk)"></i>Avoid (faded)</span></div>' : '') + '</div>' +
          '<div class="grid" style="grid-template-columns:minmax(0,1fr) 320px;align-items:start" id="calgrid"><div class="card"><div class="cal">' + ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => '<div class="dow">' + d + '</div>').join('') +
          '<div class="blank"></div>'.repeat(first) +
          scored.map((d) => '<button class="day' + (d.date === today ? ' today' : '') + (st.sel === d.date ? ' sel' : '') + (d.mu ? ' lvl-' + d.mu.level : '') + '" data-day="' + d.date + '"><span class="d">' + d.d + '</span><span class="tn">' + esc(A.tithiName(d.tithi).replace('Shukla ', 'S. ').replace('Krishna ', 'K. ')) + '</span><span class="tn">' + esc(D.NAKSHATRAS[d.nak].name) + '</span><span class="tags">' + d.tags.map((x) => '<span title="' + esc(x) + '">' + esc(x) + '</span>').join('') + '</span></button>').join('') +
          '</div></div><div class="panel" id="side"></div></div>';
        const side = $('#side', el);
        const showDay = (ds) => {
          const d = scored.find((x) => x.date === ds) || scored[0];
          st.sel = d.date;
          $$('.cal .day', el).forEach((b) => b.classList.toggle('sel', b.dataset.day === d.date));
          const pc = A.panchang(d.date, place);
          side.innerHTML = '<div class="card stack"><div class="row-between"><h3>' + new Date(d.date + 'T12:00:00Z').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' }) + '</h3>' + (d.mu ? '<span class="chip ' + d.mu.level + '">' + d.mu.level + '</span>' : '') + '</div>' +
            '<dl class="kv"><dt>Tithi</dt><dd>' + esc(pc.tithi.name) + ' <span class="small muted">till ' + app.time(pc.tithi.ends, tz) + '</span></dd><dt>Nakshatra</dt><dd>' + esc(pc.nakshatra.name) + ' <span class="small muted">till ' + app.time(pc.nakshatra.ends, tz) + '</span></dd><dt>Yoga</dt><dd>' + esc(pc.yoga.name) + '</dd><dt>Sunrise</dt><dd class="num">' + app.time(pc.rise, tz) + ' – ' + app.time(pc.set, tz) + '</dd>' +
            (pc.periods ? '<dt>Rahu Kaal</dt><dd class="num">' + app.time(pc.periods.rahu.start, tz) + '–' + app.time(pc.periods.rahu.end, tz) + '</dd><dt>Abhijit</dt><dd class="num">' + app.time(pc.periods.abhijit.start, tz) + '–' + app.time(pc.periods.abhijit.end, tz) + '</dd>' : '') + '</dl>' +
            (d.tags.length ? '<div class="row" style="gap:4px">' + d.tags.map((x) => '<span class="chip accent">' + esc(x) + '</span>').join('') + '</div>' : '') +
            (d.mu ? '<div class="stack-sm"><h4>Why</h4>' + d.mu.reasons.map((r) => '<div class="small">• ' + esc(r) + '</div>').join('') + '</div>' : '') +
            '<a class="btn sm" href="#today" data-open="' + d.date + '">Open full panchang</a></div>' +
            (st.act ? '<div class="card stack"><h3>Best days this month</h3>' + (best.length ? best.slice(0, 8).map((b) => '<button class="btn sm" style="justify-content:space-between" data-jump="' + b.date + '"><span>' + new Date(b.date + 'T12:00:00Z').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }) + '</span><span class="chip ' + b.mu.level + '">' + b.mu.level + '</span></button>').join('') : '<p class="small muted">No strongly favourable days this month. Try the next month.</p>') + '<p class="note">Indicative only: a full muhurat also checks lagna, planetary transits and the people involved.</p></div>' : '');
        };
        cur.showDay = showDay;
        showDay(st.sel && scored.find((x) => x.date === st.sel) ? st.sel : (scored.find((x) => x.date === today) || scored[0]).date);
        $('#act', el).addEventListener('change', (e) => { st.act = e.target.value; lsSet('calAct', st.act); draw(); });
        const mq = window.matchMedia('(max-width: 1100px)');
        $('#calgrid', el).style.gridTemplateColumns = mq.matches ? 'minmax(0,1fr)' : 'minmax(0,1fr) 320px';
      };
      const cur = {};
      el.addEventListener('click', (e) => {
        const b = e.target.closest('[data-day],[data-jump]'); if (b && cur.showDay) cur.showDay(b.dataset.day || b.dataset.jump);
        const o = e.target.closest('[data-open]'); if (o) lsSet('openDate', o.dataset.open);
        const m = e.target.closest('[data-m]');
        if (m) {
          if (m.dataset.m === '0') { const t2 = A.todayStr(app.tz()).split('-').map(Number); st.y = t2[0]; st.m = t2[1]; }
          else { st.m += +m.dataset.m; if (st.m < 1) { st.m = 12; st.y--; } if (st.m > 12) { st.m = 1; st.y++; } }
          st.sel = null; draw();
        }
      });
      draw();
      this.onData = draw;
    },
  };
})(window);
