import { Star } from 'lucide-react';
import { STATUS_META } from '../../lib/constants';

// Flat tint + firm ring + dark label — the dark build's pale 300-weight text
// on a 15% fill is unreadable once the ground is paper.
const TONES = {
  indigo: 'bg-brand-100 text-brand-700 ring-brand-200',
  emerald: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  amber: 'bg-amber-100 text-amber-800 ring-amber-200',
  rose: 'bg-rose-100 text-rose-700 ring-rose-200',
  slate: 'bg-paper-200 text-ink-700 ring-ink-900/10',
  gold: 'bg-gold-200/50 text-gold-500 ring-gold-300/70',
};

export const Badge = ({ tone = 'slate', icon: Icon, className = '', children }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${TONES[tone]} ${className}`}
  >
    {Icon && <Icon className="size-3" strokeWidth={2.4} />}
    {children}
  </span>
);

export const StatusBadge = ({ status, className }) => {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <Badge tone={meta.tone} className={className}>
      {meta.label}
    </Badge>
  );
};

export const Stars = ({ value = 0, size = 'size-3.5', showValue = false, count }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className="inline-flex" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${size} transition-colors ${i < Math.round(value) ? 'fill-gold-400 text-gold-400' : 'text-ink-900/15'}`}
          strokeWidth={1.5}
        />
      ))}
    </span>
    {showValue && <span className="text-sm font-medium text-ink-900">{Number(value).toFixed(1)}</span>}
    {count != null && <span className="text-sm text-ink-500">({count})</span>}
  </span>
);

/** `onImage` flips the type to light — the card overlay sits on a photo, where
 *  the page's ink colours are invisible. */
export const Rating = ({ value, count, onImage = false, className = '' }) => (
  <span className={`inline-flex items-center gap-1.5 text-sm ${className}`}>
    <Star className="size-3.5 fill-gold-300 text-gold-300" strokeWidth={0} />
    <span className={`font-semibold ${onImage ? 'text-white' : 'text-ink-900'}`}>
      {Number(value || 0).toFixed(1)}
    </span>
    {count != null && (
      <span className={onImage ? 'text-white/75' : 'text-ink-500'}>({count})</span>
    )}
  </span>
);

export default Badge;
