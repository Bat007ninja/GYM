(function () {
  const STORAGE_KEY = 'true-strength-programme-state-v1';
  const daysEl = document.getElementById('programme-days');
  const resetBtn = document.getElementById('reset-programme-btn');

  if (!daysEl) return; // programme markup not present on this page

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Private browsing / storage disabled - progress just won't persist.
    }
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

    const entry = state[ex.id] || { done: false, note: '' };

    const checkLabel = document.createElement('label');
    checkLabel.className = 'exercise-check';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!entry.done;
    checkbox.addEventListener('change', () => {
      const current = state[ex.id] || { done: false, note: '' };
      current.done = checkbox.checked;
      state[ex.id] = current;
      saveState(state);
      row.classList.toggle('is-done', checkbox.checked);
    });
    const nameSpan = document.createElement('span');
    nameSpan.textContent = ex.name;
    checkLabel.appendChild(checkbox);
    checkLabel.appendChild(nameSpan);
    row.appendChild(checkLabel);

    const noteInput = document.createElement('input');
    noteInput.type = 'text';
    noteInput.className = 'weight-note';
    noteInput.placeholder = 'weight / reps';
    noteInput.value = entry.note || '';
    noteInput.addEventListener('input', () => {
      const current = state[ex.id] || { done: false, note: '' };
      current.note = noteInput.value;
      state[ex.id] = current;
      saveState(state);
    });
    row.appendChild(noteInput);

    if (entry.done) row.classList.add('is-done');

    return row;
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (!confirm('Clear all ticked exercises and notes? This cannot be undone.')) return;
      state = {};
      saveState(state);
      render();
    });
  }

  render();
})();
