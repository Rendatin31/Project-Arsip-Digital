# Fix Audit Logs Access for All Admins

## Masalah
Admin hanya bisa melihat audit logs mereka sendiri, tidak bisa melihat audit logs dari user lain.

## Penyebab
RLS (Row Level Security) policy di table `audit_logs` membatasi setiap user hanya bisa melihat data mereka sendiri.

## Solusi

### Langkah 1: Buka Supabase SQL Editor
1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project Anda
3. Klik menu "SQL Editor" di sidebar kiri

### Langkah 2: Jalankan SQL Script
Copy dan paste script berikut ke SQL Editor, lalu klik "Run":

```sql
-- Fix RLS Policy for audit_logs table
-- Allow admins to view ALL audit logs from all users

-- First, enable RLS if not enabled
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Users can insert own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON audit_logs;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON audit_logs;

-- Create new policies

-- 1. Admin can view ALL audit logs (from all users)
CREATE POLICY "Admins can view all audit logs"
ON audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 2. Non-admin users can only view their own audit logs
CREATE POLICY "Users can view own audit logs"
ON audit_logs
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 3. All authenticated users can insert audit logs
CREATE POLICY "Enable insert for authenticated users"
ON audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);
```

### Langkah 3: Verifikasi Policy
Jalankan query berikut untuk memastikan policy sudah benar:

```sql
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'audit_logs';
```

**Expected Result:**
- Policy "Admins can view all audit logs" - FOR SELECT - Admin bisa lihat semua
- Policy "Users can view own audit logs" - FOR SELECT - Non-admin hanya lihat milik sendiri
- Policy "Enable insert for authenticated users" - FOR INSERT - Semua bisa insert

### Langkah 4: Test
1. Login sebagai Admin A
2. Buka halaman "Riwayat Aktivitas"
3. Seharusnya melihat aktivitas dari semua user (Admin A, Admin B, Editor, Viewer, dll)
4. Filter "Pengguna" seharusnya menampilkan semua nama user

### Langkah 5: Refresh Browser
Setelah menjalankan SQL:
1. Logout dari aplikasi
2. Login kembali
3. Buka halaman Riwayat Aktivitas
4. Sekarang Admin bisa melihat aktivitas semua user

## Penjelasan Policy

### Policy 1: "Admins can view all audit logs"
```sql
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
```
**Artinya:** Jika user yang login adalah admin (role = 'admin'), maka dia bisa SELECT semua row di audit_logs tanpa filter.

### Policy 2: "Users can view own audit logs"
```sql
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
```
**Artinya:** User bisa melihat:
- Audit logs yang `user_id = auth.uid()` (milik sendiri), ATAU
- Jika user adalah admin, bisa lihat semua (sebagai fallback)

### Policy 3: "Enable insert for authenticated users"
```sql
WITH CHECK (true)
```
**Artinya:** Semua user yang login bisa INSERT audit logs tanpa pembatasan.

## Troubleshooting

### Jika masih tidak bisa melihat audit logs dari user lain:

1. **Cek role user di database:**
```sql
SELECT id, email, full_name, role, status 
FROM profiles 
WHERE role = 'admin';
```

2. **Cek apakah policy sudah aktif:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'audit_logs';
```

3. **Test manual query:**
```sql
-- Login sebagai admin, jalankan query ini di SQL Editor
-- Seharusnya menampilkan semua audit logs
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;
```

4. **Clear browser cache:**
   - Tekan Ctrl + Shift + Delete
   - Clear cookies and cache
   - Restart browser

5. **Re-login:**
   - Logout dari aplikasi
   - Clear localStorage: Buka Console (F12), ketik `localStorage.clear()`, Enter
   - Login kembali

## File SQL
Script SQL juga tersedia di file: `fix-audit-logs-rls-policy.sql`

---

**Note:** Pastikan Anda memiliki akses admin ke Supabase Dashboard untuk menjalankan SQL script ini.
