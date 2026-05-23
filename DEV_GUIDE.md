# Abundanz — Dev & Build Guide

## Prerequisites

- Node 20+, pnpm 8+
- Xcode + iOS Simulator (for mobile)
- Supabase CLI (`brew install supabase/tap/supabase`)
- Stripe CLI (`brew install stripe/stripe-cli/stripe`)
- Expo CLI (`pnpm add -g expo-cli` or use `npx expo`)

---

## Local Development

### 1. Start local Supabase

```bash
supabase start
```

This starts Postgres (port 54322), the Supabase API (port 54321), and the dashboard.

- Dashboard: http://localhost:54323
- API: http://localhost:54321

Stop it with `supabase stop`. Data persists unless you run `supabase stop --no-backup`.

### 2. Push DB schema

Run once after first clone, and again whenever you change `packages/shared/src/db/schema.ts`:

```bash
pnpm db:push
```

### 3. Start the web app

```bash
pnpm dev:web
```

Runs Next.js at http://localhost:3000.

**Required env** — `apps/web/.env.local` must have:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local anon key from supabase start output>
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...   ← from stripe listen (see below)
REVENUECAT_SECRET_KEY=sk_...
BUNNY_LIBRARY_ID=...
BUNNY_CDN_HOSTNAME=...
BUNNY_API_KEY=...
BUNNY_TOKEN_AUTH_KEY=...
```

### 4. Forward Stripe webhooks locally

In a separate terminal, keep this running the entire time you test Stripe payments:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the `whsec_...` secret it prints and put it in `STRIPE_WEBHOOK_SECRET`.

### 5. Start the mobile app (iOS Simulator)

In a separate terminal:

```bash
pnpm dev:mobile
```

This starts the Metro bundler. Press `i` to open the iOS Simulator.

**Required env** — `apps/mobile/.env.local` must have:

```
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<same local anon key>
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_REVENUECAT_API_KEY=test_...
EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID=Abundanz Pro
```

> **Note:** `localhost` works from the iOS Simulator because it runs on the same Mac. On a
> physical device, replace `localhost` with your Mac's local IP (e.g. `192.168.1.x`).

### 6. Rebuild mobile after adding native packages

`react-native-purchases` and `expo-video` are native modules. After installing any new native
package, you must rebuild the dev client — Metro alone is not enough:

```bash
cd apps/mobile && npx expo run:ios
```

You only need to do this when native dependencies change. For JS-only changes, Metro hot-reload
works fine with `pnpm dev:mobile`.

---

## Schema changes

Whenever you change `packages/shared/src/db/schema.ts`:

```bash
# Option A — push directly (dev only, no migration file)
pnpm db:push

# Option B — generate a migration file, then apply it (use for production)
pnpm db:generate
pnpm db:migrate
```

See `README.md` for the full step-by-step schema change workflow.

---

## Production

### Web — Vercel

Vercel auto-deploys on push to `main`. No manual step needed.

**Environment variables** to set in Vercel dashboard (Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<production anon key>
NEXT_PUBLIC_APP_URL=https://abundanz-web.vercel.app
DATABASE_URL=postgresql://postgres.<project>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...   ← from Stripe dashboard webhook endpoint
REVENUECAT_SECRET_KEY=sk_...
BUNNY_LIBRARY_ID=...
BUNNY_CDN_HOSTNAME=...
BUNNY_API_KEY=...
BUNNY_TOKEN_AUTH_KEY=...
```

After setting env vars, trigger a redeploy from the Vercel dashboard.

**Stripe webhook for production:**
In the Stripe dashboard → Developers → Webhooks, create an endpoint pointing to:
```
https://abundanz-web.vercel.app/api/webhooks/stripe
```
Events to listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

**RevenueCat webhook for production:**
In RevenueCat dashboard → Project Settings → Webhooks, add:
```
URL:  https://abundanz-web.vercel.app/api/webhooks/revenuecat
Auth: Bearer sk_drEDjbSUGgePPWJByrMOnhdTGIure
```

### Mobile — TestFlight / App Store

1. Switch `apps/mobile/.env.local` to production values:

```
EXPO_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<production anon key>
EXPO_PUBLIC_API_URL=https://abundanz-web.vercel.app
EXPO_PUBLIC_REVENUECAT_API_KEY=appl_...   ← iOS production key from RevenueCat
EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID=Abundanz Pro
```

2. Build and submit to TestFlight:

```bash
cd apps/mobile
npx eas build --platform ios --profile preview   # TestFlight
npx eas build --platform ios --profile production # App Store
npx eas submit --platform ios                     # Submit to App Store Connect
```

> EAS requires `eas.json` to be configured. Run `npx eas build:configure` once to generate it.

---

## Useful local URLs

| Service | URL |
|---|---|
| Web app | http://localhost:3000 |
| Supabase dashboard | http://localhost:54323 |
| Supabase API | http://localhost:54321 |
| Postgres (direct) | postgresql://postgres:postgres@127.0.0.1:54322/postgres |

## Common issues

**`supabase start` fails** — Docker must be running first.

**Metro can't resolve `@abundanz/shared`** — Run `pnpm install` from the repo root, then restart Metro.

**Mobile shows "Network request failed"** — On a real device, `localhost` doesn't resolve. Use your Mac's LAN IP in `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_SUPABASE_URL`.

**Stripe webhook returns 400 "Invalid signature"** — The `STRIPE_WEBHOOK_SECRET` in `.env.local` must be the one printed by `stripe listen`, not the one from the Stripe dashboard (those are different secrets).

**`expo run:ios` fails with "No simulator found"** — Open Xcode, go to Window → Devices and Simulators, and download an iOS runtime.
