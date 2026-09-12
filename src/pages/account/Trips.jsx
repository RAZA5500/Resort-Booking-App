import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Globe2, Luggage, Moon, Wallet } from 'lucide-react';
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
    <Panel className="flex flex-col gap-5 p-4 sm:flex-row sm:items-center">
      <Link to={`/hotels/${booking.hotelId}`} className="shrink-0">
        <img
          src={hotel?.images?.[0]}
          alt={booking.hotelName}
          loading="lazy"
          className="h-36 w-full rounded-2xl object-cover ring-1 ring-white/10 sm:h-24 sm:w-36"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <Link
            to={`/booking/${booking.id}`}
            className="font-semibold text-white transition-colors hover:text-brand-300"
          >
            {booking.hotelName}
          </Link>
          <StatusBadge status={booking.status} />
        </div>
        <p className="mb-2 text-sm text-slate-400">
          {hotel?.city}, {hotel?.country} · {booking.roomName}
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {formatRange(booking.checkIn, booking.checkOut)}
          </span>
          <span>{plural(booking.guests, 'guest')}</span>
          <span>{plural(booking.nights, 'night')}</span>
          <span className="font-medium text-white">{currency(booking.pricing.total)}</span>
        </div>
        <p className="mt-2 font-mono text-[11px] text-slate-600">{booking.code}</p>
      </div>

      <div className="flex shrink-0 gap-2">
        <Button to={`/booking/${booking.id}`} variant="subtle" size="sm">Details</Button>
        {cancellable && (
          <Button variant="ghost" size="sm" onClick={() => onCancel(booking)}>Cancel</Button>
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
        <Panel>
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
            <h2 className="mb-4 text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
              {group.title} ({group.items.length})
            </h2>
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
