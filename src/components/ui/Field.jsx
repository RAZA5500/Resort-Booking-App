import { useId } from 'react';
import { ChevronDown } from 'lucide-react';

// Inputs are white cards on the paper ground, so the focus ring does the work
// the dark build got from a glow.
const shell = (error) =>
  `w-full rounded-xl bg-paper-50 px-4 text-[15px] text-ink-900 ring-1 transition-all duration-300 outline-none placeholder:text-ink-400 ${
    error
      ? 'ring-rose-400 focus:ring-rose-500 focus:shadow-[0_0_0_4px_rgba(225,29,72,0.12)]'
      : 'ring-ink-200 hover:ring-ink-300 focus:ring-brand-500 focus:shadow-[0_0_0_4px_rgba(192,91,63,0.12)]'
  }`;

const Wrapper = ({ id, label, error, hint, children, className = '' }) => (
  <div className={className}>
    {label && (
      <label htmlFor={id} className="mb-2 block text-[13px] font-medium text-ink-700 transition-all">
        {label}
      </label>
    )}
    {children}
    {error ? (
      <p id={`${id}-msg`} role="alert" className="mt-1.5 text-xs text-rose-600">{error}</p>
    ) : (
      hint && <p id={`${id}-msg`} className="mt-1.5 text-xs text-ink-500">{hint}</p>
    )}
  </div>
);

// Ties the error/hint line to the control so screen readers announce it.
const describedBy = (id, error, hint) => (error || hint ? `${id}-msg` : undefined);

export const Field = ({ label, error, hint, icon: Icon, className, ...rest }) => {
  const generated = useId();
  const id = rest.id || generated;

  return (
    <Wrapper id={id} label={label} error={error} hint={hint} className={className}>
      {/* The input is rendered first so `peer-focus` on the icon actually
          matches — Tailwind's peer variants use a following-sibling selector. */}
      <div className="relative">
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy(id, error, hint)}
          className={`peer ${shell(error)} h-12 ${Icon ? 'pl-11' : ''}`}
          {...rest}
        />
        {Icon && (
          <Icon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-500 transition-colors peer-focus:text-brand-600" />
        )}
      </div>
    </Wrapper>
  );
};

export const TextArea = ({ label, error, hint, className, rows = 4, ...rest }) => {
  const generated = useId();
  const id = rest.id || generated;
  return (
    <Wrapper id={id} label={label} error={error} hint={hint} className={className}>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error, hint)}
        className={`${shell(error)} resize-y py-3 leading-relaxed`}
        {...rest}
      />
    </Wrapper>
  );
};

export const Select = ({ label, error, hint, className, options = [], children, ...rest }) => {
  const generated = useId();
  const id = rest.id || generated;
  return (
    <Wrapper id={id} label={label} error={error} hint={hint} className={className}>
      <div className="relative">
        <select
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy(id, error, hint)}
          className={`${shell(error)} h-12 appearance-none pr-10 cursor-pointer`}
          {...rest}
        >
          {children ||
            options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-600" />
      </div>
    </Wrapper>
  );
};

export const Toggle = ({ checked, onChange, label, description }) => (
  <label className="flex cursor-pointer items-start gap-3">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`mt-0.5 h-6 w-11 shrink-0 rounded-full p-0.5 transition-all duration-300 ${
        checked ? 'bg-brand-500 shadow-md shadow-brand-500/30' : 'bg-ink-900/[0.08]'
      }`}
    >
      <span
        className={`block size-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
    <span>
      <span className="block text-sm font-medium text-ink-900">{label}</span>
      {description && <span className="block text-xs text-ink-500">{description}</span>}
    </span>
  </label>
);

export default Field;
