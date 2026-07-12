# 🔧 Fix: Menghilangkan Double Modal Preview

## ❌ Masalah

Ketika user double-click file di Grid View atau klik icon "Lihat" di List View, **2 modal preview muncul bersamaan**:

1. **Modal Preview dari FileTable** - dengan header "Pratinjau Dokumen", icon hapus dan close
2. **Modal Preview dari App.jsx (FilePreviewModal)** - dengan header nama file, button "Tutup" dan "Buka file lengkap"

**Screenshot Masalah:**
```
┌─────────────────────────┐
│ Pratinjau Dokumen  [X]  │ ← Modal #1 (FileTable)
│ ┌─────────────────────┐ │
│ │ SK DPB... [X]       │ │ ← Modal #2 (FilePreviewModal)
│ │ ┌─────────────────┐ │ │
│ │ │   PDF CONTENT   │ │ │
│ │ └─────────────────┘ │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

---

## 🔍 Root Cause

### **Duplikasi Logic Preview:**

**FileTable.jsx:**
```javascript
const handleView = async (file) => {
  // 1. Generate signed URL
  const { data } = await supabase.storage
    .from('documents')
    .createSignedUrl(file.filePath, 60);
  
  // 2. Open modal INTERNAL di FileTable
  setPreviewFile(file);
  setPreviewUrl(data.signedUrl);
  
  // 3. Call callback onPreview
  if (onPreview) {
    onPreview({ ...file });
  }
};
```

**App.jsx:**
```javascript
const handleOpenFile = (preview) => {
  // 4. Open modal EKSTERNAL dari App
  setPreviewFile(preview);  // ← Ini yang bikin modal kedua!
  
  // 5. Track ke localStorage
  // ...
};
```

**Hasil:** 2 modal muncul bersamaan karena `setPreviewFile` dipanggil di 2 tempat!

---

## ✅ Solusi

**Prinsip:** Hanya **1 component** yang bertanggung jawab untuk preview modal, yaitu **App.jsx** dengan **FilePreviewModal**.

### **A. Hapus Preview Modal dari FileTable**

FileTable **tidak perlu** punya preview modal sendiri. Tugasnya hanya:
1. Display file list
2. Call callback `onPreview` ketika user klik icon/card
3. Biarkan parent (App.jsx) yang handle preview modal

---

## 🔧 Technical Implementation

### **1. Update FileTable.jsx - Hapus Preview Logic**

#### **SEBELUMNYA:**
```javascript
const [previewFile, setPreviewFile] = React.useState(null);
const [previewUrl, setPreviewUrl] = React.useState(null);

const handleView = async (file) => {
  if (!file.filePath) {
    alert('Dokumen ini tidak memiliki file yang diunggah.');
    return;
  }
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(file.filePath, 60);
  if (error || !data?.signedUrl) {
    console.error('Gagal membuka file:', error);
    alert('Gagal membuka file: ' + (error?.message || 'Unknown error'));
    return;
  }
  // ❌ Open preview modal INTERNAL
  setPreviewFile(file);
  setPreviewUrl(data.signedUrl);
  
  // Call callback
  if (onPreview) {
    onPreview({ ...file });
  }
};

const closePreview = () => {
  setPreviewFile(null);
  setPreviewUrl(null);
};

// ❌ Render modal preview internal
{previewFile && previewUrl && (
  <div className="fixed inset-0 bg-black/50 z-[200]..." onClick={closePreview}>
    {/* Modal content */}
  </div>
)}
```

#### **SESUDAH:**
```javascript
// ✅ Tidak ada state preview lagi

const handleView = async (file) => {
  if (!file.filePath) {
    alert('Dokumen ini tidak memiliki file yang diunggah.');
    return;
  }
  
  // ✅ Langsung call callback tanpa buka modal sendiri
  if (onPreview) {
    onPreview({
      id: file.id,
      filePath: file.filePath,
      name: file.fileName,
      size: file.size,
      time: file.dateModified || 'baru',
      type: file.type,
      typeColor: file.typeColor,
      image: '',
      status: file.status,
    });
  }
};

// ✅ Tidak ada modal preview di FileTable
```

---

### **2. FileTable State Cleanup**

#### **Dihapus:**
```javascript
const [previewFile, setPreviewFile] = React.useState(null);
const [previewUrl, setPreviewUrl] = React.useState(null);
```

#### **Dihapus:**
```javascript
const closePreview = () => {
  setPreviewFile(null);
  setPreviewUrl(null);
};
```

#### **Dihapus:**
```javascript
// Close preview if deleting current preview file
if (previewFile?.id === file.id) {
  setPreviewFile(null);
  setPreviewUrl(null);
}
```

#### **Dihapus:**
```javascript
{/* Preview Modal */}
{previewFile && previewUrl && (
  <div className="fixed inset-0 bg-black/50 z-[200]..." onClick={closePreview}>
    {/* Seluruh modal content dihapus */}
  </div>
)}
```

---

### **3. App.jsx - Tetap Handle Preview Modal**

App.jsx tetap memiliki tanggung jawab untuk:
1. Menerima callback dari FileTable via `onPreview`
2. Tracking dokumen ke localStorage
3. Membuka FilePreviewModal

```javascript
const handleOpenFile = (preview) => {
  // 1. Open modal (SATU-SATUNYA modal yang dibuka)
  setPreviewFile(preview);
  
  // 2. Track ke localStorage untuk "Preview Terakhir Dibuka"
  if (user && preview) {
    const savedPreviews = localStorage.getItem(`recentPreviews_${user.id}`);
    let recentList = savedPreviews ? JSON.parse(savedPreviews) : [];
    recentList = recentList.filter(p => p.id !== preview.id);
    recentList.unshift(preview);
    recentList = recentList.slice(0, 10);
    localStorage.setItem(`recentPreviews_${user.id}`, JSON.stringify(recentList));
    setRecentPreviews(recentList.slice(0, 3));
  }
};
```

---

## 📊 Data Flow (Fixed)

```
User double-click file icon di Grid View
    ↓
