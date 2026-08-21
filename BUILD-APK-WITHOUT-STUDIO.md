# 📦 Build APK Tanpa Android Studio

## ✅ Requirement

1. **Java JDK 17+** - Download dari https://adoptium.net/
2. **Android SDK** (via Command Line Tools atau Android Studio)
3. **Gradle** (sudah include di folder android)

---

## 🚀 Build Debug APK (Cepat, Untuk Testing)

```bash
# Masuk ke folder android
cd android

# Build debug APK
gradlew assembleDebug

# Atau di Windows
.\gradlew.bat assembleDebug
```

**Output APK**: `android\app\build\outputs\apk\debug\app-debug.apk`

---

## 📱 Build Release APK (Production, Signed)

### Step 1: Generate Keystore (Hanya Sekali)

```bash
# Di folder android/app
keytool -genkey -v -keystore arsip-digital.keystore -alias arsip-digital -keyalg RSA -keysize 2048 -validity 10000

# Jawab pertanyaan:
# - Password keystore: [buat password, INGAT!]
# - First and last name: Arsip Digital
# - Organization: KPU
# - City, State, Country: [isi sesuai]
```

**PENTING**: Simpan file `arsip-digital.keystore` dan password-nya dengan AMAN!

### Step 2: Configure Gradle untuk Signing

Buat file `android/key.properties`:

```properties
storeFile=arsip-digital.keystore
storePassword=PASSWORD_ANDA
keyAlias=arsip-digital
keyPassword=PASSWORD_ANDA
```

**PENTING**: Tambahkan `key.properties` ke `.gitignore`!

### Step 3: Update build.gradle

Edit file `android/app/build.gradle`, tambahkan sebelum `android {`:

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    ...
    
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 4: Build Signed Release APK

```bash
cd android
gradlew assembleRelease
```

**Output APK**: `android\app\build\outputs\apk\release\app-release.apk`

**APK ini sudah signed dan siap upload ke Play Store!**

---

## 📦 Build AAB (Android App Bundle - Recommended)

Google Play Store sekarang prefer AAB format:

```bash
cd android
gradlew bundleRelease
```

**Output AAB**: `android\app\build\outputs\bundle\release\app-release.aab`

---

## 🎯 Script Tambahan untuk package.json

Tambahkan ke `package.json`:

```json
{
  "scripts": {
    "build:apk:debug": "npm run build && npx cap sync && cd android && gradlew assembleDebug",
    "build:apk:release": "npm run build && npx cap sync && cd android && gradlew assembleRelease",
    "build:aab": "npm run build && npx cap sync && cd android && gradlew bundleRelease"
  }
}
```

Sekarang bisa jalankan:
```bash
npm run build:apk:debug
npm run build:apk:release
npm run build:aab
```

---

## 🔍 Install APK ke Device

### Via USB:

```bash
# Install debug APK
adb install android\app\build\outputs\apk\debug\app-debug.apk

# Install release APK
adb install android\app\build\outputs\apk\release\app-release.apk
```

### Via File Transfer:

1. Copy APK ke device Android
2. Buka file manager di device
3. Tap APK file
4. Allow "Install from unknown sources" jika diminta
5. Install!

---

## ⚠️ Troubleshooting

### Gradle Not Found:
```bash
# Set JAVA_HOME
set JAVA_HOME=C:\Program Files\Java\jdk-17

# Atau tambah ke System Environment Variables
```

### SDK Not Found:
```bash
# Set ANDROID_HOME
set ANDROID_HOME=C:\Users\ANDA\AppData\Local\Android\Sdk

# Atau install Android Studio yang otomatis install SDK
```

### Permission Denied (Windows):
```bash
# Gunakan .\gradlew.bat instead of gradlew
.\gradlew.bat assembleDebug
```

---

## 💡 Rekomendasi

**Untuk Development/Testing**:
- Install Android Studio (lebih mudah, auto-setup everything)
- Atau gunakan Gradle command line untuk build APK langsung

**Untuk Production**:
- HARUS generate keystore dan signed APK
- Upload AAB (bukan APK) ke Google Play Store
- Simpan keystore dengan AMAN (jangan hilang!)

---

## 📱 Langkah Singkat (Tanpa Android Studio)

```bash
# 1. Install Java JDK 17
# Download dari https://adoptium.net/

# 2. Build React app
npm run build

# 3. Sync Capacitor
npx cap sync

# 4. Build APK
cd android
.\gradlew.bat assembleDebug

# 5. APK ada di:
# android\app\build\outputs\apk\debug\app-debug.apk

# 6. Copy ke device dan install!
```

---

## ✨ Kesimpulan

✅ **BISA build APK tanpa Android Studio**
✅ **Cukup perlu Java JDK + Android SDK + Gradle**
✅ **Debug APK: `gradlew assembleDebug`**
✅ **Release APK: `gradlew assembleRelease` (perlu signing)**
✅ **AAB: `gradlew bundleRelease` (untuk Play Store)**

**Tapi Android Studio tetap direkomendasikan karena:**
- Auto-install semua dependency
- GUI untuk debugging dan testing
- Emulator built-in
- Easier untuk troubleshooting

**Pilihan ada di Anda! 🚀**
