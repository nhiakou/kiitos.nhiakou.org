const KIITOS = navigator.userAgent.includes('Nexus 5'); // Nexus 5 Build/MRA58N
const LIVE = window.location.hostname === 'kiitos.nhiakou.org';
export { KIITOS, LIVE };

// sometimes cannot get account because of access denied... why?
export async function getData(account, url='', data={}) {
    return fetch(url + '?' + new URLSearchParams(data), {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + await getAccessToken(account)
        }
    }).then(response => response.json()).catch(error => console.error(error));    
}

export async function postData(account, url='', data={}) {
    const response = await fetch(url, {
        method: 'POST', 
        headers: {
        'Authorization': 'Bearer ' + await getAccessToken(account), 
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    return response.text();
}

export async function deleteOrder(account, orderID) {
    const response = await fetch(`https://api.tdameritrade.com/v1/accounts/${localStorage.getItem(account + '-account_id')}/savedorders/${orderID}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + await getAccessToken(account)
        }
    });
    
    return response.text();
}

// access token expires after 1800 seconds = 30 mins
async function getAccessToken(account) {
    if (hasExpired(localStorage.getItem(account + '-access_last_update'), localStorage.getItem(account + '-expires_in'))) {
        return await resetAccessToken(account);
    } else {
        return localStorage.getItem(account + '-access_token');
    }
}

export function hasExpired(date, expiration) {
    if (date && expiration) {
        return (new Date() - new Date(date)) / 1000 >= Number(expiration);
    } else 
        return true;
}

async function resetAccessToken(account) {
    const response = await fetch('https://api.tdameritrade.com/v1/oauth2/token', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: localStorage.getItem(account + '-refresh_token'),
            client_id: localStorage.getItem(account + '-client_id')
        })
    });

    const token = await response.json();
    localStorage.setItem(account + '-access_token', token.access_token);
    localStorage.setItem(account + '-access_last_update', new Date().toString());
    return token.access_token;
}