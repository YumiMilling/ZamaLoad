// src/components/owner/TripDetail.jsx
import React from 'react';
import { C, FONT } from '../../theme';
import { useApp } from '../../context/AppContext';
import { getUser } from '../../data/mockUsers';
import StatusPill from '../shared/StatusPill';
import TrustBadge from '../shared/TrustBadge';

const STEPS = ['posted', 'booked', 'in-transit', 'delivered', 'paid'];
const STEP_LABELS = { posted: 'Posted', booked: 'Booked', 'in-transit': 'In Transit', delivered: 'Delivered', paid: 'Paid' };

export default function TripDetail() {
  const { state, dispatch } = useApp();
  const load = state.loads.find(l => l.id === state.viewParams.loadId);

  if (!load) {
    return (
      <p style={{ fontFamily: FONT.body, fontSize: 14, color: C.dust }}>
        Load not found.
      </p>
    );
  }

  const booking = state.bookings.find(b => b.loadId === load.id);
  const shipper = booking ? getUser(booking.shipperId) : null;
  const totalValue = load.capacityTonnes * load.ratePerTonne;
  const currentIdx = STEPS.indexOf(load.status);

  const handleAdvance = () => {
    dispatch({ type: 'ADVANCE_STATUS', loadId: load.id });
  };

  return (
    <div className="animate-in">
      <div
        style={{
          fontFamily: FONT.heading,
          fontWeight: 700,
          fontSize: 32,
          color: C.ink,
          marginBottom: 4,
        }}
      >
        {load.origin} &rarr; {load.destination}
      </div>

      <div style={{ marginBottom: 16 }}>
        <StatusPill status={load.status} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          fontFamily: FONT.body,
          fontSize: 14,
          color: C.ink,
          marginBottom: 24,
        }}
      >
        <div>
          <span style={{ fontFamily: FONT.heading, fontSize: 11, color: C.dust, display: 'block' }}>Date</span>
          {load.date}
        </div>
        <div>
          <span style={{ fontFamily: FONT.heading, fontSize: 11, color: C.dust, display: 'block' }}>Truck Type</span>
          {load.truckType}
        </div>
        <div>
          <span style={{ fontFamily: FONT.heading, fontSize: 11, color: C.dust, display: 'block' }}>Capacity</span>
          {load.capacityTonnes} tonnes
        </div>
        <div>
          <span style={{ fontFamily: FONT.heading, fontSize: 11, color: C.dust, display: 'block' }}>Rate</span>
          K{load.ratePerTonne}/T
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <span style={{ fontFamily: FONT.heading, fontSize: 11, color: C.dust, display: 'block' }}>Total Value</span>
          <span style={{ fontWeight: 700, fontSize: 18 }}>K{totalValue.toLocaleString()}</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="sec-label" style={{ marginBottom: 12 }}>Progress</div>
      <div className="timeline" style={{ marginBottom: 24 }}>
        {STEPS.map((step, i) => {
          let cls = 'timeline-step';
          if (i < currentIdx) cls += ' timeline-step--done';
          if (i === currentIdx) cls += ' timeline-step--active';
          return (
            <div key={step} className={cls}>
              <span style={{ fontFamily: FONT.body, fontSize: 13 }}>{STEP_LABELS[step]}</span>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      {load.status === 'booked' && (
        <button className="btn btn--primary" onClick={handleAdvance} style={{ width: '100%', marginBottom: 16 }}>
          Mark In Transit
        </button>
      )}
      {load.status === 'in-transit' && (
        <button className="btn btn--success" onClick={handleAdvance} style={{ width: '100%', marginBottom: 16 }}>
          Mark Delivered
        </button>
      )}

      {/* Shipper info */}
      {shipper && (
        <div style={{ marginTop: 8 }}>
          <div className="sec-label" style={{ marginBottom: 8 }}>Shipper</div>
          <div
            style={{
              fontFamily: FONT.body,
              fontSize: 14,
              color: C.ink,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontWeight: 600 }}>{shipper.name}</span>
            <TrustBadge score={shipper.trustScore} tier={shipper.tier} />
          </div>
          <div style={{ fontFamily: FONT.body, fontSize: 13, color: C.dust, marginTop: 4 }}>
            {shipper.phone}
          </div>
          {booking && (
            <div style={{ fontFamily: FONT.body, fontSize: 13, color: C.dust, marginTop: 2 }}>
              Booked {booking.bookedAt} &middot; Escrow K{booking.escrowAmount.toLocaleString()}
            </div>
          )}
        </div>
      )}

      {/* Back button */}
      <button
        className="btn btn--secondary"
        onClick={() => dispatch({ type: 'NAV', view: 'ownerDash' })}
        style={{ width: '100%', marginTop: 20 }}
      >
        Back to Dashboard
      </button>
    </div>
  );
}
