// Trainer levels. The tasks of a level are generated every time the level starts (see js/gen/):
// each level has 8 slots, from easy to hard. Money is in tenge (₸).
(function () {
  'use strict';
  const GP = (window.GP = window.GP || {});
  const G = GP.gen;
  const TASKS_PER_LEVEL = 8;

  function fixed(list) {
    return function () {
      return list;
    };
  }

  // 8 different story templates in random order
  function stories(bank) {
    return function () {
      return G.shuffle(bank).slice(0, TASKS_PER_LEVEL);
    };
  }

  function build(level) {
    const taken = G.session();
    const tasks = level.slots().map(function (make) {
      return G.unique(make, taken);
    });
    G.saveSeen();
    return tasks;
  }

  const LEVELS = [
    {
      id: 'warmup',
      number: 1,
      title: 'Разминка',
      subtitle: 'Найди q',
      slots: fixed([
        function () { return G.findQ('int'); },
        function () { return G.isGP(true); },
        function () { return G.nextTerm('int'); },
        function () { return G.isGP(false); },
        function () { return G.findQ('frac'); },
        function () { return G.findQ('neg'); },
        function () { return G.missing(); },
        function () { return G.nextTerm('neg'); }
      ])
    },
    {
      id: 'nth',
      number: 2,
      title: 'Формула n-го члена',
      subtitle: 'Находим b<sub>n</sub>',
      slots: fixed([
        function () { return G.nthA(4); },
        function () { return G.nthA(5); },
        function () { return G.nthC(5); },
        function () { return G.nthB(6); },
        function () { return G.nthA(6); },
        function () { return G.nthC(7); },
        function () { return G.nthB(7); },
        function () { return G.nthA(8); }
      ])
    },
    {
      id: 'signs',
      number: 3,
      title: 'Дроби и минусы',
      subtitle: 'q — дробь или отрицательное',
      slots: fixed([
        function () { return G.signs('frac', 4); },
        function () { return G.signs('neg', 4); },
        function () { return G.signs('frac', 5); },
        function () { return G.signs('negfrac', 4); },
        function () { return G.signs('dec', 4); },
        function () { return G.signs('neg', 5); },
        function () { return G.signs('negfrac', 5); },
        function () { return G.signs('frac', 3); }
      ])
    },
    {
      id: 'inverse',
      number: 4,
      title: 'Обратные задачи',
      subtitle: 'Ищем b<sub>1</sub>, q или n',
      slots: fixed([
        function () { return G.findB1(3, false); },
        function () { return G.findB1(4, false); },
        function () { return G.findQ2(4, 'pos'); },
        function () { return G.findQ2(5, 'pos'); },
        function () { return G.findN(2); },
        function () { return G.findB1(4, true); },
        function () { return G.findN(3); },
        function () { return G.findQ2(4, 'neg'); }
      ])
    },
    {
      id: 'property',
      number: 5,
      title: 'Свойство соседей',
      subtitle: 'b<sub>n</sub><sup>2</sup> = b<sub>n−1</sub>·b<sub>n+1</sub>',
      slots: fixed([
        function () { return G.mid(); },
        function () { return G.mid(); },
        function () { return G.between(); },
        function () { return G.between(); },
        function () { return G.b1from24(); },
        function () { return G.between(); },
        function () { return G.b1from24(); },
        function () { return G.b6from24(); }
      ])
    },
    {
      id: 'life1',
      number: 6,
      title: 'Жизнь: просто',
      subtitle: 'Удвоения и утроения',
      slots: stories(G.LIFE1)
    },
    {
      id: 'life2',
      number: 7,
      title: 'Жизнь: проценты',
      subtitle: 'Вклады, цены, распад',
      slots: stories(G.LIFE2)
    }
  ];

  LEVELS.forEach(function (level) {
    level.build = function () {
      return build(level);
    };
  });

  GP.LEVELS = LEVELS;
})();
