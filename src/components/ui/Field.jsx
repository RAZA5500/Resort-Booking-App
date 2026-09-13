import { useId } from 'react';

const shell = (error) =>
  `w-full rounded-xl bg-white/5 px-4 text-[15px] text-white ring-1 transition-all duration-300 outline-none placeholder:text-slate-600 ${
    error
      ? 'ring-rose-400/60 focus:ring-rose-400 focus:shadow-[0_0_20px_-4px_rgba(251,113,133,0.25)]'
      : 'ring-white/10 focus:ring-brand-500 focus:bg-white/8 focus:shadow-[0_0_20px_-4px_rgba(99,102,241,0.2)]'
  }`;

const Wrapper = ({ id, label, error, hint, children, className = '' }) => (
  <div className={className}>
    {label && (
      <label htmlFor={id} className="mb-2 block text-[13px] font-medium text-slate-300 transition-all">
        {label}
      </label>
    )}
    {children}
    {error ? (
      <p className="mt-1.5 text-xs text-rose-300">{error}</p>
    ) : (
      hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
    )}
  </div>
);

export const Field = ({ label, error, hint, icon: Icon, className, ...rest }) => {
  const generated = useId();
  const id = rest.id || generated;

  return (
    <Wrapper id={id} label={label} error={error} hint={hint} className={className}>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-500 transition-colors peer-focus:text-brand-400" />
        )}
        <input
          id={id}
          aria-invalid={Boolean(error)}
          className={`peer ${shell(error)} h-12 ${Icon ? 'pl-11' : ''}`}
          {...rest}
        />
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
      <select id={id} className={`${shell(error)} h-12 appearance-none pr-10`} {...rest}>
        {children ||
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
      </select>
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
        checked ? 'bg-brand-500 shadow-md shadow-brand-500/30' : 'bg-white/12'
      }`}
    >
      <span
        className={`block size-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
    <span>
      <span className="block text-sm font-medium text-white">{label}</span>
      {description && <span className="block text-xs text-slate-500">{description}</span>}
    </span>
  </label>
);

export default Field;
