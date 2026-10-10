(function () {
  const STORAGE_KEY = 'true-strength-weight-v1';
  const AI_INSIGHT_ENDPOINT = 'https://true-strength-ai-insight.conno-porter.workers.dev';
  const AI_NAME = 'Pelé';

  const form = document.getElementById('weight-form');
  if (!form) return; // weight markup not present on this page

  const valueInput = document.getElementById('weight-value');
  const dateInput = document.getElementById('weight-date');
  const goalInput = document.getElementById('weight-goal');
  const goalSaveBtn = document.getElementById('weight-goal-save-btn');
  const statsEl = document.getElementById('weight-stats');
  const chartEl = document.getElementById('weight-chart');
  const historyEl = document.getElementById('weight-history');
  const clearBtn = document.getElementById('weight-clear-btn');
  const aiBtn = document.getElementById('weight-ai-insight-btn');
  const aiResult = document.getElementById('weight-ai-insight-result');

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  function formatDate(dateStr) {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  }

  function loadData() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (parsed && typeof parsed === 'object') {
        return { goal: parsed.goal ?? null, entries: Array.isArray(parsed.entries) ? parsed.entries : [] };
      }
    } catch (e) {
      // fall through
    }
    return { goal: null, entries: [] };
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // Private browsing / storage disabled - won't persist.
    }
  }

  let data = loadData();

  function sortedEntries() {
    return [...data.entries].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : 1));
  }

  dateInput.value = todayStr();
  if (data.goal != null) goalInput.value = data.goal;

  // --- Log weight ---

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const weight = parseFloat(valueInput.value);
    if (!weight || weight <= 0) return;
    const date = dateInput.value || todayStr();

    data.entries.push({ id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, date, weight });
    saveData();

    valueInput.value = '';
    dateInput.value = todayStr();

    renderAll();
  });

  // --- Goal ---

  goalSaveBtn.addEventListener('click', () => {
    const goal = parseFloat(goalInput.value);
    data.goal = goal && goal > 0 ? goal : null;
    saveData();
    renderAll();
  });

  // --- Clear all ---

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!confirm('Clear your entire weight history? This cannot be undone.')) return;
      data.entries = [];
      saveData();
      renderAll();
    });
  }

  // --- Stats ---

  function renderStats() {
    const entries = sortedEntries();
    statsEl.innerHTML = '';

    if (entries.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'protein-empty';
      empty.textContent = 'No weight logged yet.';
      statsEl.appendChild(empty);
      return;
    }

    const current = entries[entries.length - 1];

    const row = document.createElement('div');
    row.className = 'protein-total-row';

    const currentCard = document.createElement('div');
    currentCard.className = 'protein-total-card';
    currentCard.innerHTML = `<div class="protein-total-label">Current</div><div class="protein-total-value">${round1(current.weight)}kg</div>`;
    row.appendChild(currentCard);

    const goalCard = document.createElement('div');
    goalCard.className = 'protein-total-card';
    if (data.goal != null) {
      goalCard.innerHTML = `<div class="protein-total-label">Goal</div><div class="protein-total-value">${round1(data.goal)}kg</div>`;
    } else {
      goalCard.innerHTML = `<div class="protein-total-label">Goal</div><div class="protein-total-value weight-no-goal">Not set</div>`;
    }
    row.appendChild(goalCard);

    statsEl.appendChild(row);

    if (data.goal != null) {
      const diff = current.weight - data.goal;
      const p = document.createElement('p');
      p.className = 'weight-goal-diff';
      if (Math.abs(diff) < 0.05) {
        p.textContent = "You're right at your goal.";
      } else if (diff > 0) {
        p.textContent = `${round1(diff)}kg above goal.`;
      } else {
        p.textContent = `${round1(Math.abs(diff))}kg below goal.`;
      }
      statsEl.appendChild(p);
    }

    if (entries.length >= 2) {
      const first = entries[0];
      const change = current.weight - first.weight;
      const p = document.createElement('p');
      p.className = 'weight-goal-diff';
      const dir = change > 0 ? 'up' : change < 0 ? 'down' : 'unchanged';
      p.textContent =
        dir === 'unchanged'
          ? `Unchanged since ${formatDate(first.date)}.`
          : `${round1(Math.abs(change))}kg ${dir} since ${formatDate(first.date)} (${entries.length} entries logged).`;
      statsEl.appendChild(p);
    }
  }

  // --- History ---

  function renderHistory() {
    const entries = [...sortedEntries()].reverse();
    historyEl.innerHTML = '';

    if (entries.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'protein-empty';
      empty.textContent = 'Nothing logged yet.';
      historyEl.appendChild(empty);
      return;
    }

    entries.forEach((entry) => {
      const row = document.createElement('div');
      row.className = 'protein-entry-row';

      const info = document.createElement('div');
      info.className = 'protein-entry-info';
      const name = document.createElement('span');
      name.className = 'protein-entry-name';
      name.textContent = formatDate(entry.date);
      info.appendChild(name);

      const valueEl = document.createElement('span');
      valueEl.className = 'protein-entry-grams';
      valueEl.textContent = `${round1(entry.weight)}kg`;

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'history-delete';
      delBtn.textContent = '×';
      delBtn.setAttribute('aria-label', `Remove entry from ${formatDate(entry.date)}`);
      delBtn.addEventListener('click', () => {
        data.entries = data.entries.filter((e) => e.id !== entry.id);
        saveData();
        renderAll();
      });

      row.appendChild(info);
      row.appendChild(valueEl);
      row.appendChild(delBtn);
      historyEl.appendChild(row);
    });
  }

  // --- Chart ---

  function getVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function renderChart() {
    chartEl.innerHTML = '';
    const entries = sortedEntries();

    if (entries.length < 2) {
      const empty = document.createElement('p');
      empty.className = 'protein-empty';
      empty.textContent = 'Log at least two entries to see a trend chart.';
      chartEl.appendChild(empty);
      return;
    }

    const width = 640;
    const height = 320;
    const margin = { top: 20, right: 20, bottom: 32, left: 48 };
    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.width = '100%';
    svg.style.height = 'auto';
    svg.style.display = 'block';
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Weight trend chart');

    const gridColor = getVar('--gridline');
    const mutedColor = getVar('--text-muted');
    const textColor = getVar('--text-secondary');
    const seriesColor = getVar('--series-1');
    const surfaceColor = getVar('--surface-1');
    const goodColor = getVar('--good') || '#0ca30c';

    const dates = entries.map((e) => new Date(`${e.date}T00:00:00`).getTime());
    const weights = entries.map((e) => e.weight);

    let minY = Math.min(...weights);
    let maxY = Math.max(...weights);
    if (data.goal != null) {
      minY = Math.min(minY, data.goal);
      maxY = Math.max(maxY, data.goal);
    }
    if (minY === maxY) {
      minY -= 1;
      maxY += 1;
    }
    const pad = (maxY - minY) * 0.12;
    minY -= pad;
    maxY += pad;

    const minX = dates[0];
    const maxX = dates[dates.length - 1];
    const xRange = maxX - minX || 1;

    function xPos(t) {
      return margin.left + ((t - minX) / xRange) * plotW;
    }
    function yPos(w) {
      return margin.top + (1 - (w - minY) / (maxY - minY)) * plotH;
    }

    // Horizontal gridlines + y-axis labels (4 steps).
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const y = margin.top + (plotH * i) / steps;
      const value = maxY - ((maxY - minY) * i) / steps;

      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', margin.left);
      line.setAttribute('x2', width - margin.right);
      line.setAttribute('y1', y);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', gridColor);
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);

      const label = document.createElementNS(svgNS, 'text');
      label.setAttribute('x', margin.left - 8);
      label.setAttribute('y', y + 4);
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('font-size', '10');
      label.setAttribute('fill', mutedColor);
      label.textContent = round1(value);
      svg.appendChild(label);
    }

    // X-axis labels: first, middle, last.
    [0, Math.floor((entries.length - 1) / 2), entries.length - 1].forEach((i, idx, arr) => {
      if (idx > 0 && arr[idx] === arr[idx - 1]) return;
      const x = xPos(dates[i]);
      const label = document.createElementNS(svgNS, 'text');
      label.setAttribute('x', x);
      label.setAttribute('y', height - margin.bottom + 18);
      label.setAttribute('text-anchor', idx === 0 ? 'start' : idx === arr.length - 1 ? 'end' : 'middle');
      label.setAttribute('font-size', '10');
      label.setAttribute('fill', mutedColor);
      label.textContent = formatDate(entries[i].date);
      svg.appendChild(label);
    });

    // Goal reference line.
    if (data.goal != null && data.goal >= minY && data.goal <= maxY) {
      const gy = yPos(data.goal);
      const goalLine = document.createElementNS(svgNS, 'line');
      goalLine.setAttribute('x1', margin.left);
      goalLine.setAttribute('x2', width - margin.right);
      goalLine.setAttribute('y1', gy);
      goalLine.setAttribute('y2', gy);
      goalLine.setAttribute('stroke', goodColor);
      goalLine.setAttribute('stroke-width', '1.5');
      goalLine.setAttribute('stroke-dasharray', '5 4');
      svg.appendChild(goalLine);

      const goalLabel = document.createElementNS(svgNS, 'text');
      goalLabel.setAttribute('x', width - margin.right);
      goalLabel.setAttribute('y', gy - 5);
      goalLabel.setAttribute('text-anchor', 'end');
      goalLabel.setAttribute('font-size', '10');
      goalLabel.setAttribute('font-weight', '600');
      goalLabel.setAttribute('fill', goodColor);
      goalLabel.textContent = `Goal ${round1(data.goal)}kg`;
      svg.appendChild(goalLabel);
    }

    // Line path.
    const points = entries.map((e, i) => ({ x: xPos(dates[i]), y: yPos(e.weight), entry: e }));
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', pathD);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', seriesColor);
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-linecap', 'round');
    svg.appendChild(path);

    // Markers.
    points.forEach((p) => {
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('cx', p.x);
      circle.setAttribute('cy', p.y);
      circle.setAttribute('r', 4);
      circle.setAttribute('fill', seriesColor);
      circle.setAttribute('stroke', surfaceColor);
      circle.setAttribute('stroke-width', '2');
      svg.appendChild(circle);
    });

    // Crosshair + tooltip (hidden until hover).
    const crosshair = document.createElementNS(svgNS, 'line');
    crosshair.setAttribute('y1', margin.top);
    crosshair.setAttribute('y2', height - margin.bottom);
    crosshair.setAttribute('stroke', mutedColor);
    crosshair.setAttribute('stroke-width', '1');
    crosshair.setAttribute('opacity', '0');
    svg.appendChild(crosshair);

    const hoverDot = document.createElementNS(svgNS, 'circle');
    hoverDot.setAttribute('r', 5);
    hoverDot.setAttribute('fill', seriesColor);
    hoverDot.setAttribute('stroke', surfaceColor);
    hoverDot.setAttribute('stroke-width', '2');
    hoverDot.setAttribute('opacity', '0');
    svg.appendChild(hoverDot);

    const wrap = document.createElement('div');
    wrap.className = 'weight-chart-container';
    wrap.appendChild(svg);

    const tooltip = document.createElement('div');
    tooltip.className = 'weight-tooltip';
    tooltip.hidden = true;
    wrap.appendChild(tooltip);

    const overlay = document.createElementNS(svgNS, 'rect');
    overlay.setAttribute('x', margin.left);
    overlay.setAttribute('y', margin.top);
    overlay.setAttribute('width', plotW);
    overlay.setAttribute('height', plotH);
    overlay.setAttribute('fill', 'transparent');
    overlay.style.cursor = 'crosshair';
    svg.appendChild(overlay);

    function showTooltip(clientX, svgRect) {
      const relX = ((clientX - svgRect.left) / svgRect.width) * width;
      let nearest = points[0];
      let nearestDist = Infinity;
      points.forEach((p) => {
        const d = Math.abs(p.x - relX);
        if (d < nearestDist) {
          nearestDist = d;
          nearest = p;
        }
      });

      crosshair.setAttribute('x1', nearest.x);
      crosshair.setAttribute('x2', nearest.x);
      crosshair.setAttribute('opacity', '1');
      hoverDot.setAttribute('cx', nearest.x);
      hoverDot.setAttribute('cy', nearest.y);
      hoverDot.setAttribute('opacity', '1');

      tooltip.hidden = false;
      tooltip.innerHTML = '';
      const dateEl = document.createElement('div');
      dateEl.className = 'weight-tooltip-date';
      dateEl.textContent = formatDate(nearest.entry.date);
      const valueEl = document.createElement('div');
      valueEl.className = 'weight-tooltip-value';
      valueEl.textContent = `${round1(nearest.entry.weight)}kg`;
      tooltip.appendChild(dateEl);
      tooltip.appendChild(valueEl);

      const leftPct = (nearest.x / width) * 100;
      tooltip.style.left = `${leftPct}%`;
      tooltip.style.top = `${(nearest.y / height) * 100}%`;
    }

    function hideTooltip() {
      crosshair.setAttribute('opacity', '0');
      hoverDot.setAttribute('opacity', '0');
      tooltip.hidden = true;
    }

    overlay.addEventListener('pointermove', (e) => {
      showTooltip(e.clientX, svg.getBoundingClientRect());
    });
    overlay.addEventListener('pointerleave', hideTooltip);

    chartEl.appendChild(wrap);
  }

  // --- AI Insight ---

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderPlainMessage(el, className, text) {
    el.className = `ai-insight-result ${className}`;
    el.textContent = text;
  }

  function renderAiMessage(el, className, bodyText) {
    el.className = `ai-insight-result ${className}`;
    el.innerHTML =
      `<p class="ai-insight-name">👋 Hey, I'm ${AI_NAME} — your AI training assistant</p>` +
      `<p class="ai-insight-body">${escapeHtml(bodyText)}</p>`;
  }

  function buildWeightSummary() {
    const entries = sortedEntries();
    if (entries.length === 0) return '';
    const lines = entries.slice(-30).map((e) => `${e.date}: ${round1(e.weight)}kg`);
    if (data.goal != null) lines.unshift(`Goal weight: ${round1(data.goal)}kg`);
    return lines.join('\n');
  }

  if (aiBtn && aiResult) {
    aiBtn.addEventListener('click', async () => {
      aiResult.hidden = false;

      if (!AI_INSIGHT_ENDPOINT) {
        renderPlainMessage(
          aiResult,
          'error',
          "AI Insight isn't set up yet - see worker/README.md for the one-time setup."
        );
        return;
      }

      const summary = buildWeightSummary();
      if (!summary) {
        renderPlainMessage(aiResult, 'error', 'Log at least one weight entry first, then try again.');
        return;
      }

      renderAiMessage(aiResult, 'loading', 'Thinking...');
      aiBtn.disabled = true;

      try {
        const res = await fetch(AI_INSIGHT_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ summary, kind: 'weight' }),
        });
        const result = await res.json();
        if (!res.ok || !result.insight) {
          throw new Error(result.error || 'Something went wrong.');
        }
        renderAiMessage(aiResult, '', result.insight);
      } catch (e) {
        renderPlainMessage(aiResult, 'error', `Couldn't get an insight: ${e.message}`);
      } finally {
        aiBtn.disabled = false;
      }
    });
  }

  function renderAll() {
    renderStats();
    renderHistory();
    renderChart();
  }

  renderAll();
})();
