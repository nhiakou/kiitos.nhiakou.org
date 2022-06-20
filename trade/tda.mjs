import { getData, postData } from "/login/fetch.mjs";

export async function getTDA() {
    const market = await getData('https://api.tdameritrade.com/v1/marketdata/EQUITY/hours', { date: new Date().toISOString() });
    const positions = await getData('https://api.tdameritrade.com/v1/accounts/' + localStorage.getItem('account_id'), { fields: 'positions' });
    const stocks = await getData('https://api.tdameritrade.com/v1/marketdata/quotes', { symbol: 'BRK.A,BRK.B,AAPL,SQ,ABNB' });
    return { market, positions, stocks };
}

// buy long
export async function openLongPosition(symbol, quantity) {
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
export async function closeLongPosition(symbol, quantity) {
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
export async function openShortPosition(symbol, quantity) {
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
export async function closeShortPosition(symbol, quantity) {
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