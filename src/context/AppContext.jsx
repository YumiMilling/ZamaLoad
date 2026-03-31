import { createContext, useContext, useReducer } from 'react';
import { initialLoads } from '../data/mockLoads';
import { initialBookings } from '../data/mockBookings';
import { users } from '../data/mockUsers';
import { INSURANCE_RATE } from '../theme';

const Ctx = createContext();

const initial = {
  role: null,
  userId: null,
  view: 'roleSelect',
  viewParams: {},
  loads: [...initialLoads],
  bookings: [...initialBookings],
  claims: [], // { id, bookingId, loadId, shipperId, reason, status: pending|approved|rejected, filedAt, resolvedAt, payoutAmount }
  users,
};

let idCounter = 100;

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
      if (!load || load.status !== 'posted') return state;
      const bid = 'B' + (++idCounter);
      const cargoValue = load.capacityTonnes * load.ratePerTonne;
      const insured = !!action.insured;
      const premium = insured ? Math.round(cargoValue * INSURANCE_RATE) : 0;
      const booking = {
        id: bid, loadId: action.loadId, shipperId: state.userId, ownerId: load.ownerId,
        status: 'booked', bookedAt: new Date().toISOString().slice(0, 10),
        escrowAmount: cargoValue,
        insured,
        insurancePremium: premium,
        totalPaid: cargoValue + premium,
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
      const next = { booked: 'in-transit', 'in-transit': 'delivered', delivered: 'paid' };
      const newStatus = next[load.status];
      if (!newStatus) return state;
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

    case 'FILE_CLAIM': {
      const booking = state.bookings.find(b => b.id === action.bookingId);
      if (!booking || !booking.insured) return state;
      // Can only file on delivered or paid loads
      const load = state.loads.find(l => l.id === booking.loadId);
      if (!load || (load.status !== 'delivered' && load.status !== 'paid')) return state;
      // Prevent duplicate claims
      if (state.claims.some(c => c.bookingId === action.bookingId)) return state;
      const claim = {
        id: 'CL' + (++idCounter),
        bookingId: booking.id,
        loadId: booking.loadId,
        shipperId: booking.shipperId,
        reason: action.reason || 'Cargo damage during transit',
        status: 'pending',
        filedAt: new Date().toISOString().slice(0, 10),
        resolvedAt: null,
        payoutAmount: booking.escrowAmount, // full cargo value
      };
      return { ...state, claims: [claim, ...state.claims], view: 'myBookings' };
    }

    case 'RESOLVE_CLAIM': {
      const approved = action.approved;
      return {
        ...state,
        claims: state.claims.map(c => c.id === action.claimId ? {
          ...c,
          status: approved ? 'approved' : 'rejected',
          resolvedAt: new Date().toISOString().slice(0, 10),
        } : c),
      };
    }

    case 'SWITCH_ROLE':
      return { ...initial, loads: state.loads, bookings: state.bookings, claims: state.claims };

    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useApp() { return useContext(Ctx); }
