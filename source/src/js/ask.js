/* Anubhuti — Ask Anubhuti: an AI guide grounded in the app's own calculations. */
(function (G) {
  const D = (G.Disha = G.Disha || {});
  const { esc, $, $$, icon, toast, md, lsGet, lsSet, copyText } = D.ui;
  const A = D.astro, S = D.store, app = D.app, N = D.numerology, V = D.vastu;

  const RULES = 'You are Anubhuti, a warm and knowledgeable guide to Vedic astrology (Jyotish), Vastu Shastra, numerology and tarot inside a personal app. ' +
    'Reply in the language the person writes in (English, Hindi or Hinglish). Ground every statement about positions, dates, dashas, zones or numbers in the DATA below or in tool results; never invent placements or dates. ' +
    'If data is missing (for example no birth time), say what is uncertain. Be specific and practical: explain what a placement means for this person, then give simple remedies first (habits, mantra, colour, placement, charity) before costly ones like gemstones. ' +
    'Avoid fear and fatalism. For health, legal or money decisions, add one line suggesting a qualified professional. Use the traditional terms with a short gloss. Keep answers under about 250 words unless asked for more; use short headings and bullet points.';

  function chartText(p) {
    const ch = app.chart(p), P = ch.planets, cd = A.currentDasha(ch.dasha, A.nowJd());
    const lines = ['PERSON: ' + p.name + (p.relation ? ' (' + p.relation + ')' : '') + ', ' + (p.gender || '') + ', born ' + p.dob + ' ' + (p.tobUnknown ? '(time unknown, 12:00 used)' : p.tob) + ' at ' + p.place.name + ' (' + p.place.lat + ', ' + p.place.lon + ', UTC' + p.place.tz + ').'];
    lines.push('Lagna ' + D.SIGNS[ch.lagna].en + ' ' + (ch.asc % 30).toFixed(1) + '°; Moon sign ' + D.SIGNS[ch.moonSign].en + '; nakshatra ' + D.NAKSHATRAS[ch.moonNak].name + ' pada ' + P.Moon.pada + '. Sidereal Lahiri, whole-sign houses.');
    lines.push('Planets: ' + D.PLANET_ORDER.map((n) => n + ' ' + D.SIGNS[P[n].sign].en + ' ' + P[n].deg.toFixed(1) + '° house ' + P[n].house + ' ' + P[n].nakName + ' ' + P[n].dignity + (P[n].retro && n !== 'Rahu' && n !== 'Ketu' ? ' retro' : '') + (P[n].combust ? ' combust' : '') + ' (KP star ' + P[n].kp.star + ', sub ' + P[n].kp.sub + ')').join('; ') + '.');
    lines.push('Navamsa lagna ' + D.SIGNS[ch.ascNavamsa].en + '; D9: ' + D.PLANET_ORDER.map((n) => n + ' ' + D.SIGNS[P[n].navamsa].en).join(', ') + '.');
    if (cd) lines.push('Running Vimshottari: ' + cd.md.lord + ' mahadasha (to ' + A.fmtDate(cd.md.end, p.place.tz) + '), ' + cd.ad.lord + ' antardasha (to ' + A.fmtDate(cd.ad.end, p.place.tz) + ')' + (cd.pd ? ', ' + cd.pd.lord + ' pratyantar (to ' + A.fmtDate(cd.pd.end, p.place.tz) + ')' : '') + '. Next antardashas: ' + cd.md.sub.filter((a) => a.start >= cd.ad.end).slice(0, 3).map((a) => a.lord + ' from ' + A.fmtDate(a.start, p.place.tz)).join(', ') + '.');
    lines.push('Yogas/doshas present: ' + (ch.yogas.filter((y) => y.present).map((y) => y.name + ' (' + y.why + ')').join(' ') || 'none of those checked') + '.');
    lines.push('Shani: ' + A.saturnStatus(ch.moonSign, A.nowJd()).phase + '.');
    if (D.j2) { const mg = D.j2.mangal(ch), ck = D.j2.charaKarakas(ch); lines.push('Mangal dosha: ' + mg.level + (mg.cancel.length ? ' (cancellations: ' + mg.cancel.join('; ') + ')' : '') + '. Atmakaraka ' + ck[0].planet + ', Darakaraka ' + ck[6].planet + '. D10: ' + D.PLANET_ORDER.map((n) => n + ' ' + D.SIGNS[D.j2.varga(P[n].lon, 10)].en).join(', ') + '.'); }
    return lines.join('\n');
  }
  function numText(p) {
    const R = N.full(p, A.todayStr(app.tz()));
    return 'NUMEROLOGY: mulank ' + R.mulank + ', bhagyank ' + R.bhagyank + ', life path ' + R.lifePath + '. Name "' + p.name + '" Chaldean ' + R.name.total + ' → ' + R.name.reduced + ' (' + R.nameVsMulank.level + ' with mulank, ' + R.nameVsBhagyank.level + ' with bhagyank). Lo Shu missing: ' + (R.loshu.missing.join(', ') || 'none') + '; repeated: ' + (R.loshu.repeated.join(', ') || 'none') + '; complete planes: ' + (R.loshu.planes.filter((x) => x.complete).map((x) => x.name).join(', ') || 'none') + '. Personal year ' + R.cycles.year + ', month ' + R.cycles.month + ', day ' + R.cycles.day + '. Kua ' + R.kua.kua + ' (' + R.kua.group + '), good directions ' + R.kua.dirs.join(', ') + '.';
  }
  function todayText() {
    const pl = app.place(), d = A.todayStr(pl.tz), pc = A.panchang(d, pl), tz = pl.tz, P = pc.periods, now = A.nowJd();
    const tr = A.transits(now);
    let s = 'TODAY ' + d + ' at ' + pl.name + ': ' + pc.vara.name + ', ' + pc.month + ' ' + pc.tithi.name + ' (till ' + A.fmtTime(pc.tithi.ends, tz) + '), nakshatra ' + pc.nakshatra.name + ' (till ' + A.fmtTime(pc.nakshatra.ends, tz) + '), yoga ' + pc.yoga.name + ', karana ' + pc.karana.name + '. Sunrise ' + A.fmtTime(pc.rise, tz) + ', sunset ' + A.fmtTime(pc.set, tz) + '.';
    if (P) s += ' Rahu Kaal ' + A.fmtTime(P.rahu.start, tz) + '-' + A.fmtTime(P.rahu.end, tz) + '; Abhijit ' + A.fmtTime(P.abhijit.start, tz) + '-' + A.fmtTime(P.abhijit.end, tz) + '; good choghadiyas: ' + P.chogDay.filter((c) => c.q === 'good').map((c) => c.name + ' ' + A.fmtTime(c.start, tz)).join(', ') + '.';
    s += ' Transits: ' + D.PLANET_ORDER.map((n) => n + ' ' + D.SIGNS[tr[n].sign].en + (tr[n].retro && n !== 'Rahu' && n !== 'Ketu' ? ' R' : '')).join(', ') + '. Current time ' + A.fmtTime(now, tz) + '.';
    const p = app.activeProfile();
    if (p) { const ch = app.chart(p), tb = A.tarabala(ch.moonNak, A.nakIndex(now)), cb = A.chandrabala(ch.moonSign, Math.floor(A.moonSid(now) / 30)); s += ' For ' + p.name + ': Tarabala ' + tb.name + ' (' + tb.q + '), Chandrabala house ' + cb.house + ' (' + (cb.good ? 'good' : 'weak') + ').'; }
    return s;
  }
  function vastuProj() { return S.state.projects.find((x) => x.id === S.state.settings.vastuCurrent) || S.state.projects[0] || null; }

  function tools(used) {
    const note = (n) => used.add(n);
    const findP = (name) => { const ps = app.profiles(); if (!name) return app.activeProfile(); const q = String(name).toLowerCase(); return ps.find((p) => p.name.toLowerCase() === q) || ps.find((p) => p.name.toLowerCase().includes(q) || (p.relation || '').toLowerCase() === q) || null; };
    return [
      { name: 'list_people', description: 'Lists the people saved in the family vault with relation and birth details. Use when the user mentions someone by name or relation.', execute() { note('family vault'); return app.profiles().map((p) => ({ name: p.name, relation: p.relation || '', dob: p.dob, tob: p.tobUnknown ? 'unknown' : p.tob, place: p.place.name })); } },
      { name: 'get_chart', description: 'Returns the full computed birth chart, dasha and yogas for a saved person (by name or relation, default the active person).', inputSchema: { type: 'object', properties: { person: { type: 'string' } } }, execute(i) { const p = findP(i.person); if (!p) throw new Error('No saved person matches "' + i.person + '"'); note('chart of ' + p.name); return chartText(p) + '\n' + numText(p); } },
      { name: 'get_panchang', description: 'Computes the panchang (tithi, nakshatra, yoga, karana, sunrise, Rahu Kaal, Abhijit, choghadiya) for a date (YYYY-MM-DD) at the user location or a named Indian/world city.', inputSchema: { type: 'object', properties: { date: { type: 'string' }, city: { type: 'string' } }, required: ['date'] }, execute(i) {
        const pl = i.city ? D.PLACES.find((x) => x.name.toLowerCase().startsWith(String(i.city).toLowerCase())) || app.place() : app.place();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(i.date))) throw new Error('date must be YYYY-MM-DD');
        note('panchang ' + i.date); const pc = A.panchang(i.date, pl), tz = pl.tz, P = pc.periods;
        return { place: pl.name, weekday: pc.vara.name, month: pc.month, tithi: pc.tithi.name, tithi_ends: A.fmtTime(pc.tithi.ends, tz), nakshatra: pc.nakshatra.name, nakshatra_ends: A.fmtTime(pc.nakshatra.ends, tz), yoga: pc.yoga.name, karana: pc.karana.name, sunrise: A.fmtTime(pc.rise, tz), sunset: A.fmtTime(pc.set, tz), rahu_kaal: P && A.fmtTime(P.rahu.start, tz) + '-' + A.fmtTime(P.rahu.end, tz), abhijit: P && A.fmtTime(P.abhijit.start, tz) + '-' + A.fmtTime(P.abhijit.end, tz), choghadiya_day: P && P.chogDay.map((c) => c.name + ' ' + A.fmtTime(c.start, tz)).join(', ') };
      } },
      { name: 'find_muhurat', description: 'Scores every day of a month for an activity (griha, vehicle, business, travel, property, gold, learning), personalised to a saved person. Returns the best days with reasons.', inputSchema: { type: 'object', properties: { activity: { type: 'string', enum: Object.keys(D.MUHURAT) }, month: { type: 'string', description: 'YYYY-MM' }, person: { type: 'string' } }, required: ['activity', 'month'] }, execute(i) {
        const [y, m] = String(i.month).split('-').map(Number); if (!y || !m) throw new Error('month must be YYYY-MM');
        if (!D.MUHURAT[i.activity]) throw new Error('unknown activity');
        const p = findP(i.person), natal = p ? app.chart(p) : null; note('muhurat ' + i.month);
        return A.monthDays(y, m, app.place()).map((d) => ({ date: d.date, tithi: A.tithiName(d.tithi), nakshatra: D.NAKSHATRAS[d.nak].name, ...A.muhuratScore(d, i.activity, natal) })).filter((d) => d.level === 'great' || d.level === 'good').sort((a, b) => b.score - a.score).slice(0, 10);
      } },
      { name: 'get_transits', description: 'Sidereal planet positions for a date (YYYY-MM-DD), with house from the active person’s Moon.', inputSchema: { type: 'object', properties: { date: { type: 'string' } }, required: ['date'] }, execute(i) {
        note('transits ' + i.date); const tr = A.transits(A.jdLocal(String(i.date), '12:00', app.tz())), p = app.activeProfile(), ch = p && app.chart(p);
        return D.PLANET_ORDER.map((n) => ({ planet: n, sign: D.SIGNS[tr[n].sign].en, degree: +tr[n].deg.toFixed(1), retro: tr[n].retro, house_from_moon: ch ? ((tr[n].sign - ch.moonSign + 12) % 12) + 1 : null }));
      } },
      { name: 'numerology', description: 'Chaldean numerology for any name and birth date (YYYY-MM-DD): name number, compound, mulank, bhagyank, Lo Shu.', inputSchema: { type: 'object', properties: { name: { type: 'string' }, dob: { type: 'string' } }, required: ['name'] }, execute(i) {
        note('numerology'); const nn = N.nameNumber(String(i.name), 'chaldean'); const out = { name: i.name, total: nn.total, reduced: nn.reduced, compound_meaning: N.COMPOUND[nn.total] || null };
        if (/^\d{4}-\d{2}-\d{2}$/.test(String(i.dob || ''))) { const d = N.dobNumbers(i.dob), l = N.loshu(i.dob); Object.assign(out, { mulank: d.mulank, bhagyank: d.bhagyank, loshu_missing: l.missing, friendly_with_mulank: N.relation(d.mulank, nn.reduced).level }); }
        return out;
      } },
      { name: 'vastu_plan', description: 'Returns the analysis of the open Vastu floor plan: north, zone areas with cuts/extensions, rooms with verdicts and flags.', execute() { const v = vastuProj(); if (!v) throw new Error('No floor plan saved'); note('Vastu plan'); return V && D.vastuView.summaryText(v); } },
    ];
  }

  app.views.ask = {
    onData() {},
    render(el) {
      const caps = S.caps;
      const p = app.activeProfile();
      let history = lsGet('askHistory', []);
      const ctxOn = Object.assign({ chart: true, num: true, vastu: false, today: true, image: false }, lsGet('askCtx', {}));
      let ctl = null, busy = false;
      const preset = lsGet('askPreset', null); lsSet('askPreset', null);
      if (preset === 'vastu') { ctxOn.vastu = true; ctxOn.image = true; }

      el.innerHTML = '<div class="page-head"><div><div class="kicker">Ask Anubhuti</div><h1>Your guide, grounded in your data</h1><p class="lede">Ask about a chart, a dasha, a floor plan, a name or a date. Anubhuti reads the charts and plans you have saved and runs its own calculations, so answers come with real positions, not guesses.</p></div><button class="btn ghost" id="a-clear">' + icon('refresh') + 'New conversation</button></div>' +
        '<div class="ask"><div class="stack"><div class="chat" id="chat"></div><div class="composer"><div class="suggest" id="sugg" style="margin-bottom:8px"></div><div class="box"><textarea id="q" rows="1" placeholder="Ask anything… e.g. When is my next good period for career?"></textarea><button class="btn icon ghost" id="mic" hidden aria-label="Speak your question">' + icon('mic') + '</button><button class="btn icon primary" id="send" aria-label="Send">' + icon('send') + '</button></div><p class="tiny muted" id="a-note" style="margin-top:6px"></p></div></div>' +
        '<div class="panel"><div class="card stack"><h3>What Anubhuti can see</h3>' +
        '<label class="check"><input type="checkbox" data-c="chart"' + (ctxOn.chart ? ' checked' : '') + '> ' + (p ? esc(p.name.split(' ')[0]) + '’s birth chart & dasha' : 'Active person’s chart') + '</label>' +
        '<label class="check"><input type="checkbox" data-c="num"' + (ctxOn.num ? ' checked' : '') + '> Numerology</label>' +
        '<label class="check"><input type="checkbox" data-c="today"' + (ctxOn.today ? ' checked' : '') + '> Today’s panchang & transits</label>' +
        '<label class="check"><input type="checkbox" data-c="vastu"' + (ctxOn.vastu ? ' checked' : '') + '> Open floor plan' + (vastuProj() ? ' <span class="muted small">(' + esc(vastuProj().name) + ')</span>' : '') + '</label>' +
        '<label class="check" id="img-row" hidden><input type="checkbox" data-c="image"' + (ctxOn.image ? ' checked' : '') + '> Also show Anubhuti the annotated plan image</label>' +
        '<p class="note">With tools, Anubhuti can also look up any saved family member, any date’s panchang, transits and muhurats on its own.</p></div>' +
        '<div class="card stack"><h3>Who</h3>' + app.profileBar() + '</div></div></div>';

      const chat = $('#chat', el), q = $('#q', el), note = $('#a-note', el);
      const draft = lsGet('askDraft', null); if (draft) { q.value = draft; lsSet('askDraft', null); setTimeout(() => { q.focus(); q.style.height = Math.min(180, q.scrollHeight) + 'px'; }, 50); }
      const SUGG = p ? [
        'Give me my daily brief for today', 'Explain my lagna and Moon sign in simple words', 'What does my current dasha mean for career and money?', 'Is there any dosha in my chart? What simple remedies help?',
        'When is a good day this month to buy a vehicle?', 'Review my floor plan and list the top 3 fixes', 'Is my name number lucky for me? Suggest spellings',
      ] : ['What is Rahu Kaal and how is it calculated?', 'Which direction is best for the kitchen in Vastu?', 'What is my Lo Shu grid? (I will add my birth date)'];
      $('#sugg', el).innerHTML = SUGG.map((s) => '<button>' + esc(s) + '</button>').join('');

      function bubble(m, i) {
        if (m.role === 'user') return '<div class="msg user">' + esc(m.content) + '</div>';
        return '<div class="msg bot" data-i="' + i + '"><div class="body">' + md(m.content) + '</div>' + (m.tools && m.tools.length ? '<div class="tools-used">Checked: ' + esc(m.tools.join(', ')) + '</div>' : '') + '<div class="row" style="gap:4px;margin-top:6px"><button class="btn sm ghost" data-copy="' + i + '">' + icon('copy') + 'Copy</button>' + (caps.tts ? '<button class="btn sm ghost" data-speak="' + i + '">' + icon('speaker') + 'Listen</button>' : '') + '</div></div>';
      }
      function drawChat() {
        chat.innerHTML = history.length ? history.map(bubble).join('') : '<div class="card empty" style="margin-top:8px">' + icon('ask') + '<div><h3>Namaste' + (p ? ', ' + esc(p.name.split(' ')[0]) : '') + '</h3><p>Pick a suggestion below or ask your own question.</p></div></div>';
        $('#sugg', el).hidden = history.length > 0;
      }
      drawChat();

      function ready() {
        $('#mic', el).hidden = !caps.dictation;
        $('#img-row', el).hidden = !(caps.sampleImages && ctxOn.vastu);
        if (!caps.sample) {
          note.innerHTML = S.hasClaude ? 'Connecting to Claude…' : 'Ask Anubhuti answers when this page is opened inside Claude. Here you can copy your full context and paste it into any AI chat.';
          if (!S.hasClaude) { $('#send', el).innerHTML = icon('copy'); $('#send', el).setAttribute('aria-label', 'Copy question with context'); }
        } else note.textContent = 'Answers use your Claude account' + (caps.sampleTools ? ' and Anubhuti’s own calculations.' : '.') + ' Traditional guidance, not a substitute for professional advice.';
      }
      ready();
      S.ready.then(() => { ready(); if (preset && caps.sample && !busy) runPreset(); });

      function contextBlock() {
        const parts = [], pr = app.activeProfile();
        if (ctxOn.chart && pr) parts.push(chartText(pr));
        if (ctxOn.num && pr) parts.push(numText(pr));
        if (ctxOn.today) parts.push(todayText());
        if (ctxOn.vastu && vastuProj()) parts.push('VASTU PLAN:\n' + D.vastuView.summaryText(vastuProj()));
        if (!pr) parts.push('No person is saved yet; if the question needs a chart, ask for birth date, time and place.');
        parts.push('Saved people: ' + (app.profiles().map((x) => x.name + (x.relation ? ' (' + x.relation + ')' : '')).join(', ') || 'none') + '. Today is ' + A.todayStr(app.tz()) + '.');
        return 'DATA (computed by the app):\n' + parts.join('\n\n');
      }

      async function send(text) {
        text = (text || '').trim(); if (!text || busy) return;
        if (!caps.sample) {
          if (!S.hasClaude) return copyText(RULES + '\n\n' + contextBlock() + '\n\nQUESTION: ' + text);
          return toast('Still connecting to Claude. Try again in a moment.');
        }
        busy = true; q.value = ''; autosize();
        history.push({ role: 'user', content: text });
        const bot = { role: 'assistant', content: '', tools: [] };
        drawChat();
        chat.insertAdjacentHTML('beforeend', '<div class="msg bot" id="live"><div class="body"><span class="thinking"><i></i><i></i><i></i> Thinking</span></div></div>');
        const live = $('#live', chat);
        live.scrollIntoView({ block: 'end', behavior: 'smooth' });
        $('#send', el).innerHTML = icon('stop'); $('#send', el).setAttribute('aria-label', 'Stop');
        ctl = new AbortController();
        const used = new Set();
        const turns = [{ role: 'user', content: RULES + '\n\n' + contextBlock() }].concat(history.slice(-12));
        const opts = { signal: ctl.signal, cache: false, modelTier: S.state.settings.depth || 'default', onText: ({ text: t }) => { bot.content = t; live.querySelector('.body').innerHTML = md(t); } };
        if (caps.sampleTools) { opts.tools = tools(used); delete opts.cache; }
        if (ctxOn.vastu && ctxOn.image && caps.sampleImages && vastuProj()) { try { opts.images = [await D.vastuView.renderPng(vastuProj(), { kua: true })]; } catch (e) { /* send without image */ } }
        try {
          const r = await caps.sample(turns, opts);
          bot.content = r.text + (r.truncated ? '\n\n*(Answer was cut short. Ask me to continue.)*' : '');
        } catch (e) {
          const msg = { not_granted: 'Ask Anubhuti needs your permission to use Claude. You can allow it from this page’s permissions.', sampling_disabled: 'Claude is not available for this account.', rate_limited: e.reason === 'usage_limit' ? 'You have reached your Claude usage limit. Try again later.' : 'Too many questions at once. Wait a moment and try again.', refused: 'Anubhuti could not answer that one. Try rephrasing.', session_expired: 'Please sign in to Claude again.', prompt_too_large: 'That was too much to send. Start a new conversation.', cancelled: '' }[e.code];
          bot.content = (e.code === 'refused' ? '' : e.text || '') + (msg ? (e.text ? '\n\n' : '') + '*' + msg + '*' : e.code === 'cancelled' ? '' : '\n\n*Something went wrong. Try again.*');
          if (e.code === 'not_granted' || e.code === 'sampling_disabled') caps.sample = null;
        }
        bot.tools = Array.from(used);
        if (bot.content.trim()) history.push(bot); else history.pop();
        history = history.slice(-30); lsSet('askHistory', history);
        busy = false; ctl = null;
        $('#send', el).innerHTML = icon('send'); $('#send', el).setAttribute('aria-label', 'Send');
        drawChat(); ready();
        const last = chat.lastElementChild; last && last.scrollIntoView({ block: 'end' });
        if (S.state.settings.autoSpeak && caps.tts && bot.content) speak(bot.content);
      }
      function speak(t) { if (!caps.tts) return; const plain = t.replace(/[*#`>_-]/g, '').slice(0, 2000); caps.tts.speak(plain).catch((e) => { if (e && e.code === 'not_granted') caps.tts = null; }); }
      let presetDone = false;
      function runPreset() {
        if (presetDone) return; presetDone = true;
        const pr = app.activeProfile();
        if (preset === 'brief') send('Give me my daily brief for today: the panchang highlights, good and bad times, how my Tarabala, Chandrabala and running dasha colour the day, and one practical suggestion.');
        if (preset === 'chart') send('Explain my birth chart in simple words: lagna, Moon, strongest and weakest planets, key yogas, and what my current dasha period means. End with three practical suggestions.');
        if (preset === 'vastu') send('Review my floor plan' + (pr ? ' for ' + pr.name.split(' ')[0] : '') + '. List the most important issues first, explain why each matters, and give simple fixes that need no demolition.');
      }
      function autosize() { q.style.height = 'auto'; q.style.height = Math.min(180, q.scrollHeight) + 'px'; }

      q.addEventListener('input', autosize);
      q.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(q.value); } });
      $('#send', el).addEventListener('click', () => { if (busy && ctl) ctl.abort(); else send(q.value); });
      $('#sugg', el).addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) send(b.textContent); });
      $('#a-clear', el).addEventListener('click', () => { if (busy && ctl) ctl.abort(); history = []; lsSet('askHistory', history); drawChat(); });
      chat.addEventListener('click', (e) => {
        const c = e.target.closest('[data-copy]'); if (c) copyText(history[+c.dataset.copy].content);
        const s = e.target.closest('[data-speak]'); if (s) speak(history[+s.dataset.speak].content);
      });
      $$('[data-c]', el).forEach((c) => c.addEventListener('change', () => { ctxOn[c.dataset.c] = c.checked; lsSet('askCtx', ctxOn); ready(); }));
      // voice
      let listening = false, base = '';
      $('#mic', el).addEventListener('click', () => {
        const d = caps.dictation; if (!d) return;
        if (listening) { d.stop().catch(() => {}); return; }
        base = q.value ? q.value + ' ' : '';
        d.start().catch((e) => { if (e && e.code === 'not_granted') { caps.dictation = null; ready(); } });
      });
      if (caps.dictation) bindDictation();
      S.ready.then(() => { if (caps.dictation) bindDictation(); });
      let dictBound = false;
      function bindDictation() {
        if (dictBound) return; dictBound = true;
        const d = caps.dictation;
        d.onPartial(({ text }) => { q.value = base + text; autosize(); });
        d.onFinal(({ text }) => { base = base + text + ' '; q.value = base; autosize(); });
        d.onState(({ state }) => { listening = state === 'listening'; const m = $('#mic', el); if (m) { m.classList.toggle('accent', listening); m.setAttribute('aria-label', listening ? 'Stop listening' : 'Speak your question'); } });
      }
      if (preset && caps.sample) runPreset();
      return () => { if (ctl) ctl.abort(); if (caps.tts) try { caps.tts.stop(); } catch (e) { /* ignore */ } };
    },
  };
})(window);
