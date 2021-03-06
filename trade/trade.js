import { KIITOS, LIVE, hasExpired } from "/login/fetch.mjs";
import { renderTradePage } from "./render/render.mjs";
import { god } from './robot/buddha.mjs';
import { TIME } from "./robot/tao.mjs";

let intervalID = null;

window.startAnalyzing = button => {
    button.disabled = true;
    document.getElementById('stop').disabled = false;
    intervalID = setInterval(async () => god('yin', await renderTradePage()), LIVE ? TIME.yin.INTERVAL*60*1000 : 1*1000);
}

window.stopAnalyzing = button => {
    button.disabled = true;
    document.getElementById('start').disabled = false;
    clearInterval(intervalID);
}

window.onload = async () => {
    if (hasExpired(localStorage.getItem('personal-refresh_last_update'), localStorage.getItem('personal-refresh_token_expires_in')) || hasExpired(localStorage.getItem('corporate-refresh_last_update'), localStorage.getItem('corporate-refresh_token_expires_in'))) {
        window.location.href = '/index.html';
    } else {
        localStorage.setItem('market', localStorage.getItem('market') || 0);
        document.getElementById(Number(localStorage.getItem('market')) ? 'market-bull' : 'market-bear').checked = true;
        document.getElementById('admin').style.backgroundColor = Number(localStorage.getItem('test')) ? 'red' : 'green';
        if (LIVE) document.getElementById('start').disabled = !KIITOS;

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