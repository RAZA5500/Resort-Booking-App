import { useState } from 'react';
import { Link } from '../lib/router';
import { getListing } from '../data/listings';
import { useBooking } from '../context/bookingStore';
import { formatDate, formatRange, todayISO } from '../lib/dates';
import { currency, plural } from '../lib/format';

const STATUS_STYLES = {
  upcoming: 'bg-indigo-500/15 text-indigo-300 ring-indigo-400/20',
  completed: 'bg-slate-500/15 text-slate-300 ring-slate-400/20',
  cancelled: 'bg-rose-500/15 text-rose-300 ring-rose-400/20',
};

const BookingCard = ({ booking }) => {
  const { cancelBooking } = useBooking();
  const [confirming, setConfirming] = useState(false);
  const listing = getListing(booking.listingId);

  const state =
    booking.status === 'cancelled'
      ? 'cancelled'
      : booking.checkOut < todayISO()
        ? 'completed'
        : 'upcoming';

  return (
    <div
      className={`flex flex-col sm:flex-row gap-5 p-5 rounded-3xl bg-white/5 ring-1 ring-white/10 transition-opacity ${
        state === 'cancelled' ? 'opacity-60' : ''
      }`}
    >
      <Link to={`/listing/${listing.id}`} className="shrink-0">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full sm:w-44 h-36 rounded-2xl object-cover ring-1 ring-white/10"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="min-w-0">
            <Link to={`/listing/${listing.id}`} className="text-lg font-semibold text-white hover:underline">
              {listing.title}
            </Link>
            <p className="text-sm text-slate-400">{listing.location}, {listing.country}</p>
          </div>
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ring-1 capitalize shrink-0 ${STATUS_STYLES[state]}`}
          >
            {state}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-300 mb-3">
          <span>📅 {formatRange(booking.checkIn, booking.checkOut)}</span>
          <span>👥 {plural(booking.guests, 'guest')}</span>
          <span>🌙 {plural(booking.nights, 'night')}</span>
          <span className="text-white font-medium">{currency(booking.total)}</span>
        </div>

        <p className="text-xs text-slate-500 font-mono mb-4">
          {booking.id} · booked {formatDate(booking.createdAt.slice(0, 10), { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>

        {state === 'upcoming' &&
          (confirming ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-slate-300">Cancel this trip?</span>
              <button
                type="button"
                onClick={() => cancelBooking(booking.id)}
                className="px-4 py-2 rounded-full bg-rose-500/90 text-white text-sm font-medium hover:bg-rose-500 transition-colors"
              >
                Yes, cancel
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="px-4 py-2 rounded-full bg-white/5 ring-1 ring-white/10 text-slate-200 text-sm hover:bg-white/10 transition-colors"
              >
                Keep it
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Link
                to={`/confirmation/${booking.id}`}
                className="px-4 py-2 rounded-full bg-white/5 ring-1 ring-white/10 text-white text-sm hover:bg-white/10 transition-colors"
              >
                View confirmation
              </Link>
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="px-4 py-2 rounded-full text-slate-400 text-sm hover:text-rose-300 transition-colors"
              >
                Cancel booking
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

const Bookings = () => {
  const { bookings, activeBookings } = useBooking();
  const today = todayISO();

  const upcoming = activeBookings
    .filter((b) => b.checkOut >= today)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  const past = activeBookings.filter((b) => b.checkOut < today);
  const cancelled = bookings.filter((b) => b.status === 'cancelled');

  const nightsBooked = activeBookings.reduce((sum, b) => sum + b.nights, 0);
  const totalSpent = activeBookings.reduce((sum, b) => sum + b.total, 0);

  if (bookings.length === 0) {
    return (
      <div className="relative z-10 container mx-auto px-6 py-28 flex flex-col items-center text-center">
        <div className="text-6xl mb-6">🧳</div>
        <h1 className="text-3xl font-bold text-white mb-3">No trips booked yet</h1>
        <p className="text-slate-400 max-w-md mb-8 leading-relaxed">
          When you reserve a stay it will show up here, with your confirmation code and the option
          to cancel.
        </p>
        <Link
          to="/"
          className="px-6 py-3 rounded-full bg-white text-slate-900 font-semibold text-sm hover:bg-slate-200 transition-colors"
        >
          Start exploring
        </Link>
      </div>
    );
  }

  return (
    <div className="relative z-10 container mx-auto px-6 pt-10 pb-24 max-w-[900px]">
      <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Your trips</h1>
      <p className="text-slate-400 mb-8">
        {plural(activeBookings.length, 'active booking')} · {plural(nightsBooked, 'night')} ·{' '}
        {currency(totalSpent)} total
      </p>

      {[
        { key: 'upcoming', title: 'Upcoming', items: upcoming },
        { key: 'past', title: 'Past trips', items: past },
        { key: 'cancelled', title: 'Cancelled', items: cancelled },
      ]
        .filter((section) => section.items.length > 0)
        .map((section) => (
          <section key={section.key} className="mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">
              {section.title} ({section.items.length})
            </h2>
            <div className="flex flex-col gap-4">
              {section.items.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
};

export default Bookings;
