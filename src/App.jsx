import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { ROLES } from './lib/constants';

import Home from './pages/Home';
import Hotels from './pages/Hotels';
import HotelDetail from './pages/HotelDetail';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import BookingDetail from './pages/BookingDetail';
import { Forbidden, NotFound } from './pages/Fallbacks';

import AccountLayout from './pages/account/AccountLayout';
import Trips from './pages/account/Trips';
import Saved from './pages/account/Saved';
import Profile from './pages/account/Profile';

import Desk from './pages/staff/Desk';

import AdminLayout from './pages/admin/AdminLayout';
import Overview from './pages/admin/Overview';
import AdminHotels from './pages/admin/AdminHotels';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBookings from './pages/admin/AdminBookings';

const App = () => (
  <Routes>
    <Route element={<AppShell />}>
      {/* public */}
      <Route path="/" element={<Home />} />
      <Route path="/hotels" element={<Hotels />} />
      <Route path="/hotels/:id" element={<HotelDetail />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forbidden" element={<Forbidden />} />

      {/* any signed-in user */}
      <Route element={<ProtectedRoute />}>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/booking/:id" element={<BookingDetail />} />
        <Route path="/account" element={<AccountLayout />}>
          <Route index element={<Trips />} />
          <Route path="trips" element={<Trips />} />
          <Route path="saved" element={<Saved />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* hotel staff */}
      <Route element={<ProtectedRoute roles={[ROLES.EMPLOYEE, ROLES.ADMIN]} />}>
        <Route path="/desk" element={<Desk />} />
      </Route>

      {/* administrators */}
      <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Overview />} />
          <Route path="hotels" element={<AdminHotels />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

export default App;
