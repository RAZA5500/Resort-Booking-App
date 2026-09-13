import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PageLoader } from '../ui/Feedback';

/** Ambient gradient field that sits behind every page. */
const Backdrop = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
    <div className="absolute -top-40 -left-40 size-[38rem] rounded-full bg-brand-600/15 blur-[140px] animate-float-slow" />
    <div className="absolute top-1/3 -right-52 size-[42rem] rounded-full bg-violet-600/12 blur-[160px]" />
    <div className="absolute bottom-0 left-1/3 size-[34rem] rounded-full bg-sky-700/8 blur-[130px]" />
    <div
      className="absolute inset-0 opacity-[0.15]"
      style={{
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.35) 1px, transparent 0)',
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse at 50% 0%, #000 20%, transparent 75%)',
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
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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
