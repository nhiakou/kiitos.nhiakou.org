import { formatToDollar, formatToPercent, formatToDollars, formatToPercents, formatToQuantity } from "/utils.mjs";

export function renderMarket(stocks) {
    ['BRK.B', 'AAPL', 'SQ'].forEach(stock => {
        document.getElementById(stock + '-bid-price').textContent = formatToDollars(stocks[stock].bidPrice);
        document.getElementById(stock + '-bid-size').textContent = formatToQuantity(stocks[stock].bidSize);
        document.getElementById(stock + '-ask-price').textContent = formatToDollars(stocks[stock].askPrice);
        document.getElementById(stock + '-ask-size').textContent = formatToQuantity(stocks[stock].askSize);
        document.getElementById(stock + '-high-price').textContent = formatToDollars(stocks[stock].highPrice);
        document.getElementById(stock + '-low-price').textContent = formatToDollars(stocks[stock].lowPrice);

        document.getElementById(stock + '-price').textContent = formatToDollars(stocks[stock].mark);
        //document.getElementById(stock + '-dollar-price-change').textContent = formatToDollars(stocks[stock].markChangeInDouble);
        //document.getElementById(stock + '-percent-price-change').textContent = formatToPercents(stocks[stock].markPercentChangeInDouble);
        formatToDollar(document.getElementById(stock + '-dollar-price-change'), stocks[stock].closePrice - stocks[stock].openPrice);
        formatToPercent(document.getElementById(stock + '-percent-price-change'), stocks[stock].closePrice / stocks[stock].openPrice * 100 - 100);
        document.getElementById(stock + '-open-price').textContent = formatToDollars(stocks[stock].openPrice);
        document.getElementById(stock + '-close-price').textContent = formatToDollars(stocks[stock].closePrice);
        //document.getElementById(stock + '-net-change').textContent = formatToDollars(stocks[stock].netChange);
        document.getElementById(stock + '-total-volume').textContent = formatToQuantity(stocks[stock].totalVolume);

        document.getElementById(stock + '-pe-ratio').textContent = stocks[stock].peRatio;
        document.getElementById(stock + '-volatility').textContent = stocks[stock].volatility;
        document.getElementById(stock + '-52wk-high').textContent = formatToDollars(stocks[stock]['52WkHigh']);
        document.getElementById(stock + '-52wk-low').textContent = formatToDollars(stocks[stock]['52WkLow']);
    });
}