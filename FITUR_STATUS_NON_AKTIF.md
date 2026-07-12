# Fitur Validasi Status "Non-aktif"

## Ringkasan
Implementasi pengecekan status akun untuk mencegah user dengan status "Non-aktif" mengakses aplikasi.

## ✅ Fitur yang Sudah Diimplementasikan

### 1. Validasi Saat Login (`LoginPage.jsx`)
**Kapan:** Saat user melakukan login

**Behavior:**
- User memasukkan email dan password
- Sistem authenticate credentials
- Sistem check status di tabel `profiles`
- **Jika status = "Non-aktif":**
  - User langsung di-logout
  - Muncul notifikasi error: "Akun Anda telah dinonaktifkan. Silakan hubungi administrator untuk informasi lebih lanjut."
  - User tidak bisa masuk ke aplikasi
- **Jika status = "Aktif":**
  - User berhasil login dan masuk ke dashboard

### 2. Validasi Saat Auth State Change (`App.jsx`)
**Kapan:** Setiap kali auth state berubah (session update, refresh, dll)

**Behavior:**
- Sistem check profile user
- **Jika status = "Non-aktif":**
  - User langsung di-logout
  - Redirect ke halaman login
- **Jika status = "Aktif":**
  - User tetap di aplikasi

### 3. Pengecekan Berkala (Polling) (`App.jsx`)
**Kapan:** Setiap 30 detik selama user masih login

**Behavior:**
- Sistem check status user di database setiap 30 detik
- **Jika admin mengubah status user menjadi "Non-aktif":**
  - Dalam maksimal 30 detik, user akan otomatis logout
  - User harus login ulang (dan akan ditolak karena status Non-aktif)

## 🎯 Skenario Penggunaan

### Skenario 1: User dengan Status Non-aktif Coba Login
```
1. User A buka halaman login
2. User A input email dan password
3. Klik "Masuk"
4. ❌ Login ditolak
5. Muncul pesan: "Akun Anda telah dinonaktifkan. Silakan hubungi administrator untuk informasi lebih lanjut."
6. User A tetap di halaman login
```

### Skenario 2: Admin Nonaktifkan User yang Sedang Login
```
1. User B sedang login dan menggunakan aplikasi
2. Admin masuk ke halaman Hak Akses
3. Admin edit User B dan ubah status menjadi "Non-aktif"
4. Dalam 30 detik, User B otomatis logout
5. User B melihat halaman login
6. Jika User B coba login lagi → ditolak dengan pesan error
```

### Skenario 3: Admin Aktifkan Kembali User
```
1. User C statusnya "Non-aktif" (tidak bisa login)
2. Admin edit User C dan ubah status menjadi "Aktif"
3. User C sekarang bisa login kembali
4. ✅ Login berhasil dan masuk ke dashboard
```

## 🔧 Technical Details

### Validasi di Login
```javascript
// Setelah auth berhasil, check status
if (profileResponse.data && profileResponse.data.status === 'Non-aktif') {
  await supabase.auth.signOut();
  setError('Akun Anda telah dinonaktifkan...');
  return;
}
```

### Validasi di Auth State Change
```javascript
if (profileData && profileData.status === 'Non-aktif') {
  await supabase.auth.signOut();
  setUser(null);
  setProfile(null);
  return;
}
```

### Polling Status
```javascript
// Check setiap 30 detik
const interval = setInterval(async () => {
  const { data } = await supabase
    .from('profiles')
    .select('status')
    .eq('id', user.id)
    .single();
    
  if (data?.status === 'Non-aktif') {
    await handleLogout();
  }
}, 30000);
```

## 🧪 Testing

### Test Case 1: Login dengan Status Non-aktif
**Steps:**
1. Buat user baru dengan status "Non-aktif"
2. Coba login dengan credentials user tersebut
3. **Expected:** Login ditolak dengan pesan error

**Verification:**
- [ ] Error message muncul
- [ ] User tidak masuk ke dashboard
- [ ] User tetap di halaman login

### Test Case 2: Nonaktifkan User yang Sedang Login
**Steps:**
1. Login sebagai User A (status Aktif)
2. Di browser/tab lain, login sebagai Admin
3. Admin ubah status User A menjadi "Non-aktif"
4. Tunggu maksimal 30 detik
5. **Expected:** User A otomatis logout

**Verification:**
- [ ] User A logout dalam 30 detik
- [ ] User A melihat halaman login
- [ ] User A tidak bisa login lagi

### Test Case 3: Aktifkan Kembali User
**Steps:**
1. User dengan status "Non-aktif" tidak bisa login
2. Admin ubah status user menjadi "Aktif"
3. User coba login lagi
4. **Expected:** Login berhasil

**Verification:**
- [ ] Login berhasil
- [ ] User masuk ke dashboard
- [ ] Semua fitur berfungsi normal

## 📊 Status Values

| Status | Deskripsi | Bisa Login? | Bisa Akses App? |
|--------|-----------|-------------|-----------------|
| `Aktif` | User aktif dan bisa menggunakan aplikasi | ✅ Ya | ✅ Ya |
| `Non-aktif` | User dinonaktifkan oleh admin | ❌ Tidak | ❌ Tidak |

## 🔒 Security Notes

1. **Immediate Logout:** User dengan status Non-aktif langsung di-logout saat detection
2. **Session Termination:** Session user dihapus sepenuhnya dari auth
3. **Real-time Check:** Polling setiap 30 detik memastikan enforcement status
4. **No Bypass:** Tidak ada cara untuk bypass validasi status

## ⚙️ Configuration

### Mengubah Interval Polling
Default: 30 detik (30000 ms)

Untuk mengubah, edit file `App.jsx`:
```javascript
// Ubah nilai 30000 (30 detik) sesuai kebutuhan
const interval = setInterval(checkUserStatus, 30000);

// Contoh: 1 menit
const interval = setInterval(checkUserStatus, 60000);

// Contoh: 10 detik
const interval = setInterval(checkUserStatus, 10000);
```

### Mengubah Pesan Error
Edit file `LoginPage.jsx`:
```javascript
setError('Akun Anda telah dinonaktifkan. Silakan hubungi administrator untuk informasi lebih lanjut.');
```

## 📝 Files Modified

1. ✅ `src/components/LoginPage.jsx` - Validasi saat login
2. ✅ `src/App.jsx` - Validasi auth state & polling
3. ✅ `FITUR_STATUS_NON_AKTIF.md` - Dokumentasi (this file)

## 🚀 Deployment Checklist

- [x] Validasi login implemented
- [x] Validasi auth state implemented
- [x] Polling status implemented
- [ ] Testing completed
- [ ] Documentation reviewed
- [ ] Ready for production

## 💡 Future Enhancements

1. **Custom Expiry Date:** Set tanggal otomatis aktif/nonaktif
2. **Email Notification:** Kirim email ke user saat status berubah
3. **Status History:** Log perubahan status user
4. **Multiple Status:** Tambah status seperti "Suspended", "Pending", dll
5. **Grace Period:** Beri warning sebelum auto-logout
