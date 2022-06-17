import { hasExpired } from "/login/fetch.mjs";
import { getOrders } from './tda.mjs';
import { analyzeStocks, renderTradePage } from './robot/god.mjs';

let intervalID = null;

window.startAnalyzing = () => {
    intervalID = setInterval(analyzeStocks, 15*60*1000);
}

window.stopAnalyzing = () => {
    clearInterval(intervalID);
}

window.onload = async () => {
    if (hasExpired(localStorage.getItem('refresh_last_update'), localStorage.getItem('refresh_token_expires_in'))) {
        window.location.href = '/index.html';
    } else {
        document.getElementById(Number(localStorage.getItem('test')) ? 'test-true' : 'test-false').checked = true;
        await renderTradePage();
        console.log(await getOrders());
    }
}

window.testMode = () => {
    localStorage.setItem('test', document.querySelector('input[name="test"]:checked').value);
}