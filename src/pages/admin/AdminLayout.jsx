import { Outlet } from 'react-router-dom';
import { Building2, CalendarRange, LayoutDashboard, Users } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';

const AdminLayout = () => (
  <DashboardLayout
    title="Control room"
    subtitle="Every hotel, every booking and every account on the platform."
    nav={[
      { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/admin/hotels', label: 'Hotels', icon: Building2 },
      { to: '/admin/bookings', label: 'Bookings', icon: CalendarRange },
      { to: '/admin/users', label: 'Users', icon: Users },
    ]}
    actions={<Button to="/hotels" variant="subtle" size="sm">Public site</Button>}
  >
    <Outlet />
  </DashboardLayout>
);

export default AdminLayout;
