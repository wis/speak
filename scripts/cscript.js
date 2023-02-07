var prevElmClicked;
var prevMdownStamp;
var prevMUpPosition;
var prevSelection;
var speakButton;
var prevSelectedElm;
window.onload = CreateButtonElement;
document.addEventListener('mousedown', (e) => {
    e = e || window.event;
    prevElmClicked = e.target || e.srcElement;
    prevMdownStamp = new Date();
});
document.addEventListener('mouseup', (e) => {
    e = e || window.event;
    var target = e.target || e.srcElement;
    if (target === speakButton)
        return;
    prevMUpPosition = {
        x: e.pageX + 10,
        y: e.pageY + 10
    }
    prevSelection = getSelectionText();
    //prevSelectedElm = prevSelectedElm.parentNode;
    if (prevSelection && prevSelection.length > 0) {
        if (target === prevSelectedElm) {
            SendSpeak(prevSelection, 'selectText');
        }
    } else {
        var now = new Date();
        if (now - prevMdownStamp < 1500) { // Element clicked
            if (prevElmClicked === target) {
                SendSpeak(prevElmClicked, 'click');
            }
        } else { // if Just clicked and speakable
            SendSpeak(target, 'click');
        }
    }
    prevElmClicked = target;
});
function SendSpeak(el, trigger) {
    var text;
    if (typeof el === 'string') {
        text = el;
    } else {
        text = getElementText(el);
    }
    text = text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, ':,(a url),');
    text = NormalizeHTML(text);
    if (text /*&& !ContainsHTML(text)*/) {
        chrome.runtime.sendMessage({
            method: 'speak',
            text: text,
            trigger: trigger
        }, (response) => {
            if (response === 'showSpeakButton') {
                ShowButton(prevMUpPosition);
            }
        });
    }
}
function NormalizeHTML(text) {
    //<[a-zA-Z](.*?[^?])?>.+<\/[a-zA-Z](.*?[^?])?>
    var reg1 = new RegExp(/(<[a-zA-Z|-](.*?[^?])?>.+<\/[a-zA-Z|-](.*?[^?])?>)/g);
    text = text.replace(reg1, '');
    var reg = new RegExp(/<([a-zA-Z|-](.*?[^?])?)>/g);
    return text.replace(reg, '$1');
}
function getSelectionText() {
    var text = '';
    var selection = window.getSelection();
    text = selection.toString();
    try {
        prevSelectedElm = selection.anchorNode.parentNode;

    } catch (error) {
        prevSelectedElm = selection.anchorNode;
    }
    text = text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, ':,(a url),');
    return text.trim();
}
function getElementText(el) {
    var text;
    if (el.tagName === 'A') {
        text = !el.innerText.startsWith('http') ?
            el.innerText ?
                el.innerText : el.alt ?
                    el.alt : el.title ?
                        el.title : el.innerHTML
            : undefined;
    } else {
        text = el.alt ? el.alt
            : el.title ? el.title
                : el.innerText ? el.innerText
                    : el.innerHTML;
    }
    return text;
}
function ShowButton(x, y) {
    if (arguments.length == 1 || !y) {
        y = x.y;
        x = x.x;
    }
    speakButton.style = `top:${y}px;left:${x}px;position:absolute;z-index: 9999;float:none`;
}
function HideButton() {
    speakButton.style = 'visibility: hidden;';
}
function CreateButtonElement() {
    speakButton = document.createElement('Button');
    speakButton.id = 'speak-button'
    speakButton.innerHTML = 'Speak';
    speakButton.onclick = () => {
        SendSpeak(prevSelection);
        HideButton();
    };
    document.body.appendChild(speakButton);
    HideButton();
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.method == 'getSelection') {
        var text = getSelectionText();
        sendResponse({ data: text });
    } else if (request.method == 'getElementText') {
        sendResponse(getElementText(prevElmClicked));
    }
});