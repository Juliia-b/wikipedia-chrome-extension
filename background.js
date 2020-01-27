var selectedText;

//Get selected word on chrome page
function GetText() {
    chrome.tabs.executeScript(null, { "code": "window.getSelection().toString()" }, function(selection) {
        selectedText = selection[0]
    });
}

//Message channel with content.js
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    GetText();
    sendResponse({ selected: selectedText });
});