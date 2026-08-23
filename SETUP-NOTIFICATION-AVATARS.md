# Setup Notification Avatars

Panduan untuk menampilkan foto profil user di notifikasi modal.

## 🎯 Perubahan yang Dilakukan

1. **Database**: Menambahkan kolom `creator_user_id` dan `creator_avatar_url` ke tabel notifications
2. **Backend**: Update fungsi `create_notification` untuk menerima creator info
3. **Frontend**: Tampilkan avatar user yang sebenarnya di notifikasi modal
4. **UI**: Hapus border abu-abu di icon person default

---

## 📋 Langkah Setup (WAJIB DIJALANKAN!)

### Step 1: Jalankan SQL di Supabase SQL Editor

Buka **Supabase Dashboard** → **SQL Editor** → **New Query**, lalu jalankan query berikut:

#### 1. Tambah Kolom di Tabel Notifications

```sql
-- Add creator_user_id and creator_avatar_url columns to notifications table
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS creator_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS creator_avatar_url text;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_creator_user_id ON notifications(creator_user_id);

-- Add comment for documentation
COMMENT ON COLUMN notifications.creator_user_id IS 'User who triggered this notification (uploader, editor, etc.)';
COMMENT ON COLUMN notifications.creator_avatar_url IS 'Avatar URL of creator user (denormalized for performance)';
```

#### 2. Update Fungsi create_notification

```sql
-- Update create_notification function to accept creator info
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
```

### Step 2: Commit & Push ke GitHub

Setelah SQL berhasil dijalankan, commit semua perubahan code:

**File yang Berubah:**
- `src/components/Header.jsx` - Tampilan avatar di notifikasi
- `src/utils/notifications.js` - Fungsi notifikasi dengan creator info
- `add-creator-to-notifications.sql` - SQL untuk alter table
- `update-create-notification-function.sql` - SQL untuk update function
- `SETUP-NOTIFICATION-AVATARS.md` - Dokumentasi ini

**Commit & Push:**
1. Buka GitHub Desktop
2. Review perubahan
3. Commit message: `Tampilkan avatar user di notifikasi modal`
4. Push ke GitHub
5. Tunggu Vercel auto-deploy (2-5 menit)

---

## ✅ Hasil Akhir

### Notifikasi System/Access (Admin Panel Icon)
- Icon: **Logo Aplikasi**
- Background: Surface container (abu-abu terang)
- Use case: Perubahan hak akses, update sistem

### Notifikasi User Actions (User Avatar)

**Jika User Sudah Upload Foto:**
- Icon: **Foto Profil User** yang sebenarnya
- Background: Transparent (no border)
- Contoh: mahersy upload/edit/delete dokumen → tampil foto mahersy

**Jika User Belum Upload Foto:**
- Icon: **Person Icon** default (Material Symbols)
- Background: **Transparent** (TIDAK ADA border abu-abu)
- Contoh: user baru yang belum upload avatar

### Icon Type Indicator (14px, di samping title)
- access → admin_panel_settings (primary)
- edit → edit (tertiary)
- upload → upload_file (secondary)
- approval → task_alt (secondary)
- delete → delete (error)
- security → warning (error)
- system → update (primary)
- share → share (tertiary)

---

## 🔧 Cara Kerja

1. **Saat Upload Dokumen:**
   - `notifyAllUsersExcept()` dipanggil dengan `currentUserId`
   - Fungsi otomatis fetch `avatar_url` dari profiles table
   - Menyimpan `creator_user_id` dan `creator_avatar_url` ke notifications

2. **Saat Tampil di Modal:**
   - Jika `creator_avatar_url` ada → tampilkan foto user dari Supabase Storage
   - Jika tidak ada → tampilkan icon person default (no border)
   - Jika `type === 'system'` atau `'access'` → tampilkan logo app

3. **Error Handling:**
   - Jika avatar gagal load (404, corrupt, dll) → fallback ke icon person
   - Menggunakan `onError` event handler di `<img>` tag

---

## 🧪 Testing

1. **Test dengan User yang Sudah Upload Avatar:**
   - Login sebagai user A (yang punya avatar)
   - Upload dokumen baru
   - Login sebagai user B
   - Buka notifikasi → harus tampil **foto user A**

2. **Test dengan User Baru (No Avatar):**
   - Login sebagai user baru (belum upload avatar)
   - Upload dokumen baru
   - Login sebagai user lain
   - Buka notifikasi → harus tampil **icon person** (no border/background)

3. **Test System Notification:**
   - Admin ubah role user
   - Notifikasi type 'access' → harus tampil **logo app**

---

## 📌 Catatan Penting

- **Backward Compatibility**: Notifikasi lama (sebelum update) tidak punya `creator_avatar_url`, akan tampil icon person default
- **Performance**: Avatar URL di-denormalize (disimpan langsung) untuk menghindari JOIN query
- **Storage**: Avatar diload dari `supabase.storage.from('avatars')`
- **Fallback**: Jika avatar gagal load atau tidak ada, otomatis fallback ke icon person

---

## 🐛 Troubleshooting

### Avatar Tidak Muncul
- ✅ Pastikan SQL sudah dijalankan di Supabase
- ✅ Cek browser console untuk error image load
- ✅ Pastikan file avatar ada di Storage bucket 'avatars'
- ✅ Hard refresh browser (Ctrl+Shift+R)

### Masih Ada Border Abu-abu
- ✅ Hard refresh browser (cache)
- ✅ Cek CSS class `bg-gray-200` sudah dihapus
- ✅ Inspect element untuk memastikan tidak ada background color

### Notifikasi Lama Tidak Punya Avatar
- ✅ Normal behavior - hanya notifikasi baru yang punya avatar
- ✅ Notifikasi lama akan tetap tampil icon person default

---

## 📚 Related Files

- `src/components/Header.jsx` - UI notifikasi modal
- `src/utils/notifications.js` - Helper functions
- `src/App.jsx` - Pemanggilan notifikasi saat delete
- `src/components/AddDocumentModal.jsx` - Notifikasi upload
- `src/components/EditDocumentModal.jsx` - Notifikasi edit

