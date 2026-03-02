# Chest Echo Survey Website Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a static survey website for chest echo course registration + pre-course self-assessment, with Google Sheets backend and admin dashboard.

**Architecture:** Two-page vanilla HTML site (survey + dashboard) deployed on GitHub Pages. Form submissions POST to a Google Apps Script Web App which writes to Google Sheets. Dashboard fetches data via GET from the same Apps Script.

**Tech Stack:** HTML5, CSS3 (custom dark tech theme), Vanilla JS (ES6+), Chart.js (CDN), Google Apps Script, Google Sheets

---

### Task 1: Project Scaffold + Shared CSS

**Files:**
- Create: `style.css`
- Create: `index.html` (skeleton)
- Create: `dashboard.html` (skeleton)

**Step 1: Create `style.css` with dark tech theme**

```css
/* ===== CSS VARIABLES ===== */
:root {
  --bg-primary: #0D1117;
  --bg-secondary: #161B22;
  --bg-card: rgba(22, 27, 34, 0.85);
  --accent-blue: #00D4FF;
  --accent-purple: #7C3AED;
  --accent-glow: rgba(0, 212, 255, 0.25);
  --text-primary: #E2E8F0;
  --text-muted: #8B949E;
  --border-color: rgba(0, 212, 255, 0.2);
  --success: #10B981;
  --error: #EF4444;
  --radius: 12px;
  --transition: 0.2s ease;
}

/* ===== RESET ===== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', 'Noto Sans TC', sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  line-height: 1.6;
}

/* ===== BACKGROUND GRID ===== */
body::before {
  content: '';
  position: fixed; inset: 0;
  background-image:
    linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 0;
}

/* ===== LAYOUT ===== */
.container {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  position: relative;
  z-index: 1;
}

/* ===== HEADER ===== */
.site-header {
  text-align: center;
  padding: 3rem 0 2rem;
}
.site-header .logo-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  display: block;
}
.site-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--accent-blue);
  text-shadow: 0 0 20px var(--accent-glow);
  letter-spacing: 0.02em;
}
.site-header p {
  color: var(--text-muted);
  margin-top: 0.5rem;
  font-size: 0.95rem;
}

/* ===== PROGRESS BAR ===== */
.progress-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin: 1.5rem 0 2rem;
}
.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  position: relative;
}
.progress-step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 14px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--border-color);
  transition: background var(--transition);
}
.progress-step.completed:not(:last-child)::after { background: var(--accent-blue); }
.step-dot {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  transition: all var(--transition);
  position: relative;
  z-index: 1;
}
.progress-step.active .step-dot {
  border-color: var(--accent-blue);
  background: var(--accent-blue);
  color: var(--bg-primary);
  box-shadow: 0 0 12px var(--accent-glow);
}
.progress-step.completed .step-dot {
  border-color: var(--accent-blue);
  background: transparent;
  color: var(--accent-blue);
}
.step-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  white-space: nowrap;
}
.progress-step.active .step-label { color: var(--accent-blue); }

/* ===== CARD ===== */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 2rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.05);
  margin-bottom: 1.5rem;
}
.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--accent-blue);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.card-title::before {
  content: '';
  display: inline-block;
  width: 3px; height: 1.1em;
  background: var(--accent-blue);
  border-radius: 2px;
  box-shadow: 0 0 8px var(--accent-blue);
}

/* ===== FORM ELEMENTS ===== */
.form-group {
  margin-bottom: 1.25rem;
}
.form-label {
  display: block;
  font-size: 0.9rem;
  color: var(--text-primary);
  margin-bottom: 0.4rem;
  font-weight: 500;
}
.form-label .required { color: var(--accent-blue); margin-left: 2px; }

.form-input,
.form-select {
  width: 100%;
  padding: 0.65rem 1rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color var(--transition), box-shadow var(--transition);
  outline: none;
}
.form-input:focus,
.form-select:focus {
  border-color: var(--accent-blue);
  box-shadow: 0 0 0 3px var(--accent-glow);
}
.form-select option { background: var(--bg-secondary); }

/* ===== RADIO / CHECKBOX ===== */
.options-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.4rem;
}
.option-chip {
  position: relative;
}
.option-chip input { position: absolute; opacity: 0; width: 0; height: 0; }
.option-chip label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--text-muted);
  transition: all var(--transition);
  user-select: none;
}
.option-chip input:checked + label {
  border-color: var(--accent-blue);
  color: var(--accent-blue);
  background: rgba(0,212,255,0.08);
  box-shadow: 0 0 8px rgba(0,212,255,0.15);
}
.option-chip label:hover {
  border-color: rgba(0,212,255,0.5);
  color: var(--text-primary);
}

/* ===== STAR RATING ===== */
.star-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.star-label { font-size: 0.8rem; color: var(--text-muted); flex-shrink: 0; }
.stars {
  display: flex;
  flex-direction: row-reverse;
  gap: 4px;
}
.stars input { display: none; }
.stars label {
  font-size: 1.6rem;
  color: var(--bg-secondary);
  cursor: pointer;
  transition: color 0.1s;
  filter: drop-shadow(0 0 0 transparent);
}
.stars input:checked ~ label,
.stars label:hover,
.stars label:hover ~ label {
  color: var(--accent-blue);
  filter: drop-shadow(0 0 4px var(--accent-blue));
}

/* ===== CLINICAL TABLE ===== */
.clinical-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.clinical-table th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-color);
  font-weight: 500;
}
.clinical-table td {
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.clinical-table tr:last-child td { border-bottom: none; }
.clinical-table .item-name { color: var(--text-primary); font-weight: 500; }
.clinical-table .option-chip label { padding: 0.3rem 0.6rem; font-size: 0.8rem; }

/* ===== BUTTONS ===== */
.btn-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  gap: 1rem;
}
.btn {
  padding: 0.7rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
  font-family: inherit;
}
.btn-primary {
  background: var(--accent-blue);
  color: var(--bg-primary);
  box-shadow: 0 0 20px rgba(0,212,255,0.3);
}
.btn-primary:hover {
  box-shadow: 0 0 30px rgba(0,212,255,0.5);
  transform: translateY(-1px);
}
.btn-secondary {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}
.btn-secondary:hover { color: var(--text-primary); border-color: var(--accent-blue); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

/* ===== SUCCESS SCREEN ===== */
.success-screen {
  text-align: center;
  padding: 3rem 1rem;
}
.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  display: block;
  filter: drop-shadow(0 0 20px var(--accent-blue));
}
.success-screen h2 {
  font-size: 1.5rem;
  color: var(--accent-blue);
  margin-bottom: 0.75rem;
}
.success-screen p { color: var(--text-muted); }

/* ===== ERROR MESSAGE ===== */
.field-error {
  font-size: 0.8rem;
  color: var(--error);
  margin-top: 0.3rem;
  display: none;
}
.field-error.visible { display: block; }

/* ===== NOTIFICATION ===== */
.toast {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  z-index: 999;
  transition: transform 0.3s ease;
}
.toast.show { transform: translateX(-50%) translateY(0); }
.toast.error { border-color: var(--error); color: var(--error); }
.toast.success { border-color: var(--success); color: var(--success); }

/* ===== DASHBOARD ===== */
.dash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 2rem;
}
.dash-header h1 { font-size: 1.4rem; color: var(--accent-blue); }
.dash-refresh {
  font-size: 0.85rem;
  color: var(--text-muted);
  cursor: pointer;
  border: 1px solid var(--border-color);
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
  font-family: inherit;
  transition: all var(--transition);
}
.dash-refresh:hover { color: var(--accent-blue); border-color: var(--accent-blue); }

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}
.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 1.25rem;
  text-align: center;
  backdrop-filter: blur(10px);
}
.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent-blue);
  text-shadow: 0 0 12px var(--accent-glow);
}
.stat-label { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem; }

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.chart-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}
.chart-card.full-width { grid-column: 1 / -1; }
.chart-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--accent-blue);
  margin-bottom: 1rem;
}
.chart-container { position: relative; height: 220px; }
.chart-container.tall { height: 280px; }

/* ===== DATA TABLE ===== */
.data-table-wrapper { overflow-x: auto; }
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  white-space: nowrap;
}
.data-table th {
  padding: 0.6rem 0.8rem;
  text-align: left;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border-color);
  font-weight: 500;
}
.data-table td {
  padding: 0.55rem 0.8rem;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  color: var(--text-primary);
}
.data-table tr:hover td { background: rgba(0,212,255,0.03); }

/* ===== PASSWORD GATE ===== */
.password-gate {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
}
.password-gate h2 { color: var(--accent-blue); font-size: 1.3rem; }
.password-gate p { color: var(--text-muted); font-size: 0.9rem; }
.password-row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
.password-row .form-input { width: 220px; }

/* ===== RESPONSIVE ===== */
@media (max-width: 600px) {
  .charts-grid { grid-template-columns: 1fr; }
  .card { padding: 1.25rem; }
  .clinical-table { font-size: 0.78rem; }
  .clinical-table th:first-child,
  .clinical-table td:first-child { min-width: 120px; }
}
```

