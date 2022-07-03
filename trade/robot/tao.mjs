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

const QUANTITY = { MIN: null, MAX: 40*LEVEL, STEP: 10*LEVEL };
// max: 20, step: 5
// total = 3x // < 100
// open slowly // close ALL right away
export { INTERVAL, QUANTITY };

// tao = KIITOS

const BEAR_CONDITIONS = { SP: [-1, 0], NQ: [-1, 0], BRK: [-1, 0], BRK2: 2 }; 
function isBearMarketBeginning(stocks) {
    const SP = BEAR_CONDITIONS.SP[0] < stocks['$SPX.X'].netPercentChangeInDouble && stocks['$SPX.X'].netPercentChangeInDouble < BEAR_CONDITIONS.SP[1]; // percent change from yesterday
    const NQ = BEAR_CONDITIONS.NQ[0] < stocks['$COMPX'].netPercentChangeInDouble && stocks['$COMPX'].netPercentChangeInDouble < BEAR_CONDITIONS.NQ[1]; // percent change from yesterday
    const BRK = BEAR_CONDITIONS.BRK[0] < stocks['BRK.B'].markPercentChangeInDouble && stocks['BRK.B'].markPercentChangeInDouble < BEAR_CONDITIONS.BRK[1]; // percent change from yesterday
    //const BRK = stocks['BRK.B'].askSize / stocks['BRK.B'].bidSize > BEAR_CONDITIONS.BRK; // supply / demand
    return SP && NQ && BRK;
}

const BULL_CONDITIONS = { SP: [0, 1], NQ: [0, 1], BRK: [0, 1], BRK2: 2 }; 
function isBullMarketBeginning(stocks) {
    const SP = BULL_CONDITIONS.SP[0] < stocks['$SPX.X'].netPercentChangeInDouble && stocks['$SPX.X'].netPercentChangeInDouble < BULL_CONDITIONS.SP[1]; // percent change from yesterday
    const NQ = BULL_CONDITIONS.NQ[0] < stocks['$COMPX'].netPercentChangeInDouble && stocks['$COMPX'].netPercentChangeInDouble < BULL_CONDITIONS.NQ[1]; // percent change from yesterday
    const BRK = BULL_CONDITIONS.BRK[0] < stocks['BRK.B'].markPercentChangeInDouble && stocks['BRK.B'].markPercentChangeInDouble < BULL_CONDITIONS.BRK[1]; // percent change from yesterday
    //const BRK = stocks['BRK.B'].bidSize / stocks['BRK.B'].askSize > BULL_CONDITIONS.BRK; // demand / supply
    return SP && NQ && BRK;
}

export function kiitos(account, stocks) {
    if (isTradingHour()) {
        if (isBearMarketBeginning(stocks)) {
            MARGIN_STOCKS.forEach(stock => bearMarketMarginTrade(account, stocks[stock]));
            CASH_STOCKS.forEach(stock => bearMarketCashTrade(stocks[stock]));
        } else if (isBullMarketBeginning(stocks)) {
            CASH_STOCKS.forEach(stock => bullMarketCashTrade(account, stocks[stock]));
            MARGIN_STOCKS.forEach(stock => bullMarketMarginTrade(stocks[stock]));
        } 
    }
}

// yin - BEAR

const MARGIN_QUANTITY = { MIN: 10*LEVEL, MAX: 40*LEVEL, STEP: null };
// min = 5 starting max quantity
// max = 20 max quantity
// later: limit quantity step?
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

const BEAR = [-1, 0];
function isBearBeginning(stock) {
    return BEAR[0] < stock.markPercentChangeInDouble && stock.markPercentChangeInDouble < BEAR[1];
}

// short and cover only
function bearMarketMarginTrade(account, stock) {
    const quantity = hasEnoughSupply(stock);

    if (stock.position) {
        if (isNotRoundTrip(stock) && (hasPositionReachedDesiredProfit(stock) || hasPositionReachedStopLoss(stock))) {
            // close short position
            placeMarketOrder('Cover', stock, stock.position.shortQuantity);
        } else if (isBearBeginning(stock) && quantity && hasEnoughMargin(account, stock, quantity)) {
            // add to short position
            placeMarketOrder('Short', stock, quantity);
        }
    } else {
        if (isBearBeginning(stock) && quantity && hasEnoughMargin(account, stock, quantity)) {
            // begin short position
            placeMarketOrder('Short', stock, quantity);
        }
    }
}

// market reverses: close long positions
function bearMarketCashTrade(stock) {
    if (stock.position && isNotRoundTrip(stock) && (hasPositionReachedDesiredProfit(stock, true) || hasPositionReachedStopLoss(stock, true))) {
        placeMarketOrder('Sell', stock, stock.position.longQuantity);
    }
}

// yang = BULL

const CASH_QUANTITY = { MIN: 20*LEVEL, MAX: 60*LEVEL, STEP: null };
// min = 10 starting max quantity
// max = 30 max quantity
// later: limit quantity step?
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

const BULL = [0, 1];
function isBullBeginning(stock) {
    return BULL[0] < stock.markPercentChangeInDouble && stock.markPercentChangeInDouble < BULL[1];
}

// buy and sell only
function bullMarketCashTrade(account, stock) {
    const quantity = hasEnoughDemand(stock);

    if (stock.position) {
        if (isNotRoundTrip(stock) && (hasPositionReachedDesiredProfit(stock) || hasPositionReachedStopLoss(stock))) {
            // close long position
            placeMarketOrder('Sell', stock, stock.position.longQuantity);
        } else if (isBullBeginning(stock) && quantity && hasEnoughCash(account, stock, quantity)) {
            // add to long position
            placeMarketOrder('Buy', stock, quantity);
        }
    } else {
        if (isBullBeginning(stock) && quantity && hasEnoughCash(account, stock, quantity)) {
            // begin long position
            placeMarketOrder('Buy', stock, quantity);
        }
    }
}

// market reverses: close short positions
function bullMarketMarginTrade(stock) {
    if (stock.position && isNotRoundTrip(stock) && (hasPositionReachedDesiredProfit(stock, true) || hasPositionReachedStopLoss(stock, true))) {
        placeMarketOrder('Cover', stock, stock.position.shortQuantity);
    }
}