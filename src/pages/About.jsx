import {
  ArrowRight, Building2, Database, Gauge, KeyRound, LayoutDashboard, Lock,
  ServerCog, ShieldCheck, User,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Panel, Reveal, SectionHeading } from '../components/ui/Surface';
import { Badge } from '../components/ui/Badge';
import { DEMO_ACCOUNTS } from '../lib/constants';

const STACK = [
  { label: 'React 19 + Vite', detail: 'Routing with React Router, animation with Framer Motion, charts with Recharts.' },
  { label: 'Tailwind CSS v4', detail: 'A token-driven design system defined in one @theme block.' },
  { label: 'Express 5 API', detail: 'REST endpoints for hotels, bookings, users, favourites and statistics.' },
  { label: 'JWT + bcrypt', detail: 'Short-lived access tokens in memory, rotating refresh tokens in an httpOnly cookie.' },
  { label: 'JSON document store', detail: 'Atomic temp-file writes, repository-shaped so a real database swaps in cleanly.' },
];

const ROLE_ROWS = [
  {
    icon: User,
    role: 'Guest',
    can: ['Search and filter 44 hotels', 'Book, cancel and review stays', 'Save hotels to an account-synced list'],
    cannot: ['See anyone else’s booking', 'Change a booking status'],
  },
  {
    icon: Gauge,
    role: 'Front desk',
    can: ['Work today’s arrivals, in-house and departures', 'Check guests in and out', 'Search every reservation at their hotel'],
    cannot: ['Touch bookings at another property', 'Create or edit hotels or accounts'],
  },
  {
    icon: LayoutDashboard,
    role: 'Administrator',
    can: ['Revenue, occupancy and pipeline analytics', 'Full hotel CRUD and publishing', 'Create staff, change roles, reset passwords'],
    cannot: ['Demote or deactivate the last active admin', 'Change their own role'],
  },
];

const SECURITY = [
  {
    icon: Lock,
    title: 'Passwords are never stored',
    body: 'Only a bcrypt hash is kept. The login endpoint returns one message whether the email is unknown or the password is wrong, so it cannot be used to enumerate accounts.',
  },
  {
    icon: KeyRound,
    title: 'Tokens are split by lifetime',
    body: 'A 15-minute access token lives in JavaScript memory and never touches localStorage. The 7-day refresh token is an httpOnly cookie the page cannot read, and it rotates on every use.',
  },
  {
    icon: ShieldCheck,
    title: 'The client is not the gate',
    body: 'Route guards only shape navigation. Every endpoint re-checks the role and the hotel posting on the server, so forging a role in the browser buys nothing.',
  },
  {
    icon: ServerCog,
    title: 'Money is computed server-side',
    body: 'The client never sends a total. Rates, discounts, fees and tax are recalculated from the room record on every booking, and availability is re-checked at the moment of purchase.',
  },
];

