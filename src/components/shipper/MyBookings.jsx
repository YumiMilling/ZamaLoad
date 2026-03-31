// src/components/shipper/MyBookings.jsx
import React from 'react';
import { C, FONT, CLAIM_STATUS } from '../../theme';
import { useApp } from '../../context/AppContext';
import StatusPill from '../shared/StatusPill';

export default function MyBookings() {
  const { state, dispatch } = useApp();

  const myBookings = state.bookings.filter(b => b.shipperId === state.userId);
  const active = myBookings.filter(b => b.status !== 'paid');
  const past = myBookings.filter(b => b.status === 'paid');

  const getLoad = (loadId) => state.loads.find(l => l.id === loadId);

  const handleTap = (booking) => {
    if (booking.status === 'delivered') {
      dispatch({ type: 'NAV', view: 'confirmDelivery', params: { loadId: booking.loadId } });
    } else {
      dispatch({ type: 'NAV', view: 'loadDetail', params: { loadId: booking.loadId } });
    }
  };

  const BookingRow = ({ booking }) => {
    const load = getLoad(booking.loadId);
    if (!load) return null;
    const claim = state.claims.find(c => c.bookingId === booking.id);

    return (
      <div
        className="load-card animate-in"
        onClick={() => handleTap(booking)}
        style={{ cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div
            style={{
              fontFamily: FONT.heading,
              fontWeight: 700,
              fontSize: 18,
              color: C.ink,
            }}
          >
            {load.origin} &rarr; {load.destination}
          </div>
          <StatusPill status={booking.status} />
        </div>
        <div
          style={{
            fontFamily: FONT.body,
            fontSize: 13,
            color: C.dust,
            marginTop: 6,
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <span>{load.date}</span>
          <span style={{ color: C.ink, fontWeight: 600 }}>
            K{booking.escrowAmount.toLocaleString()}
          </span>
        </div>
        {booking.insured && (
          <div style={{ marginTop: 6, fontFamily: FONT.body, fontSize: 12, color: '#1565c0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01z"/></svg>
            Insured
          </div>
        )}
        {booking.status === 'in-transit' && (
          <div style={{ marginTop: 8, fontFamily: FONT.body, fontSize: 13, color: C.amber, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, animation: 'pulse 2s infinite' }} />
            Live — Tap to track
          </div>
        )}
        {booking.status === 'delivered' && (
          <div style={{ marginTop: 8, fontFamily: FONT.body, fontSize: 13, color: C.green, fontWeight: 600 }}>
            Tap to confirm delivery &amp; release payment
          </div>
        )}
        {claim && (
          <div style={{
            marginTop: 6, fontFamily: FONT.body, fontSize: 12, fontWeight: 600,
            color: CLAIM_STATUS[claim.status].color,
            background: CLAIM_STATUS[claim.status].bg,
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 8px', borderRadius: 100,
          }}>
            Claim: {CLAIM_STATUS[claim.status].label}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-in">
      <h1
        style={{
          fontFamily: FONT.heading,
          fontSize: 28,
          fontWeight: 700,
          color: C.ink,
          margin: 0,
          marginBottom: 20,
        }}
      >
        My Bookings
      </h1>

      {myBookings.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 20px',
            fontFamily: FONT.body,
            color: C.dust,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
            No bookings yet
          </div>
          <div style={{ fontSize: 13 }}>
            Browse available loads to book your first shipment.
          </div>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <>
              <div className="sec-label" style={{ marginBottom: 12 }}>
                Active
              </div>
              {active.map(b => (
                <BookingRow key={b.id} booking={b} />
              ))}
            </>
          )}

          {past.length > 0 && (
            <>
              <div className="sec-label" style={{ marginTop: 24, marginBottom: 12 }}>
                Past
              </div>
              {past.map(b => (
                <BookingRow key={b.id} booking={b} />
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}
