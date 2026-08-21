# 📥 Install Android SDK Tanpa Android Studio

## 🎯 Cara 1: Via Command Line Tools (Recommended)

### Step 1: Download Command Line Tools

1. Buka: https://developer.android.com/studio#command-tools
2. Scroll ke bawah sampai section **"Command line tools only"**
3. Download **"Windows"** version
4. File yang didownload: `commandlinetools-win-XXXXX_latest.zip`

### Step 2: Extract dan Setup Folder

1. **Extract file ZIP** ke lokasi pilihan Anda, misal:
   ```
   C:\Android\cmdline-tools
   ```

2. **Rename folder** hasil extract dari `cmdline-tools` menjadi `latest`
   
   Struktur folder harus seperti ini:
   ```
   C:\Android\
   └── cmdline-tools\
       └── latest\
           ├── bin\
           ├── lib\
           └── ...
   ```

### Step 3: Set Environment Variables

**Cara Manual (via GUI):**

1. Klik kanan **"This PC"** atau **"My Computer"** → **Properties**
2. Klik **"Advanced system settings"**
3. Klik **"Environment Variables"**
4. Di **"System variables"**, klik **"New"**:
   - **Variable name**: `ANDROID_HOME`
   - **Variable value**: `C:\Android`
   - Klik **OK**

5. Cari variable **"Path"**, klik **"Edit"**
6. Klik **"New"** dan tambahkan:
   ```
   C:\Android\cmdline-tools\latest\bin
   C:\Android\platform-tools
   ```
7. Klik **OK** semua dialog

**Atau via Command Prompt (sebagai Administrator):**

```cmd
setx ANDROID_HOME "C:\Android" /M
setx PATH "%PATH%;%ANDROID_HOME%\cmdline-tools\latest\bin;%ANDROID_HOME%\platform-tools" /M
```

### Step 4: Restart Terminal

**PENTING**: Tutup dan buka terminal/PowerShell baru agar environment variable ter-load!

### Step 5: Test Installation

```bash
# Cek sdkmanager available
sdkmanager --version

# Harus muncul versi, misal: 11.0
```

### Step 6: Install Android SDK Packages

Jalankan command ini (akan download ~2-3 GB):

```bash
# Accept licenses
sdkmanager --licenses

# Install SDK packages yang dibutuhkan
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# Optional: Install Android 33 jika butuh backward compatibility
sdkmanager "platforms;android-33" "build-tools;33.0.2"
```

**Jawab "y" untuk semua pertanyaan license**

### Step 7: Verify Installation

```bash
# List installed packages
sdkmanager --list_installed

# Harus muncul:
# - platform-tools
# - platforms;android-34
# - build-tools;34.0.0
```

### Step 8: Test dengan adb

```bash
# Cek adb (Android Debug Bridge)
adb version

# Harus muncul version number
```

---

## 🎯 Cara 2: Install Android Studio (Lebih Mudah)

Jika Cara 1 terlalu ribet, install Android Studio saja:

### Step 1: Download Android Studio

1. Buka: https://developer.android.com/studio
2. Download **Android Studio** untuk Windows
3. Size: ~1 GB download, ~4-5 GB setelah install

### Step 2: Install

1. Run installer `android-studio-XXXX.exe`
2. **Next** → **Next** → **Install**
3. Di first launch, pilih **"Standard"** setup
4. Tunggu download SDK components (10-20 menit)

### Step 3: Set Environment Variables

Android Studio biasanya install SDK di:
```
C:\Users\NAMA_USER\AppData\Local\Android\Sdk
```

Set environment variable:
- **ANDROID_HOME**: `C:\Users\NAMA_USER\AppData\Local\Android\Sdk`

### Step 4: Verify

```bash
# Cek adb
adb version

# Cek sdkmanager
sdkmanager --version
```

---

## ✅ Verification Checklist

Setelah install, cek semua ini work:

```bash
# 1. Java installed
java -version
# Output: java version "17.x.x"

# 2. ANDROID_HOME set
echo %ANDROID_HOME%
# Output: C:\Android (atau lokasi SDK Anda)

# 3. sdkmanager available
sdkmanager --version
# Output: 11.0 atau version lain

# 4. adb available
adb version
# Output: Android Debug Bridge version 1.x.x

# 5. Android platforms installed
sdkmanager --list_installed
# Output: harus ada platforms;android-34 dan build-tools
```

---

## 🔧 Troubleshooting

### sdkmanager: command not found

**Solusi**:
1. Cek ANDROID_HOME sudah di-set
2. Cek PATH sudah include `%ANDROID_HOME%\cmdline-tools\latest\bin`
3. **Restart terminal/PowerShell** (PENTING!)

### JAVA_HOME not set

```bash
# Set JAVA_HOME (ganti path sesuai instalasi Anda)
setx JAVA_HOME "C:\Program Files\Java\jdk-17" /M

# Restart terminal
```

### sdkmanager error: "Could not find or load main class"

**Solusi**: Struktur folder salah. Pastikan struktur seperti ini:
```
C:\Android\
└── cmdline-tools\
    └── latest\        ← Folder ini HARUS bernama "latest"
        ├── bin\
        ├── lib\
        └── ...
```

### Build error: "SDK location not found"

Buat file `android/local.properties`:
```properties
sdk.dir=C:\\Android
```

---

## 🚀 Setelah SDK Terinstall

Sekarang Anda bisa build APK:

```bash
# Kembali ke folder project
cd C:\Users\Halut\Documents\GitHub\Project-Arsip-Digital

# Build debug APK
cd android
.\gradlew.bat assembleDebug

# APK akan ada di:
# android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 💡 Rekomendasi

**Untuk Pemula / First Time:**
→ Install **Android Studio** (Cara 2)
- Lebih mudah, GUI friendly
- Auto-setup semuanya
- Bisa test di emulator

**Untuk Advanced / CLI Only:**
→ Install **Command Line Tools** (Cara 1)
- Lebih ringan (~2-3 GB vs 5-6 GB)
- No GUI, pure command line
- Harus manual setup environment variables

**Pilih yang paling nyaman untuk Anda! 🎯**
