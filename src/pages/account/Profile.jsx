import { useState } from 'react';
import { KeyRound, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { Panel } from '../../components/ui/Surface';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/auth-context';
import { useToast } from '../../context/toast-context';
import { ROLE_LABEL } from '../../lib/constants';
import { formatDateTime, initials } from '../../lib/format';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const toast = useToast();

  const [details, setDetails] = useState({ name: user.name, phone: user.phone || '' });
  const [detailErrors, setDetailErrors] = useState({});
  const [savingDetails, setSavingDetails] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  const saveDetails = async (event) => {
    event.preventDefault();
    setDetailErrors({});
    setSavingDetails(true);
    try {
      await updateProfile({ name: details.name.trim(), phone: details.phone.trim() });
      toast.success('Profile updated successfully.');
    } catch (err) {
      setDetailErrors(err.details || {});
      toast.error(err.message || 'Could not save your details.');
    } finally {
      setSavingDetails(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      setPasswordErrors({ confirm: 'The passwords do not match.' });
      return;
    }
    setPasswordErrors({});
    setSavingPassword(true);
    try {
      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success('Password changed. Other devices have been signed out.');
    } catch (err) {
      setPasswordErrors(err.details || {});
      toast.error(err.message || 'Could not change your password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Panel className="surface-elevated flex flex-wrap items-center gap-5 p-6 sm:p-8">
        <div className="relative">
          <span className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 via-indigo-600 to-violet-600 text-xl font-bold text-white shadow-lg shadow-brand-500/25 ring-2 ring-white/20">
            {initials(user.name)}
          </span>
          <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full bg-emerald-500 ring-2 ring-ink-950">
            <ShieldCheck className="size-3 text-white" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xl font-semibold text-white">{user.name}</p>
          <p className="truncate text-sm text-slate-400">{user.email}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <Badge tone="indigo">{ROLE_LABEL[user.role]}</Badge>
            {user.lastLoginAt && (
              <span className="text-xs text-slate-500">
                Last active {formatDateTime(user.lastLoginAt)}
              </span>
            )}
          </div>
        </div>
      </Panel>

      <Panel className="surface-elevated p-6 sm:p-8">
        <h2 className="display mb-2 text-2xl text-white">Your details</h2>
        <p className="mb-6 text-xs text-slate-400">
          Personalize your contact profile used for reservations and communications.
        </p>
        <form onSubmit={saveDetails} className="space-y-5">
          <Field
            label="Full name"
            icon={User}
            value={details.name}
            onChange={(e) => setDetails({ ...details, name: e.target.value })}
            error={detailErrors.name}
          />
          <Field
            label="Phone"
            icon={Phone}
            placeholder="+1 555 0100"
            value={details.phone}
            onChange={(e) => setDetails({ ...details, phone: e.target.value })}
            error={detailErrors.phone}
          />
          <Field
            label="Email"
            icon={Mail}
            value={user.email}
            disabled
            hint="Account email changes are handled securely by an administrator."
          />
          <Button type="submit" loading={savingDetails}>
            Save changes
          </Button>
        </form>
      </Panel>

      <Panel className="surface-elevated p-6 sm:p-8">
        <h2 className="display mb-1 flex items-center gap-2 text-2xl text-white">
          <KeyRound className="size-5 text-brand-300" /> Security & Password
        </h2>
        <p className="mb-6 text-xs text-slate-400">
          Updating your security credentials will invalidate sessions on other devices.
        </p>
        <form onSubmit={savePassword} className="space-y-5">
          <Field
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
            error={passwordErrors.currentPassword}
          />
          <Field
            label="New password"
            type="password"
            autoComplete="new-password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            error={passwordErrors.newPassword}
            hint="At least 8 characters, with uppercase, lowercase, and numeric digits."
          />
          <Field
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            error={passwordErrors.confirm}
          />
          <Button type="submit" variant="subtle" loading={savingPassword}>
            Change password
          </Button>
        </form>
      </Panel>
    </div>
  );
};

export default Profile;
