import { useState, useEffect } from 'react';
import { supabase as supabaseClient } from '../lib/supabase';
import Header from '../components/Header';
import EditDocumentModal from '../components/EditDocumentModal';
import FilePreviewModal from '../components/FilePreviewModal';

export default function DataArsipPage({ supabase, userId, user, profile, onBack, onOpenAdd, onEditDocument, onNavigate, categories = [], renderHeader = true }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editDoc, setEditDoc] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleView = async (doc) => {
    if (!doc.filePath) {
      alert('Dokumen ini tidak memiliki file yang diunggah.');
      return;
    }
    
    // Tentukan tipe file berdasarkan ekstensi
    const fileName = doc.fileName || '';
    const ext = fileName.split('.').pop()?.toLowerCase();
    let fileType = 'doc';
    
    if (ext === 'pdf') fileType = 'pdf';
    else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)) fileType = 'img';
    else if (['doc', 'docx', 'rtf', 'odt'].includes(ext)) fileType = 'doc';
    else if (['xls', 'xlsx', 'csv'].includes(ext)) fileType = 'xls';
    
    // Buka preview modal
    setPreviewFile({
      id: doc.id,
      filePath: doc.filePath,
      name: doc.fileName,
      size: doc.size,
      type: fileType,
      status: doc.status,
    });
  };

  const handleDownload = async (doc) => {
    if (!doc.filePath) {
      alert('Dokumen ini tidak memiliki file yang diunggah.');
      return;
    }
    console.log('Download file_path:', doc.filePath);
    const { data, error } = await supabase.storage
      .from('documents')
      .download(doc.filePath);
    if (error || !data) {
      console.error('Gagal mengunduh file:', error);
      alert('Gagal mengunduh file: ' + (error?.message || 'Unknown error'));
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName || 'dokumen';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

      const handleDelete = async (doc) => {
    if (!window.confirm(`Hapus arsip "${doc.subject}"?`)) return;
    try {
      const { error: auditError } = await supabase.from('audit_logs').insert({
        user_id: userId,
        action: 'DELETE',
        document_id: doc.id,
        metadata: { file_name: doc.fileName || doc.subject, ip: '127.0.0.1' },
      });
      if (auditError) {
        console.error('Gagal mencatat aktivitas hapus:', auditError);
        alert('Gagal mencatat aktivitas hapus: ' + (auditError.message || JSON.stringify(auditError)));
        return;
      }

      if (doc.filePath) {
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([doc.filePath]);
        if (storageError) console.error('Gagal hapus file storage:', storageError);
      }

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);
      if (error) {
        alert('Gagal menghapus arsip: ' + (error.message || JSON.stringify(error)));
        return;
      }

      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err) {
      console.error('Gagal menghapus:', err);
      alert('Terjadi kesalahan saat menghapus.');
    }
  };

  const handleEdit = (doc) => {
    console.log('Edit letter_date:', JSON.stringify(doc.letter_date), '| category_id:', doc.category_id, '| letter_number:', doc.letter_number);
    setEditDoc(doc);
  };

  const fetchDocuments = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      console.log('DataArsipPage: Fetching documents with status filter...');
      const { data: docs, error } = await supabase
        .from('documents')
        .select('*')
        // Hapus filter user_id agar semua user dapat melihat semua dokumen
        .in('status', ['PRIVATE', 'PUBLISHED']) // Filter: hanya PRIVATE dan PUBLISHED
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('DataArsipPage: Gagal memuat data arsip:', error);
        setLoading(false);
        return;
      }

      console.log('DataArsipPage: Fetched documents count:', docs?.length || 0);
      console.log('DataArsipPage: Documents data:', docs);

      if (docs) {
        const categoryMap = new Map((categories || []).map(c => [c.id, c.name]));
        
        const formatted = docs.map((doc, index) => {
          const sizeBytes = Number(doc.file_size) || 0;
          let sizeText;
          if (sizeBytes === 0) {
            sizeText = '0 MB';
          } else if (sizeBytes < 1024 * 1024) {
            sizeText = `${(sizeBytes / 1024).toFixed(1)} KB`;
          } else {
            sizeText = `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
          }

          const categoryId = doc.category_id || '';
          const categoryName = categoryId ? (categoryMap.get(categoryId) || 'Umum') : 'Umum';
          const dateValue = doc.letter_date || doc.uploaded_at;
          const dateModified = dateValue ? new Date(dateValue).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

          const toDateInput = (val) => {
            if (!val) return '';
            const d = new Date(val);
            if (isNaN(d.getTime())) return '';
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
          };

          return {
            id: doc.id,
            no: index + 1,
            fileName: doc.file_name || '-',
            filePath: doc.file_path || null,
            category_id: doc.category_id || '',
            letter_number: doc.letter_number || '',
            letter_date: toDateInput(doc.letter_date || doc.uploaded_at),
            sender: doc.sender || '',
            recipient: doc.recipient || '',
            status: doc.status || 'DRAFT',
            subject: doc.subject || doc.file_name || '-',
            perihal: doc.perihal || '-',
            category: categoryName,
            size: sizeText,
            rawDate: dateValue ? new Date(dateValue).toISOString().slice(0, 10) : '',
            dateModified,
            statusDisplay: getStatus(doc.status),
            statusColor: getStatusColor(doc.status),
            icon: getFileIcon(doc.mime_type, doc.file_name),
            iconBg: getFileIconBg(doc.mime_type, doc.file_name),
          };
        });
        setDocuments(formatted);
      }
    } catch (err) {
      console.error('Gagal memuat data arsip:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [supabase, userId, categories]);

  const getStatus = (status) => {
    const map = {
      DRAFT: 'DRAFT',
      PUBLISHED: 'AKTIF',
      PRIVATE: 'PRIVATE',
      CONFIDENTIAL: 'TERBATAS',
      ARCHIVED: 'TERARSIP',
    };
    return map[status] || 'DRAFT';
  };

  const getStatusColor = (status) => {
    const map = {
      DRAFT: 'bg-surface-container-high text-on-surface-variant border-outline-variant',
      PUBLISHED: 'bg-secondary-container/30 text-on-secondary-container border-secondary/20',
      PRIVATE: 'bg-tertiary-container/30 text-on-tertiary-container border-tertiary/20',
      CONFIDENTIAL: 'bg-error-container/30 text-error border-error/20',
      ARCHIVED: 'bg-surface-container-highest text-on-surface-variant border-outline-variant',
    };
    return map[status] || map.DRAFT;
  };

  const getFileIcon = (mimeType, fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'picture_as_pdf';
    if (['doc', 'docx'].includes(ext)) return 'description';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image';
    if (['xls', 'xlsx'].includes(ext)) return 'table_chart';
    return 'description';
  };

  const getFileIconBg = (mimeType, fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'bg-error/10 text-error';
    if (['doc', 'docx'].includes(ext)) return 'bg-blue-100 text-blue-600';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'bg-yellow-100 text-yellow-700';
    if (['xls', 'xlsx'].includes(ext)) return 'bg-[#1D6F42]/10 text-[#1D6F42]';
    return 'bg-surface-container-high text-on-surface-variant';
  };

  const filteredDocuments = documents.filter((doc) => {
    if (searchQuery && !doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterCategory && doc.category_id !== filterCategory) return false;
    if (filterStatus && doc.status !== filterStatus) return false;
    if (filterDateStart && doc.rawDate && doc.rawDate < filterDateStart) return false;
    if (filterDateEnd && doc.rawDate && doc.rawDate > filterDateEnd) return false;
    return true;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, filterStatus, filterDateStart, filterDateEnd, searchQuery]);

  if (loading) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center">
        <div className="text-body-sm text-on-surface-variant">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen flex flex-col">
      <div className={renderHeader ? "ml-0 lg:ml-[230px] min-h-screen flex-1 flex flex-col" : "min-h-screen flex-1 flex flex-col"}>
        {renderHeader && <Header user={user} profile={profile} onLogout={() => {}} breadcrumbs={[{ id: null, name: 'home' }, { id: 'arsip-digital', name: 'Arsip Digital' }, { id: 'data-arsip', name: 'Direktori Arsip' }]} onNavigate={onNavigate} supabase={supabase} />}

        {/* Access Guard - Only Admin and Editor */}
        {profile?.role === 'viewer' ? (
          <section className="p-lg flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <span className="material-symbols-outlined text-6xl text-outline mb-md block">lock</span>
              <h2 className="text-2xl font-bold text-primary mb-sm">Akses Terbatas</h2>
              <p className="text-on-surface-variant mb-lg">
                Halaman ini hanya dapat diakses oleh <span className="font-bold text-primary">Administrator</span> dan <span className="font-bold text-primary">Editor</span>.
              </p>
              <button 
                onClick={() => onNavigate?.('dashboard')} 
                className="px-lg py-sm bg-secondary text-on-secondary rounded-lg font-semibold hover:opacity-90 transition-all"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </section>
        ) : (
        <>
{/* Content */}
        <div className="flex-1 overflow-y-auto px-lg space-y-2">
{/* Page Header & Action Bar */}
                <div style={{ marginTop: '24px' }} className="flex flex-col gap-sm md:flex-row md:items-end md:justify-between">
                  <div className="space-y-0">
                    <h5 className="font-display-md text-headline-md font-bold text-primary">Direktori Arsip</h5>
                   <p className="text-on-surface-variant text-body-sm">Pusat manajemen dan penyimpanan dokumen digital terpadu.</p>
                </div>
              </div>

              {/* Filter System */}
             <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant flex flex-wrap items-center gap-md mb-3">
               <div className="flex items-center gap-sm text-on-surface-variant px-sm border-r border-outline-variant pr-md">
                 <span className="material-symbols-outlined">filter_alt</span>
                 <span className="text-label-caps">FILTERS</span>
               </div>
               <div className="flex-1 min-w-[200px] flex flex-wrap gap-sm">
                 <div className="relative group flex-1 min-w-[160px]">
                   <select
                     className="w-full bg-surface-container-low border-none rounded-lg py-2 pl-3 pr-8 text-body-sm text-on-surface appearance-none focus:ring-1 focus:ring-secondary cursor-pointer"
                     value={filterCategory}
                     onChange={(e) => setFilterCategory(e.target.value)}
                   >
                     <option value="">Semua Kategori</option>
                     {categories.map((cat) => (
                       <option key={cat.id} value={cat.id}>{cat.name}</option>
                     ))}
                   </select>
                   <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                 </div>
                 <div className="relative group flex-1 min-w-[160px]">
                   <select
                     className="w-full bg-surface-container-low border-none rounded-lg py-2 pl-3 pr-8 text-body-sm text-on-surface appearance-none focus:ring-1 focus:ring-secondary cursor-pointer"
                     value={filterStatus}
                     onChange={(e) => setFilterStatus(e.target.value)}
                   >
                     <option value="">Semua Status</option>
                     <option value="PRIVATE">Private</option>
                     <option value="PUBLISHED">Diterbitkan</option>
                   </select>
                   <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                 </div>
                 <div className="flex items-center gap-xs">
                   <input
                     className="bg-surface-container-low border-none rounded-lg py-2 px-3 text-body-sm text-on-surface focus:ring-1 focus:ring-secondary cursor-pointer"
                     type="date"
                     value={filterDateStart}
                     onChange={(e) => setFilterDateStart(e.target.value)}
                     title="Tanggal mulai"
                   />
                   <span className="text-on-surface-variant text-body-sm">s/d</span>
                   <input
                     className="bg-surface-container-low border-none rounded-lg py-2 px-3 text-body-sm text-on-surface focus:ring-1 focus:ring-secondary cursor-pointer"
                     type="date"
                     value={filterDateEnd}
                     onChange={(e) => setFilterDateEnd(e.target.value)}
                     title="Tanggal akhir"
                   />
                 </div>
               </div>
               <button
                 onClick={() => {
                   setFilterCategory('');
                   setFilterStatus('');
                   setFilterDateStart('');
                   setFilterDateEnd('');
                   setSearchQuery('');
                 }}
                 className="px-md py-2 text-secondary font-semibold hover:bg-secondary/5 rounded-lg transition-colors text-body-sm"
               >
                 Reset Filter
               </button>
             </div>

            {/* Main Data Table */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col mb-3">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className="px-md py-sm font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider">Kategori</th>
                      <th className="px-md py-sm font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider">Subjek</th>
                      <th className="px-md py-sm font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider">Tanggal</th>
                      <th className="px-md py-sm font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider">Status</th>
                      <th className="px-md py-sm font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {paginatedDocuments.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-lg py-sm text-center text-body-sm text-on-surface-variant">
                          Belum ada data arsip.
                        </td>
                      </tr>
                    ) : (
                       paginatedDocuments.map((doc) => (
                         <tr
                           key={doc.id}
                           onDoubleClick={(profile?.role === 'super_admin' || profile?.role === 'admin') ? () => handleEdit(doc) : undefined}
                           className={`hover:bg-surface-container/30 transition-colors group ${(profile?.role === 'super_admin' || profile?.role === 'admin') ? 'cursor-pointer' : 'cursor-default'}`}
                         >
                            <td className="px-lg py-sm">
                              <span className="px-sm py-1 bg-surface-container-high text-on-surface-variant text-[12px] font-semibold rounded">{doc.category}</span>
                            </td>
                              <td className="px-lg py-sm">
                                <div>
                                  <p className="font-semibold text-primary text-table-data">{doc.subject}</p>
                                  <p className="text-[12px] text-on-surface-variant">{doc.perihal}</p>
                                </div>
                              </td>
                             <td className="px-lg py-sm">
                               <p className="text-table-data text-on-surface">{doc.dateModified}</p>
                             </td>
                            <td className="px-lg py-sm">
                              <div className={`inline-flex items-center gap-xs px-2 py-0.5 rounded-full text-[11px] font-bold border ${doc.statusColor}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                <span>{doc.status}</span>
                              </div>
                            </td>
                            <td className="px-lg py-sm text-right">
                              <div className="flex items-center justify-end gap-xs">
                                 <button onClick={() => handleView(doc)} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant transition-all" title="Lihat">
                                   <span className="material-symbols-outlined text-[20px]">visibility</span>
                                 </button>
                                 <button onClick={() => handleDownload(doc)} className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant transition-all" title="Unduh">
                                   <span className="material-symbols-outlined text-[20px]">download</span>
                                 </button>
                                 {profile?.role === 'super_admin' && (
                                   <button
                                     onClick={() => handleDelete(doc)}
                                     className="p-1.5 hover:bg-error-container/30 rounded-lg text-error transition-all"
                                     title="Hapus"
                                   >
                                     <span className="material-symbols-outlined text-[20px]">delete</span>
                                   </button>
                                 )}
                              </div>
                            </td>
                          </tr>
                       ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="bg-surface-container-lowest px-lg py-md border-t border-outline-variant flex items-center justify-between">
                <p className="text-body-sm text-on-surface-variant">
                  Menampilkan <span className="font-bold text-on-surface">{startIndex + 1}-{Math.min(endIndex, filteredDocuments.length)}</span> dari <span className="font-bold text-on-surface">{filteredDocuments.length}</span> data
                </p>
                <div className="flex items-center gap-sm">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold text-body-sm shadow-md transition-all ${
                          pageNum === currentPage
                            ? 'bg-secondary text-white'
                            : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="text-on-surface-variant px-1">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-all text-body-sm"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Contextual Information Card */}
            <div className="bg-secondary/5 rounded-xl p-md border border-secondary/20 flex flex-col md:flex-row items-center gap-md">
              <div className="flex-shrink-0 w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[24px]">info</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="font-bold text-primary text-body-md">Pengingat Keamanan Data</h4>
                <p className="text-on-surface-variant text-body-sm">
                  Semua dokumen dengan status "Terbatas" hanya dapat diakses oleh Administrator Tingkat Lanjut dan pemilik dokumen asli.
                  Pastikan Anda telah melakukan klasifikasi data dengan benar sesuai dengan tingkat sensitivitas informasi.
                </p>
              </div>
              <button className="whitespace-nowrap px-md py-2 border border-secondary text-secondary font-semibold rounded-lg hover:bg-secondary/5 transition-all text-body-sm">
                Pelajari Selengkapnya
              </button>
            </div>
          </div>
        </>
        )}
        
        {editDoc && (
          <EditDocumentModal
            doc={editDoc}
            categories={categories}
            supabase={supabase}
            userId={userId}
            onClose={() => setEditDoc(null)}
            onSaved={fetchDocuments}
          />
        )}
        
        {previewFile && (
          <FilePreviewModal
            preview={previewFile}
            supabase={supabase}
            onClose={() => setPreviewFile(null)}
            onEdit={profile?.role === 'admin' ? (file) => {
              setPreviewFile(null);
              // Find the document by ID and open edit modal
              const doc = documents.find(d => d.id === file.id);
              if (doc) handleEdit(doc);
            } : null}
          />
        )}
      </div>
    </div>
  );
}
