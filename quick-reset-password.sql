-- =====================================================
-- QUICK RESET PASSWORD - MANUAL
-- =====================================================
-- Gunakan ini untuk reset password INSTANT tanpa email
-- Jalankan di Supabase SQL Editor

-- Reset password untuk mahersapps28@gmail.com
UPDATE auth.users
SET 
  encrypted_password = crypt('Admin123!@#', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'mahersapps28@gmail.com';

-- Verify password updated
SELECT 
  email,
  updated_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'mahersapps28@gmail.com';

-- =====================================================
-- SELESAI!
-- Sekarang login dengan:
-- Email: mahersapps28@gmail.com
-- Password: Admin123!@#
-- =====================================================

-- (Optional) Generate reset link via email jika prefer pakai link
-- SELECT auth.send_password_reset('mahersapps28@gmail.com');
