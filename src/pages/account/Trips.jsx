import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, CalendarDays, Globe2, Luggage, Moon, Sparkles, Wallet } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Panel, StatCard } from '../../components/ui/Surface';
import { StatusBadge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/Modal';
import { EmptyState, ErrorState, RowSkeleton } from '../../components/ui/Feedback';
import { useApi } from '../../hooks/useApi';
import { bookings as bookingApi, stats as statsApi } from '../../api/endpoints';
import { useToast } from '../../context/toast-context';
import { BOOKING_STATUS } from '../../lib/constants';
import { currency, formatRange, plural, todayISO } from '../../lib/format';

const TripRow = ({ booking, onCancel }) => {
  const hotel = booking.hotel;
  const cancellable =
    [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED].includes(booking.status) &&
    booking.checkIn >= todayISO();

  return (
    <Panel className="surface-elevated group flex flex-col gap-5 p-4.5 transition-all duration-300 sm:flex-row sm:items-center">
      <Link to={`/hotels/${booking.hotelId}`} className="relative shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10 sm:w-40 sm:h-28">
        <img
          src={hotel?.images?.[0]}
          alt={booking.hotelName}
          loading="lazy"
          className="h-40 w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent sm:hidden" />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <Link
            to={`/booking/${booking.id}`}
            className="font-semibold text-white transition-colors group-hover:text-brand-300 sm:text-lg"
          >
            {booking.hotelName}
          </Link>
          <StatusBadge status={booking.status} />
        </div>
        <p className="mb-2 text-sm text-slate-400">
          {hotel?.city}, {hotel?.country} · <span className="text-slate-300">{booking.roomName}</span>
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <CalendarDays className="size-3.5 text-brand-400" />
            {formatRange(booking.checkIn, booking.checkOut)}
          </span>
          <span>{plural(booking.guests, 'guest')}</span>
          <span>{plural(booking.nights, 'night')}</span>
          <span className="font-semibold text-white">{currency(booking.pricing.total)}</span>
        </div>
        <div className="mt-2.5 flex items-center gap-2">
          <span className="font-label rounded-md bg-white/5 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-400 ring-1 ring-white/10">
            {booking.code}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
        <Button to={`/booking/${booking.id}`} variant="subtle" size="sm" className="w-full sm:w-auto">
          View details <ArrowUpRight className="ml-1 size-3.5" />
        </Button>
        {cancellable && (
          <Button variant="ghost" size="sm" onClick={() => onCancel(booking)} className="w-full text-slate-400 hover:text-rose-300 sm:w-auto">
            Cancel
          </Button>
        )}
      </div>
    </Panel>
  );
};

const Trips = () => {
  const toast = useToast();
  const [target, setTarget] = useState(null);
  const [working, setWorking] = useState(false);

  const { data: summary, refetch: refetchStats } = useApi(() => statsApi.me(), []);
  const { data, loading, error, refetch } = useApi(() => bookingApi.list({ limit: 100 }), []);

  const rows = data?.bookings || [];
  const today = todayISO();

  const groups = [
    {
      key: 'upcoming',
      title: 'Upcoming',
      items: rows
        .filter((b) => b.checkOut >= today && b.status !== BOOKING_STATUS.CANCELLED && b.status !== BOOKING_STATUS.CHECKED_OUT)
        .sort((a, b) => a.checkIn.localeCompare(b.checkIn)),
    },
    {
      key: 'past',
      title: 'Past stays',
      items: rows.filter(
        (b) => b.status === BOOKING_STATUS.CHECKED_OUT || (b.checkOut < today && b.status !== BOOKING_STATUS.CANCELLED)
      ),
    },
    {
      key: 'cancelled',
      title: 'Cancelled',
      items: rows.filter((b) => b.status === BOOKING_STATUS.CANCELLED),
    },
  ].filter((group) => group.items.length > 0);

  const cancel = async () => {
    setWorking(true);
    try {
      await bookingApi.cancel(target.id, { reason: 'Cancelled from trips' });
      toast.info('Booking cancelled.');
      setTarget(null);
      refetch();
      refetchStats();
    } catch (err) {
      toast.error(err.message || 'Could not cancel that booking.');
    } finally {
      setWorking(false);
    }
  };

  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Trips" value={summary?.counts.trips ?? '—'} icon={Luggage} hint="all time" />
        <StatCard label="Upcoming" value={summary?.counts.upcoming ?? '—'} icon={CalendarDays} tone="emerald" hint="still to come" />
        <StatCard label="Nights booked" value={summary?.counts.nights ?? '—'} icon={Moon} tone="amber" />
        <StatCard label="Total spend" value={summary ? currency(summary.counts.spend) : '—'} icon={Wallet} hint={summary ? `${summary.counts.countries} countries` : ''} />
      </div>

      {loading ? (
        <RowSkeleton rows={3} />
      ) : rows.length === 0 ? (
        <Panel className="surface-elevated">
          <EmptyState
            icon={Globe2}
            title="No trips yet"
            message="When you book a hotel it appears here with its confirmation code, and you can cancel it up to 48 hours before check-in."
            action={<Button to="/hotels">Find somewhere to go</Button>}
          />
        </Panel>
      ) : (
        groups.map((group) => (
          <section key={group.key} className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="font-label text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
                {group.title}
              </h2>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-400 ring-1 ring-white/10">
                {group.items.length}
              </span>
            </div>
            <div className="space-y-3">
              {group.items.map((booking) => (
                <TripRow key={booking.id} booking={booking} onCancel={setTarget} />
              ))}
            </div>
          </section>
        ))
      )}

      <ConfirmDialog
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        onConfirm={cancel}
        loading={working}
        title="Cancel this booking?"
        confirmLabel="Yes, cancel it"
        message={
          target
            ? `Your stay at ${target.hotelName} (${formatRange(target.checkIn, target.checkOut)}) will be released.`
            : ''
        }
      />
    </div>
  );
};

export default Trips;
