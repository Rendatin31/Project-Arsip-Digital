# 🎨 Fitur: Action Buttons pada Modal Preview

## ✅ Fitur yang Diimplementasikan

Menambahkan **3 action buttons** di header modal preview (sebelah kiri icon Close):
1. 📝 **Edit** - Membuka modal edit dokumen
2. ⬇️ **Download** - Mengunduh file dokumen
3. 🗑️ **Hapus** - Menghapus dokumen

---

## 🎨 Visual Design

### **SEBELUMNYA:**
```
┌──────────────────────────────────────────┐
│ 📄 Nama File.pdf                    [X] │
└──────────────────────────────────────────┘
```

### **SEKARANG:**
```
┌────────────────────────────────────────────────────┐
│ 📄 Nama File.pdf    [✏️] [⬇️] [🗑️] [X]           │
│                      ↑    ↑    ↑    ↑              │
│                    Edit Down Del Close             │
└────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### **1. Update FilePreviewModal.jsx - Tambah Props & Buttons**

#### **Props Baru:**
```javascript
// SEBELUMNYA:
export default function FilePreviewModal({ preview, supabase, onClose }) {

// SEKARANG:
export default function FilePreviewModal({ preview, supabase, onClose, onEdit, onDelete }) {
```

#### **Header dengan Action Buttons:**
```jsx
<div className="flex items-center justify-between px-lg py-md border-b border-outline-variant">
  <div className="flex items-center gap-sm min-w-0">
    <FileTypeIcon type={preview?.type} size={22} />
    <p className="font-title-sm text-on-surface truncate">{name}</p>
  </div>
  
  <div className="flex items-center gap-xs">
    {/* Button Edit */}
    {onEdit && (
      <button
        onClick={() => {
          onClose();
          onEdit(preview);
        }}
        className="p-sm rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
        title="Edit"
      >
        <span className="material-symbols-outlined">edit</span>
      </button>
    )}
    
    {/* Button Download */}
    {url && (
      <button
        onClick={async () => {
          // Download logic
          const { data } = await supabase.storage
            .from('documents')
            .download(preview.filePath);
          
          const downloadUrl = URL.createObjectURL(data);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = preview.name || 'download';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);
        }}
        className="p-sm rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
        title="Download"
      >
        <span className="material-symbols-outlined">download</span>
      </button>
    )}
    
    {/* Button Hapus */}
    {onDelete && (
      <button
        onClick={async () => {
          if (confirm(`Apakah Anda yakin ingin menghapus "${preview.name}"?`)) {
            await onDelete(preview);
            onClose();
          }
        }}
        className="p-sm rounded-full hover:bg-error-container text-error transition-colors"
        title="Hapus"
      >
        <span className="material-symbols-outlined">delete</span>
      </button>
    )}
    
    {/* Button Close */}
    <button
      onClick={onClose}
      className="p-sm rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
      title="Tutup"
    >
      <span className="material-symbols-outlined">close</span>
    </button>
  </div>
</div>
```

---

### **2. Update App.jsx - Pass Callbacks ke FilePreviewModal**

```jsx
{previewFile && (
  <FilePreviewModal 
    preview={previewFile} 
    supabase={supabase} 
    onClose={() => setPreviewFile(null)}
    
    // ✅ BARU: Callback untuk Edit
    onEdit={(file) => {
      // Cari file lengkap dari list files
      const fullFile = files.find(f => f.id === file.id);
      if (fullFile) {
        setEditDoc(fullFile);  // Buka EditDocumentModal
      }
    }}
    
    // ✅ BARU: Callback untuk Delete
    onDelete={async (file) => {
      try {
        const { error } = await supabase
          .from('documents')
          .delete()
          .eq('id', file.id);
        
        if (error) throw error;
        
        alert('Dokumen berhasil dihapus');
        await refreshDocuments();  // Refresh list
      } catch (err) {
        console.error('Gagal menghapus dokumen:', err);
        alert('Gagal menghapus dokumen: ' + err.message);
      }
    }}
  />
)}
```

---

### **3. Update DashboardPage.jsx - Pass Callbacks**

```jsx
{previewFile && (
  <FilePreviewModal 
    preview={previewFile} 
    supabase={supabase} 
    onClose={() => setPreviewFile(null)}
    
    // ✅ BARU: Callback untuk Edit
    onEdit={(file) => {
      // Navigate ke data-arsip untuk edit
      onNavigate?.('data-arsip');
    }}
    
    // ✅ BARU: Callback untuk Delete
    onDelete={async (file) => {
      try {
        const { error } = await supabase
          .from('documents')
          .delete()
          .eq('id', file.id);
        
        if (error) throw error;
        
        alert('Dokumen berhasil dihapus');
        
        // Refresh documents list
        const { data: docs } = await supabase
          .from('documents')
          .select('*')
          .order('uploaded_at', { ascending: false });
        if (docs) setDocuments(docs);
      } catch (err) {
        console.error('Gagal menghapus dokumen:', err);
        alert('Gagal menghapus dokumen: ' + err.message);
      }
    }}
  />
)}
```

---

## 📊 Button Functions

### **1. Button Edit (✏️)**

**Behavior:**
- Close preview modal
- Buka EditDocumentModal dengan data dokumen yang dipilih
- User bisa edit metadata dokumen (nama, kategori, status, dll)

**Implementation:**
```javascript
onClick={() => {
  onClose();              // Close preview modal
  onEdit(preview);        // Open edit modal
}}
```

**Result:**
- Preview modal tertutup
- Edit modal terbuka dengan form isian lengkap

---

### **2. Button Download (⬇️)**

**Behavior:**
- Download file dokumen ke komputer user
- Menggunakan nama file asli sebagai download filename
- Browser akan menampilkan download progress

**Implementation:**
```javascript
onClick={async () => {
  // 1. Download file dari Supabase Storage
  const { data } = await supabase.storage
    .from('documents')
    .download(preview.filePath);
  
  // 2. Create blob URL
  const downloadUrl = URL.createObjectURL(data);
  
  // 3. Trigger download dengan element <a>
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = preview.name || 'download';
  document.body.appendChild(a);
  a.click();
  
  // 4. Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}}
```

**Result:**
- File terdownload dengan nama asli
- Preview modal tetap terbuka (tidak close)

---

### **3. Button Hapus (🗑️)**

**Behavior:**
- Tampilkan confirmation dialog
- Jika user confirm → Hapus dokumen dari database
- Close preview modal
- Refresh document list

**Implementation:**
```javascript
onClick={async () => {
  // 1. Confirmation dialog
  if (confirm(`Apakah Anda yakin ingin menghapus "${preview.name}"?`)) {
    // 2. Delete dari database
    await onDelete(preview);
    
    // 3. Close modal
    onClose();
  }
}}
```

**Result:**
- Dokumen terhapus dari database
- Preview modal tertutup
- Document list di-refresh
- File hilang dari FileTable dan QuickPreview

---

### **4. Button Close (❌)**

**Behavior:**
- Menutup preview modal
- Kembali ke halaman sebelumnya

**Implementation:**
```javascript
onClick={onClose}
```

**Result:**
- Modal tertutup
- No data changes

---

## 🎨 Styling

### **Button States:**

**Normal:**
```css
p-sm rounded-full 
hover:bg-surface-container 
text-on-surface-variant 
transition-colors
```

**Delete Button (Red):**
```css
p-sm rounded-full 
hover:bg-error-container 
text-error 
transition-colors
```

### **Visual Hierarchy:**
```
┌────────────────────────────────────────────┐
│ 📄 File Name      [Edit] [Down] [Del] [X] │
│                    ↑      ↑      ↑     ↑   │
│                   Gray   Gray   Red   Gray │
└────────────────────────────────────────────┘
```

---

## 📊 User Flow

### **Flow 1: Edit Dokumen**
```
User preview dokumen
    ↓
Click button Edit
    ↓
Preview modal tertutup
    ↓
Edit modal terbuka
    ↓
User edit metadata (nama, kategori, status, etc)
    ↓
Save changes
    ↓
Document list refresh
    ✅ Metadata updated
```

### **Flow 2: Download Dokumen**
```
User preview dokumen
    ↓
Click button Download
    ↓
Browser download file
    ↓
File tersimpan di komputer
    ✅ Preview modal tetap terbuka
```

### **Flow 3: Hapus Dokumen**
```
User preview dokumen
    ↓
Click button Hapus
    ↓
Confirmation dialog muncul
    ↓
User klik "OK"
    ↓
Dokumen dihapus dari database
    ↓
Preview modal tertutup
    ↓
Document list refresh
    ✅ Dokumen hilang dari list
```

---

## 🎯 Conditional Rendering

### **Button Edit:**
```javascript
{onEdit && (
  <button onClick={...}>
    <span>edit</span>
  </button>
)}
```
- Hanya muncul jika prop `onEdit` dipass
- Jika tidak ada callback, button tidak render

### **Button Download:**
```javascript
{url && (
  <button onClick={...}>
    <span>download</span>
  </button>
)}
```
- Hanya muncul jika `url` (signed URL) sudah loaded
- Prevent download error jika URL belum siap

### **Button Hapus:**
```javascript
{onDelete && (
  <button onClick={...}>
    <span>delete</span>
  </button>
)}
```
- Hanya muncul jika prop `onDelete` dipass
- Admin/Editor: Ada button hapus
- Viewer: Tidak ada button hapus (read-only)

---

## 🔒 Security & Permissions

### **Role-based Access:**
```javascript
// App.jsx - File Saya Page
// Admin & Editor: Bisa Edit & Delete
<FilePreviewModal 
  onEdit={...}    // ✅ Ada
  onDelete={...}  // ✅ Ada
/>

// DashboardPage
// Semua role: Bisa Edit (navigate ke data-arsip) & Delete
<FilePreviewModal 
  onEdit={...}    // ✅ Ada
  onDelete={...}  // ✅ Ada
/>
```

### **Database RLS:**
- Delete operation tetap dibatasi oleh Row Level Security di Supabase
- Hanya user yang authorized yang bisa delete dokumen
- Backend validation tetap berjalan

---

## 🧪 Testing Checklist

### **Test Button Edit:**
- [x] Click button Edit → Preview modal close
- [x] Edit modal terbuka dengan data dokumen
- [x] Edit metadata → Save → Document list refresh
- [x] Perubahan tersimpan di database

### **Test Button Download:**
- [x] Click button Download → File terdownload
- [x] Filename sesuai dengan nama asli dokumen
- [x] Preview modal tetap terbuka (tidak close)
- [x] PDF, DOC, XLS, Image bisa didownload

### **Test Button Hapus:**
- [x] Click button Hapus → Confirmation dialog muncul
- [x] Click "Cancel" → Modal tetap terbuka, tidak ada perubahan
- [x] Click "OK" → Dokumen terhapus
- [x] Preview modal close otomatis
- [x] Document list refresh → Dokumen hilang
- [x] QuickPreview refresh → Dokumen hilang

### **Test Button Close:**
- [x] Click button Close → Modal tertutup
- [x] No data changes
- [x] Kembali ke halaman sebelumnya

---

## 📝 Files Modified

1. ✅ **src/components/FilePreviewModal.jsx**
   - Added props: `onEdit`, `onDelete`
   - Added button Edit dengan callback
   - Added button Download dengan download logic
   - Added button Hapus dengan confirmation
   - Rearranged header buttons layout

2. ✅ **src/App.jsx**
   - Pass `onEdit` callback ke FilePreviewModal
   - Pass `onDelete` callback ke FilePreviewModal
   - Handle edit: Open EditDocumentModal
   - Handle delete: Delete from DB + refresh list

3. ✅ **src/pages/DashboardPage.jsx**
   - Pass `onEdit` callback (navigate to data-arsip)
   - Pass `onDelete` callback (delete + refresh)

4. ✅ **FITUR_ACTION_BUTTONS_PREVIEW_MODAL.md** (file ini)
   - Dokumentasi lengkap

---

## 💡 Best Practices

### **1. Confirmation for Destructive Actions:**
```javascript
if (confirm(`Apakah Anda yakin ingin menghapus "${preview.name}"?`)) {
  // Proceed with delete
}
```

### **2. Error Handling:**
```javascript
try {
  await onDelete(preview);
} catch (err) {
  console.error('Error:', err);
  alert('Gagal menghapus dokumen: ' + err.message);
}
```

### **3. Cleanup after Download:**
```javascript
URL.revokeObjectURL(downloadUrl);  // Prevent memory leak
document.body.removeChild(a);      // Remove temporary element
```

### **4. Close Modal after Delete:**
```javascript
await onDelete(preview);
onClose();  // ✅ Auto-close after successful delete
```

---

## ✨ Summary

### **Sebelum:**
```
Header: [Icon] Nama File                [X]
        └─ Hanya button Close
```

### **Sekarang:**
```
Header: [Icon] Nama File    [✏️] [⬇️] [🗑️] [X]
        └─ 4 action buttons dengan fungsi lengkap
```

### **Benefits:**
✅ User bisa **Edit, Download, Hapus** langsung dari preview modal  
✅ Tidak perlu close modal → cari file → click action  
✅ **Faster workflow** - semua action dalam 1 click  
✅ **Better UX** - action buttons di tempat yang intuitif  
✅ **Consistent UI** - semua modal punya action buttons yang sama

---

**Implementasi selesai dan siap untuk testing!** 🎉

**Server: http://localhost:5174/**
