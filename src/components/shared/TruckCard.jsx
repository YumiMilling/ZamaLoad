import { C, FONT } from '../../theme';

const STATUS_STYLE = {
  valid:    { label: 'Valid',    color: '#2e7d32', bg: '#e8f5e9' },
  expiring: { label: 'Expiring', color: '#b07810', bg: '#fef3c7' },
  expired:  { label: 'Expired',  color: '#c62828', bg: '#ffebee' },
};

export default function TruckCard({ truck, compact }) {
  if (!truck) return null;
  const s = STATUS_STYLE[truck.status] || STATUS_STYLE.valid;

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: FONT.body, fontSize: 14 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.dust} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 13V7h14l4 4v2H1z"/><circle cx="7" cy="16" r="2"/><circle cx="16" cy="16" r="2"/>
        </svg>
        <span style={{ fontWeight: 600, color: C.ink }}>{truck.plate}</span>
        <span style={{ color: C.dust }}>{truck.make}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, padding: '1px 8px', borderRadius: 100 }}>{s.label}</span>
      </div>
    );
  }

  return (
    <div style={{ background: C.white, border: `1px solid ${C.line}`, padding: 16, marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontFamily: FONT.heading, fontSize: 18, fontWeight: 700, color: C.ink }}>{truck.plate}</div>
        <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, padding: '2px 10px', borderRadius: 100, fontFamily: FONT.heading, letterSpacing: '.04em' }}>
          {s.label}
        </span>
      </div>
      <div style={{ fontFamily: FONT.body, fontSize: 14, color: C.dust, marginBottom: 4 }}>
        {truck.make} ({truck.year}) &middot; {truck.type}
      </div>
      <div style={{ display: 'flex', gap: 20, fontFamily: FONT.body, fontSize: 13, color: C.dust }}>
        <span>Capacity: <strong style={{ color: C.ink }}>{truck.capacityTonnes}T</strong></span>
        <span>Licence: <strong style={{ color: s.color }}>{truck.licenceExpiry}</strong></span>
        <span>Inspected: <strong style={{ color: C.ink }}>{truck.inspectionDate}</strong></span>
      </div>
    </div>
  );
}
