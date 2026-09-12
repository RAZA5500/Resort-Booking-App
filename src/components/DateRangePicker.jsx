import { useMemo, useState } from 'react';
import { addDays, monthGrid, monthLabel, addMonths, todayISO, formatRange, nightsBetween } from '../lib/dates';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// A blocked range is half-open: its checkout day is free for someone else's check-in.
const dayIsBlocked = (iso, blocked) =>
  blocked.some((r) => iso >= r.checkIn && iso < r.checkOut);

const Month = ({ monthDate, checkIn, checkOut, hover, blocked, minDate, onPick, onHover }) => {
  const cells = useMemo(() => monthGrid(monthDate), [monthDate]);
  const rangeEnd = checkOut || (checkIn && hover > checkIn ? hover : null);

  return (
    <div className="flex-1 min-w-[252px]">
      <p className="text-center text-sm font-semibold text-white mb-3">{monthLabel(monthDate)}</p>
      <div className="grid grid-cols-7 gap-y-1 text-[11px] text-slate-500 mb-1">
        {WEEKDAYS.map((day, i) => (
          <span key={i} className="text-center">{day}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((iso, i) => {
          if (!iso) return <span key={`pad-${i}`} />;

          const past = iso < minDate;
          const blockedDay = dayIsBlocked(iso, blocked);
          const disabled = past || (blockedDay && iso !== checkIn);
          const isStart = iso === checkIn;
          const isEnd = iso === checkOut;
          const inRange = rangeEnd && iso > checkIn && iso < rangeEnd;

          let tone = 'text-slate-200 hover:bg-white/10';
          if (disabled) tone = 'text-slate-700 line-through cursor-not-allowed';
          else if (isStart || isEnd) tone = 'bg-indigo-500 text-white font-semibold';
          else if (inRange) tone = 'bg-indigo-500/20 text-indigo-100';

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onPick(iso)}
              onMouseEnter={() => onHover(iso)}
              aria-label={iso}
              aria-pressed={isStart || isEnd}
              className={`h-9 text-[13px] rounded-lg transition-colors ${tone} ${
                isStart ? 'rounded-r-none' : ''
              } ${isEnd ? 'rounded-l-none' : ''} ${inRange ? 'rounded-none' : ''}`}
            >
              {Number(iso.slice(8))}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const DateRangePicker = ({ value, onChange, blocked = [], months = 2 }) => {
  const minDate = todayISO();
  const { checkIn, checkOut } = value;
  const [cursor, setCursor] = useState(() => addMonths(new Date(), 0));
  const [hover, setHover] = useState(null);

  const atFirstMonth =
    cursor.getFullYear() === new Date().getFullYear() &&
    cursor.getMonth() === new Date().getMonth();

  const pick = (iso) => {
    // Nothing selected yet, or a complete range: start a fresh selection.
    if (!checkIn || checkOut || iso <= checkIn) {
      onChange({ checkIn: iso, checkOut: null });
      return;
    }
    // Refuse a range that jumps over an unavailable night; restart from here.
    for (let day = checkIn; day < iso; day = addDays(day, 1)) {
      if (dayIsBlocked(day, blocked)) {
        onChange({ checkIn: iso, checkOut: null });
        return;
      }
    }
    onChange({ checkIn, checkOut: iso });
  };

  const nights = nightsBetween(checkIn, checkOut);

  return (
    <div onMouseLeave={() => setHover(null)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-white font-medium text-sm">
            {nights > 0 ? `${nights} night${nights === 1 ? '' : 's'}` : 'Select your dates'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{formatRange(checkIn, checkOut)}</p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Previous month"
            disabled={atFirstMonth}
            onClick={() => setCursor(addMonths(cursor, -1))}
            className="w-8 h-8 rounded-full border border-white/10 text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setCursor(addMonths(cursor, 1))}
            className="w-8 h-8 rounded-full border border-white/10 text-slate-300 hover:bg-white/10 transition-colors"
          >
            ›
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {Array.from({ length: months }).map((_, offset) => (
          <div key={offset} className={offset > 0 ? 'hidden lg:block flex-1' : 'flex-1'}>
            <Month
              monthDate={addMonths(cursor, offset)}
              checkIn={checkIn}
              checkOut={checkOut}
              hover={hover}
              blocked={blocked}
              minDate={minDate}
              onPick={pick}
              onHover={setHover}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
        <span className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="w-3 h-3 rounded bg-slate-800 border border-white/10" />
          Crossed-out dates are already booked
        </span>
        {(checkIn || checkOut) && (
          <button
            type="button"
            onClick={() => onChange({ checkIn: null, checkOut: null })}
            className="text-xs text-slate-300 underline underline-offset-4 hover:text-white"
          >
            Clear dates
          </button>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;
