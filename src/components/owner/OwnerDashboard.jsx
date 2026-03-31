// src/components/owner/OwnerDashboard.jsx
import React from 'react';
import { C, FONT } from '../../theme';
import { useApp } from '../../context/AppContext';
import { getUser } from '../../data/mockUsers';
import TrustBadge from '../shared/TrustBadge';
import LoadCard from '../shared/LoadCard';

export default function OwnerDashboard() {
  const { state } = useApp();
  const user = getUser(state.userId);

  const myLoads = state.loads
    .filter(l => l.ownerId === state.userId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const activeLoads = myLoads.filter(l => l.status !== 'paid');

  const totalEarned = state.bookings
    .filter(b => b.ownerId === state.userId && b.status === 'paid')
    .reduce((sum, b) => sum + b.escrowAmount, 0);

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontFamily: FONT.heading,
            fontSize: 28,
            fontWeight: 700,
            color: C.ink,
            margin: 0,
          }}
        >
          Hello, {user.name}
        </h1>
        <div style={{ marginTop: 6 }}>
          <TrustBadge score={user.trustScore} tier={user.tier} />
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-box">
          <div className="stat-num">{activeLoads.length}</div>
          <div className="stat-label">Active Loads</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">K{totalEarned.toLocaleString()}</div>
          <div className="stat-label">Total Earned</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">{user.completedTrips}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="sec-label" style={{ marginTop: 24, marginBottom: 12 }}>
        Your Loads
      </div>

      {myLoads.length === 0 ? (
        <p style={{ fontFamily: FONT.body, fontSize: 14, color: C.dust }}>
          No loads posted yet.
        </p>
      ) : (
        myLoads.map(load => <LoadCard key={load.id} load={load} />)
      )}
    </div>
  );
}
