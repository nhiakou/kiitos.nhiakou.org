import { getHoroscope } from './horoscope.mjs';
const { Origin, Horoscope } = Astro;

const birthDate = new Date(1985, 0, 7, 15, 0);
const birthLocation = [10.6058073, 104.1767753];

export function natalHoroscope(date=birthDate, location=birthLocation) {
  const origin = new Origin({
      year: date.getFullYear(),
      month: date.getMonth(),
      date: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      latitude: location[0],
      longitude: location[1]
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

