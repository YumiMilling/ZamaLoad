// src/components/shipper/ConfirmDelivery.jsx
import React, { useState } from 'react';
import { C, FONT, CLAIM_STATUS } from '../../theme';
import { useApp } from '../../context/AppContext';
import { getUser } from '../../data/mockUsers';

export default function ConfirmDelivery() {
  const { state, dispatch } = useApp();
  const [confirmed, setConfirmed] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimReason, setClaimReason] = useState('');
  const [claimFiled, setClaimFiled] = useState(false);

  const loadId = state.viewParams.loadId;
  const load = state.loads.find(l => l.id === loadId);
  const booking = state.bookings.find(b => b.loadId === loadId);

  if (!load || !booking) {
    return (
      <div className="animate-in" style={{ fontFamily: FONT.body, color: C.dust, padding: 20 }}>
        Booking not found.
      </div>
    );
  }

  const owner = getUser(load.ownerId);
  const amount = booking.escrowAmount;

  // Already paid — show success directly
  const alreadyPaid = load.status === 'paid';

  const handleConfirm = () => {
    if (load.status !== 'delivered') return; // guard: only confirm delivered loads
    dispatch({ type: 'CONFIRM_DELIVERY', loadId: load.id });
    setConfirmed(true);
  };

  if (confirmed || alreadyPaid) {
    return (
      <div
        className="animate-in"
        style={{
          textAlign: 'center',
          padding: '48px 0',
        }}
      >
        {/* Checkmark */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: C.green,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path
              d="M10 20l8 8 12-16"
              stroke={C.white}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div
          style={{
            fontFamily: FONT.heading,
            fontSize: 26,
            fontWeight: 700,
            color: C.green,
            marginBottom: 8,
          }}
        >
          Payment Released!
        </div>

        <div
          style={{
            fontFamily: FONT.body,
            fontSize: 14,
            color: C.dust,
            marginBottom: 8,
          }}
        >
          K{amount.toLocaleString()} has been released to {owner ? owner.name : 'the owner'}.
        </div>

        <div
          style={{
            fontFamily: FONT.heading,
            fontSize: 18,
            fontWeight: 700,
            color: C.ink,
            marginBottom: 32,
          }}
        >
          {load.origin} &rarr; {load.destination}
        </div>

        <button
          className="btn btn--secondary"
          onClick={() => dispatch({ type: 'NAV', view: 'myBookings' })}
        >
          Back to My Bookings
        </button>
      </div>
    );
  }

  // Guard: only show confirm form for delivered loads
  if (load.status !== 'delivered') {
    return (
      <div className="animate-in" style={{ textAlign: 'center', padding: '48px 0' }}>
        <div style={{ fontFamily: FONT.body, fontSize: 16, color: C.dust, marginBottom: 20 }}>
          This load is not ready for delivery confirmation yet.
        </div>
        <button className="btn btn--secondary" onClick={() => dispatch({ type: 'NAV', view: 'myBookings' })}>
          Back to My Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in">
      {/* Route */}
      <div
        style={{
          fontFamily: FONT.heading,
          fontWeight: 700,
          fontSize: 26,
          color: C.ink,
          marginBottom: 4,
          lineHeight: 1.2,
        }}
      >
        {load.origin} &rarr; {load.destination}
      </div>

      <div
        style={{
          fontFamily: FONT.body,
          fontSize: 13,
          color: C.dust,
          marginBottom: 28,
        }}
      >
        Delivery Confirmation
      </div>

      {/* Escrow amount */}
      <div
        style={{
          background: C.white,
          padding: 28,
          textAlign: 'center',
          marginBottom: 24,
          border: `2px solid ${C.green}`,
        }}
      >
        <div className="sec-label" style={{ marginBottom: 8 }}>Escrow Amount</div>
        <div
          style={{
            fontFamily: FONT.heading,
            fontSize: 40,
            fontWeight: 900,
            color: C.green,
            lineHeight: 1,
          }}
        >
          K{amount.toLocaleString()}
        </div>
      </div>

      {/* Confirmation message */}
      <div
        style={{
          fontFamily: FONT.body,
          fontSize: 14,
          color: C.ink,
          lineHeight: 1.6,
          marginBottom: 28,
          padding: '0 4px',
        }}
      >
        By confirming, payment of{' '}
        <strong>K{amount.toLocaleString()}</strong>{' '}
        will be released to{' '}
        <strong>{owner ? owner.name : 'the owner'}</strong>.
      </div>

      {/* Insurance info */}
      {booking.insured && (
        <div style={{
          background: '#e3f2fd', padding: 14, marginBottom: 20,
          fontFamily: FONT.body, fontSize: 14, color: '#1565c0',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01z"/></svg>
          <span>This cargo is <strong>insured</strong>. You can report damage before confirming.</span>
        </div>
      )}

      {/* Confirm button */}
      <button
        className="btn btn--success"
        onClick={handleConfirm}
        style={{ marginBottom: 12 }}
      >
        Confirm Delivery &amp; Release Payment
      </button>

      {/* Report Damage — only for insured loads */}
      {booking.insured && !claimFiled && !showClaimForm && (
        <button
          className="btn btn--secondary"
          onClick={() => setShowClaimForm(true)}
          style={{ marginBottom: 12, borderColor: C.red, color: C.red }}
        >
          Report Cargo Damage
        </button>
      )}

      {/* Claim form */}
      {showClaimForm && !claimFiled && (
        <div style={{ background: C.redLt, padding: 20, marginBottom: 12 }}>
          <div style={{ fontFamily: FONT.heading, fontSize: 16, fontWeight: 700, color: C.red, marginBottom: 10 }}>
            Report Damage
          </div>
          <div className="field">
            <label style={{ color: C.dust }}>Describe the damage</label>
            <textarea
              value={claimReason}
              onChange={(e) => setClaimReason(e.target.value)}
              placeholder="e.g. 3 bags of cement burst during transit, water damage to 2 pallets..."
              rows={3}
              style={{
                width: '100%', padding: '12px 14px', fontFamily: FONT.body, fontSize: 15,
                background: C.white, border: `1px solid ${C.line}`, color: C.ink,
                resize: 'vertical', outline: 'none',
              }}
            />
          </div>
          <div style={{ fontFamily: FONT.body, fontSize: 13, color: C.dust, marginBottom: 12 }}>
            A claim will be filed for the full cargo value of <strong style={{ color: C.ink }}>K{amount.toLocaleString()}</strong>. The claim will be reviewed before payout.
          </div>
          <button
            className="btn btn--danger"
            disabled={!claimReason.trim()}
            style={{ marginBottom: 8, opacity: claimReason.trim() ? 1 : 0.4 }}
            onClick={() => {
              dispatch({ type: 'FILE_CLAIM', bookingId: booking.id, reason: claimReason.trim() });
              setClaimFiled(true);
              setShowClaimForm(false);
            }}
          >
            File Insurance Claim
          </button>
          <button className="btn btn--secondary" onClick={() => setShowClaimForm(false)}>
            Cancel
          </button>
        </div>
      )}

      {/* Claim filed confirmation */}
      {claimFiled && (
        <div style={{ background: '#fef3c7', padding: 16, marginBottom: 12, textAlign: 'center' }}>
          <div style={{ fontFamily: FONT.heading, fontSize: 16, fontWeight: 700, color: '#b07810', marginBottom: 4 }}>
            Claim Filed
          </div>
          <div style={{ fontFamily: FONT.body, fontSize: 13, color: C.dust }}>
            Your damage claim is under review. You will be notified of the outcome.
          </div>
        </div>
      )}

      <button
        className="btn btn--secondary"
        onClick={() => dispatch({ type: 'NAV', view: 'myBookings' })}
      >
        Back to My Bookings
      </button>
    </div>
  );
}
