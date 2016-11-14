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
                if (!speak) {
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
            'rate': getRateValue(),
            'voiceName': getVoice().replace('-', ' '),
            'pitch': calcPitch(),
            'volume': calcVolume(),
            requiredEventTypes: ['word', 'error', 'start', 'end'],
            desiredEventTypes: ['word', 'error', 'start', 'end'],
            onEvent: (event) => {
                console.log('Event ' + event.type + ' at position ' + event.charIndex);
                if (event.type == 'error') {
                    console.log('Error: ' + event.errorMessage);
                } else if (event.type == 'word') {
                    console.log('word event');
                }
            }
        }, () => {
            console.log('speak callbackk');
        });
}

function calcWpm(value) { return Math.round((value) * 250); }
function setRateValue(value) { localStorage.setItem('rateValue', value); }
function setSpeakOnClick(value) { localStorage.setItem('speakOnClick', value); }
function setSpeakOnSelect(value) { localStorage.setItem('speakOnSelect', value); }
function setButtonOnSelect(value) { setSpeakOnSelect(!value); }
function setVolume(value) { localStorage.setItem('volume', value); }
function setPitch(value) { localStorage.setItem('pitch', value); }
function setVoice(value) { localStorage.setItem('voice', value); }
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
function getVolume() {
    return parseFloat(localStorage.getItem('volume'));
}
function getPitch() {
    return parseFloat(localStorage.getItem('pitch'));
}
function getVoice() {
    return (localStorage.getItem('voice'));
}
function calcVolume(value) { return (getVolume() / 4); }
function calcPitch(value) { return (getPitch() / 4); }
function getButtonOnSelect() { return !getSpeakOnSelect(); }
function Init() {
    console.log('getRateValue() ' + getRateValue());
    if (getRateValue() == null || getRateValue() == undefined || isNaN(getRateValue())) {
        setRateValue('1.0');
    }
    console.log('getSpeakOnClick() ' + getSpeakOnClick());
    if (getSpeakOnClick() == null || getSpeakOnClick() == undefined) {
        setSpeakOnClick(true);
    }
    console.log('getSpeakOnSelect() ' + getSpeakOnSelect());
    if (getSpeakOnSelect() == null || getSpeakOnSelect() == undefined) {
        setSpeakOnSelect(true);
    }
    console.log('getVolume() ' + getVolume());
    if (getVolume() == null || getVolume() == undefined || isNaN(getVolume())) {
        setVolume('2.0');
    }
    console.log('getPitch() ' + getPitch());
    if (getPitch() == null || getPitch() == undefined || isNaN(getPitch())) {
        setPitch('4.0');
    }
    console.log('getVoice() ' + getVoice());
    if (getVoice() == null || getVoice() == undefined) {
        chrome.tts.getVoices((voices) => {
            setVoice(voices[0].voiceName.replace(' ', '-'));
        });
    }
}
chrome.runtime.onInstalled.addListener(details => {
    console.log('previousVersion', details.previousVersion);
    Init();
});
chrome.tabs.onUpdated.addListener(tabId => {
    chrome.pageAction.show(tabId);
});