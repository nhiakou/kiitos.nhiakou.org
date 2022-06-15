const username = document.getElementById('username');
const password = document.getElementById('password');
const client = document.getElementById('client');
const account = document.getElementById('account');

window.onload = () => {
    username.value = localStorage.getItem('username') || "";
    password.value = localStorage.getItem('password') || "";
    client.value = localStorage.getItem('client') || "";
    account.value = localStorage.getItem('account') || "";
}

window.login = async () => {
    localStorage.setItem('username', username.value);
    localStorage.setItem('password', password.value);
    localStorage.setItem('client', client.value);
    localStorage.setItem('account', account.value);

    const response = await fetch('https://localhost:8080/login', {
        method: 'POST',
        mode: 'no-cors',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({
            username: localStorage.getItem('username'), 
            password: localStorage.getItem('password'), 
            client: localStorage.getItem('client')
        })
    });
      
    console.log(await response.json());
}