# Notification Avatar Changes - Summary

## 🎯 Tujuan Perubahan

1. **Tampilkan foto profil user yang sebenarnya** di notifikasi (bukan icon person default)
2. **Hapus border abu-abu** di icon person default
3. **Beda tampilan** antara notifikasi system vs user actions

---

## ✅ Perubahan yang Dibuat

### 1. Database Changes

**File:** `add-creator-to-notifications.sql`

```sql
-- Menambahkan 2 kolom baru ke tabel notifications
ALTER TABLE notifications 
ADD COLUMN creator_user_id uuid,
ADD COLUMN creator_avatar_url text;

-- Index untuk performa
CREATE INDEX idx_notifications_creator_user_id ON notifications(creator_user_id);
```

**File:** `update-create-notification-function.sql`

```sql
-- Update fungsi create_notification untuk menerima parameter creator
CREATE OR REPLACE FUNCTION create_notification(
  target_user_id uuid,
  notif_type text,
  notif_title text,
  notif_message text,
  creator_id uuid DEFAULT NULL,        -- ⭐ NEW
  creator_avatar text DEFAULT NULL      -- ⭐ NEW
)
...
```

### 2. Backend Changes

**File:** `src/utils/notifications.js`

**Perubahan pada `createNotification()`:**
```javascript
// Sebelum
export async function createNotification(supabase, userId, type, title, message)

// Sesudah
export async function createNotification(
  supabase, 
  userId, 
  type, 
  title, 
  message, 
  creatorUserId = null,      // ⭐ NEW
  creatorAvatarUrl = null    // ⭐ NEW
)
```

**Perubahan pada `notifyAllUsersExcept()`:**
- Auto-fetch `avatar_url` dari profiles table jika tidak diberikan
- Pass creator info ke `create_notification` RPC call
- Signature tambahan 2 parameter opsional

**Perubahan pada helper functions:**
- `notifyDocumentUpload()` - tambah param creator
- `notifyDocumentEdit()` - tambah param creator
- `notifyDocumentDelete()` - tambah param creator

### 3. Frontend Changes

**File:** `src/components/Header.jsx`

**Perubahan Avatar Display Logic:**

```jsx
// OLD - Hanya cek system vs user
{isSystemNotification ? (
  <img src="logo.jpg" />
) : (
  <span className="material-symbols-outlined">person</span>
)}

// NEW - Cek system, user with avatar, user without avatar
{isSystemNotification ? (
  // System notification → App Logo
  <img src="logo.jpg" />
) : notif.creator_avatar_url ? (
  // User WITH avatar → Real photo
  <img src={avatarUrl} onError={fallbackToPerson} />
) : (
  // User WITHOUT avatar → Person icon (NO border)
  <span className="material-symbols-outlined">person</span>
)}
```

**Perubahan CSS:**
- ❌ Hapus: `bg-gray-200` (border abu-abu)
- ✅ Kondisional background hanya untuk system notification

---

## 🔄 Flow Diagram

### Saat Upload Dokumen (AddDocumentModal.jsx)

```
User A upload dokumen
       ↓
notifyAllUsersExcept(supabase, userA.id, 'upload', ...)
       ↓
Auto-fetch userA.avatar_url dari profiles
       ↓
create_notification(userId: userB, creator_id: userA, creator_avatar: userA.avatar_url)
       ↓
Database: notifications table menyimpan creator info
       ↓
Real-time subscription trigger di App.jsx
       ↓
User B melihat notifikasi dengan foto User A
```

### Saat Tampil di Modal (Header.jsx)

```
User membuka notifikasi modal
       ↓
Fetch notifications dengan creator_avatar_url
       ↓
Loop setiap notifikasi:
  ├─ type === 'system' atau 'access'? → Tampil logo app
  ├─ creator_avatar_url ada? → Tampil foto user
  └─ creator_avatar_url tidak ada? → Tampil icon person (no border)
       ↓
Render di UI
```

---

## 📊 Perbandingan Before vs After

### BEFORE (Icon Person dengan Border)

