import { useState } from 'react';
import { KeyRound, Search, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Field, Select } from '../../components/ui/Field';
import { Panel } from '../../components/ui/Surface';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState, ErrorState, RowSkeleton } from '../../components/ui/Feedback';
import { Pagination } from '../../components/ui/Pagination';
import { useApi, useDebounced } from '../../hooks/useApi';
import { hotels as hotelApi, users as userApi } from '../../api/endpoints';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';
import { ROLES, ROLE_LABEL } from '../../lib/constants';
import { currency, formatDate, initials } from '../../lib/format';

const ROLE_TONE = { customer: 'slate', employee: 'indigo', admin: 'gold' };

const CreateUserModal = ({ open, onClose, onSaved, hotels }) => {
  const toast = useToast();
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: ROLES.CUSTOMER, hotelId: '', phone: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await userApi.create({
        ...form,
        hotelId: form.role === ROLES.EMPLOYEE ? form.hotelId : undefined,
      });
      toast.success(`${form.name} can now sign in as ${ROLE_LABEL[form.role].toLowerCase()}.`);
      setForm({ name: '', email: '', password: '', role: ROLES.CUSTOMER, hotelId: '', phone: '' });
      onSaved();
      onClose();
    } catch (err) {
      setErrors(err.details || {});
      toast.error(err.message || 'Could not create that account.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create an account"
      description="Staff accounts can only be created here — self-registration always produces a guest."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={saving}>Create account</Button>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" value={form.name} onChange={set('name')} error={errors.name} />
        <Field label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} />
        <Field
          label="Temporary password"
          value={form.password}
          onChange={set('password')}
          error={errors.password}
          hint="8+ chars, mixed case, a number."
        />
        <Field label="Phone (optional)" value={form.phone} onChange={set('phone')} error={errors.phone} />
        <Select
          label="Role"
          value={form.role}
          onChange={set('role')}
          error={errors.role}
          options={Object.values(ROLES).map((role) => ({ value: role, label: ROLE_LABEL[role] }))}
        />
        {form.role === ROLES.EMPLOYEE && (
          <Select
            label="Assigned hotel"
            value={form.hotelId}
            onChange={set('hotelId')}
            error={errors.hotelId}
            options={[
              { value: '', label: 'All properties' },
              ...hotels.map((h) => ({ value: h.id, label: `${h.name} — ${h.city}` })),
            ]}
          />
        )}
      </form>
    </Modal>
  );
};

const ResetPasswordModal = ({ user, onClose, onSaved }) => {
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const result = await userApi.resetPassword(user.id, { password });
      toast.success(result.message);
      setPassword('');
      onSaved();
      onClose();
    } catch (err) {
      setError(err.details?.password || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={Boolean(user)}
      onClose={onClose}
      title={`Reset password for ${user?.name}`}
      description="Every existing session for this account is invalidated."
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={saving}>Reset password</Button>
        </>
      }
    >
      <form onSubmit={submit}>
        <Field
          label="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
          hint="8+ chars, mixed case, a number."
        />
      </form>
    </Modal>
  );
};

