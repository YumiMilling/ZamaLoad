// src/components/owner/TripDetail.jsx
import React from 'react';
import { C, FONT } from '../../theme';
import { useApp } from '../../context/AppContext';
import { getUser } from '../../data/mockUsers';
import { getTruck } from '../../data/mockTrucks';
import { getDriver } from '../../data/mockDrivers';
import StatusPill from '../shared/StatusPill';
import TrustBadge from '../shared/TrustBadge';
import TruckCard from '../shared/TruckCard';
import DriverCard from '../shared/DriverCard';
import LiveMap from '../shared/LiveMap';
import TripCostBreakdown from '../shared/TripCostBreakdown';
import { getRouteTolls } from '../../data/routeData';

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

  const allBookings = state.bookings.filter(b => b.loadId === load.id && b.status !== 'cancelled');
  const truck = getTruck(load.truckId);
  const driver = getDriver(load.driverId);
  const totalValue = load.capacityTonnes * load.ratePerTonne;
  const currentIdx = STEPS.indexOf(load.status);
  const isInTransit = load.status === 'in-transit';

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

      {/* Live tracking map */}
      <LiveMap origin={load.origin} destination={load.destination} isActive={isInTransit} tollGates={getRouteTolls(load.origin, load.destination)} />

      {/* Trip cost breakdown */}
      <TripCostBreakdown origin={load.origin} destination={load.destination} truckType={load.truckType} cargoValue={totalValue} />

      {/* Truck & Driver */}
      <div style={{ marginBottom: 16 }}>
        <div className="sec-label">Truck</div>
        <TruckCard truck={truck} compact />
      </div>
      <div style={{ marginBottom: 20 }}>
        <div className="sec-label">Driver</div>
        <DriverCard driver={driver} compact />
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
      {(load.status === 'booked' || load.status === 'full') && (
        <button className="btn btn--primary" onClick={handleAdvance} style={{ width: '100%', marginBottom: 16 }}>
          Start Trip — Mark In Transit
        </button>
      )}
      {load.status === 'in-transit' && (
        <button className="btn btn--success" onClick={handleAdvance} style={{ width: '100%', marginBottom: 16 }}>
          Mark Delivered
        </button>
      )}

      {/* Cargo manifest — all shippers on this truck */}
      {allBookings.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div className="sec-label" style={{ marginBottom: 8 }}>
            Cargo Manifest ({allBookings.length} shipper{allBookings.length > 1 ? 's' : ''} &middot; {allBookings.reduce((s, b) => s + (b.tonnes || 0), 0)}T loaded)
          </div>
          {allBookings.map(b => {
            const shipper = getUser(b.shipperId);
            return (
              <div key={b.id} style={{ background: C.white, border: `1px solid ${C.line}`, padding: 14, marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: FONT.body, fontSize: 15, fontWeight: 600, color: C.ink }}>{shipper?.name || 'Unknown'}</span>
                    {shipper && <TrustBadge score={shipper.trustScore} tier={shipper.tier} />}
                  </div>
                  <span style={{ fontFamily: FONT.heading, fontSize: 16, fontWeight: 700, color: C.amberDk }}>{b.tonnes}T</span>
                </div>
                <div style={{ fontFamily: FONT.body, fontSize: 13, color: C.dust }}>
                  {b.cargoDesc || 'General cargo'} &middot; K{b.escrowAmount.toLocaleString()} &middot; {b.bookedAt}
                  {b.insured && <span style={{ color: '#1565c0', fontWeight: 600 }}> &middot; Insured</span>}
                </div>
              </div>
            );
          })}

          {/* Remaining capacity */}
          {(load.status === 'posted' || load.status === 'booked') && (load.capacityTonnes - (load.bookedTonnes || 0)) > 0 && (
            <div style={{ fontFamily: FONT.body, fontSize: 13, color: C.green, fontWeight: 600, marginTop: 6 }}>
              {load.capacityTonnes - (load.bookedTonnes || 0)}T still available — accepting more cargo
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
