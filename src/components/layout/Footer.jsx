import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Globe2 } from 'lucide-react';

const COLUMNS = [
  {
    title: 'Explore',
    links: [
      { label: 'All hotels', to: '/hotels' },
      { label: 'Top rated', to: '/hotels?sort=rating' },
      { label: 'Editor's picks', to: '/hotels?featured=true' },
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

const FadeIn = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

export const Footer = () => (
  <footer className="relative z-10 mt-auto">
    {/* Gradient separator hairline */}
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      <div className="h-px bg-gradient-to-r from-transparent via-brand-400/30 to-transparent" />
    </div>

    <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <FadeIn>
          <div>
            <Link to="/" className="mb-4 flex items-center gap-2.5 group">
              <span className="relative grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 via-violet-500 to-fuchsia-500 transition-transform group-hover:scale-105">
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
              <span className="grid size-9 place-items-center rounded-full bg-white/5 text-slate-400 ring-1 ring-white/8 transition-all hover:bg-white/10 hover:text-white hover:ring-brand-400/30 hover:shadow-lg hover:shadow-brand-500/10">
                <Globe2 className="size-4" />
              </span>
              <span className="grid size-9 place-items-center rounded-full bg-white/5 text-slate-400 ring-1 ring-white/8 transition-all hover:bg-white/10 hover:text-white hover:ring-brand-400/30 hover:shadow-lg hover:shadow-brand-500/10">
                <Code2 className="size-4" />
              </span>
            </div>
          </div>
        </FadeIn>

        {COLUMNS.map((column, ci) => (
          <FadeIn key={column.title} delay={(ci + 1) * 0.08}>
            <div>
              <p className="font-label mb-4 text-[11px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
                {column.title}
              </p>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-slate-400 transition-all hover:text-white hover:translate-x-0.5"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        ))}
      </div>

      <div className="mt-12 flex flex-col gap-3 border-t border-white/6 pt-7 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
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
