-- Fix Storage RLS Policies untuk Sharing Files
-- Jalankan di Supabase SQL Editor

-- ============================================
-- STORAGE BUCKET RLS POLICIES
-- ============================================

-- 1. DROP existing policies (jika ada)
DROP POLICY IF EXISTS "Users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read all files" ON storage.objects;

-- 2. CREATE new policies untuk authenticated users

-- Policy 1: INSERT (Upload) - Users bisa upload file
CREATE POLICY "Authenticated users can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL
);

-- Policy 2: SELECT (Read) - Users bisa baca SEMUA file yang status PUBLISHED atau PRIVATE
-- Ini penting untuk sharing antar user
CREATE POLICY "Authenticated users can read published files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL
);

-- Policy 3: UPDATE - Users hanya bisa update file milik sendiri
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: DELETE - Users hanya bisa delete file milik sendiri
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- VERIFY POLICIES
-- ============================================

-- Check policies yang sudah dibuat
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;

-- ============================================
-- BUCKET CONFIGURATION (Optional)
-- ============================================

-- Pastikan bucket 'documents' exist dan public = false
-- Jalankan jika bucket belum ada
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents', 
  'documents', 
  false, -- PRIVATE bucket (butuh auth untuk akses)
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- NOTES
-- ============================================

/*
PENTING:
1. Policy "Authenticated users can read published files" memungkinkan semua authenticated users
   membaca file di storage. Ini diperlukan agar user B bisa buka file yang diupload user A.

2. Filtering berdasarkan status dokumen (PUBLISHED/PRIVATE) dilakukan di level aplikasi
   (query documents table), bukan di storage level.

3. File storage path format: {user_id}/{file_name}
   - Folder pertama = user_id uploader
   - Policy UPDATE/DELETE check ownership via folder name

4. Jika butuh lebih strict (hanya owner yang bisa baca):
   - Ubah SELECT policy jadi sama seperti UPDATE/DELETE
   - Tapi ini akan break sharing feature

TESTING:
1. Login sebagai User A
2. Upload file
3. Set status = PUBLISHED
4. Login sebagai User B
5. Buka halaman Direktori Arsip
6. Klik preview file → Harus bisa buka ✅
*/
