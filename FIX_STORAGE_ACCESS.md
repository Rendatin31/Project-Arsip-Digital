# 🔧 Fix Storage Access Error "Object not found"

## 🎯 Masalah

**Error:** "Gagal memuat preview: Object not found"

**Penyebab:** 
- User A upload file ✅
- User B coba buka file ❌ (RLS policy block)

**Root Cause:** Storage RLS policies terlalu restrictive

---

## ✅ Solusi: Jalankan SQL Script

### **Langkah Cepat:**

1. **Buka Supabase Dashboard**
   ```
   https://supabase.com/dashboard
   ```

2. **Klik SQL Editor**

3. **Copy-paste script** dari file: `supabase-fix-storage-rls.sql`

4. **Klik RUN** atau tekan `Ctrl + Enter`

5. **Check result:** Harus muncul "Success" ✅

6. **Test:**
   - Login sebagai User A
   - Upload file baru
   - Set status = PUBLISHED
   - Login sebagai User B
   - Buka file → Preview harus work! ✅

---

## 📋 Yang Dilakukan Script

### **1. Drop Old Policies**
Hapus policies lama yang terlalu restrictive

### **2. Create New Policies**

**Policy INSERT:** Users bisa upload file
```sql
authenticated users → dapat upload ke bucket 'documents'
```

**Policy SELECT:** Users bisa baca SEMUA file ✅
```sql
authenticated users → dapat read semua file di bucket
```
⚠️ **Ini yang penting!** Memungkinkan User B baca file User A

**Policy UPDATE:** Users hanya update file sendiri
```sql
owner only → dapat update file milik sendiri
```

**Policy DELETE:** Users hanya delete file sendiri
```sql
owner only → dapat delete file milik sendiri
```

### **3. Bucket Configuration**
Pastikan bucket 'documents' exist dengan setting yang benar

---

## 🔍 Konsep RLS Storage

### **Sebelum Fix:**
```
User A upload → File path: a123/document.pdf
User B akses → RLS check: "Apakah User B = owner?"
              → NO → BLOCK → "Object not found" ❌
```

### **Setelah Fix:**
```
User A upload → File path: a123/document.pdf
User B akses → RLS check: "Apakah User B authenticated?"
              → YES → ALLOW → Preview muncul ✅
```

### **Security:**
- ✅ Tetap aman karena butuh authentication
- ✅ Filtering dokumen by status di application level
- ✅ Only owner bisa update/delete
- ✅ All authenticated users bisa read (untuk sharing)

---

## 🧪 Testing

### **Test Case 1: User A Upload → User B Baca**

**User A:**
1. Login sebagai User A
2. Upload file "Report.pdf"
3. Set status = PUBLISHED
4. Logout

**User B:**
1. Login sebagai User B
2. Buka halaman "Direktori Arsip"
3. Cari file "Report.pdf"
4. Klik icon preview (👁️)
5. **Expected:** Preview muncul ✅

### **Test Case 2: Private Document**

**User A:**
1. Upload file "Private.pdf"
2. Set status = PRIVATE

**User B:**
1. Cek halaman "Direktori Arsip"
2. **Expected:** File "Private.pdf" TIDAK muncul di list ✅
   (Filtered di query, bukan di storage)

### **Test Case 3: Delete Protection**

**User B:**
1. Coba delete file "Report.pdf" (milik User A)
2. **Expected:** Error permission denied ✅
   (Policy DELETE hanya allow owner)

---

## ⚠️ Catatan Penting

### **1. Security Model**

**Storage Level (RLS):**
- All authenticated users bisa READ
- Only owner bisa UPDATE/DELETE

**Application Level (Query):**
- Filter berdasarkan status (PUBLISHED/PRIVATE)
- Filter berdasarkan role (admin/editor/viewer)
- Kontrol visibility di UI

### **2. File Organization**

Path format: `{user_id}/{filename}`
```
documents/
├── a123-user-id-1/
│   ├── document1.pdf
│   └── document2.pdf
├── b456-user-id-2/
│   ├── report.pdf
│   └── photo.jpg
```

Owner detection: Ambil folder pertama dari path

### **3. Alternative: Strict Mode**

Jika butuh hanya owner yang bisa baca (tidak ada sharing):

```sql
-- Change SELECT policy
CREATE POLICY "Users can only read their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

⚠️ **Tapi ini akan break sharing feature!**

---

## 🔧 Troubleshooting

### **Error: "Object not found" masih muncul**

**Check 1:** Verify policies sudah apply
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage';
```

Expected result: 4 policies (INSERT, SELECT, UPDATE, DELETE)

**Check 2:** Verify bucket setting
```sql
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'documents';
```

Expected: `public = false` (private bucket)

**Check 3:** Hard refresh browser
- Ctrl + Shift + R (Windows)
- Cmd + Shift + R (Mac)

**Check 4:** Re-login
- Logout dari aplikasi
- Login lagi
- Test preview

### **Error: "Policy already exists"**

Script sudah DROP policies di awal. Jika masih error:
```sql
-- Manual drop all
DROP POLICY IF EXISTS "policy_name" ON storage.objects;
```

Lalu run script lagi.

### **File tetap tidak bisa dibuka**

**Check path file:**
```sql
-- Check files di storage
SELECT name, owner 
FROM storage.objects 
WHERE bucket_id = 'documents'
LIMIT 10;
```

Pastikan path format: `{user_id}/{filename}`

---

## ✅ Checklist

- [ ] Buka Supabase Dashboard
- [ ] SQL Editor
- [ ] Copy-paste script `supabase-fix-storage-rls.sql`
- [ ] Run script
- [ ] Verify success
- [ ] Test User A upload file
- [ ] Test User B preview file
- [ ] Verify preview works ✅

---

## 📚 Reference

- File SQL: `supabase-fix-storage-rls.sql`
- Supabase Storage RLS: https://supabase.com/docs/guides/storage/security/access-control
- Testing guide: Bagian Testing di atas

