-- Add status column to videos.
-- Default 'ready' so all existing videos remain visible immediately.
-- New uploads start as 'processing' and flip to 'ready' via Bunny.net webhook.
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'ready';
