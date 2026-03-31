// src/components/shared/LoadCard.jsx
import React from 'react';
import { C, FONT } from '../../theme';
import { getUser } from '../../data/mockUsers';
import { useApp } from '../../context/AppContext';
import StatusPill from './StatusPill';
import TrustBadge from './TrustBadge';

export default function LoadCard({ load }) {
  const { state, dispatch } = useApp();
  const owner = getUser(load.ownerId);

  const handleClick = () => {
    const view = state.role === 'owner' ? 'tripDetail' : 'loadDetail';
    dispatch({ type: 'NAV', view, params: { loadId: load.id } });
  };

  const totalValue = load.capacityTonnes * load.ratePerTonne;

  return (
    <div className="load-card animate-in" onClick={handleClick} style={{ cursor: 'pointer' }}>
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
        <StatusPill status={load.status} />
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
        <span>{load.capacityTonnes}T</span>
        <span>K{load.ratePerTonne}/T</span>
        <span style={{ color: C.ink, fontWeight: 600 }}>K{totalValue.toLocaleString()}</span>
      </div>

      {owner && (
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: FONT.body,
            fontSize: 13,
            color: C.ink,
          }}
        >
          <span>{owner.name}</span>
          <TrustBadge score={owner.trustScore} tier={owner.tier} />
        </div>
      )}
    </div>
  );
}
