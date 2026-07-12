ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS letter_date date;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS sender text;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS recipient text;
