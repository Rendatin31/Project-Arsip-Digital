-- ==========================================
-- FIX TRIGGER untuk handle_new_user
-- Agar role dari user_metadata tersimpan ke profiles
-- ==========================================

-- Drop trigger lama
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop function lama
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Buat function baru yang mengambil role dari user_metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Buat trigger baru
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- SELESAI!
-- Sekarang saat user baru dibuat:
-- - Email akan disimpan
-- - Full name dari user_metadata akan disimpan
-- - Role dari user_metadata akan disimpan (bukan default 'user')
-- ==========================================