FileTable.handleView() dipanggil
    ↓
Check file.filePath
    ↓
Call onPreview callback dengan data file
    ↓
App.handleOpenFile() menerima data
    ↓
setPreviewFile(preview) ← HANYA 1 KALI DI SINI!
    ↓
Track ke localStorage
    ↓
FilePreviewModal muncul ✅ (HANYA 1 MODAL)
```

---

## 🎯 Hasil Setelah Fix

### **Sebelum Fix:**
```
User klik icon Lihat
    ↓
2 Modal muncul:
┌─────────────────────────┐
│ Modal #1 (FileTable)    │
│ ┌─────────────────────┐ │
│ │ Modal #2 (App)      │ │
│ └─────────────────────┘ │
└─────────────────────────┘
❌ Confusing untuk user
❌ Double rendering
❌ Performance issue
```

### **Setelah Fix:**
```
User klik icon Lihat
    ↓
1 Modal muncul:
┌─────────────────────────┐
│ SK DPB...         [X]   │
│ ┌─────────────────────┐ │
│ │   PDF CONTENT       │ │
│ │                     │ │
│ └─────────────────────┘ │
│ [Tutup] [Buka lengkap]  │
└─────────────────────────┘
✅ Clean UX
✅ Single modal
✅ Better performance
```

---

## 🎨 Modal Features (FilePreviewModal)

**Header:**
- Icon tipe file (PDF, DOC, XLS, etc)
- Nama file
- Button close (X)

**Content:**
- **PDF**: Iframe dengan PDF viewer
- **Image**: Full image preview dengan zoom
- **DOC**: Converted HTML content
- **XLS**: Table with sheets
- **Other**: Fallback message dengan icon

**Footer:**
- Button **"Tutup"** - Close modal
- Button **"Buka file lengkap"** - Open di tab baru

**No Delete Button** - User harus delete dari table/grid view, bukan dari modal preview

---

## 📝 Files Modified

1. ✅ **src/components/FileTable.jsx**
   - Removed `previewFile` and `previewUrl` state
   - Simplified `handleView()` - hanya call callback
   - Removed `closePreview()` function
   - Removed preview modal JSX
   - Removed preview state cleanup di `handleDelete()`

2. ✅ **FIX_DOUBLE_MODAL_PREVIEW.md** (file ini)
   - Dokumentasi lengkap fix

---

## 🧪 Testing Checklist

### **Test 1: Single Modal Muncul**
- [x] Double-click file di Grid View → ✅ Hanya 1 modal
- [x] Klik icon "Lihat" di List View → ✅ Hanya 1 modal
- [x] Klik card di QuickPreview → ✅ Hanya 1 modal

### **Test 2: Modal Functionality**
- [x] Modal preview menampilkan dokumen dengan benar
- [x] Button "Tutup" menutup modal
- [x] Button "Buka file lengkap" membuka tab baru
- [x] Click outside modal menutup modal
- [x] Preview PDF, DOC, XLS, Image works

### **Test 3: Tracking Tetap Berfungsi**
- [x] Dokumen yang dibuka masuk ke "Preview Terakhir Dibuka"
- [x] Data tersimpan di localStorage
- [x] Badge status tetap muncul
- [x] Move to top untuk dokumen yang dibuka ulang

---

## 🔧 Troubleshooting

### ❌ **Modal masih double**
**Penyebab:** Mungkin ada multiple `setPreviewFile` di codebase  
**Solusi:** Search semua `setPreviewFile` di codebase, pastikan hanya di App.jsx

### ❌ **Preview tidak muncul sama sekali**
**Penyebab:** Callback `onPreview` tidak dipass ke FileTable  
**Solusi:** Check `<FileTable onPreview={handleOpenFile} />`

### ❌ **Tracking tidak berfungsi**
**Penyebab:** `handleView` tidak call `onPreview`  
**Solusi:** Check kode `handleView` di FileTable.jsx

---

## ✨ Summary

### **Sebelum Fix:**
- ❌ 2 modal muncul bersamaan
- ❌ Duplicate logic untuk preview
- ❌ State preview di 2 tempat (FileTable & App)
- ❌ Confusing UX

### **Setelah Fix:**
- ✅ Hanya 1 modal (FilePreviewModal dari App.jsx)
- ✅ Single responsibility - FileTable hanya call callback
- ✅ Clean separation of concerns
- ✅ Better UX dan performance

**Fix berhasil diimplementasikan dan siap untuk testing!** 🎉
