# Create Placeholder Icons (Quick Test)

## Option 1: Download dari Online Placeholder

**192x192:**
```
https://via.placeholder.com/192/3b82f6/ffffff?text=AD
```
- Klik kanan → Save Image As → `icon-192.png`
- Save ke folder `public/`

**512x512:**
```
https://via.placeholder.com/512/3b82f6/ffffff?text=AD
```
- Klik kanan → Save Image As → `icon-512.png`
- Save ke folder `public/`

## Option 2: Using PowerShell (Windows)

Buka PowerShell di folder project:

```powershell
# Navigate to project folder
cd "C:\Users\Halut\Documents\GitHub\Project-Arsip-Digital"

# Download placeholder icons
Invoke-WebRequest -Uri "https://via.placeholder.com/192/3b82f6/ffffff?text=AD" -OutFile "public/icon-192.png"
Invoke-WebRequest -Uri "https://via.placeholder.com/512/3b82f6/ffffff?text=AD" -OutFile "public/icon-512.png"
```

## Option 3: Using Browser

1. **Icon 192x192:**
   - Buka: https://dummyimage.com/192x192/3b82f6/ffffff&text=Arsip+Digital
   - Klik kanan → Save Image As
   - Nama: `icon-192.png`
   - Save ke: `C:\Users\Halut\Documents\GitHub\Project-Arsip-Digital\public\`

2. **Icon 512x512:**
   - Buka: https://dummyimage.com/512x512/3b82f6/ffffff&text=Arsip+Digital
   - Klik kanan → Save Image As
   - Nama: `icon-512.png`
   - Save ke: `C:\Users\Halut\Documents\GitHub\Project-Arsip-Digital\public\`

---

**NOTE:** Ini hanya untuk testing! Untuk production, sebaiknya gunakan logo proper dari PWA Builder.
