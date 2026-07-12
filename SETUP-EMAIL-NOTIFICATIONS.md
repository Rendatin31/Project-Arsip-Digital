# Setup Email Notifications dengan Resend

## Langkah 1: Daftar Resend Account

1. Buka https://resend.com/signup
2. Daftar dengan email Anda (gratis)
3. Verifikasi email
4. Login ke dashboard

## Langkah 2: Dapatkan API Key

1. Di Resend Dashboard → **API Keys**
2. Klik **Create API Key**
3. Beri nama: `Arsip Digital Rendatin`
4. Permission: **Full Access**
5. Klik **Create**
6. **Copy API Key** (hanya muncul sekali!)
   - Format: `re_xxxxxxxxxxxxxxxxx`

## Langkah 3: Verifikasi Domain (Optional tapi Recommended)

### Opsi A: Gunakan Domain Sendiri (Recommended untuk Production)
1. Di Resend Dashboard → **Domains**
2. Klik **Add Domain**
3. Masukkan domain Anda (contoh: `rendatin.id`)
4. Tambahkan DNS records yang diberikan ke domain provider Anda:
   - TXT record untuk verifikasi
   - DKIM records untuk security
   - MX records (optional)
5. Tunggu verifikasi (bisa 5-30 menit)

### Opsi B: Gunakan Resend Domain (Untuk Testing)
Resend menyediakan domain `onboarding.resend.dev` untuk testing.
- Langsung bisa digunakan tanpa verifikasi
- Email akan dari `noreply@onboarding.resend.dev`
- **Hanya untuk development/testing**

## Langkah 4: Setup Supabase Edge Function

### A. Install Supabase CLI (jika belum)

**Windows:**
```bash
# Install via Scoop
scoop install supabase

# Atau via npm
npm install -g supabase
```

**Verifikasi:**
```bash
supabase --version
```

### B. Login ke Supabase
```bash
supabase login
```

### C. Link ke Project
```bash
cd c:\Users\Halut\Documents\GitHub\Arsip-Digital-Rendatin
supabase link --project-ref YOUR_PROJECT_REF
```

**Cara dapat Project Ref:**
1. Buka Supabase Dashboard
2. Project Settings → General
3. Copy **Reference ID**

### D. Setup Edge Function

**Buat folder structure:**
```bash
supabase functions new send-notification-email
```

Ini akan membuat folder `supabase/functions/send-notification-email/`

### E. Copy Kode Edge Function

Buka file yang sudah saya buat:
- `supabase/functions/send-notification-email/index.ts`

Paste kode dari file `email-notification-edge-function.ts` yang saya sediakan.

### F. Set Environment Variables

**Set RESEND_API_KEY sebagai secret:**
```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

**Set FROM_EMAIL:**
```bash
# Jika pakai domain sendiri:
supabase secrets set FROM_EMAIL=noreply@yourdomain.com

# Jika pakai Resend onboarding domain (testing):
supabase secrets set FROM_EMAIL=noreply@onboarding.resend.dev
```

### G. Deploy Edge Function
```bash
supabase functions deploy send-notification-email
```

## Langkah 5: Setup Database Trigger

Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- File: create-email-notification-trigger.sql
```

SQL ini akan:
1. Membuat function yang dipanggil setiap ada notifikasi baru
2. Cek apakah user mengaktifkan email notifications
3. Panggil Edge Function untuk kirim email

## Langkah 6: Test Email Notification

1. Login sebagai user A
2. Buka Pengaturan → Notifikasi
3. **Aktifkan "Notifikasi Email"**
4. Aktifkan "Upload Dokumen"
5. Simpan
6. Login sebagai user B
7. Upload dokumen PUBLISHED
8. **Cek email user A** → Seharusnya dapat email notifikasi

## Troubleshooting

### Email Tidak Terkirim

**Cek 1: Resend Dashboard**
- Buka Resend Dashboard → Logs
- Lihat apakah ada request yang masuk
- Cek status: Success/Failed

**Cek 2: Edge Function Logs**
```bash
supabase functions logs send-notification-email
```

**Cek 3: Database Trigger**
```sql
-- Cek apakah function ada
SELECT * FROM pg_proc WHERE proname = 'send_email_notification';

-- Cek apakah trigger ada
SELECT * FROM pg_trigger WHERE tgname = 'on_notification_created';
```

**Cek 4: Secrets**
```bash
supabase secrets list
```

Pastikan `RESEND_API_KEY` dan `FROM_EMAIL` ada.

### Email Masuk Spam

Jika email masuk spam folder:
1. **Verifikasi domain** di Resend (bukan pakai onboarding domain)
2. Setup **DKIM, SPF, DMARC** records
3. Gunakan **from email** yang kredibel (contoh: `noreply@rendatin.id`)
4. Tambahkan **Reply-To** header
5. Hindari kata-kata spam di subject/body

### Rate Limit

Resend Free Tier:
- **100 emails/day**
- **3,000 emails/month**

Jika butuh lebih, upgrade ke paid plan ($20/month untuk 50,000 emails).

## Monitoring

### Resend Dashboard
- **Analytics** → Lihat delivery rate, open rate, click rate
- **Logs** → Lihat detail setiap email
- **Webhooks** → Setup webhook untuk bounce/complaint handling

### Supabase Logs
```bash
# Real-time logs
supabase functions logs send-notification-email --tail

# Specific time range
supabase functions logs send-notification-email --since 1h
```

## Advanced: Email Template HTML

Untuk email yang lebih menarik, edit file `email-templates.ts`:
- Gunakan HTML/CSS inline
- Responsive design
- Branding (logo, warna)
- CTA buttons

Contoh template sudah saya sediakan di file `email-notification-edge-function.ts`.

## Biaya

**Resend Pricing:**
- **Free**: 100 emails/day, 3,000/month
- **Pro**: $20/month, 50,000 emails/month
- **Enterprise**: Custom pricing

**Supabase Edge Functions:**
- **Free**: 500,000 invocations/month
- **Pro**: 2,000,000 invocations/month
- Biasanya gratis untuk use case seperti ini

## Security

- ✅ API Key disimpan sebagai secret (tidak di kode)
- ✅ Edge Function hanya bisa dipanggil dari database trigger
- ✅ User data tidak exposed
- ✅ Email hanya terkirim jika preference enabled

## Next Steps

Setelah email notifications berjalan:
1. Setup **weekly report** email (digest semua aktivitas)
2. Setup **bounce handling** (jika email bounce, update user profile)
3. Setup **unsubscribe link** (user bisa unsubscribe via email)
4. Add **email templates** untuk berbagai jenis notifikasi
