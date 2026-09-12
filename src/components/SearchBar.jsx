import { useEffect, useRef, useState } from 'react';
import DateRangePicker from './DateRangePicker';
import { formatRange } from '../lib/dates';
import { plural } from '../lib/format';

const Field = ({ label, value, muted, onClick, active, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 text-left px-6 py-3.5 rounded-full transition-colors min-w-0 ${
      active ? 'bg-white/10' : 'hover:bg-white/5'
    } ${className}`}
  >
    <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
      {label}
    </span>
    <span className={`block text-sm truncate ${muted ? 'text-slate-500' : 'text-white'}`}>
      {value}
    </span>
  </button>
);

const Stepper = ({ label, hint, value, min, max, onChange }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <p className="text-sm text-white font-medium">{label}</p>
      <p className="text-xs text-slate-500">{hint}</p>
    </div>
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className="w-8 h-8 rounded-full border border-white/15 text-slate-200 hover:border-white disabled:opacity-25 disabled:hover:border-white/15 transition-colors"
      >
        −
      </button>
      <span className="w-5 text-center text-sm text-white tabular-nums">{value}</span>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="w-8 h-8 rounded-full border border-white/15 text-slate-200 hover:border-white disabled:opacity-25 disabled:hover:border-white/15 transition-colors"
      >
        +
      </button>
    </div>
  </div>
);

const SearchBar = ({ value, onChange, onSearch }) => {
  const [panel, setPanel] = useState(null); // 'where' | 'dates' | 'guests' | null
  const rootRef = useRef(null);

  useEffect(() => {
    if (!panel) return undefined;
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setPanel(null);
    };
    const onKeyDown = (event) => event.key === 'Escape' && setPanel(null);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [panel]);

  const submit = () => {
    setPanel(null);
    onSearch?.();
  };

  return (
    <div ref={rootRef} className="relative w-full max-w-3xl">
      <div className="flex items-center gap-1 p-2 rounded-full bg-white/5 ring-1 ring-white/10 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
        <Field
          label="Where"
          value={value.destination || 'Anywhere'}
          muted={!value.destination}
          active={panel === 'where'}
          onClick={() => setPanel(panel === 'where' ? null : 'where')}
        />
        <span className="w-px h-8 bg-white/10" />
        <Field
          label="When"
          value={formatRange(value.checkIn, value.checkOut)}
          muted={!value.checkIn || !value.checkOut}
          active={panel === 'dates'}
          onClick={() => setPanel(panel === 'dates' ? null : 'dates')}
        />
        <span className="w-px h-8 bg-white/10" />
        <Field
          label="Who"
          value={plural(value.guests, 'guest')}
          active={panel === 'guests'}
          onClick={() => setPanel(panel === 'guests' ? null : 'guests')}
          className="max-w-[150px]"
        />
        <button
          type="button"
          onClick={submit}
          className="shrink-0 h-12 px-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:shadow-[0_0_24px_rgba(99,102,241,0.5)] transition-shadow"
        >
          Search
        </button>
      </div>

      {panel && (
        <div className="absolute left-0 right-0 top-full mt-3 p-6 rounded-3xl bg-slate-950/95 ring-1 ring-white/10 backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.6)] z-30 text-left">
          {panel === 'where' && (
            <>
              <label htmlFor="destination" className="block text-sm text-white font-medium mb-3">
                Search destinations
              </label>
              <input
                id="destination"
                autoFocus
                value={value.destination}
                onChange={(e) => onChange({ ...value, destination: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="Try &quot;Bali&quot;, &quot;Italy&quot; or &quot;Tokyo&quot;"
                className="w-full px-4 py-3 rounded-xl bg-white/5 ring-1 ring-white/10 text-white placeholder:text-slate-600 outline-none focus:ring-indigo-500 transition"
              />
              <div className="flex flex-wrap gap-2 mt-4">
                {['Greece', 'Japan', 'Italy', 'Maldives', 'Portugal'].map((place) => (
                  <button
                    key={place}
                    type="button"
                    onClick={() => onChange({ ...value, destination: place })}
                    className="px-3 py-1.5 rounded-full bg-white/5 ring-1 ring-white/10 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    {place}
                  </button>
                ))}
              </div>
            </>
          )}

          {panel === 'dates' && (
            <DateRangePicker
              value={{ checkIn: value.checkIn, checkOut: value.checkOut }}
              onChange={(range) => onChange({ ...value, ...range })}
            />
          )}

          {panel === 'guests' && (
            <div className="divide-y divide-white/5">
              <Stepper
                label="Guests"
                hint="Ages 13 or above"
                value={value.guests}
                min={1}
                max={12}
                onChange={(guests) => onChange({ ...value, guests })}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
