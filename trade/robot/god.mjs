import { getTDA, openLongPosition, openShortPosition, closeLongPosition, closeShortPosition } from '../tda.mjs';
import { renderAstro } from '../render/astro.mjs';
import { renderMarket, renderMarkets } from '../render/market.mjs';
import { renderPositions, renderButtons } from '../render/positions.mjs';
import { formatToDollars, formatToPercents, formatToQuantity } from "/utils.mjs";
import { sendMail } from '../admin/admin.mjs';

const QUANTITY_STEP = 5;
const MIN_PROFIT = 50;
const STOP_LOSS = 100;
const SUPPLY_DEMAND = 0.50; // ask vs bid size

export async function analyzeStocks() {
    const data = await renderTradePage();
    console.log(data);

    // todo: add bid size // add stocks to watch too!
    data.positions.securitiesAccount.positions.forEach(position => {
        const currentPriceString = document.getElementById(position.instrument.symbol + '-price').textContent;
        const currentPriceFloat = parseFloat(currentPriceString.replace('$', ''));
        const quantity = -position.shortQuantity || position.longQuantity;
        const change = quantity > 0 ? currentPriceFloat - position.averagePrice : position.averagePrice - currentPriceFloat;
        const profit = change >= 0;

        const formattedChange = formatToDollars(change);
        const formattedQuantity = formatToQuantity(quantity);
        const formattedDollarProfit = formatToDollars((currentPriceFloat - position.averagePrice) * quantity);
        const formattedPercentProfit = formatToPercents((currentPriceFloat / position.averagePrice * 100 - 100)*Math.sign(quantity));

        const subject = `${position.instrument.symbol}: ${formattedChange} x ${formattedQuantity} = ${formattedDollarProfit}`;
        const message = `<u>${position.instrument.symbol}</u> x ${formattedQuantity}: <b style="color:${profit ? 'green' : 'red'}">${formattedChange}</b>
        <br><br>
        <b>$ Profit:</b> <span style="color:${profit ? 'green' : 'red'}">${formattedDollarProfit}</span>
        <br>
        <b>% Profit:</b> <span style="color:${profit ? 'green' : 'red'}">${formattedPercentProfit}</span>
        <br><br>
        Current: <span style="color:${profit ? 'green' : 'red'}">${currentPriceString}</span>
        <br>
        Average: ${formatToDollars(position.averagePrice)}
        <br><br>
        `;

        if (isMarketOpen(data.market)) sendMail(subject, message);
    });
}

function isMarketOpen(market) {
    if (market.equity.equity.isOpen) {
        const now = new Date();
        const start = new Date(market.equity.equity.sessionHours.regularMarket[0].start);
        const end = new Date(market.equity.equity.sessionHours.regularMarket[0].end);
        return start <= now && now <= end;
    } else {
        return false;
    }
}

export async function renderTradePage() {
    const data = await getTDA();
    renderAstro(data.stocks['BRK.A']);

    renderMarket(data.market);
    renderMarkets(data.stocks);
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
- later: sound effects alarms // when begin, start, successful trade

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