**Step 2: Verify file created, no issues**

Open `style.css` — check it has all variables and sections.

**Step 3: Commit**

```bash
cd "/Users/sniperhk/Downloads/資料治理實作練習檔_AG"
git init
git add style.css
git commit -m "feat: add shared dark tech theme CSS"
```

---

### Task 2: Survey HTML (index.html)

**Files:**
- Create: `index.html`

**Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Chest Echo 課程報名與課前問卷</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500;700&display=swap" />
  <link rel="stylesheet" href="style.css" />
</head>
<body>

<div class="container">
  <!-- HEADER -->
  <header class="site-header">
    <span class="logo-icon">🫁</span>
    <h1>Chest Echo 課程</h1>
    <p>報名與課前問卷 | 2026 年 3 月</p>
  </header>

  <!-- PROGRESS BAR -->
  <nav class="progress-bar" id="progressBar">
    <div class="progress-step active" data-step="1">
      <div class="step-dot">1</div>
      <span class="step-label">基本資料</span>
    </div>
    <div class="progress-step" data-step="2">
      <div class="step-dot">2</div>
      <span class="step-label">操作經驗</span>
    </div>
    <div class="progress-step" data-step="3">
      <div class="step-dot">3</div>
      <span class="step-label">課程報名</span>
    </div>
    <div class="progress-step" data-step="4">
      <div class="step-dot">4</div>
      <span class="step-label">自評&動機</span>
    </div>
  </nav>

  <!-- FORM -->
  <form id="surveyForm" novalidate>

    <!-- STEP 1: 基本資料 -->
    <div class="step-panel" id="step1">
      <div class="card">
        <div class="card-title">A. 基本資料</div>

        <div class="form-group">
          <label class="form-label" for="name">您的名字是？<span class="required">*</span></label>
          <input class="form-input" type="text" id="name" name="name" placeholder="請輸入姓名" required />
          <div class="field-error" id="err-name">請填寫姓名</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="empId">人事號<span class="required">*</span></label>
          <input class="form-input" type="text" id="empId" name="empId" placeholder="請輸入人事號" required />
          <div class="field-error" id="err-empId">請填寫人事號</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="role">您目前的身分是？<span class="required">*</span></label>
          <select class="form-select" id="role" name="role" required>
            <option value="">── 請選擇 ──</option>
            <option value="PGY1">PGY1</option>
            <option value="PGY2（內科組）">PGY2（內科組）</option>
            <option value="PGY2（不分組）">PGY2（不分組）</option>
            <option value="R1">R1</option>
            <option value="R2">R2</option>
            <option value="R3">R3</option>
            <option value="Fellow">Fellow</option>
          </select>
          <div class="field-error" id="err-role">請選擇身分</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="training">您過去是否曾接受過正式胸腔超音波訓練？<span class="required">*</span></label>
          <select class="form-select" id="training" name="training" required>
            <option value="">── 請選擇 ──</option>
            <option value="無">無</option>
            <option value="有，1 次">有，1 次</option>
            <option value="有，2–5 次">有，2–5 次</option>
            <option value="有，>5 次">有，&gt;5 次</option>
          </select>
          <div class="field-error" id="err-training">請選擇訓練次數</div>
        </div>
      </div>

      <div class="btn-row">
        <span></span>
        <button type="button" class="btn btn-primary" onclick="goStep(2)">下一步 →</button>
      </div>
    </div>

    <!-- STEP 2: 操作經驗 -->
    <div class="step-panel hidden" id="step2">
      <div class="card">
        <div class="card-title">A. 過去操作經驗</div>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1.25rem;">
          您過去是否實際操作過以下項目？
        </p>

        <table class="clinical-table">
          <thead>
            <tr>
              <th>項目</th>
              <th>從未看過</th>
              <th>在指導下操作過</th>
              <th>可獨立完成</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="item-name">Pneumothorax</td>
              <td><div class="option-chip"><input type="radio" name="ptx" id="ptx0" value="從未看過" required /><label for="ptx0">從未</label></div></td>
              <td><div class="option-chip"><input type="radio" name="ptx" id="ptx1" value="在指導下操作過" /><label for="ptx1">指導下</label></div></td>
              <td><div class="option-chip"><input type="radio" name="ptx" id="ptx2" value="可獨立完成" /><label for="ptx2">獨立</label></div></td>
            </tr>
            <tr>
              <td class="item-name">Pleural Effusion</td>
              <td><div class="option-chip"><input type="radio" name="pe" id="pe0" value="從未看過" required /><label for="pe0">從未</label></div></td>
              <td><div class="option-chip"><input type="radio" name="pe" id="pe1" value="在指導下操作過" /><label for="pe1">指導下</label></div></td>
              <td><div class="option-chip"><input type="radio" name="pe" id="pe2" value="可獨立完成" /><label for="pe2">獨立</label></div></td>
            </tr>
            <tr>
              <td class="item-name">Atelectasis / Pneumonia</td>
              <td><div class="option-chip"><input type="radio" name="atel" id="atel0" value="從未看過" required /><label for="atel0">從未</label></div></td>
              <td><div class="option-chip"><input type="radio" name="atel" id="atel1" value="在指導下操作過" /><label for="atel1">指導下</label></div></td>
              <td><div class="option-chip"><input type="radio" name="atel" id="atel2" value="可獨立完成" /><label for="atel2">獨立</label></div></td>
            </tr>
            <tr>
              <td class="item-name">Thoracocentesis / Pigtail（echo 引導）</td>
              <td><div class="option-chip"><input type="radio" name="thoraco" id="thoraco0" value="從未看過" required /><label for="thoraco0">從未</label></div></td>
              <td><div class="option-chip"><input type="radio" name="thoraco" id="thoraco1" value="在指導下操作過" /><label for="thoraco1">指導下</label></div></td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <div class="field-error" id="err-clinical">請填寫所有操作經驗項目</div>
      </div>

      <div class="btn-row">
        <button type="button" class="btn btn-secondary" onclick="goStep(1)">← 上一步</button>
        <button type="button" class="btn btn-primary" onclick="goStep(3)">下一步 →</button>
      </div>
    </div>

    <!-- STEP 3: 課程報名 -->
    <div class="step-panel hidden" id="step3">
      <div class="card">
        <div class="card-title">B. 課程報名</div>

        <div style="background:rgba(0,212,255,0.05);border:1px solid var(--border-color);border-radius:8px;padding:1rem;margin-bottom:1.5rem;font-size:0.88rem;line-height:1.7;color:var(--text-muted);">
          📅 <strong style="color:var(--text-primary)">大堂課</strong>：3/9（一）中午 12:00–14:00 ｜ 國際會議廳<br/>
          🔬 <strong style="color:var(--text-primary)">實作課</strong>：3 月第 2–4 週週三、週四下午約 2–4 點 ｜ 二樓檢查室 12 號門<br/>
          每梯 4 名學員，請勾選<strong style="color:var(--accent-blue)">所有</strong>您可以出席的時間
        </div>

        <div class="form-group">
          <label class="form-label">請勾選您可以的時間（可複選）<span class="required">*</span></label>
          <div class="options-grid">
            <div class="option-chip"><input type="checkbox" name="dates" id="d311" value="3/11" /><label for="d311">3 月 11 日（三）</label></div>
            <div class="option-chip"><input type="checkbox" name="dates" id="d312" value="3/12" /><label for="d312">3 月 12 日（四）</label></div>
            <div class="option-chip"><input type="checkbox" name="dates" id="d318" value="3/18" /><label for="d318">3 月 18 日（三）</label></div>
            <div class="option-chip"><input type="checkbox" name="dates" id="d319" value="3/19" /><label for="d319">3 月 19 日（四）</label></div>
            <div class="option-chip"><input type="checkbox" name="dates" id="d325" value="3/25" /><label for="d325">3 月 25 日（三）</label></div>
            <div class="option-chip"><input type="checkbox" name="dates" id="d326" value="3/26" /><label for="d326">3 月 26 日（四）</label></div>
          </div>
          <div class="field-error" id="err-dates">請至少選擇一個可出席時間</div>
        </div>
      </div>

      <div class="btn-row">
        <button type="button" class="btn btn-secondary" onclick="goStep(2)">← 上一步</button>
        <button type="button" class="btn btn-primary" onclick="goStep(4)">下一步 →</button>
      </div>
    </div>

    <!-- STEP 4: 自我效能感 + 學習動機 -->
    <div class="step-panel hidden" id="step4">
      <div class="card">
        <div class="card-title">C. 自我效能感</div>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1.25rem;">
          請評估你目前的信心程度（1 = 非常沒有信心，5 = 非常有信心）
        </p>

        <!-- Efficacy Q1 -->
        <div class="form-group">
          <label class="form-label">1. 我能正確選擇適合 chest echo 的探頭<span class="required">*</span></label>
          <div class="star-group">
            <span class="star-label">沒信心</span>
            <div class="stars" id="stars1">
              <input type="radio" name="eff1" id="e1s5" value="5" required /><label for="e1s5" title="5">★</label>
              <input type="radio" name="eff1" id="e1s4" value="4" /><label for="e1s4" title="4">★</label>
              <input type="radio" name="eff1" id="e1s3" value="3" /><label for="e1s3" title="3">★</label>
              <input type="radio" name="eff1" id="e1s2" value="2" /><label for="e1s2" title="2">★</label>
              <input type="radio" name="eff1" id="e1s1" value="1" /><label for="e1s1" title="1">★</label>
            </div>
            <span class="star-label">非常有信心</span>
          </div>
          <div class="field-error" id="err-eff1">請評分</div>
        </div>

        <!-- Efficacy Q2 -->
        <div class="form-group">
          <label class="form-label">2. 我能辨識正常與異常影像<span class="required">*</span></label>
          <div class="star-group">
            <span class="star-label">沒信心</span>
            <div class="stars">
              <input type="radio" name="eff2" id="e2s5" value="5" required /><label for="e2s5">★</label>
              <input type="radio" name="eff2" id="e2s4" value="4" /><label for="e2s4">★</label>
              <input type="radio" name="eff2" id="e2s3" value="3" /><label for="e2s3">★</label>
              <input type="radio" name="eff2" id="e2s2" value="2" /><label for="e2s2">★</label>
              <input type="radio" name="eff2" id="e2s1" value="1" /><label for="e2s1">★</label>
            </div>
            <span class="star-label">非常有信心</span>
          </div>
          <div class="field-error" id="err-eff2">請評分</div>
        </div>

        <!-- Efficacy Q3 -->
        <div class="form-group">
          <label class="form-label">3. 我在病房會主動考慮使用 chest echo 來輔助釐清病況<span class="required">*</span></label>
          <div class="star-group">
            <span class="star-label">沒信心</span>
            <div class="stars">
              <input type="radio" name="eff3" id="e3s5" value="5" required /><label for="e3s5">★</label>
              <input type="radio" name="eff3" id="e3s4" value="4" /><label for="e3s4">★</label>
              <input type="radio" name="eff3" id="e3s3" value="3" /><label for="e3s3">★</label>
              <input type="radio" name="eff3" id="e3s2" value="2" /><label for="e3s2">★</label>
              <input type="radio" name="eff3" id="e3s1" value="1" /><label for="e3s1">★</label>
            </div>
            <span class="star-label">非常有信心</span>
          </div>
          <div class="field-error" id="err-eff3">請評分</div>
        </div>

        <!-- Efficacy Q4 -->
        <div class="form-group">
          <label class="form-label">4. 我能將胸部超音波結果整合進臨床決策<span class="required">*</span></label>
          <div class="star-group">
            <span class="star-label">沒信心</span>
            <div class="stars">
              <input type="radio" name="eff4" id="e4s5" value="5" required /><label for="e4s5">★</label>
              <input type="radio" name="eff4" id="e4s4" value="4" /><label for="e4s4">★</label>
              <input type="radio" name="eff4" id="e4s3" value="3" /><label for="e4s3">★</label>
              <input type="radio" name="eff4" id="e4s2" value="2" /><label for="e4s2">★</label>
              <input type="radio" name="eff4" id="e4s1" value="1" /><label for="e4s1">★</label>
            </div>
            <span class="star-label">非常有信心</span>
          </div>
          <div class="field-error" id="err-eff4">請評分</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">D. 學習動機與期待</div>

        <div class="form-group">
          <label class="form-label">1. 您參加本課程的主要動機是？（可複選）</label>
          <div class="options-grid">
            <div class="option-chip"><input type="checkbox" name="motivation" id="mot1" value="提升臨床判斷能力" /><label for="mot1">提升臨床判斷能力</label></div>
            <div class="option-chip"><input type="checkbox" name="motivation" id="mot2" value="為值班/急救做準備" /><label for="mot2">為值班／急救做準備</label></div>
            <div class="option-chip"><input type="checkbox" name="motivation" id="mot3" value="應付考試或評核" /><label for="mot3">應付考試或評核</label></div>
            <div class="option-chip"><input type="checkbox" name="motivation" id="mot4" value="純粹興趣" /><label for="mot4">純粹興趣</label></div>
            <div class="option-chip"><input type="checkbox" name="motivation" id="mot5" value="other" onchange="toggleMotivationOther(this)" /><label for="mot5">其他</label></div>
          </div>
          <input class="form-input" type="text" id="motivationOther" name="motivationOther" placeholder="請說明其他動機" style="margin-top:0.5rem;display:none;" />
        </div>

        <div class="form-group">
          <label class="form-label" for="expectation">2. 您最希望從本課程學到的是？</label>
          <textarea class="form-input" id="expectation" name="expectation" rows="3" placeholder="請自由填寫..." style="resize:vertical;"></textarea>
        </div>
      </div>

      <div class="btn-row">
        <button type="button" class="btn btn-secondary" onclick="goStep(3)">← 上一步</button>
        <button type="submit" class="btn btn-primary" id="submitBtn">送出問卷 ✓</button>
      </div>
    </div>

  </form>

  <!-- SUCCESS SCREEN (hidden by default) -->
  <div id="successScreen" class="success-screen hidden">
    <span class="success-icon">✅</span>
    <h2>問卷已成功送出！</h2>
    <p>感謝您的填寫，課程相關資訊將另行通知。</p>
    <p style="margin-top:0.5rem;font-size:0.85rem;color:var(--text-muted)">如有問題請聯繫課程負責人</p>
  </div>

