# 🔧 Fix: Preview Terakhir Dibuka - Tracking Dokumen yang Dibuka

## ❌ Masalah Sebelumnya

**Problem:**  
Ketika user melakukan pratinjau dokumen (double-click di Grid View atau klik icon "Lihat"), dokumen tersebut **TIDAK muncul** di daftar "Preview Terakhir Dibuka".

**Root Cause:**  
`recentPreviews` sebelumnya hanya diisi berdasarkan **3 dokumen terakhir yang diupload/diupdate**, BUKAN dokumen yang **benar-benar dibuka/dipratinjau** oleh user.

```javascript
// ❌ SEBELUMNYA (SALAH):
setRecentPreviews(formatted.slice(0, 3).map((f) => ({
  // Ini hanya ambil 3 dokumen pertama dari list
  // BUKAN dokumen yang dibuka user!
  ...
})));
```

---

## ✅ Solusi yang Diimplementasikan

### **1. Tracking Dokumen yang Dibuka**
Setiap kali user **membuka preview dokumen**, sistem akan:
1. **Menyimpan** dokumen tersebut ke **localStorage** (persistent storage)
2. **Update** state `recentPreviews` untuk display real-time
3. **Move to top** jika dokumen sudah pernah dibuka sebelumnya
4. **Batasi maksimal 10** dokumen di localStorage, **3 dokumen** untuk display

### **2. Persistent Storage dengan localStorage**
Data preview tersimpan per-user menggunakan key:
```
localStorage key: recentPreviews_{user.id}
```

Ini memastikan:
- ✅ Data tidak hilang saat refresh halaman
- ✅ Setiap user punya history preview sendiri
- ✅ Data tetap ada meskipun logout/login ulang

---

## 🔧 Technical Implementation

### **A. Update App.jsx - Fungsi `handleOpenFile`**

#### **SEBELUMNYA:**
```javascript
const handleOpenFile = (preview) => {
  setPreviewFile(preview);
  // ❌ Tidak ada tracking!
};
```

#### **SESUDAH:**
```javascript
const handleOpenFile = (preview) => {
  setPreviewFile(preview);
  
  // ✅ Track dokumen yang dibuka
  if (user && preview) {
    // Ambil dari localStorage
    const savedPreviews = localStorage.getItem(`recentPreviews_${user.id}`);
    let recentList = [];
    
    if (savedPreviews) {
      try {
        recentList = JSON.parse(savedPreviews);
      } catch (err) {
        console.error('Gagal parse recent previews:', err);
      }
    }
    
    // Hapus dokumen yang sama (untuk move to top)
    recentList = recentList.filter(p => p.id !== preview.id);
    
    // Tambahkan di posisi pertama
    recentList.unshift(preview);
    
    // Batasi max 10 dokumen
    recentList = recentList.slice(0, 10);
    
    // Simpan ke localStorage
    localStorage.setItem(`recentPreviews_${user.id}`, JSON.stringify(recentList));
    
    // Update state untuk display (max 3)
    setRecentPreviews(recentList.slice(0, 3));
  }
};
```

---

### **B. Load Recent Previews dari localStorage saat Login**

```javascript
// Load recent previews saat pertama kali user login
useEffect(() => {
  if (user) {
    const savedPreviews = localStorage.getItem(`recentPreviews_${user.id}`);
    if (savedPreviews) {
      try {
        const parsed = JSON.parse(savedPreviews);
        setRecentPreviews(parsed.slice(0, 3)); // Max 3 items untuk display
      } catch (err) {
        console.error('Gagal memuat recent previews:', err);
      }
    }
  }
}, [user]);
```

---

### **C. Update FileTable.jsx - Tambah Props `onPreview`**

#### **Function Signature:**
```javascript
// SEBELUMNYA:
export default function FileTable({ files, title, onOpenAdd, supabase, onEdit, onRefresh }) {

// SESUDAH:
export default function FileTable({ files, title, onOpenAdd, supabase, onEdit, onRefresh, onPreview }) {
```

#### **Update fungsi `handleView`:**
```javascript
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
  
  // Open preview modal
  setPreviewFile(file);
  setPreviewUrl(data.signedUrl);
  
  // ✅ BARU: Track dokumen yang dibuka
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
```

---

### **D. Update App.jsx - Pass Props `onPreview` ke FileTable**

```javascript
<FileTable
  files={filteredFiles}
  title={selectedDirectoryName}
  onOpenAdd={() => setShowAddModal(true)}
  supabase={supabase}
  onEdit={(file) => setEditDoc(file)}
  onRefresh={refreshDocuments}
  onPreview={handleOpenFile}  // ✅ BARU: Pass callback untuk tracking
/>
```

