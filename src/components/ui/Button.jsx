import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:
    'bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-lg shadow-brand-600/25 hover:shadow-brand-500/40 hover:brightness-110',
  light: 'bg-white text-ink-950 hover:bg-slate-200',
  ghost: 'text-slate-300 hover:bg-white/8 hover:text-white',
  outline: 'surface text-white hover:bg-white/10',
  danger: 'bg-rose-500/90 text-white hover:bg-rose-500',
  subtle: 'bg-white/5 text-slate-200 ring-1 ring-white/10 hover:bg-white/10 hover:text-white',
};

const SIZES = {
  sm: 'h-9 px-4 text-[13px] gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-13 px-7 text-[15px] gap-2.5',
};

const base =
  'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] whitespace-nowrap';

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
      {IconRight && <IconRight className="size-4 shrink-0" strokeWidth={2.2} />}
    </>
  );

  if (to) return <Link to={to} className={classes} {...rest}>{content}</Link>;
  if (href) return <a href={href} className={classes} {...rest}>{content}</a>;

  const Tag = as || 'button';
  return (
    <Tag className={classes} disabled={loading || rest.disabled} {...rest}>
      {content}
    </Tag>
  );
};

export const IconButton = ({ icon: Icon, label, active, className = '', ...rest }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={`grid size-10 shrink-0 place-items-center rounded-full ring-1 transition-all duration-200 active:scale-95 ${
      active
        ? 'bg-white text-ink-950 ring-white'
        : 'bg-black/40 text-white/85 ring-white/15 backdrop-blur-md hover:bg-black/60 hover:text-white'
    } ${className}`}
    {...rest}
  >
    <Icon className="size-[18px]" strokeWidth={2} />
  </button>
);

export default Button;
