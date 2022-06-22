import { WATCHLIST } from "./brain.mjs";
import { formatToDollars, formatToPercents, formatToQuantity } from "/utils.mjs";
import { sendMail } from '../admin/admin.mjs';

export function sendAlert(stocks) {
    WATCHLIST.forEach(stock => {
        
        let averagePrice, quantity, change;
        
        if (stocks[stock].position) {
            averagePrice = stocks[stock].position.averagePrice;
            quantity = -stocks[stock].position.shortQuantity || stocks[stock].position.longQuantity;
            change = quantity > 0 ? stocks[stock].mark - averagePrice : averagePrice - stocks[stock].mark;
        } else {
            averagePrice = stocks[stock].closePrice;
            quantity = 1;
            change = stocks[stock].mark - averagePrice;
        }

        const profit = change >= 0; 
        const formattedAveragePrice = formatToDollars(averagePrice);
        const formattedChange = formatToDollars(change);
        const formattedQuantity = formatToQuantity(quantity);
        const formattedDollarProfit = formatToDollars(change * Math.abs(quantity));
        const formattedPercentProfit = formatToPercents(quantity < 0 ? (averagePrice / stocks[stock].mark * 100 - 100) : (stocks[stock].mark / averagePrice * 100 - 100));

        const subject = `${stock}: ${formattedChange} x ${formattedQuantity} = ${formattedDollarProfit} | ${formattedPercentProfit}`;
        const message = `<u>${stock}</u>: <span style="color:${profit ? 'green' : 'red'}">${formattedChange}</span> x ${formattedQuantity} = <b style="color:${profit ? 'green' : 'red'}">${formattedDollarProfit}</b> | <span style="color:${profit ? 'green' : 'red'}">${formattedPercentProfit}</span>
        <br><br>
        Current: <span style="color:${profit ? 'green' : 'red'}">${formatToDollars(stocks[stock].mark)}</span>
        <br>
        Average: ${formattedAveragePrice}
        <br>
        Volume: ${formatToQuantity(stocks[stock].totalVolume)}
        <br><br>
        <u>Supply: <b>${(stocks[stock].askSize / stocks[stock].bidSize).toFixed(2)}</b>x</u>
        <br>
        Ask Price: ${formatToDollars(stocks[stock].askPrice)}
        <br>
        Ask Size: <b>${formatToQuantity(stocks[stock].askSize)}</b>
        <br>
        Highest Price: ${formatToDollars(stocks[stock].highPrice)}
        <br><br>
        <u>Demand: <b>${(stocks[stock].bidSize / stocks[stock].askSize).toFixed(2)}</b>x</u>
        <br>
        Bid Price: ${formatToDollars(stocks[stock].bidPrice)}
        <br>
        Bid Size: <b>${formatToQuantity(stocks[stock].bidSize)}</b>
        <br>
        Lowest Price: ${formatToDollars(stocks[stock].lowPrice)}
        <br><br>
        PE Ratio: ${stocks[stock].peRatio}
        <br>
        Volatility: ${stocks[stock].volatility}
        <br>
        1-Year: <b>${formatToDollars(stocks[stock]['52WkLow'])}</b> to <b>${formatToDollars(stocks[stock]['52WkHigh'])}</b>
        `;

        sendMail(subject, message);
        
    });
}