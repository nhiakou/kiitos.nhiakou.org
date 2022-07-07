export async function sendMail(tao, subject, html) {
    const to = tao === 'yin' ? "thonly@protonmail.com" : "heartbank@yandex.com";
    const mail = await fetch('https://api.mailgun.net/v3/sandbox0b19bd1dd4f54354927b99b3771b7061.mailgun.org/messages', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': 'Basic ' + btoa('api:' + localStorage.getItem('personal-mailgun_key'))},
        body: new URLSearchParams({
            from: 'Kiitos TDA <kiitos@nhiakou.org>',
            to,
            subject,
            html
        })
    });
    
    //console.log(subject);
    return mail.json();
}