import os from 'os';

console.log('https://' + os.networkInterfaces().en0[0].address + ':999');
// mkcert 192.168.1.194