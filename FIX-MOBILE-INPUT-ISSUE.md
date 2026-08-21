# 🔧 Fix: Input Data Gagal di Mobile

## ❌ Problem

Input data atau upload file gagal di aplikasi mobile Android.

## 🔍 Possible Causes

1. **Storage permissions tidak ada** - Untuk upload file
2. **Network request timeout** - Koneksi lambat
3. **File size terlalu besar** - Android limit file upload
4. **CORS/Security policy** - Browser security di WebView

## ✅ Solutions Applied

### 1. Tambah Storage Permissions

File: `android/app/src/main/AndroidManifest.xml`

Ditambahkan permissions:
```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
```

**Penjelasan:**
- `READ_EXTERNAL_STORAGE`: Baca file dari storage
- `WRITE_EXTERNAL_STORAGE`: Tulis file (Android ≤ 12)
- `READ_MEDIA_*`: Baca media files (Android 13+)

---

## 🚀 Rebuild APK

Setelah fix, rebuild APK:

```bash
npm run build
npx cap sync
# Build via Android Studio
```

---

## 🐛 Troubleshooting Lanjutan

### Jika Masih Gagal:

#### 1. **Cek Error di Console**

Di Chrome DevTools (jika debug):
```bash
# Connect phone via USB
adb devices
# Open Chrome: chrome://inspect
# Klik "inspect" pada app Anda
```

#### 2. **Test dengan File Kecil**

Coba upload file < 1MB dulu untuk test

#### 3. **Cek Koneksi Internet**

Pastikan device connect ke internet yang stabil

#### 4. **Check Supabase Storage Quota**

Login ke Supabase dashboard → Storage → Check quota

---

## 📱 Specific Issues

### Upload File Tidak Muncul File Picker

**Fix**: Install Capacitor Filesystem plugin

```bash
npm install @capacitor/filesystem
npx cap sync
```

### Upload Stuck/Timeout

**Possible causes:**
- File terlalu besar (> 50MB)
- Internet lambat
- Supabase storage full

**Solution:**
- Compress file sebelum upload
- Check file size limit
- Upgrade Supabase plan if needed

### Permission Denied

**Fix**: User perlu allow permissions saat pertama kali

Di Android:
1. Settings → Apps → Arsip Digital → Permissions
2. Enable "Files and media"

---

## 📝 Testing Checklist

Setelah rebuild, test:

✅ Login berhasil
✅ Buka form tambah dokumen
✅ Klik tombol "Pilih File" - file picker muncul
✅ Pilih file kecil (< 1MB) - upload berhasil
✅ Pilih file besar (> 5MB) - upload berhasil (mungkin lambat)
✅ Input text fields - bisa ketik
✅ Submit form - data tersimpan

---

## 💡 Best Practices

### Untuk Form Input:

1. **Validate input** sebelum submit
2. **Show loading indicator** saat upload
3. **Handle errors gracefully** dengan message jelas
4. **Limit file size** di client-side sebelum upload
5. **Compress images** jika file > 2MB

### Untuk File Upload:

```javascript
// Example: Check file size before upload
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

if (file.size > MAX_FILE_SIZE) {
  alert('File terlalu besar! Maksimal 10MB');
  return;
}
```

---

## 🔐 Security Note

Permissions yang ditambahkan adalah **standard permissions** untuk app yang handle file uploads. Ini aman dan diperlukan untuk:

- Pick files dari storage
- Upload ke Supabase
- Download files
- View images/documents

---

## ✅ Status

- ✅ Storage permissions ditambahkan
- ⏳ Waiting for rebuild & test

**Next steps:**
1. Rebuild APK
2. Install di device
3. Test upload file
4. Beri tahu hasil testnya

---

## 📚 References

- [Capacitor Permissions](https://capacitorjs.com/docs/android/configuration#configuring-androidmanifestxml)
- [Android Permissions](https://developer.android.com/guide/topics/permissions/overview)
- [Supabase Storage Limits](https://supabase.com/docs/guides/storage)
