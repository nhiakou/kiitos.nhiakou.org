import { QUANTITY_STEP } from '../robot/brain.mjs';
import { confirmMarketOrder } from '../tda.mjs';
import { formatToDollar, formatToPercent, formatToDollars, formatToQuantity } from "/utils.mjs";

export function renderPositions(positions) {
    const stocks = ['AAPL', 'SQ', 'ABNB'];
    //console.log(positions.securitiesAccount.positions)
    positions.securitiesAccount.positions.filter(position => stocks.includes(position.instrument.symbol)).forEach(position => {
        document.getElementById(position.instrument.symbol + '-cost').textContent = formatToDollars(position.averagePrice);
        document.getElementById(position.instrument.symbol + '-quantity').textContent = formatToQuantity(-position.shortQuantity || position.longQuantity); // position.settledShortQuantity || position.settledLongQuantity
        // document.getElementById(position.instrument.symbol + '-dollar-profit').textContent = position.currentDayProfitLoss;
        // document.getElementById(position.instrument.symbol + '-percent-profit').textContent = position.currentDayProfitLossPercentage;

        const currentPrice = parseFloat(document.getElementById(position.instrument.symbol + '-price').textContent.replace('$', ''));
        formatToDollar(document.getElementById(position.instrument.symbol + '-dollar-profit'), (position.averagePrice - currentPrice) * position.shortQuantity || (currentPrice - position.averagePrice) * position.longQuantity);
        formatToPercent(document.getElementById(position.instrument.symbol + '-percent-profit'), position.shortQuantity > 0 ? (position.averagePrice / currentPrice * 100 - 100) : (currentPrice / position.averagePrice * 100 - 100));
    });
}

export function renderButtons(positions) {
    ['AAPL', 'SQ', 'ABNB'].forEach(stock => {
        const position = positions.securitiesAccount.positions.find(position => position.instrument.symbol === stock);
        placeOrder('Buy', document.getElementById(stock + '-buy'), stock, position);
        placeOrder('Sell', document.getElementById(stock + '-sell'), stock, position);
        placeOrder('Short', document.getElementById(stock + '-borrow'), stock, position);
        placeOrder('Cover', document.getElementById(stock + '-return'), stock, position);
    });
}

function placeOrder(order, button, stock, position) {
    if (position) {
        if (position.shortQuantity) {
            if (order === 'Cover') {
                button.onclick = () => confirmMarketOrder(order, stock, position.shortQuantity);
            } else if (order === 'Short') {
                button.onclick = () => confirmMarketOrder(order, stock, QUANTITY_STEP);
            } else {
                button.disabled = true;
            }
        } else {
            if (order === 'Sell') {
                button.onclick = () => confirmMarketOrder(order, stock, position.longQuantity);
            } else if (order === 'Buy') {
                button.onclick = () => confirmMarketOrder(order, stock, QUANTITY_STEP);
            } else {
                button.disabled = true;
            }
        }
    } else {
        if (order === 'Short' || order === 'Buy') {
            button.onclick = () => confirmMarketOrder(order, stock, QUANTITY_STEP);
        } else {
            button.disabled = true;
        }
    }
} 