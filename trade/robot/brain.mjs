// LEVEL: increase when more confident!
// todo: if want to reverse (boxed position), need to manually close it first

import { placeMarketOrder } from "../tda.mjs";

const INDEXES = ['$DJI', '$SPX.X', '$COMPX'];
const CASH_STOCKS = ['AAPL'];
const MARGIN_STOCKS = ['SQ', 'ABNB'];
const STOCKS = [...CASH_STOCKS, ...MARGIN_STOCKS];
const WATCHLIST = ['BRK.B', ...STOCKS];
const QUANTITY_STEP = 5; // open slowly // close ALL right away

const START = 8; // start trading hour
const END = 10; // end trading hour
const INTERVAL = 30; // 30 minutes => 3hrs x 2 = 6 checks daily
function isTradingHour() {
    const now = new Date();
    return START <= now.getHours() && now.getHours() <= END;
}

const BEAR_CONDITION = 2; // supply / demand
function isBearMarket(stocks) {
    const market = stocks['BRK.B'];
    return market.askSize / market.bidSize > BEAR_CONDITION;
}

const DAY_RULE = 12*60*60*1000; // day trader rule = at least 12 hours have passed
function isNotRoundTrip(stock) {
    if (stock.lastTrade) {
        return new Date() - new Date(stock.lastTrade.transactionDate) > DAY_RULE;
    } else {
        return true;
    }
}

const MIN_PROFIT = 50; // => close position
function hasPositionReachedMinProfit(stock) {
    if (stock.position.shortQuantity) {
        return (stock.position.averagePrice - stock.mark) * stock.position.shortQuantity >= MIN_PROFIT;
    } else {
        return (stock.mark - stock.position.averagePrice) * stock.position.longQuantity >= MIN_PROFIT;
    }
}

const STOP_LOSS = 100; // => close position
function hasPositionReachedMaxLoss(stock) {
    if (stock.position.shortQuantity) {
        return (stock.mark - stock.position.averagePrice) * stock.position.shortQuantity > STOP_LOSS;
    } else {
        return (stock.position.averagePrice - stock.mark) * stock.position.longQuantity > STOP_LOSS;
    }
}

const MAX_QUANTITY = 20; // total = 3x // 60
function getAllowQuantity(stock, quantity) {
    if (stock.position) {
        const currentQuantity = stock.position.shortQuantity || stock.position.longQuantity;
        const availableQuantity = MAX_QUANTITY - currentQuantity
        return quantity <= availableQuantity ? quantity : availableQuantity;
    } else {
        return quantity <= MAX_QUANTITY ? quantity : MAX_QUANTITY;
    }
}

export { INDEXES, WATCHLIST, STOCKS, MAX_QUANTITY, QUANTITY_STEP, INTERVAL };

// KIITOS

export function kiitos(account, stocks) {
    if (isTradingHour()) {
        if (isBearMarket(stocks)) {
            MARGIN_STOCKS.forEach(stock => bearMarketTrade(account, stocks[stock]));
        } else {
            CASH_STOCKS.forEach(stock => bullMarketTrade(account, stocks[stock]));
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
function bearMarketTrade(account, stock) {
    const quantity = hasEnoughSupply(stock);

    if (stock.position) {
        if (isNotRoundTrip(stock) && (hasPositionReachedMinProfit(stock) || hasPositionReachedMaxLoss(stock))) {
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
function bullMarketTrade(account, stock) {
    const quantity = hasEnoughDemand(stock);

    if (stock.position) {
        if (isNotRoundTrip(stock) && (hasPositionReachedMinProfit(stock) || hasPositionReachedMaxLoss(stock))) {
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

