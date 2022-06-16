import { getHoroscope } from './horoscope.mjs';
const { Origin, Horoscope } = Astro;

export function transitHoroscope(date = new Date()) {  
    const origin = new Origin({
        year: date.getFullYear(),
        month: date.getMonth(),
        date: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        latitude: 36.7484123,
        longitude: -119.7938046,
    });
  
    const horoscope = new Horoscope({
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