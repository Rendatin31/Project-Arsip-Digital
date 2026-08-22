# 🐛 Quick FCM Debug - Langkah per Langkah

## Status Saat Ini:
- ✅ Edge Function deployed
- ✅ Service Account configured
- ✅ Database column `fcm_token` created
- ✅ Satu user punya FCM token
- ❌ **Notifikasi tidak muncul di device**

---

## 🎯 Langkah 1: Cek User yang Punya Token

### Di Supabase Dashboard:

1. Buka: https://app.supabase.com/project/axpanhequppcviaimwte/editor
2. Klik table: **profiles**
3. Cari kolom: **fcm_token** (scroll ke kanan)
4. Lihat user mana yang punya nilai (bukan NULL)

### ❓ Pertanyaan Penting:
```
User mana yang punya fcm_token? (catat email/nama user)
_________________________________

Apakah ini user yang sedang login di device Android?
[ ] Ya - Lanjut Step 2
[ ] Tidak - INI MASALAHNYA! Baca solusi di bawah
```

### ⚠️ JIKA TIDAK MATCH:

**Masalah:** Device login dengan User A, tapi token tersimpan untuk User B.

**Solusi:**
```bash
1. Uninstall app dari device
2. Rebuild APK:
   npm run build
   npx cap sync android
   npx cap open android
   # Build > Build Bundle(s) / APK(s) > Build APK(s)
3. Install APK baru
4. Login dengan user YANG SAMA dengan yang punya token di database
5. Check database lagi - seharusnya token updated
```

---

## 🎯 Langkah 2: Test Upload dari Desktop

### Skenario Test:
```
Device (Android): Login dengan User A (yang punya fcm_token)
Desktop (Browser): Login dengan User B (user berbeda)
```

### Action:
1. **Desktop:** Buka https://rendatinarsip.vercel.app
2. **Desktop:** Login dengan user BERBEDA dari device
3. **Desktop:** Buka Developer Tools (F12) > Tab Console
4. **Desktop:** Upload dokumen baru
5. **Desktop:** Perhatikan console logs

### ✅ Log yang Diharapkan:
```
Uploading document...
✅ Document uploaded successfully
Notifying other users...
✅ Notification created in database
📤 Sending FCM notification via Edge Function...
✅ FCM notification sent via Edge Function
```

### ❌ Jika Ada Error:
```
❌ FCM Edge Function error: [error message]
❌ Error calling FCM Edge Function: [error message]
```

**Catat error message dan lanjut ke Step 3!**

---

## 🎯 Langkah 3: Cek Edge Function Logs

### Di Supabase Dashboard:

1. Buka: https://app.supabase.com/project/axpanhequppcviaimwte/functions
2. Klik: **send-fcm-notification**
3. Klik tab: **Logs** atau **Invocations**
4. Lihat invocation terbaru (setelah upload document)

### ✅ Log Sukses:
```
🔥 FCM Edge Function called
📦 Payload: { userId, title, message, type }
🔍 Getting FCM token for user: xxx
✅ FCM token found: eNF70Hk6TZ...
🔐 Getting OAuth2 access token...
✅ Access token obtained
📤 Sending FCM v1 message to Firebase...
📥 FCM Response: { name: "projects/..." }
✅ FCM notification sent successfully!
```

### ❌ Possible Errors:

#### Error 1: "No FCM token found for user"
```
⚠️ Masalah: Token tidak ada untuk user target
✅ Solusi: Pastikan user yang seharusnya menerima notifikasi
          punya token di database (check Step 1)
```

#### Error 2: "FIREBASE_SERVICE_ACCOUNT not configured"
```
⚠️ Masalah: Secret tidak ter-set
✅ Solusi: Re-set secret (sudah done, seharusnya OK)
```

#### Error 3: "FCM API error: 404 Not Found"
```
⚠️ Masalah: Project ID tidak match
✅ Solusi: Check project_id di Service Account = "arsip-digital-26222"
```

#### Error 4: "Invalid token"
```
⚠️ Masalah: Token expired atau invalid
✅ Solusi: Uninstall + reinstall app untuk generate token baru
```

**Screenshot error dan kirim ke saya!**

---

## 🎯 Langkah 4: Manual Test (PENTING!)

Test Edge Function langsung tanpa upload document.

### Di Supabase Dashboard:

1. Buka: https://app.supabase.com/project/axpanhequppcviaimwte/functions
2. Klik: **send-fcm-notification**
3. Cari button: **"Invoke function"** atau **"Test"**
4. Masukkan JSON payload:

```json
{
  "userId": "PASTE_USER_ID_YANG_PUNYA_TOKEN_DI_SINI",
  "title": "Test Manual dari Dashboard",
  "message": "Ini test notification langsung",
  "type": "test"
}
```

