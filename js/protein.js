(function () {
  const STORAGE_KEY = 'true-strength-protein-v1';
  const MEALS_KEY = 'true-strength-saved-meals-v1';
  const form = document.getElementById('protein-form');
  if (!form) return; // protein markup not present on this page

  const nameInput = document.getElementById('protein-food-name');
  const modeBtns = document.querySelectorAll('.protein-form-card .mode-btn');
  const directPanel = document.querySelector('.protein-form-card [data-mode-panel="direct"]');
  const per100Panel = document.querySelector('.protein-form-card [data-mode-panel="per100"]');
  const directProteinInput = document.getElementById('protein-direct-grams');
  const directCalsInput = document.getElementById('protein-direct-cals');
  const amountInput = document.getElementById('protein-amount');
  const per100Input = document.getElementById('protein-per100');
  const calsPer100Input = document.getElementById('protein-cals-per100');
  const previewEl = document.getElementById('protein-preview');
  const totalEl = document.getElementById('protein-total');
  const calsTotalEl = document.getElementById('cals-total');
  const entriesEl = document.getElementById('protein-entries');
  const clearBtn = document.getElementById('protein-clear-btn');
  const historyEl = document.getElementById('protein-history');
  const historyCard = document.getElementById('protein-history-card');

  const savedMealSelect = document.getElementById('saved-meal-select');
  const savedMealLogBtn = document.getElementById('saved-meal-log-btn');
  const savedMealDeleteBtn = document.getElementById('saved-meal-delete-btn');

  const mealNameInput = document.getElementById('meal-name');
  const ingModeBtns = document.querySelectorAll('.ing-mode-btn');
  const ingDirectPanel = document.querySelector('[data-ing-panel="direct"]');
  const ingPer100Panel = document.querySelector('[data-ing-panel="per100"]');
  const ingNameInput = document.getElementById('meal-ing-name');
  const ingProteinInput = document.getElementById('meal-ing-protein');
  const ingCalsInput = document.getElementById('meal-ing-cals');
  const ingAmountInput = document.getElementById('meal-ing-amount');
  const ingPer100Input = document.getElementById('meal-ing-per100');
  const ingCalsPer100Input = document.getElementById('meal-ing-cals-per100');
  const ingPreviewEl = document.getElementById('meal-ing-preview');
  const ingAddBtn = document.getElementById('meal-ing-add-btn');
  const mealIngredientsEl = document.getElementById('meal-ingredients');
  const mealTotalProteinEl = document.getElementById('meal-total-protein');
  const mealTotalCalsEl = document.getElementById('meal-total-cals');
  const mealSaveBtn = document.getElementById('meal-save-btn');

  let mode = 'direct';
  let ingMode = 'direct';
  let mealIngredients = []; // in-memory, not persisted until "Save meal"

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  function roundCals(n) {
    return Math.round(n);
  }

  function formatDateKey(key) {
    const d = new Date(`${key}T00:00:00`);
    return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  }

  function loadJSON(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // Private browsing / storage disabled - won't persist.
    }
  }

  let log = loadJSON(STORAGE_KEY, {});
  let savedMeals = loadJSON(MEALS_KEY, []);

  function saveLog() {
    saveJSON(STORAGE_KEY, log);
  }

  function saveMeals() {
    saveJSON(MEALS_KEY, savedMeals);
  }

  function todaysEntries() {
    return log[todayKey()] || [];
  }

  function macroText(protein, calories) {
    const parts = [];
    if (protein) parts.push(`${round1(protein)}g protein`);
    if (calories) parts.push(`${roundCals(calories)} kcal`);
    return parts.join(' · ') || '0g protein';
  }

  // --- Add-food form (direct / per-100g toggle) ---

  function updatePreview() {
    const amount = parseFloat(amountInput.value);
    const per100 = parseFloat(per100Input.value) || 0;
    const calsPer100 = parseFloat(calsPer100Input.value) || 0;
    if (!amount || (!per100 && !calsPer100)) {
      previewEl.textContent = '= 0g protein · 0 kcal';
      return;
    }
    const protein = (amount * per100) / 100;
    const cals = (amount * calsPer100) / 100;
    previewEl.textContent = `= ${round1(protein)}g protein · ${roundCals(cals)} kcal`;
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
  calsPer100Input.addEventListener('input', updatePreview);

  // --- Shared entry-row builder (today's list, history days, meal builder) ---

  function buildEntryRow(entry, onDelete) {
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
    gramsEl.textContent = macroText(entry.protein, entry.calories);

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'history-delete';
    delBtn.textContent = '×';
    delBtn.setAttribute('aria-label', `Remove ${entry.name || 'entry'}`);
    delBtn.addEventListener('click', onDelete);

    row.appendChild(info);
    row.appendChild(gramsEl);
    row.appendChild(delBtn);
    return row;
  }

  function renderToday() {
    const entries = todaysEntries();
    const totalProtein = entries.reduce((sum, e) => sum + (e.protein || 0), 0);
    const totalCals = entries.reduce((sum, e) => sum + (e.calories || 0), 0);
    totalEl.textContent = `${round1(totalProtein)}g`;
    calsTotalEl.textContent = `${roundCals(totalCals)} kcal`;

    entriesEl.innerHTML = '';

    if (entries.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'protein-empty';
      empty.textContent = 'Nothing logged yet today.';
      entriesEl.appendChild(empty);
      return;
    }

    entries.forEach((entry, i) => {
      entriesEl.appendChild(
        buildEntryRow(entry, () => {
          todaysEntries().splice(i, 1);
          saveLog();
          renderAll();
        })
      );
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
      const totalProtein = entries.reduce((sum, e) => sum + (e.protein || 0), 0);
      const totalCals = entries.reduce((sum, e) => sum + (e.calories || 0), 0);

      const details = document.createElement('details');
      details.className = 'protein-history-day';

      const summary = document.createElement('summary');
      summary.innerHTML =
        `<span>${formatDateKey(dateKey)}</span>` +
        `<span class="protein-history-total">${round1(totalProtein)}g · ${roundCals(totalCals)} kcal</span>`;
      details.appendChild(summary);

      const list = document.createElement('div');
      list.className = 'protein-entries';
      entries.forEach((entry, i) => {
        list.appendChild(
          buildEntryRow(entry, () => {
            log[dateKey].splice(i, 1);
            if (log[dateKey].length === 0) delete log[dateKey];
            saveLog();
            renderAll();
          })
        );
      });
      details.appendChild(list);

      historyEl.appendChild(details);
    });
  }

  // --- Saved meals dropdown ---

  function renderSavedMeals() {
    savedMealSelect.innerHTML = '';
    if (savedMeals.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'No saved meals yet';
      savedMealSelect.appendChild(opt);
      savedMealLogBtn.disabled = true;
      savedMealDeleteBtn.disabled = true;
      return;
    }

    savedMealLogBtn.disabled = false;
    savedMealDeleteBtn.disabled = false;
    savedMeals.forEach((meal) => {
      const opt = document.createElement('option');
      opt.value = meal.id;
      opt.textContent = `${meal.name} (${round1(meal.protein)}g · ${roundCals(meal.calories)} kcal)`;
      savedMealSelect.appendChild(opt);
    });
  }

  savedMealLogBtn.addEventListener('click', () => {
    const meal = savedMeals.find((m) => m.id === savedMealSelect.value);
    if (!meal) return;
    const key = todayKey();
    if (!log[key]) log[key] = [];
    log[key].push({ name: meal.name, protein: meal.protein, calories: meal.calories, detail: 'Saved meal' });
    saveLog();
    renderAll();
  });

  savedMealDeleteBtn.addEventListener('click', () => {
    const meal = savedMeals.find((m) => m.id === savedMealSelect.value);
    if (!meal) return;
    if (!confirm(`Delete the saved meal "${meal.name}"? This cannot be undone.`)) return;
    savedMeals = savedMeals.filter((m) => m.id !== meal.id);
    saveMeals();
    renderSavedMeals();
  });

  function renderAll() {
    renderToday();
    renderHistory();
    renderSavedMeals();
  }

  // --- Add-food submit ---

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let protein = 0;
    let calories = 0;
    let detail = '';

    if (mode === 'direct') {
      protein = parseFloat(directProteinInput.value) || 0;
      calories = parseFloat(directCalsInput.value) || 0;
      if (!protein && !calories) return;
    } else {
      const amount = parseFloat(amountInput.value);
      const per100 = parseFloat(per100Input.value) || 0;
      const calsPer100 = parseFloat(calsPer100Input.value) || 0;
      if (!amount || (!per100 && !calsPer100)) return;
      protein = (amount * per100) / 100;
      calories = (amount * calsPer100) / 100;
      detail = `${amount}g @ ${per100}g protein/100g, ${calsPer100}kcal/100g`;
    }

    const key = todayKey();
    if (!log[key]) log[key] = [];
    log[key].push({ name: nameInput.value.trim(), protein, calories, detail });
    saveLog();

    form.reset();
    previewEl.textContent = '= 0g protein · 0 kcal';

    renderAll();
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!confirm("Clear today's protein log? This cannot be undone.")) return;
      delete log[todayKey()];
      saveLog();
      renderAll();
    });
  }

  // --- Meal builder ---

  function updateIngPreview() {
    const amount = parseFloat(ingAmountInput.value);
    const per100 = parseFloat(ingPer100Input.value) || 0;
    const calsPer100 = parseFloat(ingCalsPer100Input.value) || 0;
    if (!amount || (!per100 && !calsPer100)) {
      ingPreviewEl.textContent = '= 0g protein · 0 kcal';
      return;
    }
    const protein = (amount * per100) / 100;
    const cals = (amount * calsPer100) / 100;
    ingPreviewEl.textContent = `= ${round1(protein)}g protein · ${roundCals(cals)} kcal`;
  }

  ingModeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      ingMode = btn.dataset.mode;
      ingModeBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      ingDirectPanel.hidden = ingMode !== 'direct';
      ingPer100Panel.hidden = ingMode !== 'per100';
    });
  });

  ingAmountInput.addEventListener('input', updateIngPreview);
  ingPer100Input.addEventListener('input', updateIngPreview);
  ingCalsPer100Input.addEventListener('input', updateIngPreview);

  function renderMealIngredients() {
    mealIngredientsEl.innerHTML = '';

    const totalProtein = mealIngredients.reduce((sum, e) => sum + (e.protein || 0), 0);
    const totalCals = mealIngredients.reduce((sum, e) => sum + (e.calories || 0), 0);
    mealTotalProteinEl.textContent = `${round1(totalProtein)}g`;
    mealTotalCalsEl.textContent = `${roundCals(totalCals)} kcal`;

    if (mealIngredients.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'protein-empty';
      empty.textContent = 'No ingredients added yet.';
      mealIngredientsEl.appendChild(empty);
      return;
    }

    mealIngredients.forEach((ing, i) => {
      mealIngredientsEl.appendChild(
        buildEntryRow(ing, () => {
          mealIngredients.splice(i, 1);
          renderMealIngredients();
        })
      );
    });
  }

  ingAddBtn.addEventListener('click', () => {
    let protein = 0;
    let calories = 0;
    let detail = '';

    if (ingMode === 'direct') {
      protein = parseFloat(ingProteinInput.value) || 0;
      calories = parseFloat(ingCalsInput.value) || 0;
      if (!protein && !calories) return;
    } else {
      const amount = parseFloat(ingAmountInput.value);
      const per100 = parseFloat(ingPer100Input.value) || 0;
      const calsPer100 = parseFloat(ingCalsPer100Input.value) || 0;
      if (!amount || (!per100 && !calsPer100)) return;
      protein = (amount * per100) / 100;
      calories = (amount * calsPer100) / 100;
      detail = `${amount}g @ ${per100}g protein/100g, ${calsPer100}kcal/100g`;
    }

    mealIngredients.push({ name: ingNameInput.value.trim(), protein, calories, detail });

    ingNameInput.value = '';
    ingProteinInput.value = '';
    ingCalsInput.value = '';
    ingAmountInput.value = '';
    ingPer100Input.value = '';
    ingCalsPer100Input.value = '';
    ingPreviewEl.textContent = '= 0g protein · 0 kcal';

    renderMealIngredients();
  });

  mealSaveBtn.addEventListener('click', () => {
    const name = mealNameInput.value.trim();
    if (!name) {
      alert('Give the meal a name first (e.g. "Fajitas").');
      return;
    }
    if (mealIngredients.length === 0) {
      alert('Add at least one ingredient first.');
      return;
    }

    const totalProtein = mealIngredients.reduce((sum, e) => sum + (e.protein || 0), 0);
    const totalCals = mealIngredients.reduce((sum, e) => sum + (e.calories || 0), 0);

    const meal = {
      id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      protein: totalProtein,
      calories: totalCals,
    };
    savedMeals.push(meal);
    saveMeals();

    const key = todayKey();
    if (!log[key]) log[key] = [];
    log[key].push({
      name,
      protein: totalProtein,
      calories: totalCals,
      detail: `${mealIngredients.length} ingredient${mealIngredients.length === 1 ? '' : 's'}`,
    });
    saveLog();

    mealNameInput.value = '';
    mealIngredients = [];
    renderMealIngredients();

    renderAll();
  });

  renderMealIngredients();
  renderAll();
})();
