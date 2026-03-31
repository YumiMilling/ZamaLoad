// src/components/owner/PlaceBid.jsx
import React, { useState, useMemo } from 'react';
import { C, FONT } from '../../theme';
import { useApp } from '../../context/AppContext';
import { getUser } from '../../data/mockUsers';
import { getOwnerTrucks } from '../../data/mockTrucks';
import { getOwnerDrivers } from '../../data/mockDrivers';
import { scoreMatch } from '../../data/matchingEngine';
import { getDistance, calculateTripCost } from '../../data/routeData';
import StatusPill from '../shared/StatusPill';

export default function PlaceBid() {
  const { state, dispatch } = useApp();
  const requestId = state.viewParams?.requestId;
  const request = state.requests.find((r) => r.id === requestId);
  const owner = getUser(state.userId);

  // Get owner's trucks and drivers
  const allTrucks = getOwnerTrucks(state.userId);
  const allDrivers = getOwnerDrivers(state.userId);

  // Valid trucks: not expired, capacity >= request tonnes
  const validTrucks = useMemo(
    () =>
      allTrucks
        .filter((t) => t.status !== 'expired')
        .filter((t) => request && t.capacityTonnes >= request.tonnes),
    [allTrucks, request]
  );

  // Compute match to get best truck/driver and suggested rate
  const match = useMemo(() => {
    if (!owner || !request) return null;
    return scoreMatch(owner, request, state.users);
  }, [owner, request, state.users]);

  // Form state — pre-fill from matching engine
  const [truckId, setTruckId] = useState(match?.bestTruck?.id || validTrucks[0]?.id || '');
  const [driverId, setDriverId] = useState(match?.bestDriver?.id || allDrivers[0]?.id || '');
  const [rate, setRate] = useState(match?.suggestedRate?.ratePerTonne?.toString() || '');

  const selectedTruck = allTrucks.find((t) => t.id === truckId);
  const rateNum = Number(rate);

  // Trip cost breakdown for selected truck
  const tripCost = useMemo(() => {
    if (!request || !selectedTruck) return null;
    return calculateTripCost(request.origin, request.destination, selectedTruck.type);
  }, [request, selectedTruck]);

  const distance = request ? getDistance(request.origin, request.destination) : null;

  // Profit calculation
  const totalRevenue = rateNum * (request?.tonnes || 0);
  const profit = tripCost ? totalRevenue - tripCost.totalCost : 0;

  const isValid = truckId && driverId && rateNum > 0 && request?.status === 'open';

  // Check for duplicate bid
  const alreadyBid = state.bids.some(
    (b) => b.requestId === requestId && b.ownerId === state.userId
  );

  if (!request) {
    return (
      <div className="animate-in" style={{ fontFamily: FONT.body, color: C.dust, padding: 32, textAlign: 'center' }}>
        Request not found.
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid || alreadyBid) return;
    dispatch({
      type: 'PLACE_BID',
      requestId: request.id,
      truckId,
      driverId,
      ratePerTonne: rateNum,
    });
  };

  return (
    <div className="animate-in">
      {/* Back button */}
      <button
        className="btn btn--secondary"
        style={{ marginBottom: 16, fontSize: 13 }}
        onClick={() => dispatch({ type: 'NAV', view: 'matchedRequests' })}
      >
        &larr; Back to Requests
      </button>

      <h1
        style={{
          fontFamily: FONT.heading,
          fontSize: 28,
          fontWeight: 700,
          color: C.ink,
          margin: '0 0 20px',
        }}
      >
        Place a Bid
      </h1>

      {/* Request summary */}
      <div
        style={{
          background: C.white,
          border: `1px solid ${C.line}`,
          borderRadius: 8,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontFamily: FONT.heading,
            fontSize: 20,
            fontWeight: 700,
            color: C.ink,
            marginBottom: 4,
          }}
        >
          {request.origin} &rarr; {request.destination}
        </div>
        <div
          style={{
            fontFamily: FONT.body,
            fontSize: 13,
            color: C.dust,
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <span>{request.date}</span>
          <span>{request.tonnes}T</span>
          <span>{request.cargo}</span>
          <StatusPill status={request.status} />
        </div>
        {distance && (
          <div style={{ fontFamily: FONT.body, fontSize: 13, color: C.ink, marginTop: 6 }}>
            Distance: <strong>{distance} km</strong>
          </div>
        )}
      </div>

      {alreadyBid ? (
        <div
          style={{
            fontFamily: FONT.body,
            fontSize: 15,
            fontWeight: 600,
            color: C.green,
            background: C.greenLt,
            padding: '16px 20px',
            borderRadius: 8,
            textAlign: 'center',
          }}
        >
          You have already placed a bid on this request.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Truck selector */}
          <label className="field">
            <span style={{ fontFamily: FONT.heading, fontSize: 13, color: C.dust }}>
              Truck
            </span>
            {validTrucks.length === 0 ? (
              <div style={{ fontFamily: FONT.body, fontSize: 13, color: C.red, padding: '8px 0' }}>
                No trucks with enough capacity ({request.tonnes}T required).
              </div>
            ) : (
              <select value={truckId} onChange={(e) => setTruckId(e.target.value)}>
                {validTrucks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.plate} — {t.type} ({t.capacityTonnes}T)
                  </option>
                ))}
              </select>
            )}
          </label>

          {/* Driver selector */}
          <label className="field">
            <span style={{ fontFamily: FONT.heading, fontSize: 13, color: C.dust }}>
              Driver
            </span>
            {allDrivers.length === 0 ? (
              <div style={{ fontFamily: FONT.body, fontSize: 13, color: C.red, padding: '8px 0' }}>
                No drivers registered.
              </div>
            ) : (
              <select value={driverId} onChange={(e) => setDriverId(e.target.value)}>
                {allDrivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.completedTrips} trips
                  </option>
                ))}
              </select>
            )}
          </label>

          {/* Rate input */}
          <label className="field">
            <span style={{ fontFamily: FONT.heading, fontSize: 13, color: C.dust }}>
              Rate per tonne (K)
            </span>
            <input
              type="number"
              min="1"
              placeholder="e.g. 400"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
          </label>

          {match?.suggestedRate && (
            <div style={{ fontFamily: FONT.body, fontSize: 12, color: C.dust, marginTop: -6, marginBottom: 12 }}>
              Suggested rate: K{match.suggestedRate.ratePerTonne}/T
            </div>
          )}

          {/* Trip cost breakdown */}
          {tripCost && rateNum > 0 && (
            <div
              style={{
                background: C.paper,
                border: `1px solid ${C.line}`,
                borderRadius: 8,
                padding: 14,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontFamily: FONT.heading,
                  fontSize: 14,
                  fontWeight: 600,
                  color: C.ink,
                  marginBottom: 8,
                }}
              >
                Trip Cost Breakdown
              </div>

              <div className="stat-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                <div className="stat-box" style={{ flex: 1, minWidth: 80 }}>
                  <div className="stat-label" style={{ fontFamily: FONT.body, fontSize: 11, color: C.dust }}>Distance</div>
                  <div className="stat-num" style={{ fontFamily: FONT.heading, fontSize: 16, fontWeight: 700, color: C.ink }}>{tripCost.distanceKm} km</div>
                </div>
                <div className="stat-box" style={{ flex: 1, minWidth: 80 }}>
                  <div className="stat-label" style={{ fontFamily: FONT.body, fontSize: 11, color: C.dust }}>Fuel</div>
                  <div className="stat-num" style={{ fontFamily: FONT.heading, fontSize: 16, fontWeight: 700, color: C.ink }}>K{tripCost.fuelCost.toLocaleString()}</div>
                </div>
                <div className="stat-box" style={{ flex: 1, minWidth: 80 }}>
                  <div className="stat-label" style={{ fontFamily: FONT.body, fontSize: 11, color: C.dust }}>Tolls</div>
                  <div className="stat-num" style={{ fontFamily: FONT.heading, fontSize: 16, fontWeight: 700, color: C.ink }}>K{tripCost.totalTolls}</div>
                </div>
              </div>

              <div className="stat-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                <div className="stat-box" style={{ flex: 1, minWidth: 80 }}>
                  <div className="stat-label" style={{ fontFamily: FONT.body, fontSize: 11, color: C.dust }}>Driver ({tripCost.tripDays}d)</div>
                  <div className="stat-num" style={{ fontFamily: FONT.heading, fontSize: 16, fontWeight: 700, color: C.ink }}>K{tripCost.driverCost}</div>
                </div>
                <div className="stat-box" style={{ flex: 1, minWidth: 80 }}>
                  <div className="stat-label" style={{ fontFamily: FONT.body, fontSize: 11, color: C.dust }}>Trip Cost</div>
                  <div className="stat-num" style={{ fontFamily: FONT.heading, fontSize: 16, fontWeight: 700, color: C.ink }}>K{tripCost.totalCost.toLocaleString()}</div>
                </div>
                <div className="stat-box" style={{ flex: 1, minWidth: 80 }}>
                  <div className="stat-label" style={{ fontFamily: FONT.body, fontSize: 11, color: C.dust }}>Revenue</div>
                  <div className="stat-num" style={{ fontFamily: FONT.heading, fontSize: 16, fontWeight: 700, color: C.ink }}>K{totalRevenue.toLocaleString()}</div>
                </div>
              </div>

              {/* Profit highlight */}
              <div
                style={{
                  fontFamily: FONT.heading,
                  fontSize: 16,
                  fontWeight: 700,
                  color: profit >= 0 ? C.green : C.red,
                  textAlign: 'center',
                  paddingTop: 8,
                  borderTop: `1px solid ${C.line}`,
                }}
              >
                {profit >= 0 ? 'Profit' : 'Loss'}: K{Math.abs(profit).toLocaleString()}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn--primary"
            style={{ marginTop: 4, width: '100%', opacity: isValid ? 1 : 0.4 }}
            disabled={!isValid}
          >
            Submit Bid — K{rateNum || 0}/T
          </button>
        </form>
      )}
    </div>
  );
}
