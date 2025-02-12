function sorter(tabs) {
    const startTime = performance.now();
    var compare = function(arg1, arg2) {
        if (arg1 == arg2) { return 0; }
        else { return arg1 > arg2 ? 1 : -1; }
    };
    var _normalize = function(url) {
        var x = url.replace("https://", "").replace("http://", "").toUpperCase();
        var i = x.indexOf('/');
        var s = x.substring(0, i - 1);
        var t = x.substring(i - 1, x.length);
        var parts = s.split(".");
        var company = parts[parts.length - 2];
        var tla = parts[parts.length - 1];
        return company + "." + tla + t ;
    };

    var normalized = {};
    var normalize = function(url) {
        var n = normalized[url];
        if (n === undefined) {
             n = _normalize(url);
             normalized[url] = n;
        }
        return n;
    };

    var sorted_tabs = tabs.sort(function (tab1, tab2) {
        var u1 = normalize(tab1.url);
        var u2 = normalize(tab2.url);
        return compare(u1, u2);
    });

    const elapsed = Math.floor(1000 * (performance.now() - startTime));
    const length = Object.keys(normalized).length;
    console.log(`Sorter: ${elapsed} ms / ${length} urls`);

    return sorted_tabs;
}

function unique(tabs) {
    const startTime = performance.now();

    // Get unique tabs by url in a dict.
    // var unique_tabs = {};
    var unique_tabs = new Set();
    var removes = [];
    var arr = [];
    for (const [i, tab] of tabs.entries()) {
        //if (unique_tabs[tab.url] === undefined) {
        //    // Tab url not present -- add it.
        //    unique_tabs[tab.url] = tab;
        //    arr.push(tab);
	//}
        if (unique_tabs.has(tab.url)) {
            // Add tab to list to be removed.
            removes.push(tab.id);
        }
	else {
            unique_tabs.add(tab.url);
            arr.push(tab);
	}
    }
    const elapsed = Math.floor(1000 * (performance.now() - startTime));
    const length = unique_tabs.size;
    console.log(`Find unique: ${elapsed} ms / ${length} urls`);

    if (removes.length > 0) {
        const startTime = performance.now();
        const length = removes.length;

        chrome.tabs.remove(removes);

        const elapsed = Math.floor(1000 * (performance.now() - startTime));
        console.log(`Remove unique: ${elapsed} ms / ${length} urls`);
    }

    // Return sorted unique tabs.
    return sorter(arr);
}

function reset_order(sorted_tabs) {
    for (const [i, t] of sorted_tabs.entries()) {
        chrome.tabs.move(t.id, {"index": i});
    }
}

function sort_tabs(tabs) {
    var sorted_tabs = sorter(tabs);
    reset_order(sorted_tabs);
}

function unique_tabs(tabs) {
    var unique_tabs = unique(tabs);
    reset_order(unique_tabs);
}

function sort_all_tabs() {
    chrome.tabs.query({}, sort_tabs);
}

function unique_all_tabs() {
    chrome.tabs.query({}, unique_tabs);
}

chrome.runtime.onMessage.addListener((msg, sender, response) => {
    if (msg.name === "sortMsg") {
        sort_all_tabs();
    }
    else if (msg.name === "uniqueMsg") {
        unique_all_tabs();
    }
});
