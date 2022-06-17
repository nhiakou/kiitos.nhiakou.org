import { getData, postData } from "/login/fetch.mjs";

export async function getTDA() {
    const positions = await getData('https://api.tdameritrade.com/v1/accounts/' + localStorage.getItem('account_id'), { fields: 'positions' });
    const stocks = await getData('https://api.tdameritrade.com/v1/marketdata/quotes', { symbol: 'BRK.A,BRK.B,AAPL,SQ' });
    return { positions, stocks };
}

export async function getOrders() {
    return await getData(`https://api.tdameritrade.com/v1/accounts/${localStorage.getItem('account_id')}/savedorders`);
}

export async function placeMarketOrder(order, symbol, quantity) {
    switch (order) {
        case 'buy':
            return {status: await openLongPosition(symbol, quantity)};
        case 'sell':
            return {status: await closeLongPosition(symbol, quantity)};
        case 'short':
            return {status: await openShortPosition(symbol, quantity)};
        case 'cover':
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