// Group work: each group has its own case; a representative types the answers on the board.
(function () {
  'use strict';
  const GP = window.GP;
  const LETTERS = ['а', 'б', 'в'];
  const STATUS_WORDS = { none: 'не отвечен', ok: 'решено', bad: 'неверно' };
  const GROUP_COUNTS = [2, 3, 4];
  // Lesson phases: solve on paper -> go to the board -> groups check each other in a circle.
  const PHASES = [
    { id: 'solve', label: 'Решаем' },
    { id: 'board', label: 'К доске' },
    { id: 'check', label: 'Проверяем' }
  ];

  GP.modes.groups = {
    start: function () {
      GP.showScreen('screen-groups', 'Групповая работа');
      const root = document.getElementById('screen-groups');
      root.innerHTML = '';

      const cases = GP.buildCases();
      let groupCount = 3;
      let status = []; // status[group][question]: 'none' | 'ok' | 'bad'
      let numpad = null;
      let timer = null;
      // The timer element is created once and moved between views, so it keeps running.
      const timerHost = GP.h('div', 'group-timer');
      let phase = 'solve';
      let autoBoard = false; // the board phase was switched on by the timer, not by the teacher
      let view = 'setup'; // 'setup' | 'overview' | 'group'
      let timeIsOver = false;

      // group g's work is checked by the previous group: 1 checks 2, 2 checks 3, ..., last checks 1
      function checkerOf(g) {
        return (g - 1 + groupCount) % groupCount;
      }

      function hintFor() {
        if (phase === 'board') {
          return { icon: 'users', title: 'Выходим к доске!', text: 'Каждый ученик группы берёт свой пункт: а, б или в.' };
        }
        if (phase === 'check') {
          const pairs = [];
          for (let g = 0; g < groupCount; g++) pairs.push((g + 1) + ' проверяет ' + (((g + 1) % groupCount) + 1));
          return { icon: 'list-checks', title: 'Проверяем по кругу', text: pairs.join(' · ') + '' };
        }
        return timeIsOver
          ? { icon: 'users', title: 'Время вышло', text: '' }
          : { icon: 'pencil-line', title: 'Решаем вместе на бумаге', text: '' };
      }

      function setPhase(next) {
        phase = next;
        if (view === 'overview') showOverview();
      }

      function onTimerChange(state) {
        if (state.over === timeIsOver) return;
        timeIsOver = state.over;
        if (timeIsOver && phase === 'solve') {
          autoBoard = true;
          setPhase('board');
        } else if (!timeIsOver && autoBoard && phase === 'board') {
          autoBoard = false;
          setPhase('solve');
        }
      }

      function clearView() {
        if (numpad) {
          numpad.destroy();
          numpad = null;
        }
        root.innerHTML = '';
      }

      function score(g) {
        return status[g].filter(function (s) {
          return s === 'ok';
        }).length;
      }

      // chip with the letter of a question and its status: icon + word, not colour alone
      function statusChip(letter, state) {
        const kind = state === 'ok' ? 'success' : state === 'bad' ? 'danger' : 'neutral';
        const icon = state === 'ok' ? GP.icon('check', { size: 's' }) : state === 'bad' ? GP.icon('x', { size: 's' }) : '';
        const chip = GP.h('span', 'chip chip--' + kind + ' q-chip', '<span>' + letter + '</span>' + icon);
        chip.setAttribute('role', 'img');
        chip.setAttribute('aria-label', letter + ' — ' + STATUS_WORDS[state]);
        return chip;
      }

      // ---------- setup ----------

      function showSetup() {
        view = 'setup';
        clearView();
        root.appendChild(GP.topBar('Групповая работа'));
        const body = GP.h('div', 'screen-body setup');
        const card = GP.h('div', 'card setup-card');
        card.appendChild(GP.h('h2', 'setup-title', 'Сколько групп?'));
        const segmented = GP.h('div', 'segmented');
        segmented.setAttribute('role', 'group');
        segmented.setAttribute('aria-label', 'Количество групп');
        const buttons = GROUP_COUNTS.map(function (n) {
          const btn = GP.h('button', 'segmented-item', n + ' группы');
          GP.onTap(btn, function () {
            groupCount = n;
            refresh();
          });
          segmented.appendChild(btn);
          return { n: n, btn: btn };
        });
        function refresh() {
          buttons.forEach(function (b) {
            b.btn.setAttribute('aria-pressed', String(b.n === groupCount));
          });
        }
        refresh();
        card.appendChild(segmented);
        card.appendChild(GP.h('p', 'setup-note', 'У каждой группы свой кейс из трёх заданий. Сначала все решают на бумаге, потом выходят к доске, потом группы проверяют друг друга по кругу.'));
        const startBtn = GP.h('button', 'btn btn--primary btn--block', '<span>Начать работу</span>' + GP.icon('arrow-right'));
        GP.onTap(startBtn, function () {
          status = [];
          phase = 'solve';
          autoBoard = false;
          for (let g = 0; g < groupCount; g++) status.push(['none', 'none', 'none']);
          if (!timer) timer = GP.createTimer(timerHost, {
            presets: [5, 10, 15],
            initial: 10,
            onChange: onTimerChange
          });
          showOverview();
        });
        card.appendChild(startBtn);
        body.appendChild(card);
        root.appendChild(body);
      }

      // ---------- overview ----------

      function showOverview() {
        view = 'overview';
        clearView();
        timerHost.classList.add('group-timer--big');
        root.appendChild(GP.topBar('Групповая работа'));
        const body = GP.h('div', 'screen-body');
        root.appendChild(body);

        const bar = GP.h('div', 'group-bar');
        bar.appendChild(timerHost);
        const steps = GP.h('div', 'segmented phase-steps');
        steps.setAttribute('role', 'group');
        steps.setAttribute('aria-label', 'Этап работы');
        PHASES.forEach(function (ph, i) {
          const btn = GP.h('button', 'segmented-item', (i + 1) + ' · ' + ph.label);
          btn.setAttribute('aria-pressed', String(ph.id === phase));
          GP.onTap(btn, function () {
            autoBoard = false;
            setPhase(ph.id);
          });
          steps.appendChild(btn);
        });
        bar.appendChild(steps);
        const finishBtn = GP.h('button', 'btn', GP.icon('list-checks') + '<span>Итоги</span>');
        GP.onTap(finishBtn, function () {
          GP.confirm('Подвести итоги групповой работы?', { confirmLabel: 'Подвести итоги' }).then(function (yes) {
            if (yes) showResults();
          });
        });
        bar.appendChild(finishBtn);
        body.appendChild(bar);

        const h = hintFor();
        const hint = GP.h('div', 'group-hint group-hint--' + phase, GP.icon(h.icon) + '<p><b></b> <span></span></p>');
        hint.setAttribute('role', 'status');
        hint.querySelector('b').textContent = h.title;
        hint.querySelector('span').textContent = h.text;
        body.appendChild(hint);

        const grid = GP.h('div', 'group-grid' + (groupCount > 3 ? ' group-grid--dense' : ''));
        for (let g = 0; g < groupCount; g++) {
          const c = cases[g];
          const card = GP.h('div', 'card group-card');
          const chips = GP.h('div', 'group-chips');
          status[g].forEach(function (s, i) {
            const chip = statusChip(LETTERS[i], s);
            chips.appendChild(chip);
          });
          const questions = GP.h('span', 'group-questions');
          c.questions.forEach(function (q, i) {
            questions.appendChild(GP.h('span', 'group-question', '<b>' + LETTERS[i] + ')</b> ' + q.text + (q.unit ? ' <span class="q-unit">(ед.: ' + q.unit + ')</span>' : '')));
          });
          const head = GP.h('span', 'group-head');
          head.append(GP.h('span', 'group-icon', GP.icon(c.icon)), GP.h('span', 'group-case', c.title));
          const top = GP.h('div', 'group-top');
          top.append(GP.h('span', 'caption', 'Группа ' + (g + 1)), GP.h('span', 'group-score num', 'Очки: ' + score(g) + ' из 3'));
          const openBtn = GP.h('button', 'btn btn--icon btn--quiet group-open', GP.icon('pencil-line'));
          openBtn.setAttribute('aria-label', 'Ввести ответы группы ' + (g + 1));
          openBtn.title = 'Ввести ответы';
          GP.onTap(openBtn, function () {
            showGroup(g);
          });
          card.append(top, head);
          if (phase === 'check') {
            card.appendChild(GP.h('span', 'chip chip--warning group-checker', GP.icon('users', { size: 's' }) + '<span>Проверяет группа ' + (checkerOf(g) + 1) + '</span>'));
          }
          card.append(
            GP.h('span', 'group-card-story', c.story),
            questions
          );
          const foot = GP.h('div', 'group-foot');
          foot.append(chips, openBtn);
          card.append(foot);
          grid.appendChild(card);
        }
        body.appendChild(grid);
      }

      // ---------- one group ----------

      function showGroup(g) {
        view = 'group';
        clearView();
        timerHost.classList.remove('group-timer--big');
        const c = cases[g];
        root.appendChild(
          GP.topBar('Группа ' + (g + 1) + ' · ' + c.title, {
            back: { label: 'Все группы', onBack: showOverview },
            end: timerHost
          })
        );
        const body = GP.h('div', 'screen-body runner-grid');
        root.appendChild(body);

        const left = GP.h('div', 'group-left');
        const story = GP.h('div', 'card group-story');
        story.append(GP.h('span', 'group-story-icon', GP.icon(c.icon, { size: 'l' })), GP.h('p', 'group-story-text', c.story));
        const list = GP.h('div', 'q-list');
        left.append(story, list);
        const right = GP.h('div', 'runner-side');
        const padHost = GP.h('div', 'runner-input');
        const checkBtn = GP.h('button', 'btn btn--primary btn--block runner-primary', GP.icon('check') + '<span>Проверить</span>');
        right.append(padHost, checkBtn);
        body.append(left, right);

        function nextOpen(after) {
          for (let i = after + 1; i < 3; i++) if (status[g][i] !== 'ok') return i;
          for (let i = 0; i <= after; i++) if (status[g][i] !== 'ok') return i;
          return -1;
        }

        let active = nextOpen(-1); // first question that is not solved yet, -1 if all are

        function buildPad() {
          if (numpad) numpad.destroy();
          const q = c.questions[active];
          numpad = GP.createNumpad(padHost, {
            onSubmit: submit,
            keyboard: true,
            size: 'l',
            label: active === -1 ? 'Ответ' : 'Ответ на вопрос ' + LETTERS[active] + ')',
            unit: q ? q.unit : undefined
          });
          if (active === -1) {
            numpad.setDisabled(true);
            numpad.setStatus('ok', 'Все вопросы решены');
            checkBtn.disabled = true;
          }
        }

        function renderRows() {
          list.innerHTML = '';
          c.questions.forEach(function (q, i) {
            const row = GP.h('button', 'row-button q-row');
            row.classList.toggle('is-active', i === active);
            row.disabled = status[g][i] === 'ok';
            const unit = q.unit ? ' <span class="q-unit">(ед.: ' + q.unit + ')</span>' : '';
            row.append(
              GP.h('span', 'q-letter', LETTERS[i] + ')'),
              GP.h('span', 'q-text', q.text + unit),
              i === active ? GP.h('span', 'caption q-active', 'Вводим ответ') : statusChip(LETTERS[i], status[g][i])
            );
            GP.onTap(row, function () {
              active = i;
              buildPad();
              renderRows();
            });
            list.appendChild(row);
          });
        }

        function submit(raw) {
          if (active === -1) return;
          if (GP.parseAnswer(raw) === null) {
            numpad.setStatus('warn', 'Введите число');
            return;
          }
          const q = c.questions[active];
          if (GP.isCorrect(raw, q.answer)) {
            status[g][active] = 'ok';
            active = nextOpen(active);
            buildPad();
          } else {
            status[g][active] = 'bad'; // attempts are not limited, only a correct answer scores
            numpad.flash('bad');
            numpad.setStatus('bad', 'Неверно, попробуйте ещё');
          }
          renderRows();
        }

        GP.onTap(checkBtn, function () {
          if (numpad) numpad.submit();
        });

        buildPad();
        renderRows();
      }

      // ---------- results ----------

      function showSolutions(g) {
        const c = cases[g];
        const box = GP.h('div', 'solutions');
        box.appendChild(GP.h('p', 'solutions-story', c.story));
        c.questions.forEach(function (q, i) {
          const block = GP.h('div', 'solution-block');
          block.appendChild(GP.h('p', 'solution-question', LETTERS[i] + ') ' + q.text));
          const steps = GP.h('ol', 'steps');
          GP.solutionSteps(q).forEach(function (line) {
            steps.appendChild(GP.h('li', '', line));
          });
          block.appendChild(steps);
          box.appendChild(block);
        });
        const actions = GP.h('div', 'dialog-actions');
        const backBtn = GP.h('button', 'btn', GP.icon('arrow-left') + '<span>К итогам</span>');
        actions.appendChild(backBtn);
        box.appendChild(actions);
        const close = GP.openDialog(box, { title: 'Группа ' + (g + 1) + ' · ' + c.title });
        GP.onTap(backBtn, function () {
          close();
          showResults();
        });
      }

      function showResults() {
        const order = [];
        for (let g = 0; g < groupCount; g++) order.push(g);
        order.sort(function (a, b) {
          return score(b) - score(a) || a - b;
        });
        const best = score(order[0]);

        const box = GP.h('div', 'result result--wide');
        const table = GP.h('table', 'results-table');
        table.innerHTML = '<thead><tr><th scope="col">Группа</th><th scope="col">Кейс</th><th scope="col">Очки</th><th scope="col"><span class="visually-hidden">Решения</span></th></tr></thead>';
        const tbody = document.createElement('tbody');
        order.forEach(function (g) {
          const c = cases[g];
          const leader = best > 0 && score(g) === best;
          const tr = document.createElement('tr');
          if (leader) tr.className = 'is-leader';
          const nameCell = GP.h('td', 'results-name', 'Группа ' + (g + 1));
          if (leader) nameCell.appendChild(GP.h('span', 'chip chip--warning', GP.icon('trophy', { size: 's' }) + '<span>Лидер</span>'));
          const caseCell = GP.h('td', '', c.title);
          const scoreCell = GP.h('td', 'results-score num', score(g) + ' из 3');
          const solCell = document.createElement('td');
          const btn = GP.h('button', 'btn btn--quiet', GP.icon('book-open') + '<span>Решения</span>');
          GP.onTap(btn, function () {
            close();
            showSolutions(g);
          });
          solCell.appendChild(btn);
          tr.append(nameCell, caseCell, scoreCell, solCell);
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        box.appendChild(table);
        const actions = GP.h('div', 'dialog-actions');
        const home = GP.h('button', 'btn btn--primary', 'В меню');
        actions.appendChild(home);
        box.appendChild(actions);
        const close = GP.openDialog(box, { title: 'Итоги групповой работы' });
        GP.onTap(home, GP.goHome);
      }

      showSetup();
      GP.current = {
        destroy: function () {
          if (timer) timer.destroy();
          timer = null;
          clearView();
        }
      };
    }
  };
})();
