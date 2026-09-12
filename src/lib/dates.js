// Date helpers. All dates are handled as "YYYY-MM-DD" strings and converted to
// local Date objects at noon so daylight-saving shifts can never move a day.

export const toISO = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const parseISO = (iso) => {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
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
  const ms = parseISO(checkOut) - parseISO(checkIn);
  return Math.max(0, Math.round(ms / 86400000));
};

export const formatDate = (iso, options = { month: 'short', day: 'numeric' }) =>
  iso ? parseISO(iso).toLocaleDateString('en-US', options) : '';

export const formatRange = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 'Add dates';
  const sameYear = checkIn.slice(0, 4) === checkOut.slice(0, 4);
  const end = formatDate(checkOut, sameYear
    ? { month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: 'numeric' });
  return `${formatDate(checkIn)} – ${end}`;
};

// Half-open intervals: a stay ending on the day another begins is not a clash.
export const rangesOverlap = (aStart, aEnd, bStart, bEnd) =>
  aStart < bEnd && bStart < aEnd;

export const monthLabel = (date) =>
  date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

// Days of a month laid out on a Sun-Sat grid, padded with nulls.
export const monthGrid = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1, 12);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(first.getDay()).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toISO(new Date(year, month, day, 12)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};
