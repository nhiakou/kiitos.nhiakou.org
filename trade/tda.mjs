import { ALL } from "./robot/stocks.mjs";
import { getTDA as getAccount } from "/account/tda.mjs";
import { orderPositions } from "./admin/orders.mjs";
import { getData, postData } from "/login/fetch.mjs";
import { mailPositionReport } from "./robot/alert.mjs";

export async function getTDA(Account) {
    const { account, history } = await getAccount();
    const market = await getData('personal', 'https://api.tdameritrade.com/v1/marketdata/EQUITY/hours', { date: new Date().toISOString() });
    const stocks = await getData('personal', 'https://api.tdameritrade.com/v1/marketdata/quotes', { symbol: ALL.join(",") });
    const positions = await getData(Account, 'https://api.tdameritrade.com/v1/accounts/' + localStorage.getItem(Account + '-account_id'), { fields: 'positions' });
    const { positions: orders } = await orderPositions(Account);
    
    for (const stock in stocks) {
        stocks[stock].order = orders.find(order => order.stock === stock);
        stocks[stock].position = positions.securitiesAccount.positions.find(position => position.instrument.symbol === stock);
        stocks[stock].lastTrade = history.find(trade => trade.transactionItem.instrument.symbol === stock);
    }

    //console.log(account)
    //console.log(stocks)
    return { account, market, stocks };
}

export async function confirmMarketOrder(test, account, order, stock, quantity) {
    if (confirm(`${test ? 'TEST' : 'REAL'} ${account}: Are you sure you want to ${order} ${quantity} shares of ${stock.symbol}?`)) {
        await placeMarketOrder(test, account, order, stock, quantity);
        window.location.reload();
    }
}

export async function placeMarketOrder(test, account, order, stock, quantity) {
    mailPositionReport(test, account, order, stock, quantity);
    
    switch (order) {
        case 'Buy':
            return {status: await openLongPosition(test, account, stock.symbol, quantity)};
        case 'Sell':
            return {status: await closeLongPosition(test, account, stock.symbol, quantity)};
        case 'Short':
            return {status: await openShortPosition(test, account, stock.symbol, quantity)};
        case 'Cover':
            return {status: await closeShortPosition(test, account, stock.symbol, quantity)};
    }
}

// buy long
async function openLongPosition(test, account, symbol, quantity) {
    const data = await postData(account, `https://api.tdameritrade.com/v1/accounts/${localStorage.getItem(account + '-account_id')}/${ test ? 'savedorders': 'orders' }`, {
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
async function closeLongPosition(test, account, symbol, quantity) {
    const data = await postData(account, `https://api.tdameritrade.com/v1/accounts/${localStorage.getItem(account + '-account_id')}/${ test ? 'savedorders': 'orders' }`, {
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
async function openShortPosition(test, account, symbol, quantity) {
    const data = await postData(account, `https://api.tdameritrade.com/v1/accounts/${localStorage.getItem(account + '-account_id')}/${ test ? 'savedorders': 'orders' }`, {
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
async function closeShortPosition(test, account, symbol, quantity) {
    const data = await postData(account, `https://api.tdameritrade.com/v1/accounts/${localStorage.getItem(account + '-account_id')}/${ test ? 'savedorders': 'orders' }`, {
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