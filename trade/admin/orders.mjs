import { getData } from "/login/fetch.mjs";

export async function orderPositions() {
    const orders = await getOrdersWithPrices();
    const positions = [];

    orders.forEach(order => {
        const position = positions.find(position => position.stock === order.orderLegCollection[0].instrument.symbol);
        if (position && !position.closingPrice) {
            switch (order.orderLegCollection[0].instruction) {
                case "BUY":
                    position.longQuantity += order.orderLegCollection[0].quantity;
                    position.averagePrice = getAveragePrice(position, order);
                    break;
                case "SELL":
                    position.closingPrice = order.price;
                    break;
                case "SELL_SHORT":
                    position.shortQuantity += order.orderLegCollection[0].quantity;
                    position.averagePrice = getAveragePrice(position, order);
                    break;
                case "BUY_TO_COVER":
                    position.closingPrice = order.price;
                    break;
            }
        } else {
            const position = {};
            position.stock = order.orderLegCollection[0].instrument.symbol;
            position.shortQuantity = order.orderLegCollection[0].instruction === 'SELL_SHORT' ? order.orderLegCollection[0].quantity : 0;
            position.longQuantity = order.orderLegCollection[0].instruction === 'BUY' ? order.orderLegCollection[0].quantity : 0;
            position.averagePrice = order.price;
            position.closingPrice = 0;
            positions.unshift(position);
        }
    });

    return positions;
}

function getAveragePrice(position, order) {
    const previousQuantity = position.shortQuantity || position.longQuantity;
    return Math.round((position.averagePrice*previousQuantity + order.price*order.orderLegCollection[0].quantity) / (previousQuantity + order.orderLegCollection[0].quantity) * 100) / 100;
}

async function getOrdersWithPrices() {
    const orders = await getData('corporate', `https://api.tdameritrade.com/v1/accounts/${localStorage.getItem('corporate-account_id')}/savedorders`);
    const promises = await Promise.allSettled(orders.map(async order => await getOrderWithPrice(order)));
    return promises.map(promise => promise.value);
}

async function getOrderWithPrice(order) {
    const orderDate = new Date(order.savedTime);
    const openDate = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate(), 6, 30);
    const minutes = Math.floor((orderDate - openDate) / (1000*60));
    const history = await getData('personal', `https://api.tdameritrade.com/v1/marketdata/${order.orderLegCollection[0].instrument.symbol}/pricehistory`, { startDate: orderDate.getTime(), endDate: orderDate.getTime(), periodType: "day", frequencyType: "minute", frequency: 1, needExtendedHoursData: true });
    order.price = history.candles[minutes].close; //Math.round(history.candles.reduce((sum, candle) => sum + candle.close, 0) / history.candles.length * 100) / 100;
    return order;
}

export async function renderOrders() {
    const positions = await orderPositions();

    console.log(positions);
}

// deprecated
export async function renderOrders2() {
    const orders = await getData('corporate', `https://api.tdameritrade.com/v1/accounts/${localStorage.getItem('corporate-account_id')}/savedorders`);
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

