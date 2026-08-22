# 📱 Cara Debug Notifikasi FCM - Panduan Singkat

## 🎯 Masalah

Notifikasi tidak masuk di device Android ketika user lain upload dokumen.

---

## ✅ Tes Tercepat (2 Menit!)

### Langkah 1: Cari User yang Punya Token

1. Buka: https://app.supabase.com/project/axpanhequppcviaimwte/editor
2. Klik table: **profiles**
3. Scroll ke kanan, cari kolom: **fcm_token**
4. Lihat baris mana yang punya nilai (bukan kosong/NULL)
5. **Catat email user tersebut!**

### Langkah 2: Test Manual

1. Buka: https://app.supabase.com/project/axpanhequppcviaimwte/functions
2. Klik: **send-fcm-notification**
3. Klik tombol: **"Invoke function"** atau **"Test"** (biasanya di kanan atas)
4. Copy paste JSON ini (ganti USER_ID dengan ID dari langkah 1):

```json
{
  "userId": "PASTE_ID_USER_YANG_PUNYA_TOKEN",
  "title": "Test dari Dashboard",
  "message": "Ini test notifikasi manual",
  "type": "test"
}
```

5. Klik **"Send"** atau **"Invoke"**
6. **Lihat device Android SEKARANG!**

### Hasil:

#### ✅ Jika Notifikasi Muncul di Device:
```
FCM BERFUNGSI! ✅

Artinya:
- Firebase sudah OK
- Edge Function sudah OK  
- Device settings sudah OK

Masalahnya: Trigger notifikasi waktu upload document tidak jalan.
→ Perlu check code di src/utils/notifications.js
```

#### ❌ Jika Notifikasi TIDAK Muncul:
```
Ada masalah di setup FCM atau device.

Kemungkinan:
1. User di device ≠ user yang punya token
2. Device notification permission belum enabled
3. FCM token expired/invalid
4. Battery optimization blocking notifications
```

---

## 🔍 Langkah Selanjutnya (Jika Test Manual Gagal)

### Check 1: User Match?

**Pertanyaan:**
- User mana yang login di device Android? (email)
- User mana yang punya token di database? (dari Langkah 1)
- Apakah SAMA?

**Jika TIDAK SAMA:**
```
Solusi:
Login di device dengan user yang SAMA dengan yang punya token.

Atau:
1. Uninstall app dari device
2. Install APK terbaru
3. Login dengan user manapun
4. Token akan generate otomatis untuk user tersebut
```

### Check 2: Device Settings

1. **Notification Permission:**
   ```
   Settings > Apps > Arsip Digital > Notifications
   Harus: AKTIF / ENABLED
   ```

2. **Battery Optimization:**
   ```
   Settings > Apps > Arsip Digital > Battery
   Pilih: Unrestricted
   Atau: Disable battery optimization
   ```

3. **Do Not Disturb Mode:**
   ```
   Pastikan mode DND tidak aktif
   Atau Arsip Digital masuk dalam exception list
   ```

### Check 3: Token Valid?

Jalankan SQL ini di Supabase SQL Editor:

```sql
SELECT 
  email, 
  full_name,
  LEFT(fcm_token, 30) as token_preview,
  fcm_token_updated_at
FROM profiles 
WHERE fcm_token IS NOT NULL;
```

**Jika `fcm_token_updated_at` sudah lama (>1 minggu):**
```
Token mungkin expired.

Solusi:
1. Uninstall app
2. Install APK baru  
3. Login
4. Token akan refresh otomatis
```

---

## 🧪 Test Upload Document (Jika Manual Test Berhasil)

Jika manual test berhasil (notifikasi muncul), tapi upload document tidak trigger notifikasi:

### Langkah:

1. **Desktop:** Login di browser (https://rendatinarsip.vercel.app)
2. **Desktop:** Tekan F12 (buka Developer Tools)
3. **Desktop:** Klik tab "Console"
4. **Desktop:** Upload dokumen
5. **Desktop:** Lihat logs di console

### Log yang Diharapkan:

```
Uploading document...
✅ Document uploaded successfully
Notifying other users...
✅ Notification created in database
📤 Sending FCM notification via Edge Function...
✅ FCM notification sent via Edge Function
```

### Jika Ada Error:

```
❌ FCM Edge Function error: [pesan error]
```

**Screenshot dan kirim pesan errornya!**

---

## 📸 Info yang Perlu Dilaporkan

Tolong kasih tau hasil dari test di atas:

### ✅ Info yang Dibutuhkan:

1. **Manual Test:**
   - Berhasil atau gagal?
   - Screenshot response JSON dari Supabase

2. **User Info:**
   - Email user yang login di device: _______________
   - Email user yang punya token di database: _______________
   - Apakah sama? Ya / Tidak

3. **Desktop Console (jika manual test berhasil):**
   - Ada log "✅ FCM notification sent via Edge Function"? Ya / Tidak
   - Screenshot console logs

4. **Device Settings:**
   - Notification permission enabled? Ya / Tidak
   - Battery optimization: Unrestricted / Optimized?
   - APK diinstall tanggal berapa?

---

## 🚀 Solusi Cepat

### Jika Manual Test BERHASIL:
```
→ FCM works! ✅
→ Issue: Upload document tidak trigger notifikasi
→ Action: Check code atau console logs waktu upload
```

### Jika Manual Test GAGAL:
```
→ FCM setup issue atau device issue
→ Action: Check user match, device settings, rebuild APK
```

---

## 💡 Tips

1. **Manual test DULU!** - Ini cara tercepat verify FCM berfungsi
2. **User harus match** - Device login user A, token harus untuk user A
3. **Permission penting** - Notification harus enabled di device settings
4. **APK terbaru** - Pastikan APK yang diinstall sudah punya FCM code

---

## 🔗 File Penting

- `FCM-TROUBLESHOOT-SIMPLE.md` - Panduan troubleshooting
- `QUICK-FCM-DEBUG.md` - Step-by-step debugging detail
- `check-fcm-tokens.sql` - SQL query untuk check tokens
- `FCM-IMPLEMENTATION-COMPLETE.md` - Dokumentasi lengkap implementasi

---

**Mulai dari Manual Test! Hanya butuh 2 menit! 🎯**

**Hasilnya akan kasih tau apakah FCM berfungsi atau tidak! 🚀**
