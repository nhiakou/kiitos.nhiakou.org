import { hasExpired } from "/login/fetch.mjs";
import { createNatalChart, renderAstro } from './render/astro.mjs';
import { getTDA } from './tda.mjs';
import { renderAccount } from './render/account.mjs';
import { renderSummary } from './render/summary.mjs';

window.onload = async () => {
  if (hasExpired(localStorage.getItem('corporate-refresh_last_update'), localStorage.getItem('corporate-refresh_token_expires_in'))) {
    window.location.href = '/index.html';
  } else {
    localStorage.setItem('test', localStorage.getItem('test') || 1);
    document.getElementById(Number(localStorage.getItem('test')) ? 'test-true' : 'test-false').checked = true;
    
    const { transit } = createNatalChart('horoscope');
    renderAstro(new Date(), transit);

    const data = await getTDA();
    renderAccount(data.account);
    renderSummary(data.history);
  }
}

window.testMode = () => {
  localStorage.setItem('test', document.querySelector('input[name="test"]:checked').value);
}

window.logout = () => {
  localStorage.clear();
  window.location.href = "/index.html";
}