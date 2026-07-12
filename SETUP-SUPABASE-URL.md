# 🔧 Setup Supabase URL Configuration

## 🔍 Masalah: Reset Password Link Error

Jika link reset password di email mengarah ke `localhost` dan error **ERR_CONNECTION_REFUSED**, artinya Supabase masih menggunakan URL development. Perlu diganti ke URL production.

---

## ✅ Solusi: Update URL di Supabase

### **Step 1: Buka Supabase Dashboard**

1. Buka browser: https://supabase.com/dashboard
2. **Login** dengan akun Supabase Anda
3. Pilih project: **Project Arsip Digital** (atau nama project Anda)

---

### **Step 2: Buka Authentication Settings**

1. Di sidebar sebelah kiri, klik **Authentication** ⚡
2. Klik tab **URL Configuration**

Anda akan melihat form dengan field:
- Site URL
- Redirect URLs

---

### **Step 3: Update Site URL**

**Current (Wrong):**
```
http://localhost:5173
```

**Change to (Correct):**
```
https://rendatinarsip.vercel.app
```

atau sesuai URL Vercel Anda.

> **Note:** Ini adalah URL utama aplikasi Anda yang sudah di-deploy.

---

### **Step 4: Update Redirect URLs**

Di bagian **Redirect URLs**, **tambahkan** (jangan hapus yang lama):

**Production URLs:**
```
https://rendatinarsip.vercel.app/**
https://rendatinarsip.vercel.app/reset-password
https://rendatinarsip.vercel.app/auth/callback
```

**Development URLs (Optional):**
```
http://localhost:5173/**
http://localhost:5173/reset-password
http://localhost:5173/auth/callback
```

**Cara menambahkan:**
1. Klik **Add another URL** untuk setiap URL
2. Paste URL
3. Ulangi untuk semua URL di atas

---

### **Step 5: Save Configuration**

1. Scroll ke bawah
2. Klik tombol **Save** (warna hijau)
3. Tunggu notification "Successfully updated"

---

## 🧪 Testing Reset Password

### **Step 1: Trigger Reset Password**

1. Buka aplikasi: https://rendatinarsip.vercel.app
2. Di halaman login, klik **Lupa Password?** (jika ada)
3. Atau jalankan query SQL untuk trigger reset:

```sql
-- Di Supabase SQL Editor
SELECT auth.send_password_reset('mahersapps28@gmail.com');
```

---

### **Step 2: Cek Email**

1. Buka email: **mahersapps28@gmail.com**
2. Cari email dari Supabase (cek Inbox atau Spam)
3. Subject biasanya: **"Reset Your Password"**

---

### **Step 3: Klik Link di Email**

Link seharusnya berbentuk:
```
https://rendatinarsip.vercel.app/reset-password#access_token=...
```

**Jika masih `localhost`:**
- Pastikan Site URL sudah di-save
- Tunggu ~1 menit untuk propagation
- Trigger reset password lagi

**Jika sudah `https://rendatinarsip.vercel.app`:**
- ✅ Link akan membuka aplikasi
- ✅ Halaman reset password muncul
- ✅ Input password baru dan submit

---

## 🔐 Cara Reset Password Manual (Alternative)

Jika email tidak sampai atau masih error, reset manual via SQL:

### **Step 1: Buka SQL Editor**

Supabase Dashboard → **SQL Editor** → **New query**

### **Step 2: Jalankan Query**

```sql
-- Update password untuk user specific
-- GANTI 'new_password_here' dengan password yang diinginkan
UPDATE auth.users
SET 
  encrypted_password = crypt('new_password_here', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'mahersapps28@gmail.com';

-- Verify update
SELECT 
  id,
  email,
  updated_at
FROM auth.users
WHERE email = 'mahersapps28@gmail.com';
```

**Cara pakai:**
1. Ganti `new_password_here` dengan password baru (misal: `Admin123!@#`)
2. Klik **Run** atau **Ctrl+Enter**
3. Password akan langsung berubah
4. Login dengan password baru

---

## 📧 Troubleshooting Email

### **Email Tidak Sampai?**

**1. Cek Spam/Junk Folder**
- Email dari Supabase kadang masuk Spam

**2. Cek SMTP Settings**
- Supabase Dashboard → **Project Settings** → **Auth**
- Pastikan SMTP configured (biasanya default Supabase SMTP)

**3. Test Email Template**

Di **Authentication** → **Email Templates** → **Reset Password**:
- Cek apakah template ada
- Test dengan "Send test email"

**4. Whitelist Email**
- Tambahkan `noreply@supabase.io` ke contact
- Atau whitelist domain `supabase.io`

---

## 🎯 Expected URL Format

### **Wrong (Development):**
```
❌ http://localhost:5173/reset-password#access_token=...
```
Error: ERR_CONNECTION_REFUSED (jika dibuka dari device lain)

### **Correct (Production):**
```
✅ https://rendatinarsip.vercel.app/reset-password#access_token=...
```
Link berfungsi dari device manapun

---

## 🔄 Multiple Environment Setup

Jika Anda develop di local dan production:

**Site URL (Main):**
```
https://rendatinarsip.vercel.app
```

**Redirect URLs (Both):**
```
https://rendatinarsip.vercel.app/**
http://localhost:5173/**
```

Dengan ini:
- ✅ Production reset password → redirect ke Vercel
- ✅ Development reset password → redirect ke localhost (jika test lokal)

---

## 📊 Checklist

Setelah setup, pastikan:

- [ ] Site URL sudah `https://rendatinarsip.vercel.app`
- [ ] Redirect URLs include production URL
- [ ] Configuration sudah di-save
- [ ] Email reset password dikirim ulang
- [ ] Link di email mengarah ke production (bukan localhost)
- [ ] Klik link dan halaman reset password muncul
- [ ] Input password baru berhasil

---

## 💡 Pro Tips

1. **Always set production URL as Site URL**
2. **Add multiple Redirect URLs** for flexibility
3. **Test in incognito** after configuration change
4. **Check email spam folder** jika tidak muncul
5. **Use SQL manual reset** jika urgent

---

## 🚨 Important Notes

### **After Changing Site URL:**
- New emails akan gunakan URL baru
- Old reset links (dari email lama) tetap pakai URL lama
- Trigger reset password lagi untuk dapat link baru

### **Security:**
- Jangan tambahkan URL yang tidak Anda kontrol
- Wildcard (`/**`) hanya untuk domain Anda
- Production dan development bisa coexist

---

## 📞 Need Help?

Jika masih error setelah ikuti semua langkah:

1. **Screenshot** URL Configuration di Supabase
2. **Copy** link reset password dari email
3. **Check** apakah URL sudah benar
4. **Try** reset password manual via SQL

Common issues:
- Site URL belum di-save → Save lagi
- Email delay → Tunggu 5 menit
- Old link → Trigger reset lagi
- SMTP issue → Check Project Settings

---

**Happy Fixing!** 🎉
