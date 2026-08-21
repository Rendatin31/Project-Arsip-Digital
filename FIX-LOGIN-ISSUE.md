# 🔧 Fix: Login Invalid Credentials di APK

## ❌ Problem

Setelah install APK di device, login gagal dengan error "Invalid Credentials" meskipun credentials benar.

## 🔍 Root Cause

Environment variables dari `.env` file **TIDAK ter-include** di production build APK. 

File `.env` hanya available saat development (`npm run dev`), tapi saat build production (`npm run build`), Vite tidak include environment variables ke dalam bundle.

## ✅ Solution

Sudah di-fix dengan menambahkan **fallback values** di:
1. `src/lib/supabase.js` - Supabase client config
2. `src/pages/HakAksesPage.jsx` - Edge function URL

Sekarang aplikasi akan:
- Development: gunakan `.env` values
- Production (APK): gunakan fallback hardcoded values

## 🚀 Rebuild APK

Setelah fix, perlu rebuild APK:

### Via Command Line:
```bash
# 1. Build React app (dengan fix baru)
npm run build

# 2. Sync ke Android
npx cap sync

# 3. Build APK via Android Studio
# Atau via Gradle:
cd android
.\gradlew.bat assembleDebug
```

### Via Script:
```bash
npm run cap:android
```

## 📱 Test

1. Uninstall APK lama dari device
2. Install APK baru
3. Coba login dengan credentials yang valid
4. Seharusnya sekarang bisa login! ✅

## 🔐 Security Note

**PENTING**: Anon Key yang di-hardcode adalah **public key** yang aman untuk di-expose di client-side. Ini adalah key yang sama yang digunakan di web app.

**JANGAN hardcode**:
- Service Role Key
- Secret Key
- Database passwords
- Private API keys

## 📝 Changes Made

### `src/lib/supabase.js`:
```javascript
// BEFORE (hanya dari .env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// AFTER (dengan fallback)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://axpanhequppcviaimwte.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJ...';
```

### `src/pages/HakAksesPage.jsx`:
```javascript
// BEFORE
const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`;

// AFTER (dengan fallback)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://axpanhequppcviaimwte.supabase.co';
const functionUrl = `${supabaseUrl}/functions/v1/create-user`;
```

## ✅ Fixed!

Login sekarang akan work di APK! 🎉
