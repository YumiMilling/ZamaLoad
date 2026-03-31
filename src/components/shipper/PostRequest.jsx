// src/components/shipper/PostRequest.jsx
import React, { useState, useMemo } from 'react';
import { C, FONT } from '../../theme';
import { useApp } from '../../context/AppContext';
import { cities } from '../../data/routes';
import { getDistance } from '../../data/routeData';
import { suggestRate } from '../../data/matchingEngine';

export default function PostRequest() {
  const { dispatch } = useApp();
  const [form, setForm] = useState({
    origin: cities[0],
    destination: cities[1],
    date: '',
    tonnes: '',
    cargo: '',
  });

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const today = new Date().toISOString().slice(0, 10);
  const sameCity = form.origin === form.destination;
  const datePast = form.date && form.date < today;
  const tonnes = Number(form.tonnes);
  const isValid =
    form.date &&
    !datePast &&
    tonnes > 0 &&
    !sameCity &&
    form.cargo.trim().length > 0;

  const distance = useMemo(
    () => getDistance(form.origin, form.destination),
    [form.origin, form.destination]
  );

  // Suggest rate range using a mid-range truck type
  const rateInfo = useMemo(() => {
    if (!distance || tonnes <= 0) return null;
    const midType = 'Flatbed (15T)';
    return suggestRate(form.origin, form.destination, midType, tonnes || 15);
  }, [form.origin, form.destination, tonnes, distance]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    dispatch({
      type: 'ADD_REQUEST',
      request: {
        origin: form.origin,
        destination: form.destination,
        date: form.date,
        tonnes,
        cargo: form.cargo.trim(),
      },
    });
  };

  return (
    <div className="animate-in">
      <h1
        style={{
          fontFamily: FONT.heading,
          fontSize: 28,
          fontWeight: 700,
          color: C.ink,
          margin: '0 0 4px',
        }}
      >
        What do you need moved?
      </h1>
      <p
        style={{
          fontFamily: FONT.body,
          fontSize: 14,
          color: C.dust,
          margin: '0 0 20px',
        }}
      >
        Post a freight request and let truck owners bid.
      </p>

      <form onSubmit={handleSubmit}>
        <label className="field">
          <span style={{ fontFamily: FONT.heading, fontSize: 13, color: C.dust }}>
            Origin
          </span>
          <select value={form.origin} onChange={set('origin')}>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span style={{ fontFamily: FONT.heading, fontSize: 13, color: C.dust }}>
            Destination
          </span>
          <select value={form.destination} onChange={set('destination')}>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span style={{ fontFamily: FONT.heading, fontSize: 13, color: C.dust }}>
            Date
          </span>
          <input type="date" value={form.date} onChange={set('date')} min={today} />
        </label>

        <label className="field">
          <span style={{ fontFamily: FONT.heading, fontSize: 13, color: C.dust }}>
            Tonnes needed
          </span>
          <input
            type="number"
            min="1"
            step="0.5"
            placeholder="e.g. 12"
            value={form.tonnes}
            onChange={set('tonnes')}
          />
        </label>

        <label className="field">
          <span style={{ fontFamily: FONT.heading, fontSize: 13, color: C.dust }}>
            Cargo description
          </span>
          <input
            type="text"
            placeholder='e.g. "Cement bags", "Maize 50kg bags"'
            value={form.cargo}
            onChange={set('cargo')}
          />
        </label>

        {/* Validation messages */}
        {sameCity && (
          <div style={{ fontFamily: FONT.body, fontSize: 13, color: C.red, marginTop: 8 }}>
            Origin and destination cannot be the same.
          </div>
        )}
        {datePast && (
          <div style={{ fontFamily: FONT.body, fontSize: 13, color: C.red, marginTop: 8 }}>
            Date cannot be in the past.
          </div>
        )}

        {/* Estimated distance & rate range */}
        {!sameCity && distance && (
          <div
            style={{
              background: C.blueLt,
              border: `1px solid ${C.line}`,
              borderRadius: 8,
              padding: 14,
              marginTop: 16,
            }}
          >
            <div
              style={{
                fontFamily: FONT.heading,
                fontSize: 14,
                fontWeight: 600,
                color: C.blue,
                marginBottom: 6,
              }}
            >
              Route Estimate
            </div>
            <div style={{ fontFamily: FONT.body, fontSize: 13, color: C.ink }}>
              Distance: <strong>{distance} km</strong>
            </div>
            {rateInfo && (
              <div style={{ fontFamily: FONT.body, fontSize: 13, color: C.ink, marginTop: 4 }}>
                Suggested rate: <strong>K{rateInfo.ratePerTonne}/T</strong>{' '}
                <span style={{ color: C.dust }}>
                  (total ~K{Math.round(rateInfo.ratePerTonne * (tonnes || 1) )})
                </span>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          className="btn btn--primary"
          style={{ marginTop: 16, width: '100%', opacity: isValid ? 1 : 0.4 }}
          disabled={!isValid}
        >
          Post Request — Find Trucks
        </button>
      </form>
    </div>
  );
}
