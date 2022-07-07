import { LIVE } from "/login/fetch.mjs";
import { sendAlert } from "./alert.mjs";
import { kiitos } from "./tao.mjs";

export async function god(tao, data) {
   console.info(new Date().toLocaleString())
   console.log(data);

   if (!LIVE || isMarketOpen(data.market)) {
      kiitos(tao, data.account, data.stocks);
      if (!LIVE || isEvery30Minutes()) sendAlert(tao, data.stocks);
   }
}

export function isMarketOpen(market) {
   const equityMarket = market.equity.EQ || market.equity.equity;
   if (equityMarket.isOpen && equityMarket.sessionHours) {
       const now = new Date();
       const start = new Date(equityMarket.sessionHours.regularMarket[0].start);
       const end = new Date(equityMarket.sessionHours.regularMarket[0].end);
       return start <= now && now <= end;
   } else {
       return false;
   }
}

function isEvery30Minutes() {
   const now = new Date();
   return now.getMinutes() === 30;
}