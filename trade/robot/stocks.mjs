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

export { INDEXES, CASH_STOCKS, MARGIN_STOCKS, STOCKS, WATCHLIST, ALL, NASDAQ, NYSE};