import { createContext, useContext, useReducer } from 'react';
import { initialLoads } from '../data/mockLoads';
import { initialBookings } from '../data/mockBookings';
import { initialRequests } from '../data/mockRequests';
import { initialBids } from '../data/mockBids';
import { users } from '../data/mockUsers';
import { INSURANCE_RATE } from '../theme';
import { isCompatibleWithLoad } from '../data/cargoCategories';

const Ctx = createContext();

const initial = {
  role: null,
  userId: null,
  view: 'roleSelect',
  viewParams: {},
  loads: [...initialLoads],
  bookings: [...initialBookings],
  requests: [...initialRequests],
  bids: [...initialBids],
  claims: [],
  tripUpdates: [], // { id, loadId, authorId, authorRole, message, type: 'status'|'delay'|'location', timestamp }
  users,
};

let idCounter = 100;

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, role: action.role, userId: action.userId, view: action.role === 'owner' ? 'ownerDash' : 'findTruck' };

    case 'NAV':
      return { ...state, view: action.view, viewParams: action.params || {} };

    // ── Owner posts a truck listing (available capacity) ──
    case 'ADD_LOAD': {
      const id = 'L' + (++idCounter);
      const cap = Number(action.load.capacityTonnes) || 0;
      const rate = Number(action.load.ratePerTonne) || 0;
      if (cap <= 0 || rate <= 0) return state;
      const load = { ...action.load, id, capacityTonnes: cap, ratePerTonne: rate, ownerId: action.load.ownerId || state.userId, status: 'posted', bookingIds: [], bookedTonnes: 0 };
      return { ...state, loads: [load, ...state.loads], view: 'ownerDash' };
    }

    // ── Shipper posts a freight request ──
    case 'ADD_REQUEST': {
      const id = 'R' + (++idCounter);
      const tonnes = Number(action.request.tonnes) || 0;
      if (tonnes <= 0) return state;
      const req = {
        ...action.request, id, tonnes,
        shipperId: state.userId,
        status: 'open',
        acceptedBidId: null,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      return { ...state, requests: [req, ...state.requests], view: 'myRequests' };
    }

    // ── Owner places a bid on a freight request ──
    case 'PLACE_BID': {
      const req = state.requests.find(r => r.id === action.requestId);
      if (!req || req.status !== 'open') return state;
      // Prevent duplicate bids from same owner
      if (state.bids.some(b => b.requestId === action.requestId && b.ownerId === state.userId)) return state;
      const bid = {
        id: 'BID' + (++idCounter),
        requestId: action.requestId,
        ownerId: state.userId,
        truckId: action.truckId,
        driverId: action.driverId,
        ratePerTonne: Number(action.ratePerTonne),
        status: 'pending',
        createdAt: new Date().toISOString().slice(0, 10),
      };
      return { ...state, bids: [bid, ...state.bids], view: 'ownerDash' };
    }

    // ── Shipper accepts a bid → creates a booking ──
    case 'ACCEPT_BID': {
      const bid = state.bids.find(b => b.id === action.bidId);
      if (!bid || bid.status !== 'pending') return state;
      const req = state.requests.find(r => r.id === bid.requestId);
      if (!req) return state;

      // Create the load from the accepted bid
      const loadId = 'L' + (++idCounter);
      const cargoValue = req.tonnes * bid.ratePerTonne;
      const insured = !!action.insured;
      const premium = insured ? Math.round(cargoValue * INSURANCE_RATE) : 0;

      const load = {
        id: loadId, ownerId: bid.ownerId, truckId: bid.truckId, driverId: bid.driverId,
        origin: req.origin, destination: req.destination, date: req.date,
        capacityTonnes: req.tonnes, ratePerTonne: bid.ratePerTonne,
        truckType: '', status: 'booked', bookingId: null,
      };

      const bookingId = 'B' + (++idCounter);
      const booking = {
        id: bookingId, loadId, shipperId: req.shipperId, ownerId: bid.ownerId,
        status: 'booked', bookedAt: new Date().toISOString().slice(0, 10),
        escrowAmount: cargoValue, insured, insurancePremium: premium,
        totalPaid: cargoValue + premium,
        deliveryConfirmed: false, paidAt: null,
      };

      load.bookingId = bookingId;

      return {
        ...state,
        loads: [load, ...state.loads],
        bookings: [booking, ...state.bookings],
        requests: state.requests.map(r => r.id === req.id ? { ...r, status: 'matched', acceptedBidId: bid.id } : r),
        bids: state.bids.map(b => {
          if (b.id === bid.id) return { ...b, status: 'accepted' };
          if (b.requestId === req.id) return { ...b, status: 'declined' };
          return b;
        }),
        view: 'myBookings',
      };
    }

    // ── Shipper books partial or full capacity on a truck ──
    case 'BOOK_LOAD': {
      const load = state.loads.find(l => l.id === action.loadId);
      if (!load || (load.status !== 'posted' && load.status !== 'booked')) return state;

      const bookTonnes = Number(action.tonnes) || load.capacityTonnes - (load.bookedTonnes || 0);
      const remaining = load.capacityTonnes - (load.bookedTonnes || 0);
      if (bookTonnes <= 0 || bookTonnes > remaining) return state;

      // Cargo compatibility check
      const existingCategories = state.bookings
        .filter(b => b.loadId === load.id && b.status !== 'cancelled')
        .map(b => b.cargoCategory)
        .filter(Boolean);
      if (action.cargoCategory && !isCompatibleWithLoad(action.cargoCategory, existingCategories)) return state;

      const bid = 'B' + (++idCounter);
      const cargoValue = bookTonnes * load.ratePerTonne;
      const insured = !!action.insured;
      const premium = insured ? Math.round(cargoValue * INSURANCE_RATE) : 0;

      const booking = {
        id: bid, loadId: action.loadId, shipperId: state.userId, ownerId: load.ownerId,
        tonnes: bookTonnes,
        cargoCategory: action.cargoCategory || 'general',
        cargoDesc: action.cargoDesc || '',
        status: 'booked', bookedAt: new Date().toISOString().slice(0, 10),
        escrowAmount: cargoValue, insured, insurancePremium: premium,
        totalPaid: cargoValue + premium,
        deliveryConfirmed: false, paidAt: null,
      };

      const newBookedTonnes = (load.bookedTonnes || 0) + bookTonnes;
      const isFull = newBookedTonnes >= load.capacityTonnes;

      return {
        ...state,
        bookings: [booking, ...state.bookings],
        loads: state.loads.map(l => l.id === action.loadId ? {
          ...l,
          status: isFull ? 'full' : 'booked',
          bookingIds: [...(l.bookingIds || []), bid],
          bookedTonnes: newBookedTonnes,
        } : l),
        view: 'myBookings',
      };
    }

    // Owner can only: booked/full → in-transit
    // Shipper confirms: in-transit → delivered (via CONFIRM_DELIVERY)
    // Payment: delivered → paid (via CONFIRM_DELIVERY)
    case 'ADVANCE_STATUS': {
      const load = state.loads.find(l => l.id === action.loadId);
      if (!load) return state;
      // Owner can only start the trip
      const ownerNext = { booked: 'in-transit', full: 'in-transit' };
      const newStatus = ownerNext[load.status];
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

    // ── Trip status update (owner/driver posts during transit) ──
    case 'POST_TRIP_UPDATE': {
      const load = state.loads.find(l => l.id === action.loadId);
      if (!load || load.status !== 'in-transit') return state;
      const update = {
        id: 'U' + (++idCounter),
        loadId: action.loadId,
        authorId: state.userId,
        authorRole: state.role,
        message: action.message,
        type: action.updateType || 'status',
        timestamp: new Date().toISOString(),
      };
      return { ...state, tripUpdates: [update, ...state.tripUpdates] };
    }

    // Shipper confirms delivery — this is the attestation that triggers payment
    case 'CONFIRM_DELIVERY': {
      const load = state.loads.find(l => l.id === action.loadId);
      if (!load || load.status !== 'in-transit') return state;
      return {
        ...state,
        loads: state.loads.map(l => l.id === action.loadId ? { ...l, status: 'delivered' } : l),
        bookings: state.bookings.map(b => b.loadId === action.loadId ? {
          ...b, status: 'paid',
          deliveryConfirmed: true,
          paidAt: new Date().toISOString().slice(0, 10),
        } : b),
      };
    }

    case 'FILE_CLAIM': {
      const booking = state.bookings.find(b => b.id === action.bookingId);
      if (!booking || !booking.insured) return state;
      const load = state.loads.find(l => l.id === booking.loadId);
      if (!load || (load.status !== 'delivered' && load.status !== 'paid')) return state;
      if (state.claims.some(c => c.bookingId === action.bookingId)) return state;
      const claim = {
        id: 'CL' + (++idCounter), bookingId: booking.id, loadId: booking.loadId,
        shipperId: booking.shipperId, reason: action.reason || 'Cargo damage',
        status: 'pending', filedAt: new Date().toISOString().slice(0, 10),
        resolvedAt: null, payoutAmount: booking.escrowAmount,
      };
      return { ...state, claims: [claim, ...state.claims], view: 'myBookings' };
    }

    case 'RESOLVE_CLAIM':
      return {
        ...state,
        claims: state.claims.map(c => c.id === action.claimId ? {
          ...c, status: action.approved ? 'approved' : 'rejected',
          resolvedAt: new Date().toISOString().slice(0, 10),
        } : c),
      };

    case 'SWITCH_ROLE':
      return { ...initial, loads: state.loads, bookings: state.bookings, requests: state.requests, bids: state.bids, claims: state.claims, tripUpdates: state.tripUpdates };

    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useApp() { return useContext(Ctx); }
