# Fix: Loading Memproses Tanpa Pesan Error

## Masalah

User dengan status "Non-aktif" mencoba login:
- Tombol "Masuk" berubah jadi "Memproses..."
- Loading tidak berhenti
- Tidak ada pesan error yang muncul
- Di console ada error:
  - `406 Not Acceptable` untuk GET profiles
  - `401 Unauthorized` untuk POST audit_logs

## Penyebab

### Error 1: 406 Not Acceptable (profiles)
```
GET /rest/v1/profiles?select=*&id=eq.xxx 406 (Not Acceptable)
```

**Penyebab:** RLS (Row Level Security) policy untuk tabel `profiles` tidak mengizinkan user membaca profile sendiri saat login.

### Error 2: 401 Unauthorized (audit_logs)
```
POST /rest/v1/audit_logs 401 (Unauthorized)
new row violates row-level security policy for table "audit_logs"
```

**Penyebab:** RLS policy untuk tabel `audit_logs` tidak mengizinkan insert saat login.

### Error 3: Code Tidak Handle Error dengan Baik
Code LoginPage.jsx tidak menangani error dengan baik:
- Jika query profiles gagal → code throw error
- Loading tidak berhenti
- Error message tidak ditampilkan

## Solusi

### 1. Perbaiki Code Error Handling (LoginPage.jsx)

**SEBELUM:**
```javascript
const profileResponse = await supabase
  .from('profiles')
  .select('*')
  .eq('id', data.user.id)
  .single();

// Jika query gagal, code di bawah tidak jalan
if (profileResponse.data && profileResponse.data.status === 'Non-aktif') {
  // ...
}
```

**SESUDAH:**
```javascript
let statusCheck = null;
try {
  const profileResponse = await supabase
    .from('profiles')
    .select('status')
    .eq('id', data.user.id)
    .single();

  statusCheck = profileResponse.data?.status;

  if (statusCheck === 'Non-aktif') {
    await supabase.auth.signOut();
    setError('Akun Anda telah dinonaktifkan...');
    // Reset button
    return;
  }
} catch (profileErr) {
  console.warn('Error checking profile, allowing login:', profileErr);
  // Fallback: jika gagal check, tetap lanjutkan login
}

// Audit log juga di-wrap try-catch
try {
  await supabase.from('audit_logs').insert({...});
} catch (auditErr) {
  console.warn('Error audit log:', auditErr);
  // Jangan blokir login jika audit log gagal
}

onLogin?.(); // Tetap panggil jika tidak ada masalah
```

**Key Changes:**
- ✅ Wrap profile check dalam try-catch
- ✅ Wrap audit log dalam try-catch terpisah
- ✅ Jika query gagal, tetap lanjutkan login (fallback)
- ✅ Hanya blokir login jika status EXPLICITLY "Non-aktif"
- ✅ Button state direset dengan benar

### 2. Fix RLS Policy untuk Profiles

**File:** `supabase-fix-profiles-read-rls.sql`

```sql
-- Allow user membaca profile sendiri
CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);
```

**Kenapa diperlukan:**
- Saat login, user perlu membaca profile sendiri untuk check status
- RLS policy sebelumnya mungkin terlalu restrictive
- User harus bisa SELECT profile sendiri dengan `auth.uid() = id`

### 3. Optional: Fix RLS untuk Audit Logs

Jika ingin audit log berfungsi (opsional karena sudah di-wrap try-catch):

```sql
CREATE POLICY "Users can insert own audit logs"
ON audit_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

## Langkah Implementasi

### Step 1: Update Code (SUDAH SELESAI ✅)
- File `LoginPage.jsx` sudah diupdate
- Error handling sudah diperbaiki
- Button state handling sudah benar

### Step 2: Fix RLS Policy (PERLU DIJALANKAN ⚠️)

1. Buka **Supabase Dashboard** → **SQL Editor**
2. Copy-paste isi file: `supabase-fix-profiles-read-rls.sql`
3. Klik **RUN**
4. Verifikasi: "Success. No rows returned"

```sql
-- Run this in Supabase SQL Editor
CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);
```

### Step 3: Testing

**Test Case 1: User dengan Status "Non-aktif"**
```
1. Login dengan user status "Non-aktif"
2. Expected:
   - ✅ Loading berhenti
   - ✅ Muncul error: "Akun Anda telah dinonaktifkan..."
   - ✅ Button kembali normal "Masuk"
   - ✅ User tetap di login page
```

**Test Case 2: User dengan Status "Aktif"**
```
1. Login dengan user status "Aktif"
2. Expected:
   - ✅ Loading → Success
   - ✅ Masuk ke dashboard
   - ✅ No error
```

**Test Case 3: User Tanpa Profile di Table**
```
1. Login dengan user yang belum ada di profiles table
2. Expected:
   - ✅ Login tetap berhasil (fallback)
   - ⚠️ Console log: "Error checking profile, allowing login"
```

## Behavior Baru

### Fallback Strategy
Jika ada error saat check profile:
- ✅ **Tidak blokir login** (backward compatibility)
- ✅ Log warning di console
- ✅ User tetap bisa masuk

### Explicit Blocking
Hanya blokir login jika:
- ✅ Query profiles berhasil
- ✅ Status = "Non-aktif" (exact match)
- ✅ Muncul error message
- ✅ User logout + tetap di login page

## Error Handling Matrix

| Scenario | Query Profiles | Status | Behavior |
|----------|----------------|--------|----------|
| Happy path | ✅ Success | "Aktif" | ✅ Login |
| Non-aktif | ✅ Success | "Non-aktif" | ❌ Block + Error |
| RLS error | ❌ 406 Error | - | ✅ Login (fallback) |
| Network error | ❌ Timeout | - | ✅ Login (fallback) |
| No profile | ❌ No data | - | ✅ Login (fallback) |

## Files Modified

1. ✅ `src/components/LoginPage.jsx`
   - Better error handling
   - Graceful fallback
   - Proper button state management

2. ✅ `supabase-fix-profiles-read-rls.sql`
   - Fix RLS policy untuk SELECT profiles

3. ✅ `FIX_LOGIN_LOADING_ISSUE.md`
   - Dokumentasi (this file)

## Deployment Checklist

- [x] Code updated
- [x] Error handling improved
- [ ] RLS policy fixed (run SQL)
- [ ] Testing completed
- [ ] Ready for production

## Related Issues

- Error 406: RLS policy terlalu restrictive
- Error 401: Audit log RLS policy
- Loading stuck: Code tidak handle error
- No error message: Try-catch tidak ada

## Prevention

Untuk mencegah issue serupa:
1. ✅ Selalu wrap database query dalam try-catch
2. ✅ Berikan fallback behavior yang reasonable
3. ✅ Test dengan RLS enabled
4. ✅ Log error untuk debugging
5. ✅ Reset UI state di semua code path
