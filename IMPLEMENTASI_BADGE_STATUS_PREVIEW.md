# 📋 Implementasi Badge Status pada Preview Terakhir Dibuka

## ✅ Fitur yang Diimplementasikan

Komponen **QuickPreview** (Preview Terakhir Dibuka) sekarang menampilkan **badge status** untuk setiap dokumen, menunjukkan apakah dokumen tersebut berstatus:
- 🟡 **Draft** - Dokumen masih dalam tahap draft
- 🔴 **Private** - Dokumen bersifat privat/terbatas
- 🟢 **Publish** - Dokumen sudah dipublikasikan
- 🟣 **Confidential** - Dokumen rahasia
- ⚫ **Archived** - Dokumen yang sudah diarsipkan

---

## 🎨 Visual Design

### **Lokasi Badge**
```
┌──────────────────────────┐
│  [pdf]            📄 PDF │ ← Badge tipe file (pojok kanan atas)
│                          │
│     ICON FILE BESAR      │
│                          │
│  🟡 Draft                │ ← Badge status (pojok kiri bawah)
└──────────────────────────┘
│  📄 Nama File.pdf        │
│  1.2 MB • baru           │
└──────────────────────────┘
```

### **Color Scheme**

| Status | Badge Color | Text Color | Label |
|--------|-------------|------------|-------|
| DRAFT | `bg-yellow-500` | `text-white` | Draft |
| PRIVATE | `bg-red-500` | `text-white` | Private |
| PUBLISH / PUBLISHED | `bg-green-500` | `text-white` | Publish |
| CONFIDENTIAL | `bg-purple-600` | `text-white` | Rahasia |
| ARCHIVED | `bg-gray-500` | `text-white` | Arsip |
| Others | `bg-gray-400` | `text-white` | (original) |

---

## 🔧 Technical Implementation

### **1. Update App.jsx**

Menambahkan field `status` pada data yang dikirim ke `QuickPreview`:

```javascript
setRecentPreviews(formatted.slice(0, 3).map((f) => ({
  id: f.id,
  filePath: f.filePath,
  name: f.fileName,
  size: f.size,
  time: 'baru',
  type: f.type,
  typeColor: f.typeColor,
  image: '',
  status: f.status, // ✅ Tambahkan field status
})));
```

**Lokasi:**
- Line ~280: Initial fetch documents
- Line ~407: Refresh documents callback

---

### **2. Update DashboardPage.jsx**

**A. Menambahkan field status**
```javascript
return {
  id: doc.id,
  filePath: doc.file_path,
  name: doc.file_name || doc.subject || '-',
  size: sizeText,
  time: doc.updated_at ? new Date(doc.updated_at).toLocaleDateString('id-ID', ...) : '-',
  type: getFileType(doc.mime_type, doc.file_name),
  typeColor: getFileTypeColor(doc.mime_type, doc.file_name),
  image: '',
  status: doc.status, // ✅ Tambahkan status
};
```

**B. Menghapus filter status**

**SEBELUM:**
```javascript
const previews = documents
  .filter((d) => d.status === 'PUBLISHED') // ❌ Hanya PUBLISHED
  .sort(...)
  .slice(0, 8)
  .map(...)
```

**SESUDAH:**
```javascript
const previews = documents
  // ✅ Menampilkan SEMUA status (draft, private, publish)
  .sort(...)
  .slice(0, 8)
  .map(...)
```

---

### **3. Update QuickPreview.jsx**

Menambahkan fungsi `getStatusBadge` dan badge element:

