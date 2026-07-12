# 🔑 Set Password Manual via Supabase Dashboard

## 🎯 Kapan Pakai Cara Ini?

Gunakan cara ini jika:
- ❌ Kena rate limit saat kirim email
- ⚡ Butuh password cepat (tidak perlu tunggu email)
- 🔒 Untuk testing/development
- 🚀 Onboarding user banyak sekaligus

---

## ✅ Langkah-Langkah (5 Menit)

### 1. Buka Supabase Dashboard

```
https://supabase.com/dashboard
```

- Login dengan akun Supabase Anda
- Pilih project aplikasi

### 2. Masuk ke Users Management

- Klik menu **"Authentication"** di sidebar kiri
- Klik submenu **"Users"**
- Anda akan melihat list semua users

### 3. Cari User yang Baru Dibuat

- Gunakan **search box** di atas tabel
- Ketik email user (contoh: `john@example.com`)
- Atau scroll untuk cari manual

### 4. Buka Detail User

**Klik pada row user** (bukan titik tiga, tapi klik nama/email user)

Detail user akan muncul di panel kanan atau halaman baru.

### 5. Set Password

**🎯 METODE RECOMMENDED: Via SQL Editor** (Paling Mudah!)

1. **Klik menu:** `SQL Editor` di sidebar kiri
2. **Klik:** `New query` atau `+ New query`
3. **Copy-paste script ini:**
   ```sql
   -- Ganti EMAIL dan PASSWORD
   UPDATE auth.users
   SET encrypted_password = crypt('Test123!', gen_salt('bf'))
   WHERE email = 'USER_EMAIL@example.com';
   ```
4. **Edit:**
   - `'Test123!'` → password yang diinginkan
   - `'USER_EMAIL@example.com'` → email user baru
5. **Klik:** `Run` atau `Ctrl + Enter`
6. **Check result:** "Success" atau "1 row affected" ✅

**Alternative: Via User Detail** (Jika UI mendukung)

**Option A: Ada Button "Set Password"**
- Klik user → Scroll ke section "User Management"
- Klik button "Set Password" atau "Reset Password"
- Input password baru (contoh: `Test123!`)
- Klik "Save" atau "Update"

**Option B: Edit User Metadata**
- Klik button "Edit User" atau icon pencil
- Cari field "Password"
- Input password baru
- Klik "Save Changes"

**Option C: Via Menu Titik Tiga (⋮)**
- Klik titik tiga di row user
- Pilih "Edit" atau "Update"
- Set password jika ada field-nya

### 6. Beritahu User

Setelah password diset, beritahu user:

**Via Email/Chat:**
```
Halo [Nama User],

Akun Anda sudah dibuat di sistem e-Arsip.

Login credentials:
- Email: [email user]
- Password sementara: Test123!

Link aplikasi: http://localhost:5173

⚠️ Setelah login pertama, silakan ganti password Anda 
   di menu Profile atau Settings.

Terima kasih.
```

### 7. User Login

User bisa langsung login dengan:
- **Email:** yang tadi diinput
- **Password:** yang baru Anda set

✅ **Selesai!**

---

## 🎬 Visual Guide

### Tampilan Dashboard Users:

```
┌─────────────────────────────────────────────────────────┐
│ Supabase Dashboard > Authentication > Users             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Search: [john@example.com        ] 🔍                 │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Email              │ Created    │ Last Sign In    │ │
│  ├───────────────────────────────────────────────────┤ │
│  │ john@example.com   │ 2 min ago  │ Never          │ │ ← Klik row ini
│  │ admin@example.com  │ 1 day ago  │ 5 min ago      │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Tampilan Detail User:

```
┌─────────────────────────────────────────────────────────┐
│ User Details: john@example.com                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Email: john@example.com                                │
│  ID: abc123-def456-...                                  │
│  Created: 2024-01-15                                    │
│  Email Confirmed: ❌ No                                  │
│                                                         │
│  ┌─── User Management ────────────────────────────────┐│
│  │                                                     ││
│  │  [Set Password]  [Send Recovery Email]  [Delete]  ││
│  │                   ↑                                 ││
│  │                   Klik ini!                        ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## 💡 Best Practices

### Password Sementara yang Baik:

