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
        localStorage.setItem('market', localStorage.getItem('market') || 0);
        document.getElementById(Number(localStorage.getItem('market')) ? 'market-bull' : 'market-bear').checked = true;
        
        await renderTradePage();
        console.log(await getOrders());
    }
}

window.marketState = () => {
    localStorage.setItem('market', document.querySelector('input[name="market"]:checked').value);
}

window.logout = () => {
    localStorage.clear();
    window.location.href = "/index.html";
}