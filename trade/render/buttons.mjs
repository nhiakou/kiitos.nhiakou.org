import { placeMarketOrder } from '../tda.mjs';

const QUANTITY = 25;

export function renderButtons() {
    ['AAPL', 'SQ'].forEach(stock => {
        document.getElementById(stock + '-buy').onclick = () => confirmMarketOrder('buy', stock, QUANTITY);
        document.getElementById(stock + '-sell').onclick = () => confirmMarketOrder('sell', stock, QUANTITY);
        document.getElementById(stock + '-borrow').onclick = () => confirmMarketOrder('short', stock, QUANTITY);
        document.getElementById(stock + '-return').onclick = () => confirmMarketOrder('cover', stock, QUANTITY);
    });
}

async function confirmMarketOrder(order, symbol, quantity) {
    if (confirm(`Are you sure you want to ${order} ${quantity} shares of ${symbol}?`)) {
        return await placeMarketOrder(order, symbol, quantity);
    }
}