# 📱 Capacitor Setup - Arsip Digital

## 📂 File yang Telah Dibuat

1. **CAPACITOR-QUICK-START.md** - Panduan cepat untuk memulai
2. **CAPACITOR-SETUP-GUIDE.md** - Dokumentasi lengkap dan detail
3. **capacitor.config.ts** - Konfigurasi Capacitor
4. **package.json** - Updated dengan script Capacitor

---

## 🎯 Apa yang Sudah Disiapkan?

✅ Konfigurasi Capacitor (`capacitor.config.ts`)
✅ Script npm untuk build dan run (`package.json`)
✅ Dokumentasi lengkap setup
✅ Quick start guide
✅ Update `.gitignore` untuk Capacitor folders

---

## 🚀 Langkah Selanjutnya

### 1️⃣ Install Capacitor
```bash
npm install @capacitor/core @capacitor/cli
```

### 2️⃣ Initialize Capacitor
```bash
npx cap init
```

Jawab pertanyaan:
- **App name**: `Arsip Digital`
- **App package ID**: `com.kpu.arsipdigital`
- **Web asset directory**: `dist`

### 3️⃣ Build React App
```bash
npm run build
```

### 4️⃣ Setup Android
```bash
npm install @capacitor/android
npx cap add android
npx cap sync android
```

### 5️⃣ Setup iOS (hanya di macOS)
```bash
npm install @capacitor/ios
npx cap add ios
npx cap sync ios
```

### 6️⃣ Open di IDE
```bash
# Android Studio
npx cap open android

# Xcode
npx cap open ios
```

---

## 📱 Running the App

### Development
```bash
# Run di Android
npm run cap:run:android

# Run di iOS
npm run cap:run:ios
```

### Production Build
- **Android**: Generate APK/AAB via Android Studio
- **iOS**: Archive via Xcode

---

## 🔌 Plugins yang Direkomendasikan

```bash
npm install @capacitor/status-bar @capacitor/splash-screen @capacitor/browser @capacitor/filesystem @capacitor/share
```

---

## 📚 Dokumentasi

- **Quick Start**: Baca `CAPACITOR-QUICK-START.md`
- **Setup Lengkap**: Baca `CAPACITOR-SETUP-GUIDE.md`
- **Capacitor Docs**: https://capacitorjs.com/docs

---

## ⚙️ Konfigurasi App

### App ID: `com.kpu.arsipdigital`
### App Name: `Arsip Digital`
### Web Directory: `dist`

---

## 🎨 Kustomisasi Icon & Splash

Setelah platform ditambahkan, Anda bisa custom icon dan splash screen:

### Android
- Icon: `android/app/src/main/res/mipmap-*/ic_launcher.png`
- Splash: `android/app/src/main/res/drawable*/splash.png`

### iOS
- Icon: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Splash: `ios/App/App/Assets.xcassets/Splash.imageset/`

**Tool Generator**: https://www.appicon.co/

---

## ✨ Fitur Aplikasi yang Sudah Responsif

✅ Layout mobile-friendly dengan Bottom Navigation
✅ Sidebar untuk desktop
✅ Icon profil dengan ring border
✅ Warna theme consistent (cyan/biru untuk mobile, hijau untuk desktop)
✅ Touch-friendly buttons dan spacing

---

## 🤔 Butuh Bantuan?

1. Cek `CAPACITOR-QUICK-START.md` untuk panduan cepat
2. Cek `CAPACITOR-SETUP-GUIDE.md` untuk troubleshooting
3. Visit https://capacitorjs.com/docs untuk dokumentasi official

---

## 📝 Notes

- Folder `android/` dan `ios/` akan dibuat setelah run `npx cap add android/ios`
- Setiap perubahan code React perlu: `npm run build && npx cap sync`
- Gunakan script yang sudah disediakan di `package.json` untuk kemudahan

**Selamat membuat aplikasi mobile! 🎉**
