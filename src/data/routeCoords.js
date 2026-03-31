/**
 * Simplified route coordinates for Zambian cities.
 * Used for the simulated live tracking map.
 * Coordinates are approximate lat/lng.
 */
export const cityCoords = {
  'Lusaka':      { lat: -15.39, lng: 28.32 },
  'Kitwe':       { lat: -12.80, lng: 28.21 },
  'Ndola':       { lat: -12.97, lng: 28.63 },
  'Kabwe':       { lat: -14.44, lng: 28.45 },
  'Choma':       { lat: -16.54, lng: 26.97 },
  'Livingstone': { lat: -17.84, lng: 25.86 },
  'Chipata':     { lat: -13.64, lng: 32.64 },
  'Solwezi':     { lat: -12.17, lng: 25.86 },
  'Kasama':      { lat: -10.21, lng: 31.18 },
  'Mpulungu':    { lat: -8.76,  lng: 31.11 },
  'Mongu':       { lat: -15.25, lng: 23.15 },
  'Mansa':       { lat: -11.20, lng: 28.89 },
  'Mpika':       { lat: -11.83, lng: 31.46 },
  'Serenje':     { lat: -13.23, lng: 30.23 },
  'Mazabuka':    { lat: -15.86, lng: 27.75 },
  'Kafue':       { lat: -15.77, lng: 28.18 },
  'Kapiri Mposhi':{ lat: -14.97, lng: 28.68 },
  'Mufulira':    { lat: -12.54, lng: 28.24 },
  'Luanshya':    { lat: -13.14, lng: 28.42 },
  'Chingola':    { lat: -12.53, lng: 27.85 },
  'Petauke':     { lat: -14.24, lng: 31.32 },
  'Senanga':     { lat: -16.10, lng: 23.27 },
};

/**
 * Interpolate a position between two cities.
 * progress: 0 = at origin, 1 = at destination
 */
export function interpolatePosition(origin, destination, progress) {
  const from = cityCoords[origin];
  const to = cityCoords[destination];
  if (!from || !to) return null;
  const p = Math.max(0, Math.min(1, progress));
  return {
    lat: from.lat + (to.lat - from.lat) * p,
    lng: from.lng + (to.lng - from.lng) * p,
  };
}
