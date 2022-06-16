import { getHoroscope } from './horoscope.mjs';
const { Origin, Horoscope } = Astro;

export function natalHoroscope() {
  const origin = new Origin({
      year: 1985,
      month: 0,
      date: 7,
      hour: 15,
      minute: 0,
      latitude: 10.6058073,
      longitude: 104.1767753,
  });

  const horoscope =  new Horoscope({
      origin,
      houseSystem: "whole-sign",
      zodiac: "tropical",
      aspectPoints: ['bodies', 'points', 'angles'],
      aspectWithPoints: ['bodies', 'points', 'angles'],
      aspectTypes: ["major", "minor"],
      customOrbs: {},
      language: 'en'
  });

  return getHoroscope(horoscope);
}

