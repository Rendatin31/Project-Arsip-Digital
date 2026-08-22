# 🔧 Fix: Friendly Error Messages

## 🐛 Masalah

**User Report:** 
- Login dengan internet buruk/terputus → Alert text merah dengan error code panjang
- Upload/Update/Delete dokumen dengan jaringan buruk → Alert text merah dengan error code
- User bingung karena error message technical dan tidak jelas

**Contoh Error Technical:**
```
Error: FetchError: request to https://... failed, reason: connect ETIMEDOUT
{message: "Failed to fetch", stack: "Error: Failed...", code: "ERR_NETWORK"}
new row violates row-level security policy for table "documents"
```

---

## ✅ Solusi: Error Handler Utility

Created `src/utils/errorHandler.js` dengan functions:

### 1. **`handleError(error, action)`**
Convert technical errors jadi user-friendly messages.

**Actions supported:**
- `login` - Error saat login
- `upload` / `add` - Error saat upload dokumen
- `update` / `edit` - Error saat update dokumen
- `delete` / `remove` - Error saat hapus dokumen
- `download` - Error saat download dokumen

### 2. **`isNetworkError(error)`**
Detect if error is network-related.

### 3. **`getFriendlyErrorMessage(error, action)`**
Get friendly message based on error type.

### 4. **`checkNetworkConnectivity()`**
Check if device actually has internet.

---

## 🎯 Error Message Mapping

| Technical Error | Friendly Message |
|-----------------|------------------|
| `fetch failed` | ⚠️ Koneksi internet bermasalah. Silakan coba lagi dalam beberapa saat. |
| `network timeout` | Koneksi timeout. Jaringan Anda mungkin lambat. Silakan coba lagi. |
| `navigator.onLine = false` | ⚠️ Tidak ada koneksi internet. Silakan periksa jaringan Anda dan coba lagi. |
| `Invalid login credentials` | Email atau password salah. Silakan coba lagi. |
| `JWT expired` | Sesi Anda telah berakhir. Silakan login kembali. |
| `row-level security` | Anda tidak memiliki izin untuk melakukan operasi ini. |
| `file too large` | Ukuran file terlalu besar. Maksimal 10MB. |
| Generic network error | Gagal [action]. Periksa koneksi internet Anda. |

---

## 📝 Files Updated

### 1. ✅ **`src/utils/errorHandler.js`** (NEW)
- Utility functions untuk handle errors
- Network detection
- Friendly message mapping
- Retry with backoff (optional)

### 2. ✅ **`src/components/LoginPage.jsx`**
**Before:**
```javascript
setError(authError.message || 'Login gagal');
setError('Terjadi kesalahan koneksi');
```

**After:**
```javascript
import { handleError } from '../utils/errorHandler';

setError(handleError(authError, 'login'));
setError(handleError(err, 'login'));
```

### 3. ✅ **`src/components/AddDocumentModal.jsx`**
**Before:**
```javascript
setError('Gagal mengunggah file: ' + uploadError.message);
setError('Gagal menyimpan data arsip: ' + insertError.message);
```

**After:**
```javascript
import { handleError } from '../utils/errorHandler';

setError(handleError(uploadError, 'upload'));
setError(handleError(insertError, 'upload'));
setError(handleError(err, 'upload'));
```

### 4. ✅ **`src/components/EditDocumentModal.jsx`**
**Before:**
```javascript
setError('Gagal mengunggah file: ' + uploadError.message);
setError('Gagal memperbarui arsip: ' + updateError.message);
```

**After:**
```javascript
import { handleError } from '../utils/errorHandler';

setError(handleError(uploadError, 'upload'));
setError(handleError(updateError, 'update'));
setError(handleError(err, 'update'));
```

### 5. ✅ **`src/components/FileTable.jsx`**
**Before:**
```javascript
alert('Gagal mengubah nama file: ' + err.message);
alert('Gagal mengunduh file: ' + error?.message);
// No error message for delete
```

**After:**
```javascript
import { handleError } from '../utils/errorHandler';

alert(handleError(err, 'update'));
alert(handleError(error, 'download'));
alert(handleError(err, 'delete'));
```

---

## 🎯 User Experience Improvement

### Before:
```
❌ User tries to login offline:
"Error: FetchError: request to https://axpanhequppcviaimwte.supabase.co/auth/v1/token?grant_type=password failed, reason: connect ETIMEDOUT"

❌ User uploads document with bad network:
"Gagal menyimpan data arsip: {\"code\":\"PGRST301\",\"details\":\"Searched for a row with PK=a83f7382-d2ac-4ed6-8b45-5c9fb5bb5d19 in \\\"documents\\\" but it does not exist.\",\"hint\":null,\"message\":\"new row violates row-level security policy for table \\\"documents\\\"\"}"

❌ User deletes document offline:
"Error: {message: 'Failed to fetch', stack: 'TypeError: Failed to fetch...'}"
```

