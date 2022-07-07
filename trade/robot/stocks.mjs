// free = 15 minutes delay (not real-time)
// nasdaq quotes level 1 and 2 = $24/month // level 2 = order books
// nyse quotes = $45/month
// total: $69/month
const INDEXES = ['$DJI', '$SPX.X', '$COMPX'];
const CASH_STOCKS = ['AAPL']; // aapl = nasdaq
const MARGIN_STOCKS = ['SQ', 'ABNB']; // abnb = nasdaq; sq = nyse
const STOCKS = [...CASH_STOCKS, ...MARGIN_STOCKS];
const WATCHLIST = ['BRK.B', ...STOCKS]; // brk.b = nyse
const ALL = ['BRK.A', ...INDEXES, ...WATCHLIST];
// todo: if want to switch cash/margin stocks, need to manually close first
const NASDAQ = ['AAPL', 'ABNB'];
const NYSE = ['BRK.B', 'SQ'];
// later: allow same stocks in both bear and bull? prob not bc too complex...

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

const DESIRED_PROFIT = {};
DESIRED_PROFIT.yin = { MIN: 20*LEVEL, MAX: 100*LEVEL };
DESIRED_PROFIT.yang = { MIN: 20*LEVEL, MAX: 100*LEVEL };
// min => $10 close position when market reverses
// max => $50 close position
export function hasPositionReachedDesiredProfit(tao, stock, position, reverse=false) {
    const desiredProfit = reverse ? DESIRED_PROFIT[tao].MIN : DESIRED_PROFIT[tao].MAX;
    if (position.shortQuantity) {
        return (position.averagePrice - stock.mark) * position.shortQuantity >= desiredProfit;
    } else {
        return (stock.mark - position.averagePrice) * position.longQuantity >= desiredProfit;
    }
}

const STOP_LOSS = {};
STOP_LOSS.yin = { MIN: 100*LEVEL, MAX: 200*LEVEL };
STOP_LOSS.yang = { MIN: 100*LEVEL, MAX: 200*LEVEL };
// min $50 => close position when market reverses
// max $100 => close position
export function hasPositionReachedStopLoss(tao, stock, position, reverse=false) {
    const stopLoss = reverse ? STOP_LOSS[tao].MIN : STOP_LOSS[tao].MAX;
    if (position.shortQuantity) {
        return (stock.mark - position.averagePrice) * position.shortQuantity > stopLoss;
    } else {
        return (position.averagePrice - stock.mark) * position.longQuantity > stopLoss;
    }
}

export { LEVEL, INDEXES, CASH_STOCKS, MARGIN_STOCKS, STOCKS, WATCHLIST, ALL, NASDAQ, NYSE};