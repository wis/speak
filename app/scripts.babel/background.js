'use strict';
// on shortcut combination currently (CTRL+SHIFT+Z)
chrome.commands.onCommand.addListener((command) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { method: 'getSelection' },
            (response) => {
                StartSpeaking(response.data);
            });
    });
});
// Listen for Messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.method == 'speak') { //Message from Content Script
        var speak = true;
        switch (request.trigger) {
            case 'click':
                speak = getSpeakOnClick();
                break;
            case 'selectText':
                speak = getSpeakOnSelect();
                if(!speak)
                {
                    sendResponse('showSpeakButton');
                }
                break;
        }
        if (speak === true) {
            StartSpeaking(request.text);
        }
    }
});
// Create Context Menu Option 'Speak'
chrome.contextMenus.create(
    {
        'type': 'normal',
        'title': 'Speak',
        'contexts': ['page', 'frame', 'selection', 'link', 'editable', 'image'],
        'onclick': (ContextMenuClickinfo) => {
            StartSpeaking(ContextMenuClickinfo);
        }// Speak
    }
)
function StartSpeaking(info) {
    if (typeof info === 'string') {
        Speak(info);
    } else if (info.selectionText) {
        Speak(info.selectionText);
    } else {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                method: 'getElementText'
            },
                (response) => {
                    Speak(reponse);
                });
        });
    }
}
function Speak(text) {
    chrome.tts.speak(text,
        {
            'lang': 'en-US',
            'rate': getRateValue(),
            onEvent: (event) => {
                console.log('Event ' + event.type + ' at position ' + event.charIndex);
                if (event.type == 'error') {
                    Speak('Error: ' + event.errorMessage);
                }
            }
        });
}

function calcWpm(value) { return Math.round((value) * 250); }
function setRateValue(value) { localStorage.setItem('rateValue', value); }
function setSpeakOnClick(value) { localStorage.setItem('speakOnClick', value); }
function setSpeakOnSelect(value) { localStorage.setItem('speakOnSelect', value); }
function setButtonOnSelect(value) { setSpeakOnSelect(!value); }
function getRateValue() {
    return parseFloat(localStorage.getItem('rateValue'));
}
function getSpeakOnClick() {
    return JSON.parse(localStorage.getItem('speakOnClick'));
}
function getSpeakOnSelect() {
    return JSON.parse(localStorage.getItem('speakOnSelect'));
}
function getButtonOnSelect() { return !getSpeakOnSelect(); }
function Init() {
    if (getRateValue() == null || getRateValue() == undefined) {
        setRateValue(1.0);
    }
    if (getSpeakOnClick() == null || getSpeakOnClick() == undefined) {
        setSpeakOnClick(true);
    }
    if (getSpeakOnSelect() == null || getSpeakOnSelect() == undefined) {
        setSpeakOnSelect(true);
    }
}
chrome.runtime.onInstalled.addListener(details => {
    console.log('previousVersion', details.previousVersion);
    Init();
});
chrome.tabs.onUpdated.addListener(tabId => {
    chrome.pageAction.show(tabId);
});