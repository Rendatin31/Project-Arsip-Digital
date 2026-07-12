-- ==========================================
-- UPDATE ROW LEVEL SECURITY (RLS) POLICIES
-- Untuk mengizinkan semua user melihat semua data
-- ==========================================

-- 1. DROP semua policy yang ada untuk tabel documents
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON documents;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON documents;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON documents;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON documents;

-- 2. Buat policy baru yang mengizinkan SEMUA authenticated user untuk akses SEMUA data
CREATE POLICY "Allow all authenticated users to view all documents"
ON documents FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow all authenticated users to insert documents"
ON documents FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to update all documents"
ON documents FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to delete all documents"
ON documents FOR DELETE
TO authenticated
USING (true);

-- 3. UPDATE policies untuk tabel categories
DROP POLICY IF EXISTS "Users can view their own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;

CREATE POLICY "Allow all authenticated users to view all categories"
ON categories FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow all authenticated users to insert categories"
ON categories FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to update all categories"
ON categories FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to delete all categories"
ON categories FOR DELETE
TO authenticated
USING (true);

-- 4. UPDATE policies untuk tabel directories
DROP POLICY IF EXISTS "Users can view their own directories" ON directories;
DROP POLICY IF EXISTS "Users can insert their own directories" ON directories;
DROP POLICY IF EXISTS "Users can update their own directories" ON directories;
DROP POLICY IF EXISTS "Users can delete their own directories" ON directories;

CREATE POLICY "Allow all authenticated users to view all directories"
ON directories FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow all authenticated users to insert directories"
ON directories FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to update all directories"
ON directories FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all authenticated users to delete all directories"
ON directories FOR DELETE
TO authenticated
USING (true);

-- 5. UPDATE policies untuk tabel audit_logs
DROP POLICY IF EXISTS "Users can view their own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can insert their own audit logs" ON audit_logs;

CREATE POLICY "Allow all authenticated users to view all audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow all authenticated users to insert audit logs"
ON audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- 6. UPDATE policies untuk tabel profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Allow all authenticated users to view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow all authenticated users to update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ==========================================
-- SELESAI!
-- Sekarang semua authenticated user dapat:
-- - Melihat semua dokumen dari semua user
-- - Menambah, edit, dan hapus dokumen
-- - Melihat dan edit kategori, direktori, audit logs, dan profiles
-- ==========================================
