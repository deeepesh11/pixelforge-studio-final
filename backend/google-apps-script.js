// ============================================================
// PixelForge Studio — Google Apps Script
// Yeh code Google Sheets mein paste karo
// ============================================================
//
// SETUP STEPS:
// 1. sheets.google.com pe jaao → New Sheet banao
// 2. Sheet ka naam rakho: "PixelForge Data"
// 3. 3 tabs banao: "Contacts", "Quotes", "Subscribers"
// 4. Tools → Apps Script click karo
// 5. Yeh poora code paste karo (purana delete karke)
// 6. Save karo (Ctrl+S)
// 7. Deploy → New Deployment → Web App
// 8. Settings:
//    - Execute as: Me
//    - Who has access: Anyone
// 9. Deploy click karo → URL copy karo
// 10. Woh URL js/main.js mein GOOGLE_SHEET_URL mein paste karo
// ============================================================

function doPost(e) {
  try {
    const ss   = SpreadsheetApp.openById('1YN4pDtvAYB0Sw5VFDVQE8KCFhj6iGZ0Wq0dlSnw30NY');
    const data = JSON.parse(e.postData.contents);
    const sheetName = data.sheet || 'Contacts';
    
    let sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      if (sheetName === 'Contacts') {
        sheet.appendRow(['ID','Name','Email','Company','Service','Budget','Message','Date','Status']);
      } else if (sheetName === 'Quotes') {
        sheet.appendRow(['ID','Name','Email','Project Type','Budget','Description','Date']);
      } else if (sheetName === 'Subscribers') {
        sheet.appendRow(['Email','Date']);
      }
      sheet.getRange(1,1,1,sheet.getLastColumn())
        .setBackground('#c8f542')
        .setFontColor('#050508')
        .setFontWeight('bold');
    }
    
    if (sheetName === 'Contacts') {
      sheet.appendRow([
        data.id      || Date.now(),
        data.name    || '',
        data.email   || '',
        data.company || '',
        data.service || '',
        data.budget  || '',
        data.message || '',
        new Date().toLocaleString('en-IN'),
        'new'
      ]);
    } else if (sheetName === 'Quotes') {
      sheet.appendRow([
        data.id     || Date.now(),
        data.name   || '',
        data.email  || '',
        data.type   || '',
        data.budget || '',
        data.desc   || '',
        new Date().toLocaleString('en-IN')
      ]);
    } else if (sheetName === 'Subscribers') {
      sheet.appendRow([
        data.email || '',
        new Date().toLocaleString('en-IN')
      ]);
    }

    sheet.autoResizeColumns(1, sheet.getLastColumn());

    // Email notification
    const YOUR_EMAIL = 'suthardeepesh5@gmail.com';

    MailApp.sendEmail(
      YOUR_EMAIL,
      `PixelForge — New ${sheetName} from ${data.name || data.email}`,
      `Name: ${data.name||'-'}\nEmail: ${data.email||'-'}\nService: ${data.service||data.type||'-'}\nBudget: ${data.budget||'-'}\nMessage: ${data.message||data.desc||'-'}\nDate: ${new Date().toLocaleString('en-IN')}`
    );

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  const ss = SpreadsheetApp.openById('1YN4pDtvAYB0Sw5VFDVQE8KCFhj6iGZ0Wq0dlSnw30NY');
  return ContentService
    .createTextOutput(JSON.stringify({
      contacts:    getCount(ss,'Contacts'),
      quotes:      getCount(ss,'Quotes'),
      subscribers: getCount(ss,'Subscribers')
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getCount(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) return 0;
  return Math.max(0, sheet.getLastRow() - 1);
}
