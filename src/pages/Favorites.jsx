import Card from '../Cards/Cards';
import { Link } from '../lib/router';
import { LISTINGS } from '../data/listings';
import { useBooking } from '../context/bookingStore';
import { plural } from '../lib/format';

const Favorites = () => {
  const { favorites } = useBooking();
  const saved = LISTINGS.filter((listing) => favorites.includes(listing.id));

  if (saved.length === 0) {
    return (
      <div className="relative z-10 container mx-auto px-6 py-28 flex flex-col items-center text-center">
        <div className="text-6xl mb-6">♡</div>
        <h1 className="text-3xl font-bold text-white mb-3">Nothing saved yet</h1>
        <p className="text-slate-400 max-w-md mb-8 leading-relaxed">
          Tap the heart on any stay to keep it here while you decide. Your list is stored on this
          device.
        </p>
        <Link
          to="/"
          className="px-6 py-3 rounded-full bg-white text-slate-900 font-semibold text-sm hover:bg-slate-200 transition-colors"
        >
          Browse stays
        </Link>
      </div>
    );
  }

  return (
    <div className="relative z-10 container mx-auto px-6 pt-10 pb-24 flex flex-col items-center">
      <div className="w-full max-w-[1400px] mb-10">
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Saved stays</h1>
        <p className="text-slate-400">{plural(saved.length, 'place')} you are keeping an eye on.</p>
      </div>

      <div className="flex flex-wrap gap-12 justify-center max-w-[1400px]">
        {saved.map((listing) => (
          <Card key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
};

export default Favorites;
