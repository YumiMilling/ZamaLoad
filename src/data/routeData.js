/**
 * Zambian route data: distances, toll gates, and fuel/cost calculations.
 *
 * Distances are approximate road distances (not straight-line).
 * Toll fees are for heavy vehicles (>7T GVW).
 * Fuel price and consumption are configurable.
 */

// Road distances between major city pairs (km, approximate)
const DISTANCES = {
  'Lusaka-Kabwe': 139,
  'Lusaka-Kafue': 45,
  'Lusaka-Choma': 289,
  'Lusaka-Livingstone': 472,
  'Lusaka-Chipata': 574,
  'Lusaka-Mongu': 602,
  'Lusaka-Kitwe': 338,
  'Lusaka-Ndola': 321,
  'Lusaka-Mazabuka': 127,
  'Lusaka-Kapiri Mposhi': 196,
  'Lusaka-Serenje': 419,
  'Lusaka-Mpika': 571,
  'Lusaka-Kasama': 853,
  'Lusaka-Solwezi': 586,
  'Kitwe-Ndola': 56,
  'Kitwe-Solwezi': 248,
  'Kitwe-Chingola': 55,
  'Kitwe-Mufulira': 57,
  'Ndola-Solwezi': 304,
  'Ndola-Luanshya': 35,
  'Ndola-Kapiri Mposhi': 174,
  'Kabwe-Kapiri Mposhi': 57,
  'Choma-Livingstone': 183,
  'Choma-Mazabuka': 162,
  'Kasama-Mpulungu': 268,
  'Kasama-Mpika': 308,
  'Mpika-Serenje': 152,
  'Chipata-Petauke': 210,
  'Mongu-Senanga': 97,
  'Kapiri Mposhi-Serenje': 223,
};

/**
 * Get road distance between two cities.
 * Tries both directions. Falls back to straight-line estimate.
 */
export function getDistance(origin, destination) {
  if (origin === destination) return 0;
  const key1 = `${origin}-${destination}`;
  const key2 = `${destination}-${origin}`;
  if (DISTANCES[key1]) return DISTANCES[key1];
  if (DISTANCES[key2]) return DISTANCES[key2];

  // Try via intermediate (Lusaka as hub)
  const viaLusaka1 = DISTANCES[`Lusaka-${origin}`] || DISTANCES[`${origin}-Lusaka`];
  const viaLusaka2 = DISTANCES[`Lusaka-${destination}`] || DISTANCES[`${destination}-Lusaka`];
  if (viaLusaka1 && viaLusaka2) return viaLusaka1 + viaLusaka2;

  // Rough straight-line fallback using coords
  return null;
}

// Zambian toll gates with locations and fees
const TOLL_GATES = [
  { name: 'Shimabala',       between: ['Lusaka', 'Kafue'],          fee: 50,  lat: -15.58, lng: 28.22 },
  { name: 'Katuba',          between: ['Lusaka', 'Kabwe'],          fee: 50,  lat: -14.88, lng: 28.42 },
  { name: 'Kapiri Mposhi',   between: ['Kabwe', 'Kapiri Mposhi'],   fee: 50,  lat: -14.97, lng: 28.68 },
  { name: 'Manyumbi',        between: ['Kapiri Mposhi', 'Ndola'],   fee: 50,  lat: -13.50, lng: 28.55 },
  { name: 'Kafulafuta',      between: ['Kapiri Mposhi', 'Ndola'],   fee: 50,  lat: -13.20, lng: 28.50 },
  { name: 'Mumbwa',          between: ['Lusaka', 'Mongu'],          fee: 50,  lat: -15.05, lng: 27.06 },
  { name: 'Chongwe',         between: ['Lusaka', 'Chipata'],        fee: 50,  lat: -15.33, lng: 28.68 },
];

