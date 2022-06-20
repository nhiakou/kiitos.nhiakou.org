import { hasExpired } from "/login/fetch.mjs";
import { analyzeStocks, renderTradePage } from './robot/god.mjs';

let intervalID = null;

window.startAnalyzing = () => {
    intervalID = setInterval(analyzeStocks, 1*1000); // 15*60*1000
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
        document.getElementById('admin').style.textDecorationLine = Number(localStorage.getItem('test')) ? 'none' : 'line-through';

        marketState();
        await renderTradePage();
    }
}

window.marketState = () => {
    const state = document.querySelector('input[name="market"]:checked');
    localStorage.setItem('market', state.value);
    document.querySelectorAll('.market').forEach(button => button.style.display = 'none');
    document.querySelectorAll(Number(state.value) ? '.bull' : '.bear').forEach(button => button.style.display = 'block');
}

window.showMarginPosition = select => {
    document.querySelectorAll('.margin').forEach(position => position.style.display = 'none');
    document.getElementById(select.value).style.display = 'block';
}

window.logout = () => {
    localStorage.clear();
    window.location.href = "/index.html";
}