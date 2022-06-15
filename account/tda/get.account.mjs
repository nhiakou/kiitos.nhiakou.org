//import fs from 'fs';
import { getData } from '../../oauth/fetch.mjs';
// import credentials from '../private/credentials.json' assert { type: 'json' };
// import credentials from '../private/credentials.json' assert { type: 'json' };
// const {getData} = require('../oauth/fetch');
// const {account_id} = require('../private/credentials.json');
//const credentials = JSON.parse(fs.readFileSync('private/credentials.json', 'utf-8'));

export async function getAccounts(accessToken) {
    const data = await getData(accessToken, 'https://api.tdameritrade.com/v1/accounts', { fields: '' });
    return data;
}

export async function getAccount(accessToken) {
    const data = await getData(accessToken, 'https://api.tdameritrade.com/v1/accounts/' + process.env.account_id, { fields: '' });
    return data;
}


// module.exports.getAccounts = getAccounts;
// module.exports.getAccount = getAccount;