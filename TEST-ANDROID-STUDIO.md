# 🚀 Testing Aplikasi di Android Studio

## 📋 Langkah-Langkah Testing

### 1️⃣ Rebuild Web Assets
```bash
npm run build
```

**Tunggu sampai selesai** - akan generate file di folder `dist/`

---

### 2️⃣ Sync ke Android Project
```bash
npx cap sync android
```

**Ini akan:**
- Copy file web dari `dist/` ke `android/app/src/main/assets/public/`
- Update `capacitor.config.json`
- Sync Capacitor plugins

---

### 3️⃣ Buka Android Studio
```bash
npx cap open android
```

Atau buka manual:
1. Buka Android Studio
2. File → Open → Pilih folder `android/`

---

### 4️⃣ Pilih Device untuk Testing

Ada 2 pilihan:

#### **Option A: Emulator (Virtual Device)**

1. Di Android Studio, klik **Device Manager** (icon phone)
2. Klik **Create Device**
3. Pilih device (contoh: Pixel 5)
4. Pilih system image (API 33 atau 34 recommended)
5. Download jika belum ada
6. Klik **Finish**

#### **Option B: Real Device (USB)**

1. Di HP Android:
   - Buka **Settings** → **About phone**
   - Tap **Build number** 7x (enable Developer Mode)
   - Kembali → **Developer options**
   - Enable **USB Debugging**
2. Colok HP ke laptop via USB
3. Di HP, allow USB debugging
4. Di Android Studio, device akan muncul di dropdown

---

### 5️⃣ Run App

1. Pilih device di dropdown (atas tengah Android Studio)
2. Klik tombol **Run** ▶️ (hijau) atau tekan **Shift+F10**
3. **Tunggu build selesai** (pertama kali bisa 3-5 menit)
4. App akan otomatis install & open di device

---

## 🧪 Test Checklist

Setelah app terbuka, test hal-hal ini:

### ✅ Basic Functionality
- [ ] Login berhasil (email + password)
- [ ] Dashboard muncul
- [ ] Bottom navigation berfungsi
- [ ] Bisa navigasi antar menu

### ✅ Input & Upload (PRIORITY)
- [ ] Buka menu **File Saya**
- [ ] Klik tombol **Tambah Dokumen** (+ icon)
- [ ] Modal form terbuka
- [ ] **Test Input Text:**
  - [ ] Bisa ketik di field "Subjek"
  - [ ] Bisa ketik di field "Perihal"
  - [ ] Bisa ketik di field "Nomor"
  - [ ] Bisa pilih tanggal
- [ ] **Test Upload File:**
  - [ ] Klik area upload file
  - [ ] File picker terbuka
  - [ ] Pilih file PDF atau gambar
  - [ ] Preview file muncul
- [ ] **Test Submit:**
  - [ ] Isi semua field required
  - [ ] Klik **Simpan**
  - [ ] Loading indicator muncul
  - [ ] Success message / redirect

### ✅ File Operations
- [ ] Lihat list dokumen
- [ ] Klik dokumen (single click) - preview muncul
- [ ] Preview PDF/gambar berfungsi
- [ ] Tombol "Buka PDF" berfungsi (native viewer)

---

## 🐛 Troubleshooting

### Build Error di Android Studio

**Error: "Gradle sync failed"**
```bash
# Di Android Studio:
File → Invalidate Caches → Invalidate and Restart
```

**Error: "SDK not found"**
```bash
# Set ANDROID_HOME jika belum:
setx ANDROID_HOME "C:\Users\Halut\AppData\Local\Android\Sdk"
```

### App Crashes on Launch

1. **Check Logcat** di Android Studio:
   - Buka tab **Logcat** (bawah)
   - Filter: pilih app package name
   - Cari error messages (warna merah)

2. **Common crashes:**
   - Missing permissions → Check AndroidManifest.xml
   - Network error → Check .env values hardcoded
   - Storage error → Check permissions granted

### Upload Gagal

1. **Check Console Logs:**
   - Di Chrome: `chrome://inspect`
   - Klik **inspect** pada device
   - Lihat Console tab

2. **Check Permissions:**
   - Di device: Settings → Apps → Arsip Digital → Permissions
   - Enable "Files and media"

3. **Test dengan file kecil:**
   - Upload gambar < 1MB dulu
   - Jika berhasil → permissions OK
   - Jika gagal → check Logcat errors

### Input Keyboard Tidak Muncul

**Possible fix:**
- Klik field 2x
- Restart app
- Check keyboard enabled di Android settings

---

## 📱 Viewing Logs

### Android Studio Logcat

1. Buka tab **Logcat** (bawah)
2. Filter dropdown: pilih app name
3. Level: pilih **Error** atau **Warn**
4. Search: ketik "upload" atau "error" untuk cari specific logs

### Chrome DevTools (Advanced)

```bash
# Enable Web Debugging
# Di device, buka app
# Di laptop:
1. Open Chrome
2. chrome://inspect
3. Klik "inspect" pada "Arsip Digital"
```

---

## ✅ Success Indicators

Jika semua OK:
- ✅ Login berhasil
- ✅ Keyboard muncul saat klik input
- ✅ File picker terbuka
- ✅ Upload berhasil (loading → success)
- ✅ Dokumen muncul di list

---

## 📝 Report Results

Setelah testing, beri tahu:

1. **Apa yang berhasil?**
   - Login: ✅/❌
   - Input text: ✅/❌
   - Upload file: ✅/❌

2. **Apa yang gagal?**
   - Error message yang muncul
   - Screenshot error jika ada
   - Log dari Logcat

3. **Device info:**
   - Emulator atau real device?
   - Android version?
   - Model device?

---

## 🎯 Quick Commands Reference

```bash
# Rebuild & sync
npm run build && npx cap sync android

# Open Android Studio
npx cap open android

# Check devices via ADB
adb devices

# View logs via ADB
adb logcat | findstr "Capacitor"
```

---

**Selamat Testing! 🚀**
