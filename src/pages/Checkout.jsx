import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, CreditCard, Lock, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Field, TextArea } from '../components/ui/Field';
import { Panel } from '../components/ui/Surface';
import { Badge } from '../components/ui/Badge';
import { EmptyState, ErrorState, PageLoader } from '../components/ui/Feedback';
import { useApi } from '../hooks/useApi';
import { bookings as bookingApi, hotels as hotelApi } from '../api/endpoints';
import { useAuth } from '../context/auth-context';
import { useToast } from '../context/toast-context';
import { currency, formatDate, plural } from '../lib/format';

const digits = (value) => value.replace(/\D/g, '');
const formatCard = (value) => digits(value).slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const formatExpiry = (value) => {
  const d = digits(value).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

const validate = (form) => {
  const errors = {};
  if (!form.guestName.trim()) errors.guestName = 'Who is the booking for?';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.guestEmail)) {
    errors.guestEmail = 'Enter a valid email address.';
  }
  if (form.guestPhone && digits(form.guestPhone).length < 7) {
    errors.guestPhone = 'That number looks too short.';
  }
  if (digits(form.card).length !== 16) errors.card = 'Card number must be 16 digits.';

  const [month, year] = form.expiry.split('/');
  if (!month || !year || year.length !== 2 || Number(month) < 1 || Number(month) > 12) {
    errors.expiry = 'Use MM/YY.';
  } else if (new Date(2000 + Number(year), Number(month), 0, 23, 59) < new Date()) {
    errors.expiry = 'That card has expired.';
  }

  if (digits(form.cvc).length < 3) errors.cvc = '3 digits.';
  return errors;
};

