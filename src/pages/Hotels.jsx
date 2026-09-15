import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { SearchPanel } from '../components/search/SearchPanel';
import { HotelCard } from '../components/hotels/HotelCard';
import { FilterDrawer, HotelFilters } from '../components/hotels/HotelFilters';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Field';
import { Pagination } from '../components/ui/Pagination';
import { EmptyState, ErrorState, HotelCardSkeleton } from '../components/ui/Feedback';
import { useApi, useDebounced } from '../hooks/useApi';
import { hotels as hotelApi } from '../api/endpoints';
import { SORT_OPTIONS } from '../lib/constants';
import { formatRange, nightsBetween, plural } from '../lib/format';

const DEFAULTS = {
  q: '', continent: '', country: '', category: '', stars: '', amenities: [],
  maxPrice: 2500, checkIn: '', checkOut: '', guests: 1, sort: 'recommended', page: 1,
  featured: '',
};

const readParams = (params) => ({
  ...DEFAULTS,
  q: params.get('q') || '',
  continent: params.get('continent') || '',
  country: params.get('country') || '',
  category: params.get('category') || '',
  stars: params.get('stars') || '',
  amenities: params.get('amenities') ? params.get('amenities').split(',') : [],
  maxPrice: Number(params.get('maxPrice')) || DEFAULTS.maxPrice,
  checkIn: params.get('checkIn') || '',
  checkOut: params.get('checkOut') || '',
  guests: Number(params.get('guests')) || 1,
  sort: params.get('sort') || 'recommended',
  page: Number(params.get('page')) || 1,
  featured: params.get('featured') || '',
});

const Hotels = () => {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readParams(params), [params]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Typing in the destination box should not fire a request per keystroke.
  const debouncedQuery = useDebounced(filters.q, 400);

  const applyFilters = useCallback(
    (next) => {
      const merged = { ...filters, ...next };
      const clean = {};
      Object.entries(merged).forEach(([key, value]) => {
        const isDefault = String(DEFAULTS[key]) === String(value);
        if (value !== '' && value != null && !(Array.isArray(value) && value.length === 0) && !isDefault) {
          clean[key] = Array.isArray(value) ? value.join(',') : String(value);
        }
      });
      setParams(clean, { replace: true });
    },
    [filters, setParams]
  );

  const query = useMemo(
    () => ({
      q: debouncedQuery,
      continent: filters.continent,
      country: filters.country,
      category: filters.category,
      stars: filters.stars,
      amenities: filters.amenities,
      maxPrice: filters.maxPrice,
      checkIn: filters.checkIn,
      checkOut: filters.checkOut,
      guests: filters.guests,
      sort: filters.sort,
      page: filters.page,
      featured: filters.featured,
      limit: 12,
    }),
    [debouncedQuery, filters]
  );

  const { data: facets } = useApi(() => hotelApi.facets(), []);
  const { data, loading, error, refetch } = useApi(
    () => hotelApi.list(query),
    [JSON.stringify(query)]
  );

  const nights = nightsBetween(filters.checkIn, filters.checkOut);
  const datesChosen = Boolean(filters.checkIn && filters.checkOut);

  const activeCount = [
    filters.continent, filters.country, filters.category, filters.stars,
    filters.featured, datesChosen ? '1' : '', filters.guests > 1 ? '1' : '',
    filters.maxPrice !== DEFAULTS.maxPrice ? '1' : '',
  ].filter(Boolean).length + filters.amenities.length;

  const filterPanel = (
    <HotelFilters
      filters={filters}
      facets={facets}
      onChange={applyFilters}
      onReset={() => setParams({}, { replace: true })}
      activeCount={activeCount}
    />
  );

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="display mb-3 text-4xl text-ink-900 sm:text-5xl">
          {filters.continent || 'Every stay in the collection'}
        </h1>
        <p className="text-ink-600">
          {loading
            ? 'Searching…'
            : `${data?.pagination.total ?? 0} ${
                data?.pagination.total === 1 ? 'hotel' : 'hotels'
              }`}
          {datesChosen && ` available ${formatRange(filters.checkIn, filters.checkOut)}`}
          {datesChosen && ` · ${plural(nights, 'night')}`}
        </p>
      </motion.header>

      <div className="mb-8">
        <SearchPanel
          value={{
            destination: filters.q,
            checkIn: filters.checkIn || null,
            checkOut: filters.checkOut || null,
            guests: filters.guests,
          }}
          onChange={(value) =>
            applyFilters({
              q: value.destination,
              checkIn: value.checkIn || '',
              checkOut: value.checkOut || '',
              guests: value.guests,
              page: 1,
            })
          }
          onSubmit={() => {}}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[268px_1fr]">
        <aside className="hidden lg:block">
          <div className="surface sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-3xl p-5 backdrop-blur-sm">
            {/* Gradient top accent */}
            <div className="absolute inset-x-0 top-0 h-px rounded-t-3xl bg-gradient-to-r from-transparent via-brand-400/30 to-transparent" />
            {filterPanel}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="subtle"
              size="sm"
              icon={SlidersHorizontal}
              className="lg:hidden"
              onClick={() => setDrawerOpen(true)}
            >
              Filters{activeCount > 0 && ` (${activeCount})`}
            </Button>

            <div className="ml-auto w-full sm:w-56">
              <Select
                aria-label="Sort results"
                value={filters.sort}
                onChange={(e) => applyFilters({ sort: e.target.value, page: 1 })}
                options={SORT_OPTIONS}
              />
            </div>
          </div>

          {error ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <HotelCardSkeleton key={i} />)}
            </div>
          ) : data?.hotels.length ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {data.hotels.map((hotel, i) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    index={i}
                    nights={nights}
                    search={{
                      checkIn: filters.checkIn,
                      checkOut: filters.checkOut,
                      guests: filters.guests,
                    }}
                  />
                ))}
              </div>

              <Pagination
                page={data.pagination.page}
                pages={data.pagination.pages}
                onChange={(page) => {
                  applyFilters({ page });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="mt-12"
              />
            </>
          ) : (
            <EmptyState
              title="Nothing matches that search"
              message="Try widening the dates, lifting the price ceiling, or clearing a filter or two."
              action={
                <Button variant="subtle" onClick={() => setParams({}, { replace: true })}>
                  Clear all filters
                </Button>
              }
            />
          )}
        </div>
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onApply={() => setDrawerOpen(false)}
      >
        {filterPanel}
      </FilterDrawer>
    </div>
  );
};

export default Hotels;
