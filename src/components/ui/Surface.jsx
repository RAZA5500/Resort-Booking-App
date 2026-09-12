import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp } from 'lucide-react';

export const Panel = ({ className = '', children, ...rest }) => (
  <div className={`surface rounded-3xl ${className}`} {...rest}>
    {children}
  </div>
);

export const SectionHeading = ({ eyebrow, title, subtitle, action, className = '' }) => (
  <div className={`mb-8 flex flex-wrap items-end justify-between gap-4 ${className}`}>
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="mb-2 text-[11px] font-semibold tracking-[0.2em] text-brand-300 uppercase">
          {eyebrow}
        </p>
      )}
      <h2 className="display text-3xl text-white sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-2 text-[15px] leading-relaxed text-slate-400">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const StatCard = ({ label, value, hint, delta, icon: Icon, tone = 'brand' }) => {
  const tones = {
    brand: 'from-brand-500/20 to-violet-500/5 text-brand-300',
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-300',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-300',
    rose: 'from-rose-500/20 to-rose-500/5 text-rose-300',
  };

  return (
    <Panel className="relative overflow-hidden p-5">
      <div className={`absolute -top-8 -right-8 size-28 rounded-full bg-gradient-to-br blur-2xl ${tones[tone]}`} />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
            {label}
          </p>
          {Icon && <Icon className={`size-4 ${tones[tone].split(' ').pop()}`} strokeWidth={2} />}
        </div>
        <p className="text-3xl font-semibold tracking-tight text-white tabular-nums">{value}</p>
        <div className="mt-1.5 flex items-center gap-2">
          {delta != null && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium ${
                delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {delta >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {Math.abs(delta)}%
            </span>
          )}
          {hint && <span className="text-xs text-slate-500">{hint}</span>}
        </div>
      </div>
    </Panel>
  );
};

/** Fades content in as it scrolls into view — used to give long pages rhythm. */
export const Reveal = ({ children, delay = 0, y = 24, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default Panel;
