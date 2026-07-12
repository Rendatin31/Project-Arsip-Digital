# 📁 Sistem Arsip Digital Rendatin

Sistem manajemen arsip digital berbasis web dengan fitur lengkap untuk mengelola dokumen, kategori, dan audit log.

## 🚀 Cara Menjalankan Aplikasi

### Prasyarat
- **Node.js** (versi 18 atau lebih baru)
- **npm** (biasanya sudah terinstall bersama Node.js)
- **Akun Supabase** (untuk database dan storage)

### Langkah 1: Install Dependencies

Jika `node_modules` belum ada, jalankan:

```bash
npm install
```

### Langkah 2: Konfigurasi Supabase

File `.env` sudah berisi konfigurasi Supabase:

```env
VITE_SUPABASE_URL=https://axpanhequppcviaimwte.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Pastikan database Supabase Anda sudah disetup dengan:**
1. Jalankan migrations di folder `supabase/migrations/`
2. Atau jalankan schema di `supabase/schema.sql`
3. (Opsional) Seed data dengan `supabase/seed.sql`

### Langkah 3: Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di **http://localhost:5173** (atau port lain jika 5173 sedang digunakan)

### Langkah 4: Login

Gunakan kredensial user yang sudah didaftarkan di Supabase Authentication.

Jika belum ada user, Anda bisa:
- Daftar melalui Supabase Dashboard > Authentication > Users > Add User
- Atau implementasi fitur register (saat ini belum ada di UI)

## 📜 Perintah Tersedia

```bash
npm run dev      # Menjalankan development server
npm run build    # Build untuk production
npm run preview  # Preview build production
npm run lint     # Menjalankan linter (Oxlint)
```

## 🏗️ Teknologi Stack

- **Frontend:** React 19 + Vite 8
- **Styling:** Tailwind CSS 4
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Libraries:** 
  - `@supabase/supabase-js` - Supabase client
  - `mammoth` - Konversi Word ke HTML
  - `xlsx` - Parse Excel files

## ✨ Fitur Utama

- ✅ Manajemen dokumen (Upload, Edit, Delete, Preview)
- ✅ Organisasi folder & kategori hierarkis
- ✅ Pencarian & filter dokumen
- ✅ Dashboard dengan statistik
- ✅ Audit log aktivitas
- ✅ Manajemen hak akses user
- ✅ Preview dokumen (PDF, Word, Excel, gambar)
- ✅ Row Level Security (RLS)

## 📁 Struktur Proyek

```
├── src/
│   ├── components/      # Komponen UI reusable
│   ├── pages/          # Halaman aplikasi
│   ├── lib/            # Konfigurasi (Supabase)
│   └── assets/         # File statis
├── supabase/           # Schema & migrations database
├── desain/             # Prototypes & dokumentasi desain
└── public/             # Assets publik
```

## 🔒 Keamanan

- Row Level Security (RLS) di Supabase
- Audit logging semua aktivitas
- Session management otomatis
- File storage dengan path isolation per user

## 📞 Support

Jika ada masalah, periksa:
1. Node.js version: `node --version` (minimal v18)
2. Dependencies terinstall: `npm install`
3. Supabase credentials di `.env` sudah benar
4. Database schema sudah dijalankan

---

**Happy Archiving! 📚**
