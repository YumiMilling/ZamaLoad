export const trucks = [
  { id: 'T1', ownerId: 'O1', plate: 'ABB 1234', make: 'Isuzu FTR',          year: 2019, type: 'Flatbed (15T)',           capacityTonnes: 15, licenceExpiry: '2027-03-15', inspectionDate: '2026-02-10', status: 'valid' },
  { id: 'T2', ownerId: 'O1', plate: 'ABB 5678', make: 'Mitsubishi Canter',  year: 2021, type: 'Canter with Tarp (3.5T)', capacityTonnes: 3.5,licenceExpiry: '2026-11-30', inspectionDate: '2026-01-20', status: 'valid' },
  { id: 'T3', ownerId: 'O2', plate: 'ACA 9012', make: 'Hino 500',           year: 2018, type: 'Tipper (20T)',            capacityTonnes: 20, licenceExpiry: '2027-06-01', inspectionDate: '2026-03-05', status: 'valid' },
  { id: 'T4', ownerId: 'O3', plate: 'ACF 3456', make: 'FAW J6',             year: 2020, type: 'Curtain-side (12T)',      capacityTonnes: 12, licenceExpiry: '2026-04-10', inspectionDate: '2025-12-15', status: 'expiring' },
  { id: 'T5', ownerId: 'O4', plate: 'ADA 7890', make: 'Scania P410',        year: 2017, type: 'Interlink (34T)',         capacityTonnes: 34, licenceExpiry: '2027-09-20', inspectionDate: '2026-02-28', status: 'valid' },
  { id: 'T6', ownerId: 'O4', plate: 'ADA 2345', make: 'MAN TGS',            year: 2016, type: 'Flatbed (30T)',           capacityTonnes: 30, licenceExpiry: '2026-01-05', inspectionDate: '2025-06-10', status: 'expired' },
  { id: 'T7', ownerId: 'O5', plate: 'AEB 6789', make: 'Isuzu NQR',          year: 2022, type: 'Refrigerated (10T)',      capacityTonnes: 10, licenceExpiry: '2027-01-15', inspectionDate: '2026-03-20', status: 'valid' },
];

export function getTruck(id) { return trucks.find(t => t.id === id); }
export function getOwnerTrucks(ownerId) { return trucks.filter(t => t.ownerId === ownerId); }
