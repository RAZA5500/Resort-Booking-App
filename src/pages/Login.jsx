import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Gauge, LayoutDashboard, Lock, Mail, User } from 'lucide-react';
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
    <div className="relative flex h-full flex-col justify-end p-12">
      <p className="mb-3 text-[11px] font-semibold tracking-[0.2em] text-brand-300 uppercase">
        Stayscape
      </p>
      <p className="display max-w-sm text-4xl leading-tight text-white">
        Forty-four hotels. Seven regions. One account.
      </p>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
        Guests, front-desk teams and administrators all sign in here — the workspace you land on
        follows your role.
      </p>
    </div>
  </div>
);

const Login = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}.`);
      const next = params.get('next') || location.state?.from?.pathname;
      navigate(next || landingFor(user), { replace: true });
    } catch (err) {
      setErrors(err.details || {});
      toast.error(err.message || 'Could not sign you in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-4.5rem)] lg:grid-cols-2">
      <div className="flex items-center justify-center px-5 py-14 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <h1 className="display mb-2 text-4xl text-white">Welcome back</h1>
          <p className="mb-8 text-slate-400">
            Sign in to book, manage trips, or open your team workspace.
          </p>

          <form onSubmit={submit} noValidate className="space-y-5">
            <Field
              label="Email"
              type="email"
              icon={Mail}
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
            />
            <Field
              label="Password"
              type="password"
              icon={Lock}
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
            />
            <Button type="submit" size="lg" loading={loading} className="w-full">
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            New here?{' '}
            <Link to="/register" className="font-medium text-brand-300 hover:text-brand-200">
              Create an account
            </Link>
          </p>

          <div className="mt-10">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-white/8" />
              <span className="text-[11px] tracking-[0.16em] text-slate-500 uppercase">
                Or try a demo role
              </span>
              <span className="h-px flex-1 bg-white/8" />
            </div>

            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((account) => {
                const Icon = ROLE_ICON[account.role];
                return (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => setForm({ email: account.email, password: account.password })}
                    className="surface group flex w-full items-center gap-3 rounded-2xl p-3.5 text-left transition-all hover:bg-white/8"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-white capitalize">
                        {account.role}
                      </span>
                      <span className="block truncate text-xs text-slate-500">{account.blurb}</span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-slate-600 transition-all group-hover:translate-x-0.5 group-hover:text-brand-300" />
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-center text-xs text-slate-600">
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
