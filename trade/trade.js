import { renderTradePage } from './render.mjs';
import { analyzeStocks } from './robot/god.mjs';

let intervalID = null;

window.startAnalyzing = () => {
    intervalID = setInterval(analyzeStocks, 15*60*1000);
}

window.stopAnalyzing = () => {
    clearInterval(intervalID);
}

window.onload = async () => {
    await renderTradePage();
}