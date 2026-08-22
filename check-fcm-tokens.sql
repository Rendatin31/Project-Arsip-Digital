-- Check FCM tokens in database
-- Run this in Supabase SQL Editor to see which users have FCM tokens

-- 1. Show all users with their FCM token status
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  CASE 
    WHEN fcm_token IS NOT NULL THEN '✅ HAS TOKEN'
    ELSE '❌ NO TOKEN'
  END as token_status,
  CASE 
    WHEN fcm_token IS NOT NULL 
    THEN LEFT(fcm_token, 30) || '...' 
    ELSE NULL 
  END as token_preview,
  fcm_token_updated_at,
  last_login,
  created_at
FROM profiles
WHERE status = 'Aktif'
ORDER BY fcm_token_updated_at DESC NULLS LAST;

-- 2. Count users with and without tokens
SELECT 
  COUNT(*) FILTER (WHERE fcm_token IS NOT NULL) as users_with_token,
  COUNT(*) FILTER (WHERE fcm_token IS NULL) as users_without_token,
  COUNT(*) as total_active_users
FROM profiles
WHERE status = 'Aktif';

-- 3. Show recent notifications and their target users
SELECT 
  n.id,
  n.user_id,
  p.email as target_user_email,
  p.full_name as target_user_name,
  CASE 
    WHEN p.fcm_token IS NOT NULL THEN '✅ HAS TOKEN'
    ELSE '❌ NO TOKEN'
  END as user_has_token,
  n.type,
  n.title,
  n.message,
  n.is_read,
  n.created_at
FROM notifications n
LEFT JOIN profiles p ON n.user_id = p.id
ORDER BY n.created_at DESC
LIMIT 10;

-- 4. Show which user uploaded documents recently (who triggers notifications)
SELECT 
  u.email as uploader_email,
  u.full_name as uploader_name,
  COUNT(*) as documents_uploaded,
  MAX(d.created_at) as last_upload
FROM documents d
LEFT JOIN profiles u ON d.user_id = u.id
WHERE d.created_at > NOW() - INTERVAL '7 days'
GROUP BY u.id, u.email, u.full_name
ORDER BY last_upload DESC;
