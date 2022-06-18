import { QUANTITY_STEP, placeMarketOrder } from '../robot/god.mjs';

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