export function formatToDollar(element, amount) {
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    element.textContent = formatter.format(Math.abs(amount));
    element.style.color = amount < 0 ? 'red' : 'green';
    element.style.fontWeight = 'bold';
}

export function formatToPercent(element, percentage) {
    element.textContent = Math.abs(percentage).toFixed(2) + "%";
    element.style.color = percentage < 0 ? 'red' : 'green';
}

export function formatToDollars(amount) {
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    return formatter.format(amount);
}

export function formatToPercents(percentage) {
    return percentage.toFixed(2) + "%";
}

export function formatToQuantity(quantity) {
    const formatter = new Intl.NumberFormat('en-US');
    return formatter.format(quantity);
}

export async function getData(url='', data = {}) {
    const response = await fetch(url + '?' + new URLSearchParams(data), {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        }
    });
    
    return response.json();
}
  
export async function postData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST', 
        headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('access_token'), 
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    return response.text();
}