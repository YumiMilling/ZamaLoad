import { useState, useMemo } from 'react';
import { C, FONT } from '../../theme';
import { useApp } from '../../context/AppContext';
import { cities } from '../../data/routes';
import { getUser } from '../../data/mockUsers';
import { getTruck } from '../../data/mockTrucks';
import { getDriver } from '../../data/mockDrivers';
import { getDistance } from '../../data/routeData';
import { scoreMatch } from '../../data/matchingEngine';
import TrustBadge from '../shared/TrustBadge';
import TruckCard from '../shared/TruckCard';
import DriverCard from '../shared/DriverCard';

const PACKAGING = ['Pallets', 'Sacks / Bags', 'Boxes', 'Loose / Bulk', 'Drums', 'Steel / Rebar', 'Mixed'];

const today = () => new Date().toISOString().slice(0, 10);

export default function FindTruck() {
  const { state, dispatch } = useApp();

  const [form, setForm] = useState({
    origin: cities[0],
    destination: cities[4],
    date: today(),
    tonnes: '',
    packaging: PACKAGING[0],
    cargoDesc: '',
  });
  const [searched, setSearched] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const tonnes = Number(form.tonnes) || 0;
  const distanceKm = form.origin !== form.destination ? getDistance(form.origin, form.destination) : null;
  const isValid = form.origin !== form.destination && form.date && tonnes > 0;

  // Build a virtual request for the matching engine
  const fakeRequest = useMemo(() => ({
    origin: form.origin,
    destination: form.destination,
    date: form.date,
    tonnes,
  }), [form.origin, form.destination, form.date, tonnes]);

  // Find matching owners
  const matches = useMemo(() => {
    if (!isValid || !searched) return [];
    const owners = state.users.filter(u => u.role === 'owner');
    return owners
      .map(owner => {
        const match = scoreMatch(owner, fakeRequest, state.users);
        return match ? { owner, match } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.match.score - a.match.score);
  }, [isValid, searched, state.users, fakeRequest]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (isValid) setSearched(true);
  };

  const handleBook = (owner, match) => {
    // Create a load from the owner's best truck + navigate to LoadDetail
    dispatch({
      type: 'ADD_LOAD',
      load: {
        origin: form.origin,
        destination: form.destination,
        date: form.date,
        capacityTonnes: tonnes,
        ratePerTonne: match.suggestedRate?.ratePerTonne || 400,
        truckType: match.bestTruck.type,
        truckId: match.bestTruck.id,
        driverId: match.bestDriver.id,
        ownerId: owner.id,
      },
    });
    // The ADD_LOAD navigates to ownerDash, but we want loadDetail for shipper
    // Find the just-created load and navigate
    setTimeout(() => {
      const loads = [...state.loads];
      // Navigate to browse to see posted loads
      dispatch({ type: 'NAV', view: 'browse' });
    }, 0);
  };

  return (
    <div className="animate-in">
      {/* Search form */}
      <h1 style={{ fontFamily: FONT.heading, fontSize: 28, fontWeight: 800, color: C.ink, marginBottom: 4 }}>
        Find a Truck
      </h1>
      <p style={{ fontFamily: FONT.body, fontSize: 15, color: C.dust, marginBottom: 24 }}>
        Tell us what you need moved. We'll find the best trucks for you.
      </p>

      <form onSubmit={handleSearch}>
        {/* Origin / Destination */}
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

        {/* Date */}
        <div className="field">
          <label>When</label>
          <input type="date" value={form.date} onChange={set('date')} min={today()} />
        </div>

        {/* Cargo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div className="field">
            <label>Weight (tonnes)</label>
            <input type="number" min="0.5" step="0.5" placeholder="e.g. 15" value={form.tonnes} onChange={set('tonnes')} />
          </div>
          <div className="field">
            <label>Packaging</label>
            <select value={form.packaging} onChange={set('packaging')}>
              {PACKAGING.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="field">
          <label>What are you moving? (optional)</label>
          <input type="text" placeholder="e.g. 300 bags of cement" value={form.cargoDesc} onChange={set('cargoDesc')} />
        </div>

        <button
          type="submit"
          className="btn btn--primary"
          style={{ width: '100%', opacity: isValid ? 1 : 0.4 }}
          disabled={!isValid}
        >
          {searched ? 'Update Search' : 'Find Available Trucks'}
        </button>
      </form>

      {/* Results */}
      {searched && (
        <div style={{ marginTop: 28 }}>
          {matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🚛</div>
              <div style={{ fontFamily: FONT.heading, fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: 4 }}>
                No trucks available
              </div>
              <div style={{ fontFamily: FONT.body, fontSize: 14, color: C.dust }}>
                Try adjusting the weight or date. We're notifying truck owners on this route.
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontFamily: FONT.heading, fontSize: 16, fontWeight: 700, color: C.dust, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 16 }}>
                {matches.length} truck{matches.length !== 1 ? 's' : ''} available
              </div>

              {matches.map(({ owner, match }) => (
                <MatchCard
                  key={owner.id}
                  owner={owner}
                  match={match}
                  tonnes={tonnes}
                  origin={form.origin}
                  destination={form.destination}
                  onBook={() => handleBook(owner, match)}
                  dispatch={dispatch}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MatchCard({ owner, match, tonnes, origin, destination, onBook, dispatch }) {
  const { bestTruck, bestDriver, score, suggestedRate } = match;
  const total = suggestedRate ? tonnes * suggestedRate.ratePerTonne : 0;

  const scoreColor = score >= 75 ? C.green : score >= 50 ? C.amber : C.red;

  return (
    <div style={{
      background: C.white, border: `1px solid ${C.line}`, marginBottom: 14,
      overflow: 'hidden',
    }}>
      {/* Score + Owner header */}
      <div style={{ padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `1px solid ${C.line}` }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', background: C.paper,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FONT.heading, fontWeight: 700, fontSize: 17, color: C.dust,
            }}>
              {owner.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontFamily: FONT.body, fontSize: 16, fontWeight: 600, color: C.ink }}>{owner.name}</div>
              <div style={{ fontFamily: FONT.body, fontSize: 13, color: C.dust }}>{owner.location}</div>
            </div>
          </div>
          <TrustBadge score={owner.trustScore} tier={owner.tier} />
        </div>

        {/* Match score */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            border: `3px solid ${scoreColor}`, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT.heading, fontSize: 20, fontWeight: 900, color: scoreColor,
          }}>
            {score}
          </div>
          <div style={{ fontFamily: FONT.body, fontSize: 10, color: C.dust, marginTop: 2 }}>MATCH</div>
        </div>
      </div>

      {/* Truck + Driver */}
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.line}` }}>
        <TruckCard truck={bestTruck} compact />
        <div style={{ height: 8 }} />
        <DriverCard driver={bestDriver} compact />
      </div>

      {/* Rate + Book */}
      <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          {suggestedRate && (
            <>
              <div style={{ fontFamily: FONT.heading, fontSize: 22, fontWeight: 900, color: C.amberDk }}>
                K{suggestedRate.ratePerTonne}/T
              </div>
              <div style={{ fontFamily: FONT.body, fontSize: 13, color: C.dust }}>
                Total: K{total.toLocaleString()} for {tonnes}T
              </div>
            </>
          )}
        </div>
        <button
          className="btn btn--primary"
          style={{ width: 'auto', padding: '12px 24px' }}
          onClick={() => dispatch({ type: 'NAV', view: 'loadDetail', params: { ownerId: owner.id, truckId: bestTruck.id, driverId: bestDriver.id, origin, destination, tonnes, rate: suggestedRate?.ratePerTonne } })}
        >
          View &amp; Book
        </button>
      </div>
    </div>
  );
}
