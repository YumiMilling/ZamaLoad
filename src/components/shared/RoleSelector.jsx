// src/components/shared/RoleSelector.jsx
import React from 'react';
import { C, FONT } from '../../theme';
import { useApp } from '../../context/AppContext';

export default function RoleSelector({ onStartDemo }) {
  const { dispatch } = useApp();

  return (
    <div
      className="animate-in"
      style={{
        minHeight: '100vh',
        background: C.paper,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontFamily: FONT.heading,
          fontWeight: 900,
          fontSize: 36,
          color: C.asphalt,
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
          marginBottom: 4,
        }}
      >
        Zama<span style={{ color: C.amber }}>Load</span>
      </div>

      {/* Tagline */}
      <div
        style={{
          fontFamily: FONT.body,
          fontSize: 14,
          color: C.dust,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontWeight: 500,
          marginBottom: 48,
        }}
      >
        Every Load. Connected.
      </div>

      {/* Truck Owner button */}
      <button
        onClick={() => dispatch({ type: 'SET_ROLE', role: 'owner', userId: 'O1' })}
        style={{
          width: '100%',
          maxWidth: 340,
          padding: '32px 24px',
          marginBottom: 16,
          background: C.amber,
          color: C.asphalt,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          transition: 'opacity .15s',
        }}
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="4" y="16" width="28" height="16" rx="2" fill={C.asphalt} />
          <rect x="32" y="20" width="12" height="12" rx="2" fill={C.asphalt} />
          <path d="M38 20l6 6v6h-6V20z" fill={C.asphalt} opacity="0.7" />
          <circle cx="14" cy="34" r="4" fill={C.asphalt} stroke={C.amber} strokeWidth="2" />
          <circle cx="38" cy="34" r="4" fill={C.asphalt} stroke={C.amber} strokeWidth="2" />
        </svg>
        <div style={{ textAlign: 'left' }}>
          <div
            style={{
              fontFamily: FONT.heading,
              fontWeight: 700,
              fontSize: 22,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            I'm a Truck Owner
          </div>
          <div
            style={{
              fontFamily: FONT.body,
              fontSize: 13,
              opacity: 0.75,
              marginTop: 2,
            }}
          >
            Post loads and manage trips
          </div>
        </div>
      </button>

      {/* Shipper button */}
      <button
        onClick={() => dispatch({ type: 'SET_ROLE', role: 'shipper', userId: 'S1' })}
        style={{
          width: '100%',
          maxWidth: 340,
          padding: '32px 24px',
          background: C.green,
          color: C.white,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          transition: 'opacity .15s',
        }}
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="8" y="10" width="32" height="28" rx="3" stroke={C.white} strokeWidth="2.5" fill="none" />
          <line x1="8" y1="18" x2="40" y2="18" stroke={C.white} strokeWidth="2" />
          <line x1="24" y1="18" x2="24" y2="38" stroke={C.white} strokeWidth="2" />
        </svg>
        <div style={{ textAlign: 'left' }}>
          <div
            style={{
              fontFamily: FONT.heading,
              fontWeight: 700,
              fontSize: 22,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            I'm a Shipper
          </div>
          <div
            style={{
              fontFamily: FONT.body,
              fontSize: 13,
              opacity: 0.8,
              marginTop: 2,
            }}
          >
            Book trucks for your cargo
          </div>
        </div>
      </button>

      {/* Demo walkthrough */}
      {onStartDemo && (
        <>
          <div style={{ width: '100%', maxWidth: 340, margin: '32px 0 0', borderTop: `1px solid ${C.line}`, paddingTop: 24, textAlign: 'center' }}>
            <div style={{ fontFamily: FONT.body, fontSize: 13, color: C.dust, marginBottom: 12 }}>
              First time? See how it works.
            </div>
            <button
              onClick={onStartDemo}
              style={{
                width: '100%', padding: '14px 24px',
                background: C.asphalt, color: C.amber, border: `2px solid ${C.amber}`,
                cursor: 'pointer', fontFamily: FONT.heading, fontSize: 16, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '.06em',
              }}
            >
              Watch the Demo
            </button>
          </div>
        </>
      )}
    </div>
  );
}
