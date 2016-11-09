chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.method == 'getSelection') {
        var text = getSelectionText();
        sendResponse({ data: text });
    } else if (request.method == 'getElementText') {
        sendResponse(getElementText(lastElmClicked));
    } else if (request.method == 'showSpeakButton') {
        ShowButton(lastMUpPosition);
        //sendResponse(getElementText(lastElmClicked));
    }
});
var lastElmClicked;
var lastMdownStamp;
var lastMUpPosition;
var lastSelection;
var speakButton;
document.addEventListener('mousedown', (e) => {
    e = e || window.event;
    lastElmClicked = e.target || e.srcElement;
    lastMdownStamp = new Date();
});
document.addEventListener('mouseup', (e) => {
    e = e || window.event;
    lastMUpPosition = {
        x: e.pageX,
        y: e.pageY
    }
    console.log(JSON.stringify(lastMUpPosition));
    var target = e.target || e.srcElement;
    if (target === speakButton)
        return;
    lastSelection = getSelectionText();
    if (lastSelection && lastSelection.length > 0) {
        SendSpeak(lastSelection, 'selectText');
    } else {
        var now = new Date();
        if (now - lastMdownStamp < 1500) { // Element clicked
            if (lastElmClicked === target) {
                SendSpeak(lastElmClicked, 'click');
            }
        } else if (SpeakableElement(target)) { // if Just clicked and speakable
            SendSpeak(target, 'click');
        }
        lastElmClicked = target;
    }
});
function SendSpeak(el, trigger) {
    var text;
    if (typeof el === 'string') {
        text = el;
    } else {
        text = getElementText(el);
    }
    if (text && !ContainsHTML(text)) {
        chrome.runtime.sendMessage({
            method: 'speak',
            text: text,
            trigger: trigger
        }, (response) => {
            if (response === 'showSpeakButton') {
                ShowButton(lastMUpPosition);
            }
        });
    }
}
function ContainsHTML(text) {
    var reg = new RegExp(/<[a-zA-Z](.*?[^?])?>/);
    return reg.test(text);
}
function SpeakableElement(target) {
    return target.tagName === 'P'
        || target.tagName === 'H1' || target.tagName === 'H2' || target.tagName === 'H3' || target.tagName === 'H4' || target.tagName === 'H5'
        || target.tagName === 'CITE' || target.tagName === 'BLOCKQUOTE'
        || target.tagName === 'LI' || target.tagName === 'TIME' || target.tagName === 'CODE' || target.tagName === 'STRONG'
        || (target.tagName === 'EM' && target.innerText.split(' ').length > 1)
        || target.tagName === 'DIV'
        || target.tagName === 'SPAN'
        || target.tagName === 'A';
}
function getSelectionText() {
    var text = '';
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != 'Control') {
        text = document.selection.createRange().text;
    }
    return text;
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
    if (!speakButton)
        speakButton = document.getElementById('speak-button');
    if (!speakButton) {
        speakButton = document.createElement('Button');
        speakButton.id = 'speak-button'
        speakButton.innerHTML = 'Speak';
        speakButton.onclick = () => {
            SendSpeak(lastSelection);
            HideButton();
        };
        document.body.appendChild(speakButton);
    }
    /*floater.style.left = rect.left + "px";
    floater.style.top = rect.top + "px";
    floater.style.position = "absolute";
    floater.style.float = "none";*/
    speakButton.style = `top:${y}px;left:${x}px;position:absolute;z-index: 9999;float:none`;
}
function HideButton() {
    if (!speakButton)
        speakButton = document.getElementById('speak-button');
    if (!speakButton) {
        speakButton = document.createElement('Button');
        speakButton.id = 'speak-button'
        speakButton.innerHTML = 'Speak';
        speakButton.onclick = () => {
            SendSpeak(lastSelection);
            HideButton();
        };
        document.body.appendChild(speakButton);
    }
    speakButton.style = 'visibility: hidden;';
}