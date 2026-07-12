# 🚀 Panduan Cepat - 3 Langkah Saja!

## Yang Perlu Dilakukan

Frontend sudah siap ✅ Tinggal 3 langkah di Supabase Dashboard:

---

## 📍 LANGKAH 1: Jalankan SQL #1 (Tambah Kolom)

1. Buka: https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri
4. Copy-paste kode ini:

```sql
-- Add created_by column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_created_by ON profiles(created_by);

-- Add comment
COMMENT ON COLUMN profiles.created_by IS 'ID of the admin user who created this profile';
```

5. Klik **RUN** ✅

---

## 📍 LANGKAH 2: Jalankan SQL #2 (Update Trigger)

1. Masih di **SQL Editor**
2. Copy-paste kode ini:

```sql
-- Update trigger handle_new_user untuk menyimpan created_by
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status, created_by)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer'),
    COALESCE(NEW.raw_user_meta_data->>'status', 'Aktif'),
    (NEW.raw_user_meta_data->>'created_by')::UUID
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pastikan trigger terpasang
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

3. Klik **RUN** ✅

---

## 📍 LANGKAH 3: Update Edge Function

1. Di Supabase Dashboard, klik **Edge Functions**
2. Cari dan klik function **"create-user"**
3. Klik tombol **Edit** atau **pencil icon**
4. Cari baris ini (sekitar baris 27-32):

```typescript
user_metadata: { full_name, role, status },
```

5. **UBAH** menjadi:

```typescript
user_metadata: { 
  full_name, 
  role, 
  status,
  created_by  // ← TAMBAHKAN BARIS INI + KOMA DI ATAS
},
```

6. Klik **Deploy** ✅
7. Tunggu sampai status jadi "Deployed"

---

## ✅ Selesai! Testing

1. Login ke aplikasi sebagai admin
2. Buka **Halaman Hak Akses**
3. Klik **"Tambah Pengguna Baru"**
4. Isi form dan simpan
5. User baru akan muncul di tabel
6. Coba login dengan admin lain → user tersebut TIDAK akan muncul ✅

---

## ❓ Troubleshooting

**Masalah:** created_by masih NULL setelah buat user baru
- **Solusi:** Ulangi Langkah 2 dan 3

**Masalah:** Tabel masih menampilkan semua user
- **Solusi:** Hard refresh browser (Ctrl + Shift + R)

**Masalah:** User lama tidak muncul
- **Solusi:** User lama punya created_by = NULL. Assign manual:
  ```sql
  -- Ganti <admin_id> dengan ID admin Anda
  UPDATE profiles 
  SET created_by = '<admin_id>'
  WHERE created_by IS NULL;
  ```

---

## 📂 File Referensi Lengkap

Jika butuh detail lebih:
- `LANGKAH_IMPLEMENTASI.md` - Panduan detail
- `EDGE_FUNCTION_UPDATE.md` - Panduan Edge Function
- `edge-function-create-user-FIXED.js` - Kode lengkap Edge Function
