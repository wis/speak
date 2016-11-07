
function getSelectionText() {
    var text = '';
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != 'Control') {
        text = document.selection.createRange().text;
    }
    return text;
}
function getOtherText(el) {
    var text;
    if (el.tagName === 'A') {
        text = el.innerText ? el.innerText :
            el.alt ? el.alt :
                el.title ? el.title : el.innerHTML;
    } else {
        text = el.alt ? el.alt
            : el.title ? el.title
                : el.innerText ? el.innerText
                    : el.innerHTML;
    }
    return text;
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.method == 'getSelection') {
        var text = getSelectionText();
        sendResponse({ data: text });
    } else if (request.method == 'getContexedElementText') {
        sendResponse(getOtherText(lastElmClicked));
    }
});


document.addEventListener('mousedown', (e) => {
    e = e || window.event;
    lastElmClicked = e.target || e.srcElement;
    lastMdownStamp = new Date();
});


document.addEventListener('mouseup', (e) => {
    e = e || window.event;
    var text = getSelectionText();
    if (text && text.length > 0) {
        SendSpeak(text);
    } else {
        var target = e.target || e.srcElement;
        var now = new Date();
        if (now - lastMdownStamp < 1500) {
            if (lastElmClicked === target) {
                SendSpeak(lastElmClicked);
            }
        } else if (target.tagName === 'P'
            || target.tagName === 'H1' || target.tagName === 'H2' || target.tagName === 'H3' || target.tagName === 'H4' || target.tagName === 'H5'
            || target.tagName === 'SPAN' || target.tagName === 'CITE' || target.tagName === 'BLOCKQUOTE'
            || target.tagName === 'LI' || target.tagName === 'TIME' || target.tagName === 'CODE' || target.tagName === 'STRONG'
            || (target.tagName === 'EM' && target.innerText.split(' ').length > 1)
            || (target.tagName === 'DIV' && target.innerHTML.indexOf('<') == -1)) {
            SendSpeak(target);
        }
        lastElmClicked = target;
    }
});

function SendSpeak(el) {
    var text;
    if (typeof el === 'string') {
        text = el;
    } else {
        text = getOtherText(el);
    }
    if (text && text.indexOf('<') == -1) {
        chrome.runtime.sendMessage({
            method: 'speak',
            text: text
        });
    }
}

var lastElmClicked;
var lastMdownStamp;
