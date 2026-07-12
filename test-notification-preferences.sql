-- TEST NOTIFICATION PREFERENCES
-- Jalankan query ini untuk debugging preferensi notifikasi

-- 1. Cek apakah tabel notification_preferences ada
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'notification_preferences'
) AS table_exists;

-- 2. Lihat semua preferensi notifikasi yang ada
SELECT 
  np.id,
  np.user_id,
  p.full_name,
  p.role,
  np.email_notifications,
  np.document_upload,
  np.document_update,
  np.security_alert,
  np.system_update,
  np.weekly_report,
  np.created_at,
  np.updated_at
FROM notification_preferences np
LEFT JOIN profiles p ON p.id = np.user_id
ORDER BY p.full_name;

-- 3. Lihat preferensi untuk user yang sedang login (ganti auth.uid() dengan user_id jika perlu)
SELECT 
  *
FROM notification_preferences
WHERE user_id = auth.uid();

-- 4. Count berapa banyak user yang punya preferensi
SELECT 
  COUNT(*) as total_users_with_preferences
FROM notification_preferences;

-- 5. Lihat user yang belum punya preferensi
SELECT 
  u.id,
  p.full_name,
  p.email,
  p.role
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE u.id NOT IN (SELECT user_id FROM notification_preferences)
ORDER BY p.full_name;

-- 6. Test: Insert default preferences untuk user tertentu (UNCOMMENT dan ganti USER_ID)
-- INSERT INTO notification_preferences (
--   user_id, 
--   email_notifications, 
--   document_upload, 
--   document_update, 
--   security_alert, 
--   system_update, 
--   weekly_report
-- ) VALUES (
--   'USER_ID_HERE',
--   true,
--   false, -- Set false untuk test
--   false, -- Set false untuk test
--   true,
--   false,
--   true
-- )
-- ON CONFLICT (user_id) DO UPDATE SET
--   document_upload = false,
--   document_update = false;

-- 7. Test: Update preferensi untuk user yang sedang login
-- UPDATE notification_preferences
-- SET 
--   document_upload = false,
--   document_update = false,
--   updated_at = now()
-- WHERE user_id = auth.uid();

-- 8. Lihat notifikasi yang masuk untuk user yang sedang login
SELECT 
  n.id,
  n.type,
  n.title,
  n.message,
  n.is_read,
  n.created_at
FROM notifications n
WHERE n.user_id = auth.uid()
ORDER BY n.created_at DESC
LIMIT 20;

-- 9. Hapus semua preferensi (HATI-HATI!)
-- DELETE FROM notification_preferences;

-- 10. Reset preferensi ke default untuk semua user
-- UPDATE notification_preferences
-- SET 
--   email_notifications = true,
--   document_upload = true,
--   document_update = true,
--   security_alert = true,
--   system_update = false,
--   weekly_report = true,
--   updated_at = now();
