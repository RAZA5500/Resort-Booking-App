import { Heart } from 'lucide-react';
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
        {Array.from({ length: 3 }).map((_, i) => <HotelCardSkeleton key={i} />)}
      </div>
    );
  }

  if (!data?.hotels.length) {
    return (
      <Panel>
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          message="Tap the heart on any hotel to keep it here while you decide. Saved hotels sync to your account, not just this browser."
          action={<Button to="/hotels">Browse hotels</Button>}
        />
      </Panel>
    );
  }

  return (
    <>
      <p className="mb-6 text-sm text-slate-400">
        {data.hotels.length} {data.hotels.length === 1 ? 'hotel' : 'hotels'} on your list.
      </p>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {data.hotels.map((hotel, i) => (
          <HotelCard key={hotel.id} hotel={hotel} index={i} />
        ))}
      </div>
    </>
  );
};

export default Saved;