**PENTING:** Ganti `userId` dengan ID user yang punya fcm_token (dari Step 1)

5. Klik: **"Send"** atau **"Invoke"**
6. Lihat Response:

### ✅ Response Sukses:
```json
{
  "success": true,
  "messageName": "projects/arsip-digital-26222/messages/...",
  "userId": "xxx",
  "userName": "User Name"
}
```

**Check device SEKARANG! Seharusnya ada notifikasi!**

### ❌ Response Error:
```json
{
  "error": "...",
  "details": "..."
}
```

**Screenshot dan kirim error!**

---

## 🎯 Langkah 5: Check Device Settings

### Android Device:

1. **Notification Permission:**
   ```
   Settings > Apps > Arsip Digital > Permissions > Notifications
   Pastikan: ALLOWED / IZINKAN
   ```

2. **Notification Channel:**
   ```
   Settings > Apps > Arsip Digital > Notifications
   Pastikan ada channel "Arsip Digital"
   Pastikan: ENABLED / AKTIF
   ```

3. **Battery Optimization:**
   ```
   Settings > Apps > Arsip Digital > Battery
   Set ke: UNRESTRICTED
   ```

4. **Background Data:**
   ```
   Settings > Apps > Arsip Digital > Mobile data & Wi-Fi
   Background data: ENABLED
   ```

5. **Do Not Disturb:**
   ```
   Pastikan mode DND tidak aktif
   Atau Arsip Digital masuk exception
   ```

---

## 🎯 Langkah 6: Rebuild & Reinstall APK (Jika Perlu)

Jika semua di atas OK tapi masih tidak ada notifikasi, rebuild APK:

```bash
# 1. Clean build
cd C:\Users\Halut\Documents\GitHub\Project-Arsip-Digital

# 2. Build fresh
npm run build

# 3. Sync to Android
npx cap sync android

# 4. Open Android Studio
npx cap open android

# 5. In Android Studio:
# Build > Clean Project
# Build > Build Bundle(s) / APK(s) > Build APK(s)

# 6. APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

**Install APK baru, login, test lagi!**

---

## 📋 Checklist - Laporkan Hasil:

Setelah test, kasih tau hasil untuk setiap step:

- [ ] **Step 1:** User di device = user yang punya token? (Ya/Tidak)
- [ ] **Step 2:** Console log waktu upload? (Sukses/Error - screenshot)
- [ ] **Step 3:** Edge Function logs? (Sukses/Error - screenshot)
- [ ] **Step 4:** Manual test berhasil? (Ya/Tidak - screenshot response)
- [ ] **Step 5:** Device settings semua OK? (Ya/Tidak)
- [ ] **Step 6:** Perlu rebuild? (Ya/Tidak)

---

## 🚀 Quick Test Script

Copy paste ini di browser console (Desktop) waktu sudah login:

```javascript
// Get current user
const user = JSON.parse(localStorage.getItem('sb-axpanhequppcviaimwte-auth-token'));
console.log('Current user:', user.user.email);

// Check if notification will be created
console.log('Testing notification creation...');

// This will trigger Edge Function
fetch('https://axpanhequppcviaimwte.supabase.co/functions/v1/send-fcm-notification', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user.access_token}`
  },
  body: JSON.stringify({
    userId: 'USER_ID_YANG_PUNYA_TOKEN', // GANTI INI!
    title: 'Test dari Console',
    message: 'Testing FCM notification',
    type: 'test'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Response:', data);
  if (data.success) {
    console.log('🎉 NOTIFICATION SENT! Check device!');
  } else {
    console.error('❌ Error:', data);
  }
})
.catch(err => console.error('❌ Request failed:', err));
```

**Ganti `USER_ID_YANG_PUNYA_TOKEN` dengan user ID yang benar!**

---

## 🎯 Prioritas Debugging:

1. **Paling Penting:** Step 4 (Manual Test) - ini proof bahwa FCM works!
2. **Kedua:** Step 1 (User Match) - pastikan token untuk user yang benar
3. **Ketiga:** Step 3 (Edge Function Logs) - cek apakah ter-trigger
4. **Keempat:** Step 5 (Device Settings) - pastikan permission OK

---

## 💡 Tips:

1. Test manual test (Step 4) **DULU** - paling cepat!
2. Jika manual test berhasil = FCM works, masalahnya di trigger
3. Jika manual test gagal = FCM setup issue, check service account
4. Jika manual test berhasil tapi upload tidak trigger = check notifications.js code

---

**Mulai dari Step 1, laporkan hasilnya! 🚀**
