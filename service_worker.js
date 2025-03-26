function _normalize(urlObj) {
    try {
        const hostParts = urlObj.hostname.toUpperCase().split('.');
        const domain = hostParts.slice(-2).join('.');
        return domain + urlObj.pathname.toUpperCase();
    } catch {
        const url = urlObj.url;
        return url.toUpperCase();
    }
}


async function sorter(tabs) {
    const startTime = performance.now();
    const normalizedMap = new Map();

    // Precompute all normalized values
    const tabsWithNormalized = tabs.map(tab => {
        const url = tab.url;
        if (!normalizedMap.has(url)) {
            normalizedMap.set(url, _normalize(url));
        }
        return { tab, normalized: normalizedMap.get(url) };
    });

    // Sort with precomputed values
    tabsWithNormalized.sort((a, b) => a.normalized.localeCompare(b.normalized));

    const sorted_tabs = tabsWithNormalized.map(t => t.tab);

    const elapsed = Math.floor(1000 * (performance.now() - startTime));
    console.log(`Sorter: ${elapsed} ms`);

    return sorted_tabs;
}


async function unique(tabs) {
    const startTime = performance.now();

    // Get unique tabs by url in a dict.
    const seen = new Map();
    const keeps = [];
    const removes = [];

    for (const tab of tabs) {
        if (seen.has(tab.url)) {
            removes.push(tab.id);
        } else {
            seen.set(tab.url, true);
            keeps.push(tab);
        }
    }

    const elapsed = Math.floor(1000 * (performance.now() - startTime));
    console.log(`Find unique: ${elapsed} ms`);

    if (removes.length > 0) {
        const startTime = performance.now();
        const length = removes.length;

        await chrome.tabs.remove(removes);

        const elapsed = Math.floor(1000 * (performance.now() - startTime));
        console.log(`Remove unique: ${elapsed} ms / ${length} urls`);
    }

    // Return sorted unique tabs.
    var x = await sorter(arr);
    return x;
}

async function reset_order(sorted_tabs) {
    const tabIds = sorted_tabs.map(t => t.id);
    await chrome.tabs.move(tabIds, { index: 0 });
}

async function sort_tabs(tabs) {
    var sorted_tabs = await sorter(tabs);
    await reset_order(sorted_tabs);
}

async function unique_tabs(tabs) {
    var unique_tabs = await unique(tabs);
    await reset_order(unique_tabs);
}

async function sort_all_tabs() {
    await chrome.tabs.query({}, sort_tabs);
}

async function unique_all_tabs() {
    await chrome.tabs.query({}, unique_tabs);
}

chrome.runtime.onMessage.addListener((msg, sender, response) => {
    if (msg.name === "sortMsg") {
        sort_all_tabs();
    }
    else if (msg.name === "uniqueMsg") {
        unique_all_tabs();
    }
});
