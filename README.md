# Abundanz

A full-stack video streaming platform with Netflix-style UX, subscription-gated content, and cross-platform support (web + iOS/Android).

---

## Tech Stack

### Web (`apps/web`)
| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Video player | Vidstack |
| Auth | Supabase Auth via `@supabase/ssr` |

### Mobile (`apps/mobile`)
| Layer | Technology |
|---|---|
| Framework | Expo 54 (managed workflow) |
| Navigation | Expo Router v4 (file-based) |
| Video player | expo-video |
| Auth | Supabase Auth via `@supabase/supabase-js` + AsyncStorage |

### Shared (`packages/shared`)
| Layer | Technology |
|---|---|
| Language | TypeScript 5 |
| ORM | Drizzle ORM |
| Validation | Zod |
| ID generation | @paralleldrive/cuid2 |

### Infrastructure
| Service | Purpose |
|---|---|
| Supabase | Postgres database + Auth |
| Bunny.net Stream | Video storage, transcoding, HLS delivery |
| Supabase Storage | Thumbnails and images |
| Stripe | Web subscriptions |
| RevenueCat | Cross-platform entitlement hub (Stripe + Apple IAP + Google Play) |
| Vercel | Next.js hosting |

---

## Prerequisites

- **Node.js** v20.19+ — [nodejs.org](https://nodejs.org)
- **pnpm** v8+ — `npm install -g pnpm`
- **Expo CLI** — `npm install -g expo-cli`
- **Xcode** (Mac only) — required for iOS Simulator
- **Android Studio** — required for Android Emulator
- **Supabase CLI** — for local development: `npm install -g supabase`
- **Stripe CLI** — for local webhook testing: [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
- **Docker** — required by Supabase local stack

### Required Accounts
Before running the project, you need accounts for:
- [Supabase](https://supabase.com) — free tier
- [Bunny.net](https://bunny.net) — Stream product enabled
- [Stripe](https://stripe.com) — test mode
- [RevenueCat](https://revenuecat.com) — free tier
- [Vercel](https://vercel.com) — free tier


## Environment Variables

### `apps/web/.env.local`

```env
# Supabase — project settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Your app URL (used for OAuth redirects and email confirmation links)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase direct connection string — for Drizzle migrations
# Found in: Supabase project > Settings > Database > Connection string (URI)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres
```

### `apps/mobile/.env.local`

```env
# Supabase — same project as web, EXPO_PUBLIC_ prefix required
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Your deployed Next.js web app URL (used by the API client)
EXPO_PUBLIC_API_URL=http://localhost:3000
```

---

## Local Development Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd abundanz
pnpm install
```

### 2. Start local Supabase

```bash
supabase start
```

This spins up a full local Supabase stack via Docker. On first run it will take a few minutes to pull images.

Once running, it prints your local credentials:
```
API URL:      http://localhost:54321
anon key:     <local-anon-key>
service_role: <local-service-role-key>
Studio URL:   http://localhost:54323
DB URL:       postgresql://postgres:postgres@localhost:54432/postgres
```

Update `apps/web/.env.local` and `apps/mobile/.env.local` with the local credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key>
DATABASE_URL=postgresql://postgres:postgres@localhost:54432/postgres
```

### 3. Apply database schema and trigger

**Push the schema** (tables and enums) directly to your local database:

```bash
pnpm db:push
```

**Apply the auth trigger** (one-time setup — creates the `public.users` row automatically when a user signs up):

```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -f supabase/migrations/20260521000000_handle_new_user.sql
```

> **Production:** Use `pnpm db:generate` then `pnpm db:migrate` to create and apply versioned migration files. Apply the trigger SQL via the Supabase dashboard SQL editor.

Also create `packages/shared/.env.local` with your database URL:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### 4. Configure Supabase Auth providers (local)

Open Supabase Studio at `http://localhost:54323` → Authentication → Providers:

- **Email**: enabled by default
- **Google OAuth**: requires a Google Cloud OAuth client ID and secret (see [Supabase Google OAuth guide](https://supabase.com/docs/guides/auth/social-login/auth-google))

For local development, email/password works without any additional config. Google OAuth requires real credentials even locally.

### 5. Run the web app

```bash
pnpm dev:web
# Opens at http://localhost:3000
```

### 6. Run the mobile app

```bash
pnpm dev:mobile
# Then press:
#   i — open iOS Simulator (Mac only)
#   a — open Android Emulator
#   Scan QR code with Expo Go app on a real device
```

---

## Running Both Apps Simultaneously

Open two terminal tabs:

```bash
# Terminal 1
pnpm dev:web

# Terminal 2
pnpm dev:mobile
```

The mobile app reads `EXPO_PUBLIC_API_URL` to know where to call the Next.js API routes. During local development this should point to `http://localhost:3000`.

> **Note for physical device testing:** Replace `localhost` with your machine's local IP address (e.g. `http://192.168.1.x:3000`) so the device can reach your dev server.

---

## Database Migrations

Migrations live in `packages/shared/drizzle/`. Drizzle Kit handles generation and migration.

```bash
# Generate a new migration after editing packages/shared/src/db/schema.ts
pnpm db:generate

# Apply pending migrations
pnpm db:migrate
```

Requires `DATABASE_URL` to be set in your environment (or in `packages/shared/.env`).

---

## Testing Payments Locally

### Stripe (web)
```bash
# Install Stripe CLI, then:
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Use test card `4242 4242 4242 4242` with any future expiry and CVC to simulate payments. All events are forwarded to your local webhook handler.

### RevenueCat + Apple IAP (mobile)
- Requires a real iOS device or simulator with a sandbox Apple ID
- RevenueCat SDK automatically uses sandbox mode in development builds
- No real charges are made in sandbox

---

## Deployment

### Web (Vercel)

1. Push to GitHub
2. Import repo in [Vercel dashboard](https://vercel.com)
3. Set root directory to `apps/web`
4. Add all environment variables from `apps/web/.env.local` with production values
5. Deploy

### Mobile (Expo EAS — Phase 6)

```bash
npm install -g eas-cli
eas login
eas build --platform ios
eas build --platform android
```

---

## Available Scripts

From the project root:

| Command | Description |
|---|---|
| `pnpm dev:web` | Start Next.js dev server |
| `pnpm dev:mobile` | Start Expo dev server |
| `pnpm build:web` | Production build of the web app |
| `pnpm db:push` | Push schema directly to DB (local dev) |
| `pnpm db:generate` | Generate versioned migration file from schema changes |
| `pnpm db:migrate` | Apply generated migrations (production) |

---
