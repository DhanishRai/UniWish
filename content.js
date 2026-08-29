(function () {
    'use strict';

    const STORAGE_KEY = 'uniwish_items';

    const STORE_THEMES = {
        amazon: { name: 'Amazon', color: '#FF9900', light: '#FFB84D' },
        flipkart: { name: 'Flipkart', color: '#2874F0', light: '#689EF8' },
        myntra: { name: 'Myntra', color: '#FF3F6C', light: '#FF7597' },
        meesho: { name: 'Meesho', color: '#9B2063', light: '#C44B8D' },
        pinterest: { name: 'Pinterest', color: '#E60023', light: '#FF4D66' },
        swiggy: { name: 'Swiggy', color: '#FC8019', light: '#FDA559' },
        zomato: { name: 'Zomato', color: '#E23744', light: '#EA6B76' },
        generic: { name: 'UniWish', color: '#6366F1', light: '#818CF8' }
    };

    function getStoreKey(host) {
        host = (host || location.hostname).toLowerCase();
        if (host.includes('amazon.')) return 'amazon';
        if (host.includes('flipkart.')) return 'flipkart';
        if (host.includes('myntra.')) return 'myntra';
        if (host.includes('meesho.')) return 'meesho';
        if (host.includes('pinterest.')) return 'pinterest';
        if (host.includes('swiggy.')) return 'swiggy';
        if (host.includes('zomato.')) return 'zomato';
        return 'generic';
    }

    const currentStore = getStoreKey();
    const theme = STORE_THEMES[currentStore];

    function text(el) {
        return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
    }

    function parsePrice(raw) {
        if (!raw) return null;
        const str = String(raw).trim();
        const curMatch = str.match(/[₹$€£¥]/) || (/\brs\.?\b/i.test(str) ? ['₹'] : null);
        const currency = curMatch ? curMatch[0] : '₹';
        const num = str.replace(/,/g, '').match(/(\d+(\.\d+)?)/);
        return num ? { currency, value: parseFloat(num[1]) } : null;
    }

    // Extract from JSON-LD Schema (Works across 90% of stores)
    function getJsonLd() {
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        for (const script of scripts) {
            try {
                const data = JSON.parse(script.textContent);
                const list = Array.isArray(data) ? data : (data['@graph'] || [data]);
                for (const item of list) {
                    if (item && (item['@type'] === 'Product' || (Array.isArray(item['@type']) && item['@type'].includes('Product')))) {
                        let offer = item.offers;
                        if (Array.isArray(offer)) offer = offer[0];
                        const p = offer?.price || offer?.lowPrice;
                        const cur = offer?.priceCurrency === 'INR' ? '₹' : (offer?.priceCurrency === 'USD' ? '$' : '₹');
                        let img = item.image;
                        if (Array.isArray(img)) img = img[0];
                        if (img && typeof img === 'object') img = img.url;
                        return {
                            title: item.name,
                            price: p ? { currency: cur, value: parseFloat(p) } : null,
                            image: img
                        };
                    }
                }
            } catch (e) { }
        }
        return null;
    }

    const parsers = {
        amazon() {
            const title = text(document.querySelector('#productTitle') || document.querySelector('#title'));
            // Comprehensive Amazon price selectors
            const priceEl = document.querySelector('.priceToPay span.a-price-whole') ||
                document.querySelector('.a-price .a-offscreen') ||
                document.querySelector('#corePrice_feature_div .a-offscreen') ||
                document.querySelector('#corePriceDisplay_desktop_feature_div .a-offscreen') ||
                document.querySelector('#priceblock_ourprice') ||
                document.querySelector('#priceblock_dealprice');
            const origEl = document.querySelector('.basisPrice .a-offscreen') ||
                document.querySelector('#corePriceDisplay_desktop_feature_div .a-text-price .a-offscreen');
            const img = document.querySelector('#landingImage') || document.querySelector('#imgTagWrapperId img') || document.querySelector('#main-image');
            return {
                title,
                price: parsePrice(text(priceEl)),
                orig: parsePrice(text(origEl)),
                image: img?.src || '',
                category: 'Shopping'
            };
        },
        flipkart() {
            const title = text(document.querySelector('span.B_NuCI') || document.querySelector('.Nx9bqj + div') || document.querySelector('h1'));
            const priceEl = document.querySelector('.Nx9bqj.CxhGGd') || document.querySelector('.Nx9bqj') || document.querySelector('._30jeq3._16Jk6d');
            const origEl = document.querySelector('.yRaY8j.A68knd') || document.querySelector('.yRaY8j') || document.querySelector('._3I9_wc');
            const img = document.querySelector('img._396cs4') || document.querySelector('img.DByuf4') || document.querySelector('img._2r_T1I');
            return {
                title,
                price: parsePrice(text(priceEl)),
                orig: parsePrice(text(origEl)),
                image: img?.src || '',
                category: 'Shopping'
            };
        },
        myntra() {
            const brand = text(document.querySelector('.pdp-title'));
            const name = text(document.querySelector('.pdp-name'));
            const title = [brand, name].filter(Boolean).join(' - ') || text(document.querySelector('h1'));
            const priceEl = document.querySelector('.pdp-price strong') || document.querySelector('.pdp-price');
            const origEl = document.querySelector('.pdp-mrp s') || document.querySelector('.pdp-mrp');
            const img = document.querySelector('.image-grid-imageContainer img');
            return {
                title,
                price: parsePrice(text(priceEl)),
                orig: parsePrice(text(origEl)),
                image: img?.src || '',
                category: 'Fashion'
            };
        },
        meesho() {
            const title = text(document.querySelector('h1'));
            const priceEl = document.querySelector('h4') || document.querySelector('span[class*="Price"]');
            const img = document.querySelector('img[src*="meesho.com"]');
            return { title, price: parsePrice(text(priceEl)), orig: null, image: img?.src || '', category: 'Shopping' };
        },
        pinterest() {
            const title = document.querySelector('meta[property="og:title"]')?.content || text(document.querySelector('h1'));
            const img = document.querySelector('meta[property="og:image"]')?.content || document.querySelector('div[data-test-id="pin-closeup-image"] img')?.src;
            return { title, price: null, orig: null, image: img || '', category: 'Inspiration' };
        },
        swiggy() {
            const title = text(document.querySelector('h1'));
            const costEl = Array.from(document.querySelectorAll('span, div')).find(e => /₹\s?\d+.*for two/i.test(text(e)));
            const img = document.querySelector('img[src*="swiggy"]');
            return { title, price: parsePrice(text(costEl)), orig: null, image: img?.src || '', category: 'Food' };
        },
        zomato() {
            const title = text(document.querySelector('h1'));
            const costEl = Array.from(document.querySelectorAll('span, div, p')).find(e => /₹\s?\d+.*for two/i.test(text(e)));
            const img = document.querySelector('img[src*="zomato"]');
            return { title, price: parsePrice(text(costEl)), orig: null, image: img?.src || '', category: 'Food' };
        }
    };

    function extractProduct() {
        const siteData = (parsers[currentStore] ? parsers[currentStore]() : {}) || {};
        const ld = getJsonLd() || {};
        const ogTitle = document.querySelector('meta[property="og:title"]')?.content;
        const ogImg = document.querySelector('meta[property="og:image"]')?.content;
        const ogPrice = document.querySelector('meta[property="product:price:amount"]')?.content;

        const title = siteData.title || ld.title || ogTitle || document.title || 'Product';
        const price = siteData.price || ld.price || parsePrice(ogPrice);
        const orig = siteData.orig || null;
        const image = siteData.image || ld.image || ogImg || document.querySelector('img')?.src || '';

        return {
            id: 'uw_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
            title: title.slice(0, 200),
            price: price ? price.value : null,
            currency: price ? price.currency : '₹',
            originalPrice: orig ? orig.value : null,
            image,
            url: location.href,
            store: theme.name,
            storeKey: currentStore,
            storeColor: theme.color,
            favicon: `https://www.google.com/s2/favicons?sz=64&domain=${location.hostname}`,
            category: siteData.category || 'General',
            note: '',
            dateAdded: Date.now() // Persists the exact date & timestamp
        };
    }

    async function getStoredItems() {
        const data = await chrome.storage.local.get({ [STORAGE_KEY]: [] });
        return data[STORAGE_KEY];
    }

    async function toggleCurrent() {
        const items = await getStoredItems();
        const idx = items.findIndex(i => i.url === location.href);
        let saved = false;

        if (idx > -1) {
            items.splice(idx, 1);
            saved = false;
        } else {
            items.unshift(extractProduct());
            saved = true;
        }

        // Saved to chrome.storage.local (never deletes unless user deletes)
        await chrome.storage.local.set({ [STORAGE_KEY]: items });
        return saved;
    }

    function injectFab() {
        if (document.getElementById('uniwish-fab') || window.top !== window.self) return;

        const fab = document.createElement('button');
        fab.id = 'uniwish-fab';
        fab.style.setProperty('--uw-accent', theme.color);
        fab.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
        document.documentElement.appendChild(fab);

        getStoredItems().then(items => {
            fab.classList.toggle('saved', items.some(i => i.url === location.href));
        });

        fab.addEventListener('click', async () => {
            const saved = await toggleCurrent();
            fab.classList.toggle('saved', saved);
            showToast(saved ? 'Saved to UniWish' : 'Removed from UniWish');
        });
    }

    function showToast(msg) {
        let toast = document.getElementById('uniwish-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'uniwish-toast';
            document.documentElement.appendChild(toast);
        }
        toast.textContent = msg;
        toast.style.setProperty('--uw-accent', theme.color);
        toast.classList.add('show');
        clearTimeout(toast._t);
        toast._t = setTimeout(() => toast.classList.remove('show'), 2000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectFab);
    } else {
        injectFab();
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'UNIWISH_GET_PAGE_INFO') {
            getStoredItems().then(items => {
                sendResponse({
                    storeKey: currentStore,
                    storeName: theme.name,
                    storeColor: theme.color,
                    storeLight: theme.light,
                    url: location.href,
                    saved: items.some(i => i.url === location.href)
                });
            });
            return true;
        }
        if (message.type === 'UNIWISH_TOGGLE_SAVE') {
            toggleCurrent().then(saved => {
                const fab = document.getElementById('uniwish-fab');
                if (fab) fab.classList.toggle('saved', saved);
                sendResponse({ saved });
            });
            return true;
        }
    });
})();