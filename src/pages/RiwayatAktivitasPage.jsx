import { useState, useEffect } from 'react';
import Header from '../components/Header';

const ACTIVITY_TYPES = ['Semua Aktivitas', 'Unggah Dokumen', 'Hapus File', 'Keamanan'];
const USERS_OPTIONS = ['Semua Pengguna'];

const ACTIVITY_ICON_MAP = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  CREATE: 'add_circle',
  UPLOAD: 'upload_file',
  DOWNLOAD: 'download',
  VIEW: 'visibility',
  DELETE: 'delete',
  UPDATE: 'edit',
  SECURITY: 'security',
  ACCESS: 'admin_panel_settings',
};

const ACTIVITY_COLOR_MAP = {
  LOGIN: 'bg-secondary/10 text-secondary',
  LOGOUT: 'bg-surface-container-high text-on-surface-variant',
  CREATE: 'bg-secondary-fixed-dim/20 text-on-secondary-fixed-variant',
  UPLOAD: 'bg-secondary/10 text-secondary',
  DOWNLOAD: 'bg-surface-container-high text-on-surface-variant',
  VIEW: 'bg-surface-container-high text-on-surface-variant',
  DELETE: 'bg-error/10 text-error',
  UPDATE: 'bg-surface-container-high text-on-surface-variant',
  SECURITY: 'bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant',
  ACCESS: 'bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant',
};

const ACTION_LABEL_MAP = {
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  CREATE: 'Tambah Arsip',
  UPLOAD: 'Unggah Dokumen',
  DOWNLOAD: 'Unduh Dokumen',
  VIEW: 'Melihat Dokumen',
  DELETE: 'Hapus',
  UPDATE: 'Ubah Metadata',
  SECURITY: 'Peringatan Keamanan',
  ACCESS: 'Ubah Hak Akses',
};

