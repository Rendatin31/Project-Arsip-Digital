-- Fix Storage RLS Policy untuk Allow Super Admin & Admin menghapus file user lain
-- Jalankan SQL ini di Supabase SQL Editor

-- 1. Drop existing delete policy jika ada
DROP POLICY IF EXISTS "Allow authenticated users to delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own files or admins to delete any files" ON storage.objects;

-- 2. Create new delete policy yang membolehkan:
--    - User menghapus file sendiri
--    - Super Admin menghapus file siapa saja
--    - Admin menghapus file siapa saja
CREATE POLICY "Allow users to delete own files or admins to delete any files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (
    -- Owner dapat menghapus file sendiri
    auth.uid()::text = owner::text
    OR
    -- Super Admin dan Admin dapat menghapus file siapa saja
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin')
      AND profiles.status = 'Aktif'
    )
  )
);

-- 3. Verify policy sudah dibuat
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND cmd = 'DELETE';

-- Output should show the new policy "Allow users to delete own files or admins to delete any files"
