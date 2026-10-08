(function () {
  const STORAGE_KEY = 'true-strength-protein-v1';
  const form = document.getElementById('protein-form');
  if (!form) return; // protein markup not present on this page

  const nameInput = document.getElementById('protein-food-name');
  const modeBtns = document.querySelectorAll('.mode-btn');
  const directPanel = document.querySelector('[data-mode-panel="direct"]');
  const per100Panel = document.querySelector('[data-mode-panel="per100"]');
  const directInput = document.getElementById('protein-direct-grams');
  const amountInput = document.getElementById('protein-amount');
  const per100Input = document.getElementById('protein-per100');
  const previewEl = document.getElementById('protein-preview');
  const totalEl = document.getElementById('protein-total');
  const entriesEl = document.getElementById('protein-entries');
  const clearBtn = document.getElementById('protein-clear-btn');

  let mode = 'direct';

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function roundG(n) {
    return Math.round(n * 10) / 10;
  }

  function loadLog() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveLog(log) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
    } catch (e) {
      // Private browsing / storage disabled - log just won't persist.
    }
  }

  let log = loadLog();

  function todaysEntries() {
    return log[todayKey()] || [];
  }

  function updatePreview() {
    const amount = parseFloat(amountInput.value);
    const per100 = parseFloat(per100Input.value);
    if (!amount || !per100) {
      previewEl.textContent = '= 0g protein';
      return;
    }
    previewEl.textContent = `= ${roundG((amount * per100) / 100)}g protein`;
  }

  modeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      mode = btn.dataset.mode;
      modeBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      directPanel.hidden = mode !== 'direct';
      per100Panel.hidden = mode !== 'per100';
    });
  });

  amountInput.addEventListener('input', updatePreview);
  per100Input.addEventListener('input', updatePreview);

  function render() {
    const entries = todaysEntries();
    const total = entries.reduce((sum, e) => sum + e.protein, 0);
    totalEl.textContent = `${roundG(total)}g`;

    entriesEl.innerHTML = '';

    if (entries.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'protein-empty';
      empty.textContent = "Nothing logged yet today.";
      entriesEl.appendChild(empty);
      return;
    }

    entries.forEach((entry, i) => {
      const row = document.createElement('div');
      row.className = 'protein-entry-row';

      const info = document.createElement('div');
      info.className = 'protein-entry-info';
      const name = document.createElement('span');
      name.className = 'protein-entry-name';
      name.textContent = entry.name || 'Food';
      info.appendChild(name);
      if (entry.detail) {
        const detail = document.createElement('span');
        detail.className = 'protein-entry-detail';
        detail.textContent = entry.detail;
        info.appendChild(detail);
      }

      const gramsEl = document.createElement('span');
      gramsEl.className = 'protein-entry-grams';
      gramsEl.textContent = `${roundG(entry.protein)}g`;

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'history-delete';
      delBtn.textContent = '×';
      delBtn.setAttribute('aria-label', `Remove ${entry.name || 'entry'}`);
      delBtn.addEventListener('click', () => {
        todaysEntries().splice(i, 1);
        saveLog(log);
        render();
      });

      row.appendChild(info);
      row.appendChild(gramsEl);
      row.appendChild(delBtn);
      entriesEl.appendChild(row);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let protein = 0;
    let detail = '';

    if (mode === 'direct') {
      protein = parseFloat(directInput.value);
      if (!protein || protein <= 0) return;
    } else {
      const amount = parseFloat(amountInput.value);
      const per100 = parseFloat(per100Input.value);
      if (!amount || !per100) return;
      protein = (amount * per100) / 100;
      detail = `${amount}g @ ${per100}g protein/100g`;
    }

    const key = todayKey();
    if (!log[key]) log[key] = [];
    log[key].push({ name: nameInput.value.trim(), protein, detail });
    saveLog(log);

    form.reset();
    previewEl.textContent = '= 0g protein';

    render();
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!confirm("Clear today's protein log? This cannot be undone.")) return;
      delete log[todayKey()];
      saveLog(log);
      render();
    });
  }

  render();
})();
