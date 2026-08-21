# ⚡ Android SDK - Quick Installation Guide

## 🎯 Pilih Salah Satu:

---

## ✅ Option 1: Command Line Tools (Ringan, CLI Only)

### 1. Download
- Buka: https://developer.android.com/studio#command-tools
- Download: **"Command line tools for Windows"**

### 2. Extract
```
Extract ZIP ke: C:\Android\cmdline-tools\latest\
```

Struktur harus:
```
C:\Android\
└── cmdline-tools\
    └── latest\     ← PENTING: folder ini harus bernama "latest"
        ├── bin\
        ├── lib\
        └── ...
```

### 3. Set Environment Variables

**Via PowerShell (Run as Administrator):**
```powershell
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Android', 'Machine')
[System.Environment]::SetEnvironmentVariable('Path', $env:Path + ';C:\Android\cmdline-tools\latest\bin;C:\Android\platform-tools', 'Machine')
```

**Atau Manual:**
1. Klik kanan **This PC** → **Properties** → **Advanced system settings** → **Environment Variables**
2. New System Variable:
   - Name: `ANDROID_HOME`
   - Value: `C:\Android`
3. Edit **Path**, tambahkan:
   - `C:\Android\cmdline-tools\latest\bin`
   - `C:\Android\platform-tools`

### 4. Restart Terminal

**TUTUP dan BUKA BARU PowerShell/CMD**

### 5. Install SDK Packages

```bash
# Test command available
sdkmanager --version

# Accept licenses
sdkmanager --licenses

# Install required packages (2-3 GB download)
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

### 6. Verify

```bash
adb version
sdkmanager --list_installed
```

✅ **DONE! Lanjut ke Build APK**

---

## ✅ Option 2: Android Studio (Mudah, Recommended)

### 1. Download
- Buka: https://developer.android.com/studio
- Download: **Android Studio** (1 GB, install jadi 5-6 GB)

### 2. Install
- Run installer
- Next → Next → Install
- Pilih **"Standard"** setup
- Tunggu download SDK (10-20 menit)

### 3. Set Environment Variable

SDK biasanya di: `C:\Users\ANDA\AppData\Local\Android\Sdk`

Set **ANDROID_HOME**:
```
ANDROID_HOME=C:\Users\ANDA\AppData\Local\Android\Sdk
```

### 4. Verify

```bash
adb version
```

✅ **DONE! Lanjut ke Build APK**

---

## 🚀 Build APK (Setelah SDK Installed)

```bash
# Kembali ke project folder
cd C:\Users\Halut\Documents\GitHub\Project-Arsip-Digital

# Build React app
npm run build

# Sync Capacitor
npx cap sync

# Masuk ke folder android
cd android

# Build APK
.\gradlew.bat assembleDebug

# APK ada di:
# android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 📱 Install APK ke Phone

### Option 1: Via USB (ADB)
```bash
adb devices
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

### Option 2: Manual Copy
1. Copy file `app-debug.apk` ke phone via USB/Bluetooth/WhatsApp
2. Buka file manager di phone
3. Tap APK
4. Allow "Install from unknown sources"
5. Install!

---

## ⚠️ Quick Troubleshooting

### Command not found: sdkmanager
- **Restart terminal** setelah set environment variables
- Cek PATH sudah include `cmdline-tools\latest\bin`

### JAVA_HOME not set
```bash
setx JAVA_HOME "C:\Program Files\Java\jdk-17" /M
```

### Gradle build error
```bash
# Buat file: android\local.properties
sdk.dir=C:\\Android
```

---

## 💡 My Recommendation

**Pertama Kali / Pemula:**
→ **Install Android Studio** (Option 2)
- Paling mudah
- Auto-setup everything
- Bisa pakai emulator

**Sudah Familiar CLI / Space Terbatas:**
→ **Command Line Tools** (Option 1)
- Lebih ringan (2-3 GB vs 5-6 GB)
- Pure CLI
- Lebih cepat

---

## 📚 Full Documentation

- Detail lengkap: `INSTALL-ANDROID-SDK.md`
- Build APK: `BUILD-APK-WITHOUT-STUDIO.md`
- Capacitor setup: `CAPACITOR-SETUP-GUIDE.md`
