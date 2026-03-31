// src/components/owner/Earnings.jsx
import React from 'react';
import { C, FONT } from '../../theme';
import { useApp } from '../../context/AppContext';
import { getUser } from '../../data/mockUsers';

export default function Earnings() {
  const { state } = useApp();
  const user = getUser(state.userId);

  const myBookings = state.bookings.filter(b => b.ownerId === state.userId);
  const paidBookings = myBookings.filter(b => b.status === 'paid');
  const pendingBookings = myBookings.filter(b => b.status === 'delivered');

  const totalEarned = paidBookings.reduce((sum, b) => sum + b.escrowAmount, 0);
  const pendingAmount = pendingBookings.reduce((sum, b) => sum + b.escrowAmount, 0);

  // Get the load details for paid bookings
  const paidLoads = paidBookings.map(b => {
    const load = state.loads.find(l => l.id === b.loadId);
    return { ...b, load };
  });

  return (
    <div className="animate-in">
      <h1
        style={{
          fontFamily: FONT.heading,
          fontSize: 28,
          fontWeight: 700,
          color: C.ink,
          margin: '0 0 20px',
        }}
      >
        Earnings
      </h1>

      <div className="stat-row">
        <div className="stat-box">
          <div className="stat-num" style={{ color: C.green }}>K{totalEarned.toLocaleString()}</div>
          <div className="stat-label">Total Earned</div>
        </div>
        <div className="stat-box">
          <div className="stat-num" style={{ color: C.amber }}>K{pendingAmount.toLocaleString()}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">{user.completedTrips}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="sec-label" style={{ marginTop: 24, marginBottom: 12 }}>
        Paid Loads
      </div>

      {paidLoads.length === 0 ? (
        <p style={{ fontFamily: FONT.body, fontSize: 14, color: C.dust }}>
          No paid loads yet.
        </p>
      ) : (
        paidLoads.map(item => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: `1px solid ${C.line}`,
              fontFamily: FONT.body,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: FONT.heading,
                  fontWeight: 700,
                  fontSize: 16,
                  color: C.ink,
                }}
              >
                {item.load ? `${item.load.origin} \u2192 ${item.load.destination}` : item.loadId}
              </div>
              <div style={{ fontSize: 13, color: C.dust, marginTop: 2 }}>
                Paid {item.paidAt}
              </div>
            </div>
            <div
              style={{
                fontFamily: FONT.heading,
                fontWeight: 700,
                fontSize: 18,
                color: C.green,
              }}
            >
              K{item.escrowAmount.toLocaleString()}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
