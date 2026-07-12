# 📧 Cara Set Password untuk User Baru

## ✅ Penjelasan: Kenapa Link Tidak Dikirim?

Saat admin membuat user baru, **user dibuat TANPA password dan TANPA email verifikasi**.

### Desain Aplikasi:

```
Admin Buat User Baru
       ↓
User Dibuat (email_confirm: false)
       ↓
❌ TIDAK ada email yang dikirim otomatis
       ↓
✅ User masuk ke tabel
       ↓
⚠️ User BELUM BISA LOGIN (belum punya password)
       ↓
Admin kirim link set password
       ↓
User terima email → set password → bisa login ✅
```

---

## 🎯 Cara Kirim Link Set Password

### **Metode 1: Via Aplikasi (BARU!)** ✨

Saya sudah menambahkan fitur untuk kirim link password dari aplikasi:

#### Langkah-langkah:

1. **Login sebagai admin**
2. **Buka Halaman Hak Akses**
3. **Lihat tabel "Daftar Pengguna Aktif"**
4. **Di kolom "Aksi"**, ada 3 tombol:
   - 📧 **Mail icon** (BARU!) → Kirim link set password
   - ✏️ **Edit icon** → Edit user
   - 🗑️ **Delete icon** → Hapus user
5. **Klik icon 📧 (mail)** pada user yang baru dibuat
6. **Email terkirim** ke alamat user
7. **User check inbox** → klik link di email
8. **User set password** di halaman reset password
9. **User login** dengan email + password baru ✅

#### Fitur Button:

- ✅ **Icon envelope/mail** untuk kirim link
- ✅ **Loading spinner** saat proses kirim
- ✅ **Tooltip** "Kirim Link Set Password"
- ✅ **Alert sukses** jika berhasil
- ✅ **Alert error** jika gagal (rate limit, dll)

---

### **Metode 2: Manual dari Supabase Dashboard**

Jika kena rate limit atau prefer manual:

#### Langkah-langkah:

1. **Buka Supabase Dashboard:**
   ```
   https://supabase.com/dashboard
   ```

2. **Login** dan **pilih project**

3. **Klik menu:** `Authentication` → `Users`

4. **Cari user baru** yang baru dibuat
   - Search by email di search box

5. **Klik titik tiga (⋮)** di sebelah kanan user

6. **Pilih:** `"Send password recovery"`
   - Atau klik user → klik `"Reset password"`

7. **Email terkirim!** User check inbox

8. **User klik link** di email

9. **User set password** di form reset password

10. **User login** dengan password baru ✅

---

## 🔄 Complete Flow

### Admin Side:

```
1. Admin login
2. Buka Halaman Hak Akses
3. Klik "Tambah Pengguna Baru"
4. Isi form:
   - Nama: John Doe
   - Email: john@example.com
   - Peran: Editor
   - Status: Aktif
5. Klik "Simpan Pengguna"
6. User muncul di tabel ✅
7. Klik icon 📧 (mail) pada user John Doe
8. Alert: "Link set password berhasil dikirim"
```

### User Side:

```
1. User check email inbox
2. Terima email dari Supabase
3. Subject: "Reset Your Password"
4. Klik link di email
5. Browser buka: http://localhost:5173/reset-password?access_token=...
6. Form "Set Password Baru" muncul
7. Input password baru (min 6 karakter)
8. Klik "Perbarui Kata Sandi"
9. Redirect ke login page
10. Login dengan email + password baru ✅
```

---

## ⚠️ Catatan Rate Limit

### Rate Limit Password Reset:

- **Limit:** ~3-4 request per jam per IP
- **Scope:** IP address + project

### Jika Kena Rate Limit:

**Error message:** "Terlalu banyak permintaan. Silakan tunggu beberapa menit..."

**Solusi:**
1. ✅ **Tunggu 1 jam** → rate limit reset
2. ✅ **Gunakan Metode 2** (manual dari Dashboard)
3. ✅ **Ganti IP** (hotspot/VPN) jika urgent

---

## 📊 Comparison: Metode 1 vs 2

