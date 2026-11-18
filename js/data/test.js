// Independent work: 2 variants x 5 tasks; the same number = the same type and difficulty.
// Generated when the mode starts, so every class gets new tasks.
(function () {
  'use strict';
  const GP = (window.GP = window.GP || {});
  const G = GP.gen;

  GP.buildTest = function () {
    const taken = G.session();
    const life = G.shortLife(G.LIFE1.concat(G.LIFE2), 112);
    const makers = [
      function () { return G.findQ('int'); },
      function () { return G.nthA(6); },
      function () { return G.pick([G.signs('frac', 5), G.signs('neg', 4)]); },
      function () { return G.findQ2(4, 'pos'); },
      life
    ];
    // the third slot uses one kind for both variants
    const kind = G.pick([['frac', 5], ['negfrac', 4]]);
    makers[2] = function () { return G.signs(kind[0], kind[1]); };
    return [0, 1].map(function () {
      return makers.map(function (make) {
        return G.unique(make, taken);
      });
    }).map(function (variant) {
      return variant;
    });
  };
})();
