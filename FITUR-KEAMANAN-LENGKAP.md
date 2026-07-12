# Fitur Keamanan - Tab Keamanan (Lengkap)

## ✅ Fitur yang Sudah Diimplementasikan

### **1. Ubah Password dengan Show/Hide Toggle** 👁️
- ✅ **Password Saat Ini** - Field dengan eye icon
- ✅ **Password Baru** - Field dengan eye icon
- ✅ **Konfirmasi Password Baru** - Field dengan eye icon
- ✅ Icon `visibility` (mata terbuka) → Lihat password
- ✅ Icon `visibility_off` (mata tertutup) → Sembunyikan password
- ✅ Validasi lengkap (password match, min 6 karakter)
- ✅ Notifikasi keamanan setelah berhasil
- ✅ Loading state saat proses

### **2. Session Timeout Otomatis** ⏱️
- ✅ Setting timeout bisa diatur (15, 30, 60, 120 menit, Never)
- ✅ Auto logout setelah inactive sesuai setting
- ✅ Track user activity (mouse, keyboard, scroll, touch)
- ✅ Throttle activity updates (max 1x per menit)
- ✅ Check timeout every minute
- ✅ Alert sebelum logout
- ✅ Setting tersimpan di localStorage

---

## 🎯 Cara Menggunakan

### **A. Show/Hide Password**

1. **Buka Pengaturan → Keamanan**
2. **Ubah Password section**
3. **Klik icon mata** di kanan field password:
   - **Mata terbuka** (`visibility`) → Password terlihat (plain text)
   - **Mata tertutup** (`visibility_off`) → Password tersembunyi (dots)
4. **Toggle untuk setiap field** (password saat ini, baru, konfirmasi)

### **B. Session Timeout**

1. **Buka Pengaturan → Keamanan**
2. **Waktu Sesi section**
3. **Pilih timeout** dari dropdown:
   - 15 menit
   - 30 menit (default)
   - 60 menit
   - 120 menit
   - Never (tidak pernah timeout)
4. **Klik "Simpan Perubahan"**
5. **Setting langsung aktif**

---

## ⚙️ Cara Kerja Session Timeout

### **Activity Tracking:**
Events yang ditrack:
- `mousedown` - Klik mouse
- `mousemove` - Gerak mouse
- `keypress` - Tekan keyboard
- `scroll` - Scroll halaman
- `touchstart` - Touch pada mobile
- `click` - Klik element

### **Throttling:**
- Activity update **maksimal 1x per menit**
- Mencegah terlalu banyak localStorage writes
- Lebih efisien untuk performa

### **Timeout Check:**
- Cek setiap **1 menit**
- Jika inactive lebih dari setting → Auto logout
- Alert muncul sebelum redirect ke login

### **Storage:**
- Setting: `localStorage.session_timeout_minutes`
- Last activity: `localStorage.last_activity_time`
- Persist across browser reload

---

## 🔒 Keamanan

### **Password Visibility:**
- ✅ Toggle hanya mengubah `type` field (password ↔ text)
- ✅ Tidak mengirim ke server
- ✅ Aman untuk digunakan
- ✅ Standard UX pattern

### **Session Timeout:**
- ✅ Logout otomatis pada inactivity
- ✅ Mencegah unauthorized access
- ✅ Clear session data saat logout
- ✅ Configurable per user

---

## 🧪 Testing

### **Test 1: Show/Hide Password**
1. Buka Pengaturan → Keamanan
2. Ketik password di field "Password Saat Ini"
3. Password terlihat sebagai dots (••••••)
4. Klik icon mata → Password terlihat plain text
5. Klik lagi → Password kembali jadi dots
6. **Expected**: Toggle bekerja untuk semua 3 fields

### **Test 2: Session Timeout (15 menit)**
1. Login ke aplikasi
2. Pengaturan → Keamanan
3. Set timeout: **15 menit**
4. Simpan
5. Jangan lakukan aktivitas apapun
6. Tunggu **15 menit**
7. **Expected**: Alert "Sesi Anda telah berakhir..." → Auto logout

### **Test 3: Activity Extension**
1. Set timeout: **15 menit**
2. Tunggu **14 menit** (hampir timeout)
3. Klik mouse / gerakkan mouse / scroll
4. **Expected**: Timer reset, tidak logout

