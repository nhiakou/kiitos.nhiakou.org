import { CASH_STOCKS, MARGIN_STOCKS, LEVEL } from "./stocks.mjs";
import { bearMarketMarginTrade, bullMarketMarginTrade } from "./yang/yang.mjs";
import { bearMarketCashTrade, bullMarketCashTrade } from "./yin/yin.mjs";

const TIME = {};
TIME.yin = { START: 7, END: 13, INTERVAL: 1 };
TIME.yang = { START: 7, END: 13, INTERVAL: 1 };
// interval: 15 minutes => 2hrs x 4 = 8 checks per day // max > 30 secs
// most active trading time => more accurate supply/demand
// same day trading => 7-9 & 11-13 => most active
// inter day trading => 9 - 11 => least active
function isTradingHour(tao) {
    const now = new Date();
    return TIME[tao].START <= now.getHours() && now.getHours() <= TIME[tao].END;
}

const QUANTITY = { MIN: null, MAX: 40*LEVEL, STEP: 10*LEVEL };
// max: 20, step: 5
// total = 3x // < 100
// open slowly // close ALL right away
export { TIME, QUANTITY };

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

export function kiitos(tao, account, stocks) {
    if (isTradingHour(tao)) {
        if (isBearMarketBeginning(stocks)) {
            if (tao === 'yang') MARGIN_STOCKS.forEach(stock => bearMarketMarginTrade(account, stocks[stock], Number(localStorage.getItem('test')) ? stock.order : stock.position));
            if (tao === 'yin') CASH_STOCKS.forEach(stock => bearMarketCashTrade(stocks[stock], Number(localStorage.getItem('test')) ? stock.order : stock.position));
        } else if (isBullMarketBeginning(stocks)) {
            if (tao === 'yin') CASH_STOCKS.forEach(stock => bullMarketCashTrade(account, stocks[stock], Number(localStorage.getItem('test')) ? stock.order : stock.position));
            if (tao === 'yang') MARGIN_STOCKS.forEach(stock => bullMarketMarginTrade(stocks[stock], Number(localStorage.getItem('test')) ? stock.order : stock.position));
        } 
    }
}



