import fs from 'fs';

// mkcert 192.168.1.194
const key = fs.readFileSync('login/192.168.1.194-key.pem');
const cert = fs.readFileSync('login/192.168.1.194.pem');

const client_id = "YQAKJUPBNEXHQENRZXWUOAXDTP862IYB";
const redirect_uri = "https://192.168.1.194:999/auth";

export { key, cert, client_id, redirect_uri };