import { formatToDollar, formatToPercent, formatToDollars, formatToQuantity } from "/utils.mjs";

export function renderPositions(positions) {
    //console.log(positions.securitiesAccount.positions)
    positions.securitiesAccount.positions.forEach(position => {
        document.getElementById(position.instrument.symbol + '-cost').textContent = formatToDollars(position.averagePrice);
        document.getElementById(position.instrument.symbol + '-quantity').textContent = formatToQuantity(-position.shortQuantity || position.longQuantity); // position.settledShortQuantity || position.settledLongQuantity
        // document.getElementById(position.instrument.symbol + '-dollar-profit').textContent = position.currentDayProfitLoss;
        // document.getElementById(position.instrument.symbol + '-percent-profit').textContent = position.currentDayProfitLossPercentage;

        const currentPrice = parseFloat(document.getElementById(position.instrument.symbol + '-price').textContent.replace('$', ''));
        formatToDollar(document.getElementById(position.instrument.symbol + '-dollar-profit'), (currentPrice - position.averagePrice) * (-position.shortQuantity || position.longQuantity));
        formatToPercent(document.getElementById(position.instrument.symbol + '-percent-profit'), (currentPrice / position.averagePrice * 100 - 100)*(position.shortQuantity ? -1 : 1));
    });
}