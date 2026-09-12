import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarDays, Check, MapPin, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Panel } from '../components/ui/Surface';
import { StatusBadge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/Modal';
import { ErrorState, PageLoader } from '../components/ui/Feedback';
import { useApi } from '../hooks/useApi';
import { bookings as bookingApi } from '../api/endpoints';
import { useToast } from '../context/toast-context';
import { BOOKING_STATUS } from '../lib/constants';
import { currency, formatDate, formatDateTime, plural, todayISO } from '../lib/format';

const Row = ({ label, children }) => (
  <div className="flex justify-between gap-6 border-b border-white/6 py-3 last:border-0">
    <span className="shrink-0 text-sm text-slate-500">{label}</span>
    <span className="text-right text-sm text-white">{children}</span>
  </div>
);

const BookingDetail = () => {
  const { id } = useParams();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const { data, loading, error, refetch } = useApi(() => bookingApi.get(id), [id]);

  if (loading) return <PageLoader label="Loading booking" />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const booking = data.booking;
  const hotel = booking.hotel;
  const justBooked = booking.status === BOOKING_STATUS.CONFIRMED && booking.checkIn >= todayISO();
  const cancellable = [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED].includes(booking.status);

  const cancel = async () => {
    setCancelling(true);
    try {
      await bookingApi.cancel(booking.id, { reason: 'Cancelled from booking page' });
      toast.info('Booking cancelled. Those dates are free again.');
      setConfirming(false);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not cancel that booking.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <Link
        to="/account/trips"
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" /> All my trips
      </Link>

      {justBooked && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="mb-10 text-center"
        >
          <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/30">
            <Check className="size-8 text-emerald-400" strokeWidth={2.5} />
          </div>
          <h1 className="display mb-2 text-4xl text-white">You are booked</h1>
          <p className="text-slate-400">
            A confirmation is on its way to {booking.guest.email}.
          </p>
        </motion.div>
      )}

      <Panel className="overflow-hidden">
        {hotel && (
          <div className="relative h-48">
            <img src={hotel.images[0]} alt={hotel.name} className="size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900 to-transparent" />
            <div className="absolute inset-x-6 bottom-5 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <h2 className="display truncate text-2xl text-white">{hotel.name}</h2>
                <p className="flex items-center gap-1.5 text-sm text-slate-300">
                  <MapPin className="size-3.5" /> {hotel.city}, {hotel.country}
                </p>
              </div>
              <StatusBadge status={booking.status} />
            </div>
          </div>
        )}

        <div className="grid gap-4 border-b border-white/8 p-6 sm:grid-cols-3">
          {[
            [CalendarDays, 'Check-in', formatDate(booking.checkIn, { weekday: 'short', month: 'short', day: 'numeric' })],
            [CalendarDays, 'Check-out', formatDate(booking.checkOut, { weekday: 'short', month: 'short', day: 'numeric' })],
            [Users, 'Party', `${plural(booking.guests, 'guest')} · ${plural(booking.nights, 'night')}`],
          ].map(([Icon, label, value]) => (
            <div key={label} className="rounded-2xl bg-white/4 px-4 py-3 ring-1 ring-white/8">
              <p className="mb-1 flex items-center gap-1.5 text-[11px] tracking-wider text-slate-500 uppercase">
                <Icon className="size-3" /> {label}
              </p>
              <p className="text-sm font-medium text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="p-6">
          <Row label="Confirmation code">
            <span className="font-mono tracking-widest">{booking.code}</span>
          </Row>
          <Row label="Room">{booking.roomName}</Row>
          <Row label="Lead guest">{booking.guest.name}</Row>
          <Row label="Email">{booking.guest.email}</Row>
          {booking.guest.phone && <Row label="Phone">{booking.guest.phone}</Row>}
          {booking.paymentLast4 && <Row label="Paid with">Card ending {booking.paymentLast4}</Row>}
          {booking.note && <Row label="Note to hotel">{booking.note}</Row>}
          <Row label="Booked">{formatDateTime(booking.createdAt)}</Row>

          <div className="mt-5 space-y-2.5 rounded-2xl bg-white/4 p-5 text-sm ring-1 ring-white/8">
            <div className="flex justify-between text-slate-300">
              <span>
                {currency(booking.pricing.nightlyRate)} × {plural(booking.pricing.nights, 'night')}
              </span>
              <span>{currency(booking.pricing.roomTotal)}</span>
            </div>
            {booking.pricing.discount > 0 && (
              <div className="flex justify-between text-emerald-300">
                <span>Weekly stay discount</span>
                <span>−{currency(booking.pricing.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-300">
              <span>Cleaning</span><span>{currency(booking.pricing.cleaning)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Service fee</span><span>{currency(booking.pricing.service)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Taxes</span><span>{currency(booking.pricing.tax)}</span>
            </div>
            <div className="flex justify-between border-t border-white/8 pt-3 font-semibold text-white">
              <span>Total paid</span>
              <span>{currency(booking.pricing.total)}</span>
            </div>
          </div>
        </div>
      </Panel>

      {booking.statusHistory?.length > 1 && (
        <Panel className="mt-6 p-6">
          <h3 className="mb-4 text-sm font-semibold tracking-wider text-slate-400 uppercase">
            History
          </h3>
          <ol className="space-y-3">
            {[...booking.statusHistory].reverse().map((entry, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-400" />
                <div>
                  <p className="text-slate-200 capitalize">{entry.status.replace('_', ' ')}</p>
                  <p className="text-xs text-slate-500">
                    {formatDateTime(entry.at)}
                    {entry.note ? ` · ${entry.note}` : ''}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button to="/hotels" variant="subtle">Keep exploring</Button>
        {hotel && <Button to={`/hotels/${hotel.id}`} variant="ghost">View the hotel</Button>}
        {cancellable && (
          <Button variant="danger" onClick={() => setConfirming(true)}>
            Cancel booking
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={cancel}
        loading={cancelling}
        title="Cancel this booking?"
        confirmLabel="Yes, cancel it"
        message={`Your stay at ${hotel?.name} on ${formatDate(booking.checkIn, { month: 'long', day: 'numeric' })} will be released. This cannot be undone.`}
      />
    </div>
  );
};

export default BookingDetail;
