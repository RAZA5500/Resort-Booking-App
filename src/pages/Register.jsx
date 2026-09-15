import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Lock, Mail, Phone, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { AuthAside } from './Login';
import { useAuth } from '../context/auth-context';
import { useToast } from '../context/toast-context';

const RULES = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'Upper and lower case', test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { label: 'At least one number', test: (v) => /\d/.test(v) },
];

const Register = () => {
  const { register, ready, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => RULES.filter((r) => r.test(form.password)).length, [form.password]);

  const submit = async (event) => {
    event.preventDefault();
    if (loading) return;

    const local = {};
    if (form.name.trim().length < 2) local.name = 'Please enter your name.';
    if (strength < RULES.length) local.password = 'Your password does not meet all the rules yet.';
    if (form.password !== form.confirm) local.confirm = 'The passwords do not match.';
    setErrors(local);
    if (Object.keys(local).length > 0) return;

    setLoading(true);
    try {
      const user = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
      });
      toast.success(`Welcome to Stayscape, ${user.name.split(' ')[0]}.`);
      navigate(params.get('next') || '/hotels', { replace: true });
    } catch (err) {
      setErrors(err.details || {});
      toast.error(err.message || 'Could not create that account.');
    } finally {
      setLoading(false);
    }
  };

  const barColors = ['bg-rose-400', 'bg-amber-400', 'bg-emerald-400'];

  // Someone already signed in has no account to create here.
  if (ready && isAuthenticated) {
    return <Navigate to={params.get('next') || '/hotels'} replace />;
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
          <h1 className="display mb-2 text-4xl text-ink-900">Create your account</h1>
          <p className="mb-8 text-ink-600">
            Free, instant, and your trips follow you to any device.
          </p>

          <form onSubmit={submit} noValidate className="space-y-5">
            <Field
              label="Full name"
              icon={User}
              autoComplete="name"
              placeholder="Ada Lovelace"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
            />
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
              label="Phone (optional)"
              icon={Phone}
              autoComplete="tel"
              placeholder="+1 555 0100"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              error={errors.phone}
            />
            <Field
              label="Password"
              type="password"
              icon={Lock}
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
            />

            {form.password && (
              <div className="space-y-2">
                <div className="flex gap-1.5">
                  {RULES.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                        i < strength
                          ? `${barColors[strength - 1]} shadow-sm ${strength === 3 ? 'shadow-emerald-400/20' : 'shadow-amber-400/20'}`
                          : 'bg-ink-900/[0.07]'
                      }`}
                    />
                  ))}
                </div>
                <ul className="space-y-1">
                  {RULES.map((rule) => {
                    const ok = rule.test(form.password);
                    return (
                      <li
                        key={rule.label}
                        className={`flex items-center gap-2 text-xs transition-colors ${ok ? 'text-emerald-600' : 'text-ink-500'}`}
                      >
                        <Check className={`size-3 transition-opacity ${ok ? '' : 'opacity-30'}`} strokeWidth={3} />
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <Field
              label="Confirm password"
              type="password"
              icon={Lock}
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              error={errors.confirm}
            />

            <Button type="submit" size="lg" loading={loading} className="w-full">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700 transition-colors">
              Sign in
            </Link>
          </p>

          <p className="mt-6 text-center text-xs leading-relaxed text-ink-500">
            New accounts are always created as guests. Staff and administrator access is granted by
            an existing administrator.
          </p>
        </motion.div>
      </div>

      <AuthAside />
    </div>
  );
};

export default Register;
