# 📧 Cara Update Email Template Reset Password

## 🎯 Langkah Cepat

### 1. Buka Supabase Dashboard
```
https://supabase.com/dashboard
```

### 2. Navigasi ke Email Templates
```
Authentication → Email Templates
```

### 3. Pilih Template "Reset Password"
Atau "Password Recovery" (tergantung versi Supabase)

### 4. Copy Template HTML
- Buka file: `email-template-reset-password.html`
- Copy seluruh isi file
- Paste ke editor di Supabase Dashboard

### 5. Update Subject Line
```
Permintaan Reset Kata Sandi - e-Arsip
```

### 6. Save Template
Klik button "Save" atau "Update"

### 7. Test Email
- Buka aplikasi → Login page
- Klik "Lupa Kata Sandi?"
- Input email → Kirim
- Check inbox email ✅

---

## 📋 Preview Email

Email akan tampil seperti ini:

```
┌────────────────────────────────────────┐
│         e-Arsip Digital                │
│       Sistem Arsip Digital             │  ← Header gradient purple
├────────────────────────────────────────┤
│                                        │
│ Kepada Yth. Pengguna Aplikasi          │
│ Arsip Digital,                         │
│                                        │
│ Kami telah menerima permintaan untuk  │
│ mereset kata sandi akun Anda.          │
│                                        │
│ Untuk melanjutkan proses reset kata   │
│ sandi, silakan klik tombol di bawah:   │
│                                        │
│     ┌──────────────────────┐          │
│     │  Reset Kata Sandi    │          │  ← Button gradient
│     └──────────────────────┘          │
│                                        │
│ Atau copy link:                        │
│ ┌────────────────────────────────┐    │
│ │ https://...                    │    │  ← Link box
│ └────────────────────────────────┘    │
│                                        │
│ ⏱️ Penting:                            │
│ Link reset ini akan kadaluarsa         │  ← Warning box
│ dalam waktu 1 jam                      │
│                                        │
│ ℹ️ Catatan:                            │
│ Apabila Anda tidak melakukan           │  ← Info box
│ permintaan ini, mohon abaikan email    │
│ ini. Kata sandi Anda akan tetap aman.  │
│                                        │
├────────────────────────────────────────┤
│ Terima kasih atas perhatian Anda.     │
│ Tim e-Arsip Digital                    │  ← Footer
│                                        │
│ Email ini dikirim secara otomatis      │
└────────────────────────────────────────┘
```

---

## 🎨 Fitur Template

### ✅ Design Modern:
- Header gradient purple/violet
- Button gradient dengan shadow
- Box warning & info dengan warna berbeda
- Footer professional

### ✅ Responsive:
- Mobile-friendly (max-width 600px)
- Email client compatible
- Table-based layout (best for email)

### ✅ Clear CTA:
- Button "Reset Kata Sandi" prominent
- Alternative link provided
- Warning tentang expiry time

### ✅ Security Info:
- Expiry time (1 jam)
- Info jika tidak request
- Auto-generated warning

---

## 🔧 Customization (Optional)

### Ubah Warna:

**Header & Button Gradient:**
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

Ganti dengan warna lain:
- Green: `#11998e 0%, #38ef7d 100%`
- Blue: `#2196F3 0%, #21CBF3 100%`
- Red: `#f12711 0%, #f5af19 100%`

**Warning Box:**
```css
background-color: #fff3cd;
border-left: 4px solid #ffc107;
```

**Info Box:**
```css
background-color: #e7f3ff;
border-left: 4px solid #2196F3;
```

### Tambah Logo:

Setelah header, tambahkan:
```html
<tr>
  <td align="center" style="padding: 20px 0;">
    <img src="YOUR_LOGO_URL" 
         alt="e-Arsip Logo" 
         style="max-width: 150px; height: auto;">
  </td>
</tr>
```

### Ubah Text Footer:

```html
<p style="margin: 0; color: #999; font-size: 12px; text-align: center;">
  Email ini dikirim oleh Sistem e-Arsip Digital<br>
  Alamat: [Alamat Kantor Anda]<br>
  Telepon: [Nomor Telepon]
</p>
```

---

## 🧪 Testing Checklist

- [ ] Login ke Supabase Dashboard
- [ ] Buka Authentication → Email Templates
- [ ] Pilih template "Reset Password"
- [ ] Copy-paste template dari file
- [ ] Update subject line
- [ ] Save template
- [ ] Test kirim reset password
- [ ] Check email inbox
- [ ] Verify tampilan email (desktop & mobile)
- [ ] Test klik button "Reset Kata Sandi"
- [ ] Verify redirect ke halaman reset ✅

---

## 📱 Email Clients Tested

Template ini compatible dengan:
- ✅ Gmail (Web & App)
- ✅ Outlook (Web & Desktop)
- ✅ Yahoo Mail
- ✅ Apple Mail (iOS & macOS)
- ✅ Android Email Apps
- ✅ Thunderbird

---

## 🆘 Troubleshooting

### Email tidak terkirim
- Check SMTP settings di Supabase
- Verify email user valid
- Check spam folder

### Tampilan email berantakan
- Pastikan copy seluruh HTML (termasuk DOCTYPE)
- Jangan edit HTML di plain text mode
- Use "Source Code" editor di Supabase

### Button tidak klik-able
- Verify `{{ .ConfirmationURL }}` ada di href
- Check URL tidak tertruncate
- Test di browser langsung

### Link kadaluarsa terlalu cepat
- Default 1 jam (Supabase setting)
- Ubah di: Project Settings → Auth → Email Settings → Expiry time

---

## 📚 Resources

- File template: `email-template-reset-password.html`
- Supabase Email Docs: https://supabase.com/docs/guides/auth/auth-email-templates
- Email Testing: https://litmus.com/

---

## ✅ Done!

Setelah setup:
- Email reset password akan tampil professional
- Bahasa Indonesia ✅
- Design modern & responsive ✅
- Clear call-to-action ✅
