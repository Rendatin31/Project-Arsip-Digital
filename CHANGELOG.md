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

- **Mobile Icon Sizing**: Icon pada versi mobile diperbesar untuk meningkatkan readability dan touch targets:
  - Sidebar menu icons: 24px → **40px** (67% lebih besar!)
  - Hamburger menu icon: 24px → **40px**
  - Default icons: 24px → 28px pada mobile
  - Small icons (12px-16px): 20px minimum pada mobile
  - Ukuran icons sekarang responsive untuk semua breakpoint

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
- **Responsive Material Icons CSS**: Media queries untuk memperbesar icons pada viewport mobile

### Fixed
- **FOUT Issue**: Memperbaiki masalah font yang berubah-ubah saat pertama kali membuka aplikasi
- **Sidebar Layout Issue**: Memperbaiki masalah tombol menu sidebar yang tidak beraturan saat login pertama kali
- **Material Icons Flash**: Icons sekarang dimuat sempurna sebelum aplikasi ditampilkan
- **Mobile Icon Size**: Icons di mobile terlalu kecil dan sulit dibaca/disentuh - sekarang diperbesar secara responsive
- **Sidebar Close Button**: Menghapus tombol X (close) di sidebar mobile yang tidak perlu (user bisa tap overlay untuk close)
- **Icon Size Consistency**: Menggunakan inline style untuk memastikan icon size 32px benar-benar ter-apply di semua device
- Font dan icons sekarang dimuat dengan benar sebelum konten ditampilkan
