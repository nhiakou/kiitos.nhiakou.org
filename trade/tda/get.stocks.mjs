import { getData } from '../../oauth/fetch.mjs';

export async function getStocks(accessToken) {
    const data = await getData(accessToken, 'https://api.tdameritrade.com/v1/marketdata/quotes', { symbol: 'BRK.A,BRK.B,AAPL,SQ' });
    return data;
}


// todo for v2: use streaming api?