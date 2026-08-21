# 🚀 Capacitor Quick Start

## ⚡ Install Capacitor (Langkah Pertama)

Jalankan command berikut satu per satu:

```bash
# 1. Install Capacitor Core & CLI
npm install @capacitor/core @capacitor/cli

# 2. Initialize Capacitor
npx cap init

# Jawab pertanyaan:
# - App name: Arsip Digital
# - App package ID: com.kpu.arsipdigital
# - Web asset directory: dist

# 3. Build React app
npm run build

# 4. Install platform Android
npm install @capacitor/android
npx cap add android

# 5. Sync web app ke Android
npx cap sync android

# 6. Buka di Android Studio
npx cap open android
```

---

## 📱 Untuk iOS (hanya di macOS)

```bash
# 1. Install platform iOS
npm install @capacitor/ios
npx cap add ios

# 2. Sync web app ke iOS
npx cap sync ios

# 3. Buka di Xcode
npx cap open ios
```

---

## 🔄 Update Aplikasi Setelah Perubahan

Setiap kali Anda mengubah code React:

```bash
npm run build
npx cap sync
```

Atau gunakan script yang sudah saya tambahkan:

```bash
# Build dan buka di Android Studio
npm run cap:android

# Build dan buka di Xcode
npm run cap:ios

# Build dan run langsung di Android
npm run cap:run:android

# Build dan run langsung di iOS
npm run cap:run:ios
```

---

## 🔌 Install Plugin Berguna

```bash
# Status Bar & Splash Screen
npm install @capacitor/status-bar @capacitor/splash-screen

# Browser (untuk OAuth/deep linking)
npm install @capacitor/browser

# Filesystem (untuk save files)
npm install @capacitor/filesystem

# Share (untuk share files)
npm install @capacitor/share

# Camera (untuk ambil foto)
npm install @capacitor/camera

# After installing plugins, sync:
npx cap sync
```

---

## 📝 Yang Perlu Anda Lakukan:

### 1. ✅ Install Prerequisites
- **Android**: Install Android Studio dari https://developer.android.com/studio
- **iOS**: Install Xcode dari Mac App Store (hanya macOS)

### 2. ✅ Jalankan Commands di Atas
Ikuti step-by-step sesuai urutan

### 3. ✅ Test di Emulator/Device
- Android: Pilih emulator di Android Studio atau connect device via USB
- iOS: Pilih simulator di Xcode atau connect device

### 4. ✅ Build Production APK/IPA
- Android: Android Studio → Build → Generate Signed Bundle/APK
- iOS: Xcode → Product → Archive

---

## ⚠️ Troubleshooting

### Gradle Error di Android:
```bash
cd android
gradlew clean
cd ..
npx cap sync android
```

### Pod Install Error di iOS:
```bash
cd ios/App
pod install
cd ../..
npx cap sync ios
```

---

## 📚 Dokumentasi Lengkap

Lihat file `CAPACITOR-SETUP-GUIDE.md` untuk panduan detail.
