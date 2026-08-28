const STORAGE_KEY = 'uniwish_items';

async function updateBadge() {
    try {
        const data = await chrome.storage.local.get({ [STORAGE_KEY]: [] });
        const count = data[STORAGE_KEY].length;
        await chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
        await chrome.action.setBadgeBackgroundColor({ color: '#6366F1' });
        await chrome.action.setBadgeTextColor({ color: '#FFFFFF' });
    } catch (e) { }
}

chrome.runtime.onInstalled.addListener(updateBadge);
chrome.runtime.onStartup.addListener(updateBadge);

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes[STORAGE_KEY]) {
        updateBadge();
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'UNIWISH_OPEN_DASHBOARD') {
        chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
        sendResponse({ ok: true });
    }
    return true;
});