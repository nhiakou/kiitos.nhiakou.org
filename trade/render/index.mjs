import { renderAstro } from './render.astro.mjs';
import { renderMarket } from './render.market.mjs';
import { renderPositions } from './render.positions.mjs';
import { renderButtons } from './render.buttons.mjs';

export async function renderTradePage() {
    const response = await fetch('/tda?page=trade');
    const data = await response.json();
    await renderAstro(data.stocks['BRK.A']);
    renderMarket(data.stocks);
    renderPositions(data.positions);
    renderButtons();

    return data;
}