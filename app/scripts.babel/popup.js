'use strict';
$(document).ready(() => {
    Init();
    var rate = $('#irate');
    var speakOnClickToggle = $('#speak-on-click');
    var speakOnSelectToggle1 = $('#speak-on-select');
    var buttonOnSelectToggle2 = $('#show-speak-button');

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

    rate.val(getRateValue());
    var wpm = $('#iwords');
    wpm.html(`${calcWpm(rate.val())}`);
    rate.on('input', () => {
        wpm.html(`${calcWpm(rate.val())}`);
        setRateValue(rate.val());
    });
});

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