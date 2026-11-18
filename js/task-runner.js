// Runs a series of tasks on one screen (trainer levels, "desk pairs").
(function () {
  'use strict';
  const GP = window.GP;

  // `container` is the whole screen: the runner fills it with a top bar and a body.
  // opts: { title, back: { label, onBack }, timer?: { presets, initial },
  //         finishLabel?: string, onFinish({ firstTry, total }) }
  GP.createTaskRunner = function (container, tasks, opts) {
    let index = 0;
    let firstTry = 0;
    let errors = 0;
    let assisted = false; // hint or solution opened for the current task
    let solved = false;
    let lockUntil = 0; // swallows the Enter that has just submitted a correct answer
    let numpad = null;
    let choices = null;
    let timer = null;
    const states = tasks.map(function () {
      return 'todo';
    });

    container.innerHTML = '';
    container.appendChild(GP.topBar(opts.title, { back: opts.back }));
    const body = GP.h('div', 'screen-body runner');
    container.appendChild(body);

    // progress row: counter, segmented bar, timer
    const row = GP.h('div', 'progress-row');
    const counter = GP.h('span', 'caption runner-counter');
    const progress = GP.progressBar(tasks.length);
    row.append(counter, progress.el);
    if (opts.timer) {
      const timerHost = GP.h('div', 'runner-timer');
      row.appendChild(timerHost);
      timer = GP.createTimer(timerHost, opts.timer);
    }
    body.appendChild(row);

    const grid = GP.h('div', 'runner-grid');
    body.appendChild(grid);

    // left: task card
    const card = GP.h('div', 'card runner-card');
    const area = GP.h('div', 'task-area');
    const text = GP.h('p', 'task-text');
    area.appendChild(text);
    const hintBox = GP.h('div', 'note-box note-box--hint is-hidden');
    const solutionBox = GP.h('div', 'note-box note-box--solution is-hidden');
    card.append(area, hintBox, solutionBox);
    grid.appendChild(card);

    // right: input, one primary button, two quiet ones
    const side = GP.h('div', 'runner-side');
    const inputHost = GP.h('div', 'runner-input');
    const primaryBtn = GP.h('button', 'btn btn--primary btn--block runner-primary');
    const quietRow = GP.h('div', 'runner-quiet');
    const hintBtn = GP.h('button', 'btn btn--quiet', GP.icon('lightbulb') + '<span>Подсказка</span>');
    const solutionBtn = GP.h('button', 'btn btn--quiet', GP.icon('list-checks') + '<span>Показать решение</span>');
    quietRow.append(hintBtn, solutionBtn);
    side.append(inputHost, primaryBtn, quietRow);
    grid.appendChild(side);

    function setChoiceStatus(kind, textValue) {
      const slot = inputHost.querySelector('.status-slot');
      if (slot) slot.innerHTML = kind ? GP.chip(kind, textValue) : '';
    }

    function say(kind, message) {
      // kind: 'success' | 'danger' | 'warning'
      if (numpad) numpad.setStatus(kind === 'success' ? 'ok' : kind === 'danger' ? 'bad' : 'warn', message);
      else setChoiceStatus(kind, message);
    }

    function renderPrimary() {
      const task = tasks[index];
      const last = index === tasks.length - 1;
      primaryBtn.classList.toggle('is-hidden', !solved && task.type === 'choice');
      if (solved) {
        primaryBtn.innerHTML = '<span>' + (last ? opts.finishLabel || 'Завершить уровень' : 'Дальше') + '</span>' + GP.icon('arrow-right');
      } else {
        primaryBtn.innerHTML = GP.icon('check') + '<span>Проверить</span>';
      }
    }

    function renderProgress() {
      counter.textContent = 'Задача ' + (index + 1) + ' из ' + tasks.length;
      progress.set(index, states);
    }

    function markSolved() {
      solved = true;
      states[index] = 'done';
      solutionBtn.classList.add('btn--quiet');
      if (numpad) numpad.setDisabled(true);
      renderProgress();
      renderPrimary();
    }

    function onCorrect() {
      if (errors === 0 && !assisted) firstTry++;
      lockUntil = Date.now() + 300;
      say('success', 'Верно');
      markSolved();
    }

    function onWrong() {
      errors++;
      say('danger', 'Неверно, попробуйте ещё');
      if (errors >= 2) {
        // a secondary button now: the solution is the sensible next step
        solutionBtn.classList.remove('btn--quiet');
      }
    }

    function submitNumber(raw) {
      if (solved) {
        next();
        return;
      }
      if (GP.parseAnswer(raw) === null) {
        numpad.setStatus('warn', 'Введите число'); // an empty or broken input costs nothing
        return;
      }
      if (GP.isCorrect(raw, tasks[index].answer)) {
        numpad.flash('ok');
        onCorrect();
      } else {
        numpad.flash('bad');
        onWrong();
      }
    }

    function buildChoice(task) {
      const status = GP.h('div', 'status-slot');
      status.setAttribute('role', 'status');
      inputHost.appendChild(status);
      choices = GP.createChoices(inputHost, task.options, function (i) {
        if (solved) return;
        if (i === task.answer) {
          choices.setState(i, 'correct');
          choices.disableAll();
          onCorrect();
          primaryBtn.focus({ preventScroll: true }); // the chosen option was disabled: keep the keyboard focus alive
        } else {
          choices.setState(i, 'wrong');
          choices.setDisabled(i, true);
          onWrong();
        }
      });
    }

    function loadTask() {
      const task = tasks[index];
      errors = 0;
      assisted = false;
      solved = false;
      if (numpad) {
        numpad.destroy();
        numpad = null;
      }
      choices = null;
      inputHost.innerHTML = '';

      text.className = 'task-text' + (task.text.length > 180 ? ' task-text--long' : '');
      GP.setHTML(text, task.text);
      hintBox.classList.add('is-hidden');
      solutionBox.classList.add('is-hidden');
      hintBtn.classList.toggle('is-hidden', !task.hint);
      hintBtn.disabled = false;
      solutionBtn.classList.add('btn--quiet');

      if (task.type === 'choice') {
        buildChoice(task);
      } else {
        numpad = GP.createNumpad(inputHost, {
          onSubmit: submitNumber,
          keyboard: true,
          size: 'l',
          unit: task.unit
        });
      }
      renderProgress();
      renderPrimary();
    }

    function next() {
      if (!solved) return;
      if (index === tasks.length - 1) {
        opts.onFinish({ firstTry: firstTry, total: tasks.length });
        return;
      }
      index++;
      loadTask();
    }

    GP.onTap(primaryBtn, function () {
      if (solved) next();
      else if (numpad) numpad.submit();
    });

    GP.onTap(hintBtn, function () {
      const task = tasks[index];
      if (!task.hint) return;
      assisted = true;
      GP.setHTML(hintBox, GP.icon('lightbulb') + '<span>' + task.hint + '</span>');
      hintBox.classList.remove('is-hidden');
      hintBtn.disabled = true;
    });

    GP.onTap(solutionBtn, function () {
      const task = tasks[index];
      assisted = true;
      const list = GP.h('ol', 'steps');
      GP.solutionSteps(task).forEach(function (line) {
        list.appendChild(GP.h('li', '', line));
      });
      solutionBox.innerHTML = '';
      solutionBox.appendChild(list);
      solutionBox.classList.remove('is-hidden');
      if (!solved) markSolved();
    });

    // Enter = "next" once solved. Registered before any numpad of this runner, so on the
    // Enter that submits a correct answer this handler has already run (lockUntil is a guard).
    function onKeyDown(e) {
      if (e.key !== 'Enter' || e.repeat || !solved) return;
      if (GP.isOverlayOpen() || Date.now() < lockUntil) return;
      if (e.target.closest && e.target.closest('button')) return; // the focused button handles it
      e.preventDefault();
      next();
    }
    document.addEventListener('keydown', onKeyDown);

    loadTask();

    return {
      destroy: function () {
        document.removeEventListener('keydown', onKeyDown);
        if (numpad) numpad.destroy();
        if (timer) timer.destroy();
        container.innerHTML = '';
      }
    };
  };
})();
