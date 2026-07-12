# Fitur Ubah Password - Tab Keamanan

## ✅ Sudah Diimplementasikan

Fitur ubah password di **Pengaturan Sistem → Tab Keamanan** sekarang sudah berfungsi penuh dengan fitur:

### **Fitur:**
1. ✅ Validasi password saat ini
2. ✅ Validasi password baru (min 6 karakter)
3. ✅ Validasi konfirmasi password
4. ✅ Update password menggunakan Supabase Auth
5. ✅ Kirim notifikasi keamanan setelah password berubah
6. ✅ Clear form setelah berhasil
7. ✅ Loading state saat proses
8. ✅ Error handling yang baik

---

## 🔐 Cara Menggunakan

### **1. Buka Pengaturan Sistem**
- Klik icon gear di header
- Atau menu Sidebar → Pengaturan

### **2. Tab Keamanan**
- Klik tab "Keamanan"

### **3. Ubah Password**
Form terdiri dari 3 field:
- **Password Saat Ini**: Masukkan password lama
- **Password Baru**: Masukkan password baru (minimal 6 karakter)
- **Konfirmasi Password Baru**: Ketik ulang password baru

### **4. Simpan**
- Klik "Simpan Perubahan"
- Tombol akan berubah jadi "Menyimpan..." dengan loading spinner
- Tunggu proses selesai

### **5. Notifikasi**
Setelah berhasil:
- ✅ Alert konfirmasi
- ✅ Form otomatis dikosongkan
- ✅ Notifikasi keamanan dikirim (cek bell icon)

---

## 🔒 Keamanan

### **Validasi:**
- ✅ Password saat ini harus benar (verifikasi via sign in)
- ✅ Password baru minimal 6 karakter
- ✅ Konfirmasi password harus sama
- ✅ Tidak bisa submit jika ada field kosong

### **Notifikasi Keamanan:**
Setiap password berubah, user akan dapat notifikasi:
- **Type**: `security`
- **Title**: "Password Berhasil Diubah"
- **Message**: "Password akun Anda telah berhasil diubah pada [tanggal/waktu]"

Ini penting untuk:
- Deteksi perubahan tidak sah
- Audit trail aktivitas keamanan
- User awareness

---

## 🎯 Flow Proses

```
User mengisi form ubah password
    ↓
Klik "Simpan Perubahan"
    ↓
Validasi input (password match, length)
    ↓
Verifikasi password saat ini (sign in)
    ↓
Update password via Supabase Auth
    ↓
Kirim notifikasi keamanan
    ↓
Clear form & tampilkan sukses message
    ↓
User dapat notifikasi di bell icon ✅
```

---

## 🐛 Error Handling

### **Error: "Password saat ini salah"**
- User memasukkan password lama yang salah
- Solusi: Coba lagi dengan password yang benar

### **Error: "Password baru tidak cocok"**
- Konfirmasi password tidak sama dengan password baru
- Solusi: Ketik ulang konfirmasi password

### **Error: "Password minimal 6 karakter"**
- Password baru terlalu pendek
- Solusi: Gunakan password minimal 6 karakter

### **Error: "Masukkan password saat ini untuk mengubah password"**
- Field password saat ini kosong
- Solusi: Isi password saat ini

### **Error dari Supabase:**
- Network error atau masalah server
- Tampilkan error message dari Supabase
- Solusi: Coba lagi atau hubungi admin

---

## 📊 Logging

Console log untuk debugging:
```javascript
console.log('Updating password...')
console.log('Password updated successfully')
```

---

## 🔄 State Management

### **State Variables:**
```javascript
const [currentPassword, setCurrentPassword] = useState('')
const [newPassword, setNewPassword] = useState('')
const [confirmPassword, setConfirmPassword] = useState('')
const [savingPassword, setSavingPassword] = useState(false)
```

### **Loading State:**
- `savingPassword = true`: Tombol disabled, loading spinner muncul
- `savingPassword = false`: Tombol enabled, proses selesai

---

## 🧪 Testing

### **Test Case 1: Password Berhasil Diubah**
1. Login sebagai user
2. Buka Pengaturan → Keamanan
3. Isi password saat ini: `oldpassword123`
4. Isi password baru: `newpassword456`
5. Isi konfirmasi: `newpassword456`
6. Klik Simpan
7. **Expected**: Alert sukses, form cleared, notifikasi muncul

### **Test Case 2: Password Saat Ini Salah**
1. Isi password saat ini: `wrongpassword`
2. Isi password baru & konfirmasi
3. Klik Simpan
4. **Expected**: Alert "Password saat ini salah"

### **Test Case 3: Password Baru Tidak Cocok**
1. Isi password saat ini benar
2. Password baru: `test123`
3. Konfirmasi: `test456` (berbeda)
4. Klik Simpan
5. **Expected**: Alert "Password baru tidak cocok"

### **Test Case 4: Password Terlalu Pendek**
1. Isi password saat ini benar
2. Password baru: `12345` (5 karakter)
3. Konfirmasi: `12345`
4. Klik Simpan
5. **Expected**: Alert "Password minimal 6 karakter"

---

## 🚀 Next Steps (Optional Enhancement)

Fitur tambahan yang bisa diimplementasikan:
- [ ] Password strength indicator (weak/medium/strong)
- [ ] Show/hide password toggle (eye icon)
- [ ] Password requirements list (uppercase, number, symbol)
- [ ] Password history (prevent reuse of old passwords)
- [ ] Force password change on first login
- [ ] Password expiry (wajib ganti setiap X hari)
- [ ] Email notification untuk perubahan password
- [ ] Two-factor authentication (2FA)
- [ ] Session management (logout all devices)

---

## ✅ Checklist

- [x] Form ubah password
- [x] Validasi input
- [x] Verifikasi password lama
- [x] Update password via Supabase
- [x] Kirim notifikasi keamanan
- [x] Loading state
- [x] Error handling
- [x] Clear form setelah sukses
- [x] UI feedback (alert)

**Status: COMPLETED** ✅
