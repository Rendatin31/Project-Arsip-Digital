# Panduan Build iOS App

## ⚠️ Persyaratan Penting

Untuk membuild aplikasi iOS, Anda **HARUS** memiliki:

1. **Mac Computer** dengan macOS (minimal macOS 12.0 atau lebih baru)
2. **Xcode** (versi terbaru dari App Store)
3. **Apple Developer Account** (untuk testing di device atau distribusi)

## 🚫 Kenapa Tidak Bisa di Windows?

**iOS development HANYA bisa dilakukan di macOS.** Ini adalah batasan dari Apple:
- Xcode (IDE untuk iOS) hanya tersedia di macOS
- iOS SDK dan build tools hanya berjalan di macOS
- Apple memerlukan macOS untuk code signing dan distribusi

## 📱 Alternatif Solusi

Jika Anda tidak memiliki Mac, ada beberapa opsi:

### Opsi 1: Gunakan PWA (Progressive Web App)
- User iOS tetap bisa mengakses aplikasi melalui browser
- Bisa di-"install" ke home screen tanpa App Store
- Tidak perlu build native app

**Cara Install PWA di iOS:**
1. Buka website di Safari
2. Tap tombol Share (kotak dengan panah ke atas)
3. Pilih "Add to Home Screen"
4. Aplikasi akan muncul seperti native app

### Opsi 2: Cloud Build Service
- **Ionic Appflow** - Build iOS di cloud tanpa Mac
- **EAS Build (Expo)** - Build service untuk React Native/Capacitor
- **MacStadium** - Rent Mac di cloud untuk development

### Opsi 3: Pinjam/Sewa Mac
- Pinjam Mac dari teman/kantor
- Sewa Mac di co-working space
- Beli Mac Mini (opsi termurah ~$599)

## 🖥️ Jika Anda Memiliki Mac

Berikut langkah-langkah build iOS:

### 1. Install Xcode
```bash
# Download Xcode dari App Store (gratis, ~15GB)
# Atau download dari https://developer.apple.com/xcode/
```

### 2. Install Command Line Tools
```bash
xcode-select --install
```

### 3. Install CocoaPods (Dependency Manager iOS)
```bash
sudo gem install cocoapods
```

### 4. Setup iOS Project
```bash
# Di folder project
npm run build
npx cap add ios
npx cap sync ios
```

### 5. Buka Project di Xcode
```bash
npx cap open ios
```

### 6. Konfigurasi di Xcode
1. Pilih project "App" di sidebar kiri
2. Di tab "Signing & Capabilities":
   - Pilih Team (perlu Apple Developer Account)
   - Bundle Identifier sudah otomatis: `com.rendatin.arsip`
   - Enable "Automatically manage signing"

### 7. Build untuk Testing
**Simulator (tidak perlu device):**
1. Pilih simulator dari dropdown (iPhone 15 Pro, dll)
2. Klik tombol Play (▶️)

**Real Device:**
1. Hubungkan iPhone via USB
2. Trust computer di iPhone
3. Pilih device dari dropdown
4. Klik tombol Play (▶️)

### 8. Build untuk Distribusi
**TestFlight (Internal Testing):**
1. Di Xcode: Product → Archive
2. Tunggu archive selesai
3. Klik "Distribute App"
4. Pilih "App Store Connect"
5. Upload ke TestFlight

**App Store:**
1. Sama seperti TestFlight
2. Setelah upload, masuk ke App Store Connect
3. Buat App listing dan submit untuk review

## 📋 Checklist Before Building

- [ ] Sudah punya Mac dengan macOS 12.0+
- [ ] Sudah install Xcode
- [ ] Sudah punya Apple Developer Account ($99/tahun untuk publish)
- [ ] Bundle ID unik: `com.rendatin.arsip`
- [ ] Icon dan splash screen sudah ready
- [ ] Testing di web/Android sudah OK

## 🔐 Apple Developer Account

**Free Account:**
- Bisa test di device sendiri (max 7 hari)
- Tidak bisa distribusi ke user lain
- Tidak bisa publish ke App Store

**Paid Account ($99/tahun):**
- Bisa test unlimited di device
- Bisa distribusi via TestFlight (max 10,000 tester)
- Bisa publish ke App Store

## 🆘 Butuh Bantuan?

Jika Anda sudah punya Mac dan mengalami masalah:
1. Pastikan Xcode versi terbaru
2. Cek `npx cap doctor` untuk diagnostic
3. Lihat log error di Xcode console
4. Search error di Stack Overflow atau Capacitor forum

## 📱 Info Aplikasi Anda

- **Package ID:** `com.rendatin.arsip`
- **App Name:** Arsip Digital
- **Platform:** React + Vite + Capacitor
- **Target:** iOS 13.0+, Android 7.0+

---

## 💡 Kesimpulan

**Untuk Windows User:** Build iOS tidak memungkinkan. Fokus ke:
1. Android APK (sudah berhasil ✅)
2. PWA untuk iOS user
3. Web responsive untuk semua device

**Untuk Mac User:** Ikuti langkah-langkah di atas untuk build iOS app.
