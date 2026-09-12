export const currency = (amount, opts = {}) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    ...opts,
  }).format(Number(amount) || 0);

export const compactCurrency = (amount) => {
  const n = Number(amount) || 0;
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return currency(n);
};

export const plural = (count, word, suffix = 's') =>
  `${count} ${word}${count === 1 ? '' : suffix}`;

// ---------------------------------------------------------------- dates
// Dates are "YYYY-MM-DD" strings everywhere and only become Date objects at
// noon local time, so a timezone shift can never move a night.

export const parseISO = (iso) => {
  if (!iso) return null;
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d, 12);
};

export const toISO = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const todayISO = () => toISO(new Date());

export const addDays = (iso, amount) => {
  const date = parseISO(iso);
  date.setDate(date.getDate() + amount);
  return toISO(date);
};

export const addMonths = (date, amount) =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1, 12);

export const nightsBetween = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  return Math.max(0, Math.round((parseISO(checkOut) - parseISO(checkIn)) / 86400000));
};

export const formatDate = (iso, options = { month: 'short', day: 'numeric' }) =>
  iso ? parseISO(iso).toLocaleDateString('en-US', options) : '';

export const formatDateTime = (isoString) =>
  isoString
    ? new Date(isoString).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
      })
    : '';

export const formatRange = (checkIn, checkOut, fallback = 'Add dates') => {
  if (!checkIn || !checkOut) return fallback;
  const sameYear = checkIn.slice(0, 4) === checkOut.slice(0, 4);
  const end = formatDate(
    checkOut,
    sameYear ? { month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' }
  );
  return `${formatDate(checkIn)} – ${end}`;
};

export const relativeDay = (iso) => {
  const days = nightsBetween(todayISO(), iso);
  if (iso === todayISO()) return 'Today';
  if (iso < todayISO()) return formatDate(iso, { month: 'short', day: 'numeric' });
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `In ${days} days`;
  return formatDate(iso, { month: 'short', day: 'numeric' });
};

export const monthLabel = (date) =>
  date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

/** Days of a month on a Sun–Sat grid, padded with nulls. */
export const monthGrid = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const cells = Array(new Date(year, month, 1, 12).getDay()).fill(null);
  const days = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= days; day++) cells.push(toISO(new Date(year, month, day, 12)));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
