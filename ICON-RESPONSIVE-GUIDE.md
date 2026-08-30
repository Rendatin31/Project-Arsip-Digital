# Panduan Icon Responsif

## Perubahan yang Dilakukan

Aplikasi sekarang menggunakan ukuran icon yang responsif dan menyesuaikan dengan berbagai ukuran device.

### 1. Material Symbols Icons

**Sebelum:**
- Menggunakan `transform: scale(1.3)` yang bisa menyebabkan blur
- Ukuran pixel tetap (`17px`)

**Sesudah:**
- Menggunakan `font-size: 1.3em` (unit relatif)
- Responsive breakpoints:
  - **≤ 480px** (ponsel kecil): `1.4em` - icon lebih besar untuk kemudahan tap
  - **481px - 854px** (ponsel besar): `1.25em` - ukuran seimbang
  - **> 854px** (tablet/desktop): ukuran default

### 2. FileTypeIcon Component (PDF, Word, Excel, dll)

**Sebelum:**
- Ukuran tetap dalam pixel (e.g., `width: 40`, `height: 40`)
- Tidak responsif terhadap ukuran device

**Sesudah:**
- Menggunakan unit `rem` (relative em)
- Konversi otomatis: pixel ÷ 16 = rem
- Contoh: `size={40}` → `2.5rem`
- Menambah `flex-shrink-0` untuk mencegah icon mengecil
- Menambah `minWidth` dan `minHeight` untuk menjaga ukuran minimum

## Cara Menggunakan

### Material Icons
```jsx
// Icon akan otomatis menyesuaikan ukuran berdasarkan screen size
<span className="material-symbols-outlined">home</span>
```

### FileTypeIcon
```jsx
// Ukuran akan otomatis dikonversi ke rem
<FileTypeIcon type="pdf" size={40} />  // → 2.5rem
<FileTypeIcon type="docx" size={32} /> // → 2rem
<FileTypeIcon type="xlsx" size={48} /> // → 3rem
```

## Keuntungan

1. **Responsif**: Icon menyesuaikan dengan ukuran device
2. **Skalabilitas**: Tetap tajam di semua resolusi layar
3. **Accessibility**: Ukuran minimum terjamin untuk kemudahan tap/click
4. **Konsistensi**: Ukuran proporsional di semua device

## Testing

Untuk memastikan perubahan bekerja dengan baik:

1. **Build ulang aplikasi:**
   ```bash
   npm run build
   ```

2. **Sync ke Android:**
   ```bash
   npx cap sync android
   ```

3. **Buka di Android Studio dan test di:**
   - Emulator ponsel kecil (≤ 480px)
   - Emulator ponsel besar (481-854px)
   - Emulator tablet (> 854px)

4. **Test di device fisik** dengan berbagai ukuran layar

## Troubleshooting

Jika icon masih terlihat tidak proporsional:

1. **Clear cache browser/app:**
   - Android: Settings → Apps → Arsip Digital → Clear Cache
   
2. **Hard refresh:**
   - Tutup dan buka ulang aplikasi
   - Atau uninstall dan install ulang

3. **Check viewport meta tag** di `index.html`:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
   ```

## File yang Dimodifikasi

- `src/components/FileTypeIcon.jsx` - Komponen icon file types
- `src/index.css` - Styling global untuk Material Icons