### **Test 4: Never Timeout**
1. Set timeout: **Never**
2. Simpan
3. Tunggu berapapun lama
4. **Expected**: Tidak pernah auto logout

---

## 📊 Architecture

### **Session Timeout Flow:**

```
User login
    ↓
Load session timeout setting (from localStorage)
    ↓
Init session timeout monitoring
    ↓
Track user activity (mouse, keyboard, scroll, etc)
    ↓
Update last_activity_time (throttled, max 1x/min)
    ↓
Check timeout every minute
    ↓
If (now - last_activity > timeout) → Auto logout
    ↓
Alert → Clear session → Redirect to login
```

### **File Structure:**

```
src/
├── utils/
│   └── sessionTimeout.js          # Session timeout utility
├── pages/
│   └── PengaturanSistemPage.jsx   # Settings UI
└── App.jsx                        # Init monitoring
```

---

## 🎨 UI/UX

### **Eye Icon:**
- Material Symbols icon: `visibility` / `visibility_off`
- Position: Absolute right dalam input field
- Color: `text-on-surface-variant` (gray)
- Hover: `text-on-surface` (darker)
- Size: 20px
- Transition: Smooth color change

### **Input Field:**
- Padding right: `pr-[40px]` (space for icon)
- Type: Dynamic (`password` atau `text`)
- Border focus: `focus:border-secondary`
- Ring focus: `focus:ring-1 focus:ring-secondary`

---

## ⚡ Performance

### **Optimizations:**
- ✅ Activity tracking dengan `{ passive: true }`
- ✅ Throttle updates (max 1x per menit)
- ✅ Interval check (1 menit, bukan setiap detik)
- ✅ Cleanup on unmount (prevent memory leak)
- ✅ LocalStorage (fast, persistent)

### **Memory Usage:**
- Minimal (hanya 2 localStorage keys)
- No server calls untuk tracking
- Cleanup saat logout

---

## 🐛 Known Issues & Limitations

### **Limitations:**
1. **Browser-specific**: Timeout setting per browser (tidak sync across devices)
2. **Tab-specific**: Each tab has own activity tracking
3. **localStorage limit**: Jarang terjadi, tapi bisa penuh
4. **Clock change**: Jika user ubah jam sistem, bisa affect timeout

### **Workarounds:**
1. Untuk sync across devices → Simpan di database (future enhancement)
2. Untuk multi-tab → Use BroadcastChannel API (future)
3. Untuk clock change → Use server timestamp (future)

---

## 🚀 Future Enhancements

### **Planned Features:**
- [ ] **Warning before timeout** (modal "Sesi akan berakhir dalam 2 menit")
- [ ] **Extend session button** (dalam warning modal)
- [ ] **Session history** (log kapan user login/logout)
- [ ] **IP tracking** (log IP address per session)
- [ ] **Device tracking** (browser, OS, device)
- [ ] **Force logout all devices** (terminate all sessions)
- [ ] **Login notifications** (email/push saat login dari device baru)
- [ ] **Sync timeout across tabs** (BroadcastChannel API)
- [ ] **Save to database** (sync across devices)

---

## ✅ Checklist

- [x] Show/Hide password toggle
- [x] Eye icon untuk semua password fields
- [x] Session timeout dropdown
- [x] Save timeout setting
- [x] Load timeout setting
- [x] Auto logout on inactivity
- [x] Activity tracking
- [x] Throttle updates
- [x] Clear session on logout
- [x] Alert before logout
- [x] Console logging for debugging

**Status: COMPLETED** ✅

---

## 📝 Quick Reference

### **Default Settings:**
- Session timeout: **30 menit**
- Password visibility: **Hidden** (dots)
- Activity throttle: **1 menit**
- Timeout check: **1 menit**

### **Storage Keys:**
- `session_timeout_minutes` - Timeout setting (number)
- `last_activity_time` - Last activity timestamp (ms)

### **Dropdown Options:**
```javascript
<option value="15">15 menit</option>
<option value="30">30 menit</option>
<option value="60">1 jam</option>
<option value="120">2 jam</option>
<option value="999999">Tidak pernah</option>
```

---

**Semua fitur sudah terimplementasi dan siap digunakan!** 🎉
