import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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

/**
 * NavLink matches on pathname alone, so `/hotels` and `/hotels?sort=rating`
 * would both light up on either route. Score each link instead: -1 when it does
 * not apply, otherwise the number of query params it pins, so the most specific
 * matching link is the one highlighted.
 */
const matchScore = (to, location) => {
  const [path, search = ''] = to.split('?');
  if (path !== location.pathname) return -1;
  const wanted = [...new URLSearchParams(search)];
  const actual = new URLSearchParams(location.search);
  if (wanted.some(([key, value]) => actual.get(key) !== value)) return -1;
  return wanted.length;
};

const activeLink = (location) =>
  PUBLIC_LINKS.reduce(
    (best, link) => {
      const score = matchScore(link.to, location);
      return score > best.score ? { label: link.label, score } : best;
    },
    { label: null, score: -1 }
  ).label;

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
        className="flex items-center gap-2 rounded-full bg-ink-900/[0.04] py-1.5 pr-3 pl-1.5 ring-1 ring-ink-900/10 backdrop-blur-md transition-all hover:bg-ink-900/[0.07] hover:ring-ink-900/20"
      >
        <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-brand-400 via-brand-500 to-brand-600 text-xs font-semibold text-white">
          {initials(user.name)}
        </span>
        <span className="hidden text-sm font-medium text-ink-900 sm:block">
          {user.name.split(' ')[0]}
        </span>
        <ChevronDown className={`size-3.5 text-ink-600 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, scale: 0.96, filter: 'blur(4px)' }}
            transition={{ duration: 0.2 }}
            className="glass absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl p-1.5 shadow-2xl shadow-ink-900/12"
          >
            <div className="border-b border-ink-900/10 px-3 py-3">
              <p className="truncate text-sm font-medium text-ink-900">{user.name}</p>
              <p className="truncate text-xs text-ink-500">{user.email}</p>
              <span className="mt-2 inline-block rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-semibold text-brand-600 ring-1 ring-brand-400/20">
                {ROLE_LABEL[user.role]}
              </span>
            </div>

            <div className="py-1">
              {workspace && (
                <Link
                  to={workspace.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-800 transition-all hover:bg-ink-900/[0.06] hover:text-ink-900 hover:translate-x-0.5"
                >
                  <workspace.icon className="size-4 text-brand-600" />
                  {workspace.label}
                </Link>
              )}
              <Link
                to="/account/trips"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-800 transition-all hover:bg-ink-900/[0.06] hover:text-ink-900 hover:translate-x-0.5"
              >
                <Luggage className="size-4 text-ink-600" /> My trips
              </Link>
              <Link
                to="/account/saved"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-800 transition-all hover:bg-ink-900/[0.06] hover:text-ink-900 hover:translate-x-0.5"
              >
                <Heart className="size-4 text-ink-600" /> Saved
              </Link>
              <Link
                to="/account/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-800 transition-all hover:bg-ink-900/[0.06] hover:text-ink-900 hover:translate-x-0.5"
              >
                <User className="size-4 text-ink-600" /> Profile
              </Link>
            </div>

            <div className="border-t border-ink-900/10 pt-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-700 transition-colors hover:bg-rose-500/10 hover:text-rose-600"
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

  const current = activeLink(location);

  // Collapse the mobile menu whenever the route changes. Tracking the location
  // we last rendered for keeps this out of an effect. The query string is part
  // of that key — /hotels and /hotels?sort=rating are different destinations.
  const here = location.pathname + location.search;
  const [menuPath, setMenuPath] = useState(here);
  if (menuPath !== here) {
    setMenuPath(here);
    if (mobileOpen) setMobileOpen(false);
  }

  const onLogout = async () => {
    await logout();
    toast.info('Signed out. See you soon.');
    navigate('/');
  };

  const workspace = roleHome(user);

  return (
    // A sticky header still occupies normal flow, so the scrolled state must
    // not change its box. The old version toggled `mx-2 mt-2` and a 1px border,
    // which grew the header by 10px the moment you crossed 12px of scroll and
    // shoved the whole page down — animated over 500ms by `transition-all`.
    // The spacing is now constant and the outline is a ring (a box-shadow, so
    // it never takes up space); only colour and shadow animate.
    <header className="sticky top-0 z-50 px-2 pt-2 sm:px-4">
      <div
        className={`rounded-2xl ring-1 transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
          scrolled
            ? 'bg-paper-50/85 shadow-2xl shadow-ink-900/10 ring-ink-900/10 backdrop-blur-2xl'
            : 'bg-transparent ring-transparent'
        }`}
      >
        <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <Link to="/" className="group flex shrink-0 items-center gap-2.5">
            <span className="relative grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-brand-600 shadow-sm shadow-brand-900/20 transition-transform duration-300 group-hover:scale-105">
              <svg viewBox="0 0 24 24" className="size-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="display text-xl text-ink-900">Stayscape</span>
          </Link>
  
          <div className="hidden items-center gap-1 lg:flex">
            {PUBLIC_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                aria-current={current === link.label ? 'page' : undefined}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  current === link.label
                    ? 'bg-ink-900/[0.07] text-ink-900 shadow-sm shadow-ink-900/5'
                    : 'text-ink-600 hover:text-ink-900 hover:bg-ink-900/[0.04]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
  
          <div className="flex items-center gap-2">
            <Link
              to="/hotels"
              aria-label="Search hotels"
              className="grid size-10 place-items-center rounded-full text-ink-600 transition-all hover:bg-ink-900/[0.06] hover:text-ink-900 hover:scale-105 lg:hidden"
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
                  className="relative hidden size-10 place-items-center rounded-full text-ink-600 transition-all hover:bg-ink-900/[0.06] hover:text-ink-900 hover:scale-105 sm:grid"
                >
                  <Heart className="size-4.5" />
                  {savedIds.length > 0 && (
                    <span className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-[9px] font-bold text-white shadow-md shadow-brand-500/30">
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
              className="grid size-10 place-items-center rounded-full text-ink-700 transition-all hover:bg-ink-900/[0.06] hover:scale-105 lg:hidden"
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
              className="overflow-hidden rounded-b-2xl border-t border-ink-900/10 bg-paper-50/95 backdrop-blur-2xl lg:hidden"
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
                      className="block rounded-xl px-4 py-3 text-sm text-ink-700 transition-all hover:bg-ink-900/[0.06] hover:text-ink-900 hover:translate-x-1"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                {isAuthenticated ? (
                  <>
                    {workspace && (
                      <Link to={workspace.to} className="block rounded-xl px-4 py-3 text-sm text-brand-600 hover:bg-ink-900/[0.06]">
                        {workspace.label}
                      </Link>
                    )}
                    <Link to="/account/trips" className="block rounded-xl px-4 py-3 text-sm text-ink-700 hover:bg-ink-900/[0.06]">
                      My trips
                    </Link>
                    <Link to="/account/saved" className="block rounded-xl px-4 py-3 text-sm text-ink-700 hover:bg-ink-900/[0.06]">
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
      </div>
    </header>
  );
};

export default Navbar;