✅ **DO:**
- Minimal 8 karakter
- Mix huruf besar & kecil
- Tambah angka
- Tambah simbol (@, !, #, dll)
- Contoh: `Welcome2024!`

❌ **DON'T:**
- Password terlalu simple: `123456`, `password`
- Password yang sama untuk semua user
- Password yang sulit diingat user

### Komunikasi dengan User:

1. **Kirim via channel aman** (email official, chat internal)
2. **Jangan kirim via public channel** (group chat, social media)
3. **Minta user ganti password** setelah login pertama
4. **Log aktivitas** untuk audit trail

### Security Tips:

- ✅ Set password sementara yang BERBEDA untuk tiap user
- ✅ Password expire setelah X hari (atur di Supabase settings)
- ✅ Force user ganti password di login pertama
- ✅ Log semua password reset activity
- ❌ Jangan share password via WhatsApp/Telegram
- ❌ Jangan simpan password di plain text

---

## 🔄 Flow Lengkap: Admin + User

### Admin Side:

```
1. Create user di aplikasi
   ↓
2. User masuk tabel (no password)
   ↓
3. [RATE LIMIT] Coba kirim email → gagal
   ↓
4. Buka Supabase Dashboard
   ↓
5. Auth → Users → Cari user
   ↓
6. Set Password → Input: "Welcome2024!"
   ↓
7. Beritahu user via email/chat
   ✅ Done!
```

### User Side:

```
1. Terima email/chat dari admin
   ↓
2. Buka link aplikasi
   ↓
3. Login:
   - Email: john@example.com
   - Password: Welcome2024!
   ↓
4. [Optional] Ganti password di Profile
   ↓
5. Mulai pakai aplikasi
   ✅ Done!
```

---

## ⚙️ Alternative: Bulk User Creation

Jika harus buat banyak user sekaligus:

### Option 1: SQL Script

```sql
-- Set password untuk multiple users sekaligus
-- Run di Supabase SQL Editor

-- User 1
UPDATE auth.users
SET encrypted_password = crypt('Password123!', gen_salt('bf'))
WHERE email = 'user1@example.com';

-- User 2
UPDATE auth.users
SET encrypted_password = crypt('Password456!', gen_salt('bf'))
WHERE email = 'user2@example.com';

-- User 3
UPDATE auth.users
SET encrypted_password = crypt('Password789!', gen_salt('bf'))
WHERE email = 'user3@example.com';
```

### Option 2: CSV Import + Script

1. Buat CSV dengan kolom: email, password
2. Import users via Supabase Dashboard
3. Run script untuk set password semua user

---

## 🧪 Testing

### Test Case: Set Password Manual

**Steps:**
1. Create user baru: `testuser@example.com`
2. User kena rate limit (tidak bisa kirim email)
3. Buka Supabase Dashboard
4. Auth → Users → Cari `testuser@example.com`
5. Klik user → Set Password → `TestPass123!`
6. Save
7. Buka aplikasi → Login:
   - Email: `testuser@example.com`
   - Password: `TestPass123!`
8. Verifikasi login berhasil ✅
9. Check dashboard muncul ✅
10. Test navigasi ke halaman lain ✅

---

## 🆘 Troubleshooting

### Problem: Button "Set Password" tidak ada

**Solution:**
- Update Supabase ke versi terbaru
- Gunakan Option B (Edit User)
- Gunakan SQL script (Option C)

### Problem: Password tidak bisa disimpan

**Error:** "Password must be at least 6 characters"

**Solution:**
- Gunakan password minimal 6 karakter
- Supabase default: min 6 chars

### Problem: User tidak bisa login setelah set password

**Check:**
- ✅ Password benar?
- ✅ Email correct case? (case-sensitive)
- ✅ User status = Aktif?
- ✅ Email confirmed? (untuk beberapa config)

**Solution:**
- Check di Dashboard: Auth → Users → user detail
- Verify Email Confirmed = Yes
- Check status di table profiles

---

## 📊 Comparison: Email vs Manual Set

| Aspek | Via Email Link | Manual Set Dashboard |
|-------|---------------|---------------------|
| **Kecepatan** | ⏰ Butuh user check email | ⚡ Instant |
| **Security** | ✅ User set sendiri | ⚠️ Admin tahu password |
| **Rate Limit** | ❌ Terkena limit | ✅ No limit |
| **UX** | ✅ Professional | ❌ Perlu komunikasi |
| **Audit Trail** | ✅ Auto logged | ⚠️ Manual log |
| **Best For** | Production | Testing/Development |

---

## ✅ Kesimpulan

**Cara Set Password Manual:**
1. Dashboard → Auth → Users
2. Cari user → Klik user
3. Set Password → Input password
4. Save → Beritahu user ✅

**Gunakan cara ini:**
- ⚡ Saat kena rate limit email
- 🚀 Untuk onboarding cepat
- 🔧 Testing/development
- 📦 Bulk user creation

**Kembali ke email link:**
- ⏰ Setelah tunggu 60 menit
- 🌐 Production environment
- 🔒 Security best practice

