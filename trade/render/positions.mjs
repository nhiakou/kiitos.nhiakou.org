import { QUANTITY_STEP, placeMarketOrder } from '../robot/god.mjs';
import { formatToDollar, formatToPercent, formatToDollars, formatToQuantity } from "/utils.mjs";

export function renderPositions(positions) {
    //console.log(positions.securitiesAccount.positions)
    positions.securitiesAccount.positions.forEach(position => {
        document.getElementById(position.instrument.symbol + '-cost').textContent = formatToDollars(position.averagePrice);
        document.getElementById(position.instrument.symbol + '-quantity').textContent = formatToQuantity(-position.shortQuantity || position.longQuantity); // position.settledShortQuantity || position.settledLongQuantity
        // document.getElementById(position.instrument.symbol + '-dollar-profit').textContent = position.currentDayProfitLoss;
        // document.getElementById(position.instrument.symbol + '-percent-profit').textContent = position.currentDayProfitLossPercentage;

        const currentPrice = parseFloat(document.getElementById(position.instrument.symbol + '-price').textContent.replace('$', ''));
        formatToDollar(document.getElementById(position.instrument.symbol + '-dollar-profit'), (position.averagePrice - currentPrice) * position.shortQuantity || (currentPrice - position.averagePrice) * position.longQuantity);
        formatToPercent(document.getElementById(position.instrument.symbol + '-percent-profit'), position.shortQuantity > 0 ? (position.averagePrice / currentPrice * 100 - 100) : (currentPrice / position.averagePrice * 100 - 100));
    });
}

export function renderButtons() {
    ['AAPL', 'SQ', 'ABNB'].forEach(stock => {
        document.getElementById(stock + '-buy').onclick = () => confirmMarketOrder('buy', stock, QUANTITY_STEP);
        document.getElementById(stock + '-sell').onclick = () => confirmMarketOrder('sell', stock, QUANTITY_STEP);
        document.getElementById(stock + '-borrow').onclick = () => confirmMarketOrder('short', stock, QUANTITY_STEP);
        document.getElementById(stock + '-return').onclick = () => confirmMarketOrder('cover', stock, QUANTITY_STEP);
    });
}

async function confirmMarketOrder(order, symbol, quantity) {
    if (confirm(`Are you sure you want to ${order} ${quantity} shares of ${symbol}?`)) {
        return await placeMarketOrder(order, symbol, quantity);
    }
}