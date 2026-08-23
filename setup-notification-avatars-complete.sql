-- =========================================
-- Setup Notification Avatars - Complete SQL
-- =========================================
-- 
-- Tujuan: Menampilkan foto profil user di notifikasi modal
-- 
-- Jalankan file SQL ini di Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → Paste & Run
-- 
-- =========================================

-- STEP 1: Tambah kolom creator_user_id dan creator_avatar_url
-- =========================================

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS creator_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS creator_avatar_url text;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_creator_user_id ON notifications(creator_user_id);

-- Add comments for documentation
COMMENT ON COLUMN notifications.creator_user_id IS 'User who triggered this notification (uploader, editor, etc.)';
COMMENT ON COLUMN notifications.creator_avatar_url IS 'Avatar URL of creator user (denormalized for performance)';

-- =========================================
-- STEP 2: Update fungsi create_notification
-- =========================================

CREATE OR REPLACE FUNCTION create_notification(
  target_user_id uuid,
  notif_type text,
  notif_title text,
  notif_message text,
  creator_id uuid DEFAULT NULL,
  creator_avatar text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, creator_user_id, creator_avatar_url, is_read)
  VALUES (target_user_id, notif_type, notif_title, notif_message, creator_id, creator_avatar, false)
  RETURNING id INTO new_notification_id;
  
  RETURN new_notification_id;
END;
$$;

-- =========================================
-- VERIFICATION QUERIES
-- =========================================

-- Cek apakah kolom baru sudah ada
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'notifications' 
  AND column_name IN ('creator_user_id', 'creator_avatar_url');

-- Expected output:
-- creator_user_id     | uuid | YES
-- creator_avatar_url  | text | YES

-- Cek fungsi create_notification
SELECT 
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'create_notification';

-- Expected output harus menunjukkan parameter: creator_id, creator_avatar

-- =========================================
-- TEST QUERY (OPTIONAL)
-- =========================================

-- Test create notification dengan creator info
-- Ganti <user-id> dengan UUID user yang valid dari profiles table

-- SELECT create_notification(
--   '<user-id>'::uuid,                    -- target_user_id
--   'upload',                              -- notif_type
--   'Test Notification',                   -- notif_title
--   'This is a test message',              -- notif_message
--   '<creator-user-id>'::uuid,             -- creator_id
--   'avatars/test-avatar.jpg'              -- creator_avatar
-- );

-- Cek hasil test
-- SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;

-- =========================================
-- DONE! ✅
-- =========================================
-- 
-- Setelah menjalankan SQL ini:
-- 1. Commit & push code ke GitHub
-- 2. Tunggu Vercel auto-deploy
-- 3. Hard refresh browser (Ctrl+Shift+R)
-- 4. Test upload dokumen dan cek notifikasi
-- 
-- =========================================
