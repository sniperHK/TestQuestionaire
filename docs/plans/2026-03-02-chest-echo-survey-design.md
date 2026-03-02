# Chest Echo 課程問卷網站 — 設計文件

> 日期：2026-03-02
> 狀態：已核准

---

## 背景

基於 `練習檔.md` 的問卷內容（chest echo 課程報名與課前問卷），建立一個靜態問卷網站，讓住院醫師填寫報名資料與課前自評，並提供管理者儀表板查看統計。

---

## 技術選型

| 項目 | 選擇 | 原因 |
|------|------|------|
| 前端架構 | 雙頁 Vanilla HTML | 無 build 流程，GitHub Pages 直接部署 |
| 樣式 | 原生 CSS（深色科技風） | 無框架依賴，自訂靈活 |
| 圖表 | Chart.js（CDN） | 輕量，支援需要的所有圖表類型 |
| 主機 | GitHub Pages | 免費，push 即上線 |
| 資料儲存 | Google Sheets | 免費，易於管理者查看 |
| 後端 | Google Apps Script Web App | 免費，無需自架伺服器 |

---

## 檔案結構

```
資料治理實作練習檔_AG/
├── index.html          # 問卷頁（填寫者）
├── dashboard.html      # 儀表板（管理者，密碼保護）
├── style.css           # 共用樣式
├── survey.js           # 問卷邏輯
├── dashboard.js        # 儀表板邏輯
└── apps-script.gs      # Google Apps Script 程式碼（需手動部署）
```

---

## 問卷頁設計（index.html）

### 結構
4 步驟分頁（Step 1–4），頂部固定進度條，每次顯示一個步驟。

| 步驟 | 標籤 | 內容 |
|------|------|------|
| 1 | 基本資料 | 姓名（文字）、人事號（文字）、身分（下拉）、訓練次數（下拉） |
| 2 | 操作經驗 | pneumothorax / pleural effusion / atelectasis（各 3 選項 radio）、thoracocentesis（2 選項 radio） |
| 3 | 課程報名 | 大堂課說明、實作課日期複選（6 個 checkbox：3/11, 3/12, 3/18, 3/19, 3/25, 3/26） |
| 4 | 自評 + 動機 | 自我效能感（4 題，1–5 星評分）、學習動機（多選）、最希望學到的（開放文字） |

### 操作流程
1. 填寫 → 點「下一步」（前端驗證必填欄位）
2. 最後一步點「送出問卷」
3. `fetch` POST 到 Apps Script URL
4. 成功 → 顯示感謝畫面

---

## 儀表板設計（dashboard.html）

### 存取
- 進入頁面時顯示密碼輸入框
- 密碼正確（硬編碼於 `dashboard.js`）後顯示儀表板
- 錯誤 3 次鎖定 30 秒

### 圖表區塊

| 區塊 | 圖表類型 | 資料來源 |
|------|---------|---------|
| 報名人數 + 身分分佈 | 甜甜圈圖（Doughnut） | 欄：身分 |
| 課程日期報名人數 | 橫條圖（Bar） | 欄：選擇日期（複選解析） |
| 自我效能感平均分 | 雷達圖（Radar） | 欄：C1–C4 |
| 學習動機分佈 | 橫條圖（Bar） | 欄：動機（複選解析） |

- 底部：最新回覆明細表格（顯示所有欄位，可依提交時間排序）

### 資料載入
- 頁面載入時 `fetch` GET Apps Script URL
- Apps Script 回傳 JSON 陣列
- 本地解析後渲染圖表

---

## Apps Script 設計（apps-script.gs）

### Sheets 結構
第一列為標題列：
```
時間戳記 | 姓名 | 人事號 | 身分 | 訓練次數 | 操作_PTX | 操作_PE | 操作_Consolidation | 操作_Thoracocentesis | 選擇日期 | 效能_1 | 效能_2 | 效能_3 | 效能_4 | 動機 | 希望學到
```

### 端點
| 方法 | 功能 |
|------|------|
| `doPost(e)` | 接收問卷 JSON → 追加一列到 Sheet |
| `doGet(e)` | 讀取全部列（含標題）→ 回傳 JSON |

### CORS
所有回應加入 `Access-Control-Allow-Origin: *`

---

## 視覺規格

```css
--bg-primary:    #0D1117;   /* 主背景 */
--bg-card:       rgba(22, 27, 34, 0.8);  /* 毛玻璃卡片 */
--accent-blue:   #00D4FF;   /* 霓虹藍主色 */
--accent-purple: #7C3AED;   /* 紫色強調 */
--text-primary:  #E2E8F0;   /* 主文字 */
--text-muted:    #8B949E;   /* 次要文字 */
```

字型：`Noto Sans TC`（中文）+ `Inter`（英文數字）via Google Fonts CDN
卡片效果：`backdrop-filter: blur(10px)`
霓虹邊框：`box-shadow: 0 0 20px rgba(0, 212, 255, 0.3)`

---

## 部署流程

1. 建立 GitHub repo → 開啟 GitHub Pages（`main` branch，根目錄）
2. 在 Google Sheets 建立新試算表 → 開啟 Apps Script
3. 貼上 `apps-script.gs` 程式碼 → 部署為 Web App（Anyone 可存取）
4. 將 Apps Script URL 填入 `survey.js` 和 `dashboard.js` 常數
5. Push 所有檔案

---

## 驗證標準

- [ ] 問卷所有必填欄位有前端驗證
- [ ] 送出後資料出現在 Google Sheets
- [ ] 儀表板密碼保護正常
- [ ] 儀表板圖表正確載入並顯示資料
- [ ] 手機版顯示正常（RWD）
