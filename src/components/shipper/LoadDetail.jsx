// src/components/shipper/LoadDetail.jsx
import React from 'react';
import { C, FONT } from '../../theme';
import { useApp } from '../../context/AppContext';
import { getUser } from '../../data/mockUsers';
import StatusPill from '../shared/StatusPill';
import TrustBadge from '../shared/TrustBadge';

export default function LoadDetail() {
  const { state, dispatch } = useApp();
  const loadId = state.viewParams.loadId;
  const load = state.loads.find(l => l.id === loadId);

  if (!load) {
    return (
      <div className="animate-in" style={{ fontFamily: FONT.body, color: C.dust, padding: 20 }}>
        Load not found.
      </div>
    );
  }

  const owner = getUser(load.ownerId);
  const totalValue = load.capacityTonnes * load.ratePerTonne;
  const booking = state.bookings.find(b => b.loadId === load.id);

  return (
    <div className="animate-in">
      {/* Route heading */}
      <div
        style={{
          fontFamily: FONT.heading,
          fontWeight: 700,
          fontSize: 28,
          color: C.ink,
          marginBottom: 8,
          lineHeight: 1.2,
        }}
      >
        {load.origin} &rarr; {load.destination}
      </div>

      <div style={{ marginBottom: 20 }}>
        <StatusPill status={load.status} />
      </div>

      {/* Details grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 2,
          marginBottom: 20,
        }}
      >
        <div style={{ background: C.white, padding: 14 }}>
          <div className="sec-label" style={{ marginBottom: 4 }}>Date</div>
          <div style={{ fontFamily: FONT.body, fontSize: 15, fontWeight: 600, color: C.ink }}>
            {load.date}
          </div>
        </div>
        <div style={{ background: C.white, padding: 14 }}>
          <div className="sec-label" style={{ marginBottom: 4 }}>Capacity</div>
          <div style={{ fontFamily: FONT.body, fontSize: 15, fontWeight: 600, color: C.ink }}>
            {load.capacityTonnes} Tonnes
          </div>
        </div>
        <div style={{ background: C.white, padding: 14 }}>
          <div className="sec-label" style={{ marginBottom: 4 }}>Rate</div>
          <div style={{ fontFamily: FONT.body, fontSize: 15, fontWeight: 600, color: C.ink }}>
            K{load.ratePerTonne.toLocaleString()}/T
          </div>
        </div>
        <div style={{ background: C.white, padding: 14 }}>
          <div className="sec-label" style={{ marginBottom: 4 }}>Total Value</div>
          <div style={{ fontFamily: FONT.heading, fontSize: 20, fontWeight: 900, color: C.amberDk }}>
            K{totalValue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Truck type */}
      <div style={{ background: C.white, padding: 14, marginBottom: 20 }}>
        <div className="sec-label" style={{ marginBottom: 4 }}>Truck Type</div>
        <div style={{ fontFamily: FONT.body, fontSize: 15, fontWeight: 600, color: C.ink }}>
          {load.truckType}
        </div>
      </div>

      {/* Driver profile */}
      {owner && (
        <div style={{ background: C.white, padding: 18, marginBottom: 24 }}>
          <div className="sec-label" style={{ marginBottom: 12 }}>Driver Profile</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: C.line,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONT.heading,
                fontWeight: 700,
                fontSize: 18,
                color: C.dust,
              }}
            >
              {owner.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontFamily: FONT.body, fontSize: 16, fontWeight: 600, color: C.ink }}>
                {owner.name}
              </div>
              <div style={{ fontFamily: FONT.body, fontSize: 13, color: C.dust }}>
                {owner.location}
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <TrustBadge score={owner.trustScore} tier={owner.tier} />
          </div>
          <div
            style={{
              display: 'flex',
              gap: 24,
              fontFamily: FONT.body,
              fontSize: 13,
              color: C.dust,
            }}
          >
            <span>
              <strong style={{ color: C.ink }}>{owner.completedTrips}</strong> completed trips
            </span>
            <span>
              Member since <strong style={{ color: C.ink }}>{owner.memberSince}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Action area */}
      {load.status === 'posted' && (
        <button
          className="btn btn--primary"
          onClick={() => dispatch({ type: 'BOOK_LOAD', loadId: load.id })}
          style={{ marginBottom: 12 }}
        >
          Book This Load &mdash; K{totalValue.toLocaleString()}
        </button>
      )}

      {load.status !== 'posted' && booking && (
        <div
          style={{
            background: C.greenLt,
            padding: 16,
            marginBottom: 12,
            fontFamily: FONT.body,
            fontSize: 14,
            color: C.green,
            textAlign: 'center',
            fontWeight: 600,
          }}
        >
          Booking {booking.id} &mdash; <StatusPill status={load.status} />
        </div>
      )}

      <button
        className="btn btn--secondary"
        onClick={() => dispatch({ type: 'NAV', view: 'browse' })}
      >
        Back to Browse
      </button>
    </div>
  );
}
