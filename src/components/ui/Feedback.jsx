import { Loader2, SearchX, TriangleAlert } from 'lucide-react';
import { Button } from './Button';

export const Spinner = ({ className = 'size-5' }) => (
  <Loader2 className={`animate-spin text-brand-400 ${className}`} />
);

export const PageLoader = ({ label = 'Loading' }) => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
    <Spinner className="size-7" />
    <p className="text-sm text-slate-500">{label}…</p>
  </div>
);

export const Skeleton = ({ className = '' }) => (
  <div className={`skeleton rounded-xl ${className}`} />
);

export const HotelCardSkeleton = () => (
  <div className="surface overflow-hidden rounded-3xl">
    <Skeleton className="aspect-[4/3] rounded-none" />
    <div className="space-y-3 p-5">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-9 w-full" />
    </div>
  </div>
);

export const RowSkeleton = ({ rows = 5 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-16 w-full" />
    ))}
  </div>
);

export const EmptyState = ({
  icon: Icon = SearchX, title, message, action, className = '',
}) => (
  <div className={`flex flex-col items-center justify-center px-6 py-20 text-center ${className}`}>
    <div className="mb-5 grid size-16 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
      <Icon className="size-7 text-slate-400" strokeWidth={1.6} />
    </div>
    <h3 className="display mb-2 text-2xl text-white">{title}</h3>
    {message && <p className="mb-7 max-w-md text-sm leading-relaxed text-slate-400">{message}</p>}
    {action}
  </div>
);

export const ErrorState = ({ error, onRetry }) => (
  <EmptyState
    icon={TriangleAlert}
    title="That did not load"
    message={error?.message || 'Something went wrong reaching the server. It may just be a hiccup.'}
    action={onRetry && <Button variant="subtle" onClick={onRetry}>Try again</Button>}
  />
);

export default Spinner;
