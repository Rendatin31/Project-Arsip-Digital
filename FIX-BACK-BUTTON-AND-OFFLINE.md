# 🔧 Fix: Back Button & Offline UI Issues

## 🐛 Masalah yang Difix:

### 1. ❌ Back Button di Login Page Tidak Minimize App
**Masalah:** Saat user di halaman login, tekan tombol back pada device, app tidak minimize/keluar.

**Root Cause:** Code sebelumnya "allow default back behavior" yang artinya tidak melakukan apa-apa.

**Fix:** Change logic untuk **MINIMIZE APP** saat di login page.

**Code Changed:**
```javascript
// BEFORE (WRONG)
if (!user || isResetPassword) {
  console.log('On auth page, allowing default back');
  return; // Does nothing
}

// AFTER (CORRECT)
if (!user || isResetPassword) {
  console.log('On auth page, minimizing app');
  CapacitorApp.minimizeApp(); // Minimize app!
  return;
}
```

**Expected Behavior:**
- ✅ User di login page → Back button → App minimize (ke background)
- ✅ User logged in, di dashboard → Back button → App minimize
- ✅ User logged in, di halaman lain → Back button → Kembali ke dashboard
- ✅ Modal open → Back button → Close modal

---

### 2. ❌ UI Berantakan Saat Offline/Slow Network
**Masalah:** 
- App load lama saat internet lambat/hilang
- Text dan icon berantakan (tidak rapi)
- User dipaksa lihat UI yang belum siap

**Root Cause:** 
- Font loading dari Google Fonts terlalu cepat timeout
- Tidak ada indicator untuk offline mode
- Loader hilang sebelum UI siap

**Fix:** 
1. **Tambah offline indicator** banner di atas
2. **Increase timeout** dari 3 detik → 5 detik
3. **Tambah status text** di loader
4. **Better font loading fallback**

**Changes:**

#### Added Offline Banner:
```html
<div id="offline-banner" class="offline-banner">
  ⚠️ Tidak ada koneksi internet. Beberapa fitur mungkin tidak tersedia.
</div>
```

#### Updated Loader:
```html
<div class="loader-status" id="loader-status">Memeriksa koneksi...</div>
```

#### Online/Offline Detection:
```javascript
function updateOnlineStatus() {
  if (!navigator.onLine) {
    offlineBanner.classList.add('show');
    loaderStatus.textContent = 'Mode offline - Menunggu koneksi...';
  } else {
    offlineBanner.classList.remove('show');
    loaderStatus.textContent = 'Memuat resources...';
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
```

#### Increased Timeouts:
```javascript
// Font loading delay: 200ms → 500ms (more stable)
setTimeout(function() { ... }, 500);

// Fallback timeout: 3000ms → 5000ms (for slow networks)
setTimeout(function() { ... }, 5000);
```

**Expected Behavior:**
- ✅ Saat offline → Banner merah muncul di atas
- ✅ Loader status update: "Mode offline - Menunggu koneksi..."
- ✅ UI tidak muncul sebelum fonts loaded (no berantakan)
- ✅ Timeout lebih lama untuk jaringan lambat
- ✅ Saat online kembali → Banner hilang otomatis

---

## 📦 Build APK Baru

Setelah fix ini, perlu build APK baru:

```powershell
npm run build
npx cap sync android
npx cap open android
```

**In Android Studio:**
- Build > Build APK
- Install APK baru ke device

---

## ✅ Testing Checklist

### Test 1: Back Button di Login Page
- [ ] Open app (belum login)
- [ ] Tekan back button
- [ ] **Expected:** App minimize (ke background)
- [ ] Open app lagi
- [ ] App kembali ke login page (tidak close)

### Test 2: Back Button Setelah Login
- [ ] Login ke app
- [ ] Di dashboard, tekan back button
- [ ] **Expected:** App minimize
- [ ] Buka halaman lain (misal: Profile)
- [ ] Tekan back button
- [ ] **Expected:** Kembali ke dashboard

### Test 3: Offline Mode
- [ ] Matikan internet/WiFi
- [ ] Close app completely
- [ ] Open app
- [ ] **Expected:** 
  - Banner merah "Tidak ada koneksi internet" muncul
  - Loader status: "Mode offline - Menunggu koneksi..."
  - Loader hilang setelah 5 detik (bukan 3 detik)
  - UI tidak berantakan
- [ ] Hidupkan internet
- [ ] **Expected:** Banner merah hilang otomatis

### Test 4: Slow Network
- [ ] Set network ke 3G/2G (slow)
- [ ] Close app
- [ ] Open app
- [ ] **Expected:**
  - Loader status update
  - Loader tetap show sampai fonts loaded
  - Max 5 detik, baru hilang
  - UI rapi (tidak berantakan)

---

## 🎯 Summary of Changes

| File | Changes | Purpose |
|------|---------|---------|
| `src/App.jsx` | Back button handler updated | Minimize app di login page |
| `index.html` | Offline banner added | Show offline indicator |
| `index.html` | Loader status added | Show loading progress |
| `index.html` | Timeouts increased | Better slow network support |
| `index.html` | Online/offline detection | Auto hide/show banner |

---

## 🆘 Troubleshooting

### Issue: Back button masih tidak minimize
**Check:**
- APK sudah rebuild dengan code terbaru?
- Reinstall APK di device?
- Check console logs: "On auth page, minimizing app"

### Issue: Banner offline tidak muncul
**Check:**
- APK sudah rebuild?
- Coba matikan WiFi + Data seluler
- Check di desktop browser dulu (DevTools > Network > Offline)

### Issue: UI masih berantakan saat offline
**Check:**
- Tunggu 5 detik penuh (loader timeout)
- Clear app cache di device settings
- Reinstall app

---

## 📝 Technical Notes

### Back Button Behavior:
```
Login Page → Back Button → Minimize App ✅
Dashboard → Back Button → Minimize App ✅
Other Page → Back Button → Go to Dashboard ✅
Modal Open → Back Button → Close Modal ✅
```

### Loading States:
```
Online:
1. Show loader
2. Check fonts (500ms delay)
3. Remove loader
4. Show UI

Offline:
1. Show loader + offline banner
2. Try fonts (5000ms timeout)
3. Force remove loader
4. Show UI (may be degraded)
```

---

**Status: Fixed! ✅**

**Next: Build APK dan test di device!**
