// Group work: cases with 3 questions (а, б, в), harder step by step. Generated when the mode starts.
(function () {
  'use strict';
  const GP = (window.GP = window.GP || {});
  const G = GP.gen;
  const MAX_GROUPS = 4;

  GP.buildCases = function () {
    const taken = G.session();
    const cases = G.shuffle(G.CASES).slice(0, MAX_GROUPS).map(function (make) {
      return G.unique(function () {
        const c = make();
        c.text = c.story;
        return c;
      }, taken);
    });
    G.saveSeen();
    return cases;
  };
})();
