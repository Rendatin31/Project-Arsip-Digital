# Setup Avatar Upload - Tab Profil

## 🎯 Fitur Avatar Upload

Upload dan manage foto profil user dengan fitur:
- ✅ Upload image (JPG, PNG, GIF, WEBP)
- ✅ Max file size: 2MB
- ✅ Preview sebelum save
- ✅ Auto delete avatar lama saat upload baru
- ✅ Hapus avatar
- ✅ Public URL (bisa diakses siapa saja)

---

## 📋 Setup Langkah-langkah

### **Step 1: Tambah Kolom ke Database**

Jalankan SQL di Supabase SQL Editor:

```sql
-- ADD BIO AND AVATAR COLUMNS
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bio text;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Verify
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name IN ('bio', 'avatar_url');
```

**Expected result:**
```
column_name | data_type
bio         | text
avatar_url  | text
```

---

### **Step 2: Create Storage Bucket**

**Opsi A: Via SQL** (Lebih cepat)
Run `create-avatars-storage-bucket.sql` di SQL Editor

**Opsi B: Via Dashboard** (Lebih mudah, recommended)
1. **Buka Supabase Dashboard**
2. **Storage** → **Create bucket**
3. **Bucket name**: `avatars`
4. **Public bucket**: ✅ **ON** (penting!)
5. **Click "Create"**

---

### **Step 3: Set Storage Policies**

Di Supabase Dashboard → Storage → avatars → **Policies**:

#### **Policy 1: Public Read**
- Name: `Avatars are publicly accessible`
- Target roles: `public`
- Operation: `SELECT`
- Policy: `(bucket_id = 'avatars')`

#### **Policy 2: Authenticated Upload**
- Name: `Users can upload their own avatar`
- Target roles: `authenticated`
- Operation: `INSERT`
- Policy:
```sql
(bucket_id = 'avatars') AND
((storage.foldername(name))[1] = (auth.uid())::text)
```

#### **Policy 3: Authenticated Update**
- Name: `Users can update their own avatar`
- Target roles: `authenticated`
- Operation: `UPDATE`
- Policy: Same as INSERT

#### **Policy 4: Authenticated Delete**
- Name: `Users can delete their own avatar`
- Target roles: `authenticated`
- Operation: `DELETE`
- Policy: Same as INSERT

---

### **Step 4: Test Upload**

1. **Login ke aplikasi**
2. **Pengaturan → Profil**
3. **Klik icon camera** pada avatar
4. **Pilih gambar** (max 2MB)
5. **Preview muncul**
6. **Klik "Simpan Perubahan"**
7. **Loading → Alert "Profil berhasil diperbarui!"**
8. **Avatar tersimpan** ✅

---

## 🎨 UI/UX

### **Avatar Display:**
- Default: Icon `person` (gray)
- With avatar: Gambar user (circular)
- Hover camera button: Hover effect

### **Upload Flow:**
```
Click camera icon
    ↓
File input opens
    ↓
Select image
    ↓
Validate (size, type)
    ↓
Show preview
    ↓
Click "Simpan Perubahan"
    ↓
Upload to storage
    ↓
Update database
    ↓
Success! ✅
```

---

## 🔒 Security

### **File Validation:**
- ✅ Max size: 2MB
- ✅ Type: image/* only
- ✅ Client-side validation

### **Storage Structure:**
```
avatars/
  ├── user-id-1/
  │   └── avatar.jpg
  ├── user-id-2/
  │   └── avatar.png
  └── user-id-3/
      └── avatar.webp
```

**Benefit:**
- Each user has own folder
- Easy to manage per-user
- Storage policies per user ID

### **Policies:**
- ✅ Public can READ (view avatars)
- ✅ Only owner can WRITE (upload/update/delete)
- ✅ Folder name must match user ID

---

## 📊 Database Schema

### **profiles table:**
```sql
avatar_url text  -- Path ke avatar di storage
                 -- Format: "avatars/{user-id}/avatar.{ext}"
                 -- Example: "avatars/abc-123/avatar.jpg"
```

### **Storage path:**
```
Storage Bucket: avatars
File Path: {user-id}/avatar.{ext}
Public URL: https://PROJECT.supabase.co/storage/v1/object/public/avatars/{user-id}/avatar.{ext}
```

---

## 🧪 Testing

### **Test 1: Upload Avatar**
1. Pilih gambar (< 2MB)
2. Preview muncul ✅
3. Simpan
4. Avatar ter-upload ✅

### **Test 2: File Terlalu Besar**
1. Pilih gambar (> 2MB)
2. Alert: "Ukuran file maksimal 2MB!" ✅
3. Tidak ter-upload

### **Test 3: Bukan Image**
1. Pilih PDF/video
2. Alert: "File harus berupa gambar!" ✅
3. Tidak ter-upload

### **Test 4: Ganti Avatar**
1. Upload avatar pertama → Berhasil
2. Upload avatar kedua → Berhasil
3. Avatar pertama terhapus otomatis ✅

### **Test 5: Hapus Avatar**
1. Klik "Hapus Foto"
2. Confirm dialog ✅
3. Avatar terhapus dari storage & database ✅
4. Kembali ke icon default

### **Test 6: Public Access**
1. Copy public URL avatar
2. Buka di browser incognito
3. Avatar bisa diakses ✅ (public bucket)

---

## 🐛 Troubleshooting

### **Error: "Bucket 'avatars' not found"**
**Solusi:** Create bucket di Supabase Dashboard (Step 2)

### **Error: "Row Level Security policy violation"**
**Solusi:** Set storage policies (Step 3)

### **Error: "File size exceeds limit"**
- Check file size < 2MB
- Compress image terlebih dahulu

### **Avatar Tidak Muncul**
- Check bucket is **public**
- Check avatar_url di database
- Check public URL manually

### **Tidak Bisa Upload**
- Check storage policies
- Check user authenticated
- Check network connection

---

## 💡 Advanced Features (Future)

### **Image Processing:**
- [ ] Auto-resize to 256x256px
- [ ] Auto-compress quality
- [ ] Generate thumbnail
- [ ] Crop tool (square crop)

### **Multiple Sizes:**
- [ ] Avatar small (64x64)
- [ ] Avatar medium (128x128)
- [ ] Avatar large (256x256)
- [ ] Save all 3 sizes

### **Formats:**
- [ ] Convert to WebP (smaller size)
- [ ] Support animated GIF
- [ ] Support PNG transparency

---

## ✅ Checklist

- [ ] Run `add-bio-column-to-profiles.sql`
- [ ] Create `avatars` storage bucket
- [ ] Set storage policies (public read, auth write)
- [ ] Test upload avatar
- [ ] Test delete avatar
- [ ] Test file validation
- [ ] Test public access
- [ ] Verify storage usage

---

## 📝 Code Reference

### **Upload Function:**
```javascript
// Upload new avatar
const fileExt = avatar.name.split('.').pop();
const fileName = `${userId}/avatar.${fileExt}`;

await supabase.storage
  .from('avatars')
  .upload(fileName, avatar, { upsert: true });
```

### **Get Public URL:**
```javascript
const publicUrl = supabase.storage
  .from('avatars')
  .getPublicUrl(avatarUrl.replace('avatars/', ''))
  .data.publicUrl;
```

### **Delete Avatar:**
```javascript
const oldPath = avatarUrl.replace('avatars/', '');
await supabase.storage
  .from('avatars')
  .remove([oldPath]);
```

---

**Setelah setup selesai, fitur avatar upload siap digunakan!** 🎉
