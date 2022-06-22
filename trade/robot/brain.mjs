// ACCOUNT
const INDEXES = ['$DJI', '$SPX.X', '$COMPX'];
const STOCKS = ['AAPL', 'SQ', 'ABNB'];
const WATCHLIST = ['BRK.B', ...STOCKS];
const QUANTITY_STEP = 5; // open slowly // close ALL right away?

const START = 8; // start trading hour
const END = 10; // end trading hour
const INTERVAL = 30; // 30 minutes => 3hrs x 2 = 6 checks daily
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

const MAX_QUANTITY = 30; // total = 3x
function getAllowQuantity(stock, quantity) {
    if (stock.position) {
        const currentQuantity = stock.position.shortQuantity || stock.position.longQuantity;
        const availableQuantity = MAX_QUANTITY - currentQuantity
        return quantity <= availableQuantity ? quantity : availableQuantity;
    } else {
        return quantity <= MAX_QUANTITY ? quantity : MAX_QUANTITY;
    }
    
}

// MY CURRENT LEVEL
const MARKET_CONDITION = 2; // BRK.B = supply / demand => bear



// BULL
const MARGIN_STOCKS = ['AAPL'];
const DEMAND_SUPPLY = 4; // => open long
const MAX_CASH = 0.7; // using only 70% of available cash
function hasEnoughCash(account, stock, quantity) {
    return stock.mark * quantity < account.securitiesAccount.currentBalances.availableFundsNonMarginableTrade * MAX_CASH;
}

// BEAR
const CASH_STOCKS = ['SQ', 'ABNB'];
const SUPPLY_DEMAND = 4; // => open short
const MAX_MARGIN = 0.5; // using only 50% of available margin
function hasEnoughMargin(account, stock, quantity) {
    return stock.mark * quantity < account.securitiesAccount.projectedBalances.stockBuyingPower * MAX_MARGIN;
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

export { INDEXES, WATCHLIST, STOCKS, MAX_QUANTITY, QUANTITY_STEP, INTERVAL };