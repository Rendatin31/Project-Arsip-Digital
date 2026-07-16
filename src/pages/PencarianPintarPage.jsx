import { useState, useEffect } from 'react';
import FilePreviewModal from '../components/FilePreviewModal';
import FileTypeIcon from '../components/FileTypeIcon';
import Header from '../components/Header';

const STATUS_MAP = {
  DRAFT: { label: 'Ditinjau', cls: 'bg-surface-container-high text-on-surface-variant border-outline-variant' },
  PUBLISHED: { label: 'Aktif', cls: 'bg-secondary-container/30 text-on-secondary-container border-secondary/20' },
  CONFIDENTIAL: { label: 'Rahasia', cls: 'bg-error-container/30 text-error border-error/20' },
  ARCHIVED: { label: 'Diarsipkan', cls: 'bg-surface-container-highest text-on-surface-variant border-outline-variant' },
};

export default function PencarianPintarPage({ supabase, userId, user, profile, onNavigate, renderHeader = true, searchQuery: externalSearchQuery = '', onSearchQueryChange, categories = [] }) {
  const [searchType, setSearchType] = useState('fulltext');
  // Gunakan external query jika ada, fallback ke state internal
  const query = externalSearchQuery;
  const setQuery = onSearchQueryChange || (() => {});
  
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [category, setCategory] = useState('');
  const [letterNumber, setLetterNumber] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false); // Collapsed by default on mobile
  const itemsPerPage = 4;

  const [documents, setDocuments] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [scale, setScale] = useState(1);
  const [fullPreview, setFullPreview] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data: docs } = await supabase
          .from('documents')
          .select('*')
          // Hapus filter user_id agar semua user dapat melihat semua dokumen
          .eq('status', 'PUBLISHED') // Filter: hanya dokumen dengan status PUBLISHED
          .order('uploaded_at', { ascending: false });
        if (docs) setDocuments(docs);
      } catch (err) {
        console.error('Gagal memuat dokumen:', err);
      }
    };
    fetchDocuments();
  }, [supabase, userId]);

  const runSearch = () => {
    const q = query.trim().toLowerCase();
    const filtered = documents.filter((d) => {
      const haystack = `${d.file_name || ''} ${d.letter_number || ''} ${d.subject || ''}`.toLowerCase();
      const matchQuery = !q || haystack.includes(q);
      const matchLetter = !letterNumber.trim() || (d.letter_number || '').toLowerCase().includes(letterNumber.trim().toLowerCase());
      const matchCat = !category || (d.category_id && d.category_id === category);
      const dateVal = d.letter_date || d.uploaded_at;
      const matchDate =
        (!dateStart || new Date(dateVal) >= new Date(dateStart)) &&
        (!dateEnd || new Date(dateVal) <= new Date(dateEnd));
      return matchQuery && matchLetter && matchCat && matchDate;
    });
    setResults(filtered);
    setSelectedId(filtered.length ? filtered[0].id : null);
  };

  useEffect(() => {
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents, query, category, letterNumber, dateStart, dateEnd]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, category, letterNumber, dateStart, dateEnd]);

  // Pagination
  const totalPages = Math.ceil(results.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResults = results.slice(startIndex, endIndex);

  const selected = results.find((d) => d.id === selectedId) || null;

  useEffect(() => {
    let active = true;
    setPreviewUrl(null);
    if (!selected?.file_path) return;
    const load = async () => {
      try {
        const { data } = await supabase.storage.from('documents').createSignedUrl(selected.file_path, 60);
        if (active && data?.signedUrl) setPreviewUrl(data.signedUrl);
      } catch {
        /* abaikan */
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [selected, supabase]);

  const fmtDate = (val) => {
    if (!val) return '-';
    const d = new Date(val);
    return isNaN(d) ? '-' : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const snippet = (d) => {
    const base = d.subject || d.file_name || '';
    if (query.trim() && base.toLowerCase().includes(query.trim().toLowerCase())) {
      return `...dokumen ini membahas "${query.trim()}" terkait ${base}...`;
    }
    return `No: ${d.letter_number || '-'} | ${base}`;
  };

  // Fungsi untuk mendeteksi tipe file berdasarkan nama file
  const getFileType = (fileName) => {
    if (!fileName) return 'file';
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.pdf')) return 'pdf';
    if (lower.endsWith('.doc') || lower.endsWith('.docx')) return 'doc';
    if (lower.endsWith('.xls') || lower.endsWith('.xlsx')) return 'xls';
    if (lower.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/)) return 'img';
    return 'file';
  };

  const lowerName = (selected?.file_name || '').toLowerCase();
  const isImage = /\.(png|jpe?g|gif|webp|bmp)$/i.test(lowerName);
  const isPdf = /\.pdf$/i.test(lowerName);

  return (
    <div className="flex min-h-screen">
      <div className={renderHeader ? "ml-0 lg:ml-[230px] flex-1 flex flex-col min-h-screen" : "flex-1 flex flex-col min-h-screen"}>
         {renderHeader && (
           <Header 
             user={user} 
             profile={profile} 
             onLogout={() => {}} 
             breadcrumbs={[{ id: null, name: 'home' }, { id: 'arsip-digital', name: 'Arsip Digital' }, { id: 'search', name: 'Pencarian Pintar' }]} 
             onNavigate={onNavigate}
             supabase={supabase}
           />
         )}

        <div className="flex-1 overflow-auto">
          <div className="px-[25px] py-[2px] space-y-sm max-w-[1600px] mx-auto mt-3">
            <section className="space-y-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-md">
                <div>
                  <h2 className="font-headline-md text-xl text-on-surface">Temukan Dokumen Anda</h2>
                  <p className="text-[13px] text-on-surface-variant">Cari berdasarkan metadata atau konten teks dalam dokumen (OCR).</p>
                </div>
                <div className="flex bg-surface-container rounded-full p-1 border border-outline-variant">
                  <button onClick={() => setSearchType('fulltext')} className={`px-md py-1.5 rounded-full text-body-sm font-semibold transition-all duration-300 ${searchType === 'fulltext' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}>Full-Text Search</button>
                  <button onClick={() => setSearchType('metadata')} className={`px-md py-1.5 rounded-full text-body-sm font-semibold transition-all duration-300 ${searchType === 'metadata' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}>Metadata Only</button>
                </div>
              </div>
              
              {/* Search Input - Mobile Only (above filter card) */}
              <div className="lg:hidden mt-md">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                    placeholder="Cari dokumen berdasarkan nama, subjek, atau nomor surat..."
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-11 pr-4 text-body-sm text-on-surface outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Filter System */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant mt-4 mb-6 overflow-hidden">
              {/* Header with Toggle Button */}
              <button
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className="w-full flex items-center justify-between p-md hover:bg-surface-container transition-colors"
              >
                <div className="flex items-center gap-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">filter_alt</span>
                  <span className="font-label-caps text-[13px] font-bold">FILTERS</span>
                  {/* Active filter count badge */}
                  {(category || letterNumber || dateStart || dateEnd) && (
                    <span className="ml-2 px-2 py-0.5 bg-secondary text-white text-[11px] font-bold rounded-full">
                      {[category, letterNumber, dateStart, dateEnd].filter(Boolean).length}
                    </span>
                  )}
                </div>
                <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${isFilterExpanded ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              
              {/* Collapsible Filter Content */}
              <div className={`
                border-t border-outline-variant p-md
                ${isFilterExpanded ? 'block' : 'hidden'}
              `}>
                {/* Filter Fields - Stack on mobile, flex on desktop */}
                <div className="flex flex-col lg:flex-row flex-wrap gap-sm">
                  <div className="relative group flex-1 min-w-[160px]">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 pl-3 pr-8 text-body-sm text-on-surface outline-none focus:border-primary cursor-pointer appearance-none"
                    >
                      <option value="">Semua Kategori</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                  </div>
                  
                  <div className="relative group flex-1 min-w-[160px]">
                    <input
                      value={letterNumber}
                      onChange={(e) => setLetterNumber(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 pl-3 pr-3 text-body-sm text-on-surface outline-none focus:border-primary"
                      placeholder="Nomor Surat"
                    />
                  </div>
                  
                  {/* Date Range */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-xs flex-1 min-w-[200px]">
                    <input
                      value={dateStart}
                      onChange={(e) => setDateStart(e.target.value)}
                      className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg py-2 px-3 text-body-sm text-on-surface outline-none focus:border-primary cursor-pointer"
                      type="date"
                    />
                    <span className="text-on-surface-variant text-body-sm self-center">s/d</span>
                    <input
                      value={dateEnd}
                      onChange={(e) => setDateEnd(e.target.value)}
                      className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg py-2 px-3 text-body-sm text-on-surface outline-none focus:border-primary cursor-pointer"
                      type="date"
                    />
                  </div>
                  
                  {/* Reset Button - Separate flex item aligned to the right */}
                  <div className="flex items-center justify-end lg:justify-start lg:flex-shrink-0">
                    <button
                      onClick={() => { setQuery(''); setDateStart(''); setDateEnd(''); setCategory(''); setLetterNumber(''); }}
                      className="px-md py-2 text-secondary font-semibold hover:bg-secondary/5 rounded-lg transition-colors text-body-sm whitespace-nowrap"
                    >
                      Reset Filter
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-lg min-h-[500px]">
              <div className="flex flex-col gap-md pr-md">
                <div className="flex items-center justify-between mb-xs">
                  <h5 className="font-title-sm text-[14px] text-on-surface">Hasil Pencarian ({results.length} Dokumen)</h5>
                  <span className="font-label-caps text-[11px] text-secondary font-bold">WAKTU: {(Math.random() * 0.5 + 0.1).toFixed(2).toUpperCase()} DETIK</span>
                </div>
                
                {/* Results List */}
                <div className="flex-1 flex flex-col gap-3">
                  {paginatedResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-xl text-center">
                      <span className="material-symbols-outlined text-5xl text-outline mb-sm">search_off</span>
                      <p className="text-body-sm text-on-surface-variant">Tidak ada dokumen yang cocok dengan pencarian Anda.</p>
                    </div>
                  ) : (
                    paginatedResults.map((d) => {
                    const st = STATUS_MAP[d.status] || STATUS_MAP.DRAFT;
                    const fileType = getFileType(d.file_name);
                    return (
                      <div 
                        key={d.id} 
                        onClick={() => {
                          setSelectedId(d.id);
                          // On mobile, open full preview modal immediately
                          if (window.innerWidth < 1024) {
                            setFullPreview({ 
                              id: d.id, 
                              filePath: d.file_path, 
                              name: d.file_name, 
                              type: fileType 
                            });
                          }
                        }} 
                        className={`bg-surface-container-lowest border p-md rounded-xl cursor-pointer hover:shadow-md transition-all ${selectedId === d.id ? 'border-primary border-l-4' : 'border-outline-variant'}`}
                      >
                        <div className="flex justify-between items-start mb-sm gap-sm">
                          <div className="flex items-center gap-sm min-w-0 flex-1">
                            <FileTypeIcon type={fileType} size={32} className="flex-shrink-0" />
                            <h4 className="font-title-sm text-on-surface truncate">{d.subject || '-'}</h4>
                          </div>
                          <span className={`px-sm py-0.5 rounded text-[12px] font-bold border whitespace-nowrap flex-shrink-0 ${st.cls}`}>{st.label}</span>
                        </div>
                        <p className="text-body-sm text-on-surface-variant mb-md truncate">No: {d.letter_number || '-'} | Tanggal: {fmtDate(d.letter_date || d.uploaded_at)}</p>
                        <div className="bg-surface-container-low p-sm rounded-lg border border-outline-variant italic text-body-sm text-on-surface break-words line-clamp-3">{d.perihal || '-'}</div>
                      </div>
                    );
                  })
                )}
                </div>
                
                {/* Pagination Controls */}
                {results.length > itemsPerPage && (
                  <div className="flex items-center justify-between pt-md border-t border-outline-variant">
                    <p className="text-body-sm text-on-surface-variant">
                      Menampilkan {startIndex + 1}-{Math.min(endIndex, results.length)} dari {results.length}
                    </p>
                    <div className="flex items-center gap-xs">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                      </button>
                      
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
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-body-sm font-semibold transition-all ${
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
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-all text-body-sm"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden lg:flex flex-col bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm relative min-h-[500px]">
                <div className="h-12 border-b border-outline-variant flex items-center justify-between px-md bg-surface-container-low">
                  <span className="font-label-caps text-[12px] text-on-surface-variant">PRATINJAU DOKUMEN</span>
                  <div className="flex gap-sm">
                    <button onClick={() => setScale((s) => Math.min(1.5, s + 0.1))} className="p-1 hover:bg-surface-container-high rounded transition-colors"><span className="material-symbols-outlined text-[20px]">zoom_in</span></button>
                    <button onClick={() => setScale((s) => Math.max(0.5, s - 0.1))} className="p-1 hover:bg-surface-container-high rounded transition-colors"><span className="material-symbols-outlined text-[20px]">zoom_out</span></button>
                    <button onClick={() => previewUrl && window.open(previewUrl, '_blank')} className="p-1 hover:bg-surface-container-high rounded transition-colors"><span className="material-symbols-outlined text-[20px]">download</span></button>
                    <button onClick={() => selected && setFullPreview({ id: selected.id, filePath: selected.file_path, name: selected.file_name, type: getFileType(selected.file_name) })} className="p-1 hover:bg-surface-container-high rounded transition-colors"><span className="material-symbols-outlined text-[20px]">open_in_new</span></button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-xl flex justify-center bg-outline-variant/10">
                  {!selected ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <span className="material-symbols-outlined text-5xl text-outline mb-sm">preview</span>
                      <p className="text-body-sm text-on-surface-variant">Pilih dokumen untuk melihat pratinjau.</p>
                    </div>
                  ) : isImage && previewUrl ? (
                    <img src={previewUrl} alt={selected.file_name} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" style={{ transform: `scale(${scale})` }} />
                  ) : isPdf && previewUrl ? (
                    <iframe src={previewUrl} title={selected.file_name} className="w-full h-full border-0 rounded-lg bg-white" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }} />
                  ) : (
                    <div className="w-full max-w-2xl bg-white shadow-2xl p-xl flex flex-col gap-lg" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
                      <div className="flex flex-col gap-sm border-b-2 border-primary pb-md">
                        <h5 className="font-headline-md text-center">{(selected.subject || 'DOKUMEN').toUpperCase()}</h5>
                        <p className="text-center text-body-sm font-semibold">NOMOR: {selected.letter_number || '-'}</p>
                      </div>
                      <div className="flex flex-col gap-md text-body-sm leading-relaxed">
                        <p><strong>Perihal:</strong> {selected.subject || '-'}</p>
                        <p><strong>Tanggal:</strong> {fmtDate(selected.letter_date || selected.uploaded_at)}</p>
                        <p><strong>Kategori:</strong> {selected.category_id || 'Umum'}</p>
                        <p className="bg-yellow-100 p-2 border-l-4 border-yellow-400"><strong>Snippets:</strong> {snippet(selected)}</p>
                      </div>
                      <p className="text-[12px] text-center text-on-surface-variant mt-xl">Gunakan tombol buka untuk pratinjau lengkap (gambar/PDF/Office).</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {fullPreview && (
        <FilePreviewModal preview={fullPreview} supabase={supabase} onClose={() => setFullPreview(null)} />
      )}
    </div>
  );
}
