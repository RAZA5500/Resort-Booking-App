import { NavLink } from 'react-router-dom';
import { ROLE_LABEL } from '../../lib/constants';
import { useAuth } from '../../context/auth-context';
import { initials } from '../../lib/format';

/**
 * Staff workspace chrome: a rail on desktop, a scrolling tab strip on mobile.
 */
export const DashboardLayout = ({ title, subtitle, nav = [], actions, children }) => {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-12">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold tracking-[0.2em] text-brand-300 uppercase">
            {ROLE_LABEL[user?.role] || 'Workspace'}
          </p>
          <h1 className="display text-4xl text-white">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">{actions}</div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[236px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="surface mb-4 hidden items-center gap-3 rounded-2xl p-4 lg:flex">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-xs font-semibold text-white">
              {initials(user?.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>

          <nav className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-brand-500/15 text-white ring-1 ring-brand-400/25'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {item.icon && <item.icon className="size-4 shrink-0" strokeWidth={2} />}
                {item.label}
                {item.badge != null && item.badge > 0 && (
                  <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
