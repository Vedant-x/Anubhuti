/* Anubhuti — Home, Tarot, Compare, Family Vault, Nakshatras, Remedies, Clients, Help and page guides. */
(function (G) {
  const D = (G.Disha = G.Disha || {});
  const { esc, $, $$, icon, toast, sheet, confirmSheet, md, initials, lsGet, lsSet, copyText } = D.ui;
  const A = D.astro, S = D.store, app = D.app, N = D.numerology;

  /* ---------- guides (shown at the top of every page) ---------- */
  const GUIDES = {
    home: ['Start here', ['Add yourself and your family in <b>Family Vault</b> (birth date, time and exact place).', 'Tap any tile to open a tool. Everything uses the person shown at the top right; tap it to switch.', 'Use <b>Clients</b> to keep follow-ups, and <b>Ask Anubhuti</b> for questions in plain words.']],
    today: ['Using the daily panchang', ['The big card shows today’s tithi, nakshatra, yoga and karana with the time each one ends.', 'The coloured bar is the day from sunrise to sunset: striped red is Rahu Kaal (avoid starting new work), green is Abhijit (a good time).', 'Choghadiya: start things in Amrit, Shubh or Labh; avoid Udveg, Kaal and Rog.', 'Change the city in Settings → Your location. Use the arrows to see other days.']],
    calendar: ['Finding a good day (muhurat)', ['Each day shows the tithi and nakshatra at sunrise, with festivals and fasts.', 'Choose an activity in “Find good days for”. Green days suit it best; faded days are best avoided.', 'Tap a day to see why it is good or bad. Results are personalised to the active person.']],
    vastu: ['Analysing a floor plan, step by step', ['<b>Upload map</b>: tap Upload plan (a straight photo or scan works) or Draw without image.', '<b>Mark centre</b>: tap “4 points” and click the four outer corners A, B, C, D in order. Or drag a Rectangle, or choose Auto.', '<b>Mark boundary</b>: drag the orange dots onto the outer walls. Drag the small + on an edge to add a corner.', '<b>Select side & degree</b>: choose the side of the drawing you measured, then type or slide the compass degree. You can also drag the red <b>N</b> on the plan.', '<b>View 16 zones</b>: see which directions are complete, missing (cut) or sticking out (extension), then mark rooms and objects to check each one.']],
    kundli: ['Reading the birth chart', ['Check the <b>Birth details</b> panel first: date, time, exact place and time zone must match the birth certificate.', 'Tabs: Charts, Divisional charts (D1–D60), Planets, Karakas & aspects, Dasha (Vimshottari and Yogini), Yogas & doshas (with Mangal dosha and the Sade Sati timeline), KP, Ashtakavarga, Transits, Varshphal, Lal Kitab, Prashna and Match making.', 'Green planets are strong (exalted), red are weak (debilitated). ℞ means retrograde.', 'Tap “Ask about this chart” for an easy explanation.']],
    numerology: ['Using numerology', ['Mulank comes from the birth day, Bhagyank from the full date, the Name number from the spelling.', 'The Lo Shu grid shows which numbers are present; missing numbers have simple remedies below.', 'Name lab: try different spellings, or tap “Suggest spellings”. “Friendly” with both core numbers is best.', 'Use the Number checker for phone, vehicle or house numbers.']],
    tarot: ['Doing a tarot reading', ['Pick a spread: Card of the Day (same card all day), Yes/No, Past-Present-Future, Relationship, Career or Celtic Cross.', 'Type your question (optional but recommended), then tap <b>Draw</b>.', 'Each card shows its position and meaning; a card shown upside down is “reversed”.', 'Tap “Interpret with Anubhuti” for a reading that ties the cards together. Readings are saved in History.']],
    compare: ['Comparing two people', ['Choose Person A and Person B from the Family Vault.', 'Pick the relationship (partner, friend, sibling, parent-child, business).', 'Tap <b>Compare</b>: you get the 36-guna score, Manglik check, Moon-sign harmony and numerology match in plain words.']],
    people: ['Keeping your family vault', ['Tap <b>Add member</b> and enter the birth date, time (to the second if known) and the exact birthplace.', 'Use “Find exact location” in the form for the real village or area, not just the nearest city.', 'Upcoming birthdays appear at the top. Each card links to the person’s Kundli and yearly Varshphal.', 'Write rituals or remedies to remember in the person’s notes.']],
    nakshatras: ['Exploring the 27 nakshatras', ['Each card shows the star’s span, ruling planet, deity, symbol, nature and what it is good for.', 'The active person’s birth star and today’s Moon star are highlighted.', 'Use the search box to find a star by name, deity or planet.']],
    remedies: ['Finding remedies', ['“For you” lists planets that need support in the active person’s chart, with mantra, charity, day and Rudraksha.', 'Gemstones are suggested only for helpful planets; consult before wearing.', 'Scroll down for the full Rudraksha (1–14 mukhi), mantra and charity tables.']],
    clients: ['Managing clients', ['Tap <b>Add client</b> to save a client’s details; link their kundli (from the vault) and floor plan.', 'Add follow-up reminders with a date. Overdue and next-7-day reminders show on Home.', 'Tap WhatsApp to message a client, or the tick to mark a reminder done.']],
    calc: ['Using the calculators', ['Aayadi: enter length and breadth in feet to check if a size is auspicious; tap a suggested size to try it.', 'Degree finder: slide to any compass degree to see its zone and entrance pada.', 'Home facing: enter the degree you read while looking out of the main door.']],
    ask: ['Asking Anubhuti', ['Type or speak a question in plain words, for example “When is a good time for my career?”.', 'Choose what Anubhuti can see on the right (chart, numerology, floor plan, today).', 'Answers use the app’s own calculations. Tap Listen to hear an answer.']],
    compass: ['Using the compass', ['Open Anubhuti directly in the phone browser (the website copy) for the live compass.', 'Stand at the centre of the home, hold the phone flat, away from metal.', 'To set a plan’s north: face the wall at the top of your drawing and tap “Use this reading in Vastu”.']],
    library: ['Using the library', ['Pick a shelf (zones, entrances, devtas, nakshatras, planets, signs, numbers, room guide) or search everything.']],
    prefs: ['Settings', ['Theme, chart style, Rahu node type, clock and your location for the panchang.', 'Download a backup now and then, especially if you use the website copy.']],
  };
  function guideHtml(route) {
    const g = GUIDES[route]; if (!g) return '';
    const seen = lsGet('guide:' + route, false);
    return '<details class="guide"' + (seen ? '' : ' open') + ' data-guide="' + route + '"><summary>' + icon('info') + '<span>How to use: ' + esc(g[0]) + '</span></summary><ol>' + g[1].map((x) => '<li>' + x + '</li>').join('') + '</ol></details>';
  }
  app.renderGuide = function (route) {
    const el = document.getElementById('guide'); if (!el) return;
    el.innerHTML = guideHtml(route);
    const d = el.querySelector('details');
    d && d.addEventListener('toggle', () => { if (!d.open) lsSet('guide:' + route, true); });
  };

  /* ---------- helpers ---------- */
  function nextBirthday(p) {
    const [y, m, d] = p.dob.split('-').map(Number), today = new Date(A.todayStr(app.tz()) + 'T00:00:00Z');
    let nb = new Date(Date.UTC(today.getUTCFullYear(), m - 1, d));
    if (nb < today) nb = new Date(Date.UTC(today.getUTCFullYear() + 1, m - 1, d));
    return { days: Math.round((nb - today) / 86400000), age: nb.getUTCFullYear() - y, date: nb };
  }
  const relWord = (n) => (n === 0 ? 'today' : n === 1 ? 'tomorrow' : 'in ' + n + ' days');
  function dueInfo(r) {
    const today = A.todayStr(app.tz());
    const diff = Math.round((new Date(r.date + 'T00:00:00Z') - new Date(today + 'T00:00:00Z')) / 86400000);
    return { diff, overdue: !r.done && diff < 0, soon: !r.done && diff >= 0 && diff <= 7 };
  }

  /* ---------- Home ---------- */
  app.views.home = {
    render(el) {
      const draw = () => {
        const p = app.activeProfile(), pl = app.place(), pc = A.panchang(A.todayStr(pl.tz), pl);
        const rem = S.state.reminders || [], over = rem.filter((r) => dueInfo(r).overdue).length, soon = rem.filter((r) => dueInfo(r).soon).length;
        const bdays = app.profiles().map((x) => ({ p: x, b: nextBirthday(x) })).filter((x) => x.b.days <= 30).sort((a, b) => a.b.days - b.b.days);
        const hr = new Date().getHours(), greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
        const T = [
          ['vastu', 'Grid your map', 'Upload a floor plan · 16-zone Vastu analysis', 'vastu', 'violet', true],
          ['vastu:blank', 'Draw plan', 'Sketch a layout on a grid', 'outline', 'gold'], ['kundli', 'Kundli', 'Birth chart, dasha, KP', 'kundli', 'rose'],
          ['numerology', 'Numerology', 'Lo Shu, name & lucky numbers', 'numbers', 'sky'], ['tarot', 'Tarot', 'Card readings', 'star', 'violet'],
          ['compare', 'Compare', 'Match two charts', 'people', 'gold'], ['people', 'Family Vault', 'Loved ones’ charts', 'people', 'rose'],
          ['today', 'Daily Panchang', 'Tithi, nakshatra & muhurat', 'today', 'gold'], ['nakshatras', '27 Nakshatras', 'Traits of each star', 'star', 'sky'],
          ['remedies', 'Remedies', 'Rudraksha, gems & mantras', 'lamp', 'mint'], ['calendar', 'Muhurat calendar', 'Good days for big moments', 'calendar', 'mint'],
          ['calc', 'Calculators', 'Aayadi, degrees, land units', 'numbers', 'sky'], ['compass', 'Compass', '16 zones & entrances', 'compass', 'rose'],
        ];
        el.innerHTML = '<div class="home-hero"><div><div class="kicker">' + greet + '</div><h1>' + (p ? 'Namaste, ' + esc(p.name.split(' ')[0]) : 'Namaste') + '</h1><p class="lede">' + esc(pc.vara.name) + ' · ' + esc(pc.month) + ' ' + esc(pc.tithi.name) + ' · ' + esc(pc.nakshatra.name) + ' nakshatra' + (pc.periods ? ' · Rahu Kaal ' + app.time(pc.periods.rahu.start) + '–' + app.time(pc.periods.rahu.end) : '') + '</p></div></div>' +
          '<div class="home-grid"><div class="tiles">' + T.map(([r, t, sub, ic, tone, big]) => '<a class="tile tone-' + tone + (big ? ' big' : '') + '" href="#' + r.split(':')[0] + '" data-r2="' + r + '"><span class="tile-ic">' + icon(ic) + '</span><span class="tile-t">' + t + '</span><span class="tile-s">' + sub + '</span>' + (big ? '<span class="tile-cta">Open Vastu editor ' + icon('right') + '</span>' : '<span class="tile-go">' + icon('right') + '</span>') + '</a>').join('') + '</div>' +
          '<div class="stack"><div class="card side-card"><div class="row-between"><h3>' + icon('people') + ' Clients</h3><a class="small" href="#clients">Open</a></div><div class="grid g2" style="gap:8px;margin:10px 0"><div class="mini-stat bad"><span>Overdue</span><b>' + over + '</b></div><div class="mini-stat good"><span>Next 7 days</span><b>' + soon + '</b></div></div>' +
          (S.state.clients.length ? '<p class="small muted">' + S.state.clients.length + ' client' + (S.state.clients.length > 1 ? 's' : '') + ' saved.</p>' : '<p class="small muted">No clients yet. Add your first client to get started.</p>') + '<div class="row" style="gap:6px"><button class="btn sm" data-h="client">' + icon('plus') + 'Add client</button><button class="btn sm" data-h="reminder">' + icon('calendar') + 'Add reminder</button></div></div>' +
          '<a class="card ask-card" href="#ask"><span class="tiny" style="letter-spacing:.12em;opacity:.8">AI SPIRITUAL GUIDE</span><h2>Ask Anubhuti</h2><p class="small">Vastu · Astrology · Numerology · Tarot, answered from your own charts and plans.</p><span class="btn sm" style="align-self:flex-start;background:#fff;color:var(--indigo);border:0">' + icon('ask') + 'Open chat</span></a>' +
          '<div class="card side-card"><h3>' + icon('star') + ' Upcoming birthdays</h3>' + (bdays.length ? bdays.map((x) => '<div class="row-between small" style="padding:6px 0;border-bottom:1px dashed var(--line)"><span><b>' + esc(x.p.name) + '</b> turns ' + x.b.age + '</span><span class="chip ' + (x.b.days <= 3 ? 'great' : 'accent') + '">' + relWord(x.b.days) + '</span></div>').join('') : '<p class="small muted">No birthdays in the next 30 days.</p>') + '</div></div></div>';
        el.querySelectorAll('[data-r2="vastu:blank"]').forEach((a) => a.addEventListener('click', () => lsSet('vastuBlank', true)));
        el.querySelectorAll('[data-h]').forEach((b) => b.addEventListener('click', () => (b.dataset.h === 'client' ? editClient() : editReminder())));
      };
      draw(); this.onData = draw;
    },
  };

  /* ---------- Tarot ---------- */
  const SUIT_SVG = {
    Wands: '<path d="M32 10v44M26 16l6-6 6 6M24 30c4 2 12 2 16 0M24 40c4 2 12 2 16 0"/>',
    Cups: '<path d="M18 14h28c0 14-6 22-14 22S18 28 18 14zM32 36v12M22 52h20"/>',
    Swords: '<path d="M32 8l5 8v26h-10V16zM22 44h20M32 44v12"/>',
    Pentacles: '<circle cx="32" cy="32" r="20"/><path d="M32 14l5.3 16.4H54l-13.6 9.9 5.2 16.3L32 46.6 18.4 56.6l5.2-16.3L10 30.4h16.7z"/>',
    Major: '<circle cx="32" cy="32" r="18"/><circle cx="32" cy="32" r="8"/><path d="M32 8v8M32 48v8M8 32h8M48 32h8M15 15l6 6M43 43l6 6M15 49l6-6M43 21l6-6"/>',
  };
  function cardFace(c, rev) {
    return '<div class="tcard' + (rev ? ' rev' : '') + '" style="--cc:' + c.color + '"><div class="tc-in"><span class="tc-num">' + esc(c.num) + '</span><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + SUIT_SVG[c.suit || 'Major'] + '</svg><span class="tc-name">' + esc(c.name) + '</span></div></div>';
  }
  function rng(n) { const a = new Uint32Array(1); (crypto || window.msCrypto).getRandomValues(a); return a[0] % n; }
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function drawCards(spread, seed) {
    const deck = D.TAROT.deck, n = D.TAROT.spreads[spread].positions.length, idx = deck.map((_, i) => i);
    let h = seed != null ? seed : null;
    const rnd = (m) => { if (h == null) return rng(m); h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0; return (h ^ (h >>> 16)) % m; };
    for (let i = idx.length - 1; i > 0; i--) { const j = rnd(i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    return idx.slice(0, n).map((i) => ({ id: deck[i].id, rev: rnd(100) < 30 }));
  }
  const cardById = (id) => D.TAROT.deck.find((c) => c.id === id);
  function ynVerdict(c, rev) { const base = c.yn; const v = rev ? (base === 'yes' ? 'maybe' : 'no') : base; return v; }
  function summary(r) {
    const cards = r.cards.map((x) => ({ ...x, c: cardById(x.id) }));
    const majors = cards.filter((x) => x.c.arcana === 'Major').length, revs = cards.filter((x) => x.rev).length;
    const suits = {}; cards.forEach((x) => { if (x.c.suit) suits[x.c.suit] = (suits[x.c.suit] || 0) + 1; });
    const top = Object.entries(suits).sort((a, b) => b[1] - a[1])[0];
    const lines = [];
    if (r.spread === 'yn') { const v = ynVerdict(cards[0].c, cards[0].rev); lines.push('**The answer leans ' + v.toUpperCase() + '.** ' + cards[0].c.name + (cards[0].rev ? ' (reversed)' : '') + ': ' + (cards[0].rev ? cards[0].c.rev : cards[0].c.up) + '.'); }
    if (majors >= Math.max(2, cards.length / 2)) lines.push('Many Major Arcana cards: this is a significant life moment guided by bigger forces.');
    if (top && top[1] >= 2) lines.push('Mostly ' + top[0] + ': the theme is ' + D.TAROT.deck.find((c) => c.suit === top[0]).theme + '.');
    if (revs >= Math.ceil(cards.length / 2) && cards.length > 1) lines.push('Several reversed cards suggest inner blocks or delays; slow down and reflect before acting.');
    if (r.spread !== 'yn') lines.push('Focus card: **' + cards[cards.length - 1].c.name + '**, ' + (cards[cards.length - 1].rev ? cards[cards.length - 1].c.rev : cards[cards.length - 1].c.up).toLowerCase() + '.');
    return lines.join('\n\n');
  }
  app.views.tarot = {
    onData() {},
    render(el) {
      let spread = lsGet('tSpread', 'day'), cur = null, ctl = null;
      const p = app.activeProfile();
      el.innerHTML = '<div class="page-head center"><div><div class="kicker">Tarot</div><h1>Tarot reading</h1><p class="lede">Pick a spread, ask your question, and draw. The Card of the Day stays the same all day for grounding; other spreads draw fresh cards each time.</p></div></div>' +
        '<div class="spreads" id="t-spreads">' + Object.entries(D.TAROT.spreads).map(([k, v]) => '<button class="spread" data-sp="' + k + '" aria-pressed="' + (k === spread) + '"><b>' + v.label + '</b><span>' + v.sub + '</span></button>').join('') + '</div>' +
        '<div class="card" style="margin:14px 0"><label class="field"><span>Your question (optional, recommended)</span><div class="row" style="gap:8px;flex-wrap:nowrap"><input class="input grow" id="t-q" placeholder="e.g. Should I take this job offer?"><button class="btn primary" id="t-draw">' + icon('refresh') + 'Draw</button></div></label></div>' +
        '<div id="t-out"></div><div class="card" style="margin-top:16px"><div class="card-head"><h3>History</h3><span class="small muted">Your saved readings</span></div><div id="t-hist"></div></div>';
      const out = $('#t-out', el);
      const show = (r) => {
        cur = r; const sp = D.TAROT.spreads[r.spread];
        out.innerHTML = '<div class="card"><div class="card-head"><h3>' + sp.label + '</h3><span class="small muted">' + esc(r.q || 'No question') + ' · ' + new Date(r.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) + '</span></div><div class="tspread' + (r.spread === 'celtic' ? ' celtic' : '') + '">' +
          r.cards.map((x, i) => { const c = cardById(x.id); return '<div class="tslot" style="animation-delay:' + i * 90 + 'ms"><div class="tpos">' + (i + 1) + '. ' + esc(sp.positions[i]) + '</div>' + cardFace(c, x.rev) + (x.rev ? '<div class="tiny muted" style="text-align:center">reversed</div>' : '') + '</div>'; }).join('') + '</div>' +
          '<div class="tmeanings">' + r.cards.map((x, i) => { const c = cardById(x.id); return '<div class="yoga"><span class="dot-q ' + (x.rev ? 'ok' : 'good') + '" style="margin-top:7px"></span><div><b>' + esc(sp.positions[i]) + ': ' + esc(c.name) + (x.rev ? ' (reversed)' : '') + '</b>' + (r.spread === 'yn' ? ' <span class="chip ' + ({ yes: 'good', maybe: 'ok', no: 'bad' }[ynVerdict(c, x.rev)]) + '">' + ynVerdict(c, x.rev) + '</span>' : '') + '<div class="small muted">' + esc(x.rev ? c.rev : c.up) + (c.suit ? ' · ' + c.el + ' suit: ' + c.theme : ' · Major Arcana: a big life lesson') + '</div></div></div>'; }).join('') + '</div>' +
          '<div class="callout" style="margin-top:12px"><b>Interpretation</b><div class="ai-body" id="t-ai">' + md(r.ai || summary(r)) + '</div></div>' +
          '<div class="row" style="margin-top:10px"><button class="btn accent" id="t-interp"' + (S.caps.sample ? '' : ' hidden') + '>' + icon('ask') + 'Interpret with Anubhuti</button><button class="btn ghost" id="t-copy">' + icon('copy') + 'Copy reading</button></div></div>';
        $('#t-copy', out).addEventListener('click', () => copyText(sp.label + (r.q ? ' — ' + r.q : '') + '\n' + r.cards.map((x, i) => sp.positions[i] + ': ' + cardById(x.id).name + (x.rev ? ' (reversed)' : '')).join('\n') + '\n\n' + (r.ai || summary(r)).replace(/\*\*/g, '')));
        const ib = $('#t-interp', out);
        ib && ib.addEventListener('click', async () => {
          const box = $('#t-ai', out); if (ctl) ctl.abort(); ctl = new AbortController(); ib.disabled = true;
          box.innerHTML = '<span class="thinking"><i></i><i></i><i></i> Reading the cards</span>';
          const pr = app.activeProfile();
          const prompt = 'You are a warm, wise tarot reader for an Indian spiritual practice called Anubhuti. Give a clear, kind interpretation (under 220 words) in the language of the question. Tie the cards together, answer the question directly, end with one practical step. Avoid fear and absolute predictions.\n\nSpread: ' + sp.label + '\nQuestion: ' + (r.q || '(none: general guidance)') + (pr ? '\nSeeker: ' + pr.name.split(' ')[0] : '') + '\nCards:\n' + r.cards.map((x, i) => (i + 1) + '. ' + sp.positions[i] + ': ' + cardById(x.id).name + (x.rev ? ' (reversed)' : '') + ' — ' + (x.rev ? cardById(x.id).rev : cardById(x.id).up)).join('\n');
          try { const res = await S.caps.sample(prompt, { signal: ctl.signal, cache: false, onText: ({ text }) => { box.innerHTML = md(text); } }); r.ai = res.text; box.innerHTML = md(res.text); if (r.id) S.saveItem('readings', r); }
          catch (e) { box.innerHTML = md(summary(r)) + (e.code !== 'cancelled' ? '<p class="small muted">Anubhuti could not interpret just now' + (e.code === 'not_granted' ? ' (permission was not given)' : '') + '.</p>' : ''); }
          ib.disabled = false;
        });
      };
      const hist = () => {
        const list = (S.state.readings || []).slice().sort((a, b) => b.at - a.at).slice(0, 12);
        $('#t-hist', el).innerHTML = list.length ? list.map((r) => '<button class="issue" style="width:100%;text-align:left;background:none;border-left:0;border-right:0;border-top:0;cursor:pointer" data-rd="' + r.id + '"><span class="dot-q good"></span><span class="grow"><b>' + esc(D.TAROT.spreads[r.spread].label) + '</b> · ' + esc(r.q || 'General') + '<div class="tiny muted">' + r.cards.map((x) => cardById(x.id).name + (x.rev ? ' ℞' : '')).join(', ') + ' · ' + new Date(r.at).toLocaleDateString('en-IN') + '</div></span></button>').join('') : '<p class="small muted">No readings yet.</p>';
        $$('[data-rd]', el).forEach((b) => b.addEventListener('click', () => { const r = S.state.readings.find((x) => x.id === b.dataset.rd); if (r) { show(r); window.scrollTo({ top: out.offsetTop - 80, behavior: 'smooth' }); } }));
      };
      $('#t-spreads', el).addEventListener('click', (e) => { const b = e.target.closest('[data-sp]'); if (!b) return; spread = b.dataset.sp; lsSet('tSpread', spread); $$('[data-sp]', el).forEach((x) => x.setAttribute('aria-pressed', x === b)); });
      $('#t-draw', el).addEventListener('click', () => {
        const q = $('#t-q', el).value.trim(), today = A.todayStr(app.tz());
        const seed = spread === 'day' ? hashStr(today + ':' + ((app.activeProfile() || {}).id || 'me')) : null;
        const r = { spread, q, at: Date.now(), cards: drawCards(spread, seed), person: (app.activeProfile() || {}).id || null };
        if (spread === 'day') { const ex = (S.state.readings || []).find((x) => x.spread === 'day' && x.day === today && x.person === r.person); if (ex) { show(ex); toast('Your card for today'); return; } r.day = today; }
        S.saveItem('readings', r); show(r); hist();
      });
      $('#t-q', el).addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#t-draw', el).click(); });
      hist();
      const today = A.todayStr(app.tz()), ex = (S.state.readings || []).find((x) => x.spread === 'day' && x.day === today && x.person === ((p || {}).id || null));
      if (ex) show(ex); else out.innerHTML = '<div class="card empty">' + cardFace(D.TAROT.deck[0], false).replace('tcard', 'tcard back') + '<p>Choose a spread and tap <b>Draw</b>.</p></div>';
      return () => ctl && ctl.abort();
    },
  };

  /* ---------- Compare ---------- */
  app.views.compare = {
    render(el) {
      const ps = app.profiles();
      const st = Object.assign({ a: ps[0] && ps[0].id, b: ps[1] && ps[1].id, rel: 'partner' }, lsGet('cmp', {}));
      el.innerHTML = '<div class="page-head center"><div><div class="kicker">Compare</div><h1>Friends & family compare</h1><p class="lede">Run a full 36-guna check between any two saved people, with Manglik, Moon-sign harmony and numerology in plain words. Great for partners, siblings, friends, parents and children.</p></div></div>' +
        (ps.length < 2 ? '<div class="card empty">' + icon('people') + '<div><h3>Add at least two people</h3><p>Compare uses saved charts from the Family Vault.</p></div><button class="btn primary" data-act-add>' + icon('plus') + 'Add member</button></div>' :
          '<div class="card compare-form"><div class="grid g3" style="align-items:end"><label class="field"><span>Person A</span><select class="input" id="c-a">' + ps.map((x) => '<option value="' + x.id + '"' + (x.id === st.a ? ' selected' : '') + '>' + esc(x.name) + '</option>').join('') + '</select></label><label class="field"><span>Person B</span><select class="input" id="c-b">' + ps.map((x) => '<option value="' + x.id + '"' + (x.id === st.b ? ' selected' : '') + '>' + esc(x.name) + '</option>').join('') + '</select></label>' +
          '<label class="field"><span>Relationship</span><select class="input" id="c-rel">' + [['partner', 'Marriage / partner'], ['friend', 'Friends'], ['sibling', 'Siblings'], ['parent', 'Parent and child'], ['business', 'Business partners']].map(([v, l]) => '<option value="' + v + '"' + (v === st.rel ? ' selected' : '') + '>' + l + '</option>').join('') + '</select></label></div><button class="btn primary wide" id="c-go" style="margin-top:12px">' + icon('people') + 'Compare compatibility</button></div><div id="c-out" style="margin-top:16px"></div>');
      const go = () => {
        st.a = $('#c-a', el).value; st.b = $('#c-b', el).value; st.rel = $('#c-rel', el).value; lsSet('cmp', st);
        const out = $('#c-out', el);
        if (st.a === st.b) { out.innerHTML = '<div class="callout">Choose two different people.</div>'; return; }
        const pa = ps.find((x) => x.id === st.a), pb = ps.find((x) => x.id === st.b), ca = app.chart(pa), cb = app.chart(pb);
        const boyFirst = (pa.gender || 'male') === 'male' || (pb.gender === 'female');
        const m = D.kundli.milan(boyFirst ? ca : cb, boyFirst ? cb : ca);
        const ma = ca.yogas.find((y) => y.name.startsWith('Manglik')), mb = cb.yogas.find((y) => y.name.startsWith('Manglik'));
        const na = N.dobNumbers(pa.dob), nb = N.dobNumbers(pb.dob), nc = N.compatibility(na.mulank, nb.mulank);
        const d = ((cb.moonSign - ca.moonSign + 12) % 12) + 1, moonOk = ![2, 12, 5, 9, 6, 8].includes(d);
        const pct = Math.round((m.total / 36) * 100);
        const relNote = { partner: 'For marriage, 18+ is acceptable and 28+ excellent. Check Manglik and Nadi closely.', friend: 'For friends, focus on Graha Maitri (mental wavelength), Gana (temperament) and numerology.', sibling: 'For siblings, look at Gana and Moon-sign harmony for day-to-day understanding.', parent: 'For parent and child, Graha Maitri and Moon-sign harmony show how easily you understand each other.', business: 'For business, Graha Maitri, Tara and numerology matter most; Nadi and Yoni matter less.' }[st.rel];
        out.innerHTML = '<div class="grid g2"><div class="card score-card"><div class="row" style="gap:18px"><div class="ring-big" style="--p:' + pct + '"><span>' + m.total + '<small>/36</small></span></div><div><h2>' + esc(m.verdict[1]) + '</h2><p class="small muted">' + esc(pa.name) + ' & ' + esc(pb.name) + '</p><p class="small">' + esc(relNote) + '</p></div></div></div>' +
          '<div class="card stack"><h3>In plain words</h3><div class="issue"><span class="dot-q ' + (moonOk ? 'good' : 'ok') + '"></span><span>Moon signs ' + D.SIGNS[ca.moonSign].en + ' and ' + D.SIGNS[cb.moonSign].en + ' are ' + d + '/' + (((ca.moonSign - cb.moonSign + 12) % 12) + 1) + ' apart: ' + (moonOk ? 'emotionally in tune.' : 'needs patience and understanding.') + '</span></div>' +
          '<div class="issue"><span class="dot-q ' + (ma.present === mb.present ? 'good' : 'bad') + '"></span><span>Manglik: ' + esc(pa.name.split(' ')[0]) + ' ' + (ma.present ? 'is' : 'is not') + ', ' + esc(pb.name.split(' ')[0]) + ' ' + (mb.present ? 'is' : 'is not') + '. ' + (ma.present === mb.present ? 'Balanced.' : st.rel === 'partner' ? 'One-sided Manglik: an astrologer should check cancellations.' : 'Matters mainly for marriage.') + '</span></div>' +
          '<div class="issue"><span class="dot-q ' + nc.level + '"></span><span>Numerology: mulank ' + na.mulank + ' and ' + nb.mulank + ' are ' + (nc.level === 'good' ? 'friendly' : nc.level === 'bad' ? 'clashing' : 'neutral') + '.</span></div>' +
          '<div class="issue"><span class="dot-q ' + (m.rows[7][2] ? 'good' : 'bad') + '"></span><span>' + (m.rows[7][2] ? 'No Nadi dosha.' : 'Nadi dosha (same nadi): traditionally important for marriage; remedies exist.') + '</span></div></div>' +
          '<div class="card span2"><div id="c-milan"></div><div class="row" style="margin-top:10px"><a class="btn accent" href="#ask" id="c-ask">' + icon('ask') + 'Ask Anubhuti about this match</a></div></div></div>';
        D.kundli.renderMilan($('#c-milan', out), boyFirst ? pa : pb, boyFirst ? pb : pa);
        if (st.rel === 'partner') $('#c-milan', out).insertAdjacentHTML('afterend', D.kundli.matchExtras(boyFirst ? pa : pb, boyFirst ? pb : pa));
        $('#c-ask', out).addEventListener('click', () => lsSet('askDraft', 'Compare ' + pa.name + ' and ' + pb.name + ' as ' + $('#c-rel', el).selectedOptions[0].textContent.toLowerCase() + '. Gun milan ' + m.total + '/36. What are the strengths, the challenges and practical advice?'));
      };
      const b = $('#c-go', el); b && b.addEventListener('click', go);
      if (b && lsGet('cmp', null)) go();
    },
  };

  /* ---------- Family Vault (replaces the basic list) ---------- */
  app.views.people = {
    render(el) {
      const draw = () => {
        const ps = app.profiles(), cur = app.activeProfile();
        const up = ps.map((x) => ({ p: x, b: nextBirthday(x) })).sort((a, b) => a.b.days - b.b.days);
        el.innerHTML = '<div class="page-head center"><div><div class="kicker">Family Vault</div><h1>Family vault</h1><p class="lede">Save your loved ones’ kundlis in one place. Birthday reminders, yearly Varshphal and rituals, all for the people who matter most.</p></div></div>' +
          '<div class="row-between" style="margin-bottom:12px"><span class="muted">' + ps.length + ' family member' + (ps.length === 1 ? '' : 's') + ' saved</span><button class="btn primary" data-new>' + icon('plus') + 'Add member</button></div>' +
          (ps.length ? (up.filter((x) => x.b.days <= 60).length ? '<div class="bday-strip">' + up.filter((x) => x.b.days <= 60).map((x) => '<div class="bday"><span class="avatar">' + esc(initials(x.p.name)) + '</span><div><b>' + esc(x.p.name.split(' ')[0]) + '</b><div class="tiny muted">turns ' + x.b.age + ' ' + relWord(x.b.days) + '</div></div></div>').join('') + '</div>' : '') +
            '<div class="people">' + ps.map((p) => {
              const ch = app.chart(p), n = N.dobNumbers(p.dob), b = nextBirthday(p);
              return '<div class="card person' + (cur && cur.id === p.id ? ' active' : '') + '"><span class="avatar" style="width:46px;height:46px;font-size:1.05rem">' + esc(initials(p.name)) + '</span><div class="grow stack-sm"><div class="row-between"><b>' + esc(p.name) + '</b>' + (cur && cur.id === p.id ? '<span class="chip accent">Active</span>' : '') + '</div><div class="small muted">' + esc(p.relation || '') + (p.relation ? ' · ' : '') + esc(app.fmtDob(p)) + '</div>' +
                '<div class="row small" style="gap:6px"><span class="chip">Lagna ' + D.SIGNS[ch.lagna].sa + '</span><span class="chip">Moon ' + D.SIGNS[ch.moonSign].sa + '</span><span class="chip">' + D.NAKSHATRAS[ch.moonNak].name + '</span><span class="chip">Mulank ' + n.mulank + '</span></div>' +
                '<div class="small">🎂 Birthday ' + relWord(b.days) + ' (turns ' + b.age + ')</div>' + (p.rituals ? '<div class="small callout" style="padding:6px 10px"><b>Rituals:</b> ' + esc(p.rituals) + '</div>' : '') +
                '<div class="row" style="gap:6px;margin-top:4px"><button class="btn sm" data-use="' + p.id + '" data-go="kundli">' + icon('kundli') + 'Kundli</button><button class="btn sm" data-use="' + p.id + '" data-go="varsha">' + icon('calendar') + 'Varshphal ' + new Date().getFullYear() + '</button><button class="btn sm ghost" data-use="' + p.id + '">Make active</button><button class="btn sm ghost" data-edit="' + p.id + '">' + icon('edit') + 'Edit</button></div></div></div>';
            }).join('') + '</div>'
            : '<div class="card empty dashed">' + icon('people') + '<div><p>No family members yet. Tap <b>Add member</b> to save a kundli.</p></div></div>');
      };
      draw();
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-new]')) app.editProfile();
        const u = e.target.closest('[data-use]');
        if (u) { S.saveSettings({ activeProfile: u.dataset.use }); const g = u.dataset.go; if (g === 'kundli') { lsSet('ktab', 'overview'); app.go('kundli'); } else if (g === 'varsha') { lsSet('ktab', 'varsha'); lsSet('kyear', new Date().getFullYear()); app.go('kundli'); } else toast('Active profile changed'); }
        const ed = e.target.closest('[data-edit]'); if (ed) app.editProfile(app.profiles().find((p) => p.id === ed.dataset.edit));
      });
      this.onData = draw;
    },
  };

  /* ---------- 27 Nakshatras ---------- */
  app.views.nakshatras = {
    onData() {},
    render(el) {
      const p = app.activeProfile(), ch = p && app.chart(p), todayNak = A.nakIndex(A.nowJd());
      const GANA = 'DMRMDMDDRRMMDRDRDRRMMDRRMMD', GN = { D: 'Deva', M: 'Manushya', R: 'Rakshasa' };
      el.innerHTML = '<div class="page-head center"><div><div class="kicker">27 Nakshatras</div><h1>The lunar mansions</h1><p class="lede">Traits of each star: span, ruler, deity, symbol, nature and what it is good for.</p></div></div><div class="row" style="justify-content:center;margin-bottom:14px"><input class="input" id="nq" placeholder="Search by name, deity or planet" style="max-width:360px"></div><div class="lib-grid" id="nk"></div>';
      const draw = (q) => {
        $('#nk', el).innerHTML = D.NAKSHATRAS.map((n, i) => ({ n, i, t: D.NAK_TRAITS[i] })).filter((x) => !q || (x.n.name + ' ' + x.n.deity + ' ' + x.n.lord + ' ' + x.t.join(' ')).toLowerCase().includes(q)).map(({ n, i, t }) => {
          const s0 = i * 360 / 27, s1 = s0 + 360 / 27;
          const span = D.SIGNS[Math.floor(s0 / 30)].sa + ' ' + A.fmtDeg(s0 % 30).replace(/′.*/, '′') + ' – ' + D.SIGNS[Math.floor((s1 - 0.0001) / 30)].sa + ' ' + A.fmtDeg(((s1 - 0.0001) % 30) + 0.0001).replace(/′.*/, '′');
          const mine = ch && ch.moonNak === i, now = todayNak === i;
          return '<div class="lib-item nak' + (mine ? ' mine' : '') + '"><div class="t1"><b>' + (i + 1) + '. ' + n.name + '</b>' + (mine ? '<span class="chip accent">' + esc(p.name.split(' ')[0]) + '’s star</span>' : now ? '<span class="chip good">Moon today</span>' : '') + '</div><div class="tiny muted">' + span + '</div><div class="row" style="gap:4px"><span class="chip">' + n.lord + '</span><span class="chip">' + GN[GANA[i]] + '</span><span class="chip">' + t[1] + '</span></div><div class="small"><b>Symbol:</b> ' + t[0] + ' · <b>Deity:</b> ' + n.deity + '</div><div class="small">' + t[2] + '</div><div class="small muted"><b>Good for:</b> ' + t[3] + '</div></div>';
        }).join('') || '<div class="empty">No star matches.</div>';
      };
      $('#nq', el).addEventListener('input', (e) => draw(e.target.value.trim().toLowerCase())); draw('');
    },
  };

  /* ---------- Remedies ---------- */
  app.views.remedies = {
    render(el) {
      const draw = () => {
        const p = app.activeProfile();
        let mine = '';
        if (p) {
          const ch = app.chart(p), cd = A.currentDasha(ch.dasha, A.nowJd()), P = ch.planets;
          const helpful = new Set([1, 5, 9].map((h) => D.SIGNS[(ch.lagna + h - 1) % 12].lord));
          const need = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'].filter((x) => P[x].dignity === 'Debilitated' || P[x].combust || ch.strength[x] < 38);
          if (cd && !need.includes(cd.md.lord)) need.push(cd.md.lord);
          mine = '<div class="card" style="margin-bottom:16px"><div class="card-head"><h3>For ' + esc(p.name.split(' ')[0]) + '</h3><span class="small muted">Planets that need support now</span></div><div class="grid g2">' + need.map((x) => {
            const R = D.REMEDY[x], why = [P[x] && P[x].dignity === 'Debilitated' ? 'debilitated' : '', P[x] && P[x].combust ? 'combust' : '', ch.strength[x] != null && ch.strength[x] < 38 ? 'low strength' : '', cd && cd.md.lord === x ? 'running mahadasha' : ''].filter(Boolean).join(', ');
            return '<div class="remedy"><div class="row-between"><b>' + x + ' · ' + D.PLANETS[x].sa + '</b><span class="chip ok">' + esc(why) + '</span></div><dl class="kv small"><dt>Mantra</dt><dd><i>' + esc(R.beej) + '</i> · ' + R.count.toLocaleString('en-IN') + ' times over 40 days</dd><dt>Daan</dt><dd>' + esc(R.daan) + ' on ' + D.PLANETS[x].day + '</dd><dt>Rudraksha</dt><dd>' + R.rud + ' mukhi</dd><dt>Gemstone</dt><dd>' + (helpful.has(x) ? esc(D.PLANETS[x].gem) + ' <span class="muted">(a helpful planet for this lagna)</span>' : '<span class="muted">Not advised: ' + x + ' is not a lagna, 5th or 9th lord. Use mantra and daan instead.</span>') + '</dd><dt>Lal Kitab</dt><dd>' + esc(D.LALKITAB[x].remedy) + '</dd></dl></div>';
          }).join('') + '</div><p class="note" style="margin-top:10px">Start remedies on the planet’s weekday, in the Shukla paksha if possible. Wear gemstones only after a consultation.</p></div>';
        } else mine = '<div class="card" style="margin-bottom:16px">' + app.profileBar() + '</div>';
        el.innerHTML = '<div class="page-head center"><div><div class="kicker">Remedies</div><h1>Rudraksha, gems & mantras</h1><p class="lede">Simple, traditional remedies, with personal suggestions from the active person’s chart.</p></div></div>' + mine +
          '<div class="grid g2"><div class="card"><h3 style="margin-bottom:8px">Rudraksha guide</h3><div class="table-wrap"><table class="t"><thead><tr><th>Mukhi</th><th>Planet</th><th>Deity</th><th>Benefit</th></tr></thead><tbody>' + D.RUDRAKSHA.map((r) => '<tr><td class="num"><b>' + r[0] + '</b></td><td>' + r[1] + '</td><td class="small">' + r[2] + '</td><td class="small">' + r[3] + '</td></tr>').join('') + '<tr><td><b>Gauri Shankar</b></td><td>Moon</td><td class="small">Shiva-Parvati</td><td class="small">Harmony between partners</td></tr></tbody></table></div></div>' +
          '<div class="card"><h3 style="margin-bottom:8px">Navagraha remedies</h3><div class="table-wrap"><table class="t"><thead><tr><th>Planet</th><th>Gem</th><th>Day</th><th>Daan</th></tr></thead><tbody>' + D.PLANET_ORDER.map((x) => '<tr><td><b>' + x + '</b></td><td class="small">' + D.PLANETS[x].gem + '</td><td class="small">' + D.PLANETS[x].day + '</td><td class="small">' + D.REMEDY[x].daan + '</td></tr>').join('') + '</tbody></table></div></div>' +
          '<div class="card span2"><h3 style="margin-bottom:8px">Beej mantras</h3><div class="table-wrap"><table class="t"><thead><tr><th>Planet</th><th>Mantra</th><th>Count</th></tr></thead><tbody>' + D.PLANET_ORDER.map((x) => '<tr><td><b>' + x + '</b></td><td><i>' + D.REMEDY[x].beej + '</i></td><td class="num">' + D.REMEDY[x].count.toLocaleString('en-IN') + '</td></tr>').join('') + '</tbody></table></div></div></div>';
      };
      draw(); this.onData = draw;
    },
  };

  /* ---------- Clients ---------- */
  function editClient(c, after) {
    const isNew = !c; c = c ? { ...c } : { name: '', phone: '', city: '', notes: '', profileId: '', projectId: '' };
    const s = sheet('<h2>' + (isNew ? 'Add client' : 'Edit ' + esc(c.name)) + '</h2><form class="stack" id="cf"><label class="field"><span>Name</span><input class="input" id="cf-n" value="' + esc(c.name) + '" required></label><div class="grid g2"><label class="field"><span>Phone / WhatsApp</span><input class="input" id="cf-p" inputmode="tel" value="' + esc(c.phone) + '" placeholder="+91 98765 43210"></label><label class="field"><span>City</span><input class="input" id="cf-c" value="' + esc(c.city) + '"></label></div>' +
      '<div class="grid g2"><label class="field"><span>Linked kundli</span><select class="input" id="cf-k"><option value="">None</option>' + app.profiles().map((x) => '<option value="' + x.id + '"' + (x.id === c.profileId ? ' selected' : '') + '>' + esc(x.name) + '</option>').join('') + '</select></label><label class="field"><span>Linked floor plan</span><select class="input" id="cf-v"><option value="">None</option>' + S.state.projects.map((x) => '<option value="' + x.id + '"' + (x.id === c.projectId ? ' selected' : '') + '>' + esc(x.name) + '</option>').join('') + '</select></label></div>' +
      '<label class="field"><span>Case notes</span><textarea class="input" id="cf-t" rows="4" placeholder="Concerns, remedies given, fees, next steps…">' + esc(c.notes) + '</textarea></label><div class="sheet-actions">' + (isNew ? '' : '<button type="button" class="btn danger" data-del style="margin-right:auto">' + icon('trash') + 'Delete</button>') + '<button type="button" class="btn" data-close>Cancel</button><button class="btn primary">' + (isNew ? 'Add client' : 'Save') + '</button></div></form>');
    const f = s.el;
    f.querySelector('[data-del]') && f.querySelector('[data-del]').addEventListener('click', async () => { s.close(); if (await confirmSheet('Delete ' + c.name + '?', 'The client and their reminders will be removed.', 'Delete', true)) { S.deleteItem('clients', c.id); (S.state.reminders || []).filter((r) => r.clientId === c.id).forEach((r) => S.deleteItem('reminders', r.id)); } });
    $('#cf', f).addEventListener('submit', (e) => { e.preventDefault(); const n = $('#cf-n', f).value.trim(); if (!n) return; Object.assign(c, { name: n, phone: $('#cf-p', f).value.trim(), city: $('#cf-c', f).value.trim(), profileId: $('#cf-k', f).value, projectId: $('#cf-v', f).value, notes: $('#cf-t', f).value }); const saved = S.saveItem('clients', c); s.close(); toast(isNew ? 'Client added' : 'Saved'); after && after(saved); });
  }
  function editReminder(r, clientId) {
    const isNew = !r; r = r ? { ...r } : { clientId: clientId || '', date: A.addDays(A.todayStr(app.tz()), 1), note: '', done: false };
    const s = sheet('<h2>' + (isNew ? 'Add reminder' : 'Edit reminder') + '</h2><form class="stack" id="rf"><label class="field"><span>Client (optional)</span><select class="input" id="rf-c"><option value="">General</option>' + S.state.clients.map((x) => '<option value="' + x.id + '"' + (x.id === r.clientId ? ' selected' : '') + '>' + esc(x.name) + '</option>').join('') + '</select></label><label class="field"><span>Date</span><input class="input" type="date" id="rf-d" value="' + r.date + '" required></label><label class="field"><span>What to do</span><input class="input" id="rf-n" value="' + esc(r.note) + '" placeholder="e.g. Follow up on Vastu remedies" required></label><div class="sheet-actions">' + (isNew ? '' : '<button type="button" class="btn danger" data-del style="margin-right:auto">' + icon('trash') + 'Delete</button>') + '<button type="button" class="btn" data-close>Cancel</button><button class="btn primary">' + (isNew ? 'Add reminder' : 'Save') + '</button></div></form>');
    const f = s.el;
    f.querySelector('[data-del]') && f.querySelector('[data-del]').addEventListener('click', () => { S.deleteItem('reminders', r.id); s.close(); });
    $('#rf', f).addEventListener('submit', (e) => { e.preventDefault(); if (!$('#rf-n', f).value.trim() || !$('#rf-d', f).value) return; Object.assign(r, { clientId: $('#rf-c', f).value, date: $('#rf-d', f).value, note: $('#rf-n', f).value.trim() }); S.saveItem('reminders', r); s.close(); toast('Reminder saved'); });
  }
  app.views.clients = {
    render(el) {
      let filter = lsGet('cFilter', 'upcoming');
      const draw = () => {
        const cl = S.state.clients || [], rem = (S.state.reminders || []).slice().sort((a, b) => (a.date < b.date ? -1 : 1));
        const name = (id) => (cl.find((x) => x.id === id) || {}).name || 'General';
        const fl = rem.filter((r) => { const d = dueInfo(r); return filter === 'all' ? true : filter === 'overdue' ? d.overdue : filter === 'done' ? r.done : !r.done && d.diff >= 0; });
        el.innerHTML = '<div class="page-head"><div><div class="kicker">Clients</div><h1>Client manager</h1><p class="lede">Clients, case notes, linked kundlis and plans, and follow-up reminders in one place.</p></div><div class="row"><button class="btn" data-a="rem">' + icon('calendar') + 'Add reminder</button><button class="btn primary" data-a="cl">' + icon('plus') + 'Add client</button></div></div>' +
          '<div class="grid g2"><div class="card"><div class="card-head"><h3>Reminders</h3><div class="seg" id="rfil">' + [['upcoming', 'Upcoming'], ['overdue', 'Overdue'], ['done', 'Done'], ['all', 'All']].map(([v, l]) => '<button data-v="' + v + '" aria-pressed="' + (filter === v) + '">' + l + '</button>').join('') + '</div></div>' +
          (fl.length ? fl.map((r) => { const d = dueInfo(r); return '<div class="issue"><button class="btn icon sm ghost" data-done="' + r.id + '" aria-label="Mark done" style="' + (r.done ? 'color:var(--good)' : '') + '">' + icon(r.done ? 'check' : 'today') + '</button><div class="grow" style="cursor:pointer" data-er="' + r.id + '"><b style="' + (r.done ? 'text-decoration:line-through;opacity:.6' : '') + '">' + esc(r.note) + '</b><div class="tiny muted">' + esc(name(r.clientId)) + ' · ' + new Date(r.date + 'T12:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' }) + '</div></div><span class="chip ' + (r.done ? 'good' : d.overdue ? 'bad' : d.diff <= 1 ? 'accent' : '') + '">' + (r.done ? 'done' : d.overdue ? Math.abs(d.diff) + 'd overdue' : relWord(d.diff)) + '</span></div>'; }).join('') : '<p class="small muted">Nothing here.</p>') + '</div>' +
          '<div class="card"><div class="card-head"><h3>Clients (' + cl.length + ')</h3></div>' + (cl.length ? cl.map((c) => { const wa = c.phone.replace(/\D/g, ''); return '<div class="client"><span class="avatar">' + esc(initials(c.name)) + '</span><div class="grow"><b>' + esc(c.name) + '</b> <span class="small muted">' + esc(c.city) + '</span><div class="tiny muted">' + esc(c.phone) + '</div>' + (c.notes ? '<div class="small" style="margin-top:4px">' + esc(c.notes.slice(0, 160)) + (c.notes.length > 160 ? '…' : '') + '</div>' : '') +
            '<div class="row" style="gap:4px;margin-top:6px">' + (c.profileId ? '<button class="btn sm" data-kp="' + c.profileId + '">' + icon('kundli') + 'Kundli</button>' : '') + (c.projectId ? '<button class="btn sm" data-vp="' + c.projectId + '">' + icon('vastu') + 'Plan</button>' : '') + (wa ? '<a class="btn sm" target="_blank" rel="noopener" href="https://wa.me/' + (wa.length === 10 ? '91' + wa : wa) + '">WhatsApp</a>' : '') + '<button class="btn sm ghost" data-rc="' + c.id + '">' + icon('calendar') + 'Remind</button><button class="btn sm ghost" data-ec="' + c.id + '">' + icon('edit') + 'Edit</button></div></div></div>'; }).join('') : '<div class="empty">' + icon('people') + '<p>No clients yet. Add your first client to get started.</p></div>') + '</div></div>';
      };
      draw();
      el.addEventListener('click', (e) => {
        const t = (sel) => e.target.closest(sel);
        if (t('[data-a="cl"]')) editClient(); if (t('[data-a="rem"]')) editReminder();
        const f = t('#rfil button'); if (f) { filter = f.dataset.v; lsSet('cFilter', filter); draw(); }
        const dn = t('[data-done]'); if (dn) { const r = S.state.reminders.find((x) => x.id === dn.dataset.done); if (r) S.saveItem('reminders', { ...r, done: !r.done }); }
        const er = t('[data-er]'); if (er) editReminder(S.state.reminders.find((x) => x.id === er.dataset.er));
        const ec = t('[data-ec]'); if (ec) editClient(S.state.clients.find((x) => x.id === ec.dataset.ec));
        const rc = t('[data-rc]'); if (rc) editReminder(null, rc.dataset.rc);
        const kp = t('[data-kp]'); if (kp) { S.saveSettings({ activeProfile: kp.dataset.kp }); app.go('kundli'); }
        const vp = t('[data-vp]'); if (vp) { S.saveSettings({ vastuCurrent: vp.dataset.vp }); app.go('vastu'); }
      });
      this.onData = draw;
    },
  };

  /* ---------- Help ---------- */
  app.views.help = {
    onData() {},
    render(el) {
      const names = { home: 'Home', today: 'Daily panchang', calendar: 'Muhurat calendar', vastu: 'Vastu studio', kundli: 'Kundli', numerology: 'Numerology', tarot: 'Tarot', compare: 'Compare', people: 'Family vault', nakshatras: '27 Nakshatras', remedies: 'Remedies', clients: 'Clients', calc: 'Calculators', ask: 'Ask Anubhuti', compass: 'Compass', library: 'Library', prefs: 'Settings' };
      el.innerHTML = '<div class="page-head center"><div><div class="kicker">Help</div><h1>How to use Anubhuti</h1><p class="lede">A short guide to every feature. Each page also has its own “How to use” card at the top.</p></div></div><div class="lib-grid">' +
        Object.entries(GUIDES).map(([k, g]) => '<div class="lib-item"><div class="t1"><b>' + esc(names[k] || k) + '</b><a class="small" href="#' + k + '">Open</a></div><ol class="small" style="padding-left:18px;margin:0">' + g[1].map((x) => '<li>' + x + '</li>').join('') + '</ol></div>').join('') +
        '</div><div class="card" style="margin-top:16px"><h3>Words you will see</h3><dl class="kv small" style="margin-top:8px"><dt>Cut</dt><dd>A part of a direction is missing from the house shape (like the empty corner of an L-shaped house).</dd><dt>Extension</dt><dd>A part of the house sticks out in a direction.</dd><dt>Brahmasthan</dt><dd>The centre of the home; keep it open and light.</dd><dt>Pada</dt><dd>One of 32 entrance positions around the house.</dd><dt>Lagna</dt><dd>The rising sign at birth; it sets the houses of the chart.</dd><dt>Dasha</dt><dd>Planetary periods that show when results come.</dd><dt>Tithi</dt><dd>The lunar day (1–15 in each half of the month).</dd><dt>Reversed card</dt><dd>A tarot card drawn upside down; its energy is blocked or inward.</dd></dl></div>';
    },
  };

  D.extras = { editClient, editReminder, nextBirthday };
})(window);
