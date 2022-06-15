const username = document.getElementById('username');
const password = document.getElementById('password');
const remember = document.getElementById('remember');

window.onload = () => {
    username.value = localStorage.getItem('username') || "";
    password.value = localStorage.getItem('password') || "";
    remember.checked = Boolean(localStorage.getItem('remember'));
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

    const response = await fetch('https://localhost:999/login', {
        method: 'POST',
        mode: 'cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            username: username.value, 
            password: password.value, 
        })
    });
      
    const tokens = await response.json();
    localStorage.setItem('account_id', tokens.account_id);
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem('expires_in', tokens.expires_in);
    localStorage.setItem('refresh_token_expires_in', tokens.refresh_token_expires_in);
    localStorage.setItem('token_type', tokens.token_type);
    localStorage.setItem('access_last_update', new Date().toString());
    localStorage.setItem('refresh_last_update', new Date().toString());

    window.location.href = '/account/account.html';
}

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-532EHXLL26');