import { createTransitChart } from '/astro/transit.chart.mjs';

export async function createTransitChart(elementID, year='', month='', day='', hour='', minute='') {
    document.getElementById(elementID).replaceChildren(); // innerHTML = ''

    const { planets, cusps, As, Ds, Mc, Ic, Sun, Moon, Earth } = await getTransitHoroscope(year, month, day, hour, minute);
    const chart = new astrology.Chart(elementID, 400, 400);
    const radix = chart.radix({ planets, cusps });
    radix.addPointsOfInterest({ As, Mc, Ds, Ic });
    radix.aspects();
    
    return { Sun, Moon, Earth };
  }
  
  export async function getTransitHoroscope(year='', month='', day='', hour='', minute='') {
    const payload = { horoscope: 'transit', year, month, day, hour, minute }
    const transit = await fetch('/astro?' + new URLSearchParams(payload));
    return await transit.json();
  }

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