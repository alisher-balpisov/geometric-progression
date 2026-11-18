// Generators of "life" tasks (levels 6-7). Money is in tenge (₸). Every task asks for ONE member
// of a progression (never for a sum). The exponent is the number of multiplications in the story.
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

  // Standard task "b1, q, k steps -> b(k+1)" with its solution.
  function life(o) {
    const value = G.terms(o.b1, o.q, o.k + 1)[o.k];
    return {
      text: o.text,
      answer: value,
      unit: o.unit,
      hint: o.hint,
      solution: [
        'Это ГП: ' + B(1) + ' = ' + F(o.b1) + ', q = ' + rl(o.q) + ', нужен ' + B(o.k + 1) + ' (' + o.note + ')',
        B(o.k + 1) + ' = ' + F(o.b1) + '·' + rp(o.q) + '<sup>' + o.k + '</sup> = ' + F(o.b1) + '·' + G.powLabel(o.q, o.k) + ' = ' + F(value),
        'Ответ: ' + F(value)
      ]
    };
  }

  function times(r) {
    return r === 2 ? 'удваивается' : 'утраивается';
  }

  const DOUBLING = ['удвоение', 'удвоения', 'удвоений'];
  const MINUTES = ['минуту', 'минуты', 'минут'];
  const HOURS = ['час', 'часа', 'часов'];

  // ---------------------------------------------------------------- level 6: simple life tasks

  const LIFE1 = [
    function bacteria() {
      const p = pick([10, 15, 20, 30]);
      const k = rnd(3, 7);
      const n0 = rnd(1, 5);
      const minutes = k * p;
      const time = minutes % 60 === 0 ? G.count(minutes / 60, HOURS) : G.count(minutes, MINUTES);
      return life({
        text: 'Колония бактерий удваивается каждые ' + p + ' минут. В начале число бактерий — ' + n0 + '. Сколько бактерий станет через ' + time + '?',
        b1: n0, q: ratio(2), k: k, note: G.count(k, DOUBLING),
        hint: 'Сколько раз по ' + p + ' минут в ' + time + '?'
      });
    },
    function paper() {
      const t = pick([0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6]);
      const k = rnd(4, 9);
      return life({
        text: 'Лист бумаги толщиной ' + F(t) + ' мм складывают пополам ' + k + ' ' + G.plural(k, ['раз', 'раза', 'раз']) + '. Какой станет толщина стопки?',
        b1: t, q: ratio(2), k: k, unit: 'мм', note: G.count(k, ['складывание', 'складывания', 'складываний']),
        hint: 'Каждое складывание удваивает толщину'
      });
    },
    function ball() {
      const j = rnd(3, 6);
      const m = rnd(1, 12);
      return life({
        text: 'Мяч упал с высоты ' + m * Math.pow(2, j) + ' м. После каждого удара о землю он подпрыгивает на половину прежней высоты. На какую высоту он подпрыгнет после ' + j + '-го удара?',
        b1: m * Math.pow(2, j), q: ratio(1, 2), k: j, unit: 'м', note: G.count(j, ['удар', 'удара', 'ударов']),
        hint: 'После каждого удара высота умножается на 1/2'
      });
    },
    function grains() {
      const c = rnd(1, 6);
      const r = pick([2, 3]);
      const n = G.retry(function () {
        return rnd(4, 8);
      }, function (v) {
        return c * Math.pow(r, v - 1) <= 5000;
      });
      return life({
        text: 'На первую клетку шахматной доски положили ' + G.count(c, ['зерно', 'зерна', 'зёрен']) + ', на каждую следующую — ' + (r === 2 ? 'вдвое' : 'втрое') + ' больше. Сколько зёрен на ' + n + '-й клетке?',
        b1: c, q: ratio(r), k: n - 1, note: n + '-я клетка — это ' + (n - 1) + ' ' + G.plural(n - 1, ['шаг', 'шага', 'шагов']),
        hint: 'На ' + n + '-й клетке — ' + (n - 1) + ' умножений на ' + r
      });
    },
    function news() {
      const s = rnd(1, 4);
      const r = rnd(2, 5);
      const m = rnd(3, 6);
      return life({
        text: 'На 1-м шаге новость узнали ' + G.count(s, ['человек', 'человека', 'человек']) + '. На каждом следующем шаге каждый, кто узнал её на предыдущем шаге, пересылает её ' + r + ' новым друзьям. Сколько человек узнают новость на ' + m + '-м шаге?',
        b1: s, q: ratio(r), k: m - 1, note: m + '-й шаг',
        hint: 'Число новых людей на каждом шаге умножается на ' + r
      });
    },
    function fish() {
      const n0 = rnd(3, 12);
      const r = pick([2, 3]);
      const k = rnd(3, 5);
      return life({
        text: 'В пруд запустили ' + G.count(n0, ['рыбку', 'рыбки', 'рыбок']) + '. Каждый месяц их число ' + times(r) + '. Сколько рыбок будет через ' + G.count(k, ['месяц', 'месяца', 'месяцев']) + '?',
        b1: n0, q: ratio(r), k: k, note: G.count(k, ['месяц', 'месяца', 'месяцев']),
        hint: 'Через ' + k + ' месяца(ев) — это ' + k + ' умножений на ' + r
      });
    },
    function strawberry() {
      const p = rnd(2, 9);
      const k = rnd(2, 3);
      return life({
        text: 'На грядке растут ' + G.count(p, ['куст', 'куста', 'кустов']) + ' клубники. Каждое лето число кустов утраивается — вырастают новые из усов. Сколько кустов будет через ' + G.count(k, ['лето', 'лета', 'лет']) + '?',
        b1: p, q: ratio(3), k: k, note: G.count(k, ['утроение', 'утроения', 'утроений']),
        hint: 'Каждое лето — умножение на 3'
      });
    },
    function video() {
      const v = rnd(3, 19);
      const r = pick([3, 4, 5]);
      const d = rnd(3, 4);
      return life({
        text: 'В первый день видео посмотрели ' + G.count(v, ['человек', 'человека', 'человек']) + '. Каждый следующий день просмотров в ' + r + ' ' + G.plural(r, ['раз', 'раза', 'раз']) + ' больше, чем накануне. Сколько просмотров будет в ' + d + '-й день?',
        b1: v, q: ratio(r), k: d - 1, note: d + '-й день',
        hint: 'В ' + d + '-й день — ' + (d - 1) + ' умножения на ' + r + ' после первого дня'
      });
    },
    function mold() {
      const a = rnd(2, 12);
      const k = rnd(3, 7);
      return life({
        text: 'Пятно плесени занимает ' + a + ' см². Каждый день его площадь удваивается. Какой станет площадь пятна через ' + G.count(k, ['день', 'дня', 'дней']) + '?',
        b1: a, q: ratio(2), k: k, unit: 'см²', note: G.count(k, DOUBLING),
        hint: 'Каждый день — умножение на 2'
      });
    },
    function glass() {
      const m = rnd(5, 60);
      const k = rnd(3, 5);
      return life({
        text: 'Яркость лампы — ' + m * Math.pow(2, k) + ' условных единиц. Свет проходит через ' + G.count(k, ['одинаковое стекло', 'одинаковых стекла', 'одинаковых стёкол']) + ', каждое пропускает половину света. Какой станет яркость?',
        b1: m * Math.pow(2, k), q: ratio(1, 2), k: k, unit: 'ед.', note: G.count(k, ['стекло', 'стекла', 'стёкол']),
        hint: 'Каждое стекло — умножение на 1/2'
      });
    },
    function chalk() {
      const m = rnd(3, 50);
      const k = rnd(3, 5);
      return life({
        text: 'От куска мела каждый день отламывают половину. Сначала было ' + m * Math.pow(2, k) + ' г. Сколько граммов останется через ' + G.count(k, ['день', 'дня', 'дней']) + '?',
        b1: m * Math.pow(2, k), q: ratio(1, 2), k: k, unit: 'г', note: G.count(k, ['день', 'дня', 'дней']),
        hint: 'Каждый день — умножение на 1/2'
      });
    }
  ];

  // ---------------------------------------------------------------- level 7: percent tasks

  function years(y) {
    return G.count(y, ['год', 'года', 'лет']);
  }

  // growth by r percent: q = 1.1 / 1.2
  function growthQ(r) {
    return ratio((100 + r) / 10, 10);
  }

  function declineQ(r) {
    return ratio((100 - r) / 10, 10);
  }

  const LIFE2 = [
    function deposit() {
      const a = 1000 * rnd(20, 500);
      const r = pick([10, 20]);
      const y = rnd(2, 3);
      return life({
        text: 'Положили на вклад ' + G.money(a) + ' под ' + r + '% годовых. Каждый год сумма увеличивается на ' + r + '%. Сколько будет на вкладе через ' + years(y) + '?',
        b1: a, q: growthQ(r), k: y, unit: '₸', note: years(y),
        hint: 'Увеличить на ' + r + '% — значит умножить на ' + G.F((100 + r) / 100)
      });
    },
    function salary() {
      const a = 1000 * rnd(100, 400);
      const r = pick([10, 20]);
      const y = rnd(2, 3);
      return life({
        text: 'Зарплата сейчас ' + G.money(a) + '. Каждый год её повышают на ' + r + '%. Какой станет зарплата через ' + years(y) + '?',
        b1: a, q: growthQ(r), k: y, unit: '₸', note: years(y),
        hint: 'Повысили на ' + r + '% — значит умножили на ' + G.F((100 + r) / 100)
      });
    },
    function depreciation() {
      const item = pick([['Машина', 'она'], ['Мотоцикл', 'он'], ['Ноутбук', 'он'], ['Планшет', 'он'], ['Телевизор', 'он'], ['Смартфон', 'он'], ['Велосипед', 'он']]);
      const a = 10000 * rnd(5, 40);
      const r = pick([10, 20]);
      const y = rnd(2, 3);
      return life({
        text: item[0] + ' стоит ' + G.money(a) + ' и каждый год дешевеет на ' + r + '%. Сколько ' + item[1] + ' будет стоить через ' + years(y) + '?',
        b1: a, q: declineQ(r), k: y, unit: '₸', note: years(y),
        hint: 'Подешевел на ' + r + '% — осталось ' + (100 - r) + '%, то есть ×' + G.F((100 - r) / 100)
      });
    },
    function population() {
      const p = 1000 * rnd(2, 9);
      const r = pick([10, 20, 50]);
      const y = rnd(2, 3);
      const kind = pick([0, 1, 2]);
      const text = [
        'В посёлке живёт ' + G.count(p, ['человек', 'человека', 'человек']) + '. Каждый год число жителей растёт на ' + r + '%. Сколько жителей будет через ' + years(y) + '?',
        'У канала ' + G.count(p, ['подписчик', 'подписчика', 'подписчиков']) + '. Каждый год число подписчиков растёт на ' + r + '%. Сколько подписчиков будет через ' + years(y) + '?',
        'Сайт посещают ' + G.count(p, ['человек', 'человека', 'человек']) + ' в месяц. Каждый год это число растёт на ' + r + '%. Сколько человек будут посещать сайт в месяц через ' + years(y) + '?'
      ][kind];
      return life({
        text: text,
        b1: p, q: r === 50 ? ratio(3, 2) : growthQ(r), k: y, unit: kind === 1 ? 'подп.' : 'чел.', note: years(y),
        hint: 'Рост на ' + r + '% — это умножение на ' + G.F((100 + r) / 100)
      });
    },
    function halfLife() {
      const period = pick([5, 8, 10, 12]);
      const j = rnd(2, 4);
      const m = rnd(5, 25);
      return life({
        text: 'Каждые ' + period + ' суток масса радиоактивного вещества уменьшается вдвое. Было ' + m * Math.pow(2, j) + ' г. Сколько граммов останется через ' + period * j + ' суток?',
        b1: m * Math.pow(2, j), q: ratio(1, 2), k: j, unit: 'г',
        note: period * j + ' : ' + period + ' = ' + j + ' ' + G.plural(j, ['уменьшение', 'уменьшения', 'уменьшений']),
        hint: 'Сколько раз по ' + period + ' суток в ' + period * j + ' сутках?'
      });
    },
    function copier() {
      const j = rnd(2, 4);
      const m = rnd(3, 25);
      return life({
        text: 'Фотографию со стороной ' + m * Math.pow(2, j) + ' см уменьшают на копировальном аппарате вдвое по стороне. Какой станет сторона после ' + j + ' таких уменьшений подряд?',
        b1: m * Math.pow(2, j), q: ratio(1, 2), k: j, unit: 'см', note: G.count(j, ['уменьшение', 'уменьшения', 'уменьшений']),
        hint: 'Каждое уменьшение — умножение на 1/2'
      });
    },
    function colonySearch() {
      const c = rnd(1, 9);
      const r = pick([2, 3]);
      const k = r === 2 ? rnd(4, 9) : rnd(3, 6);
      const target = c * Math.pow(r, k);
      return {
        text: 'В начале число бактерий в колонии — ' + c + '. Оно ' + times(r) + ' каждый час. Через сколько часов число бактерий достигнет ' + F(target) + '?',
        answer: k,
        unit: 'ч',
        hint: 'Найдите, в какую степень надо возвести ' + r + ', чтобы получить ' + F(target / c),
        solution: [
          'Это ГП: ' + B(1) + ' = ' + c + ', q = ' + r + '; ищем, сколько раз было умножение на ' + r,
          c + '·' + r + '<sup>k</sup> = ' + F(target) + ', значит ' + r + '<sup>k</sup> = ' + F(target / c) + ' = ' + r + '<sup>' + k + '</sup>',
          'k = ' + k,
          'Ответ: ' + k + ' ч'
        ]
      };
    },
    function percentUp() {
      const a = 100 * rnd(1, 40);
      const pr = pick([10, 20, 50]);
      const q = pr === 50 ? 1.5 : 1 + pr / 100;
      const end = a * q * q;
      return {
        text: 'Цена товара за 2 года выросла с ' + G.money(a) + ' до ' + G.money(Math.round(end)) + ', каждый год на один и тот же процент. На сколько процентов в год?',
        answer: pr,
        unit: '%',
        hint: 'Найдите q из q<sup>2</sup> = ' + F(Math.round(end)) + ' : ' + F(a) + ', потом переведите в проценты',
        solution: [
          'Это ГП: ' + B(1) + ' = ' + F(a) + ', ' + B(3) + ' = ' + F(Math.round(end)) + ' (2 года — 2 умножения на q)',
          'q<sup>2</sup> = ' + F(Math.round(end)) + ' : ' + F(a) + ' = ' + F(q * q) + ', q = ' + F(q),
          F(q) + ' = 1 + ' + F(q - 1) + ': цена росла на ' + pr + '% в год',
          'Ответ: ' + pr + ' %'
        ]
      };
    },
    function percentDown() {
      const a = 100 * rnd(2, 40);
      const pr = pick([10, 20, 50]);
      const q = 1 - pr / 100;
      const end = a * q * q;
      return {
        text: 'Цена товара за 2 года снизилась с ' + G.money(a) + ' до ' + G.money(Math.round(end)) + ', каждый год на один и тот же процент. На сколько процентов в год?',
        answer: pr,
        unit: '%',
        hint: 'Найдите q из q<sup>2</sup> = ' + F(Math.round(end)) + ' : ' + F(a) + ', потом сравните q с 1',
        solution: [
          'Это ГП: ' + B(1) + ' = ' + F(a) + ', ' + B(3) + ' = ' + F(Math.round(end)) + ' (2 года — 2 умножения на q)',
          'q<sup>2</sup> = ' + F(Math.round(end)) + ' : ' + F(a) + ' = ' + F(q * q) + ', q = ' + F(q),
          F(q) + ' = 1 − ' + F(1 - q) + ': цена падала на ' + pr + '% в год',
          'Ответ: ' + pr + ' %'
        ]
      };
    }
  ];

  // A template whose statement is short enough for a half-screen (duel) or a two-column list (test).
  // Returns a maker that always gives a text of at most maxLength characters.
  G.shortLife = function (bank, maxLength) {
    const fits = function (t) {
      return t.text.length <= maxLength;
    };
    const ok = bank.filter(function (make) {
      return fits(make());
    });
    const make = G.pick(ok.length ? ok : bank);
    return function () {
      return G.retry(make, fits);
    };
  };

  G.LIFE1 = LIFE1;
  G.LIFE2 = LIFE2;
})();
