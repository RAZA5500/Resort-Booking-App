import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Gauge, LayoutDashboard, Lock, Mail, TriangleAlert, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { useAuth } from '../context/auth-context';
import { useToast } from '../context/toast-context';
import { DEMO_ACCOUNTS, ROLES } from '../lib/constants';

const ROLE_ICON = { customer: User, employee: Gauge, admin: LayoutDashboard };

const landingFor = (user) => {
  if (user.role === ROLES.ADMIN) return '/admin';
  if (user.role === ROLES.EMPLOYEE) return '/desk';
  return '/account/trips';
};

export const AuthAside = () => (
  <div className="relative hidden overflow-hidden lg:block">
    <img
      src="https://picsum.photos/seed/ciragan-palace-istanbul-a/1200/1600"
      alt=""
      className="absolute inset-0 size-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/30" />
    {/* Luminous gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-brand-500/15 via-transparent to-pine-600/20" />
    <div className="relative flex h-full flex-col justify-end p-12">
      <p className="font-label mb-3 text-[11px] font-semibold tracking-[0.2em] text-brand-200 uppercase">
        Stayscape
      </p>
      <p className="display max-w-sm text-4xl leading-tight text-white">
        Forty-four hotels. Seven regions. One account.
      </p>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">
        Guests, front-desk teams and administrators all sign in here — the workspace you land on
        follows your role.
      </p>
    </div>
  </div>
);

const Login = () => {
  const { login, ready, isAuthenticated, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  // A rejected sign-in comes back as a message with no per-field details, so
  // the toast was the only feedback — and it disappears after a few seconds.
  // This keeps the reason on the form until the guest changes something.
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear the errors as soon as a field is edited — otherwise the red message
  // from the last failed attempt sits there while the guest fixes the typo.
  const update = (field) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    setFormError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setErrors({});
    setFormError('');
    setLoading(true);
    try {
      const signedIn = await login(form);
      toast.success(`Welcome back, ${signedIn.name.split(' ')[0]}.`);
      const next = params.get('next') || location.state?.from?.pathname;
      navigate(next || landingFor(signedIn), { replace: true });
    } catch (err) {
      const message = err.message || 'Could not sign you in.';
      setErrors(err.details || {});
      if (!err.details) setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Signing in again while already signed in just re-issues the same session,
  // so send an authenticated visitor straight to their workspace.
  if (ready && isAuthenticated) {
    return <Navigate to={params.get('next') || landingFor(user)} replace />;
  }

  return (
    <div className="grid min-h-[calc(100svh-5rem)] lg:grid-cols-2">
      <div className="flex items-center justify-center px-5 py-14 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <h1 className="display mb-2 text-4xl text-ink-900">Welcome back</h1>
          <p className="mb-8 text-ink-600">
            Sign in to book, manage trips, or open your team workspace.
          </p>

          <form onSubmit={submit} noValidate className="space-y-5">
            {formError && (
              <p
                role="alert"
                className="flex items-start gap-2.5 rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-400/30"
              >
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-rose-600" strokeWidth={2.2} />
                {formError}
              </p>
            )}
            <Field
              label="Email"
              type="email"
              icon={Mail}
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={update('email')}
              error={errors.email}
            />
            <Field
              label="Password"
              type="password"
              icon={Lock}
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={update('password')}
              error={errors.password}
            />
            <Button type="submit" size="lg" loading={loading} className="w-full">
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-600">
            New here?{' '}
            <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700 transition-colors">
              Create an account
            </Link>
          </p>

          <div className="mt-10">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-ink-900/10" />
              <span className="font-label text-[11px] tracking-[0.16em] text-ink-500 uppercase">
                Or try a demo role
              </span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-ink-900/10" />
            </div>

            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((account) => {
                const Icon = ROLE_ICON[account.role];
                return (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => {
                      setForm({ email: account.email, password: account.password });
                      setErrors({});
                      setFormError('');
                    }}
                    className="surface group flex w-full items-center gap-3 rounded-2xl p-3.5 text-left transition-all duration-300 hover:bg-ink-900/[0.06] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-950/20"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-600 ring-1 ring-brand-400/20">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-ink-900 capitalize">
                        {account.role}
                      </span>
                      <span className="block truncate text-xs text-ink-500">{account.blurb}</span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-ink-500 transition-all duration-300 group-hover:translate-x-1 group-hover:text-brand-600" />
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-center text-xs text-ink-500">
              Click a role to fill the form, then press Sign in.
            </p>
          </div>
        </motion.div>
      </div>

      <AuthAside />
    </div>
  );
};

export default Login;
