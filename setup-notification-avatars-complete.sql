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

Perfect! Git sudah terinstall. Sekarang mari kita lanjutkan dengan deployment steps:

## 🚀 Langkah Selanjutnya

### **Step 1: Jalankan SQL di Supabase Dulu** ⚠️ PENTING!

Sebelum commit code, **WAJIB jalankan SQL dulu** supaya database siap:

1. **Buka Supabase Dashboard**: https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri
4. Klik **New Query**
5. Copy file `setup-notification-avatars-complete.sql` yang sudah terbuka
6. Paste ke SQL Editor
7. Klik **Run** (atau tekan F5)
8. Tunggu sampai muncul "Success"

---

### **Step 2: Git Commands untuk Commit & Push**

Setelah SQL berhasil, jalankan command ini di terminal:

Git baru saja diinstall, kita perlu restart terminal atau menambahkan ke PATH. Mari gunakan **GitHub Desktop** saja yang lebih mudah:

## 📦 Deployment via GitHub Desktop (Cara Termudah)

### **Step 1: Buka GitHub Desktop**

1. Buka aplikasi **GitHub Desktop**
2. Pastikan repository **Project-Arsip-Digital** terbuka
3. Anda akan melihat daftar file yang berubah di panel kiri:

```
✅ src/components/Header.jsx
✅ src/utils/notifications.js
✅ add-creator-to-notifications.sql
✅ update-create-notification-function.sql
✅ setup-notification-avatars-complete.sql
✅ SETUP-NOTIFICATION-AVATARS.md
✅ NOTIFICATION-AVATAR-CHANGES.md
```

### **Step 2: Review Perubahan**

Klik setiap file untuk melihat apa yang berubah:
- **Garis hijau** = kode baru ditambahkan
- **Garis merah** = kode lama dihapus
- Pastikan semuanya sesuai

### **Step 3: Commit Changes**

1. Di bagian bawah kiri, ada box **"Summary"**
2. Tulis commit message:
   ```
   Tampilkan avatar user di notifikasi & hapus border
   ```

3. (Opsional) Di box **"Description"**, tulis detail:
   ```
   - Tambah creator_user_id & creator_avatar_url ke notifications
   - Update create_notification function
   - Tampilkan foto profil user asli di notifikasi modal
   - Hapus border abu-abu di icon person default
   - Auto-fetch avatar dari profiles table
   ```

4. Klik tombol biru **"Commit to main"**

### **Step 4: Push ke GitHub**

1. Setelah commit, akan muncul tombol **"Push origin"** di atas
2. Klik tombol **"Push origin"**
3. Tunggu sampai selesai (progress bar akan hilang)

### **Step 5: Vercel Auto-Deploy**

1. Buka Vercel Dashboard: https://vercel.com/dashboard
2. Klik project Anda
3. Lihat di tab **"Deployments"**
4. Akan muncul deployment baru dengan status:
   - 🟡 **Building...** (sedang build, tunggu 2-5 menit)
   - 🟢 **Ready** (selesai, deployment sukses!)

### **Step 6: Test di Browser**

1. Tunggu sampai Vercel deployment **Ready** ✅
2. Buka: `https://rendatinarsip.vercel.app/`
3. **Hard refresh**: `Ctrl + Shift + R` (penting!)
4. Login dan test:
   - Upload dokumen
   - Buka notifikasi
   - Cek apakah avatar muncul (jika user sudah upload foto)
   - Cek apakah icon person tidak ada border abu-abu

---

## ⚠️ PENTING: Urutan yang Benar

```
1. ✅ Jalankan SQL di Supabase DULU
   ↓
2. ✅ Commit & Push code ke GitHub
   ↓
3. ✅ Tunggu Vercel auto-deploy
   ↓
4. ✅ Hard refresh browser
   ↓
5. ✅ Test hasilnya
```

**JANGAN DIBALIK!** Kalau push code dulu sebelum SQL dijalankan, aplikasi akan error karena kolom database belum ada.

---

## 🎯 Quick Checklist

Sebelum push, pastikan:

- [ ] ✅ Git sudah terinstall (DONE!)
- [ ] ⚠️ SQL sudah dijalankan di Supabase (BELUM - LAKUKAN DULU!)
- [ ] ⏳ GitHub Desktop terbuka
- [ ] ⏳ File changes sudah direview
- [ ] ⏳ Commit message sudah ditulis
- [ ] ⏳ Ready untuk push

---

**Apakah SQL sudah dijalankan di Supabase?** Kalau sudah, lanjut ke GitHub Desktop. Kalau belum, jalankan SQL dulu sekarang! 😊Perfect! Git sudah terinstall. Sekarang mari kita lanjutkan dengan deployment steps:

