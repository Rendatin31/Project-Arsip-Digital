# Fitur Reset Password

## Ringkasan
Implementasi lengkap fitur "Lupa Kata Sandi?" untuk memungkinkan user mereset password mereka sendiri melalui email.

## ✅ Komponen yang Sudah Dibuat

### 1. ForgotPasswordModal (`src/components/ForgotPasswordModal.jsx`)
**Fungsi:** Modal untuk input email dan kirim link reset password

**Features:**
- Form input email
- Validasi email required
- Loading state saat kirim email
- Success message setelah email terkirim
- Error handling jika gagal
- UI yang konsisten dengan design system

**Flow:**
```
1. User klik "Lupa Kata Sandi?" di halaman login
2. Modal muncul
3. User input email
4. Klik "Kirim Link Reset"
5. Sistem kirim email via Supabase
6. Success message: "Email terkirim ke [email]"
```

### 2. LoginPage Update (`src/components/LoginPage.jsx`)
**Perubahan:**
- Import ForgotPasswordModal
- State `showForgotPasswordModal`
- Button "Lupa Kata Sandi?" buka modal (bukan link)
- Render modal saat `showForgotPasswordModal = true`

### 3. ResetPasswordPage (`src/pages/ResetPasswordPage.jsx`)
**Fungsi:** Halaman untuk user input password baru

**Features:**
- ✅ Validasi link reset (access_token dari email)
- ✅ Form input password baru + konfirmasi
- ✅ Password validation:
  - Minimal 8 karakter
  - Harus ada huruf
  - Harus ada angka
  - Harus ada simbol
- ✅ Show/hide password toggle
- ✅ Error handling untuk link kadaluarsa
- ✅ Success message + redirect ke login
- ✅ Auto signOut setelah reset

## 📋 User Flow Lengkap

### Step 1: Request Reset Password

```
User di LoginPage
    ↓
Klik "Lupa Kata Sandi?"
    ↓
Modal muncul
    ↓
Input email: user@example.com
    ↓
Klik "Kirim Link Reset"
    ↓
Supabase.auth.resetPasswordForEmail()
    ↓
✅ Email terkirim
    ↓
Success message di modal
```

### Step 2: Email Diterima

```
User cek inbox email
    ↓
Buka email dari Supabase
    ↓
Subject: "Reset Your Password"
    ↓
Klik link di email:
https://your-app.com/reset-password#access_token=xxx&refresh_token=yyy
```

### Step 3: Reset Password

```
Browser buka link
    ↓
App detect hash dengan access_token
    ↓
ResetPasswordPage: Set session dengan token
    ↓
Form reset password muncul
    ↓
User input:
- Password baru: *********
- Konfirmasi: *********
    ↓
Klik "Simpan Kata Sandi"
    ↓
Supabase.auth.updateUser({ password })
    ↓
✅ Password berhasil diupdate
    ↓
Auto signOut
    ↓
Redirect ke login page
    ↓
User login dengan password baru ✅
```

## 🔒 Security Features

### 1. Token-based Reset
- Link reset hanya valid dengan access_token dari email
- Token kadaluarsa setelah 1 jam
- Token hanya bisa digunakan 1 kali

### 2. Password Validation
```javascript
Minimal 8 karakter ✅
Mengandung huruf (a-zA-Z) ✅
Mengandung angka (0-9) ✅
Mengandung simbol (!@#$%^&* dll) ✅
```

### 3. Session Management
- Set session dari token di URL
- Update password
- SignOut otomatis setelah reset
- User harus login ulang dengan password baru

## 🎨 UI Components

### ForgotPasswordModal UI
```
┌─────────────────────────────┐
│ ✖  Lupa Kata Sandi         │
├─────────────────────────────┤
│ Masukkan alamat email Anda │
│                             │
│ 📧 [email input field]      │
│                             │
│ [Batal]  [Kirim Link Reset] │
└─────────────────────────────┘
```

**Success State:**
```
┌─────────────────────────────┐
│ ✖  Email Terkirim          │
├─────────────────────────────┤
│        📧                   │
│ Link reset password telah   │
│ dikirim ke:                 │
│ user@example.com            │
│                             │
│ Silakan cek inbox...        │
│                             │
│        [Tutup]              │
└─────────────────────────────┘
```

### ResetPasswordPage UI
```
┌─────────────────────────────┐
│    🔒 Setel Kata Sandi      │
│  Buat kata sandi baru...    │
├─────────────────────────────┤
│                             │
│ KATA SANDI BARU             │
│ 🔒 [password] 👁            │
│                             │
│ KONFIRMASI KATA SANDI       │
│ 🔒 [password] 👁            │
│                             │
│   [Simpan Kata Sandi]       │
│                             │
│ Ingat kata sandi? Masuk     │
└─────────────────────────────┘
```

## 🧪 Testing Guide

