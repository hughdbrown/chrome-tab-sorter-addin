document.querySelector('button.sort').addEventListener('click', function(){
    chrome.runtime.sendMessage({"name": "sortMsg"});
});

document.querySelector('button.unique').addEventListener('click', function(){
    chrome.runtime.sendMessage({"name": "uniqueMsg"});
});

