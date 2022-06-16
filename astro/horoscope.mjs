export function getHoroscope(horoscope) {
  const data = {};

  data.planets = Object.assign(
    {},
    ...horoscope._celestialBodies.all.map((body) => {
      const key = body.key.charAt(0).toUpperCase() + body.key.slice(1);
      return { [key]: [body.ChartPosition.Ecliptic.DecimalDegrees] };
    })
  );

  data.cusps = horoscope._houses.map((cusp) => {
    return cusp.ChartPosition.StartPosition.Ecliptic.DecimalDegrees;
  });

  data.As = [horoscope._ascendant.ChartPosition.Horizon.DecimalDegrees];
  data.Ds = [(data.As + 180) % 360];
  data.Mc = [horoscope._midheaven.ChartPosition.Horizon.DecimalDegrees];
  data.Ic = [(horoscope._midheaven.ChartPosition.Horizon.DecimalDegrees + 180) % 360];

  data.Sun = horoscope.CelestialBodies.sun;
  data.Moon = horoscope.CelestialBodies.moon;
  data.Earth = { As: horoscope.Ascendant, Mc: horoscope.Angles.midheaven };

  return data;
}