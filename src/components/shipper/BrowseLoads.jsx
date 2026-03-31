// src/components/shipper/BrowseLoads.jsx
import React from 'react';
import { C, FONT } from '../../theme';
import { useApp } from '../../context/AppContext';
import LoadCard from '../shared/LoadCard';

export default function BrowseLoads() {
  const { state } = useApp();

  const availableLoads = state.loads.filter(l => l.status === 'posted');

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
        Available Loads
      </h1>

      {availableLoads.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 20px',
            fontFamily: FONT.body,
            color: C.dust,
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            style={{ marginBottom: 12, opacity: 0.4 }}
          >
            <circle cx="24" cy="24" r="20" stroke={C.dust} strokeWidth="2" />
            <path d="M16 28c0-4 3.5-6 8-6s8 2 8 6" stroke={C.dust} strokeWidth="2" strokeLinecap="round" />
            <circle cx="18" cy="20" r="2" fill={C.dust} />
            <circle cx="30" cy="20" r="2" fill={C.dust} />
          </svg>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
            No loads available right now
          </div>
          <div style={{ fontSize: 13 }}>
            Check back soon for new postings.
          </div>
        </div>
      ) : (
        availableLoads.map(load => <LoadCard key={load.id} load={load} />)
      )}
    </div>
  );
}
