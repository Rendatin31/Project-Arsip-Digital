# Fix: Super Admin Tidak Bisa Menghapus File Storage User Lain

## Masalah
User B (super_admin) tidak bisa menghapus file di Supabase Storage yang diupload oleh User A karena **RLS (Row Level Security) Policy** di storage.

Error message: 
```
Gagal menghapus arsip: function storage.delete_object(unknown, text) does not exist
```

## Penyebab
Storage RLS policy default hanya mengizinkan user menghapus file mereka sendiri, tidak termasuk super_admin atau admin.

## ✅ SOLUSI: Update RLS Policy

**Cara:**
1. Buka **Supabase Dashboard** → **SQL Editor**
2. Copy semua isi file `fix-storage-delete-policy.sql`
3. Paste dan **Run** SQL tersebut
4. Policy akan diupdate agar super_admin & admin bisa delete file siapa saja

**File SQL:** `fix-storage-delete-policy.sql`

### Apa yang dilakukan SQL ini?

1. **Drop** policy lama yang membatasi delete
2. **Create** policy baru yang membolehkan:
   - ✅ User menghapus file sendiri (owner)
   - ✅ Super Admin menghapus file siapa saja
   - ✅ Admin menghapus file siapa saja
   - ❌ Editor/Viewer tidak bisa hapus file user lain

### Policy Logic:
```sql
bucket_id = 'documents' AND (
  owner = auth.uid()  -- User bisa hapus file sendiri
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('super_admin', 'admin')
    AND status = 'Aktif'
  )  -- Super Admin & Admin bisa hapus file siapa saja
)
```

---

## Verifikasi

Setelah menjalankan SQL:

1. **Test Delete:**
   - Login sebagai User A
   - Upload dokumen
   - Logout
   - Login sebagai Super Admin (User B)
   - Hapus dokumen User A
   - ✅ File harus terhapus dari storage dan database

2. **Check Logs:**
   - Buka Browser Console (F12)
   - Lihat log "✅ File deleted from storage successfully"
   - Jika sukses, tidak ada error di console

3. **Verify di Supabase:**
   - Go to **Storage → documents bucket**
   - Check file sudah tidak ada

---

## ⚠️ Catatan Penting

### Database Trigger TIDAK Bisa Digunakan
Function `storage.delete_object()` tidak tersedia di Supabase, jadi kita **HARUS gunakan RLS Policy** approach.

File `create-auto-delete-storage-trigger.sql` **JANGAN DIGUNAKAN** karena akan error.

---

## ⚠️ Catatan Penting

### Database Trigger TIDAK Bisa Digunakan
Function `storage.delete_object()` tidak tersedia di Supabase, jadi kita **HARUS gunakan RLS Policy** approach.

File `create-auto-delete-storage-trigger.sql` **JANGAN DIGUNAKAN** karena akan error.

---

## Troubleshooting

### Jika file masih tidak terhapus setelah run SQL:

1. **Check apakah policy sudah aktif:**
   ```sql
   SELECT policyname, cmd, qual
   FROM pg_policies
   WHERE schemaname = 'storage' 
     AND tablename = 'objects'
     AND cmd = 'DELETE';
   ```
   Harus ada policy "Allow users to delete own files or admins to delete any files"

2. **Check role user di profiles table:**
   ```sql
   SELECT id, full_name, email, role, status
   FROM public.profiles
   WHERE role IN ('super_admin', 'admin');
   ```
   Pastikan role adalah `super_admin` atau `admin` dan status `Aktif`

3. **Test delete manual di Storage:**
   - Login sebagai super_admin
   - Go to Supabase Dashboard → Storage → documents
   - Try delete file manually
   - Jika bisa delete manual tapi tidak bisa dari app, berarti ada issue di frontend code

4. **Check Browser Console untuk detail error:**
   - Tekan F12
   - Go to Console tab
   - Delete file dari app
   - Lihat error message detail

### Jika tetap error "permission denied":

Run SQL ini untuk grant lebih banyak permission:
```sql
-- Give broader delete permission
DROP POLICY IF EXISTS "Allow users to delete own files or admins to delete any files" ON storage.objects;

CREATE POLICY "Admins can delete any file in documents bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (
    auth.uid()::text = owner::text
    OR
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role IN ('super_admin', 'admin')
    )
  )
);
```

---

## Manual Cleanup Orphaned Files

Jika ada file yang tertinggal di storage (database record sudah dihapus tapi file masih ada):

1. Go to **Supabase Dashboard → Storage → documents bucket**
2. List semua files
3. Check di database apakah ada record dengan file_path tersebut:
   ```sql
   SELECT * FROM documents WHERE file_path = 'path/to/file.pdf';
   ```
4. Jika tidak ada record, delete file manual dari storage

---

## Testing Script

Untuk test apakah policy sudah bekerja, run test ini:

```sql
-- As Super Admin, check if you can see all storage objects
SELECT * FROM storage.objects 
WHERE bucket_id = 'documents' 
LIMIT 10;

-- Check your own user info
SELECT 
  auth.uid() as my_user_id,
  p.role as my_role,
  p.status as my_status
FROM public.profiles p
WHERE p.id = auth.uid();
```

---

## Notes

- Frontend code sudah handle error dengan baik
- Jika storage delete gagal, database record tetap dihapus dan user diberi warning
- Super admin dan admin akan bisa delete file setelah RLS policy diupdate
- Editor dan Viewer tetap hanya bisa delete file mereka sendiri
