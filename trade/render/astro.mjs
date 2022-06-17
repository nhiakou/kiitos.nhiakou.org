import { transitHoroscope } from '/astro/transit.mjs';

export function createTransitChart(elementID, date) {
    document.getElementById(elementID).replaceChildren();

    const element = document.getElementById(elementID);
    const width = element.offsetWidth < 500 ? element.offsetWidth : 500;
    const { planets, cusps, As, Ds, Mc, Ic, Sun, Moon, Earth } = transitHoroscope(date);
    const chart = new astrology.Chart(elementID, width, width);
    const radix = chart.radix({ planets, cusps });
    radix.addPointsOfInterest({ As, Mc, Ds, Ic });
    radix.aspects();
    
    return { Sun, Moon, Earth };
}

export function renderAstro(stock) {
    const date = new Date(stock.quoteTimeInLong);
    const { Sun, Moon, Earth } = createTransitChart('horoscope', date);

    document.getElementById('synodic-time').textContent = date.toLocaleTimeString();
    document.getElementById('sidereal-time').textContent = LST.getLST(date.getTime());
    document.getElementById('sun-sign').textContent = Sun.Sign.label + " in " + Sun.House.label;
    document.getElementById('moon-sign').textContent = Moon.Sign.label + " in " + Moon.House.label;
    document.getElementById('earth-as').textContent = Earth.As.Sign.label + " Ascendant";
    document.getElementById('earth-mc').textContent = Earth.Mc.Sign.label + " Midheaven";
}