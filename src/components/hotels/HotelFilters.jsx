import { useEffect } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { CATEGORY_META, CONTINENT_ICON } from '../../lib/constants';
import { currency } from '../../lib/format';

const Group = ({ title, children }) => (
  <div className="border-b border-ink-900/10 py-5 first:pt-0 last:border-0">
    <p className="font-label mb-3 text-[11px] font-semibold tracking-[0.16em] text-ink-500 uppercase">
      {title}
    </p>
    {children}
  </div>
);

const Chip = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full px-3.5 py-2 text-[13px] font-medium ring-1 backdrop-blur-sm transition-all duration-300 ${
      active
        ? 'bg-ink-900 text-paper-50 ring-ink-900 shadow-md shadow-ink-900/10 scale-[1.02]'
        : 'bg-ink-900/[0.04] text-ink-700 ring-ink-900/10 hover:bg-ink-900/[0.07] hover:text-ink-900 hover:scale-[1.02]'
    }`}
  >
    {children}
  </button>
);

export const HotelFilters = ({ filters, facets, onChange, onReset, activeCount }) => {
  const set = (patch) => onChange({ ...filters, ...patch, page: 1 });

  const toggleAmenity = (amenity) => {
    const current = filters.amenities || [];
    set({
      amenities: current.includes(amenity)
        ? current.filter((a) => a !== amenity)
        : [...current, amenity],
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <SlidersHorizontal className="size-4 text-brand-600" />
          Filters
          {activeCount > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-[10px] text-white shadow-sm shadow-brand-500/20">
              {activeCount}
            </span>
          )}
        </p>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-ink-600 transition-colors hover:text-ink-900"
          >
            <X className="size-3" /> Clear
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <Group title="Region">
          <div className="flex flex-wrap gap-2">
            {(facets?.continents || []).map(({ value, total }) => (
              <Chip
                key={value}
                active={filters.continent === value}
                onClick={() => set({ continent: filters.continent === value ? '' : value })}
              >
                <span className="mr-1">{CONTINENT_ICON[value] || '📍'}</span>
                {value}
                <span className="ml-1.5 text-[11px] opacity-60">{total}</span>
              </Chip>
            ))}
          </div>
        </Group>

        <Group title="Style">
          <div className="flex flex-wrap gap-2">
            {(facets?.categories || []).map(({ value, total }) => (
              <Chip
                key={value}
                active={filters.category === value}
                onClick={() => set({ category: filters.category === value ? '' : value })}
              >
                <span className="mr-1 text-brand-600">{CATEGORY_META[value]?.icon}</span>
                {CATEGORY_META[value]?.label || value}
                <span className="ml-1.5 text-[11px] opacity-60">{total}</span>
              </Chip>
            ))}
          </div>
        </Group>

        <Group title="Nightly rate">
          <div className="px-1">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-ink-600">Up to</span>
              <span className="font-semibold text-ink-900">{currency(filters.maxPrice)}</span>
            </div>
            {(() => {
              const minP = facets?.priceRange?.min || 100;
              const maxP = facets?.priceRange?.max || 2500;
              const pct = Math.min(Math.max(((filters.maxPrice - minP) / (maxP - minP)) * 100, 0), 100);
              return (
                <input
                  type="range"
                  min={minP}
                  max={maxP}
                  step={25}
                  value={filters.maxPrice}
                  onChange={(e) => set({ maxPrice: Number(e.target.value) })}
                  aria-label="Maximum nightly rate"
                  className="w-full"
                  style={{
                    background: `linear-gradient(90deg, #a44730 0%, #c05b3f ${pct}%, #e7e1d8 ${pct}%, #e7e1d8 100%)`,
                  }}
                />
              );
            })()}
            <div className="mt-1.5 flex justify-between text-[11px] text-ink-500">
              <span>{currency(facets?.priceRange?.min || 100)}</span>
              <span>{currency(facets?.priceRange?.max || 2500)}</span>
            </div>
          </div>
        </Group>

        <Group title="Star rating">
          <div className="flex flex-wrap gap-2">
            {[5, 4, 3].map((stars) => (
              <Chip
                key={stars}
                active={Number(filters.stars) === stars}
                onClick={() => set({ stars: Number(filters.stars) === stars ? '' : stars })}
              >
                {stars}+ stars
              </Chip>
            ))}
          </div>
        </Group>

        <Group title="Amenities">
          <div className="flex flex-wrap gap-2">
            {(facets?.amenities || []).slice(0, 14).map((amenity) => (
              <Chip
                key={amenity}
                active={(filters.amenities || []).includes(amenity)}
                onClick={() => toggleAmenity(amenity)}
              >
                {amenity}
              </Chip>
            ))}
          </div>
        </Group>
      </div>
    </div>
  );
};

export const FilterDrawer = ({ open, onClose, children, onApply }) => {
  // The drawer stays mounted so it can slide, so while it is closed it must be
  // taken out of the tab order too — `pointer-events-none` only stops the
  // mouse, and tabbing into an aria-hidden, off-screen panel strands focus.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[80] lg:hidden ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
      inert={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: open ? 'radial-gradient(ellipse at 50% 100%, rgba(26,23,20,0.38), rgba(26,23,20,0.55))' : undefined,
        }}
      />
      <div
        className={`glass absolute inset-x-0 bottom-0 flex max-h-[86vh] flex-col rounded-t-3xl p-6 transition-transform duration-300 ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gradient-to-r from-ink-900/10 via-ink-900/20 to-ink-900/10" />
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
        <Button className="mt-5 w-full" onClick={onApply}>Show results</Button>
      </div>
    </div>
  );
};

export default HotelFilters;
