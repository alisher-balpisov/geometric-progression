// Theory quiz: the class answers aloud, someone taps the option on the board.
(function () {
  'use strict';
  const GP = window.GP;
  const STARS_FOR_TOP = 10;
  const STARS_FOR_GOOD = 7;

  GP.modes.theory = {
    start: function () {
      GP.showScreen('screen-theory', 'Опрос по теории');
      const root = document.getElementById('screen-theory');
      root.innerHTML = '';

      const questions = GP.buildTheory();
      const states = questions.map(function () {
        return 'todo';
      });
      let index = 0;
      let correct = 0;
      let answered = false;
      let choices = null;

      root.appendChild(GP.topBar('Опрос по теории'));
      const body = GP.h('div', 'screen-body quiz');
      root.appendChild(body);

      const row = GP.h('div', 'progress-row');
      const counter = GP.h('span', 'caption');
      const progress = GP.progressBar(questions.length);
      row.append(counter, progress.el);
      body.appendChild(row);

      const content = GP.h('div', 'quiz-content');
      const question = GP.h('p', 'quiz-question');
      const optionsHost = GP.h('div', 'quiz-options');
      const footer = GP.h('div', 'quiz-footer');
      const explain = GP.h('div', 'note-box note-box--explain');
      explain.setAttribute('role', 'status');
      const nextBtn = GP.h('button', 'btn btn--primary quiz-next');
      footer.append(explain, nextBtn);
      content.append(question, optionsHost, footer);
      body.appendChild(content);

      function load() {
        const q = questions[index];
        answered = false;
        counter.textContent = 'Вопрос ' + (index + 1) + ' из ' + questions.length;
        progress.set(index, states);
        GP.setHTML(question, q.question);
        explain.innerHTML = '';
        explain.classList.add('is-invisible');
        nextBtn.classList.add('is-invisible');
        nextBtn.disabled = true;
        nextBtn.innerHTML = '<span>' + (index === questions.length - 1 ? 'Показать итог' : 'Следующий вопрос') + '</span>' + GP.icon('arrow-right');
        optionsHost.innerHTML = '';
        choices = GP.createChoices(optionsHost, q.options, choose);
      }

      function choose(i) {
        if (answered) return;
        answered = true;
        const q = questions[index];
        choices.disableAll();
        for (let k = 0; k < q.options.length; k++) {
          choices.setState(k, k === q.answer ? (i === k ? 'correct' : 'reveal') : k === i ? 'wrong' : 'dim');
        }
        if (i === q.answer) correct++;
        states[index] = i === q.answer ? 'done' : 'wrong';
        progress.set(index, states);
        GP.setHTML(explain, GP.icon('lightbulb') + '<span>' + q.explain + '</span>');
        explain.classList.remove('is-invisible');
        nextBtn.classList.remove('is-invisible');
        nextBtn.disabled = false;
      }

      function finish() {
        const box = GP.h('div', 'result');
        box.appendChild(GP.h('p', 'result-score num', correct + ' из ' + questions.length));
        GP.celebrate(box, correct >= STARS_FOR_TOP ? 3 : correct >= STARS_FOR_GOOD ? 2 : 1);
        const actions = GP.h('div', 'dialog-actions');
        const home = GP.h('button', 'btn', 'В меню');
        const again = GP.h('button', 'btn btn--primary', 'Пройти ещё раз');
        actions.append(home, again);
        box.appendChild(actions);
        const close = GP.openDialog(box, { title: 'Опрос завершён' });
        GP.onTap(again, function () {
          close();
          GP.modes.theory.start();
        });
        GP.onTap(home, GP.goHome);
      }

      GP.onTap(nextBtn, function () {
        if (!answered) return;
        if (index === questions.length - 1) {
          finish();
        } else {
          index++;
          load();
        }
      });

      load();
      GP.current = {
        destroy: function () {
          root.innerHTML = '';
        }
      };
    }
  };
})();
