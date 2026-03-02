// ===== CONFIG =====
// Replace with your deployed Google Apps Script URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxzOO3irpaBVvFkqGmWjcxcEUrWtyI5rb0NcSgjDpvrVmscGRqRhgpZtTJpAMnPFx4/exec';

// Dashboard password (change before deployment)
const DASHBOARD_PASSWORD = 'echo2026';

// Max failed attempts before lockout
const MAX_ATTEMPTS = 3;
const LOCKOUT_MS = 30000; // 30 seconds

// ===== AUTH STATE =====
let failedAttempts = 0;
let lockoutUntil = 0;

// ===== CHART INSTANCES =====
let charts = {};

// ===== CHART.JS DEFAULTS =====
Chart.defaults.color = '#8B949E';
Chart.defaults.borderColor = 'rgba(0,212,255,0.1)';
Chart.defaults.font.family = "'Inter', 'Noto Sans TC', sans-serif";

const BLUE = '#00D4FF';
const PURPLE = '#7C3AED';
const PALETTE = ['#00D4FF','#7C3AED','#10B981','#F59E0B','#EF4444','#EC4899','#3B82F6'];

// ===== PASSWORD CHECK =====
function checkPassword() {
  const now = Date.now();
  if (now < lockoutUntil) {
    const secs = Math.ceil((lockoutUntil - now) / 1000);
    showPwError(`請等待 ${secs} 秒後再試`);
    return;
  }

  const pw = document.getElementById('pwInput').value;
  if (pw === DASHBOARD_PASSWORD) {
    document.getElementById('passwordGate').classList.add('hidden');
    document.getElementById('dashboardContent').classList.remove('hidden');
    // Wait one animation frame so the browser reflows before Chart.js reads dimensions
    requestAnimationFrame(() => loadData());
  } else {
    failedAttempts++;
    if (failedAttempts >= MAX_ATTEMPTS) {
      lockoutUntil = now + LOCKOUT_MS;
      showPwError(`錯誤次數過多，請 30 秒後再試`);
    } else {
      showPwError(`密碼錯誤（第 ${failedAttempts}/${MAX_ATTEMPTS} 次）`);
    }
    document.getElementById('pwInput').value = '';
  }
}

function showPwError(msg) {
  const el = document.getElementById('pwError');
  el.textContent = msg;
  el.classList.add('visible');
}

// ===== DATA LOADING =====
async function loadData() {
  try {
    let rows = [];

    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL_HERE') {
      // Demo data
      rows = getDemoData();
    } else {
      const res = await fetch(`${APPS_SCRIPT_URL}?action=get`, { mode: 'cors' });
      const json = await res.json();
      rows = Array.isArray(json) ? json : [];
    }

    renderStats(rows);
    renderCharts(rows);
    renderTable(rows);
    // Force Chart.js to recalculate canvas dimensions after render
    requestAnimationFrame(() => Object.values(charts).forEach(c => c.resize()));
  } catch (err) {
    console.error('Load error:', err);
    document.getElementById('responsesBody').innerHTML =
      `<tr><td colspan="7" style="text-align:center;color:var(--error);padding:2rem;">載入失敗：${err.message}</td></tr>`;
  }
}

// ===== STATS =====
// ===== COLUMN NAME CONSTANTS =====
const COL = {
  TIMESTAMP: '時間戳記', NAME: '姓名', ROLE: '身分', TRAINING: '過去訓練',
  DATES: '可用時間',
  EFF1: '探頭信心', EFF2: '影像信心', EFF3: '主動信心', EFF4: '整合信心',
  MOTIVATION: '學習動機'
};

function renderStats(rows) {
  document.getElementById('statTotal').textContent = rows.length;
  document.getElementById('statPGY').textContent =
    rows.filter(r => String(r[COL.ROLE] || '').startsWith('PGY')).length;
  document.getElementById('statResident').textContent =
    rows.filter(r => ['R1','R2','R3'].includes(String(r[COL.ROLE] || ''))).length;
  document.getElementById('statFellow').textContent =
    rows.filter(r => r[COL.ROLE] === 'Fellow').length;
}

// ===== CHARTS =====
function renderCharts(rows) {
  renderRoleChart(rows);
  renderDatesChart(rows);
  renderEfficacyChart(rows);
  renderMotivationChart(rows);
}

function destroyChart(id) {
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }
}

// Role Doughnut
function renderRoleChart(rows) {
  destroyChart('role');
  const counts = {};
  rows.forEach(r => { const v = r[COL.ROLE] || '未填'; counts[v] = (counts[v] || 0) + 1; });
  const labels = Object.keys(counts);
  const data = Object.values(counts);

  charts.role = new Chart(document.getElementById('chartRole'), {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: PALETTE, borderWidth: 0 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'right', labels: { boxWidth: 12, padding: 12, font: { size: 11 } } } }
    }
  });
}

