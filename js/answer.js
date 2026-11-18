// Answer parsing, checking and formatting. Pure functions, no DOM.
(function () {
  'use strict';
  const GP = (window.GP = window.GP || {});

  const NUM = '(?:\\d+\\.?\\d*|\\.\\d+)';
  const ANSWER_RE = new RegExp('^(-?)(' + NUM + ')(?:/(' + NUM + '))?$');

  // "12,8", "12.8", "-3", "−3", "1/2", "133 100" -> number; garbage -> null.
  GP.parseAnswer = function (input) {
    if (typeof input !== 'string') return null;
    const s = input
      .replace(/\s/g, '') // all spaces, incl. non-breaking and narrow ones
      .replace(/[−‒–—]/g, '-')
      .replace(/[∕⁄]/g, '/')
      .replace(/,/g, '.');
    const m = ANSWER_RE.exec(s);
    if (!m) return null;
    let value = Number(m[2]);
    if (m[3] !== undefined) {
      const denominator = Number(m[3]);
      if (denominator === 0) return null;
      value = value / denominator;
    }
    if (m[1] === '-') value = -value;
    return value === 0 ? 0 : value; // no "-0"
  };

  // Tolerance matters: 100000 * 1.1 ** 3 === 133100.00000000001
  GP.isCorrect = function (input, expected) {
    const x = GP.parseAnswer(input);
    if (x === null) return false;
    return Math.abs(x - expected) <= 1e-9 * Math.max(1, Math.abs(expected));
  };

  // 133100.00000000001 -> "133 100", 12.8 -> "12,8", -3 -> "−3".
  // Thousands are grouped by a narrow no-break space from 5 digits on (10 000+).
  GP.formatNumber = function (x) {
    if (!isFinite(x)) return String(x);
    const rounded = Number(x.toFixed(6));
    const fixed = Math.abs(rounded).toFixed(6).replace(/\.?0+$/, '');
    const parts = fixed.split('.');
    let integer = parts[0];
    if (integer.length > 4) {
      integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    const text = parts.length > 1 ? integer + ',' + parts[1] : integer;
    return rounded < 0 ? '−' + text : text;
  };

  GP.answerText = function (task) {
    if (task.type === 'choice') return task.options[task.answer];
    return GP.formatNumber(task.answer) + (task.unit ? ' ' + task.unit : '');
  };

  // Solution lines for display. The final "Ответ: …" line is always rebuilt from
  // the answer expression, so a hand-typed key can never disagree with the check.
  GP.solutionSteps = function (task) {
    const lines = (task.solution || []).slice();
    if (lines.length && /^Ответ/.test(lines[lines.length - 1])) lines.pop();
    lines.push('Ответ: ' + GP.answerText(task));
    return lines;
  };
})();
