# 🔧 Instruksi Perbaikan Fitur Update Profil

## ❌ Error Saat Ini
```
Gagal memperbarui profil: Could not find the 'updated_at' column of 'profiles' in the schema cache
```

## 🎯 Penyebab
Database `profiles` table **belum memiliki** kolom yang diperlukan:
- ❌ `bio` - Bio singkat user
- ❌ `avatar_url` - Path foto profil
- ❌ `updated_at` - Timestamp update profil

## ✅ Solusi: Jalankan SQL untuk Menambah Kolom

### **LANGKAH 1: Buka Supabase SQL Editor**
1. Login ke **Supabase Dashboard**: https://supabase.com/dashboard
2. Pilih project: **Arsip Digital Rendatin** (Project ref: `axpanhequppcviaimwte`)
3. Di sidebar kiri, klik **SQL Editor**
4. Klik **"New query"** untuk membuat query baru

### **LANGKAH 2: Copy SQL dari File**
1. Buka file: **`add-bio-column-to-profiles.sql`** (ada di root folder project)
2. **Copy seluruh isi file** (Ctrl+A → Ctrl+C)

### **LANGKAH 3: Paste dan Run SQL**
1. Di Supabase SQL Editor, **paste** SQL yang sudah dicopy (Ctrl+V)
2. Klik tombol **"Run"** (atau tekan F5)
3. **Tunggu** sampai eksekusi selesai (biasanya < 5 detik)

### **LANGKAH 4: Verifikasi Hasil**
Setelah SQL selesai, kamu akan melihat output seperti ini:

```
 column_name  | data_type                   | is_nullable | column_default
--------------+-----------------------------+-------------+----------------
 avatar_url   | text                        | YES         | NULL
 bio          | text                        | YES         | NULL
 updated_at   | timestamp with time zone    | YES         | now()
```

✅ **Jika muncul 3 baris seperti di atas = BERHASIL!**

---

## 📦 Langkah Tambahan: Setup Storage untuk Avatar

Setelah menambah kolom, **lanjutkan setup storage bucket** untuk upload foto profil:

### **OPSI A: Via SQL (Recommended)**
1. Buka file: **`create-avatars-storage-bucket.sql`**
2. Copy seluruh isi file
3. Paste ke Supabase SQL Editor
4. Klik **"Run"**

### **OPSI B: Via Dashboard (Manual)**
1. Di Supabase Dashboard, klik **Storage** di sidebar
2. Klik **"Create bucket"**
3. Isi form:
   - **Name**: `avatars`
   - **Public bucket**: ✅ **ON** (centang)
4. Klik **"Create bucket"**
5. Setelah bucket dibuat, klik **"Policies"** tab
6. Tambahkan policies:

#### **Policy 1: Public Read**
- Name: `Avatars are publicly accessible`
- Allowed operation: `SELECT`
- Target roles: `public`
- USING expression: `bucket_id = 'avatars'`

#### **Policy 2: Authenticated Write**
- Name: `Users can upload their own avatar`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- WITH CHECK expression:
  ```sql
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
  ```

#### **Policy 3: Authenticated Update**
- Name: `Users can update their own avatar`
- Allowed operation: `UPDATE`
- Target roles: `authenticated`
- USING expression: (sama dengan Policy 2)

#### **Policy 4: Authenticated Delete**
- Name: `Users can delete their own avatar`
- Allowed operation: `DELETE`
- Target roles: `authenticated`
- USING expression: (sama dengan Policy 2)

---

## 🧪 Testing Setelah Setup

### **Test 1: Update Nama & Bio**
1. Login ke aplikasi
2. Klik **Pengaturan** (icon gear di header)
3. Tab **Profil** (default)
4. Ubah:
   - **Nama Lengkap**: `Nama Baru`
   - **Bio Singkat**: `Ini bio saya`
5. Klik **"Simpan Perubahan"**
6. **Expected**: Alert **"Profil berhasil diperbarui!"** ✅

### **Test 2: Upload Avatar**
1. Di tab Profil, **klik icon kamera** di foto profil
2. Pilih file gambar (max 2MB, format: JPG/PNG)
3. Preview muncul
4. Klik **"Simpan Perubahan"**
5. **Expected**: Foto profil berubah ✅

### **Test 3: Hapus Avatar**
1. Jika sudah ada foto profil
2. Klik **"Hapus Foto"** di bawah foto
3. Konfirmasi
4. **Expected**: Foto kembali ke icon default ✅

---

## 🐛 Troubleshooting

### **Error: "relation 'profiles' already has column 'bio'"**
**Artinya**: Kolom `bio` sudah ada (sudah pernah run SQL)
**Solusi**: Skip langkah ini, lanjut ke setup storage

### **Error: "permission denied for table profiles"**
**Artinya**: User tidak punya akses ke schema
**Solusi**: 
1. Pastikan login sebagai **Owner** project
2. Atau run SQL dari **service_role** key

### **Avatar Tidak Muncul Setelah Upload**
**Penyebab**: Storage bucket belum dibuat atau policies salah
**Solusi**: 
1. Cek di **Storage** → apakah ada bucket `avatars`?
2. Cek **Policies** → apakah ada 4 policies?
3. Test upload manual di Storage dashboard

### **Error 406 Saat Upload**
**Penyebab**: RLS policies tidak match
**Solusi**: 
1. Pastikan policies menggunakan `auth.uid()`
2. Pastikan user sudah login (authenticated)
3. Cek folder path: harus `{user_id}/avatar.{ext}`

---

## ✅ Checklist Sebelum Test

- [ ] **Run SQL**: `add-bio-column-to-profiles.sql` ✅
- [ ] **Verifikasi**: 3 kolom muncul di output query ✅
- [ ] **Create Bucket**: `avatars` (via SQL atau Dashboard) ✅
- [ ] **Set Policies**: 4 policies untuk avatars ✅
- [ ] **Test Update**: Nama & Bio berhasil ✅
- [ ] **Test Upload**: Avatar berhasil ✅
- [ ] **Test Delete**: Hapus avatar berhasil ✅

---

## 📞 Jika Masih Error

**Setelah run SQL, test update profil lagi.**

Jika masih error:
1. **Screenshot error message** di console browser (F12)
2. **Screenshot output SQL** dari Supabase SQL Editor
3. **Cek Supabase logs** (di Dashboard → Logs → Postgres Logs)

---

## 🎉 Setelah Berhasil

Setelah semua setup selesai:
1. ✅ Update nama lengkap → Berfungsi
2. ✅ Update bio → Berfungsi
3. ✅ Upload avatar → Berfungsi
4. ✅ Hapus avatar → Berfungsi
5. ✅ Email disabled (tidak bisa edit) → Sesuai requirement

**Status: SIAP DIGUNAKAN!** 🚀

---

## 📝 Files Terkait

- `add-bio-column-to-profiles.sql` - **RUN INI DULU** ⚠️
- `create-avatars-storage-bucket.sql` - Setup storage bucket
- `src/pages/PengaturanSistemPage.jsx` - UI update profil
- `FITUR-UPDATE-PROFIL.md` - Dokumentasi lengkap fitur
- `SETUP-AVATAR-UPLOAD.md` - Dokumentasi avatar upload

