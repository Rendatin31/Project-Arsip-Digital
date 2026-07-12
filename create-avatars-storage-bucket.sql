-- CREATE AVATARS STORAGE BUCKET (SAFE VERSION - NO ERROR IF ALREADY EXISTS)
-- Jalankan SQL ini di Supabase SQL Editor

-- Create avatars bucket (public access)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for avatars bucket
-- Note: Using DROP IF EXISTS to avoid "already exists" errors

-- Policy 1: Anyone can view avatars (public read)
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy 2: Users can upload their own avatar
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Users can update their own avatar
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Users can delete their own avatar
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Verify bucket and policies created
SELECT 
  id,
  name,
  public,
  created_at
FROM storage.buckets 
WHERE id = 'avatars';

-- Verify policies
SELECT 
  policyname,
  cmd as operation,
  CASE 
    WHEN policyname LIKE '%publicly%' THEN 'public'
    ELSE 'authenticated'
  END as target_role
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%avatar%'
ORDER BY policyname;

-- Expected output: 4 policies
-- 1. Avatars are publicly accessible (SELECT, public)
-- 2. Users can delete their own avatar (DELETE, authenticated)
-- 3. Users can upload their own avatar (INSERT, authenticated)
-- 4. Users can update their own avatar (UPDATE, authenticated)

-- ✅ Jika muncul 4 policies = BERHASIL!
