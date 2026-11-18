// Trainer: 7 levels, stars saved in localStorage (convenience only).
(function () {
  'use strict';
  const GP = window.GP;
  const STORAGE_KEY = 'gp-progress-v1';
  const CLASSIC_LEVELS = 5; // levels 1..5 are classic tasks, the rest are life tasks

  // null when the storage is unavailable
  function readProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) || {} : {};
    } catch (err) {
      console.warn('Cannot read progress', err);
      return null;
    }
  }

  GP.progress = {
    read: readProgress,
    saveStars: function (levelId, stars) {
      try {
        const progress = readProgress() || {};
        if ((progress[levelId] || 0) < stars) progress[levelId] = stars;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch (err) {
        console.warn('Cannot save progress', err);
      }
    },
    total: function () {
      const progress = readProgress();
      if (progress === null) return null;
      return GP.LEVELS.reduce(function (sum, level) {
        return sum + (progress[level.id] || 0);
      }, 0);
    }
  };

  function starsFor(firstTry, total) {
    const share = firstTry / total;
    if (share >= 0.9) return 3;
    if (share >= 0.6) return 2;
    return 1;
  }

  function starRow(n) {
    let html = '';
    for (let i = 0; i < 3; i++) {
      html += '<svg class="icon icon--s star-mini' + (i < n ? ' is-on' : '') + '" aria-hidden="true"><use href="#i-star"></use></svg>';
    }
    return html + '<span class="visually-hidden">Звёзд: ' + n + ' из 3</span>';
  }

  GP.modes.trainer = {
    start: function () {
      GP.showScreen('screen-trainer', 'Тренажёр');
      const root = document.getElementById('screen-trainer');
      let runner = null;

      function clearView() {
        if (runner) {
          runner.destroy();
          runner = null;
        }
        root.innerHTML = '';
      }

      function levelBlock(title, levels, progress) {
        const block = GP.h('section', 'level-block');
        block.appendChild(GP.h('h2', 'caption', title));
        const grid = GP.h('div', 'level-grid');
        levels.forEach(function (level) {
          const card = GP.h('button', 'card-button level-card');
          card.append(
            GP.h('span', 'level-number num', String(level.number)),
            GP.h('span', 'level-title', level.title),
            GP.h('span', 'level-subtitle', level.subtitle),
            GP.h('span', 'level-stars', starRow(progress[level.id] || 0))
          );
          GP.onTap(card, function () {
            runLevel(level);
          });
          grid.appendChild(card);
        });
        block.appendChild(grid);
        return block;
      }

      function showLevels() {
        clearView();
        root.appendChild(GP.topBar('Тренажёр'));
        const body = GP.h('div', 'screen-body levels');
        const progress = readProgress() || {};
        body.appendChild(levelBlock('Классические задачи', GP.LEVELS.slice(0, CLASSIC_LEVELS), progress));
        body.appendChild(levelBlock('Задачи из жизни', GP.LEVELS.slice(CLASSIC_LEVELS), progress));
        root.appendChild(body);
      }

      function runLevel(level) {
        clearView();
        runner = GP.createTaskRunner(root, level.build(), {
          title: 'Уровень ' + level.number + ' · ' + level.title,
          back: { label: 'Уровни', onBack: showLevels },
          finishLabel: 'Завершить уровень',
          onFinish: function (result) {
            finishLevel(level, result);
          }
        });
      }

      function finishLevel(level, result) {
        const stars = starsFor(result.firstTry, result.total);
        GP.progress.saveStars(level.id, stars);
        const nextLevel = GP.LEVELS[GP.LEVELS.indexOf(level) + 1];
        let pendingNext = null;

        const box = GP.h('div', 'result');
        GP.celebrate(box, stars);
        box.appendChild(GP.h('p', 'result-text', 'С первой попытки — ' + result.firstTry + ' из ' + result.total));
        const actions = GP.h('div', 'dialog-actions');
        const toLevels = GP.h('button', 'btn', 'К уровням');
        actions.appendChild(toLevels);
        let nextBtn = null;
        if (nextLevel) {
          nextBtn = GP.h('button', 'btn btn--primary', '<span>Следующий уровень</span>' + GP.icon('arrow-right'));
          actions.appendChild(nextBtn);
        }
        box.appendChild(actions);

        // However the dialog is closed, the trainer moves on.
        const close = GP.openDialog(box, {
          title: 'Уровень ' + level.number + ' пройден',
          onClose: function () {
            if (pendingNext) runLevel(pendingNext);
            else showLevels();
          }
        });
        GP.onTap(toLevels, close);
        if (nextBtn) {
          GP.onTap(nextBtn, function () {
            pendingNext = nextLevel;
            close();
          });
        }
      }

      showLevels();
      GP.current = {
        destroy: function () {
          clearView();
        }
      };
    }
  };
})();
