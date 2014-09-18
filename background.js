function sorter(tabs) {
    var compare = function(arg1, arg2) {
        if (arg1 == arg2) { return 0; }
        else { return arg1 > arg2 ? 1 : -1; }
    };
    var normalize = function(url) {
        var x = url.replace("https://", "").replace("http://", "").toUpperCase();
        var i = x.indexOf('/');
        var s = x.substring(0, i - 1);
        var t = x.substring(i - 1, x.length);
        var parts = s.split(".");
        var company = parts[parts.length - 2];
        var tla = parts[parts.length - 1];
        return company + "." + tla + t ;
    };
    var sorted_tabs = tabs.sort(function (tab1, tab2) {
        var u1 = normalize(tab1.url);
        var u2 = normalize(tab2.url);
        return compare(u1, u2);
    });
    return sorted_tabs;
}

function unique(tabs) {
    // Get unique tabs by url in a dict.
    var unique_tabs = {};
    var removes = [];
    var arr = [];
    for (var i = 0; i < tabs.length; i++) {
        var tab = tabs[i];
        if (unique_tabs[tab.url] === undefined) {
            // Tab url not present -- add it.
            unique_tabs[tab.url] = tab;
            arr.push(tab);
	}
	else {
	    // Add tab to list to be removed.
	    removes.push(tab.id);
	}
    }
    chrome.tabs.remove(removes);

    // Return sorted unique tabs.
    return sorter(arr);
}

function reset_order(sorted_tabs) {
    for (var i = 0; i < sorted_tabs.length; i++) {
        chrome.tabs.move(sorted_tabs[i].id, {"index": i});
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
    chrome.tabs.getAllInWindow(this.jstdata, sort_tabs);
}

function unique_all_tabs() {
    chrome.tabs.getAllInWindow(this.jstdata, unique_tabs);
}

/*sort_all_tabs();*/
unique_all_tabs();