```javascript
function PreviewCard({ preview, cardRef, onOpenFile }) {
  // Fungsi untuk mendapatkan style badge status
  const getStatusBadge = (status) => {
    if (!status) return null;
    
    const statusUpper = status.toUpperCase();
    let bgColor, textColor, label;
    
    switch (statusUpper) {
      case 'DRAFT':
        bgColor = 'bg-yellow-500';
        textColor = 'text-white';
        label = 'Draft';
        break;
      case 'PRIVATE':
        bgColor = 'bg-red-500';
        textColor = 'text-white';
        label = 'Private';
        break;
      case 'PUBLISH':
      case 'PUBLISHED':
        bgColor = 'bg-green-500';
        textColor = 'text-white';
        label = 'Publish';
        break;
      case 'CONFIDENTIAL':
        bgColor = 'bg-purple-600';
        textColor = 'text-white';
        label = 'Rahasia';
        break;
      case 'ARCHIVED':
        bgColor = 'bg-gray-500';
        textColor = 'text-white';
        label = 'Arsip';
        break;
      default:
        bgColor = 'bg-gray-400';
        textColor = 'text-white';
        label = status;
    }
    
    return { bgColor, textColor, label };
  };
  
  const statusBadge = getStatusBadge(preview.status);
  
  return (
    <div className="...">
      <div className="h-28 bg-surface-container-high relative ...">
        {/* Icon file */}
        
        {/* Badge tipe file - pojok kanan atas */}
        <div className="absolute top-2 right-2 ...">
          {preview.type}
        </div>
        
        {/* Badge Status - pojok kiri bawah */}
        {statusBadge && (
          <div className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-full ${statusBadge.bgColor} ${statusBadge.textColor} text-[10px] font-bold shadow-md`}>
            {statusBadge.label}
          </div>
        )}
      </div>
      {/* Nama file dan info */}
    </div>
  );
}
```

---

## 📊 Data Flow

```
Database (documents table)
    ↓
    status: 'DRAFT' | 'PRIVATE' | 'PUBLISHED' | 'CONFIDENTIAL' | 'ARCHIVED'
    ↓
App.jsx / DashboardPage.jsx
    ↓
    formatted.map(f => ({ ...f, status: f.status }))
    ↓
QuickPreview Component
    ↓
    getStatusBadge(preview.status)
    ↓
Badge Element dengan warna sesuai status
    ↓
Display: 🟡 Draft | 🔴 Private | 🟢 Publish | 🟣 Rahasia | ⚫ Arsip
```

---

## 🎬 Demo Use Cases

### **Use Case 1: Dashboard - Preview Update Terkini**

**Sebelum:**
```
┌──────────┐ ┌──────────┐ ┌──────────┐
│   PDF    │ │   PDF    │ │   DOC    │
│          │ │          │ │          │
│ File.pdf │ │ File2.pdf│ │ File.docx│
└──────────┘ └──────────┘ └──────────┘
```

**Sesudah:**
```
┌──────────┐ ┌──────────┐ ┌──────────┐
│   PDF    │ │   PDF    │ │   DOC    │
│          │ │          │ │          │
│🟢 Publish│ │🟡 Draft  │ │🔴 Private│
│ File.pdf │ │ File2.pdf│ │ File.docx│
└──────────┘ └──────────┘ └──────────┘
```

### **Use Case 2: File Saya - Preview Terakhir Dibuka**

**Contoh:**
```
Preview Terakhir Dibuka                    [Lihat Semua Riwayat]

┌──────────┐ ┌──────────┐ ┌──────────┐
│   PDF    │ │   XLS    │ │   PDF    │
│  [pdf]   │ │  [xls]   │ │  [pdf]   │
│          │ │          │ │          │
│🟡 Draft  │ │🟢 Publish│ │🟣 Rahasia│
│          │ │          │ │          │
│Laporan   │ │Budget    │ │Kontrak   │
│1.2 MB    │ │890 KB    │ │2.5 MB    │
└──────────┘ └──────────┘ └──────────┘
```

---

## 🔍 Status Mapping

Database menggunakan nilai uppercase untuk status:

| Database Value | Display Label | Color |
|----------------|---------------|-------|
| `DRAFT` | Draft | 🟡 Yellow |
| `PRIVATE` | Private | 🔴 Red |
| `PUBLISH` | Publish | 🟢 Green |
| `PUBLISHED` | Publish | 🟢 Green |
| `CONFIDENTIAL` | Rahasia | 🟣 Purple |
| `ARCHIVED` | Arsip | ⚫ Gray |
| `null` / `undefined` | (no badge) | - |

---

## 📝 Component Props

### **QuickPreview Component**

```typescript
interface QuickPreviewProps {
  previews: PreviewItem[];
  title?: string; // Default: "Preview Update Terkini"
  slider?: boolean; // Default: false
  onOpenFile?: (preview: PreviewItem) => void;
}

