import { getTDA, openLongPosition, openShortPosition, closeLongPosition, closeShortPosition } from '../tda.mjs';
import { renderAstro } from '../render/astro.mjs';
import { renderMarket, renderMarkets } from '../render/market.mjs';
import { renderPositions, renderButtons } from '../render/positions.mjs';
import { formatToDollars, formatToPercents, formatToQuantity } from "/utils.mjs";
import { sendMail } from '../admin/admin.mjs';

const QUANTITY_STEP = 5; // open slowly // close ALL right away?
const MIN_PROFIT = 50; // => close position
const STOP_LOSS = 100; // => close position
const SUPPLY_DEMAND = 4; // => open short
const DEMAND_SUPPLY = 4; // => open long

export async function analyzeStocks() {
    const data = await renderTradePage();
    data.positions.securitiesAccount.positions.forEach(position => data.stocks[position.instrument.symbol].position = position);
    console.log(data);

    ['BRK.B', 'AAPL', 'SQ', 'ABNB'].forEach(stock => {
        
        let averagePrice, quantity, change;
        
        if (data.stocks[stock].position) {
            averagePrice = data.stocks[stock].position.averagePrice;
            quantity = -data.stocks[stock].position.shortQuantity || data.stocks[stock].position.longQuantity;
            change = quantity > 0 ? data.stocks[stock].mark - averagePrice : averagePrice - data.stocks[stock].mark;
        } else {
            averagePrice = data.stocks[stock].mark;
            quantity = 1;
            change = data.stocks[stock].mark - averagePrice;
        }

        const profit = change >= 0; 
        const formattedAveragePrice = formatToDollars(averagePrice);
        const formattedChange = formatToDollars(change);
        const formattedQuantity = formatToQuantity(quantity);
        const formattedDollarProfit = formatToDollars(change * Math.abs(quantity));
        const formattedPercentProfit = formatToPercents(quantity < 0 ? (averagePrice / data.stocks[stock].mark * 100 - 100) : (data.stocks[stock].mark / averagePrice * 100 - 100));

        const subject = `${stock}: ${formattedChange} x ${formattedQuantity} = ${formattedDollarProfit} | ${formattedPercentProfit}`;
        const message = `<u>${stock}</u>: <span style="color:${profit ? 'green' : 'red'}">${formattedChange}</span> x ${formattedQuantity} = <b style="color:${profit ? 'green' : 'red'}">${formattedDollarProfit}</b> | <span style="color:${profit ? 'green' : 'red'}">${formattedPercentProfit}</span>
        <br><br>
        Current: <span style="color:${profit ? 'green' : 'red'}">${formatToDollars(data.stocks[stock].mark)}</span>
        <br>
        Average: ${formattedAveragePrice}
        <br>
        Volume: ${formatToQuantity(data.stocks[stock].totalVolume)}
        <br><br>
        <u>Supply: <b>${(data.stocks[stock].askSize / data.stocks[stock].bidSize).toFixed(2)}</b>x</u>
        <br>
        Ask Price: ${formatToDollars(data.stocks[stock].askPrice)}
        <br>
        Ask Size: <b>${formatToQuantity(data.stocks[stock].askSize)}</b>
        <br>
        Highest Price: ${formatToDollars(data.stocks[stock].highPrice)}
        <br><br>
        <u>Demand: <b>${(data.stocks[stock].bidSize / data.stocks[stock].askSize).toFixed(2)}</b>x</u>
        <br>
        Bid Price: ${formatToDollars(data.stocks[stock].bidPrice)}
        <br>
        Bid Size: <b>${formatToQuantity(data.stocks[stock].bidSize)}</b>
        <br>
        Lowest Price: ${formatToDollars(data.stocks[stock].lowPrice)}
        <br><br>
        PE Ratio: ${data.stocks[stock].peRatio}
        <br>
        Volatility: ${data.stocks[stock].volatility}
        <br>
        1-Year: <b>${formatToDollars(data.stocks[stock]['52WkLow'])}</b> to <b>${formatToDollars(data.stocks[stock]['52WkHigh'])}</b>
        `;

        if (isMarketOpen(data.market)) sendMail(subject, message);
        sendMail(subject, message)
    });
}

function isMarketOpen(market) {
    if (market.equity.EQ.isOpen) {
        const now = new Date();
        const start = new Date(market.equity.EQ.sessionHours.regularMarket[0].start);
        const end = new Date(market.equity.EQ.sessionHours.regularMarket[0].end);
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