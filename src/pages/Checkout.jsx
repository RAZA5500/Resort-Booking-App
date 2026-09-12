import { useState } from 'react';
import { Link } from '../lib/router';
import { useRouter } from '../lib/routing';
import { getListing } from '../data/listings';
import { useBooking } from '../context/bookingStore';
import NotFound from './NotFound';
import { formatDate, nightsBetween } from '../lib/dates';
import { currency, plural, priceBreakdown } from '../lib/format';

const Input = ({ id, label, error, hint, ...props }) => (
  <label htmlFor={id} className="block">
    <span className="block text-sm text-slate-300 mb-2">{label}</span>
    <input
      id={id}
      {...props}
      aria-invalid={Boolean(error)}
      className={`w-full px-4 py-3 rounded-xl bg-white/5 ring-1 text-white placeholder:text-slate-600 outline-none transition ${
        error ? 'ring-rose-400/60 focus:ring-rose-400' : 'ring-white/10 focus:ring-indigo-500'
      }`}
    />
    {error ? (
      <span className="block text-xs text-rose-300 mt-1.5">{error}</span>
    ) : (
      hint && <span className="block text-xs text-slate-500 mt-1.5">{hint}</span>
    )}
  </label>
);

const digitsOnly = (value) => value.replace(/\D/g, '');

const formatCard = (value) => digitsOnly(value).slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

const formatExpiry = (value) => {
  const digits = digitsOnly(value).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

const validate = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Please enter the name on the booking.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) errors.email = 'Enter a valid email address.';
  if (form.phone && digitsOnly(form.phone).length < 7) errors.phone = 'That phone number looks too short.';
  if (digitsOnly(form.card).length !== 16) errors.card = 'Card number must be 16 digits.';

  const [month, year] = form.expiry.split('/');
  if (!month || !year || Number(month) < 1 || Number(month) > 12 || year.length !== 2) {
    errors.expiry = 'Use MM/YY.';
  } else {
    const now = new Date();
    const expires = new Date(2000 + Number(year), Number(month), 0, 23, 59);
    if (expires < now) errors.expiry = 'That card has expired.';
  }

  if (digitsOnly(form.cvc).length < 3) errors.cvc = '3 digits.';
  return errors;
};

