import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock,
  Copy,
  ExternalLink,
  HeartHandshake,
  MapPin,
  Sparkles,
  Users,
} from 'lucide-react';
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
  <div className="flex items-center justify-between gap-6 border-b border-white/6 py-3.5 last:border-0">
    <span className="shrink-0 text-sm text-slate-400">{label}</span>
    <span className="text-right text-sm font-medium text-white">{children}</span>
  </div>
);

const BookingDetail = () => {
  const { id } = useParams();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data, loading, error, refetch } = useApi(() => bookingApi.get(id), [id]);

  if (loading) return <PageLoader label="Loading booking details" />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const booking = data.booking;
  const hotel = booking.hotel;
  const justBooked = booking.status === BOOKING_STATUS.CONFIRMED && booking.checkIn >= todayISO();
  const cancellable = [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED].includes(booking.status);

  const copyCode = () => {
    navigator.clipboard.writeText(booking.code);
    setCopied(true);
    toast.success('Confirmation code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-3xl px-5 py-10 sm:px-8"
    >
      <Link
        to="/account/trips"
        className="group mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-1" />
        All my trips
      </Link>

      {justBooked && (
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 20 }}
          className="relative mb-10 overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 via-emerald-500/[0.03] to-transparent p-8 text-center"
        >
          <div className="pointer-events-none absolute -top-16 left-1/2 size-48 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="relative">
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-emerald-500/15 ring-2 ring-emerald-400/40 shadow-lg shadow-emerald-500/20">
              <Check className="size-8 text-emerald-400" strokeWidth={2.5} />
            </div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-300 ring-1 ring-emerald-400/30">
              <Sparkles className="size-3.5" /> Reservation Confirmed
            </div>
            <h1 className="display mb-2 text-4xl text-white sm:text-5xl">You are booked</h1>
            <p className="mx-auto max-w-md text-sm text-slate-300">
              A full confirmation and voucher has been sent to{' '}
              <span className="font-semibold text-white">{booking.guest.email}</span>.
            </p>
          </div>
        </motion.div>
      )}

      <Panel className="surface-elevated overflow-hidden border-white/10 shadow-2xl shadow-ink-950/70">
        {hotel && (
          <div className="relative h-56 sm:h-64">
            <img
              src={hotel.images[0]}
              alt={hotel.name}
              className="size-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent" />
            <div className="absolute inset-x-6 bottom-6 flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="font-label mb-1 text-[11px] font-semibold tracking-wider text-brand-300 uppercase">
                  Confirmed Stay
                </p>
                <h2 className="display truncate text-2xl text-white sm:text-3xl">{hotel.name}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-300">
                  <MapPin className="size-3.5 text-brand-400" /> {hotel.city}, {hotel.country}
                </p>
              </div>
              <StatusBadge status={booking.status} />
            </div>
          </div>
        )}

        <div className="grid gap-4 border-b border-white/8 bg-white/[0.015] p-6 sm:grid-cols-3">
          {[
            {
              Icon: CalendarDays,
              label: 'Check-in',
              value: formatDate(booking.checkIn, { weekday: 'short', month: 'short', day: 'numeric' }),
            },
            {
              Icon: CalendarDays,
              label: 'Check-out',
              value: formatDate(booking.checkOut, { weekday: 'short', month: 'short', day: 'numeric' }),
            },
            {
              Icon: Users,
              label: 'Party',
              value: `${plural(booking.guests, 'guest')} · ${plural(booking.nights, 'night')}`,
            },
          ].map(({ Icon, label, value }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition-colors hover:border-brand-400/20"
            >
              <p className="font-label mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                <Icon className="size-3.5 text-brand-400" /> {label}
              </p>
              <p className="text-sm font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-brand-400/20 bg-brand-500/[0.07] px-5 py-4">
            <div>
              <p className="font-label text-[11px] font-semibold tracking-wider text-brand-300 uppercase">
                Confirmation Code
              </p>
              <p className="font-mono text-xl font-bold tracking-widest text-white">{booking.code}</p>
            </div>
            <button
              onClick={copyCode}
              type="button"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition-all hover:bg-white/10 hover:text-white"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-400" /> Copied
                </>
              ) : (
                <>
                  <Copy className="size-3.5 text-slate-400" /> Copy
                </>
              )}
            </button>
          </div>

          <div className="space-y-1">
            <Row label="Reserved room">{booking.roomName}</Row>
            <Row label="Lead guest">{booking.guest.name}</Row>
            <Row label="Email">{booking.guest.email}</Row>
            {booking.guest.phone && <Row label="Contact phone">{booking.guest.phone}</Row>}
            {booking.paymentLast4 && (
              <Row label="Payment method">Card ending in {booking.paymentLast4}</Row>
            )}
            {booking.note && <Row label="Note for hotel">{booking.note}</Row>}
            <Row label="Reservation date">{formatDateTime(booking.createdAt)}</Row>
          </div>

          <div className="mt-6 space-y-2.5 rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>
                {currency(booking.pricing.nightlyRate)} × {plural(booking.pricing.nights, 'night')}
              </span>
              <span className="font-medium text-white">{currency(booking.pricing.roomTotal)}</span>
            </div>
            {booking.pricing.discount > 0 && (
              <div className="flex justify-between font-medium text-emerald-300">
                <span className="flex items-center gap-1">
                  <Sparkles className="size-3" /> Weekly stay discount
                </span>
                <span>−{currency(booking.pricing.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Cleaning</span>
              <span>{currency(booking.pricing.cleaning)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Service fee</span>
              <span>{currency(booking.pricing.service)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Taxes</span>
              <span>{currency(booking.pricing.tax)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/8 pt-3 text-base font-semibold text-white">
              <span>Total paid</span>
              <span className="text-lg font-bold text-gradient">
                {currency(booking.pricing.total)}
              </span>
            </div>
          </div>
        </div>
      </Panel>

      {booking.statusHistory?.length > 1 && (
        <Panel className="surface-elevated mt-6 p-6">
          <h3 className="font-label mb-5 flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
            <Clock className="size-4 text-brand-400" /> Booking history & timeline
          </h3>
          <ol className="relative space-y-4 border-l border-white/10 pl-5">
            {[...booking.statusHistory].reverse().map((entry, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[25px] top-1.5 size-2.5 rounded-full bg-brand-400 shadow-sm shadow-brand-400/50 ring-4 ring-ink-950" />
                <div>
                  <p className="text-sm font-medium text-slate-100 capitalize">
                    {entry.status.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDateTime(entry.at)}
                    {entry.note ? ` · ${entry.note}` : ''}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button to="/hotels" variant="subtle">
          Keep exploring
        </Button>
        {hotel && (
          <Button to={`/hotels/${hotel.id}`} variant="ghost">
            View property <ExternalLink className="ml-1 size-3.5" />
          </Button>
        )}
        {cancellable && (
          <Button variant="danger" onClick={() => setConfirming(true)}>
            Cancel reservation
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
    </motion.div>
  );
};

export default BookingDetail;
