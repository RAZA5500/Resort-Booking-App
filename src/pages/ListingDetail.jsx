import { useState } from 'react';
import { Link } from '../lib/router';
import { useRouter } from '../lib/routing';
import { getListing, REVIEWS } from '../data/listings';
import { useBooking } from '../context/bookingStore';
import DateRangePicker from '../components/DateRangePicker';
import Rating, { Stars } from '../components/Rating';
import NotFound from './NotFound';
import { nightsBetween } from '../lib/dates';
import { currency, plural, priceBreakdown } from '../lib/format';

const AMENITY_ICONS = {
  Wifi: '📶', Kitchen: '🍳', Pool: '🏊', 'Air conditioning': '❄️', 'Free parking': '🅿️',
  'Sea view': '🌅', Fireplace: '🔥', Heating: '🌡️', 'Ski storage': '🎿', 'Hot tub': '♨️',
  Breakfast: '🥐', 'Outdoor shower': '🚿', Workspace: '💻', Washer: '🧺', Gym: '🏋️',
  Elevator: '🛗', Kayak: '🛶', 'Snorkel gear': '🤿', Beachfront: '🏖️', Dinner: '🍽️',
  'Hot water': '🚰', 'Airport shuttle': '🚐', Terrace: '🌇', 'Lake view': '🏞️',
  'Pets allowed': '🐾', Sauna: '🧖',
};

