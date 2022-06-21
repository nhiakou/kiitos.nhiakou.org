import os from 'os';

console.log(os.networkInterfaces().en0[0].address);
// mkcert 192.168.1.194