</div>

<div class="toast" id="toast"></div>

<script src="survey.js"></script>
</body>
</html>
```

**Step 2: Open in browser, verify all 4 steps render without JS**

```bash
open "/Users/sniperhk/Downloads/資料治理實作練習檔_AG/index.html"
```

**Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add survey HTML with 4-step structure"
```

---

### Task 3: Survey JavaScript (survey.js)

**Files:**
- Create: `survey.js`

**Step 1: Create `survey.js`**

```javascript
// ===== CONFIG =====
// Replace with your deployed Google Apps Script URL after setup
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL_HERE';

// ===== STATE =====
let currentStep = 1;
const TOTAL_STEPS = 4;

// ===== NAVIGATION =====
function goStep(targetStep) {
  if (targetStep > currentStep && !validateStep(currentStep)) return;

  document.getElementById(`step${currentStep}`).classList.add('hidden');
  currentStep = targetStep;
  document.getElementById(`step${currentStep}`).classList.remove('hidden');
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress() {
  document.querySelectorAll('.progress-step').forEach(el => {
    const step = parseInt(el.dataset.step);
    el.classList.remove('active', 'completed');
    if (step === currentStep) el.classList.add('active');
    if (step < currentStep) el.classList.add('completed');
  });
}

// ===== VALIDATION =====
function validateStep(step) {
  let valid = true;

  if (step === 1) {
    valid = validateRequired('name', 'err-name')
           & validateRequired('empId', 'err-empId')
           & validateSelect('role', 'err-role')
           & validateSelect('training', 'err-training');
  }

  if (step === 2) {
    const required = ['ptx', 'pe', 'atel', 'thoraco'];
    const allFilled = required.every(name => document.querySelector(`input[name="${name}"]:checked`));
    showError('err-clinical', !allFilled);
    if (!allFilled) valid = false;
  }

  if (step === 3) {
    const dateChecked = document.querySelectorAll('input[name="dates"]:checked').length > 0;
    showError('err-dates', !dateChecked);
    if (!dateChecked) valid = false;
  }

  if (step === 4) {
    ['eff1','eff2','eff3','eff4'].forEach(name => {
      const checked = document.querySelector(`input[name="${name}"]:checked`);
      const errId = `err-${name}`;
      showError(errId, !checked);
      if (!checked) valid = false;
    });
  }

  return !!valid;
}

function validateRequired(fieldId, errId) {
  const val = document.getElementById(fieldId).value.trim();
  showError(errId, !val);
  return !!val;
}

function validateSelect(fieldId, errId) {
  const val = document.getElementById(fieldId).value;
  showError(errId, !val);
  return !!val;
}

function showError(errId, show) {
  const el = document.getElementById(errId);
  if (el) el.classList.toggle('visible', show);
}

// ===== OTHER INPUT TOGGLE =====
function toggleMotivationOther(checkbox) {
  document.getElementById('motivationOther').style.display = checkbox.checked ? 'block' : 'none';
}

// ===== COLLECT DATA =====
function collectFormData() {
  const getVal = id => document.getElementById(id)?.value?.trim() || '';
  const getRadio = name => document.querySelector(`input[name="${name}"]:checked`)?.value || '';
  const getCheckboxes = name => Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
    .map(el => el.value).join(', ');

  const motivationOtherText = document.getElementById('motivationOther').value.trim();
  let motivations = getCheckboxes('motivation').replace('other', motivationOtherText ? `其他：${motivationOtherText}` : '').replace(/, $/, '').replace(/^, /, '');

  return {
    timestamp: new Date().toISOString(),
    name: getVal('name'),
    empId: getVal('empId'),
    role: getVal('role'),
    training: getVal('training'),
    ptx: getRadio('ptx'),
    pe: getRadio('pe'),
    atel: getRadio('atel'),
    thoraco: getRadio('thoraco'),
    dates: getCheckboxes('dates'),
    eff1: getRadio('eff1'),
    eff2: getRadio('eff2'),
    eff3: getRadio('eff3'),
    eff4: getRadio('eff4'),
    motivation: motivations,
    expectation: getVal('expectation')
  };
}

// ===== SUBMIT =====
document.getElementById('surveyForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateStep(4)) return;

  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = '送出中...';

  try {
    const data = collectFormData();

    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL_HERE') {
      // Demo mode: log to console
      console.log('Demo mode — form data:', data);
      await new Promise(r => setTimeout(r, 800));
    } else {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }

    // Show success
    document.getElementById('surveyForm').classList.add('hidden');
    document.getElementById('progressBar').classList.add('hidden');
    document.querySelector('.site-header').classList.add('hidden');
    document.getElementById('successScreen').classList.remove('hidden');

  } catch (err) {
    btn.disabled = false;
    btn.textContent = '送出問卷 ✓';
    showToast('送出失敗，請稍後再試', 'error');
  }
});

// ===== TOAST =====
function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ===== INIT =====
updateProgress();
```

