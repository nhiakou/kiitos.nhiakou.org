import fs from 'fs';
import https from 'https';
import express from 'express';
import fetch from 'node-fetch';
import puppeteer from 'puppeteer';

const key = fs.readFileSync('login/localhost-key.pem');
const cert = fs.readFileSync('login/localhost.pem');
const redirect_uri = "https://localhost:8080/auth";

const bot = express();
//bot.use(express.json()); // does not work don't know why...
bot.use(express.urlencoded({ extended: true })); 

bot.get('/', (req, res) => {
    res.send("Hello World");
});

bot.post('/login', async (req, res) => {
    // const browser = await puppeteer.launch({
    //     headless: false,
    //     devtools: false
    // });
    
    // const page = await browser.newPage();
    // await page.goto(`https://auth.tdameritrade.com/auth?response_type=code&redirect_uri=${encodeURI(redirect_uri)}&client_id=${req.body.client}%40AMER.OAUTHAP`);
    // await page.type('#username0', req.body.username);
    // await page.type('#password1', req.body.password);
    // await page.click('#accept');
    // // Approve on iPhone
    // await page.waitForSelector('#stepup_trustthisdevice0');
    // await page.evaluate(() => document.querySelector('#trustthisdevice0_0').click());
    // await page.click('#accept');
    // await page.waitForSelector('#stepup_authorization0');
    // await page.click('#accept');
    
    // await page.waitForSelector('pre');
    // const token = await page.evaluate(() => document.querySelector('pre').textContent);
    // res.json({"hi": "hello"});
    // console.log(token)
    // await page.close();
    // await browser.close();
    console.log("hi")
    res.json({"hi": "hello"});
});

bot.get('/auth', async (req, res) => {
    const response = await fetch('https://api.tdameritrade.com/v1/oauth2/token', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({
            'grant_type': 'authorization_code',
            'access_type': 'offline',
            'code': req.query.code, 
            'client_id': "YQAKJUPBNEXHQENRZXWUOAXDTP862IYB" + '@AMER.OAUTHAP',
            'redirect_uri': redirect_uri
        })
    });

    res.json(await response.json());
});

https.createServer({key, cert}, bot).listen(8080);