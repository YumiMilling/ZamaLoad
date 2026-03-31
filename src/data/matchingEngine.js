/**
 * Matching engine — the "AI" behind ZamaLoad.
 *
 * Scores how well a truck owner matches a shipper's freight request.
 * Factors: route match, capacity fit, trust score, licence validity, rate competitiveness.
 */

import { getDistance, calculateTripCost, CONSUMPTION_RATES } from './routeData';
import { getOwnerTrucks } from './mockTrucks';
import { getOwnerDrivers } from './mockDrivers';

/**
 * Suggest a fair rate per tonne for a route + truck type.
 * Based on trip cost + reasonable margin.
 */
export function suggestRate(origin, destination, truckType, capacityTonnes) {
  const cost = calculateTripCost(origin, destination, truckType);
  if (!cost.distanceKm || !capacityTonnes) return null;
  // Target: trip cost + 30% margin, divided by capacity
  const suggestedTotal = cost.totalCost * 1.3;
  const ratePerTonne = Math.round(suggestedTotal / capacityTonnes);
  return {
    ratePerTonne,
    totalCost: cost.totalCost,
    margin: 30,
    distanceKm: cost.distanceKm,
  };
}

/**
 * Score a truck owner against a freight request.
 * Returns { score: 0-100, breakdown: {...}, bestTruck, bestDriver }
 */
export function scoreMatch(owner, request, users) {
  const trucks = getOwnerTrucks(owner.id);
  const drivers = getOwnerDrivers(owner.id);

  if (!trucks.length || !drivers.length) return null;

  // Find the best truck for this request (valid licence, capacity >= request)
  const validTrucks = trucks
    .filter(t => t.status !== 'expired')
    .filter(t => t.capacityTonnes >= request.tonnes)
    .sort((a, b) => a.capacityTonnes - b.capacityTonnes); // prefer closest fit

  if (!validTrucks.length) return null;
  const bestTruck = validTrucks[0];

  // Find best driver for that truck
  const truckDriver = drivers.find(d => d.truckId === bestTruck.id);
  const bestDriver = truckDriver || drivers[0];

  // Score components (each 0-100, weighted)
  const scores = {};

  // 1. Capacity fit (25%) — closer to request tonnes = better (no waste)
  const capacityRatio = request.tonnes / bestTruck.capacityTonnes;
  scores.capacityFit = Math.round(capacityRatio * 100); // 100% = perfect fit

  // 2. Trust score (30%) — owner + driver trust
  const avgTrust = (owner.trustScore + bestDriver.trustScore) / 2;
  scores.trust = Math.round(avgTrust * 100);

  // 3. Licence health (15%) — valid = 100, expiring = 60, expired = 0
  const licenceMap = { valid: 100, expiring: 60, expired: 0 };
  scores.licence = licenceMap[bestTruck.status] || 0;

  // 4. Experience (15%) — more trips = better, caps at 50
  scores.experience = Math.min(100, Math.round((owner.completedTrips / 50) * 100));

  // 5. Location proximity (15%) — owner based near origin = bonus
  const ownerUser = users.find(u => u.id === owner.id);
  scores.proximity = ownerUser && ownerUser.location === request.origin ? 100 : 40;

  // Weighted total
  const total = Math.round(
    scores.capacityFit * 0.25 +
    scores.trust * 0.30 +
    scores.licence * 0.15 +
    scores.experience * 0.15 +
    scores.proximity * 0.15
  );

  return {
    score: total,
    breakdown: scores,
    bestTruck,
    bestDriver,
    suggestedRate: suggestRate(request.origin, request.destination, bestTruck.type, request.tonnes),
  };
}

/**
 * Find and rank all matching owners for a freight request.
 * Returns sorted array of { owner, match } objects.
 */
export function findMatches(request, owners, users) {
  return owners
    .map(owner => {
      const match = scoreMatch(owner, request, users);
      return match ? { owner, match } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.match.score - a.match.score);
}
