import { useState, useEffect, useRef } from 'react';
import { initializePushNotifications, sendPushNotification, setupNotificationListeners } from '../utils/pushNotifications';

export default function Header({ user, profile, onLogout, breadcrumbs = [], onNavigate, showSearch = false, searchValue = '', onSearchChange, searchPlaceholder = 'Cari dokumen...', supabase, onMenuClick }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileMenuRef = useRef(null);

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
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showNotifications || showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showProfileMenu]);

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
      upload: { icon: 'upload_file', color: 'text-secondary' },
      security: { icon: 'warning', color: 'text-error' },
      share: { icon: 'share', color: 'text-tertiary' },
      system: { icon: 'update', color: 'text-primary' },
      approval: { icon: 'task_alt', color: 'text-secondary' },
      delete: { icon: 'delete', color: 'text-error' },
      edit: { icon: 'edit', color: 'text-tertiary' },
      access: { icon: 'admin_panel_settings', color: 'text-primary' },
    };
    return styles[type] || { icon: 'notifications', color: 'text-on-surface-variant' };
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

  return (
    <header className="flex justify-between items-center px-lg w-full sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant shadow-sm h-16">
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
        <div className="lg:hidden flex items-center gap-2 -ml-3">
          <img 
            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjcSV7IWFroU8CkdVfLkDBLM5_-Cgs55QMT7652YgsGrL5n4L5aYExynIBv-WToLfFRJYMXhizKhYe-laxPNqCpW1LCNJx41Z76gFI0ja7V_AB3SwNJYnDHPCikDT4ap08BSJmX3a74gfabJvf0z2ADbX7GaalNkV3zzzjkQTPqhnpeiClC7sJP0Go2orBS/s320/Gemini_Generated_Image_t83gf8t83gf8t83g.jpg"
            alt="Logo KPU"
            className="h-10 w-auto object-contain"
          />
          <h1 className="text-xl font-bold tracking-wide">
            <span className="text-blue-600">Arsip</span>
            <span className="text-gray-800"> Digital</span>
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
      <div className="flex items-center gap-lg">
        <div className="flex items-center gap-0 lg:gap-sm">
          {/* Notification Button with Dropdown */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-surface-container transition-colors relative"
            >
              <span 
                className="material-symbols-outlined text-on-surface-variant block"
                style={{ fontSize: '24px', width: '24px', height: '24px' }}
              >
                notifications
              </span>
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
                  <span className="absolute top-1 right-1 bg-error text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
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
                      <span className="material-symbols-outlined text-4xl lg:text-6xl text-on-surface-variant/30 mb-xs lg:mb-sm block">notifications_off</span>
                      <p className="text-sm lg:text-body-sm text-on-surface-variant">Tidak ada notifikasi</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const style = getNotificationStyle(notif.type);
                      return (
                        <div
                          key={notif.id}
                          onClick={() => !notif.is_read && markAsRead(notif.id)}
                          className={`px-md lg:px-lg py-sm lg:py-md border-b border-outline-variant hover:bg-surface-container transition-colors cursor-pointer ${
                            !notif.is_read ? 'bg-secondary-container/10' : ''
                          }`}
                        >
                          <div className="flex gap-sm lg:gap-md">
                            <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 ${!notif.is_read ? 'ring-2 ring-secondary' : ''}`}>
                              <span className={`material-symbols-outlined text-[16px] lg:text-[20px] ${style.color}`}>
                                {style.icon}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-xs lg:gap-sm mb-xs">
                                <p className={`text-sm lg:text-body-sm font-semibold text-on-surface ${!notif.is_read ? 'font-bold' : ''}`}>
                                  {notif.title}
                                </p>
                                {!notif.is_read && (
                                  <span className="w-2 h-2 bg-secondary rounded-full flex-shrink-0 mt-1"></span>
                                )}
                              </div>
                              <p className="text-xs lg:text-body-sm text-on-surface-variant line-clamp-2 mb-xs">
                                {notif.message}
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

          <button onClick={() => onNavigate?.('settings')} className="p-2 rounded-full hover:bg-surface-container transition-colors relative right-[3px] lg:right-0">
            <span 
              className="material-symbols-outlined text-on-surface-variant block"
              style={{ fontSize: '24px', width: '24px', height: '24px' }}
            >
              settings
            </span>
          </button>
          <div className="h-8 w-[1px] bg-outline-variant mx-sm"></div>
          
          {/* Profile Menu with Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <div 
              onClick={() => {
                // Desktop: navigate to profile
                // Mobile: toggle dropdown menu
                if (window.innerWidth >= 1024) {
                  console.log('Profile clicked, navigating to profile page');
                  onNavigate?.('profile');
                } else {
                  setShowProfileMenu(!showProfileMenu);
                }
              }} 
              className="flex items-center gap-sm cursor-pointer hover:bg-surface-container p-1 rounded-lg transition-colors relative left-[5px] lg:left-0"
            >
              {/* Avatar - dari database atau default */}
              {profile?.avatar_url ? (
                <img
                  className="w-8 h-8 rounded-full object-cover border border-outline-variant relative left-[4px] lg:left-0"
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
              <div className={`w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center avatar-fallback relative left-[4px] lg:left-0 ${profile?.avatar_url ? 'hidden' : ''}`}>
                <span className="material-symbols-outlined text-green-600 text-2xl">
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

            {/* Profile Dropdown Menu - Mobile Only */}
            {showProfileMenu && (
              <div className="lg:hidden absolute right-0 top-full mt-2 w-auto bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl overflow-hidden z-50">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout?.();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-on-surface hover:bg-surface-container transition-colors whitespace-nowrap"
                >
                  <span className="text-sm font-medium text-error">Log out</span>
                  <span className="material-symbols-outlined text-error text-base">
                    logout
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
