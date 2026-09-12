import { matchPath, useRouter } from './lib/routing';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toaster from './components/Toaster';
import Home from './pages/Home';
import ListingDetail from './pages/ListingDetail';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';
import Bookings from './pages/Bookings';
import Favorites from './pages/Favorites';
import NotFound from './pages/NotFound';

const ROUTES = [
  { pattern: '/', render: () => <Home /> },
  { pattern: '/listing/:id', render: ({ id }) => <ListingDetail id={id} /> },
  { pattern: '/checkout/:id', render: ({ id }) => <Checkout id={id} /> },
  { pattern: '/confirmation/:bookingId', render: ({ bookingId }) => <Confirmation bookingId={bookingId} /> },
  { pattern: '/bookings', render: () => <Bookings /> },
  { pattern: '/favorites', render: () => <Favorites /> },
];

const App = () => {
  const { path } = useRouter();

  const page = ROUTES.reduce((found, route) => {
    if (found) return found;
    const params = matchPath(route.pattern, path);
    return params ? route.render(params) : null;
  }, null);

  return (
    <div className="min-h-screen bg-[#020617] relative overflow-x-hidden font-sans selection:bg-indigo-500/30 flex flex-col">
      {/* Ambient background glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/5 rounded-full blur-[100px] pointer-events-none" />

      <Navbar />
      <main className="flex-1 relative z-10">{page || <NotFound />}</main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default App;