export default function RiwayatAktivitasPage({ supabase, userId, user, profile, onNavigate, renderHeader = true }) {
  const [activityType, setActivityType] = useState('Semua Aktivitas');
  const [activityTypeRaw, setActivityTypeRaw] = useState('');
  const [userFilter, setUserFilter] = useState('Semua Pengguna');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activities, setActivities] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [userOptions, setUserOptions] = useState(USERS_OPTIONS);
  const [activityOptions, setActivityOptions] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [loadingExport, setLoadingExport] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const itemsPerPage = 10;

  // Load reviewed activities from database when userId is available
  useEffect(() => {
    const loadReviewedActivities = async () => {
      if (!userId) {
        console.log('No userId, skipping load of reviewed activities');
        return;
      }
      
      console.log('Loading reviewed activities for user:', userId);
      
      try {
        const { data, error } = await supabase
          .from('activity_reviews')
          .select('activity_id')
          .eq('user_id', userId);
        
        if (error) {
          console.error('Database error loading reviews:', error);
          alert(`Gagal memuat data tinjauan: ${error.message}\n\nPastikan tabel 'activity_reviews' sudah dibuat di database.`);
          return;
        }
        
        if (data) {
          console.log('Raw data from database:', data);
          // Convert activity_id from string to number if needed
          const reviewedSet = new Set(data.map(item => {
            const id = item.activity_id;
            // Try to parse as integer if it's a numeric string
            return isNaN(id) ? id : parseInt(id);
          }));
          setReviewedIds(reviewedSet);
          console.log('Loaded reviewed activities from database:', [...reviewedSet]);
        } else {
          console.log('No reviewed activities found');
        }
      } catch (err) {
        console.error('Exception loading reviewed activities:', err);
        alert(`Error: ${err.message}`);
      }
    };
    
    loadReviewedActivities();
  }, [userId, supabase]);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!userId) return;
      // Fetch ALL activities from all users (removed user_id filter)
      let query = supabase
        .from('audit_logs')
        .select('*')
        .not('action', 'in', '("LOGIN","LOGOUT")') // Exclude LOGIN and LOGOUT dari riwayat
        .order('created_at', { ascending: false });

      if (activityTypeRaw) {
        query = query.eq('action', activityTypeRaw);
      }

      if (dateStart) {
        query = query.gte('created_at', dateStart);
      }

      if (dateEnd) {
        const endDateTime = new Date(dateEnd);
        endDateTime.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endDateTime.toISOString());
      }

      const { data } = await query;

      if (data) {
        const mapped = data.map((row) => {
          const metadata = row.metadata || {};
          const detailForRow = row.action === 'UPDATE'
            ? (metadata.detail || metadata.file_name || '-')
            : (metadata.file_name || metadata.detail || '-');

          return {
            id: row.id,
            time: row.created_at ? new Date(row.created_at).toLocaleString('id-ID') : '-',
            rawTime: row.created_at || null,
            user_id: row.user_id,
            type: ACTION_LABEL_MAP[row.action] || row.action,
            action: row.action,
            detail: detailForRow,
            ip: metadata.ip || '-',
            typeColor: ACTIVITY_COLOR_MAP[row.action] || 'bg-surface-container-high text-on-surface-variant',
            icon: ACTIVITY_ICON_MAP[row.action] || 'info',
            avatar: metadata.avatar || '',
          };
        });
        setActivities(mapped);
      }
    };

    const fetchProfiles = async () => {
      const { data } = await supabase.from('profiles').select('id, full_name, role');
      if (data) {
        const map = {};
        const names = ['Semua Pengguna'];
        data.forEach((p) => {
          map[p.id] = { name: p.full_name, role: p.role || 'user' };
          if (p.full_name) names.push(p.full_name);
        });
        setProfiles(map);
        setUserOptions(names);
        if (userId && map[userId]) {
          setCurrentProfile(map[userId]);
        }
      }
    };

    const fetchActivityOptions = async () => {
      // Fetch activity options from ALL users (removed user_id filter)
      const { data } = await supabase
        .from('audit_logs')
        .select('action');

      if (data) {
        const uniqueActions = [...new Set(data.map((row) => row.action).filter(Boolean))];
        const sorted = uniqueActions.sort((a, b) => {
          return (ACTION_LABEL_MAP[a] || a).localeCompare(ACTION_LABEL_MAP[b] || b);
        });
        setActivityOptions(sorted);
      }
    };

    fetchLogs();
    fetchProfiles();
    fetchActivityOptions();
  }, [supabase, userId, activityTypeRaw, dateStart, dateEnd]);

  const filtered = activities.filter((a) => {
    const profile = profiles[a.user_id] || {};
    const displayName = profile.name || a.user_id;
    const matchType = !activityTypeRaw || a.type === activityType;
    const matchUser = userFilter === 'Semua Pengguna' || displayName === userFilter;
    const matchDate = (() => {
      if (!dateStart && !dateEnd) return true;
      const activityDate = new Date(a.rawTime);
      if (isNaN(activityDate.getTime())) return true;

      if (dateStart && activityDate < new Date(dateStart)) return false;
      if (dateEnd) {
        const endDateTime = new Date(dateEnd);
        endDateTime.setHours(23, 59, 59, 999);
        if (activityDate > endDateTime) return false;
      }
      return true;
    })();
    const matchSearch = !searchQuery || a.detail.toLowerCase().includes(searchQuery.toLowerCase()) || displayName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchUser && matchDate && matchSearch;
  });

  const handleReset = () => {
    setActivityType('Semua Aktivitas');
    setActivityTypeRaw('');
    setUserFilter('Semua Pengguna');
    setDateStart('');
    setDateEnd('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activityTypeRaw, userFilter, dateStart, dateEnd, searchQuery]);

  // Calculate today's activities
  const getTodayActivities = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return activities.filter((activity) => {
      if (!activity.rawTime) return false;
      const activityDate = new Date(activity.rawTime);
      return activityDate >= today && activityDate < tomorrow;
    }).length;
  };

  const todayActivitiesCount = getTodayActivities();

  // Calculate security warnings count (exclude reviewed ones)
  const securityWarningsCount = filtered.filter((a) => 
    (a.action === 'SECURITY' || a.action === 'DELETE') && !reviewedIds.has(a.id)
  ).length;

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filtered.slice(startIndex, endIndex);

  // Generate page numbers (show up to 5 page numbers)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handleExport = async (type) => {
    setLoadingExport(type);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoadingExport(null);
  };

  const handleReview = async (activityId) => {
    console.log('Starting review process for activity:', activityId);
    console.log('Current userId:', userId);
    
    setReviewingId(activityId);
    
    // Save to database
    if (userId) {
      try {
        console.log('Attempting to insert review into database...');
        const { data, error } = await supabase
          .from('activity_reviews')
          .insert({
            user_id: userId,
            activity_id: activityId.toString(), // Convert to string to handle both int and uuid
            reviewed_at: new Date().toISOString()
          })
          .select();
        
        if (error) {
          console.error('Database error details:', error);
          alert(`Gagal menyimpan tinjauan: ${error.message}`);
          // If error, still update UI but log the error
        } else {
          console.log('Review saved to database successfully:', data);
        }
      } catch (err) {
        console.error('Exception while saving review:', err);
        alert(`Error: ${err.message}`);
      }
    } else {
      console.error('No userId available!');
      alert('User ID tidak tersedia');
    }
    
    // Update local state
    setReviewedIds(prev => {
      const newSet = new Set([...prev, activityId]);
      console.log('Updated reviewedIds state:', [...newSet]);
      return newSet;
    });
    
    // Show checkmark animation for 800ms before closing
    setTimeout(() => {
      setReviewingId(null);
      setOpenMenuId(null);
    }, 800);
  };

  const toggleMenu = (activityId) => {
    setOpenMenuId(openMenuId === activityId ? null : activityId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId !== null) {
        // Check if click is outside the menu
        const menu = document.getElementById(`menu-${openMenuId}`);
        const button = document.getElementById(`menu-button-${openMenuId}`);
        
        if (menu && button && !menu.contains(event.target) && !button.contains(event.target)) {
          setOpenMenuId(null);
        }
      }
    };

    if (openMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

   return (
    <div className="min-h-screen w-full min-w-0">
      <div className={renderHeader ? "ml-0 lg:ml-[230px] flex flex-col min-h-screen lg:w-[calc(100%-230px)]" : "flex flex-col min-h-screen"} style={{ width: '100%', minWidth: 0 }}>
        {renderHeader && <Header user={user} profile={currentProfile} onLogout={() => {}} breadcrumbs={[{ id: null, name: 'home' }, { id: 'arsip-digital', name: 'Arsip Digital' }, { id: 'history', name: 'Riwayat Aktivitas' }]} onNavigate={onNavigate} supabase={supabase} />}

        {/* Access Guard - Only Admin */}
        {profile?.role !== 'admin' ? (
          <div className="flex-1 overflow-auto flex items-center justify-center">
            <div className="text-center max-w-md p-lg">
              <span className="material-symbols-outlined text-6xl text-outline mb-md block">lock</span>
              <h2 className="text-2xl font-bold text-primary mb-sm">Akses Terbatas</h2>
              <p className="text-on-surface-variant mb-lg">
                Halaman ini hanya dapat diakses oleh <span className="font-bold text-primary">Administrator</span>.
              </p>
              <button 
                onClick={() => onNavigate?.('dashboard')} 
                className="px-lg py-sm bg-secondary text-on-secondary rounded-lg font-semibold hover:opacity-90 transition-all"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        ) : (
        <div className="flex-1 overflow-auto">
          <div className="space-y-sm mt-3">
            <section className="space-y-md px-sm sm:px-md lg:px-[25px] max-w-full">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-md">
                <div>
                  <h2 className="font-headline-md text-xl text-on-surface">Riwayat Aktivitas</h2>
                  <p className="text-[13px] text-on-surface-variant mb-md">Pantau jejak digital dan log keamanan sistem secara real-time.</p>
                </div>
                {/* Hidden export buttons
                <div className="flex gap-sm">
                  <button onClick={() => handleExport('pdf')} disabled={loadingExport === 'pdf'} className="flex items-center gap-xs px-md py-sm border border-outline-variant rounded-lg bg-surface hover:bg-surface-container transition-all text-body-sm font-semibold disabled:opacity-50">
                    <span className="material-symbols-outlined text-[16px]">{loadingExport === 'pdf' ? 'sync' : 'picture_as_pdf'}</span>
                    {loadingExport === 'pdf' ? 'Memproses...' : 'Cetak PDF'}
                  </button>
                  <button onClick={() => handleExport('excel')} disabled={loadingExport === 'excel'} className="flex items-center gap-xs px-md py-sm border border-outline-variant rounded-lg bg-surface hover:bg-surface-container transition-all text-body-sm font-semibold disabled:opacity-50">
                    <span className="material-symbols-outlined text-[16px]">{loadingExport === 'excel' ? 'sync' : 'download'}</span>
                    {loadingExport === 'excel' ? 'Memproses...' : 'Export Excel'}
                  </button>
                </div>
                */}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md mb-md">
                <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm flex items-center justify-between min-w-0 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-default">
                  <div className="min-w-0 flex-1">
                    <div>
                      <p className="text-label-caps text-on-surface-variant">Total Aktivitas Hari Ini</p>
                      <h3 className="text-display-lg font-bold text-primary">{todayActivitiesCount}</h3>
                      <p className="text-[12px] text-secondary flex items-center gap-xs mt-xs">
                        <span className="material-symbols-outlined text-[14px]">trending_up</span>
                        Menampilkan data nyata
                      </p>
                    </div>
                  </div>
                  <div className="bg-secondary-container p-md rounded-full text-secondary shrink-0">
                    <span className="material-symbols-outlined text-3xl">insights</span>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm flex items-center justify-between min-w-0 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-default">
                  <div className="min-w-0 flex-1">
                    <div>
                      <p className="text-label-caps text-on-surface-variant">Peringatan Keamanan</p>
                      <h3 className="text-display-lg font-bold text-error">{securityWarningsCount}</h3>
                      <p className="text-[12px] text-error flex items-center gap-xs mt-xs">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        Butuh perhatian segera
                      </p>
                    </div>
                  </div>
                  <div className="bg-error-container p-md rounded-full text-error shrink-0">
                    <span className="material-symbols-outlined text-3xl">gpp_maybe</span>
                  </div>
                </div>
                <div className="bg-primary-container p-lg rounded-xl shadow-sm flex items-center justify-between relative overflow-hidden min-w-0 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-default">
                  <div className="min-w-0 flex-1 relative z-10">
                    <p className="text-label-caps text-primary-fixed opacity-70">Status Database Log</p>
                    <h3 className="text-display-lg font-bold text-primary-fixed">Optimal</h3>
                    <p className="text-[12px] text-primary-fixed opacity-90 mt-xs">Pembersihan berkala: 2 Hari lagi</p>
                  </div>
                  <div className="bg-on-primary-fixed-variant p-md rounded-full text-primary-fixed relative z-10">
                    <span className="material-symbols-outlined text-3xl">database</span>
                  </div>
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white opacity-5 rounded-full scale-150"></div>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-sm sm:p-md rounded-xl border border-outline-variant flex flex-col sm:flex-row flex-wrap gap-sm sm:gap-md items-stretch sm:items-end mb-md">
                <div className="flex-1 min-w-full sm:min-w-[200px]">
                  <label className="text-label-caps block mb-xs text-on-surface-variant">Rentang Waktu</label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-xs sm:gap-sm">
                    <input value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-sm sm:px-md py-xs text-body-sm focus:ring-secondary focus:border-secondary" type="date" />
                    <span className="text-on-surface-variant text-body-sm text-center sm:text-left">s/d</span>
                    <input value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-sm sm:px-md py-xs text-body-sm focus:ring-secondary focus:border-secondary" type="date" />
                  </div>
                </div>
                <div className="w-full sm:w-[200px]">
                  <label className="text-label-caps block mb-xs text-on-surface-variant">Jenis Aktivitas</label>
                  <select value={activityTypeRaw} onChange={(e) => { setActivityTypeRaw(e.target.value); setActivityType(ACTION_LABEL_MAP[e.target.value] || e.target.value || 'Semua Aktivitas'); }} className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-sm sm:px-md py-xs text-body-sm focus:ring-secondary focus:border-secondary">
                    <option value="">Semua Aktivitas</option>
                    {activityOptions.map((t) => (<option key={t} value={t}>{ACTION_LABEL_MAP[t] || t}</option>))}
                  </select>
                </div>
                <div className="w-full sm:w-[200px]">
                  <label className="text-label-caps block mb-xs text-on-surface-variant">Pengguna</label>
                  <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-sm sm:px-md py-xs text-body-sm focus:ring-secondary focus:border-secondary">
                    {userOptions.map((u) => (<option key={u}>{u}</option>))}
                  </select>
                </div>
                <button onClick={handleReset} className="w-full sm:w-auto px-md py-2 text-on-surface-variant border border-outline-variant rounded-lg text-body-sm hover:bg-surface-container transition-colors">
                  Reset
                </button>
              </div>
            </section>

            <div className="w-full overflow-x-auto px-sm sm:px-md lg:px-[25px]">
              <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden min-w-fit">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead className="bg-surface-container text-label-caps text-on-surface-variant border-b border-outline-variant">
                    <tr>
                      <th className="px-lg py-md font-semibold w-[180px]">Waktu</th>
                      <th className="px-lg py-md font-semibold w-[200px]">Pengguna</th>
                      <th className="px-lg py-md font-semibold w-[150px]">Aktivitas</th>
                      <th className="px-lg py-md font-semibold">Detail</th>
                      <th className="px-lg py-md font-semibold w-[140px]">IP Address</th>
                      <th className="px-lg py-md font-semibold text-right w-[80px]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-lg py-sm text-center text-body-sm text-on-surface-variant">Tidak ada aktivitas.</td>
                      </tr>
                    ) : (
                      paginatedData.map((row) => {
                        const profile = profiles[row.user_id] || {};
                        const displayName = profile.name || row.user_id;
                        const initials = displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
                        return (
                          <tr key={row.id} className="table-row-hover transition-colors">
                            <td className="px-lg py-sm text-table-data text-on-surface-variant">{row.time}</td>
                            <td className="px-lg py-sm">
                              <div className="flex items-center gap-sm">
                                {row.avatar || profile.avatar ? (
                                  <img className="w-8 h-8 rounded-full border border-outline-variant object-cover" src={row.avatar || profile.avatar} alt={displayName} />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant text-xs font-bold">
                                    {initials}
                                  </div>
                                )}
                                <span className="text-table-data font-semibold text-on-surface">{displayName}</span>
                              </div>
                            </td>
                            <td className="px-lg py-sm">
                              <span className={`px-sm py-xs ${row.typeColor} rounded text-[12px] font-bold inline-flex items-center gap-xs`}>
                                <span className="material-symbols-outlined text-[12px]">{row.icon}</span>
                                {row.type}
                              </span>
                            </td>
                            <td className="px-lg py-sm text-table-data text-on-surface">
                              <div className="flex items-start gap-xs max-w-[250px]">
                                <span className="break-words">{row.detail}</span>
                                {reviewedIds.has(row.id) && (
                                  <span className="material-symbols-outlined text-[14px] text-[#4CAF50] drop-shadow-md flex-shrink-0 mt-0.5">check</span>
                                )}
                              </div>
                            </td>
                            <td className="px-lg py-sm text-table-data font-mono text-on-surface-variant">{row.ip}</td>
                            <td className="px-lg py-sm text-right relative">
                              <button 
                                id={`menu-button-${row.id}`}
                                onClick={() => toggleMenu(row.id)}
                                className="text-on-surface-variant hover:text-secondary transition-all"
                              >
                                <span className="material-symbols-outlined">more_vert</span>
                              </button>
                              {openMenuId === row.id && (
                                <div 
                                  id={`menu-${row.id}`}
                                  className="absolute right-10 top-10 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50"
                                >
                                  {reviewedIds.has(row.id) ? (
                                    <div className="w-full px-md py-1 text-[14px] font-bold text-[#4CAF50] text-center whitespace-nowrap">
                                      <span>Telah ditinjau</span>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleReview(row.id)}
                                      className="w-full px-md py-1 text-[14px] font-bold text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-start gap-xs whitespace-nowrap"
                                    >
                                      <span>Tinjau</span>
                                      {reviewingId === row.id && (
                                        <span className="material-symbols-outlined text-[16px] text-[#4CAF50] animate-pulse ml-auto">check</span>
                                      )}
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-lg py-md border-t border-outline-variant flex items-center justify-between">
                <p className="text-body-sm text-on-surface-variant">
                  Menampilkan {filtered.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filtered.length)} dari {filtered.length} aktivitas
                </p>
                <div className="flex items-center gap-xs">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded hover:bg-surface-container transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  
                  {getPageNumbers().map((pageNum, idx) => (
                    pageNum === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-xs text-on-surface-variant">...</span>
                    ) : (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 flex items-center justify-center rounded font-bold text-xs transition-all ${
                          currentPage === pageNum
                            ? 'bg-secondary text-on-secondary'
                            : 'border border-outline-variant hover:bg-surface-container'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  ))}
                  
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded hover:bg-surface-container transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
              </section>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
