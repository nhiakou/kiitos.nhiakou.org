import { LIVE, hasExpired } from "./fetch.mjs";

const personal_username = document.getElementById('personal-username');
const personal_password = document.getElementById('personal-password');
const corporate_username = document.getElementById('corporate-username');
const corporate_password = document.getElementById('corporate-password');
const mail = document.getElementById('mail');
const remember = document.getElementById('remember');

// refresh token expires after 7776000 seconds = 90 days or 3 months
window.onload = () => {
    document.getElementById('renew').disabled = LIVE;

    if (hasExpired(localStorage.getItem('refresh_last_update'), localStorage.getItem('refresh_token_expires_in'))) {
        personal_username.value = localStorage.getItem('personal-username') || "";
        personal_password.value = localStorage.getItem('personal-password') || "";
        corporate_username.value = localStorage.getItem('corporate-username') || "";
        corporate_password.value = localStorage.getItem('corporate-password') || "";
        mail.value = localStorage.getItem('mailgun_key') || "";
        remember.checked = Boolean(Number(localStorage.getItem('remember')));
    } else {
        window.location.href = '/account/account.html';
    }
}

window.rememberMe = () => {
    localStorage.setItem('remember', remember.checked ? 1 : 0);
}

window.login = async (button) => {
    if (remember.checked) {
        localStorage.setItem('personal-username', personal_username.value);
        localStorage.setItem('personal-password', personal_password.value);
        localStorage.setItem('corporate-username', corporate_username.value);
        localStorage.setItem('corporate-password', corporate_password.value);
    } else {
        localStorage.setItem('personal-username', "");
        localStorage.setItem('personal-password', "");
        localStorage.setItem('corporate-username', "");
        localStorage.setItem('corporate-password', "");
    }

    button.disabled = true;
    button.textContent = "Please approve on your mobile device";

    const [ personal, corporate ] = await Promise.allSettled([getTokens('personal'), getTokens('corporate')]);
    setTokens('personal', personal.value);
    setTokens('corporate', corporate.value);
    window.location.href = '/account/account.html';
}

window.copyTokens = async (button) => {
    button.disabled = true;
    const response = await fetch('https://dns.nhiakou.org:999/');
    const { personal, corporate } = await response.json();
    setTokens('personal', personal);
    setTokens('corporate', corporate);
    window.location.href = '/account/account.html';
}

function setTokens(account, tokens) {
    localStorage.setItem(account + '-mailgun_key', tokens.mailgun_key); // repeat 2x
    localStorage.setItem(account + '-client_id', tokens.client_id);
    localStorage.setItem(account + '-account_id', tokens.account_id);
    localStorage.setItem(account + '-access_token', tokens.access_token);
    localStorage.setItem(account + '-refresh_token', tokens.refresh_token);
    localStorage.setItem(account + '-scope', tokens.scope);
    localStorage.setItem(account + '-expires_in', tokens.expires_in);
    localStorage.setItem(account + '-refresh_token_expires_in', tokens.refresh_token_expires_in);
    localStorage.setItem(account + '-token_type', tokens.token_type);
    localStorage.setItem(account + '-access_last_update', tokens.access_last_update);
    localStorage.setItem(account + '-refresh_last_update', tokens.refresh_last_update);
}

async function getTokens(account) {
    const response = await fetch('https://dns.nhiakou.org:999/login', {
        method: 'POST',
        mode: 'cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            account: account,
            username: document.getElementById(account + '-username').value, 
            password: document.getElementById(account + '-password').value,
            mail: mail.value
        })
    });

    return response.json();
}

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-532EHXLL26');