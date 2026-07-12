-- ==========================================
-- TAMBAH KOLOM STATUS KE TABEL PROFILES
-- ==========================================

-- Cek apakah kolom status sudah ada, jika belum tambahkan
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN status text NOT NULL DEFAULT 'Aktif';
  END IF;
END $$;

-- Update existing records untuk set status default jika NULL
UPDATE public.profiles 
SET status = 'Aktif' 
WHERE status IS NULL;

-- ==========================================
-- SELESAI!
-- Kolom status sudah ditambahkan ke tabel profiles
-- Default value: 'Aktif'
-- ==========================================