---

### **E. Hapus Kode Lama yang Mengisi recentPreviews**

#### **SEBELUMNYA (Di fetchDocuments dan refreshDocuments):**
```javascript
setFiles(formatted);
setRecentPreviews(formatted.slice(0, 3).map((f) => ({
  // ❌ Ini salah - ambil 3 dokumen pertama bukan yang dibuka
  ...
})));
```

#### **SESUDAH:**
```javascript
setFiles(formatted);
// ✅ recentPreviews sekarang diisi melalui handleOpenFile (tracking dokumen yang dibuka)
```

---

## 📊 Data Flow

```
User double-click file icon di Grid View
    ↓
FileTable.handleView() dipanggil
    ↓
Preview modal dibuka dengan signed URL
    ↓
onPreview callback dipanggil dengan data file
    ↓
App.handleOpenFile() menerima data
    ↓
Ambil recentPreviews dari localStorage
    ↓
Hapus dokumen yang sama (untuk move to top)
    ↓
Tambahkan dokumen baru di posisi pertama
    ↓
Batasi max 10 dokumen
    ↓
Simpan ke localStorage (persistent)
    ↓
Update state recentPreviews (max 3 untuk display)
    ↓
QuickPreview component re-render
    ↓
Dokumen muncul di "Preview Terakhir Dibuka" ✅
```

---

## 🎬 Demo Use Case

### **Scenario 1: User Pertama Kali Buka Dokumen**

**Step 1:** User double-click file "Laporan.pdf" di Grid View  
**Result:** 
```
Preview Terakhir Dibuka
┌────────────┐
│   PDF      │
│🟢 Publish  │
│ Laporan.pdf│
└────────────┘
```

**Step 2:** User double-click file "Budget.xlsx"  
**Result:**
```
Preview Terakhir Dibuka
┌────────────┐ ┌────────────┐
│   XLS      │ │   PDF      │
│🟢 Publish  │ │🟢 Publish  │
│ Budget.xlsx│ │ Laporan.pdf│
└────────────┘ └────────────┘
```

**Step 3:** User double-click file "Memo.docx"  
**Result:**
```
Preview Terakhir Dibuka
┌────────────┐ ┌────────────┐ ┌────────────┐
│   DOC      │ │   XLS      │ │   PDF      │
│🟡 Draft    │ │🟢 Publish  │ │🟢 Publish  │
│ Memo.docx  │ │ Budget.xlsx│ │ Laporan.pdf│
└────────────┘ └────────────┘ └────────────┘
```

### **Scenario 2: User Buka Dokumen yang Sudah Pernah Dibuka**

**Current State:**
```
┌────────────┐ ┌────────────┐ ┌────────────┐
│   DOC      │ │   XLS      │ │   PDF      │
│ Memo.docx  │ │ Budget.xlsx│ │ Laporan.pdf│
└────────────┘ └────────────┘ └────────────┘
```

**Action:** User double-click "Laporan.pdf" lagi  
**Result:** "Laporan.pdf" **move to top** (posisi pertama)
```
┌────────────┐ ┌────────────┐ ┌────────────┐
│   PDF      │ │   DOC      │ │   XLS      │
│ Laporan.pdf│ │ Memo.docx  │ │ Budget.xlsx│
└────────────┘ └────────────┘ └────────────┘
```

### **Scenario 3: Refresh Halaman**

**Before Refresh:**
```
Preview Terakhir Dibuka
┌────────────┐ ┌────────────┐ ┌────────────┐
│ Laporan.pdf│ │ Memo.docx  │ │ Budget.xlsx│
└────────────┘ └────────────┘ └────────────┘
```

**Action:** User refresh halaman (F5)  
**Result:** Data **TETAP ADA** karena tersimpan di localStorage ✅
```
Preview Terakhir Dibuka
┌────────────┐ ┌────────────┐ ┌────────────┐
│ Laporan.pdf│ │ Memo.docx  │ │ Budget.xlsx│
└────────────┘ └────────────┘ └────────────┘
```

---

## 🎯 Fitur Lengkap

### ✅ **Tracking Real-time**
- Dokumen yang dibuka langsung masuk ke preview list
- Update instant tanpa perlu refresh halaman

### ✅ **Move to Top**
- Dokumen yang dibuka ulang akan pindah ke posisi teratas
- Menunjukkan dokumen yang paling baru dibuka

