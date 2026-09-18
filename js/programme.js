(function () {
  const STORAGE_KEY = 'true-strength-programme-state-v1';
  const MAX_HISTORY = 20;
  const daysEl = document.getElementById('programme-days');
  const resetBtn = document.getElementById('reset-programme-btn');

  if (!daysEl) return; // programme markup not present on this page

  function loadState() {
    let raw;
    try {
      raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
    // Migrate the old single-note format (one overwritable box, no dates)
    // into a dated history so nobody's existing entries just vanish.
    Object.values(raw).forEach((entry) => {
      if (entry && !entry.history) {
        entry.history = entry.note ? [{ date: null, value: entry.note }] : [];
        delete entry.note;
      }
    });
    return raw;
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Private browsing / storage disabled - progress just won't persist.
    }
  }

  function getEntry(id) {
    return state[id] || { done: false, history: [] };
  }

  function formatDate(iso) {
    if (!iso) return 'earlier';
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  }

  let state = loadState();

  function render() {
    daysEl.innerHTML = '';
    PROGRAMME.forEach((day) => {
      daysEl.appendChild(renderDay(day));
    });
  }

  function renderDay(day) {
    const card = document.createElement('div');
    card.className = 'card day-card';

    const heading = document.createElement('h3');
    heading.textContent = day.label;
    card.appendChild(heading);

    day.blocks.forEach((block) => {
      card.appendChild(renderBlock(block));
    });

    return card;
  }

  function renderBlock(block) {
    const wrap = document.createElement('div');
    wrap.className = 'block';

    const head = document.createElement('div');
    head.className = 'block-head';
    head.innerHTML = `<span class="block-title">${block.title}</span><span class="block-instructions">${block.instructions}</span>`;
    wrap.appendChild(head);

    block.exercises.forEach((ex) => {
      wrap.appendChild(renderExercise(ex));
    });

    return wrap;
  }

  function renderExercise(ex) {
    const row = document.createElement('div');
    row.className = 'exercise-row';

    const entry = getEntry(ex.id);

    const checkLabel = document.createElement('label');
    checkLabel.className = 'exercise-check';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!entry.done;
    checkbox.addEventListener('change', () => {
      const current = getEntry(ex.id);
      current.done = checkbox.checked;
      state[ex.id] = current;
      saveState(state);
      row.classList.toggle('is-done', checkbox.checked);
    });
    const nameSpan = document.createElement('span');
    nameSpan.className = 'exercise-name';
    nameSpan.textContent = ex.name;
    checkLabel.appendChild(checkbox);
    checkLabel.appendChild(nameSpan);
    row.appendChild(checkLabel);

    const meta = document.createElement('div');
    meta.className = 'exercise-meta';

    if (ex.reps) {
      const repsSpan = document.createElement('span');
      repsSpan.className = 'exercise-target';
      repsSpan.textContent = ex.reps;
      meta.appendChild(repsSpan);
    }

    const logInput = document.createElement('input');
    logInput.type = 'text';
    logInput.className = 'weight-note';
    logInput.placeholder = 'log weight / reps';

    const logBtn = document.createElement('button');
    logBtn.type = 'button';
    logBtn.className = 'log-btn';
    logBtn.textContent = 'Log';
    logBtn.setAttribute('aria-label', `Log a result for ${ex.name}`);

    function addLogEntry() {
      const value = logInput.value.trim();
      if (!value) return;
      const current = getEntry(ex.id);
      current.history = current.history || [];
      current.history.unshift({ date: new Date().toISOString(), value });
      if (current.history.length > MAX_HISTORY) current.history.length = MAX_HISTORY;
      state[ex.id] = current;
      saveState(state);
      logInput.value = '';
      const newRow = renderExercise(ex);
      row.replaceWith(newRow);
    }

    logInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addLogEntry();
      }
    });
    logBtn.addEventListener('click', addLogEntry);

    meta.appendChild(logInput);
    meta.appendChild(logBtn);
    row.appendChild(meta);

    const history = entry.history || [];
    if (history.length > 0) {
      const last = document.createElement('p');
      last.className = 'last-logged';
      last.textContent = `Last: ${history[0].value} · ${formatDate(history[0].date)}`;
      row.appendChild(last);
    }

    if (history.length > 1) {
      const details = document.createElement('details');
      details.className = 'history-details';
      const summary = document.createElement('summary');
      summary.textContent = `History (${history.length})`;
      details.appendChild(summary);

      const list = document.createElement('ul');
      list.className = 'history-list';
      history.forEach((h, i) => {
        const li = document.createElement('li');
        const text = document.createElement('span');
        text.textContent = `${h.value} · ${formatDate(h.date)}`;
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'history-delete';
        del.textContent = '×';
        del.setAttribute('aria-label', 'Delete this log entry');
        del.addEventListener('click', () => {
          const current = getEntry(ex.id);
          current.history.splice(i, 1);
          state[ex.id] = current;
          saveState(state);
          const newRow = renderExercise(ex);
          row.replaceWith(newRow);
        });
        li.appendChild(text);
        li.appendChild(del);
        list.appendChild(li);
      });
      details.appendChild(list);
      row.appendChild(details);
    }

    if (entry.done) row.classList.add('is-done');

    return row;
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (!confirm('Clear all ticked exercises and logged history? This cannot be undone.')) return;
      state = {};
      saveState(state);
      render();
    });
  }

  render();
})();
