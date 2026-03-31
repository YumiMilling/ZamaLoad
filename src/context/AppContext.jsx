import { createContext, useContext, useReducer } from 'react';
import { initialLoads } from '../data/mockLoads';
import { initialBookings } from '../data/mockBookings';
import { users } from '../data/mockUsers';

const Ctx = createContext();

const initial = {
  role: null,         // 'owner' | 'shipper'
  userId: null,
  view: 'roleSelect', // current screen
  viewParams: {},
  loads: [...initialLoads],
  bookings: [...initialBookings],
  users,
};

let idCounter = 100; // safe counter that never collides with mock data

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, role: action.role, userId: action.userId, view: action.role === 'owner' ? 'ownerDash' : 'browse' };

    case 'NAV':
      return { ...state, view: action.view, viewParams: action.params || {} };

    case 'ADD_LOAD': {
      const id = 'L' + (++idCounter);
      const cap = Number(action.load.capacityTonnes) || 0;
      const rate = Number(action.load.ratePerTonne) || 0;
      if (cap <= 0 || rate <= 0) return state;
      const load = { ...action.load, id, capacityTonnes: cap, ratePerTonne: rate, ownerId: state.userId, status: 'posted', bookingId: null };
      return { ...state, loads: [load, ...state.loads], view: 'ownerDash' };
    }

    case 'BOOK_LOAD': {
      const load = state.loads.find(l => l.id === action.loadId);
      if (!load || load.status !== 'posted') return state; // guard: only book posted loads
      const bid = 'B' + (++idCounter);
      const booking = {
        id: bid, loadId: action.loadId, shipperId: state.userId, ownerId: load.ownerId,
        status: 'booked', bookedAt: new Date().toISOString().slice(0, 10),
        escrowAmount: load.capacityTonnes * load.ratePerTonne,
        deliveryConfirmed: false, paidAt: null,
      };
      return {
        ...state,
        bookings: [booking, ...state.bookings],
        loads: state.loads.map(l => l.id === action.loadId ? { ...l, status: 'booked', bookingId: bid } : l),
        view: 'myBookings',
      };
    }

    case 'ADVANCE_STATUS': {
      const load = state.loads.find(l => l.id === action.loadId);
      if (!load) return state;
      // Only allow: booked->in-transit, in-transit->delivered, delivered->paid
      const next = { booked: 'in-transit', 'in-transit': 'delivered', delivered: 'paid' };
      const newStatus = next[load.status];
      if (!newStatus) return state;
      // delivered->paid requires a booking to exist
      if (load.status === 'delivered' && !load.bookingId) return state;
      return {
        ...state,
        loads: state.loads.map(l => l.id === action.loadId ? { ...l, status: newStatus } : l),
        bookings: state.bookings.map(b => b.loadId === action.loadId ? {
          ...b, status: newStatus,
          deliveryConfirmed: newStatus === 'paid' ? true : b.deliveryConfirmed,
          paidAt: newStatus === 'paid' ? new Date().toISOString().slice(0, 10) : b.paidAt,
        } : b),
      };
    }

    case 'SWITCH_ROLE':
      // Preserve loads/bookings across role switches
      return { ...initial, loads: state.loads, bookings: state.bookings };

    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useApp() { return useContext(Ctx); }
