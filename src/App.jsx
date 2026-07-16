import { useState, useEffect, useRef } from 'react';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import FileTable from './components/FileTable';
import QuickPreview from './components/QuickPreview';
import FilePreviewModal from './components/FilePreviewModal';
import AddDocumentModal from './components/AddDocumentModal';
import EditDocumentModal from './components/EditDocumentModal';
import CategoriesPage from './pages/CategoriesPage';
import DataArsipPage from './pages/DataArsipPage';
import DashboardPage from './pages/DashboardPage';
import HakAksesPage from './pages/HakAksesPage';
import PencarianPintarPage from './pages/PencarianPintarPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import RiwayatAktivitasPage from './pages/RiwayatAktivitasPage';
import PengaturanSistemPage from './pages/PengaturanSistemPage';
import ProfilePage from './pages/ProfilePage';
import ModernAlert from './components/ModernAlert';
import { notifyAllUsersExcept } from './utils/notifications';
import { initSessionTimeout, clearSessionData } from './utils/sessionTimeout';
import { usePageTitle } from './hooks/usePageTitle';

function getFileType(mimeType, fileName) {
  const ext = fileName?.split('.').pop()?.toLowerCase();
  const map = {
    pdf: 'pdf',
    doc: 'doc',
    docx: 'docx',
    xls: 'xls',
    xlsx: 'xlsx',
    jpg: 'jpg',
    jpeg: 'jpg',
    png: 'png',
    gif: 'gif',
    txt: 'txt',
  };

  if (ext && map[ext]) return map[ext];
  if (!mimeType) return 'file';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'xlsx';
  if (mimeType.includes('document') || mimeType.includes('word')) return 'docx';
  if (mimeType.includes('image')) return 'img';
  if (mimeType.includes('text')) return 'txt';
  return 'file';
}

function getFileTypeColor(mimeType, fileName) {
  const ext = fileName?.split('.').pop()?.toLowerCase();
  const map = {
    pdf: 'text-error',
    doc: 'text-primary-container',
    docx: 'text-primary-container',
    xls: 'text-[#1D6F42]',
    xlsx: 'text-[#1D6F42]',
    jpg: 'text-secondary',
    jpeg: 'text-secondary',
    png: 'text-secondary',
    gif: 'text-secondary',
    txt: 'text-on-surface-variant',
  };

  if (ext && map[ext]) return map[ext];
  if (!mimeType) return 'text-outline';
  if (mimeType.includes('pdf')) return 'text-error';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'text-[#1D6F42]';
  if (mimeType.includes('document') || mimeType.includes('word')) return 'text-primary-container';
  if (mimeType.includes('image')) return 'text-secondary';
  return 'text-outline';
}