**Step 2: Test in browser — navigate through all 4 steps, verify validation triggers**

- Step 1: Click "下一步" without filling anything → should show errors
- Fill all fields → should advance to step 2
- Step 2: Click next without selecting radios → should show error
- Step 4: Click submit without star ratings → should show errors

**Step 3: Commit**

```bash
git add survey.js
git commit -m "feat: add survey JS with validation and form submission"
```

---

### Task 4: Google Apps Script (apps-script.gs)

**Files:**
- Create: `apps-script.gs`

**Step 1: Create `apps-script.gs`**

```javascript
// ===== CONFIGURATION =====
// Change this to the name of your Google Sheet tab
const SHEET_NAME = 'Responses';

// ===== HEADERS =====
// These must match the keys in the JSON sent from survey.js
const HEADERS = [
  '時間戳記', '姓名', '人事號', '身分', '訓練次數',
  'PTX操作', 'PE操作', 'Consolidation操作', 'Thoracocentesis操作',
  '選擇日期', '效能_探頭', '效能_影像判讀', '效能_主動使用', '效能_臨床整合',
  '學習動機', '希望學到'
];

// ===== KEY MAP (JSON key → column index) =====
const KEY_MAP = {
  timestamp: 0, name: 1, empId: 2, role: 3, training: 4,
  ptx: 5, pe: 6, atel: 7, thoraco: 8, dates: 9,
  eff1: 10, eff2: 11, eff3: 12, eff4: 13,
  motivation: 14, expectation: 15
};

// ===== POST: Receive form submission =====
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Create sheet with headers if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, HEADERS.length)
        .setBackground('#1a1a2e')
        .setFontColor('#00D4FF')
        .setFontWeight('bold');
    }

    const data = JSON.parse(e.postData.contents);
    const row = new Array(HEADERS.length).fill('');
    Object.entries(KEY_MAP).forEach(([key, idx]) => {
      row[idx] = data[key] || '';
    });

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== GET: Return all responses for dashboard =====
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet || sheet.getLastRow() < 2) {
      return ContentService
        .createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });

    return ContentService
      .createTextOutput(JSON.stringify(rows))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

**Step 2: Manual deployment steps (document in README)**

1. Go to [sheets.google.com](https://sheets.google.com) → create new sheet named "Chest Echo 2026"
2. Click **Extensions → Apps Script**
3. Delete default code, paste `apps-script.gs` content
4. Click **Deploy → New deployment**
5. Type: **Web app**, Execute as: **Me**, Who has access: **Anyone**
6. Click **Deploy** → copy the Web App URL
7. Paste the URL into `survey.js` → `const APPS_SCRIPT_URL = '<paste here>'`
8. Paste the URL into `dashboard.js` → `const APPS_SCRIPT_URL = '<paste here>'`

**Step 3: Commit**

```bash
git add apps-script.gs
git commit -m "feat: add Google Apps Script for Sheets integration"
```

---

### Task 5: Dashboard HTML (dashboard.html)

**Files:**
- Create: `dashboard.html`

**Step 1: Create `dashboard.html`**

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Chest Echo 課程 — 管理儀表板</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500;700&display=swap" />
  <link rel="stylesheet" href="style.css" />
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
</head>
<body>

<!-- PASSWORD GATE -->
<div class="container" id="passwordGate">
  <div class="password-gate">
    <span style="font-size:2.5rem">🔐</span>
    <h2>管理者儀表板</h2>
    <p>請輸入管理員密碼</p>
    <div class="password-row">
      <input class="form-input" type="password" id="pwInput" placeholder="密碼" onkeydown="if(event.key==='Enter')checkPassword()" />
      <button class="btn btn-primary" onclick="checkPassword()">進入</button>
    </div>
    <div class="field-error" id="pwError" style="margin-top:0.5rem;text-align:center;">密碼錯誤</div>
  </div>
</div>

<!-- DASHBOARD (hidden until authenticated) -->
<div class="container hidden" id="dashboardContent">

  <div class="dash-header">
    <h1>🫁 Chest Echo 課程儀表板</h1>
    <button class="dash-refresh" onclick="loadData()">↻ 重新整理</button>
  </div>

  <!-- STATS ROW -->
  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-number" id="statTotal">—</div>
      <div class="stat-label">總報名人數</div>
    </div>
    <div class="stat-card">
      <div class="stat-number" id="statPGY">—</div>
      <div class="stat-label">PGY</div>
    </div>
    <div class="stat-card">
      <div class="stat-number" id="statResident">—</div>
      <div class="stat-label">R1–R3</div>
    </div>
    <div class="stat-card">
      <div class="stat-number" id="statFellow">—</div>
      <div class="stat-label">Fellow</div>
    </div>
  </div>

  <!-- CHARTS GRID -->
  <div class="charts-grid">
    <!-- Role Distribution -->
    <div class="chart-card">
      <div class="chart-title">身分分佈</div>
      <div class="chart-container"><canvas id="chartRole"></canvas></div>
    </div>

    <!-- Date Registration -->
    <div class="chart-card">
      <div class="chart-title">實作課日期報名人數</div>
      <div class="chart-container"><canvas id="chartDates"></canvas></div>
    </div>

    <!-- Self-Efficacy Radar -->
    <div class="chart-card">
      <div class="chart-title">自我效能感平均分（1–5）</div>
      <div class="chart-container"><canvas id="chartEfficacy"></canvas></div>
    </div>

    <!-- Motivation -->
    <div class="chart-card">
      <div class="chart-title">學習動機分佈</div>
      <div class="chart-container"><canvas id="chartMotivation"></canvas></div>
    </div>
  </div>

  <!-- RESPONSES TABLE -->
  <div class="card">
    <div class="card-title">最新回覆明細</div>
    <div class="data-table-wrapper">
      <table class="data-table" id="responsesTable">
        <thead>
          <tr>
            <th>時間</th><th>姓名</th><th>身分</th><th>訓練</th>
            <th>選擇日期</th><th>效能均分</th><th>動機</th>
          </tr>
        </thead>
        <tbody id="responsesBody">
          <tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:2rem;">載入中...</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div style="text-align:center;margin:2rem 0;font-size:0.8rem;color:var(--text-muted)">
    <a href="index.html" style="color:var(--accent-blue);text-decoration:none;">← 返回問卷頁</a>
  </div>

</div>

<script src="dashboard.js"></script>
</body>
</html>
```

