export const ROLES = { CUSTOMER: 'customer', EMPLOYEE: 'employee', ADMIN: 'admin' };

export const ROLE_LABEL = {
  customer: 'Guest',
  employee: 'Front desk',
  admin: 'Administrator',
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
  CANCELLED: 'cancelled',
};

export const STATUS_META = {
  pending: { label: 'Pending', tone: 'amber' },
  confirmed: { label: 'Confirmed', tone: 'indigo' },
  checked_in: { label: 'In house', tone: 'emerald' },
  checked_out: { label: 'Completed', tone: 'slate' },
  cancelled: { label: 'Cancelled', tone: 'rose' },
};

export const CATEGORY_META = {
  luxury: { label: 'Grand luxury', icon: '✦' },
  resort: { label: 'Resort', icon: '❋' },
  boutique: { label: 'Boutique', icon: '◈' },
  city: { label: 'City', icon: '▲' },
  lodge: { label: 'Lodge & safari', icon: '⌂' },
};

export const CONTINENT_ICON = {
  Europe: '🏛️',
  Asia: '🏯',
  'North America': '🗽',
  'South America': '🌄',
  Africa: '🦁',
  Oceania: '🐚',
  'Middle East': '🕌',
};

export const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Guest rating' },
  { value: 'name', label: 'Name A–Z' },
];

export const DEMO_ACCOUNTS = [
  { role: 'customer', email: 'customer@stayscape.com', password: 'Customer@123', blurb: 'Browse, book, manage trips' },
  { role: 'employee', email: 'employee@stayscape.com', password: 'Employee@123', blurb: 'Front desk for The Ritz Paris' },
  { role: 'admin', email: 'admin@stayscape.com', password: 'Admin@123', blurb: 'Full platform control' },
];
