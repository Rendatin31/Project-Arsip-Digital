-- Fix RLS untuk profiles: Allow user membaca profile sendiri
-- Ini diperlukan agar user bisa check status saat login

-- Drop existing policy jika ada
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

-- Create policy: User dapat membaca profile sendiri
CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Pastikan RLS enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Optional: Allow service role full access
DROP POLICY IF EXISTS "Service role has full access" ON profiles;
CREATE POLICY "Service role has full access"
ON profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
