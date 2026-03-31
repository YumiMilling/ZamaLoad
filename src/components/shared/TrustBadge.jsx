// src/components/shared/TrustBadge.jsx
import React from 'react';
import { TRUST_TIERS, FONT } from '../../theme';

export default function TrustBadge({ score, tier }) {
  const t = TRUST_TIERS[tier] || TRUST_TIERS.probation;
  return (
    <span
      className="trust-badge"
      style={{ background: t.bg, color: t.color, fontFamily: FONT.body, fontSize: 13 }}
    >
      <span
        style={{
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: t.color,
          marginRight: 6,
        }}
      />
      {score.toFixed(2)} &middot; {t.label}
    </span>
  );
}
