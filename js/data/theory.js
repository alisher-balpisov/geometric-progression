// Theory quiz: 12 questions per lesson, 3 options each, exactly one correct.
// 6 come from a bank of definitions and rules, 6 are generated with fresh numbers.
(function () {
  'use strict';
  const GP = (window.GP = window.GP || {});
  const G = GP.gen;
  const QUESTIONS_PER_QUIZ = 12;
  const GENERATED_PER_QUIZ = 9;

  // right answer first, then two wrong ones (options are shuffled when the quiz starts)
  const BANK = [
    { q: 'Геометрическая прогрессия — это последовательность ненулевых чисел, в которой каждый член, начиная со второго, равен…', right: 'предыдущему, умноженному на одно и то же число', wrong: ['предыдущему плюс одно и то же число', 'сумме двух предыдущих'], explain: 'Каждый следующий член получается умножением предыдущего на q: b<sub>n+1</sub> = b<sub>n</sub> · q.' },
    { q: 'Как найти знаменатель q?', right: 'b<sub>2</sub> : b<sub>1</sub>', wrong: ['b<sub>2</sub> − b<sub>1</sub>', 'b<sub>1</sub> · b<sub>2</sub>'], explain: 'Знаменатель — это отношение любого члена к предыдущему: q = b<sub>2</sub> : b<sub>1</sub>.' },
    { q: 'Может ли q быть равен 0?', right: 'Нет', wrong: ['Да', 'Только если b<sub>1</sub> = 0'], explain: 'Тогда все члены после первого были бы нулями, а в ГП нулей нет.' },
    { q: 'Формула n-го члена:', right: 'b<sub>n</sub> = b<sub>1</sub> · q<sup>n−1</sup>', wrong: ['b<sub>n</sub> = b<sub>1</sub> + (n − 1)q', 'b<sub>n</sub> = b<sub>1</sub> · q<sup>n</sup>'], explain: 'Чтобы дойти до n-го члена, нужно n − 1 раз умножить на q: b<sub>n</sub> = b<sub>1</sub> · q<sup>n−1</sup>.' },
    { q: 'Если q < 0, то знаки членов прогрессии…', right: 'чередуются', wrong: ['все положительные', 'все отрицательные'], explain: 'Каждое умножение на отрицательное число меняет знак: «+», «−», «+», «−», …' },
    { q: 'b<sub>5</sub><sup>2</sup> = ?', right: 'b<sub>4</sub> · b<sub>6</sub>', wrong: ['(b<sub>4</sub> + b<sub>6</sub>) : 2', 'b<sub>4</sub> + b<sub>6</sub>'], explain: 'Свойство соседних членов: b<sub>n</sub><sup>2</sup> = b<sub>n−1</sub> · b<sub>n+1</sub>.' },
    { q: 'Если b<sub>1</sub> > 0 и q > 1, то члены прогрессии…', right: 'растут', wrong: ['убывают', 'не меняются'], explain: 'Положительное число, умноженное на q > 1, становится больше: 3; 6; 12; 24; …' },
    { q: 'Если b<sub>1</sub> > 0 и 0 < q < 1, то члены прогрессии…', right: 'убывают', wrong: ['растут', 'чередуют знаки'], explain: 'Умножение на число между 0 и 1 уменьшает положительное число: 80; 40; 20; 10; …' },
    { q: 'Если q = 1, то члены прогрессии…', right: 'все равны первому члену', wrong: ['растут', 'убывают'], explain: 'Умножение на 1 ничего не меняет: 7; 7; 7; 7; …' },
    { q: 'Может ли в геометрической прогрессии быть член, равный нулю?', right: 'Нет, все члены отличны от нуля', wrong: ['Да, любой', 'Да, только первый'], explain: 'По определению ГП состоит из ненулевых чисел.' },
    { q: 'Чтобы получить b<sub>3</sub>, нужно b<sub>1</sub> умножить на…', right: 'q<sup>2</sup>', wrong: ['q<sup>3</sup>', '3q'], explain: 'От первого члена до третьего — два шага, значит два умножения на q.' },
    { q: 'Чтобы получить b<sub>7</sub> из b<sub>1</sub>, нужно умножить на…', right: 'q<sup>6</sup>', wrong: ['q<sup>7</sup>', '7q'], explain: 'От b<sub>1</sub> до b<sub>7</sub> шесть шагов: b<sub>7</sub> = b<sub>1</sub> · q<sup>6</sup>.' },
    { q: 'Чему равно отношение b<sub>3</sub> : b<sub>2</sub> в геометрической прогрессии?', right: 'q', wrong: ['b<sub>1</sub>', 'q<sup>2</sup>'], explain: 'Отношение любого члена к предыдущему равно q.' },
    { q: 'Если q = −1, то члены прогрессии…', right: 'меняют знак, но по модулю равны', wrong: ['все равны', 'растут по модулю'], explain: 'Например: 5; −5; 5; −5; …' },
    { q: 'Средний из трёх положительных соседних членов ГП равен…', right: 'корню из произведения соседних', wrong: ['их среднему арифметическому', 'их сумме'], explain: 'Из b<sub>n</sub><sup>2</sup> = b<sub>n−1</sub> · b<sub>n+1</sub> при положительных членах.' },
    { q: 'Если q > 0, то знаки всех членов прогрессии…', right: 'такие же, как у b<sub>1</sub>', wrong: ['чередуются', 'всегда положительные'], explain: 'Умножение на положительное число знак не меняет.' },
    { q: 'Во сколько раз каждый член больше предыдущего, если q = 3?', right: 'в 3 раза', wrong: ['на 3', 'в 9 раз'], explain: 'Умножить на 3 — значит увеличить в 3 раза.' },
    { q: 'Если q = 1/2, то каждый член…', right: 'вдвое меньше предыдущего', wrong: ['на 2 меньше предыдущего', 'вдвое больше предыдущего'], explain: 'Умножить на 1/2 — то же, что разделить на 2.' },
    { q: 'Последовательность, где каждый член на одно и то же число больше предыдущего, называется…', right: 'арифметической прогрессией', wrong: ['геометрической прогрессией', 'числовым рядом'], explain: 'В арифметической прогрессии прибавляют, в геометрической — умножают.' },
    { q: 'В обозначении (b<sub>n</sub>) буква n — это…', right: 'номер члена', wrong: ['знаменатель', 'значение члена'], explain: 'b<sub>5</sub> — пятый член, его номер n = 5.' },
    { q: 'Что нужно знать, чтобы задать геометрическую прогрессию?', right: 'первый член b<sub>1</sub> и знаменатель q', wrong: ['только знаменатель q', 'только первый член b<sub>1</sub>'], explain: 'С b<sub>1</sub> и q можно найти любой член.' },
    { q: 'Сколько раз надо умножить на q, чтобы от b<sub>1</sub> дойти до b<sub>5</sub>?', right: '4 раза', wrong: ['5 раз', '1 раз'], explain: 'b<sub>5</sub> = b<sub>1</sub> · q<sup>4</sup>: четыре шага.' },
    { q: 'Верно ли: в геометрической прогрессии каждый член, кроме первого, равен предыдущему, умноженному на q?', right: 'Верно', wrong: ['Неверно', 'Верно только для чётных номеров'], explain: 'Это и есть определение: b<sub>n+1</sub> = b<sub>n</sub> · q.' },
    { q: 'Какое число не может быть знаменателем геометрической прогрессии?', right: '0', wrong: ['−5', '1/3'], explain: 'При q = 0 члены, кроме первого, были бы нулями.' },
    { q: 'Чему равно b<sub>1</sub> · q<sup>0</sup>?', right: 'b<sub>1</sub>', wrong: ['0', 'q'], explain: 'Любое число (кроме 0) в нулевой степени равно 1.' },
    { q: 'Прогрессия 1; 3; 9; 27; … — это…', right: 'геометрическая, q = 3', wrong: ['арифметическая, d = 2', 'ни арифметическая, ни геометрическая'], explain: 'Каждый член в 3 раза больше предыдущего: 3 : 1 = 9 : 3 = 27 : 9 = 3.' },
    { q: 'Прогрессия 10; 7; 4; 1; … — это…', right: 'арифметическая, d = −3', wrong: ['геометрическая, q = 0,7', 'геометрическая, q = −3'], explain: 'К каждому члену прибавляют −3, а отношения 7 : 10 и 4 : 7 разные.' },
    { q: 'Если b<sub>3</sub> = 12 и q = 2, то b<sub>2</sub> равно…', right: '6', wrong: ['24', '10'], explain: 'b<sub>2</sub> = b<sub>3</sub> : q = 12 : 2 = 6.' },
    { q: 'Если b<sub>2</sub> = 15 и q = 5, то b<sub>1</sub> равно…', right: '3', wrong: ['75', '10'], explain: 'b<sub>1</sub> = b<sub>2</sub> : q = 15 : 5 = 3.' },
    { q: 'Что показывает число n − 1 в формуле b<sub>n</sub> = b<sub>1</sub> · q<sup>n−1</sup>?', right: 'сколько шагов от b<sub>1</sub> до b<sub>n</sub>', wrong: ['номер члена b<sub>n</sub>', 'значение знаменателя'], explain: 'На каждом шаге умножаем на q, шагов всего n − 1.' },
    { q: 'Если все члены прогрессии равны, то q равно…', right: '1', wrong: ['0', '−1'], explain: 'Член не меняется только при умножении на 1.' },
    { q: 'b<sub>1</sub> = 3, q = −2. Какой знак у b<sub>5</sub>?', right: 'положительный', wrong: ['отрицательный', 'нулевой'], explain: 'b<sub>5</sub> = 3 · (−2)<sup>4</sup> = 48: чётная степень отрицательного числа положительна.' },
    { q: 'b<sub>1</sub> = 3, q = −2. Какой знак у b<sub>4</sub>?', right: 'отрицательный', wrong: ['положительный', 'нулевой'], explain: 'b<sub>4</sub> = 3 · (−2)<sup>3</sup> = −24: нечётная степень отрицательного числа отрицательна.' },
    { q: 'Население растёт на 10% в год. Чему равен знаменатель такой прогрессии?', right: '1,1', wrong: ['0,1', '10'], explain: 'Рост на 10% — это умножение на 1 + 0,1 = 1,1.' },
    { q: 'Величина каждый шаг уменьшается вдвое. Чему равен q?', right: '1/2', wrong: ['2', '−2'], explain: 'Уменьшить вдвое — умножить на 1/2.' },
    { q: 'Если b<sub>1</sub> < 0 и q > 0, то все члены прогрессии…', right: 'отрицательные', wrong: ['положительные', 'чередуют знак'], explain: 'Умножение на положительное число знак не меняет.' },
    { q: 'Три положительных числа a, b, c таковы, что b<sup>2</sup> = a · c. Они образуют…', right: 'геометрическую прогрессию', wrong: ['арифметическую прогрессию', 'ничего особенного'], explain: 'Это свойство соседних членов геометрической прогрессии.' },
    { q: 'Какая запись верна для четвёртого члена?', right: 'b<sub>4</sub> = b<sub>3</sub> · q', wrong: ['b<sub>4</sub> = b<sub>3</sub> + q', 'b<sub>4</sub> = b<sub>1</sub> · q<sup>4</sup>'], explain: 'Каждый член получается из предыдущего умножением на q.' }
  ];

  // ---- generated questions: [question, right, wrong candidates, explanation]

  function f(x) {
    return G.F(x);
  }

  // the first two distinct values that differ from `right`
  function options(right, candidates, fallbackStep) {
    const wrong = [];
    candidates.forEach(function (c) {
      const text = typeof c === 'number' ? f(c) : c;
      if (text !== right && wrong.indexOf(text) === -1 && wrong.length < 2) wrong.push(text);
    });
    let step = 1;
    while (wrong.length < 2) {
      const text = f(parseFloat(right.replace(/\s/g, '').replace('−', '-').replace(',', '.')) + step * (fallbackStep || 1));
      if (text !== right && wrong.indexOf(text) === -1) wrong.push(text);
      step++;
    }
    return wrong;
  }

  const GENERATED = [
    function ratioQ() {
      const q = G.ratio(G.pick([2, 3, 4, 5, 6, -2, -3, -4]));
      const t = G.terms(G.rnd(1, 9), q, 4);
      const right = f(q.v);
      return {
        q: 'Чему равен знаменатель прогрессии ' + t.map(f).join('; ') + '; …?',
        right: right,
        wrong: options(right, [t[1] - t[0], q.v + 1, q.v - 1, -q.v]),
        explain: 'q = ' + f(t[1]) + ' : ' + f(t[0]) + ' = ' + right + '. Проверка: ' + f(t[2]) + ' : ' + f(t[1]) + ' = ' + right + '.'
      };
    },
    function secondTerm() {
      const a = G.rnd(2, 15);
      const c = G.rnd(2, 7);
      const right = f(a * c);
      return {
        q: 'В прогрессии b<sub>1</sub> = ' + a + ', q = ' + c + '. Чему равен b<sub>2</sub>?',
        right: right,
        wrong: options(right, [a + c, a * c * c, c * c, a - c]),
        explain: 'b<sub>2</sub> = b<sub>1</sub> · q = ' + a + ' · ' + c + ' = ' + right + '. (Сумма ' + (a + c) + ' — это арифметическая прогрессия.)'
      };
    },
    function nextTerm() {
      const q = G.ratio(G.pick([2, 3, 4, 5, -2, -3, -4]));
      const t = G.terms(G.rnd(1, 9), q, 4);
      const right = f(t[3]);
      return {
        q: 'Чему равен следующий член прогрессии ' + t.slice(0, 3).map(f).join('; ') + '; …?',
        right: right,
        wrong: options(right, [t[2] + (t[2] - t[1]), t[2] + q.v, t[2] * t[2], t[2] * 2]),
        explain: 'q = ' + f(t[1]) + ' : ' + f(t[0]) + ' = ' + f(q.v) + ', следующий член: ' + f(t[2]) + ' · ' + (q.v < 0 ? '(' + f(q.v) + ')' : f(q.v)) + ' = ' + right + '.'
      };
    },
    function whichGP() {
      const q = G.ratio(G.pick([2, 3, 4]));
      const gp = G.terms(G.rnd(1, 9), q, 4);
      const a = G.rnd(1, 12);
      const d = G.rnd(2, 9);
      const arith = [a, a + d, a + 2 * d, a + 3 * d];
      const k = G.rnd(1, 4);
      const squares = [k * k, (k + 1) * (k + 1), (k + 2) * (k + 2), (k + 3) * (k + 3)];
      const text = function (list) {
        return list.map(f).join('; ');
      };
      return {
        q: 'Какая последовательность — геометрическая прогрессия?',
        right: text(gp),
        wrong: [text(arith), text(squares)],
        explain: 'В ' + text(gp) + ' каждый член в ' + q.num + ' ' + G.plural(q.num, ['раз', 'раза', 'раз']) + ' больше предыдущего: q = ' + q.num + '.'
      };
    },
    function middle() {
      const m = G.rnd(1, 4);
      const u = G.rnd(1, 7);
      let v = G.rnd(1, 7);
      while (v === u) v = G.rnd(1, 5);
      const a = m * u * u;
      const c = m * v * v;
      const x = m * u * v;
      const right = f(x);
      return {
        q: 'Члены прогрессии положительны: b<sub>1</sub> = ' + a + ', b<sub>3</sub> = ' + c + '. Чему равен b<sub>2</sub>?',
        right: right,
        wrong: options(right, [(a + c) / 2, a * c, c - a, a + c]),
        explain: 'b<sub>2</sub><sup>2</sup> = ' + a + ' · ' + c + ' = ' + f(a * c) + ', а так как члены положительны, b<sub>2</sub> = ' + right + '. (Среднее арифметическое ' + f((a + c) / 2) + ' — не то же самое.)'
      };
    },
    function nthTerm() {
      const a = G.rnd(1, 12);
      const c = G.rnd(2, 5);
      const n = G.rnd(3, 4);
      const right = f(a * Math.pow(c, n - 1));
      return {
        q: 'В прогрессии b<sub>1</sub> = ' + a + ', q = ' + c + '. Чему равен b<sub>' + n + '</sub>?',
        right: right,
        wrong: options(right, [a * Math.pow(c, n), a * c * (n - 1), a * c * n, a + c * (n - 1)]),
        explain: 'b<sub>' + n + '</sub> = b<sub>1</sub> · q<sup>' + (n - 1) + '</sup> = ' + a + ' · ' + f(Math.pow(c, n - 1)) + ' = ' + right + '.'
      };
    }
  ];

  function toQuestion(item) {
    const shuffled = G.shuffle([item.right].concat(item.wrong));
    return {
      question: item.q,
      options: shuffled,
      answer: shuffled.indexOf(item.right),
      explain: item.explain
    };
  }

  // A new quiz: 6 questions from the bank (unseen ones first) + 6 generated, in random order.
  GP.buildTheory = function () {
    const taken = G.session();
    const fixedCount = QUESTIONS_PER_QUIZ - GENERATED_PER_QUIZ;
    // questions that were not shown in earlier lessons go first
    const pool = G.shuffle(BANK);
    const fresh = pool.filter(function (item) {
      return !G.isSeen(item.q);
    });
    const used = pool.filter(function (item) {
      return G.isSeen(item.q);
    });
    const fixedItems = fresh.concat(used).slice(0, fixedCount);
    fixedItems.forEach(function (item) {
      G.unique(function () {
        return { text: item.q };
      }, taken);
    });
    const generated = G.shuffle(GENERATED.concat(GENERATED)).slice(0, GENERATED_PER_QUIZ).map(function (gen) {
      const made = G.unique(function () {
        const item = gen();
        return { text: item.q + '|' + item.right, item: item };
      }, taken);
      return made.item;
    });
    G.saveSeen();
    return G.shuffle(fixedItems.concat(generated)).map(toQuestion);
  };

  GP.THEORY_BANK_SIZE = BANK.length;
})();
