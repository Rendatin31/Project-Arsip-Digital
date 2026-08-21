# 📱 Panduan Setup Capacitor untuk Android & iOS

## 🎯 Tujuan
Mengubah aplikasi React Web menjadi aplikasi mobile native yang dapat berjalan di Android dan iOS menggunakan Capacitor.

---

## 📋 Prerequisites

### 1. Node.js & npm
Sudah terinstall (cek dengan `node -v` dan `npm -v`)

### 2. Untuk Android Development
- **Android Studio** (download dari: https://developer.android.com/studio)
- **Java Development Kit (JDK) 17** atau lebih tinggi
- **Android SDK** (akan terinstall otomatis dengan Android Studio)

### 3. Untuk iOS Development (hanya di macOS)
- **Xcode** (download dari Mac App Store)
- **CocoaPods** (install dengan: `sudo gem install cocoapods`)
- **Xcode Command Line Tools**

---

## 🚀 Step 1: Install Capacitor

Jalankan command berikut di terminal (di folder root project):

```bash
npm install @capacitor/core @capacitor/cli
```

---

## 🔧 Step 2: Initialize Capacitor

```bash
npx cap init
```

Anda akan ditanya beberapa pertanyaan:
- **App name**: Arsip Digital
- **App package ID**: com.kpu.arsipdigital (atau sesuai keinginan)
- **Web asset directory**: dist (karena menggunakan Vite)

---

## 📦 Step 3: Build Aplikasi React

```bash
npm run build
```

Ini akan membuat folder `dist` yang berisi build production aplikasi React Anda.

---

## 📱 Step 4: Add Platform Android

```bash
npm install @capacitor/android
npx cap add android
```

Ini akan membuat folder `android` di root project.

---

## 🍎 Step 5: Add Platform iOS (hanya di macOS)

```bash
npm install @capacitor/ios
npx cap add ios
```

Ini akan membuat folder `ios` di root project.

---

## 🔄 Step 6: Sync Web App ke Native Platform

Setiap kali Anda melakukan perubahan pada aplikasi web, Anda perlu build ulang dan sync:

```bash
npm run build
npx cap sync
```

Command `npx cap sync` akan:
1. Copy file dari folder `dist` ke native project
2. Update native dependencies
3. Update plugins

---

## 🎨 Step 7: Konfigurasi capacitor.config.ts

Buat file `capacitor.config.ts` di root project dengan konten:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kpu.arsipdigital',
  appName: 'Arsip Digital',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
```

---

## 🔐 Step 8: Konfigurasi untuk Supabase

Tambahkan plugin untuk handle deep linking dan browser:

```bash
npm install @capacitor/browser
```

Update `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kpu.arsipdigital',
  appName: 'Arsip Digital',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Browser: {
      enabled: true
    }
  }
};

export default config;
```

---

## 📲 Step 9: Run di Android

### Buka Android Studio:
```bash
npx cap open android
```

Ini akan membuka project di Android Studio.

### Di Android Studio:
1. Tunggu Gradle sync selesai
2. Pilih emulator atau connect device Android Anda
3. Click tombol "Run" (▶️) untuk build dan run aplikasi

### Atau via Command Line:
```bash
npx cap run android
```

---

## 🍏 Step 10: Run di iOS (hanya di macOS)

### Buka Xcode:
```bash
npx cap open ios
```

### Di Xcode:
1. Pilih simulator atau connect device iOS Anda
2. Click tombol "Run" (▶️) untuk build dan run aplikasi

### Atau via Command Line:
```bash
npx cap run ios
```

---

## 🔄 Workflow Development

### Saat Mengembangkan Aplikasi:

1. **Edit code React Anda** seperti biasa
2. **Build aplikasi**:
   ```bash
   npm run build
   ```
3. **Sync ke native platforms**:
   ```bash
   npx cap sync
   ```
4. **Run di device/emulator**:
   ```bash
   npx cap run android
   # atau
   npx cap run ios
   ```

### Live Reload (Development Mode):

Untuk development yang lebih cepat, Anda bisa menggunakan live reload:

1. **Start dev server**:
   ```bash
   npm run dev
   ```
2. **Update capacitor.config.ts** untuk development:
   ```typescript
   server: {
     url: 'http://192.168.1.100:5173', // Ganti dengan IP local Anda
     cleartext: true
   }
   ```
3. **Sync dan run**:
   ```bash
   npx cap sync
   npx cap run android
   ```

⚠️ **PENTING**: Jangan lupa hapus konfigurasi `server.url` sebelum build production!

---

## 📦 Step 11: Install Plugin Tambahan (Optional)

### Status Bar Plugin:
```bash
npm install @capacitor/status-bar
```

### Splash Screen Plugin:
```bash
npm install @capacitor/splash-screen
```

### Camera Plugin (jika perlu):
```bash
npm install @capacitor/camera
```

### Filesystem Plugin:
```bash
npm install @capacitor/filesystem
```

### Share Plugin:
```bash
npm install @capacitor/share
```

---

## 🎨 Kustomisasi Icon & Splash Screen

### Android:
- Icon: `android/app/src/main/res/mipmap-*/ic_launcher.png`
- Splash: `android/app/src/main/res/drawable*/splash.png`

### iOS:
- Icon: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Splash: `ios/App/App/Assets.xcassets/Splash.imageset/`

**Tool Generator Icon & Splash**:
- https://capacitorjs.com/docs/guides/splash-screens-and-icons
- https://www.appicon.co/

---

## 🔧 Troubleshooting

### Android Build Error:
```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

### iOS Build Error:
```bash
cd ios/App
pod install
cd ../..
npx cap sync ios
```

### Clear Cache:
```bash
rm -rf node_modules
rm -rf dist
rm -rf android
rm -rf ios
npm install
npm run build
npx cap add android
npx cap add ios
npx cap sync
```

---

## 📝 Script Tambahan untuk package.json

Tambahkan script berikut ke `package.json` untuk memudahkan:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "cap:sync": "npm run build && npx cap sync",
    "cap:android": "npm run build && npx cap sync android && npx cap open android",
    "cap:ios": "npm run build && npx cap sync ios && npx cap open ios",
    "cap:run:android": "npm run build && npx cap sync && npx cap run android",
    "cap:run:ios": "npm run build && npx cap sync && npx cap run ios"
  }
}
```

Sekarang Anda bisa jalankan:
- `npm run cap:android` - Build dan buka di Android Studio
- `npm run cap:ios` - Build dan buka di Xcode
- `npm run cap:run:android` - Build dan run langsung di Android
- `npm run cap:run:ios` - Build dan run langsung di iOS

---

## 🎉 Selesai!

Aplikasi React Anda sekarang sudah bisa berjalan sebagai aplikasi native di Android dan iOS!

### Testing di Device:
- **Android**: Enable USB Debugging di device, connect via USB
- **iOS**: Perlu Apple Developer Account untuk deploy ke device fisik

### Build APK/IPA untuk Production:
- **Android**: Gunakan Android Studio → Build → Generate Signed Bundle/APK
- **iOS**: Gunakan Xcode → Product → Archive

---

## 📚 Resources

- Capacitor Docs: https://capacitorjs.com/docs
- Capacitor Plugins: https://capacitorjs.com/docs/plugins
- Community Plugins: https://github.com/capacitor-community
