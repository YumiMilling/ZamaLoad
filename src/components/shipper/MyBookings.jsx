// src/components/shipper/MyBookings.jsx
import React from 'react';
import { C, FONT } from '../../theme';
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
        {booking.status === 'delivered' && (
          <div
            style={{
              marginTop: 8,
              fontFamily: FONT.body,
              fontSize: 13,
              color: C.green,
              fontWeight: 600,
            }}
          >
            Tap to confirm delivery
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
