import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, BedDouble, Check, Heart, MapPin, Maximize, ShieldCheck, Users,
} from 'lucide-react';
import { Gallery } from '../components/hotels/Gallery';
import { DateRangePicker } from '../components/search/DateRangePicker';
import { Button, IconButton } from '../components/ui/Button';
import { Badge, Rating, Stars } from '../components/ui/Badge';
import { Panel } from '../components/ui/Surface';
import { ErrorState, PageLoader } from '../components/ui/Feedback';
import { useApi } from '../hooks/useApi';
import { bookings as bookingApi, hotels as hotelApi } from '../api/endpoints';
import { useAuth } from '../context/auth-context';
import { useToast } from '../context/toast-context';
import { CATEGORY_META } from '../lib/constants';
import { currency, formatDate, nightsBetween, plural } from '../lib/format';

const AMENITY_NOTE = 'Included with every room type unless stated otherwise.';

const RoomOption = ({ room, selected, onSelect, nights }) => {
  const disabled = !room.fitsGuests || (room.unitsLeft === 0 && room.available === false);

  return (
    <button
      type="button"
      onClick={() => onSelect(room.id)}
      disabled={disabled}
      className={`w-full rounded-2xl p-5 text-left ring-1 transition-all ${
        selected
          ? 'bg-brand-500/12 ring-brand-400/40'
          : 'bg-white/4 ring-white/8 hover:bg-white/8'
      } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-1 font-semibold text-white">{room.name}</p>
          <p className="mb-3 text-[13px] leading-relaxed text-slate-400">{room.description}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Users className="size-3.5" /> Sleeps {room.capacity}
            </span>
            <span className="flex items-center gap-1.5">
              <BedDouble className="size-3.5" /> {room.beds}
            </span>
            <span className="flex items-center gap-1.5">
              <Maximize className="size-3.5" /> {room.sizeSqm} m²
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-lg font-semibold text-white">{currency(room.price)}</p>
          <p className="text-xs text-slate-500">per night</p>
          {nights > 0 && (
            <p className="mt-1 text-xs text-brand-300">{currency(room.price * nights)} total</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!room.fitsGuests ? (
          <Badge tone="rose">Too small for your party</Badge>
        ) : room.unitsLeft === 0 ? (
          <Badge tone="rose">Sold out for these dates</Badge>
        ) : room.unitsLeft <= 3 ? (
          <Badge tone="amber">Only {room.unitsLeft} left</Badge>
        ) : (
          <Badge tone="emerald">Available</Badge>
        )}
        {selected && <Badge tone="indigo">Selected</Badge>}
      </div>
    </button>
  );
};

const BookingPanel = ({ hotel, unavailableDates, roomId }) => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [range, setRange] = useState({
    checkIn: params.get('checkIn') || null,
    checkOut: params.get('checkOut') || null,
  });
  const [guests, setGuests] = useState(Math.max(Number(params.get('guests')) || 2, 1));

  const complete = Boolean(range.checkIn && range.checkOut);

  // Re-check availability against the server whenever the dates or party change.
  const { data: availability } = useApi(
    () => hotelApi.availability(hotel.id, { ...range, guests }),
    [hotel.id, range.checkIn, range.checkOut, guests],
    { skip: !complete }
  );

  const rooms = availability?.rooms || hotel.rooms;
  const bookable = rooms.filter((r) => (complete ? r.available : r.capacity >= guests));

  // `roomId` only ever holds an explicit choice. The effective room falls back
  // to the cheapest bookable one, so changing the dates or party size
  // re-resolves the selection without an effect.
  const chosen = bookable.find((r) => r.id === roomId);
  const room = chosen || [...bookable].sort((a, b) => a.price - b.price)[0] || null;

  const { data: quoteData } = useApi(
    () => bookingApi.quote({ hotelId: hotel.id, roomId: room.id, ...range }),
    [hotel.id, room?.id, range.checkIn, range.checkOut],
    { skip: !complete || !room }
  );
  const quote = quoteData?.quote;

  const reserve = () => {
    if (!complete) return toast.error('Choose your check-in and check-out dates first.');
    if (!room) return toast.error('No room type fits that party on those dates.');

    const search = new URLSearchParams({
      hotelId: hotel.id,
      roomId: room.id,
      checkIn: range.checkIn,
      checkOut: range.checkOut,
      guests: String(guests),
    });

    if (!isAuthenticated) {
      toast.info('Sign in to finish your booking — we kept your dates.');
      return navigate(`/login?next=${encodeURIComponent(`/checkout?${search}`)}`);
    }
    return navigate(`/checkout?${search}`);
  };

  return (
    <Panel className="p-6">
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <p className="text-2xl font-semibold text-white">
          {currency(room?.price || hotel.basePrice)}
          <span className="text-sm font-normal text-slate-500"> / night</span>
        </p>
        <Rating value={hotel.rating} count={hotel.reviewsCount} />
      </div>

      <DateRangePicker
        value={range}
        onChange={setRange}
        blockedDates={unavailableDates}
        months={1}
      />

      <div className="mt-4 flex items-center justify-between border-t border-white/8 py-4">
        <div>
          <p className="text-sm font-medium text-white">Guests</p>
          <p className="text-xs text-slate-500">Largest room sleeps 4</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Fewer guests"
            disabled={guests <= 1}
            onClick={() => setGuests(guests - 1)}
            className="grid size-8 place-items-center rounded-full text-slate-200 ring-1 ring-white/15 transition-colors hover:ring-white disabled:opacity-25"
          >
            −
          </button>
          <span className="w-5 text-center text-sm text-white tabular-nums">{guests}</span>
          <button
            type="button"
            aria-label="More guests"
            disabled={guests >= 8}
            onClick={() => setGuests(guests + 1)}
            className="grid size-8 place-items-center rounded-full text-slate-200 ring-1 ring-white/15 transition-colors hover:ring-white disabled:opacity-25"
          >
            +
          </button>
        </div>
      </div>

      {complete && bookable.length === 0 && (
        <p className="mb-4 rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200 ring-1 ring-rose-400/20">
          Nothing is free for {plural(guests, 'guest')} on those dates. Try another range.
        </p>
      )}

      {room && complete && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-white/4 px-4 py-3 ring-1 ring-white/8">
          <div className="min-w-0">
            <p className="text-xs text-slate-500">
              {chosen ? 'Selected room' : 'Best available room'}
            </p>
            <p className="truncate text-sm font-medium text-white">{room.name}</p>
          </div>
          {bookable.length > 1 && (
            <a href="#rooms" className="shrink-0 text-xs text-brand-300 hover:text-brand-200">
              Change
            </a>
          )}
        </div>
      )}

      {quote && quote.nights > 0 && (
        <div className="mb-5 space-y-2.5 border-t border-white/8 pt-5 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>{currency(quote.nightlyRate)} × {plural(quote.nights, 'night')}</span>
            <span>{currency(quote.roomTotal)}</span>
          </div>
          {quote.discount > 0 && (
            <div className="flex justify-between text-emerald-300">
              <span>Weekly stay discount</span>
              <span>−{currency(quote.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-300">
            <span>Cleaning fee</span>
            <span>{currency(quote.cleaning)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Service fee</span>
            <span>{currency(quote.service)}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Taxes</span>
            <span>{currency(quote.tax)}</span>
          </div>
          <div className="flex justify-between border-t border-white/8 pt-3 text-base font-semibold text-white">
            <span>Total</span>
            <span>{currency(quote.total)}</span>
          </div>
        </div>
      )}

      <Button className="w-full" size="lg" onClick={reserve} disabled={complete && !room}>
        {complete ? 'Reserve' : 'Choose dates'}
      </Button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
        <ShieldCheck className="size-3.5" />
        Free cancellation up to 48 hours before check-in
      </p>
    </Panel>
  );
};

const HotelDetail = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { isAuthenticated, isSaved, toggleSaved } = useAuth();
  const toast = useToast();

  const { data, loading, error, refetch } = useApi(
    () =>
      hotelApi.get(id, {
        checkIn: params.get('checkIn') || '',
        checkOut: params.get('checkOut') || '',
        guests: params.get('guests') || 1,
      }),
    [id]
  );

  const hotel = data?.hotel;
  const reviews = data?.reviews || [];
  const summary = data?.reviewSummary;

  const nights = nightsBetween(params.get('checkIn'), params.get('checkOut'));
  const saved = hotel ? isSaved(hotel.id) : false;

  const roomsForList = useMemo(() => hotel?.rooms || [], [hotel]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  if (loading) return <PageLoader label="Loading hotel" />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!hotel) return null;

  const onSave = async () => {
    if (!isAuthenticated) return toast.info('Sign in to save hotels.');
    try {
      const nowSaved = await toggleSaved(hotel.id);
      toast.success(nowSaved ? 'Saved to your list.' : 'Removed from your list.');
    } catch {
      toast.error('Could not update your saved list.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <Link
        to="/hotels"
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" /> All hotels
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge tone="indigo">
              {CATEGORY_META[hotel.category]?.label || hotel.category}
            </Badge>
            <Badge tone="gold">{hotel.starRating}-star</Badge>
            {hotel.featured && <Badge tone="emerald">Editor’s pick</Badge>}
          </div>

          <h1 className="display mb-3 text-4xl leading-tight text-white sm:text-5xl">
            {hotel.name}
          </h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400">
            <Rating value={summary?.average ?? hotel.rating} count={hotel.reviewsCount} />
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-brand-300" />
              {hotel.city}, {hotel.country}
            </span>
            <span>{hotel.continent}</span>
          </div>
        </div>

        <IconButton
          icon={Heart}
          label={saved ? 'Remove from saved' : 'Save hotel'}
          active={saved}
          onClick={onSave}
          className={saved ? '' : 'bg-white/5'}
        />
      </div>

      <Gallery images={hotel.images} name={hotel.name} />

      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1fr_384px]">
        <div className="min-w-0">
          <section className="border-b border-white/8 pb-8">
            <p className="text-[15px] leading-relaxed text-slate-300">{hotel.description}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {hotel.highlights.map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-slate-200 ring-1 ring-white/8"
                >
                  <Check className="size-3.5 text-emerald-400" strokeWidth={2.5} />
                  {item}
                </span>
              ))}
            </div>
          </section>

          <section id="rooms" className="border-b border-white/8 py-8 scroll-mt-24">
            <h2 className="display mb-1 text-2xl text-white">Rooms &amp; suites</h2>
            <p className="mb-5 text-sm text-slate-500">
              {nights > 0
                ? `Prices shown for ${plural(nights, 'night')}.`
                : 'Pick dates to see live availability.'}
            </p>
            <div className="space-y-3">
              {roomsForList.map((room) => (
                <RoomOption
                  key={room.id}
                  room={room}
                  nights={nights}
                  selected={selectedRoom === room.id}
                  onSelect={setSelectedRoom}
                />
              ))}
            </div>
          </section>

          <section className="border-b border-white/8 py-8">
            <h2 className="display mb-1 text-2xl text-white">What this hotel offers</h2>
            <p className="mb-5 text-sm text-slate-500">{AMENITY_NOTE}</p>
            <div className="grid gap-y-3 sm:grid-cols-2">
              {hotel.amenities.map((item) => (
                <div key={item} className="flex items-center gap-3 text-[15px] text-slate-300">
                  <Check className="size-4 shrink-0 text-brand-400" strokeWidth={2.4} />
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="border-b border-white/8 py-8">
            <h2 className="display mb-5 text-2xl text-white">
              Guest reviews
              {summary?.count ? ` · ${summary.average.toFixed(1)} from ${summary.count}` : ''}
            </h2>

            {reviews.length === 0 ? (
              <p className="text-sm text-slate-500">
                No guest reviews yet for this property. Reviews can only be left after a completed
                stay.
              </p>
            ) : (
              <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
                {reviews.slice(0, 6).map((review) => (
                  <article key={review.id}>
                    <div className="mb-2 flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-[11px] font-semibold text-white">
                        {review.userName.split(' ').map((n) => n[0]).join('')}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-white">{review.userName}</p>
                        <p className="text-xs text-slate-500">
                          {formatDate(review.createdAt.slice(0, 10), { month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <Stars value={review.rating} size="size-3" />
                    <p className="mt-2 mb-1 text-sm font-medium text-white">{review.title}</p>
                    <p className="text-sm leading-relaxed text-slate-400">{review.comment}</p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="py-8">
            <h2 className="display mb-5 text-2xl text-white">Good to know</h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                ['Check-in', hotel.policies.checkIn],
                ['Check-out', hotel.policies.checkOut],
                ['Cancellation', hotel.policies.cancellation],
                ['Children', hotel.policies.children],
              ].map(([label, value]) => (
                <div key={label} className="surface rounded-2xl p-4">
                  <dt className="mb-1 text-xs tracking-wider text-slate-500 uppercase">{label}</dt>
                  <dd className="text-sm text-slate-200">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <div className="lg:sticky lg:top-24">
          <BookingPanel
            hotel={hotel}
            unavailableDates={data.unavailableDates || []}
            roomId={selectedRoom}
          />
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;
