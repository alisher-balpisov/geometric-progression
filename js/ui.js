// Shared UI: navigation, tap handling, dialogs, numpad, timer, progress, choices.
(function () {
  'use strict';
  const GP = (window.GP = window.GP || {});
  GP.modes = GP.modes || {};
  GP.current = null; // active mode registers { destroy() } here after GP.showScreen()

  const APP_TITLE = 'Геометрическая прогрессия';

  // ---------- helpers ----------

  // Wraps every Latin letter (a variable) in <var> and turns a hyphen-minus into a real minus.
  GP.typeset = function (root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      const parent = node.parentNode;
      if (parent.closest && parent.closest('var, script, style')) return;
      const text = node.nodeValue.replace(/(^|[\s(=;:])-(?=[0-9A-Za-z])/g, '$1−');
      if (!/[a-zA-Z]/.test(text)) {
        if (text !== node.nodeValue) node.nodeValue = text;
        return;
      }
      const fragment = document.createDocumentFragment();
      text.split(/([a-zA-Z])/).forEach(function (part) {
        if (/^[a-zA-Z]$/.test(part)) {
          const v = document.createElement('var');
          v.textContent = part;
          fragment.appendChild(v);
        } else if (part) {
          fragment.appendChild(document.createTextNode(part));
        }
      });
      parent.replaceChild(fragment, node);
    });
  };

  GP.setHTML = function (el, html) {
    el.innerHTML = html;
    GP.typeset(el);
    return el;
  };

  GP.h = function (tag, className, html) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (html !== undefined && html !== null) GP.setHTML(el, html);
    if (tag === 'button') el.type = 'button';
    return el;
  };

  // opts: { size?: 's' | 'm' | 'l', label?: string } -> SVG markup from the sprite
  GP.icon = function (name, opts) {
    opts = opts || {};
    const size = opts.size && opts.size !== 'm' ? ' icon--' + opts.size : '';
    const attrs = opts.label ? ' role="img"' : ' aria-hidden="true"';
    const title = opts.label ? '<title>' + opts.label + '</title>' : '';
    return '<svg class="icon' + size + '"' + attrs + '>' + title + '<use href="#i-' + name + '"></use></svg>';
  };

  // Chip markup for answer feedback: icon + word + colour.
  GP.chip = function (kind, text) {
    const icons = { success: 'check', danger: 'x' };
    const icon = icons[kind] ? GP.icon(icons[kind], { size: 's' }) : '';
    return '<span class="chip chip--' + kind + '">' + icon + '<span>' + text + '</span></span>';
  };

  // The only way to bind presses on the whole site. pointerdown (not click) so that two
  // players pressing at once are both registered on a multitouch board; a click without
  // a pointer (detail 0) is a keyboard press (Enter / Space on a focused button).
  GP.onTap = function (el, handler) {
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      if (el.disabled) return;
      handler(e);
    });
    el.addEventListener('click', function (e) {
      if (e.detail !== 0 || el.disabled) return;
      handler(e);
    });
  };

  // ---------- navigation ----------

  GP.showScreen = function (id, title) {
    // Dialogs first: their close handlers belong to the mode that is about to be destroyed.
    GP.closeAllOverlays();
    if (GP.current) {
      const mode = GP.current;
      GP.current = null;
      try {
        mode.destroy();
      } catch (err) {
        console.warn('Mode cleanup failed', err);
      }
    }
    document.querySelectorAll('.screen').forEach(function (screen) {
      screen.classList.toggle('is-active', screen.id === id);
    });
    document.title = title ? title + ' — ' + APP_TITLE : APP_TITLE;
    if (id === 'screen-home' && GP.refreshHome) GP.refreshHome();
    setTimeout(function () {
      const heading = document.querySelector('#' + id + ' h1');
      if (heading) heading.focus({ preventScroll: true });
    }, 0);
  };

  GP.goHome = function () {
    GP.showScreen('screen-home');
  };

  // opts: { back?: { label, onBack }, formulas?: boolean, end?: Node }
  GP.topBar = function (title, opts) {
    opts = opts || {};
    const bar = GP.h('div', 'topbar');
    const back = opts.back || { label: 'Меню', onBack: GP.goHome };
    const backBtn = GP.h('button', 'btn btn--quiet topbar-back', GP.icon('arrow-left') + '<span>' + back.label + '</span>');
    GP.onTap(backBtn, function () {
      back.onBack();
    });
    const heading = GP.h('h1', 'topbar-title', title);
    heading.tabIndex = -1;
    const end = GP.h('div', 'topbar-end');
    if (opts.end) end.appendChild(opts.end);
    if (opts.formulas !== false) {
      const formulas = GP.h('button', 'btn', GP.icon('book-open') + '<span>Формулы</span>');
      GP.onTap(formulas, GP.showFormulas);
      end.appendChild(formulas);
    }
    bar.append(backBtn, heading, end);
    return bar;
  };

  // ---------- dialogs ----------

  const dialogs = [];

  // Native <dialog>: focus stays inside, Esc closes. Returns the close function.
  // opts: { title: string, onClose?: () => void }
  GP.openDialog = function (node, opts) {
    opts = opts || {};
    const opener = document.activeElement;
    const dialog = document.createElement('dialog');
    dialog.className = 'dialog';
    const titleId = 'dialog-title-' + dialogs.length + '-' + Date.now();
    dialog.setAttribute('aria-labelledby', titleId);

    const head = GP.h('div', 'dialog-head');
    const title = GP.h('h2', 'dialog-title', opts.title || '');
    title.id = titleId;
    const closeBtn = GP.h('button', 'btn btn--icon btn--quiet', GP.icon('x'));
    closeBtn.setAttribute('aria-label', 'Закрыть');
    head.append(title, closeBtn);
    const body = GP.h('div', 'dialog-body');
    body.appendChild(node);
    dialog.append(head, body);
    document.getElementById('overlay-root').appendChild(dialog);

    const entry = { close: null };
    let closed = false;
    function close() {
      if (closed) return;
      closed = true;
      const i = dialogs.indexOf(entry);
      if (i !== -1) dialogs.splice(i, 1);
      if (dialog.open) dialog.close();
      dialog.remove();
      if (opts.onClose) opts.onClose();
      if (opener && opener.isConnected && opener.focus) opener.focus();
    }
    entry.close = close;
    dialogs.push(entry);

    GP.onTap(closeBtn, close);
    dialog.addEventListener('cancel', function (e) {
      e.preventDefault();
      close();
    });
    dialog.addEventListener('pointerdown', function (e) {
      if (e.target === dialog) close(); // a press on the backdrop
    });
    dialog.showModal();
    return close;
  };

  GP.isOverlayOpen = function () {
    return dialogs.length > 0;
  };

  GP.closeAllOverlays = function () {
    dialogs.slice().forEach(function (entry) {
      entry.close();
    });
  };

  // opts: { confirmLabel: string } — buttons are verbs (the dialog title is the question).
  GP.confirm = function (text, opts) {
    return new Promise(function (resolve) {
      let settled = false;
      function settle(value) {
        if (!settled) {
          settled = true;
          resolve(value);
        }
      }
      const box = GP.h('div', 'dialog-actions');
      const no = GP.h('button', 'btn', 'Отмена');
      const yes = GP.h('button', 'btn btn--primary', opts.confirmLabel);
      box.append(no, yes);
      const close = GP.openDialog(box, {
        title: text,
        onClose: function () {
          settle(false);
        }
      });
      GP.onTap(yes, function () {
        settle(true);
        close();
      });
      GP.onTap(no, close);
    });
  };

  GP.showFormulas = function () {
    const rows = [
      ['b<sub>n+1</sub> = b<sub>n</sub> · q', 'каждый следующий член'],
      ['q = b<sub>n+1</sub> : b<sub>n</sub>', 'знаменатель'],
      ['b<sub>n</sub> = b<sub>1</sub> · q<sup>n−1</sup>', 'формула n-го члена'],
      ['b<sub>n</sub><sup>2</sup> = b<sub>n−1</sub> · b<sub>n+1</sub>', 'свойство соседних членов']
    ];
    const list = GP.h('ol', 'formula-list');
    rows.forEach(function (row) {
      const item = GP.h('li', 'formula-row');
      item.append(GP.h('span', 'formula-expr', row[0]), GP.h('span', 'formula-note', row[1]));
      list.appendChild(item);
    });
    GP.openDialog(list, { title: 'Формулы' });
  };

  // Three stars appear one after another (replaces confetti).
  GP.celebrate = function (container, stars) {
    const box = GP.h('div', 'stars');
    for (let i = 0; i < 3; i++) {
      const on = i < stars;
      const star = GP.h('span', '', '<svg class="icon star' + (on ? ' is-on' : '') + '" aria-hidden="true"><use href="#i-star"></use></svg>');
      if (on) star.firstChild.style.animationDelay = i * 120 + 'ms';
      box.appendChild(star.firstChild);
    }
    container.appendChild(box);
    container.appendChild(GP.h('p', 'visually-hidden', 'Звёзд: ' + stars + ' из 3'));
  };

  // ---------- progress bar ----------

  // set(index, states): states[i] is 'done' | 'wrong' | 'todo'; index is the current one.
  GP.progressBar = function (total) {
    const el = GP.h('div', 'progress');
    const segs = [];
    for (let i = 0; i < total; i++) {
      const seg = GP.h('span', 'progress-seg');
      segs.push(seg);
      el.appendChild(seg);
    }
    return {
      el: el,
      set: function (index, states) {
        segs.forEach(function (seg, i) {
          const state = states[i] || 'todo';
          seg.className = 'progress-seg' + (state === 'done' ? ' is-done' : '') + (state === 'wrong' ? ' is-wrong' : '') +
            (i === index && state === 'todo' ? ' is-current' : '');
          seg.innerHTML = state === 'done' ? GP.icon('check', { size: 's' }) : state === 'wrong' ? GP.icon('x', { size: 's' }) : '';
        });
      }
    };
  };

  // ---------- answer choices (quiz and choice tasks) ----------

  const LETTERS = ['А', 'Б', 'В', 'Г'];
  const CHOICE_NOTES = {
    correct: ['check', 'Верно'],
    wrong: ['x', 'Неверно'],
    reveal: ['check', 'Правильный ответ']
  };

  // State of an option: 'correct' | 'wrong' | 'reveal' | 'dim' | null.
  GP.createChoices = function (container, options, onPick) {
    const el = GP.h('div', 'choice-list');
    el.setAttribute('role', 'group');
    const buttons = options.map(function (label, i) {
      const btn = GP.h('button', 'choice');
      btn.append(GP.h('span', 'choice-letter', LETTERS[i]), GP.h('span', 'choice-label', label), GP.h('span', 'choice-note'));
      GP.onTap(btn, function () {
        onPick(i);
      });
      el.appendChild(btn);
      return btn;
    });
    container.appendChild(el);
    return {
      el: el,
      setState: function (i, state) {
        const btn = buttons[i];
        btn.classList.remove('is-correct', 'is-wrong', 'is-reveal', 'is-dim');
        if (state) btn.classList.add('is-' + state);
        const note = CHOICE_NOTES[state];
        btn.lastChild.innerHTML = note ? GP.icon(note[0], { size: 's' }) + '<span>' + note[1] + '</span>' : '';
      },
      setDisabled: function (i, disabled) {
        buttons[i].disabled = disabled;
      },
      disableAll: function () {
        buttons.forEach(function (btn) {
          btn.disabled = true;
        });
      }
    };
  };

  // ---------- numpad ----------

  // There is no submit key: the answer is submitted by Enter (keyboard: true) or by the caller via submit().
  const NUMPAD_KEYS = [
    ['7', '7'], ['8', '8'], ['9', '9'], ['back', 'back'],
    ['4', '4'], ['5', '5'], ['6', '6'], ['C', 'clear'],
    ['1', '1'], ['2', '2'], ['3', '3'], ['∕', '∕'],
    ['−', '−'], ['0', '0'], [',', ',']
  ];
  const KEY_LABELS = { back: 'Стереть', clear: 'Очистить', '∕': 'Дробная черта', '−': 'Минус', ',': 'Запятая' };
  const NUMPAD_MAX_LENGTH = 12;

  // opts: { onSubmit(value), keyboard?, size?: 'l' | 'm', label?, unit? }
  // All state lives inside the instance: two numpads on one screen never interfere.
  GP.createNumpad = function (container, opts) {
    const size = opts.size || 'l';
    let value = '';
    let disabled = false;
    let statusKind = null;

    const root = GP.h('div', 'numpad numpad--' + size);
    const head = GP.h('div', 'numpad-head');
    head.appendChild(GP.h('span', 'caption', opts.label || 'Ваш ответ'));
    const slot = GP.h('div', 'status-slot');
    slot.setAttribute('role', 'status');
    head.appendChild(slot);
    const field = GP.h('div', 'numpad-field');
    field.setAttribute('role', 'textbox');
    field.setAttribute('aria-readonly', 'true');
    field.setAttribute('aria-label', opts.label || 'Ваш ответ');
    const valueEl = GP.h('span', 'numpad-value num');
    field.appendChild(valueEl);
    if (opts.unit) field.appendChild(GP.h('span', 'numpad-unit', opts.unit));
    const grid = GP.h('div', 'numpad-grid');
    root.append(head, field, grid);

    function render() {
      valueEl.innerHTML = value === '' ? '<span class="numpad-caret"></span>' : '';
      if (value !== '') valueEl.textContent = value;
    }

    function setStatus(kind, text) {
      statusKind = kind;
      slot.innerHTML = kind ? GP.chip(kind === 'ok' ? 'success' : kind === 'bad' ? 'danger' : kind === 'info' ? 'neutral' : 'warning', text) : '';
    }

    // The number currently being typed (after the fraction bar, if any).
    function currentPart() {
      const i = value.lastIndexOf('∕');
      return i === -1 ? value : value.slice(i + 1);
    }

    function submit() {
      if (!disabled) opts.onSubmit(value);
    }

    function press(key) {
      if (disabled) return;
      field.classList.remove('is-wrong');
      if (statusKind === 'warn' || statusKind === 'bad') setStatus(null);
      if (/^[0-9]$/.test(key)) {
        if (value.length < NUMPAD_MAX_LENGTH) value += key;
      } else if (key === ',') {
        const part = currentPart();
        if (part.indexOf(',') === -1 && value.length < NUMPAD_MAX_LENGTH - 1) {
          value += part.replace('−', '') === '' ? '0,' : ',';
        }
      } else if (key === '−') {
        if (value === '') value = '−';
      } else if (key === '∕') {
        if (value.indexOf('∕') === -1 && /[0-9]$/.test(value) && value.length < NUMPAD_MAX_LENGTH) {
          value += '∕';
        }
      } else if (key === 'back') {
        value = value.slice(0, -1);
      } else if (key === 'clear') {
        value = '';
      }
      render();
    }

    const keys = NUMPAD_KEYS.map(function (def) {
      const btn = GP.h('button', 'key');
      if (def[1] === 'back') btn.innerHTML = GP.icon('delete');
      else btn.textContent = def[0];
      if (KEY_LABELS[def[1]]) btn.setAttribute('aria-label', KEY_LABELS[def[1]]);
      if (def[1] === 'back' || def[1] === 'clear') btn.classList.add('key--aux');
      if (def[1] === '0') btn.classList.add('key--wide');
      GP.onTap(btn, function () {
        press(def[1]);
      });
      grid.appendChild(btn);
      return btn;
    });

    function onKeyDown(e) {
      if (disabled || e.ctrlKey || e.metaKey || e.altKey) return;
      if (GP.isOverlayOpen()) return;
      let key = null;
      if (/^[0-9]$/.test(e.key)) key = e.key;
      else if (e.key === ',' || e.key === '.') key = ',';
      else if (e.key === '-') key = '−';
      else if (e.key === '/') key = '∕';
      else if (e.key === 'Backspace') key = 'back';
      else if (e.key === 'Escape') key = 'clear';
      else if (e.key === 'Enter') key = 'ok';
      if (key === null) return;
      // Enter on a focused button belongs to that button.
      if (key === 'ok' && e.target.closest && e.target.closest('button')) return;
      e.preventDefault();
      if (key === 'ok') {
        if (!e.repeat) submit();
        return;
      }
      press(key);
    }
    if (opts.keyboard) document.addEventListener('keydown', onKeyDown);

    render();
    container.appendChild(root);

    return {
      getValue: function () {
        return value;
      },
      setValue: function (v) {
        value = String(v);
        render();
      },
      clear: function () {
        value = '';
        field.classList.remove('is-correct', 'is-wrong');
        setStatus(null);
        render();
      },
      setDisabled: function (b) {
        disabled = !!b;
        keys.forEach(function (btn) {
          btn.disabled = disabled;
        });
      },
      // kind: 'ok' | 'bad' | 'warn' | 'info' | null
      setStatus: setStatus,
      submit: submit,
      flash: function (kind) {
        field.classList.remove('is-correct', 'is-wrong');
        void field.offsetWidth; // restart the animation
        field.classList.add(kind === 'ok' ? 'is-correct' : 'is-wrong');
      },
      destroy: function () {
        document.removeEventListener('keydown', onKeyDown);
        root.remove();
      }
    };
  };

  // ---------- timer ----------

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  // opts: { presets: number[] (minutes), initial: number }
  GP.createTimer = function (container, opts) {
    let total = opts.initial * 60;
    let remaining = total;
    let running = false;
    let endAt = 0;
    let interval = null;
    let announced = {};

    const root = GP.h('div', 'timer');
    const clock = GP.h('div', 'timer-clock num');
    const note = GP.h('span', 'timer-note');
    note.setAttribute('aria-hidden', 'true');
    const live = GP.h('div', 'visually-hidden');
    live.setAttribute('aria-live', 'polite');
    const presets = GP.h('div', 'segmented');
    presets.setAttribute('role', 'group');
    presets.setAttribute('aria-label', 'Длительность, минут');
    const playBtn = GP.h('button', 'btn btn--icon');
    const resetBtn = GP.h('button', 'btn btn--icon btn--quiet', GP.icon('rotate-ccw'));
    resetBtn.setAttribute('aria-label', 'Сбросить таймер');
    root.append(clock, note, presets, playBtn, resetBtn, live);

    const presetBtns = opts.presets.map(function (minutes) {
      const btn = GP.h('button', 'segmented-item', minutes + ' мин');
      GP.onTap(btn, function () {
        stop();
        total = minutes * 60;
        remaining = total;
        announced = {};
        render();
      });
      presets.appendChild(btn);
      return { minutes: minutes, btn: btn };
    });

    function announce(text) {
      live.textContent = text;
    }

    function render() {
      clock.textContent = pad2(Math.floor(remaining / 60)) + ':' + pad2(remaining % 60);
      const warning = remaining > 0 && remaining <= 30;
      root.classList.toggle('is-warning', warning);
      root.classList.toggle('is-over', remaining === 0);
      note.textContent = remaining === 0 ? 'Время вышло' : warning ? 'меньше 30 с' : '';
      playBtn.innerHTML = GP.icon(running ? 'pause' : 'play');
      playBtn.setAttribute('aria-label', running ? 'Поставить на паузу' : 'Запустить таймер');
      presetBtns.forEach(function (p) {
        p.btn.setAttribute('aria-pressed', String(p.minutes * 60 === total));
      });
      if (opts.onChange) opts.onChange({ over: remaining === 0 });
    }

    function stop() {
      running = false;
      clearInterval(interval);
      interval = null;
    }

    function tick() {
      const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      if (left === remaining) return;
      remaining = left;
      if (remaining <= 60 && total > 60 && !announced[60]) {
        announced[60] = true;
        announce('Осталась 1 минута');
      }
      if (remaining <= 30 && remaining > 0 && !announced[30]) {
        announced[30] = true;
        announce('Осталось 30 секунд');
      }
      if (remaining === 0) {
        stop();
        announce('Время вышло');
      }
      render();
    }

    function start() {
      if (running) return;
      if (remaining === 0) {
        remaining = total;
        announced = {};
      }
      running = true;
      endAt = Date.now() + remaining * 1000;
      interval = setInterval(tick, 200);
      render();
    }

    function pause() {
      if (!running) return;
      tick();
      stop();
      render();
    }

    function reset() {
      stop();
      remaining = total;
      announced = {};
      render();
    }

    GP.onTap(playBtn, function () {
      if (running) pause();
      else start();
    });
    GP.onTap(resetBtn, reset);

    render();
    container.appendChild(root);

    return {
      start: start,
      pause: pause,
      reset: reset,
      destroy: function () {
        stop();
        root.remove();
      }
    };
  };
})();
