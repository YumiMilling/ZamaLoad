export const drivers = [
  // O1 drivers (Lusaka)
  { id: 'D1', ownerId: 'O1', name: 'Emmanuel Sakala',  phone: '+260 973 XXX XXX', licenceNo: 'ZM-DL-284719', licenceExpiry: '2027-08-12', truckId: 'T1', trustScore: 0.72, tier: 'gold',      completedTrips: 31 },
  { id: 'D2', ownerId: 'O1', name: 'Francis Mumba',    phone: '+260 968 XXX XXX', licenceNo: 'ZM-DL-195032', licenceExpiry: '2026-12-01', truckId: 'T2', trustScore: 0.55, tier: 'silver',    completedTrips: 14 },
  // O2 drivers (Kitwe)
  { id: 'D3', ownerId: 'O2', name: 'Peter Banda',      phone: '+260 966 XXX XXX', licenceNo: 'ZM-DL-337841', licenceExpiry: '2027-05-20', truckId: 'T3', trustScore: 0.92, tier: 'diamond',   completedTrips: 67 },
  { id: 'D8', ownerId: 'O2', name: 'Charles Mwansa',   phone: '+260 972 XXX XXX', licenceNo: 'ZM-DL-441290', licenceExpiry: '2027-03-15', truckId: 'T8', trustScore: 0.68, tier: 'silver',    completedTrips: 24 },
  // O3 driver (Ndola)
  { id: 'D4', ownerId: 'O3', name: 'Kelvin Chishimba', phone: '+260 954 XXX XXX', licenceNo: 'ZM-DL-402156', licenceExpiry: '2026-06-30', truckId: 'T4', trustScore: 0.40, tier: 'bronze',    completedTrips: 8 },
  // O4 driver (Livingstone)
  { id: 'D5', ownerId: 'O4', name: 'James Ngoma',      phone: '+260 976 XXX XXX', licenceNo: 'ZM-DL-518293', licenceExpiry: '2027-11-15', truckId: 'T5', trustScore: 0.68, tier: 'silver',    completedTrips: 22 },
  // O5 driver (Choma)
  { id: 'D6', ownerId: 'O5', name: 'Ruth Mbewe',       phone: '+260 963 XXX XXX', licenceNo: 'ZM-DL-604817', licenceExpiry: '2027-02-28', truckId: 'T7', trustScore: 0.18, tier: 'probation', completedTrips: 3 },
  // O6 drivers (Chipata)
  { id: 'D7', ownerId: 'O6', name: 'George Nyirenda',  phone: '+260 979 XXX XXX', licenceNo: 'ZM-DL-710394', licenceExpiry: '2027-06-10', truckId: 'T9', trustScore: 0.75, tier: 'gold',      completedTrips: 29 },
  { id: 'D9', ownerId: 'O6', name: 'Patrick Phiri',    phone: '+260 964 XXX XXX', licenceNo: 'ZM-DL-820156', licenceExpiry: '2027-09-01', truckId: 'T10',trustScore: 0.60, tier: 'silver',    completedTrips: 16 },
  // O7 driver (Solwezi)
  { id: 'D10',ownerId: 'O7', name: 'Michael Kapata',   phone: '+260 971 XXX XXX', licenceNo: 'ZM-DL-930281', licenceExpiry: '2027-04-15', truckId: 'T11',trustScore: 0.82, tier: 'gold',      completedTrips: 41 },
  // O8 drivers (Kabwe)
  { id: 'D11',ownerId: 'O8', name: 'David Mulenga',    phone: '+260 967 XXX XXX', licenceNo: 'ZM-DL-104572', licenceExpiry: '2027-10-20', truckId: 'T12',trustScore: 0.58, tier: 'silver',    completedTrips: 15 },
  { id: 'D12',ownerId: 'O8', name: 'Mercy Bwalya',     phone: '+260 958 XXX XXX', licenceNo: 'ZM-DL-115683', licenceExpiry: '2027-07-30', truckId: 'T13',trustScore: 0.30, tier: 'bronze',    completedTrips: 6 },
];

export function getDriver(id) { return drivers.find(d => d.id === id); }
export function getOwnerDrivers(ownerId) { return drivers.filter(d => d.ownerId === ownerId); }
export function getDriverForTruck(truckId) { return drivers.find(d => d.truckId === truckId); }
