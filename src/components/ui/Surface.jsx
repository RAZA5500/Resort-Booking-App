import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp } from 'lucide-react';

export const Panel = ({ className = '', children, ...rest }) => (
  <div
    className={`surface rounded-3xl backdrop-blur-sm ${className}`}
    {...rest}
  >
    {children}
  </div>
);

export const SectionHeading = ({ eyebrow, title, subtitle, action, className = '' }) => (
  <div className={`mb-8 flex flex-wrap items-end justify-between gap-4 ${className}`}>
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="font-label mb-2 flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-brand-600 uppercase">
          <span className="inline-block h-px w-5 bg-gradient-to-r from-brand-400 to-transparent" />
          {eyebrow}
        </p>
      )}
      <h2 className="display text-3xl text-ink-900 sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-2 text-[15px] leading-relaxed text-ink-600">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const StatCard = ({ label, value, hint, delta, icon: Icon, tone = 'brand' }) => {
  const tones = {
    brand: 'from-brand-500/20 to-brand-600/5 text-brand-600',
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-700',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-700',
    rose: 'from-rose-500/20 to-rose-500/5 text-rose-600',
  };

  return (
    <Panel className="relative overflow-hidden p-5">
      <div className={`absolute -top-8 -right-8 size-32 rounded-full bg-gradient-to-br blur-3xl opacity-60 ${tones[tone]}`} />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-label text-[11px] font-semibold tracking-[0.14em] text-ink-500 uppercase">
            {label}
          </p>
          {Icon && <Icon className={`size-4 ${tones[tone].split(' ').pop()}`} strokeWidth={2} />}
        </div>
        <p className="text-3xl font-semibold tracking-tight text-ink-900 tabular-nums">{value}</p>
        <div className="mt-1.5 flex items-center gap-2">
          {delta != null && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium ${
                delta >= 0 ? 'text-emerald-600' : 'text-rose-400'
              }`}
            >
              {delta >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {Math.abs(delta)}%
            </span>
          )}
          {hint && <span className="text-xs text-ink-500">{hint}</span>}
        </div>
      </div>
    </Panel>
  );
};

/** Fades content in as it scrolls into view — with blur-clear for extra polish. */
export const Reveal = ({ children, delay = 0, y = 24, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y, filter: 'blur(4px)' }}
    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default Panel;
