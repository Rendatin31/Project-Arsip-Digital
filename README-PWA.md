# 📱 Arsip Digital - Progressive Web App (PWA)

## 🎯 Overview

Arsip Digital sekarang adalah **PWA (Progressive Web App)** yang bisa diinstall di iPhone, iPad, dan Android **tanpa perlu App Store atau Google Play Store**!

### ✨ Keunggulan PWA:

| Feature | Native App | PWA Arsip Digital |
|---------|-----------|-------------------|
| Install dari App Store | ✅ Perlu review (1-7 hari) | ❌ Tidak perlu |
| Developer Account | ✅ $99/tahun (Apple) | ✅ Gratis |
| Build di Mac | ✅ Harus punya Mac | ✅ Bisa di Windows |
| Update Instant | ❌ Perlu review lagi | ✅ Auto-update |
| Offline Mode | ✅ | ✅ |
| Fullscreen | ✅ | ✅ |
| Home Screen Icon | ✅ | ✅ |
| Push Notifications | ✅ | ✅ (bisa dikonfigurasi) |

---

## 🚀 Quick Start

### Untuk Developer

**1. Generate Icons (Wajib!)**
```bash
# Online tool (recommended):
# https://www.pwabuilder.com/imageGenerator
# Upload logo → Generate → Download
# Copy icon-192.png dan icon-512.png ke folder public/
```

**2. Build Project**
```bash
npm run build
```

**3. Deploy**
```bash
# Vercel (free & easy)
npm i -g vercel
vercel

# Atau Netlify
npm i -g netlify-cli
netlify deploy --prod

# Atau upload folder dist/ ke hosting
```

**4. Test**
- Chrome Desktop: F12 → Application → Manifest
- Android: Chrome → Menu → "Add to Home screen"
- iPhone: Safari → Share → "Add to Home Screen"

### Untuk End User

**iPhone/iPad (iOS):**
1. Buka website di **Safari** (bukan Chrome!)
2. Tap tombol **Share** (📤) di bawah
3. Scroll dan pilih **"Add to Home Screen"**
4. Tap **"Add"**
5. Icon muncul di home screen!

**Android:**
1. Buka website di **Chrome**
2. Menu (⋮) → **"Add to Home screen"**
3. Confirm
4. Icon muncul di home screen!

📖 Panduan lengkap: `/pwa-install-guide.html` (setelah deploy)

---

## 📁 File Structure

```
project/
├── public/
│   ├── manifest.json          # PWA manifest configuration
│   ├── sw.js                  # Service Worker for offline
│   ├── icon-192.png          # Icon 192x192 (GENERATE FIRST!)
│   ├── icon-512.png          # Icon 512x512 (GENERATE FIRST!)
│   └── pwa-install-guide.html # Visual install guide
│
├── src/
│   ├── components/
│   │   └── PWAInstallPrompt.jsx # Auto install prompt for iOS
│   └── App.jsx                  # Added PWA prompt component
│
├── index.html                   # Updated with PWA meta tags
├── PWA-SETUP-COMPLETE.md       # Detailed setup guide
├── PWA-QUICK-START.md          # Quick reference
├── INSTALL-IOS-PWA.md          # iOS user guide (technical)
├── BUILD-IOS-GUIDE.md          # Native iOS build explanation
└── GENERATE-PWA-ICONS.md       # Icon generation guide
```

---

## 🔧 Technical Details

### PWA Features Implemented

✅ **Manifest File** (`public/manifest.json`)
- App name, short name, description
- Theme color: `#3b82f6` (blue)
- Display: standalone (fullscreen)
- Icons: 192x192, 512x512
- Start URL: `/`
- Shortcuts to key pages

✅ **Service Worker** (`public/sw.js`)
- Cache static assets
- Offline functionality
- Network-first strategy with fallback
- Auto-update on version change

✅ **Meta Tags** (`index.html`)
- Apple mobile web app capable
- Apple status bar style
- Apple touch icon
- Android mobile-web-app-capable
- Theme color
- Manifest link

✅ **Install Prompt** (`PWAInstallPrompt.jsx`)
- Auto-detect iOS devices
- Smart timing (5 seconds after load)
- Once-per-day display
- Step-by-step instructions
- Dismissible with localStorage persistence

✅ **Service Worker Registration**
- Auto-register on page load
- Console logging for debugging
- Error handling

---

## 📊 Browser Support

