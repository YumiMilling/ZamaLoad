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
  loads: initialLoads,
  bookings: initialBookings,
  users,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, role: action.role, userId: action.userId, view: action.role === 'owner' ? 'ownerDash' : 'browse' };

    case 'NAV':
      return { ...state, view: action.view, viewParams: action.params || {} };

    case 'ADD_LOAD': {
      const id = 'L' + String(state.loads.length + 1).padStart(2, '0');
      const load = { ...action.load, id, ownerId: state.userId, status: 'posted', bookingId: null };
      return { ...state, loads: [load, ...state.loads], view: 'ownerDash' };
    }

    case 'BOOK_LOAD': {
      const bid = 'B' + String(state.bookings.length + 1).padStart(2, '0');
      const load = state.loads.find(l => l.id === action.loadId);
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
      const next = { posted: 'booked', booked: 'in-transit', 'in-transit': 'delivered', delivered: 'paid' };
      const load = state.loads.find(l => l.id === action.loadId);
      const newStatus = next[load.status];
      if (!newStatus) return state;
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
      return { ...initial };

    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useApp() { return useContext(Ctx); }
