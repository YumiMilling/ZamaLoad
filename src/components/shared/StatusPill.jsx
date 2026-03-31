// src/components/shared/StatusPill.jsx
import React from 'react';
import { STATUS } from '../../theme';

export default function StatusPill({ status }) {
  const s = STATUS[status] || STATUS.posted;
  return (
    <span
      className="status-pill"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}
