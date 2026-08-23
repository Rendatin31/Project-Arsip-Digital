# Dashboard Card Navigation & Auto-Review System

## 📱 Perubahan

Tiga peningkatan untuk Dashboard dan sistem review dokumen:

---

## 1. ✅ Gap Icon Kapasitas (Mobile) - Diperbesar Lagi

**Perubahan:**
```jsx
<div className="flex items-center gap-2 lg:gap-xs">
```

**Hasil:**
- **Mobile**: `gap-2` (8px spacing) - **LEBIH LEBAR dari sebelumnya**
- **Desktop**: `gap-xs` (spacing normal)

**Sebelumnya:**
- Mobile: `gap-1` (4px) → Terlalu rapat

**Sekarang:**
- Mobile: `gap-2` (8px) → Lebih nyaman

---

## 2. ✅ Role-Based Navigation pada Card Dashboard

**Masalah:**
- Semua role diarahkan ke "File Saya" (documents) saat klik card
- Tidak sesuai dengan akses role (viewer tidak punya akses ke File Saya)

**Solusi:**
Card Dashboard sekarang navigate berdasarkan role:

### Navigation Logic:
```jsx
onClick={() => {
  const userRole = profile?.role;
  
  // Admin, Super Admin, Editor → Direktori Arsip
  if (userRole === 'super_admin' || userRole === 'admin' || userRole === 'editor') {
    onNavigate?.('data-arsip');
  } 
  // Viewer → Pencarian
  else if (userRole === 'viewer') {
    onNavigate?.('search');
  }
}}
```

### Navigation Matrix:

| Role | Klik Card → Navigate ke |
|------|-------------------------|
| **Super Admin** | 📁 Direktori Arsip (`data-arsip`) |
| **Admin** | 📁 Direktori Arsip (`data-arsip`) |
| **Editor** | 📁 Direktori Arsip (`data-arsip`) |
| **Viewer** | 🔍 Pencarian (`search`) |

**Card yang Affected:**
1. ✅ **Tinjauan** card
2. ✅ **Dokumen Baru** card
3. ✅ **Total Dokumen** card

**Behavior:**
- **Mobile**: Tap card → Navigate sesuai role
- **Desktop**: Non-interaktif (cursor-default)

---

## 3. ✅ Auto-Reduce "Tinjauan" saat Dokumen Dibuka

**Masalah:**
- Angka "Tinjauan" di dashboard tidak berkurang saat user membuka dokumen
- User harus manual refresh untuk melihat perubahan

**Solusi:**
Sistem otomatis mark dokumen sebagai "reviewed" saat dibuka, dari **MANA SAJA**:

### Mark as Reviewed Locations:

1. ✅ **Dashboard** - Preview Update Terkini (QuickPreview)
2. ✅ **Direktori Arsip** (DataArsipPage) - Preview dokumen
3. ✅ **Pencarian Pintar** (PencarianPintarPage) - Preview dokumen
4. ✅ **File Saya** (App.jsx) - Preview dokumen

### Implementation:

#### FilePreviewModal (Component)
```jsx
// Mark document as reviewed when opened
useEffect(() => {
  if (userId && preview?.id) {
    try {
      const reviewed = localStorage.getItem(`reviewedDocs_${userId}`);
      const reviewedSet = reviewed ? new Set(JSON.parse(reviewed)) : new Set();
      
      // Only mark if not already reviewed
      if (!reviewedSet.has(preview.id)) {
        reviewedSet.add(preview.id);
        localStorage.setItem(`reviewedDocs_${userId}`, JSON.stringify([...reviewedSet]));
        console.log(`✅ Document ${preview.id} marked as reviewed`);
      }
    } catch (err) {
      console.error('Failed to mark document as reviewed:', err);
    }
  }
}, [userId, preview?.id]);
```

#### Dashboard Tinjauan Calculation
```jsx
// Get reviewed documents from localStorage
const getReviewedDocs = () => {
  if (!userId) return new Set();
  try {
    const reviewed = localStorage.getItem(`reviewedDocs_${userId}`);
    return reviewed ? new Set(JSON.parse(reviewed)) : new Set();
  } catch {
    return new Set();
  }
};

const reviewedDocs = getReviewedDocs();

// Tinjauan: dokumen PUBLISHED yang belum ditinjau oleh user ini
const tinjauan = documents.filter((d) => 
  d.status === 'PUBLISHED' && !reviewedDocs.has(d.id)
).length;
```

### Storage:
- **localStorage key**: `reviewedDocs_${userId}`
- **Format**: JSON array of document IDs
- **Scope**: Per-user (setiap user punya list sendiri)

### Behavior:

**Sebelum:**
```
Dashboard: Tinjauan = 10
User buka dokumen di Direktori Arsip
Dashboard: Tinjauan = 10  ❌ (tidak berkurang)
```

**Sesudah:**
```
Dashboard: Tinjauan = 10
User buka dokumen di Direktori Arsip
   ↓ Auto mark as reviewed
Dashboard: Tinjauan = 9  ✅ (berkurang otomatis)
```

**User buka dokumen di:**
- ✅ Dashboard Preview → Tinjauan berkurang
- ✅ Direktori Arsip → Tinjauan berkurang
- ✅ Pencarian Pintar → Tinjauan berkurang
- ✅ File Saya → Tinjauan berkurang

**Persistent:**
- ✅ Review status tersimpan di localStorage
- ✅ Tetap ada setelah refresh page
- ✅ Tetap ada setelah logout/login lagi (same device)

