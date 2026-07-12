# ⚡ Quick Guide: Set Password User Baru (2 Menit!)

## 🎯 Cara Tercepat: SQL Editor

### Step 1: Buka SQL Editor
```
Supabase Dashboard → SQL Editor → + New query
```

### Step 2: Copy-Paste Script Ini (Password + Email Confirm)
```sql
-- Set password DAN confirm email sekaligus
UPDATE auth.users
SET 
  encrypted_password = crypt('Test123!', gen_salt('bf')),
  email_confirmed_at = NOW()
WHERE email = 'user@example.com';
```

### Step 3: Edit 2 Bagian Ini
- `'Test123!'` → Password yang Anda inginkan
- `'user@example.com'` → Email user yang baru dibuat

### Step 4: Run Query
- Klik button **"Run"**
- Atau tekan **Ctrl + Enter** (Windows) / **Cmd + Enter** (Mac)

### Step 5: Check Result
```
✅ Success
✅ 1 row affected
```

### Step 6: Test Login
```
Email: user@example.com
Password: Test123!
```

✅ **SELESAI!**

---

## 📋 Template untuk Multiple Users

Jika punya banyak user baru:

```sql
-- User 1
UPDATE auth.users
SET 
  encrypted_password = crypt('Pass123!', gen_salt('bf')),
  email_confirmed_at = NOW()
WHERE email = 'user1@example.com';

-- User 2
UPDATE auth.users
SET 
  encrypted_password = crypt('Pass456!', gen_salt('bf')),
  email_confirmed_at = NOW()
WHERE email = 'user2@example.com';

-- User 3
UPDATE auth.users
SET 
  encrypted_password = crypt('Pass789!', gen_salt('bf')),
  email_confirmed_at = NOW()
WHERE email = 'user3@example.com';
```

Run sekaligus, semua user langsung punya password DAN email confirmed!

---

## 🔍 Verify Password & Email Berhasil Diset

```sql
-- Check user ada dan status email confirmation
SELECT 
  email, 
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'user@example.com';
```

Expected result:
```
email: user@example.com
created_at: 2024-01-15 10:30:00
email_confirmed_at: 2024-01-15 10:35:00 ✅ (harus ada value!)
last_sign_in_at: null (akan terisi setelah user login pertama)
```

---

## ⚠️ Troubleshooting

### Error: "Email not confirmed"

**Penyebab:** Field `email_confirmed_at` masih NULL

**Fix:** Run query ini
```sql
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'user@example.com';
```

### Query success tapi user tidak bisa login

**Check status user:**
```sql
SELECT email, status, role 
FROM profiles 
WHERE email = 'user@example.com';
```

Pastikan:
- ✅ `status = 'Aktif'`
- ✅ `role` ada value (admin/editor/viewer)

**Fix jika status Non-aktif:**
```sql
UPDATE profiles
SET status = 'Aktif'
WHERE email = 'user@example.com';
```

### Error: "Invalid login credentials"

**Kemungkinan penyebab:**
1. ❌ Password salah (typo saat input)
2. ❌ Email salah (case-sensitive)
3. ❌ Password belum di-set (query tidak jalan)

**Debug:**
```sql
-- Check apakah password sudah ada (encrypted)
SELECT 
  email, 
  encrypted_password IS NOT NULL as has_password,
  email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users 
WHERE email = 'user@example.com';
```

Expected:
```
has_password: true ✅
email_confirmed: true ✅
```

---

## 💡 Tips Password

**Good passwords:**
- ✅ `Welcome2024!`
- ✅ `Test123!@#`
- ✅ `Admin2024!`
- ✅ `Start123!`

**Bad passwords:**
- ❌ `123456` (terlalu simple)
- ❌ `password` (terlalu common)
- ❌ `admin` (terlalu pendek, min 6 chars)

---

## 📱 Beritahu User

Template email/chat:
```
Halo [Nama],

Akun e-Arsip Anda sudah aktif!

Login di: http://localhost:5173
Email: [email user]
Password: [password sementara]

⚠️ Harap ganti password setelah login pertama.

Terima kasih.
```

---

## 🔧 Permanent Fix: Update Edge Function

Agar user baru otomatis email confirmed (tidak perlu query manual lagi):

**File:** `edge-function-create-user-FIXED.js` sudah diupdate!

**Perubahan:**
```javascript
// BEFORE
email_confirm: false,

// AFTER
email_confirm: true,  // ✅ User langsung confirmed
```

**Cara apply:**
1. Buka Supabase Dashboard → Edge Functions
2. Edit function "create-user"
3. Ubah `email_confirm: false` jadi `email_confirm: true`
4. Deploy function
5. User baru selanjutnya langsung bisa login (no SQL needed!) ✅

---

## ✅ Checklist

- [ ] Buka SQL Editor
- [ ] Copy script (password + email confirm)
- [ ] Edit email & password
- [ ] Run query
- [ ] Check "Success" result
- [ ] Verify email_confirmed_at ada value
- [ ] Test login di aplikasi ✅
- [ ] Beritahu user credentials
- [ ] [Optional] Update edge function untuk permanent fix

**Total waktu: ~2 menit!** ⚡
