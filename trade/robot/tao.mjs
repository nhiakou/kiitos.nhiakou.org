import { CASH_STOCKS, MARGIN_STOCKS } from "./stocks.mjs";
import { placeMarketOrder } from "../tda.mjs";

const INTERVAL = 1; 
// 15 minutes => 2hrs x 4 = 8 checks per day // max > 30 secs
const START = 7; // start trading hour
const END = 13; // end trading hour
// most active trading time => more accurate supply/demand
// same day trading => 7-9 & 11-13 => most active
// inter day trading => 9 - 11 => least active
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

const DESIRED_PROFIT = { MIN: 20*LEVEL, MAX: 100*LEVEL };
// min => $10 close position when market reverses
// max => $50 close position
function hasPositionReachedDesiredProfit(stock, reverse=false) {
    const desiredProfit = reverse ? DESIRED_PROFIT.MIN : DESIRED_PROFIT.MAX;
    if (stock.position.shortQuantity) {
        return (stock.position.averagePrice - stock.mark) * stock.position.shortQuantity >= desiredProfit;
    } else {
        return (stock.mark - stock.position.averagePrice) * stock.position.longQuantity >= desiredProfit;
    }
}

const STOP_LOSS = { MIN: 100*LEVEL, MAX: 200*LEVEL };
// min $50 => close position when market reverses
// max $100 => close position
function hasPositionReachedStopLoss(stock, reverse=false) {
    const stopLoss = reverse ? STOP_LOSS.MIN : STOP_LOSS.MAX;
    if (stock.position.shortQuantity) {
        return (stock.mark - stock.position.averagePrice) * stock.position.shortQuantity > stopLoss;
    } else {
        return (stock.position.averagePrice - stock.mark) * stock.position.longQuantity > stopLoss;
    }
}

const MAX_QUANTITY = 40*LEVEL; // 20
// total = 3x // < 100
const QUANTITY_STEP = 10*LEVEL; // 5
// open slowly // close ALL right away
export { MAX_QUANTITY, QUANTITY_STEP, INTERVAL };

// tao = KIITOS

const BEAR_CONDITION = { SP: -1, NQ: -1, BRK: 2 }; 
function isBearMarket(stocks) {
    const SP = stocks['$SPX.X'].netPercentChangeInDouble < BEAR_CONDITION.SP; // percent change from yesterday
    const NQ = stocks['$COMPX'].netPercentChangeInDouble < BEAR_CONDITION.NQ; // percent change from yesterday
    const BRK = stocks['BRK.B'].askSize / stocks['BRK.B'].bidSize > BEAR_CONDITION.BRK; // supply / demand
    return SP && NQ && BRK;
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

// yin - BEAR

const MARGIN_QUANTITY = { MIN: 10*LEVEL, MAX: 40*LEVEL };
// min = 5 starting max quantity
// max = 20 max quantity
function getAllowMarginQuantity(stock, quantity) {
    if (stock.position) {
        const availableQuantity = MARGIN_QUANTITY.MAX - stock.position.shortQuantity;
        return quantity <= availableQuantity ? quantity : availableQuantity;
    } else {
        return quantity <= MARGIN_QUANTITY.MIN ? quantity : MARGIN_QUANTITY.MIN;
    }
}

const SUPPLY_DEMAND = 4; // => open short
function hasEnoughSupply(stock) {
    const quantity = Math.floor(stock.askSize / stock.bidSize);
    return quantity > SUPPLY_DEMAND ? getAllowMarginQuantity(stock, quantity) : 0;
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

// yang = BULL

const CASH_QUANTITY = { MIN: 20*LEVEL, MAX: 60*LEVEL };
// min = 10 starting max quantity
// max = 30 max quantity
function getAllowCashQuantity(stock, quantity) {
    if (stock.position) {
        const availableQuantity = CASH_QUANTITY.MAX - stock.position.longQuantity;
        return quantity <= availableQuantity ? quantity : availableQuantity;
    } else {
        return quantity <= CASH_QUANTITY.MIN ? quantity : CASH_QUANTITY.MIN;
    }
}

const DEMAND_SUPPLY = 4; // => open long
function hasEnoughDemand(stock) {
    const quantity = Math.floor(stock.bidSize / stock.askSize);
    return quantity > DEMAND_SUPPLY ? getAllowCashQuantity(stock, quantity) : 0;
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