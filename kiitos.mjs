import { promises as fs } from 'fs';
import https from 'https';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import puppeteer from 'puppeteer';
import { cert, key, credentials } from './login/private/credentials.mjs';

const bot = express();
bot.use(cors());
bot.use(express.json());
bot.use(express.urlencoded({ extended: true })); 

bot.get('/', async (req, res) => {
    res.json({personal: JSON.parse(await fs.readFile('login/private/personal.credentials.json')), corporate: JSON.parse(await fs.readFile('login/private/corporate.credentials.json'))});
});

bot.post('/login', async (req, res) => {
    const browser = await puppeteer.launch({ headless: true, devtools: false });
    // Page: TDA Login
    const page = await browser.newPage();
    await page.goto(`https://auth.tdameritrade.com/auth?response_type=code&redirect_uri=${encodeURI(credentials[req.body.account].redirect_uri)}&client_id=${credentials[req.body.account].client_id}%40AMER.OAUTHAP`);
    await page.type('#username0', req.body.username);
    await page.type('#password1', req.body.password);
    await page.click('#accept');
    // Approve on iPhone
    await page.waitForSelector('#stepup_trustthisdevice0');
    await page.evaluate(() => document.querySelector('#trustthisdevice0_0').click());
    await page.click('#accept');
    await page.waitForSelector('#stepup_authorization0');
    await page.click('#accept');
    // Page: /personal and /corporate
    await page.waitForSelector('pre');
    const tokens = await page.evaluate(() => JSON.parse(document.querySelector('pre').textContent));
    //tokens.account_type = (await page.url()).split('/')[3];
    await page.close();
    await browser.close();
    tokens.mailgun_key = req.body.mail;
    res.json(await saveTokens(req.body.account, tokens));
});

bot.get('/auth', async (req, res) => {
    const response = await fetch('https://api.tdameritrade.com/v1/oauth2/token', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({
            'grant_type': 'authorization_code',
            'access_type': 'offline',
            'code': req.query.code, 
            'client_id': credentials[req.query.account].client_id + '@AMER.OAUTHAP',
            'redirect_uri': credentials[req.query.account].redirect_uri
        })
    });

    res.json(await response.json());
});

async function saveTokens(account, tokens) {
    // { access_token, refresh_token, scope, expires_in, refresh_token_expires_in, token_type }
    tokens.client_id = credentials[account].client_id;
    tokens.account_id = await getAccountID(tokens.access_token);
    tokens.access_last_update = new Date().toString();
    tokens.refresh_last_update = new Date().toString();
    await fs.writeFile(`login/private/${account}.credentials.json`, JSON.stringify(tokens));
    return tokens;
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