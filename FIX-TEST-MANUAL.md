# 🔧 Fix: Test Manual FCM - JSON yang Benar

## ❌ Masalah dari Screenshot

Error: **"Invalid payload"** (400)

Penyebab: JSON tidak lengkap, kurang field `userId`

---

## ✅ Langkah yang Benar

### Step 1: Cari User ID dengan Token

**Buka Supabase SQL Editor:**
https://app.supabase.com/project/axpanhequppcviaimwte/sql/new

**Jalankan query ini:**

```sql
SELECT 
  id,
  email,
  full_name,
  LEFT(fcm_token, 30) as token_preview
FROM profiles 
WHERE fcm_token IS NOT NULL;
```

**Hasil akan seperti ini:**
```
id: abc-123-def-456-...
email: user@example.com
full_name: User Name
token_preview: eNF70Hk6TZWzYtVHhAmMH_...
```

**COPY VALUE dari kolom `id`!** (contoh: `abc-123-def-456-...`)

---

### Step 2: Test Edge Function dengan JSON yang Benar

**Buka Edge Function:**
https://app.supabase.com/project/axpanhequppcviaimwte/functions

1. Klik: **send-fcm-notification**
2. Klik: **"Invoke function"** atau **"Test"**
3. **PASTE JSON INI** (ganti USER_ID dengan ID dari Step 1):

```json
{
  "userId": "PASTE_USER_ID_DI_SINI",
  "title": "Test Manual",
  "message": "Testing FCM dari Supabase Dashboard",
  "type": "test"
}
```

### ⚠️ PENTING!

**JSON harus LENGKAP seperti ini:**

**CONTOH BENAR:**
```json
{
  "userId": "12345678-90ab-cdef-1234-567890abcdef",
  "title": "Test Manual",
  "message": "Testing FCM dari Supabase Dashboard",
  "type": "test"
}
```

**JANGAN seperti ini (SALAH - tidak ada userId):**
```json
{
  "message": "Testing FCM dari Supabase Dashboard",
  "type": "test"
}
```

---

### Step 3: Kirim Request

1. Pastikan JSON sudah lengkap (ada `userId`, `title`, `message`, `type`)
2. Klik: **"Send Request"** atau **"Invoke"**
3. Tunggu response

---

## ✅ Response yang Diharapkan

### Jika BERHASIL:

```json
{
  "success": true,
  "messageName": "projects/arsip-digital-26222/messages/0:1234567890",
  "userId": "12345678-90ab-cdef-1234-567890abcdef",
  "userName": "User Name"
}
```

**CHECK DEVICE SEKARANG!** Seharusnya ada notifikasi!

---

### Jika GAGAL:

#### Error 1: "No FCM token found for user"

```json
{
  "error": "No FCM token found for user",
  "userId": "...",
  "info": "User may not have logged in on mobile device yet"
}
```

**Penyebab:** User ID yang Anda masukkan tidak punya token di database

**Solusi:** 
1. Check lagi Step 1 - pastikan user ID benar
2. Atau login di device dengan user tersebut

---

#### Error 2: "Invalid token"

```json
{
  "error": "FCM API error: ...",
  "details": "INVALID_ARGUMENT or NOT_FOUND"
}
```

**Penyebab:** FCM token expired atau invalid

**Solusi:**
```
1. Uninstall app dari device
2. Install APK terbaru
3. Login
4. Token akan refresh otomatis
5. Test lagi
```

---

#### Error 3: "Invalid payload" (400)

```json
{
  "error": "Missing required fields: userId, title, message"
}
```

**Penyebab:** JSON tidak lengkap atau format salah

**Solusi:** Pastikan JSON punya semua field ini:
- `userId` (string)
- `title` (string)
- `message` (string)
- `type` (string)

---

## 📋 Checklist

Sebelum kirim request, pastikan:

- [ ] Sudah jalankan SQL query untuk dapat user ID
- [ ] User ID sudah di-copy dengan benar (full UUID)
- [ ] JSON punya 4 field: userId, title, message, type
- [ ] userId di-paste dengan benar (tidak ada spasi/typo)
- [ ] Device Android dalam keadaan ON
- [ ] Notification permission enabled

---

## 💡 Tips

1. **Copy user ID dengan hati-hati** - jangan sampai ada spasi atau karakter tambahan
2. **Paste full UUID** - format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
3. **Check JSON format** - harus valid JSON (pakai JSON validator jika perlu)
4. **Device harus ON** - notifikasi tidak akan muncul jika device OFF

---

## 🔍 Alternatif: Test via cURL

Jika UI Supabase tidak work, bisa test via command line:

```bash
# Get your access token from Supabase
# Settings > API > service_role key

curl -X POST \
  https://axpanhequppcviaimwte.supabase.co/functions/v1/send-fcm-notification \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "PASTE_USER_ID",
    "title": "Test via cURL",
    "message": "Testing FCM",
    "type": "test"
  }'
```

---

## 📸 Screenshot yang Perlu Dikirim

Setelah fix dan test lagi:

1. **Screenshot SQL query result** - showing user ID with token
2. **Screenshot request JSON** - showing complete JSON dengan userId
3. **Screenshot response** - showing success atau error message
4. **Info device** - apakah notifikasi muncul atau tidak

---

**Coba lagi dengan JSON yang LENGKAP! 🚀**

**Jangan lupa COPY user ID dari database dulu! 📋**
