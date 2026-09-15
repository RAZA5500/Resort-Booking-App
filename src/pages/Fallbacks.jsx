import { motion } from 'framer-motion';
import { Compass, Home, Hotel, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/Feedback';
import { useAuth } from '../context/auth-context';
import { ROLE_LABEL } from '../lib/constants';

export const NotFound = () => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="relative mx-auto max-w-2xl px-5 py-28 text-center"
  >
    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-72 rounded-full bg-brand-500/10 blur-3xl" />
    <div className="relative">
      <div className="font-label mx-auto mb-4 inline-flex items-center rounded-full bg-ink-900/[0.04] px-3.5 py-1 text-xs font-semibold tracking-widest text-ink-600 uppercase ring-1 ring-ink-900/10">
        Error 404 · Destination not found
      </div>
      <EmptyState
        icon={Compass}
        title="That page does not exist"
        message="The link may be out of date, or the destination may have been removed from the Stayscape collection."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button to="/">
              <Home className="mr-1.5 size-4" /> Back home
            </Button>
            <Button to="/hotels" variant="subtle">
              <Hotel className="mr-1.5 size-4" /> Browse hotels
            </Button>
          </div>
        }
      />
    </div>
  </motion.div>
);

export const Forbidden = () => {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto max-w-2xl px-5 py-28 text-center"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-72 rounded-full bg-rose-500/10 blur-3xl" />
      <div className="relative">
        <div className="font-label mx-auto mb-4 inline-flex items-center rounded-full bg-rose-500/10 px-3.5 py-1 text-xs font-semibold tracking-widest text-rose-600 uppercase ring-1 ring-rose-500/20">
          Access Restricted · 403
        </div>
        <EmptyState
          icon={ShieldAlert}
          title="Not your workspace"
          message={
            user
              ? `You are signed in as ${ROLE_LABEL[user.role].toLowerCase()}, which does not have access to this portal area. The server will also protect this endpoint.`
              : 'You need to sign in with an account that possesses the required permissions for this area.'
          }
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button to="/hotels">Browse hotels</Button>
              {user && (
                <Button to="/account/trips" variant="subtle">
                  My trips
                </Button>
              )}
            </div>
          }
        />
      </div>
    </motion.div>
  );
};

export default NotFound;
