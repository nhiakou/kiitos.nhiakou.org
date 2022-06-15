import LST from 'local-sidereal-time';

export function getLST(longitude) {
  const totalSeconds = LST.getLST(new Date(), longitude)*60*60;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor(totalSeconds % 3600 / 60);
  const s = Math.floor(totalSeconds % 3600 % 60);

  const hours = ((h + 11) % 12 + 1);
  const minutes = String(m).padStart(2, '0');
  const seconds = String(s).padStart(2, '0');
  const suffix = h <= 12 ? 'AM' : 'PM';

  return `${hours}:${minutes}:${seconds} ${suffix}`;
}