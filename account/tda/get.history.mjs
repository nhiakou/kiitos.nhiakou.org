//import fs from 'fs';
import { getData } from '../../oauth/fetch.mjs';
//const credentials = JSON.parse(fs.readFileSync('private/credentials.json', 'utf-8'));

export async function getHistory(accessToken) {
    const data = await getData(accessToken, `https://api.tdameritrade.com/v1/accounts/${process.env.account_id}/transactions`, { type: 'trade', startDate: getDate(false), endDate: getDate(true) });
    return data;
}

function getDate(now) {
    const dt = now ? new Date() : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const date = dt.toLocaleString().split(', ')[0].split('/');
    return `${date[2]}-${String(date[0]).padStart(2, '0')}-${String(date[1]).padStart(2, '0')}`;
}