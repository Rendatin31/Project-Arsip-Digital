# Search Page - Auto-Review on Card Click (Desktop)

## 📋 Perubahan

**Masalah:**
- Di halaman Pencarian (desktop), user mengklik card dokumen untuk melihat preview di panel samping
- Preview tampil, tapi dokumen **TIDAK** otomatis mark as reviewed
- User harus buka modal full preview (klik icon "open_in_new") baru document mark as reviewed
- Angka "Tinjauan" di Dashboard tidak berkurang

**Solusi:**
Mark dokumen sebagai "reviewed" **SEGERA saat card diklik**, bahkan tanpa buka modal preview.

---

## ✅ Implementation

### PencarianPintarPage.jsx - Card onClick Handler

**Sebelum:**
```jsx
onClick={() => {
  setSelectedId(d.id);
  // On mobile, open full preview modal immediately
  if (window.innerWidth < 1024) {
    setFullPreview({ ... });
  }
}}
```

**Sesudah:**
```jsx
onClick={() => {
  // Mark document as reviewed when clicked (desktop & mobile)
  if (userId && d.id) {
    try {
      const reviewed = localStorage.getItem(`reviewedDocs_${userId}`);
      const reviewedSet = reviewed ? new Set(JSON.parse(reviewed)) : new Set();
      
      if (!reviewedSet.has(d.id)) {
        reviewedSet.add(d.id);
        localStorage.setItem(`reviewedDocs_${userId}`, JSON.stringify([...reviewedSet]));
        console.log(`✅ Document ${d.id} marked as reviewed on card click`);
      }
    } catch (err) {
      console.error('Failed to mark document as reviewed:', err);
    }
  }
  
  setSelectedId(d.id);
  // On mobile, open full preview modal immediately
  if (window.innerWidth < 1024) {
    setFullPreview({ ... });
  }
}}
```

---

## 🎯 Behavior

### Desktop (≥ 1024px):
```
1. User di halaman Pencarian
2. Klik card dokumen
   ↓
3. ✅ Document LANGSUNG mark as reviewed (tanpa buka modal)
4. ✅ Preview tampil di panel samping kanan
5. Kembali ke Dashboard
6. ✅ Card "Tinjauan" berkurang
```

### Mobile (< 1024px):
```
1. User di halaman Pencarian
2. Klik card dokumen
   ↓
3. ✅ Document LANGSUNG mark as reviewed
4. ✅ Modal full preview terbuka
5. Kembali ke Dashboard
6. ✅ Card "Tinjauan" berkurang
```

---

## 📊 Comparison

### Sebelum Fix:

| Action | Desktop | Mobile |
|--------|---------|--------|
| Klik card dokumen | Preview panel tampil | Modal preview tampil |
| Mark as reviewed? | ❌ **TIDAK** (harus klik icon "open_in_new" dulu) | ✅ Ya (via modal) |
| Tinjauan berkurang? | ❌ **TIDAK** | ✅ Ya |

### Sesudah Fix:

| Action | Desktop | Mobile |
|--------|---------|--------|
| Klik card dokumen | Preview panel tampil | Modal preview tampil |
| Mark as reviewed? | ✅ **Ya (LANGSUNG)** | ✅ Ya |
| Tinjauan berkurang? | ✅ **Ya** | ✅ Ya |

---

## 🔄 Review System Summary

Dokumen OTOMATIS mark as reviewed saat:

### 1. **Dashboard** - Preview Update Terkini
- ✅ Klik card QuickPreview → Modal buka → Mark as reviewed

### 2. **Pencarian Pintar** (PencarianPintarPage)
- ✅ **Klik card dokumen** (desktop & mobile) → **Mark as reviewed LANGSUNG** ← **NEW!**
- ✅ Buka modal full preview → Mark as reviewed (redundant, sudah di-mark saat klik card)

### 3. **Direktori Arsip** (DataArsipPage)
- ✅ Buka modal preview → Mark as reviewed

