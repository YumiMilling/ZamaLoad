import { useMemo } from 'react';
import { C, FONT } from '../../theme';
import { useApp } from '../../context/AppContext';
import { getUser } from '../../data/mockUsers';
import { getOwnerTrucks } from '../../data/mockTrucks';
import { getOwnerDrivers } from '../../data/mockDrivers';
import { getDistance, calculateTripCost } from '../../data/routeData';
import { CARGO_CATEGORIES } from '../../data/cargoCategories';
import TrustBadge from '../shared/TrustBadge';

export default function MatchedRequests() {
  const { state, dispatch } = useApp();
  const owner = getUser(state.userId);
  const myTrucks = getOwnerTrucks(state.userId);
  const myDrivers = getOwnerDrivers(state.userId);

  // Show open freight requests the owner can serve
  const requests = useMemo(() => {
    if (!owner || !myTrucks.length) return [];

    const maxCapacity = Math.max(...myTrucks.filter(t => t.status !== 'expired').map(t => t.capacityTonnes));

    return state.requests
      .filter(r => r.status === 'open')
      .filter(r => r.tonnes <= maxCapacity)
      .map(req => {
        const shipper = getUser(req.shipperId);
        const distance = getDistance(req.origin, req.destination);
        const bestTruck = myTrucks
          .filter(t => t.status !== 'expired' && t.capacityTonnes >= req.tonnes)
          .sort((a, b) => a.capacityTonnes - b.capacityTonnes)[0];
        const tripCost = bestTruck ? calculateTripCost(req.origin, req.destination, bestTruck.type) : null;
        const suggestedRate = tripCost && req.tonnes > 0 ? Math.round((tripCost.totalCost * 1.3) / req.tonnes) : null;
        const hasBid = state.bids.some(b => b.requestId === req.id && b.ownerId === state.userId);
        return { type: 'request', req, shipper, distance, tripCost, bestTruck, suggestedRate, hasBid };
      })
      .sort((a, b) => (b.distance || 0) - (a.distance || 0));
  }, [owner, myTrucks, state.requests, state.bids, state.userId]);

  // Also show loads from shippers that are booked but need more cargo (consolidated opportunity)
  // and loads we could serve on return trips
  const opportunities = useMemo(() => {
    if (!owner) return [];
    // Find our active trips to suggest return loads
    const myActiveLoads = state.loads.filter(l => l.ownerId === state.userId && (l.status === 'in-transit' || l.status === 'delivered'));
    const returnCities = myActiveLoads.map(l => l.destination);

    // Find posted loads from other routes we could do (return trips)
    return state.loads
      .filter(l => l.ownerId !== state.userId)
      .filter(l => l.status === 'posted' || l.status === 'booked')
      .filter(l => {
        const remaining = l.capacityTonnes - (l.bookedTonnes || 0);
        return remaining > 0;
      })
      .map(l => {
        const loadOwner = getUser(l.ownerId);
        const distance = getDistance(l.origin, l.destination);
        const isReturnTrip = returnCities.includes(l.origin);
        return { type: 'load', load: l, loadOwner, distance, isReturnTrip };
      })
      .sort((a, b) => (b.isReturnTrip ? 1 : 0) - (a.isReturnTrip ? 1 : 0));
  }, [owner, state.loads, state.userId]);

  const hasContent = requests.length > 0 || opportunities.length > 0;

  return (
    <div className="animate-in">
      <h1 style={{ fontFamily: FONT.heading, fontSize: 28, fontWeight: 800, color: C.ink, marginBottom: 4 }}>
        Find Loads
      </h1>
      <p style={{ fontFamily: FONT.body, fontSize: 15, color: C.dust, marginBottom: 24 }}>
        Freight requests and opportunities matched to your fleet.
      </p>

      {/* Fleet summary */}
      <div style={{ background: C.white, border: `1px solid ${C.line}`, padding: 14, marginBottom: 20, display: 'flex', gap: 20, fontFamily: FONT.body, fontSize: 14 }}>
        <span><strong style={{ color: C.ink }}>{myTrucks.filter(t => t.status !== 'expired').length}</strong> trucks available</span>
        <span><strong style={{ color: C.ink }}>{myDrivers.length}</strong> drivers</span>
        <span>Max capacity: <strong style={{ color: C.ink }}>{Math.max(...myTrucks.filter(t => t.status !== 'expired').map(t => t.capacityTonnes), 0)}T</strong></span>
      </div>

      {!hasContent && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
          <div style={{ fontFamily: FONT.heading, fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: 4 }}>No freight requests right now</div>
          <div style={{ fontFamily: FONT.body, fontSize: 14, color: C.dust }}>Post your truck availability so shippers can find you.</div>
        </div>
      )}

      {/* Freight requests */}
      {requests.length > 0 && (
        <>
          <div className="sec-label" style={{ marginBottom: 12 }}>Freight Requests</div>
          {requests.map(({ req, shipper, distance, tripCost, bestTruck, suggestedRate, hasBid }) => (
            <div key={req.id} className="load-card" style={{ cursor: hasBid ? 'default' : 'pointer' }}
              onClick={() => !hasBid && dispatch({ type: 'NAV', view: 'placeBid', params: { requestId: req.id } })}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontFamily: FONT.heading, fontSize: 20, fontWeight: 700, color: C.ink }}>
                    {req.origin} → {req.destination}
                  </div>
                  <div style={{ fontFamily: FONT.body, fontSize: 13, color: C.dust, marginTop: 2 }}>
                    {req.date} &middot; {req.tonnes}T &middot; {req.cargo}
                  </div>
                </div>
                {hasBid ? (
                  <div style={{ fontFamily: FONT.heading, fontSize: 11, fontWeight: 700, color: C.green, background: C.greenLt, padding: '4px 10px', borderRadius: 100, textTransform: 'uppercase' }}>
                    Bid Sent
                  </div>
                ) : (
                  <div style={{ fontFamily: FONT.heading, fontSize: 11, fontWeight: 700, color: C.amber, background: '#fef3c7', padding: '4px 10px', borderRadius: 100, textTransform: 'uppercase' }}>
                    Open
                  </div>
                )}
              </div>

              {shipper && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontFamily: FONT.body, fontSize: 14, fontWeight: 600, color: C.ink }}>{shipper.name}</span>
                  <TrustBadge score={shipper.trustScore} tier={shipper.tier} />
                </div>
              )}

              <div style={{ display: 'flex', gap: 16, fontFamily: FONT.body, fontSize: 13, color: C.dust }}>
                {distance && <span>{distance} km</span>}
                {tripCost && <span>Trip cost: K{tripCost.totalCost.toLocaleString()}</span>}
                {suggestedRate && <span style={{ color: C.green, fontWeight: 600 }}>Suggested: K{suggestedRate}/T</span>}
              </div>

              {!hasBid && (
                <div style={{ fontFamily: FONT.body, fontSize: 13, color: C.amber, fontWeight: 600, marginTop: 8 }}>
                  Tap to place a bid →
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* Other opportunities */}
      {opportunities.length > 0 && (
        <>
          <div className="sec-label" style={{ marginTop: 20, marginBottom: 12 }}>Available Loads from Other Truckers</div>
          <div style={{ fontFamily: FONT.body, fontSize: 13, color: C.dust, marginBottom: 12 }}>
            Trucks with space — you could consolidate or find return trip ideas.
          </div>
          {opportunities.map(({ load, loadOwner, distance, isReturnTrip }) => {
            const remaining = load.capacityTonnes - (load.bookedTonnes || 0);
            return (
              <div key={load.id} style={{ background: C.white, border: `1px solid ${C.line}`, padding: 14, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontFamily: FONT.heading, fontSize: 17, fontWeight: 700, color: C.ink }}>
                    {load.origin} → {load.destination}
                  </div>
                  {isReturnTrip && (
                    <span style={{ fontFamily: FONT.heading, fontSize: 10, fontWeight: 700, color: '#7c3aed', background: '#ede9fe', padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase' }}>
                      Return trip
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: FONT.body, fontSize: 13, color: C.dust }}>
                  {load.date} &middot; {remaining}T available &middot; K{load.ratePerTonne}/T &middot; {loadOwner?.name || 'Unknown'}
                  {distance && ` &middot; ${distance} km`}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