| Aspek | Metode 1 (Via App) | Metode 2 (Dashboard) |
|-------|-------------------|---------------------|
| **Kemudahan** | ⭐⭐⭐⭐⭐ Sangat mudah | ⭐⭐⭐ Perlu akses dashboard |
| **Kecepatan** | ⚡ 2 klik | ⚡ 5-6 klik |
| **Rate Limit** | ❌ Terkena rate limit IP | ❌ Terkena rate limit IP |
| **Akses** | ✅ Admin app | ✅ Admin Supabase |
| **Tracking** | ✅ Di app | ❌ Di dashboard |

---

## 🎨 UI Changes (Yang Sudah Ditambahkan)

### 1. Button "Kirim Link Password" di Tabel

**Lokasi:** Kolom "Aksi" di tabel Daftar Pengguna Aktif

**Icon:** 📧 mail (Material Symbols)

**Behavior:**
- Default: Gray outline icon
- Hover: Tertiary color
- Loading: Spinning icon
- Disabled: Saat sending

### 2. Update Info Box di Modal "Tambah Pengguna"

**Before:**
> "Tautan verifikasi dan pengaturan kata sandi akan dikirim ke email pengguna..."

**After:**
> "User akan dibuat tanpa password. Setelah menyimpan, gunakan tombol 📧 Kirim Link di tabel untuk mengirim link set password ke email user."

---

## 🧪 Testing

### Test Case 1: Kirim Link dari App

**Steps:**
1. Login sebagai admin
2. Buat user baru: `test@example.com`
3. User muncul di tabel ✅
4. Klik icon 📧 pada user
5. Check loading spinner muncul
6. Alert sukses: "Link set password berhasil dikirim..."
7. Check inbox `test@example.com`
8. Klik link di email
9. Set password baru
10. Login dengan password baru ✅

### Test Case 2: Rate Limit Handling

**Steps:**
1. Kirim link 3x untuk user berbeda
2. Klik icon 📧 ke-4
3. Alert error: "Terlalu banyak permintaan..."
4. Button tetap functional (tidak crash)
5. Tunggu 1 jam atau gunakan Dashboard ✅

### Test Case 3: Manual dari Dashboard

**Steps:**
1. Buka Supabase Dashboard
2. Auth → Users
3. Cari user `test@example.com`
4. Send password recovery
5. Check email → klik link
6. Set password ✅

---

## 💡 Tips Production

### Untuk Admin:

1. **Inform user** setelah buat akun:
   > "Akun Anda sudah dibuat. Silakan check email untuk set password."

2. **Check inbox spam** jika email tidak masuk

3. **Gunakan Dashboard** jika kena rate limit

4. **Batch process** jika buat banyak user:
   - Buat semua user dulu
   - Tunggu 1 jam
   - Kirim link password semua

### Untuk Developer:

1. **Monitor rate limit** di production logs

2. **Consider increase limit** di Supabase settings

3. **Add queue system** untuk kirim email batch

4. **Add notification** ke admin dashboard untuk tracking

---

## 🔧 Troubleshooting

### Problem: Email tidak masuk

**Check:**
- ✅ Folder Spam/Junk
- ✅ Email address valid?
- ✅ SMTP configured di Supabase?
- ✅ Check Supabase logs

**Solution:**
- Kirim ulang dari Dashboard
- Verify email di Supabase Users table

### Problem: Link expired

**Error:** "Tautan tidak valid atau sudah kadaluarsa"

**Penyebab:** Token expired (default 1 jam)

**Solution:**
- Kirim link baru
- User harus klik link dalam 1 jam

### Problem: Rate limit

**Error:** "Terlalu banyak permintaan..."

**Solution:**
- Tunggu 60 menit
- Gunakan Dashboard (Metode 2)
- Ganti IP (hotspot/VPN)

---

## 📝 Summary

**Kenapa link tidak dikirim otomatis?**
- ✅ Desain: `email_confirm: false`
- ✅ User dibuat tanpa password
- ✅ Admin kirim link manual (via app atau dashboard)

**Cara kirim link?**
- ✅ **Metode 1:** Klik icon 📧 di tabel (BARU!)
- ✅ **Metode 2:** Manual dari Supabase Dashboard

**User bisa login?**
- ❌ Belum (sebelum set password)
- ✅ Bisa (setelah set password via link)