**Step 2: Open in browser, verify password gate shows**

```bash
open "/Users/sniperhk/Downloads/資料治理實作練習檔_AG/dashboard.html"
```

Expected: password input screen shows

**Step 3: Commit**

```bash
git add dashboard.html
git commit -m "feat: add dashboard HTML with charts layout"
```

---

### Task 6: Dashboard JavaScript (dashboard.js)

**Files:**
- Create: `dashboard.js`

**Step 1: Create `dashboard.js`**

```javascript
// ===== CONFIG =====
// Replace with your deployed Google Apps Script URL
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL_HERE';

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
    loadData();
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
  } catch (err) {
    console.error('Load error:', err);
    document.getElementById('responsesBody').innerHTML =
      `<tr><td colspan="7" style="text-align:center;color:var(--error);padding:2rem;">載入失敗：${err.message}</td></tr>`;
  }
}

// ===== STATS =====
function renderStats(rows) {
  document.getElementById('statTotal').textContent = rows.length;
  document.getElementById('statPGY').textContent =
    rows.filter(r => String(r['身分'] || '').startsWith('PGY')).length;
  document.getElementById('statResident').textContent =
    rows.filter(r => ['R1','R2','R3'].includes(String(r['身分'] || ''))).length;
  document.getElementById('statFellow').textContent =
    rows.filter(r => r['身分'] === 'Fellow').length;
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
  rows.forEach(r => { const v = r['身分'] || '未填'; counts[v] = (counts[v] || 0) + 1; });
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
    const selected = String(r['選擇日期'] || '').split(',').map(s => s.trim());
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

  const keys = ['效能_探頭','效能_影像判讀','效能_主動使用','效能_臨床整合'];
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
    const mots = String(r['學習動機'] || '').split(',').map(s => s.trim());
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

  const sorted = [...rows].sort((a, b) => new Date(b['時間戳記']) - new Date(a['時間戳記']));
  tbody.innerHTML = sorted.slice(0, 50).map(r => {
    const effKeys = ['效能_探頭','效能_影像判讀','效能_主動使用','效能_臨床整合'];
    const effVals = effKeys.map(k => parseFloat(r[k])).filter(v => !isNaN(v));
    const effAvg = effVals.length ? (effVals.reduce((a,b) => a+b, 0) / effVals.length).toFixed(1) : '—';
    const ts = r['時間戳記'] ? new Date(r['時間戳記']).toLocaleString('zh-TW', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }) : '—';

    return `<tr>
      <td>${ts}</td>
      <td>${r['姓名'] || '—'}</td>
      <td>${r['身分'] || '—'}</td>
      <td>${r['訓練次數'] || '—'}</td>
      <td>${r['選擇日期'] || '—'}</td>
      <td>${effAvg}</td>
      <td>${(r['學習動機'] || '—').substring(0, 30)}</td>
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
      '時間戳記': new Date(Date.now() - i * 3600000).toISOString(),
      '姓名': `醫師${i + 1}`,
      '身分': roles[i % roles.length],
      '訓練次數': trainings[i % trainings.length],
      '選擇日期': selectedDates,
      '效能_探頭': (Math.random() * 3 + 1).toFixed(0),
      '效能_影像判讀': (Math.random() * 3 + 1).toFixed(0),
      '效能_主動使用': (Math.random() * 3 + 1).toFixed(0),
      '效能_臨床整合': (Math.random() * 3 + 1).toFixed(0),
      '學習動機': selectedMot,
      '希望學到': '希望學會如何判讀影像'
    };
  });
}
```

**Step 2: Open dashboard in browser, enter password `echo2026`**

```bash
open "/Users/sniperhk/Downloads/資料治理實作練習檔_AG/dashboard.html"
```

Expected:
- Password gate blocks access
- After entering `echo2026` → see demo charts (18 fake responses)
- Doughnut, bar charts, radar, table all render

**Step 3: Commit**

```bash
git add dashboard.js
git commit -m "feat: add dashboard JS with Chart.js charts and demo data"
```

---

### Task 7: Final Polish + README

**Files:**
- Create: `README.md`

**Step 1: Create deployment README**

```markdown
# Chest Echo 課程問卷網站

