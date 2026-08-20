# Fix: Error Delete Dokumen - storage.delete_object does not exist

## 🚨 ERROR MESSAGE
```
Gagal Menghapus
Gagal menghapus arsip: function storage.delete_object(unknown, text) does not exist
```

**Data di aplikasi tetap ada tapi dokumen sudah terhapus di Supabase.**

---

## 🔍 PENYEBAB

Ada **broken database trigger** yang mencoba memanggil function yang tidak tersedia di Supabase.

---

## ✅ SOLUSI (2 LANGKAH)

### STEP 1: Remove Broken Trigger ⚠️ **WAJIB DIJALANKAN DULU!**

**File:** `remove-broken-trigger.sql`

**Cara:**
1. Buka **Supabase Dashboard → SQL Editor**
2. Copy & paste SQL ini:

```sql
-- Remove broken trigger
DROP TRIGGER IF EXISTS trigger_auto_delete_document_file ON public.documents;
DROP FUNCTION IF EXISTS auto_delete_document_file();
```

3. Klik **Run**
4. Trigger yang error akan dihapus ✅

---

### STEP 2: Update RLS Policy Storage

**File:** `fix-storage-delete-policy.sql`

**Cara:**
1. Buka **Supabase Dashboard → SQL Editor**
2. Copy & paste SQL ini:

```sql
-- Drop existing delete policy
DROP POLICY IF EXISTS "Allow authenticated users to delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own files or admins to delete any files" ON storage.objects;

-- Create new policy: Allow super_admin & admin to delete any files
CREATE POLICY "Allow users to delete own files or admins to delete any files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (
    auth.uid()::text = owner::text  -- User bisa delete file sendiri
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin')
      AND profiles.status = 'Aktif'
    )  -- Super Admin & Admin bisa delete file siapa saja
  )
);
```

3. Klik **Run**
4. Policy akan diupdate ✅

---

## 📋 CHECKLIST

- [ ] **Step 1:** Run `remove-broken-trigger.sql` ✅
- [ ] **Step 2:** Run `fix-storage-delete-policy.sql` ✅
- [ ] **Step 3:** Refresh halaman aplikasi (Ctrl + F5)
- [ ] **Step 4:** Test delete dokumen sebagai super_admin
- [ ] **Step 5:** Verify file terhapus dari storage & database

---

## 🧪 TESTING

**Scenario:**
1. Login sebagai **User A** (editor/viewer)
2. Upload dokumen baru
3. Logout
4. Login sebagai **Super Admin** (User B)
5. Delete dokumen User A
6. ✅ **Result:** File harus terhapus dari storage & database, tidak ada error

---

## 🐛 TROUBLESHOOTING

### Masalah: Masih ada error setelah run SQL

**Cek apakah trigger sudah dihapus:**
```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'documents';
```
Pastikan tidak ada `trigger_auto_delete_document_file` di hasil query.

### Masalah: File tetap tidak bisa dihapus dari storage

**Cek policy storage:**
```sql
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND cmd = 'DELETE';
```
Harus ada policy: `"Allow users to delete own files or admins to delete any files"`

### Masalah: Data di frontend tidak refresh

1. Hard refresh browser: **Ctrl + Shift + R** (Windows) atau **Cmd + Shift + R** (Mac)
2. Clear cache browser
3. Logout dan login kembali

---

## 📝 NOTES

- ✅ Frontend code sudah handle delete storage dengan benar
- ✅ Error handling sudah ada di code
- ✅ Setelah fix trigger & policy, delete akan bekerja normal
- ⚠️ JANGAN gunakan `create-auto-delete-storage-trigger.sql` lagi (akan error)

---

## 📞 SUPPORT

Jika masih ada masalah setelah mengikuti semua langkah:
1. Check browser console (F12) untuk error detail
2. Check Supabase logs di Dashboard
3. Verify user role di database: `SELECT role FROM profiles WHERE id = auth.uid();`