export default function App({ supabase }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [files, setFiles] = useState([]);
  const [recentPreviews, setRecentPreviews] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [directories, setDirectories] = useState([]);
  const [error, setError] = useState('');
  const [selectedDirectoryId, setSelectedDirectoryId] = useState(null);
  const [selectedDirectoryName, setSelectedDirectoryName] = useState('File Saya');
  const [selectedDirectoryPath, setSelectedDirectoryPath] = useState([]); // Path hierarki folder
  const [showAddModal, setShowAddModal] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // Debug: Track currentPage changes
  useEffect(() => {
    console.log('=== CURRENT PAGE CHANGED ===');
    console.log('New page:', currentPage);
  }, [currentPage]);
  const [initError, setInitError] = useState('');
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // State untuk search di halaman Pencarian Pintar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State untuk mobile sidebar
  const isInitialLoginRef = useRef(true); // Track if this is initial login or just tab switch

  // Modern Alert State
  const [alert, setAlert] = useState({
    show: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    showCancel: false
  });

  // Helper function to show alert
  const showAlert = (type, title, message, onConfirm = null, showCancel = false) => {
    setAlert({
      show: true,
      type,
      title,
      message,
      onConfirm,
      showCancel
    });
  };

  const closeAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };

  // Update page title dynamically based on current page
  usePageTitle(currentPage);

  useEffect(() => {
    const updateResetFlag = () => {
      if (typeof window === 'undefined') return false;
      const hash = window.location.hash;
      const pathname = window.location.pathname;
      const search = window.location.search;
      const urlParams = new URLSearchParams(search);

      console.log('=== CHECKING RESET PASSWORD ===');
      console.log('Full URL:', window.location.href);
      console.log('Hash:', hash);
      console.log('Pathname:', pathname);
      console.log('Search:', search);

      // Check hash for access_token (most common from Supabase)
      if (hash && hash.includes('access_token')) {
        console.log('✅ Found access_token in hash - RESET PASSWORD MODE');
        return true;
      }
      
      // Check hash for type=recovery
      if (hash && hash.includes('type=recovery')) {
        console.log('✅ Found type=recovery in hash - RESET PASSWORD MODE');
        return true;
      }
      
      // Check pathname
      if (pathname === '/reset-password' || pathname.includes('reset-password')) {
        console.log('✅ Found reset-password in pathname - RESET PASSWORD MODE');
        return true;
      }
      
      // Check query params
      if (urlParams.has('access_token') || urlParams.has('token') || urlParams.get('type') === 'recovery') {
        console.log('✅ Found token in query params - RESET PASSWORD MODE');
        return true;
      }
      
      console.log('❌ No reset password indicators found');
      return false;
    };

    const checkResetPassword = () => {
      const isReset = updateResetFlag();
      console.log('Setting isResetPassword to:', isReset);
      setIsResetPassword(isReset);
    };

    // Check immediately
    checkResetPassword();

    // Listen to URL changes
    window.addEventListener('hashchange', checkResetPassword);
    window.addEventListener('popstate', checkResetPassword);

    return () => {
      window.removeEventListener('hashchange', checkResetPassword);
      window.removeEventListener('popstate', checkResetPassword);
    };
  }, []);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        }
      } catch (err) {
        console.error('Gagal memuat sesi:', err);
        setInitError('Gagal terhubung ke server. Periksa koneksi internet.');
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          // Fetch profile data FIRST sebelum set user
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          // Check if user status is "Non-aktif" SEBELUM set user
          if (profileData && profileData.status === 'Non-aktif') {
            console.log('User status is Non-aktif, preventing login...');
            
            // Set error message di localStorage untuk ditampilkan di LoginPage
            localStorage.setItem('loginError', 'Akun Anda telah dinonaktifkan. Silakan hubungi administrator untuk informasi lebih lanjut.');
            
            // Sign out untuk clear session
            await supabase.auth.signOut();
            
            // Jangan set user, biarkan tetap null
            setUser(null);
            setProfile(null);
            
            // Force reload untuk menampilkan error message di LoginPage
            window.location.reload();
            return; // STOP - jangan lanjut ke setUser()
          }
          
          // Clear any previous login error
          localStorage.removeItem('loginError');
          
          // HANYA set user dan profile jika status AKTIF atau error saat check
          setUser(session.user);
          setProfile(profileData || { full_name: session.user.email, role: 'user' });
          
          // Redirect to dashboard ONLY on initial login (not on tab switch or page refresh)
          if (isInitialLoginRef.current) {
            setCurrentPage('dashboard');
            isInitialLoginRef.current = false; // Mark as no longer initial login
          }
        } else {
          setUser(null);
          setProfile(null);
          isInitialLoginRef.current = true; // Reset for next login
        }
      } catch (err) {
        console.error('Gagal memuat profil:', err);
        // Jika error, tetap set user (fallback)
        if (session?.user) {
          setUser(session.user);
          setProfile({ full_name: session.user.email, role: 'user' });
          
          // Redirect to dashboard ONLY on initial login
          if (isInitialLoginRef.current) {
            setCurrentPage('dashboard');
            isInitialLoginRef.current = false;
          }
        }
      } finally {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Session timeout monitoring - Auto logout on inactivity
  useEffect(() => {
    if (!user) return;

    console.log('Initializing session timeout monitoring...');
    
    const cleanup = initSessionTimeout(async () => {
      console.log('Session timeout triggered - logging out user');
      showAlert('warning', 'Sesi Berakhir', 'Sesi Anda telah berakhir karena tidak aktif. Silakan login kembali.', async () => {
        // Clear session data
        clearSessionData();
        
        // Logout user
        await supabase.auth.signOut();
        
        // Redirect to login
        setUser(null);
        setProfile(null);
      });
    });

    return () => {
      console.log('Cleaning up session timeout monitoring');
      cleanup();
    };
  }, [user, supabase]);

  // Periodic status check - Check user status every 30 seconds
  useEffect(() => {
    if (!user) return;

    const checkUserStatus = async () => {
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', user.id)
          .single();

        if (profileData && profileData.status === 'Non-aktif') {
          console.log('User status changed to Non-aktif, logging out...');
          await handleLogout();
        }
      } catch (err) {
        console.error('Error checking user status:', err);
      }
    };

    // Check immediately
    checkUserStatus();

    // Then check every 30 seconds
    const interval = setInterval(checkUserStatus, 30000);

    return () => clearInterval(interval);
  }, [user, supabase]);

  useEffect(() => {
    if (!user) return;

    const fetchDocuments = async () => {
      try {
        console.log('App.jsx: Fetching documents for current user only:', user?.id);
        const { data: docs, error } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id) // Filter: hanya dokumen user yang sedang login
          .order('uploaded_at', { ascending: false });

        if (error) {
          console.error('App.jsx: Error fetching documents:', error);
          return;
        }

        console.log('App.jsx: Fetched documents count:', docs?.length || 0);
        if (docs && docs.length > 0) {
          console.log('App.jsx: Sample documents:', docs.slice(0, 3).map(d => ({ 
            id: d.id, 
            file_name: d.file_name, 
            user_id: d.user_id,
            status: d.status 
          })));
        }

        if (docs) {
          
          const formatted = docs.map((doc) => {
            const sizeBytes = Number(doc.file_size) || 0;
            let sizeText;
            if (sizeBytes === 0) {
              sizeText = '0 MB';
            } else if (sizeBytes < 1024 * 1024) {
              sizeText = `${(sizeBytes / 1024).toFixed(1)} KB`;
            } else {
              sizeText = `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
            }

            return {
              id: doc.id,
              directoryId: doc.directory_id,
              filePath: doc.file_path,
              fileName: doc.file_name || '-',
              dateModified: doc.updated_at ? new Date(doc.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
              type: getFileType(doc.mime_type, doc.file_name),
              typeColor: getFileTypeColor(doc.mime_type, doc.file_name),
              size: sizeText,
              // Fields untuk EditDocumentModal (semua fields dari database)
              category_id: doc.category_id,
              subject: doc.subject,
              perihal: doc.perihal,
              letter_number: doc.letter_number,
              letter_date: doc.letter_date,
              sender: doc.sender,
              recipient: doc.recipient,
              status: doc.status,
              mime_type: doc.mime_type,
              file_size: doc.file_size,
            };
          });

          setFiles(formatted);
          // recentPreviews sekarang diisi melalui handleOpenFile (tracking dokumen yang dibuka)
        }
      } catch (err) {
        console.error('Gagal memuat dokumen:', err);
      }
    };

    const fetchDirectories = async () => {
      try {
        const { data: dirs } = await supabase
          .from('directories')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (dirs) {
          setDirectories(dirs);
        }
      } catch (err) {
        console.error('Gagal memuat direktori:', err);
      }
    };

    const fetchCategories = async () => {
      try {
        const { data: cats } = await supabase
          .from('categories')
          .select('*')
          .order('created_at', { ascending: true });

        if (cats) {
          setCategories(cats);
        }
      } catch (err) {
        console.error('Gagal memuat kategori:', err);
      }
    };

    fetchDocuments();
    fetchCategories();
    fetchDirectories();
  }, [user, supabase]);

  // Function to refresh categories (can be used as callback)
  const handleCategoryChange = async () => {
    if (!user || !supabase) return;
    try {
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (cats) {
        setCategories(cats);
      }
    } catch (err) {
      console.error('Gagal memuat kategori:', err);
    }
  };

  // Function to refresh profile data (can be used as callback)
  const handleProfileUpdate = async () => {
    if (!user || !supabase) return;
    try {
      console.log('Refreshing profile data for user:', user.id);
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error refreshing profile:', error);
      } else if (profileData) {
        console.log('Profile refreshed successfully:', profileData);
        setProfile(profileData);
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  // Load recent previews dari localStorage saat pertama kali
  useEffect(() => {
    if (user) {
      const savedPreviews = localStorage.getItem(`recentPreviews_${user.id}`);
      if (savedPreviews) {
        try {
          const parsed = JSON.parse(savedPreviews);
          setRecentPreviews(parsed.slice(0, 3)); // Max 3 items
        } catch (err) {
          console.error('Gagal memuat recent previews:', err);
        }
      }
    }
  }, [user]);

  const handleOpenFile = (preview) => {
    setPreviewFile(preview);
    
    // Track dokumen yang dibuka untuk "Preview Terakhir Dibuka"
    if (user && preview) {
      // Ambil recent previews dari localStorage
      const savedPreviews = localStorage.getItem(`recentPreviews_${user.id}`);
      let recentList = [];
      
      if (savedPreviews) {
        try {
          recentList = JSON.parse(savedPreviews);
        } catch (err) {
          console.error('Gagal parse recent previews:', err);
        }
      }
      
      // Hapus dokumen yang sama jika sudah ada (untuk move to top)
      recentList = recentList.filter(p => p.id !== preview.id);
      
      // Tambahkan dokumen baru di posisi pertama
      recentList.unshift(preview);
      
      // Batasi maksimal 10 dokumen untuk localStorage
      recentList = recentList.slice(0, 10);
      
      // Simpan ke localStorage
      localStorage.setItem(`recentPreviews_${user.id}`, JSON.stringify(recentList));
      
      // Update state untuk display (max 3)
      setRecentPreviews(recentList.slice(0, 3));
    }
  };

  // Helper function untuk menghapus file dari recent previews localStorage
  const removeFromRecentPreviews = (fileId) => {
    if (user) {
      const savedPreviews = localStorage.getItem(`recentPreviews_${user.id}`);
      if (savedPreviews) {
        try {
          let recentList = JSON.parse(savedPreviews);
          // Hapus file yang dihapus dari list
          recentList = recentList.filter(p => p.id !== fileId);
          // Update localStorage
          localStorage.setItem(`recentPreviews_${user.id}`, JSON.stringify(recentList));
          // Update state
          setRecentPreviews(recentList.slice(0, 3));
        } catch (err) {
          console.error('Gagal update recent previews:', err);
        }
      }
    }
  };

  const handleLogout = async () => {
    if (user) {
      const { error: auditError } = await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'LOGOUT',
        metadata: { ip: '127.0.0.1' },
      });

      if (auditError) {
        console.error('Gagal mencatat aktivitas logout:', auditError);
      }
    }

    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setFiles([]);
    setRecentPreviews([]);
    setCategories([]);
    setDirectories([]);
    setSelectedDirectoryId(null);
    setSelectedDirectoryName('File Saya');
    setShowAddModal(false);
  };

  const refreshDocuments = async () => {
    if (!user) return;
    const { data: docs } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id) // Filter: hanya dokumen user yang sedang login
      .order('uploaded_at', { ascending: false });

    if (docs) {
      const formatted = docs.map((doc) => {
        const sizeBytes = Number(doc.file_size) || 0;
        let sizeText;
        if (sizeBytes === 0) {
          sizeText = '0 MB';
        } else if (sizeBytes < 1024 * 1024) {
          sizeText = `${(sizeBytes / 1024).toFixed(1)} KB`;
        } else {
          sizeText = `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
        }

        return {
          id: doc.id,
          directoryId: doc.directory_id,
          filePath: doc.file_path, // ← PENTING: Include filePath!
          fileName: doc.file_name || '-',
          dateModified: doc.updated_at ? new Date(doc.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
          type: getFileType(doc.mime_type, doc.file_name),
          typeColor: getFileTypeColor(doc.mime_type, doc.file_name),
          size: sizeText,
          // Fields untuk EditDocumentModal (semua fields dari database)
          category_id: doc.category_id,
          subject: doc.subject,
          perihal: doc.perihal,
          letter_number: doc.letter_number,
          letter_date: doc.letter_date,
          sender: doc.sender,
          recipient: doc.recipient,
          status: doc.status,
          mime_type: doc.mime_type,
          file_size: doc.file_size,
        };
      });

      setFiles(formatted);
      // recentPreviews sekarang diisi melalui handleOpenFile (tracking dokumen yang dibuka)
    }
  };

  const addDirectory = async (name, parentId = null) => {
    if (!name.trim() || !user) return;
    const { data, error: insertError } = await supabase
      .from('directories')
      .insert({ name: name.trim(), user_id: user.id, parent_id: parentId })
      .select()
      .single();

    if (insertError) {
      setError('Gagal menambah folder');
      return;
    }
    setDirectories((prev) => [...prev, data]);
  };

  const updateDirectory = async (id, name) => {
    if (!name.trim()) return;
    const { error: updateError } = await supabase
      .from('directories')
      .update({ name: name.trim() })
      .eq('id', id);

    if (updateError) {
      setError('Gagal mengubah nama folder');
      return;
    }
    setDirectories((prev) => prev.map((c) => (c.id === id ? { ...c, name: name.trim() } : c)));
  };

  const deleteDirectory = async (id) => {
    const { error: deleteError } = await supabase
      .from('directories')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setError('Gagal menghapus folder');
      return;
    }
    setDirectories((prev) => prev.filter((c) => c.id !== id));
    if (selectedDirectoryId === id) {
      setSelectedDirectoryId(null);
      setSelectedDirectoryName('File Saya');
    }
  };

  // Helper function untuk membangun path hierarki folder
  const buildDirectoryPath = (directoryId) => {
    if (!directoryId) return [];
    
    const path = [];
    let currentId = directoryId;
    
    while (currentId) {
      const dir = directories.find(d => d.id === currentId);
      if (!dir) break;
      
      path.unshift({ id: dir.id, name: dir.name });
      currentId = dir.parent_id;
    }
    
    return path;
  };

  const handleSelectDirectory = (directoryId, directoryName) => {
    setSelectedDirectoryId(directoryId);
    setSelectedDirectoryName(directoryName);
    
    // Build hierarki path
    const path = buildDirectoryPath(directoryId);
    setSelectedDirectoryPath(path);
  };

  const handleBreadcrumbClick = (id) => {
    console.log('Breadcrumb clicked:', id);
    if (id === null || id === 'home') {
      setCurrentPage('dashboard');
    } else if (id === 'arsip-digital') {
      setCurrentPage('dashboard');
    } else if (id === 'file-saya') {
      // Klik "File Saya" - unselect semua folder, tampilkan semua file
      setCurrentPage('documents');
      setSelectedDirectoryId(null);
      setSelectedDirectoryName('File Saya');
      setSelectedDirectoryPath([]);
    } else if (id === 'data-arsip') {
      setCurrentPage('documents');
      setSelectedDirectoryId(null);
      setSelectedDirectoryName('File Saya');
      setSelectedDirectoryPath([]);
    } else if (id === 'categories') {
      setCurrentPage('categories');
    } else if (id === 'search') {
      setCurrentPage('search');
    } else if (id === 'history') {
      setCurrentPage('history');
    } else if (id === 'access') {
      setCurrentPage('access');
    } else if (id === 'settings') {
      setCurrentPage('settings');
    } else if (id === 'profile') {
      setCurrentPage('profile');
    } else {
      // Klik folder di breadcrumb - navigate ke folder tersebut
      const found = directories.find((d) => d.id === id);
      if (found) {
        setSelectedDirectoryId(id);
        setSelectedDirectoryName(found.name);
        const path = buildDirectoryPath(id);
        setSelectedDirectoryPath(path);
      }
    }
  };

  const handleHomeClick = () => {
    setSelectedDirectoryId(null);
    setSelectedDirectoryName('File Saya');
  };

  const getBreadcrumbsForPage = (page) => {
    const base = [
      { id: null, name: 'home' },
      { id: 'arsip-digital', name: 'Arsip Digital' },
    ];
    
    switch (page) {
      case 'dashboard':
        return [...base, { id: 'dashboard', name: 'Dashboard' }];
      case 'documents': {
        // Build breadcrumb dengan hierarki folder
        const breadcrumb = [...base, { id: 'file-saya', name: 'File Saya' }];
        
        // Tambahkan path folder jika ada folder yang dipilih
        if (selectedDirectoryPath && selectedDirectoryPath.length > 0) {
          breadcrumb.push(...selectedDirectoryPath);
        }
        
        return breadcrumb;
      }
      case 'data-arsip':
        return [...base, { id: 'file-saya', name: 'File Saya' }, { id: 'data-arsip', name: 'Direktori Arsip' }];
      case 'categories':
        return [...base, { id: 'file-saya', name: 'File Saya' }, { id: 'categories', name: 'Kategori' }];
      case 'search':
        return [...base, { id: 'search', name: 'Pencarian Pintar' }];
      case 'history':
        return [...base, { id: 'history', name: 'Riwayat Aktivitas' }];
      case 'access':
        return [...base, { id: 'access', name: 'Hak Akses' }];
      case 'settings':
        return [...base, { id: 'settings', name: 'Pengaturan Sistem' }];
      default:
        return base;
    }
  };

  const breadcrumbPath = getBreadcrumbsForPage(currentPage);

  const filteredFiles = selectedDirectoryId
    ? files.filter((f) => f.directoryId === selectedDirectoryId)
    : files;

  if (isResetPassword) {
    console.log('Rendering RESET PASSWORD page');
    return <ResetPasswordPage supabase={supabase} />;
  }

  if (loading) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center">
        <div className="text-body-sm text-on-surface-variant">Memuat...</div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-surface-container-lowest border border-error/20 rounded-xl p-lg">
          <h2 className="font-title-sm text-error mb-sm">Gagal Memuat Aplikasi</h2>
          <p className="text-body-sm text-on-surface-variant mb-md">{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-lg py-sm bg-secondary text-on-secondary rounded-lg font-body-md hover:brightness-110 transition-all"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('Rendering login page');
    return <LoginPage onLogin={() => {}} supabase={supabase} />;
  }

  console.log('Rendering main app');
  
  // Tentukan breadcrumb berdasarkan halaman aktif
  const getCurrentBreadcrumbs = () => {
    switch(currentPage) {
      case 'dashboard':
        return [{ id: null, name: 'home' }, { id: 'arsip-digital', name: 'Arsip Digital' }, { id: 'dashboard', name: 'Dashboard' }];
      case 'data-arsip':
        return [{ id: null, name: 'home' }, { id: 'arsip-digital', name: 'Arsip Digital' }, { id: 'data-arsip', name: 'Direktori Arsip' }];
      case 'categories':
        return [{ id: null, name: 'home' }, { id: 'arsip-digital', name: 'Arsip Digital' }, { id: 'categories', name: 'Kategori' }];
      case 'search':
        return [{ id: null, name: 'home' }, { id: 'arsip-digital', name: 'Arsip Digital' }, { id: 'search', name: 'Pencarian Pintar' }];
      case 'history':
        return [{ id: null, name: 'home' }, { id: 'arsip-digital', name: 'Arsip Digital' }, { id: 'history', name: 'Riwayat Aktivitas' }];
      case 'access':
        return [{ id: null, name: 'home' }, { id: 'arsip-digital', name: 'Arsip Digital' }, { id: 'access', name: 'Hak Akses' }];
      case 'settings':
        return [{ id: null, name: 'home' }, { id: 'arsip-digital', name: 'Arsip Digital' }, { id: 'settings', name: 'Pengaturan Sistem' }];
      case 'profile':
        return [{ id: null, name: 'home' }, { id: 'arsip-digital', name: 'Arsip Digital' }, { id: 'profile', name: 'Profil' }];
      default:
        return breadcrumbPath;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar 
        onLogout={handleLogout} 
        user={user} 
        profile={profile} 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="ml-0 lg:ml-[230px] min-h-screen flex-1 flex flex-col">
        <Header 
          user={user} 
          profile={profile} 
          onLogout={handleLogout} 
          breadcrumbs={getCurrentBreadcrumbs()} 
          onNavigate={handleBreadcrumbClick}
          showSearch={currentPage === 'search'}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Cari dokumen berdasarkan nama, subjek, atau nomor surat..."
          supabase={supabase}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        
        {currentPage === 'dashboard' ? (
              <DashboardPage supabase={supabase} userId={user.id} user={user} profile={profile} categories={categories} onNavigate={setCurrentPage} renderHeader={false} />
            ) : currentPage === 'data-arsip' ? (
              <DataArsipPage supabase={supabase} userId={user.id} user={user} profile={profile} onBack={() => setCurrentPage('documents')} onOpenAdd={() => setShowAddModal(true)} onNavigate={setCurrentPage} categories={categories} renderHeader={false} />
            ) : currentPage === 'categories' ? (
              <CategoriesPage supabase={supabase} userId={user.id} user={user} profile={profile} onBack={() => setCurrentPage('documents')} onNavigate={setCurrentPage} onCategoryChange={handleCategoryChange} renderHeader={false} />
            ) : currentPage === 'search' ? (
              <PencarianPintarPage supabase={supabase} userId={user.id} user={user} profile={profile} onNavigate={setCurrentPage} renderHeader={false} searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} categories={categories} />
            ) : currentPage === 'history' ? (
              <RiwayatAktivitasPage supabase={supabase} userId={user.id} user={user} profile={profile} onNavigate={setCurrentPage} renderHeader={false} />
            ) : currentPage === 'access' ? (
              <HakAksesPage supabase={supabase} userId={user.id} user={user} profile={profile} onNavigate={setCurrentPage} renderHeader={false} />
            ) : currentPage === 'profile' ? (
              <ProfilePage supabase={supabase} userId={user.id} user={user} profile={profile} onNavigate={setCurrentPage} onProfileUpdate={handleProfileUpdate} renderHeader={false} />
            ) : currentPage === 'settings' ? (
              <PengaturanSistemPage supabase={supabase} userId={user.id} user={user} profile={profile} onNavigate={setCurrentPage} onCategoryChange={handleCategoryChange} onProfileUpdate={handleProfileUpdate} renderHeader={false} />
            ) : (
              // Access Guard for File Saya - Only Admin and Editor
              profile?.role === 'viewer' ? (
                <section className="p-lg flex-1 flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <span className="material-symbols-outlined text-6xl text-outline mb-md block">lock</span>
                    <h2 className="text-2xl font-bold text-primary mb-sm">Akses Terbatas</h2>
                    <p className="text-on-surface-variant mb-lg">
                      Halaman ini hanya dapat diakses oleh <span className="font-bold text-primary">Administrator</span> dan <span className="font-bold text-primary">Editor</span>.
                    </p>
                    <button 
                      onClick={() => setCurrentPage('dashboard')} 
                      className="px-lg py-sm bg-secondary text-on-secondary rounded-lg font-semibold hover:opacity-90 transition-all"
                    >
                      Kembali ke Dashboard
                    </button>
                  </div>
                </section>
              ) : (
              <section className="p-sm md:p-lg flex-1 flex flex-col min-h-screen">
                  <div className="flex flex-col lg:grid lg:grid-cols-12 gap-lg flex-1">
                    {/* Directory Tree - Hidden on mobile, sidebar on desktop */}
                    <DirectoryTree
                      categories={directories}
                      selectedCategoryId={selectedDirectoryId}
                      onSelect={handleSelectDirectory}
                      onAdd={addDirectory}
                      onUpdate={updateDirectory}
                      onDelete={deleteDirectory}
                      error={error}
                      setError={setError}
                      files={files}
                    />
                    
                    {/* Main Content - Full width on mobile, 9 cols on desktop */}
                    <div className="w-full lg:col-span-9 flex flex-col gap-lg">
                      <FileTable
                        files={filteredFiles}
                        title={selectedDirectoryName}
                        onOpenAdd={() => setShowAddModal(true)}
                        supabase={supabase}
                        onEdit={(file) => setEditDoc(file)}
                        onRefresh={refreshDocuments}
                        onPreview={handleOpenFile}
                        onConfirmDelete={(file, onConfirm) => {
                          showAlert(
                            'confirm',
                            'Konfirmasi Hapus',
                            `Apakah Anda yakin ingin menghapus "${file.fileName}"?`,
                            onConfirm,
                            true
                          );
                        }}
                        onDeleteFile={async (file) => {
                          try {
                            // Get user profile for notification
                            const { data: userProfile } = await supabase
                              .from('profiles')
                              .select('full_name')
                              .eq('id', user.id)
                              .single();

                            const deleterName = userProfile?.full_name || 'User';

                            // Get document subject before deleting
                            const { data: docData } = await supabase
                              .from('documents')
                              .select('subject')
                              .eq('id', file.id)
                              .single();

                            const docSubject = docData?.subject || file.fileName || 'Dokumen';

                            const { error } = await supabase
                              .from('documents')
                              .delete()
                              .eq('id', file.id);
                            
                            if (error) throw error;

                            // Send notification based on document status
                            if (file.status === 'PUBLISHED') {
                              // If PUBLISHED document, notify only ADMIN (NOT editor or viewer)
                              await notifyAllUsersExcept(
                                supabase,
                                user.id,
                                'delete',
                                'Dokumen Publik Dihapus',
                                `${deleterName} menghapus dokumen publik "${docSubject}"`,
                                ['admin']
                              );
                              console.log('Delete notification sent to admin only (PUBLISHED document)');
                            }
                            // If DRAFT or PRIVATE, no notification (internal document)
                            
                            showAlert('success', 'Berhasil', 'Dokumen berhasil dihapus');
                            
                            // Hapus dari recent previews localStorage
                            removeFromRecentPreviews(file.id);
                          } catch (err) {
                            console.error('Gagal menghapus dokumen:', err);
                            showAlert('error', 'Gagal Menghapus', 'Gagal menghapus dokumen: ' + (err.message || 'Unknown error'));
                            throw err; // Re-throw untuk error handling di FileTable
                          }
                        }}
                      />
                      <QuickPreview previews={recentPreviews} title="Preview Terakhir Dibuka" onOpenFile={handleOpenFile} supabase={supabase} />
                    </div>
                  </div>
                </section>
              )
            )}
      </div>
      {showAddModal && (
        <AddDocumentModal
          categories={categories}
          directories={directories}
          userId={user.id}
          currentDirectoryId={selectedDirectoryId}
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            refreshDocuments();
            showAlert('success', 'Berhasil', 'Dokumen berhasil ditambahkan');
          }}
        />
      )}
      {editDoc && (
        <EditDocumentModal
          supabase={supabase}
          doc={editDoc}
          categories={categories}
          userId={user.id}
          onClose={() => setEditDoc(null)}
          onSaved={refreshDocuments}
        />
      )}
      {previewFile && (
        <FilePreviewModal 
          preview={previewFile} 
          supabase={supabase} 
          onClose={() => setPreviewFile(null)}
          onEdit={(file) => {
            // Cari file lengkap dari list files untuk edit
            const fullFile = files.find(f => f.id === file.id);
            if (fullFile) {
              setEditDoc(fullFile);
            }
          }}
          onConfirmDelete={(file, onConfirm) => {
            showAlert(
              'confirm',
              'Konfirmasi Hapus',
              `Apakah Anda yakin ingin menghapus "${file.name}"?`,
              onConfirm,
              true
            );
          }}
          onDelete={async (file) => {
            try {
              const { error } = await supabase
                .from('documents')
                .delete()
                .eq('id', file.id);
              
              if (error) throw error;
              
              showAlert('success', 'Berhasil', 'Dokumen berhasil dihapus');
              
              // Hapus dari recent previews localStorage
              removeFromRecentPreviews(file.id);
              
              await refreshDocuments();
            } catch (err) {
              console.error('Gagal menghapus dokumen:', err);
              showAlert('error', 'Gagal Menghapus', 'Gagal menghapus dokumen: ' + (err.message || 'Unknown error'));
            }
          }}
        />
      )}
      
      {/* Modern Alert Component */}
      <ModernAlert
        show={alert.show}
        onClose={closeAlert}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onConfirm={alert.onConfirm}
        showCancel={alert.showCancel}
      />
    </div>
  );
}

