import { Star } from 'lucide-react';
import { STATUS_META } from '../../lib/constants';

const TONES = {
  indigo: 'bg-brand-500/15 text-brand-300 ring-brand-400/25 shadow-brand-500/5',
  emerald: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/25 shadow-emerald-500/5',
  amber: 'bg-amber-500/15 text-amber-300 ring-amber-400/25 shadow-amber-500/5',
  rose: 'bg-rose-500/15 text-rose-300 ring-rose-400/25 shadow-rose-500/5',
  slate: 'bg-white/8 text-slate-300 ring-white/12 shadow-white/5',
  gold: 'bg-gold-400/12 text-gold-300 ring-gold-400/25 shadow-gold-400/5',
};

export const Badge = ({ tone = 'slate', icon: Icon, className = '', children }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 shadow-sm backdrop-blur-sm ${TONES[tone]} ${className}`}
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
          className={`${size} transition-colors ${i < Math.round(value) ? 'fill-gold-400 text-gold-400' : 'text-white/15'}`}
          strokeWidth={1.5}
        />
      ))}
    </span>
    {showValue && <span className="text-sm font-medium text-white">{Number(value).toFixed(1)}</span>}
    {count != null && <span className="text-sm text-slate-500">({count})</span>}
  </span>
);

export const Rating = ({ value, count, className = '' }) => (
  <span className={`inline-flex items-center gap-1.5 text-sm ${className}`}>
    <Star className="size-3.5 fill-gold-400 text-gold-400 drop-shadow-[0_0_4px_rgba(234,188,107,0.3)]" strokeWidth={0} />
    <span className="font-semibold text-white">{Number(value || 0).toFixed(1)}</span>
    {count != null && <span className="text-slate-500">({count})</span>}
  </span>
);

export default Badge;
