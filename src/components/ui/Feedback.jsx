import { Loader2, SearchX, TriangleAlert } from 'lucide-react';
import { Button } from './Button';

export const Spinner = ({ className = 'size-5' }) => (
  <Loader2 className={`animate-spin text-brand-600 ${className}`} />
);

export const PageLoader = ({ label = 'Loading' }) => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
    <Spinner className="size-8" />
    <p className="text-sm text-ink-500">{label}…</p>
  </div>
);

export const Skeleton = ({ className = '' }) => (
  <div className={`skeleton rounded-xl ${className}`} />
);

export const HotelCardSkeleton = () => (
  <div className="surface overflow-hidden rounded-3xl">
    <Skeleton className="aspect-[4/3] rounded-none" />
    <div className="space-y-3 p-5">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-10 w-full" />
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
    <div className="relative mb-5">
      <div className="grid size-16 place-items-center rounded-2xl bg-ink-900/[0.04] ring-1 ring-ink-900/10 backdrop-blur-sm">
        <Icon className="size-7 text-ink-600" strokeWidth={1.6} />
      </div>
      {/* Ambient glow behind icon */}
      <div className="absolute inset-0 rounded-2xl bg-brand-500/10 blur-2xl" />
    </div>
    <h3 className="display mb-2 text-2xl text-ink-900">{title}</h3>
    {message && <p className="mb-7 max-w-md text-sm leading-relaxed text-ink-600">{message}</p>}
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
