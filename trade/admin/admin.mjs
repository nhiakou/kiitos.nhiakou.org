import { getData } from "/login/fetch.mjs";

export async function getOrders() {
    return await getData(`https://api.tdameritrade.com/v1/accounts/${localStorage.getItem('account_id')}/savedorders`);
}

export async function sendMail(html) {
    const mail = await fetch('https://api.mailgun.net/v3/sandbox0b19bd1dd4f54354927b99b3771b7061.mailgun.org/messages', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Basic ' + btoa('api:' + localStorage.getItem('mailgun_key'))},
        body: new URLSearchParams({
            from: 'Kiitos <kiitos@nhiakou.org>',
            to: "thonly@protonmail.com",
            subject: "TDA",
            html
        })
    });
    
    return mail.json();
}