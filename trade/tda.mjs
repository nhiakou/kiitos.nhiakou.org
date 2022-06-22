import { getData, postData } from "/login/fetch.mjs";

export async function getTDA() {
    const market = await getData('https://api.tdameritrade.com/v1/marketdata/EQUITY/hours', { date: new Date().toISOString() });
    const positions = await getData('https://api.tdameritrade.com/v1/accounts/' + localStorage.getItem('account_id'), { fields: 'positions' });
    const stocks = await getData('https://api.tdameritrade.com/v1/marketdata/quotes', { symbol: '$DJI,$SPX.X,$COMPX,BRK.A,BRK.B,AAPL,SQ,ABNB' });
    return { market, positions, stocks };
}

export async function confirmMarketOrder(order, symbol, quantity) {
    if (confirm(`Are you sure you want to ${order} ${quantity} shares of ${symbol}?`)) {
        await placeMarketOrder(order, symbol, quantity);
        window.location.reload();
    }
}

export async function placeMarketOrder(order, symbol, quantity) {
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
    const data = await postData(`https://api.tdameritrade.com/v1/accounts/${localStorage.getItem('account_id')}/${ Number(localStorage.getItem('test')) ? 'savedorders': 'orders' }`, {
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
    const data = await postData(`https://api.tdameritrade.com/v1/accounts/${localStorage.getItem('account_id')}/${ Number(localStorage.getItem('test')) ? 'savedorders': 'orders' }`, {
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
    const data = await postData(`https://api.tdameritrade.com/v1/accounts/${localStorage.getItem('account_id')}/${ Number(localStorage.getItem('test')) ? 'savedorders': 'orders' }`, {
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
    const data = await postData(`https://api.tdameritrade.com/v1/accounts/${localStorage.getItem('account_id')}/${ Number(localStorage.getItem('test')) ? 'savedorders': 'orders' }`, {
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