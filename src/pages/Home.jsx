import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, BadgeCheck, CalendarCheck, CreditCard, Globe2, ShieldCheck, Sparkles, Star,
} from 'lucide-react';
import { SearchPanel } from '../components/search/SearchPanel';
import { HotelCard } from '../components/hotels/HotelCard';
import { Button } from '../components/ui/Button';
import { Panel, Reveal, SectionHeading } from '../components/ui/Surface';
import { HotelCardSkeleton } from '../components/ui/Feedback';
import { useApi } from '../hooks/useApi';
import { hotels as hotelApi } from '../api/endpoints';
import { CONTINENT_ICON } from '../lib/constants';
import { currency, nightsBetween } from '../lib/format';

const STEPS = [
  {
    icon: Globe2,
    title: 'Find the place',
    body: 'Filter 44 hotels by region, style, rate and amenities — or just type a city and see what comes back.',
  },
  {
    icon: CalendarCheck,
    title: 'Pick real dates',
    body: 'The calendar knows what is already booked. Sold-out nights are struck out before you get attached to them.',
  },
  {
    icon: CreditCard,
    title: 'Confirm in a minute',
    body: 'Your total is priced on the server, your confirmation code is issued instantly, and the trip lands in your account.',
  },
];

const HeroCollage = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 600], [0, -60]);
  const y2 = useTransform(scrollY, [0, 600], [0, -110]);

  const shots = [
    { src: 'https://picsum.photos/seed/ritz-paris-a/600/800', cls: 'top-0 right-[8%] w-40 sm:w-52', y: y1 },
    { src: 'https://picsum.photos/seed/soneva-fushi-maldives-a/600/800', cls: 'top-32 right-[32%] w-32 sm:w-40', y: y2 },
    { src: 'https://picsum.photos/seed/aman-tokyo-a/600/800', cls: 'top-16 left-[6%] w-36 sm:w-48', y: y2 },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden overflow-hidden xl:block">
      {shots.map((shot) => (
        <motion.div
          key={shot.src}
          style={{ y: shot.y }}
          className={`absolute ${shot.cls} overflow-hidden rounded-2xl opacity-25 ring-1 ring-ink-900/10 shadow-2xl shadow-ink-900/[0.08]`}
        >
          <img src={shot.src} alt="" className="aspect-[3/4] w-full object-cover" />
          {/* Luminous top edge */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ink-900/18 to-transparent" />
        </motion.div>
      ))}
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState({
    destination: '', checkIn: null, checkOut: null, guests: 2,
  });

  const { data: facets } = useApi(() => hotelApi.facets(), []);
  const { data: featured, loading: loadingFeatured } = useApi(
    () => hotelApi.list({ featured: true, limit: 6 }),
    []
  );
  const { data: topRated } = useApi(() => hotelApi.list({ sort: 'rating', limit: 4 }), []);

  const runSearch = (value) => {
    const params = new URLSearchParams();
    if (value.destination) params.set('q', value.destination);
    if (value.checkIn && value.checkOut) {
      params.set('checkIn', value.checkIn);
      params.set('checkOut', value.checkOut);
    }
    if (value.guests !== 1) params.set('guests', String(value.guests));
    navigate(`/hotels?${params.toString()}`);
  };

  const nights = nightsBetween(search.checkIn, search.checkOut);

  return (
    <>
      {/* ------------------------------------------------------------- hero */}
      <section className="relative overflow-hidden px-5 pt-14 pb-20 sm:px-8 lg:pt-28">
        <HeroCollage />

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full bg-ink-900/[0.04] px-4 py-2 text-[13px] text-brand-700 ring-1 ring-ink-900/10 backdrop-blur-md shadow-lg shadow-ink-900/5"
          >
            <Sparkles className="size-3.5 text-gold-400" />
            {facets?.total ?? 44} hotels · {facets?.continents?.length ?? 7} regions · live availability
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="display mb-6 text-[clamp(2.75rem,7vw,5.25rem)] leading-[0.95] text-balance text-ink-900"
          >
            The world's best hotels,
            <span className="text-shimmer block">booked in a minute.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16 }}
            className="mx-auto mb-10 max-w-2xl text-[17px] leading-relaxed text-balance text-ink-600"
          >
            From a palace on the Bosphorus to a glass igloo under the aurora — search real
            availability, hold your dates, and get your confirmation instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24 }}
            className="mx-auto max-w-3xl"
          >
            <SearchPanel value={search} onChange={setSearch} onSubmit={runSearch} />
            {nights > 0 && (
              <p className="mt-4 text-sm text-ink-500">
                Searching {nights} night{nights === 1 ? '' : 's'} for {search.guests} guest
                {search.guests === 1 ? '' : 's'}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[13px] text-ink-500"
          >
            <span className="flex items-center gap-2 rounded-full bg-ink-900/[0.03] px-3 py-1.5 ring-1 ring-ink-900/10 backdrop-blur-sm">
              <ShieldCheck className="size-4 text-emerald-600 " /> Free cancellation up to 48h
            </span>
            <span className="flex items-center gap-2 rounded-full bg-ink-900/[0.03] px-3 py-1.5 ring-1 ring-ink-900/10 backdrop-blur-sm">
              <BadgeCheck className="size-4 text-brand-600 " /> Instant confirmation
            </span>
            <span className="flex items-center gap-2 rounded-full bg-ink-900/[0.03] px-3 py-1.5 ring-1 ring-ink-900/10 backdrop-blur-sm">
              <Star className="size-4 fill-gold-400 text-gold-400 " /> 4.8 average guest rating
            </span>
          </motion.div>
        </div>
      </section>

      {/* -------------------------------------------------------- featured */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Editor's picks"
            title="Places worth rearranging a year for"
            subtitle="A short list from the collection — the ones guests write home about."
            action={
              <Button to="/hotels" variant="subtle" size="sm" iconRight={ArrowRight}>
                See all {facets?.total ?? 44}
              </Button>
            }
          />
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loadingFeatured
            ? Array.from({ length: 6 }).map((_, i) => <HotelCardSkeleton key={i} />)
            : featured?.hotels.map((hotel, i) => (
                <HotelCard key={hotel.id} hotel={hotel} index={i} search={search} nights={nights} />
              ))}
        </div>
      </section>

      {/* --------------------------------------------------------- regions */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="By region"
            title="Seven regions, one checkout"
            subtitle="Every property is bookable with the same flow, the same fee structure and the same cancellation policy."
          />
        </Reveal>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(facets?.continents || []).map(({ value, total }, i) => (
            <Reveal key={value} delay={i * 0.04}>
              <Link
                to={`/hotels?continent=${encodeURIComponent(value)}`}
                className="surface group flex items-center justify-between gap-4 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-ink-900/[0.06] hover:shadow-lg hover:shadow-brand-950/20"
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">{CONTINENT_ICON[value] || '📍'}</span>
                  <span>
                    <span className="block font-medium text-ink-900">{value}</span>
                    <span className="block text-xs text-ink-500">{total} hotels</span>
                  </span>
                </span>
                <ArrowRight className="size-4 text-ink-500 transition-all duration-300 group-hover:translate-x-1 group-hover:text-brand-600" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------- how it works */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <p className="font-label mb-2 flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-brand-600 uppercase">
              <span className="inline-block h-px w-5 bg-gradient-to-r from-brand-400 to-transparent" />
              How it works
            </p>
            <h2 className="display mb-4 text-4xl text-ink-900">
              Three steps, no surprises at the end
            </h2>
            <p className="mb-8 leading-relaxed text-ink-600">
              The price you see in the summary is the price the server charges — it is recomputed
              from the room rate on every booking, so a stale tab can never quote you the wrong
              total.
            </p>
            <Button to="/hotels" iconRight={ArrowRight}>Start searching</Button>
          </Reveal>

          <div className="space-y-3">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.08}>
                <Panel className="flex gap-5 p-6 transition-all duration-300 hover:bg-ink-900/[0.05]">
                  <span className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-600 ring-1 ring-brand-400/20">
                    <step.icon className="size-5" strokeWidth={1.8} />
                    {/* Step number */}
                    <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-ink-950 text-[10px] font-bold text-brand-600 ring-1 ring-brand-400/30">
                      {i + 1}
                    </span>
                  </span>
                  <div>
                    <p className="mb-1.5 font-semibold text-ink-900">
                      {step.title}
                    </p>
                    <p className="text-sm leading-relaxed text-ink-600">{step.body}</p>
                  </div>
                </Panel>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- top rated */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Highest rated"
            title="What guests scored best"
            action={
              <Button to="/hotels?sort=rating" variant="ghost" size="sm" iconRight={ArrowRight}>
                All top rated
              </Button>
            }
          />
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {topRated?.hotels.map((hotel, i) => (
            <HotelCard key={hotel.id} hotel={hotel} index={i} search={search} nights={nights} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- cta */}
      <section className="mx-auto max-w-7xl px-5 pt-8 pb-24 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] p-10 ring-1 ring-pine-700 sm:p-16" style={{
            background: 'linear-gradient(135deg, #2f6f67 0%, #1f4f4a 55%, #163a36 100%)',
          }}>
            
            <div className="relative max-w-2xl">
              <h2 className="display mb-4 text-4xl text-white sm:text-5xl">
                Create an account and your trips follow you everywhere.
              </h2>
              <p className="mb-8 text-[15px] leading-relaxed text-pine-100">
                Saved hotels, booking history, confirmation codes and cancellations — all in one
                place. Hotel staff and administrators get their own workspace on the same account
                system.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button to="/register" size="lg" iconRight={ArrowRight}>Create free account</Button>
                <Button to="/login" size="lg" variant="outline">
                  Try a demo login
                </Button>
              </div>
              {facets && (
                <p className="mt-8 text-sm text-ink-600">
                  Rates from{' '}
                  <span className="font-semibold text-ink-900">
                    {currency(facets.priceRange.min)}
                  </span>{' '}
                  to {currency(facets.priceRange.max)} a night.
                </p>
              )}
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
};

export default Home;
