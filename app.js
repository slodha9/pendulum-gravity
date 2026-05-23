/* ============================================================
   PETROVA LAB // Pendulum Gravity Experiment — logic
   g = 4 * pi^2 * L / T^2   where T = (total time) / N swings
   ============================================================ */

const FOUR_PI_SQ = 4 * Math.PI * Math.PI;
const EARTH_G = 9.80665;

/* ---------- State ---------- */
const state = {
  trials: 3,
  swings: 10,
  useString2: false,
  // times[stringKey][trialIndex] = total seconds for N swings
  times: { s1: [], s2: [] },
};

/* ---------- Screen navigation ---------- */
function goTo(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- Config controls ---------- */
function toggleString2() {
  state.useString2 = document.getElementById('toggle-str2').checked;
  document.getElementById('len2-field').style.display = state.useString2 ? '' : 'none';
  renderTables();
}

function adjustTrials(delta) {
  const input = document.getElementById('trials');
  let v = parseInt(input.value, 10) || 1;
  v = Math.max(1, Math.min(20, v + delta));
  input.value = v;
  renderTables();
}

/* ---------- Build the data-entry tables ---------- */
function renderTables() {
  state.trials = Math.max(1, Math.min(20, parseInt(document.getElementById('trials').value, 10) || 1));
  state.swings = Math.max(1, parseInt(document.getElementById('swings').value, 10) || 1);

  const mount = document.getElementById('tables-mount');
  mount.innerHTML = '';

  const strings = [{ key: 's1', name: 'STRING 1', lenId: 'len1' }];
  if (state.useString2) strings.push({ key: 's2', name: 'STRING 2', lenId: 'len2' });

  strings.forEach(str => {
    const L = parseFloat(document.getElementById(str.lenId).value) || 0;
    const block = document.createElement('div');
    block.className = 'data-block';

    let rows = '';
    for (let i = 0; i < state.trials; i++) {
      const saved = state.times[str.key][i] ?? '';
      const g = computeG(L, saved, state.swings);
      rows += `
        <tr>
          <td class="row-tag">T${String(i + 1).padStart(2, '0')}</td>
          <td>
            <input type="number" step="0.01" min="0" inputmode="decimal"
              data-string="${str.key}" data-trial="${i}"
              value="${saved}" placeholder="0.00"
              oninput="onTimeInput(this)" />
          </td>
          <td class="g-cell ${g === null ? 'empty' : ''}" id="g-${str.key}-${i}">
            ${g === null ? '— —' : g.toFixed(3)}
          </td>
        </tr>`;
    }

    block.innerHTML = `
      <div class="data-block-title">
        ${str.name}
        <span class="tag">L = ${L ? L.toFixed(3) : '?'} m</span>
        <span class="tag">N = ${state.swings} swings</span>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:60px;">TRIAL</th>
            <th>TOTAL TIME FOR ${state.swings} SWINGS (s)</th>
            <th style="width:140px;">g (m/s²)</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
    mount.appendChild(block);
  });
}

/* ---------- g calculation ---------- */
function computeG(L, totalTime, N) {
  const t = parseFloat(totalTime);
  if (!L || !t || t <= 0) return null;
  const T = t / N;                 // period of ONE swing
  return (FOUR_PI_SQ * L) / (T * T);
}

function onTimeInput(input) {
  const key = input.dataset.string;
  const trial = parseInt(input.dataset.trial, 10);
  const val = input.value === '' ? undefined : parseFloat(input.value);
  state.times[key][trial] = val;

  const lenId = key === 's1' ? 'len1' : 'len2';
  const L = parseFloat(document.getElementById(lenId).value) || 0;
  const g = computeG(L, val, state.swings);
  const cell = document.getElementById(`g-${key}-${trial}`);
  if (cell) {
    if (g === null) { cell.textContent = '— —'; cell.classList.add('empty'); }
    else { cell.textContent = g.toFixed(3); cell.classList.remove('empty'); }
  }
}

/* ============================================================
   STOPWATCH
   ============================================================ */
let swStart = 0, swElapsed = 0, swInterval = null, swRunning = false;

function fmt(ms) {
  const totalCs = Math.floor(ms / 10);
  const cs = totalCs % 100;
  const totalS = Math.floor(totalCs / 100);
  const s = totalS % 60;
  const m = Math.floor(totalS / 60);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;
}

function tickSW() {
  const now = performance.now();
  document.getElementById('sw-display').textContent = fmt(swElapsed + (now - swStart));
}

function toggleStopwatch() {
  const display = document.getElementById('sw-display');
  const btn = document.getElementById('sw-toggle');
  const lap = document.getElementById('sw-lap');
  if (!swRunning) {
    swRunning = true;
    swStart = performance.now();
    swInterval = setInterval(tickSW, 16);
    btn.textContent = 'STOP';
    display.classList.add('running');
    lap.disabled = false;
  } else {
    swRunning = false;
    swElapsed += performance.now() - swStart;
    clearInterval(swInterval);
    btn.textContent = 'RESUME';
    display.classList.remove('running');
  }
}

function resetStopwatch() {
  swRunning = false;
  clearInterval(swInterval);
  swElapsed = 0;
  document.getElementById('sw-display').textContent = '00:00.00';
  document.getElementById('sw-toggle').textContent = 'START';
  document.getElementById('sw-display').classList.remove('running');
  document.getElementById('sw-lap').disabled = true;
}

/* Drop the current stopwatch value into the first empty time field */
function logLap() {
  const now = swRunning ? swElapsed + (performance.now() - swStart) : swElapsed;
  const seconds = (now / 1000);
  const inputs = document.querySelectorAll('.data-table input[data-trial]');
  let placed = false;
  for (const inp of inputs) {
    if (inp.value === '' || inp.value === undefined) {
      inp.value = seconds.toFixed(2);
      onTimeInput(inp);
      placed = true;
      inp.classList.add('flash');
      break;
    }
  }
  const hint = document.getElementById('sw-hint');
  if (placed) {
    hint.textContent = `Logged ${seconds.toFixed(2)} s. Reset the clock and time your next trial.`;
    resetStopwatch();
  } else {
    hint.textContent = 'All time fields are full — add more trials or edit a value manually.';
  }
}

/* ============================================================
   RESULTS
   ============================================================ */
function goToResults() {
  buildResults();
  goTo('screen-results');
}

function averageG(key, L) {
  const gs = [];
  for (let i = 0; i < state.trials; i++) {
    const g = computeG(L, state.times[key][i], state.swings);
    if (g !== null) gs.push(g);
  }
  if (!gs.length) return null;
  const avg = gs.reduce((a, b) => a + b, 0) / gs.length;
  return { avg, count: gs.length, all: gs };
}

function buildResults() {
  const mount = document.getElementById('results-mount');
  mount.innerHTML = '';

  const strings = [{ key: 's1', name: 'STRING 1', lenId: 'len1' }];
  if (state.useString2) strings.push({ key: 's2', name: 'STRING 2', lenId: 'len2' });

  const compareData = [];
  let anyData = false;

  strings.forEach(str => {
    const L = parseFloat(document.getElementById(str.lenId).value) || 0;
    const res = averageG(str.key, L);

    const card = document.createElement('div');
    card.className = 'result-card headline';

    if (!res) {
      card.classList.remove('headline');
      card.innerHTML = `
        <div class="result-card-head">
          <span class="result-string-name">${str.name}</span>
          <span class="result-len">L = ${L ? L.toFixed(3) : '?'} m</span>
        </div>
        <p class="result-detail">No valid time entries recorded for this string. Go back and add at least one timing.</p>`;
      mount.appendChild(card);
      return;
    }

    anyData = true;
    const diffPct = ((res.avg - EARTH_G) / EARTH_G) * 100;
    const diffStr = (diffPct >= 0 ? '+' : '') + diffPct.toFixed(1) + '%';

    // Per-trial working table
    let workRows = '';
    for (let i = 0; i < state.trials; i++) {
      const t = state.times[str.key][i];
      const g = computeG(L, t, state.swings);
      if (g === null) continue;
      const T = parseFloat(t) / state.swings;
      workRows += `
        <tr>
          <td>T${String(i + 1).padStart(2,'0')}</td>
          <td>${parseFloat(t).toFixed(2)} s</td>
          <td>${T.toFixed(4)} s</td>
          <td class="g-val">${g.toFixed(3)}</td>
        </tr>`;
    }

    card.innerHTML = `
      <div class="result-card-head">
        <span class="result-string-name">${str.name}</span>
        <span class="result-len">L = ${L.toFixed(3)} m &nbsp;•&nbsp; N = ${state.swings} &nbsp;•&nbsp; ${res.count} valid trial${res.count>1?'s':''}</span>
      </div>
      <div class="big-g">${res.avg.toFixed(3)}<span class="unit">m/s²</span></div>
      <div class="result-detail">
        Difference from Earth standard (9.807 m/s²): <span class="v">${diffStr}</span>
      </div>
      <table class="work-table">
        <thead>
          <tr><th>TRIAL</th><th>TOTAL TIME</th><th>PERIOD T = total/N</th><th>g = 4π²L / T²</th></tr>
        </thead>
        <tbody>${workRows}</tbody>
      </table>`;
    mount.appendChild(card);

    compareData.push({ name: str.name, L, g: res.avg });
  });

  buildEarthCompare(compareData, anyData);
}

function buildEarthCompare(data, anyData) {
  const wrap = document.getElementById('earth-compare');
  if (!anyData || !data.length) { wrap.innerHTML = ''; return; }

  // Scale bars so Earth's g sits at ~75% of the track
  const maxScale = EARTH_G / 0.75;
  let rows = '';
  data.forEach(d => {
    const pct = Math.min(100, (d.g / maxScale) * 100);
    const earthPct = (EARTH_G / maxScale) * 100;
    rows += `
      <div class="compare-row">
        <div class="compare-label">
          <span>${d.name} — measured g = ${d.g.toFixed(3)} m/s²</span>
          <span class="pct">${((d.g / EARTH_G) * 100).toFixed(1)}% of Earth</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width:0%" data-target="${pct}"></div>
          <div class="bar-earth-marker" style="left:${earthPct}%"></div>
          <div class="bar-earth-label" style="left:${earthPct}%">EARTH 9.807</div>
        </div>
      </div>`;
  });

  let verdict = '';
  if (data.length >= 2) {
    verdict = `<p class="result-detail" style="margin-top:1.2rem;">
      Notice how changing the <span class="v">length</span> barely shifts your estimate of g —
      that's the experiment working. The period depends on length, but g itself is a property of
      the planet, not your string. Any spread between strings is measurement error, not physics.</p>`;
  } else {
    verdict = `<p class="result-detail" style="margin-top:1.2rem;">
      From a string and a stopwatch, you've estimated the gravity of an entire planet.
      "The math doesn't lie." — Add a second string back in Phase 02 to prove length doesn't change g.</p>`;
  }

  wrap.innerHTML = `
    <p class="mono small label-line">// COMPARISON TO EARTH</p>
    <div class="compare-bar-wrap">${rows}${verdict}</div>`;

  // Animate bars after paint
  requestAnimationFrame(() => {
    setTimeout(() => {
      wrap.querySelectorAll('.bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.target + '%';
      });
    }, 80);
  });
}

/* ---------- Starfield extra depth ---------- */
function seedStars() {
  // CSS handles the base field; nothing required here but kept for future use.
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  renderTables();
  seedStars();
});
