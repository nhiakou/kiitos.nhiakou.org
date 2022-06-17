import { natalHoroscope } from '/astro/natal.mjs';
import { transitHoroscope } from '/astro/transit.mjs';

let horoscope = null;

export function createNatalChart(elementID) {
    const { planets, cusps, As, Ds, Mc, Ic, Sun, Moon, Earth } = natalHoroscope();
    const transit = transitHoroscope();
    
    const element = document.getElementById(elementID);
    const width = element.offsetWidth < 500 ? element.offsetWidth : 500;
    const chart = new astrology.Chart(elementID, width, width);
    const radix = chart.radix({ planets, cusps });
    radix.addPointsOfInterest({ As, Mc, Ds, Ic });
    horoscope = radix.transit({ planets: transit.planets, cusps: transit.cusps }).aspects();

    return { natal: { Sun, Moon, Earth }, transit: { Sun: transit.Sun, Moon: transit.Moon, Earth: transit.Earth } };
}

export function animateTransit(planets, cusps) {
  horoscope.animate({ planets, cusps }, 3, false, () => {
    //console.log("Animation finished");
  });
}

export function renderAstro(date, transit) {  
    document.getElementById('synodic-time').textContent = date.toLocaleTimeString();
    document.getElementById('sidereal-time').textContent = LST.getLST(date.getTime());
    document.getElementById('sun-sign').textContent = transit.Sun.Sign.label + " in " + transit.Sun.House.label;
    document.getElementById('moon-sign').textContent = transit.Moon.Sign.label + " in " + transit.Moon.House.label;
    document.getElementById('earth-as').textContent = transit.Earth.As.Sign.label + " Ascendant";
    document.getElementById('earth-mc').textContent = transit.Earth.Mc.Sign.label + " Midheaven";
  }

  