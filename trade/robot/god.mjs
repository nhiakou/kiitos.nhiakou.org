import { renderTradePage } from "../render.mjs";

export async function analyzeStocks() {
    const data = await renderTradePage();
    console.log(data);
}

export async function placeMarketOrder(order, symbol, quantity) {
    // const response = await fetch('/tda', {
    //     method: 'POST',
    //     headers: {'Content-Type': 'application/json'},
    //     body: JSON.stringify({ order, symbol, quantity })
    //     });
        
    // return response.json();
}