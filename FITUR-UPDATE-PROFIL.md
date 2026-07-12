# Fitur Update Profil - Tab Profil

## ✅ Yang Sudah Diimplementasikan

### **1. Update Nama Lengkap**
- ✅ Field input nama lengkap
- ✅ Validasi tidak boleh kosong
- ✅ Update ke database `profiles` table
- ✅ Refresh data setelah update

### **2. Update Bio Singkat**
- ✅ Textarea untuk bio
- ✅ Opsional (boleh kosong)
- ✅ Update ke database

### **3. Email Field (Disabled)**
- ✅ Field email **disabled** (tidak bisa edit)
- ✅ Background abu-abu (`bg-surface-container-high`)
- ✅ Opacity 60%
- ✅ Cursor `not-allowed`
- ✅ Tooltip "Email tidak dapat diubah"
- ✅ Info text di bawah field

### **4. Loading State**
- ✅ Tombol "Menyimpan..." dengan spinner
- ✅ Disable tombol saat proses
- ✅ Loading state per tab (profil, keamanan)

---

## 🎯 Cara Menggunakan

### **Update Profil:**

1. **Login ke aplikasi**
2. **Klik icon gear** di header atau **menu Pengaturan**
3. **Tab Profil** (default tab)
4. **Edit data:**
   - **Nama Lengkap**: Ubah nama (required)
   - **Email**: Tidak bisa diubah (disabled field)
   - **Bio Singkat**: Isi bio (opsional)
5. **Klik "Simpan Perubahan"**
6. **Tunggu loading** (tombol jadi "Menyimpan...")
7. **Alert konfirmasi**: "Profil berhasil diperbarui!"

---

## 🔒 Kenapa Email Tidak Bisa Diubah?

### **Alasan Keamanan:**
1. **Email = Login credential** - Digunakan untuk autentikasi
2. **Prevent hijacking** - Mencegah akun diambil alih
3. **Email verification** - Perlu verifikasi email baru
4. **Audit trail** - Email harus konsisten untuk logging
5. **Admin control** - Hanya admin yang bisa ubah email user

### **Jika Perlu Ubah Email:**
User harus:
1. Hubungi administrator
2. Admin login ke panel Hak Akses
3. Admin edit user → Ubah email
4. User logout & login dengan email baru

---

## 📊 Database Schema

### **Table: `profiles`**
```sql
- id (uuid) - FK to auth.users
- full_name (text) - Nama lengkap ✅
- bio (text) - Bio singkat ✅
- email (text) - Email (dari auth.users)
- role (text) - Role user
- status (text) - Status aktif/non-aktif
- created_at (timestamptz)
- updated_at (timestamptz) ✅
```

### **Update Query:**
```javascript
await supabase
  .from('profiles')
  .update({
    full_name: fullName.trim(),
    bio: bio?.trim() || null,
    updated_at: new Date().toISOString()
  })
  .eq('id', userId);
```

---

## ✅ Validasi

### **Nama Lengkap:**
- ✅ **Required** (tidak boleh kosong)
- ✅ **Trim whitespace** (hapus spasi di awal/akhir)
- ✅ **Error handling** (alert jika gagal)

### **Bio:**
- ✅ **Optional** (boleh kosong)
- ✅ **Trim whitespace**
- ✅ **NULL jika kosong**

### **Email:**
- ✅ **Read-only** (tidak bisa edit)
- ✅ **Tidak ter-submit** ke server

---

## 🎨 UI/UX

### **Email Field (Disabled):**
```jsx
<input
  type="email"
  value={email}
  disabled
  className="bg-surface-container-high ... opacity-60 cursor-not-allowed"
  title="Email tidak dapat diubah"
/>
```

**Visual:**
- Background: Abu-abu terang
- Opacity: 60%
- Cursor: `not-allowed` (simbol larangan)
- Border: Sama dengan field lain tapi tidak fokus

### **Loading State:**
```jsx
{savingProfile && (
  <span className="animate-spin">⏳</span>
)}
{savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
```

**Behavior:**
- Tombol disabled
- Spinner muncul
- Text berubah "Menyimpan..."
- Tombol Batalkan juga disabled

---

## 🧪 Testing

### **Test 1: Update Nama**
1. Login ke aplikasi
2. Pengaturan → Profil
3. Ubah "Nama Lengkap": `John Doe`
4. Klik Simpan
5. **Expected**: Alert "Profil berhasil diperbarui!"

### **Test 2: Update Bio**
1. Ubah "Bio Singkat": `Software Engineer`
2. Klik Simpan
3. **Expected**: Alert sukses

### **Test 3: Nama Kosong**
1. Hapus semua text di "Nama Lengkap"
2. Klik Simpan
3. **Expected**: Alert "Nama lengkap tidak boleh kosong!"

### **Test 4: Email Disabled**
1. Coba klik field "Alamat Email"
2. **Expected**: Tidak bisa edit, cursor larangan
3. **Expected**: Tooltip "Email tidak dapat diubah"

### **Test 5: Loading State**
1. Ubah nama
2. Klik Simpan (cepat!)
3. **Expected**: Tombol jadi "Menyimpan..." dengan spinner
4. **Expected**: Tombol disabled

### **Test 6: Refresh Data**
1. Update nama: `Test User`
2. Simpan
3. Reload page
4. **Expected**: Nama tetap `Test User`

---

## 🐛 Error Handling

### **Error Database:**
```javascript
if (updateError) {
  console.error('Error updating profile:', updateError);
  setSavingProfile(false);
  alert('Gagal memperbarui profil: ' + updateError.message);
  return;
}
```

### **Error Validasi:**
- Nama kosong → Alert & stop
- Network error → Alert dengan error message
- Permission denied → Alert RLS error

---

## 🚀 Future Enhancements

### **Avatar Upload:**
- [ ] Upload photo profil
- [ ] Crop & resize image
- [ ] Max file size: 2MB
- [ ] Format: JPG, PNG, WEBP
- [ ] Preview before upload
- [ ] Delete avatar

### **Additional Fields:**
- [ ] Phone number
- [ ] Address
- [ ] Department
- [ ] Position/Title
- [ ] Birth date

### **Email Change:**
- [ ] Request email change (perlu admin approval)
- [ ] Email verification link
- [ ] Confirm with password
- [ ] Security notification

---

## ✅ Checklist

- [x] Update nama lengkap
- [x] Update bio
- [x] Email field disabled
- [x] Validasi nama required
- [x] Loading state
- [x] Error handling
- [x] Database update
- [x] Refresh data setelah save
- [x] Alert konfirmasi
- [x] Tooltip & info text
- [ ] Avatar upload (future)

**Status: COMPLETED** ✅

---

## 📝 Quick Reference

### **Default Values:**
- Nama: Dari `profile.full_name`
- Email: Dari `user.email` (read-only)
- Bio: Dari `profile.bio` (optional)

### **State Variables:**
```javascript
const [fullName, setFullName] = useState('')
const [email, setEmail] = useState('')  // Read-only
const [bio, setBio] = useState('')
const [savingProfile, setSavingProfile] = useState(false)
```

### **Database Update:**
```javascript
supabase
  .from('profiles')
  .update({ full_name, bio, updated_at })
  .eq('id', userId)
```
