import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Building2, CalendarRange, Percent, TrendingUp, Users, Wallet, ArrowUpRight } from 'lucide-react';
import { Panel, StatCard } from '../../components/ui/Surface';
import { StatusBadge } from '../../components/ui/Badge';
import { ErrorState, RowSkeleton } from '../../components/ui/Feedback';
import { useApi } from '../../hooks/useApi';
import { stats as statsApi } from '../../api/endpoints';
import { compactCurrency, currency, formatDateTime, formatRange } from '../../lib/format';

// One ordered palette, used by every chart on the page so series stay comparable.
const SERIES = ['#6366f1', '#a78bfa', '#38bdf8', '#34d399', '#fbbf24', '#fb7185', '#f472b6'];

const axis = {
  stroke: '#475569',
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

const ChartTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs shadow-xl ring-1 ring-white/10">
      {label && <p className="mb-1 font-semibold text-white">{label}</p>}
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-2 text-slate-300">
          <span className="size-2 rounded-full" style={{ background: entry.color || entry.payload.fill }} />
          {entry.name}: <span className="font-semibold text-white">
            {formatter ? formatter(entry.value) : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
};

const Overview = () => {
  const { data, loading, error, refetch } = useApi(() => statsApi.admin(), []);

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (loading || !data) return <RowSkeleton rows={6} />;

  const { totals, trend, topHotels, byContinent, statusBreakdown, recentBookings, audit } = data;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Gross revenue"
          value={currency(totals.revenue)}
          icon={Wallet}
          hint="all non-cancelled bookings"
        />
        <StatCard
          label="Bookings"
          value={totals.bookings}
          icon={CalendarRange}
          tone="emerald"
          hint={`${totals.activeBookings} active · ${totals.cancelled} cancelled`}
        />
        <StatCard
          label="Occupancy (30d)"
          value={`${totals.occupancy}%`}
          icon={Percent}
          tone="amber"
          hint={`avg rate ${currency(totals.averageNightly)}`}
        />
        <StatCard
          label="Hotels"
          value={totals.hotels}
          icon={Building2}
          hint={`${totals.activeHotels} bookable`}
        />
        <StatCard
          label="Guests"
          value={totals.customers}
          icon={Users}
          tone="emerald"
          hint={`${totals.staff} staff accounts`}
        />
        <StatCard
          label="Avg nightly rate"
          value={currency(totals.averageNightly)}
          icon={TrendingUp}
          tone="amber"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel className="surface-elevated p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Revenue and volume</h2>
              <p className="text-xs text-slate-400">By month of check-in, last 8 months</p>
            </div>
            <span className="font-label rounded-full bg-brand-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand-300 ring-1 ring-brand-400/20">
              Monthly trend
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ left: -18, right: 8, top: 4 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SERIES[0]} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={SERIES[0]} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" {...axis} />
                <YAxis {...axis} tickFormatter={compactCurrency} width={58} />
                <Tooltip content={<ChartTooltip formatter={currency} />} cursor={{ stroke: '#334155' }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke={SERIES[0]}
                  strokeWidth={2.5}
                  fill="url(#revenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="surface-elevated p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-white">Revenue by region</h2>
            <p className="text-xs text-slate-400">Share of gross reservations</p>
          </div>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byContinent}
                  dataKey="revenue"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={82}
                  paddingAngle={3}
                  stroke="none"
                >
                  {byContinent.map((entry, i) => (
                    <Cell key={entry.name} fill={SERIES[i % SERIES.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip formatter={currency} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="mt-3 space-y-1.5 border-t border-white/5 pt-3">
            {byContinent.map((entry, i) => (
              <li key={entry.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-400">
                  <span className="size-2 rounded-full ring-1 ring-white/10" style={{ background: SERIES[i % SERIES.length] }} />
                  {entry.name}
                </span>
                <span className="font-medium text-slate-200">{compactCurrency(entry.revenue)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="surface-elevated p-6">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-white">Top performing hotels</h2>
            <p className="text-xs text-slate-400">Gross revenue per property</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topHotels} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" {...axis} tickFormatter={compactCurrency} />
                <YAxis
                  type="category"
                  dataKey="name"
                  {...axis}
                  width={118}
                  tickFormatter={(v) => (v.length > 16 ? `${v.slice(0, 15)}…` : v)}
                />
                <Tooltip content={<ChartTooltip formatter={currency} />} cursor={{ fill: '#ffffff08' }} />
                <Bar dataKey="revenue" name="Revenue" radius={[0, 6, 6, 0]}>
                  {topHotels.map((entry, i) => (
                    <Cell key={entry.id} fill={SERIES[i % SERIES.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="surface-elevated p-6">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-white">Booking pipeline</h2>
            <p className="text-xs text-slate-400">Reservations categorized by active lifecycle status</p>
          </div>

          <div className="space-y-3.5">
            {statusBreakdown.map((entry) => {
              const max = Math.max(...statusBreakdown.map((s) => s.count), 1);
              return (
                <div key={entry.status}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <StatusBadge status={entry.status} />
                    <span className="text-sm font-semibold text-white tabular-nums">{entry.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 via-indigo-400 to-violet-400 transition-all duration-500"
                      style={{ width: `${(entry.count / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {audit?.length > 0 && (
            <>
              <h3 className="font-label mt-7 mb-3 text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                Recent staff audit log
              </h3>
              <ul className="space-y-2 border-t border-white/5 pt-3">
                {audit.slice(0, 5).map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between gap-3 text-xs">
                    <span className="truncate text-slate-400">
                      <span className="font-medium text-slate-200">{entry.actorName}</span> · {entry.action}
                    </span>
                    <span className="shrink-0 text-slate-500">{formatDateTime(entry.at)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>
      </div>

      <Panel className="surface-elevated p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Latest bookings</h2>
            <p className="text-xs text-slate-400">Real-time incoming reservations across all properties</p>
          </div>
          <Link to="/admin/bookings" className="group flex items-center gap-1 text-xs font-medium text-brand-300 hover:text-brand-200">
            View all bookings <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="-mx-6 overflow-x-auto px-6">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-white/8 text-left text-[11px] tracking-wider text-slate-400 uppercase">
                <th className="pb-3 font-semibold">Guest</th>
                <th className="pb-3 font-semibold">Hotel</th>
                <th className="pb-3 font-semibold">Dates</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="transition-colors hover:bg-white/[0.02]">
                  <td className="py-3.5">
                    <Link to={`/booking/${booking.id}`} className="font-medium text-white transition-colors hover:text-brand-300">
                      {booking.guest.name}
                    </Link>
                    <p className="font-mono text-[11px] text-slate-500">{booking.code}</p>
                  </td>
                  <td className="py-3.5 text-slate-300">{booking.hotelName}</td>
                  <td className="py-3.5 text-slate-400">
                    {formatRange(booking.checkIn, booking.checkOut)}
                  </td>
                  <td className="py-3.5"><StatusBadge status={booking.status} /></td>
                  <td className="py-3.5 text-right font-semibold text-white">
                    {currency(booking.pricing.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </motion.div>
  );
};

export default Overview;