### Test Case 1: Request Reset Password
**Steps:**
1. Buka halaman login
2. Klik "Lupa Kata Sandi?"
3. Input email yang terdaftar
4. Klik "Kirim Link Reset"

**Expected:**
- ✅ Modal tampil
- ✅ Loading state saat kirim
- ✅ Success message muncul
- ✅ Email diterima di inbox

### Test Case 2: Invalid Email
**Steps:**
1. Buka modal reset password
2. Input email yang tidak terdaftar
3. Klik "Kirim Link Reset"

**Expected:**
- ✅ Email tetap terkirim (security: jangan expose apakah email exist)
- ✅ Success message muncul
- ⚠️ Tapi user tidak terima email

### Test Case 3: Reset Password Success
**Steps:**
1. Buka link dari email
2. Input password baru: `Test@123456`
3. Input konfirmasi: `Test@123456`
4. Klik "Simpan Kata Sandi"

**Expected:**
- ✅ Loading state
- ✅ Success message
- ✅ Auto redirect ke login
- ✅ Bisa login dengan password baru

### Test Case 4: Password Validation
**Steps:**
1. Buka halaman reset password
2. Input password lemah: `12345678`
3. Klik "Simpan"

**Expected:**
- ❌ Error: "Kata sandi harus mengandung huruf"

**Test berbagai password:**
- `12345678` → ❌ Tidak ada huruf
- `abcdefgh` → ❌ Tidak ada angka
- `Abcd1234` → ❌ Tidak ada simbol
- `Abc@1234` → ✅ Valid!

### Test Case 5: Password Mismatch
**Steps:**
1. Password baru: `Test@123456`
2. Konfirmasi: `Test@654321`
3. Klik "Simpan"

**Expected:**
- ❌ Error: "Kata sandi dan konfirmasi tidak cocok"

### Test Case 6: Link Kadaluarsa
**Steps:**
1. Tunggu link kadaluarsa (>1 jam)
2. Atau gunakan link yang sudah dipakai
3. Buka link

**Expected:**
- ❌ Error: "Tautan reset tidak valid atau sudah kadaluarsa"
- ✅ Button "Kembali ke Login"

## 📧 Email Template (Supabase)

Email reset password dikirim otomatis oleh Supabase dengan format:

**Subject:** Reset Your Password

**Content:**
```
Hi there,

Follow this link to reset your password:
[Reset Password Button]

If you didn't request this, you can safely ignore this email.

This link expires in 1 hour.
```

**Customize Email Template:**
1. Buka Supabase Dashboard
2. Go to **Authentication** → **Email Templates**
3. Edit template "Reset Password"
4. Customize subject, body, button text

## ⚙️ Configuration

### Redirect URL
Di ForgotPasswordModal.jsx:
```javascript
redirectTo: `${window.location.origin}/reset-password`
```

Pastikan URL ini match dengan routing di App.jsx.

### Token Expiry
Default: 1 jam (set by Supabase)

Untuk mengubah:
1. Supabase Dashboard → Authentication → Settings
2. JWT Expiry: 3600 (seconds)

## 🔧 Troubleshooting

### Email Tidak Terkirim
**Penyebab:**
- SMTP belum dikonfigurasi di Supabase
- Email provider block

**Solusi:**
1. Cek Supabase Dashboard → Settings → Auth
2. Pastikan email provider configured
3. Test kirim email di Dashboard

### Link Tidak Valid
**Penyebab:**
- Token sudah kadaluarsa
- Token sudah digunakan
- Session tidak di-set dengan benar

**Solusi:**
- Request link reset baru
- Pastikan ResetPasswordPage set session dengan benar

### Password Tidak Tersimpan
**Penyebab:**
- Validasi password gagal
- Session tidak valid

**Solusi:**
- Check console log untuk error
- Pastikan password memenuhi requirements
- Pastikan session valid (token dari email)

## 📝 Files Created/Modified

1. ✅ `src/components/ForgotPasswordModal.jsx` - NEW
2. ✅ `src/components/LoginPage.jsx` - MODIFIED
3. ✅ `src/pages/ResetPasswordPage.jsx` - ALREADY EXISTS (no changes)
4. ✅ `FITUR_RESET_PASSWORD.md` - NEW (dokumentasi)

## 🚀 Deployment Checklist

- [x] ForgotPasswordModal created
- [x] LoginPage updated
- [x] ResetPasswordPage verified
- [ ] Test email delivery
- [ ] Customize email template (optional)
- [ ] Test complete flow
- [ ] Ready for production

## 💡 Future Enhancements

1. **Rate Limiting:** Batasi request reset password per email (max 3x/jam)
2. **Email Verification:** Require email verification before allow reset
3. **Security Questions:** Tambah security questions sebagai alternatif
4. **2FA:** Two-factor authentication untuk reset password
5. **Password History:** Cegah reuse password lama
