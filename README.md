# Stayscape — React booking app

A full booking flow built with React 19, Vite and Tailwind v4. It grew out of a props/card
exercise: the card is still the entry point, but it now leads into search, availability, checkout
and trip management.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

## What it does

- **Search** — destination, date range and guest count, applied together from one search bar.
- **Filter and sort** — category chips, a nightly price ceiling, and sort by price or rating.
- **Real availability** — stays whose dates clash with a seeded or existing booking are removed
  from results, and blocked nights are struck out in the calendar.
- **Stay page** — photo gallery, host, amenities, reviews, and a sticky booking panel that prices
  the stay live (nightly rate, weekly discount, cleaning, service fee, taxes).
- **Checkout** — guest details and a demo payment form with field-level validation, plus a
  last-moment availability re-check before the booking is written.
- **Confirmation** — a booking code, the full itinerary and the amount charged.
- **Trips** — upcoming, past and cancelled bookings, with two-step cancellation.
- **Saved stays** — heart any card; the list survives a reload.

Bookings and favourites persist to `localStorage` under the `stayscape.v1` key. No backend, no
account — clearing site data resets the app.

## How it is put together

```
src/
  lib/
    dates.js      YYYY-MM-DD helpers, night counting, overlap checks, calendar grids
    format.js     currency, pluralisation, the price breakdown
    routing.js    router context, useRouter, matchPath, buildHref
    router.jsx    RouterProvider + Link
  context/
    bookingStore.js    context, reducer, localStorage bridge, useBooking
    BookingProvider.jsx
  data/listings.js     catalogue, categories, seeded unavailability, reviews
  components/          Navbar, Footer, SearchBar, DateRangePicker, Rating, Toaster
  Cards/Cards.jsx      the listing card
  pages/               Home, ListingDetail, Checkout, Confirmation, Bookings, Favorites, NotFound
```

Routing is a ~60 line hash router rather than a dependency, so the built `dist/` works from any
static host with no rewrite rules. Dates are strings everywhere and only become `Date` objects at
noon local time, which keeps daylight-saving transitions from shifting a night.

Non-component exports live in `.js` siblings (`routing.js`, `bookingStore.js`) so the `.jsx` files
export components only and Fast Refresh stays intact.
