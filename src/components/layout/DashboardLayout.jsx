import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROLE_LABEL } from '../../lib/constants';
import { useAuth } from '../../context/auth-context';
import { initials } from '../../lib/format';

/**
 * Staff and account workspace chrome: a rail on desktop, a scrolling tab strip on mobile.
 */
export const DashboardLayout = ({ title, subtitle, nav = [], actions, children }) => {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-12"
    >
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="font-label mb-2 inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-brand-300 uppercase ring-1 ring-brand-400/20">
            <span className="size-1.5 rounded-full bg-brand-400 animate-pulse" />
            {ROLE_LABEL[user?.role] || 'Workspace'}
          </div>
          <h1 className="display text-4xl text-white sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">{actions}</div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="surface-elevated mb-4 hidden items-center gap-3 rounded-2xl p-4 shadow-lg shadow-black/20 lg:flex">
            <div className="relative">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 via-indigo-600 to-violet-600 text-xs font-bold text-white shadow-md shadow-brand-500/25 ring-1 ring-white/20">
                {initials(user?.name)}
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-ink-950" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>

          <nav className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `group relative flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-500/20 via-indigo-500/15 to-transparent text-white ring-1 ring-brand-400/40 shadow-sm shadow-brand-500/10 font-semibold'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 hidden h-5 w-1 rounded-r-full bg-brand-400 lg:block shadow-sm shadow-brand-400" />
                    )}
                    {item.icon && (
                      <item.icon
                        className={`size-4 shrink-0 transition-colors ${
                          isActive ? 'text-brand-300' : 'text-slate-400 group-hover:text-white'
                        }`}
                        strokeWidth={2}
                      />
                    )}
                    <span>{item.label}</span>
                    {item.badge != null && item.badge > 0 && (
                      <span className="ml-auto rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-bold text-brand-300 ring-1 ring-brand-400/30">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </motion.div>
  );
};

export default DashboardLayout;
