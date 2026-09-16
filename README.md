# Stayscape

A full-stack hotel booking platform: React 19 client, NestJS 11 API in
TypeScript, three roles (guest / front desk / administrator) with real
authentication and authorisation.

```bash
npm install          # also installs the API's dependencies
npm run dev          # API on :4000 and client on :5173, together
```

Then open <http://localhost:5173>.

| Script | What it does |
| --- | --- |
| `npm run dev` | Runs the API and the Vite dev server side by side |
| `npm run dev:api` | API only, with `nest start --watch` |
| `npm run dev:web` | Client only |
| `npm run seed` | Rebuilds the demo database from scratch (stop the API first) |
| `npm run build` | Production client build |
| `npm run build:api` | Compiles the API to `api/dist` |
| `npm start` | Builds the API and runs it in production mode |
| `npm run lint` | ESLint across the client |

The API is its own npm package under `api/`, so you can also work in it
directly — `npm run start:dev`, `npm run build`, `npm run lint` and `npm run
seed` all work from inside `api/`.

## Demo accounts

| Role | Email | Password | Lands on |
| --- | --- | --- | --- |
| Guest | `customer@stayscape.com` | `Customer@123` | My trips |
| Front desk | `employee@stayscape.com` | `Employee@123` | The desk for The Ritz Paris |
| Administrator | `admin@stayscape.com` | `Admin@123` | Control room |

The sign-in page lists these and fills the form for you. Every account is seeded
with data, so no dashboard opens empty.

## What each role can do

**Guest** — search and filter 44 hotels, see live per-room availability, book,
cancel, save hotels to an account-synced list, review a hotel after a completed
stay, and edit their own profile and password.

**Front desk** — today's arrivals, in-house guests and departures for *their*
hotel, with check-in and check-out actions, plus a searchable list of every
reservation at that property. Acting on another hotel's booking is refused by
the server.

**Administrator** — revenue, occupancy and pipeline analytics; full hotel CRUD
including publish/hide; every booking on the platform with status transitions;
and account management — create staff, change roles, reassign a hotel posting,
reset passwords, deactivate users.

## How the authentication works

- Passwords are stored only as bcrypt hashes. Login answers identically whether
  the email is unknown or the password is wrong, so the endpoint cannot be used
  to discover which addresses are registered.
- A **15-minute access token** lives in JavaScript memory — never in
  `localStorage`, so an XSS bug cannot read it off disk.
- A **7-day refresh token** is an `httpOnly` cookie scoped to `/api/auth`, and it
  rotates on every use. A page reload trades the cookie for a fresh access
  token; concurrent 401s share one refresh round-trip.
- Changing a password or a role bumps the user's `tokenVersion`, which
  invalidates every refresh token issued anywhere else.
- Route guards in the client only shape navigation. **Every endpoint re-checks
  the role and the hotel posting server-side** — `JwtAuthGuard` loads the live
  user record and `RolesGuard` reads the `@Roles()` metadata — so forging a role
  in the browser achieves nothing.
- `@nestjs/throttler` guards the credential endpoints (20 attempts per 15
  minutes, via `@Throttle()`) and the API as a whole (300 per minute).

## How booking works

Availability is modelled as inventory, not single units: a room type with
`count: 8` accepts eight concurrent stays, and a range is bookable while peak
concurrency stays below that. Ranges are half-open, so a checkout day is free
for the next guest's check-in.

The client never sends a price. Rates, the weekly discount, cleaning, service
fee and tax are recomputed from the room record on the server for every quote
*and* again at purchase, and availability is re-checked at the moment of
booking — a stale tab gets a 409, not a mispriced stay.

## Layout

```
api/                     NestJS API (its own package, separate process)
  src/main.ts            bootstrap: CORS, cookies, global prefix, validation
  src/app.module.ts      root module, throttler, global exception filter
  src/core.module.ts     global providers: store, seed, pricing, availability
  src/config/            env, token TTLs, fee constants, role and status enums
  src/common/            ApiException, exception filter, guards, decorators
  src/database/          JSON document store, seeder, the 44-hotel catalogue
  src/domain/            pricing and availability rules
  src/modules/           auth, hotels, bookings, users, favorites, stats
    <feature>/dto/       class-validator request shapes
  src/scripts/reseed.ts  rebuilds the demo dataset

src/                     React client
  api/                   fetch wrapper with transparent token refresh
  context/               auth and toast providers
  hooks/useApi.js        fetch-on-deps with stale-response guarding
  components/            layout, UI kit, search, hotel and booking pieces
  pages/                 public, account, staff and admin screens
```

Non-component exports live in `.js` siblings (`auth-context.js`,
`toast-context.js`) so every `.jsx` file exports components only and Fast
Refresh keeps working. Staff and admin screens are `React.lazy` chunks, which
keeps the charting library out of the bundle a first-time visitor downloads.

## About the data

The 44 hotel names, cities and countries are real properties — a demo full of
invented names never feels like a product. **Everything else is generated:**
rates, room inventory, availability, ratings and reviews. Photography is
procedurally seeded, not taken from the hotels.

Stayscape is not affiliated with, endorsed by, or connected to any property
shown, and nothing here books a real room.

`npm run seed` rebuilds the dataset deterministically, including a live
front-desk day for the two staffed hotels and two hotels deliberately sold out
for a week so the availability calendar has real blocked nights.

## Notes

- The database is a JSON file at `api/db/data.json` (gitignored). `StoreService`
  is repository-shaped, so swapping in Postgres (TypeORM, Prisma, …) means
  reimplementing one provider and nothing else.
- Every failure leaves the API as `{ error: { message, details? } }`.
  `ApiException` is the only error the code throws, and one global filter
  renders it; anything else is logged in full and reported as a generic 500.
- Request bodies are `class-validator` DTOs behind a whitelisting
  `ValidationPipe`, so an undeclared field is dropped rather than written, and
  `details` comes back keyed by field name for the client's form inputs.
- Secrets fall back to development defaults (see `api/.env.example`). Setting
  `NODE_ENV=production` makes a missing `JWT_ACCESS_SECRET` or
  `JWT_REFRESH_SECRET` fatal instead.
- `server/` is a **separate git repository** (NestJs-CRUD) checked out inside
  this one. It is unrelated to this app and is excluded from linting.
