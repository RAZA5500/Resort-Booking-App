import { Outlet } from 'react-router-dom';
import { Heart, Luggage, UserCog } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/auth-context';

const AccountLayout = () => {
  const { user, savedIds } = useAuth();

  return (
    <DashboardLayout
      title={`Hello, ${user?.name?.split(' ')[0] || 'there'}`}
      subtitle="Your trips, your saved hotels and your account details."
      nav={[
        { to: '/account/trips', label: 'My trips', icon: Luggage },
        { to: '/account/saved', label: 'Saved', icon: Heart, badge: savedIds.length },
        { to: '/account/profile', label: 'Profile', icon: UserCog },
      ]}
    >
      <Outlet />
    </DashboardLayout>
  );
};

export default AccountLayout;
