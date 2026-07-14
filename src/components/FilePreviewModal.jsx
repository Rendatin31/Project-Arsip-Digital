import { useState, useEffect, useRef } from 'react';
import FileTypeIcon from './FileTypeIcon';

export default function FilePreviewModal({ preview, supabase, onClose, onEdit, onDelete }) {
  const [url, setUrl] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfPages, setPdfPages] = useState([]);
  const [pdfLoading, setPdfLoading] = useState(false);
  const canvasRefs = useRef([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!preview?.filePath) {
        setError('Dokumen ini tidak memiliki file yang diunggah.');
        setLoading(false);
        return;
      }
      try {
        const { data, error: err } = await supabase
          .storage
          .from('documents')
          .createSignedUrl(preview.filePath, 60);
        if (err || !data?.signedUrl) {
          setError('Gagal memuat preview: ' + (err?.message || 'Unknown error'));
          setLoading(false);
          return;
        }
        const signedUrl = data.signedUrl;
        if (active) setUrl(signedUrl);

        const lower = (preview.name || '').toLowerCase();
        const isDoc = preview.type === 'doc' || /\.(docx?|rtf|odt)$/i.test(lower);
        const isXls = preview.type === 'xls' || /\.(xlsx?|csv)$/i.test(lower);

        if (isDoc || isXls) {
          const res = await fetch(signedUrl);
          const buf = await res.arrayBuffer();
          if (!active) return;
          if (isDoc) {
            const mammoth = (await import('mammoth')).default;
            const { value } = await mammoth.convertToHtml({ arrayBuffer: buf });
            if (active) setContent({ kind: 'html', html: value });
          } else {
            const XLSX = await import('xlsx');
            const wb = XLSX.read(buf, { type: 'array' });
            const sheets = wb.SheetNames.map((sheetName) => ({
              name: sheetName,
              rows: XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: '' }),
            }));
            if (active) setContent({ kind: 'table', sheets });
          }
        }
        if (active) setLoading(false);
      } catch {
        if (active) {
          setError('Terjadi kesalahan saat memuat preview.');
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [preview, supabase]);

  const name = preview?.name || '-';
  const isImage = preview?.type === 'img' || /\.(png|jpe?g|gif|webp|bmp)$/i.test(name || '');
  const isPdf = preview?.type === 'pdf' || /\.pdf$/i.test(name || '');
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;

  // Load and render PDF for mobile using PDF.js
  useEffect(() => {
    if (!isPdf || !isMobile || !url || pdfLoading || pdfPages.length > 0) return;
    
    let active = true;
    const loadPdf = async () => {
      setPdfLoading(true);
      try {
        // Dynamically import PDF.js
        const pdfjsLib = await import('pdfjs-dist');
        
        // Set worker source
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        
        // Load PDF document
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        
        if (!active) return;
        
        // Render first 3 pages (to keep it fast on mobile)
        const numPages = Math.min(pdf.numPages, 3);
        const pages = [];
        
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          
          pages.push({
            pageNum: i,
            viewport,
            page,
            totalPages: pdf.numPages
          });
        }
        
        if (active) {
          setPdfPages(pages);
          setPdfLoading(false);
        }
      } catch (err) {
        console.error('Error loading PDF:', err);
        if (active) {
          setPdfLoading(false);
        }
      }
    };
    
    loadPdf();
    
    return () => {
      active = false;
    };
  }, [isPdf, isMobile, url, pdfLoading, pdfPages.length]);

  // Render PDF pages to canvas
  useEffect(() => {
    if (pdfPages.length === 0) return;
    
    pdfPages.forEach((pageData, idx) => {
      const canvas = canvasRefs.current[idx];
      if (!canvas) return;
      
      const context = canvas.getContext('2d');
      canvas.height = pageData.viewport.height;
      canvas.width = pageData.viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: pageData.viewport
      };
      
      pageData.page.render(renderContext);
    });
  }, [pdfPages]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-md"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant">
          <div className="flex items-center gap-sm min-w-0">
            <FileTypeIcon type={preview?.type} size={22} className="flex-shrink-0" />
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
                  try {
                    const { data, error } = await supabase.storage
                      .from('documents')
                      .download(preview.filePath);
                    if (error || !data) {
                      console.error('Gagal mengunduh file:', error);
                      alert('Gagal mengunduh file: ' + (error?.message || 'Unknown error'));
                      return;
                    }
                    const downloadUrl = URL.createObjectURL(data);
                    const a = document.createElement('a');
                    a.href = downloadUrl;
                    a.download = preview.name || 'download';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(downloadUrl);
                  } catch (err) {
                    console.error('Error downloading:', err);
                    alert('Gagal mengunduh file');
                  }
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

        <div className="flex-1 overflow-auto bg-surface-container-high p-lg min-h-[300px]">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-body-sm text-on-surface-variant">Memuat preview…</p>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-body-sm text-error">{error}</p>
            </div>
          ) : isImage ? (
            <div className="h-full flex items-center justify-center">
              <img src={url} alt={name} className="max-w-full max-h-[70vh] object-contain rounded-lg" />
            </div>
          ) : isPdf && isMobile ? (
            pdfLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-sm">
                  <div className="animate-spin inline-block w-8 h-8 border-4 border-secondary border-t-transparent rounded-full"></div>
                  <p className="text-body-sm text-on-surface-variant">Memuat PDF...</p>
                </div>
              </div>
            ) : pdfPages.length > 0 ? (
              <div className="space-y-md">
                {pdfPages.map((pageData, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <canvas 
                      ref={el => canvasRefs.current[idx] = el}
                      className="w-full h-auto"
                    />
                  </div>
                ))}
                {pdfPages[0]?.totalPages > 3 && (
                  <div className="text-center py-md">
                    <p className="text-body-sm text-on-surface-variant mb-sm">
                      Menampilkan 3 dari {pdfPages[0].totalPages} halaman
                    </p>
                    <button
                      onClick={() => window.open(url, '_blank')}
                      className="inline-flex items-center gap-xs px-md py-sm rounded-lg bg-secondary text-white font-semibold hover:brightness-110 transition-all text-body-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                      Lihat semua halaman
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div className="space-y-md">
                  <span className="material-symbols-outlined text-6xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    picture_as_pdf
                  </span>
                  <p className="text-on-surface font-semibold text-lg">{name}</p>
                  <p className="text-on-surface-variant max-w-xs mx-auto text-body-sm">
                    Gagal memuat preview. Silakan buka file di tab baru.
                  </p>
                  <button
                    onClick={() => window.open(url, '_blank')}
                    className="flex items-center justify-center gap-sm px-lg py-sm rounded-lg bg-secondary text-white font-semibold hover:brightness-110 transition-all text-body-md mx-auto"
                  >
                    <span className="material-symbols-outlined">open_in_new</span>
                    Buka
                  </button>
                </div>
              </div>
            )
          ) : isPdf ? (
            <iframe src={url} title={name} className="w-full h-[70vh] border-0 rounded-lg bg-white" />
          ) : content?.kind === 'html' ? (
            <div
              className="preview-doc mx-auto max-w-2xl bg-white rounded-lg p-xl shadow-sm"
              style={{ wordBreak: 'break-word' }}
              dangerouslySetInnerHTML={{ __html: content.html }}
            />
          ) : content?.kind === 'table' ? (
            <div className="space-y-lg">
              {content.sheets.map((sheet) => (
                <div key={sheet.name} className="bg-white rounded-lg p-md shadow-sm overflow-x-auto">
                  <p className="font-semibold text-on-surface mb-sm">{sheet.name}</p>
                  <table className="w-full border-collapse text-body-sm">
                    <tbody>
                      {sheet.rows.map((row, r) => (
                        <tr key={r} className="border-b border-outline-variant">
                          {row.map((cell, c) => (
                            <td key={c} className="border border-outline-variant px-sm py-1 align-top">
                              {cell === '' ? '\u00A0' : String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <div className="space-y-md">
                <span className="material-symbols-outlined text-6xl text-outline-variant">description</span>
                <p className="text-on-surface-variant max-w-xs mx-auto">
                  Preview langsung tidak tersedia untuk tipe file ini. Gunakan "Buka file lengkap" untuk melihatnya.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-sm px-lg py-md border-t border-outline-variant">
          <button
            onClick={onClose}
            className="px-md py-sm rounded-lg border border-outline-variant text-on-surface font-semibold hover:bg-surface-container transition-colors text-body-sm"
          >
            Tutup
          </button>
          {url && (
            <button
              onClick={() => window.open(url, '_blank')}
              className="flex items-center gap-xs px-md py-sm rounded-lg bg-secondary text-white font-semibold hover:brightness-110 transition-all text-body-sm"
            >
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              Buka file lengkap
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
