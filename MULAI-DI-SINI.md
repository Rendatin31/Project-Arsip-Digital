# 🚀 MULAI DI SINI - Debug FCM Notifikasi

## ❓ Masalah Sekarang

**Notifikasi tidak masuk di device Android** ketika user lain upload dokumen.

---

## ✅ Solusi: Test Manual (2 Menit!)

### Step 1️⃣: Buka Supabase Database

Link: https://app.supabase.com/project/axpanhequppcviaimwte/editor

1. Klik table: **profiles**
2. Scroll ke kanan sampai lihat kolom: **fcm_token**
3. Cari baris yang punya nilai (bukan kosong)
4. Klik baris tersebut
5. **Copy value di kolom `id`** (contoh: abc123-def456-...)

**📝 Catat:**
- Email user ini: _______________
- ID user ini: _______________

---

### Step 2️⃣: Test Edge Function

Link: https://app.supabase.com/project/axpanhequppcviaimwte/functions

1. Klik: **send-fcm-notification**
2. Cari tombol: **"Invoke function"** atau **"Test"** (kanan atas)
3. **Copy paste JSON ini** (ganti dengan ID dari Step 1):

```json
{
  "userId": "PASTE_ID_DARI_STEP_1_DI_SINI",
  "title": "Test Manual",
  "message": "Testing FCM dari Supabase Dashboard",
  "type": "test"
}
```

4. Klik: **"Send"** atau **"Invoke"**

---

### Step 3️⃣: Check Device!

**Lihat device Android SEKARANG!**

#### ✅ BERHASIL - Notifikasi Muncul:

```
🎉 FCM BERFUNGSI!

Artinya:
✅ Firebase setup OK
✅ Edge Function OK
✅ Device settings OK
✅ FCM token valid

Masalahnya: Upload document tidak trigger Edge Function

→ Lanjut ke: FCM-TROUBLESHOOT-SIMPLE.md (Section: Upload Trigger)
```

#### ❌ GAGAL - Notifikasi Tidak Muncul:

```
Ada masalah di FCM setup atau device.

Check ini:
→ Apakah user yang login di device = user dari Step 1?
→ Apakah notification permission enabled di device?
→ Apakah APK yang diinstall versi terbaru?

→ Lanjut ke: CARA-DEBUG-NOTIFIKASI.md (Check 1, 2, 3)
```

---

## 📊 Hasil Test - Laporan

Setelah test, kasih tau:

### ✅ Checklist:

```
[ ] Manual test berhasil? (Ya/Tidak)
[ ] User login di device: email@example.com
[ ] User dengan token (Step 1): email@example.com
[ ] Apakah user match? (Ya/Tidak)
[ ] Screenshot response dari Invoke
```

---

## 🎯 Kenapa Manual Test Penting?

Manual test akan **langsung kasih tau** apakah:

1. ✅ **FCM berfungsi** → Masalah di trigger (code)
2. ❌ **FCM tidak berfungsi** → Masalah di setup (device/token/permission)

**Hanya butuh 2 menit! Langsung dapat jawaban!** 🚀

---

## 📖 Dokumentasi Lengkap

Jika perlu detail lebih:

1. **CARA-DEBUG-NOTIFIKASI.md** - Panduan lengkap troubleshooting
2. **FCM-TROUBLESHOOT-SIMPLE.md** - Simple troubleshooting guide
3. **QUICK-FCM-DEBUG.md** - Step-by-step detailed debugging
4. **check-fcm-tokens.sql** - SQL queries untuk check database
5. **FCM-IMPLEMENTATION-COMPLETE.md** - Dokumentasi implementasi

---

## 💡 Quick Tips

- **User harus match!** Device login User A → token harus User A
- **Permission penting!** Settings > Apps > Arsip Digital > Notifications (AKTIF)
- **APK terbaru!** Install APK yang sudah punya FCM code
- **Manual test dulu!** Tercepat untuk verify FCM works

---

## 🆘 Need Help?

Report hasil manual test dengan info:

1. Screenshot response dari Invoke
2. Email user di device
3. Email user dengan token (dari Step 1)
4. Notification permission status (enabled/disabled)

---

**🚀 MULAI SEKARANG! Test manual di atas hanya 2 menit!**

**Hasil test akan kasih tau next steps yang tepat! 🎯**
