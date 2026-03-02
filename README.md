# Chest Echo 課程問卷網站

Chest Echo 課程報名與課前問卷系統，含填寫端 + 管理者儀表板。

## 頁面

- **問卷**：`index.html`
- **儀表板**：`dashboard.html`（預設密碼：`echo2026`）

## 快速部署

### 1. GitHub Pages
1. Settings → Pages → Source: main branch, root `/`
2. 網站會在 `https://<username>.github.io/TestQuestionaire/` 上線

### 2. Google Apps Script 設定
1. 開啟 [Google 試算表](https://docs.google.com/spreadsheets/d/1u1X5fxL7DXApMl0LWWimaS-gvoHxvkbDspM-n1KLgC0/edit)
2. Extensions → Apps Script → 貼上 `apps-script.gs` 內容
3. Deploy → New deployment → Web app
   - Execute as: **Me**
   - Who has access: **Anyone**
4. 複製 Web App URL

### 3. 填入 URL
- 開啟 `survey.js`，修改第 3 行：
  ```js
  const APPS_SCRIPT_URL = '貼上你的 URL';
  ```
- 開啟 `dashboard.js`，修改第 3 行：
  ```js
  const APPS_SCRIPT_URL = '貼上你的 URL';
  ```

### 4. 修改儀表板密碼（可選）
開啟 `dashboard.js` 第 6 行修改：
```js
const DASHBOARD_PASSWORD = 'echo2026';
```

## 技術棧

HTML5 + CSS3 (dark tech theme) + Vanilla JS + Chart.js (CDN) + Google Apps Script + Google Sheets
