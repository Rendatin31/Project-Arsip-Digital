-- Migration: tambah kolom user_id ke categories agar folder per-pengguna

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Categories readable by owner') THEN
    CREATE POLICY "Categories readable by owner"
      ON public.categories FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Categories insertable by owner') THEN
    CREATE POLICY "Categories insertable by owner"
      ON public.categories FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Categories updateable by owner') THEN
    CREATE POLICY "Categories updateable by owner"
      ON public.categories FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Categories deletable by owner') THEN
    CREATE POLICY "Categories deletable by owner"
      ON public.categories FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;