// Dates Bar
function renderDatesChart(rows) {
  destroyChart('dates');
  const dateLabels = ['3/11','3/12','3/18','3/19','3/25','3/26'];
  const counts = Object.fromEntries(dateLabels.map(d => [d, 0]));

  rows.forEach(r => {
    const selected = String(r[COL.DATES] || '').split(',').map(s => s.trim());
    selected.forEach(d => { if (counts[d] !== undefined) counts[d]++; });
  });

  charts.dates = new Chart(document.getElementById('chartDates'), {
    type: 'bar',
    data: {
      labels: dateLabels,
      datasets: [{ label: '報名人數', data: Object.values(counts),
        backgroundColor: 'rgba(0,212,255,0.6)', borderColor: BLUE, borderWidth: 1,
        borderRadius: 6 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
        x: { grid: { display: false } }
      }
    }
  });
}

// Efficacy Radar
function renderEfficacyChart(rows) {
  destroyChart('efficacy');
  if (rows.length === 0) return;

  const keys = [COL.EFF1, COL.EFF2, COL.EFF3, COL.EFF4];
  const labels = ['選擇探頭','影像判讀','主動使用','臨床整合'];
  const avgs = keys.map(k => {
    const vals = rows.map(r => parseFloat(r[k])).filter(v => !isNaN(v));
    return vals.length ? (vals.reduce((a,b) => a+b, 0) / vals.length).toFixed(2) : 0;
  });

  charts.efficacy = new Chart(document.getElementById('chartEfficacy'), {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        label: '平均信心分',
        data: avgs,
        borderColor: BLUE,
        backgroundColor: 'rgba(0,212,255,0.1)',
        pointBackgroundColor: BLUE,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: { r: { min: 0, max: 5, ticks: { stepSize: 1 }, pointLabels: { font: { size: 11 } } } },
      plugins: { legend: { display: false } }
    }
  });
}

// Motivation Bar
function renderMotivationChart(rows) {
  destroyChart('motivation');
  const motOptions = ['提升臨床判斷能力','為值班/急救做準備','應付考試或評核','純粹興趣'];
  const counts = Object.fromEntries(motOptions.map(m => [m, 0]));

  rows.forEach(r => {
    const mots = String(r[COL.MOTIVATION] || '').split(',').map(s => s.trim());
    mots.forEach(m => { if (counts[m] !== undefined) counts[m]++; });
  });

  charts.motivation = new Chart(document.getElementById('chartMotivation'), {
    type: 'bar',
    data: {
      labels: motOptions.map(m => m.length > 10 ? m.substring(0,10)+'…' : m),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: PALETTE.map(c => c + '99'),
        borderColor: PALETTE,
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } }, y: { grid: { display: false } } }
    }
  });
}

// ===== TABLE =====
function renderTable(rows) {
  const tbody = document.getElementById('responsesBody');
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:2rem;">尚無資料</td></tr>`;
    return;
  }

  const sorted = [...rows].sort((a, b) => new Date(b[COL.TIMESTAMP]) - new Date(a[COL.TIMESTAMP]));
  tbody.innerHTML = sorted.slice(0, 50).map(r => {
    const effKeys = [COL.EFF1, COL.EFF2, COL.EFF3, COL.EFF4];
    const effVals = effKeys.map(k => parseFloat(r[k])).filter(v => !isNaN(v));
    const effAvg = effVals.length ? (effVals.reduce((a,b) => a+b, 0) / effVals.length).toFixed(1) : '—';
    const ts = r[COL.TIMESTAMP] ? new Date(r[COL.TIMESTAMP]).toLocaleString('zh-TW', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }) : '—';

    return `<tr>
      <td>${ts}</td>
      <td>${r[COL.NAME] || '—'}</td>
      <td>${r[COL.ROLE] || '—'}</td>
      <td>${r[COL.TRAINING] || '—'}</td>
      <td>${r[COL.DATES] || '—'}</td>
      <td>${effAvg}</td>
      <td>${(r[COL.MOTIVATION] || '—').substring(0, 30)}</td>
    </tr>`;
  }).join('');
}

// ===== DEMO DATA =====
function getDemoData() {
  const roles = ['PGY1','PGY2（內科組）','R1','R2','R3','Fellow'];
  const trainings = ['無','有，1 次','有，2–5 次'];
  const dateOptions = ['3/11','3/12','3/18','3/19','3/25','3/26'];
  const motivations = ['提升臨床判斷能力','為值班/急救做準備','純粹興趣','應付考試或評核'];

  return Array.from({ length: 18 }, (_, i) => {
    const selectedDates = dateOptions.filter(() => Math.random() > 0.5).join(', ') || '3/11';
    const selectedMot = motivations.filter(() => Math.random() > 0.5).join(', ') || motivations[0];
    return {
      [COL.TIMESTAMP]: new Date(Date.now() - i * 3600000).toISOString(),
      [COL.NAME]: `醫師${i + 1}`,
      [COL.ROLE]: roles[i % roles.length],
      [COL.TRAINING]: trainings[i % trainings.length],
      [COL.DATES]: selectedDates,
      [COL.EFF1]: (Math.random() * 3 + 1).toFixed(0),
      [COL.EFF2]: (Math.random() * 3 + 1).toFixed(0),
      [COL.EFF3]: (Math.random() * 3 + 1).toFixed(0),
      [COL.EFF4]: (Math.random() * 3 + 1).toFixed(0),
      [COL.MOTIVATION]: selectedMot
    };
  });
}