interface PreviewItem {
  id: string;
  filePath: string;
  name: string;
  size: string; // e.g., "1.2 MB"
  time: string; // e.g., "baru" or "12 Jan 2026"
  type: string; // e.g., "pdf", "doc", "xls"
  typeColor: string; // e.g., "text-error"
  image?: string;
  status?: string; // ✅ NEW: "DRAFT" | "PRIVATE" | "PUBLISHED" | etc.
}
```

---

## 🎯 Fitur Lengkap

### ✅ **Preview Terakhir Dibuka - File Saya Page**
- Menampilkan **3 dokumen terakhir** yang diupload/diupdate
- Menampilkan **semua status** (tidak hanya PUBLISHED)
- Badge status di pojok kiri bawah card
- Badge tipe file di pojok kanan atas card

### ✅ **Preview Update Terkini - Dashboard**
- Menampilkan **8 dokumen terakhir** yang diupdate
- Menampilkan **semua status** (draft, private, publish, dll)
- Slider mode dengan auto-scroll
- Infinite scroll effect
- Click card untuk open file preview

---

## 🚀 Next Steps

### **Optional Enhancements:**

1. **Filter by Status**
   ```javascript
   // Tambahkan dropdown filter status
   const [filterStatus, setFilterStatus] = useState('ALL');
   
   const filteredPreviews = previews.filter(p => 
     filterStatus === 'ALL' || p.status === filterStatus
   );
   ```

2. **Status Legend**
   ```javascript
   // Tambahkan legend di bawah preview
   <div className="flex gap-2 mt-2">
     <span className="flex items-center gap-1">
       <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
       <span className="text-xs">Draft</span>
     </span>
     <span className="flex items-center gap-1">
       <div className="w-3 h-3 bg-red-500 rounded-full"></div>
       <span className="text-xs">Private</span>
     </span>
     {/* ... */}
   </div>
   ```

3. **Status Count Badge**
   ```javascript
   // Tambahkan count per status di header
   <h3>
     Preview Terakhir Dibuka
     <span className="ml-2 px-2 py-1 bg-yellow-100 text-xs rounded">
       {previews.filter(p => p.status === 'DRAFT').length} Draft
     </span>
   </h3>
   ```

---

## 🐛 Troubleshooting

### ❌ **Badge tidak muncul**
**Penyebab:** Field `status` tidak ada di data preview  
**Solusi:** Pastikan `status: f.status` sudah ditambahkan di App.jsx dan DashboardPage.jsx

### ❌ **Badge muncul tapi warnanya salah**
**Penyebab:** Nilai status di database tidak sesuai dengan mapping  
**Solusi:** Check nilai status di database, pastikan menggunakan uppercase (DRAFT, PRIVATE, PUBLISHED)

### ❌ **Badge tertutup oleh elemen lain**
**Penyebab:** z-index atau positioning issue  
**Solusi:** Badge sudah menggunakan `absolute` positioning dengan `bottom-2 left-2`, pastikan parent container menggunakan `relative`

### ❌ **Preview tidak menampilkan dokumen draft**
**Penyebab:** Filter status masih aktif di DashboardPage  
**Solusi:** Pastikan baris `.filter((d) => d.status === 'PUBLISHED')` sudah dihapus

---

## 📄 Files Modified

1. ✅ `src/App.jsx` (lines ~280, ~407)
   - Menambahkan `status: f.status` ke recentPreviews

2. ✅ `src/pages/DashboardPage.jsx` (lines ~90-110)
   - Menambahkan `status: doc.status` ke previews
   - Menghapus filter `.filter((d) => d.status === 'PUBLISHED')`

3. ✅ `src/components/QuickPreview.jsx` (lines ~12-60)
   - Menambahkan fungsi `getStatusBadge()`
   - Menambahkan badge element di card

---

## ✨ Summary

✅ **Badge status sekarang muncul di semua preview card**  
✅ **Menampilkan dokumen dengan semua status (draft, private, publish)**  
✅ **Color coding intuitif: Yellow=Draft, Red=Private, Green=Publish**  
✅ **Badge di posisi kiri bawah, tidak mengganggu UI**  
✅ **Kompatibel dengan slider mode dan static mode**  
✅ **Support untuk status tambahan (CONFIDENTIAL, ARCHIVED)**

**Implementasi selesai dan siap digunakan!** 🚀
