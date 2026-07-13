# Fix GitHub Authentication Error

## Error
```
fatal: unable to access 'https://github.com/Rendatin31/Project-Arsip-Digital.git/': The requested URL returned error: 403
```

## Solusi

### Opsi 1: Gunakan Personal Access Token (PAT)

1. **Buat Personal Access Token di GitHub:**
   - Buka: https://github.com/settings/tokens
   - Klik "Generate new token" → "Generate new token (classic)"
   - Beri nama: "Project Arsip Digital"
   - Pilih scope: `repo` (centang semua)
   - Klik "Generate token"
   - **COPY token yang muncul** (hanya muncul 1x!)

2. **Update Git Credential:**
   ```cmd
   git remote set-url origin https://YOUR_GITHUB_USERNAME:YOUR_TOKEN@github.com/Rendatin31/Project-Arsip-Digital.git
   ```
   
   Ganti:
   - `YOUR_GITHUB_USERNAME` dengan username GitHub Anda
   - `YOUR_TOKEN` dengan token yang baru dibuat

3. **Push lagi:**
   ```cmd
   git push
   ```

### Opsi 2: Gunakan GitHub CLI (gh)

1. **Install GitHub CLI** (jika belum ada):
   - Download: https://cli.github.com/
   
2. **Login:**
   ```cmd
   gh auth login
   ```
   
3. **Push lagi:**
   ```cmd
   git push
   ```

### Opsi 3: Gunakan SSH (lebih aman)

1. **Generate SSH Key:**
   ```cmd
   ssh-keygen -t ed25519 -C "mahersapps28@gmail.com"
   ```
   (Tekan Enter untuk semua pertanyaan)

2. **Copy SSH Key:**
   ```cmd
   type %USERPROFILE%\.ssh\id_ed25519.pub
   ```
   Copy output yang muncul

3. **Add ke GitHub:**
   - Buka: https://github.com/settings/keys
   - Klik "New SSH key"
   - Paste key yang dicopy
   - Klik "Add SSH key"

4. **Update remote URL:**
   ```cmd
   git remote set-url origin git@github.com:Rendatin31/Project-Arsip-Digital.git
   ```

5. **Push lagi:**
   ```cmd
   git push
   ```

## Verifikasi

Setelah berhasil push, cek deployment di Vercel:
- Buka: https://vercel.com/
- Pilih project "rendatinarsip"
- Tunggu auto-deploy selesai (sekitar 1-2 menit)
- Test di mobile device dengan clear cache terlebih dahulu

## Changes Made

✅ Chevron pada mobile breadcrumb sudah diperbaiki:
- Ukuran: 14px (lebih besar dari sebelumnya 12px)
- Posisi: Geser ke atas -3px (dari -2px)
- Margin kiri: 6px (dari 2px) - geser ke kanan
- Tambah `transform: 'none'` untuk mencegah double-scale dari global CSS

Chevron sekarang akan sejajar dengan text label nama halaman di mobile!
