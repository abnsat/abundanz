ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'English';
UPDATE public.users SET preferred_language = 'English' WHERE preferred_language IS NULL;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS language text;
