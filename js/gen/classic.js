// Generators of classic tasks (levels 1-5). Every generator returns a task:
// { text, answer, unit?, hint?, solution[], type?, options? }. The answer is computed from the same
// numbers that are printed in the statement, so the key cannot disagree with the text.
(function () {
  'use strict';
  const GP = window.GP;
  const G = GP.gen;
  const rnd = G.rnd;
  const pick = G.pick;
  const F = G.F;
  const B = G.B;
  const ratio = G.ratio;
  const rl = G.rl;
  const rp = G.rp;
  const terms = G.terms;

  const HINT_NTH = 'b<sub>n</sub> = b<sub>1</sub>·q<sup>n−1</sup>';

  function seq(list, tail) {
    return list.map(F).join('; ') + (tail === false ? '' : '; …');
  }

  function randomSign() {
    return Math.random() < 0.5 ? -1 : 1;
  }

  // ---------------------------------------------------------------- level 1: warm-up

  // kind: 'int' | 'neg' | 'frac'
  function pickRatio(kind) {
    if (kind === 'int') return ratio(pick([2, 3, 4, 5, 6, 7]));
    if (kind === 'neg') return ratio(pick([-2, -3, -4, -5]));
    return ratio(pick([1, 1, -1]), pick([2, 3, 4]));
  }

  function firstTerm(kind, q, count) {
    if (kind === 'frac') return Math.pow(q.den, count - 1) * rnd(1, 4);
    if (kind === 'neg') return randomSign() * rnd(1, 9);
    return rnd(1, 12);
  }

  G.findQ = function (kind) {
    const q = pickRatio(kind);
    const t = terms(firstTerm(kind, q, 4), q, 4);
    return {
      text: 'Найдите q: ' + seq(t),
      answer: q.v,
      hint: 'q = ' + B(2) + ' : ' + B(1),
      solution: [
        'q = ' + B(2) + ' : ' + B(1) + ' = ' + F(t[1]) + ' : ' + F(t[0]) + ' = ' + rl(q),
        'Проверка: ' + F(t[2]) + ' : ' + F(t[1]) + ' = ' + rl(q),
        'Ответ: ' + rl(q)
      ]
    };
  };

  G.nextTerm = function (kind) {
    const q = pickRatio(kind);
    const t = terms(firstTerm(kind, q, 4), q, 4);
    return {
      text: 'Найдите следующий член: ' + seq(t.slice(0, 3)),
      answer: t[3],
      hint: 'Сначала найдите q, потом умножьте последний член на q',
      solution: [
        'q = ' + B(2) + ' : ' + B(1) + ' = ' + F(t[1]) + ' : ' + F(t[0]) + ' = ' + rl(q),
        'Следующий член: ' + F(t[2]) + '·' + rp(q) + ' = ' + F(t[3]),
        'Ответ: ' + F(t[3])
      ]
    };
  };

  // Is it a progression? yes: true / false (a near-miss sequence)
  G.isGP = function (yes) {
    let t;
    if (yes) {
      const q = ratio(pick([2, 3, 4, 5, 6, -2, -3, -4]));
      t = terms(rnd(1, 9), q, 4);
    } else {
      const kind = pick(['arith', 'squares', 'broken']);
      if (kind === 'arith') {
        const a = rnd(1, 15);
        const d = rnd(2, 9);
        t = [a, a + d, a + 2 * d, a + 3 * d];
      } else if (kind === 'squares') {
        const k = rnd(1, 9);
        t = [k * k, (k + 1) * (k + 1), (k + 2) * (k + 2), (k + 3) * (k + 3)];
      } else {
        t = terms(rnd(1, 9), ratio(pick([2, 3, 4])), 4);
        t[3] += pick([-3, -2, -1, 1, 2, 3]);
      }
    }
    const r = [t[1] / t[0], t[2] / t[1], t[3] / t[2]];
    return {
      text: 'Является ли последовательность ' + seq(t, false) + ' геометрической прогрессией?',
      type: 'choice',
      options: ['Да', 'Нет'],
      answer: yes ? 0 : 1,
      hint: 'Сравните отношения соседних членов',
      solution: [
        F(t[1]) + ' : ' + F(t[0]) + ' = ' + F(r[0]) + ', ' + F(t[2]) + ' : ' + F(t[1]) + ' = ' + F(r[1]) + ', ' +
          F(t[3]) + ' : ' + F(t[2]) + ' = ' + F(r[2]),
        yes ? 'Отношение одно и то же — это ГП' : 'Отношения разные — это не ГП',
        'Ответ: ' + (yes ? 'Да' : 'Нет')
      ]
    };
  };

  // choice: the missing term of a progression
  G.missing = function () {
    const q = ratio(rnd(2, 6));
    const t = terms(rnd(1, 9), q, 4);
    const right = t[2];
    const options = [right];
    [(t[1] + t[3]) / 2, t[1] + (t[1] - t[0]), right + rnd(1, 9), right - rnd(1, 2)].forEach(function (v) {
      if (options.length < 3 && options.indexOf(v) === -1 && v > 0) options.push(v);
    });
    while (options.length < 3) options.push(right + options.length * 7);
    const shuffled = G.shuffle(options);
    return {
      text: 'Какое число пропущено в геометрической прогрессии ' + F(t[0]) + '; ' + F(t[1]) + '; …; ' + F(t[3]) + '?',
      type: 'choice',
      options: shuffled.map(F),
      answer: shuffled.indexOf(right),
      hint: 'Найдите q по первым двум членам: ' + F(t[1]) + ' : ' + F(t[0]),
      solution: [
        'q = ' + F(t[1]) + ' : ' + F(t[0]) + ' = ' + q.num,
        'Пропущенный член: ' + F(t[1]) + '·' + q.num + ' = ' + F(right),
        'Проверка: ' + F(right) + '·' + q.num + ' = ' + F(t[3]),
        'Ответ: ' + F(right)
      ]
    };
  };

  // ---------------------------------------------------------------- level 2: the n-th term

  G.nthA = function (maxN) {
    return G.retry(function () {
      const q = ratio(rnd(2, 4));
      const n = rnd(3, maxN);
      const b1 = rnd(1, 9);
      const value = terms(b1, q, n)[n - 1];
      return {
        text: B(1) + ' = ' + F(b1) + ', q = ' + q.num + '. Найдите ' + B(n) + '.',
        answer: value,
        hint: HINT_NTH,
        solution: G.nthSolution(b1, q, n, value),
        _big: value > 20000
      };
    }, function (t) {
      return !t._big;
    });
  };

  G.nthB = function (maxN) {
    return G.retry(function () {
      const q = ratio(rnd(2, 4));
      const n = rnd(4, maxN);
      const t = terms(rnd(1, 9), q, n);
      const value = t[n - 1];
      return {
        text: '(b<sub>n</sub>): ' + seq(t.slice(0, 3)) + ' Найдите ' + B(n) + '.',
        answer: value,
        hint: 'Найдите q, потом ' + HINT_NTH,
        solution: G.nthSolution(t[0], q, n, value, B(1) + ' = ' + F(t[0]) + ', q = ' + F(t[1]) + ' : ' + F(t[0]) + ' = ' + q.num),
        _big: value > 20000
      };
    }, function (t) {
      return !t._big;
    });
  };

  G.nthC = function (maxN) {
    return G.retry(function () {
      const q = ratio(rnd(2, 6));
      const n = rnd(4, maxN);
      const b1 = rnd(1, 8);
      const t = terms(b1, q, n);
      const value = t[n - 1];
      return {
        text: B(1) + ' = ' + F(b1) + ', ' + B(2) + ' = ' + F(t[1]) + '. Найдите ' + B(n) + '.',
        answer: value,
        hint: 'Сначала q = ' + B(2) + ' : ' + B(1),
        solution: G.nthSolution(b1, q, n, value, 'q = ' + F(t[1]) + ' : ' + F(b1) + ' = ' + q.num),
        _big: value > 20000
      };
    }, function (t) {
      return !t._big;
    });
  };

  // ---------------------------------------------------------------- level 3: fractions and signs

  const SIGN_RATIOS = {
    frac: [[1, 2], [1, 3], [1, 4], [1, 5], [2, 3], [3, 2], [3, 4]],
    neg: [[-2, 1], [-3, 1], [-4, 1], [-5, 1]],
    negfrac: [[-1, 2], [-1, 3], [-1, 4], [-2, 3], [-3, 2]],
    dec: [[1, 10], [2, 10], [3, 10], [4, 10], [5, 10], [6, 10], [7, 10]]
  };

  // kind: 'frac' | 'neg' | 'negfrac' | 'dec'
  G.signs = function (kind, n) {
    return G.retry(function () {
      const def = pick(SIGN_RATIOS[kind]);
      const q = ratio(def[0], def[1]);
      const negative = kind === 'neg' || kind === 'negfrac';
      const b1 = Math.pow(q.den, n - 1) * rnd(1, 9) * (negative ? randomSign() : 1);
      const value = terms(b1, q, n)[n - 1];
      return {
        text: B(1) + ' = ' + F(b1) + ', q = ' + rl(q) + '. Найдите ' + B(n) + '.',
        answer: value,
        hint: negative ? 'Нечётная степень отрицательного числа отрицательна, чётная — положительна' : HINT_NTH,
        solution: G.nthSolution(b1, q, n, value),
        _big: Math.abs(b1) > 3000 || Math.abs(value) > 5000
      };
    }, function (t) {
      return !t._big;
    });
  };

  // ---------------------------------------------------------------- level 4: inverse tasks

  G.findB1 = function (k, negative) {
    return G.retry(function () {
      const q = ratio(negative ? pick([-2, -3, -4]) : pick([2, 3, 4, 5]));
      const b1 = rnd(1, 15);
      const e = k - 1;
      const power = Math.pow(q.num, e);
      const bk = b1 * power;
      const divisor = power < 0 ? '(' + F(power) + ')' : F(power);
      return {
        text: B(k) + ' = ' + F(bk) + ', q = ' + q.num.toString().replace('-', '−') + '. Найдите ' + B(1) + '.',
        answer: b1,
        hint: B(k) + ' = ' + B(1) + '·q<sup>' + e + '</sup>, значит ' + B(1) + ' = ' + B(k) + ' : q<sup>' + e + '</sup>',
        solution: [
          B(k) + ' = ' + B(1) + '·' + rp(q) + '<sup>' + e + '</sup> = ' + F(power) + '·' + B(1) + ' = ' + F(bk),
          B(1) + ' = ' + F(bk) + ' : ' + divisor + ' = ' + F(b1),
          'Ответ: ' + F(b1)
        ],
        _big: Math.abs(bk) > 6000
      };
    }, function (t) {
      return !t._big;
    });
  };

  // mode: 'pos' (q > 0) or 'neg' (q < 0, odd power)
  G.findQ2 = function (k, mode) {
    const e = k - 1;
    const q = ratio(mode === 'neg' ? pick([-2, -3, -4, -5]) : pick([2, 3, 4, 5]));
    const b1 = rnd(1, 9);
    const qe = Math.pow(q.num, e);
    const bk = b1 * qe;
    const even = e % 2 === 0;
    return {
      text: B(1) + ' = ' + F(b1) + ', ' + B(k) + ' = ' + F(bk) + (even ? ', q > 0' : '') + '. Найдите q.',
      answer: q.num,
      hint: B(k) + ' = ' + B(1) + '·q<sup>' + e + '</sup>, значит q<sup>' + e + '</sup> = ' + B(k) + ' : ' + B(1),
      solution: [
        'q<sup>' + e + '</sup> = ' + F(bk) + ' : ' + F(b1) + ' = ' + F(qe),
        even ? 'q > 0, поэтому q = ' + q.num + ' (' + q.num + '<sup>' + e + '</sup> = ' + F(qe) + ')'
          : 'q = ' + F(q.num) + ', так как ' + rp(q) + '<sup>' + e + '</sup> = ' + F(qe),
        'Ответ: ' + F(q.num)
      ]
    };
  };

  G.findN = function (qv) {
    return G.retry(function () {
      const q = ratio(qv);
      const b1 = rnd(1, 9);
      const n = rnd(5, qv === 2 ? 10 : 8);
      const t = terms(b1, q, n);
      const target = t[n - 1];
      return {
        text: '(b<sub>n</sub>): ' + seq(t.slice(0, 3)) + ' Каким по номеру членом является число ' + F(target) + '?',
        answer: n,
        hint: 'Составьте уравнение ' + F(b1) + '·' + qv + '<sup>n−1</sup> = ' + F(target),
        solution: [
          'q = ' + qv + ', ' + B('n') + ' = ' + F(b1) + '·' + qv + '<sup>n−1</sup> = ' + F(target),
          qv + '<sup>n−1</sup> = ' + F(target / b1) + ' = ' + qv + '<sup>' + (n - 1) + '</sup>, значит n − 1 = ' + (n - 1),
          'n = ' + n,
          'Ответ: ' + n
        ],
        _big: target > 20000
      };
    }, function (t) {
      return !t._big;
    });
  };

  // ---------------------------------------------------------------- level 5: the property of neighbours

  function twoDistinct() {
    const u = rnd(1, 7);
    let v = rnd(1, 7);
    while (v === u) v = rnd(1, 7);
    return [u, v];
  }

  G.mid = function () {
    const m = rnd(1, 4);
    const uv = twoDistinct();
    const a = m * uv[0] * uv[0];
    const c = m * uv[1] * uv[1];
    const x = m * uv[0] * uv[1];
    const text = Math.random() < 0.5
      ? 'Члены прогрессии положительны: ' + F(a) + '; x; ' + F(c) + '. Найдите x.'
      : 'При каком положительном x числа ' + F(a) + '; x; ' + F(c) + ' — последовательные члены ГП?';
    return {
      text: text,
      answer: x,
      hint: 'Средний член в квадрате равен произведению соседних',
      solution: [
        'x<sup>2</sup> = ' + F(a) + '·' + F(c) + ' = ' + F(a * c),
        'x > 0, поэтому x = ' + F(x),
        'Ответ: ' + F(x)
      ]
    };
  };

  G.between = function () {
    const k = rnd(2, 8);
    const m = rnd(1, 4);
    const uv = twoDistinct();
    const a = m * uv[0] * uv[0];
    const c = m * uv[1] * uv[1];
    const x = m * uv[0] * uv[1];
    return {
      text: B(k - 1) + ' = ' + F(a) + ', ' + B(k + 1) + ' = ' + F(c) + ', члены положительны. Найдите ' + B(k) + '.',
      answer: x,
      hint: B(k) + ' — сосед и ' + B(k - 1) + ', и ' + B(k + 1),
      solution: [
        B(k) + '<sup>2</sup> = ' + B(k - 1) + '·' + B(k + 1) + ' = ' + F(a) + '·' + F(c) + ' = ' + F(a * c),
        'Члены положительны, поэтому ' + B(k) + ' = ' + F(x),
        'Ответ: ' + F(x)
      ]
    };
  };

  // b2 and b4 are given, q > 0: find b1
  G.b1from24 = function () {
    const q = pick([2, 3, 4, 5]);
    const b1 = rnd(1, 9);
    const b2 = b1 * q;
    const b4 = b1 * q * q * q;
    const b3 = b1 * q * q;
    return {
      text: B(2) + ' = ' + F(b2) + ', ' + B(4) + ' = ' + F(b4) + ', q > 0. Найдите ' + B(1) + '.',
      answer: b1,
      hint: 'Найдите ' + B(3) + ', затем q, затем ' + B(1),
      solution: [
        B(3) + '<sup>2</sup> = ' + F(b2) + '·' + F(b4) + ' = ' + F(b2 * b4) + ', ' + B(3) + ' = ' + F(b3),
        'q = ' + F(b3) + ' : ' + F(b2) + ' = ' + q,
        B(1) + ' = ' + B(2) + ' : q = ' + F(b2) + ' : ' + q + ' = ' + F(b1),
        'Ответ: ' + F(b1)
      ]
    };
  };

  // b2 and b4 are given, q > 0: find b6
  G.b6from24 = function () {
    const q = pick([2, 3, 4, 5]);
    const b2 = rnd(1, 12);
    const b3 = b2 * q;
    const b4 = b2 * q * q;
    const b6 = b2 * q * q * q * q;
    return {
      text: B(2) + ' = ' + F(b2) + ', ' + B(4) + ' = ' + F(b4) + ', q > 0. Найдите ' + B(6) + '.',
      answer: b6,
      hint: 'Найдите ' + B(3) + ', затем q, затем ' + B(6),
      solution: [
        B(3) + '<sup>2</sup> = ' + F(b2) + '·' + F(b4) + ' = ' + F(b2 * b4) + ', ' + B(3) + ' = ' + F(b3),
        'q = ' + F(b3) + ' : ' + F(b2) + ' = ' + q,
        B(6) + ' = ' + B(4) + '·q<sup>2</sup> = ' + F(b4) + '·' + q * q + ' = ' + F(b6),
        'Ответ: ' + F(b6)
      ]
    };
  };
})();
