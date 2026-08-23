import { useState, useEffect, useRef } from 'react';
import CompactAlert from './CompactAlert';
import { initializePushNotifications, sendPushNotification, setupNotificationListeners } from '../utils/pushNotifications';
import { downloadAndInstallAPK } from '../utils/apkDownloader';

export default function Header({ user, profile, onLogout, breadcrumbs = [], onNavigate, showSearch = false, searchValue = '', onSearchChange, searchPlaceholder = 'Cari dokumen...', supabase, onMenuClick }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPlatformMenu, setShowPlatformMenu] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ show: false, title: '', message: '', icon: '' });
  const notifRef = useRef(null);
  const platformMenuRef = useRef(null);

  // Force icon size untuk mobile dengan !important
  const getIconStyle = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    return {
      fontSize: isMobile ? '18px !important' : '24px !important',
      width: isMobile ? '18px !important' : '24px !important',
      height: isMobile ? '18px !important' : '24px !important',
      lineHeight: '1',
      display: 'block',
    };
  };

  // Helper function to get display name for role
  const getRoleDisplayName = (role) => {
    const roleMap = {
      'super_admin': 'Super Admin',
      'admin': 'Admin',
      'editor': 'Editor',
      'viewer': 'Viewer'
    };
    return roleMap[role] || 'User';
  };

  // Initialize push notifications on mount
  useEffect(() => {
    const setupPush = async () => {
      const initialized = await initializePushNotifications();
      if (initialized) {
        console.log('✅ Push notifications initialized');
        
        // Setup listener for notification taps
        setupNotificationListeners((notification) => {
          console.log('User tapped notification:', notification);
          // Mark as read when tapped
          if (notification.id) {
            markAsRead(notification.id);
          }
          // Open notifications panel
          setShowNotifications(true);
        });
      }
    };

    setupPush();
  }, []);

  // Fetch notifications from database
  useEffect(() => {
    if (!user || !supabase) return;

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching notifications:', error);
        } else {
          setNotifications(data || []);
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('notifications_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Notification change:', payload);
          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new;
            setNotifications((prev) => [newNotification, ...prev].slice(0, 10));
            
            // 🔔 Send push notification to device
            sendPushNotification(newNotification);
          } else if (payload.eventType === 'UPDATE') {
            setNotifications((prev) =>
              prev.map((n) => (n.id === payload.new.id ? payload.new : n))
            );
          } else if (payload.eventType === 'DELETE') {
            setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (platformMenuRef.current && !platformMenuRef.current.contains(event.target)) {
        setShowPlatformMenu(false);
      }
    };

    if (showNotifications || showPlatformMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showPlatformMenu]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
      } else {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
        );
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!supabase || !user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
      } else {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  // Get icon and color based on notification type
  const getNotificationStyle = (type) => {
    const styles = {
      upload: { icon: '📤', emoji: '📤', color: 'text-secondary', bg: 'bg-green-600' },
      security: { icon: '⚠️', emoji: '⚠️', color: 'text-error', bg: 'bg-red-600' },
      share: { icon: '🔗', emoji: '🔗', color: 'text-tertiary', bg: 'bg-purple-600' },
      system: { icon: '🔄', emoji: '🔄', color: 'text-primary', bg: 'bg-blue-600' },
      approval: { icon: '✅', emoji: '✅', color: 'text-secondary', bg: 'bg-green-600' },
      delete: { icon: '🗑️', emoji: '🗑️', color: 'text-error', bg: 'bg-red-600' },
      edit: { icon: '✏️', emoji: '✏️', color: 'text-tertiary', bg: 'bg-purple-600' },
      access: { icon: '🛡️', emoji: '🛡️', color: 'text-primary', bg: 'bg-blue-600' },
    };
    return styles[type] || { icon: '🔔', emoji: '🔔', color: 'text-on-surface-variant', bg: 'bg-gray-600' };
  };

  // Format time ago
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
    return time.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Handle APK download
  const handleDownloadAPK = async () => {
    try {
      // Check if running on native Android app
      const isNativeAndroid = window.Capacitor && window.Capacitor.getPlatform() === 'android';
      
      // JANGAN tutup modal dulu - biarkan terbuka untuk melihat progress
      // setShowPlatformMenu(false);
      
      // TODO: Replace with actual APK URL from your server
      const apkUrl = 'https://axpanhequppcviaimwte.supabase.co/storage/v1/object/public/apk-files/rendatin-arsip-v.1.0.0.apk';
      
      // Check if URL is still placeholder
      if (apkUrl.includes('your-server.com')) {
        setShowPlatformMenu(false); // Tutup modal jika error
        setAlertConfig({
          show: true,
          title: 'APK URL Belum Dikonfigurasi',
          message: 'Silakan upload APK ke server dan update URL di code.\n\nBaca APK-DOWNLOAD-SETUP.md untuk instruksi lengkap.',
          icon: '⚠️'
        });
        return;
      }
      
      if (isNativeAndroid) {
        // Native Android app - simple browser download
        window.open(apkUrl, '_blank');
        setTimeout(() => {
          setShowPlatformMenu(false); // Tutup modal setelah open link
          setAlertConfig({
            show: true,
            title: 'Download Dimulai',
            message: 'Setelah download selesai, buka file APK dari folder Downloads untuk install.',
            icon: '📥'
          });
        }, 500);
      } else {
        // Browser - download with progress bar
        setIsDownloading(true);
        setDownloadProgress(0);
        
        await downloadAPKWithProgress(apkUrl, (progress) => {
          setDownloadProgress(progress);
        });
        
        // Download selesai - tutup modal dan tampilkan alert
        setShowPlatformMenu(false);
        setAlertConfig({
          show: true,
          title: 'Download Selesai',
          message: 'Buka file APK dari folder Downloads untuk install.',
          icon: '✅'
        });
      }
    } catch (error) {
      console.error('Failed to download APK:', error);
      
      // Tutup modal jika error
      setShowPlatformMenu(false);
      
      let errorMessage = 'Gagal download APK';
      let errorIcon = '❌';
      
      if (error.message.includes('Network error')) {
        errorMessage = 'Koneksi error atau URL tidak valid.\n\nPastikan APK sudah diupload ke server dan URL sudah benar.';
      } else {
        errorMessage = error.message;
      }
      
      setAlertConfig({
        show: true,
        title: 'Download Gagal',
        message: errorMessage,
        icon: errorIcon
      });
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  // Download APK with progress tracking (for browser)
  const downloadAPKWithProgress = (url, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';
      
      // Track download progress
      xhr.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          // Create blob URL and trigger download
          const blob = xhr.response;
          const blobUrl = window.URL.createObjectURL(blob);
          
          // Create temporary link and trigger download
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = 'arsip-digital.apk';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up blob URL
          window.URL.revokeObjectURL(blobUrl);
          
          resolve();
        } else {
          reject(new Error(`Download failed with status: ${xhr.status}`));
        }
      };
      
      xhr.onerror = () => {
        reject(new Error('Network error during download'));
      };
      
      xhr.send();
    });
  };

  return (
    <header className="flex justify-between items-center pr-1 pl-lg lg:px-lg w-full sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant shadow-sm h-16">
      <div className="flex items-center gap-lg flex-1">
        {/* Hamburger Menu Button - Hidden */}
        <button
          onClick={onMenuClick}
          className="hidden p-2 -ml-2 rounded-lg hover:bg-surface-container transition-colors relative"
          style={{ top: '2px' }}
        >
          <span 
            className="material-symbols-outlined text-on-surface-variant block"
            style={{ 
              fontSize: '24px',
              width: '24px',
              height: '24px'
            }}
          >
            menu
          </span>
        </button>

        {/* Mobile: Logo + Arsip Digital */}
        <div className="lg:hidden flex items-center gap-2 ml-3">
          <img 
            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjcSV7IWFroU8CkdVfLkDBLM5_-Cgs55QMT7652YgsGrL5n4L5aYExynIBv-WToLfFRJYMXhizKhYe-laxPNqCpW1LCNJx41Z76gFI0ja7V_AB3SwNJYnDHPCikDT4ap08BSJmX3a74gfabJvf0z2ADbX7GaalNkV3zzzjkQTPqhnpeiClC7sJP0Go2orBS/s320/Gemini_Generated_Image_t83gf8t83gf8t83g.jpg"
            alt="Logo KPU"
            className="h-10 w-auto object-contain"
          />
          <h1 className="text-xl font-extrabold tracking-wide">
            <span style={{ color: '#3b82f6' }}>Arsip</span>
            <span style={{ color: '#1f2937' }}> Digital</span>
          </h1>
        </div>

        {/* Desktop: Full Breadcrumb */}
        <nav className="hidden lg:flex items-center gap-xs text-[12px] text-on-surface-variant">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.id || index} className="flex items-center gap-xs">
              {/* Home icon untuk breadcrumb pertama */}
              {index === 0 && crumb.id === null ? (
                <button onClick={() => onNavigate?.(crumb.id)} className="flex items-center hover:text-primary transition-colors">
                  <span 
                    className="material-symbols-outlined block"
                    style={{ fontSize: '24px', width: '24px', height: '24px' }}
                  >
                    home
                  </span>
                </button>
              ) : (
                <>
                  {/* Chevron separator (skip untuk home dan Arsip Digital) */}
                  {index > 1 && (
                    <span 
                      className="material-symbols-outlined block"
                      style={{ fontSize: '18px', width: '18px', height: '18px' }}
                    >
                      chevron_right
                    </span>
                  )}
                  
                  {/* Breadcrumb text */}
                  {index === breadcrumbs.length - 1 ? (
                    // Breadcrumb terakhir - bold dan tidak clickable
                    <span className="font-semibold text-primary">{crumb.name}</span>
                  ) : (
                    // Breadcrumb lainnya - clickable
                    <button 
                      onClick={() => onNavigate?.(crumb.id)} 
                      className="hover:text-primary transition-colors"
                    >
                      {crumb.name}
                    </button>
                  )}
                </>
              )}
            </span>
          ))}
        </nav>
        
        {/* Search Input - Tampil untuk halaman tertentu */}
        {showSearch && (
          <div className="flex-1 max-w-md mx-lg hidden lg:block">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-body-sm text-on-surface outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
              />
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-lg lg:ml-auto">
        <div className="flex items-center gap-2 lg:gap-sm">
          {/* Notification Button with Dropdown */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 lg:p-2 rounded-full hover:bg-surface-container transition-colors relative"
            >
              <span 
                className={`material-symbols-outlined transition-colors ${showNotifications ? 'text-primary' : 'text-on-surface-variant'}`}
                style={getIconStyle()}
              >
                notifications
              </span>
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-1.5 right-1.5 lg:top-2 lg:right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
                  <span className="absolute top-0.5 right-0.5 lg:top-1 lg:right-1 bg-error text-white text-[11px] lg:text-[10px] font-bold rounded-full w-4 h-4 lg:w-4 lg:h-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="fixed lg:absolute right-0 lg:right-0 top-16 lg:top-full left-0 lg:left-auto lg:mt-2 w-full lg:w-96 max-w-[100vw] lg:max-w-none bg-surface-container-lowest border-t lg:border border-outline-variant lg:rounded-xl shadow-xl overflow-hidden z-50 max-h-[calc(100vh-4rem)] lg:max-h-[600px]">
                {/* Header */}
                <div className="px-md lg:px-lg py-sm lg:py-md border-b border-outline-variant bg-surface-container">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base lg:text-title-md font-semibold lg:font-title-md text-on-surface">Notifikasi</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] lg:text-label-sm text-secondary hover:text-secondary/80 font-semibold transition-colors"
                      >
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>
                </div>

                {/* Notification List */}
                <div className="max-h-[400px] overflow-y-auto">
                  {loading ? (
                    <div className="px-md lg:px-lg py-md lg:py-xl text-center">
                      <p className="text-sm lg:text-body-sm text-on-surface-variant">Memuat notifikasi...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-md lg:px-lg py-md lg:py-xl text-center">
                      <span className="material-symbols-outlined text-on-surface-variant/30 mb-xs lg:mb-sm block" style={{ fontSize: '48px' }}>notifications_off</span>
                      <p className="text-sm lg:text-body-sm text-on-surface-variant">Tidak ada notifikasi</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const style = getNotificationStyle(notif.type);
                      // System/Access notifications show app logo, others show user avatar
                      const isSystemNotification = notif.type === 'system' || notif.type === 'access';
                      
                      return (
                        <div
                          key={notif.id}
                          onClick={() => !notif.is_read && markAsRead(notif.id)}
                          className={`px-md lg:px-lg py-sm lg:py-md border-b border-outline-variant hover:bg-surface-container transition-colors cursor-pointer ${
                            !notif.is_read ? 'bg-secondary-container/10' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Avatar with Badge - App Logo for system, User Avatar for user actions */}
                            <div className="relative flex-shrink-0">
                              <div 
                                className={`w-12 h-12 rounded-full overflow-hidden ${
                                  !notif.is_read 
                                    ? 'border-[3px] border-secondary ring-2 ring-secondary/20' 
                                    : ''
                                } ${isSystemNotification ? 'bg-surface-container' : ''}`}
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  background: isSystemNotification ? undefined : 'transparent'
                                }}
                              >
                                {isSystemNotification ? (
                                  // System/Access notification → Show app logo
                                  <img 
                                    src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjcSV7IWFroU8CkdVfLkDBLM5_-Cgs55QMT7652YgsGrL5n4L5aYExynIBv-WToLfFRJYMXhizKhYe-laxPNqCpW1LCNJx41Z76gFI0ja7V_AB3SwNJYnDHPCikDT4ap08BSJmX3a74gfabJvf0z2ADbX7GaalNkV3zzzjkQTPqhnpeiClC7sJP0Go2orBS/s320/Gemini_Generated_Image_t83gf8t83gf8t83g.jpg"
                                    alt="App Logo"
                                    className="w-full h-full object-cover"
                                  />
                                ) : notif.creator_avatar_url ? (
                                  // User action notification WITH avatar → Show actual user avatar
                                  <img 
                                    src={`${supabase.storage.from('avatars').getPublicUrl(notif.creator_avatar_url.replace('avatars/', '')).data.publicUrl}`}
                                    alt="User Avatar"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      // Fallback to account_circle icon if avatar fails to load
                                      e.target.style.display = 'none';
                                      const parent = e.target.parentElement;
                                      parent.classList.remove('bg-surface-container-low');
                                      parent.style.background = 'transparent';
                                      parent.innerHTML = '<span class="material-symbols-outlined filled-icon text-gray-600" style="font-size: 80px; display: block; width: 100%; height: 100%; line-height: 1; transform: scale(2);">account_circle</span>';
                                    }}
                                  />
                                ) : (
                                  // User action notification WITHOUT avatar → Show default account_circle icon
                                  <span 
                                    className="material-symbols-outlined filled-icon text-gray-600"
                                    style={{ 
                                      fontSize: '80px',
                                      display: 'block',
                                      width: '100%',
                                      height: '100%',
                                      lineHeight: '1',
                                      transform: 'scale(2)'
                                    }}
                                  >
                                    account_circle
                                  </span>
                                )}
                              </div>
                              
                              {/* Badge icon indicator at bottom-right corner */}
                              <div 
                                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center bg-white shadow-md"
                              >
                                <span 
                                  style={{ 
                                    fontSize: '12px',
                                    lineHeight: '1'
                                  }}
                                >
                                  {style.emoji}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-xs">
                                <p className={`text-sm lg:text-body-sm font-semibold text-on-surface ${!notif.is_read ? 'font-bold' : ''} flex-1`} style={{ lineHeight: '1.4' }}>
                                  {notif.title}
                                </p>
                                {!notif.is_read && (
                                  <span className="w-2 h-2 bg-secondary rounded-full flex-shrink-0 mt-1.5"></span>
                                )}
                              </div>
                              <p className="text-xs lg:text-body-sm text-on-surface-variant line-clamp-2 mb-xs">
                                {notif.message.split(' ').map((word, index) => {
                                  // Bold first word if it looks like a username (not common words)
                                  if (index === 0 && !['Dokumen', 'Password', 'Hak', 'Role', 'File'].includes(word)) {
                                    return <strong key={index} className="font-bold text-on-surface">{word} </strong>;
                                  }
                                  return word + ' ';
                                })}
                              </p>
                              <p className="text-[10px] lg:text-label-sm text-on-surface-variant/70">
                                {getTimeAgo(notif.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="px-lg py-md border-t border-outline-variant bg-surface-container">
                    <button 
                      onClick={() => {
                        setShowNotifications(false);
                        // Navigate to notifications page if exists
                      }}
                      className="w-full text-center text-body-sm font-semibold text-secondary hover:text-secondary/80 transition-colors"
                    >
                      Lihat Semua Notifikasi
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Platform Menu Button - Mobile Only */}
          <div className="lg:hidden relative" ref={platformMenuRef}>
            <button 
              onClick={() => setShowPlatformMenu(!showPlatformMenu)}
              className="p-1.5 rounded-full hover:bg-surface-container transition-colors relative right-[3px]"
            >
              <span 
                className={`material-symbols-outlined transition-colors ${showPlatformMenu ? 'text-primary' : 'text-on-surface-variant'}`}
                style={getIconStyle()}
              >
                download
              </span>
            </button>

            {/* Platform Menu Dropdown */}
            {showPlatformMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                {/* Menu Items - Thin & Clean */}
                <div className="py-0.5">
                  {/* Android */}
                  <button
                    onClick={handleDownloadAPK}
                    disabled={isDownloading}
                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                      <path d="M17.523 15.3414C17.5315 15.5449 17.4884 15.7475 17.3975 15.9299C17.3065 16.1123 17.1708 16.2684 17.003 16.3838C16.8353 16.4993 16.6409 16.5703 16.4384 16.5903C16.236 16.6103 16.0323 16.5788 15.8457 16.4985L15.6457 16.4138C14.5866 15.9346 13.4325 15.685 12.263 15.6814C11.0866 15.6809 9.92568 15.9327 8.8604 16.4185L8.6604 16.5031C8.47382 16.5834 8.27012 16.6149 8.06765 16.5949C7.86518 16.5749 7.6708 16.5039 7.50306 16.3885C7.33531 16.273 7.19956 16.1169 7.10862 15.9345C7.01768 15.7521 6.97458 15.5495 6.98305 15.3461L7.04771 14.0414C7.08771 13.1861 7.36438 12.3585 7.84771 11.6508L8.84771 10.1931C9.27438 9.57614 9.56305 8.87214 9.69305 8.13214L9.73305 7.8768C9.80771 7.41214 9.97505 6.9668 10.2257 6.5668C10.491 6.14614 10.8604 5.79814 11.2997 5.55347C11.739 5.30881 12.2337 5.17614 12.7377 5.16814H11.263C11.767 5.17614 12.2617 5.30881 12.701 5.55347C13.1403 5.79814 13.5097 6.14614 13.775 6.5668C14.0257 6.9668 14.193 7.41214 14.2677 7.8768L14.3077 8.13214C14.4377 8.87214 14.7263 9.57614 15.153 10.1931L16.153 11.6508C16.6363 12.3585 16.913 13.1861 16.953 14.0414L17.523 15.3414Z" fill="#3DDC84"/>
                      <path d="M7.5 9C7.5 8.60218 7.34196 8.22064 7.06066 7.93934C6.77936 7.65804 6.39782 7.5 6 7.5C5.60218 7.5 5.22064 7.65804 4.93934 7.93934C4.65804 8.22064 4.5 8.60218 4.5 9V14C4.5 14.3978 4.65804 14.7794 4.93934 15.0607C5.22064 15.342 5.60218 15.5 6 15.5C6.39782 15.5 6.77936 15.342 7.06066 15.0607C7.34196 14.7794 7.5 14.3978 7.5 14V9Z" fill="#3DDC84"/>
                      <path d="M19.5 9C19.5 8.60218 19.342 8.22064 19.0607 7.93934C18.7794 7.65804 18.3978 7.5 18 7.5C17.6022 7.5 17.2206 7.65804 16.9393 7.93934C16.658 8.22064 16.5 8.60218 16.5 9V14C16.5 14.3978 16.658 14.7794 16.9393 15.0607C17.2206 15.342 17.6022 15.5 18 15.5C18.3978 15.5 18.7794 15.342 19.0607 15.0607C19.342 14.7794 19.5 14.3978 19.5 14V9Z" fill="#3DDC84"/>
                      <circle cx="9.5" cy="10.5" r="1" fill="#121212"/>
                      <circle cx="14.5" cy="10.5" r="1" fill="#121212"/>
                    </svg>
                    <div className="text-left flex-1 leading-tight">
                      <p className="text-sm font-semibold leading-none mb-0.5">Android</p>
                      <p className="text-xs text-gray-500 leading-none">Download APK</p>
                      {isDownloading && (
                        <p className="text-xs text-green-600 font-medium leading-none mt-0.5">
                          {downloadProgress}%
                        </p>
                      )}
                    </div>
                    {isDownloading && (
                      <span className="material-symbols-outlined animate-spin text-green-600 text-lg">
                        progress_activity
                      </span>
                    )}
                  </button>

                  {/* Progress Bar - Thin */}
                  {isDownloading && (
                    <div className="px-4 pb-1">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-green-600 h-full transition-all duration-300 ease-out"
                          style={{ width: `${downloadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Divider / Garis Pembatas */}
                  <div className="border-t border-gray-200 my-0.5"></div>

                  {/* iOS */}
                  <button
                    onClick={() => {
                      setShowPlatformMenu(false);
                      // Show custom alert instead of browser alert
                      setAlertConfig({
                        show: true,
                        title: 'Aplikasi iOS Belum Tersedia',
                        message: 'Maaf, aplikasi untuk iOS sedang dalam pengembangan.\n\nSementara itu, Anda bisa:\n\n1. Gunakan Safari browser\n2. Tap tombol Share (📤)\n3. Pilih "Add to Home Screen"\n4. Install sebagai PWA',
                        icon: '📱'
                      });
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                      <path d="M17.05 20.28C16.03 21.23 14.96 21.08 13.93 20.63C12.84 20.17 11.84 20.15 10.7 20.63C9.28 21.25 8.52 21.07 7.62 20.28C3.87 16.36 4.42 10.28 8.62 10.05C9.73 10.11 10.49 10.7 11.16 10.74C12.25 10.54 13.3 9.93 14.47 10.01C15.86 10.12 16.9 10.64 17.58 11.58C14.62 13.33 15.33 17.26 17.05 20.28ZM12.03 9.91C11.88 7.96 13.5 6.37 15.34 6.2C15.62 8.48 13.38 10.15 12.03 9.91Z" fill="#555555"/>
                    </svg>
                    <div className="text-left flex-1 leading-tight">
                      <p className="text-sm font-semibold leading-none mb-0.5">iOS</p>
                      <p className="text-xs text-gray-500 leading-none">Download App</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => onNavigate?.('settings')} 
            className="p-1.5 lg:p-2 rounded-full hover:bg-surface-container transition-colors relative right-[3px] lg:right-0 group"
          >
            <span 
              className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors"
              style={getIconStyle()}
            >
              settings
            </span>
          </button>
          
          <div className="hidden lg:block h-6 lg:h-8 w-[1px] bg-outline-variant mx-1 lg:mx-sm"></div>
          
          {/* Profile Menu - Desktop Only */}
          <div className="relative hidden lg:flex">
            <div 
              onClick={() => {
                // Mobile & Desktop: navigate to profile
                console.log('Profile clicked, navigating to profile page');
                onNavigate?.('profile');
              }} 
              className="flex items-center gap-sm cursor-pointer hover:bg-surface-container p-1 rounded-lg transition-colors relative left-[5px] lg:left-0"
            >
              {/* Avatar - dari database atau default */}
              {profile?.avatar_url ? (
                <img
                  className="w-8 lg:w-8 h-8 lg:h-8 rounded-full object-cover border border-outline-variant relative left-[4px] lg:left-0"
                  src={`${supabase.storage.from('avatars').getPublicUrl(profile.avatar_url.replace('avatars/', '')).data.publicUrl}`}
                  alt={profile?.full_name || 'User'}
                  onError={(e) => {
                    // Fallback to default icon if image fails to load
                    console.error('Failed to load avatar image');
                    e.target.style.display = 'none';
                    const fallback = e.target.parentElement.querySelector('.avatar-fallback');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              {/* Default avatar icon - Simple person icon with gray background */}
              <div className={`w-8 lg:w-8 h-8 lg:h-8 rounded-full bg-gray-200 flex items-center justify-center avatar-fallback relative left-[4px] lg:left-0 ${profile?.avatar_url ? 'hidden' : ''}`}>
                <span className="material-symbols-outlined text-2xl lg:text-2xl" style={{ color: '#6b7280' }}>
                  person
                </span>
              </div>
              
              <div className="hidden sm:block">
                <p className="text-label-caps leading-none font-bold">{profile?.full_name || user?.email || 'User'}</p>
                <p className="text-[10px] text-on-surface-variant">
                  {getRoleDisplayName(profile?.role)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Compact Alert Modal */}
      <CompactAlert
        show={alertConfig.show}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        onClose={() => setAlertConfig({ ...alertConfig, show: false })}
      />
    </header>
  );
}
