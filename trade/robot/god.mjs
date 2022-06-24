import { LIVE } from "/login/fetch.mjs";
import { renderTradePage } from "../render/render.mjs";
import { sendAlert } from "./alert.mjs";
import { kiitos } from "./brain.mjs";

export async function analyzeStocks() {
   const data = await renderTradePage();
   console.info(new Date().toLocaleString())
   console.log(data);

   if (!LIVE || isMarketOpen(data.market)) {
      kiitos(data.account, data.stocks);
      sendAlert(data.stocks);
   }
}

export function isMarketOpen(market) {
   if (market.equity.EQ.isOpen && market.equity.EQ.sessionHours) {
       const now = new Date();
       const start = new Date(market.equity.EQ.sessionHours.regularMarket[0].start);
       const end = new Date(market.equity.EQ.sessionHours.regularMarket[0].end);
       return start <= now && now <= end;
   } else {
       return false;
   }
}