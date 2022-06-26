import { getData } from "/login/fetch.mjs";

export async function renderOrders() {
    const orders = await getData(`https://api.tdameritrade.com/v1/accounts/${localStorage.getItem('account_id')}/savedorders`);
    const ol = document.getElementById('orders');

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

            if (prop === 'savedTime') {
                span.textContent = new Date(order.savedTime).toLocaleString();
            } else if (prop === 'orderLegCollection') {
                span.textContent = JSON.stringify(order.orderLegCollection);
            } else {
                span.textContent = order[prop];
            }

            li.append(b, span);
            ul.append(li);
        }
    });

    return orders;
}

