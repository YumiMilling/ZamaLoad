// src/components/shipper/LoadDetail.jsx
import React, { useState } from 'react';
import { C, FONT, INSURANCE_RATE } from '../../theme';
import { useApp } from '../../context/AppContext';
import { getUser } from '../../data/mockUsers';
import { getTruck } from '../../data/mockTrucks';
import { getDriver } from '../../data/mockDrivers';
import StatusPill from '../shared/StatusPill';
import TrustBadge from '../shared/TrustBadge';
import TruckCard from '../shared/TruckCard';
import DriverCard from '../shared/DriverCard';
import LiveMap from '../shared/LiveMap';

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
  const truck = getTruck(load.truckId);
  const driver = getDriver(load.driverId);
  const totalValue = load.capacityTonnes * load.ratePerTonne;
  const booking = state.bookings.find(b => b.loadId === load.id);
  const isInTransit = load.status === 'in-transit';

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

      {/* Live tracking map — shown for booked/in-transit loads */}
      {(load.status === 'in-transit' || load.status === 'booked') && (
        <LiveMap origin={load.origin} destination={load.destination} isActive={isInTransit} />
      )}

      {/* Truck & Driver details */}
      {(truck || driver) && (
        <div style={{ marginBottom: 20 }}>
          {truck && (
            <div style={{ marginBottom: 8 }}>
              <div className="sec-label">Truck</div>
              <TruckCard truck={truck} />
            </div>
          )}
          {driver && (
            <div>
              <div className="sec-label">Driver</div>
              <DriverCard driver={driver} />
            </div>
          )}
        </div>
      )}

      {/* Action area */}
      {load.status === 'posted' && <InsuranceBooking load={load} totalValue={totalValue} dispatch={dispatch} />}

      {load.status !== 'posted' && booking && (
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              background: C.greenLt,
              padding: 16,
              fontFamily: FONT.body,
              fontSize: 14,
              color: C.green,
              textAlign: 'center',
              fontWeight: 600,
              marginBottom: booking.insured ? 8 : 0,
            }}
          >
            Booking {booking.id} &mdash; <StatusPill status={load.status} />
          </div>
          {booking.insured && (
            <div style={{
              background: '#e3f2fd', padding: 10, textAlign: 'center',
              fontFamily: FONT.body, fontSize: 13, color: '#1565c0', fontWeight: 600,
            }}>
              Cargo insured &mdash; Premium K{booking.insurancePremium.toLocaleString()}
            </div>
          )}
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

function InsuranceBooking({ load, totalValue, dispatch }) {
  const [insured, setInsured] = useState(false);
  const premium = Math.round(totalValue * INSURANCE_RATE);
  const total = insured ? totalValue + premium : totalValue;

  return (
    <div style={{ marginBottom: 12 }}>
      {/* Insurance toggle */}
      <div
        onClick={() => setInsured(v => !v)}
        style={{
          background: insured ? '#e3f2fd' : C.white,
          border: `2px solid ${insured ? '#1565c0' : C.line}`,
          padding: 16, marginBottom: 12, cursor: 'pointer',
          display: 'flex', alignItems: 'flex-start', gap: 12,
          transition: 'all .15s',
        }}
      >
        {/* Checkbox */}
        <div style={{
          width: 22, height: 22, borderRadius: 4, flexShrink: 0, marginTop: 1,
          border: `2px solid ${insured ? '#1565c0' : C.line}`,
          background: insured ? '#1565c0' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {insured && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L19 7"/>
            </svg>
          )}
        </div>
        <div>
          <div style={{ fontFamily: FONT.heading, fontSize: 16, fontWeight: 700, color: insured ? '#1565c0' : C.ink }}>
            Insure this cargo
          </div>
          <div style={{ fontFamily: FONT.body, fontSize: 13, color: C.dust, marginTop: 2 }}>
            Covers damage or loss during transit. Premium: <strong style={{ color: C.ink }}>K{premium.toLocaleString()}</strong> ({(INSURANCE_RATE * 100).toFixed(1)}% of cargo value)
          </div>
        </div>
      </div>

      {/* Price summary */}
      {insured && (
        <div style={{ background: C.white, padding: 14, marginBottom: 12, border: `1px solid ${C.line}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT.body, fontSize: 14, color: C.dust, marginBottom: 4 }}>
            <span>Cargo value</span><span>K{totalValue.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT.body, fontSize: 14, color: '#1565c0', marginBottom: 4 }}>
            <span>Insurance premium</span><span>K{premium.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT.heading, fontSize: 18, fontWeight: 700, color: C.ink, borderTop: `1px solid ${C.line}`, paddingTop: 8, marginTop: 4 }}>
            <span>Total</span><span>K{total.toLocaleString()}</span>
          </div>
        </div>
      )}

      <button
        className="btn btn--primary"
        onClick={() => dispatch({ type: 'BOOK_LOAD', loadId: load.id, insured })}
      >
        Book This Load &mdash; K{total.toLocaleString()}
      </button>
    </div>
  );
}
