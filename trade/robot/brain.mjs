import { CASH_STOCKS, MARGIN_STOCKS } from "./stocks.mjs";
import { placeMarketOrder } from "../tda.mjs";

const INTERVAL = 10; // 15 minutes => 2hrs x 4 = 8 checks per day
// most active trading time => more accurate supply/demand
// same day trading => 7 - 9
// inter day trading => 8 - 10
const START = 7; // start trading hour 8
const END = 13; // end trading hour 10
function isTradingHour() {
    const now = new Date();
    return START <= now.getHours() && now.getHours() <= END;
}

const DAY_RULE = 12*60*60*1000; // day trader rule = at least 12 hours have passed
function isNotRoundTrip(stock) {
    if (stock.lastTrade) {
        return new Date() - new Date(stock.lastTrade.transactionDate) > DAY_RULE;
    } else {
        return true;
    }
}

const LEVEL = 0.5; 
/* MECHANICAL RULES
1. brk DOWN => Bear // Supply/demand
2. brk UP => Bull // Demand/supply
3. BEAR => short // Supply/demand
4. BULL => long // Demand/supply

// BOTTOM 25%
- $100 per day
- $500 per week
- $2K per month
- $26K per year (260*100)
// TOP 10%
- $20K cash => $1k/day => $200K/year

LEVELS
- level: 1 - 10
- quantity: 10 - 100
- profit/day: $100 - $1000
*/

const MIN_DESIRED_PROFIT = 20*LEVEL; // => $10 close position when market reverses
const MAX_DESIRED_PROFIT = 100*LEVEL; // => $50 close position
function hasPositionReachedDesiredProfit(stock, reverse=false) {
    const desiredProfit = reverse ? MIN_DESIRED_PROFIT : MAX_DESIRED_PROFIT;
    if (stock.position.shortQuantity) {
        return (stock.position.averagePrice - stock.mark) * stock.position.shortQuantity >= desiredProfit;
    } else {
        return (stock.mark - stock.position.averagePrice) * stock.position.longQuantity >= desiredProfit;
    }
}

const MIN_STOP_LOSS = 100*LEVEL; // $50 => close position when market reverses
const MAX_STOP_LOSS = 200*LEVEL; // $100 => close position
function hasPositionReachedStopLoss(stock, reverse=false) {
    const stopLoss = reverse ? MIN_STOP_LOSS : MAX_STOP_LOSS;
    if (stock.position.shortQuantity) {
        return (stock.mark - stock.position.averagePrice) * stock.position.shortQuantity > stopLoss;
    } else {
        return (stock.position.averagePrice - stock.mark) * stock.position.longQuantity > stopLoss;
    }
}

const QUANTITY_STEP = 10*LEVEL; // 5 open slowly // close ALL right away
// total = 3x // < 100
const MAX_QUANTITY = 20*LEVEL; // 10 opening max quantity
const MAX_CASH_QUANTITY = 60*LEVEL; // 30
const MAX_MARGIN_QUANTITY = 40*LEVEL; // 20
function getAllowQuantity(stock, quantity) {
    if (stock.position) {
        const availableQuantity = stock.position.shortQuantity ? (MAX_MARGIN_QUANTITY - stock.position.shortQuantity) : (MAX_CASH_QUANTITY - stock.position.longQuantity);
        return quantity <= availableQuantity ? quantity : availableQuantity;
    } else {
        return quantity <= MAX_QUANTITY ? quantity : MAX_QUANTITY;
    }
}

export { MAX_QUANTITY, QUANTITY_STEP, INTERVAL };

// KIITOS

const BEAR_CONDITION = 2; // supply / demand
function isBearMarket(stocks) {
    const market = stocks['BRK.B'];
    return market.askSize / market.bidSize > BEAR_CONDITION;
}

export function kiitos(account, stocks) {
    if (isTradingHour()) {
        if (isBearMarket(stocks)) {
            MARGIN_STOCKS.forEach(stock => bearMarketMarginTrade(account, stocks[stock]));
            CASH_STOCKS.forEach(stock => bearMarketCashTrade(stocks[stock]));
        } else {
            CASH_STOCKS.forEach(stock => bullMarketCashTrade(account, stocks[stock]));
            MARGIN_STOCKS.forEach(stock => bullMarketMarginTrade(stocks[stock]));
        } 
    }
}

// BEAR

const SUPPLY_DEMAND = 4; // => open short
function hasEnoughSupply(stock) {
    const quantity = Math.floor(stock.askSize / stock.bidSize);
    return quantity > SUPPLY_DEMAND ? getAllowQuantity(stock, quantity) : 0;
}

const MAX_MARGIN = 0.5; // using only 50% of available margin
function hasEnoughMargin(account, stock, quantity) {
    return stock.mark * quantity < account.securitiesAccount.currentBalances.buyingPower * MAX_MARGIN;
}

// short and cover only
function bearMarketMarginTrade(account, stock) {
    const quantity = hasEnoughSupply(stock);

    if (stock.position) {
        if (isNotRoundTrip(stock) && (hasPositionReachedDesiredProfit(stock) || hasPositionReachedStopLoss(stock))) {
            // close short position
            placeMarketOrder('Cover', stock.symbol, stock.position.shortQuantity);
        } else if (quantity && hasEnoughMargin(account, stock, quantity)) {
            // add to short position
            placeMarketOrder('Short', stock.symbol, quantity);
        }
    } else {
        if (quantity && hasEnoughMargin(account, stock, quantity)) {
            // begin short position
            placeMarketOrder('Short', stock.symbol, quantity);
        }
    }
}

// market reverses: close long positions
function bearMarketCashTrade(stock) {
    if (stock.position && isNotRoundTrip(stock) && (hasPositionReachedDesiredProfit(stock, true) || hasPositionReachedStopLoss(stock, true))) {
        placeMarketOrder('Sell', stock.symbol, stock.position.longQuantity);
    }
}

// BULL

const DEMAND_SUPPLY = 4; // => open long
function hasEnoughDemand(stock) {
    const quantity = Math.floor(stock.bidSize / stock.askSize);
    return quantity > DEMAND_SUPPLY ? getAllowQuantity(stock, quantity) : 0;
}

const MAX_CASH = 0.7; // using only 70% of available cash
function hasEnoughCash(account, stock, quantity) {
    return stock.mark * quantity < account.securitiesAccount.currentBalances.availableFundsNonMarginableTrade * MAX_CASH;
}

// buy and sell only
function bullMarketCashTrade(account, stock) {
    const quantity = hasEnoughDemand(stock);

    if (stock.position) {
        if (isNotRoundTrip(stock) && (hasPositionReachedDesiredProfit(stock) || hasPositionReachedStopLoss(stock))) {
            // close long position
            placeMarketOrder('Sell', stock.symbol, stock.position.longQuantity);
        } else if (quantity && hasEnoughCash(account, stock, quantity)) {
            // add to long position
            placeMarketOrder('Buy', stock.symbol, quantity);
        }
    } else {
        if (quantity && hasEnoughCash(account, stock, quantity)) {
            // begin long position
            placeMarketOrder('Buy', stock.symbol, quantity);
        }
    }
}

// market reverses: close short positions
function bullMarketMarginTrade(stock) {
    if (stock.position && isNotRoundTrip(stock) && (hasPositionReachedDesiredProfit(stock, true) || hasPositionReachedStopLoss(stock, true))) {
        placeMarketOrder('Cover', stock.symbol, stock.position.shortQuantity);
    }
}