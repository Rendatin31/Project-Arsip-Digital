# 📋 Cara Copy JSON yang Benar

## ❌ Error yang Anda Dapat:

```
"error": "Expected property name or '}' in JSON at position 1"
```

**Penyebab:** Ada karakter tidak valid atau format JSON rusak waktu copy-paste.

---

## ✅ SOLUSI TERCEPAT: Copy dari File

Saya sudah buat file JSON yang **siap pakai** dengan user ID Anda:

### File: `test-fcm-ready.json`

**Isi file:**
```json
{
  "userId": "e914e98a-d34c-4710-9dd2-f2f602a96379",
  "title": "Test Manual FCM",
  "message": "Testing notifikasi dari Supabase Dashboard",
  "type": "test"
}
```

---

## 📋 Langkah Copy yang Benar:

### Option 1: Copy dari File (RECOMMENDED)

1. **Buka file:** `test-fcm-ready.json` (klik 2x di File Explorer)
2. **Select All:** Tekan `Ctrl + A` (pilih semua)
3. **Copy:** Tekan `Ctrl + C`
4. **Buka** Supabase Edge Function test page
5. **Klik** di dalam kotak Request Body
6. **Clear semua:** Tekan `Ctrl + A` lalu `Delete`
7. **Paste:** Tekan `Ctrl + V`
8. **Klik:** "Send Request"

---

### Option 2: Ketik Manual (Jika copy tidak work)rvice_role" key

**Ketik PERSIS seperti ini** (termasuk spasi dan tanda kutip):

```json
{
  "userId": "e914e98a-d34c-4710-9dd2-f2f602a96379",
  "title": "Test Manual FCM",
  "message": "Testing notifikasi dari Supabase Dashboard",
  "type": "test"
}
```

**PENTING:**
- Gunakan tanda kutip ganda `"` (BUKAN kutip tunggal `'`)
- Ada koma `,` setelah setiap baris kecuali baris terakhir sebelum `}`
- Spasi harus benar (2 spasi indent atau tidak ada indent sama sekali juga OK)

---

### Option 3: Single Line (No Space)

Jika masih error, coba format single line (tanpa spasi sama sekali):

```json
{"userId":"e914e98a-d34c-4710-9dd2-f2f602a96379","title":"Test Manual FCM","message":"Testing notifikasi dari Supabase Dashboard","type":"test"}
```

**Copy paste baris di atas** (satu baris penuh tanpa line break).

---

## 🔍 Verifikasi JSON Valid

Sebelum kirim, **validate** JSON Anda:

1. Copy JSON yang sudah Anda paste di Request Body
2. Buka: https://jsonlint.com/
3. Paste JSON Anda di sana
4. Klik "Validate JSON"
5. Jika "Valid JSON" → Good! Kembali ke Supabase dan Send
6. Jika error → Fix error yang ditunjukkan

---

## ⚠️ Common Mistakes:

### ❌ SALAH - Tanda kutip tunggal:
```json
{
  'userId': 'e914e98a-d34c-4710-9dd2-f2f602a96379'
}
```

### ✅ BENAR - Tanda kutip ganda:
```json
{
  "userId": "e914e98a-d34c-4710-9dd2-f2f602a96379"
}
```

---

### ❌ SALAH - Koma di baris terakhir:
```json
{
  "userId": "xxx",
  "type": "test",
}
```

### ✅ BENAR - Tidak ada koma di baris terakhir:
```json
{
  "userId": "xxx",
  "type": "test"
}
```

---

### ❌ SALAH - Karakter invisible/hidden:
```json
{​
  "userId": "xxx"
}
```
*Ada karakter zero-width space yang tidak terlihat*

### ✅ BENAR - Ketik manual atau copy dari file clean:
```json
{
  "userId": "xxx"
}
```

---

## 🚀 RECOMMENDED: Gunakan Option 3 (Single Line)

**Paling aman, pasti tidak ada error formatting:**

**Copy paste baris ini:**

```
{"userId":"e914e98a-d34c-4710-9dd2-f2f602a96379","title":"Test Manual FCM","message":"Testing notifikasi dari Supabase Dashboard","type":"test"}
```

**Steps:**
1. Copy baris di atas (Ctrl+C)
2. Paste di Request Body (Ctrl+V)
3. Send Request
4. Done!

---

## 📸 Screenshot yang Perlu Dikirim

Setelah berhasil send (no JSON error):

1. Screenshot Request Body (showing complete JSON)
2. Screenshot Response (success atau error dari FCM)
3. Info: apakah notifikasi muncul di device?

---

**Try Option 3 (single line) - paling gampang dan pasti work! 🎯**
