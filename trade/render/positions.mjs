import { STOCKS, QUANTITY_STEP } from '../robot/brain.mjs';
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
        placeOrder('Buy', document.getElementById(stock + '-buy'), stocks[stock]);
        placeOrder('Sell', document.getElementById(stock + '-sell'), stocks[stock]);
        placeOrder('Short', document.getElementById(stock + '-borrow'), stocks[stock]);
        placeOrder('Cover', document.getElementById(stock + '-return'), stocks[stock]);
    });
}

function placeOrder(order, button, stock) {
    if (stock.position) {
        if (stock.position.shortQuantity) {
            if (order === 'Cover') {
                button.onclick = () => confirmMarketOrder(order, stock.symbol, stock.position.shortQuantity);
            } else if (order === 'Short') {
                button.onclick = () => confirmMarketOrder(order, stock.symbol, QUANTITY_STEP);
            } else {
                button.disabled = true;
            }
        } else {
            if (order === 'Sell') {
                button.onclick = () => confirmMarketOrder(order, stock.symbol, stock.position.longQuantity);
            } else if (order === 'Buy') {
                button.onclick = () => confirmMarketOrder(order, stock.symbol, QUANTITY_STEP);
            } else {
                button.disabled = true;
            }
        }
    } else {
        if (order === 'Short' || order === 'Buy') {
            button.onclick = () => confirmMarketOrder(order, stock.symbol, QUANTITY_STEP);
        } else {
            button.disabled = true;
        }
    }
} 