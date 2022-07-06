import { getTDA } from '../tda.mjs';
import { renderAstro } from '../render/astro.mjs';
import { renderMarket, renderMarkets } from '../render/market.mjs';
import { renderPositions, renderButtons } from '../render/positions.mjs';

export async function renderTradePage() {
    const data = await getTDA('corporate');
    renderAstro(data.stocks['BRK.A']);

    renderMarket(data.market);
    renderMarkets(data.stocks);
    renderPositions(data.stocks);
    renderButtons(data.stocks);

    return data;
}