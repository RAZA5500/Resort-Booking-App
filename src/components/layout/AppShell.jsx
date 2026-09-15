import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PageLoader } from '../ui/Feedback';

export const AppShell = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  // Flat paper ground — the depth comes from the card surfaces, not from the
  // background. (The old build layered five floating blur orbs, a dot grid and
  // a film-grain overlay here.)
  return (
    <div className="flex min-h-screen flex-col bg-paper-100">
      <Navbar />
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1"
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
