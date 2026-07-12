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
- **Enhanced Loading Screen**: 
  - Spinner loading dengan teks "Memuat Arsip Digital..."
  - Menunggu hingga font Inter dan Material Icons selesai dimuat
  - Smooth fade-in transition untuk konten aplikasi
- **Font Loading Strategy**: 
  - Menggunakan `font-display: block` untuk mencegah FOUT (Flash of Unstyled Text)
  - Preload font Inter dan Material Symbols Outlined
  - Promise-based font loading detection

### Fixed
- **FOUT Issue**: Memperbaiki masalah font yang berubah-ubah saat pertama kali membuka aplikasi
- **Sidebar Layout Issue**: Memperbaiki masalah tombol menu sidebar yang tidak beraturan saat login pertama kali
- **Material Icons Flash**: Icons sekarang dimuat sempurna sebelum aplikasi ditampilkan
- Font dan icons sekarang dimuat dengan benar sebelum konten ditampilkan
