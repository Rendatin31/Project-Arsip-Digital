---
name: Sistem Arsip Digital
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  table-data:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 24px
  gutter: 16px
---

## Brand & Style
Sistem desain ini dirancang untuk menciptakan lingkungan kerja digital yang aman, profesional, dan sangat terorganisir. Fokus utamanya adalah memberikan rasa kepercayaan (trust) dan stabilitas bagi pengguna yang mengelola dokumen-dokumen penting negara atau korporasi.

Gaya visual yang dianut adalah **Corporate Modern** dengan sentuhan **Minimalisme**. Pendekatan ini memprioritaskan kejelasan informasi di atas dekorasi, memastikan bahwa antarmuka yang padat data tetap terasa ringan dan mudah dinavigasi. Estetika keseluruhan harus memancarkan ketenangan melalui penggunaan ruang putih yang disiplin dan struktur grid yang kaku, mencerminkan ketertiban sebuah ruang arsip fisik yang dikelola secara modern.

## Colors
Palet warna dikurasi untuk memperkuat narasi keamanan dan profesionalisme:
- **Primary (Deep Navy):** Digunakan untuk navigasi utama, sidebar, dan tipografi judul untuk memberikan kesan otoritas.
- **Secondary (Emerald Green):** Dikhususkan untuk aksi positif utama seperti 'Unggah Dokumen', 'Simpan', atau indikator status 'Sah'.
- **Accent (Bright Blue):** Digunakan untuk interaksi sekunder, tautan, dan penanda fokus.
- **Neutral (Slate Grays):** Berbagai tingkatan abu-abu digunakan untuk membedakan hierarki informasi pada tabel dan metadata dokumen.

Latar belakang menggunakan warna *off-white* yang sangat lembut untuk mengurangi kelelahan mata selama penggunaan jangka panjang.

## Typography
Tipografi menggunakan **Inter** karena keterbacaannya yang luar biasa pada layar digital, terutama untuk angka dan teks berukuran kecil dalam tabel. 

Sistem ini menerapkan hierarki yang ketat:
- **Judul Besar** digunakan hanya untuk nama modul utama.
- **Body-sm** adalah standar untuk deskripsi metadata.
- **Label-caps** digunakan untuk header kolom pada tabel arsip untuk membedakannya secara visual dari data konten.
- Kontras teks harus selalu dijaga agar memenuhi standar aksesibilitas WCAG AA untuk menjamin inklusivitas bagi semua staf administrasi.

## Layout & Spacing
Sistem desain ini menggunakan **Fluid Grid** dengan margin yang tetap untuk memastikan fleksibilitas pada berbagai ukuran layar monitor kantor. 

- **Layout Utama:** Menggunakan pola *Sidebar Navigasi* tetap di sisi kiri (lebar 260px) dan area konten dinamis di sisi kanan.
- **Data Density:** Untuk tampilan tabel arsip, gunakan *compact spacing* (8px vertical padding pada sel tabel) untuk memaksimalkan jumlah informasi yang terlihat tanpa *scrolling*.
- **Whitespace:** Area formulir input harus memiliki ruang bernapas yang lebih luas (spacing `lg`) untuk mencegah kesalahan input data sensitif.

## Elevation & Depth
Kedalaman visual diatur melalui **Tonal Layering** dan bayangan yang sangat halus:
- **Level 0 (Base):** Latar belakang aplikasi menggunakan warna `#F8FAFC`.
- **Level 1 (Surface):** Kartu, tabel, dan area kerja menggunakan warna putih murni (`#FFFFFF`) dengan *border* tipis warna Slate-200.
- **Level 2 (Overlay):** Dropdown menu dan tooltip menggunakan bayangan halus (Blur: 8px, Y: 4px, Opacity: 5%) untuk memisahkan elemen dari konten di bawahnya.
- **Level 3 (Modal):** Dialog konfirmasi penghapusan atau unggah dokumen menggunakan bayangan yang lebih tegas untuk memfokuskan perhatian pengguna.

## Shapes
Bentuk elemen dalam sistem desain ini menggunakan radius sudut yang **Soft (4px - 8px)**. 
- Sudut 4px (`rounded-sm`) digunakan untuk elemen kecil seperti checkbox dan tag status.
- Sudut 8px (`rounded-lg`) digunakan untuk kontainer utama, kartu, dan tombol aksi.
Pilihan ini menyeimbangkan antara kesan modernitas yang ramah dengan struktur kaku yang diperlukan untuk sistem manajemen dokumen profesional. Hindari penggunaan bentuk lingkaran sempurna (pill-shaped) kecuali untuk avatar pengguna.

## Components
- **Buttons:** Tombol utama (Primary) memiliki warna latar solid Deep Navy atau Emerald Green dengan teks putih. Tombol sekunder menggunakan *outline* tipis.
- **Data Tables:** Komponen paling kritis. Harus menyertakan fitur *hover state* baris, pengurutan (sorting) yang jelas, dan penomoran halaman (pagination) di bagian bawah.
- **Folder Trees:** Gunakan ikon direktori yang konsisten. Indentasi antar level folder adalah 16px untuk menunjukkan hierarki tanpa memakan terlalu banyak ruang horizontal.
- **Status Badges:** Gunakan label kecil dengan warna latar transparan dan teks berwarna (misal: Hijau untuk 'Aktif', Kuning untuk 'Ditinjau', Merah untuk 'Rahasia').
- **Input Fields:** Label input harus selalu berada di atas kolom teks. Gunakan *placeholder* yang informatif dan sampaikan pesan galat (error) secara eksplisit di bawah kolom.
- **File Preview:** Komponen khusus untuk menampilkan cuplikan dokumen (PDF/Gambar) yang terintegrasi di dalam dashboard tanpa harus membuka tab baru.