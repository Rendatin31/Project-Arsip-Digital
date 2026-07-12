import { useState, useEffect } from 'react';
import Header from '../components/Header';
import QuickPreview from '../components/QuickPreview';
import FilePreviewModal from '../components/FilePreviewModal';

const STATUS_MAP = {
  DRAFT: { label: 'Draft', cls: 'bg-surface-container-high text-on-surface-variant border-outline-variant' },
  PUBLISHED: { label: 'Aktif', cls: 'bg-secondary-container/30 text-on-secondary-container border-secondary/20' },
  PRIVATE: { label: 'Private', cls: 'bg-tertiary-container/30 text-on-tertiary-container border-tertiary/20' },
  CONFIDENTIAL: { label: 'Rahasia', cls: 'bg-error-container/30 text-error border-error/20' },
  ARCHIVED: { label: 'Diarsipkan', cls: 'bg-surface-container-highest text-on-surface-variant border-outline-variant' },
};

export default function DashboardPage({ supabase, userId, user, profile, categories = [], onNavigate, renderHeader = true }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [waNotif, setWaNotif] = useState(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        console.log('DashboardPage: Fetching all documents...');
        const { data: docs, error } = await supabase
          .from('documents')
          .select('*')
          // Hapus filter user_id agar semua user dapat melihat semua dokumen
          .order('uploaded_at', { ascending: false });
        
        if (error) {
          console.error('DashboardPage: Error fetching documents:', error);
        } else {
          console.log('DashboardPage: Fetched documents count:', docs?.length || 0);
          console.log('DashboardPage: Documents data:', docs);
        }
        
        if (docs) setDocuments(docs);
      } catch (err) {
        console.error('Gagal memuat dokumen dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, [supabase, userId]);

  const categoryMap = new Map((categories || []).map((c) => [c.id, c.name]));
  
  // Total Dokumen: hanya dokumen dengan status PRIVATE dan PUBLISHED
  const total = documents.filter((d) => ['PRIVATE', 'PUBLISHED'].includes(d.status)).length;
  
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
  
  // Dokumen Baru: dokumen dengan status PRIVATE atau PUBLISHED yang diunggah dalam 5 hari terakhir
  const fiveDaysAgo = Date.now() - 5 * 24 * 60 * 60 * 1000;
  const dokumenBaru = documents.filter((d) => 
    ['PRIVATE', 'PUBLISHED'].includes(d.status) &&
    d.uploaded_at && 
    new Date(d.uploaded_at).getTime() >= fiveDaysAgo
  ).length;

  const totalBytes = documents.reduce((sum, d) => sum + (Number(d.file_size) || 0), 0);
  const usedGB = totalBytes / (1024 * 1024 * 1024);
  const capacityGB = 100;
  const usedPct = Math.min(100, Math.round((usedGB / capacityGB) * 100));

  const recent = documents.slice(0, 5);

  const fmtDate = (val) => {
    if (!val) return '-';
    const d = new Date(val);
    return isNaN(d) ? '-' : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getFileType = (mimeType, fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'doc';
    if (['xls', 'xlsx'].includes(ext)) return 'xls';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'img';
    return 'file';
  };

  const getFileTypeColor = (mimeType, fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'text-error';
    if (['doc', 'docx'].includes(ext)) return 'text-primary-container';
    if (['xls', 'xlsx'].includes(ext)) return 'text-[#1D6F42]';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'text-secondary';
    return 'text-outline';
  };

  const previews = documents
    // Filter hanya dokumen dengan status PUBLISHED
    .filter((d) => d.status === 'PUBLISHED')
    // Sort berdasarkan updated_at atau uploaded_at (yang paling baru di atas)
    .sort((a, b) => {
      const dateA = new Date(a.updated_at || a.uploaded_at);
      const dateB = new Date(b.updated_at || b.uploaded_at);
      return dateB - dateA;
    })
    .slice(0, 8)
    .map((doc) => {
      const sizeBytes = Number(doc.file_size) || 0;
      let sizeText;
      if (sizeBytes === 0) sizeText = '0 MB';
      else if (sizeBytes < 1024 * 1024) sizeText = `${(sizeBytes / 1024).toFixed(1)} KB`;
      else sizeText = `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
      return {
        id: doc.id,
        filePath: doc.file_path,
        name: doc.file_name || doc.subject || '-',
        size: sizeText,
        time: doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
        type: getFileType(doc.mime_type, doc.file_name),
        typeColor: getFileTypeColor(doc.mime_type, doc.file_name),
        image: '',
        status: doc.status,
      };
    });

  const handleSearch = (e) => {
    e.preventDefault();
    onNavigate?.('data-arsip');
  };

  const [previewFile, setPreviewFile] = useState(null);

  const handleOpenFile = (preview) => {
    // Mark document as reviewed
    if (userId && preview.id) {
      try {
        const reviewed = localStorage.getItem(`reviewedDocs_${userId}`);
        const reviewedSet = reviewed ? new Set(JSON.parse(reviewed)) : new Set();
        reviewedSet.add(preview.id);
        localStorage.setItem(`reviewedDocs_${userId}`, JSON.stringify([...reviewedSet]));
      } catch (err) {
        console.error('Failed to mark document as reviewed:', err);
      }
    }
    setPreviewFile(preview);
  };

  return (
    <div className="bg-surface min-h-screen flex flex-col">
      <div className={renderHeader ? "ml-0 lg:ml-[230px] min-h-screen flex-1 flex flex-col" : "min-h-screen flex-1 flex flex-col"}>
        {renderHeader && <Header user={user} profile={profile} onLogout={() => {}} breadcrumbs={[{ id: null, name: 'home' }, { id: 'arsip-digital', name: 'Arsip Digital' }, { id: 'dashboard', name: 'Dashboard' }]} onNavigate={onNavigate} supabase={supabase} />}

        <main className="px-lg pt-3 pb-lg space-y-md bg-background min-h-screen">
          <section className="flex flex-col md:flex-row justify-between items-start md:items-end mb-sm">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">Ringkasan Dashboard</h2>
              <p className="text-body-sm text-on-surface-variant">Selamat datang kembali, berikut adalah status arsip Anda hari ini.</p>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-lg h-auto">
            <div className="md:col-span-4 bg-surface-container-lowest p-xl rounded-xl border border-outline-variant shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-md">
                  <h3 className="font-title-sm text-title-sm">Kapasitas Penyimpanan</h3>
                  <span className="material-symbols-outlined text-outline">storage</span>
                </div>
                <div className="relative pt-lg pb-md">
                  <div className="flex items-baseline gap-xs">
                    <span className="text-4xl font-bold text-on-surface">{usedGB.toFixed(1)}</span>
                    <span className="text-xl text-outline">GB</span>
                    <span className="mx-md text-outline">/</span>
                    <span className="text-xl text-outline">{capacityGB} GB digunakan</span>
                  </div>
                  <div className="mt-lg w-full bg-surface-container rounded-full h-3">
                    <div className="bg-secondary h-3 rounded-full transition-all duration-1000" style={{ width: `${usedPct}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="mt-xl space-y-sm">
                <div className="flex justify-between text-body-sm">
                  <span className="flex items-center gap-xs"><span className="w-2 h-2 rounded-full bg-secondary"></span> Dokumen</span>
                  <span className="font-semibold">{usedGB.toFixed(1)} GB</span>
                </div>
                <div className="flex justify-between text-body-sm">
                  <span className="flex items-center gap-xs"><span className="w-2 h-2 rounded-full bg-on-secondary-container"></span> Gambar/Scan</span>
                  <span className="font-semibold">0 GB</span>
                </div>
                <div className="flex justify-between text-body-sm">
                  <span className="flex items-center gap-xs"><span className="w-2 h-2 rounded-full bg-outline-variant"></span> Lainnya</span>
                  <span className="font-semibold">0 GB</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-md">
              <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm flex items-center gap-md hover:shadow-md hover:scale-105 transition-all duration-200 cursor-default">
                <div className="w-12 h-12 rounded-md bg-surface-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined filled-icon text-[28px]">pending_actions</span>
                </div>
                <div>
                  <p className="text-body-md text-outline">Tinjauan</p>
                  <p className="text-3xl font-bold">{tinjauan}</p>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm flex items-center gap-md hover:shadow-md hover:scale-105 transition-all duration-200 cursor-default">
                <div className="w-12 h-12 rounded-md bg-surface-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined filled-icon text-[28px]">new_releases</span>
                </div>
                <div>
                  <p className="text-body-md text-outline">Dokumen Baru</p>
                  <p className="text-3xl font-bold">{dokumenBaru}</p>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm flex items-center gap-md hover:shadow-md hover:scale-105 transition-all duration-200 cursor-default">
                <div className="w-12 h-12 rounded-md bg-surface-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined filled-icon text-[28px]">description</span>
                </div>
                <div>
                  <p className="text-body-md text-outline">Total Dokumen</p>
                  <p className="text-3xl font-bold">{total}</p>
                </div>
              </div>

              <div className="sm:col-span-3">
                <QuickPreview previews={previews} title="Preview Update Terkini" slider onOpenFile={handleOpenFile} supabase={supabase} />
              </div>
            </div>
          </div>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
            <div className="space-y-md">
              <h3 className="font-title-sm text-title-sm">Butuh Bantuan?</h3>
              <div className="bg-surface-container p-lg rounded-xl border border-outline-variant space-y-sm">
                <h4 className="font-title-sm text-on-surface">Butuh Bantuan?</h4>
                <p className="text-body-sm text-on-surface-variant">Pelajari cara mengelola hak akses folder dan retensi dokumen di pusat panduan kami.</p>
                <a className="inline-flex items-center gap-xs text-primary font-bold hover:gap-md transition-all" href="#">
                  Buka Tutorial <span className="material-symbols-outlined">arrow_forward</span>
                </a>
              </div>
            </div>

            <div className="space-y-md">
              <h3 className="font-title-sm text-title-sm">Statistik Keamanan</h3>
              <div className="bg-inverse-surface text-white p-lg rounded-xl space-y-sm">
                <div className="flex items-center gap-md">
                  <div className="p-sm bg-on-secondary-fixed-variant rounded-full text-secondary-fixed">
                    <span className="material-symbols-outlined filled-icon">security</span>
                  </div>
                  <div>
                    <p className="text-body-sm opacity-70">Enkripsi Data</p>
                    <p className="font-semibold">AES-256 Aktif</p>
                  </div>
                </div>
                <div className="flex items-center gap-md">
                  <div className="p-sm bg-on-secondary-fixed-variant rounded-full text-secondary-fixed">
                    <span className="material-symbols-outlined filled-icon">history</span>
                  </div>
                  <div>
                    <p className="text-body-sm opacity-70">Cadangan Terakhir</p>
                    <p className="font-semibold">{fmtDate(new Date())}</p>
                  </div>
                </div>
                <div className="pt-sm border-t border-white/10">
                  <div className="flex justify-between items-center mb-sm">
                    <span className="text-body-sm">Kesehatan Server</span>
                    <span className="text-secondary-fixed text-body-sm">Sangat Baik</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1">
                    <div className="bg-secondary-fixed h-1 rounded-full" style={{ width: '99%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-md">
              <h3 className="font-title-sm text-title-sm">Notifikasi Keamanan</h3>
              <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm space-y-sm">
                <div className="flex justify-between items-center">
                  <span className="material-symbols-outlined text-error">warning</span>
                </div>
                <div className="space-y-sm">
                  {tinjauan > 0 ? (
                    <div className="p-sm bg-error-container/30 rounded-lg border-l-4 border-error">
                      <p className="text-body-sm font-semibold text-on-error-container">{tinjauan} dokumen menunggu tinjauan</p>
                      <p className="text-[12px] text-outline">Perlu tindakan segera</p>
                    </div>
                  ) : (
                    <div className="p-sm bg-surface-container rounded-lg border-l-4 border-outline-variant">
                      <p className="text-body-sm font-semibold text-on-surface">Tidak ada ancaman</p>
                      <p className="text-[12px] text-outline">Sistem aman</p>
                    </div>
                  )}
                </div>
                <div className="pt-sm border-t border-outline-variant">
                  <p className="text-label-caps text-outline mb-sm">PENGATURAN NOTIFIKASI</p>
                  <div className="flex flex-col gap-sm">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-body-sm">Email Otomatis</span>
                      <button
                        type="button"
                        onClick={() => setEmailNotif((v) => !v)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${emailNotif ? 'bg-secondary' : 'bg-outline-variant'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${emailNotif ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-body-sm">WhatsApp Alert</span>
                      <button
                        type="button"
                        onClick={() => setWaNotif((v) => !v)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${waNotif ? 'bg-secondary' : 'bg-outline-variant'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${waNotif ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
      {previewFile && (
        <FilePreviewModal 
          preview={previewFile} 
          supabase={supabase} 
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}