## 快速部署

### 1. GitHub Pages
1. 建立 GitHub repo，上傳所有檔案
2. Settings → Pages → Source: main branch, root `/`

### 2. Google Apps Script 設定
1. 建立 Google 試算表（命名隨意）
2. Extensions → Apps Script → 貼上 `apps-script.gs` 內容
3. Deploy → New deployment → Web app
   - Execute as: **Me**
   - Who has access: **Anyone**
4. 複製 Web App URL

### 3. 填入 URL
- 開啟 `survey.js`，修改第 2 行：
  ```js
  const APPS_SCRIPT_URL = '貼上你的 URL';
  ```
- 開啟 `dashboard.js`，修改第 2 行：
  ```js
  const APPS_SCRIPT_URL = '貼上你的 URL';
  ```

### 4. 修改儀表板密碼（可選）
開啟 `dashboard.js` 第 5 行修改：
```js
const DASHBOARD_PASSWORD = 'echo2026';
```

## 頁面
- 問卷：`index.html`
- 儀表板：`dashboard.html`（預設密碼：`echo2026`）
```

**Step 2: Final end-to-end test**

1. Open `index.html` → fill all 4 steps → submit (demo mode logs to console)
2. Open `dashboard.html` → enter password → see demo charts
3. (After Apps Script deployed) submit real data → verify it appears in Sheets and dashboard

**Step 3: Final commit**

```bash
git add README.md
git commit -m "docs: add deployment README"
```

---

## Summary

| File | Purpose |
|------|---------|
| `style.css` | Dark tech theme, shared styles |
| `index.html` | 4-step survey form |
| `survey.js` | Form logic, validation, submission |
| `dashboard.html` | Admin dashboard layout |
| `dashboard.js` | Charts, password auth, data loading |
| `apps-script.gs` | Google Apps Script (manual deploy) |
| `README.md` | Deployment instructions |

**Deploy checklist:**
- [ ] Google Sheets + Apps Script deployed, URL copied
- [ ] URL updated in `survey.js` and `dashboard.js`
- [ ] Password changed in `dashboard.js` (optional)
- [ ] GitHub repo created + GitHub Pages enabled
- [ ] Test submit → verify Sheets row appears
- [ ] Test dashboard → verify charts load from Sheets