const AdminUsers = () => {
  const { user: me } = useAuth();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [resetting, setResetting] = useState(null);

  const debounced = useDebounced(query, 350);
  const { data, loading, error, refetch } = useApi(
    () => userApi.list({ q: debounced, role, page, limit: 12 }),
    [debounced, role, page]
  );
  const { data: hotelData } = useApi(() => hotelApi.list({ limit: 48, sort: 'name' }), []);

  const change = async (user, patch, successMessage) => {
    try {
      await userApi.update(user.id, patch);
      toast.success(successMessage);
      refetch();
    } catch (err) {
      toast.error(err.message || 'That change was rejected.');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Field
          icon={Search}
          placeholder="Search by name or email"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          className="min-w-56 flex-1"
        />
        <div className="w-44">
          <Select
            aria-label="Filter by role"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All roles' },
              ...Object.values(ROLES).map((r) => ({ value: r, label: ROLE_LABEL[r] })),
            ]}
          />
        </div>
        <Button icon={UserPlus} onClick={() => setCreating(true)}>New account</Button>
      </div>

      {data?.counts && (
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            ['All', data.counts.all, ''],
            ['Guests', data.counts.customer, ROLES.CUSTOMER],
            ['Staff', data.counts.employee, ROLES.EMPLOYEE],
            ['Admins', data.counts.admin, ROLES.ADMIN],
          ].map(([label, count, value]) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setRole(value);
                setPage(1);
              }}
              className={`rounded-full px-4 py-2 text-[13px] ring-1 transition-all ${
                role === value
                  ? 'bg-ink-900 text-paper-50 ring-ink-900'
                  : 'bg-ink-900/[0.04] text-ink-700 ring-ink-900/10 hover:bg-ink-900/[0.07]'
              }`}
            >
              {label} <span className="opacity-60">{count}</span>
            </button>
          ))}
        </div>
      )}

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : loading ? (
        <RowSkeleton rows={6} />
      ) : data?.users.length === 0 ? (
        <Panel>
          <EmptyState icon={Users} title="No accounts match" message="Try another search or role filter." />
        </Panel>
      ) : (
        <div className="space-y-3">
          {data.users.map((user) => {
            const self = user.id === me.id;
            return (
              <Panel key={user.id} className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-semibold text-white">
                  {initials(user.name)}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <p className="font-medium text-ink-900">{user.name}</p>
                    <Badge tone={ROLE_TONE[user.role]}>{ROLE_LABEL[user.role]}</Badge>
                    {self && <Badge tone="emerald">You</Badge>}
                    {!user.active && <Badge tone="rose">Deactivated</Badge>}
                  </div>
                  <p className="truncate text-sm text-ink-600">{user.email}</p>
                  <p className="mt-0.5 text-xs text-ink-500">
                    {user.bookingsCount} bookings · {currency(user.lifetimeValue)} lifetime ·
                    joined {formatDate(user.createdAt.slice(0, 10), { month: 'short', year: 'numeric' })}
                    {user.hotelId ? ` · posted to ${user.hotelId}` : ''}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <div className="w-36">
                    <Select
                      aria-label={`Role for ${user.name}`}
                      value={user.role}
                      disabled={self}
                      onChange={(e) =>
                        change(user, { role: e.target.value }, `${user.name} is now ${ROLE_LABEL[e.target.value].toLowerCase()}.`)
                      }
                      options={Object.values(ROLES).map((r) => ({ value: r, label: ROLE_LABEL[r] }))}
                    />
                  </div>

                  {user.role === ROLES.EMPLOYEE && (
                    <div className="w-48">
                      <Select
                        aria-label={`Hotel for ${user.name}`}
                        value={user.hotelId || ''}
                        onChange={(e) =>
                          change(user, { hotelId: e.target.value }, `${user.name} reassigned.`)
                        }
                        options={[
                          { value: '', label: 'All properties' },
                          ...(hotelData?.hotels || []).map((h) => ({ value: h.id, label: h.name })),
                        ]}
                      />
                    </div>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    icon={KeyRound}
                    onClick={() => setResetting(user)}
                  >
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    variant={user.active ? 'ghost' : 'subtle'}
                    icon={ShieldCheck}
                    disabled={self}
                    onClick={() =>
                      change(
                        user,
                        { active: !user.active },
                        user.active ? `${user.name} deactivated.` : `${user.name} reactivated.`
                      )
                    }
                  >
                    {user.active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </Panel>
            );
          })}

          <Pagination
            page={data.pagination.page}
            pages={data.pagination.pages}
            onChange={setPage}
            className="pt-6"
          />
        </div>
      )}

      <CreateUserModal
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={refetch}
        hotels={hotelData?.hotels || []}
      />

      <ResetPasswordModal
        user={resetting}
        onClose={() => setResetting(null)}
        onSaved={refetch}
      />
    </div>
  );
};

export default AdminUsers;
