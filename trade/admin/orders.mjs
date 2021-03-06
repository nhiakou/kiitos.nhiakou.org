import { STOCKS } from "../robot/stocks.mjs";
import { getData } from "/login/fetch.mjs";

export async function orderPositions(account) {
    const orders = await getOrdersWithPrices(account);
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

    return { orders, positions };
}

function getAveragePrice(position, order) {
    const previousQuantity = position.shortQuantity || position.longQuantity;
    return (position.averagePrice*previousQuantity + order.price*order.orderLegCollection[0].quantity) / (previousQuantity + order.orderLegCollection[0].quantity);
}

async function getOrdersWithPrices(account) {
    const orders = await getData(account, `https://api.tdameritrade.com/v1/accounts/${localStorage.getItem(account + '-account_id')}/savedorders`);
    const promises = await Promise.allSettled(orders.map(async order => await getOrderWithPrice(order)));
    return promises.map(promise => promise.value);
}

async function getOrderWithPrice(order) {
    try {
        const orderDate = new Date(order.savedTime);
        const openDate = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate(), 6, 30);
        const minutes = Math.floor((orderDate - openDate) / (1000*60));
        const history = await getData('personal', `https://api.tdameritrade.com/v1/marketdata/${order.orderLegCollection[0].instrument.symbol}/pricehistory`, { startDate: orderDate.getTime(), endDate: orderDate.getTime(), periodType: "day", frequencyType: "minute", frequency: 1, needExtendedHoursData: true });
        order.price = history.candles[minutes].close; //Math.round(history.candles.reduce((sum, candle) => sum + candle.close, 0) / history.candles.length * 100) / 100;
    } catch {
        order.price = 33.33;
    } finally {
        return order;
    }
}

export async function renderOrders(account) {
    const ol = document.getElementById('orders');
    const stocks = await getData('personal', 'https://api.tdameritrade.com/v1/marketdata/quotes', { symbol: STOCKS.join(",") });
    const { orders, positions } = await orderPositions(account);

    positions.forEach(position => {        
        const li = document.createElement('li');
        const ul = document.createElement('ul');
        ul.style.opacity = position.closingPrice ? "0.5" : "1";
        ol.append(li);
        li.append(ul);

        const currentPrice = position.closingPrice || stocks[position.stock].mark;
        const quantity = -position.shortQuantity || position.longQuantity;
        const dollarProfit = (position.averagePrice - currentPrice) * position.shortQuantity || (currentPrice - position.averagePrice) * position.longQuantity;
        const percentProfit = position.shortQuantity > 0 ? (position.averagePrice / currentPrice * 100 - 100) : (currentPrice / position.averagePrice * 100 - 100);

        ul.append(createLiElement("Stock", position.stock));
        ul.append(createLiElement("$ Profit", dollarProfit.toFixed(2)));
        ul.append(createLiElement("% Profit", percentProfit.toFixed(2)));
        ul.append(createLiElement("Current Price", currentPrice.toFixed(2)));
        ul.append(createLiElement("Average Cost", position.averagePrice.toFixed(2)));
        ul.append(createLiElement("Quantity", quantity));
    });

    return { stocks, orders, positions };
}

function createLiElement(name, value) {
    const li = document.createElement('li');
    const b = document.createElement('b');
    const span = document.createElement('span');

    b.textContent = name + ": ";
    span.textContent = value;
    span.style.color = isNaN(value) ? "purple" : (value < 0 ? "red" : "green");

    li.append(b, span);
    return li;
}

// deprecated
export async function renderOrders2(account) {
    const orders = await getData(account, `https://api.tdameritrade.com/v1/accounts/${localStorage.getItem(account + '-account_id')}/savedorders`);
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

