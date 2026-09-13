import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, CreditCard, Lock, ShieldCheck, Sparkles, UserCheck, Users } from 'lucide-react';
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
  const setForm = (next) => setEdits({ ...edits, ...next });

  const valid = Boolean(hotelId && roomId && checkIn && checkOut && checkIn < checkOut);

  const { data: hotelData, loading, error, refetch } = useApi(
    () => hotelApi.get(hotelId),
    [hotelId],
    { skip: !valid }
  );

  const { data: quoteData } = useApi(
    () => bookingApi.quote({ hotelId, roomId, checkIn, checkOut }),
    [hotelId, roomId, checkIn, checkOut],
    { skip: !valid }
  );

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

  const set = (field) => (event) => setForm({ ...form, [field]: event.target.value });

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
        className="group mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-1" />
        Back to {hotel.name}
      </Link>

      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2.5">
            <span className="font-label rounded-full bg-brand-500/15 px-3 py-1 text-[11px] font-semibold tracking-wider text-brand-300 uppercase ring-1 ring-brand-400/30">
              Step 2 of 2
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="size-3.5 text-emerald-400" /> Instant confirmation
            </span>
          </div>
          <h1 className="display text-4xl text-white sm:text-5xl">Confirm and pay</h1>
          <p className="mt-1 text-slate-400">
            Review your stay details and finalize your reservation.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-white/4 px-3.5 py-2 text-xs text-slate-400 ring-1 ring-white/8 backdrop-blur-md">
          <Lock className="size-3.5 text-brand-300" />
          <span>Demo mode — no charges will be applied</span>
        </div>
      </div>

      {available === false && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 rounded-2xl bg-rose-500/10 p-5 text-sm text-rose-200 ring-1 ring-rose-400/30 backdrop-blur-md"
        >
          <div className="flex items-center gap-2 font-medium text-rose-300">
            <span>Dates no longer available</span>
          </div>
          <p className="mt-1 text-rose-200/80">
            These dates were taken while you were deciding. Pick another range before paying.
          </p>
        </motion.div>
      )}

      <div className="grid items-start gap-10 lg:grid-cols-[1fr_380px]">
        <form onSubmit={submit} noValidate className="space-y-8">
          <section className="rounded-3xl border border-white/8 bg-white/[0.02] p-6 backdrop-blur-xl sm:p-8">
            <h2 className="display mb-5 flex items-center gap-2.5 text-2xl text-white">
              <Calendar className="size-5 text-brand-400" /> Your stay
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: 'Check-in',
                  value: formatDate(checkIn, { weekday: 'short', month: 'short', day: 'numeric' }),
                  hint: hotel.policies.checkIn,
                },
                {
                  label: 'Check-out',
                  value: formatDate(checkOut, { weekday: 'short', month: 'short', day: 'numeric' }),
                  hint: hotel.policies.checkOut,
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
                  <p className="font-label mb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-white">{item.value}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.hint}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/8 bg-white/[0.02] p-6 backdrop-blur-xl sm:p-8">
            <h2 className="display mb-1 flex items-center gap-2.5 text-2xl text-white">
              <UserCheck className="size-5 text-brand-400" /> Guest details
            </h2>
            <p className="mb-6 text-xs text-slate-400">
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

          <section className="relative overflow-hidden rounded-3xl border border-white/8 bg-white/[0.02] p-6 backdrop-blur-xl sm:p-8">
            <div className="pointer-events-none absolute -right-20 -top-20 size-48 rounded-full bg-brand-500/10 blur-3xl" />
            <div className="relative">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="display flex items-center gap-2.5 text-2xl text-white">
                  <CreditCard className="size-5 text-brand-400" /> Payment
                </h2>
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-500/20">
                  <Lock className="size-3" /> End-to-end encrypted
                </div>
              </div>
              <p className="mb-6 text-xs text-slate-400">
                Demo sandbox — test with 4242 4242 4242 4242, any future expiry, and any 3-digit CVC.
              </p>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Card number"
                  inputMode="numeric"
                  placeholder="4242 4242 4242 4242"
                  className="sm:col-span-2"
                  value={form.card}
                  onChange={(e) => setForm({ ...form, card: formatCard(e.target.value) })}
                  error={errors.card}
                />
                <Field
                  label="Expiry"
                  inputMode="numeric"
                  placeholder="MM/YY"
                  value={form.expiry}
                  onChange={(e) => setForm({ ...form, expiry: formatExpiry(e.target.value) })}
                  error={errors.expiry}
                />
                <Field
                  label="CVC"
                  inputMode="numeric"
                  placeholder="123"
                  value={form.cvc}
                  onChange={(e) => setForm({ ...form, cvc: digits(e.target.value).slice(0, 4) })}
                  error={errors.cvc}
                />
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button
                  type="submit"
                  size="lg"
                  loading={submitting}
                  disabled={available === false}
                  className="w-full sm:w-auto"
                >
                  {submitting ? 'Confirming…' : `Confirm and pay ${currency(quote?.total || 0)}`}
                </Button>
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Sparkles className="size-3.5 text-gold-400" /> Free cancellation up to 48 hours prior
                </span>
              </div>
            </div>
          </section>
        </form>

        <aside className="lg:sticky lg:top-24">
          <Panel className="surface-elevated overflow-hidden border-white/10 shadow-2xl shadow-ink-950/60">
            <div className="relative flex gap-4 p-5">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10">
                <img
                  src={hotel.images[0]}
                  alt={hotel.name}
                  className="size-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{hotel.name}</p>
                <p className="truncate text-sm text-slate-400">{hotel.city}, {hotel.country}</p>
                <p className="mt-1 truncate text-xs text-brand-300 font-medium">{room.name}</p>
                <Badge tone="gold" className="mt-2.5">{hotel.starRating}-star property</Badge>
              </div>
            </div>

            {quote && (
              <>
                <div className="space-y-2.5 border-t border-white/8 bg-white/[0.015] px-5 py-5 text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>{currency(quote.nightlyRate)} × {plural(quote.nights, 'night')}</span>
                    <span className="font-medium text-white">{currency(quote.roomTotal)}</span>
                  </div>
                  {quote.discount > 0 && (
                    <div className="flex justify-between font-medium text-emerald-300">
                      <span className="flex items-center gap-1">
                        <Sparkles className="size-3 text-emerald-400" /> Weekly stay discount
                      </span>
                      <span>−{currency(quote.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400">
                    <span>Cleaning fee</span>
                    <span>{currency(quote.cleaning)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Service fee</span>
                    <span>{currency(quote.service)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Estimated taxes</span>
                    <span>{currency(quote.tax)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/8 bg-white/[0.03] px-5 py-4">
                  <div>
                    <span className="text-base font-semibold text-white">Total due</span>
                    <p className="text-[11px] text-slate-400">Includes all taxes and fees</p>
                  </div>
                  <span className="text-2xl font-bold text-gradient">
                    {currency(quote.total)}
                  </span>
                </div>
              </>
            )}

            <div className="flex items-start gap-2.5 border-t border-white/8 bg-white/[0.01] px-5 py-4 text-xs leading-relaxed text-slate-400">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-400" />
              <span>
                {hotel.policies.cancellation} Total is verified by secure server calculation.
              </span>
            </div>
          </Panel>
        </aside>
      </div>
    </motion.div>
  );
};

export default Checkout;
