import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BedDouble, CalendarCheck, DoorOpen, LogIn, LogOut, Search, TrendingUp, Users,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { Panel, StatCard } from '../../components/ui/Surface';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState, ErrorState, RowSkeleton } from '../../components/ui/Feedback';
import { useApi, useDebounced } from '../../hooks/useApi';
import { bookings as bookingApi, stats as statsApi } from '../../api/endpoints';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';
import { BOOKING_STATUS } from '../../lib/constants';
import { currency, formatRange, plural } from '../../lib/format';

const TABS = [
  { id: 'arrivals', label: 'Arrivals today', icon: LogIn },
  { id: 'inHouse', label: 'In house', icon: BedDouble },
  { id: 'departures', label: 'Departures', icon: LogOut },
  { id: 'all', label: 'All reservations', icon: CalendarCheck },
];

const GuestRow = ({ booking, onAction, busyId }) => {
  const busy = busyId === booking.id;

  const actions = [];
  if (booking.status === BOOKING_STATUS.CONFIRMED) {
    actions.push({ label: 'Check in', status: BOOKING_STATUS.CHECKED_IN, variant: 'primary' });
    actions.push({ label: 'Cancel', status: BOOKING_STATUS.CANCELLED, variant: 'ghost' });
  }
  if (booking.status === BOOKING_STATUS.CHECKED_IN) {
    actions.push({ label: 'Check out', status: BOOKING_STATUS.CHECKED_OUT, variant: 'subtle' });
  }

  return (
    <Panel className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <p className="font-semibold text-white">{booking.guest.name}</p>
          <StatusBadge status={booking.status} />
          <span className="font-mono text-[11px] text-slate-600">{booking.code}</span>
        </div>
        <p className="truncate text-sm text-slate-400">
          {booking.roomName} · {plural(booking.guests, 'guest')} · {formatRange(booking.checkIn, booking.checkOut)}
        </p>
        <p className="truncate text-xs text-slate-600">{booking.guest.email}</p>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <span className="text-sm font-medium text-white">{currency(booking.pricing.total)}</span>
        <div className="flex gap-2">
          {actions.map((action) => (
            <Button
              key={action.status}
              size="sm"
              variant={action.variant}
              loading={busy}
              onClick={() => onAction(booking, action.status)}
            >
              {action.label}
            </Button>
          ))}
          <Button to={`/booking/${booking.id}`} size="sm" variant="ghost">View</Button>
        </div>
      </div>
    </Panel>
  );
};

const Desk = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('arrivals');
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState(null);
  const debounced = useDebounced(query, 350);

  const { data: desk, loading, error, refetch } = useApi(() => statsApi.employee(), []);
  const { data: all, refetch: refetchAll } = useApi(
    () => bookingApi.list({ q: debounced, limit: 50 }),
    [debounced],
    { skip: tab !== 'all' }
  );

  const act = async (booking, status) => {
    setBusyId(booking.id);
    try {
      await bookingApi.setStatus(booking.id, { status });
      toast.success(
        status === BOOKING_STATUS.CHECKED_IN
          ? `${booking.guest.name} checked in.`
          : status === BOOKING_STATUS.CHECKED_OUT
            ? `${booking.guest.name} checked out.`
            : 'Booking cancelled.'
      );
      refetch();
      refetchAll();
    } catch (err) {
      toast.error(err.message || 'That action was rejected.');
    } finally {
      setBusyId(null);
    }
  };

  const lists = {
    arrivals: desk?.arrivals || [],
    inHouse: desk?.inHouse || [],
    departures: desk?.departures || [],
    all: all?.bookings || [],
  };
  const rows = lists[tab];

  return (
    <DashboardLayout
      title="Front desk"
      subtitle={
        desk?.hotel
          ? `${desk.hotel.name} — ${desk.hotel.city}, ${desk.hotel.country}`
          : 'All properties'
      }
      nav={[]}
      actions={<Button to="/hotels" variant="subtle" size="sm">Public site</Button>}
    >
      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <>
          <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Arrivals today" value={desk?.counts.arrivals ?? '—'} icon={LogIn} tone="brand" hint="due to check in" />
            <StatCard label="In house" value={desk?.counts.inHouse ?? '—'} icon={BedDouble} tone="emerald" hint={`${desk?.counts.occupancy ?? 0}% occupancy`} />
            <StatCard label="Departures" value={desk?.counts.departures ?? '—'} icon={DoorOpen} tone="amber" hint="checking out today" />
            <StatCard label="Revenue today" value={desk ? currency(desk.counts.revenueToday) : '—'} icon={TrendingUp} hint={`${desk?.counts.upcoming ?? 0} upcoming`} />
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium ring-1 transition-all ${
                  tab === t.id
                    ? 'bg-white text-ink-950 ring-white'
                    : 'bg-white/5 text-slate-300 ring-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                <t.icon className="size-3.5" />
                {t.label}
                {lists[t.id]?.length > 0 && (
                  <span
                    className={`rounded-full px-1.5 text-[10px] ${
                      tab === t.id ? 'bg-ink-950/10 text-ink-950' : 'bg-white/10 text-white'
                    }`}
                  >
                    {lists[t.id].length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {tab === 'all' && (
            <Field
              icon={Search}
              placeholder="Search by guest, email or confirmation code"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mb-5"
            />
          )}

          {loading ? (
            <RowSkeleton rows={4} />
          ) : rows.length === 0 ? (
            <Panel>
              <EmptyState
                icon={Users}
                title={tab === 'all' ? 'No reservations match' : 'Nothing here right now'}
                message={
                  tab === 'arrivals'
                    ? 'No guests are due to check in today. Check the upcoming tab for later arrivals.'
                    : tab === 'departures'
                      ? 'Nobody is due to check out today.'
                      : tab === 'inHouse'
                        ? 'No guests are currently in house.'
                        : 'Try a different search term.'
                }
              />
            </Panel>
          ) : (
            <div className="space-y-3">
              {rows.map((booking) => (
                <GuestRow key={booking.id} booking={booking} onAction={act} busyId={busyId} />
              ))}
            </div>
          )}

          {user?.hotelId && (
            <p className="mt-8 text-xs text-slate-600">
              You are scoped to{' '}
              <Link to={`/hotels/${user.hotelId}`} className="text-slate-400 underline underline-offset-4">
                one property
              </Link>
              . The server rejects any action on a booking outside it.
            </p>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default Desk;
