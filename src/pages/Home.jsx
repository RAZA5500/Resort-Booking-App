import { useMemo, useState } from 'react';
import Card from '../Cards/Cards';
import SearchBar from '../components/SearchBar';
import { CATEGORIES, LISTINGS } from '../data/listings';
import { useBooking } from '../context/bookingStore';
import { nightsBetween } from '../lib/dates';
import { currency, plural } from '../lib/format';

const SORTS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'rating', label: 'Top rated' },
];

const EMPTY_SEARCH = { destination: '', checkIn: null, checkOut: null, guests: 2 };

const Home = () => {
  const { isRangeAvailable } = useBooking();
  const [draft, setDraft] = useState(EMPTY_SEARCH);
  const [applied, setApplied] = useState(EMPTY_SEARCH);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('recommended');
  const [maxPrice, setMaxPrice] = useState(1000);

  const nights = nightsBetween(applied.checkIn, applied.checkOut);
  const datesChosen = Boolean(applied.checkIn && applied.checkOut);

  const results = useMemo(() => {
    const needle = applied.destination.trim().toLowerCase();

    const filtered = LISTINGS.filter((listing) => {
      if (category !== 'all' && listing.category !== category) return false;
      if (listing.price > maxPrice) return false;
      if (listing.guests < applied.guests) return false;
      if (needle) {
        const haystack = `${listing.title} ${listing.location} ${listing.country} ${listing.category}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      if (datesChosen && !isRangeAvailable(listing.id, applied.checkIn, applied.checkOut)) {
        return false;
      }
      return true;
    });

    const ordered = [...filtered];
    if (sort === 'price-asc') ordered.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') ordered.sort((a, b) => b.price - a.price);
    if (sort === 'rating') ordered.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    return ordered;
  }, [applied, category, sort, maxPrice, datesChosen, isRangeAvailable]);

  const resetAll = () => {
    setDraft(EMPTY_SEARCH);
    setApplied(EMPTY_SEARCH);
    setCategory('all');
    setMaxPrice(1000);
    setSort('recommended');
  };

  // Dates and guests travel with the link so the stay page opens pre-filled.
  const cardQuery = datesChosen
    ? { checkIn: applied.checkIn, checkOut: applied.checkOut, guests: String(applied.guests) }
    : undefined;

  const filtersActive =
    category !== 'all' || maxPrice < 1000 || applied.destination || datesChosen || applied.guests !== 2;

  return (
    <div className="relative z-10 container mx-auto px-6 pt-10 pb-24 flex flex-col items-center">
      <div className="text-center mb-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-medium mb-6 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Premium Collection
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-100 to-slate-500">
          Extraordinary Stays
        </h1>
        <p className="text-lg md:text-xl text-slate-400 font-light leading-relaxed">
          Handpicked luxury destinations around the globe. Pick your dates, check real
          availability, and book in under a minute.
        </p>
      </div>

      <div className="w-full flex justify-center mb-10">
        <SearchBar value={draft} onChange={setDraft} onSearch={() => setApplied(draft)} />
      </div>

      <div className="w-full max-w-[1400px] flex flex-wrap items-center justify-center gap-2 mb-8">
        {CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCategory(item.id)}
            className={`px-4 py-2.5 rounded-full text-sm font-medium ring-1 transition-all ${
              category === item.id
                ? 'bg-white text-slate-900 ring-white'
                : 'bg-white/5 text-slate-300 ring-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="mr-1.5">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div className="w-full max-w-[1400px] flex flex-wrap items-center justify-between gap-4 mb-10 px-1">
        <p className="text-sm text-slate-400">
          <span className="text-white font-semibold">{results.length}</span>{' '}
          {results.length === 1 ? 'stay' : 'stays'}
          {datesChosen && ` available for ${plural(nights, 'night')}`}
          {applied.destination && ` in “${applied.destination}”`}
        </p>

        <div className="flex flex-wrap items-center gap-5">
          <label className="flex items-center gap-3 text-sm text-slate-400">
            Max {currency(maxPrice)}
            <input
              type="range"
              min="100"
              max="1000"
              step="25"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              aria-label="Maximum nightly price"
              className="w-36 accent-indigo-500"
            />
          </label>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort results"
            className="px-4 py-2.5 rounded-full bg-white/5 ring-1 ring-white/10 text-sm text-slate-200 outline-none focus:ring-indigo-500 transition"
          >
            {SORTS.map((option) => (
              <option key={option.id} value={option.id} className="bg-slate-900">
                {option.label}
              </option>
            ))}
          </select>

          {filtersActive && (
            <button
              type="button"
              onClick={resetAll}
              className="text-sm text-slate-300 underline underline-offset-4 hover:text-white"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {results.length > 0 ? (
        <div className="flex flex-wrap gap-12 justify-center max-w-[1400px]">
          {results.map((listing) => (
            <Card key={listing.id} listing={listing} nights={nights} query={cardQuery} />
          ))}
        </div>
      ) : (
        <div className="w-full max-w-md text-center py-20">
          <div className="text-5xl mb-5">🧭</div>
          <h2 className="text-2xl font-semibold text-white mb-3">No stays match that search</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Try widening your dates, raising the price ceiling, or removing the destination filter.
          </p>
          <button
            type="button"
            onClick={resetAll}
            className="px-6 py-3 rounded-full bg-white text-slate-900 font-semibold text-sm hover:bg-slate-200 transition-colors"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
