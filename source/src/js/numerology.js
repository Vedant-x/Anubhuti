/* Anubhuti — numerology calculations (Chaldean, Pythagorean, Lo Shu, Kua). */
(function (G) {
  const D = (G.Disha = G.Disha || {});
  const digits = (s) => String(s).replace(/\D/g, '').split('').map(Number);
  const sumDigits = (n) => digits(n).reduce((a, b) => a + b, 0);
  const reduce = (n) => { while (n > 9) n = sumDigits(n); return n; };
  const reduceMaster = (n) => { while (n > 9 && n !== 11 && n !== 22 && n !== 33) n = sumDigits(n); return n; };
  const PYTH = (c) => ((c.charCodeAt(0) - 65) % 9) + 1;

  function nameNumber(name, system) {
    const letters = String(name || '').toUpperCase().replace(/[^A-Z]/g, '').split('');
    const val = (c) => (system === 'pythagorean' ? PYTH(c) : D.CHALDEAN[c] || 0);
    const total = letters.reduce((a, c) => a + val(c), 0);
    const vowels = letters.filter((c) => 'AEIOU'.includes(c)).reduce((a, c) => a + val(c), 0);
    const cons = total - vowels;
    return { total, reduced: reduce(total), master: reduceMaster(total), soul: reduce(vowels), personality: reduce(cons), letters: letters.map((c) => [c, val(c)]) };
  }

  const COMPOUND = {
    10: 'Wheel of Fortune: rise and fall; good name for recognition', 11: 'Hidden dangers; needs caution and faith', 12: 'Sacrifice; others benefit from your effort',
    13: 'Change and upheaval; transformation through hard work', 14: 'Movement, trade, speculation; avoid risky ventures', 15: 'Magnetism, eloquence and gifts from others',
    16: 'The Shattered Citadel: sudden setbacks; plan carefully', 17: 'Star of the Magi: rises above trials; lasting name', 18: 'Conflict and deception; spiritual effort needed',
    19: 'Prince of Heaven: success, honour, happiness', 20: 'The Awakening: new purpose and calling', 21: 'The Crown: victory after effort', 22: 'Illusion; good intentions, poor judgement',
    23: 'Royal Star of the Lion: help from superiors, success', 24: 'Love and help from those in power', 25: 'Strength gained through experience', 26: 'Warnings about partnerships and advice',
    27: 'The Sceptre: authority and command', 28: 'Contradictions; trust can be lost', 29: 'Uncertainty and treachery from others', 30: 'Thoughtful deduction; mental superiority',
    31: 'Isolation and self-containment', 32: 'Communication and magic of persuasion', 33: 'Master teacher; same as 24 with more depth', 37: 'Good friendships and partnerships',
    41: 'Like 32: leadership through communication', 42: 'Like 24: favourable', 45: 'Like 27: authority', 46: 'Like 37: success', 50: 'Like 23: success',
  };

  function dobNumbers(dob) {
    const [y, m, d] = dob.split('-').map(Number);
    const mulank = reduce(d);
    const bhagyank = reduce(sumDigits(dob));
    const lifePath = reduceMaster(reduceMaster(d) + reduceMaster(m) + reduceMaster(sumDigits(y)));
    return { y, m, d, mulank, bhagyank, lifePath };
  }

  /* Lo Shu grid. Rows top→bottom: 4 9 2 / 3 5 7 / 8 1 6 */
  const LOSHU_LAYOUT = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];
  const PLANES = [
    { name: 'Mental plane', nums: [4, 9, 2], about: 'Thinking, memory and intellect' },
    { name: 'Emotional plane', nums: [3, 5, 7], about: 'Feelings, intuition and spirituality' },
    { name: 'Practical plane', nums: [8, 1, 6], about: 'Material action and execution' },
    { name: 'Thought plane', nums: [4, 3, 8], about: 'Planning and ideas' },
    { name: 'Will plane', nums: [9, 5, 1], about: 'Determination and persistence' },
    { name: 'Action plane', nums: [2, 7, 6], about: 'Putting plans into motion' },
    { name: 'Golden Raj Yoga', nums: [4, 5, 6], about: 'Success, prosperity and name' },
    { name: 'Silver Raj Yoga', nums: [2, 5, 8], about: 'Property, stability and wealth' },
  ];
  function loshu(dob, opts) {
    const n = dobNumbers(dob);
    const all = digits(dob.replace(/-/g, '')).filter((x) => x > 0);
    if (!opts || opts.addCore !== false) { all.push(n.bhagyank); if (n.d > 9) all.push(n.mulank); }
    const counts = {}; for (let i = 1; i <= 9; i++) counts[i] = 0;
    all.forEach((x) => counts[x]++);
    const missing = Object.keys(counts).map(Number).filter((k) => counts[k] === 0);
    const repeated = Object.keys(counts).map(Number).filter((k) => counts[k] > 1);
    const planes = PLANES.map((p) => ({ ...p, complete: p.nums.every((x) => counts[x] > 0), filled: p.nums.filter((x) => counts[x] > 0).length }));
    return { counts, missing, repeated, planes, layout: LOSHU_LAYOUT, used: all };
  }

  function personalCycles(dob, onDate) {
    const n = dobNumbers(dob);
    const [ty, tm, td] = onDate.split('-').map(Number);
    const year = reduce(n.d + n.m + sumDigits(ty));
    const month = reduce(year + tm);
    const day = reduce(month + td);
    return { year, month, day };
  }

  function kua(dob, gender) {
    let [y, m, d] = dob.split('-').map(Number);
    if (m < 2 || (m === 2 && d < 4)) y -= 1; // Chinese solar year starts ~4 Feb
    const r = reduce(sumDigits(y % 100));
    let k;
    if (gender === 'female') { k = y < 2000 ? reduce(r + 5) : reduce(r + 6); if (k === 5) k = 8; }
    else { k = y < 2000 ? 10 - r : 9 - r; k = reduce(k === 0 ? 9 : k); if (k === 5) k = 2; }
    const group = [1, 3, 4, 9].includes(k) ? 'East group' : 'West group';
    return { kua: k, group, dirs: D.KUA_DIRS[k] };
  }

  function relation(a, b) {
    const pa = D.NUMBER_PLANET[a], pb = D.NUMBER_PLANET[b];
    if (a === b) return { level: 'good', text: 'Same number: natural understanding' };
    const P = D.PLANETS[pa];
    if (P.friends.includes(pb)) return { level: 'good', text: pa + ' treats ' + pb + ' as a friend' };
    if (P.enemies.includes(pb)) return { level: 'bad', text: pa + ' treats ' + pb + ' as an enemy' };
    return { level: 'ok', text: pa + ' is neutral to ' + pb };
  }
  function compatibility(a, b) {
    const ab = relation(a, b), ba = relation(b, a);
    const score = { good: 2, ok: 1, bad: 0 };
    const s = score[ab.level] + score[ba.level];
    return { ab, ba, level: s >= 3 ? 'good' : s >= 2 ? 'ok' : 'bad' };
  }

  function numberCheck(str, mulank, bhagyank) {
    const ds = digits(str);
    if (!ds.length) return null;
    const total = ds.reduce((a, b) => a + b, 0), r = reduce(total);
    const withM = relation(mulank, r), withB = relation(bhagyank, r);
    const zeros = ds.filter((x) => x === 0).length;
    const last = ds[ds.length - 1];
    const notes = [];
    if (zeros >= 3) notes.push('Many zeros (' + zeros + '): can feel like delays or emptiness');
    if (r === 8 || r === 4) notes.push('Total ' + r + ' is a heavy vibration for most people; fine if it suits your chart');
    if ([1, 3, 5, 6].includes(r)) notes.push('Total ' + r + ' is generally considered lucky');
    return { total, reduced: r, withM, withB, last, notes, level: withM.level === 'bad' || withB.level === 'bad' ? 'bad' : withM.level === 'good' && withB.level !== 'bad' ? 'good' : 'ok' };
  }

  function full(profile, onDate) {
    const n = dobNumbers(profile.dob);
    const nm = nameNumber(profile.name, 'chaldean');
    const py = nameNumber(profile.name, 'pythagorean');
    const first = String(profile.name || '').trim().split(/\s+/)[0];
    return {
      ...n, name: nm, pythagorean: py, firstName: nameNumber(first, 'chaldean'),
      compound: COMPOUND[nm.total] || (nm.total > 50 ? COMPOUND[(nm.total % 9) + 9 * 2] : null),
      loshu: loshu(profile.dob), cycles: personalCycles(profile.dob, onDate), kua: kua(profile.dob, profile.gender),
      nameVsMulank: relation(n.mulank, nm.reduced), nameVsBhagyank: relation(n.bhagyank, nm.reduced),
    };
  }

  D.numerology = { reduce, sumDigits, nameNumber, dobNumbers, loshu, personalCycles, kua, compatibility, relation, numberCheck, full, COMPOUND };
})(typeof window !== 'undefined' ? window : globalThis);
