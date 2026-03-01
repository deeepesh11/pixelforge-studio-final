/* ============================================================
   PixelForge Studio — main.js
   Shared JS for all pages
   ============================================================ */

// ===== GOOGLE SHEETS CONFIG =====
// Step 1: Google Sheets mein jaao → Tools → Apps Script
// Step 2: Wahan script paste karo (README mein diya hai)
// Step 3: Deploy karo aur URL yahan paste karo:
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwzoByknR-enOP5knr5BnY3OeGJR2lapamhERaMY3xP1r_dasSSMRCsIDjqCiL77Kj6pw/exec';
// Example: 'https://script.google.com/macros/s/AKfycbx.../exec'

// Google Sheet mein data bhejne ka function
async function sendToGoogleSheet(sheetName, data) {
  if (GOOGLE_SHEET_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    console.warn('⚠️ Google Sheet URL set nahi hai — sirf localStorage mein save ho raha hai');
    return false;
  }
  try {
    await fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheet: sheetName, ...data })
    });
    return true;
  } catch (err) {
    console.error('Google Sheet error:', err);
    return false;
  }
}

// ===== LOCAL BACKEND (localStorage DB) =====
const DB = {
  contacts: JSON.parse(localStorage.getItem('pf_contacts') || '[]'),
  quotes:   JSON.parse(localStorage.getItem('pf_quotes')   || '[]'),
  subs:     JSON.parse(localStorage.getItem('pf_subs')     || '[]'),

  saveContact(data) {
    data.id        = Date.now();
    data.timestamp = new Date().toISOString();
    data.status    = 'new';
    this.contacts.push(data);
    localStorage.setItem('pf_contacts', JSON.stringify(this.contacts));
    // Google Sheet mein bhi bhejo
    sendToGoogleSheet('Contacts', data);
    return data;
  },
  saveQuote(data) {
    data.id        = Date.now();
    data.timestamp = new Date().toISOString();
    this.quotes.push(data);
    localStorage.setItem('pf_quotes', JSON.stringify(this.quotes));
    // Google Sheet mein bhi bhejo
    sendToGoogleSheet('Quotes', data);
    return data;
  },
  subscribe(email) {
    if (this.subs.includes(email)) return false;
    this.subs.push(email);
    localStorage.setItem('pf_subs', JSON.stringify(this.subs));
    // Google Sheet mein bhi bhejo
    sendToGoogleSheet('Subscribers', { email, timestamp: new Date().toISOString() });
    return true;
  }
};

// ===== EXCEL / CSV EXPORT =====
function exportToExcel(type = 'contacts') {
  let data    = [];
  let headers = [];
  let filename = '';

  if (type === 'contacts') {
    data     = JSON.parse(localStorage.getItem('pf_contacts') || '[]');
    headers  = ['ID','Name','Email','Company','Service','Budget','Message','Date','Status'];
    filename = 'pixelforge-contacts.csv';
    data     = data.map(c => [
      c.id, c.name, c.email, c.company || '-',
      c.service || '-', c.budget || '-',
      (c.message || '').replace(/"/g, "'"),
      new Date(c.timestamp).toLocaleString(), c.status || 'new'
    ]);
  } else if (type === 'quotes') {
    data     = JSON.parse(localStorage.getItem('pf_quotes') || '[]');
    headers  = ['ID','Name','Email','Project Type','Budget','Description','Date'];
    filename = 'pixelforge-quotes.csv';
    data     = data.map(q => [
      q.id, q.name, q.email, q.type || '-',
      q.budget || '-',
      (q.desc || '').replace(/"/g, "'"),
      new Date(q.timestamp).toLocaleString()
    ]);
  } else if (type === 'subscribers') {
    data     = JSON.parse(localStorage.getItem('pf_subs') || '[]');
    headers  = ['Email'];
    filename = 'pixelforge-subscribers.csv';
    data     = data.map(email => [email]);
  }

  if (data.length === 0) {
    showToast('No Data', 'Abhi tak koi submission nahi hai!', 'ℹ️');
    return;
  }

  // CSV banao
  let csv = headers.join(',') + '\n';
  data.forEach(row => {
    csv += row.map(val => `"${val}"`).join(',') + '\n';
  });

  // Download trigger
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('Downloaded! 📊', `${data.length} records Excel mein export ho gaye`);
}

// ===== CLEAR ALL DATA =====
function clearAllData() {
  if (!confirm('⚠️ Sab data delete ho jayega! Are you sure?')) return;
  localStorage.removeItem('pf_contacts');
  localStorage.removeItem('pf_quotes');
  localStorage.removeItem('pf_subs');
  DB.contacts = []; DB.quotes = []; DB.subs = [];
  showToast('Cleared! 🗑️', 'Sab data delete ho gaya');
  if (typeof loadAdminStats === 'function') loadAdminStats();
}
}

// ===== CUSTOM CURSOR =====
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursor-ring');
  if (!cursor || !ring) return;
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function tick() {
    cursor.style.transform = `translate(${mx - 6}px,${my - 6}px)`;
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.transform = `translate(${rx - 20}px,${ry - 20}px)`;
    requestAnimationFrame(tick);
  })();
})();

