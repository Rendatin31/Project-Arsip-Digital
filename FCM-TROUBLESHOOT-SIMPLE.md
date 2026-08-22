# 🔧 FCM Troubleshooting - Simple Guide

## ❓ Kenapa Notifikasi Tidak Masuk?

Ada 3 kemungkinan:

### 1️⃣ **User Salah** (Paling Sering!)
```
❌ Masalah: Device login User A, tapi notifikasi dikirim ke User B

✅ Cek:
   1. Buka Supabase > Table Editor > profiles
   2. Cari kolom "fcm_token" (scroll kanan)
   3. Lihat user mana yang punya token (tidak NULL)
   4. Pastikan user di device = user yang punya token

✅ Fix:
   - Login di device dengan user yang SAMA dengan yang punya token
```

### 2️⃣ **Edge Function Tidak Jalan**
```
❌ Masalah: Edge Function tidak ter-invoke waktu upload document

✅ Cek:
   1. Desktop: Buka console (F12)
   2. Upload document
   3. Lihat log: "✅ FCM notification sent via Edge Function"
   4. Atau ada error: "❌ FCM Edge Function error"

✅ Fix:
   - Check Supabase Functions logs
   - Test manual invoke (lihat di bawah)
```

### 3️⃣ **Device Permission / Settings**
```
❌ Masalah: Permission notifikasi tidak enabled

✅ Cek:
   Settings > Apps > Arsip Digital > Notifications
   Pastikan: ENABLED

✅ Fix:
   - Enable notification permission
   - Disable battery optimization
   - Enable background data
```

---

## 🧪 Quick Test - Manual Invoke

**Test paling cepat untuk verify FCM works!**

### Step 1: Get User ID yang Punya Token

```sql
-- Run di Supabase SQL Editor:
SELECT id, email, full_name, LEFT(fcm_token, 30) as token
FROM profiles 
WHERE fcm_token IS NOT NULL;
```

Copy `id` dari hasil query.

### Step 2: Test Manual Invoke

1. Buka: https://app.supabase.com/project/axpanhequppcviaimwte/functions
2. Klik: **send-fcm-notification**
3. Klik: **"Invoke function"** atau **"Test"**
4. Paste JSON ini (ganti USER_ID):

```json
{
  "userId": "PASTE_USER_ID_DI_SINI",
  "title": "Test Manual",
  "message": "Testing FCM dari dashboard",
  "type": "test"
}
```

5. Klik **"Send"**
6. **Check device SEKARANG!**

### Expected Result:

✅ **Berhasil:**
```json
{
  "success": true,
  "messageName": "projects/arsip-digital-26222/messages/0:17...",
  "userId": "xxx",
  "userName": "User Name"
}
```
→ **Notifikasi harus muncul di device!**

❌ **Gagal:**
```json
{
  "error": "No FCM token found for user"
}
```
→ Check user ID benar atau token ada

---

## 🎯 Debugging Flow Chart

```
Start
  ↓
1. Run manual test (Step 2) ────→ Berhasil? ──→ Yes ──→ FCM WORKS! ✅
  ↓                                                      Check why upload not trigger
  No                                                     (Check notifications.js)
  ↓
2. Check error message:
  ↓
  ├─ "No FCM token found" ──→ Check Step 1 (User salah/token NULL)
  ├─ "Invalid token" ──→ Reinstall app untuk generate token baru
  ├─ "404 Not Found" ──→ Project ID issue (check service account)
  └─ Other error ──→ Screenshot dan report

```

---

## 📸 What to Screenshot & Report

Tolong check dan screenshot:

### ✅ Check 1: Database
```
Supabase > Table Editor > profiles
Screenshot kolom: email, full_name, fcm_token (partial)

Question: Email mana yang punya token?
```

### ✅ Check 2: Manual Test Result
```
Supabase > Functions > send-fcm-notification > Invoke
Screenshot: Response JSON

Question: Success true atau ada error?
```

### ✅ Check 3: Desktop Console
```
Browser > F12 > Console
Upload document
Screenshot: Console logs (semua yang ada "FCM" atau "notification")

Question: Ada log "✅ FCM notification sent" atau error?
```

### ✅ Check 4: Edge Function Logs
```
Supabase > Functions > send-fcm-notification > Logs
Screenshot: Recent invocation logs

Question: Ada invocation baru? Success atau error?
```

### ✅ Check 5: Device Info
```
Question:
- Email user yang login di device?
- APK diinstall kapan? (sebelum/sesudah FCM code?)
- Notification permission enabled?
```

---

## 💡 Common Solutions

### Solution 1: User Mismatch
```bash
# User di device ≠ user yang punya token

Fix:
1. Lihat user mana yang punya token di database
2. Login di device dengan user TERSEBUT
3. Atau: Reinstall app, login dengan user baru, token akan generate
```

### Solution 2: Token Expired/Invalid
```bash
# FCM token tidak valid

Fix:
1. Uninstall app dari device
2. Install APK baru
3. Login
4. Check database - token should update
```

### Solution 3: APK Outdated
```bash
# APK belum punya FCM code

Fix:
1. npm run build
2. npx cap sync android
3. npx cap open android
4. Build > Build APK
5. Install APK baru
```

### Solution 4: Edge Function Not Triggered
```bash
# Upload document tidak trigger Edge Function

Check:
- src/utils/notifications.js
- Line ~60-80: supabase.functions.invoke
- Console log harus ada: "📤 Sending FCM notification via Edge Function..."

Fix:
- Verify code di notifications.js intact
- Check desktop console for errors
```

---

## 🚀 Fastest Debugging Method

**Do this IN ORDER:**

1. **Quick Test (2 min):**
   ```
   Manual invoke Edge Function (lihat di atas)
   → Device dapat notif? → FCM WORKS! ✅
   → Device tidak dapat? → Check user/token/device settings
   ```

2. **Check User Match (1 min):**
   ```
   Database: User mana punya token?
   Device: User mana yang login?
   → Same? → Good!
   → Different? → Login dengan user yang benar
   ```

3. **Check Upload Trigger (2 min):**
   ```
   Desktop: Upload document
   Console: Lihat log "FCM notification sent"?
   → Yes? → Check why not arriving (device settings)
   → No? → Check Edge Function logs
   ```

**Total: 5 minutes to identify the issue!**

---

## 📞 What to Report

Setelah test, report hasil:

```
✅ CHECKLIST:

[ ] Manual test: Success/Error? (screenshot response)
[ ] User di device: email@example.com
[ ] User dengan token: email@example.com  
[ ] Match? Ya/Tidak
[ ] Desktop console: Ada log "FCM notification sent"? Ya/Tidak
[ ] Edge Function logs: Ada invocation? Success/Error?
[ ] Device notification permission: Enabled/Disabled?
[ ] APK build date: DD/MM/YYYY (before/after FCM code?)
```

---

**Start with Manual Test! It's the fastest way to verify FCM works! 🎯**
