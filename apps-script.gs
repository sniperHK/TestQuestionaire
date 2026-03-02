// ===== CONFIGURATION =====
// Change this to the name of your Google Sheet tab
const SHEET_NAME = 'Sheet1';

// ===== HEADERS =====
// These must match the existing Google Sheet column headers
const HEADERS = [
  '時間戳記', '姓名', '人事號', '身分', '過去訓練',
  '氣胸操作', '肋膜積水操作', '肺塌陷操作', 'Pigtail操作',
  '可用時間', '探頭信心', '影像信心', '主動信心', '整合信心',
  '學習動機', '學習動機(其他)', '期待與回饋'
];

// ===== KEY MAP (JSON key → column index) =====
const KEY_MAP = {
  timestamp: 0, name: 1, empId: 2, role: 3, training: 4,
  ptx: 5, pe: 6, atel: 7, thoraco: 8, dates: 9,
  eff1: 10, eff2: 11, eff3: 12, eff4: 13,
  motivation: 14, motivationOther: 15, expectation: 16
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
