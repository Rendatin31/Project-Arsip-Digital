# APK Download & Install Feature

## ✅ Fitur yang Sudah Diimplementasikan

### 1. Download APK dengan Progress Indicator
- Download file APK dari URL server
- Progress bar real-time (0-100%)
- Handling error jika download gagal

### 2. Auto-Open Installer
- Setelah download selesai, installer Android terbuka otomatis
- User tinggal klik tombol "Install"
- Menggunakan FileProvider untuk Android 7.0+

### 3. UI/UX
- Icon download di header (mobile only)
- Modal dengan pilihan Android/iOS
- Progress indicator saat download
- Spinner animation saat proses berlangsung

## 📋 Yang Masih Perlu Dilakukan

### 1. Upload APK ke Server
Anda perlu upload file APK ke server yang bisa diakses public. Ada beberapa opsi:

#### Option A: Upload ke Supabase Storage
```bash
# 1. Build APK production
cd android
./gradlew assembleRelease

# 2. File APK ada di:
# android/app/build/outputs/apk/release/app-release.apk

# 3. Upload ke Supabase Storage melalui dashboard:
# - Buka Supabase Dashboard
# - Pilih Storage
# - Buat bucket baru: "apk-files" (public)
# - Upload file app-release.apk
# - Copy public URL
```

#### Option B: Upload ke Server Sendiri
Upload APK ke web server Anda dan dapatkan URL public.

### 2. Update URL APK di Code

Edit file `src/components/Header.jsx`:

```javascript
// Line ~212 (dalam fungsi handleDownloadAPK)
// Ganti URL ini dengan URL APK Anda:
const apkUrl = 'https://your-server.com/path/to/arsip-digital.apk';

// Contoh jika pakai Supabase:
const apkUrl = 'https://axpanhequppcviaimwte.supabase.co/storage/v1/object/public/apk-files/arsip-digital.apk';
```

### 3. Build & Test

```bash
# Install dependencies
npm install

# Build project
npm run build

# Sync to Android
npx cap sync android

# Open Android Studio
npx cap open android

# Run di device
# Klik Run ▶️ di Android Studio
```

## 🧪 Testing Steps

1. **Buka aplikasi di device Android**
2. **Klik icon download** (⬇) di header
3. **Klik tombol "Android"**
4. **Progress download** akan muncul (0-100%)
5. **Setelah selesai**, installer Android akan terbuka otomatis
6. **Klik "Install"** di installer
7. **Done!** APK terinstall

## ⚠️ Troubleshooting

### Issue 1: "Install Unknown Apps" Permission
Jika installer tidak muncul, user mungkin perlu enable "Install Unknown Apps":
1. Settings → Apps → Browser/Chrome
2. Enable "Install unknown apps"

### Issue 2: Download Gagal
- Check URL APK apakah valid dan accessible
- Check file APK apakah corrupt
- Check koneksi internet device

### Issue 3: FileProvider Error
Jika ada error "FileProvider", pastikan:
- File `android/app/src/main/res/xml/file_paths.xml` sudah ada
- AndroidManifest.xml sudah include FileProvider

## 📱 Permissions Required

Sudah ditambahkan di `AndroidManifest.xml`:
- ✅ INTERNET - untuk download
- ✅ READ_EXTERNAL_STORAGE - untuk akses file
- ✅ WRITE_EXTERNAL_STORAGE - untuk save file

## 🔧 Technical Details

### Files Modified/Created:
1. `src/utils/apkDownloader.js` - Download & install logic
2. `android/app/src/main/java/com/rendatin/arsip/ApkInstallerPlugin.java` - Custom plugin
3. `android/app/src/main/res/xml/file_paths.xml` - FileProvider config
4. `src/components/Header.jsx` - UI untuk download button
5. `android/app/src/main/java/com/rendatin/arsip/MainActivity.java` - Register plugin

### Dependencies Added:
- `@capacitor/filesystem` - File operations
- `@capacitor/app` - App utilities

### How It Works:
1. User clicks "Android" button
2. Download APK via XMLHttpRequest (with progress)
3. Convert blob to base64
4. Save to Cache directory using Capacitor Filesystem
5. Get native file path
6. Call custom Java plugin `ApkInstaller`
7. Plugin creates Intent to open Android package installer
8. User sees installer screen → clicks "Install"

## 🎯 Next Steps

1. ✅ Upload APK ke server
2. ✅ Update URL di `handleDownloadAPK`
3. ✅ Build & sync
4. ✅ Test di real device
5. ✅ Deploy!

## 📝 iOS Note

Untuk iOS, proses berbeda:
- Tidak bisa install IPA langsung dari web
- Harus melalui TestFlight atau App Store
- Button iOS bisa diarahkan ke TestFlight link atau App Store

---

**Status**: ✅ Ready to use (after adding APK URL)
**Platform**: Android only
**Android Version**: 7.0+ (API 24+)
