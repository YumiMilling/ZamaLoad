// Freight requests posted by shippers — "I need X moved from A to B"
export const initialRequests = [
  { id: 'R01', shipperId: 'S1', origin: 'Lusaka',  destination: 'Choma',    date: '2026-04-06', tonnes: 12, cargo: 'Cement bags',       status: 'open',   createdAt: '2026-03-29' },
  { id: 'R02', shipperId: 'S2', origin: 'Chipata',  destination: 'Lusaka',  date: '2026-04-10', tonnes: 8,  cargo: 'Maize (50kg bags)', status: 'open',   createdAt: '2026-03-30' },
  { id: 'R03', shipperId: 'S3', origin: 'Kabwe',   destination: 'Kitwe',    date: '2026-04-07', tonnes: 20, cargo: 'Steel rebar',       status: 'open',   createdAt: '2026-03-28' },
  { id: 'R04', shipperId: 'S1', origin: 'Lusaka',  destination: 'Mongu',    date: '2026-04-14', tonnes: 10, cargo: 'Mixed goods',       status: 'open',   createdAt: '2026-03-31' },
  { id: 'R05', shipperId: 'S4', origin: 'Ndola',   destination: 'Lusaka',   date: '2026-04-05', tonnes: 15, cargo: 'Copper cathodes',   status: 'open',    createdAt: '2026-03-27', acceptedBidId: null },
];
