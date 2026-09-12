import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Lock, ShieldCheck } from 'lucide-react';
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

  const [form, setForm] = useState({
    guestName: '', guestEmail: '', guestPhone: '', card: '', expiry: '', cvc: '', note: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Prefill from the signed-in account once it is available.
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      guestName: f.guestName || user.name || '',
      guestEmail: f.guestEmail || user.email || '',
      guestPhone: f.guestPhone || user.phone || '',
    }));
  }, [user]);

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
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <Link
        to={`/hotels/${hotelId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" /> Back to {hotel.name}
      </Link>

      <h1 className="display mb-2 text-4xl text-white sm:text-5xl">Confirm and pay</h1>
      <p className="mb-10 text-slate-400">
        Step 2 of 2 — your card is not charged in this demo.
      </p>

      {available === false && (
        <div className="mb-8 rounded-2xl bg-rose-500/10 px-5 py-4 text-sm text-rose-200 ring-1 ring-rose-400/20">
          These dates were taken while you were deciding. Pick another range before paying.
        </div>
      )}

      <div className="grid items-start gap-10 lg:grid-cols-[1fr_380px]">
        <form onSubmit={submit} noValidate>
          <section className="border-b border-white/8 pb-8">
            <h2 className="display mb-5 text-2xl text-white">Your stay</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ['Check-in', formatDate(checkIn, { weekday: 'short', month: 'short', day: 'numeric' }), hotel.policies.checkIn],
                ['Check-out', formatDate(checkOut, { weekday: 'short', month: 'short', day: 'numeric' }), hotel.policies.checkOut],
                ['Guests', plural(guests, 'guest'), `Room sleeps ${room.capacity}`],
              ].map(([label, value, hint]) => (
                <div key={label} className="surface rounded-2xl px-5 py-4">
                  <p className="mb-1 text-[11px] tracking-wider text-slate-500 uppercase">{label}</p>
                  <p className="text-sm font-medium text-white">{value}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border-b border-white/8 py-8">
            <h2 className="display mb-5 text-2xl text-white">Guest details</h2>
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
                hint="Your confirmation goes here."
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
                label="Note for the hotel (optional)"
                rows={2}
                placeholder="Arriving late, around 11pm"
                value={form.note}
                onChange={set('note')}
                className="sm:col-span-2"
              />
            </div>
          </section>

          <section className="py-8">
            <h2 className="display mb-1 flex items-center gap-2 text-2xl text-white">
              <CreditCard className="size-5 text-brand-300" /> Payment
            </h2>
            <p className="mb-5 flex items-center gap-1.5 text-xs text-slate-500">
              <Lock className="size-3" />
              Demo checkout — no card is charged and no card number leaves your browser.
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

            <Button
              type="submit"
              size="lg"
              loading={submitting}
              disabled={available === false}
              className="mt-8 w-full sm:w-auto"
            >
              {submitting ? 'Confirming…' : `Confirm and pay ${currency(quote?.total || 0)}`}
            </Button>
          </section>
        </form>

        <aside className="lg:sticky lg:top-24">
          <Panel className="overflow-hidden">
            <div className="flex gap-4 p-5">
              <img
                src={hotel.images[0]}
                alt={hotel.name}
                className="size-24 shrink-0 rounded-2xl object-cover ring-1 ring-white/10"
              />
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{hotel.name}</p>
                <p className="truncate text-sm text-slate-400">{hotel.city}, {hotel.country}</p>
                <p className="mt-1.5 truncate text-xs text-slate-500">{room.name}</p>
                <Badge tone="gold" className="mt-2">{hotel.starRating}-star</Badge>
              </div>
            </div>

            {quote && (
              <>
                <div className="space-y-2.5 border-t border-white/8 px-5 py-5 text-sm">
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
                </div>

                <div className="flex justify-between border-t border-white/8 px-5 py-5 text-lg font-semibold text-white">
                  <span>Total</span>
                  <span>{currency(quote.total)}</span>
                </div>
              </>
            )}

            <p className="flex items-start gap-2 border-t border-white/8 px-5 py-4 text-xs leading-relaxed text-slate-500">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
              {hotel.policies.cancellation} The total is calculated on the server, so it cannot be
              altered from this page.
            </p>
          </Panel>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
