document.querySelector('button.ext#sort').addEventListener('click', function(){
    chrome.runtime.sendMessage({"name": "sortMsg"});
});

document.querySelector('button.ext#unique').addEventListener('click', function(){
    chrome.runtime.sendMessage({"name": "uniqueMsg"});
});

