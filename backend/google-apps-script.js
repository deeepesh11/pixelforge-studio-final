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
    const ss   = SpreadsheetApp.getActiveSpreadsheet();
    const data = JSON.parse(e.postData.contents);
    const sheetName = data.sheet || 'Contacts';
    
    let sheet = ss.getSheetByName(sheetName);
    
    // Sheet nahi hai toh banao
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // Headers add karo
      if (sheetName === 'Contacts') {
        sheet.appendRow(['ID','Name','Email','Company','Service','Budget','Message','Date','Status']);
      } else if (sheetName === 'Quotes') {
        sheet.appendRow(['ID','Name','Email','Project Type','Budget','Description','Date']);
      } else if (sheetName === 'Subscribers') {
        sheet.appendRow(['Email','Date']);
      }
      // Header row style karo
      sheet.getRange(1, 1, 1, sheet.getLastColumn())
        .setBackground('#c8f542')
        .setFontColor('#050508')
        .setFontWeight('bold');
    }
    
    // Data save karo based on sheet type
    if (sheetName === 'Contacts') {
      sheet.appendRow([
        data.id || Date.now(),
        data.name        || '',
        data.email       || '',
        data.company     || '',
        data.service     || '',
        data.budget      || '',
        data.message     || '',
        new Date().toLocaleString('en-IN'),
        data.status      || 'new'
      ]);
    } else if (sheetName === 'Quotes') {
      sheet.appendRow([
        data.id    || Date.now(),
        data.name  || '',
        data.email || '',
        data.type  || '',
        data.budget|| '',
        data.desc  || '',
        new Date().toLocaleString('en-IN')
      ]);
    } else if (sheetName === 'Subscribers') {
      sheet.appendRow([
        data.email || '',
        new Date().toLocaleString('en-IN')
      ]);
    }

    // Auto-resize columns
    sheet.autoResizeColumns(1, sheet.getLastColumn());

    // Email notification bhejo (optional - apna email daalo)
    sendEmailNotification(sheetName, data);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', sheet: sheetName }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET request — dashboard data return karo
function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const summary = {
    contacts:    getSheetCount(ss, 'Contacts'),
    quotes:      getSheetCount(ss, 'Quotes'),
    subscribers: getSheetCount(ss, 'Subscribers'),
    lastUpdated: new Date().toLocaleString('en-IN')
  };
  return ContentService
    .createTextOutput(JSON.stringify(summary))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheetCount(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) return 0;
  const rows = sheet.getLastRow();
  return rows > 1 ? rows - 1 : 0; // minus header row
}

// ===== EMAIL NOTIFICATION (Optional) =====
// Naya form submission aane par email aayega
function sendEmailNotification(type, data) {
  const YOUR_EMAIL = 'suthardeepesh5@gmail.com'; // Yahan apna email daalo
  
  if (YOUR_EMAIL === 'suthardeepesh5@gmail.com') return; // Skip if not set
  
  const subject = `PixelForge — New ${type} from ${data.name || data.email}`;
  const body = `
New ${type} received on PixelForge Studio website!

Name:    ${data.name    || '-'}
Email:   ${data.email   || '-'}
Service: ${data.service || data.type || '-'}
Budget:  ${data.budget  || '-'}
Message: ${data.message || data.desc || '-'}

Date: ${new Date().toLocaleString('en-IN')}

View all data: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}
  `;
  
  try {
    MailApp.sendEmail(YOUR_EMAIL, subject, body);
  } catch(e) {
    console.log('Email send failed:', e);
  }
}
