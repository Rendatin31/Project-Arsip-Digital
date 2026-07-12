-- ==========================================
-- FIX RLS POLICIES untuk PROFILES
-- Mengizinkan authenticated users untuk edit dan hapus profiles
-- ==========================================

-- 1. DROP semua policy lama untuk profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow all authenticated users to view all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow all authenticated users to update all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow all authenticated users to delete all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON profiles;

-- 2. Buat policy baru yang mengizinkan SEMUA authenticated user untuk akses SEMUA profiles
CREATE POLICY "Allow authenticated users to view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert profiles"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete all profiles"
ON profiles FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- SELESAI!
-- Sekarang semua authenticated user dapat:
-- - Melihat semua profiles
-- - Menambah profiles
-- - Edit semua profiles
-- - Hapus semua profiles
-- ==========================================
