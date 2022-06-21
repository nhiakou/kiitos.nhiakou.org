import { QUANTITY_STEP } from '../robot/level.mjs';
import { confirmMarketOrder } from '../tda.mjs';
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
        document.getElementById(stock + '-buy').onclick = () => confirmMarketOrder('Buy', stock, QUANTITY_STEP);
        document.getElementById(stock + '-sell').onclick = () => confirmMarketOrder('Sell', stock, QUANTITY_STEP);
        document.getElementById(stock + '-borrow').onclick = () => confirmMarketOrder('Short', stock, QUANTITY_STEP);
        document.getElementById(stock + '-return').onclick = () => confirmMarketOrder('Cover', stock, QUANTITY_STEP);
    });
}