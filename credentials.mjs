import fs from 'fs';

const key = fs.readFileSync('login/localhost-key.pem');
const cert = fs.readFileSync('login/localhost.pem');

const client_id = "YQAKJUPBNEXHQENRZXWUOAXDTP862IYB";
const redirect_uri = 'https://localhost:8080/auth';

export { key, cert, client_id, redirect_uri };