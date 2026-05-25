CREATE TABLE IF NOT EXISTS public.video_reactions (
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  video_id text NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  reaction text NOT NULL CHECK (reaction IN ('like', 'dislike')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT video_reactions_pkey PRIMARY KEY (user_id, video_id)
);

ALTER TABLE public.video_reactions ENABLE ROW LEVEL SECURITY;

-- Authenticated users can manage their own reactions
CREATE POLICY "users manage own reactions" ON public.video_reactions
  FOR ALL TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

-- Anyone can read counts (for aggregate queries)
CREATE POLICY "anyone reads reactions" ON public.video_reactions
  FOR SELECT TO anon, authenticated
  USING (true);
