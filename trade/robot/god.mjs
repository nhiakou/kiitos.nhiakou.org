import { getTDA, openLongPosition, openShortPosition, closeLongPosition, closeShortPosition } from '../tda.mjs';
import { renderAstro } from '../render/astro.mjs';
import { renderMarket } from '../render/market.mjs';
import { renderPositions } from '../render/positions.mjs';
import { renderButtons } from '../render/buttons.mjs';

const QUANTITY_STEP = 5;
const MIN_PROFIT = 50;

export async function analyzeStocks() {
    const data = await renderTradePage();
    console.log(data);
}

export async function renderTradePage() {
    const data = await getTDA();
    renderAstro(data.stocks['BRK.A']);

    renderMarket(data.stocks);
    renderPositions(data.positions);
    renderButtons();

    return data;
}

/*

ENJOY THE GAME: zero-sum => non-zero-sum
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
- get coinbase data over weekend for monday trading of SQ ?
1. first god formula
- show that's it's running

*/

export async function placeMarketOrder(order, symbol, quantity) {
    switch (order) {
        case 'buy':
            return {status: await openLongPosition(symbol, quantity)};
        case 'sell':
            return {status: await closeLongPosition(symbol, quantity)};
        case 'short':
            return {status: await openShortPosition(symbol, quantity)};
        case 'cover':
            return {status: await closeShortPosition(symbol, quantity)};
    }        
}

export { QUANTITY_STEP };