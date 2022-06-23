import { getData } from "/login/fetch.mjs";

export async function renderOrders() {
    const orders = await getData(`https://api.tdameritrade.com/v1/accounts/${localStorage.getItem('account_id')}/savedorders`);
    const ol = document.querySelector('ol');

    orders.reverse().forEach(order => {
        const li = document.createElement('li');
        const ul = document.createElement('ul');
        ol.append(li);
        li.append(ul);
        
        for (const prop in order) {
            const li = document.createElement('li');
            const b = document.createElement('b');
            const span = document.createElement('span');
            b.textContent = prop + ": ";

            if (prop === 'orderLegCollection') {
                span.textContent = JSON.stringify(order.orderLegCollection);
            } else if (prop === 'savedTime') {
                span.textContent = new Date(order.savedTime).toLocaleString();
            } else {
                span.textContent = order[prop];
            }

            li.append(b, span);
            ul.append(li);
        }
    });

    return orders;
}

export async function sendMail(subject, html) {
    const mail = await fetch('https://api.mailgun.net/v3/sandbox0b19bd1dd4f54354927b99b3771b7061.mailgun.org/messages', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Basic ' + btoa('api:' + localStorage.getItem('mailgun_key'))},
        body: new URLSearchParams({
            from: 'Kiitos TDA <kiitos@nhiakou.org>',
            to: "thonly@protonmail.com",
            subject,
            html
        })
    });
    
    console.log(subject);
    return mail.json();
}