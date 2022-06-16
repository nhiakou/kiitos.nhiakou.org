import { getTDA } from '../tda.mjs';
import { renderAstro } from '../render/astro.mjs';
import { renderMarket } from '../render/market.mjs';
import { renderPositions } from '../render/positions.mjs';
import { renderButtons } from '../render/buttons.mjs';

export async function analyzeStocks() {
    const data = await renderTradePage();
    console.log(data);
}

export async function renderTradePage() {
    const data = await getTDA();
    renderAstro(data.stocks['BRK.A']);

    renderMarket(data.stocks);
    renderPositions(data.positions);
    renderButtons();

    return data;
}