| Platform | Browser | Support | Notes |
|----------|---------|---------|-------|
| iOS 11.3+ | Safari | ✅ Full | "Add to Home Screen" only in Safari |
| iOS 11.3+ | Chrome | ⚠️ Limited | No "Add to Home Screen" (use Safari) |
| Android 5.0+ | Chrome | ✅ Full | Native "Add to Home screen" |
| Android 5.0+ | Firefox | ✅ Full | Native install prompt |
| Desktop | Chrome | ✅ Full | Install icon in address bar |
| Desktop | Edge | ✅ Full | Install button |
| Desktop | Firefox | ⚠️ Limited | Basic PWA support |
| Desktop | Safari | ⚠️ Limited | No install option |

---

## 🎨 Customization

### Change App Name
Edit `public/manifest.json`:
```json
{
  "name": "Your App Name",
  "short_name": "App Name"
}
```

### Change Theme Color
Edit `public/manifest.json`:
```json
{
  "theme_color": "#your-color",
  "background_color": "#your-bg-color"
}
```

Also update in `index.html`:
```html
<meta name="theme-color" content="#your-color" />
```

### Change Install Prompt Timing
Edit `src/components/PWAInstallPrompt.jsx`:
```javascript
// Current: 5 seconds
setTimeout(() => {
  setShowPrompt(true);
}, 5000); // Change this value (milliseconds)
```

### Change Cache Strategy
Edit `public/sw.js` fetch event listener for different strategies:
- Network-first (current)
- Cache-first
- Stale-while-revalidate

---

## 🐛 Troubleshooting

### Icons tidak muncul
**Problem:** Icon tidak tampil di home screen atau manifest error

**Solution:**
1. Check file `public/icon-192.png` dan `icon-512.png` ada
2. Rebuild: `npm run build`
3. Hard refresh browser: `Ctrl+Shift+R` (Windows) atau `Cmd+Shift+R` (Mac)
4. Check file size: max 512KB per icon
5. Check format: harus PNG
6. Check dimensions: exact 192x192 dan 512x512 pixels

### Service Worker tidak register
**Problem:** Console error "Service Worker registration failed"

**Solution:**
1. **HARUS HTTPS!** PWA tidak work di `http://`
2. Check file `sw.js` accessible: `https://your-domain.com/sw.js`
3. Check console untuk error detail
4. Clear Service Worker: DevTools → Application → Service Workers → Unregister
5. Hard refresh

### "Add to Home Screen" tidak muncul
**Problem:** Option tidak ada di menu

**Solution iOS:**
- **Harus pakai Safari!** Chrome/Firefox di iOS tidak support
- Update iOS ke 11.3 atau lebih baru
- Check apakah sudah installed (search di home screen)

**Solution Android:**
- Check manifest accessible: `https://your-domain.com/manifest.json`
- Clear browser cache
- Check DevTools → Application → Manifest untuk error
- Pastikan HTTPS enabled

### Install prompt tidak muncul
**Problem:** Prompt otomatis tidak tampil di iOS

**Solution:**
1. Check console untuk error
2. Check localStorage: cari key `pwa-prompt-dismissed`
3. Clear localStorage untuk test:
   ```javascript
   localStorage.removeItem('pwa-prompt-dismissed');
   ```
4. Reload page
5. Pastikan device adalah iOS (check dengan Safari)

### App tidak fullscreen
**Problem:** Safari bar masih tampil setelah install

**Solution:**
1. Check `manifest.json`: `"display": "standalone"`
2. Uninstall app: tahan icon → "Remove App"
3. Install ulang dari Safari
4. Check iOS version minimal 11.3
5. Pastikan buka dari home screen icon, bukan bookmark Safari

### Offline mode tidak work
**Problem:** App tidak buka tanpa internet

**Solution:**
1. Check Service Worker registered: DevTools → Application → Service Workers
2. Check cache: DevTools → Application → Cache Storage
3. Visit halaman sekali saat online (untuk cache)
4. Check `sw.js` tidak ada error
5. Clear cache dan reload saat online

---

## 📈 Analytics & Monitoring

### Track PWA Installs

Add to `src/main.jsx` or `App.jsx`:

```javascript
// Track install prompt shown
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA install prompt shown');
  // Send to analytics:
  // gtag('event', 'pwa_install_prompt_shown');
});

// Track successful install
window.addEventListener('appinstalled', () => {
  console.log('PWA installed!');
  // Send to analytics:
  // gtag('event', 'pwa_installed');
});

// Detect if running as PWA
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('Running as PWA');
  // Send to analytics:
  // gtag('event', 'pwa_launched');
}
```

### Monitor Service Worker

```javascript
navigator.serviceWorker.ready.then((registration) => {
  console.log('Service Worker active:', registration.active);
  // Check for updates
  registration.update();
});
```

---

## 🔐 Security

### HTTPS Required
PWA **HARUS** menggunakan HTTPS. Tidak akan work di HTTP (kecuali localhost untuk development).