const Checkout = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const hotelId = params.get('hotelId');
  const roomId = params.get('roomId');
  const checkIn = params.get('checkIn');
  const checkOut = params.get('checkOut');
  const guests = Number(params.get('guests')) || 1;

  // Guest fields start undefined and fall back to the signed-in account, so the
  // form is prefilled without an effect and an explicit '' still wins.
  const [edits, setEdits] = useState({ card: '', expiry: '', cvc: '', note: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const form = {
    ...edits,
    guestName: edits.guestName ?? user?.name ?? '',
    guestEmail: edits.guestEmail ?? user?.email ?? '',
    guestPhone: edits.guestPhone ?? user?.phone ?? '',
  };

  const valid = Boolean(hotelId && roomId && checkIn && checkOut && checkIn < checkOut);

  const { data: hotelData, loading: hotelLoading, error: hotelError, refetch: refetchHotel } = useApi(
    () => hotelApi.get(hotelId),
    [hotelId],
    { skip: !valid }
  );

  const { data: quoteData, loading: quoteLoading, error: quoteError, refetch: refetchQuote } = useApi(
    () => bookingApi.quote({ hotelId, roomId, checkIn, checkOut }),
    [hotelId, roomId, checkIn, checkOut],
    { skip: !valid }
  );

  const loading = hotelLoading || quoteLoading;
  const error = hotelError || quoteError;
  const refetch = () => {
    refetchHotel();
    refetchQuote();
  };

  if (!valid) {
    return (
      <EmptyState
        title="This checkout link is incomplete"
        message="Pick a hotel, your dates and a room type first — then the checkout has everything it needs."
        action={<Button to="/hotels">Browse hotels</Button>}
      />
    );
  }

  if (loading) return <PageLoader label="Preparing your booking" />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const hotel = hotelData?.hotel;
  const room = hotel?.rooms.find((r) => r.id === roomId);
  const quote = quoteData?.quote;
  const available = quoteData?.available;

  if (!hotel || !room) {
    return (
      <EmptyState
        title="That room is no longer listed"
        message="The hotel may have changed its inventory. Pick another room type to continue."
        action={<Button to={`/hotels/${hotelId}`}>Back to the hotel</Button>}
      />
    );
  }

  // `format` normalises the raw input (card grouping, MM/YY) before it is
  // stored. Writing only the touched field keeps the guest fields on their
  // account fallback until the guest actually edits one.
  const set = (field, format) => (event) => {
    const value = format ? format(event.target.value) : event.target.value;
    setEdits((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setSubmitting(true);
    try {
      const { booking } = await bookingApi.create({
        hotelId,
        roomId,
        checkIn,
        checkOut,
        guests,
        guestName: form.guestName.trim(),
        guestEmail: form.guestEmail.trim(),
        guestPhone: form.guestPhone.trim(),
        note: form.note.trim(),
        paymentLast4: digits(form.card).slice(-4),
      });
      toast.success('Booking confirmed. Your code is in My trips.');
      navigate(`/booking/${booking.id}`, { replace: true });
    } catch (err) {
      // The server re-checks availability, so a race here is reported honestly.
      setErrors(err.details || {});
      toast.error(err.message || 'We could not complete that booking.');
      if (err.status === 409) navigate(`/hotels/${hotelId}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-6xl px-5 py-8 sm:px-8"
    >
      <Link
        to={`/hotels/${hotelId}`}
        className="group mb-6 inline-flex items-center gap-2 text-sm text-ink-600 transition-colors hover:text-ink-900"
      >
        <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-1" />
        Back to {hotel.name}
      </Link>

      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2.5">
            <span className="font-label rounded-full bg-brand-500/15 px-3 py-1 text-[11px] font-semibold tracking-wider text-brand-600 uppercase ring-1 ring-brand-400/30">
              Step 2 of 2
            </span>
            <span className="flex items-center gap-1.5 text-xs text-ink-600">
              <ShieldCheck className="size-3.5 text-emerald-600" /> Instant confirmation
            </span>
          </div>
          <h1 className="display text-4xl text-ink-900 sm:text-5xl">Confirm and pay</h1>
          <p className="mt-1 text-ink-600">
            Review your stay details and finalize your reservation.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-ink-900/[0.04] px-3.5 py-2 text-xs text-ink-600 ring-1 ring-ink-900/10 backdrop-blur-md">
          <Lock className="size-3.5 text-brand-600" />
          <span>Demo mode — no charges will be applied</span>
        </div>
      </div>

      {available === false && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 rounded-2xl bg-rose-500/10 p-5 text-sm text-rose-700 ring-1 ring-rose-400/30 backdrop-blur-md"
        >
          <div className="flex items-center gap-2 font-medium text-rose-600">
            <span>Dates no longer available</span>
          </div>
          <p className="mt-1 text-rose-700/80">
            These dates were taken while you were deciding. Pick another range before paying.
          </p>
        </motion.div>
      )}

      <div className="grid items-start gap-10 lg:grid-cols-[1fr_380px]">
        <form onSubmit={submit} noValidate className="space-y-8">
          <section className="rounded-3xl border border-ink-900/10 bg-ink-900/[0.02] p-6 backdrop-blur-xl sm:p-8">
            <h2 className="display mb-5 flex items-center gap-2.5 text-2xl text-ink-900">
              <Calendar className="size-5 text-brand-600" /> Your stay
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: 'Check-in',
                  value: formatDate(checkIn, { weekday: 'short', month: 'short', day: 'numeric' }),
                  hint: hotel.policies?.checkIn || 'From 3:00 PM',
                },
                {
                  label: 'Check-out',
                  value: formatDate(checkOut, { weekday: 'short', month: 'short', day: 'numeric' }),
                  hint: hotel.policies?.checkOut || 'By 11:00 AM',
                },
                {
                  label: 'Guests',
                  value: plural(guests, 'guest'),
                  hint: `Room sleeps ${room.capacity}`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="surface-elevated rounded-2xl p-4 transition-all duration-300 hover:border-brand-400/30"
                >
                  <p className="font-label mb-1 text-[11px] font-semibold tracking-wider text-ink-600 uppercase">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-ink-900">{item.value}</p>
                  <p className="mt-1 text-xs text-ink-600">{item.hint}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-ink-900/10 bg-ink-900/[0.02] p-6 backdrop-blur-xl sm:p-8">
            <h2 className="display mb-1 flex items-center gap-2.5 text-2xl text-ink-900">
              <UserCheck className="size-5 text-brand-600" /> Guest details
            </h2>
            <p className="mb-6 text-xs text-ink-600">
              We'll send your booking confirmation and hotel check-in instructions here.
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Full name"
                placeholder="Ada Lovelace"
                autoComplete="name"
                value={form.guestName}
                onChange={set('guestName')}
                error={errors.guestName}
              />
              <Field
                label="Email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={form.guestEmail}
                onChange={set('guestEmail')}
                error={errors.guestEmail}
                hint="Your confirmation voucher goes here."
              />
              <Field
                label="Phone (optional)"
                placeholder="+1 555 0100"
                autoComplete="tel"
                value={form.guestPhone}
                onChange={set('guestPhone')}
                error={errors.guestPhone}
              />
              <TextArea
                label="Special requests (optional)"
                rows={3}
                placeholder="Arriving late around 11pm, quiet room preferred..."
                value={form.note}
                onChange={set('note')}
                className="sm:col-span-2"
              />
            </div>
          </section>

          <section className="relative overflow-hidden rounded-3xl border border-ink-900/10 bg-ink-900/[0.02] p-6 backdrop-blur-xl sm:p-8">
            <div className="pointer-events-none absolute -right-20 -top-20 size-48 rounded-full bg-brand-500/10 blur-3xl" />
            <div className="relative">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="display flex items-center gap-2.5 text-2xl text-ink-900">
                  <CreditCard className="size-5 text-brand-600" /> Payment
                </h2>
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-500/20">
                  <Lock className="size-3" /> End-to-end encrypted
                </div>
              </div>
              <p className="mb-6 text-xs text-ink-600">
                Demo sandbox — test with 4242 4242 4242 4242, any future expiry, and any 3-digit CVC.
              </p>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Card number"
                  inputMode="numeric"
                  placeholder="4242 4242 4242 4242"
                  className="sm:col-span-2"
                  value={form.card}
                  onChange={set('card', formatCard)}
                  error={errors.card}
                />
                <Field
                  label="Expiry"
                  inputMode="numeric"
                  placeholder="MM/YY"
                  value={form.expiry}
                  onChange={set('expiry', formatExpiry)}
                  error={errors.expiry}
                />
                <Field
                  label="CVC"
                  inputMode="numeric"
                  placeholder="123"
                  value={form.cvc}
                  onChange={set('cvc', (v) => digits(v).slice(0, 4))}
                  error={errors.cvc}
                />
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button
                  type="submit"
                  size="lg"
                  loading={submitting}
                  disabled={available === false || !quote}
                  className="w-full sm:w-auto"
                >
                  {submitting
                    ? 'Confirming…'
                    : quote
                      ? `Confirm and pay ${currency(quote.total)}`
                      : 'Confirm and pay'}
                </Button>
                <span className="flex items-center gap-1.5 text-xs text-ink-600">
                  <Sparkles className="size-3.5 text-gold-400" /> Free cancellation up to 48 hours prior
                </span>
              </div>
            </div>
          </section>
        </form>

        <aside className="lg:sticky lg:top-24">
          <Panel className="surface-elevated overflow-hidden border-ink-900/10 shadow-sm shadow-ink-900/5">
            <div className="relative flex gap-4 p-5">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl ring-1 ring-ink-900/10">
                <img
                  src={hotel.images[0]}
                  alt={hotel.name}
                  className="size-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink-900">{hotel.name}</p>
                <p className="truncate text-sm text-ink-600">{hotel.city}, {hotel.country}</p>
                <p className="mt-1 truncate text-xs text-brand-600 font-medium">{room.name}</p>
                <Badge tone="gold" className="mt-2.5">{hotel.starRating}-star property</Badge>
              </div>
            </div>

            {quote && (
              <>
                <div className="space-y-2.5 border-t border-ink-900/10 bg-ink-900/[0.02] px-5 py-5 text-sm">
                  <div className="flex justify-between text-ink-700">
                    <span>{currency(quote.nightlyRate)} × {plural(quote.nights, 'night')}</span>
                    <span className="font-medium text-ink-900">{currency(quote.roomTotal)}</span>
                  </div>
                  {quote.discount > 0 && (
                    <div className="flex justify-between font-medium text-emerald-700">
                      <span className="flex items-center gap-1">
                        <Sparkles className="size-3 text-emerald-600" /> Weekly stay discount
                      </span>
                      <span>−{currency(quote.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-ink-600">
                    <span>Cleaning fee</span>
                    <span>{currency(quote.cleaning)}</span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Service fee</span>
                    <span>{currency(quote.service)}</span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Estimated taxes</span>
                    <span>{currency(quote.tax)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-ink-900/10 bg-ink-900/[0.03] px-5 py-4">
                  <div>
                    <span className="text-base font-semibold text-ink-900">Total due</span>
                    <p className="text-[11px] text-ink-600">Includes all taxes and fees</p>
                  </div>
                  <span className="text-2xl font-bold text-gradient">
                    {currency(quote.total)}
                  </span>
                </div>
              </>
            )}

            <div className="flex items-start gap-2.5 border-t border-ink-900/10 bg-ink-900/[0.015] px-5 py-4 text-xs leading-relaxed text-ink-600">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <span>
                {hotel.policies?.cancellation || 'Free cancellation up to 48 hours prior.'} Total is verified by secure server calculation.
              </span>
            </div>
          </Panel>
        </aside>
      </div>
    </motion.div>
  );
};

export default Checkout;
