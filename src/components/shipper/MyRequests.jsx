// src/components/shipper/MyRequests.jsx
import React from 'react';
import { C, FONT } from '../../theme';
import { useApp } from '../../context/AppContext';
import StatusPill from '../shared/StatusPill';

export default function MyRequests() {
  const { state, dispatch } = useApp();

  const myRequests = state.requests.filter((r) => r.shipperId === state.userId);

  const bidCountFor = (requestId) =>
    state.bids.filter((b) => b.requestId === requestId).length;

  const handleTap = (req) => {
    if (req.status === 'open') {
      dispatch({ type: 'NAV', view: 'viewBids', params: { requestId: req.id } });
    } else if (req.status === 'matched') {
      // Find the load created from the accepted bid
      const acceptedBid = state.bids.find((b) => b.id === req.acceptedBidId);
      if (acceptedBid) {
        const load = state.loads.find(
          (l) => l.ownerId === acceptedBid.ownerId && l.origin === req.origin && l.destination === req.destination
        );
        if (load) {
          dispatch({ type: 'NAV', view: 'loadDetail', params: { loadId: load.id } });
          return;
        }
      }
      dispatch({ type: 'NAV', view: 'myBookings' });
    }
  };

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
        My Freight Requests
      </h1>
      <p
        style={{
          fontFamily: FONT.body,
          fontSize: 14,
          color: C.dust,
          margin: '0 0 20px',
        }}
      >
        Track your posted requests and incoming bids.
      </p>

      {myRequests.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 20px',
            fontFamily: FONT.body,
            color: C.dust,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
            No requests yet
          </div>
          <div style={{ fontSize: 13 }}>
            Post a request to start receiving bids from truck owners.
          </div>
          <button
            className="btn btn--primary"
            style={{ marginTop: 16 }}
            onClick={() => dispatch({ type: 'NAV', view: 'postRequest' })}
          >
            Post a Request
          </button>
        </div>
      ) : (
        myRequests.map((req) => {
          const bids = bidCountFor(req.id);
          const isOpen = req.status === 'open';
          const isMatched = req.status === 'matched';

          return (
            <div
              key={req.id}
              className="load-card"
              onClick={() => handleTap(req)}
              style={{ cursor: 'pointer' }}
            >
              {/* Route */}
              <div
                style={{
                  fontFamily: FONT.heading,
                  fontSize: 20,
                  fontWeight: 700,
                  color: C.ink,
                  marginBottom: 4,
                }}
              >
                {req.origin} &rarr; {req.destination}
              </div>

              {/* Meta row */}
              <div
                style={{
                  fontFamily: FONT.body,
                  fontSize: 13,
                  color: C.dust,
                  marginBottom: 8,
                  display: 'flex',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <span>{req.date}</span>
                <span>{req.tonnes}T</span>
                <span>{req.cargo}</span>
              </div>

              {/* Status row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <StatusPill status={req.status} />

                {isOpen && bids > 0 && (
                  <div
                    style={{
                      fontFamily: FONT.body,
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.amber,
                    }}
                  >
                    {bids} bid{bids !== 1 ? 's' : ''} received — Tap to view bids
                  </div>
                )}

                {isOpen && bids === 0 && (
                  <div
                    style={{
                      fontFamily: FONT.body,
                      fontSize: 13,
                      color: C.dust,
                    }}
                  >
                    Awaiting bids...
                  </div>
                )}

                {isMatched && (
                  <div
                    style={{
                      fontFamily: FONT.body,
                      fontSize: 13,
                      fontWeight: 600,
                      color: C.green,
                    }}
                  >
                    Matched — View Trip &rarr;
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
