export const users = [
  // Truck owners
  { id: 'O1', name: 'Joseph Mwale',    role: 'owner',   phone: '+260 971 XXX XXX', location: 'Lusaka',     truckType: 'Flatbed 15T',      truckCount: 2, trustScore: 0.78, tier: 'gold',    completedTrips: 34, memberSince: '2025-08' },
  { id: 'O2', name: 'Peter Banda',     role: 'owner',   phone: '+260 966 XXX XXX', location: 'Kitwe',      truckType: 'Tipper 20T',       truckCount: 1, trustScore: 0.92, tier: 'diamond', completedTrips: 67, memberSince: '2025-03' },
  { id: 'O3', name: 'Grace Phiri',     role: 'owner',   phone: '+260 955 XXX XXX', location: 'Ndola',      truckType: 'Curtain-side 12T', truckCount: 1, trustScore: 0.45, tier: 'bronze',  completedTrips: 8,  memberSince: '2026-01' },
  { id: 'O4', name: 'Moses Tembo',     role: 'owner',   phone: '+260 977 XXX XXX', location: 'Livingstone',truckType: 'Flatbed 30T',      truckCount: 3, trustScore: 0.65, tier: 'silver',  completedTrips: 21, memberSince: '2025-06' },
  { id: 'O5', name: 'Martha Zulu',     role: 'owner',   phone: '+260 962 XXX XXX', location: 'Choma',      truckType: 'Refrigerated 10T', truckCount: 1, trustScore: 0.15, tier: 'probation', completedTrips: 3, memberSince: '2026-03' },

  // Shippers
  { id: 'S1', name: 'Chilufya Trading',role: 'shipper', phone: '+260 978 XXX XXX', location: 'Lusaka',     business: 'General goods',      trustScore: 0.81, tier: 'gold',   completedTrips: 28, memberSince: '2025-05' },
  { id: 'S2', name: 'Mutale Farms',    role: 'shipper', phone: '+260 955 XXX XXX', location: 'Chipata',    business: 'Agricultural produce',trustScore: 0.55, tier: 'silver', completedTrips: 12, memberSince: '2025-09' },
  { id: 'S3', name: 'Bwalya Supplies', role: 'shipper', phone: '+260 967 XXX XXX', location: 'Kabwe',      business: 'Building materials', trustScore: 0.70, tier: 'gold',   completedTrips: 19, memberSince: '2025-07' },
  { id: 'S4', name: 'Ndola Hardware',  role: 'shipper', phone: '+260 961 XXX XXX', location: 'Ndola',      business: 'Hardware & steel',   trustScore: 0.35, tier: 'bronze', completedTrips: 5,  memberSince: '2026-02' },
];

export function getUser(id) { return users.find(u => u.id === id); }
export function getOwners() { return users.filter(u => u.role === 'owner'); }
export function getShippers() { return users.filter(u => u.role === 'shipper'); }
