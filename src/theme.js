// ZamaLoad — Design tokens
// Industrial but warm. Barlow Condensed headings, amber/asphalt palette.

export const C = {
  ink:      '#0d0d0d',
  paper:    '#f4f0e8',
  asphalt:  '#1a1a1a',
  amber:    '#e8a020',
  amberDk:  '#b07810',
  amberLt:  '#f5dca0',
  dust:     '#8a8070',
  line:     '#d4cfc4',
  white:    '#ffffff',
  green:    '#2e7d32',
  greenLt:  '#e8f5e9',
  red:      '#c62828',
  redLt:    '#ffebee',
  blue:     '#1565c0',
  blueLt:   '#e3f2fd',
};

export const FONT = {
  heading: "'Barlow Condensed', sans-serif",
  body: "'Barlow', sans-serif",
};

// Trust tier colors
export const TRUST_TIERS = {
  probation: { color: '#9CA3AF', label: 'New', bg: '#F3F4F6' },
  bronze:    { color: '#8B6914', label: 'Bronze', bg: '#FEF3C7' },
  silver:    { color: '#6B7280', label: 'Silver', bg: '#F3F4F6' },
  gold:      { color: '#b07810', label: 'Gold', bg: '#FEF3C7' },
  diamond:   { color: '#0D9488', label: 'Diamond', bg: '#F0FDFA' },
};

// Insurance
export const INSURANCE_RATE = 0.025; // 2.5% of cargo value

// Claim status config
export const CLAIM_STATUS = {
  pending:  { label: 'Under Review', color: '#b07810', bg: '#fef3c7' },
  approved: { label: 'Approved',     color: '#2e7d32', bg: '#e8f5e9' },
  rejected: { label: 'Rejected',     color: '#c62828', bg: '#ffebee' },
};

// Load status config
export const STATUS = {
  posted:       { label: 'Open',        color: C.dust,    bg: '#f0ece4' },
  booked:       { label: 'Booked',      color: C.amber,   bg: '#fef3c7' },
  full:         { label: 'Full',        color: '#7c3aed', bg: '#ede9fe' },
  'in-transit': { label: 'In Transit',  color: C.amberDk, bg: '#fef3c7' },
  delivered:    { label: 'Delivered',   color: C.green,   bg: '#e8f5e9' },
  paid:         { label: 'Paid',        color: '#1b5e20', bg: '#c8e6c9' },
  // Request statuses
  open:         { label: 'Open',        color: C.amber,   bg: '#fef3c7' },
  matched:      { label: 'Matched',     color: C.green,   bg: '#e8f5e9' },
  // Bid statuses
  pending:      { label: 'Pending',     color: C.amber,   bg: '#fef3c7' },
  accepted:     { label: 'Accepted',    color: C.green,   bg: '#e8f5e9' },
  declined:     { label: 'Declined',    color: C.red,     bg: '#ffebee' },
  cancelled:    { label: 'Cancelled',   color: C.dust,    bg: '#f0ece4' },
};
