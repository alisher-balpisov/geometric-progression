// Task generators: shared helpers. Every task is built from random numbers, so each lesson gets
// fresh tasks; a small "already seen" memory (localStorage) keeps the classes from repeating them.
(function () {
  'use strict';
  const GP = (window.GP = window.GP || {});
  const G = (GP.gen = {});

  const SEEN_KEY = 'gp-seen-v1';
  const SEEN_CAP = 4000;
  const TRIES = 60;

  // ---------- random ----------

  G.rnd = function (a, b) {
    return a + Math.floor(Math.random() * (b - a + 1));
  };

  G.pick = function (list) {
    return list[G.rnd(0, list.length - 1)];
  };

  G.shuffle = function (list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = G.rnd(0, i);
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  };

  // Calls make() until ok(result) is true (or gives the last result after many tries).
  G.retry = function (make, ok) {
    let r = make();
    for (let i = 0; i < TRIES && !ok(r); i++) r = make();
    return r;
  };

  // ---------- text ----------

  G.F = function (x) {
    return GP.formatNumber(x);
  };

  G.B = function (n) {
    return 'b<sub>' + n + '</sub>';
  };

  G.money = function (x) {
    return GP.formatNumber(x) + ' ₸';
  };

  // plural(n, ['год', 'года', 'лет'])
  G.plural = function (n, forms) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return forms[0];
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
    return forms[2];
  };

  // "3 года", "5 лет"
  G.count = function (n, forms) {
    return G.F(n) + ' ' + G.plural(n, forms);
  };

  // ---------- ratio q = num/den (kept exact) ----------

  G.ratio = function (num, den) {
    den = den || 1;
    return { num: num, den: den, v: num / den };
  };

  // label: 3, −2, 1/2, −1/3, 1,1 (den 10 is a decimal)
  G.rl = function (q) {
    if (q.den === 10) return G.F(q.v);
    const sign = q.num < 0 ? '−' : '';
    return q.den === 1 ? sign + Math.abs(q.num) : sign + Math.abs(q.num) + '/' + q.den;
  };

  // label for a base of a power: (−2), (1/2), 3, 1,1
  G.rp = function (q) {
    return q.num < 0 || (q.den !== 1 && q.den !== 10) ? '(' + G.rl(q) + ')' : G.rl(q);
  };

  // first n terms of a progression, exact while every term is an integer
  G.terms = function (b1, q, n) {
    const out = [b1];
    for (let i = 1; i < n; i++) out.push((out[i - 1] * q.num) / q.den);
    return out;
  };

  // q^k as text: integers, fractions 8/27, decimals 1,331
  G.powLabel = function (q, k) {
    if (q.den === 10) return G.F(Math.pow(q.v, k));
    const sign = q.num < 0 && k % 2 === 1 ? '−' : '';
    const top = Math.pow(Math.abs(q.num), k);
    return q.den === 1 ? sign + top : sign + top + '/' + Math.pow(q.den, k);
  };

  // lines of the standard solution "b_n = b_1 * q^(n-1)"
  G.nthSolution = function (b1, q, n, value, intro) {
    const k = n - 1;
    const lines = [];
    if (intro) lines.push(intro);
    lines.push(G.B(n) + ' = ' + G.B(1) + '·q<sup>' + k + '</sup> = ' + G.F(b1) + '·' + G.rp(q) + '<sup>' + k + '</sup>');
    lines.push(G.rp(q) + '<sup>' + k + '</sup> = ' + G.powLabel(q, k) + ', поэтому ' + G.B(n) + ' = ' + G.F(value));
    lines.push('Ответ: ' + G.F(value));
    return lines;
  };

  // ---------- "already seen" memory ----------

  let seen = null;

  function hash(text) {
    let h = 5381;
    for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
    return h;
  }

  function loadSeen() {
    if (seen) return seen;
    try {
      seen = new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'));
    } catch (err) {
      console.warn('Cannot read the list of used tasks', err);
      seen = new Set();
    }
    return seen;
  }

  G.saveSeen = function () {
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(loadSeen()).slice(-SEEN_CAP)));
    } catch (err) {
      console.warn('Cannot save the list of used tasks', err);
    }
  };

  G.isSeen = function (text) {
    return loadSeen().has(hash(text));
  };

  // A set for one lesson: nothing in it repeats.
  G.session = function () {
    return new Set();
  };

  // Builds a task that is new for this lesson and (as far as possible) for earlier lessons.
  G.unique = function (make, taken) {
    const known = loadSeen();
    let task = make();
    for (let i = 0; i < TRIES; i++) {
      const h = hash(task.text);
      if (!taken.has(h) && !known.has(h)) break;
      task = make();
    }
    const h = hash(task.text);
    taken.add(h);
    known.add(h);
    return task;
  };

  // Several distinct tasks from one generator (pairs of "same type, different numbers").
  G.uniqueList = function (makers, taken) {
    const list = makers.map(function (make) {
      return G.unique(make, taken);
    });
    G.saveSeen();
    return list;
  };
})();
