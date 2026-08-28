'use strict';

const STORAGE_KEY = 'uniwish_items';

const STORE_THEMES = {
    amazon: { color: '#FF9900', light: '#FFB84D' },
    flipkart: { color: '#2874F0', light: '#689EF8' },
    myntra: { color: '#FF3F6C', light: '#FF7597' },
    meesho: { color: '#9B2063', light: '#C44B8D' },
    pinterest: { color: '#E60023', light: '#FF4D66' },
    swiggy: { color: '#FC8019', light: '#FDA559' },
    zomato: { color: '#E23744', light: '#EA6B76' },
    generic: { color: '#6366F1', light: '#818CF8' }
};

let allItems = [];
let activeFilter = 'all';
let searchKeyword = '';
let activeItemId = null;

const els = {
    storeLabel: document.getElementById('storeLabel'),
    saveTabBtn: document.getElementById('saveTabBtn'),
    fullscreenBtn: document.getElementById('fullscreenBtn'),
    searchInput: document.getElementById('searchInput'),
    chips: document.getElementById('chipsContainer'),
    grid: document.getElementById('itemsGrid'),
    empty: document.getElementById('emptyState'),
    modalOverlay: document.getElementById('modalOverlay'),
    modalClose: document.getElementById('modalClose'),
    modalImg: document.getElementById('modalImg'),
    modalStore: document.getElementById('modalStore'),
    modalTitle: document.getElementById('modalTitle'),
    modalPrice: document.getElementById('modalPrice'),
    modalOrig: document.getElementById('modalOrig'),
    modalNote: document.getElementById('modalNote'),
    modalLink: document.getElementById('modalLink'),
    modalDelete: document.getElementById('modalDelete')
};

document.addEventListener('DOMContentLoaded', async () => {
    setupListeners();
    await inspectTab();
    await loadData();
});

async function inspectTab() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) return;
        chrome.tabs.sendMessage(tab.id, { type: 'UNIWISH_GET_PAGE_INFO' }, (res) => {
            if (chrome.runtime.lastError || !res) return;
            const t = STORE_THEMES[res.storeKey] || STORE_THEMES.generic;
            document.documentElement.style.setProperty('--uw-accent', t.color);
            document.documentElement.style.setProperty('--uw-accent-light', t.light);
            els.storeLabel.textContent = res.storeName !== 'UniWish' ? `Shopping on ${res.storeName}` : 'Universal Wishlist';
            els.saveTabBtn.classList.toggle('active', res.saved);
        });
    } catch (e) { }
}

async function loadData() {
    const data = await chrome.storage.local.get({ [STORAGE_KEY]: [] });
    allItems = data[STORAGE_KEY];
    render();
}

function render() {
    let list = allItems.filter(item => {
        const matchFilter = activeFilter === 'all' ||
            (activeFilter === 'food' ? ['swiggy', 'zomato'].includes(item.storeKey) :
                (activeFilter === 'others' ? !['amazon', 'flipkart', 'myntra', 'meesho', 'pinterest', 'swiggy', 'zomato'].includes(item.storeKey) : item.storeKey === activeFilter));
        const matchSearch = !searchKeyword || (item.title || '').toLowerCase().includes(searchKeyword);
        return matchFilter && matchSearch;
    });

    els.grid.innerHTML = '';
    els.empty.hidden = list.length > 0;

    list.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
      <img src="${item.image || ''}" class="card-img" onerror="this.src='icons/icon.png'" />
      <div class="card-info">
        <div class="card-title">${item.title}</div>
        <div class="card-price">${item.price ? (item.currency + item.price) : 'View Item'}</div>
      </div>
    `;
        card.addEventListener('click', () => openModal(item));
        els.grid.appendChild(card);
    });
}

function openModal(item) {
    activeItemId = item.id;
    els.modalImg.src = item.image || 'icons/icon.png';
    els.modalStore.textContent = item.store;
    els.modalTitle.textContent = item.title;
    els.modalPrice.textContent = item.price ? `${item.currency}${item.price}` : 'Price not detected';
    els.modalOrig.textContent = item.originalPrice ? `${item.currency}${item.originalPrice}` : '';
    els.modalNote.value = item.note || '';
    els.modalLink.href = item.url;
    els.modalOverlay.hidden = false;
}

function setupListeners() {
    els.saveTabBtn.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) return;
        chrome.tabs.sendMessage(tab.id, { type: 'UNIWISH_TOGGLE_SAVE' }, async (res) => {
            if (res) {
                els.saveTabBtn.classList.toggle('active', res.saved);
                await loadData();
            }
        });
    });

    els.fullscreenBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
    });

    els.searchInput.addEventListener('input', (e) => {
        searchKeyword = e.target.value.toLowerCase().trim();
        render();
    });

    els.chips.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeFilter = chip.dataset.filter;
        render();
    });

    els.modalClose.addEventListener('click', () => { els.modalOverlay.hidden = true; });
    els.modalNote.addEventListener('input', async () => {
        const item = allItems.find(i => i.id === activeItemId);
        if (item) {
            item.note = els.modalNote.value;
            await chrome.storage.local.set({ [STORAGE_KEY]: allItems });
        }
    });

    els.modalDelete.addEventListener('click', async () => {
        allItems = allItems.filter(i => i.id !== activeItemId);
        await chrome.storage.local.set({ [STORAGE_KEY]: allItems });
        els.modalOverlay.hidden = true;
        render();
    });
}