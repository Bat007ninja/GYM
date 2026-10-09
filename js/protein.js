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
  const historyEl = document.getElementById('protein-history');
  const historyCard = document.getElementById('protein-history-card');

  let mode = 'direct';

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function roundG(n) {
    return Math.round(n * 10) / 10;
  }

  function formatDateKey(key) {
    const d = new Date(`${key}T00:00:00`);
    return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
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

  // Builds one food-entry row, used for both today's list and history days.
  function buildEntryRow(entry, dateKey, index) {
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
      log[dateKey].splice(index, 1);
      if (log[dateKey].length === 0) delete log[dateKey];
      saveLog(log);
      renderAll();
    });

    row.appendChild(info);
    row.appendChild(gramsEl);
    row.appendChild(delBtn);
    return row;
  }

  function renderToday() {
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
      entriesEl.appendChild(buildEntryRow(entry, todayKey(), i));
    });
  }

  function renderHistory() {
    if (!historyEl || !historyCard) return;

    const dates = Object.keys(log)
      .filter((key) => key !== todayKey() && log[key] && log[key].length > 0)
      .sort()
      .reverse();

    historyEl.innerHTML = '';

    if (dates.length === 0) {
      historyCard.hidden = true;
      return;
    }
    historyCard.hidden = false;

    dates.forEach((dateKey) => {
      const entries = log[dateKey];
      const total = entries.reduce((sum, e) => sum + e.protein, 0);

      const details = document.createElement('details');
      details.className = 'protein-history-day';

      const summary = document.createElement('summary');
      summary.innerHTML =
        `<span>${formatDateKey(dateKey)}</span>` +
        `<span class="protein-history-total">${roundG(total)}g</span>`;
      details.appendChild(summary);

      const list = document.createElement('div');
      list.className = 'protein-entries';
      entries.forEach((entry, i) => {
        list.appendChild(buildEntryRow(entry, dateKey, i));
      });
      details.appendChild(list);

      historyEl.appendChild(details);
    });
  }

  function renderAll() {
    renderToday();
    renderHistory();
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

    renderAll();
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!confirm("Clear today's protein log? This cannot be undone.")) return;
      delete log[todayKey()];
      saveLog(log);
      renderAll();
    });
  }

  renderAll();
})();
