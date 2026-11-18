// Generators of group cases: a story and three questions (а, б, в), harder step by step.
// Each question is about ONE member of a progression (no sums).
(function () {
  'use strict';
  const GP = window.GP;
  const G = GP.gen;
  const rnd = G.rnd;
  const pick = G.pick;
  const F = G.F;
  const B = G.B;

  function q(text, answer, unit, solution) {
    return { text: text, answer: answer, unit: unit, solution: solution };
  }

  function round2(x) {
    return Math.round(x * 100) / 100;
  }

  const MINUTES = ['минуту', 'минуты', 'минут'];
  const BACTERIA = ['бактерия', 'бактерии', 'бактерий'];

  const CASES = [
    // ------------------------------------------------ laboratory
    function lab() {
      const p = pick([10, 15, 20, 30, 40]);
      const n0 = rnd(2, 9);
      const k1 = rnd(2, 3);
      const k2 = rnd(5, 6);
      const k3 = rnd(7, 8);
      const target = n0 * Math.pow(2, k3);
      return {
        title: 'Лаборатория',
        icon: 'microscope',
        story: 'В пробирке ' + G.count(n0, BACTERIA) + '. Каждые ' + p + ' минут каждая бактерия делится на две.',
        questions: [
          q('Сколько бактерий будет через ' + G.count(k1 * p, MINUTES) + '?', n0 * Math.pow(2, k1), undefined, [
            'Это ГП: ' + B(1) + ' = ' + n0 + ', q = 2. За ' + k1 * p + ' минут — ' + k1 + ' деления (' + k1 * p + ' : ' + p + ' = ' + k1 + ')',
            'Нужен ' + B(k1 + 1) + ' = ' + n0 + '·2<sup>' + k1 + '</sup> = ' + F(n0 * Math.pow(2, k1)),
            'Ответ: ' + F(n0 * Math.pow(2, k1))
          ]),
          q('А через ' + G.count(k2 * p, MINUTES) + '?', n0 * Math.pow(2, k2), undefined, [
            'За ' + k2 * p + ' минут — ' + k2 + ' делений (' + k2 * p + ' : ' + p + ' = ' + k2 + ')',
            'Нужен ' + B(k2 + 1) + ' = ' + n0 + '·2<sup>' + k2 + '</sup> = ' + F(n0 * Math.pow(2, k2)),
            'Ответ: ' + F(n0 * Math.pow(2, k2))
          ]),
          q('Через сколько минут бактерий станет ' + F(target) + '?', k3 * p, 'мин', [
            n0 + '·2<sup>k</sup> = ' + F(target) + ', значит 2<sup>k</sup> = ' + F(target) + ' : ' + n0 + ' = ' + F(Math.pow(2, k3)),
            '2<sup>' + k3 + '</sup> = ' + F(Math.pow(2, k3)) + ', то есть k = ' + k3 + ' делений',
            k3 + ' · ' + p + ' минут = ' + k3 * p + ' минут',
            'Ответ: ' + k3 * p + ' мин'
          ])
        ]
      };
    },
    // ------------------------------------------------ deposit
    function deposit() {
      const a = 1000 * rnd(100, 300);
      const r = pick([10, 20]);
      const y = rnd(2, 3);
      const m = (100 + r) / 100;
      const first = a * m;
      const last = G.terms(a, G.ratio((100 + r) / 10, 10), y + 1)[y];
      return {
        title: 'Вклад',
        icon: 'piggy-bank',
        story: 'Положили ' + G.money(a) + ' на вклад под ' + r + '% годовых. Каждый год сумма увеличивается на ' + r + '%.',
        questions: [
          q('Сколько будет через 1 год?', first, '₸', [
            'Увеличить на ' + r + '% — значит умножить на ' + F(m) + ': это ГП, q = ' + F(m),
            F(a) + '·' + F(m) + ' = ' + F(first),
            'Ответ: ' + F(first) + ' ₸'
          ]),
          q('Через ' + y + ' ' + G.plural(y, ['год', 'года', 'лет']) + '?', last, '₸', [
            'Это ГП: ' + B(1) + ' = ' + F(a) + ', q = ' + F(m) + ', нужен ' + B(y + 1) + ' (' + y + ' ' + G.plural(y, ['год', 'года', 'лет']) + ')',
            B(y + 1) + ' = ' + F(a) + '·' + F(m) + '<sup>' + y + '</sup> = ' + F(a) + '·' + F(Math.pow(m, y)) + ' = ' + F(last),
            'Ответ: ' + F(last) + ' ₸'
          ]),
          q('На сколько тенге вклад вырос за эти ' + y + ' года?', last - a, '₸', [
            'Через ' + y + ' ' + G.plural(y, ['год', 'года', 'лет']) + ' на вкладе ' + F(last) + ' ₸ (' + B(y + 1) + ' = ' + F(a) + '·' + F(m) + '<sup>' + y + '</sup>)',
            'Рост — это разность: ' + F(last) + ' − ' + F(a) + ' = ' + F(last - a),
            'Ответ: ' + F(last - a) + ' ₸'
          ])
        ]
      };
    },
    // ------------------------------------------------ bouncing ball
    function ball() {
      const ratioDef = pick([[2, 3, 8], [2, 3, 8], [3, 4, 4], [4, 5, 2]]); // [numerator, denominator, max multiplier]
      const nu = ratioDef[0];
      const de = ratioDef[1];
      const h = Math.pow(de, 3) * rnd(1, ratioDef[2]);
      const height = function (j) {
        return (h * Math.pow(nu, j)) / Math.pow(de, j);
      };
      let limit = 0;
      let hit = 0;
      G.retry(function () {
        limit = rnd(2, h);
        hit = 1;
        while (height(hit) >= limit) hit++;
        return hit;
      }, function (j) {
        return j >= 4 && j <= 6;
      });
      return {
        title: 'Прыгучий мяч',
        icon: 'volleyball',
        story: 'Мяч уронили с высоты ' + h + ' м. После каждого удара о землю он поднимается на ' + nu + '/' + de + ' прежней высоты.',
        questions: [
          q('На какую высоту он поднимется после 1-го удара?', height(1), 'м', [
            'Это ГП: ' + B(1) + ' = ' + h + ', q = ' + nu + '/' + de,
            'После 1-го удара: ' + B(2) + ' = ' + h + ' · ' + nu + '/' + de + ' = ' + F(height(1)),
            'Ответ: ' + F(height(1)) + ' м'
          ]),
          q('После 3-го удара?', height(3), 'м', [
            'После 3-го удара нужен ' + B(4) + ' = ' + h + '·(' + nu + '/' + de + ')<sup>3</sup>',
            h + ' · ' + Math.pow(nu, 3) + '/' + Math.pow(de, 3) + ' = ' + F(height(3)),
            'Ответ: ' + F(height(3)) + ' м'
          ]),
          q('После какого удара мяч впервые поднимется ниже ' + limit + ' м?', hit, undefined, [
            'После ' + (hit - 1) + '-го удара: ' + h + '·(' + nu + '/' + de + ')<sup>' + (hit - 1) + '</sup> ≈ ' + F(round2(height(hit - 1))) + ' м — ещё не ниже ' + limit + ' м',
            'После ' + hit + '-го удара: ' + h + '·(' + nu + '/' + de + ')<sup>' + hit + '</sup> ≈ ' + F(round2(height(hit))) + ' м — уже ниже ' + limit + ' м',
            'Ответ: ' + hit
          ])
        ]
      };
    },
    // ------------------------------------------------ viral video
    function video() {
      let v1 = 0;
      let r = 0;
      let day = 0;
      let limit = 0;
      G.retry(function () {
        v1 = pick([10, 15, 20, 25, 30, 40, 50, 60]);
        r = pick([2, 3, 4, 5]);
        limit = pick([1000, 2000, 5000, 10000, 20000, 50000]);
        day = 1;
        while (v1 * Math.pow(r, day - 1) <= limit) day++;
        return day;
      }, function (d) {
        return d >= 5 && d <= 8;
      });
      const views = function (d) {
        return v1 * Math.pow(r, d - 1);
      };
      const dB = rnd(4, 5);
      return {
        title: 'Вирусное видео',
        icon: 'smartphone',
        story: 'В первый день видео посмотрели ' + G.count(v1, ['человек', 'человека', 'человек']) + '. Каждый следующий день просмотров в ' + r + ' ' + G.plural(r, ['раз', 'раза', 'раз']) + ' больше, чем в предыдущий.',
        questions: [
          q('Сколько просмотров во 2-й день?', views(2), undefined, [
            'Это ГП: ' + B(1) + ' = ' + v1 + ', q = ' + r,
            B(2) + ' = ' + v1 + '·' + r + ' = ' + F(views(2)),
            'Ответ: ' + F(views(2))
          ]),
          q('В ' + dB + '-й день?', views(dB), undefined, [
            'Нужен ' + B(dB) + ' = ' + v1 + '·' + r + '<sup>' + (dB - 1) + '</sup>',
            v1 + '·' + F(Math.pow(r, dB - 1)) + ' = ' + F(views(dB)),
            'Ответ: ' + F(views(dB))
          ]),
          q('В какой день просмотров впервые станет больше ' + F(limit) + '?', day, undefined, [
            'В ' + (day - 1) + '-й день: ' + v1 + '·' + r + '<sup>' + (day - 2) + '</sup> = ' + F(views(day - 1)) + ' — ещё не больше ' + F(limit),
            'В ' + day + '-й день: ' + v1 + '·' + r + '<sup>' + (day - 1) + '</sup> = ' + F(views(day)) + ' — уже больше ' + F(limit),
            'Ответ: ' + day
          ])
        ]
      };
    },
    // ------------------------------------------------ tournament
    function tournament() {
      const s = rnd(4, 8);
      const n = Math.pow(2, s);
      const event = pick(['турнира по шахматам', 'турнира по теннису', 'чемпионата по борьбе', 'кубка по футболу', 'олимпиады по математике']);
      return {
        title: 'Турнир',
        icon: 'trophy',
        story: 'Число участников ' + event + ' — ' + n + '. После каждого круга остаётся половина участников.',
        questions: [
          q('Сколько участников останется после 1-го круга?', n / 2, undefined, [
            'Это ГП: ' + B(1) + ' = ' + n + ', q = 1/2',
            B(2) + ' = ' + n + ' · 1/2 = ' + F(n / 2),
            'Ответ: ' + F(n / 2)
          ]),
          q('После 3-го круга?', n / 8, undefined, [
            'Нужен ' + B(4) + ' = ' + n + '·(1/2)<sup>3</sup> = ' + n + ' · 1/8 = ' + F(n / 8),
            'Ответ: ' + F(n / 8)
          ]),
          q('После какого круга останется один участник?', s, undefined, [
            n + '·(1/2)<sup>k</sup> = 1, значит 2<sup>k</sup> = ' + n + ' = 2<sup>' + s + '</sup>',
            'k = ' + s,
            'Ответ: ' + s
          ])
        ]
      };
    },
    // ------------------------------------------------ blogger
    function blogger() {
      const f0 = 10 * rnd(5, 40);
      const kb = rnd(3, 5);
      const kc = rnd(6, 8);
      const target = f0 * Math.pow(2, kc);
      return {
        title: 'Блогер',
        icon: 'star',
        story: 'У блога ' + G.count(f0, ['подписчик', 'подписчика', 'подписчиков']) + '. Каждую неделю число подписчиков удваивается.',
        questions: [
          q('Сколько подписчиков будет через 1 неделю?', f0 * 2, undefined, [
            'Это ГП: ' + B(1) + ' = ' + f0 + ', q = 2',
            B(2) + ' = ' + f0 + '·2 = ' + F(f0 * 2),
            'Ответ: ' + F(f0 * 2)
          ]),
          q('А через ' + G.count(kb, ['неделю', 'недели', 'недель']) + '?', f0 * Math.pow(2, kb), undefined, [
            'Нужен ' + B(kb + 1) + ' = ' + f0 + '·2<sup>' + kb + '</sup> = ' + f0 + '·' + F(Math.pow(2, kb)) + ' = ' + F(f0 * Math.pow(2, kb)),
            'Ответ: ' + F(f0 * Math.pow(2, kb))
          ]),
          q('Через сколько недель подписчиков станет ' + F(target) + '?', kc, 'нед.', [
            f0 + '·2<sup>k</sup> = ' + F(target) + ', значит 2<sup>k</sup> = ' + F(target / f0) + ' = 2<sup>' + kc + '</sup>',
            'k = ' + kc,
            'Ответ: ' + kc + ' нед.'
          ])
        ]
      };
    },
    // ------------------------------------------------ copier
    function copier() {
      const l = 32 * rnd(1, 8);
      let limit = 0;
      let copies = 0;
      G.retry(function () {
        limit = rnd(2, l / 4);
        copies = 0;
        while (l / Math.pow(2, copies) >= limit) copies++;
        return copies;
      }, function (c) {
        return c >= 4 && c <= 6;
      });
      return {
        title: 'Копировальный аппарат',
        icon: 'notebook-pen',
        story: 'Страницу со стороной ' + l + ' см уменьшают на копировальном аппарате вдвое по стороне. Уменьшенную копию уменьшают снова.',
        questions: [
          q('Какой будет сторона после 1-го уменьшения?', l / 2, 'см', [
            'Это ГП: ' + B(1) + ' = ' + l + ', q = 1/2',
            B(2) + ' = ' + l + ' · 1/2 = ' + F(l / 2),
            'Ответ: ' + F(l / 2) + ' см'
          ]),
          q('После 3-го?', l / 8, 'см', [
            'Нужен ' + B(4) + ' = ' + l + '·(1/2)<sup>3</sup> = ' + l + ' · 1/8 = ' + F(l / 8),
            'Ответ: ' + F(l / 8) + ' см'
          ]),
          q('После какого уменьшения сторона впервые станет меньше ' + limit + ' см?', copies, undefined, [
            'После ' + (copies - 1) + '-го: ' + F(l / Math.pow(2, copies - 1)) + ' см — ещё не меньше ' + limit + ' см',
            'После ' + copies + '-го: ' + F(l / Math.pow(2, copies)) + ' см — уже меньше ' + limit + ' см',
            'Ответ: ' + copies
          ])
        ]
      };
    },
    // ------------------------------------------------ glass filters
    function filters() {
      const m = rnd(2, 15);
      const i0 = m * 128;
      const kc = rnd(5, 7);
      const target = i0 / Math.pow(2, kc);
      return {
        title: 'Тонированные стёкла',
        icon: 'lightbulb',
        story: 'Яркость лампы — ' + i0 + ' условных единиц. Свет проходит через одинаковые стёкла, каждое пропускает половину света.',
        questions: [
          q('Какой станет яркость после 1 стекла?', i0 / 2, 'ед.', [
            'Это ГП: ' + B(1) + ' = ' + i0 + ', q = 1/2',
            B(2) + ' = ' + i0 + ' · 1/2 = ' + F(i0 / 2),
            'Ответ: ' + F(i0 / 2) + ' ед.'
          ]),
          q('После 3 стёкол?', i0 / 8, 'ед.', [
            'Нужен ' + B(4) + ' = ' + i0 + '·(1/2)<sup>3</sup> = ' + i0 + ' · 1/8 = ' + F(i0 / 8),
            'Ответ: ' + F(i0 / 8) + ' ед.'
          ]),
          q('Сколько стёкол нужно, чтобы яркость стала ' + F(target) + ' ед.?', kc, undefined, [
            i0 + '·(1/2)<sup>k</sup> = ' + F(target) + ', значит 2<sup>k</sup> = ' + F(i0 / target) + ' = 2<sup>' + kc + '</sup>',
            'k = ' + kc,
            'Ответ: ' + kc
          ])
        ]
      };
    }
  ];

  G.CASES = CASES;
})();
