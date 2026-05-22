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

Migration files live in `packages/shared/drizzle/`. Schema is defined in `packages/shared/src/db/schema.ts`.

### Local development

After editing the schema, push changes directly to your local DB (no migration file created):

```bash
pnpm db:push
```

### Shipping a schema change to production

**1. Generate the migration file**

```bash
pnpm db:generate
```

Creates a new SQL file in `packages/shared/drizzle/` (e.g. `0001_add_watch_history.sql`). Review it before applying.

**2. Commit the migration file with the schema change**

Both `src/db/schema.ts` and the new file in `drizzle/` should be committed together.

**3. Apply to production via Supabase SQL Editor**

Open the generated `.sql` file, copy its contents, and paste into:

**Supabase dashboard → SQL Editor → New query → Run**

The `-->statement-breakpoint` markers in the file are drizzle comments — Postgres ignores them, leave them in.

> **Why SQL Editor instead of `pnpm db:migrate`?** The initial schema (`0000_great_shadow_king.sql`) was applied manually, so drizzle's migration tracking table is not initialised. Running `db:migrate` would attempt to re-apply it and fail with "already exists" errors.

### Quick reference

| Situation | Command |
|---|---|
| Testing schema changes locally | `pnpm db:push` |
| Creating a production-ready migration | `pnpm db:generate` |
| Applying to production | Paste generated SQL into Supabase SQL Editor |

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

## Switching to a Custom Domain

When moving from `abundanz-web.vercel.app` to a real domain, update every place the URL is registered. Missing any one of these will break OAuth or email confirmation links.

### 1. Vercel — add the domain

Vercel dashboard → project → **Settings → Domains** → add your domain. Vercel will give you DNS records to configure.

### 2. DNS provider

Point your domain to Vercel using the A/CNAME records Vercel provides (step above).

### 3. Vercel — update env var

Settings → Environment Variables → `NEXT_PUBLIC_APP_URL` → change to `https://yourdomain.com`. Then **redeploy** (Deployments → Redeploy, uncheck "use existing build cache").

> This env var is baked into the build — it controls the OAuth redirect URL and email confirmation links. A redeploy is required for the change to take effect.

### 4. Supabase — URL Configuration

Supabase dashboard → **Authentication → URL Configuration**:
- **Site URL**: `https://yourdomain.com`
- **Redirect URLs**: add `https://yourdomain.com/**` (keep the old Vercel URL until DNS has fully propagated)

### 5. Google Cloud Console — OAuth consent screen

APIs & Services → **OAuth consent screen** → Edit:
- **App domain / Homepage**: `https://yourdomain.com`
- **Privacy Policy / Terms of Service URLs**: update if hosted on the old URL

> The **Authorized redirect URI** (`https://zrrfilmvgttsnpheiwmc.supabase.co/auth/v1/callback`) does **not** change — Google OAuth always callbacks through Supabase's domain, not yours.

### 6. `apps/web/.env.local` — update the comment

```env
#NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

This file is not deployed — it's just a local reference so the production value is documented.

---

## Available Scripts

From the project root:

| Command | Description |
|---|---|
| `pnpm dev:web` | Start Next.js dev server |
| `pnpm dev:mobile` | Start Expo dev server |
| `pnpm build:web` | Production build of the web app |
| `pnpm db:push` | Push schema directly to local DB (no migration file) |
| `pnpm db:generate` | Generate versioned migration file from schema changes |

---
