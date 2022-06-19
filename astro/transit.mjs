import { getHoroscope } from './horoscope.mjs';
const { Origin, Horoscope } = Astro;

const currentLocation = [36.7484123, -119.7938046];

export function transitHoroscope(date = new Date(), location=currentLocation) {  
    const origin = new Origin({
        year: date.getFullYear(),
        month: date.getMonth(),
        date: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        latitude: location[0],
        longitude: location[1]
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