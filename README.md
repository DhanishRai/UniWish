# UniWish 🛍️

> **One universal wishlist for all your online shopping.** Stop keeping 50 tabs open or losing track of items across Amazon, Flipkart, Myntra, and random online stores.

UniWish is a privacy-first browser extension (Manifest V3) that lets you bookmark products, food items, and ideas from almost any store into a single organized wishlist.

---

## ✨ Features

- **One-Click Floating Heart**: A smooth floating action button (FAB) appears on product pages so you can save or remove items instantly.
- **Dedicated Store Scraping**: Built-in support & color-matched themes for:
  - **Shopping**: Amazon, Flipkart, Myntra, Meesho
  - **Food & Dining**: Swiggy, Zomato
  - **Inspiration**: Pinterest
- **Universal Smart Parser**: Auto-detects product titles, prices, original MRPs, and main images on *any* website using `JSON-LD` schemas & OpenGraph meta tags as a fallback.
- **Extension Popup**: Search through items, filter by store category, view product details, and add custom notes right from the toolbar.
- **Full Dashboard**: Expand into a clean, full-screen manager (`dashboard.html`) to manage large wishlists effortlessly.
- **Real-time Counter Badge**: Live item count updated directly on the extension toolbar icon.
- **100% Private**: Zero analytics, zero external servers. Everything is stored locally in your browser (`chrome.storage.local`).

---

## 🛠️ Installation

Since UniWish is currently loaded locally, you can install it into any Chromium-based browser (Chrome, Edge, Brave) or Firefox.

### Chrome / Brave / Edge
1. Clone or download this repository to your computer.
2. Open your browser and navigate to `chrome://extensions`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the `UniWish` directory.
5. Pin the extension to your toolbar for easy access!

### Firefox
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**.
3. Select `manifest.json` from the project directory.

---

## 📂 Project Structure

```text
UniWish/
├── manifest.json       # Extension configuration (Manifest V3)
├── background.js       # Service worker for badge counters & navigation
├── content.js          # Injected script: DOM scraping, schema parser & FAB heart button
├── content.css         # Styling for floating heart button & toast alerts
├── popup.html          # Extension popup UI
├── popup.js            # Popup logic: search, filter chips, item modal & notes
├── popup.css           # Styling for popup drawer
├── dashboard.html      # Full-page manager UI
├── dashboard.js        # Dashboard logic for viewing and managing saved items
├── dashboard.css       # Dashboard visual layout styles
└── icons/              # Extension icons
```

---

## 💡 How It Works

1. **Saving Items**: Visit any product page (e.g. Amazon, Flipkart, or any custom store). Click the floating heart at the bottom right corner of the page, or click **"Save Current Page"** inside the UniWish popup.
2. **Filtering & Searching**: Open the UniWish popup from your browser toolbar. Use search or filter chips (*All, Amazon, Flipkart, Myntra, Meesho, Food, Inspiration*) to quickly find saved items.
3. **Adding Personal Notes**: Click on any item card in the popup modal to edit price notes, size reminders, or gift ideas.
4. **Full Grid View**: Click the full-screen expansion icon in the popup header to open the dashboard manager in a full tab.

---

## 🔒 Privacy & Permissions

UniWish respects your privacy.
- `storage`: Required to save your wishlist items locally on your device.
- `activeTab` & `scripting`: Required to extract product title, price, and image when saving a page.
- `host_permissions: ["<all_urls>"]`: Enables item extraction across any shopping website you visit.
- **No telemetry, no tracking scripts, no remote servers.**

---

## 🤝 Contributing

Got ideas to support more store-specific parsers or improve price tracking? Feel free to fork the repository, make your tweaks, and submit a pull request!

---

## 📄 License

MIT License. Free to use and customize!
