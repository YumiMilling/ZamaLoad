export const initialBookings = [
  { id: 'B01', loadId: 'L03', shipperId: 'S1', ownerId: 'O1', status: 'booked',     bookedAt: '2026-03-30', escrowAmount: 7200,  deliveryConfirmed: false, paidAt: null },
  { id: 'B02', loadId: 'L04', shipperId: 'S3', ownerId: 'O4', status: 'in-transit', bookedAt: '2026-03-29', escrowAmount: 10640, deliveryConfirmed: false, paidAt: null },
  { id: 'B03', loadId: 'L05', shipperId: 'S1', ownerId: 'O2', status: 'delivered',  bookedAt: '2026-03-25', escrowAmount: 7560,  deliveryConfirmed: false, paidAt: null },
  { id: 'B04', loadId: 'L07', shipperId: 'S2', ownerId: 'O4', status: 'paid',       bookedAt: '2026-03-20', escrowAmount: 4500,  deliveryConfirmed: true,  paidAt: '2026-03-27' },
];
