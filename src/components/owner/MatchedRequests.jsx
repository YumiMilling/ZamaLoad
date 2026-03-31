// src/components/owner/MatchedRequests.jsx
import React, { useMemo } from 'react';
import { C, FONT } from '../../theme';
import { useApp } from '../../context/AppContext';
import { getUser } from '../../data/mockUsers';
import { scoreMatch, suggestRate } from '../../data/matchingEngine';
import { getDistance, calculateTripCost } from '../../data/routeData';
import StatusPill from '../shared/StatusPill';
import TrustBadge from '../shared/TrustBadge';

function scoreBadgeColor(score) {
  if (score >= 75) return { bg: C.greenLt, color: C.green };
  if (score >= 50) return { bg: C.amberLt, color: C.amberDk };
  return { bg: C.redLt, color: C.red };
}

export default function MatchedRequests() {
  const { state, dispatch } = useApp();
  const owner = getUser(state.userId);

  const matchedRequests = useMemo(() => {
    if (!owner) return [];

    const openRequests = state.requests.filter((r) => r.status === 'open');

    return openRequests
      .map((req) => {
        const match = scoreMatch(owner, req, state.users);
        if (!match) return null; // no valid truck with enough capacity

        const distance = getDistance(req.origin, req.destination);
        const tripCost = match.bestTruck
          ? calculateTripCost(req.origin, req.destination, match.bestTruck.type)
          : null;
        const shipper = getUser(req.shipperId);

        return { req, match, distance, tripCost, shipper };
      })
      .filter(Boolean)
      .sort((a, b) => b.match.score - a.match.score);
  }, [owner, state.requests, state.users]);

  // Check if owner already bid on a request
  const existingBid = (requestId) =>
    state.bids.find((b) => b.requestId === requestId && b.ownerId === state.userId);

  return (
    <div className="animate-in">
      <h1
        style={{
          fontFamily: FONT.heading,
          fontSize: 28,
          fontWeight: 700,
          color: C.ink,
          margin: '0 0 4px',
        }}
      >
        Freight Requests For You
      </h1>
      <p
        style={{
          fontFamily: FONT.body,
          fontSize: 14,
          color: C.dust,
          margin: '0 0 20px',
        }}
      >
        Matched to your trucks and routes
      </p>

      {matchedRequests.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 20px',
            fontFamily: FONT.body,
            color: C.dust,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
            No matching requests right now
          </div>
          <div style={{ fontSize: 13 }}>
            New freight requests will appear here when they match your trucks.
          </div>
        </div>
      ) : (
        matchedRequests.map(({ req, match, distance, tripCost, shipper }) => {
          const colors = scoreBadgeColor(match.score);
          const bid = existingBid(req.id);

          return (
            <div key={req.id} className="load-card" style={{ marginBottom: 12 }}>
              {/* Top row: score badge + route */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  marginBottom: 10,
                }}
              >
                {/* Match score badge */}
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    background: colors.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONT.heading,
                      fontSize: 22,
                      fontWeight: 700,
                      color: colors.color,
                    }}
                  >
                    {match.score}%
                  </span>
                </div>

                {/* Route and meta */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: FONT.heading,
                      fontSize: 20,
                      fontWeight: 700,
                      color: C.ink,
                      marginBottom: 2,
                    }}
                  >
                    {req.origin} &rarr; {req.destination}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT.body,
                      fontSize: 13,
                      color: C.dust,
                      display: 'flex',
                      gap: 10,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span>{req.date}</span>
                    <span>{req.tonnes}T</span>
                    <span>{req.cargo}</span>
                  </div>
                </div>
              </div>

              {/* Shipper info */}
              {shipper && (
                <div
                  style={{
                    fontFamily: FONT.body,
                    fontSize: 13,
                    color: C.ink,
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>Shipper:</span>
                  <span>{shipper.name}</span>
                  <TrustBadge score={shipper.trustScore} tier={shipper.tier} />
                </div>
              )}

              {/* Suggested rate */}
              {match.suggestedRate && (
                <div
                  style={{
                    fontFamily: FONT.heading,
                    fontSize: 16,
                    fontWeight: 700,
                    color: C.green,
                    marginBottom: 6,
                  }}
                >
                  Suggested rate: K{match.suggestedRate.ratePerTonne}/T
                </div>
              )}

              {/* Distance and trip cost summary */}
              {distance && tripCost && (
                <div
                  style={{
                    fontFamily: FONT.body,
                    fontSize: 12,
                    color: C.dust,
                    marginBottom: 12,
                    padding: '8px 10px',
                    background: C.paper,
                    borderRadius: 6,
                    display: 'flex',
                    gap: 14,
                    flexWrap: 'wrap',
                  }}
                >
                  <span>{distance} km</span>
                  <span>Fuel: K{tripCost.fuelCost.toLocaleString()}</span>
                  <span>Tolls: K{tripCost.totalTolls}</span>
                  <span>Driver: K{tripCost.driverCost}</span>
                  <span style={{ fontWeight: 600 }}>
                    Trip cost: K{tripCost.totalCost.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Bid button or bid status */}
              {bid ? (
                <div
                  style={{
                    fontFamily: FONT.body,
                    fontSize: 14,
                    fontWeight: 600,
                    color: C.green,
                    background: C.greenLt,
                    padding: '10px 16px',
                    borderRadius: 8,
                    textAlign: 'center',
                  }}
                >
                  Bid Placed — K{bid.ratePerTonne}/T
                </div>
              ) : (
                <button
                  className="btn btn--primary"
                  style={{ width: '100%', fontSize: 14 }}
                  onClick={() =>
                    dispatch({
                      type: 'NAV',
                      view: 'placeBid',
                      params: { requestId: req.id },
                    })
                  }
                >
                  Place a Bid
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