**Free HTTPS:**
- Vercel: auto HTTPS
- Netlify: auto HTTPS
- Firebase: auto HTTPS
- Cloudflare: free SSL certificate
- Let's Encrypt: free SSL for custom hosting

### Content Security Policy (CSP)

For added security, add CSP meta tag in `index.html`:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
               font-src 'self' https://fonts.gstatic.com; 
               img-src 'self' data: https:; 
               connect-src 'self' https://your-supabase-url.supabase.co">
```

---

## 🚀 Advanced Features (Optional)

### 1. Push Notifications

Requires Firebase Cloud Messaging setup:

```javascript
// Request permission
Notification.requestPermission().then((permission) => {
  if (permission === 'granted') {
    // Get FCM token and save to database
  }
});
```

### 2. Background Sync

Queue actions when offline:

```javascript
// Register sync
navigator.serviceWorker.ready.then((registration) => {
  return registration.sync.register('sync-documents');
});

// In service worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-documents') {
    event.waitUntil(syncDocuments());
  }
});
```

### 3. Update Notification

Notify users about app updates:

```javascript
let refreshing = false;
navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (refreshing) return;
  refreshing = true;
  window.location.reload();
});
```

### 4. Install Statistics

Track install rate:

```javascript
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Show custom install button
  showInstallButton();
});

function showInstallButton() {
  installButton.onclick = () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted install');
      }
      deferredPrompt = null;
    });
  };
}
```

---

## 📚 Resources

### Documentation
- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev: PWA](https://web.dev/progressive-web-apps/)
- [Apple: Configuring Web Applications](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)

### Tools
- [PWA Builder](https://www.pwabuilder.com/) - Generate icons, manifest, service worker
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - PWA audit
- [Favicon Generator](https://realfavicongenerator.net/) - Generate all icon sizes
- [Manifest Generator](https://app-manifest.firebaseapp.com/) - Generate manifest.json

### Testing
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools) - Debug PWA
- [PWA Testing Checklist](https://web.dev/pwa-checklist/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) - Automated testing

---

## ✅ Deployment Checklist

**Pre-Deployment:**
- [ ] Icons generated (192x192 and 512x512)
- [ ] Icons placed in `public/` folder
- [ ] `npm run build` successful
- [ ] No console errors in build
- [ ] Test locally with `npm run dev`

**Deployment:**
- [ ] Deploy to HTTPS server
- [ ] Verify `https://your-domain.com` accessible
- [ ] Verify `https://your-domain.com/manifest.json` accessible
- [ ] Verify `https://your-domain.com/sw.js` accessible
- [ ] Verify icons accessible at `/icon-192.png` and `/icon-512.png`

**Testing:**
- [ ] Chrome Desktop: DevTools → Application → Manifest ✓
- [ ] Chrome Desktop: Service Worker registered ✓
- [ ] Chrome Desktop: Install icon appears
- [ ] Android Chrome: "Add to Home screen" works
- [ ] Android: Icon appears on home screen
- [ ] Android: App opens fullscreen
- [ ] iOS Safari: "Add to Home Screen" visible
- [ ] iOS: Icon appears on home screen
- [ ] iOS: App opens fullscreen without Safari bar
- [ ] Offline test: Disconnect internet, app still works

**Post-Launch:**
- [ ] Monitor Service Worker registration success rate
- [ ] Track install rate
- [ ] Collect user feedback
- [ ] Monitor console errors in production
- [ ] Plan for updates and notifications

---

## 🎉 Success!

Congratulations! Arsip Digital sekarang adalah PWA yang:

✅ Bisa diinstall di iOS **tanpa Mac atau App Store**
✅ Bisa diinstall di Android **tanpa Google Play**
✅ Berjalan **fullscreen** seperti native app
✅ Bekerja **offline**
✅ **Auto-update** tanpa user action
✅ **Loading cepat** dengan cache
✅ **Gratis** - no developer fees!

**Share URL dengan users dan mereka bisa install langsung!** 🚀

---

## 📞 Support

**Issues or Questions?**
- Check `PWA-SETUP-COMPLETE.md` untuk detail teknis
- Check `INSTALL-IOS-PWA.md` untuk panduan iOS
- Check troubleshooting section di atas
- Test dengan Chrome DevTools → Application tab
- Check browser console untuk error messages

**User Guide:**
- Share `/pwa-install-guide.html` dengan end users
- Visual, step-by-step, user-friendly

---

**Last Updated:** 2026-08-21
**Version:** 1.0.0
**Compatible:** iOS 11.3+, Android 5.0+, Modern Desktop Browsers
