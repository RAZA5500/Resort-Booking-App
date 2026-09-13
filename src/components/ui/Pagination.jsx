import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ page, pages, onChange, className = '' }) => {
  if (!pages || pages <= 1) return null;

  // Always show first, last, current and its neighbours; gaps become ellipses.
  const window = new Set([1, pages, page, page - 1, page + 1]);
  const visible = [...window].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);

  return (
    <nav className={`flex items-center justify-center gap-1.5 ${className}`} aria-label="Pagination">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="grid size-10 place-items-center rounded-full text-slate-400 transition-all duration-300 hover:bg-white/8 hover:text-white hover:scale-105 disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronLeft className="size-4" />
      </button>

      {visible.map((n, i) => (
        <span key={n} className="flex items-center gap-1.5">
          {i > 0 && visible[i - 1] !== n - 1 && <span className="px-1 text-slate-600">…</span>}
          <button
            type="button"
            onClick={() => onChange(n)}
            aria-current={n === page ? 'page' : undefined}
            className={`grid size-10 place-items-center rounded-full text-sm font-medium transition-all duration-300 ${
              n === page
                ? 'bg-gradient-to-br from-brand-500 to-violet-500 text-white shadow-lg shadow-brand-500/25'
                : 'text-slate-400 hover:bg-white/8 hover:text-white hover:scale-105'
            }`}
          >
            {n}
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        aria-label="Next page"
        className="grid size-10 place-items-center rounded-full text-slate-400 transition-all duration-300 hover:bg-white/8 hover:text-white hover:scale-105 disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
};

export default Pagination;
