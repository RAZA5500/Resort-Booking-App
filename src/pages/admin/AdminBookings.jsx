import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarRange, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Field, Select } from '../../components/ui/Field';
import { Panel } from '../../components/ui/Surface';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState, ErrorState, RowSkeleton } from '../../components/ui/Feedback';
import { Pagination } from '../../components/ui/Pagination';
import { useApi, useDebounced } from '../../hooks/useApi';
import { bookings as bookingApi, hotels as hotelApi } from '../../api/endpoints';
import { useToast } from '../../context/toast-context';
import { BOOKING_STATUS, STATUS_META } from '../../lib/constants';
import { currency, formatRange, plural } from '../../lib/format';

// Mirrors the transition table the server enforces, so the UI only offers moves
// that will actually be accepted.
const NEXT_STATUS = {
  [BOOKING_STATUS.PENDING]: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.CONFIRMED]: [BOOKING_STATUS.CHECKED_IN, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.CHECKED_IN]: [BOOKING_STATUS.CHECKED_OUT],
  [BOOKING_STATUS.CHECKED_OUT]: [],
  [BOOKING_STATUS.CANCELLED]: [],
};

const AdminBookings = () => {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [hotelId, setHotelId] = useState('');
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState(null);

  const debounced = useDebounced(query, 350);
  const { data, loading, error, refetch } = useApi(
    () => bookingApi.list({ q: debounced, status, hotelId, page, limit: 15 }),
    [debounced, status, hotelId, page]
  );
  const { data: hotelData } = useApi(() => hotelApi.list({ limit: 48, sort: 'name' }), []);

  const move = async (booking, next) => {
    setBusyId(booking.id);
    try {
      await bookingApi.setStatus(booking.id, { status: next });
      toast.success(`${booking.code} → ${STATUS_META[next].label.toLowerCase()}.`);
      refetch();
    } catch (err) {
      toast.error(err.message || 'That transition was rejected.');
    } finally {
      setBusyId(null);
    }
  };

  const reset = () => {
    setQuery('');
    setStatus('');
    setHotelId('');
    setPage(1);
  };

  return (
    <div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_180px_220px_auto]">
        <Field
          icon={Search}
          placeholder="Guest, email or code"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
        <Select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          options={[
            { value: '', label: 'Any status' },
            ...Object.values(BOOKING_STATUS).map((s) => ({ value: s, label: STATUS_META[s].label })),
          ]}
        />
        <Select
          aria-label="Filter by hotel"
          value={hotelId}
          onChange={(e) => {
            setHotelId(e.target.value);
            setPage(1);
          }}
          options={[
            { value: '', label: 'Every hotel' },
            ...(hotelData?.hotels || []).map((h) => ({ value: h.id, label: h.name })),
          ]}
        />
        <Button variant="ghost" onClick={reset}>Clear</Button>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : loading ? (
        <RowSkeleton rows={8} />
      ) : data?.bookings.length === 0 ? (
        <Panel>
          <EmptyState
            icon={CalendarRange}
            title="No bookings match"
            message="Adjust the filters above, or clear them to see everything."
            action={<Button variant="subtle" onClick={reset}>Clear filters</Button>}
          />
        </Panel>
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-500">
            {data.pagination.total} {data.pagination.total === 1 ? 'booking' : 'bookings'}
          </p>

          <div className="space-y-3">
            {data.bookings.map((booking) => (
              <Panel key={booking.id} className="flex flex-col gap-4 p-4 xl:flex-row xl:items-center">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Link
                      to={`/booking/${booking.id}`}
                      className="font-medium text-white transition-colors hover:text-brand-300"
                    >
                      {booking.guest.name}
                    </Link>
                    <StatusBadge status={booking.status} />
                    <span className="font-mono text-[11px] text-slate-600">{booking.code}</span>
                  </div>
                  <p className="truncate text-sm text-slate-400">
                    {booking.hotelName} · {booking.roomName}
                  </p>
                  <p className="text-xs text-slate-600">
                    {formatRange(booking.checkIn, booking.checkOut)} ·{' '}
                    {plural(booking.guests, 'guest')} · {plural(booking.nights, 'night')}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-medium text-white">
                    {currency(booking.pricing.total)}
                  </span>
                  <div className="flex gap-2">
                    {NEXT_STATUS[booking.status].map((next) => (
                      <Button
                        key={next}
                        size="sm"
                        variant={next === BOOKING_STATUS.CANCELLED ? 'ghost' : 'subtle'}
                        loading={busyId === booking.id}
                        onClick={() => move(booking, next)}
                      >
                        {STATUS_META[next].label}
                      </Button>
                    ))}
                    {NEXT_STATUS[booking.status].length === 0 && (
                      <span className="text-xs text-slate-600">No actions left</span>
                    )}
                  </div>
                </div>
              </Panel>
            ))}
          </div>

          <Pagination
            page={data.pagination.page}
            pages={data.pagination.pages}
            onChange={setPage}
            className="pt-8"
          />
        </>
      )}
    </div>
  );
};

export default AdminBookings;
