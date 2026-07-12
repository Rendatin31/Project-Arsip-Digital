# 🚨 Solusi Rate Limit Reset Password

## ❓ Masalah yang Terjadi

**Kenapa akun B juga kena rate limit padahal baru pertama kali?**

Rate limit Supabase untuk reset password **TIDAK berdasarkan per akun**, tapi berdasarkan:
- ✅ **IP Address** (alamat jaringan internet Anda)
- ✅ **Project** (database Supabase yang sama)

### Ilustrasi:

```
┌─────────────────────────────────────────────┐
│  WiFi Rumah (IP: 123.456.789.0)            │
├─────────────────────────────────────────────┤
│                                             │
│  Browser 1 (Chrome)                         │
│  ├─ Akun A: Request #1 ❌                   │
│  └─ Akun A: Request #2 ❌                   │
│                                             │
│  Browser 2 (Firefox)                        │
│  └─ Akun B: Request #3 ❌ BLOCKED!         │
│                                             │
│  Total: 3 request dari IP SAMA = LIMIT!    │
└─────────────────────────────────────────────┘
```

**Limit:** ~3-4 request per jam per IP address

---

## ✅ Solusi 1: Reset Manual dari Dashboard (TERCEPAT!)

**Waktu: 2 menit**

### Langkah-langkah:

1. **Buka Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **Login** dan **pilih project** Anda

3. **Klik menu:** `Authentication` → `Users`

4. **Cari user** yang mau direset (Akun A atau Akun B)
   - Bisa search by email di search box

5. **Klik titik tiga (⋮)** di sebelah kanan user

6. **Pilih:** `"Send password recovery"`
   - Atau klik user → klik button `"Reset password"`

7. **Email terkirim!** Check inbox email user tersebut

8. **Buka email** → **Klik link** reset password

9. **Browser akan buka:** `http://localhost:5173/reset-password?access_token=...`

10. **Input password baru** (min 6 karakter) → **Submit**

11. **Login** dengan password baru ✅

**Keuntungan:**
- ✅ Bypass rate limit
- ✅ Instant (tidak perlu tunggu 1 jam)
- ✅ Bisa test flow ResetPasswordPage
- ✅ Bisa reset user manapun

---

## ✅ Solusi 2: Tunggu 60 Menit

Rate limit akan reset otomatis setelah **1 jam** dari request pertama.

**Timeline:**
- Request pertama: 10:00 AM
- Rate limit reset: 11:00 AM
- Bisa request lagi: 11:01 AM ✅

**Cara check:**
- Tunggu 60 menit
- Refresh browser
- Test "Lupa Kata Sandi?" lagi

---

## ✅ Solusi 3: Ganti IP Address (untuk Testing)

### Option A: Mobile Hotspot (RECOMMENDED untuk testing)

1. **Matikan WiFi** di laptop
2. **Nyalakan hotspot** di HP
3. **Connect laptop** ke hotspot HP
4. **IP berubah** → rate limit reset!
5. **Buka aplikasi** di browser
6. **Test "Lupa Kata Sandi?"** dengan akun baru

### Option B: VPN

1. **Install VPN gratis:**
   - ProtonVPN
   - Windscribe
   - Cloudflare WARP (1.1.1.1)

2. **Connect VPN** → IP berubah

3. **Test "Lupa Kata Sandi?"** lagi

### Option C: Restart Modem (kadang works)

1. Cabut kabel modem/router
2. Tunggu 30 detik
3. Pasang lagi
4. Check IP berubah: https://whatismyipaddress.com/
5. Jika IP berubah, test lagi

---

## ✅ Solusi 4: Increase Rate Limit (untuk Production)

Jika aplikasi sudah production dan user sering kena rate limit:

### Cara 1: Update Settings di Supabase

1. **Buka:** Supabase Dashboard → **Project Settings** → **API**
2. **Scroll ke:** `Rate Limiting` section
3. **Cari:** `auth.passwordRecovery` atau `auth.*`
4. **Tingkatkan limit** (contoh: dari 3/hour → 10/hour)
5. **Save changes**

### Cara 2: Custom Rate Limit (Enterprise)

Hubungi Supabase Support:
```
https://supabase.com/support
```

