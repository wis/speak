'use strict';
var rateRange;
var volumeRange;
var pitchRange;
var speakOnClickToggle;
var speakOnSelectToggle1;
var buttonOnSelectToggle2;
var selectVoice;
$(document).ready(() => {

    rateRange = $('#irate');
    volumeRange = $('#volume-range');
    pitchRange = $('#pitch-range');
    selectVoice = $('#voices-select');

    speakOnClickToggle = $('#speak-on-click');
    speakOnSelectToggle1 = $('#speak-on-select');
    buttonOnSelectToggle2 = $('#show-speak-button');
    Init();

    function updateStyles() {
        speakOnClickToggle.removeClass(getSpeakOnClick() ? 'off' : 'on');
        speakOnClickToggle.addClass(getSpeakOnClick() ? 'on' : 'off');

        speakOnSelectToggle1.removeClass(getSpeakOnSelect() ? 'off' : 'on');
        speakOnSelectToggle1.addClass(getSpeakOnSelect() ? 'on' : 'off');
        buttonOnSelectToggle2.removeClass(getButtonOnSelect() ? 'off' : 'on');
        buttonOnSelectToggle2.addClass(getButtonOnSelect() ? 'on' : 'off');
    }
    updateStyles();

    speakOnClickToggle.click(() => {
        setSpeakOnClick(!getSpeakOnClick());
        updateStyles();
    });
    speakOnSelectToggle1.click(() => {
        setSpeakOnSelect(!getSpeakOnSelect());
        updateStyles();

    });
    buttonOnSelectToggle2.click(() => {
        setButtonOnSelect(getSpeakOnSelect());
        updateStyles();
    });

    rateRange.val(getRateValue());
    pitchRange.val(getPitch());
    volumeRange.val(getVolume());
    selectVoice.val(getVoice());
    selectVoice.trigger('change');

    var wpm = $('#iwords');
    wpm.html(`${calcWpm(rateRange.val())}`);
    rateRange.on('input', () => {
        wpm.html(`${calcWpm(rateRange.val())}`);
        setRateValue(rateRange.val());
    });
    var pitchValue = $('#pitch-value');
    pitchValue.html(`${pitchRange.val()}`);
    pitchRange.on('input', () => {
        pitchValue.html(`${pitchRange.val()}`);
        setPitch(pitchRange.val());
    });
    var volumeValue = $('#volume-value');
    volumeValue.html(`${volumeRange.val()}`);
    volumeRange.on('input', () => {
        volumeValue.html(`${volumeRange.val()}`);
        setVolume(volumeRange.val());
    });
    selectVoice.on('input', () => {
        setVoice(selectVoice.val());
    });
});

function calcWpm(value) { return Math.round((value) * 250); }
function calcVolume(value) { return (value / 4); }
function calcPitch(value) { return (value / 4); }
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
function Init() {
    if (getRateValue() == null || getRateValue() == undefined) {
        setRateValue('1.0');
    }
    if (getSpeakOnClick() == null || getSpeakOnClick() == undefined) {
        setSpeakOnClick(true);
    }
    if (getSpeakOnSelect() == null || getSpeakOnSelect() == undefined) {
        setSpeakOnSelect(true);
    }
    if (getVolume() == null || getVolume() == undefined) {
        setVolume('2.0');
    }
    if (getPitch() == null || getPitch() == undefined) {
        setPitch('4.0');
    }
    chrome.tts.getVoices((voices) => {
        var voice = getVoice();
        if (voice == null || voice == undefined) {
            setVoice(voices[0].voiceName.replace(' ', '-'));
            voice = getVoice();
        }
        for (var i = 0; i < voices.length; i++) {
            selectVoice.append($('<option>', {
                selected : voice === voices[i].voiceName.replace(' ', '-'),
                value: voices[i].voiceName.replace(' ', '-'),
                text: `${i+1}\t${voices[i].voiceName.replace('Google','')}\t${voices[i].gender == 'female'  ? '👩♀' : '🚹♂' }`
            }));
        }
    });
}