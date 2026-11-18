// Pair work: "duel at the board" (two players at once) and "desk pairs" (task runner).
(function () {
  'use strict';
  const GP = window.GP;
  const PLAYER_VARS = ['var(--player-1)', 'var(--player-2)'];
  const AUTO_ADVANCE_MS = 1800;
  const FIRST_POINTS = 2;
  const SECOND_POINTS = 1;

  GP.modes.pairs = {
    start: function () {
      GP.showScreen('screen-pairs', 'Парная работа');
      const root = document.getElementById('screen-pairs');
      let cleanup = null; // cleanup of the active sub-view

      function clearView() {
        if (cleanup) {
          cleanup();
          cleanup = null;
        }
        root.innerHTML = '';
      }

      const parent = { label: 'Парная работа', onBack: GP.modes.pairs.start };

      // ---------- choice screen ----------

      function showMenu() {
        clearView();
        root.appendChild(GP.topBar('Парная работа'));
        const body = GP.h('div', 'screen-body');
        const menu = GP.h('div', 'format-grid');
        [
          { icon: 'swords', name: 'Дуэль у доски', desc: 'Двое решают одновременно: кто быстрее, тот получает больше очков', run: startDuel },
          { icon: 'pencil-line', name: 'Пары за партами', desc: 'Решаете вдвоём в тетради, ответ вводите на доске', run: startDesk }
        ].forEach(function (def) {
          const card = GP.h('button', 'card-button format-card');
          card.append(
            GP.h('span', 'format-icon', GP.icon(def.icon, { size: 'l' })),
            GP.h('span', 'stage-name', def.name),
            GP.h('span', 'stage-desc', def.desc)
          );
          GP.onTap(card, def.run);
          menu.appendChild(card);
        });
        body.appendChild(menu);
        root.appendChild(body);
      }

      // ---------- duel ----------

      function startDuel() {
        clearView();
        root.appendChild(GP.topBar('Дуэль', { back: parent }));
        const body = GP.h('div', 'screen-body duel');
        root.appendChild(body);

        const rounds = GP.buildDuel();
        const scores = [0, 0];
        const done = [false, false];
        const numpads = [null, null];
        const halves = [];
        const taskEls = [];
        let round = 0;
        let answeredCount = 0;
        let roundFinished = false;
        let duelOver = false;
        let advanceTimer = null;

        // scoreboard: Player 1  3 : 2  Player 2, round under it
        const board = GP.h('div', 'scoreboard');
        const name1 = GP.h('span', 'scoreboard-name', 'Игрок 1');
        const name2 = GP.h('span', 'scoreboard-name', 'Игрок 2');
        name1.style.color = PLAYER_VARS[0];
        name2.style.color = PLAYER_VARS[1];
        const scoreEl = GP.h('span', 'scoreboard-score num');
        const roundEl = GP.h('span', 'caption scoreboard-round');
        board.append(name1, scoreEl, name2, roundEl);
        body.appendChild(board);

        const field = GP.h('div', 'duel-field');
        [0, 1].forEach(function (p) {
          const half = GP.h('div', 'duel-half');
          half.style.setProperty('--player', PLAYER_VARS[p]);
          const task = GP.h('p', 'task-text task-text--duel');
          const padHost = GP.h('div', 'duel-pad');
          const checkBtn = GP.h('button', 'btn btn--primary btn--block', GP.icon('check') + '<span>Проверить</span>');
          half.append(task, padHost, checkBtn);
          field.appendChild(half);
          halves.push(half);
          taskEls.push(task);
          // each player has an independent numpad instance with its own state
          numpads[p] = GP.createNumpad(padHost, {
            keyboard: false,
            size: 'm',
            label: 'Ответ игрока ' + (p + 1),
            onSubmit: function (raw) {
              submit(p, raw);
            }
          });
          GP.onTap(checkBtn, function () {
            numpads[p].submit();
          });
          half.checkBtn = checkBtn;
        });
        body.appendChild(field);

        // the teacher's button: bottom centre, in the gap between the two "check" buttons
        const nextBtn = GP.h('button', 'btn duel-next');
        field.appendChild(nextBtn);

        function updateScore() {
          scoreEl.textContent = scores[0] + ' : ' + scores[1];
        }

        function side(p) {
          return p === 0 ? 'left' : 'right';
        }

        function renderNext() {
          const last = round === rounds.length - 1;
          nextBtn.innerHTML = '<span>' + (last ? 'Итог дуэли' : 'Следующий раунд') + '</span>' + GP.icon('arrow-right');
        }

        function loadRound() {
          roundFinished = false;
          answeredCount = 0;
          done[0] = done[1] = false;
          roundEl.textContent = 'Раунд ' + (round + 1) + ' из ' + rounds.length;
          updateScore();
          renderNext();
          [0, 1].forEach(function (p) {
            const text = rounds[round][side(p)].text;
            taskEls[p].classList.toggle('task-text--duel-long', text.length > 95);
            GP.setHTML(taskEls[p], text);
            halves[p].classList.remove('is-correct');
            halves[p].checkBtn.disabled = false;
            numpads[p].clear();
            numpads[p].setDisabled(false);
          });
        }

        function submit(p, raw) {
          if (roundFinished || done[p]) return;
          if (GP.parseAnswer(raw) === null) {
            numpads[p].setStatus('warn', 'Введите число'); // no penalty
            return;
          }
          if (GP.isCorrect(raw, rounds[round][side(p)].answer)) {
            const points = answeredCount === 0 ? FIRST_POINTS : SECOND_POINTS;
            scores[p] += points;
            answeredCount++;
            done[p] = true;
            numpads[p].flash('ok');
            numpads[p].setStatus('ok', 'Верно, +' + points);
            numpads[p].setDisabled(true);
            halves[p].checkBtn.disabled = true;
            halves[p].classList.add('is-correct');
            updateScore();
            if (done[0] && done[1]) {
              roundFinished = true;
              advanceTimer = setTimeout(nextRound, AUTO_ADVANCE_MS);
            }
          } else {
            numpads[p].flash('bad');
            numpads[p].setStatus('bad', 'Неверно');
            halves[p].classList.remove('is-shaking');
            void halves[p].offsetWidth;
            halves[p].classList.add('is-shaking');
          }
        }

        // First teacher press ends the round and shows the answers of those who
        // have not answered yet; the next press (or the auto-advance) moves on.
        function onTeacherNext() {
          if (duelOver) return;
          if (!roundFinished) {
            roundFinished = true;
            [0, 1].forEach(function (p) {
              if (done[p]) return;
              numpads[p].setDisabled(true);
              halves[p].checkBtn.disabled = true;
              numpads[p].setStatus('info', 'Правильный ответ: ' + GP.answerText(rounds[round][side(p)]));
            });
            return;
          }
          nextRound();
        }

        function nextRound() {
          clearTimeout(advanceTimer);
          if (duelOver) return;
          if (round === rounds.length - 1) {
            finishDuel();
            return;
          }
          round++;
          loadRound();
        }

        function finishDuel() {
          duelOver = true;
          roundFinished = true;
          let title;
          if (scores[0] === scores[1]) {
            title = 'Ничья — ' + scores[0] + ' : ' + scores[1];
          } else {
            const winner = scores[0] > scores[1] ? 0 : 1;
            title = 'Победил Игрок ' + (winner + 1) + ' — ' + scores[winner] + ' : ' + scores[1 - winner];
          }
          const box = GP.h('div', 'result');
          box.appendChild(GP.h('div', 'result-trophy', GP.icon('trophy', { size: 'l' })));
          const actions = GP.h('div', 'dialog-actions');
          const toPairs = GP.h('button', 'btn', 'К парной работе');
          const again = GP.h('button', 'btn btn--primary', 'Сыграть ещё раз');
          actions.append(toPairs, again);
          box.appendChild(actions);
          const close = GP.openDialog(box, { title: title });
          GP.onTap(again, function () {
            close();
            startDuel();
          });
          GP.onTap(toPairs, function () {
            close();
            showMenu();
          });
        }

        GP.onTap(nextBtn, onTeacherNext);
        cleanup = function () {
          clearTimeout(advanceTimer);
          numpads.forEach(function (pad) {
            if (pad) pad.destroy();
          });
        };
        loadRound();
      }

      // ---------- desk pairs ----------

      function startDesk() {
        clearView();
        const runner = GP.createTaskRunner(root, GP.buildDesk(), {
          title: 'Пары за партами',
          back: parent,
          timer: { presets: [2, 3, 5], initial: 3 },
          finishLabel: 'Завершить',
          onFinish: function (result) {
            const box = GP.h('div', 'result');
            box.appendChild(GP.h('p', 'result-text', 'С первой попытки — ' + result.firstTry + ' из ' + result.total));
            const actions = GP.h('div', 'dialog-actions');
            const home = GP.h('button', 'btn', 'В меню');
            const again = GP.h('button', 'btn btn--primary', 'Ещё раз');
            actions.append(home, again);
            box.appendChild(actions);
            const close = GP.openDialog(box, { title: 'Готово' });
            GP.onTap(again, function () {
              close();
              startDesk();
            });
            GP.onTap(home, GP.goHome);
          }
        });
        cleanup = function () {
          runner.destroy();
        };
      }

      showMenu();
      GP.current = { destroy: clearView };
    }
  };
})();
