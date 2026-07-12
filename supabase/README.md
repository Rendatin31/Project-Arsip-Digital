# Setup Database Supabase

## Langkah 1 - Buat Tabel
Buka Supabase Dashboard -> SQL Editor -> Paste isi `schema.sql` -> Run.

## Langkah 2 - Tambah Kolom user_id ke Categories
Jalankan isi `migrations/20250101000000_add_user_id_to_categories.sql` di SQL Editor.

## Langkah 3 - Storage
Buka Supabase Dashboard -> Storage -> Create bucket `documents` (public = false).

## Langkah 4 - Tambah Kolom Metadata Surat
Jalankan isi `migrations/20250101000001_add_letter_metadata.sql` di SQL Editor untuk menambahkan kolom `tanggal surat`, `asal surat`, dan `tujuan surat` di tabel `documents`.

## Langkah 5 - Tambah Kolom Keterangan Kategori
Jalankan isi `migrations/20250101000002_add_category_description.sql` di SQL Editor untuk menambahkan kolom `description` di tabel `categories`.

## Langkah 6 - Buat Tabel Direktori
Jalankan isi `migrations/20250101000003_create_directories.sql` di SQL Editor untuk membuat tabel `directories` dan menghubungkan dokumen ke direktori.

## Langkah 7 - Buat User Auth Dummy
Buka Supabase Dashboard -> Authentication -> Add User
- Email: `admin@arsip.go.id`
- Password: `admin123`
- Catat UUID user yang terbuat

## Langkah 8 - Seed Data Dummy
Update UUID placeholder di `seed.sql` dengan UUID user asli, lalu jalankan di SQL Editor.