---

## 📝 File yang Diubah

### 1. **src/pages/DashboardPage.jsx**
```diff
# Gap icon kapasitas
- <div className="flex items-center gap-1 lg:gap-xs">
+ <div className="flex items-center gap-2 lg:gap-xs">

# Role-based navigation
- onClick={() => onNavigate?.('documents')}
+ onClick={() => {
+   const userRole = profile?.role;
+   if (userRole === 'super_admin' || userRole === 'admin' || userRole === 'editor') {
+     onNavigate?.('data-arsip');
+   } else if (userRole === 'viewer') {
+     onNavigate?.('search');
+   }
+ }}

# Pass userId to FilePreviewModal
- <FilePreviewModal preview={previewFile} supabase={supabase} onClose={...} />
+ <FilePreviewModal preview={previewFile} supabase={supabase} userId={userId} onClose={...} />
```

### 2. **src/components/FilePreviewModal.jsx**
```diff
# Add userId prop
- export default function FilePreviewModal({ preview, supabase, onClose, ... }) {
+ export default function FilePreviewModal({ preview, supabase, onClose, ..., userId }) {

# Add auto mark as reviewed
+ useEffect(() => {
+   if (userId && preview?.id) {
+     const reviewed = localStorage.getItem(`reviewedDocs_${userId}`);
+     const reviewedSet = reviewed ? new Set(JSON.parse(reviewed)) : new Set();
+     if (!reviewedSet.has(preview.id)) {
+       reviewedSet.add(preview.id);
+       localStorage.setItem(`reviewedDocs_${userId}`, JSON.stringify([...reviewedSet]));
+     }
+   }
+ }, [userId, preview?.id]);
```

### 3. **src/App.jsx**
```diff
# Pass userId to FilePreviewModal
- <FilePreviewModal preview={previewFile} supabase={supabase} onClose={...} />
+ <FilePreviewModal preview={previewFile} supabase={supabase} userId={user?.id} onClose={...} />
```

### 4. **src/pages/DataArsipPage.jsx**
```diff
# Pass userId to FilePreviewModal
+ <FilePreviewModal ... userId={userId} ... />
```

### 5. **src/pages/PencarianPintarPage.jsx**
```diff
# Pass userId to FilePreviewModal
+ <FilePreviewModal ... userId={userId} ... />
```

---

## 🎯 User Experience Flow

### Scenario 1: Admin Klik Card "Tinjauan"
```
1. Admin di Dashboard
2. Lihat card "Tinjauan" = 5 dokumen
3. Tap/klik card "Tinjauan"
   ↓
4. Navigate ke "Direktori Arsip" ✅
5. Buka salah satu dokumen PUBLISHED
   ↓
6. Dokumen otomatis mark as "reviewed" ✅
7. Kembali ke Dashboard
8. Card "Tinjauan" sekarang = 4 dokumen ✅
```

### Scenario 2: Viewer Klik Card "Dokumen Baru"
```
1. Viewer di Dashboard
2. Lihat card "Dokumen Baru" = 3 dokumen
3. Tap/klik card "Dokumen Baru"
   ↓
4. Navigate ke "Pencarian Pintar" ✅ (karena viewer tidak punya akses ke Direktori Arsip)
5. Search dan buka dokumen PUBLISHED
   ↓
6. Dokumen otomatis mark as "reviewed" ✅
7. Kembali ke Dashboard
8. Card "Tinjauan" berkurang ✅
```

### Scenario 3: Editor Buka Dokumen dari Mana Saja
```
1. Editor buka dokumen dari:
   - Dashboard Preview ✅
   - Direktori Arsip ✅
   - Pencarian Pintar ✅
   - File Saya ✅
   ↓
2. Semua dokumen PUBLISHED yang dibuka → auto mark as "reviewed"
3. Tinjauan di Dashboard berkurang secara real-time
```

---

## 🧪 Testing

### Test 1: Gap Icon Kapasitas
1. Buka Dashboard di mobile browser/device
2. Lihat card "Kapasitas Penyimpanan"
3. ✅ Jarak antara icon refresh dan icon storage = 8px (cukup lebar)

### Test 2: Role-Based Navigation
#### Admin/Super Admin/Editor:
1. Login sebagai Admin/Super Admin/Editor
2. Tap card "Tinjauan" di Dashboard
3. ✅ Navigate ke "Direktori Arsip"

#### Viewer:
1. Login sebagai Viewer
2. Tap card "Tinjauan" di Dashboard
3. ✅ Navigate ke "Pencarian Pintar"

### Test 3: Auto-Reduce Tinjauan
1. Login sebagai any role
2. Dashboard: Catat angka "Tinjauan" (misal: 5)
3. Buka dokumen PUBLISHED dari:
   - Dashboard Preview, atau
   - Direktori Arsip, atau
   - Pencarian Pintar
4. ✅ Kembali ke Dashboard
5. ✅ Angka "Tinjauan" berkurang (misal: 4)
6. ✅ Refresh page → angka tetap 4 (persistent)

---

## 📌 Catatan

- **Card navigation** hanya aktif di mobile (desktop non-interaktif)
- **Review system** menggunakan localStorage (per-user, per-device)
- **Tinjauan** hanya menghitung dokumen dengan status **PUBLISHED**
- **Gap icon** responsive: mobile 8px, desktop default
- **Review mark** otomatis saat dokumen dibuka, dari mana saja
