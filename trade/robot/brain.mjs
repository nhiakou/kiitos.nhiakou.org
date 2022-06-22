// MY CURRENT LEVEL
const MARKET_CONDITION = 2; // BRK.B = supply / demand => bear
const STOCKS = ['AAPL', 'SQ', 'ABNB'];
const START = new Date(); // begin trading
const END = new Date(); // end trading

const QUANTITY_STEP = 5; // open slowly // close ALL right away?
const MAX_STOCK = 30; // sell if gain of $1
const MIN_PROFIT = 50; // => close position
const STOP_LOSS = 100; // => close position

//BEAR
const SUPPLY_DEMAND = 4; // => open short
const MIN_MARGIN = 20000;

//BULL
const DEMAND_SUPPLY = 4; // => open long
const MAX_CASH = 20000;

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