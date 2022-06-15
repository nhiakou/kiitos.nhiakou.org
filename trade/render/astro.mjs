import { createTransitChart } from '/astro/transit.chart.mjs';

export async function renderAstro(stock) {
    const date = new Date(stock.quoteTimeInLong);
    const { Sun, Moon, Earth } = await createTransitChart('horoscope', date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());

    const response = await fetch('/astro?horoscope=lst&utc=' + stock.quoteTimeInLong);
    const data = await response.json();

    document.getElementById('synodic-time').textContent = date.toLocaleTimeString();
    document.getElementById('sidereal-time').textContent = data.LST;
    document.getElementById('sun-sign').textContent = Sun.Sign.label + " in " + Sun.House.label;
    document.getElementById('moon-sign').textContent = Moon.Sign.label + " in " + Moon.House.label;
    document.getElementById('earth-as').textContent = Earth.As.Sign.label + " Ascendant";
    document.getElementById('earth-mc').textContent = Earth.Mc.Sign.label + " Midheaven";
}