import { useRef, useEffect, useLayoutEffect, useState } from 'react';
import FileTypeIcon from './FileTypeIcon';

function typeColorClass(color) {
  const map = {
    error: 'bg-error',
    secondary: 'bg-secondary',
    '#1D6F42': 'bg-[#1D6F42]',
  };
  return map[color] || 'bg-primary';
}

// Component untuk load image thumbnail
function ImageThumbnail({ filePath, fileName, supabase }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      if (!filePath) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase.storage
          .from('documents')
          .createSignedUrl(filePath, 3600);
        
        if (error) throw error;
        if (data?.signedUrl) {
          setImageUrl(data.signedUrl);
        }
      } catch (err) {
        console.error('Gagal memuat thumbnail:', err);
      } finally {
        setLoading(false);
      }
    };
    loadImage();
  }, [filePath, supabase]);

  if (loading) {
    return (
      <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
        <span className="material-symbols-outlined text-gray-400 text-[32px]">image</span>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
        <span className="material-symbols-outlined text-white text-[32px]">broken_image</span>
      </div>
    );
  }

  return (
    <img 
      src={imageUrl} 
      alt={fileName}
      className="w-full h-full object-cover"
    />
  );
}

function PreviewCard({ preview, cardRef, onOpenFile, supabase }) {
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
  
  // Check if file is image type
  const isImage = preview.type === 'img' || 
                  ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].some(ext => 
                    preview.name?.toLowerCase().endsWith(`.${ext}`)
                  );
  
  return (
    <div
      ref={cardRef}
      onClick={() => onOpenFile?.(preview)}
      className="flex-shrink-0 w-48 snap-start bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden group cursor-pointer hover:shadow-md transition-all"
    >
      <div className="h-28 bg-surface-container-high relative flex items-center justify-center overflow-hidden">
        {isImage && preview.filePath && supabase ? (
          // Tampilkan thumbnail image asli
          <ImageThumbnail 
            filePath={preview.filePath} 
            fileName={preview.name}
            supabase={supabase}
          />
        ) : preview.image ? (
          <img
            className="w-full h-full object-cover opacity-60"
            src={preview.image}
            alt={preview.name}
          />
        ) : (
          <FileTypeIcon type={preview.type} size={48} className="opacity-90" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-on-surface/5 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined text-white text-[32px]">
            open_in_new
          </span>
        </div>
        <div className={`absolute top-2 right-2 px-1 rounded text-white text-[10px] font-bold ${typeColorClass(preview.typeColor)}`}>
          {preview.type}
        </div>
        {/* Badge Status - posisi kiri bawah */}
        {statusBadge && (
          <div className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-full ${statusBadge.bgColor} ${statusBadge.textColor} text-[10px] font-bold shadow-md`}>
            {statusBadge.label}
          </div>
        )}
      </div>
              <div className="p-sm">
                <div className="flex items-center gap-xs min-w-0">
                  <FileTypeIcon type={preview.type} size={20} className="flex-shrink-0" />
                  <p className="text-body-sm font-semibold truncate">{preview.name}</p>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  {preview.size} • {preview.time}
                </p>
              </div>
    </div>
  );
}

export default function QuickPreview({ previews, title = 'Preview Update Terkini', slider = false, onOpenFile, supabase }) {
  const scrollRef = useRef(null);
  const firstOriginalRef = useRef(null);
  const firstTrailingRef = useRef(null);
  const intervalRef = useRef(null);
  const normTimerRef = useRef(null);
  const draggingRef = useRef(false);

  const useInfinite = slider && previews.length > 3;

  const getStep = () => {
    const el = scrollRef.current;
    if (!el) return 0;
    const card = el.firstElementChild;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    return (card ? card.offsetWidth : el.clientWidth * 0.8) + gap;
  };

  const hasOverflow = () => {
    const el = scrollRef.current;
    return el ? el.scrollWidth > el.clientWidth + 1 : false;
  };

  const getMetrics = () => {
    const el = scrollRef.current;
    const a = firstOriginalRef.current;
    const b = firstTrailingRef.current;
    if (!el || !a || !b) return null;
    const containerLeft = el.getBoundingClientRect().left;
    const base = a.getBoundingClientRect().left - containerLeft + el.scrollLeft;
    const trailLeft = b.getBoundingClientRect().left - containerLeft + el.scrollLeft;
    return { base, width: trailLeft - base };
  };

  useLayoutEffect(() => {
    const m = getMetrics();
    if (m && scrollRef.current) scrollRef.current.scrollLeft = m.base;
  }, [previews, slider]);

  const normalize = () => {
    const el = scrollRef.current;
    const m = getMetrics();
    if (!el || !m || !m.width || !hasOverflow()) return;
    if (el.scrollLeft >= m.base + m.width) {
      el.scrollLeft -= m.width;
    } else if (el.scrollLeft < m.base) {
      el.scrollLeft += m.width;
    }
  };

  const scrollBy = (dir) => {
    const el = scrollRef.current;
    if (!el || !hasOverflow()) return;
    el.scrollBy({ left: getStep() * dir, behavior: 'smooth' });
    startAuto();
  };

  const handleScroll = () => {
    startAuto();
    if (!draggingRef.current) scheduleNormalize();
  };

  const scheduleNormalize = () => {
    if (normTimerRef.current) clearTimeout(normTimerRef.current);
    normTimerRef.current = setTimeout(normalize, 200);
  };

  const startAuto = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!slider || previews.length <= 3) return;
    intervalRef.current = setInterval(() => {
      scrollBy(1);
    }, 10000);
  };

  useEffect(() => {
    startAuto();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (normTimerRef.current) clearTimeout(normTimerRef.current);
    };
  }, [slider, previews]);

  const lead = useInfinite ? previews : [];
  const trail = useInfinite ? previews : [];

  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col gap-md">
      <div className="flex justify-between items-center">
        <h3 className="font-title-sm text-on-surface flex items-center gap-sm">
          <span className="material-symbols-outlined text-secondary">preview</span>
          {title}
        </h3>
        <div className="flex items-center gap-sm">
          {slider && previews.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                title="Sebelumnya"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                title="Berikutnya"
                className="w-8 h-8 flex items-center justify-center rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </>
          )}
          <button className="text-secondary font-semibold text-body-sm">Lihat Semua Riwayat</button>
        </div>
      </div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onPointerDown={() => { draggingRef.current = true; }}
        onPointerUp={() => { draggingRef.current = false; scheduleNormalize(); }}
        onPointerCancel={() => { draggingRef.current = false; scheduleNormalize(); }}
        className="flex gap-lg overflow-x-auto pb-sm scrollbar-hide scroll-smooth snap-x snap-proximity"
      >
        {previews.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant py-md">Belum ada dokumen yang dibuka.</p>
        ) : (
          <>
            {lead.map((preview, i) => (
              <PreviewCard key={`lead-${preview.id}-${i}`} preview={preview} onOpenFile={onOpenFile} supabase={supabase} />
            ))}
            {previews.map((preview, i) => (
              <PreviewCard
                key={`orig-${preview.id}-${i}`}
                preview={preview}
                cardRef={i === 0 ? firstOriginalRef : undefined}
                onOpenFile={onOpenFile}
                supabase={supabase}
              />
            ))}
            {trail.map((preview, i) => (
              <PreviewCard
                key={`trail-${preview.id}-${i}`}
                preview={preview}
                cardRef={i === 0 ? firstTrailingRef : undefined}
                onOpenFile={onOpenFile}
                supabase={supabase}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