// ===== SCROLL PROGRESS + NAV SHRINK =====
window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  const p = h > 0 ? (window.scrollY / h) * 100 : 0;
  const bar = document.getElementById('scroll-progress');
  if (bar) bar.style.width = p + '%';
  const nav = document.getElementById('navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== MOBILE MENU =====
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const ham  = document.getElementById('hamburger');
  if (!menu || !ham) return;
  menu.classList.toggle('open');
  const spans = ham.querySelectorAll('span');
  if (menu.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
}

// ===== QUOTE MODAL =====
function openModal() {
  document.getElementById('modal').classList.add('open');
}
function closeModal() {
  document.getElementById('modal').classList.remove('open');
}
document.addEventListener('DOMContentLoaded', () => {
  const m = document.getElementById('modal');
  if (m) m.addEventListener('click', e => { if (e.target === m) closeModal(); });
});

// ===== TOAST =====
function showToast(title, msg, icon = '✅') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  document.getElementById('toast-title').textContent = title;
  document.getElementById('toast-msg').textContent   = msg;
  const ic = document.getElementById('toast-icon');
  if (ic) ic.textContent = icon;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// ===== VALIDATION =====
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ===== SUBMIT QUOTE (modal) =====
function submitQuote() {
  const name   = document.getElementById('modal-name').value.trim();
  const email  = document.getElementById('modal-email').value.trim();
  const type   = document.getElementById('modal-type').value;
  if (!name)                { showToast('Missing Name','Enter your name.','⚠️'); return; }
  if (!validateEmail(email)){ showToast('Invalid Email','Enter a valid email.','⚠️'); return; }
  if (!type)                { showToast('Select Service','Choose a project type.','⚠️'); return; }

  setTimeout(() => {
    DB.saveQuote({ name, email, type,
      budget: document.getElementById('modal-budget').value,
      desc:   document.getElementById('modal-desc').value
    });
    closeModal();
    showToast('Quote Sent! 🎉','We\'ll reply with a proposal in 24 hours.');
    ['modal-name','modal-email','modal-desc'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('modal-type').value   = '';
    document.getElementById('modal-budget').value = '';
  }, 900);
}

// ===== NEWSLETTER =====
function subscribeNewsletter() {
  const emailEl = document.getElementById('newsletter-email');
  if (!emailEl) return;
  const email = emailEl.value.trim();
  if (!validateEmail(email)) { showToast('Invalid Email','Enter a valid email to subscribe.','⚠️'); return; }
  if (DB.subscribe(email)) {
    showToast('Subscribed! 💌','Welcome aboard. Great content incoming.');
    emailEl.value = '';
  } else {
    showToast('Already Subscribed','You\'re already on our list!','ℹ️');
  }
}

// ===== FAQ TOGGLE =====
function toggleFaq(el) {
  const item   = el.parentElement;
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!wasOpen) item.classList.add('open');
}

// ===== WORK FILTER =====
function filterWork(btn, cat) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active-filter'));
  btn.classList.add('active-filter');
  document.querySelectorAll('#work-grid .work-card').forEach(card => {
    const show = cat === 'all' || (card.dataset.cat || '').includes(cat);
    card.style.display   = show ? '' : 'none';
    if (show) card.style.animation = 'fadeUp 0.3s ease both';
  });
}

// ===== KEYBOARD ESC =====
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  closeModal();
  ['project-modal','blog-modal','legal-modal'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
  });
  const mm = document.getElementById('mobile-menu');
  if (mm) {
    mm.classList.remove('open');
    const ham = document.getElementById('hamburger');
    if (ham) ham.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

// ===== SCROLL REVEAL (simple IntersectionObserver) =====
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity    = '1';
        e.target.style.transform  = 'translateY(0)';
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.service-card, .work-card, .team-card, .testimonial-card, .blog-card, .pricing-card').forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
});
