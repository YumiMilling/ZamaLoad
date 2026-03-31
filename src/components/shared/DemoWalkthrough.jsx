import { useState, useEffect, useCallback } from 'react';
import { C, FONT } from '../../theme';
import { useApp } from '../../context/AppContext';

/**
 * Auto-pilot demo walkthrough.
 * Each step: narration text + an action that manipulates the app state.
 * Viewer taps "Next" to advance through the full flow.
 */

const STEPS = [
  {
    title: 'Welcome to ZamaLoad',
    text: 'A freight marketplace for Zambia. Let\'s walk through a complete load — from finding a truck to payment release.',
    action: null, // no state change
  },
  {
    title: 'Meet the Shipper',
    text: 'Chilufya Trading in Lusaka needs 12 tonnes of cement bags moved to Choma. Let\'s find a truck.',
    action: (dispatch) => {
      dispatch({ type: 'SET_ROLE', role: 'shipper', userId: 'S1' });
    },
  },
  {
    title: 'Searching for trucks',
    text: 'The shipper enters the route (Lusaka → Choma), date, weight (12T), and cargo type (Construction). The system instantly matches available trucks.',
    action: (dispatch) => {
      dispatch({ type: 'NAV', view: 'findTruck' });
    },
  },
  {
    title: 'Truck found!',
    text: 'A 15T Flatbed is available on this route — owned by Joseph Mwale (trust score: Gold, 0.78). Let\'s view the details.',
    action: (dispatch) => {
      dispatch({ type: 'NAV', view: 'loadDetail', params: { loadId: 'L01' } });
    },
  },
  {
    title: 'Truck & driver details',
    text: 'The shipper sees the truck (ABB 1234, Isuzu FTR, valid licence), driver (Emmanuel Sakala, 31 completed trips), and the full capacity bar. They can book partial or full capacity.',
    action: null,
  },
  {
    title: 'Booking with insurance',
    text: 'The shipper books 12T of construction materials with cargo insurance (2.5% premium = K135). Total: K5,535 into escrow. The driver can\'t touch this money until delivery is confirmed.',
    action: (dispatch) => {
      dispatch({ type: 'BOOK_LOAD', loadId: 'L01', tonnes: 12, cargoCategory: 'construction', cargoDesc: 'Cement 50kg bags', insured: true });
    },
  },
  {
    title: 'Booking confirmed',
    text: 'The load is booked. Payment is held in escrow — secure for both parties. Let\'s switch to the truck owner\'s view.',
    action: (dispatch) => {
      dispatch({ type: 'NAV', view: 'myBookings' });
    },
  },
  {
    title: 'Owner\'s dashboard',
    text: 'Now we\'re Joseph Mwale, the truck owner in Lusaka. He sees the new booking on his dashboard — 12T of cement to Choma.',
    action: (dispatch) => {
      dispatch({ type: 'SET_ROLE', role: 'owner', userId: 'O1' });
    },
  },
  {
    title: 'Trip details',
    text: 'Joseph sees the full trip: cargo manifest (12T cement, insured), cost breakdown (289km, K2,312 fuel, K50 tolls, K250 driver = K2,612 cost), and K2,788 profit. Good trip.',
    action: (dispatch) => {
      dispatch({ type: 'NAV', view: 'tripDetail', params: { loadId: 'L01' } });
    },
  },
  {
    title: 'Starting the trip',
    text: 'Joseph\'s driver Emmanuel loads the cement and starts driving. The truck is now tracked via GPS.',
    action: (dispatch) => {
      dispatch({ type: 'ADVANCE_STATUS', loadId: 'L01' });
    },
  },
  {
    title: 'Live tracking active',
    text: 'The map shows the truck moving along the Lusaka-Choma route in real time. The shipper can see this too. Emmanuel posts a status update...',
    action: (dispatch) => {
      dispatch({ type: 'POST_TRIP_UPDATE', loadId: 'L01', message: 'Loaded and departed Lusaka. All good.', updateType: 'status' });
    },
  },
  {
    title: 'Driver posts an update',
    text: '"Loaded and departed Lusaka. All good." — Both the owner and shipper see this update instantly. The trust layer records the GPS location and timestamp.',
    action: (dispatch) => {
      dispatch({ type: 'POST_TRIP_UPDATE', loadId: 'L01', message: 'Passed Kafue — on schedule.', updateType: 'status' });
    },
  },
  {
    title: 'Shipper tracks the load',
    text: 'Let\'s switch back to the shipper. Chilufya Trading can see the live map, ETA, and all driver updates from their phone.',
    action: (dispatch) => {
      dispatch({ type: 'SET_ROLE', role: 'shipper', userId: 'S1' });
      // Navigate to loadDetail to show the live map
      setTimeout(() => dispatch({ type: 'NAV', view: 'loadDetail', params: { loadId: 'L01' } }), 50);
    },
  },
  {
    title: 'Live tracking — shipper view',
    text: 'The shipper sees the truck moving on the map in real time, ETA to Choma, and the driver\'s updates: "Passed Kafue — on schedule." This is trust in action.',
    action: null, // stay on loadDetail so they can see the map
  },
  {
    title: 'Delivery confirmation',
    text: 'The truck arrives in Choma. The shipper — not the driver — confirms delivery. This is the trust attestation that triggers payment.',
    action: (dispatch) => {
      dispatch({ type: 'NAV', view: 'confirmDelivery', params: { loadId: 'L01' } });
    },
  },
  {
    title: 'Payment released!',
    text: 'The shipper confirms. K5,400 is released to Joseph Mwale instantly via mobile money. The insurance premium goes to the pool. Both parties\' trust scores increase.',
    action: (dispatch) => {
      dispatch({ type: 'CONFIRM_DELIVERY', loadId: 'L01' });
    },
  },
  {
    title: 'Trust earned',
    text: 'Every completed delivery builds trust. Joseph now has 35 trips. Emmanuel\'s driver score goes up. Chilufya Trading\'s shipper score goes up. The truck\'s record improves. Everyone wins.',
    action: null,
  },
  {
    title: 'That\'s ZamaLoad',
    text: 'A freight marketplace where every load is tracked, every delivery is attested, and every payment is secure. Built on the Thiqa trust infrastructure. No empty trucks. No chasing payments. Every load counts.',
    action: null,
  },
];

