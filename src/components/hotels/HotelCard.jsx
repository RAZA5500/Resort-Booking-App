import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MapPin, Zap } from 'lucide-react';
import { Rating, Badge } from '../ui/Badge';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';
import { currency, plural } from '../../lib/format';

export const HotelCard = ({ hotel, nights = 0, search, index = 0 }) => {
  const { isAuthenticated, isSaved, toggleSaved } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const saved = isSaved(hotel.id);

  const params = new URLSearchParams();
  if (search?.checkIn && search?.checkOut) {
    params.set('checkIn', search.checkIn);
    params.set('checkOut', search.checkOut);
  }
  if (search?.guests) params.set('guests', String(search.guests));
  const href = `/hotels/${hotel.id}${params.toString() ? `?${params}` : ''}`;

  const onSave = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isAuthenticated) {
      toast.info('Sign in to save hotels to your list.');
      return;
    }
    setBusy(true);
    try {
      const nowSaved = await toggleSaved(hotel.id);
      toast.success(nowSaved ? `Saved ${hotel.name}.` : `Removed ${hotel.name} from your list.`);
    } catch {
      toast.error('Could not update your saved list.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(index, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <Link
        to={href}
        className="surface block overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-1.5 hover:ring-brand-400/40 hover:shadow-2xl hover:shadow-brand-950/40"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={hotel.images[0]}
            alt={hotel.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.08]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/25 to-transparent" />

          <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {hotel.featured && (
                <Badge tone="gold" icon={Zap}>Editor’s pick</Badge>
              )}
              {!hotel.active && <Badge tone="rose">Inactive</Badge>}
            </div>

            <button
              type="button"
              onClick={onSave}
              disabled={busy}
              aria-label={saved ? `Remove ${hotel.name} from saved` : `Save ${hotel.name}`}
              aria-pressed={saved}
              className="grid size-9 shrink-0 place-items-center rounded-full bg-black/40 ring-1 ring-white/15 backdrop-blur-md transition-all hover:scale-110 hover:bg-black/60 disabled:opacity-60"
            >
              <Heart
                className={`size-4 transition-colors ${
                  saved ? 'fill-rose-500 text-rose-500' : 'text-white'
                }`}
                strokeWidth={2}
              />
            </button>
          </div>

          <div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-3">
            <p className="flex min-w-0 items-center gap-1.5 text-[13px] text-slate-300">
              <MapPin className="size-3.5 shrink-0 text-brand-300" strokeWidth={2} />
              <span className="truncate">{hotel.city}, {hotel.country}</span>
            </p>
            <Rating value={hotel.rating} count={hotel.reviewsCount} className="shrink-0" />
          </div>
        </div>

        <div className="p-5">
          <h3 className="display mb-1.5 truncate text-[22px] leading-tight text-white">
            {hotel.name}
          </h3>
          <p className="mb-4 line-clamp-2 text-[13px] leading-relaxed text-slate-400">
            {hotel.description}
          </p>

          <div className="mb-5 flex flex-wrap gap-1.5">
            {hotel.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 ring-1 ring-white/8"
              >
                {tag}
              </span>
            ))}
            <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 ring-1 ring-white/8">
              {hotel.starRating}-star
            </span>
          </div>

          <div className="flex items-end justify-between gap-3 border-t border-white/8 pt-4">
            <div>
              <p className="text-lg font-semibold text-white">
                {currency(hotel.basePrice)}
                <span className="text-[13px] font-normal text-slate-500"> / night</span>
              </p>
              {nights > 0 && (
                <p className="mt-0.5 text-xs text-brand-300">
                  {currency(hotel.basePrice * nights)} for {plural(nights, 'night')}
                </p>
              )}
            </div>
            <span className="rounded-full bg-white/8 px-4 py-2 text-[13px] font-semibold text-white ring-1 ring-white/10 transition-all group-hover:bg-white group-hover:text-ink-950">
              View
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default HotelCard;
