'use strict';
function calcWpm(value) {
    return Math.round((value) * 250);
}
function getRateValue() {
    console.log(localStorage.getItem('rateValue'));
    return parseFloat(localStorage.getItem('rateValue'));
}
function setRateValue(value) {
    console.log('rateValue', value);
    return localStorage.setItem('rateValue', value);
}
document.addEventListener('DOMContentLoaded', () => {
    var rateElm = document.getElementById('irate');
    rateElm.value = getRateValue();
    var wpmElm = document.getElementById('iwords');
    wpmElm.innerHTML = `${calcWpm(rateElm.value)}`;

    rateElm.oninput = (e) => {
        wpmElm.innerHTML = `${calcWpm(rateElm.value)}`;
        setRateValue(e.target.value);

    };
});