function buildTree(items) {
  const map = new Map();
  const roots = [];

  for (const item of items) {
    map.set(item.id, { ...item, children: [] });
  }

  for (const item of items) {
    const node = map.get(item.id);
    if (item.parent_id && map.has(item.parent_id)) {
      map.get(item.parent_id).children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function DirectoryTree({ categories, selectedCategoryId, onSelect, onAdd, onUpdate, onDelete, error, setError, files }) {
  const tree = buildTree(categories);
  const [isExpanded, setIsExpanded] = useState(false); // Collapsed by default on mobile

  const documentDirectoryIds = new Set((files || []).map((f) => f.directoryId).filter(Boolean));

  return (
    <div className="w-full lg:col-span-3 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
      {/* Header with Toggle Button - Only visible on mobile */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="lg:hidden w-full flex items-center justify-between px-md py-md hover:bg-surface-container transition-colors"
      >
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-on-surface-variant">
            folder_open
          </span>
          <h3 className="font-label-caps text-on-surface-variant">Struktur Direktori</h3>
        </div>
        <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {/* Desktop Header - Always visible */}
      <div className="hidden lg:block px-sm py-md border-b border-outline-variant">
        <h3 className="font-label-caps text-on-surface-variant mb-xs" style={{ paddingLeft: '8px' }}>Struktur Direktori</h3>
      </div>

      {/* Collapsible Content */}
      <div className={`
        flex flex-col gap-sm px-sm py-md overflow-y-auto scrollbar-hide
        lg:flex
        ${isExpanded ? 'flex' : 'hidden'}
      `}>
        {error && (
          <div className="bg-error-container/30 border border-error/20 text-error px-sm py-sm rounded-lg text-body-sm">
            {error}
          </div>
        )}
        <div className="flex flex-col">
        {tree.length === 0 && (
          <p className="text-body-sm text-on-surface-variant px-sm">Belum ada folder.</p>
        )}
        {tree.map((node) => (
          <FolderNode
            key={node.id}
            node={node}
            selectedCategoryId={selectedCategoryId}
            onSelect={onSelect}
            onAdd={onAdd}
            onUpdate={onUpdate}
            onDelete={onDelete}
            setError={setError}
            documentDirectoryIds={documentDirectoryIds}
          />
        ))}
        <button
          onClick={() => onAdd('Folder Baru', null)}
          className="mt-sm flex items-center gap-sm py-sm rounded text-body-sm text-secondary hover:bg-surface-container-low transition-colors"
          style={{ paddingLeft: '8px' }}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Folder
        </button>
      </div>
      </div>
    </div>
  );
}

function FolderNode({ node, selectedCategoryId, onSelect, onAdd, onUpdate, onDelete, setError, documentDirectoryIds, depth = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState(node.name);

  const isSelected = selectedCategoryId === node.id;
  const hasDocuments = documentDirectoryIds.has(node.id);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Nama folder tidak boleh kosong');
      return;
    }
    await onUpdate(node.id, name.trim());
    setEditing(false);
    setError('');
  };

  const handleAdd = async (childName) => {
    setAdding(false);
    await onAdd(childName, node.id);
  };

  const handleDelete = async () => {
    await onDelete(node.id);
  };

  const handleDoubleClick = () => {
    if (!isSelected) {
      onSelect?.(node.id, node.name);
    }
    setEditing(true);
  };

  return (
    <div>
      <div
        className={`group flex items-center gap-sm px-sm py-sm rounded cursor-pointer transition-colors ${isSelected ? 'bg-secondary-container/20 text-on-secondary-container' : 'hover:bg-surface-container-low'}`}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        onClick={() => onSelect?.(node.id, node.name)}
        onDoubleClick={handleDoubleClick}
      >
        {node.children && node.children.length > 0 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="flex items-center justify-center w-4 h-4"
          >
            <span className="material-symbols-outlined text-outline text-[14px] transition-transform">
              {expanded ? 'expand_more' : 'chevron_right'}
            </span>
          </button>
        ) : (
          <span className="w-4 h-4 inline-block" />
        )}
        <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1", fontSize: '20px' }}>
          folder
        </span>
        {editing ? (
          <div className="flex items-center gap-xs flex-1" onClick={(e) => e.stopPropagation()}>
            <input
              className="flex-1 border border-outline-variant rounded px-xs py-xs text-[13px] outline-none focus:border-secondary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') {
                  setName(node.name);
                  setEditing(false);
                }
              }}
              autoFocus
            />
            <button onClick={handleSave} className="text-secondary text-[16px]">
              <span className="material-symbols-outlined">check</span>
            </button>
            <button
              onClick={() => {
                setName(node.name);
                setEditing(false);
              }}
              className="text-outline text-[16px]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        ) : (
          <>
            <span className="text-[13px] flex-1 truncate">{node.name}</span>
            <div className="flex items-center gap-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setAdding(true)}
                title="Tambah subfolder"
                className="text-outline hover:text-secondary transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>create_new_folder</span>
              </button>
              {!hasDocuments && (
                <button
                  onClick={handleDelete}
                  title="Hapus"
                  className="text-outline hover:text-error transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>delete</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
      {adding && (
        <div className="flex items-center gap-xs px-sm py-xs" style={{ paddingLeft: `${(depth + 1) * 20 + 32}px` }}>
          <input
            className="flex-1 border border-outline-variant rounded px-xs py-xs text-body-sm outline-none focus:border-secondary"
            placeholder="Nama folder..."
            autoFocus
            onBlur={(e) => {
              if (e.target.value.trim()) handleAdd(e.target.value.trim());
              setAdding(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) handleAdd(e.target.value.trim());
              if (e.key === 'Escape') setAdding(false);
            }}
          />
        </div>
      )}
      {expanded && node.children && node.children.length > 0 && (
        <div>
          {node.children.map((child) => (
            <FolderNode
              key={child.id}
              node={child}
              selectedCategoryId={selectedCategoryId}
              onSelect={onSelect}
              onAdd={onAdd}
              onUpdate={onUpdate}
              onDelete={onDelete}
              setError={setError}
              documentDirectoryIds={documentDirectoryIds}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
