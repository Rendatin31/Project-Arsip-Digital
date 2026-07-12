-- =====================================================
-- CREATE SUPER ADMIN ACCOUNT
-- Email: mahersapps28@gmail.com
-- Name: Mahersy Bobode
-- =====================================================

-- CARA PENGGUNAAN:
-- 1. Ganti 'YOUR_USER_ID_HERE' dengan User ID dari Supabase Authentication
-- 2. Jalankan query ini di Supabase SQL Editor

-- Insert/Update profile untuk super admin
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  status,
  created_at,
  updated_at
)
VALUES (
  'YOUR_USER_ID_HERE', -- GANTI DENGAN USER ID DARI AUTHENTICATION
  'mahersapps28@gmail.com',
  'Mahersy Bobode',
  'admin', -- Role: admin (super admin)
  'Aktif', -- Status: Aktif
  NOW(),
  NOW()
)
ON CONFLICT (id)
DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Verify profile created
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  created_at,
  updated_at
FROM profiles
WHERE email = 'mahersapps28@gmail.com';

-- =====================================================
-- DONE! Sekarang Anda bisa login dengan:
-- Email: mahersapps28@gmail.com
-- Password: (password yang Anda buat di Authentication)
-- =====================================================
