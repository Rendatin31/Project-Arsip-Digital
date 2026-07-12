-- FIX NOTIFICATIONS RLS POLICY
-- Jalankan SQL ini di Supabase SQL Editor untuk memperbaiki error 403 Forbidden

-- Step 1: Drop ALL existing policies (semua variasi nama policy)
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
DROP POLICY IF EXISTS "notifications_insert_authenticated" ON notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;

-- Step 2: Disable RLS temporarily to clean up
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Step 3: Re-enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Step 4: Create NEW policies with correct permissions

-- Policy 1: Users can SELECT (view) their own notifications
CREATE POLICY "notifications_select_own"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Any authenticated user can INSERT notifications for anyone
-- This is the KEY policy that allows the notification system to work
CREATE POLICY "notifications_insert_authenticated"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy 3: Users can UPDATE (mark as read) their own notifications
CREATE POLICY "notifications_update_own"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can DELETE their own notifications
CREATE POLICY "notifications_delete_own"
  ON notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Step 5: Verify policies are created correctly
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
WHERE tablename = 'notifications'
ORDER BY policyname;

-- Step 6: Test insert (optional - replace with your user_id)
-- This should work now without 403 error
-- INSERT INTO notifications (user_id, type, title, message, is_read)
-- VALUES (auth.uid(), 'system', 'Test Notification', 'This is a test', false);

