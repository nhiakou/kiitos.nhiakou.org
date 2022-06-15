export async function renderAstro(date, transit) {
    const response = await fetch('/astro?horoscope=lst&utc=' + date.getTime());
    const data = await response.json();
  
    document.getElementById('synodic-time').textContent = date.toLocaleTimeString();
    document.getElementById('sidereal-time').textContent = data.LST;
    document.getElementById('sun-sign').textContent = transit.Sun.Sign.label + " in " + transit.Sun.House.label;
    document.getElementById('moon-sign').textContent = transit.Moon.Sign.label + " in " + transit.Moon.House.label;
    document.getElementById('earth-as').textContent = transit.Earth.As.Sign.label + " Ascendant";
    document.getElementById('earth-mc').textContent = transit.Earth.Mc.Sign.label + " Midheaven";
  }