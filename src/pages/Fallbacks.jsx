import { Compass, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/Feedback';
import { useAuth } from '../context/auth-context';
import { ROLE_LABEL } from '../lib/constants';

export const NotFound = () => (
  <div className="mx-auto max-w-2xl px-5 py-24">
    <EmptyState
      icon={Compass}
      title="That page does not exist"
      message="The link may be out of date, or the hotel may have been removed from the collection."
      action={
        <div className="flex flex-wrap justify-center gap-3">
          <Button to="/">Back home</Button>
          <Button to="/hotels" variant="subtle">Browse hotels</Button>
        </div>
      }
    />
  </div>
);

export const Forbidden = () => {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-2xl px-5 py-24">
      <EmptyState
        icon={ShieldAlert}
        title="Not your workspace"
        message={
          user
            ? `You are signed in as ${ROLE_LABEL[user.role].toLowerCase()}, which does not have access to that area. The server would refuse the request too.`
            : 'You need to sign in with an account that has access to that area.'
        }
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button to="/hotels">Browse hotels</Button>
            {user && <Button to="/account/trips" variant="subtle">My trips</Button>}
          </div>
        }
      />
    </div>
  );
};

export default NotFound;
