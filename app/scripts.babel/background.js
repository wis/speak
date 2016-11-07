'use strict';
chrome.runtime.onInstalled.addListener(details => {
    console.log('previousVersion', details.previousVersion);
    if (!getRateValue()) {
        setRateValue(1);
    }
});
chrome.commands.onCommand.addListener((command) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { method: 'getSelection' },
            (response) => {
                //chrome.tts.speak('speaking rate: ' + getRateValue(), { 'lang': 'en-US', 'rate': 1 });
                StartSpeaking(response.data);
            });
    });
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.method == 'speak') {
        StartSpeaking(request.text);
        sendResponse('ok');
    }
});

chrome.tabs.onUpdated.addListener(tabId => {
    chrome.pageAction.show(tabId);
});
chrome.contextMenus.create(
    {
        'type': 'normal',
        'title': 'Speak',
        'contexts': [/*'all', */'page', 'frame',
            'selection', 'link', 'editable',
            'image', /*'video', 'audio', */],
        'onclick': (info) => StartSpeaking(info)

    }
)
function StartSpeaking(info) {
    if (typeof info === 'string') {
        chrome.tts.speak(info,
            { 'lang': 'en-US', 'rate': getRateValue() });
    } else if (info.selectionText) {
        chrome.tts.speak(info.selectionText,
            { 'lang': 'en-US', 'rate': getRateValue() });
    } else {
        //var text = getContexedElementText();
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                method: 'getContexedElementText'
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
//function getContexedElementText() {}

function getRateValue() {
    console.log(localStorage.getItem('rateValue'));
    return parseFloat(localStorage.getItem('rateValue'));
}
function setRateValue(value) {
    console.log('rateValue', value);
    return localStorage.setItem('rateValue', value);
}