
export const Stars = ({ value, size = 'text-xs' }) => (
  <span className={`${size} tracking-tight`} aria-label={`${value} out of 5 stars`}>
    {'★'.repeat(Math.round(value))}
    <span className="text-slate-600">{'★'.repeat(5 - Math.round(value))}</span>
  </span>
);

export const Rating = ({ value, reviews, className = '' }) => (
  <span className={`inline-flex items-center gap-1.5 text-sm ${className}`}>
    <span className="text-amber-300">★</span>
    <span className="font-medium text-white">{value.toFixed(1)}</span>
    {reviews != null && <span className="text-slate-400">({reviews})</span>}
  </span>
);

export default Rating;
