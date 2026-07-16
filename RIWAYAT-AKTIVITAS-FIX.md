# Fix: Riwayat Aktivitas Hanya Menampilkan User yang Login

## Problem
Super Admin/Admin hanya bisa melihat aktivitas mereka sendiri, tidak bisa melihat aktivitas user lain.

## Root Cause
Kemungkinan besar: **Supabase Row Level Security (RLS)** membatasi query audit_logs

## Solution

### 1. Update Supabase RLS Policy

Buka Supabase SQL Editor dan jalankan:

```sql
-- Hapus policy lama
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON audit_logs;
DROP POLICY IF EXISTS "Users can view their own audit logs" ON audit_logs;

-- Policy untuk Super Admin & Admin (bisa lihat SEMUA)
CREATE POLICY "Super Admin and Admin see all audit logs"
ON audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'admin')
  )
);

-- Policy untuk User biasa (hanya lihat milik sendiri)
CREATE POLICY "Users see own audit logs"
ON audit_logs
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'admin')
  )
);
```

### 2. Verifikasi RLS Aktif

```sql
-- Check apakah RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'audit_logs';

-- Check policies yang ada
SELECT * 
FROM pg_policies 
WHERE tablename = 'audit_logs';
```

### 3. Test Query Manual

```sql
-- Sebagai Super Admin, harusnya bisa lihat semua
SELECT user_id, action, created_at 
FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

### 4. Alternative: Disable RLS (Not Recommended for Production)

```sql
-- HANYA untuk testing/development
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
```

⚠️ **Warning:** Disabling RLS membuat semua user bisa lihat semua data!

## Debugging Steps

1. **Check Console Logs:**
   - Open Browser DevTools (F12)
   - Go to Console tab
   - Look for: `Fetched audit logs: X records`
   - Look for: `Unique users in logs: [...]`

2. **Check Supabase Logs:**
   - Go to Supabase Dashboard
   - Project → Logs
   - Check for any permission errors

3. **Manual Database Check:**
   - Supabase Dashboard → Table Editor
   - Open `audit_logs` table
   - Check if there are records from different user_ids

## Expected Result

After fixing RLS:
- ✅ Super Admin sees ALL activities from ALL users
- ✅ Admin sees ALL activities from ALL users  
- ✅ Editor/Viewer only sees their own activities
- ✅ User dropdown shows all users who have activities
- ✅ Filter by user works correctly

## Verification

1. Login as Super Admin
2. Go to Riwayat Aktivitas
3. Check dropdown "Pengguna" - should show multiple users
4. Check table - should show activities from different users
5. Select specific user from dropdown - should filter correctly