Request custom rate limit sesuai kebutuhan aplikasi.

---

## 🧪 Testing Complete Flow

### Test A: Manual Reset (Bypass Rate Limit)

**Status:** ✅ Bisa dilakukan SEKARANG

1. Dashboard → Auth → Users → Pilih user
2. Send password recovery
3. Check email → klik link
4. ResetPasswordPage muncul
5. Input password baru
6. Submit → redirect ke login
7. Login dengan password baru ✅

### Test B: UI "Lupa Kata Sandi?" (Perlu Wait atau Change IP)

**Status:** ⏰ Tunggu 1 jam ATAU ganti IP

1. Login page → "Lupa Kata Sandi?"
2. Input email → kirim
3. Check email → klik link
4. Test ResetPasswordPage
5. Login dengan password baru ✅

---

## 📊 Verifikasi Rate Limit Status

### Cara Check Berapa Request yang Tersisa:

Tidak ada cara langsung, tapi bisa estimate:

**Cara 1: Check Network Tab**
1. Buka browser **DevTools** (F12)
2. Tab **Network**
3. Submit "Lupa Kata Sandi?"
4. Cari request ke: `https://...supabase.co/auth/v1/recover`
5. Check **response headers:**
   - `X-RateLimit-Limit`: Total limit
   - `X-RateLimit-Remaining`: Sisa request
   - `X-RateLimit-Reset`: Waktu reset (Unix timestamp)

**Cara 2: Trial & Error**
- Coba submit
- Jika sukses → masih ada quota
- Jika rate limit → tunggu atau ganti IP

---

## 🔧 Update UI (Sudah Dilakukan)

Saya sudah update `ForgotPasswordModal.jsx`:

### ✅ Perubahan:

1. **Error message lebih jelas:**
   ```
   "Terlalu banyak permintaan reset password dari jaringan Anda. 
   Silakan tunggu 60 menit atau hubungi administrator untuk reset manual."
   ```

2. **Info box di form:**
   ```
   ℹ️ Untuk keamanan, maksimal 3 permintaan per jam dari jaringan yang sama.
   ```

3. **Error dengan icon** untuk lebih visible

---

## 💡 Rekomendasi

### Untuk Testing Sekarang:
✅ **Pakai Solusi 1** (Reset manual dari Dashboard)
- Paling cepat dan mudah
- Bisa test flow ResetPasswordPage
- Tidak ada waiting time

### Untuk Production:
1. **Tambah informasi** di UI tentang rate limit (sudah done ✅)
2. **Tambahkan countdown timer** "Coba lagi dalam X menit"
3. **Increase rate limit** di Supabase settings
4. **Tambah CAPTCHA** untuk prevent abuse
5. **Log rate limit errors** untuk monitoring

### Untuk User Manual:
Buat dokumentasi:
> "Jika lupa password, silakan hubungi administrator untuk reset manual.  
> Administrator dapat mereset password Anda melalui Supabase Dashboard."

---

## 📝 Checklist

**Untuk Testing:**
- [ ] Reset password manual dari Dashboard (Akun A atau B)
- [ ] Check email masuk
- [ ] Klik link di email
- [ ] Test ResetPasswordPage
- [ ] Verifikasi password berhasil diupdate
- [ ] Login dengan password baru ✅

**Untuk Production:**
- [x] Update error message UI
- [x] Tambah info rate limit di modal
- [ ] Test complete flow setelah tunggu 1 jam
- [ ] Consider increase rate limit di Supabase
- [ ] Add monitoring untuk rate limit errors

---

## 🆘 Jika Masih Bermasalah

### Error: Email tidak masuk setelah manual reset
- Check folder **Spam/Junk**
- Verify email di Supabase: Dashboard → Auth → Users → Check email verified
- Check SMTP settings: Dashboard → Project Settings → Auth → SMTP

### Error: Link tidak valid
- Token expired (default 1 jam)
- Request link baru

### Error: ResetPasswordPage tidak bisa parse token
- Check console logs di browser (F12)
- Verify URL format: `...?access_token=...&type=recovery`
- Check redirect URL setting: Dashboard → Auth → URL Configuration

