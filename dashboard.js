'use strict';

const STORAGE_KEY = 'uniwish_items';
let items = [];
let currentFilter = 'all';
let searchQuery = '';

const grid = document.getElementById('dashGrid');
const search = document.getElementById('dashSearch');
const chips = document.getElementById('dashChips');

document.addEventListener('DOMContentLoaded', async () => {
    const data = await chrome.storage.local.get({ [STORAGE_KEY]: [] });
    items = data[STORAGE_KEY];
    render();

    search.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        render();
    });

    chips.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentFilter = chip.dataset.filter;
        render();
    });
});

function render() {
    grid.innerHTML = '';
    const filtered = items.filter(item => {
        const matchFilter = currentFilter === 'all' ||
            (currentFilter === 'food' ? ['swiggy', 'zomato'].includes(item.storeKey) :
                (currentFilter === 'others' ? !['amazon', 'flipkart', 'myntra', 'meesho', 'pinterest', 'swiggy', 'zomato'].includes(item.storeKey) : item.storeKey === currentFilter));
        const matchSearch = !searchQuery || (item.title || '').toLowerCase().includes(searchQuery);
        return matchFilter && matchSearch;
    });

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
      <img src="${item.image || 'icons/icon.png'}" class="card-img" onerror="this.src='icons/icon.png'" />
      <div class="card-body">
        <span class="card-store">${item.store}</span>
        <h3 class="card-title">${item.title}</h3>
        <div class="card-price">${item.price ? `${item.currency}${item.price}` : 'View Store'}</div>
        <div class="card-actions">
          <a href="${item.url}" target="_blank" class="btn btn-primary">Visit</a>
          <button class="btn btn-delete" data-id="${item.id}">Delete</button>
        </div>
      </div>
    `;
        card.querySelector('.btn-delete').addEventListener('click', async () => {
            items = items.filter(i => i.id !== item.id);
            await chrome.storage.local.set({ [STORAGE_KEY]: items });
            render();
        });
        grid.appendChild(card);
    });
}