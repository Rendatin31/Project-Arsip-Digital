# Session Timeout Disabled untuk Mobile Device

## 📱 Perubahan

Session timeout (auto logout) telah **DINONAKTIFKAN** untuk aplikasi mobile device (native platform).

### Alasan
- Mobile apps didesain untuk tetap login terus-menerus
- User experience lebih baik tanpa auto logout di mobile
- Session timeout hanya berguna untuk web/desktop yang bisa diakses banyak orang

## ✅ Implementasi

### 1. **sessionTimeout.js** - Logic Disabled untuk Mobile
```javascript
export function initSessionTimeout(onTimeout) {
  // DISABLE session timeout for mobile devices (native platform)
  if (Capacitor.isNativePlatform()) {
    console.log('📱 Session timeout DISABLED on mobile device');
    return () => {}; // Empty cleanup
  }
  
  // ... rest of timeout logic for web/desktop
}
```

### 2. **PengaturanSistemPage.jsx** - UI Hidden untuk Mobile
```javascript
{/* Session Timeout - HIDDEN on Mobile Device */}
{!Capacitor.isNativePlatform() && (
  <div className="mb-md mt-md">
    {/* Timeout settings dropdown */}
  </div>
)}
```

## 🎯 Hasil

### Mobile Device (Android/iOS Native App)
- ❌ Session timeout **TIDAK AKTIF**
- ❌ Opsi timeout **TERSEMBUNYI** di halaman Pengaturan > Keamanan
- ✅ User tetap login sampai manual logout
- ✅ Console log: "📱 Session timeout DISABLED on mobile device"

### Web/Desktop (Browser)
- ✅ Session timeout **AKTIF** seperti biasa
- ✅ Opsi timeout **TAMPIL** di halaman Pengaturan > Keamanan
- ✅ Auto logout sesuai pengaturan (15/30/60/120 menit)
- ✅ Console log: "💻 Session timeout ENABLED on web/desktop"

## 📝 File yang Diubah

1. **src/utils/sessionTimeout.js**
   - Import `Capacitor` dari `@capacitor/core`
   - Check `Capacitor.isNativePlatform()` di `initSessionTimeout()`
   - Return empty cleanup function untuk mobile

2. **src/pages/PengaturanSistemPage.jsx**
   - Import `Capacitor` dari `@capacitor/core`
   - Wrap timeout settings dengan `{!Capacitor.isNativePlatform() && (...)}`

## 🧪 Testing

### Test di Mobile Device
1. Install APK di Android device
2. Login ke aplikasi
3. Buka **Pengaturan > Keamanan**
4. ✅ Opsi "Timeout Otomatis" **TIDAK TAMPIL**
5. ✅ Cek console: "📱 Session timeout DISABLED on mobile device"
6. ✅ Biarkan aplikasi idle 1+ jam, user **TIDAK** logout otomatis

### Test di Browser/Desktop
1. Buka aplikasi di browser
2. Login
3. Buka **Pengaturan > Keamanan**
4. ✅ Opsi "Timeout Otomatis" **TAMPIL**
5. ✅ Cek console: "💻 Session timeout ENABLED on web/desktop"
6. ✅ Biarkan idle sesuai timeout setting, user logout otomatis

## 📌 Catatan

- Session timeout hanya berlaku untuk web/desktop
- Mobile device tidak punya session timeout (normal behavior untuk mobile apps)
- User di mobile harus manual logout jika ingin keluar
- Security tetap terjaga karena mobile device umumnya personal (tidak shared)
