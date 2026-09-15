import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Flat fills, no gradients — the editorial look leans on the paper ground and
// one saturated accent rather than on depth effects.
const VARIANTS = {
  primary: 'bg-brand-600 text-white shadow-sm shadow-brand-900/10 hover:bg-brand-700',
  light: 'bg-ink-900 text-paper-50 hover:bg-ink-800 shadow-sm shadow-ink-900/10',
  ghost: 'text-ink-700 hover:bg-ink-900/[0.06] hover:text-ink-900',
  outline: 'surface text-ink-900 hover:border-ink-300 hover:bg-ink-900/[0.03]',
  danger: 'bg-rose-600 text-white shadow-sm shadow-rose-900/10 hover:bg-rose-700',
  subtle: 'bg-paper-200 text-ink-800 ring-1 ring-ink-900/[0.08] hover:bg-paper-300 hover:text-ink-900',
};

const SIZES = {
  sm: 'h-9 px-4 text-[13px] gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-13 px-7 text-[15px] gap-2.5',
};

const base =
  'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97] whitespace-nowrap';

export const Button = ({
  as, to, href, variant = 'primary', size = 'md', loading = false,
  icon: Icon, iconRight: IconRight, className = '', children, ...rest
}) => {
  const classes = `${base} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  const content = (
    <>
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        Icon && <Icon className="size-4 shrink-0" strokeWidth={2.2} />
      )}
      {children}
      {IconRight && <IconRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" strokeWidth={2.2} />}
    </>
  );

  // `disabled` is not a valid attribute on an anchor, so links drop it and lose
  // pointer events instead.
  const { disabled, ...restProps } = rest;

  if (to) {
    return (
      <Link
        to={to}
        className={`group ${classes} ${disabled || loading ? 'pointer-events-none opacity-50' : ''}`}
        aria-disabled={disabled || loading || undefined}
        {...restProps}
      >
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a
        href={href}
        className={`group ${classes} ${disabled || loading ? 'pointer-events-none opacity-50' : ''}`}
        aria-disabled={disabled || loading || undefined}
        {...restProps}
      >
        {content}
      </a>
    );
  }

  const Tag = as || 'button';
  return (
    // `rest` is spread first so the computed `disabled` below is not overwritten
    // by a caller's own `disabled` — a loading button must stay unclickable.
    <Tag type="button" className={`group ${classes}`} {...restProps} disabled={loading || disabled}>
      {content}
    </Tag>
  );
};

export const IconButton = ({ icon: Icon, label, active, className = '', ...rest }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={`grid size-10 shrink-0 place-items-center rounded-full ring-1 transition-all duration-300 active:scale-95 ${
      active
        ? 'bg-brand-600 text-white ring-brand-600 shadow-sm shadow-brand-900/15'
        : 'bg-paper-200 text-ink-700 ring-ink-900/[0.08] hover:bg-paper-300 hover:text-ink-900'
    } ${className}`}
    {...rest}
  >
    <Icon className="size-[18px]" strokeWidth={2} />
  </button>
);

export default Button;