const Gallery = ({ images, title }) => {
  const [active, setActive] = useState(0);
  const step = (delta) => setActive((i) => (i + delta + images.length) % images.length);

  return (
    <div>
      <div className="relative rounded-3xl overflow-hidden aspect-[16/10] bg-slate-900 ring-1 ring-white/10">
        <img src={images[active]} alt={`${title} — photo ${active + 1}`} className="w-full h-full object-cover" />
        <button
          type="button"
          aria-label="Previous photo"
          onClick={() => step(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white ring-1 ring-white/20 hover:bg-black/70 transition-colors"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Next photo"
          onClick={() => step(1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white ring-1 ring-white/20 hover:bg-black/70 transition-colors"
        >
          ›
        </button>
        <span className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-xs text-white ring-1 ring-white/15">
          {active + 1} / {images.length}
        </span>
      </div>

      <div className="flex gap-3 mt-3">
        {images.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Show photo ${index + 1}`}
            className={`flex-1 aspect-[4/3] rounded-xl overflow-hidden ring-1 transition-all ${
              index === active ? 'ring-indigo-400 opacity-100' : 'ring-white/10 opacity-60 hover:opacity-100'
            }`}
          >
            <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

const BookingPanel = ({ listing }) => {
  const { navigate, query } = useRouter();
  const { blockedRanges, isRangeAvailable, toast } = useBooking();

  const [range, setRange] = useState({
    checkIn: query.checkIn || null,
    checkOut: query.checkOut || null,
  });
  const [guests, setGuests] = useState(() => {
    const requested = Number(query.guests) || 2;
    return Math.min(Math.max(requested, 1), listing.guests);
  });

  const nights = nightsBetween(range.checkIn, range.checkOut);
  const bill = priceBreakdown(listing.price, nights);
  const complete = Boolean(range.checkIn && range.checkOut);
  const available = complete && isRangeAvailable(listing.id, range.checkIn, range.checkOut);

  const reserve = () => {
    if (!complete) {
      toast('Choose your check-in and check-out dates first.', 'error');
      return;
    }
    if (!available) {
      toast('Those dates are no longer available for this stay.', 'error');
      return;
    }
    navigate(`/checkout/${listing.id}`, {
      checkIn: range.checkIn,
      checkOut: range.checkOut,
      guests: String(guests),
    });
  };

  return (
    <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
      <div className="flex items-baseline justify-between mb-5">
        <p className="text-2xl font-semibold text-white">
          {currency(listing.price)}
          <span className="text-sm font-normal text-slate-400"> / night</span>
        </p>
        <Rating value={listing.rating} reviews={listing.reviews} />
      </div>

      <DateRangePicker
        value={range}
        onChange={setRange}
        blocked={blockedRanges(listing.id)}
        months={1}
      />

      <div className="flex items-center justify-between py-4 mt-4 border-t border-white/10">
        <div>
          <p className="text-sm text-white font-medium">Guests</p>
          <p className="text-xs text-slate-500">This place sleeps {listing.guests}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Fewer guests"
            disabled={guests <= 1}
            onClick={() => setGuests(guests - 1)}
            className="w-8 h-8 rounded-full border border-white/15 text-slate-200 hover:border-white disabled:opacity-25 transition-colors"
          >
            −
          </button>
          <span className="w-5 text-center text-sm text-white tabular-nums">{guests}</span>
          <button
            type="button"
            aria-label="More guests"
            disabled={guests >= listing.guests}
            onClick={() => setGuests(guests + 1)}
            className="w-8 h-8 rounded-full border border-white/15 text-slate-200 hover:border-white disabled:opacity-25 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {complete && !available && (
        <p className="mb-4 px-4 py-3 rounded-xl bg-rose-500/10 ring-1 ring-rose-400/20 text-sm text-rose-200">
          Those dates overlap a stay that is already booked. Pick a different range.
        </p>
      )}

      {nights > 0 && available && (
        <div className="space-y-2.5 text-sm mb-5 pb-5 border-b border-white/10">
          <div className="flex justify-between text-slate-300">
            <span className="underline underline-offset-4 decoration-slate-600">
              {currency(listing.price)} × {plural(nights, 'night')}
            </span>
            <span>{currency(bill.stay)}</span>
          </div>
          {bill.discount > 0 && (
            <div className="flex justify-between text-emerald-300">
              <span>Weekly stay discount</span>
              <span>−{currency(bill.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-300">
            <span>Cleaning fee</span>
            <span>{currency(bill.cleaning)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Service fee</span>
            <span>{currency(bill.service)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Taxes</span>
            <span>{currency(bill.taxes)}</span>
          </div>
        </div>
      )}

      {nights > 0 && available && (
        <div className="flex justify-between text-white font-semibold mb-5">
          <span>Total</span>
          <span>{currency(bill.total)}</span>
        </div>
      )}

      <button
        type="button"
        onClick={reserve}
        className="w-full py-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold hover:shadow-[0_0_28px_rgba(99,102,241,0.45)] transition-shadow disabled:opacity-50"
      >
        {listing.instantBook ? 'Reserve now' : 'Request to book'}
      </button>
      <p className="text-center text-xs text-slate-500 mt-3">
        You will not be charged yet — review everything on the next step.
      </p>
    </div>
  );
};

const ListingDetail = ({ id }) => {
  const listing = getListing(id);
  const { isFavorite, toggleFavorite } = useBooking();

  if (!listing) return <NotFound message="We could not find that stay." />;

  const saved = isFavorite(listing.id);

  return (
    <div className="relative z-10 container mx-auto px-6 pt-8 pb-24 max-w-[1200px]">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
        ← Back to all stays
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
            {listing.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
            <Rating value={listing.rating} reviews={`${listing.reviews} reviews`} />
            <span>📍 {listing.location}, {listing.country}</span>
            {listing.host.superhost && (
              <span className="px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-300 text-xs ring-1 ring-amber-400/20">
                🏆 Superhost
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => toggleFavorite(listing.id)}
          className="px-5 py-2.5 rounded-full bg-white/5 ring-1 ring-white/10 text-sm text-white hover:bg-white/10 transition-colors"
        >
          <span className={saved ? 'text-rose-400' : ''}>{saved ? '♥' : '♡'}</span>{' '}
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>

      <Gallery images={listing.images} title={listing.title} />

      <div className="grid lg:grid-cols-[1fr_400px] gap-12 mt-12 items-start">
        <div>
          <div className="flex items-center gap-4 pb-8 border-b border-white/10">
            <span className="w-14 h-14 rounded-full bg-white/10 ring-1 ring-white/10 grid place-items-center text-2xl">
              {listing.host.avatar}
            </span>
            <div>
              <p className="text-lg text-white font-semibold">Hosted by {listing.host.name}</p>
              <p className="text-sm text-slate-400">
                Hosting since {listing.host.joined} · {listing.bedrooms} bedrooms ·{' '}
                {plural(listing.beds, 'bed')} · {plural(listing.baths, 'bath')} · up to{' '}
                {plural(listing.guests, 'guest')}
              </p>
            </div>
          </div>

          <div className="py-8 border-b border-white/10">
            <p className="text-slate-300 leading-relaxed text-[15px]">{listing.description}</p>
            <div className="flex flex-wrap gap-2.5 mt-6">
              {listing.highlights.map((item) => (
                <span
                  key={item}
                  className="px-4 py-2 rounded-full bg-white/5 ring-1 ring-white/10 text-sm text-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="py-8 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white mb-5">What this place offers</h2>
            <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
              {listing.amenities.map((item) => (
                <div key={item} className="flex items-center gap-3 text-slate-300 text-[15px]">
                  <span className="text-lg">{AMENITY_ICONS[item] || '•'}</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="py-8">
            <h2 className="text-xl font-semibold text-white mb-6">
              ★ {listing.rating.toFixed(1)} · {listing.reviews} reviews
            </h2>
            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8">
              {REVIEWS.map((review) => (
                <div key={review.name}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-10 h-10 rounded-full bg-white/10 grid place-items-center text-lg">
                      {review.avatar}
                    </span>
                    <div>
                      <p className="text-white text-sm font-medium">{review.name}</p>
                      <p className="text-xs text-slate-500">{review.date}</p>
                    </div>
                  </div>
                  <div className="text-amber-300 mb-1.5">
                    <Stars value={review.rating} />
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24">
          <BookingPanel listing={listing} />
          <p className="text-center text-xs text-slate-600 mt-4">
            Free cancellation up to 48 hours before check-in.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
