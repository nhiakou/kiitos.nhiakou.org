import os from 'os';

console.log(os.networkInterfaces().en0[0].address); 
// => create dns A record
// host -a dns.nhiakou.org
// dig dns.nhiakou.org
// https://toolbox.googleapps.com/apps/dig/#A/_acme-challenge.dns.nhiakou.org

// chrome://flags/#allow-insecure-localhost
// mkcert dns.nhiakou.org // local machine only
// sudo certbot --manual --preferred-challenges dns certonly -d dns.nhiakou.org

/*
Certificate is saved at: /etc/letsencrypt/live/dns.nhiakou.org/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/dns.nhiakou.org/privkey.pem
This certificate expires on 2022-09-19. // 3 months // 90 days // same as TDA!
These files will be updated when the certificate renews.
*/

// sudo ls -l /etc/letsencrypt/live/dns.nhiakou.org
// pwd = location of current directory

// sudo cp /etc/letsencrypt/live/dns.nhiakou.org/fullchain.pem /Users/heartbank/Desktop/HeartBank®/Nhia\ Kou\ LLC/nhiakou.org/kiitos.nhiakou.org
// sudo cp /etc/letsencrypt/live/dns.nhiakou.org/privkey.pem /Users/heartbank/Desktop/HeartBank®/Nhia\ Kou\ LLC/nhiakou.org/kiitos.nhiakou.org