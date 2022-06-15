//import fs from 'fs';
import { getData } from '../../oauth/fetch.mjs';
//const credentials = JSON.parse(fs.readFileSync('private/credentials.json', 'utf-8'));

export async function getPositions(accessToken) {
    const data = await getData(accessToken, 'https://api.tdameritrade.com/v1/accounts/' + process.env.account_id, { fields: 'positions' });
    return data;
}