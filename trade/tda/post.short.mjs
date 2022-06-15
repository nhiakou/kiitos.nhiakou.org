//import fs from 'fs';
import { postData } from '../../oauth/fetch.mjs';
//const credentials = JSON.parse(fs.readFileSync('private/credentials.json', 'utf-8'));

// sell short (borrow)
export async function openShortPosition(accessToken, symbol, quantity) {
    const data = await postData(accessToken, `https://api.tdameritrade.com/v1/accounts/${process.env.account_id}/${ Number(process.env.test) ? 'savedorders': 'orders' }`, {
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
export async function closeShortPosition(accessToken, symbol, quantity) {
    const data = await postData(accessToken, `https://api.tdameritrade.com/v1/accounts/${process.env.account_id}/${ Number(process.env.test) ? 'savedorders': 'orders' }`, {
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