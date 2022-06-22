/* ENJOY THE GAME: zero-sum => non-zero-sum
1. I will win some, and I will lose some
2. start small: just 100 stocks until stronger formula
3. abnb => my dollars + sw: just enough to live comfortably
4. stocks => nk: be willing to lose it all; just enough to make a decent income
5. gov => my cryptos: be willing to lose it all; just leave it alone or sell it all to use on hb instead
   to => hb: only spend on hb what I make from to; end of zero-sum game; start of non-zero-sum game

EASY GOAL:
- $100 per day
- $500 per week
- $2K per month
- $26K per year (260*100)

REMEMBER:
1. if I believe in HB, then the current financial system will collapse
   which means I should be biased towards bear/shorting...
2. ONLY use my app to trade; don't use tda app; 
3. DO NOT trade during market hours; let kiitos trade; but can double check kiitos (bad sidereal)
4. I can update formulas but at night (good sidereal)

TODO:
- later: sound effects alarms // when begin, start, successful trade

*/

import { renderTradePage } from "../render/render.mjs";
import { sendAlert } from "./alert.mjs";

export async function analyzeStocks() {
    const data = await renderTradePage();
    data.positions.securitiesAccount.positions.forEach(position => data.stocks[position.instrument.symbol].position = position);
    console.info(new Date().toLocaleString())
    console.log(data);

    sendAlert(data.market, data.stocks);
}