//import fs from 'fs';
import { postData } from '../../oauth/fetch.mjs';
//const credentials = JSON.parse(fs.readFileSync('private/credentials.json', 'utf-8'));

// buy long
export async function openLongPosition(accessToken, symbol, quantity) {
    const data = await postData(accessToken, `https://api.tdameritrade.com/v1/accounts/${process.env.account_id}/${ Number(process.env.test) ? 'savedorders': 'orders' }`, {
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
export async function closeLongPosition(accessToken, symbol, quantity) {
    const data = await postData(accessToken, `https://api.tdameritrade.com/v1/accounts/${process.env.account_id}/${ TEST ? 'savedorders': 'orders' }`, {
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