import { motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import { HotelCard } from '../../components/hotels/HotelCard';
import { Button } from '../../components/ui/Button';
import { Panel } from '../../components/ui/Surface';
import { EmptyState, ErrorState, HotelCardSkeleton } from '../../components/ui/Feedback';
import { useApi } from '../../hooks/useApi';
import { favorites as favApi } from '../../api/endpoints';
import { useAuth } from '../../context/auth-context';

const Saved = () => {
  const { savedIds } = useAuth();
  const { data, loading, error, refetch } = useApi(() => favApi.list(), [savedIds.length]);

  if (error) return <ErrorState error={error} onRetry={refetch} />;

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <HotelCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!data?.hotels.length) {
    return (
      <Panel className="surface-elevated">
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          message="Tap the heart on any hotel to keep it here while you decide. Saved hotels sync seamlessly to your account across devices."
          action={<Button to="/hotels">Browse hotel collection</Button>}
        />
      </Panel>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm text-slate-400">
          <Sparkles className="size-4 text-gold-400" />
          <span>
            <strong className="font-semibold text-white">{data.hotels.length}</strong>{' '}
            {data.hotels.length === 1 ? 'property' : 'properties'} saved to your wishlist
          </span>
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {data.hotels.map((hotel, i) => (
          <HotelCard key={hotel.id} hotel={hotel} index={i} />
        ))}
      </div>
    </div>
  );
};

export default Saved;
