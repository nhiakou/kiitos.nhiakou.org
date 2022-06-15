import { createNatalChart } from '/astro/natal.chart.mjs';
import { renderAstro } from './render.astro.mjs';
import { renderAccount } from './render.account.mjs';
import { renderSummary } from './render.summary.mjs';

window.onload = async () => {
  const astro = await createNatalChart('horoscope');
  await renderAstro(new Date(), astro.transit);

  const response = await fetch('/tda?page=account');
  const data = await response.json()
  renderAccount(data.account);
  renderSummary(data.history);
  console.log(await test2())
}

async function test() {
  const response = await fetch('https://api.tdameritrade.com/v1/accounts', {
    method: 'GET',
    mode: 'cors', 
    cache: 'no-cache',
    headers: {
      'Authorization': 'Bearer ' + "OcdTKOfUjGKymmqGq5rMzQXaNwmfA264hc2lQe43RH+QWRbMSHNfNf7IYzvJ7BByq3aqrkvHLlFoeZRyXEZ1HVC/9wAidIPC9DxD3Zs6wrBqg0TujA4QQx6YmpnuWLgAzGA4VkZgKEBdfJL1Co9feHqCa6OOuNcbY90Iq2XBkROQkMwJdEHVSn2CPyKMR9dDbbAc1MDzJkImOyzCYu+rJmMEmXi7YaxZo/Cwqz86aI9+XmYAOEvtDANHuXaZ6L9DZ9spBwqrJuq/JYPR4L3t6GITwfCLLnNP9pYHM6FYtVuXOFzlgSVjT15HEiN4ieZVcLdqxpGf42AzotU4cDnxgtPbYppH986WWh2jZ4KQAudXNJLl4Egjapr3bCH9q7dqpM24Z38zJhgqFgI21RJ5NEkIX0T/gaiot39MGvAdQ33s2iSg/MehhH8kyeRL0EU/I2gmN2snUMftPTO5eDV8qofBCEmtyp46pLkynaeTOpWduzGnHR+xOGyAnGbtUvRGCQkyPvi7IumuXqcyAVMU/o1hMYfNnvFT/fiDx6w0TSrmG7gvCnKjPHj9EM1100MQuG4LYrgoVi/JHHvld6qE32ckdNuqyhsvLOE7f92ELUHXK4tWKJAeOiNDUWxdaSCA9ukvtLJyMdg6fZ8DgO1HUPRO+51bg6zBU4knX+ViyK9bl2cdKYzieKiGlWjf3J5PtKW2DSeFdxl7yuEGKTQR1iSXUQaTYgavdG7IWTAhInkvhCNi8zgDayKVSAUKiC9aZYwCMncG0MKQTYEuybYUjcgpgjRD1cBGDGQi2pr2BZwDuYbYbAq3QshUXcvhSsfFJSkiyfOJT5CRHgu3jChdRJgECSa/YAen9LA4cRne8xzqqnfCPJIBsG4GbeuUMKn/l2xAjByDr6CkGXrwwsO3Tl1nHpxtpNkhZJ3KR4jKR+P1JjvX2w8hSUQbVJ3x0B9iXEjk/b31//DBuNEuJmzsRSfMF1872tPk5qRH247/BY0zMk5FS9UpABMgSsKLauR/5glcM2tb05wAbbWWCSYgEqXlfFlzNQ9TI3q067n3I34A+ZUpEFpYIJ/VslKPxK1o90RDkf2E7o/uHrR6dVUwweSM3CAFXiZBpmHKjM94Q4m1R517fD7ULgEebXVRM/exOqmKz73v8A4=212FD3x19z9sWBHDJACbC00B75E"
    }
  });

  return response.json();
}

async function test2() {
  const response = await fetch('https://api.tdameritrade.com/v1/oauth2/token', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
          'grant_type': 'refresh_token',
          'refresh_token': "G0snyPRkbgM46eBYh12zI0QrFT2QJwDwDmSj2P/7SbC/y/WbTm7jYq1Ql1jCViYkuPGQBMCmDPeqSnmUyuqGYld8qNH8hWgv0AgKrfivW2Zieu4fp5aaB2b9XqFy3sULMfMmYkTmHf4YUDRszMRR6UnujdcC5p41Y6VHrq6eRZi0x7uOU8gwO34aXAPOyE8Z0JlzVnx7OL+KwmOuJTQFYDiJWHVmbB9qKJMvDaaLsAwQphxBCn/zpR+5AYKzstibHQSc7O5Jiy8VVAUSthDi6Ckk7vseZHzPRdGp9A5h18TDiNykelvU+edM2k8xk2zjiPEx2TWGGJ71LtZfcu5wNe/mhQb3k72GFZ20aSWbarxQcmwvyqHvVhQrAVxhct2VmNYc+uez629cRM5wDvZwoJnDvd5h4yRFasHKYginTVbD0f8np/lTPDuPunw100MQuG4LYrgoVi/JHHvlu01utUEhtmF0Vcey0Fxbej9FBS0rsuSmsBaBceWchSdh2E3AKOjaFx1u+wAbd2r101z1pcdFm0qkRVE2eZGkxzHstGzz0biWJVq9DdRCzGSiP5rVDnpaxIHYVNvnr36gdW4czvia30Lej2aCXAQ5SSl5RKklxAge1CIYQDSw4UYorZjO2F/I7tEZQpbbul+JAER3+9+rX4XvK3Mpdpgp+A3fiFk2x4J6QyqJB5Fj67BP2EUfqX/swI7nb36wybR7HQQUsKjxHhSssWSCQWxTQBPDXfAErCuE0M9J1GEpRA7TJVyvYzWe5e9bxyft6l1ciU4d6hrdpjkAGnMf2/XNtCJkoA+hXyEyR4rLI3pcVjGEyFtzDv8s9AR4rAtTlfAQPNjylBdy7kbJw+GwpxtTeum/kuI7HUgxGLujMJ2Jzzg4L5DQwbB2WKIeXr0=212FD3x19z9sWBHDJACbC00B75E",
          'client_id': "YQAKJUPBNEXHQENRZXWUOAXDTP862IYB"
      })
  });

  return response.json();
}