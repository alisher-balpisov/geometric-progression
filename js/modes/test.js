// Independent work: two variants side by side, answers on demand. No answer input.
(function () {
  'use strict';
  const GP = window.GP;

  GP.modes.test = {
    start: function () {
      GP.showScreen('screen-test', 'Самостоятельная работа');
      const root = document.getElementById('screen-test');
      root.innerHTML = '';

      let answersShown = false;
      const taskBtns = [];
      const answerEls = [];

      // the timer sits in the header (the formulas button is hidden here), which frees height for 5 tasks
      const timerHost = GP.h('div', 'test-timer');
      const timer = GP.createTimer(timerHost, { presets: [10, 15, 20], initial: 15 });
      root.appendChild(GP.topBar('Самостоятельная работа', { formulas: false, end: timerHost }));
      const body = GP.h('div', 'screen-body test');
      root.appendChild(body);

      function showSolution(task, variant, number) {
        const box = GP.h('div', 'solutions');
        box.appendChild(GP.h('p', 'solution-question', task.text));
        const steps = GP.h('ol', 'steps');
        GP.solutionSteps(task).forEach(function (line) {
          steps.appendChild(GP.h('li', '', line));
        });
        box.appendChild(steps);
        GP.openDialog(box, { title: 'Вариант ' + variant + ', задача ' + number });
      }

      const columns = GP.h('div', 'test-columns card');
      GP.buildTest().forEach(function (tasks, v) {
        const col = GP.h('section', 'test-col');
        col.appendChild(GP.h('h2', 'test-variant', 'Вариант ' + (v + 1)));
        const list = GP.h('ol', 'test-list');
        tasks.forEach(function (task, i) {
          const item = document.createElement('li');
          const btn = GP.h('button', 'test-task');
          btn.disabled = true; // becomes a button once the answers are shown
          const answer = GP.h(
            'span',
            'chip chip--success test-answer is-hidden',
            GP.icon('check', { size: 's' }) + '<span>Ответ: ' + GP.answerText(task) + '</span>'
          );
          // the answer chip flows right after the statement, so the list stays short
          const text = GP.h('span', 'test-text' + (task.text.length > 95 ? ' test-text--long' : ''));
          text.append(GP.h('span', 'test-statement', task.text), answer);
          btn.append(GP.h('span', 'test-num', String(i + 1)), text);
          GP.onTap(btn, function () {
            if (answersShown) showSolution(task, v + 1, i + 1);
          });
          item.appendChild(btn);
          list.appendChild(item);
          taskBtns.push(btn);
          answerEls.push(answer);
        });
        col.appendChild(list);
        columns.appendChild(col);
      });
      body.appendChild(columns);

      const footer = GP.h('div', 'test-footer');
      const toggleBtn = GP.h('button', 'btn');
      footer.appendChild(toggleBtn);
      body.appendChild(footer);

      function render() {
        answerEls.forEach(function (el) {
          el.classList.toggle('is-hidden', !answersShown);
        });
        taskBtns.forEach(function (btn) {
          btn.disabled = !answersShown;
        });
        toggleBtn.innerHTML = GP.icon('list-checks') + '<span>' + (answersShown ? 'Скрыть ответы' : 'Показать ответы') + '</span>';
      }

      GP.onTap(toggleBtn, function () {
        if (answersShown) {
          answersShown = false;
          render();
          return;
        }
        GP.confirm('Показать ответы всему классу?', { confirmLabel: 'Показать ответы' }).then(function (yes) {
          if (yes) {
            answersShown = true;
            render();
          }
        });
      });

      render();
      GP.current = {
        destroy: function () {
          timer.destroy();
          root.innerHTML = '';
        }
      };
    }
  };
})();
