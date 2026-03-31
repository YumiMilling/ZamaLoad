// src/components/shipper/ViewBids.jsx
import React from 'react';
import { C, FONT } from '../../theme';
import { useApp } from '../../context/AppContext';
import { getUser } from '../../data/mockUsers';
import { getTruck } from '../../data/mockTrucks';
import { getDriver } from '../../data/mockDrivers';
import { scoreMatch, suggestRate } from '../../data/matchingEngine';
import StatusPill from '../shared/StatusPill';
import TrustBadge from '../shared/TrustBadge';

function scoreBadgeColor(score) {
  if (score >= 75) return { bg: C.greenLt, color: C.green };
  if (score >= 50) return { bg: C.amberLt, color: C.amberDk };
  return { bg: C.redLt, color: C.red };
}

export default function ViewBids() {
  const { state, dispatch } = useApp();
  const requestId = state.viewParams?.requestId;
  const request = state.requests.find((r) => r.id === requestId);

  if (!request) {
    return (
      <div className="animate-in" style={{ fontFamily: FONT.body, color: C.dust, padding: 32, textAlign: 'center' }}>
        Request not found.
      </div>
    );
  }

  const bids = state.bids.filter((b) => b.requestId === requestId);

  // Enrich bids with match scores
  const enrichedBids = bids
    .map((bid) => {
      const owner = getUser(bid.ownerId);
      const truck = getTruck(bid.truckId);
      const driver = getDriver(bid.driverId);
      // Compute score for this owner against the request
      const match = owner ? scoreMatch(owner, request, state.users) : null;
      const score = match ? match.score : 0;
      return { bid, owner, truck, driver, score, match };
    })
    .sort((a, b) => b.score - a.score);

  // Suggested rate for comparison
  const suggested = suggestRate(request.origin, request.destination, 'Flatbed (15T)', request.tonnes);

  return (
    <div className="animate-in">
      {/* Back button */}
      <button
        className="btn btn--secondary"
        style={{ marginBottom: 16, fontSize: 13 }}
        onClick={() => dispatch({ type: 'NAV', view: 'myRequests' })}
      >
        &larr; Back to My Requests
      </button>

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
            fontSize: 22,
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
      </div>

      <h2
        style={{
          fontFamily: FONT.heading,
          fontSize: 20,
          fontWeight: 700,
          color: C.ink,
          margin: '0 0 12px',
        }}
      >
        Bids ({bids.length})
      </h2>

      {enrichedBids.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            fontFamily: FONT.body,
            color: C.dust,
            background: C.white,
            borderRadius: 8,
            border: `1px solid ${C.line}`,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
            No bids yet
          </div>
          <div style={{ fontSize: 13 }}>
            Matching truck owners are being notified.
          </div>
        </div>
      ) : (
        enrichedBids.map(({ bid, owner, truck, driver, score }) => {
          const colors = scoreBadgeColor(score);
          const total = bid.ratePerTonne * request.tonnes;

          return (
            <div
              key={bid.id}
              className="load-card"
              style={{ marginBottom: 12 }}
            >
              {/* Top row: score badge + owner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
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
                    {score}%
                  </span>
                </div>

                {/* Owner info */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: FONT.heading,
                      fontSize: 16,
                      fontWeight: 700,
                      color: C.ink,
                    }}
                  >
                    {owner?.name || 'Unknown Owner'}
                  </div>
                  {owner && (
                    <TrustBadge score={owner.trustScore} tier={owner.tier} />
                  )}
                </div>

                <StatusPill status={bid.status} />
              </div>

              {/* Truck info */}
              {truck && (
                <div
                  style={{
                    fontFamily: FONT.body,
                    fontSize: 13,
                    color: C.ink,
                    marginBottom: 4,
                    padding: '6px 10px',
                    background: C.paper,
                    borderRadius: 6,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>Truck:</span>{' '}
                  {truck.plate} &middot; {truck.type} &middot; {truck.capacityTonnes}T capacity
                </div>
              )}

              {/* Driver info */}
              {driver && (
                <div
                  style={{
                    fontFamily: FONT.body,
                    fontSize: 13,
                    color: C.ink,
                    marginBottom: 10,
                    padding: '6px 10px',
                    background: C.paper,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <span>
                    <span style={{ fontWeight: 600 }}>Driver:</span> {driver.name}
                  </span>
                  <TrustBadge score={driver.trustScore} tier={driver.tier} />
                </div>
              )}

              {/* Rate */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT.heading,
                    fontSize: 18,
                    fontWeight: 700,
                    color: C.ink,
                  }}
                >
                  K{bid.ratePerTonne}/T &rarr; Total K{total.toLocaleString()}
                </div>
              </div>

              {/* Suggested rate comparison */}
              {suggested && (
                <div
                  style={{
                    fontFamily: FONT.body,
                    fontSize: 12,
                    color: C.dust,
                    marginBottom: 12,
                  }}
                >
                  Market rate: ~K{suggested.ratePerTonne}/T
                </div>
              )}

              {/* Accept button */}
              {bid.status === 'pending' && (
                <button
                  className="btn btn--success"
                  style={{ width: '100%', fontSize: 14 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch({ type: 'ACCEPT_BID', bidId: bid.id, insured: true });
                  }}
                >
                  Accept This Bid
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
