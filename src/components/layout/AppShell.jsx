import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PageLoader } from '../ui/Feedback';

/** Five-orb aurora field with staggered float and hue — creates a living, breathing background. */
const Backdrop = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
    {/* Primary indigo orb — top-left anchor */}
    <div className="absolute -top-40 -left-40 size-[42rem] rounded-full bg-brand-600/[0.14] blur-[160px] animate-float-slow" />
    {/* Violet orb — right drift */}
    <div
      className="absolute top-1/4 -right-48 size-[46rem] rounded-full bg-violet-600/[0.10] blur-[180px] animate-float-slow-alt"
      style={{ animationDelay: '-5s' }}
    />
    {/* Rose accent — warm center glow */}
    <div
      className="absolute top-1/2 left-1/4 size-[30rem] rounded-full bg-rose-600/[0.06] blur-[140px] animate-aurora"
      style={{ animationDelay: '-8s' }}
    />
    {/* Amber accent — bottom warmth */}
    <div
      className="absolute bottom-[-10%] right-1/3 size-[34rem] rounded-full bg-amber-600/[0.05] blur-[150px] animate-float-slow"
      style={{ animationDelay: '-12s' }}
    />
    {/* Cyan highlight — top-right celestial accent */}
    <div
      className="absolute -top-20 right-1/4 size-[28rem] rounded-full bg-sky-600/[0.06] blur-[130px] animate-float-slow-alt"
      style={{ animationDelay: '-3s' }}
    />

    {/* Luminous ceiling radial — gives the top of the page a soft glow. */}
    <div
      className="absolute inset-x-0 top-0 h-[60vh]"
      style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, color-mix(in oklab, var(--color-brand-500) 8%, transparent), transparent)',
      }}
    />

    {/* Dot grid — subtle structure texture, masked to fade away. */}
    <div
      className="absolute inset-0 opacity-[0.12]"
      style={{
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.4) 1px, transparent 0)',
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse at 50% 0%, #000 20%, transparent 70%)',
      }}
    />
  </div>
);

export const AppShell = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <div className="relative flex min-h-screen flex-col">
      <Backdrop />
      <Navbar />
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex-1"
      >
        <Suspense fallback={<PageLoader label="Loading" />}>
          <Outlet />
        </Suspense>
      </motion.main>
      <Footer />
    </div>
  );
};

export default AppShell;
