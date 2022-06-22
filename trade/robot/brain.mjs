// ACCOUNT

const MAX_STOCK = 15; // total = 3x
function hasStockReachedMax(position) {
    const total = position.shortQuantity || position.longQuantity;
    return total > MAX_STOCK;
}

const MIN_PROFIT = 50; // => close position
function hasPositionReachedMinProfit(stock, position) {
    if (position.shortQuantity) {
        return (position.averagePrice - stock.mark) * position.shortQuantity > MIN_PROFIT;
    } else {
        return (stock.mark - position.averagePrice) * position.longQuantity > MIN_PROFIT;
    }
}

const STOP_LOSS = 100; // => close position
function hasPositionReachedMaxLoss(stock, position) {
    if (position.shortQuantity) {
        return (stock.mark - position.averagePrice) * position.shortQuantity > STOP_LOSS;
    } else {
        return (position.averagePrice - stock.mark) * position.longQuantity > STOP_LOSS;
    }
}

const START = 8; // start trading hour
const END = 10; // end trading hour
function isTradingHour() {
    const now = new Date();
    return START <= now.getHours() && now.getHours() <= END;
}

const DAYRULE = new Date(); // day trader rule = at least 12 hours have passed
function isRoundTrip(position) {
    
}

// MY CURRENT LEVEL
const MARKET_CONDITION = 2; // BRK.B = supply / demand => bear

const QUANTITY_STEP = 5; // open slowly // close ALL right away?

// BULL
const MARGIN_STOCKS = ['AAPL'];
const DEMAND_SUPPLY = 4; // => open long
const MAX_CASH = 0.7; // using only 70% of available cash
function hasEnoughCash(account, stock) {
    return stock.mark * QUANTITY_STEP < account.securitiesAccount.currentBalances.equity * MAX_CASH;
}

// BEAR
const CASH_STOCKS = ['SQ', 'ABNB'];
const SUPPLY_DEMAND = 4; // => open short
const MAX_MARGIN = 0.5; // using only 50% of available margin
function hasEnoughMargin(account, stock) {
    return stock.mark * QUANTITY_STEP < account.securitiesAccount.projectedBalances.stockBuyingPower * MAX_MARGIN;
}


export function kiitos(data) {
    // supply / demand 
    const marketCondition = data.stocks['BRK.B'].askSize / data.stocks['BRK.B'].bidSize < MARKET_CONDITION;

    STOCKS.forEach(stock => {
        const position = data.positions.securitiesAccount.positions.find(position => position.instrument.symbol === stock);
        // bull market: buy and sell
        if (marketCondition) {
            bullMarket(data.account, data.stocks[stock], position);
        // bear market: short and cover
        } else {
            bearMarket(data.account, data.stocks[stock], position);
        }
    });
}

// short and cover only 
function bearMarket(account, stock, position) {
    if (position) {
        if (position.shortQuantity) {

        } else {

        }
    } else {
        if (stock.askSize / stock.bidSize > SUPPLY_DEMAND && account.securitiesAccount.projectedBalances.stockBuyingPower > MIN_MARGIN) placeMarketOrder('Short', stock.symbol, QUANTITY_STEP);
    }
}

// buy and sell only
function bullMarket(account, stock, position) {
    if (position) {
        if (position.longQuantity) {

        } else {

        }
    } else {

    }
}

export { MAX_STOCK, QUANTITY_STEP };