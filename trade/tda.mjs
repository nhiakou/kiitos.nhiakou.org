import { ALL } from "./robot/stocks.mjs";
import { getTDA as getAccount } from "/account/tda.mjs"; 
import { getData, postData } from "/login/fetch.mjs";
import { sendMail } from "./admin/mail.mjs";

export async function getTDA() {
    const { account, history } = await getAccount();
    const market = await getData('personal', 'https://api.tdameritrade.com/v1/marketdata/EQUITY/hours', { date: new Date().toISOString() });
    const stocks = await getData('personal', 'https://api.tdameritrade.com/v1/marketdata/quotes', { symbol: ALL.join(",") });
    const positions = await getData('corporate', 'https://api.tdameritrade.com/v1/accounts/' + localStorage.getItem('corporate-account_id'), { fields: 'positions' });

    for (const stock in stocks) {
        stocks[stock].position = positions.securitiesAccount.positions.find(position => position.instrument.symbol === stock);
        stocks[stock].lastTrade = history.find(trade => trade.transactionItem.instrument.symbol === stock);
    }

    //console.log(account) // sometimes cannot get account because of access denied... why?
    //console.log(stocks)
    return { account, market, stocks };
}

export async function confirmMarketOrder(order, symbol, quantity) {
    const test = Number(localStorage.getItem('test')) ? 'TEST' : 'REAL';
    if (confirm(`${test}: Are you sure you want to ${order} ${quantity} shares of ${symbol}?`)) {
        await placeMarketOrder(order, symbol, quantity);
        window.location.reload();
    }
}

export async function placeMarketOrder(order, symbol, quantity) {
    const subject = `${order}: ${symbol} x ${quantity}`;
    const html = `<i>${order}</i>: <u>${symbol}</u> x <b>${quantity}</b>`;
    await sendMail(subject, html);
    
    switch (order) {
        case 'Buy':
            return {status: await openLongPosition(symbol, quantity)};
        case 'Sell':
            return {status: await closeLongPosition(symbol, quantity)};
        case 'Short':
            return {status: await openShortPosition(symbol, quantity)};
        case 'Cover':
            return {status: await closeShortPosition(symbol, quantity)};
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