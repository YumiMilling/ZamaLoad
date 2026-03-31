// src/components/shipper/LoadDetail.jsx
import React, { useState, useMemo } from 'react';
import { C, FONT, INSURANCE_RATE } from '../../theme';
import { useApp } from '../../context/AppContext';
import { getUser } from '../../data/mockUsers';
import { getTruck } from '../../data/mockTrucks';
import { getDriver } from '../../data/mockDrivers';
import { CARGO_CATEGORIES, isCompatibleWithLoad } from '../../data/cargoCategories';
import StatusPill from '../shared/StatusPill';
import TrustBadge from '../shared/TrustBadge';
import TruckCard from '../shared/TruckCard';
import DriverCard from '../shared/DriverCard';
import LiveMap from '../shared/LiveMap';
import TripUpdates from '../shared/TripUpdates';

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
  const myBooking = state.bookings.find(b => b.loadId === load.id && b.shipperId === state.userId);
  const allBookings = state.bookings.filter(b => b.loadId === load.id && b.status !== 'cancelled');
  const isInTransit = load.status === 'in-transit';
  const remaining = load.capacityTonnes - (load.bookedTonnes || 0);
  const canBook = (load.status === 'posted' || load.status === 'booked') && remaining > 0;
  const existingCategories = allBookings.map(b => b.cargoCategory).filter(Boolean);

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

      {/* Trip updates — shipper can view (not post) */}
      {(load.status === 'in-transit' || load.status === 'delivered' || load.status === 'paid') && (
        <TripUpdates loadId={load.id} canPost={false} />
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

      {/* Capacity bar */}
      <div style={{ background: C.white, border: `1px solid ${C.line}`, padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: FONT.heading, fontSize: 13, fontWeight: 700, color: C.dust, textTransform: 'uppercase', letterSpacing: '.06em' }}>Capacity</span>
          <span style={{ fontFamily: FONT.body, fontSize: 14, fontWeight: 600, color: C.ink }}>
            {load.bookedTonnes || 0}T / {load.capacityTonnes}T booked
          </span>
        </div>
        <div style={{ height: 10, background: '#e8e6e1', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(100, ((load.bookedTonnes || 0) / load.capacityTonnes) * 100)}%`,
            height: '100%', background: remaining > 0 ? C.amber : '#7c3aed', borderRadius: 5, transition: 'width .3s',
          }} />
        </div>
        <div style={{ fontFamily: FONT.body, fontSize: 13, color: remaining > 0 ? C.green : '#7c3aed', marginTop: 4, fontWeight: 600 }}>
          {remaining > 0 ? `${remaining}T available` : 'Truck is full'}
        </div>

        {/* Existing cargo on this truck */}
        {allBookings.length > 0 && (
          <div style={{ marginTop: 12, borderTop: `1px solid ${C.line}`, paddingTop: 10 }}>
            <div style={{ fontFamily: FONT.body, fontSize: 12, color: C.dust, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Cargo on this truck
            </div>
            {allBookings.map(b => {
              const cat = CARGO_CATEGORIES.find(c => c.id === b.cargoCategory);
              return (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontFamily: FONT.body, fontSize: 13 }}>
                  <span style={{ color: C.ink }}>{b.cargoDesc || cat?.label || 'Unknown'}</span>
                  <span style={{ color: C.dust, fontWeight: 600 }}>{b.tonnes}T</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking form — consolidated */}
      {canBook && <ConsolidatedBooking load={load} remaining={remaining} existingCategories={existingCategories} dispatch={dispatch} />}

      {/* My booking status */}
      {myBooking && (
        <div style={{ marginBottom: 12 }}>
          <div style={{
            background: C.greenLt, padding: 16, fontFamily: FONT.body, fontSize: 14,
            color: C.green, textAlign: 'center', fontWeight: 600,
            marginBottom: myBooking.insured ? 8 : 0,
          }}>
            Your booking: {myBooking.tonnes}T {myBooking.cargoDesc} &mdash; <StatusPill status={myBooking.status} />
          </div>
          {myBooking.insured && (
            <div style={{ background: '#e3f2fd', padding: 10, textAlign: 'center', fontFamily: FONT.body, fontSize: 13, color: '#1565c0', fontWeight: 600 }}>
              Cargo insured &mdash; Premium K{myBooking.insurancePremium.toLocaleString()}
            </div>
          )}
        </div>
      )}

      <button
        className="btn btn--secondary"
        onClick={() => dispatch({ type: 'NAV', view: 'findTruck' })}
      >
        Back to Search
      </button>
    </div>
  );
}

function ConsolidatedBooking({ load, remaining, existingCategories, dispatch }) {
  const [tonnes, setTonnes] = useState(remaining);
  const [cargoCategory, setCargoCategory] = useState('general');
  const [cargoDesc, setCargoDesc] = useState('');
  const [insured, setInsured] = useState(false);

  const compatible = isCompatibleWithLoad(cargoCategory, existingCategories);
  const t = Number(tonnes) || 0;
  const cargoValue = t * load.ratePerTonne;
  const premium = insured ? Math.round(cargoValue * INSURANCE_RATE) : 0;
  const total = cargoValue + premium;
  const isValid = t > 0 && t <= remaining && compatible;

  const selectedCat = CARGO_CATEGORIES.find(c => c.id === cargoCategory);

  return (
    <div style={{ background: C.white, border: `1px solid ${C.line}`, padding: 18, marginBottom: 16 }}>
      <div style={{ fontFamily: FONT.heading, fontSize: 16, fontWeight: 700, color: C.ink, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '.04em' }}>
        Book Space on This Truck
      </div>

      {/* Tonnes */}
      <div className="field">
        <label>How many tonnes?</label>
        <input type="number" min="0.5" max={remaining} step="0.5" value={tonnes}
          onChange={e => setTonnes(e.target.value)}
          style={{ fontFamily: FONT.heading, fontSize: 20, fontWeight: 700 }}
        />
        <div style={{ fontFamily: FONT.body, fontSize: 12, color: C.dust, marginTop: 2 }}>
          Max {remaining}T available at K{load.ratePerTonne}/T
        </div>
      </div>

      {/* Cargo category */}
      <div className="field">
        <label>Cargo type</label>
        <select value={cargoCategory} onChange={e => setCargoCategory(e.target.value)}>
          {CARGO_CATEGORIES.map(c => (
            <option key={c.id} value={c.id}>{c.label} — {c.examples}</option>
          ))}
        </select>
      </div>

      {/* Compatibility warning */}
      {!compatible && (
        <div style={{ background: C.redLt, padding: 12, marginBottom: 12, fontFamily: FONT.body, fontSize: 14, color: C.red, fontWeight: 600 }}>
          {selectedCat?.label || 'This cargo'} cannot share a truck with the existing cargo on this load. Choose a different truck or cargo type.
        </div>
      )}

      {/* Cargo description */}
      <div className="field">
        <label>Description (optional)</label>
        <input type="text" placeholder="e.g. 200 bags of cement" value={cargoDesc} onChange={e => setCargoDesc(e.target.value)} />
      </div>

      {/* Insurance toggle */}
      <div
        onClick={() => setInsured(v => !v)}
        style={{
          background: insured ? '#e3f2fd' : C.paper, border: `1px solid ${insured ? '#1565c0' : C.line}`,
          padding: 12, marginBottom: 14, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10,
        }}
      >
        <div style={{
          width: 20, height: 20, borderRadius: 4, flexShrink: 0,
          border: `2px solid ${insured ? '#1565c0' : C.line}`,
          background: insured ? '#1565c0' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {insured && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M5 12l5 5L19 7"/></svg>}
        </div>
        <div>
          <div style={{ fontFamily: FONT.heading, fontSize: 14, fontWeight: 700, color: insured ? '#1565c0' : C.ink }}>
            Insure this cargo
          </div>
          <div style={{ fontFamily: FONT.body, fontSize: 12, color: C.dust }}>
            Premium: K{premium.toLocaleString()} ({(INSURANCE_RATE * 100).toFixed(1)}%)
          </div>
        </div>
      </div>

      {/* Total */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: `1px solid ${C.line}`, marginBottom: 14 }}>
        <span style={{ fontFamily: FONT.heading, fontSize: 16, fontWeight: 700, color: C.ink }}>Total</span>
        <span style={{ fontFamily: FONT.heading, fontSize: 22, fontWeight: 900, color: C.amberDk }}>K{total.toLocaleString()}</span>
      </div>

      <button
        className="btn btn--primary"
        style={{ width: '100%', opacity: isValid ? 1 : 0.4 }}
        disabled={!isValid}
        onClick={() => dispatch({ type: 'BOOK_LOAD', loadId: load.id, tonnes: t, cargoCategory, cargoDesc, insured })}
      >
        Book {t}T &mdash; K{total.toLocaleString()}
      </button>
    </div>
  );
}
