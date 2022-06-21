import { LIVE, hasExpired } from "./fetch.mjs";

const username = document.getElementById('username');
const password = document.getElementById('password');
const mail = document.getElementById('mail');
const remember = document.getElementById('remember');

// refresh token expires after 7776000 seconds = 90 days or 3 months
window.onload = () => {
    document.getElementById('renew').disabled = LIVE;

    if (hasExpired(localStorage.getItem('refresh_last_update'), localStorage.getItem('refresh_token_expires_in'))) {
        username.value = localStorage.getItem('username') || "";
        password.value = localStorage.getItem('password') || "";
        mail.value = localStorage.getItem('mailgun_key') || "";
        remember.checked = Boolean(Number(localStorage.getItem('remember')));
    } else {
        window.location.href = '/account/account.html';
    }
}

window.remember = () => {
    localStorage.setItem('remember', remember.checked ? 1 : 0);
}

window.login = async (button) => {
    if (remember.checked) {
        localStorage.setItem('username', username.value);
        localStorage.setItem('password', password.value);
    } else {
        localStorage.setItem('username', "");
        localStorage.setItem('password', "");
    }

    button.disabled = true;
    button.textContent = "Please approve on your mobile device";

    const response = await fetch('https://dns.nhiakou.org:999/login', {
        method: 'POST',
        mode: 'cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            username: username.value, 
            password: password.value, 
            mail: mail.value
        })
    });
      
    setTokens(await response.json())
    window.location.href = '/account/account.html';
}

window.copyTokens = async (button) => {
    button.disabled = true;
    const response = await fetch('https://dns.nhiakou.org:999/');
    setTokens(await response.json());
    window.location.href = '/account/account.html';
}

function setTokens(tokens) {
    localStorage.setItem('mailgun_key', tokens.mailgun_key);
    localStorage.setItem('client_id', tokens.client_id);
    localStorage.setItem('account_id', tokens.account_id);
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem('scope', tokens.scope);
    localStorage.setItem('expires_in', tokens.expires_in);
    localStorage.setItem('refresh_token_expires_in', tokens.refresh_token_expires_in);
    localStorage.setItem('token_type', tokens.token_type);
    localStorage.setItem('access_last_update', tokens.access_last_update);
    localStorage.setItem('refresh_last_update', tokens.refresh_last_update);
}

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-532EHXLL26');