const Checkout = ({ id }) => {
  const { query, navigate } = useRouter();
  const { addBooking, isRangeAvailable, toast } = useBooking();

  const listing = getListing(id);
  const checkIn = query.checkIn || null;
  const checkOut = query.checkOut || null;
  const guests = Number(query.guests) || 1;
  const nights = nightsBetween(checkIn, checkOut);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', card: '', expiry: '', cvc: '', note: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!listing) return <NotFound message="We could not find that stay." />;

  if (nights < 1) {
    return (
      <NotFound
        title="Dates missing"
        message="This checkout link has no valid dates. Pick your dates on the stay page first."
        action={{ to: `/listing/${listing.id}`, label: 'Choose dates' }}
      />
    );
  }

  const bill = priceBreakdown(listing.price, nights);
  const set = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const submit = (event) => {
    event.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast('Please fix the highlighted fields.', 'error');
      return;
    }

    // Someone may have taken these dates while this form was open.
    if (!isRangeAvailable(listing.id, checkIn, checkOut)) {
      toast('These dates were just booked. Please choose another range.', 'error');
      navigate(`/listing/${listing.id}`);
      return;
    }

    setSubmitting(true);
    // Stand-in for a payment round-trip so the button state is visible.
    setTimeout(() => {
      const booking = addBooking({
        listingId: listing.id,
        checkIn,
        checkOut,
        guests,
        nights,
        total: bill.total,
        guest: { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() },
        note: form.note.trim(),
        cardLast4: digitsOnly(form.card).slice(-4),
      });
      toast('Booking confirmed. Check your trips for the details.', 'success');
      navigate(`/confirmation/${booking.id}`);
    }, 900);
  };

  return (
    <div className="relative z-10 container mx-auto px-6 pt-8 pb-24 max-w-[1100px]">
      <Link
        to={`/listing/${listing.id}`}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors"
      >
        ← Back to {listing.title}
      </Link>

      <h1 className="text-4xl font-bold text-white tracking-tight mb-10">Confirm and pay</h1>

      <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
        <form onSubmit={submit} noValidate>
          <section className="pb-8 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white mb-5">Your trip</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="px-5 py-4 rounded-2xl bg-white/5 ring-1 ring-white/10">
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Dates</p>
                <p className="text-white text-sm">
                  {formatDate(checkIn, { month: 'short', day: 'numeric' })} →{' '}
                  {formatDate(checkOut, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-xs text-slate-400 mt-1">{plural(nights, 'night')}</p>
              </div>
              <div className="px-5 py-4 rounded-2xl bg-white/5 ring-1 ring-white/10">
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Guests</p>
                <p className="text-white text-sm">{plural(guests, 'guest')}</p>
                <p className="text-xs text-slate-400 mt-1">Sleeps up to {listing.guests}</p>
              </div>
            </div>
          </section>

          <section className="py-8 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white mb-5">Guest details</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <Input
                id="name"
                label="Full name"
                placeholder="Ada Lovelace"
                value={form.name}
                onChange={set('name')}
                error={errors.name}
                autoComplete="name"
              />
              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                error={errors.email}
                hint="Your confirmation is sent here."
                autoComplete="email"
              />
              <Input
                id="phone"
                label="Phone (optional)"
                placeholder="+1 555 0100"
                value={form.phone}
                onChange={set('phone')}
                error={errors.phone}
                autoComplete="tel"
              />
              <label htmlFor="note" className="block">
                <span className="block text-sm text-slate-300 mb-2">Message to host (optional)</span>
                <input
                  id="note"
                  value={form.note}
                  onChange={set('note')}
                  placeholder="Arriving late, around 11pm"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 ring-1 ring-white/10 text-white placeholder:text-slate-600 outline-none focus:ring-indigo-500 transition"
                />
              </label>
            </div>
          </section>

          <section className="py-8">
            <h2 className="text-xl font-semibold text-white mb-1">Payment</h2>
            <p className="text-xs text-slate-500 mb-5">
              Demo checkout — no card is charged and nothing leaves your browser.
            </p>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <Input
                  id="card"
                  label="Card number"
                  inputMode="numeric"
                  placeholder="4242 4242 4242 4242"
                  value={form.card}
                  onChange={(e) => setForm({ ...form, card: formatCard(e.target.value) })}
                  error={errors.card}
                />
              </div>
              <Input
                id="expiry"
                label="Expiry"
                inputMode="numeric"
                placeholder="MM/YY"
                value={form.expiry}
                onChange={(e) => setForm({ ...form, expiry: formatExpiry(e.target.value) })}
                error={errors.expiry}
              />
              <Input
                id="cvc"
                label="CVC"
                inputMode="numeric"
                placeholder="123"
                value={form.cvc}
                onChange={(e) => setForm({ ...form, cvc: digitsOnly(e.target.value).slice(0, 4) })}
                error={errors.cvc}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-8 w-full sm:w-auto px-10 py-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold hover:shadow-[0_0_28px_rgba(99,102,241,0.45)] transition-shadow disabled:opacity-60 disabled:cursor-wait"
            >
              {submitting ? 'Confirming…' : `Confirm and pay ${currency(bill.total)}`}
            </button>
          </section>
        </form>

        <aside className="lg:sticky lg:top-24 rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur-xl p-6">
          <div className="flex gap-4 pb-5 border-b border-white/10">
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-24 h-24 rounded-2xl object-cover ring-1 ring-white/10"
            />
            <div className="min-w-0">
              <p className="text-white font-semibold truncate">{listing.title}</p>
              <p className="text-sm text-slate-400 truncate">{listing.location}</p>
              <p className="text-sm text-amber-300 mt-1">★ {listing.rating.toFixed(1)}</p>
            </div>
          </div>

          <div className="py-5 space-y-2.5 text-sm border-b border-white/10">
            <div className="flex justify-between text-slate-300">
              <span>{currency(listing.price)} × {plural(nights, 'night')}</span>
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

          <div className="flex justify-between pt-5 text-white font-semibold text-lg">
            <span>Total</span>
            <span>{currency(bill.total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
