import { useState, useMemo } from 'react';
import { C, FONT } from '../../theme';
import { useApp } from '../../context/AppContext';
import { cities } from '../../data/routes';
import { getUser } from '../../data/mockUsers';
import { getTruck } from '../../data/mockTrucks';
import { getDriver } from '../../data/mockDrivers';
import { getDistance } from '../../data/routeData';
import { CARGO_CATEGORIES } from '../../data/cargoCategories';
import TrustBadge from '../shared/TrustBadge';
import TruckCard from '../shared/TruckCard';
import DriverCard from '../shared/DriverCard';
import StatusPill from '../shared/StatusPill';

const today = () => new Date().toISOString().slice(0, 10);

export default function FindTruck() {
  const { state, dispatch } = useApp();

  const [form, setForm] = useState({
    origin: cities[0],
    destination: cities[4],
    date: today(),
    tonnes: '',
    cargoCategory: 'general',
    cargoDesc: '',
    dedicated: false, // true = full truck, false = ok with sharing
  });
  const [searched, setSearched] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const tonnes = Number(form.tonnes) || 0;
  const distanceKm = form.origin !== form.destination ? getDistance(form.origin, form.destination) : null;
  const isValid = form.origin !== form.destination && form.date && tonnes > 0;

  // Find posted/booked loads that match: same route, enough remaining capacity
  const matchingLoads = useMemo(() => {
    if (!isValid || !searched) return [];
    return state.loads
      .filter(l => (l.status === 'posted' || l.status === 'booked'))
      .filter(l => l.origin === form.origin && l.destination === form.destination)
      .filter(l => (l.capacityTonnes - (l.bookedTonnes || 0)) >= tonnes)
      // If dedicated: only show trucks with zero existing bookings
      .filter(l => !form.dedicated || (l.bookedTonnes || 0) === 0)
      .map(l => {
        const owner = getUser(l.ownerId);
        const truck = getTruck(l.truckId);
        const driver = getDriver(l.driverId);
        const remaining = l.capacityTonnes - (l.bookedTonnes || 0);
        const totalPrice = tonnes * l.ratePerTonne;
        // Simple score based on owner trust + capacity fit
        const capacityFit = Math.round((tonnes / l.capacityTonnes) * 100);
        const trustPct = Math.round((owner?.trustScore || 0) * 100);
        const score = Math.round(trustPct * 0.6 + capacityFit * 0.4);
        return { load: l, owner, truck, driver, remaining, totalPrice, score };
      })
      .sort((a, b) => b.score - a.score);
  }, [isValid, searched, state.loads, form.origin, form.destination, tonnes]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (isValid) setSearched(true);
  };

  return (
    <div className="animate-in">
      <h1 style={{ fontFamily: FONT.heading, fontSize: 28, fontWeight: 800, color: C.ink, marginBottom: 4 }}>
        Find a Truck
      </h1>
      <p style={{ fontFamily: FONT.body, fontSize: 15, color: C.dust, marginBottom: 24 }}>
        Tell us what you need moved. We'll find available trucks.
      </p>

      <form onSubmit={handleSearch}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 4 }}>
          <div className="field">
            <label>From</label>
            <select value={form.origin} onChange={set('origin')}>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>To</label>
            <select value={form.destination} onChange={set('destination')}>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {form.origin === form.destination && (
          <div style={{ fontFamily: FONT.body, fontSize: 13, color: C.red, marginBottom: 8 }}>
            Origin and destination must be different.
          </div>
        )}

        {distanceKm && (
          <div style={{ fontFamily: FONT.body, fontSize: 13, color: C.dust, marginBottom: 12 }}>
            Distance: <strong style={{ color: C.ink }}>{distanceKm} km</strong>
          </div>
        )}

        <div className="field">
          <label>When</label>
          <input type="date" value={form.date} onChange={set('date')} min={today()} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div className="field">
            <label>Weight (tonnes)</label>
            <input type="number" min="0.5" step="0.5" placeholder="e.g. 15" value={form.tonnes} onChange={set('tonnes')} />
          </div>
          <div className="field">
            <label>Cargo type</label>
            <select value={form.cargoCategory} onChange={set('cargoCategory')}>
              {CARGO_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div className="field">
          <label>Description (optional)</label>
          <input type="text" placeholder="e.g. 300 bags of cement" value={form.cargoDesc} onChange={set('cargoDesc')} />
        </div>

        {/* Dedicated vs consolidated */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button type="button"
            onClick={() => setForm(f => ({ ...f, dedicated: false }))}
            style={{
              flex: 1, padding: '12px 8px', border: `2px solid ${!form.dedicated ? C.amber : C.line}`,
              background: !form.dedicated ? '#fef3c7' : C.white, cursor: 'pointer',
              fontFamily: FONT.heading, fontSize: 13, fontWeight: 700, color: !form.dedicated ? C.amberDk : C.dust,
              textTransform: 'uppercase', letterSpacing: '.04em', textAlign: 'center',
            }}>
            Share truck (cheaper)
          </button>
          <button type="button"
            onClick={() => setForm(f => ({ ...f, dedicated: true }))}
            style={{
              flex: 1, padding: '12px 8px', border: `2px solid ${form.dedicated ? C.amber : C.line}`,
              background: form.dedicated ? '#fef3c7' : C.white, cursor: 'pointer',
              fontFamily: FONT.heading, fontSize: 13, fontWeight: 700, color: form.dedicated ? C.amberDk : C.dust,
              textTransform: 'uppercase', letterSpacing: '.04em', textAlign: 'center',
            }}>
            Dedicated truck
          </button>
        </div>

        <button type="submit" className="btn btn--primary" style={{ width: '100%', opacity: isValid ? 1 : 0.4 }} disabled={!isValid}>
          {searched ? 'Update Search' : 'Find Available Trucks'}
        </button>
      </form>

      {/* Results */}
      {searched && (
        <div style={{ marginTop: 28 }}>
          {matchingLoads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🚛</div>
              <div style={{ fontFamily: FONT.heading, fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: 4 }}>
                No trucks on this route
              </div>
              <div style={{ fontFamily: FONT.body, fontSize: 14, color: C.dust }}>
                Try a different route or date. We're notifying truck owners.
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontFamily: FONT.heading, fontSize: 14, fontWeight: 700, color: C.dust, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 16 }}>
                {matchingLoads.length} truck{matchingLoads.length !== 1 ? 's' : ''} available
              </div>

              {matchingLoads.map(({ load, owner, truck, driver, remaining, totalPrice, score }) => (
                <div key={load.id}
                  onClick={() => dispatch({ type: 'NAV', view: 'loadDetail', params: { loadId: load.id } })}
                  className="load-card" style={{ cursor: 'pointer' }}>

                  {/* Top row: route + score */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontFamily: FONT.heading, fontSize: 20, fontWeight: 700, color: C.ink }}>
                        {load.origin} → {load.destination}
                      </div>
                      <div style={{ fontFamily: FONT.body, fontSize: 13, color: C.dust, marginTop: 2 }}>
                        {load.date} &middot; {remaining}T of {load.capacityTonnes}T available
                      </div>
                    </div>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      border: `3px solid ${score >= 70 ? C.green : score >= 50 ? C.amber : C.dust}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: FONT.heading, fontSize: 17, fontWeight: 900,
                      color: score >= 70 ? C.green : score >= 50 ? C.amber : C.dust,
                      flexShrink: 0,
                    }}>
                      {score}
                    </div>
                  </div>

                  {/* Truck + Driver */}
                  {truck && <TruckCard truck={truck} compact />}
                  {driver && <div style={{ marginTop: 6 }}><DriverCard driver={driver} compact /></div>}

                  {/* Owner + Price */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.line}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {owner && <>
                        <span style={{ fontFamily: FONT.body, fontSize: 14, fontWeight: 600, color: C.ink }}>{owner.name}</span>
                        <TrustBadge score={owner.trustScore} tier={owner.tier} />
                      </>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: FONT.heading, fontSize: 20, fontWeight: 900, color: C.amberDk }}>
                        K{totalPrice.toLocaleString()}
                      </div>
                      <div style={{ fontFamily: FONT.body, fontSize: 11, color: C.dust }}>
                        K{load.ratePerTonne}/T × {tonnes}T
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