## 🚀 Langkah Selanjutnya

### **Step 1: Jalankan SQL di Supabase Dulu** ⚠️ PENTING!

Sebelum commit code, **WAJIB jalankan SQL dulu** supaya database siap:

1. **Buka Supabase Dashboard**: https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri
4. Klik **New Query**
5. Copy file `setup-notification-avatars-complete.sql` yang sudah terbuka
6. Paste ke SQL Editor
7. Klik **Run** (atau tekan F5)
8. Tunggu sampai muncul "Success"

---

### **Step 2: Git Commands untuk Commit & Push**

Setelah SQL berhasil, jalankan command ini di terminal:

Git baru saja diinstall, kita perlu restart terminal atau menambahkan ke PATH. Mari gunakan **GitHub Desktop** saja yang lebih mudah:

## 📦 Deployment via GitHub Desktop (Cara Termudah)

### **Step 1: Buka GitHub Desktop**

1. Buka aplikasi **GitHub Desktop**
2. Pastikan repository **Project-Arsip-Digital** terbuka
3. Anda akan melihat daftar file yang berubah di panel kiri:

```
✅ src/components/Header.jsx
✅ src/utils/notifications.js
✅ add-creator-to-notifications.sql
✅ update-create-notification-function.sql
✅ setup-notification-avatars-complete.sql
✅ SETUP-NOTIFICATION-AVATARS.md
✅ NOTIFICATION-AVATAR-CHANGES.md
```

### **Step 2: Review Perubahan**

Klik setiap file untuk melihat apa yang berubah:
- **Garis hijau** = kode baru ditambahkan
- **Garis merah** = kode lama dihapus
- Pastikan semuanya sesuai

### **Step 3: Commit Changes**

1. Di bagian bawah kiri, ada box **"Summary"**
2. Tulis commit message:
   ```
   Tampilkan avatar user di notifikasi & hapus border
   ```

3. (Opsional) Di box **"Description"**, tulis detail:
   ```
   - Tambah creator_user_id & creator_avatar_url ke notifications
   - Update create_notification function
   - Tampilkan foto profil user asli di notifikasi modal
   - Hapus border abu-abu di icon person default
   - Auto-fetch avatar dari profiles table
   ```

4. Klik tombol biru **"Commit to main"**

### **Step 4: Push ke GitHub**

1. Setelah commit, akan muncul tombol **"Push origin"** di atas
2. Klik tombol **"Push origin"**
3. Tunggu sampai selesai (progress bar akan hilang)

### **Step 5: Vercel Auto-Deploy**

1. Buka Vercel Dashboard: https://vercel.com/dashboard
2. Klik project Anda
3. Lihat di tab **"Deployments"**
4. Akan muncul deployment baru dengan status:
   - 🟡 **Building...** (sedang build, tunggu 2-5 menit)
   - 🟢 **Ready** (selesai, deployment sukses!)

### **Step 6: Test di Browser**

1. Tunggu sampai Vercel deployment **Ready** ✅
2. Buka: `https://rendatinarsip.vercel.app/`
3. **Hard refresh**: `Ctrl + Shift + R` (penting!)
4. Login dan test:
   - Upload dokumen
   - Buka notifikasi
   - Cek apakah avatar muncul (jika user sudah upload foto)
   - Cek apakah icon person tidak ada border abu-abu

---

## ⚠️ PENTING: Urutan yang Benar

```
1. ✅ Jalankan SQL di Supabase DULU
   ↓
2. ✅ Commit & Push code ke GitHub
   ↓
3. ✅ Tunggu Vercel auto-deploy
   ↓
4. ✅ Hard refresh browser
   ↓
5. ✅ Test hasilnya
```

**JANGAN DIBALIK!** Kalau push code dulu sebelum SQL dijalankan, aplikasi akan error karena kolom database belum ada.

---

## 🎯 Quick Checklist

Sebelum push, pastikan:

- [ ] ✅ Git sudah terinstall (DONE!)
- [ ] ⚠️ SQL sudah dijalankan di Supabase (BELUM - LAKUKAN DULU!)
- [ ] ⏳ GitHub Desktop terbuka
- [ ] ⏳ File changes sudah direview
- [ ] ⏳ Commit message sudah ditulis
- [ ] ⏳ Ready untuk push

---

**Apakah SQL sudah dijalankan di Supabase?** Kalau sudah, lanjut ke GitHub Desktop. Kalau belum, jalankan SQL dulu sekarang! 😊ALTER TABLE notifications 
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
