function sort_tabs (tabs) {
    var compare = function (arg1, arg2) {
        if (arg1 == arg2) { return 0; }
        else { return arg1 > arg2 ? 1 : -1; }
    };
    var sorted_tabs = tabs.sort(function (tab1, tab2) {
        /* return compare(tab1.title.toUpperCase(), tab2.title.toUpperCase()); */
        return compare(tab1.url.toUpperCase(), tab2.url.toUpperCase());
    });
    for (var i = 0; i < sorted_tabs.length; i++) {
        chrome.tabs.move(sorted_tabs[i].id, {"index": i});
    }
}
function sort_all_tabs() {
    chrome.tabs.getAllInWindow(this.jstdata, sort_tabs);
}

sort_all_tabs();
