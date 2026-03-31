export const drivers = [
  { id: 'D1', ownerId: 'O1', name: 'Emmanuel Sakala',  phone: '+260 973 XXX XXX', licenceNo: 'ZM-DL-284719', licenceExpiry: '2027-08-12', truckId: 'T1', trustScore: 0.72, tier: 'gold',   completedTrips: 31 },
  { id: 'D2', ownerId: 'O1', name: 'Francis Mumba',    phone: '+260 968 XXX XXX', licenceNo: 'ZM-DL-195032', licenceExpiry: '2026-12-01', truckId: 'T2', trustScore: 0.55, tier: 'silver', completedTrips: 14 },
  { id: 'D3', ownerId: 'O2', name: 'Peter Banda',      phone: '+260 966 XXX XXX', licenceNo: 'ZM-DL-337841', licenceExpiry: '2027-05-20', truckId: 'T3', trustScore: 0.92, tier: 'diamond', completedTrips: 67 },
  { id: 'D4', ownerId: 'O3', name: 'Kelvin Chishimba', phone: '+260 954 XXX XXX', licenceNo: 'ZM-DL-402156', licenceExpiry: '2026-06-30', truckId: 'T4', trustScore: 0.40, tier: 'bronze', completedTrips: 8 },
  { id: 'D5', ownerId: 'O4', name: 'James Ngoma',      phone: '+260 976 XXX XXX', licenceNo: 'ZM-DL-518293', licenceExpiry: '2027-11-15', truckId: 'T5', trustScore: 0.68, tier: 'silver', completedTrips: 22 },
  { id: 'D6', ownerId: 'O5', name: 'Ruth Mbewe',       phone: '+260 963 XXX XXX', licenceNo: 'ZM-DL-604817', licenceExpiry: '2027-02-28', truckId: 'T7', trustScore: 0.18, tier: 'probation', completedTrips: 3 },
];

export function getDriver(id) { return drivers.find(d => d.id === id); }
export function getOwnerDrivers(ownerId) { return drivers.filter(d => d.ownerId === ownerId); }
export function getDriverForTruck(truckId) { return drivers.find(d => d.truckId === truckId); }
