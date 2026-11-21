/* Anubhuti — Numerology studio. */
(function (G) {
  const D = (G.Disha = G.Disha || {});
  const { esc, $, $$, icon, toast, lsGet, lsSet } = D.ui;
  const N = D.numerology, A = D.astro, app = D.app;
  const LUCKY_COMPOUND = [1, 3, 5, 6, 10, 14, 15, 19, 21, 23, 24, 27, 32, 33, 37, 41, 42, 45, 46, 50, 51, 55];
  const lvl = { good: 2, ok: 1, bad: 0 };

  function nameScore(full, n) {
    const r = N.nameNumber(full, 'chaldean');
    const a = N.relation(n.mulank, r.reduced), b = N.relation(n.bhagyank, r.reduced);
    let score = lvl[a.level] + lvl[b.level] + (LUCKY_COMPOUND.includes(r.total) ? 1 : 0) - ([4, 8].includes(r.reduced) ? 1 : 0);
    return { full, r, a, b, score };
  }
  function suggestions(name, n) {
    const parts = name.trim().split(/\s+/), first = parts[0] || '', rest = parts.slice(1).join(' ');
    const set = new Set();
    const add = (f) => { if (f && f.toLowerCase() !== first.toLowerCase() && /^[A-Za-z]+$/.test(f)) set.add(f); };
    ['a', 'h', 'e', 'i', 'y'].forEach((c) => add(first + c));
    for (let i = 1; i < first.length; i++) add(first.slice(0, i) + first[i] + first.slice(i)); // double a letter
    for (let i = 1; i < first.length; i++) if (first[i] === first[i - 1]) add(first.slice(0, i) + first.slice(i + 1));
    add(first.replace(/a$/i, 'aa')); add(first.replace(/ee/i, 'i')); add(first.replace(/i/i, 'ee')); add(first.replace(/u/i, 'oo')); add(first.replace(/oo/i, 'u'));
    add(first.replace(/sh/i, 'sch')); add(first.replace(/v/i, 'w')); add(first.replace(/w/i, 'v')); add(first.replace(/k/i, 'kk')); add(first.replace(/th/i, 't'));
    const out = Array.from(set).map((f) => nameScore((f[0].toUpperCase() + f.slice(1)) + (rest ? ' ' + rest : ''), n));
    return out.sort((x, y) => y.score - x.score || x.full.length - y.full.length).slice(0, 8);
  }
  const chipFor = (r) => '<span class="chip ' + r.level + '">' + (r.level === 'good' ? 'friendly' : r.level === 'bad' ? 'clashing' : 'neutral') + '</span>';

  app.views.numerology = {
    render(el) {
      const draw = () => {
        const p = app.activeProfile();
        el.innerHTML = '<div class="page-head"><div><div class="kicker">Numerology</div><h1>Numbers of a life</h1><p class="lede">Chaldean name numbers, the Lo Shu grid, personal cycles and Kua directions, all from a name and a birth date.</p></div></div><div class="card" style="margin-bottom:16px">' + app.profileBar() + '</div>';
        if (!p) return;
        const today = A.todayStr(app.tz());
        const R = N.full(p, today);
        const L = R.loshu;
        el.insertAdjacentHTML('beforeend',
          '<div class="grid g4" style="margin-bottom:16px">' +
          big('Mulank · psychic', R.mulank, D.NUMBER_PLANET[R.mulank] + ' · ' + D.NUMBER_TRAITS[R.mulank].kw) +
          big('Bhagyank · destiny', R.bhagyank, D.NUMBER_PLANET[R.bhagyank] + ' · ' + D.NUMBER_TRAITS[R.bhagyank].kw) +
          big('Name number', R.name.reduced, 'Compound ' + R.name.total + (R.compound ? ' · ' + R.compound : '')) +
          big('Personal year ' + today.slice(0, 4), R.cycles.year, D.NUMBER_TRAITS[R.cycles.year].kw) + '</div>' +
          '<div class="grid g2">' +
          '<div class="card"><div class="card-head"><h3>Lo Shu grid</h3><span class="small muted">From ' + esc(p.dob.split('-').reverse().join('-')) + ' + bhagyank' + (R.d > 9 ? ' + mulank' : '') + '</span></div>' +
          '<div class="row" style="align-items:flex-start;gap:20px"><div class="loshu">' + L.layout.flat().map((n) => '<div class="' + (L.counts[n] ? 'has' : 'miss') + '" title="' + n + ': ' + D.NUMBER_PLANET[n] + '">' + (L.counts[n] ? String(n).repeat(L.counts[n]) : n) + '<small>' + D.PLANETS[D.NUMBER_PLANET[n]].abbr + '</small></div>').join('') + '</div>' +
          '<div class="grow stack-sm" style="min-width:200px">' + L.planes.map((pl) => '<div class="row-between small"><span>' + pl.name + ' <span class="muted">' + pl.nums.join('-') + '</span></span>' + (pl.complete ? '<span class="chip good">complete</span>' : '<span class="chip">' + pl.filled + '/3</span>') + '</div>').join('') + '</div></div>' +
          '<hr class="sep" style="margin:14px 0"><div class="stack-sm"><h4>Missing numbers</h4>' + (L.missing.length ? L.missing.map((m) => '<div class="small"><b>' + m + '</b> (' + D.NUMBER_PLANET[m] + '): ' + esc(D.MISSING_REMEDY[m]) + '</div>').join('') : '<div class="small">None. Every number is present.</div>') +
          (L.repeated.length ? '<h4 style="margin-top:8px">Repeated</h4><div class="small">' + L.repeated.map((r) => r + ' ×' + L.counts[r]).join(', ') + '. Repeats amplify that number’s traits; three or more can tip into its weaknesses.</div>' : '') + '</div></div>' +
          '<div class="card stack"><div class="card-head" style="margin:0"><h3>Name analysis</h3><span class="small muted">Chaldean</span></div>' +
          '<div class="letters">' + R.name.letters.map(([c, v]) => '<span>' + c + '<i>' + v + '</i></span>').join('') + '</div>' +
          '<dl class="kv"><dt>Full name</dt><dd>' + R.name.total + ' → <b>' + R.name.reduced + '</b> ' + chipFor(R.nameVsMulank) + ' with mulank, ' + chipFor(R.nameVsBhagyank) + ' with bhagyank</dd><dt>First name</dt><dd>' + R.firstName.total + ' → ' + R.firstName.reduced + '</dd><dt>Soul urge</dt><dd>' + R.name.soul + ' <span class="small muted">(vowels: inner desires)</span></dd><dt>Personality</dt><dd>' + R.name.personality + ' <span class="small muted">(consonants: how others see you)</span></dd><dt>Pythagorean</dt><dd>' + R.pythagorean.total + ' → ' + R.pythagorean.master + '</dd><dt>Life path</dt><dd>' + R.lifePath + (R.lifePath > 9 ? ' (master number)' : '') + '</dd></dl>' +
          '<div class="note">' + esc(R.compound ? 'Compound ' + R.name.total + ': ' + R.compound + '.' : 'No classical meaning is listed for compound ' + R.name.total + '.') + '</div></div>' +
          '<div class="card stack span2"><div class="card-head" style="margin:0"><h3>Name lab</h3><span class="small muted">Compare spellings against mulank ' + R.mulank + ' and bhagyank ' + R.bhagyank + '</span></div>' +
          '<div class="row"><input class="input grow" id="nl-in" placeholder="Type a spelling and press Add" style="max-width:420px"><button class="btn" id="nl-add">' + icon('plus') + 'Add</button><button class="btn ghost" id="nl-sug">' + icon('star') + 'Suggest spellings</button></div><div id="nl-out"></div></div>' +
          '<div class="card stack"><h3>Kua number & directions</h3><div class="row" style="gap:16px"><div class="bignum">' + R.kua.kua + '</div><div class="small">' + R.kua.group + '<br><span class="muted">' + (p.gender === 'female' ? 'Female' : 'Male') + ' formula, solar year from 4 Feb</span></div></div>' +
          '<div class="table-wrap"><table class="t"><tbody>' + R.kua.dirs.map((d, i) => '<tr><td>' + D.KUA_LABELS[i] + '</td><td><b>' + d + '</b></td></tr>').join('') + '<tr><td class="muted">Less favourable</td><td class="muted">' + D.vastu.DIR8.filter((d) => !R.kua.dirs.includes(d)).join(', ') + '</td></tr></tbody></table></div>' +
          '<p class="note">Sleep with your head toward the Success or Health direction; face Success while working. (Eight Mansions school, often used alongside Vastu.)</p><a class="btn sm" href="#vastu" id="kua-vastu">' + icon('vastu') + 'Show on my floor plan</a></div>' +
          '<div class="card stack"><h3>Personal cycles</h3><div class="row" style="gap:18px">' + [['Year', R.cycles.year], ['Month', R.cycles.month], ['Day', R.cycles.day]].map(([l, v]) => '<div class="stat"><span class="label">' + l + '</span><span class="value">' + v + '</span></div>').join('') + '</div>' +
          '<div class="table-wrap"><table class="t"><thead><tr><th>Month</th><th>No.</th><th>Theme</th></tr></thead><tbody>' + Array.from({ length: 12 }, (_, i) => { const mm = i + 1, c = N.personalCycles(p.dob, today.slice(0, 4) + '-' + String(mm).padStart(2, '0') + '-01'); return '<tr class="' + (+today.slice(5, 7) === mm ? 'now' : '') + '"><td>' + new Date(Date.UTC(2000, i, 1)).toLocaleDateString('en-IN', { month: 'short', timeZone: 'UTC' }) + '</td><td class="num">' + c.month + '</td><td class="small">' + esc(D.NUMBER_TRAITS[c.month].kw) + '</td></tr>'; }).join('') + '</tbody></table></div></div>' +
          '<div class="card stack"><h3>Number checker</h3><p class="small muted">Mobile, vehicle, house or bank account number.</p><input class="input mono" id="nc-in" inputmode="numeric" placeholder="e.g. 98765 43210" value="' + esc(lsGet('ncLast', '')) + '"><div id="nc-out"></div></div>' +
          '<div class="card stack"><h3>Compatibility</h3>' + (app.profiles().length > 1 ? '<select class="input" id="cm-sel">' + app.profiles().filter((x) => x.id !== p.id).map((x) => '<option value="' + x.id + '">' + esc(x.name) + '</option>').join('') + '</select><div id="cm-out"></div>' : '<p class="small muted">Add another person in the Family vault to compare numbers.</p>') + '</div>' +
          (() => {
            const lucky = Array.from(new Set([R.mulank, R.bhagyank].concat(D.PLANETS[D.NUMBER_PLANET[R.mulank]].friends.map((f) => D.PLANETS[f].number))));
            const [yy, mm] = today.split('-').map(Number), nd = new Date(Date.UTC(yy, mm, 0)).getUTCDate();
            const days = []; for (let d = 1; d <= nd; d++) { const ds = yy + '-' + String(mm).padStart(2, '0') + '-' + String(d).padStart(2, '0'), c = N.personalCycles(p.dob, ds).day; if (lucky.includes(N.reduce(d)) && lucky.includes(c)) days.push({ d, wd: new Date(Date.UTC(yy, mm - 1, d)).getUTCDay(), c }); }
            return '<div class="card stack"><h3>Lucky dates this month</h3><p class="small muted">Dates whose number and your personal day number are both lucky (' + lucky.join(', ') + ').</p><div class="row" style="gap:6px">' + (days.length ? days.map((x) => '<span class="chip ' + (+today.slice(8) === x.d ? 'great' : 'good') + '" title="Personal day ' + x.c + '">' + x.d + ' ' + ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][x.wd] + '</span>').join('') : '<span class="small">No strongly lucky dates this month.</span>') + '</div></div>';
          })() +
          '<div class="card stack"><h3>Lucky for ' + esc(p.name.split(' ')[0]) + '</h3><dl class="kv"><dt>Numbers</dt><dd>' + Array.from(new Set([R.mulank, R.bhagyank].concat(D.PLANETS[D.NUMBER_PLANET[R.mulank]].friends.map((f) => D.PLANETS[f].number)))).join(', ') + '</dd><dt>Colours</dt><dd>' + esc(D.NUMBER_TRAITS[R.mulank].colors) + '</dd><dt>Days</dt><dd>' + esc(D.NUMBER_TRAITS[R.mulank].days) + '</dd><dt>Gem</dt><dd>' + esc(D.PLANETS[D.NUMBER_PLANET[R.mulank]].gem) + '</dd><dt>Avoid</dt><dd>' + D.PLANETS[D.NUMBER_PLANET[R.mulank]].enemies.map((e) => D.PLANETS[e].number).join(', ') + ' <span class="small muted">(enemy numbers of ' + D.NUMBER_PLANET[R.mulank] + ')</span></dd></dl></div>' +
          '</div>');

        // name lab
        const n = { mulank: R.mulank, bhagyank: R.bhagyank };
        let names = lsGet('nlNames:' + p.id, [p.name]);
        if (!names.includes(p.name)) names.unshift(p.name);
        const out = $('#nl-out', el);
        const drawNames = (extra) => {
          const rows = names.map((x) => nameScore(x, n)).concat(extra || []);
          out.innerHTML = '<div class="table-wrap"><table class="t"><thead><tr><th>Spelling</th><th>Total</th><th>No.</th><th>With mulank</th><th>With bhagyank</th><th>Compound meaning</th><th></th></tr></thead><tbody>' +
            rows.map((r) => '<tr><td><b>' + esc(r.full) + '</b>' + (r.full === p.name ? ' <span class="chip">current</span>' : '') + '</td><td class="num">' + r.r.total + '</td><td class="num"><b>' + r.r.reduced + '</b></td><td>' + chipFor(r.a) + '</td><td>' + chipFor(r.b) + '</td><td class="small">' + esc(N.COMPOUND[r.r.total] || '—') + '</td><td>' + (r.full === p.name ? '' : names.includes(r.full) ? '<button class="btn sm ghost" data-rm="' + esc(r.full) + '" aria-label="Remove">' + icon('close') + '</button>' : '<button class="btn sm" data-keep="' + esc(r.full) + '">Keep</button>') + '</td></tr>').join('') + '</tbody></table></div>' +
            (extra ? '<p class="note" style="margin-top:8px">Suggestions change one letter of the first name and rank by friendliness with both core numbers and lucky compounds. Choose what still feels like you.</p>' : '');
        };
        drawNames();
        const save = () => lsSet('nlNames:' + p.id, names);
        $('#nl-add', el).addEventListener('click', () => { const v = $('#nl-in', el).value.trim(); if (!v) return; if (!names.includes(v)) names.push(v); save(); $('#nl-in', el).value = ''; drawNames(); });
        $('#nl-in', el).addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#nl-add', el).click(); });
        $('#nl-sug', el).addEventListener('click', () => drawNames(suggestions(p.name, n).filter((s) => !names.includes(s.full))));
        out.addEventListener('click', (e) => {
          const k = e.target.closest('[data-keep]'); if (k) { names.push(k.dataset.keep); save(); drawNames(); }
          const r = e.target.closest('[data-rm]'); if (r) { names = names.filter((x) => x !== r.dataset.rm); save(); drawNames(); }
        });
        // number checker
        const nc = () => {
          const v = $('#nc-in', el).value; lsSet('ncLast', v);
          const r = N.numberCheck(v, R.mulank, R.bhagyank), o = $('#nc-out', el);
          o.innerHTML = r ? '<div class="row" style="gap:14px"><div class="bignum">' + r.reduced + '</div><div class="small">Total ' + r.total + ' · ' + D.NUMBER_PLANET[r.reduced] + '<br>' + chipFor(r.withM) + ' with mulank ' + chipFor(r.withB) + ' with bhagyank</div><span class="chip ' + r.level + '" style="margin-left:auto">' + (r.level === 'good' ? 'Suits you' : r.level === 'bad' ? 'Not ideal' : 'Neutral') + '</span></div>' + r.notes.map((x) => '<div class="small muted">• ' + esc(x) + '</div>').join('') : '';
        };
        $('#nc-in', el).addEventListener('input', nc); nc();
        const cs = $('#cm-sel', el);
        if (cs) {
          const cm = () => {
            const o = app.profiles().find((x) => x.id === cs.value), on = N.dobNumbers(o.dob);
            const a = N.compatibility(R.mulank, on.mulank), b = N.compatibility(R.bhagyank, on.bhagyank);
            $('#cm-out', el).innerHTML = '<dl class="kv"><dt>Mulank ' + R.mulank + ' & ' + on.mulank + '</dt><dd><span class="chip ' + a.level + '">' + a.level + '</span> <span class="small muted">' + esc(a.ab.text) + '; ' + esc(a.ba.text) + '</span></dd><dt>Bhagyank ' + R.bhagyank + ' & ' + on.bhagyank + '</dt><dd><span class="chip ' + b.level + '">' + b.level + '</span> <span class="small muted">' + esc(b.ab.text) + '; ' + esc(b.ba.text) + '</span></dd></dl>';
          };
          cs.addEventListener('change', cm); cm();
        }
        $('#kua-vastu', el).addEventListener('click', () => lsSet('vKua', true));
      };
      const big = (l, v, s) => '<div class="card"><div class="stat"><span class="label">' + l + '</span><span class="bignum" style="margin:4px 0">' + v + '</span><span class="sub">' + esc(s) + '</span></div></div>';
      draw();
      this.onData = draw;
    },
  };
})(window);