### 4. **File Saya** (App.jsx)
- ✅ Buka modal preview → Mark as reviewed

---

## 🧪 Testing

### Test Desktop - Halaman Pencarian
```
1. Login di browser desktop
2. Dashboard: Catat angka "Tinjauan" (misal: 5)
3. Navigate ke "Pencarian Pintar"
4. Search dokumen PUBLISHED
5. ✅ Klik salah satu card dokumen
   ↓ Preview panel tampil di kanan
6. ✅ Check console: "Document X marked as reviewed on card click"
7. Kembali ke Dashboard
8. ✅ Angka "Tinjauan" = 4 (berkurang!)
9. ✅ Refresh page → Tetap 4 (persistent)
```

### Test Mobile - Halaman Pencarian
```
1. Login di mobile browser/device
2. Dashboard: Catat angka "Tinjauan" (misal: 3)
3. Navigate ke "Pencarian Pintar"
4. Search dokumen PUBLISHED
5. ✅ Klik salah satu card dokumen
   ↓ Modal full preview terbuka
6. ✅ Check console: "Document X marked as reviewed on card click"
7. Close modal, kembali ke Dashboard
8. ✅ Angka "Tinjauan" = 2 (berkurang!)
```

### Test Edge Case - Klik Card 2x
```
1. Klik card dokumen (mark as reviewed)
2. ✅ Console: "Document X marked as reviewed on card click"
3. Klik card yang SAMA lagi
4. ✅ Console: TIDAK muncul log (already reviewed, skip)
5. ✅ Tidak ada duplicate mark
```

---

## 📝 File yang Diubah

### **src/pages/PencarianPintarPage.jsx**
```diff
onClick={() => {
+ // Mark document as reviewed when clicked (desktop & mobile)
+ if (userId && d.id) {
+   try {
+     const reviewed = localStorage.getItem(`reviewedDocs_${userId}`);
+     const reviewedSet = reviewed ? new Set(JSON.parse(reviewed)) : new Set();
+     
+     if (!reviewedSet.has(d.id)) {
+       reviewedSet.add(d.id);
+       localStorage.setItem(`reviewedDocs_${userId}`, JSON.stringify([...reviewedSet]));
+       console.log(`✅ Document ${d.id} marked as reviewed on card click`);
+     }
+   } catch (err) {
+     console.error('Failed to mark document as reviewed:', err);
+   }
+ }
  
  setSelectedId(d.id);
  // On mobile, open full preview modal immediately
  if (window.innerWidth < 1024) {
    setFullPreview({ ... });
  }
}}
```

---

## 🎯 User Experience Improvement

### Sebelum:
```
User: Klik card dokumen
   ↓
System: Preview tampil
User: Lihat preview
   ↓
User: "Hmm, tinjauan masih sama? Apa dokumen ini tidak ke-mark?" 🤔
User: Klik icon "open_in_new" untuk buka modal
   ↓
System: Mark as reviewed
User: "Oke, sekarang tinjauan berkurang" 😅
```

### Sesudah:
```
User: Klik card dokumen
   ↓
System: 
  1. ✅ Mark as reviewed LANGSUNG
  2. ✅ Preview tampil
User: Lihat preview
   ↓
User: Kembali ke Dashboard
User: "Tinjauan berkurang! Perfect!" 😊
```

**Key Improvement:**
- ✅ **No extra action needed** - Klik card = auto reviewed
- ✅ **Instant mark** - Tidak perlu buka modal full preview
- ✅ **Desktop parity** - Desktop dan mobile behavior konsisten
- ✅ **Better UX** - User tidak perlu extra steps untuk mark document

---

## 📌 Catatan

- **Mark as reviewed** terjadi di onClick handler card (bukan di preview load)
- **Duplicate protection** - Check `!reviewedSet.has(d.id)` sebelum add
- **localStorage key** - `reviewedDocs_${userId}` (per-user)
- **Console log** - Untuk debugging, bisa dihapus di production
- **Error handling** - Try-catch untuk prevent crash jika localStorage error
