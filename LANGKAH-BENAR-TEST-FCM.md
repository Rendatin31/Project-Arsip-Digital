# ✅ Langkah yang BENAR untuk Test FCM

## 🎯 Problem dari Screenshot Anda

Error: **"Invalid payload"** (HTTP 400)

Penyebab: **JSON tidak lengkap** - kurang field `userId`

---

## 📋 Langkah yang Benar (2 Steps!)

### ✅ STEP 1: Dapatkan User ID

1. **Buka Supabase SQL Editor:**
   
   Link: https://app.supabase.com/project/axpanhequppcviaimwte/sql/new

2. **Copy paste SQL ini:**

```sql
SELECT 
  id,
  email,
  full_name,
  LEFT(fcm_token, 30) as token_preview
FROM profiles 
WHERE fcm_token IS NOT NULL;
```

3. **Klik "RUN" atau tekan Ctrl+Enter**

4. **Lihat hasil:**
   ```
   Hasil akan tampil seperti ini:
   
   | id                                   | email              | full_name  | token_preview           |
   |--------------------------------------|-------------------|------------|-------------------------|
   | 12345678-90ab-cdef-1234-567890abcdef | user@example.com  | User Name  | eNF70Hk6TZWzYtVHhAmMH_... |
   ```

5. **COPY nilai dari kolom `id`** (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)

   **Contoh:** `12345678-90ab-cdef-1234-567890abcdef`

---

### ✅ STEP 2: Test Edge Function

1. **Buka Edge Functions:**
   
   Link: https://app.supabase.com/project/axpanhequppcviaimwte/functions

2. **Klik:** `send-fcm-notification`

3. **Klik tombol:** "Invoke function" atau "Test" (biasanya di kanan atas)

4. **PASTE JSON INI** (ganti USER_ID dengan ID dari Step 1):

```json
{
  "userId": "PASTE_USER_ID_DARI_STEP_1_DI_SINI",
  "title": "Test Manual FCM",
  "message": "Testing notifikasi dari Supabase Dashboard",
  "type": "test"
}
```

### ⚠️ CONTOH LENGKAP:

**Misalnya user ID dari Step 1 adalah:** `12345678-90ab-cdef-1234-567890abcdef`

**Maka JSON Anda harus seperti ini:**

```json
{
  "userId": "12345678-90ab-cdef-1234-567890abcdef",
  "title": "Test Manual FCM",
  "message": "Testing notifikasi dari Supabase Dashboard",
  "type": "test"
}
```

5. **Klik:** "Send Request" atau "Invoke"

6. **Lihat Response di bagian bawah**

---

## ✅ Response yang Benar

### Jika BERHASIL:

```json
{
  "success": true,
  "messageName": "projects/arsip-digital-26222/messages/0:1234567890",
  "userId": "12345678-90ab-cdef-1234-567890abcdef",
  "userName": "User Name"
}
```

**✅ STATUS: 200 OK**

**→ SEKARANG CHECK DEVICE ANDROID!** Seharusnya ada notifikasi!

---

### Jika GAGAL:

#### ❌ Error: "No FCM token found"

```json
{
  "error": "No FCM token found for user",
  "userId": "...",
  "info": "User may not have logged in on mobile device yet"
}
```

**Solusi:**
- Check lagi user ID dari Step 1
- Pastikan user tersebut sudah login di device Android
- Atau coba user lain yang punya token

---

#### ❌ Error: "Invalid token" / "NOT_FOUND"

```json
{
  "error": "FCM API error: ...",
  "details": "INVALID_ARGUMENT or NOT_FOUND"
}
```

**Solusi:**
```
Token expired/invalid

Fix:
1. Uninstall app dari device
2. Install APK terbaru
3. Login dengan user yang sama
4. Test lagi
```

---

## 🔍 Verifikasi Sebelum Kirim

Pastikan JSON Anda:

- [x] Ada field **userId** (dengan value user ID dari database)
- [x] Ada field **title** (string)
- [x] Ada field **message** (string)
- [x] Ada field **type** (string)
- [x] Format JSON valid (kurung kurawal, koma, tanda kutip benar)

### ✅ JSON BENAR:
```json
{
  "userId": "12345678-90ab-cdef-1234-567890abcdef",
  "title": "Test",
  "message": "Testing",
  "type": "test"
}
```

### ❌ JSON SALAH (ini yang Anda kirim di screenshot):
```json
{
  "message": "Testing FCM dari Supabase Dashboard",
  "type": "test"
}
```
**Kurang:** `userId` dan `title`!

---

## 📸 Screenshot yang Perlu Dikirim

Setelah fix dan test lagi, kirim screenshot:

1. **SQL query result** - showing user ID dan email
2. **JSON request yang lengkap** - with userId filled in
3. **Response** - success atau error message
4. **Device status** - apakah notifikasi muncul?

---

## 💡 Quick Tips

1. **Jangan skip Step 1!** User ID wajib didapat dari database
2. **Copy paste hati-hati** - jangan ada spasi/typo di user ID
3. **Full UUID required** - format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
4. **All 4 fields required** - userId, title, message, type
5. **Device must be ON** - notifikasi tidak muncul jika device OFF

---

## 🚀 Alternative: Use Template File

Saya sudah buat template JSON untuk Anda di:

**File:** `test-fcm-payload-template.json`

**Isi:**
```json
{
  "userId": "GANTI_DENGAN_USER_ID_DARI_DATABASE",
  "title": "Test Manual dari Supabase Dashboard",
  "message": "Ini adalah test notifikasi FCM. Jika muncul di device, berarti FCM berfungsi dengan baik!",
  "type": "test"
}
```

**Cara pakai:**
1. Buka file tersebut
2. Ganti `GANTI_DENGAN_USER_ID_DARI_DATABASE` dengan user ID dari Step 1
3. Copy semua isi file
4. Paste ke Supabase Edge Function test form

---

## ⏭️ Setelah Test Berhasil

### Jika notifikasi MUNCUL di device:
```
🎉 FCM BERFUNGSI!

Artinya:
✅ Firebase setup OK
✅ Edge Function OK
✅ Device settings OK
✅ FCM token valid

Next step:
→ Check kenapa upload document tidak trigger Edge Function
→ Lihat console logs di desktop browser
```

### Jika notifikasi TIDAK MUNCUL:
```
Ada issue di device atau token

Check:
→ Device notification permission enabled?
→ User di device = user yang di-test?
→ Token valid atau expired?
```

---

**Sekarang coba lagi dengan JSON yang LENGKAP! 🚀**

**Jangan lupa jalankan Step 1 untuk dapat user ID dulu! 📋**