export default function DemoWalkthrough({ onExit }) {
  const { dispatch } = useApp();
  const [step, setStep] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  const advance = useCallback(() => {
    if (isLast) { onExit(); return; }
    setTransitioning(true);
    setTimeout(() => {
      const nextStep = step + 1;
      const nextAction = STEPS[nextStep].action;
      if (nextAction) nextAction(dispatch);
      setStep(nextStep);
      setTransitioning(false);
    }, 300);
  }, [step, isLast, dispatch, onExit]);

  const goBack = useCallback(() => {
    if (isFirst) return;
    setStep(s => s - 1);
  }, [isFirst]);

  // Run action for step 0 on mount (no action needed)
  useEffect(() => {
    if (step === 0 && STEPS[0].action) STEPS[0].action(dispatch);
  }, []);

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 480, zIndex: 200,
      background: C.asphalt, borderTop: `3px solid ${C.amber}`,
      padding: '0', boxShadow: '0 -8px 30px rgba(0,0,0,.4)',
    }}>
      {/* Progress bar */}
      <div style={{ height: 3, background: '#333' }}>
        <div style={{
          height: '100%', background: C.amber, transition: 'width .5s ease',
          width: `${((step + 1) / STEPS.length) * 100}%`,
        }} />
      </div>

      <div style={{ padding: '16px 20px 14px' }}>
        {/* Step counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontFamily: FONT.heading, fontSize: 11, fontWeight: 700, color: C.amber, textTransform: 'uppercase', letterSpacing: '.1em' }}>
            Demo — Step {step + 1} of {STEPS.length}
          </span>
          <button onClick={onExit} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: FONT.body, fontSize: 12, color: '#8a8070',
          }}>
            Exit Demo
          </button>
        </div>

        {/* Title */}
        <div style={{
          fontFamily: FONT.heading, fontSize: 18, fontWeight: 700, color: '#fff',
          marginBottom: 6, opacity: transitioning ? 0 : 1, transition: 'opacity .2s',
        }}>
          {current.title}
        </div>

        {/* Narration */}
        <div style={{
          fontFamily: FONT.body, fontSize: 14, color: '#b0a898', lineHeight: 1.6,
          marginBottom: 14, minHeight: 44,
          opacity: transitioning ? 0 : 1, transition: 'opacity .2s',
        }}>
          {current.text}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 8 }}>
          {!isFirst && (
            <button onClick={goBack} style={{
              flex: 0, padding: '10px 18px', background: '#333', border: 'none',
              fontFamily: FONT.heading, fontSize: 14, fontWeight: 700, color: '#8a8070',
              cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '.06em',
            }}>
              Back
            </button>
          )}
          <button onClick={advance} style={{
            flex: 1, padding: '12px 20px', background: C.amber, border: 'none',
            fontFamily: FONT.heading, fontSize: 15, fontWeight: 700, color: C.asphalt,
            cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '.06em',
          }}>
            {isLast ? 'Finish Demo' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
