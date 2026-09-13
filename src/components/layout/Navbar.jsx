import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown, Gauge, Heart, LayoutDashboard, LogOut, Luggage, Menu, Search, User, X,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';
import { useDismiss } from '../../hooks/useApi';
import { ROLES, ROLE_LABEL } from '../../lib/constants';
import { initials } from '../../lib/format';

const PUBLIC_LINKS = [
  { to: '/hotels', label: 'Explore' },
  { to: '/hotels?sort=rating', label: 'Top rated' },
  { to: '/about', label: 'Why Stayscape' },
];

const roleHome = (user) => {
  if (user?.role === ROLES.ADMIN) return { to: '/admin', label: 'Admin', icon: LayoutDashboard };
  if (user?.role === ROLES.EMPLOYEE) return { to: '/desk', label: 'Front desk', icon: Gauge };
  return null;
};

const UserMenu = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  const workspace = roleHome(user);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full bg-white/5 py-1.5 pr-3 pl-1.5 ring-1 ring-white/10 backdrop-blur-md transition-all hover:bg-white/10 hover:ring-white/20"
      >
        <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-brand-500 via-violet-500 to-fuchsia-500 text-xs font-semibold text-white shadow-lg shadow-brand-500/20">
          {initials(user.name)}
        </span>
        <span className="hidden text-sm font-medium text-white sm:block">
          {user.name.split(' ')[0]}
        </span>
        <ChevronDown className={`size-3.5 text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, scale: 0.96, filter: 'blur(4px)' }}
            transition={{ duration: 0.2 }}
            className="glass absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl p-1.5 shadow-2xl shadow-black/60"
          >
            <div className="border-b border-white/8 px-3 py-3">
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
              <span className="mt-2 inline-block rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-semibold text-brand-300 ring-1 ring-brand-400/20">
                {ROLE_LABEL[user.role]}
              </span>
            </div>

            <div className="py-1">
              {workspace && (
                <Link
                  to={workspace.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-200 transition-all hover:bg-white/8 hover:text-white hover:translate-x-0.5"
                >
                  <workspace.icon className="size-4 text-brand-300" />
                  {workspace.label}
                </Link>
              )}
              <Link
                to="/account/trips"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-200 transition-all hover:bg-white/8 hover:text-white hover:translate-x-0.5"
              >
                <Luggage className="size-4 text-slate-400" /> My trips
              </Link>
              <Link
                to="/account/saved"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-200 transition-all hover:bg-white/8 hover:text-white hover:translate-x-0.5"
              >
                <Heart className="size-4 text-slate-400" /> Saved
              </Link>
              <Link
                to="/account/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-200 transition-all hover:bg-white/8 hover:text-white hover:translate-x-0.5"
              >
                <User className="size-4 text-slate-400" /> Profile
              </Link>
            </div>

            <div className="border-t border-white/8 pt-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
              >
                <LogOut className="size-4" /> Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Navbar = () => {
  const { user, isAuthenticated, logout, savedIds } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(() => window.scrollY > 12);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Collapse the mobile menu whenever the route changes. Tracking the path we
  // last rendered for keeps this out of an effect.
  const [menuPath, setMenuPath] = useState(location.pathname);
  if (menuPath !== location.pathname) {
    setMenuPath(location.pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  const onLogout = async () => {
    await logout();
    toast.info('Signed out. See you soon.');
    navigate('/');
  };

  const workspace = roleHome(user);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'mx-2 mt-2 rounded-2xl border border-white/[0.08] bg-ink-950/80 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:mx-4'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <Link to="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="relative grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 via-violet-500 to-fuchsia-500 shadow-lg shadow-brand-600/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-brand-500/50">
            <svg viewBox="0 0 24 24" className="size-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {/* Logo ambient glow */}
            <span className="absolute inset-0 rounded-xl bg-brand-500/40 blur-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </span>
          <span className="display text-xl text-white">Stayscape</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {PUBLIC_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                `relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  isActive && link.to === '/hotels'
                    ? 'bg-white/10 text-white shadow-sm shadow-white/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/hotels"
            aria-label="Search hotels"
            className="grid size-10 place-items-center rounded-full text-slate-400 transition-all hover:bg-white/8 hover:text-white hover:scale-105 lg:hidden"
          >
            <Search className="size-4.5" />
          </Link>

          {isAuthenticated ? (
            <>
              {workspace && (
                <Button to={workspace.to} variant="subtle" size="sm" icon={workspace.icon} className="hidden sm:inline-flex">
                  {workspace.label}
                </Button>
              )}
              <Link
                to="/account/saved"
                aria-label="Saved hotels"
                className="relative hidden size-10 place-items-center rounded-full text-slate-400 transition-all hover:bg-white/8 hover:text-white hover:scale-105 sm:grid"
              >
                <Heart className="size-4.5" />
                {savedIds.length > 0 && (
                  <span className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 text-[9px] font-bold text-white shadow-md shadow-brand-500/30">
                    {savedIds.length}
                  </span>
                )}
              </Link>
              <UserMenu user={user} onLogout={onLogout} />
            </>
          ) : (
            <>
              <Button to="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
                Sign in
              </Button>
              <Button to="/register" size="sm">Get started</Button>
            </>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
            className="grid size-10 place-items-center rounded-full text-slate-300 transition-all hover:bg-white/8 hover:scale-105 lg:hidden"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/8 bg-ink-950/95 backdrop-blur-2xl lg:hidden"
          >
            <div className="space-y-1 px-5 py-4">
              {PUBLIC_LINKS.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <Link
                    to={link.to}
                    className="block rounded-xl px-4 py-3 text-sm text-slate-300 transition-all hover:bg-white/8 hover:text-white hover:translate-x-1"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              {isAuthenticated ? (
                <>
                  {workspace && (
                    <Link to={workspace.to} className="block rounded-xl px-4 py-3 text-sm text-brand-300 hover:bg-white/8">
                      {workspace.label}
                    </Link>
                  )}
                  <Link to="/account/trips" className="block rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/8">
                    My trips
                  </Link>
                  <Link to="/account/saved" className="block rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/8">
                    Saved ({savedIds.length})
                  </Link>
                </>
              ) : (
                <div className="flex gap-3 pt-2">
                  <Button to="/login" variant="subtle" className="flex-1">Sign in</Button>
                  <Button to="/register" className="flex-1">Get started</Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
