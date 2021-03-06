import { STOCKS } from '../robot/stocks.mjs';
import { confirmMarketOrder } from '../tda.mjs';
import { formatToDollar, formatToPercent, formatToDollars, formatToQuantity } from "/utils.mjs";

export function renderPositions(stocks) {
    STOCKS.forEach(stock => {
        if (stocks[stock].position) {
            document.getElementById(stock + '-cost').textContent = formatToDollars(stocks[stock].position.averagePrice);
            document.getElementById(stock + '-quantity').textContent = formatToQuantity(-stocks[stock].position.shortQuantity || stocks[stock].position.longQuantity); // stocks[stock].position.settledShortQuantity || stocks[stock].position.settledLongQuantity
            // document.getElementById(stock + '-dollar-profit').textContent = stocks[stock].position.currentDayProfitLoss;
            // document.getElementById(stock + '-percent-profit').textContent = stocks[stock].position.currentDayProfitLossPercentage;
    
            const currentPrice = parseFloat(document.getElementById(stock + '-price').textContent.replace('$', ''));
            formatToDollar(document.getElementById(stock + '-dollar-profit'), (stocks[stock].position.averagePrice - currentPrice) * stocks[stock].position.shortQuantity || (currentPrice - stocks[stock].position.averagePrice) * stocks[stock].position.longQuantity);
            formatToPercent(document.getElementById(stock + '-percent-profit'), stocks[stock].position.shortQuantity > 0 ? (stocks[stock].position.averagePrice / currentPrice * 100 - 100) : (currentPrice / stocks[stock].position.averagePrice * 100 - 100));
        }
    });
}

export function renderButtons(stocks) {
    STOCKS.forEach(stock => {
        placeOrder('Buy', stocks[stock], document.getElementById(stock + '-buy'));
        placeOrder('Sell', stocks[stock], document.getElementById(stock + '-sell'));
        placeOrder('Short', stocks[stock], document.getElementById(stock + '-borrow'));
        placeOrder('Cover', stocks[stock], document.getElementById(stock + '-return'));
    });
}

function placeOrder(order, stock, button) {
    const test = Number(localStorage.getItem('test'));
    const recommendedShortQuantity = Math.floor(stock.askSize / stock.bidSize);
    const recommendedLongQuantity = Math.floor(stock.bidSize / stock.askSize);

    if (stock.position) {
        if (stock.position.shortQuantity) {
            if (order === 'Cover') {
                button.onclick = () => confirmMarketOrder(test, 'corporate', order, stock, stock.position.shortQuantity);
            } else if (order === 'Short' && recommendedShortQuantity) {
                button.onclick = () => confirmMarketOrder(test, 'corporate', order, stock, recommendedShortQuantity);
            } else {
                button.disabled = true;
            }
        } else {
            if (order === 'Sell') {
                button.onclick = () => confirmMarketOrder(test, 'corporate', order, stock, stock.position.longQuantity);
            } else if (order === 'Buy' && recommendedLongQuantity) {
                button.onclick = () => confirmMarketOrder(test, 'corporate', order, stock, recommendedLongQuantity);
            } else {
                button.disabled = true;
            }
        }
    } else {
        if (order === 'Short' && recommendedShortQuantity) {
            button.onclick = () => confirmMarketOrder(test, 'corporate', order, stock, recommendedShortQuantity);
        } else if (order === 'Buy' && recommendedLongQuantity) {
            button.onclick = () => confirmMarketOrder(test, 'corporate', order, stock, recommendedLongQuantity);
        } else {
            button.disabled = true;
        }
    }
} 