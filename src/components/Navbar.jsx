import { Link } from '../lib/router';
import { useRouter } from '../lib/routing';
import { useBooking } from '../context/bookingStore';

const NavLink = ({ to, active, badge, children }) => (
  <Link
    to={to}
    className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${
      active ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
    }`}
  >
    {children}
    {badge > 0 && (
      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-500 text-white text-[10px] font-bold grid place-items-center">
        {badge}
      </span>
    )}
  </Link>
);

const Navbar = () => {
  const { path } = useRouter();
  const { activeBookings, favorites } = useBooking();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
      <nav className="container mx-auto px-5 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center text-lg shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-105">
            🏝️
          </span>
          <span className="text-white font-semibold text-lg tracking-tight hidden sm:block">
            Stayscape
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <NavLink to="/" active={path === '/'}>Explore</NavLink>
          <NavLink to="/favorites" active={path === '/favorites'} badge={favorites.length}>
            Saved
          </NavLink>
          <NavLink to="/bookings" active={path === '/bookings'} badge={activeBookings.length}>
            Trips
          </NavLink>
        </div>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          <span className="text-sm text-slate-400">Guest</span>
          <span className="w-9 h-9 rounded-full bg-white/10 ring-1 ring-white/10 grid place-items-center text-sm">
            🙂
          </span>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
