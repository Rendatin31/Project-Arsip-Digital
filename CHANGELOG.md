# Changelog

## [Unreleased]

### Changed
- **Title Tab Browser**: Sekarang title berubah dinamis sesuai halaman yang aktif:
  - Dashboard: "Arsip Digital - Dashboard"
  - File Saya: "Arsip Digital - File Saya"
  - Direktori Arsip: "Arsip Digital - Direktori Arsip"
  - Kategori: "Arsip Digital - Kategori"
  - Pencarian Pintar: "Arsip Digital - Pencarian Pintar"
  - Riwayat Aktivitas: "Arsip Digital - Riwayat Aktivitas"
  - Hak Akses: "Arsip Digital - Hak Akses"
  - Pengaturan Sistem: "Arsip Digital - Pengaturan Sistem"

- **Favicon**: Logo tab browser diganti dengan logo KPU yang sama dengan halaman login

### Added
- Custom hook `usePageTitle` untuk mengelola perubahan title halaman secara dinamis
- **Loading Screen**: Menambahkan spinner loading saat aplikasi pertama kali dibuka
- **Font Loading Strategy**: Menggunakan `font-display: block` untuk mencegah FOUT (Flash of Unstyled Text)

### Fixed
- **FOUT Issue**: Memperbaiki masalah font yang berubah-ubah saat pertama kali membuka aplikasi
- Font sekarang dimuat dengan benar sebelum konten ditampilkan
