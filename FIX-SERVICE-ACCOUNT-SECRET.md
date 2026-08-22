# 🔧 Fix: Service Account Secret Issue

## ❌ Problem

Edge Function error 500 - kemungkinan besar masalah di **private key format** dari Service Account JSON.

Error terjadi saat Edge Function coba:
1. Parse Service Account JSON dari secret
2. Extract private key
3. Generate OAuth2 token

---

## ✅ Solution: Re-download & Re-set Secret

### Step 1: Download Service Account JSON Baru

1. **Buka Firebase Console:**
   https://console.firebase.google.com/project/arsip-digital-26222/settings/serviceaccounts/adminsdk

2. **Klik:** "Generate new private key"

3. **Klik:** "Generate key" (confirm)

4. **File JSON akan ter-download** (nama: `arsip-digital-26222-xxxxx.json`)

5. **Save file** di folder Downloads

---

### Step 2: Minify JSON (PowerShell)

Buka PowerShell dan jalankan command ini (ganti path file jika perlu):

```powershell
# Ganti ini dengan path file Service Account JSON yang baru di-download
$jsonFile = "$env:USERPROFILE\Downloads\arsip-digital-26222-firebase-adminsdk-xxxxx.json"

# Read and minify (remove all whitespace, single line)
$json = Get-Content $jsonFile -Raw | ConvertFrom-Json | ConvertTo-Json -Compress -Depth 10

# Save minified version
$minifiedFile = "$env:USERPROFILE\Downloads\service-account-minified.json"
$json | Out-File -FilePath $minifiedFile -Encoding UTF8 -NoNewline

Write-Host "✅ Minified JSON saved to: $minifiedFile" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Minified JSON (copy this):" -ForegroundColor Cyan
Write-Host $json
```

**Copy output JSON dari PowerShell!** (semua dalam 1 baris)

---

### Step 3: Set Secret di Supabase

#### Option A: Via CLI (RECOMMENDED)

```powershell
# Login ke Supabase (jika belum)
supabase login

# Link project (jika belum)
supabase link --project-ref axpanhequppcviaimwte

# Set secret - PASTE minified JSON dari Step 2
supabase secrets set FIREBASE_SERVICE_ACCOUNT='PASTE_MINIFIED_JSON_DI_SINI'
```

**PENTING:** Ganti `PASTE_MINIFIED_JSON_DI_SINI` dengan JSON yang di-copy dari Step 2!

---

#### Option B: Manual via File

1. Buka file: `service-account-minified.json` (dari Step 2)

2. Copy **SEMUA isi** file (Ctrl+A, Ctrl+C)

3. Jalankan command ini, lalu paste JSON:

```powershell
supabase secrets set FIREBASE_SERVICE_ACCOUNT='<PASTE_JSON_DI_SINI>'
```

---

### Step 4: Verify Secret

```powershell
supabase secrets list --project-ref axpanhequppcviaimwte
```

Expected output:
```
NAME                      | DIGEST
FIREBASE_SERVICE_ACCOUNT  | [some hash]
```

DIGEST akan **berubah** karena Anda set secret baru.

---

### Step 5: Test Lagi

Jalankan test PowerShell lagi:

```powershell
$headers = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4cGFuaGVxdXBwY3ZpYWltd3RlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzIyNTg5MiwiZXhwIjoyMDk4ODAxODkyfQ.hnzrXVPNZzM5EjN8YJKgLbf7a_QjxIPI48lb8kyOX4o"
    "Content-Type" = "application/json"
}

$body = @{
    userId = "e914e98a-d34c-4710-9dd2-f2f602a96379"
    title = "Test After Fix"
    message = "Testing setelah fix Service Account"
    type = "test"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://axpanhequppcviaimwte.supabase.co/functions/v1/send-fcm-notification" -Method Post -Headers $headers -Body $body
```

---

## 🔍 Troubleshooting

### Issue: "Generate key" button disabled

**Cause:** Sudah ada maksimal keys generated

**Solution:**
1. Delete salah satu key yang lama (jika tidak dipakai)
2. Generate key baru

---

### Issue: PowerShell minify script error

**Alternative manual minify:**

1. Buka: https://jsonformatter.org/json-minify
2. Copy paste isi Service Account JSON
3. Klik "Minify"
4. Copy hasil minified (single line)
5. Use untuk set secret

---

### Issue: "Failed to set secret"

**Check:**
- Apakah Anda sudah `supabase login`?
- Apakah Anda sudah `supabase link`?
- Apakah JSON valid? (test di jsonlint.com)

---

## 💡 Why This Should Fix the Issue

**Root cause:** Private key format dalam secret mungkin corrupt atau ada karakter escape yang salah.

**Solution:** Download fresh Service Account JSON, minify properly, set sebagai secret baru.

**Expected result:** Edge Function bisa parse JSON dan generate OAuth2 token dengan benar.

---

## 📋 Quick Steps Summary

```powershell
# 1. Download Service Account JSON dari Firebase Console

# 2. Minify JSON
$json = Get-Content "path\to\downloaded\file.json" -Raw | ConvertFrom-Json | ConvertTo-Json -Compress -Depth 10

# 3. Set secret
supabase secrets set FIREBASE_SERVICE_ACCOUNT="$json"

# 4. Test
# (run PowerShell test command dari atas)
```

---

**Lakukan Step 1-5, lalu test lagi! 🚀**

**Jika masih error, screenshot detail error dari Edge Function logs!**
