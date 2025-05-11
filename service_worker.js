function _normalize(url) {
    const x = url.replace("https://", "").replace("http://", "").toUpperCase();
    const i = x.indexOf('/');
    const s = x.substring(0, i - 1);
    const t = x.substring(i - 1, x.length);
    const parts = s.split(".");
    const company = parts[parts.length - 2];
    const tla = parts[parts.length - 1];
    //return company + "." + tla + t ;
    return `${company}.${tla}${t}`;
}

async function sorter(tabs) {
    const startTime = performance.now();

    // Precompute all normalized values
    const tabsWithNormalized = tabs.map(tab => {
        return { "tab": tab, "normalized": _normalize(tab.url) };
    });

    // Sort with precomputed values
    tabsWithNormalized.sort((a, b) => a.normalized.localeCompare(b.normalized));

    const sorted_tabs = tabsWithNormalized.map(t => t.tab);

    const endTime = performance.now();
    const elapsed = Math.floor(1000 * (endTime - startTime));
    console.log(`Sorter: ${elapsed} ms`);

    return sorted_tabs;
}


async function unique(tabs) {
    // Get unique tabs by url in a dict.
    const seen = new Map();
    const keeps = [];
    const removes = [];

    {
    const startTime1 = performance.now();

    for (const tab of tabs) {
        if (seen.has(tab.url)) {
            removes.push(tab.id);
        } else {
            seen.set(tab.url, true);
            keeps.push(tab);
        }
    }
    const endTime1 = performance.now();

    const elapsed1 = Math.floor(1000 * (endTime1 - startTime1));
    console.log(`Find unique: ${elapsed1} ms`);
    console.log(`startTime1: ${startTime1}`);
    console.log(`endTime1: ${endTime1}`);
    }

    if (removes.length > 0) {
        const startTime2 = performance.now();
        await chrome.tabs.remove(removes);
        const endTime2 = performance.now();

        const elapsed2 = Math.floor(1000 * (endTime2 - startTime2));
        console.log(`Remove unique: ${elapsed2} ms / ${removes.length} urls`);
    console.log(`startTime2: ${startTime2}`);
    console.log(`endTime2: ${endTime2}`);
    }

    // Return sorted unique tabs.
    const x = await sorter(keeps);
    return x;
}

async function reset_order(sorted_tabs) {
    for (const [i, t] of sorted_tabs.entries()) {
        await chrome.tabs.move(t.id, {"index": i});
     }
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
