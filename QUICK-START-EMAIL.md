# Quick Start: Email Notifications

## Ringkasan Singkat

Untuk mengaktifkan email notifications, ikuti 5 langkah ini:

---

## 1️⃣ Daftar Resend & Dapatkan API Key

1. **Daftar**: https://resend.com/signup (gratis, tidak perlu kartu kredit)
2. **Dashboard → API Keys → Create API Key**
3. **Copy API Key** (format: `re_xxxxx`)

---

## 2️⃣ Install & Setup Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ke project
cd c:\Users\Halut\Documents\GitHub\Arsip-Digital-Rendatin
supabase link --project-ref YOUR_PROJECT_REF
```

**Cara dapat Project Ref:**
- Supabase Dashboard → Project Settings → General → **Reference ID**

---

## 3️⃣ Deploy Edge Function

```bash
# Set secrets
supabase secrets set RESEND_API_KEY=re_your_api_key_here
supabase secrets set FROM_EMAIL=noreply@onboarding.resend.dev
supabase secrets set APP_URL=http://localhost:5173

# Deploy function
supabase functions deploy send-notification-email
```

---

## 4️⃣ Setup Database

Jalankan SQL di Supabase SQL Editor secara berurutan:

1. **`enable-pg-net-extension.sql`**
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_net;
   ```

2. **`create-email-notification-trigger.sql`**
   - ⚠️ **PENTING**: Edit file ini dulu!
   - Ganti `YOUR_PROJECT_REF` dengan project reference Anda
   - Baris 17: `edge_function_url := 'https://YOUR_PROJECT_REF.supabase.co/...'`

---

## 5️⃣ Test Email

1. Login ke aplikasi
2. Buka **Pengaturan → Notifikasi**
3. **Aktifkan "Notifikasi Email"**
4. **Aktifkan "Upload Dokumen"**
5. Simpan
6. Login user lain → Upload dokumen PUBLISHED
7. **Cek email** → Seharusnya dapat notifikasi

---

## Troubleshooting Cepat

### Email tidak terkirim?

**1. Cek Resend Logs:**
- https://resend.com/logs
- Lihat apakah request masuk

**2. Cek Edge Function Logs:**
```bash
supabase functions logs send-notification-email
```

**3. Cek Database Trigger:**
```sql
-- Cek function
SELECT * FROM pg_proc WHERE proname = 'send_email_notification';

-- Cek trigger
SELECT * FROM pg_trigger WHERE tgname = 'on_notification_created';
```

**4. Cek Secrets:**
```bash
supabase secrets list
```

### Error "pg_net extension not found"?

Jalankan:
```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

Jika masih error, berarti Supabase project Anda belum support pg_net.

**Solusi alternatif:** Gunakan Database Webhooks:
1. Supabase Dashboard → Database → Webhooks
2. Create webhook untuk table `notifications`
3. Event: `INSERT`
4. URL: Edge function URL
5. Method: `POST`

---

## Architecture

```
User uploads document
    ↓
notifyAllUsersExcept() checks preferences
    ↓
create_notification() inserts to database
    ↓
Database trigger fires
    ↓
Edge function called via pg_net
    ↓
Edge function calls Resend API
    ↓
Email sent ✅
```

---

## Limits (Free Tier)

- **Resend**: 100 emails/day, 3,000/month
- **Supabase Edge Functions**: 500,000 invocations/month
- **pg_net**: Unlimited (termasuk dalam Supabase)

---

## Next Steps

Setelah berhasil:
- [ ] Verifikasi domain sendiri di Resend
- [ ] Setup DKIM/SPF untuk better deliverability
- [ ] Buat email template yang lebih menarik
- [ ] Add weekly digest email
- [ ] Setup bounce handling

---

## Files Created

- ✅ `supabase/functions/send-notification-email/index.ts` - Edge function
- ✅ `create-email-notification-trigger.sql` - Database trigger
- ✅ `enable-pg-net-extension.sql` - Enable pg_net
- ✅ `SETUP-EMAIL-NOTIFICATIONS.md` - Full documentation

---

**Questions?** Lihat `SETUP-EMAIL-NOTIFICATIONS.md` untuk dokumentasi lengkap.
