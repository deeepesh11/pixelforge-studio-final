# PixelForge Studio 🚀
**Creative Web Development Agency Website**

A fully working, multi-page agency website with a simulated backend using localStorage.

---

## 📁 Folder Structure

```
pixelforge-studio/
├── index.html              ← Home Page
├── css/
│   └── style.css           ← All styles (shared across pages)
├── js/
│   └── main.js             ← All JavaScript & backend logic
├── pages/
│   ├── services.html       ← Services + Pricing + FAQ
│   ├── work.html           ← Portfolio with filter tabs
│   ├── about.html          ← Team + Tech Stack
│   ├── blog.html           ← Blog articles
│   ├── contact.html        ← Contact form
│   ├── privacy.html        ← Privacy Policy
│   └── terms.html          ← Terms of Service
└── README.md
```

---

## ✅ Features

### Frontend
- 7 fully linked pages with shared navigation
- Custom animated cursor
- Scroll progress bar
- Floating hero cards with CSS animations
- Scrolling marquee ticker
- Service cards, work portfolio with filter tabs
- Pricing cards (Starter / Pro / Enterprise)
- FAQ accordion
- Team grid & tech stack badges
- Blog cards with article modals
- Contact form with full validation
- Toast notifications for all actions
- Fully responsive + hamburger mobile menu

### Backend (localStorage simulation)
All form data is saved to the browser's localStorage:
- **Contact form** → saved to `pf_contacts`
- **Quote modal** → saved to `pf_quotes`
- **Newsletter** → saved to `pf_subs`

To view saved data, open browser DevTools → Application → Local Storage.

---

## 🚀 How to Run

### Option 1: Open directly
Just open `index.html` in your browser. No server needed.

### Option 2: Live server (recommended)
```bash
# If you have Node.js installed:
npx serve .

# Or with Python:
python -m http.server 8000
```
Then visit: `http://localhost:8000`

---

## 📤 Deploy to GitHub Pages (Free Hosting)

1. Create a new repo on github.com
2. Upload all files
3. Go to Settings → Pages → Select `main` branch
4. Your site will be live at:
   `https://YOUR_USERNAME.github.io/pixelforge-studio`

---

## 🛠 Customization

- **Colors**: Edit CSS variables at the top of `css/style.css`
- **Content**: Edit text directly in the HTML files
- **Logo**: Change `PIXEL<span>FORGE</span>` in each nav
- **Contact info**: Update in `pages/contact.html`
- **Pricing**: Update in `pages/services.html`

---

© 2026 PixelForge Studio
