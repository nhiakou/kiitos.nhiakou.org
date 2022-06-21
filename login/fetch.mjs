const IP = "https://192.168.1.194:999";
const LIVE = window.location.hostname === 'kiitos.nhiakou.org';

export { IP, LIVE };

export async function postData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST', 
        headers: {
        'Authorization': 'Bearer ' + await getAccessToken(), 
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    return response.text();
}

export async function getData(url='', data = {}) {
    const response = await fetch(url + '?' + new URLSearchParams(data), {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + await getAccessToken()
        }
    });
    
    return response.json();
}

export async function deleteOrder(orderID) {
    const response = await fetch(`https://api.tdameritrade.com/v1/accounts/${localStorage.getItem('account_id')}/savedorders/${orderID}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + await getAccessToken()
        }
    });
    
    return response.text();
}

// access token expires after 1800 seconds = 30 mins
async function getAccessToken() {
    if (hasExpired(localStorage.getItem('access_last_update'), localStorage.getItem('expires_in'))) {
        return await resetAccessToken();
    } else {
        return localStorage.getItem('access_token');
    }
}

export function hasExpired(date, expiration) {
    if (date && expiration) {
        return Math.floor((new Date() - new Date(date)) / 1000) >= Number(expiration);
    } else 
        return true;
}

async function resetAccessToken() {
    const response = await fetch('https://api.tdameritrade.com/v1/oauth2/token', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: localStorage.getItem('refresh_token'),
            client_id: localStorage.getItem('client_id')
        })
    });

    const token = await response.json();
    localStorage.setItem('access_token', token.access_token);
    localStorage.setItem('access_last_update', new Date().toString());
    return token.access_token;
}