const About = () => (
  <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
    <header className="mb-16 max-w-3xl">
      <Badge tone="indigo" className="mb-5">How it is built</Badge>
      <h1 className="display mb-5 text-5xl leading-tight text-balance text-white sm:text-6xl">
        A full-stack booking platform, not a mockup.
      </h1>
      <p className="text-lg leading-relaxed text-slate-400">
        Stayscape has a real API, real accounts, real authorisation and a persistent database.
        Three roles share one sign-in, and every screen you see is driven by data the server
        actually holds.
      </p>
    </header>

    <section id="booking" className="mb-20">
      <Reveal>
        <SectionHeading
          eyebrow="The stack"
          title="What it runs on"
          subtitle="Two processes: a Vite dev server for the client and an Express API, with requests proxied so the browser stays on one origin."
        />
      </Reveal>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {STACK.map((item, i) => (
          <Reveal key={item.label} delay={i * 0.05}>
            <Panel className="h-full p-5">
              <p className="mb-2 font-medium text-white">{item.label}</p>
              <p className="text-sm leading-relaxed text-slate-400">{item.detail}</p>
            </Panel>
          </Reveal>
        ))}
      </div>
    </section>

    <section id="teams" className="mb-20">
      <Reveal>
        <SectionHeading
          eyebrow="Authorisation"
          title="Three roles, one account system"
          subtitle="Permissions are enforced per endpoint. The lists below are what the server allows, not just what the menu shows."
        />
      </Reveal>

      <div className="grid gap-4 lg:grid-cols-3">
        {ROLE_ROWS.map((row, i) => (
          <Reveal key={row.role} delay={i * 0.06}>
            <Panel className="flex h-full flex-col p-6">
              <span className="mb-4 grid size-11 place-items-center rounded-xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-400/20">
                <row.icon className="size-5" strokeWidth={1.8} />
              </span>
              <h3 className="display mb-4 text-2xl text-white">{row.role}</h3>

              <ul className="mb-5 space-y-2">
                {row.can.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm text-slate-300">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>

              <ul className="mt-auto space-y-2 border-t border-white/8 pt-4">
                {row.cannot.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm text-slate-500">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-rose-400/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </Panel>
          </Reveal>
        ))}
      </div>
    </section>

    <section className="mb-20">
      <Reveal>
        <SectionHeading eyebrow="Security" title="The parts that actually matter" />
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2">
        {SECURITY.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.05}>
            <Panel className="flex h-full gap-4 p-6">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/5 text-brand-300 ring-1 ring-white/8">
                <item.icon className="size-5" strokeWidth={1.8} />
              </span>
              <div>
                <p className="mb-2 font-medium text-white">{item.title}</p>
                <p className="text-sm leading-relaxed text-slate-400">{item.body}</p>
              </div>
            </Panel>
          </Reveal>
        ))}
      </div>
    </section>

    <section className="mb-20">
      <Reveal>
        <SectionHeading
          eyebrow="The data"
          title="Where the hotels come from"
          subtitle="Names, cities and countries are real properties. Everything commercial is generated."
        />
      </Reveal>

      <Reveal>
        <Panel className="flex flex-col gap-6 p-8 sm:flex-row">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/20">
            <Database className="size-6" strokeWidth={1.8} />
          </span>
          <div className="space-y-4 text-sm leading-relaxed text-slate-400">
            <p>
              The catalogue lists 44 genuine hotels across seven regions — from The Ritz Paris to
              Huka Lodge — because a demo full of invented names never feels like a real product.
            </p>
            <p>
              Rates, room inventory, availability, guest reviews and ratings are all generated
              sample data. Photography is procedurally seeded rather than scraped from the
              properties. <span className="text-slate-300">Stayscape is not affiliated with, endorsed by,
              or connected to any hotel shown, and nothing here can be used to book a real room.</span>
            </p>
            <p>
              Reseeding the database with <code className="rounded bg-white/8 px-1.5 py-0.5 text-xs text-slate-300">npm run seed</code>{' '}
              rebuilds the whole dataset deterministically, including a live front-desk day for the
              two staffed hotels.
            </p>
          </div>
        </Panel>
      </Reveal>
    </section>

    <section>
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600/30 via-violet-700/20 to-ink-900 p-10 ring-1 ring-white/10 sm:p-14">
          <div className="absolute -top-24 -right-20 size-72 rounded-full bg-brand-500/25 blur-3xl" />
          <div className="relative">
            <Building2 className="mb-5 size-8 text-brand-300" strokeWidth={1.6} />
            <h2 className="display mb-4 text-4xl text-white">Try all three roles</h2>
            <p className="mb-8 max-w-xl leading-relaxed text-slate-300">
              Each demo account is pre-seeded with data, so every dashboard has something real on
              it the moment you sign in.
            </p>

            <div className="mb-8 grid gap-3 sm:grid-cols-3">
              {DEMO_ACCOUNTS.map((account) => (
                <div key={account.role} className="rounded-2xl bg-ink-950/40 p-4 ring-1 ring-white/10">
                  <p className="mb-1 text-sm font-semibold text-white capitalize">{account.role}</p>
                  <p className="mb-2 text-xs text-slate-400">{account.blurb}</p>
                  <p className="font-mono text-[11px] break-all text-slate-500">{account.email}</p>
                  <p className="font-mono text-[11px] text-slate-500">{account.password}</p>
                </div>
              ))}
            </div>

            <Button to="/login" size="lg" iconRight={ArrowRight}>Open the sign-in page</Button>
          </div>
        </div>
      </Reveal>
    </section>
  </div>
);

export default About;
