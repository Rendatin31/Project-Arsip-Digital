# 🚀 PWA Quick Start - Arsip Digital

## ⚡ 3 Langkah Deploy PWA

### 1️⃣ Generate Icons
```bash
# Buka https://www.pwabuilder.com/imageGenerator
# Upload logo, download, copy ke public/:
# - icon-192.png
# - icon-512.png
```

### 2️⃣ Build
```bash
npm run build
```

### 3️⃣ Deploy
```bash
# Vercel (Recommended)
npm i -g vercel
vercel

# ATAU Netlify
npm i -g netlify-cli
netlify deploy --prod

# ATAU upload folder dist/ ke web hosting
```

---

## ✅ Test PWA

### Desktop (Chrome)
1. F12 → Application → Manifest ✓
2. Service Workers ✓
3. Klik icon "Install" di address bar

### Android
1. Chrome → Menu → "Add to Home screen"
2. Check icon di home screen
3. Buka app → fullscreen ✓

### iPhone
1. Safari → Share → "Add to Home Screen"
2. Check icon di home screen
3. Buka app → fullscreen ✓

---

## 📱 User Experience

**iOS Users:**
- Auto install prompt muncul setelah 5 detik
- Instruksi step-by-step jelas
- Link ke panduan lengkap
- Hanya tampil sekali per hari

**Features:**
- ✅ Fullscreen mode (no browser bar)
- ✅ Home screen icon
- ✅ Offline capability
- ✅ Auto-update
- ✅ Fast loading (cache)

---

## 🔗 Dokumentasi Lengkap

| File | Deskripsi |
|------|-----------|
| `PWA-SETUP-COMPLETE.md` | Setup lengkap & troubleshooting |
| `INSTALL-IOS-PWA.md` | Panduan iOS users (teknis) |
| `/pwa-install-guide.html` | Panduan visual (user-friendly) |
| `BUILD-IOS-GUIDE.md` | Penjelasan native iOS build |
| `GENERATE-PWA-ICONS.md` | Cara generate icons |

---

## ⚠️ PENTING

**Harus HTTPS!** PWA tidak work di HTTP.

**Icon Required:**
- `public/icon-192.png` (192x192px)
- `public/icon-512.png` (512x512px)

**iOS Safari Only:**
"Add to Home Screen" di iOS hanya work di Safari browser, bukan Chrome/Firefox.

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Icon tidak muncul | Check file ada, rebuild, hard refresh |
| Service Worker error | Check HTTPS, console error, SW accessible |
| "Add to Home Screen" hilang | iOS: pakai Safari. Clear cache. |
| Not fullscreen | Check manifest, reinstall app |

---

## 🎯 Next Steps

1. Generate icons → Build → Deploy → Test
2. Share URL dengan users
3. Monitor install metrics (optional)
4. Add push notifications (advanced, optional)

**Selesai! User iOS sekarang bisa install app tanpa App Store!** 🎉
