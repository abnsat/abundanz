-- Row Level Security for all public tables.
-- NOTE: the Next.js API uses Drizzle with the service role key and bypasses RLS entirely.
-- These policies protect against direct DB access (e.g. leaked credentials, future
-- Supabase client queries, Supabase Studio browsing as a non-service role).

-- ── users ────────────────────────────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Authenticated users can only read and update their own row.
CREATE POLICY "users: own row" ON public.users
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- ── videos ───────────────────────────────────────────────────────────────────
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Public catalog — anyone (including unauthenticated) can read video metadata.
CREATE POLICY "videos: public read" ON public.videos
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ── subscriptions ─────────────────────────────────────────────────────────────
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own subscription row. No direct writes — all writes
-- go through the service role via API routes or webhooks.
CREATE POLICY "subscriptions: own row read" ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);
