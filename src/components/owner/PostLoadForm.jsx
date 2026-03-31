// src/components/owner/PostLoadForm.jsx
import React, { useState } from 'react';
import { C, FONT } from '../../theme';
import { useApp } from '../../context/AppContext';
import { cities, truckTypes } from '../../data/routes';

export default function PostLoadForm() {
  const { dispatch } = useApp();
  const [form, setForm] = useState({
    origin: cities[0],
    destination: cities[1],
    date: '',
    capacityTonnes: '',
    ratePerTonne: '',
    truckType: truckTypes[0],
  });

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.date || !form.capacityTonnes || !form.ratePerTonne) return;
    dispatch({
      type: 'ADD_LOAD',
      load: {
        origin: form.origin,
        destination: form.destination,
        date: form.date,
        capacityTonnes: Number(form.capacityTonnes),
        ratePerTonne: Number(form.ratePerTonne),
        truckType: form.truckType,
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
          margin: '0 0 20px',
        }}
      >
        Post a Load
      </h1>

      <form onSubmit={handleSubmit}>
        <label className="field">
          <span style={{ fontFamily: FONT.heading, fontSize: 13, color: C.dust }}>Origin</span>
          <select value={form.origin} onChange={set('origin')}>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span style={{ fontFamily: FONT.heading, fontSize: 13, color: C.dust }}>Destination</span>
          <select value={form.destination} onChange={set('destination')}>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span style={{ fontFamily: FONT.heading, fontSize: 13, color: C.dust }}>Date</span>
          <input type="date" value={form.date} onChange={set('date')} />
        </label>

        <label className="field">
          <span style={{ fontFamily: FONT.heading, fontSize: 13, color: C.dust }}>Capacity (tonnes)</span>
          <input
            type="number"
            min="1"
            placeholder="e.g. 15"
            value={form.capacityTonnes}
            onChange={set('capacityTonnes')}
          />
        </label>

        <label className="field">
          <span style={{ fontFamily: FONT.heading, fontSize: 13, color: C.dust }}>Rate per tonne (K)</span>
          <input
            type="number"
            min="1"
            placeholder="e.g. 450"
            value={form.ratePerTonne}
            onChange={set('ratePerTonne')}
          />
        </label>

        <label className="field">
          <span style={{ fontFamily: FONT.heading, fontSize: 13, color: C.dust }}>Truck Type</span>
          <select value={form.truckType} onChange={set('truckType')}>
            {truckTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <button type="submit" className="btn btn--primary" style={{ marginTop: 16, width: '100%' }}>
          Post Load
        </button>
      </form>
    </div>
  );
}
