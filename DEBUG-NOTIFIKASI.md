# DEBUG SISTEM NOTIFIKASI

## Langkah-langkah Debug

### 1. Pastikan Tabel Sudah Dibuat
Jalankan di Supabase SQL Editor:
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'notification_preferences'
) AS table_exists;
```
**Hasil yang diharapkan**: `table_exists: true`

---

### 2. Cek Data Preferensi User
Jalankan di Supabase SQL Editor:
```sql
SELECT 
  np.*,
  p.full_name,
  p.role
FROM notification_preferences np
LEFT JOIN profiles p ON p.id = np.user_id
ORDER BY p.full_name;
```
**Yang harus dicek**:
- Apakah ada data untuk user Anda?
- Apakah nilai `document_upload` dan `document_update` sesuai dengan yang Anda set?

---

### 3. Test di Browser Console

#### A. Buka halaman Pengaturan → Tab Notifikasi
1. Buka Developer Tools (F12)
2. Tab Console
3. Nonaktifkan toggle "Upload Dokumen"
4. Klik "Simpan Perubahan"
5. **Cek console output:**
   ```
   Saving notification preferences for user: [user-id]
   Preferences to save: { document_upload: false, ... }
   Updating existing preferences (atau Inserting new preferences)
   Saved preferences verified: { document_upload: false, ... }
   ```

#### B. Test Upload Dokumen
1. Login sebagai User A
2. Buka Pengaturan → Notifikasi
3. **Nonaktifkan "Upload Dokumen"**
4. Simpan
5. **Buka console (F12)**
6. Login sebagai User B (atau tab lain)
7. Upload dokumen PUBLISHED
8. **Kembali ke User A, cek console:**
   ```
   Checking notification preference for user [user-a-id], type: upload
   Preferences found for user [user-a-id]: { document_upload: false, ... }
   User [user-a-id] preference for upload (document_upload): false
   Notification skipped for user [user-a-id]: upload notification is disabled
   ```
9. **Cek bell icon** → Tidak ada notifikasi upload

---

### 4. Troubleshooting

#### Masalah: Preferensi tidak tersimpan
**Solusi:**
```sql
-- Cek apakah tabel ada
SELECT tablename FROM pg_tables WHERE tablename = 'notification_preferences';

-- Jika tidak ada, jalankan create-notification-preferences-table.sql
```

#### Masalah: Notifikasi tetap masuk
**Cek di console browser:**
1. Apakah ada log "Checking notification preference..."?
   - **TIDAK** → Kode belum ter-update, refresh browser (Ctrl+Shift+R)
   - **YA** → Lanjut ke step 2

2. Apakah ada log "Preferences found..."?
   - **TIDAK** → Data preferensi tidak ada di database
   - **YA** → Cek nilai field yang di-log

3. Apakah nilai field sesuai?
   - Jika `document_upload: true` padahal sudah dinonaktifkan → Data tidak tersimpan dengan benar
   - Jika `document_upload: false` tapi notifikasi masuk → Ada bug di logika

#### Masalah: RLS Policy Error
**Solusi:**
```sql
-- Cek policies
SELECT * FROM pg_policies WHERE tablename = 'notification_preferences';

-- Jika ada error, jalankan ulang create-notification-preferences-table.sql
```

---

### 5. Manual Test Query

#### Test 1: Insert Preferensi Manual
```sql
-- Ganti USER_ID dengan user_id Anda
INSERT INTO notification_preferences (
  user_id,
  document_upload,
  document_update
) VALUES (
  'USER_ID_HERE',
  false,
  false
)
ON CONFLICT (user_id) DO UPDATE SET
  document_upload = false,
  document_update = false,
  updated_at = now();
```

#### Test 2: Cek Preferensi Tersimpan
```sql
SELECT * FROM notification_preferences WHERE user_id = 'USER_ID_HERE';
```

#### Test 3: Lihat Notifikasi Terakhir
```sql
SELECT 
  n.type,
  n.title,
  n.message,
  n.created_at,
  p.full_name
FROM notifications n
LEFT JOIN profiles p ON p.id = n.user_id
WHERE n.user_id = 'USER_ID_HERE'
ORDER BY n.created_at DESC
LIMIT 10;
```

---

### 6. Reset Semua Preferensi (Emergency)

```sql
-- Hapus semua preferensi
DELETE FROM notification_preferences;

-- Atau reset ke default
UPDATE notification_preferences
SET 
  document_upload = true,
  document_update = true,
  security_alert = true,
  system_update = false,
  weekly_report = true,
  updated_at = now();
```

---

## Checklist Debugging

- [ ] Tabel `notification_preferences` sudah dibuat
- [ ] SQL `create-notification-function.sql` sudah dijalankan
- [ ] SQL `create-notification-preferences-table.sql` sudah dijalankan
- [ ] Browser sudah di-refresh (Ctrl+Shift+R)
- [ ] Data preferensi tersimpan di database (cek via SQL)
- [ ] Console log muncul saat save preferensi
- [ ] Console log muncul saat cek preferensi
- [ ] Nilai preferensi di log sesuai dengan yang di-set

---

## Expected Console Output

### Saat Save Preferensi:
```
Saving notification preferences for user: abc-123-def
Preferences to save: {
  user_id: "abc-123-def",
  email_notifications: true,
  document_upload: false,  ← DISABLED
  document_update: true,
  security_alert: true,
  system_update: false,
  weekly_report: true
}
Updating existing preferences
Saved preferences verified: { document_upload: false, ... }
```

### Saat Upload Dokumen (User A disabled, User B enabled):
```
Checking notification preference for user abc-123-def, type: upload
Preferences found for user abc-123-def: { document_upload: false, ... }
User abc-123-def preference for upload (document_upload): false
Notification skipped for user abc-123-def: upload notification is disabled

Checking notification preference for user xyz-456-ghi, type: upload
Preferences found for user xyz-456-ghi: { document_upload: true, ... }
User xyz-456-ghi preference for upload (document_upload): true
Notification created: {...}
```