### After:
```
✅ User tries to login offline:
"⚠️ Tidak ada koneksi internet. Silakan periksa jaringan Anda dan coba lagi."

✅ User uploads document with bad network:
"⚠️ Koneksi internet bermasalahan. Silakan coba lagi dalam beberapa saat."

✅ User deletes document offline:
"⚠️ Tidak ada koneksi internet. Silakan periksa jaringan Anda dan coba lagi."

✅ User enters wrong password:
"Email atau password salah. Silakan coba lagi."

✅ User session expired:
"Sesi Anda telah berakhir. Silakan login kembali."
```

---

## 🔧 Technical Details

### Error Detection Logic:

```javascript
function isNetworkError(error) {
  const patterns = [
    'fetch', 'network', 'timeout', 
    'connection', 'offline', 'unreachable',
    'enotfound', 'econnrefused', 'etimedout'
  ];
  
  return patterns.some(pattern => 
    error.toString().toLowerCase().includes(pattern)
  );
}
```

### Offline Detection:

```javascript
// Check navigator.onLine
if (!navigator.onLine) {
  return '⚠️ Tidak ada koneksi internet...';
}

// Network error patterns
if (isNetworkError(error)) {
  return '⚠️ Koneksi internet bermasalah...';
}
```

### Action-Specific Messages:

```javascript
if (action === 'login') {
  return 'Gagal login. Periksa koneksi internet Anda...';
}

if (action === 'upload') {
  return 'Gagal mengunggah dokumen. Periksa koneksi...';
}

if (action === 'delete') {
  return 'Gagal menghapus dokumen. Periksa koneksi...';
}
```

---

## ✅ Testing Scenarios

### Test 1: Login Offline
1. Matikan internet
2. Try login
3. **Expected:** "⚠️ Tidak ada koneksi internet. Silakan periksa jaringan Anda dan coba lagi."

### Test 2: Login with Wrong Password
1. Online
2. Enter wrong password
3. **Expected:** "Email atau password salah. Silakan coba lagi."

### Test 3: Upload Document Offline
1. Matikan internet
2. Try upload document
3. **Expected:** "⚠️ Tidak ada koneksi internet..."

### Test 4: Upload Document with Slow Network
1. Set network to 2G
2. Try upload large file
3. **Expected:** "⚠️ Koneksi internet bermasalah. Silakan coba lagi dalam beberapa saat."

### Test 5: Delete Document Offline
1. Matikan internet
2. Try delete document
3. **Expected:** "⚠️ Tidak ada koneksi internet..."

### Test 6: Download Document with Network Error
1. Slow/unstable network
2. Try download
3. **Expected:** "Gagal mengunduh dokumen. Periksa koneksi internet Anda."

---

## 🎯 Benefits

| Aspect | Before | After |
|--------|--------|-------|
| **Error Messages** | ❌ Technical codes | ✅ User-friendly |
| **User Understanding** | ❌ Confusing | ✅ Clear |
| **Network Detection** | ❌ No | ✅ Yes (offline banner + friendly message) |
| **Action Context** | ❌ Generic | ✅ Specific (login, upload, etc.) |
| **User Confidence** | ❌ "Apa yang salah?" | ✅ "Oh, internet bermasalah!" |

---

## 📦 Build APK

```powershell
npm run build
npx cap sync android
npx cap open android
```

**Test dengan:**
1. ✅ Offline mode
2. ✅ Slow network (2G/3G)
3. ✅ Wrong credentials
4. ✅ Permission errors

---

## 🔄 Optional: Retry Logic

ErrorHandler also includes `retryWithBackoff` for automatic retry:

```javascript
import { retryWithBackoff } from '../utils/errorHandler';

// Retry up to 3 times with exponential backoff
const result = await retryWithBackoff(async () => {
  return await supabase.from('documents').select();
}, 3, 1000);
```

**Behavior:**
- Attempt 1: Immediate
- Attempt 2: After 1 second
- Attempt 3: After 2 seconds
- Attempt 4: After 4 seconds

---

## 📝 Summary

**Created:**
- ✅ `src/utils/errorHandler.js` - Error handling utility

**Updated:**
- ✅ `src/components/LoginPage.jsx`
- ✅ `src/components/AddDocumentModal.jsx`
- ✅ `src/components/EditDocumentModal.jsx`
- ✅ `src/components/FileTable.jsx`

**Result:**
- ✅ No more technical error codes shown to users
- ✅ Friendly, actionable error messages
- ✅ Better UX for offline/slow network scenarios
- ✅ Context-aware messages (login, upload, delete, etc.)

---

**Status: Fixed! ✅**

**User akan melihat pesan yang jelas dan mudah dimengerti, bukan error code technical!**

**Rebuild APK untuk test!** 🚀
