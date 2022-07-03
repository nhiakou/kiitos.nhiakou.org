import { ALL } from "./robot/stocks.mjs";
import { getTDA as getAccount } from "/account/tda.mjs";
import { orderPositions } from "./admin/orders.mjs";
import { getData, postData } from "/login/fetch.mjs";
import { mailPositionReport } from "./robot/alert.mjs";

export async function getTDA() {
    const { account, history } = await getAccount();
    const market = await getData('personal', 'https://api.tdameritrade.com/v1/marketdata/EQUITY/hours', { date: new Date().toISOString() });
    const stocks = await getData('personal', 'https://api.tdameritrade.com/v1/marketdata/quotes', { symbol: ALL.join(",") });
    const positions = await getData('corporate', 'https://api.tdameritrade.com/v1/accounts/' + localStorage.getItem('corporate-account_id'), { fields: 'positions' });
    const { positions: orders } = await orderPositions();
    
    for (const stock in stocks) {
        stocks[stock].order = orders.find(order => order.stock === stock);
        stocks[stock].position = positions.securitiesAccount.positions.find(position => position.instrument.symbol === stock);
        stocks[stock].lastTrade = history.find(trade => trade.transactionItem.instrument.symbol === stock);
    }

    //console.log(account)
    //console.log(stocks)
    return { account, market, stocks };
}

export async function confirmMarketOrder(order, stock, quantity) {
    const test = Number(localStorage.getItem('test')) ? 'TEST' : 'REAL';
    if (confirm(`${test}: Are you sure you want to ${order} ${quantity} shares of ${stock.symbol}?`)) {
        await placeMarketOrder(order, stock, quantity);
        window.location.reload();
    }
}

export async function placeMarketOrder(order, stock, quantity) {
    mailPositionReport(order, stock, quantity);
    
    switch (order) {
        case 'Buy':
            return {status: await openLongPosition(stock.symbol, quantity)};
        case 'Sell':
            return {status: await closeLongPosition(stock.symbol, quantity)};
        case 'Short':
            return {status: await openShortPosition(stock.symbol, quantity)};
        case 'Cover':
            return {status: await closeShortPosition(stock.symbol, quantity)};
    }
}

// buy long
async function openLongPosition(symbol, quantity) {
    const data = await postData(`https://api.tdameritrade.com/v1/accounts/${localStorage.getItem('corporate-account_id')}/${ Number(localStorage.getItem('test')) ? 'savedorders': 'orders' }`, {
        "orderType": "MARKET",
        "session": "NORMAL",
        "duration": "DAY",
        "orderStrategyType": "SINGLE",
        "orderLegCollection": [
            {
                "instruction": "BUY",
                "quantity": quantity,
                "instrument": {
                        "symbol": symbol,
                        "assetType": "EQUITY"
                    }
            }
        ]
    });
    
    return "Success";
}

// sell long
async function closeLongPosition(symbol, quantity) {
    const data = await postData(`https://api.tdameritrade.com/v1/accounts/${localStorage.getItem('corporate-account_id')}/${ Number(localStorage.getItem('test')) ? 'savedorders': 'orders' }`, {
        "orderType": "MARKET",
        "session": "NORMAL",
        "duration": "DAY",
        "orderStrategyType": "SINGLE",
        "orderLegCollection": [
            {
                "instruction": "SELL",
                "quantity": quantity,
                "instrument": {
                        "symbol": symbol,
                        "assetType": "EQUITY"
                    }
            }
        ]
    });
    
    return "Success";
}

// sell short (borrow)
async function openShortPosition(symbol, quantity) {
    const data = await postData(`https://api.tdameritrade.com/v1/accounts/${localStorage.getItem('corporate-account_id')}/${ Number(localStorage.getItem('test')) ? 'savedorders': 'orders' }`, {
        "orderType": "MARKET",
        "session": "NORMAL",
        "duration": "DAY",
        "orderStrategyType": "SINGLE",
        "orderLegCollection": [
            {
                "instruction": "SELL_SHORT",
                "quantity": quantity,
                "instrument": {
                        "symbol": symbol,
                        "assetType": "EQUITY"
                    }
            }
        ]
    });
    
    return "Success";
}

// buy to cover (return)
async function closeShortPosition(symbol, quantity) {
    const data = await postData(`https://api.tdameritrade.com/v1/accounts/${localStorage.getItem('corporate-account_id')}/${ Number(localStorage.getItem('test')) ? 'savedorders': 'orders' }`, {
        "orderType": "MARKET",
        "session": "NORMAL",
        "duration": "DAY",
        "orderStrategyType": "SINGLE",
        "orderLegCollection": [
            {
                "instruction": "BUY_TO_COVER",
                "quantity": quantity,
                "instrument": {
                        "symbol": symbol,
                        "assetType": "EQUITY"
                    }
            }
        ]
    });
    
    return "Success";
}