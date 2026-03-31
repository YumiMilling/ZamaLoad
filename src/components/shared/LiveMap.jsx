import { useState, useEffect, useCallback, useMemo } from 'react';
import { APIProvider, Map, Marker, useMap } from '@vis.gl/react-google-maps';
import { C, FONT } from '../../theme';
import { cityCoords, interpolatePosition } from '../../data/routeCoords';
import { getDistance } from '../../data/routeData';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

/**
 * Renders the route polyline using Google Directions API.
 */
function RoutePolyline({ origin, destination }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !window.google) return;

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#e8a020',
        strokeWeight: 4,
        strokeOpacity: 0.8,
      },
    });

    directionsRenderer.setMap(map);

    const from = cityCoords[origin];
    const to = cityCoords[destination];
    if (!from || !to) return;

    directionsService.route({
      origin: { lat: from.lat, lng: from.lng },
      destination: { lat: to.lat, lng: to.lng },
      travelMode: google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
      }
    });

    return () => directionsRenderer.setMap(null);
  }, [map, origin, destination]);

  return null;
}

/**
 * LiveMap — Google Maps powered truck tracking.
 */
export default function LiveMap({ origin, destination, isActive, tollGates }) {
  const [progress, setProgress] = useState(0.15);

  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => {
      setProgress(p => p >= 0.92 ? 0.15 : p + 0.008 + Math.random() * 0.005);
    }, 200);
    return () => clearInterval(id);
  }, [isActive]);

  const from = cityCoords[origin];
  const to = cityCoords[destination];
  if (!from || !to) return null;

  const truckPos = isActive ? interpolatePosition(origin, destination, progress) : null;
  const distanceKm = getDistance(origin, destination) || 0;
  const remainingKm = Math.round(distanceKm * (1 - progress));
  const pct = Math.round(progress * 100);

  // Center the map between origin and destination
  const center = useMemo(() => ({
    lat: (from.lat + to.lat) / 2,
    lng: (from.lng + to.lng) / 2,
  }), [from, to]);

  // Auto zoom based on distance
  const zoom = useMemo(() => {
    const latDiff = Math.abs(from.lat - to.lat);
    const lngDiff = Math.abs(from.lng - to.lng);
    const maxDiff = Math.max(latDiff, lngDiff);
    if (maxDiff > 6) return 6;
    if (maxDiff > 4) return 7;
    if (maxDiff > 2) return 8;
    if (maxDiff > 1) return 9;
    return 10;
  }, [from, to]);

  if (!API_KEY) {
    return <FallbackMap origin={origin} destination={destination} isActive={isActive} progress={progress} distanceKm={distanceKm} remainingKm={remainingKm} pct={pct} />;
  }

  return (
    <div style={{ background: C.white, border: `1px solid ${C.line}`, overflow: 'hidden', marginBottom: 16 }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isActive && <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, animation: 'pulse 2s infinite' }} />}
          <span style={{ fontFamily: FONT.heading, fontSize: 13, fontWeight: 700, color: isActive ? C.green : C.dust, textTransform: 'uppercase', letterSpacing: '.08em' }}>
            {isActive ? 'Live Tracking' : 'Route'}
          </span>
        </div>
        {distanceKm > 0 && (
          <span style={{ fontFamily: FONT.body, fontSize: 14, color: C.ink, fontWeight: 600 }}>
            {isActive ? `~${remainingKm} km remaining` : `${distanceKm} km`}
          </span>
        )}
      </div>

      {/* Google Map */}
      <APIProvider apiKey={API_KEY}>
        <div style={{ height: 280 }}>
          <Map
            defaultCenter={center}
            defaultZoom={zoom}
            mapId="zamaload-map"
            disableDefaultUI={true}
            gestureHandling="cooperative"
            style={{ width: '100%', height: '100%' }}
          >
            <RoutePolyline origin={origin} destination={destination} />

            {/* Origin marker — green */}
            <Marker
              position={{ lat: from.lat, lng: from.lng }}
              title={origin}
              label={{ text: 'A', color: '#fff', fontWeight: 'bold', fontSize: '12px' }}
            />

            {/* Destination marker — red */}
            <Marker
              position={{ lat: to.lat, lng: to.lng }}
              title={destination}
              label={{ text: 'B', color: '#fff', fontWeight: 'bold', fontSize: '12px' }}
            />

            {/* Truck position — animated */}
            {isActive && truckPos && (
              <Marker
                position={{ lat: truckPos.lat, lng: truckPos.lng }}
                title={`Truck — ${pct}% complete`}
                icon={{
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                      <circle cx="16" cy="16" r="14" fill="#e8a020" stroke="#fff" stroke-width="3"/>
                      <text x="16" y="21" text-anchor="middle" font-size="14" font-weight="bold" fill="#fff" font-family="sans-serif">🚛</text>
                    </svg>
                  `),
                  scaledSize: { width: 36, height: 36 },
                  anchor: { x: 18, y: 18 },
                }}
              />
            )}

            {/* Toll gate markers */}
            {(tollGates || []).map((toll, i) => (
              <Marker
                key={i}
                position={{ lat: toll.lat, lng: toll.lng }}
                title={`${toll.name} — K${toll.fee}`}
                icon={{
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                      <circle cx="10" cy="10" r="8" fill="#b07810" stroke="#fff" stroke-width="2"/>
                      <text x="10" y="14" text-anchor="middle" font-size="10" font-weight="bold" fill="#fff" font-family="sans-serif">T</text>
                    </svg>
                  `),
                  scaledSize: { width: 22, height: 22 },
                  anchor: { x: 11, y: 11 },
                }}
              />
            ))}
          </Map>
        </div>
      </APIProvider>

      {/* ETA bar */}
      {isActive && distanceKm > 0 && (
        <div style={{ padding: '10px 14px', background: '#fef3c7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: FONT.body, fontSize: 14, color: C.amberDk }}>
            ETA: ~{Math.max(1, Math.round(remainingKm / 60))} hrs at 60 km/h
          </span>
          <span style={{ fontFamily: FONT.heading, fontSize: 15, fontWeight: 700, color: C.amberDk }}>
            {pct}% complete
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Fallback SVG map when no API key is present.
 */
function FallbackMap({ origin, destination, isActive, progress, distanceKm, remainingKm, pct }) {
  const from = cityCoords[origin];
  const to = cityCoords[destination];
  if (!from || !to) return null;

  const margin = 0.5;
  const bounds = {
    minLat: Math.min(from.lat, to.lat) - margin, maxLat: Math.max(from.lat, to.lat) + margin,
    minLng: Math.min(from.lng, to.lng) - margin, maxLng: Math.max(from.lng, to.lng) + margin,
  };
  const latRange = bounds.maxLat - bounds.minLat;
  const lngRange = bounds.maxLng - bounds.minLng;
  if (lngRange < latRange) { bounds.minLng -= (latRange - lngRange) / 2; bounds.maxLng += (latRange - lngRange) / 2; }
  if (latRange < lngRange) { bounds.minLat -= (lngRange - latRange) / 2; bounds.maxLat += (lngRange - latRange) / 2; }

  const W = 380, H = 240, PAD = 30;
  const proj = (lat, lng) => ({
    x: PAD + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * (W - 2 * PAD),
    y: PAD + ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * (H - 2 * PAD),
  });
  const o = proj(from.lat, from.lng);
  const d = proj(to.lat, to.lng);
  const truckPos = interpolatePosition(origin, destination, progress);
  const t = truckPos ? proj(truckPos.lat, truckPos.lng) : o;

  return (
    <div style={{ background: C.white, border: `1px solid ${C.line}`, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isActive && <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, animation: 'pulse 2s infinite' }} />}
          <span style={{ fontFamily: FONT.heading, fontSize: 13, fontWeight: 700, color: isActive ? C.green : C.dust, textTransform: 'uppercase', letterSpacing: '.08em' }}>
            {isActive ? 'Live Tracking' : 'Route'}
          </span>
        </div>
        {distanceKm > 0 && (
          <span style={{ fontFamily: FONT.body, fontSize: 14, color: C.ink, fontWeight: 600 }}>
            {isActive ? `~${remainingKm} km remaining` : `${distanceKm} km`}
          </span>
        )}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block', background: '#f8f6f2' }}>
        <line x1={o.x} y1={o.y} x2={d.x} y2={d.y} stroke={C.line} strokeWidth="2" strokeDasharray="6 4" />
        {isActive && <line x1={o.x} y1={o.y} x2={t.x} y2={t.y} stroke={C.amber} strokeWidth="3" strokeLinecap="round" />}
        <circle cx={o.x} cy={o.y} r="6" fill={C.green} stroke={C.white} strokeWidth="2" />
        <text x={o.x} y={o.y - 12} textAnchor="middle" style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, fill: C.ink }}>{origin}</text>
        <circle cx={d.x} cy={d.y} r="6" fill={C.red} stroke={C.white} strokeWidth="2" />
        <text x={d.x} y={d.y + 18} textAnchor="middle" style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, fill: C.ink }}>{destination}</text>
        {isActive && <>
          <circle cx={t.x} cy={t.y} r="14" fill={C.amber} opacity="0.15" />
          <circle cx={t.x} cy={t.y} r="5" fill={C.amber} stroke={C.white} strokeWidth="2" />
          <text x={t.x + 12} y={t.y - 10} style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 700, fill: C.amberDk }}>{pct}%</text>
        </>}
      </svg>
      {isActive && distanceKm > 0 && (
        <div style={{ padding: '10px 14px', background: '#fef3c7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: FONT.body, fontSize: 14, color: C.amberDk }}>ETA: ~{Math.max(1, Math.round(remainingKm / 60))} hrs</span>
          <span style={{ fontFamily: FONT.heading, fontSize: 15, fontWeight: 700, color: C.amberDk }}>{pct}%</span>
        </div>
      )}
    </div>
  );
}
