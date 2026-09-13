import { useCallback, useState } from 'react';
import { CalendarDays, MapPin, Minus, Plus, Search, Users } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { DateRangePicker } from './DateRangePicker';
import { useDismiss } from '../../hooks/useApi';
import { formatRange, plural } from '../../lib/format';

const QUICK_PLACES = ['Paris', 'Tokyo', 'Dubai', 'Maldives', 'Italy', 'Cape Town'];

const Segment = ({ icon: Icon, label, value, muted, active, onClick, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex min-w-0 flex-1 items-center gap-3 rounded-full px-5 py-3 text-left transition-all duration-300 ${
      active ? 'bg-white/10 shadow-inner shadow-white/5' : 'hover:bg-white/5'
    } ${className}`}
  >
    <Icon className={`size-4 shrink-0 transition-colors duration-300 ${active ? 'text-brand-300 drop-shadow-[0_0_6px_rgba(165,180,252,0.4)]' : 'text-brand-300/70'}`} strokeWidth={2} />
    <span className="min-w-0">
      <span className="font-label block text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
        {label}
      </span>
      <span className={`block truncate text-sm ${muted ? 'text-slate-500' : 'text-white'}`}>
        {value}
      </span>
    </span>
  </button>
);

export const SearchPanel = ({ value, onChange, onSubmit, className = '' }) => {
  const [panel, setPanel] = useState(null);
  const close = useCallback(() => setPanel(null), []);
  const ref = useDismiss(Boolean(panel), close);

  const submit = () => {
    close();
    onSubmit?.(value);
  };

  const setGuests = (next) => onChange({ ...value, guests: Math.min(Math.max(next, 1), 10) });

  return (
    <div ref={ref} className={`relative w-full ${className}`}>
      <div className="glass flex flex-col gap-1 rounded-3xl p-2 shadow-2xl shadow-black/50 sm:flex-row sm:items-center sm:rounded-full">
        <Segment
          icon={MapPin}
          label="Where"
          value={value.destination || 'Anywhere in the world'}
          muted={!value.destination}
          active={panel === 'where'}
          onClick={() => setPanel(panel === 'where' ? null : 'where')}
        />
        <span className="hidden h-8 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent sm:block" />
        <Segment
          icon={CalendarDays}
          label="When"
          value={formatRange(value.checkIn, value.checkOut)}
          muted={!value.checkIn || !value.checkOut}
          active={panel === 'dates'}
          onClick={() => setPanel(panel === 'dates' ? null : 'dates')}
        />
        <span className="hidden h-8 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent sm:block" />
        <Segment
          icon={Users}
          label="Who"
          value={plural(value.guests, 'guest')}
          active={panel === 'guests'}
          onClick={() => setPanel(panel === 'guests' ? null : 'guests')}
          className="sm:max-w-[170px]"
        />

        <button
          type="button"
          onClick={submit}
          className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-br from-brand-500 via-violet-500 to-brand-600 px-6 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition-all duration-300 hover:shadow-brand-500/50 hover:shadow-xl hover:brightness-110 active:scale-[0.97]"
        >
          <Search className="size-4" strokeWidth={2.4} />
          Search
        </button>
      </div>

      <AnimatePresence>
        {panel && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, scale: 0.98, filter: 'blur(4px)' }}
            transition={{ duration: 0.22 }}
            className="glass absolute inset-x-0 top-full z-40 mt-3 rounded-3xl p-6 text-left shadow-2xl shadow-black/60"
          >
            {/* Luminous top accent */}
            <div className="absolute inset-x-0 top-0 h-px rounded-t-3xl bg-gradient-to-r from-transparent via-brand-400/40 to-transparent" />

            {panel === 'where' && (
              <>
                <label htmlFor="destination" className="mb-3 block text-sm font-medium text-white">
                  Search destinations
                </label>
                <input
                  id="destination"
                  autoFocus
                  value={value.destination}
                  onChange={(e) => onChange({ ...value, destination: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                  placeholder="City, country or hotel name"
                  className="h-12 w-full rounded-xl bg-white/5 px-4 text-white ring-1 ring-white/10 outline-none transition-all duration-300 placeholder:text-slate-600 focus:ring-brand-500 focus:shadow-[0_0_20px_-4px_rgba(99,102,241,0.2)]"
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  {QUICK_PLACES.map((place) => (
                    <button
                      key={place}
                      type="button"
                      onClick={() => onChange({ ...value, destination: place })}
                      className="rounded-full bg-white/5 px-3.5 py-2 text-xs text-slate-300 ring-1 ring-white/10 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:text-white hover:scale-105"
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
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-white">Guests</p>
                  <p className="text-xs text-slate-500">Rooms sleep up to 4</p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    aria-label="Fewer guests"
                    disabled={value.guests <= 1}
                    onClick={() => setGuests(value.guests - 1)}
                    className="grid size-9 place-items-center rounded-full text-slate-200 ring-1 ring-white/15 transition-all duration-200 hover:ring-white hover:bg-white/5 disabled:opacity-25"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-6 text-center text-base font-medium text-white tabular-nums">
                    {value.guests}
                  </span>
                  <button
                    type="button"
                    aria-label="More guests"
                    disabled={value.guests >= 10}
                    onClick={() => setGuests(value.guests + 1)}
                    className="grid size-9 place-items-center rounded-full text-slate-200 ring-1 ring-white/15 transition-all duration-200 hover:ring-white hover:bg-white/5 disabled:opacity-25"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchPanel;
