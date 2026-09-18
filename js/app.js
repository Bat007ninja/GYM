(function () {
  const form = document.getElementById('strength-form');
  const resultsSection = document.getElementById('results');
  const liftResultsEl = document.getElementById('lift-results');
  const totalBlock = document.getElementById('total-block');
  const totalResultEl = document.getElementById('total-result');
  const radarEl = document.getElementById('radar-chart');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    render();
  });

  function readInputs() {
    const sex = document.getElementById('sex').value;
    const unit = document.getElementById('unit').value;
    const bodyweight = parseFloat(document.getElementById('bodyweight').value);

    const lifts = {};
    document.querySelectorAll('.lift-row').forEach((row) => {
      const key = row.dataset.lift;
      const liftVal = parseFloat(row.querySelector('.lift-input').value);
      const goalVal = parseFloat(row.querySelector('.goal-input').value);
      if (!isNaN(liftVal) && liftVal > 0) {
        lifts[key] = {
          weight: liftVal,
          goal: !isNaN(goalVal) && goalVal > 0 ? goalVal : null,
        };
      }
    });

    return { sex, unit, bodyweight, lifts };
  }

  function render() {
    const { sex, unit, bodyweight, lifts } = readInputs();

    if (!bodyweight || bodyweight <= 0) return;
    const enteredKeys = Object.keys(lifts);
    if (enteredKeys.length === 0) {
      liftResultsEl.innerHTML = '<p class="metric-line">Enter at least one lift to see your results.</p>';
      totalBlock.hidden = true;
      radarEl.innerHTML = '';
      resultsSection.hidden = false;
      return;
    }

    liftResultsEl.innerHTML = '';
    const chartData = [];

    LIFT_KEYS.forEach((key) => {
      if (!lifts[key]) return;
      const { weight, goal } = lifts[key];
      const c = classifyLift(sex, key, bodyweight, weight);
      liftResultsEl.appendChild(renderLiftCard(key, weight, unit, goal, c));
      chartData.push({ key, label: LIFT_LABELS[key], score: c.score, level: c.levelLabel });
    });

    // Powerlifting total, only when all three of squat/bench/deadlift are present.
    const bigThree = ['squat', 'bench', 'deadlift'];
    if (bigThree.every((k) => lifts[k])) {
      const totalWeight = bigThree.reduce((sum, k) => sum + lifts[k].weight, 0);
      const tc = classifyTotal(sex, bodyweight, totalWeight);
      totalBlock.hidden = false;
      totalResultEl.innerHTML = '';
      totalResultEl.appendChild(renderSummaryBlock(totalWeight, unit, tc));
    } else {
      totalBlock.hidden = true;
    }

    renderRadar(chartData);
    resultsSection.hidden = false;
  }

  function renderLiftCard(key, weight, unit, goal, c) {
    const wrap = document.createElement('div');
    wrap.className = 'lift-result';

    const head = document.createElement('div');
    head.className = 'lift-result-head';
    head.innerHTML = `
      <h4>${LIFT_LABELS[key]}</h4>
      <span class="level-tag">${c.levelLabel}</span>
    `;
    wrap.appendChild(head);

    const ratioLine = document.createElement('p');
    ratioLine.className = 'metric-line';
    ratioLine.innerHTML = `<strong>${weight} ${unit}</strong> · ${c.ratio.toFixed(2)}&times; bodyweight`;
    wrap.appendChild(ratioLine);

    wrap.appendChild(renderBandBar(c));

    // Distance to bodyweight milestone.
    const milestone = bodyweightMilestone(c.ratio);
    const bwLine = document.createElement('p');
    bwLine.className = 'metric-line';
    if (milestone.matchesBodyweight) {
      bwLine.innerHTML = `&#10003; Lifting at least your own bodyweight (${c.ratio.toFixed(2)}&times;).`;
    } else {
      const remainingRatio = 1 - c.ratio;
      const remainingWeight = remainingRatio * (weight / c.ratio);
      bwLine.innerHTML = `${(c.ratio * 100).toFixed(0)}% of the way to lifting your own bodyweight (~${remainingWeight.toFixed(1)} ${unit} to go).`;
    }
    wrap.appendChild(bwLine);

    // Distance to next standards level.
    if (c.nextThreshold) {
      const bodyweightVal = weight / c.ratio;
      const weightForNext = c.nextThreshold * bodyweightVal;
      const toGo = Math.max(0, weightForNext - weight);
      const nextLevel = LEVELS[c.levelIndex + 1];
      const lvlLine = document.createElement('p');
      lvlLine.className = 'metric-line';
      lvlLine.innerHTML = `${toGo.toFixed(1)} ${unit} more to reach <strong>${nextLevel}</strong>.`;
      wrap.appendChild(lvlLine);
    }

    // Goal progress.
    if (goal) {
      const gp = goalProgress(weight, goal);
      const goalWrap = document.createElement('div');
      goalWrap.className = 'progress-block';
      goalWrap.innerHTML = `
        <p class="metric-line">Goal: <strong>${goal} ${unit}</strong> —
          ${gp.achieved ? 'achieved &#10003;' : gp.pct.toFixed(0) + '% there, ' + gp.remaining.toFixed(1) + ' ' + unit + ' to go'}
        </p>
        <div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, gp.pct)}%"></div></div>
      `;
      wrap.appendChild(goalWrap);
    }

    return wrap;
  }

  function renderSummaryBlock(totalWeight, unit, c) {
    const wrap = document.createElement('div');
    const head = document.createElement('div');
    head.className = 'lift-result-head';
    head.innerHTML = `<h4>Total: ${totalWeight} ${unit}</h4><span class="level-tag">${c.levelLabel}</span>`;
    wrap.appendChild(head);

    const ratioLine = document.createElement('p');
    ratioLine.className = 'metric-line';
    ratioLine.textContent = `${c.ratio.toFixed(2)}x bodyweight total`;
    wrap.appendChild(ratioLine);

    wrap.appendChild(renderBandBar(c));
    return wrap;
  }

  function renderBandBar(c) {
    const wrap = document.createElement('div');

    const bar = document.createElement('div');
    bar.className = 'band-bar';
    for (let i = 1; i <= 5; i++) {
      const seg = document.createElement('div');
      seg.className = `segment b${i}`;
      bar.appendChild(seg);
    }
    const marker = document.createElement('div');
    marker.className = 'marker';
    const pct = clampPct(c.score > 100 ? 100 : c.score);
    marker.style.left = `calc(${pct}% - 1.5px)`;
    bar.appendChild(marker);
    wrap.appendChild(bar);

    const labels = document.createElement('div');
    labels.className = 'band-labels';
    labels.innerHTML = LEVELS.map((l) => `<span>${l}</span>`).join('');
    wrap.appendChild(labels);

    return wrap;
  }

  function clampPct(n) {
    return Math.max(0, Math.min(100, n));
  }

  function renderRadar(chartData) {
    radarEl.innerHTML = '';
    if (chartData.length < 2) {
      radarEl.innerHTML = '<p class="metric-line">Enter at least two lifts to see a strength profile chart.</p>';
      return;
    }

    const width = 440;
    const height = 340;
    const cx = width / 2;
    const cy = height / 2;
    const radius = 105;
    const rings = 5;
    const n = chartData.length;
    const angleFor = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Strength profile radar chart');

    const gridColor = getVar('--gridline');
    const mutedColor = getVar('--text-muted');
    const seriesColor = getVar('--series-1');
    const textColor = getVar('--text-secondary');

    // Grid rings.
    for (let r = 1; r <= rings; r++) {
      const ringRadius = (radius * r) / rings;
      const points = [];
      for (let i = 0; i < n; i++) {
        const a = angleFor(i);
        points.push(`${cx + ringRadius * Math.cos(a)},${cy + ringRadius * Math.sin(a)}`);
      }
      const poly = document.createElementNS(svgNS, 'polygon');
      poly.setAttribute('points', points.join(' '));
      poly.setAttribute('fill', 'none');
      poly.setAttribute('stroke', gridColor);
      poly.setAttribute('stroke-width', '1');
      svg.appendChild(poly);
    }

    // Spokes + axis labels.
    chartData.forEach((d, i) => {
      const a = angleFor(i);
      const x2 = cx + radius * Math.cos(a);
      const y2 = cy + radius * Math.sin(a);
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', cx);
      line.setAttribute('y1', cy);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('stroke', gridColor);
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);

      const labelR = radius + 30;
      const lx = cx + labelR * Math.cos(a);
      const ly = cy + labelR * Math.sin(a);
      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', lx);
      text.setAttribute('y', ly);
      text.setAttribute('text-anchor', Math.cos(a) > 0.3 ? 'start' : Math.cos(a) < -0.3 ? 'end' : 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('font-size', '11');
      text.setAttribute('fill', textColor);
      text.textContent = d.label;
      svg.appendChild(text);
    });

    // Data polygon (single series: the user's profile).
    const dataPoints = chartData.map((d, i) => {
      const a = angleFor(i);
      const clamped = Math.min(100, d.score);
      const r = (radius * clamped) / 100;
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    });

    const poly = document.createElementNS(svgNS, 'polygon');
    poly.setAttribute('points', dataPoints.map((p) => `${p.x},${p.y}`).join(' '));
    poly.setAttribute('fill', seriesColor);
    poly.setAttribute('fill-opacity', '0.25');
    poly.setAttribute('stroke', seriesColor);
    poly.setAttribute('stroke-width', '2');
    svg.appendChild(poly);

    dataPoints.forEach((p, i) => {
      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('cx', p.x);
      circle.setAttribute('cy', p.y);
      circle.setAttribute('r', 4);
      circle.setAttribute('fill', getVar('--surface-1'));
      circle.setAttribute('stroke', seriesColor);
      circle.setAttribute('stroke-width', '2');
      svg.appendChild(circle);

      const scoreLabel = document.createElementNS(svgNS, 'text');
      scoreLabel.setAttribute('x', p.x);
      scoreLabel.setAttribute('y', p.y - 10);
      scoreLabel.setAttribute('text-anchor', 'middle');
      scoreLabel.setAttribute('font-size', '10');
      scoreLabel.setAttribute('font-weight', '600');
      scoreLabel.setAttribute('fill', textColor);
      scoreLabel.textContent = Math.round(chartData[i].score);
      svg.appendChild(scoreLabel);
    });

    radarEl.appendChild(svg);
  }

  function getVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
})();
