import { C, FONT } from '../../theme';
import TrustBadge from './TrustBadge';

export default function DriverCard({ driver, compact }) {
  if (!driver) return null;

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: FONT.body, fontSize: 14 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', background: C.line,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FONT.heading, fontWeight: 700, fontSize: 13, color: C.dust,
        }}>
          {driver.name.charAt(0)}
        </div>
        <span style={{ fontWeight: 600, color: C.ink }}>{driver.name}</span>
        <TrustBadge score={driver.trustScore} tier={driver.tier} />
      </div>
    );
  }

  return (
    <div style={{ background: C.white, border: `1px solid ${C.line}`, padding: 16, marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', background: C.line,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: FONT.heading, fontWeight: 700, fontSize: 17, color: C.dust,
        }}>
          {driver.name.charAt(0)}
        </div>
        <div>
          <div style={{ fontFamily: FONT.body, fontSize: 16, fontWeight: 600, color: C.ink }}>{driver.name}</div>
          <div style={{ fontFamily: FONT.body, fontSize: 13, color: C.dust }}>{driver.phone}</div>
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <TrustBadge score={driver.trustScore} tier={driver.tier} />
      </div>
      <div style={{ display: 'flex', gap: 20, fontFamily: FONT.body, fontSize: 13, color: C.dust }}>
        <span><strong style={{ color: C.ink }}>{driver.completedTrips}</strong> trips</span>
        <span>Licence: <strong style={{ color: C.ink }}>{driver.licenceNo}</strong></span>
      </div>
    </div>
  );
}