// Routes that pass through specific cities (for toll gate detection)
const ROUTE_VIA = {
  'Lusaka-Choma':       ['Kafue', 'Mazabuka'],
  'Lusaka-Livingstone':  ['Kafue', 'Mazabuka', 'Choma'],
  'Lusaka-Kitwe':       ['Kabwe', 'Kapiri Mposhi'],
  'Lusaka-Ndola':       ['Kabwe', 'Kapiri Mposhi'],
  'Lusaka-Solwezi':     ['Kabwe', 'Kapiri Mposhi'],
  'Lusaka-Kasama':      ['Kabwe', 'Kapiri Mposhi', 'Serenje', 'Mpika'],
  'Lusaka-Mpulungu':    ['Kabwe', 'Kapiri Mposhi', 'Serenje', 'Mpika', 'Kasama'],
  'Lusaka-Mongu':       [],
  'Lusaka-Chipata':     [],
  'Lusaka-Kabwe':       [],
  'Lusaka-Kapiri Mposhi': ['Kabwe'],
  'Lusaka-Serenje':     ['Kabwe', 'Kapiri Mposhi'],
  'Lusaka-Mpika':       ['Kabwe', 'Kapiri Mposhi', 'Serenje'],
};

/**
 * Get toll gates on a route.
 */
export function getRouteTolls(origin, destination) {
  const key1 = `${origin}-${destination}`;
  const key2 = `${destination}-${origin}`;
  const via = ROUTE_VIA[key1] || ROUTE_VIA[key2] || [];
  const routeCities = [origin, ...via, destination];

  return TOLL_GATES.filter(toll => {
    // Check if both cities in the toll's "between" are on the route
    const [a, b] = toll.between;
    const idxA = routeCities.indexOf(a);
    const idxB = routeCities.indexOf(b);
    if (idxA >= 0 && idxB >= 0) return true;
    // Also check if origin or destination directly matches
    if (routeCities.includes(a) && routeCities.includes(b)) return true;
    return false;
  });
}

// Fuel and cost constants (configurable)
export const FUEL_PRICE_PER_LITRE = 28; // ZMW
export const DRIVER_ALLOWANCE_PER_DAY = 250; // ZMW

// Consumption rates by truck size (km per litre)
export const CONSUMPTION_RATES = {
  'Canter with Tarp (3.5T)': 7.0,
  'Canter Box Body (3.5T)': 7.0,
  'FTR Flatbed (8T)': 5.0,
  'FTR with Tarp (8T)': 5.0,
  'Curtain-side (12T)': 4.0,
  'Flatbed (15T)': 3.5,
  'Tipper (20T)': 3.0,
  'Flatbed (30T)': 2.5,
  'Interlink (34T)': 2.2,
  'Side Tipper (34T)': 2.2,
  'Low-loader (40T)': 2.0,
  'Tanker (30,000L)': 2.5,
  'Refrigerated (10T)': 3.5,
};

/**
 * Calculate full trip cost breakdown.
 */
export function calculateTripCost(origin, destination, truckType) {
  const distanceKm = getDistance(origin, destination);
  const tolls = getRouteTolls(origin, destination);
  const totalTolls = tolls.reduce((sum, t) => sum + t.fee, 0);

  const kmPerLitre = CONSUMPTION_RATES[truckType] || 3.0;
  const litresNeeded = distanceKm ? Math.round(distanceKm / kmPerLitre) : 0;
  const fuelCost = litresNeeded * FUEL_PRICE_PER_LITRE;

  // Estimate trip days (assume 400km per day for long haul)
  const tripDays = distanceKm ? Math.max(1, Math.ceil(distanceKm / 400)) : 1;
  const driverCost = tripDays * DRIVER_ALLOWANCE_PER_DAY;

  const totalCost = fuelCost + totalTolls + driverCost;

  return {
    distanceKm,
    tolls,
    totalTolls,
    kmPerLitre,
    litresNeeded,
    fuelCost,
    tripDays,
    driverCost,
    totalCost,
  };
}
