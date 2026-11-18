// Pair work: 5 duel rounds (same type and difficulty, different numbers) + 6 desk tasks.
// Everything is generated when the mode starts.
(function () {
  'use strict';
  const GP = (window.GP = window.GP || {});
  const G = GP.gen;

  // rounds go from easy to hard; the last one is a short life task
  GP.buildDuel = function () {
    const taken = G.session();
    const life = G.shortLife(G.LIFE1, 112);
    const makers = [
      function () { return G.findQ('int'); },
      function () { return G.nextTerm('int'); },
      function () { return G.nthA(5); },
      function () { return G.findB1(4, false); },
      life
    ];
    const rounds = makers.map(function (make) {
      const pair = G.uniqueList([make, make], taken);
      return { left: pair[0], right: pair[1] };
    });
    return rounds;
  };

  // 6 tasks of medium difficulty; the last one is a life task
  GP.buildDesk = function () {
    const taken = G.session();
    return G.uniqueList([
      function () { return G.signs('neg', 5); },
      function () { return G.signs('frac', 4); },
      function () { return G.findQ2(5, 'pos'); },
      function () { return G.findN(2); },
      function () { return G.mid(); },
      G.pick(G.LIFE2)
    ], taken);
  };
})();