```
┌──────────────────────────────────┐
│ ┌────┐                           │
│ │👤  │ Dokumen Baru Diunggah     │
│ │🟦  │ mahersy mengupload...     │  ← Border abu-abu
│ └────┘                           │
└──────────────────────────────────┘
```

### AFTER (Avatar User Asli, No Border)

**User dengan Avatar:**
```
┌──────────────────────────────────┐
│ ┌────┐                           │
│ │📷  │ Dokumen Baru Diunggah     │
│ │foto│ mahersy mengupload...     │  ← Foto mahersy
│ └────┘                           │
└──────────────────────────────────┘
```

**User Tanpa Avatar:**
```
┌──────────────────────────────────┐
│  👤   Dokumen Baru Diunggah      │
│       mahersy mengupload...      │  ← Icon person, NO border
│                                  │
└──────────────────────────────────┘
```

**System Notification:**
```
┌──────────────────────────────────┐
│ ┌────┐                           │
│ │🏢  │ Perubahan Hak Akses       │
│ │logo│ Role Anda diubah...       │  ← Logo app
│ └────┘                           │
└──────────────────────────────────┘
```

---

## 🚀 Deployment Checklist

- [ ] **Step 1**: Jalankan `add-creator-to-notifications.sql` di Supabase SQL Editor
- [ ] **Step 2**: Jalankan `update-create-notification-function.sql` di Supabase SQL Editor
- [ ] **Step 3**: Verify kolom baru ada di tabel notifications
- [ ] **Step 4**: Commit & push semua file ke GitHub
- [ ] **Step 5**: Tunggu Vercel auto-deploy (2-5 menit)
- [ ] **Step 6**: Hard refresh browser (Ctrl+Shift+R)
- [ ] **Step 7**: Test upload dokumen dan cek notifikasi

---

## 🧪 Test Cases

### Test 1: User dengan Avatar Upload Dokumen
1. Login sebagai user A (yang sudah upload avatar)
2. Upload dokumen baru (status PUBLISHED)
3. Login sebagai user B
4. Buka modal notifikasi
5. **Expected**: Tampil foto profil user A

### Test 2: User Baru Upload Dokumen
1. Login sebagai user baru (belum upload avatar)
2. Upload dokumen baru
3. Login sebagai user lain
4. Buka modal notifikasi
5. **Expected**: Tampil icon person (NO border abu-abu)

### Test 3: System Notification
1. Admin ubah role user
2. User yang di-update buka notifikasi
3. **Expected**: Tampil logo aplikasi (bukan person icon)

### Test 4: Notifikasi Lama (Before Update)
1. Buka notifikasi yang dibuat sebelum update
2. **Expected**: Tampil icon person default (backward compatible)

---

## 📁 Files Modified

1. ✅ `add-creator-to-notifications.sql` - ALTER TABLE
2. ✅ `update-create-notification-function.sql` - UPDATE FUNCTION
3. ✅ `src/utils/notifications.js` - Backend logic
4. ✅ `src/components/Header.jsx` - UI rendering
5. ✅ `SETUP-NOTIFICATION-AVATARS.md` - Setup guide
6. ✅ `NOTIFICATION-AVATAR-CHANGES.md` - This file

---

## 🔗 Related Documentation

- [SETUP-NOTIFICATION-AVATARS.md](./SETUP-NOTIFICATION-AVATARS.md) - Setup guide
- [ACTION-REQUIRED-FIREBASE-SETUP.md](./ACTION-REQUIRED-FIREBASE-SETUP.md) - Push notification setup

---

## 💡 Future Enhancements

1. **Fallback Avatar**: Generate initial-based avatar (A, B, C) jika user tidak upload
2. **Avatar Cache**: Cache avatar URL di localStorage untuk performa
3. **Lazy Load**: Load avatar on-demand saat scroll notifikasi
4. **Placeholder**: Tampil skeleton saat avatar loading

---

## 📞 Support

Jika ada masalah:
1. Cek browser console untuk error
2. Verify SQL sudah dijalankan di Supabase
3. Hard refresh browser (Ctrl+Shift+R)
4. Clear browser cache
5. Cek Vercel deployment logs

