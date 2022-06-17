import { promises as fs } from 'fs';
import https from 'https';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import puppeteer from 'puppeteer';
import { key, cert, client_id, redirect_uri } from './login/credentials.mjs';

const bot = express();
bot.use(cors());
bot.use(express.json());
bot.use(express.urlencoded({ extended: true })); 

bot.get('/', async (req, res) => {
    res.json(JSON.parse(await fs.readFile('login/credentials.json')));
});

bot.post('/login', async (req, res) => {
    const browser = await puppeteer.launch({ headless: true, devtools: false });
    // Page: TDA Login
    const page = await browser.newPage();
    await page.goto(`https://auth.tdameritrade.com/auth?response_type=code&redirect_uri=${encodeURI(redirect_uri)}&client_id=${client_id}%40AMER.OAUTHAP`);
    await page.type('#username0', req.body.username);
    await page.type('#password1', req.body.password);
    await page.click('#accept');
    // Approve on iPhone
    await page.waitForSelector('#stepup_trustthisdevice0');
    await page.evaluate(() => document.querySelector('#trustthisdevice0_0').click());
    await page.click('#accept');
    await page.waitForSelector('#stepup_authorization0');
    await page.click('#accept');
    // Page: /auth
    await page.waitForSelector('pre');
    const tokens = await page.evaluate(() => JSON.parse(document.querySelector('pre').textContent));
    await page.close();
    await browser.close();
    res.json(await saveTokens(tokens));
});

bot.get('/auth', async (req, res) => {
    const response = await fetch('https://api.tdameritrade.com/v1/oauth2/token', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({
            'grant_type': 'authorization_code',
            'access_type': 'offline',
            'code': req.query.code, 
            'client_id': client_id + '@AMER.OAUTHAP',
            'redirect_uri': redirect_uri
        })
    });

    res.json(await response.json());
});

async function saveTokens(tokens) {
    // { account_id, client_id, access_token, refresh_token, scope, expires_in, refresh_token_expires_in, token_type, access_last_update, refresh_last_update }
    const credentials = {};
    credentials.client_id = client_id;
    credentials.account_id = await getAccountID(tokens.access_token);
    credentials.access_token = tokens.access_token;
    credentials.refresh_token = tokens.refresh_token;
    credentials.scope = tokens.scope;
    credentials.expires_in = tokens.expires_in;
    credentials.refresh_token_expires_in = tokens.refresh_token_expires_in;
    credentials.token_type = tokens.token_type;
    credentials.access_last_update = new Date().toString();
    credentials.refresh_last_update = new Date().toString();
    await fs.writeFile('login/credentials.json', JSON.stringify(credentials));
    return credentials;
}

async function getAccountID(accessToken) {
    const response = await fetch('https://api.tdameritrade.com/v1/accounts', {
        method: 'GET',
        headers: {'Authorization': 'Bearer ' + accessToken}
    });

    const accounts = await response.json();
    return accounts[0].securitiesAccount.accountId;
}

https.createServer({key, cert}, bot).listen(999);