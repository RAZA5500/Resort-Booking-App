import { Link } from '../lib/router';

const Footer = () => (
  <footer className="relative z-10 border-t border-white/5 mt-auto">
    <div className="container mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-5">
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center text-sm">
          🏝️
        </span>
        <span className="text-slate-400 text-sm">
          Stayscape · a React demo booking app
        </span>
      </div>

      <div className="flex items-center gap-6 text-sm text-slate-500">
        <Link to="/" className="hover:text-white transition-colors">Explore</Link>
        <Link to="/favorites" className="hover:text-white transition-colors">Saved</Link>
        <Link to="/bookings" className="hover:text-white transition-colors">Trips</Link>
      </div>
    </div>
  </footer>
);

export default Footer;
