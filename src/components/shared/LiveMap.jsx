import { useState, useEffect } from 'react';
import { C, FONT } from '../../theme';
import { cityCoords, interpolatePosition } from '../../data/routeCoords';

/**
 * Simulated live tracking map.
 * Shows origin, destination, route line, and a moving truck dot.
 * SVG-based — no external map library.
 */

// Convert lat/lng to SVG coordinates within a bounding box
function project(lat, lng, bounds, width, height, padding) {
  const x = padding + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * (width - 2 * padding);
  const y = padding + ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * (height - 2 * padding);
  return { x, y };
}

export default function LiveMap({ origin, destination, isActive }) {
  const [progress, setProgress] = useState(0.15); // start at 15%

  // Simulate movement when active
  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => {
      setProgress(p => {
        if (p >= 0.92) return 0.15; // loop
        return p + 0.008 + Math.random() * 0.005; // slightly irregular speed
      });
    }, 200);
    return () => clearInterval(id);
  }, [isActive]);

  const from = cityCoords[origin];
  const to = cityCoords[destination];
  if (!from || !to) return null;

  // Bounding box with margin
  const margin = 0.5;
  const bounds = {
    minLat: Math.min(from.lat, to.lat) - margin,
    maxLat: Math.max(from.lat, to.lat) + margin,
    minLng: Math.min(from.lng, to.lng) - margin,
    maxLng: Math.max(from.lng, to.lng) + margin,
  };

  // Ensure minimum aspect ratio so short routes don't look weird
  const latRange = bounds.maxLat - bounds.minLat;
  const lngRange = bounds.maxLng - bounds.minLng;
  if (lngRange < latRange) {
    const diff = (latRange - lngRange) / 2;
    bounds.minLng -= diff;
    bounds.maxLng += diff;
  }
  if (latRange < lngRange) {
    const diff = (lngRange - latRange) / 2;
    bounds.minLat -= diff;
    bounds.maxLat += diff;
  }

  const W = 380, H = 240, PAD = 30;
  const originPt = project(from.lat, from.lng, bounds, W, H, PAD);
  const destPt = project(to.lat, to.lng, bounds, W, H, PAD);

  const truckPos = interpolatePosition(origin, destination, progress);
  const truckPt = truckPos ? project(truckPos.lat, truckPos.lng, bounds, W, H, PAD) : originPt;

  const pct = Math.round(progress * 100);
  // Rough distance estimate (degrees to km, very approximate for Zambia)
  const totalKm = Math.round(Math.sqrt((to.lat - from.lat) ** 2 + (to.lng - from.lng) ** 2) * 111);
  const remainingKm = Math.round(totalKm * (1 - progress));

  return (
    <div style={{ background: C.white, border: `1px solid ${C.line}`, overflow: 'hidden', marginBottom: 16 }}>
      {/* Map header */}
      <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isActive && <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, animation: 'pulse 2s infinite' }} />}
          <span style={{ fontFamily: FONT.heading, fontSize: 13, fontWeight: 700, color: isActive ? C.green : C.dust, textTransform: 'uppercase', letterSpacing: '.08em' }}>
            {isActive ? 'Live Tracking' : 'Route'}
          </span>
        </div>
        {isActive && (
          <span style={{ fontFamily: FONT.body, fontSize: 13, color: C.ink, fontWeight: 600 }}>
            ~{remainingKm} km remaining
          </span>
        )}
      </div>

      {/* SVG Map */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block', background: '#f8f6f2' }}>
        {/* Grid lines for subtle texture */}
        {[0.25, 0.5, 0.75].map(f => (
          <line key={`h${f}`} x1={0} y1={H * f} x2={W} y2={H * f} stroke={C.line} strokeWidth="0.5" opacity="0.4" />
        ))}
        {[0.25, 0.5, 0.75].map(f => (
          <line key={`v${f}`} x1={W * f} y1={0} x2={W * f} y2={H} stroke={C.line} strokeWidth="0.5" opacity="0.4" />
        ))}

        {/* Route line — dashed behind */}
        <line x1={originPt.x} y1={originPt.y} x2={destPt.x} y2={destPt.y}
          stroke={C.line} strokeWidth="2" strokeDasharray="6 4" />

        {/* Progress line — solid */}
        {isActive && (
          <line x1={originPt.x} y1={originPt.y} x2={truckPt.x} y2={truckPt.y}
            stroke={C.amber} strokeWidth="3" strokeLinecap="round" />
        )}

        {/* Origin marker */}
        <circle cx={originPt.x} cy={originPt.y} r="6" fill={C.green} stroke={C.white} strokeWidth="2" />
        <text x={originPt.x} y={originPt.y - 12} textAnchor="middle"
          style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, fill: C.ink }}>
          {origin}
        </text>

        {/* Destination marker */}
        <circle cx={destPt.x} cy={destPt.y} r="6" fill={C.red} stroke={C.white} strokeWidth="2" />
        <text x={destPt.x} y={destPt.y + 18} textAnchor="middle"
          style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, fill: C.ink }}>
          {destination}
        </text>

        {/* Truck marker — animated */}
        {isActive && (
          <g>
            {/* Glow */}
            <circle cx={truckPt.x} cy={truckPt.y} r="14" fill={C.amber} opacity="0.15" />
            <circle cx={truckPt.x} cy={truckPt.y} r="9" fill={C.amber} opacity="0.25" />
            {/* Truck icon */}
            <circle cx={truckPt.x} cy={truckPt.y} r="5" fill={C.amber} stroke={C.white} strokeWidth="2" />
          </g>
        )}

        {/* Progress label */}
        {isActive && (
          <text x={truckPt.x + 12} y={truckPt.y - 10}
            style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 700, fill: C.amberDk }}>
            {pct}%
          </text>
        )}
      </svg>

      {/* ETA bar */}
      {isActive && (
        <div style={{ padding: '8px 14px', background: '#fef3c7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: FONT.body, fontSize: 13, color: C.amberDk }}>
            ETA: ~{Math.round(remainingKm / 60)} hrs at 60 km/h
          </span>
          <span style={{ fontFamily: FONT.heading, fontSize: 14, fontWeight: 700, color: C.amberDk }}>
            {pct}% complete
          </span>
        </div>
      )}
    </div>
  );
}
