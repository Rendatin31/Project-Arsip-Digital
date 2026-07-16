import React from 'react';

// Component untuk menampilkan thumbnail image
function ImageThumbnail({ file, supabase }) {
  const [imageUrl, setImageUrl] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadImage = async () => {
      if (!file.filePath) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase.storage
          .from('documents')
          .createSignedUrl(file.filePath, 3600);
        
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
  }, [file.filePath, supabase]);

  if (loading) {
    return (
      <div className="w-[52px] h-[36px] bg-gray-200 rounded animate-pulse"></div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="w-[52px] h-[36px] bg-gradient-to-br from-purple-400 to-purple-600 rounded shadow-md flex items-center justify-center">
        <span className="material-symbols-outlined text-white text-[20px]">broken_image</span>
      </div>
    );
  }

  return (
    <div className="relative w-[52px] h-[36px]">
      {/* 3D Shadow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-500 rounded transform translate-x-[2px] translate-y-[2px]"></div>
      {/* Main image container */}
      <div className="absolute inset-0 bg-white rounded shadow-md overflow-hidden border border-gray-300">
        <img 
          src={imageUrl} 
          alt={file.fileName}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

export default function FileTable({ files, title = 'File Saya', onOpenAdd, supabase, onEdit, onRefresh, onPreview, onDeleteFile, onConfirmDelete }) {
  const [viewMode, setViewMode] = React.useState('grid'); // 'list' or 'grid'
  const [showFilter, setShowFilter] = React.useState(false);
  const [filterType, setFilterType] = React.useState('');
  const [filterCategory, setFilterCategory] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [editingFileId, setEditingFileId] = React.useState(null);
  const [editingFileName, setEditingFileName] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  
  // Items per page berbeda untuk list dan grid view
  const itemsPerPage = viewMode === 'grid' ? 20 : 5;

  // Filter files based on criteria
  const filteredFiles = files.filter(file => {
    const matchSearch = !searchQuery || file.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = !filterType || file.type === filterType;
    const matchCategory = !filterCategory || file.category === filterCategory;
    return matchSearch && matchType && matchCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFiles = filteredFiles.slice(startIndex, endIndex);

  // Get unique file types and categories for filter
  const fileTypes = [...new Set(files.map(f => f.type).filter(Boolean))];
  const fileCategories = [...new Set(files.map(f => f.category).filter(Boolean))];
  
  // State untuk auto-resize textarea
  const textareaRef = React.useRef(null);

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current && editingFileId) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [editingFileName, editingFileId]);

  // Handle inline rename
  const handleRenameClick = (file) => {
    setEditingFileId(file.id);
    // Pisahkan nama file dari extension
    const lastDotIndex = file.fileName.lastIndexOf('.');
    if (lastDotIndex > 0) {
      // Ada extension, ambil hanya nama tanpa extension
      setEditingFileName(file.fileName.substring(0, lastDotIndex));
    } else {
      // Tidak ada extension
      setEditingFileName(file.fileName);
    }
  };

  const handleRenameBlur = async (file) => {
    if (editingFileName && editingFileName !== file.fileName) {
      try {
        // Ambil extension dari nama file original
        const lastDotIndex = file.fileName.lastIndexOf('.');
        let newFileName = editingFileName;
        
        if (lastDotIndex > 0) {
          // Ada extension, tambahkan kembali ke nama baru
          const extension = file.fileName.substring(lastDotIndex);
          newFileName = editingFileName + extension;
        }
        
        const { error } = await supabase
          .from('documents')
          .update({ file_name: newFileName })
          .eq('id', file.id);
        
        if (error) throw error;
        
        if (onRefresh) {
          onRefresh();
        }
      } catch (err) {
        console.error('Gagal mengubah nama file:', err);
        alert('Gagal mengubah nama file: ' + (err.message || 'Unknown error'));
      }
    }
    setEditingFileId(null);
    setEditingFileName('');
  };

  const handleRenameKeyDown = (e, file) => {
    if (e.key === 'Enter') {
      handleRenameBlur(file);
    } else if (e.key === 'Escape') {
      setEditingFileId(null);
      setEditingFileName('');
    }
  };

  const handleView = async (file) => {
    if (!file.filePath) {
      alert('Dokumen ini tidak memiliki file yang diunggah.');
      return;
    }
    
    // Track dokumen yang dibuka untuk "Preview Terakhir Dibuka"
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

  const handleDownload = async (file) => {
    if (!file.filePath) {
      alert('Dokumen ini tidak memiliki file yang diunggah.');
      return;
    }
    const { data, error } = await supabase.storage
      .from('documents')
      .download(file.filePath);
    if (error || !data) {
      console.error('Gagal mengunduh file:', error);
      alert('Gagal mengunduh file: ' + (error?.message || 'Unknown error'));
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.fileName || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (file) => {
    // Use modern confirm dialog if available
    if (onConfirmDelete) {
      onConfirmDelete(file, async () => {
        try {
          // Jika ada callback onDeleteFile, gunakan itu (untuk handle localStorage cleanup)
          if (onDeleteFile) {
            await onDeleteFile(file);
          } else {
            // Fallback: delete langsung
            const { error } = await supabase
              .from('documents')
              .delete()
              .eq('id', file.id);
            
            if (error) throw error;
          }
          
          // Call refresh callback instead of window.reload
          if (onRefresh) {
            onRefresh();
          }
        } catch (err) {
          console.error('Gagal menghapus dokumen:', err);
          // Error will be handled by parent through onDeleteFile
        }
      });
    } else {
      // Fallback to native confirm
      if (!confirm(`Apakah Anda yakin ingin menghapus "${file.fileName}"?`)) {
        return;
      }
      try {
        // Jika ada callback onDeleteFile, gunakan itu (untuk handle localStorage cleanup)
        if (onDeleteFile) {
          await onDeleteFile(file);
        } else {
          // Fallback: delete langsung
          const { error } = await supabase
            .from('documents')
            .delete()
            .eq('id', file.id);
          
          if (error) throw error;
        }
        
        // Call refresh callback instead of window.reload
        if (onRefresh) {
          onRefresh();
        }
      } catch (err) {
        console.error('Gagal menghapus dokumen:', err);
      }
    }
  };
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset to page 1 when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterCategory, searchQuery, viewMode]);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-visible shadow-sm">
      <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface-bright">
        <h2 className="font-title-sm text-on-surface">
          {title}{' '}
          <span className="text-on-surface-variant font-normal text-body-sm ml-sm">
            ({files.length} File)
          </span>
        </h2>
        <div className="flex gap-sm items-center">
          {onOpenAdd && (
            <button
              onClick={onOpenAdd}
              className="p-xs hover:bg-surface-container-low rounded text-secondary"
              title="Tambah Arsip"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>
          )}
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-xs hover:bg-surface-container-low rounded ${viewMode === 'grid' ? 'bg-surface-container-high' : ''}`}
            title="Grid View"
          >
            <span className={`material-symbols-outlined text-[20px] ${viewMode === 'grid' ? 'text-primary' : 'text-outline'}`}>grid_view</span>
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-xs hover:bg-surface-container-low rounded ${viewMode === 'list' ? 'bg-surface-container-high' : ''}`}
            title="List View"
          >
            <span className={`material-symbols-outlined text-[20px] ${viewMode === 'list' ? 'text-primary' : 'text-outline'}`}>view_list</span>
          </button>
          <div className="w-px h-6 bg-outline-variant mx-xs" />
          <div className="relative z-10">
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-xs px-sm py-xs border border-outline-variant rounded hover:bg-surface-container-low text-body-sm ${showFilter ? 'bg-surface-container-high' : ''}`}
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filter
            </button>
            {showFilter && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-surface-container-high border border-outline-variant rounded-lg shadow-xl z-20 p-md">
                <div className="flex justify-between items-center mb-md">
                  <h3 className="font-semibold text-body-md text-on-surface">Filter</h3>
                  <button 
                    onClick={() => {
                      setFilterType('');
                      setFilterCategory('');
                      setSearchQuery('');
                    }}
                    className="text-body-sm text-primary hover:underline"
                  >
                    Reset
                  </button>
                </div>
                
                <div className="space-y-md">
                  <div>
                    <label className="block text-label-sm text-on-surface-variant mb-xs">
                      Cari Nama File
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ketik nama file..."
                      className="w-full px-sm py-xs border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-body-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-label-sm text-on-surface-variant mb-xs">
                      Tipe File
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full px-sm py-xs border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-body-sm focus:outline-none focus:border-primary"
                    >
                      <option value="">Semua Tipe</option>
                      {fileTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-label-sm text-on-surface-variant mb-xs">
                      Kategori
                    </label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-sm py-xs border border-outline-variant rounded bg-surface-container-lowest text-on-surface text-body-sm focus:outline-none focus:border-primary"
                    >
                      <option value="">Semua Kategori</option>
                      {fileCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-md pt-md border-t border-outline-variant flex justify-between items-center text-body-sm text-on-surface-variant">
                  <span>{filteredFiles.length} hasil</span>
                  <button 
                    onClick={() => setShowFilter(false)}
                    className="text-primary hover:underline"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* List View */}
      {viewMode === 'list' && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="p-md text-label-caps text-on-surface-variant font-semibold w-12 text-center">
                    <input
                      className="rounded border-outline-variant text-secondary focus:ring-secondary"
                      type="checkbox"
                    />
                  </th>
                  <th className="p-md text-label-caps text-on-surface-variant font-semibold">
                    File name
                  </th>
                  <th className="p-md text-label-caps text-on-surface-variant font-semibold w-40">
                    Date modified
                  </th>
                  <th className="p-md text-label-caps text-on-surface-variant font-semibold w-24">
                    Type
                  </th>
                  <th className="p-md text-label-caps text-on-surface-variant font-semibold w-24 text-center">
                    Size
                  </th>
                  <th className="p-md text-label-caps text-on-surface-variant font-semibold w-24 text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {paginatedFiles.map((file) => (
                  <tr 
                    key={file.id} 
                    onDoubleClick={() => onEdit?.(file)}
                    className="file-row hover:bg-surface-container-low transition-colors group cursor-pointer"
                  >
                    <td className="px-md py-sm text-center">
                      <input
                        className="rounded border-outline-variant text-secondary focus:ring-secondary"
                        type="checkbox"
                      />
                    </td>
                    <td className="px-md py-sm text-table-data font-semibold text-on-surface truncate">
                      {editingFileId === file.id ? (
                        <input
                          type="text"
                          value={editingFileName}
                          onChange={(e) => setEditingFileName(e.target.value)}
                          onBlur={() => handleRenameBlur(file)}
                          onKeyDown={(e) => handleRenameKeyDown(e, file)}
                          autoFocus
                          className="w-full px-2 py-1 border border-primary rounded bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span 
                          className="cursor-text hover:bg-surface-container-low px-2 py-1 rounded inline-block"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameClick(file);
                          }}
                        >
                          {file.fileName}
                        </span>
                      )}
                    </td>
                    <td className="px-md py-sm text-table-data text-on-surface-variant">
                      {file.dateModified}
                    </td>
                    <td className="px-md py-sm text-table-data">
                      {file.type}
                    </td>
                    <td className="px-md py-sm text-center text-table-data">
                      {file.size}
                    </td>
                    <td className="px-md py-sm">
                      <div className="flex items-center justify-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleView(file); }} 
                          className="p-0.5 hover:bg-surface-container rounded text-on-surface-variant transition-all" 
                          title="Lihat"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDownload(file); }} 
                          className="p-0.5 hover:bg-surface-container rounded text-on-surface-variant transition-all" 
                          title="Unduh"
                        >
                          <span className="material-symbols-outlined text-[16px]">download</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="p-md overflow-hidden">
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-xs">
            {paginatedFiles.map((file) => {
              // Fungsi untuk menentukan icon dan warna berdasarkan tipe file
              const getFileIconAndColor = (type) => {
                if (!type) return { icon: 'insert_drive_file', color: 'text-gray-400', isPDF: false, isImage: false, isWord: false, isExcel: false };
                const typeUpper = type.toUpperCase();
                if (typeUpper.includes('PDF')) return { icon: 'picture_as_pdf', color: 'text-red-500', isPDF: true, isImage: false, isWord: false, isExcel: false };
                if (typeUpper.includes('WORD') || typeUpper.includes('DOC')) return { icon: 'description', color: 'text-blue-600', isPDF: false, isImage: false, isWord: true, isExcel: false };
                if (typeUpper.includes('EXCEL') || typeUpper.includes('XLS') || typeUpper.includes('SPREADSHEET')) return { icon: 'table_chart', color: 'text-green-600', isPDF: false, isImage: false, isWord: false, isExcel: true };
                if (typeUpper.includes('IMAGE') || typeUpper.includes('JPG') || typeUpper.includes('PNG') || typeUpper.includes('JPEG')) return { icon: 'image', color: 'text-purple-500', isPDF: false, isImage: true, isWord: false, isExcel: false };
                if (typeUpper.includes('VIDEO') || typeUpper.includes('MP4') || typeUpper.includes('AVI')) return { icon: 'play_circle', color: 'text-pink-500', isPDF: false, isImage: false, isWord: false, isExcel: false };
                if (typeUpper.includes('AUDIO') || typeUpper.includes('MP3')) return { icon: 'audio_file', color: 'text-orange-500', isPDF: false, isImage: false, isWord: false, isExcel: false };
                if (typeUpper.includes('ZIP') || typeUpper.includes('RAR') || typeUpper.includes('ARCHIVE')) return { icon: 'folder_zip', color: 'text-yellow-600', isPDF: false, isImage: false, isWord: false, isExcel: false };
                if (typeUpper.includes('TEXT') || typeUpper.includes('TXT')) return { icon: 'text_snippet', color: 'text-slate-500', isPDF: false, isImage: false, isWord: false, isExcel: false };
                return { icon: 'insert_drive_file', color: 'text-gray-400', isPDF: false, isImage: false, isWord: false, isExcel: false };
              };

              const { icon, color, isPDF, isImage, isWord, isExcel } = getFileIconAndColor(file.type);

              return (
                <div
                  key={file.id}
                  className="flex flex-col items-center p-2 rounded cursor-pointer group transition-colors"
                >
                  {/* Icon Container - Smaller */}
                  <div 
                    className={`relative ${isImage ? 'mb-1' : '-mb-1'}`}
                    onDoubleClick={() => handleView(file)}
                  >
                    {isPDF ? (
                      <div className="w-[40px] h-[52px] flex items-center justify-center">
                        <svg height="60px" width="48px" version="1.1" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
                          <g>
                            <path fill="#f5f5f0" d="M36.985,0H7.963C7.155,0,6.5,0.655,6.5,1.926V55c0,0.345,0.655,1,1.463,1h40.074 c0.808,0,1.463-0.655,1.463-1V12.978c0-0.696-0.093-0.92-0.257-1.085L37.607,0.257C37.442,0.093,37.218,0,36.985,0z"></path>
                            <polygon fill="#D9D7CA" points="37.5,0.151 37.5,12 49.349,12 "></polygon>
                            <path fill="#ec2222" d="M19.514,33.324L19.514,33.324c-0.348,0-0.682-0.113-0.967-0.326 c-1.041-0.781-1.181-1.65-1.115-2.242c0.182-1.628,2.195-3.332,5.985-5.068c1.504-3.296,2.935-7.357,3.788-10.75 c-0.998-2.172-1.968-4.99-1.261-6.643c0.248-0.579,0.557-1.023,1.134-1.215c0.228-0.076,0.804-0.172,1.016-0.172 c0.504,0,0.947,0.649,1.261,1.049c0.295,0.376,0.964,1.173-0.373,6.802c1.348,2.784,3.258,5.62,5.088,7.562 c1.311-0.237,2.439-0.358,3.358-0.358c1.566,0,2.515,0.365,2.902,1.117c0.32,0.622,0.189,1.349-0.39,2.16 c-0.557,0.779-1.325,1.191-2.22,1.191c-1.216,0-2.632-0.768-4.211-2.285c-2.837,0.593-6.15,1.651-8.828,2.822 c-0.836,1.774-1.637,3.203-2.383,4.251C21.273,32.654,20.389,33.324,19.514,33.324z M22.176,28.198 c-2.137,1.201-3.008,2.188-3.071,2.744c-0.01,0.092-0.037,0.334,0.431,0.692C19.685,31.587,20.555,31.19,22.176,28.198z M35.813,23.756c0.815,0.627,1.014,0.944,1.547,0.944c0.234,0,0.901-0.01,1.21-0.441c0.149-0.209,0.207-0.343,0.23-0.415 c-0.123-0.065-0.286-0.197-1.175-0.197C37.12,23.648,36.485,23.67,35.813,23.756z M28.343,17.174 c-0.715,2.474-1.659,5.145-2.674,7.564c2.09-0.811,4.362-1.519,6.496-2.02C30.815,21.15,29.466,19.192,28.343,17.174z M27.736,8.712c-0.098,0.033-1.33,1.757,0.096,3.216C28.781,9.813,27.779,8.698,27.736,8.712z"></path>
                            <path fill="#ec2222" d="M48.037,56H7.963C7.155,56,6.5,55.345,6.5,54.537V39h43v15.537C49.5,55.345,48.845,56,48.037,56z"></path>
                            <g>
                              <path fill="#FFFFFF" d="M17.385,53h-1.641V42.924h2.898c0.428,0,0.852,0.068,1.271,0.205 c0.419,0.137,0.795,0.342,1.128,0.615c0.333,0.273,0.602,0.604,0.807,0.991s0.308,0.822,0.308,1.306 c0,0.511-0.087,0.973-0.26,1.388c-0.173,0.415-0.415,0.764-0.725,1.046c-0.31,0.282-0.684,0.501-1.121,0.656 s-0.921,0.232-1.449,0.232h-1.217V53z M17.385,44.168v3.992h1.504c0.2,0,0.398-0.034,0.595-0.103 c0.196-0.068,0.376-0.18,0.54-0.335c0.164-0.155,0.296-0.371,0.396-0.649c0.1-0.278,0.15-0.622,0.15-1.032 c0-0.164-0.023-0.354-0.068-0.567c-0.046-0.214-0.139-0.419-0.28-0.615c-0.142-0.196-0.34-0.36-0.595-0.492 c-0.255-0.132-0.593-0.198-1.012-0.198H17.385z"></path>
                              <path fill="#FFFFFF" d="M32.219,47.682c0,0.829-0.089,1.538-0.267,2.126s-0.403,1.08-0.677,1.477s-0.581,0.709-0.923,0.937 s-0.672,0.398-0.991,0.513c-0.319,0.114-0.611,0.187-0.875,0.219C28.222,52.984,28.026,53,27.898,53h-3.814V42.924h3.035 c0.848,0,1.593,0.135,2.235,0.403s1.176,0.627,1.6,1.073s0.74,0.955,0.95,1.524C32.114,46.494,32.219,47.08,32.219,47.682z M27.352,51.797c1.112,0,1.914-0.355,2.406-1.066s0.738-1.741,0.738-3.09c0-0.419-0.05-0.834-0.15-1.244 c-0.101-0.41-0.294-0.781-0.581-1.114s-0.677-0.602-1.169-0.807s-1.13-0.308-1.914-0.308h-0.957v7.629H27.352z"></path>
                              <path fill="#FFFFFF" d="M36.266,44.168v3.172h4.211v1.121h-4.211V53h-1.668V42.924H40.9v1.244H36.266z"></path>
                            </g>
                          </g>
                        </svg>
                      </div>
                    ) : isWord ? (
                      <div className="w-[40px] h-[52px] flex items-center justify-center">
                        <svg viewBox="0 -1.27 110.031 110.031" xmlns="http://www.w3.org/2000/svg" fill="#000000" className="w-[40px] h-[52px]">
                          <path d="M57.505 0h7.475v10c13.375.075 26.738-.138 40.101.075 2.85-.288 5.087 1.925 4.825 4.775.212 24.625-.05 49.262.125 73.887-.125 2.525.25 5.325-1.213 7.562-1.825 1.3-4.188 1.138-6.312 1.237-12.514-.061-25.014-.036-37.526-.036v10h-7.812c-19.024-3.475-38.1-6.662-57.162-10-.013-29.162 0-58.325 0-87.475C19.167 6.675 38.343 3.413 57.506 0z" fill="#2a5699"></path>
                          <path d="M64.98 13.75h41.25v80H64.98v-10h32.5v-5h-32.5V72.5h32.5v-5h-32.5v-6.25h32.5v-5h-32.5V50h32.5v-5h-32.5v-6.25h32.5v-5h-32.5V27.5h32.5v-5h-32.5v-8.75zM25.83 35.837c2.375-.137 4.75-.237 7.125-.362 1.662 8.438 3.362 16.862 5.162 25.262 1.413-8.675 2.976-17.325 4.487-25.987 2.5-.087 5-.225 7.488-.375-2.825 12.112-5.3 24.325-8.388 36.362-2.088 1.088-5.213-.05-7.688.125-1.663-8.274-3.6-16.5-5.088-24.812-1.462 8.075-3.362 16.075-5.037 24.101-2.4-.125-4.812-.275-7.226-.438-2.074-11-4.512-21.925-6.449-32.95 2.137-.1 4.287-.188 6.425-.263 1.287 7.962 2.75 15.888 3.875 23.862 1.765-8.174 3.564-16.349 5.314-24.525z" fill="#ffffff"></path>
                        </svg>
                      </div>
                    ) : isExcel ? (
                      <div className="w-[40px] h-[52px] flex items-center justify-center">
                        <svg viewBox="0 -1.27 110.037 110.037" xmlns="http://www.w3.org/2000/svg" fill="#000000" className="w-[40px] h-[52px]">
                          <path d="M57.55 0h7.425v10c12.513 0 25.025.025 37.537-.038 2.113.087 4.438-.062 6.275 1.2 1.287 1.85 1.138 4.2 1.225 6.325-.062 21.7-.037 43.388-.024 65.075-.062 3.638.337 7.35-.425 10.938-.5 2.6-3.625 2.662-5.713 2.75-12.95.037-25.912-.025-38.875 0v11.25h-7.763c-19.05-3.463-38.138-6.662-57.212-10V10.013C19.188 6.675 38.375 3.388 57.55 0z" fill="#207245"></path>
                          <path d="M64.975 13.75h41.25V92.5h-41.25V85h10v-8.75h-10v-5h10V62.5h-10v-5h10v-8.75h-10v-5h10V35h-10v-5h10v-8.75h-10v-7.5z" fill="#ffffff"></path>
                          <path d="M79.975 21.25h17.5V30h-17.5v-8.75z" fill="#207245"></path>
                          <path d="M37.025 32.962c2.825-.2 5.663-.375 8.5-.512a2607.344 2607.344 0 0 1-10.087 20.487c3.438 7 6.949 13.95 10.399 20.95a716.28 716.28 0 0 1-9.024-.575c-2.125-5.213-4.713-10.25-6.238-15.7-1.699 5.075-4.125 9.862-6.074 14.838-2.738-.038-5.476-.15-8.213-.263C19.5 65.9 22.6 59.562 25.912 53.312c-2.812-6.438-5.9-12.75-8.8-19.15 2.75-.163 5.5-.325 8.25-.475 1.862 4.888 3.899 9.712 5.438 14.725 1.649-5.312 4.112-10.312 6.225-15.45z" fill="#ffffff"></path>
                          <path d="M79.975 35h17.5v8.75h-17.5V35zM79.975 48.75h17.5v8.75h-17.5v-8.75zM79.975 62.5h17.5v8.75h-17.5V62.5zM79.975 76.25h17.5V85h-17.5v-8.75z" fill="#207245"></path>
                        </svg>
                      </div>
                    ) : isImage ? (
                      <ImageThumbnail file={file} supabase={supabase} />
                    ) : (
                      <div className="w-[40px] h-[52px] flex items-center justify-center">
                        <span className={`material-symbols-outlined text-[52px] ${color}`}>
                          {icon}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* File Name - Larger text, multi-line with hover effect only on text */}
                  {editingFileId === file.id ? (
                    <textarea
                      ref={textareaRef}
                      value={editingFileName}
                      onChange={(e) => setEditingFileName(e.target.value)}
                      onBlur={() => handleRenameBlur(file)}
                      onKeyDown={(e) => handleRenameKeyDown(e, file)}
                      autoFocus
                      rows={1}
                      className="text-[12px] text-center text-on-surface leading-tight w-full px-1 py-0.5 border border-primary rounded bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary resize-none overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <p 
                      className="text-[12px] text-center text-on-surface leading-tight w-full line-clamp-4 break-words cursor-text hover:bg-primary/10 px-1 py-0.5 rounded transition-colors" 
                      title={file.fileName}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenameClick(file);
                      }}
                    >
                      {file.fileName}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="px-lg py-md border-t border-outline-variant flex items-center justify-between bg-surface-container-lowest">
        <p className="text-body-sm text-on-surface-variant">
          Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredFiles.length)} dari {filteredFiles.length} data
        </p>
        <div className="flex gap-xs">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container-low disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-8 h-8 flex items-center justify-center rounded font-semibold ${
                page === currentPage
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'border border-outline-variant hover:bg-surface-container-low'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container-low disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