### ✅ **Persistent Storage**
- Data tersimpan di localStorage
- Tidak hilang saat refresh atau logout/login ulang
- Per-user storage (setiap user punya history sendiri)

### ✅ **Limit Control**
- Max 10 dokumen di localStorage (untuk performa)
- Max 3 dokumen ditampilkan di UI (untuk tidak terlalu ramai)

### ✅ **Badge Status**
- Badge status tetap muncul (Draft, Private, Publish, dll)
- Sesuai dengan implementasi sebelumnya

---

## 📝 Storage Format

### **localStorage Key:**
```
recentPreviews_{user_id}
```

### **Data Structure:**
```json
[
  {
    "id": "doc-123",
    "filePath": "documents/file1.pdf",
    "name": "Laporan.pdf",
    "size": "1.2 MB",
    "time": "12 Jan 2026",
    "type": "pdf",
    "typeColor": "text-error",
    "image": "",
    "status": "PUBLISHED"
  },
  {
    "id": "doc-456",
    "filePath": "documents/file2.docx",
    "name": "Memo.docx",
    "size": "450 KB",
    "time": "11 Jan 2026",
    "type": "doc",
    "typeColor": "text-primary-container",
    "image": "",
    "status": "DRAFT"
  },
  // ... max 10 items
]
```

---

## 🔍 Debugging

### **Check localStorage Data:**
```javascript
// Di browser console
const userId = 'user-id-here';
const data = localStorage.getItem(`recentPreviews_${userId}`);
console.log(JSON.parse(data));
```

### **Clear localStorage (Reset):**
```javascript
// Di browser console
const userId = 'user-id-here';
localStorage.removeItem(`recentPreviews_${userId}`);
```

### **Check State:**
```javascript
// Di App.jsx, tambahkan console.log
console.log('Recent Previews State:', recentPreviews);
```

---

## 🐛 Troubleshooting

### ❌ **Preview tidak muncul setelah dibuka**
**Penyebab:** Callback `onPreview` tidak dipanggil  
**Solusi:** Check bahwa props `onPreview={handleOpenFile}` sudah ditambahkan di FileTable

### ❌ **Preview hilang setelah refresh**
**Penyebab:** Data tidak tersimpan ke localStorage  
**Solusi:** Check browser console untuk error localStorage, pastikan tidak dalam mode incognito/private

### ❌ **Preview muncul tapi data lama**
**Penyebab:** useEffect untuk load localStorage belum jalan  
**Solusi:** Check dependency array useEffect, pastikan `[user]` sudah benar

### ❌ **Badge status tidak muncul**
**Penyebab:** Field `status` tidak dipass dalam onPreview callback  
**Solusi:** Check bahwa `status: file.status` sudah ada di object yang dipass

---

## 📄 Files Modified

1. ✅ **src/App.jsx**
   - Added `handleOpenFile` logic untuk tracking
   - Added useEffect untuk load dari localStorage
   - Removed old code yang mengisi recentPreviews dari formatted.slice()
   - Added props `onPreview={handleOpenFile}` ke FileTable

2. ✅ **src/components/FileTable.jsx**
   - Added props `onPreview` di function signature
   - Updated `handleView` untuk call onPreview callback
   - Pass data file lengkap dengan status ke callback

---

## ✨ Summary

### **Sebelum Fix:**
- ❌ Preview Terakhir Dibuka hanya menampilkan 3 dokumen terakhir diupload
- ❌ Tidak tracking dokumen yang benar-benar dibuka user
- ❌ Data hilang saat refresh halaman

### **Sesudah Fix:**
- ✅ Preview Terakhir Dibuka menampilkan dokumen yang benar-benar dibuka user
- ✅ Real-time tracking setiap kali user buka preview
- ✅ Data persistent dengan localStorage (tidak hilang saat refresh)
- ✅ Move to top untuk dokumen yang dibuka ulang
- ✅ Per-user storage
- ✅ Limit control (max 10 di storage, max 3 di display)

---

## 🚀 Testing Steps

1. ✅ Login ke aplikasi
2. ✅ Double-click file di Grid View untuk buka preview
3. ✅ Check "Preview Terakhir Dibuka" - file harus muncul
4. ✅ Buka file lain - harus muncul di posisi pertama
5. ✅ Buka file yang sama lagi - harus move to top
6. ✅ Refresh halaman (F5) - preview list harus tetap ada
7. ✅ Logout dan login ulang - preview list harus tetap ada

**Fix berhasil diimplementasikan dan siap untuk testing!** 🎉
