import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, addMonths, formatRange, monthGrid, monthLabel, nightsBetween, todayISO } from '../../lib/format';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const Month = ({ monthDate, checkIn, checkOut, hover, blocked, minDate, onPick, onHover }) => {
  const cells = useMemo(() => monthGrid(monthDate), [monthDate]);
  const rangeEnd = checkOut || (checkIn && hover > checkIn ? hover : null);

  return (
    <div className="min-w-0 flex-1">
      <p className="mb-3 text-center text-sm font-semibold text-white">{monthLabel(monthDate)}</p>

      <div className="mb-1 grid grid-cols-7 text-[10px] font-medium text-slate-600">
        {WEEKDAYS.map((day, i) => (
          <span key={i} className="py-1 text-center">{day}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((iso, i) => {
          if (!iso) return <span key={`pad-${i}`} />;

          const past = iso < minDate;
          const isBlocked = blocked.has(iso);
          const disabled = past || (isBlocked && iso !== checkIn);
          const isStart = iso === checkIn;
          const isEnd = iso === checkOut;
          const inRange = rangeEnd && iso > checkIn && iso < rangeEnd;
          const isToday = iso === minDate;

          let tone = 'text-slate-200 hover:bg-white/10';
          if (disabled) tone = 'text-slate-700 line-through cursor-not-allowed';
          else if (isStart || isEnd) tone = 'bg-gradient-to-br from-brand-500 to-violet-500 text-white font-semibold shadow-md shadow-brand-500/20';
          else if (inRange) tone = 'bg-brand-500/20 text-brand-100';

          // Pick one radius per cell rather than layering `rounded-none` over
          // `rounded-lg` — which of two conflicting utilities wins depends on
          // their order in the generated stylesheet, not on this string.
          let radius = 'rounded-lg';
          if (inRange) radius = 'rounded-none';
          else if (isStart && rangeEnd) radius = 'rounded-l-lg rounded-r-none';
          else if (isEnd) radius = 'rounded-r-lg rounded-l-none';

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onPick(iso)}
              onMouseEnter={() => onHover(iso)}
              aria-label={iso}
              className={`relative h-9 text-[13px] transition-all duration-200 ${radius} ${tone}`}
            >
              {Number(iso.slice(8))}
              {/* Today indicator dot */}
              {isToday && !isStart && !isEnd && (
                <span className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-brand-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const DateRangePicker = ({
  value, onChange, blockedDates = [], months = 2, minNights = 1,
}) => {
  const minDate = todayISO();
  const { checkIn, checkOut } = value;
  const [cursor, setCursor] = useState(() => addMonths(new Date(), 0));
  const [hover, setHover] = useState(null);

  const blocked = useMemo(() => new Set(blockedDates), [blockedDates]);

  const now = new Date();
  const atStart =
    cursor.getFullYear() === now.getFullYear() && cursor.getMonth() === now.getMonth();

  const pick = (iso) => {
    // Fresh selection when nothing is pending, a range is complete, or the click
    // lands before the current check-in.
    if (!checkIn || checkOut || iso <= checkIn) {
      onChange({ checkIn: iso, checkOut: null });
      return;
    }
    if (nightsBetween(checkIn, iso) < minNights) return;

    // Refuse a range that would jump over a sold-out night.
    for (let day = checkIn; day < iso; day = addDays(day, 1)) {
      if (blocked.has(day)) {
        onChange({ checkIn: iso, checkOut: null });
        return;
      }
    }
    onChange({ checkIn, checkOut: iso });
  };

  const nights = nightsBetween(checkIn, checkOut);

  return (
    <div onMouseLeave={() => setHover(null)}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white">
            {nights > 0 ? `${nights} night${nights === 1 ? '' : 's'}` : 'Select your dates'}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{formatRange(checkIn, checkOut)}</p>
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Previous month"
            disabled={atStart}
            onClick={() => setCursor(addMonths(cursor, -1))}
            className="grid size-9 place-items-center rounded-full text-slate-400 ring-1 ring-white/10 transition-all duration-200 hover:bg-white/8 hover:text-white hover:ring-white/20 disabled:opacity-25 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setCursor(addMonths(cursor, 1))}
            className="grid size-9 place-items-center rounded-full text-slate-400 ring-1 ring-white/10 transition-all duration-200 hover:bg-white/8 hover:text-white hover:ring-white/20"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {Array.from({ length: months }).map((_, offset) => (
          <div key={offset} className={offset > 0 ? 'hidden flex-1 md:block' : 'flex-1'}>
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

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/8 pt-4">
        <span className="text-[11px] text-slate-600">
          Crossed-out nights are fully booked
        </span>
        {(checkIn || checkOut) && (
          <button
            type="button"
            onClick={() => onChange({ checkIn: null, checkOut: null })}
            className="text-xs text-slate-300 underline underline-offset-4 transition-colors hover:text-white"
          >
            Clear dates
          </button>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;
