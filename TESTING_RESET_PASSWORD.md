# 🧪 Testing Reset Password - Bypass Rate Limit

## Masalah
Rate limit berdasarkan **IP address**, bukan per akun.
- Akun A: 2 request
- Akun B: 1 request  
- **Total 3 request dari IP sama = BLOCKED!**

---

## ✅ Cara Test (Bypass Rate Limit)

### Metode 1: Reset Manual dari Dashboard (RECOMMENDED)

1. **Buka Supabase Dashboard**
   - https://supabase.com/dashboard
   - Login dan pilih project Anda

2. **Masuk ke Authentication → Users**

3. **Pilih user yang mau direset** (contoh: Akun B)

4. **Klik titik tiga (⋮)** di sebelah kanan nama user

5. **Pilih salah satu:**
   - **"Send password recovery"** → kirim email reset
   - Atau klik user → **"Reset password"** → set password baru langsung

6. **Check email** dari user tersebut

7. **Klik link** di email

8. **Test ResetPasswordPage** di aplikasi:
   - Link akan buka: `http://localhost:5173/reset-password?access_token=...`
   - Form input password baru muncul
   - Input password baru (min 6 karakter)
   - Klik "Perbarui Kata Sandi"
   - Redirect ke login
   - Login dengan password baru ✅

---

### Metode 2: Test dengan IP Berbeda

Jika ingin test flow "Lupa Kata Sandi?" dari UI:

**Option A: Mobile Hotspot**
1. Matikan WiFi di laptop
2. Nyalakan hotspot dari HP
3. Connect laptop ke hotspot
4. Buka aplikasi di browser
5. Test "Lupa Kata Sandi?" dengan akun baru

**Option B: VPN**
1. Install VPN (ProtonVPN, Windscribe, dll - free ok)
2. Connect VPN
3. IP berubah → rate limit reset
4. Test "Lupa Kata Sandi?"

**Option C: Browser Incognito + Clear Cache**
Kadang works, tapi tetap IP sama:
1. Buka browser Incognito
2. Clear all cookies/cache
3. Test lagi

---

### Metode 3: Tunggu 1 Jam

Rate limit akan reset otomatis setelah ~60 menit dari request pertama.

---

## 🎯 Test Flow Lengkap

### A. Test "Lupa Kata Sandi" (Dari UI)

**Jika sudah tunggu 1 jam ATAU pakai IP berbeda:**

1. Buka aplikasi login page
2. Klik **"Lupa Kata Sandi?"**
3. Input email di modal
4. Klik **"Kirim Link Reset"**
5. Success message muncul ✅
6. Check email
7. Klik link di email
8. Form reset password muncul
9. Input password baru (min 6 karakter)
10. Klik **"Perbarui Kata Sandi"**
11. Redirect ke login
12. Login dengan password baru ✅

### B. Test Reset Manual (Dari Dashboard)

**Untuk bypass rate limit:**

1. Dashboard → Authentication → Users
2. Pilih user → Send password recovery
3. Check email
4. Klik link
5. Test ResetPasswordPage
6. Verifikasi password berhasil diupdate

---

## 📊 Expected Results

### ✅ Success Indicators:
- Modal "Lupa Kata Sandi" bisa kirim email
- Email diterima dalam 1-2 menit
- Link di email valid (tidak expired)
- ResetPasswordPage bisa update password
- Login dengan password baru berhasil

### ❌ Error yang Wajar:
- **"Terlalu banyak permintaan"** → Rate limit (tunggu 1 jam atau pakai IP lain)
- **"Tautan tidak valid"** → Token expired (minta link baru)
- **"Email rate limit exceeded"** → Supabase limit (tunggu atau manual reset)

---

## 🔧 Troubleshooting

### Error: "Terlalu banyak permintaan"
**Penyebab:** Rate limit dari IP sama  
**Solusi:** 
- Tunggu 1 jam
- Pakai IP berbeda (hotspot/VPN)
- Reset manual dari dashboard

### Error: "Tautan tidak valid"
**Penyebab:** Token expired (default 1 jam)  
**Solusi:** Request link baru

### Email tidak masuk
**Check:**
- Folder Spam/Junk
- Supabase Dashboard → Project Settings → Auth → Email Templates (aktif?)
- SMTP settings configured?

### ResetPasswordPage error parsing token
**Check console logs:**
- URL punya `access_token` parameter?
- Format: `#access_token=...` atau `?access_token=...`

---

## 📝 Checklist Testing

- [ ] Reset manual dari Dashboard (bypass rate limit)
- [ ] Check email masuk
- [ ] Klik link di email
- [ ] ResetPasswordPage muncul
- [ ] Form input password works
- [ ] Update password success
- [ ] Redirect ke login
- [ ] Login dengan password baru ✅
- [ ] (Optional) Test dari UI setelah tunggu 1 jam

---

## 💡 Tips Production

1. **Increase rate limit** di Supabase settings
2. **Inform users** tentang rate limit (tambah text di modal)
3. **Show countdown timer** "Coba lagi dalam X menit"
4. **Alternative:** Tambah CAPTCHA untuk prevent abuse

