import { Link } from '../lib/router';
import { getListing } from '../data/listings';
import { useBooking } from '../context/bookingStore';
import NotFound from './NotFound';
import { formatDate } from '../lib/dates';
import { currency, plural } from '../lib/format';

const Row = ({ label, children }) => (
  <div className="flex justify-between gap-6 py-3 border-b border-white/5 last:border-0">
    <span className="text-sm text-slate-400 shrink-0">{label}</span>
    <span className="text-sm text-white text-right">{children}</span>
  </div>
);

const Confirmation = ({ bookingId }) => {
  const { bookings } = useBooking();
  const booking = bookings.find((b) => b.id === bookingId);

  if (!booking) {
    return (
      <NotFound
        title="Booking not found"
        message="That confirmation link is not in this browser. Your trips are stored locally on the device you booked from."
        action={{ to: '/bookings', label: 'View my trips' }}
      />
    );
  }

  const listing = getListing(booking.listingId);

  return (
    <div className="relative z-10 container mx-auto px-6 pt-12 pb-24 max-w-[720px]">
      <div className="text-center mb-10">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/30 grid place-items-center text-4xl">
          ✓
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-3">You are booked!</h1>
        <p className="text-slate-400">
          A confirmation for <span className="text-white">{listing.title}</span> is on its way to{' '}
          {booking.guest.email}.
        </p>
      </div>

      <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur-xl overflow-hidden">
        <img src={listing.images[0]} alt={listing.title} className="w-full h-52 object-cover" />

        <div className="p-7">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">{listing.title}</h2>
              <p className="text-sm text-slate-400">
                {listing.location}, {listing.country}
              </p>
            </div>
            <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold ring-1 ring-emerald-400/20">
              Confirmed
            </span>
          </div>

          <Row label="Confirmation code">
            <span className="font-mono tracking-wider">{booking.id}</span>
          </Row>
          <Row label="Check-in">
            {formatDate(booking.checkIn, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
          </Row>
          <Row label="Check-out">
            {formatDate(booking.checkOut, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
          </Row>
          <Row label="Guests">{plural(booking.guests, 'guest')} · {plural(booking.nights, 'night')}</Row>
          <Row label="Booked by">{booking.guest.name}</Row>
          {booking.cardLast4 && <Row label="Paid with">Card ending {booking.cardLast4}</Row>}
          <Row label="Total paid">
            <span className="font-semibold">{currency(booking.total)}</span>
          </Row>
          {booking.note && <Row label="Note to host">{booking.note}</Row>}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center mt-8">
        <Link
          to="/bookings"
          className="px-6 py-3 rounded-full bg-white text-slate-900 font-semibold text-sm hover:bg-slate-200 transition-colors"
        >
          View my trips
        </Link>
        <Link
          to="/"
          className="px-6 py-3 rounded-full bg-white/5 ring-1 ring-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
        >
          Keep exploring
        </Link>
      </div>
    </div>
  );
};

export default Confirmation;
