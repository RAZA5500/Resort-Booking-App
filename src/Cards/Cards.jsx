import { Link } from '../lib/router';
import { useBooking } from '../context/bookingStore';
import { currency, plural } from '../lib/format';
import Rating from '../components/Rating';

const Card = ({ listing, nights = 0, query }) => {
  const { id, title, location, images, price, rating, reviews, tags, instantBook } = listing;
  const { isFavorite, toggleFavorite, toast } = useBooking();
  const saved = isFavorite(id);

  const onSaveClick = (event) => {
    event.preventDefault();
    toggleFavorite(id);
    toast(saved ? `Removed ${title} from your saved list.` : `Saved ${title} to your list.`, 'info');
  };

  return (
    <Link
      to={`/listing/${id}`}
      query={query}
      className="relative w-[340px] h-[480px] rounded-[32px] overflow-hidden bg-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.5)] shrink-0 group transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(79,70,229,0.2)] ring-1 ring-white/10 hover:ring-indigo-500/50 block"
    >
      <img
        src={images[0]}
        alt={title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent transition-opacity duration-500 group-hover:opacity-90" />

      {/* Top row: instant-book flag and the save toggle */}
      <div className="absolute top-5 left-5 right-5 flex items-start justify-between z-20">
        {instantBook ? (
          <span className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-400/20">
            ⚡ Instant book
          </span>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onSaveClick}
          aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
          aria-pressed={saved}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md ring-1 ring-white/15 grid place-items-center text-lg hover:bg-black/60 hover:scale-110 transition-all"
        >
          <span className={saved ? 'text-rose-400' : 'text-white/80'}>{saved ? '♥' : '♡'}</span>
        </button>
      </div>

      <div className="absolute inset-0 flex flex-col justify-end p-7 text-white z-10">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h2 className="text-[26px] font-semibold tracking-tight drop-shadow-md leading-tight">
            {title}
          </h2>
          <Rating value={rating} reviews={reviews} className="mt-1.5 shrink-0" />
        </div>

        <p className="text-sm text-slate-400 mb-4">📍 {location}</p>

        <div className="flex flex-wrap gap-2.5 mb-6 text-[13px] font-medium">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full flex items-center gap-1.5 text-slate-100 border border-white/10 shadow-sm transition-colors group-hover:bg-white/20"
            >
              {tag.icon && <span className="text-sm">{tag.icon}</span>}
              {tag.text}
            </span>
          ))}
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xl font-semibold">
              {currency(price)}
              <span className="text-sm font-normal text-slate-400"> / night</span>
            </p>
            {nights > 0 && (
              <p className="text-xs text-indigo-300 mt-0.5">
                {currency(price * nights)} for {plural(nights, 'night')}
              </p>
            )}
          </div>
          <span className="px-5 py-3 bg-white/10 backdrop-blur-lg text-white font-semibold rounded-full group-hover:bg-white group-hover:text-slate-900 transition-all duration-300 text-sm border border-white/20">
            View stay
          </span>
        </div>
      </div>
    </Link>
  );
};

export default Card;
