import { Link } from 'react-router-dom';
import { Code2, Globe2 } from 'lucide-react';

const COLUMNS = [
  {
    title: 'Explore',
    links: [
      { label: 'All hotels', to: '/hotels' },
      { label: 'Top rated', to: '/hotels?sort=rating' },
      { label: 'Editor’s picks', to: '/hotels?featured=true' },
      { label: 'Europe', to: '/hotels?continent=Europe' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign in', to: '/login' },
      { label: 'Create account', to: '/register' },
      { label: 'My trips', to: '/account/trips' },
      { label: 'Saved hotels', to: '/account/saved' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Why Stayscape', to: '/about' },
      { label: 'How booking works', to: '/about#booking' },
      { label: 'For hotel teams', to: '/about#teams' },
    ],
  },
];

export const Footer = () => (
  <footer className="relative z-10 mt-auto border-t border-white/8">
    <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link to="/" className="mb-4 flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600">
              <svg viewBox="0 0 24 24" className="size-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="display text-xl text-white">Stayscape</span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-slate-500">
            Forty-four extraordinary hotels across seven regions, with live availability and
            instant confirmation.
          </p>
          <div className="mt-5 flex gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-white/5 text-slate-400 ring-1 ring-white/8">
              <Globe2 className="size-4" />
            </span>
            <span className="grid size-9 place-items-center rounded-full bg-white/5 text-slate-400 ring-1 ring-white/8">
              <Code2 className="size-4" />
            </span>
          </div>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="mb-4 text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
              {column.title}
            </p>
            <ul className="space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col gap-3 border-t border-white/8 pt-7 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Stayscape — a full-stack demo application.</p>
        <p className="max-w-xl sm:text-right">
          Hotel names and locations are real. Rates, availability, rooms and reviews are generated
          sample data, and this site is not affiliated with the properties shown.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
