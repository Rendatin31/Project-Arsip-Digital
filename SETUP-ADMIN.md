# 🔐 Panduan Membuat Akun Super Admin

## Informasi Akun
- **Email:** mahersapps28@gmail.com
- **Nama:** Mahersy Bobode
- **Role:** Admin (Super Admin)
- **Status:** Aktif

---

## 📋 Langkah-langkah Setup

### **Step 1: Buka Supabase Dashboard**

1. Buka browser dan pergi ke: https://supabase.com/dashboard
2. Login dengan akun Supabase Anda
3. Pilih project: **Project Arsip Digital**

---

### **Step 2: Buat User di Authentication**

1. Di sidebar, klik **Authentication** ⚡
2. Klik tab **Users**
3. Klik tombol **Add user** (pojok kanan atas)
4. Pilih **Create new user**
5. Isi form:
   ```
   Email Address: mahersapps28@gmail.com
   Password: [Buat password yang kuat, contoh: Admin123!@#]
   ```
6. ✅ **PENTING:** Centang **"Auto Confirm User"** (agar tidak perlu verifikasi email)
7. Klik **Create user**

---

### **Step 3: Copy User ID**

Setelah user dibuat, Anda akan melihat user baru di list.

1. Klik pada user **mahersapps28@gmail.com**
2. Copy **User UID** (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
   
   Contoh:
   ```
   f47ac10b-58cc-4372-a567-0e02b2c3d479
   ```

---

### **Step 4: Jalankan SQL Query**

1. Di sidebar Supabase, klik **SQL Editor** 📝
2. Klik **New query**
3. Copy paste query berikut, **GANTI `YOUR_USER_ID_HERE`** dengan User ID yang Anda copy tadi:

```sql
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
  'YOUR_USER_ID_HERE', -- GANTI DENGAN USER ID!
  'mahersapps28@gmail.com',
  'Mahersy Bobode',
  'admin',
  'Aktif',
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
```

4. Klik **Run** atau tekan **Ctrl+Enter**

---

### **Step 5: Verifikasi Profile**

Jalankan query ini untuk memastikan profile berhasil dibuat:

```sql
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  created_at
FROM profiles
WHERE email = 'mahersapps28@gmail.com';
```

Hasil yang diharapkan:
```
id: [User ID Anda]
email: mahersapps28@gmail.com
full_name: Mahersy Bobode
role: admin
status: Aktif
created_at: [Timestamp sekarang]
```

---

## ✅ Selesai! Login ke Aplikasi

Sekarang Anda bisa login ke aplikasi:

1. Buka aplikasi: http://localhost:5173 (atau URL Vercel)
2. Login dengan:
   - **Email:** `mahersapps28@gmail.com`
   - **Password:** [Password yang Anda buat di Step 2]
3. Anda akan masuk sebagai **Super Admin** dengan akses penuh! 🎉

---

## 🔍 Troubleshooting

### **Masalah: "Email not confirmed"**
- Pastikan Anda sudah centang **"Auto Confirm User"** saat membuat user
- Atau buka Authentication → Users → klik user → klik **Confirm email**

### **Masalah: "Invalid login credentials"**
- Pastikan email dan password yang dimasukkan benar
- Reset password di Supabase Dashboard jika lupa

### **Masalah: "User status is Non-aktif"**
- Jalankan query ini untuk mengaktifkan:
  ```sql
  UPDATE profiles 
  SET status = 'Aktif' 
  WHERE email = 'mahersapps28@gmail.com';
  ```

### **Masalah: Profile tidak ditemukan**
- Pastikan User ID di query SQL sudah benar
- Jalankan ulang query di Step 4

---

## 🎯 Akses Super Admin

Sebagai **Super Admin**, Anda memiliki akses ke:

✅ **Dashboard** - Lihat statistik dan overview
✅ **File Saya** - Manage dokumen Anda
✅ **Direktori Arsip** - Manage folder dan struktur arsip
✅ **Pencarian Pintar** - Search dokumen dengan filter advanced
✅ **Hak Akses** - Manage user dan permissions (Admin only!)
✅ **Riwayat Aktivitas** - Audit log semua aktivitas (Admin only!)
✅ **Pengaturan Sistem** - System settings

---

## 📞 Butuh Bantuan?

Jika ada masalah, cek:
1. User sudah dibuat di Authentication ✅
2. User ID sudah benar di query SQL ✅
3. Profile status = 'Aktif' ✅
4. Email sudah ter-confirm ✅

Happy managing! 📚🎉
