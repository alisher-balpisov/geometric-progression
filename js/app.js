// Home screen wiring and startup.
(function () {
  'use strict';
  const GP = window.GP;
  const SQUARE_COUNT = 5;
  const FIRST_SQUARE_REM = 1.8;
  const GROWTH = 1.35;
  const FIRST_MEMBER = 2;
  const RATIO = 3;

  // Scheme of a real progression: b1 = 2, q = 3 (2; 6; 18; 54; 162). Square sides grow by 1.35 each step.
  const scheme = document.getElementById('home-scheme');
  let member = FIRST_MEMBER;
  for (let i = 0; i < SQUARE_COUNT; i++) {
    const side = FIRST_SQUARE_REM * Math.pow(GROWTH, i) + 'rem';
    const alpha = Math.round(25 + (75 * i) / (SQUARE_COUNT - 1));
    const square = GP.h('span', 'scheme-square num', String(member));
    square.style.width = square.style.height = side;
    square.style.background = 'color-mix(in srgb, var(--accent) ' + alpha + '%, transparent)';
    square.style.color = i < 3 ? 'var(--ink)' : 'var(--white)';
    scheme.appendChild(square);
    if (i < SQUARE_COUNT - 1) {
      scheme.appendChild(GP.h('span', 'scheme-step', '<span>× ' + RATIO + '</span>' + GP.icon('arrow-right', { size: 's' })));
    }
    member *= RATIO;
  }
  GP.typeset(document.querySelector('.scheme-text'));

  // Plural form for Russian numerals: [1 вопрос, 2 вопроса, 5 вопросов]
  function plural(n, forms) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return forms[0];
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
    return forms[2];
  }

  // What is inside each stage, counted from the real data.
  const facts = {
    theory: [12, ['вопрос', 'вопроса', 'вопросов']],
    pairs: [5, ['раунд', 'раунда', 'раундов']],
    groups: [4, ['кейс', 'кейса', 'кейсов']],
    test: [2, ['вариант', 'варианта', 'вариантов']]
  };
  Object.keys(facts).forEach(function (mode) {
    const n = facts[mode][0];
    document.querySelector('[data-fact="' + mode + '"]').innerHTML =
      '<span class="stage-fact-num num">' + n + '</span><span class="stage-fact-label">' + plural(n, facts[mode][1]) + '</span>';
  });

  document.querySelectorAll('[data-mode]').forEach(function (card) {
    GP.onTap(card, function () {
      const mode = GP.modes[card.dataset.mode];
      if (mode) mode.start();
    });
  });

  GP.onTap(document.getElementById('btn-formulas'), GP.showFormulas);

  // Stars collected in the trainer; the line is hidden if storage is unavailable.
  GP.refreshHome = function () {
    const box = document.getElementById('home-progress');
    const total = GP.progress.total();
    box.classList.toggle('is-hidden', total === null);
    if (total !== null) {
      box.innerHTML = '<span class="caption">Звёзд собрано</span><span class="practice-count num">' + GP.icon('star', { size: 's' }) + total + ' из ' + GP.LEVELS.length * 3 + '</span>';
    }
  };
  GP.refreshHome();

  const fullscreenBtn = document.getElementById('btn-fullscreen');
  function renderFullscreen() {
    const on = !!document.fullscreenElement;
    fullscreenBtn.innerHTML = GP.icon(on ? 'minimize' : 'maximize') + '<span>' + (on ? 'Выйти из полноэкранного' : 'На весь экран') + '</span>';
  }
  GP.onTap(fullscreenBtn, function () {
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        const request = document.documentElement.requestFullscreen();
        if (request && request.catch) request.catch(function (err) { console.warn(err); });
      }
    } catch (err) {
      console.warn('Fullscreen is not available', err);
    }
  });
  document.addEventListener('fullscreenchange', renderFullscreen);

  // A long press on a touch board must not open a context menu.
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });
})();
