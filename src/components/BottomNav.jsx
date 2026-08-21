import { useState } from 'react';

export default function BottomNav({ profile, currentPage, onNavigate, supabase }) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const userRole = profile?.role || 'viewer';
  
  // Menu items untuk bottom nav (4 items utama saja)
  // Layout: Dashboard | File Saya | [Profile di tengah] | Pencarian | Lainnya
  const mainMenuItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard', allowedRoles: ['super_admin', 'admin', 'editor', 'viewer'] },
    { id: 'documents', icon: 'folder_open', label: 'File Saya', allowedRoles: ['super_admin', 'admin', 'editor'] },
    { id: 'search', icon: 'manage_search', label: 'Pencarian', allowedRoles: ['super_admin', 'admin', 'editor', 'viewer'] },
  ];

  // Menu items untuk "Lainnya" - urutan dari atas: Direktori Arsip, Hak Akses, Riwayat Aktivitas, Pengaturan
  const moreMenuItems = [
    { id: 'settings', icon: 'settings', label: 'Pengaturan', allowedRoles: ['super_admin', 'admin', 'editor', 'viewer'] },
    { id: 'history', icon: 'history', label: 'Riwayat Aktivitas', allowedRoles: ['super_admin', 'admin'] },
    { id: 'access', icon: 'admin_panel_settings', label: 'Hak Akses', allowedRoles: ['super_admin', 'admin'] },
    { id: 'data-arsip', icon: 'folder', label: 'Direktori Arsip', allowedRoles: ['super_admin', 'admin', 'editor'] },
  ];

  const handleMoreClick = () => {
    setShowMoreMenu(true);
  };

  const handleMenuItemClick = (id) => {
    setShowMoreMenu(false);
    onNavigate?.(id);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant z-50">
        <div className="flex items-center justify-between h-18 pl-1 pr-1 relative">
          {/* Left side - 2 items */}
          <div className="flex items-center gap-0">
            {mainMenuItems.slice(0, 2).map((item) => {
              const isAllowed = item.allowedRoles.includes(userRole);
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => isAllowed && onNavigate?.(item.id)}
                  disabled={!isAllowed}
                  className={`flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-lg transition-all duration-200 min-w-[60px] ${
                    !isAllowed
                      ? 'text-on-surface-variant/40 cursor-not-allowed'
                      : isActive
                      ? 'text-secondary bg-secondary-container/30'
                      : 'text-on-surface-variant'
                  }`}
                >
                  <span 
                    className={`material-symbols-outlined transition-all ${
                      isActive && isAllowed ? 'filled-icon text-[26px]' : 'text-[22px]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className={`text-[11px] font-medium ${isActive && isAllowed ? 'font-bold' : ''}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
          
          {/* Center Profile Button - Elevated */}
          <button
            onClick={() => onNavigate?.('profile')}
            className={`absolute left-1/2 -translate-x-1/2 -top-7 w-18 h-18 rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-white transition-all hover:scale-105 overflow-hidden ${
              currentPage === 'profile' 
                ? 'ring-4 ring-blue-500' 
                : 'ring-4 ring-gray-300'
            }`}
            style={{ borderRadius: '50%' }}
          >
            {profile?.avatar_url && supabase ? (
              <img
                src={`${supabase.storage.from('avatars').getPublicUrl(profile.avatar_url.replace('avatars/', '')).data.publicUrl}`}
                alt="Profile"
                className="w-full h-full object-cover scale-[1.1] absolute inset-0 z-10"
                style={{ objectPosition: '60% 25%' }}
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  e.target.style.display = 'none';
                }}
              />
            ) : null}
            {!profile?.avatar_url && (
              <span className={`material-symbols-outlined text-secondary text-[32px] filled-icon`}>
                person
              </span>
            )}
          </button>
          
          {/* Right side - Pencarian & Lainnya */}
          <div className="flex items-center gap-3">
            {/* Pencarian */}
            {mainMenuItems.slice(2, 3).map((item) => {
              const isAllowed = item.allowedRoles.includes(userRole);
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => isAllowed && onNavigate?.(item.id)}
                  disabled={!isAllowed}
                  className={`flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-lg transition-all duration-200 min-w-[60px] ${
                    !isAllowed
                      ? 'text-on-surface-variant/40 cursor-not-allowed'
                      : isActive
                      ? 'text-secondary bg-secondary-container/30'
                      : 'text-on-surface-variant'
                  }`}
                >
                  <span 
                    className={`material-symbols-outlined transition-all ${
                      isActive && isAllowed ? 'filled-icon text-[26px]' : 'text-[22px]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className={`text-[11px] font-medium ${isActive && isAllowed ? 'font-bold' : ''}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
            
            {/* More Button */}
            <button
              onClick={handleMoreClick}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-lg transition-all duration-200 min-w-[60px] ${
                showMoreMenu
                  ? 'text-secondary bg-secondary-container/30'
                  : 'text-on-surface-variant'
              }`}
            >
              <span className={`material-symbols-outlined transition-all ${
                showMoreMenu ? 'filled-icon text-[26px]' : 'text-[22px]'
              }`}>
                more_horiz
              </span>
              <span className={`text-[11px] font-medium ${showMoreMenu ? 'font-bold' : ''}`}>
                Lainnya
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* More Menu - Floating Vertical Buttons (Google Drive style) */}
      {showMoreMenu && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setShowMoreMenu(false)}
          />
          
          {/* Floating Vertical Buttons */}
          <div className="fixed bottom-24 right-4 z-50 lg:hidden flex flex-col gap-3 items-end">
            {/* Close Button (X) */}
            <button
              onClick={() => setShowMoreMenu(false)}
              className="flex items-center gap-3 animate-scale-in"
              style={{ animationDelay: '0ms' }}
            >
              {/* Label */}
              <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md whitespace-nowrap">
                Tutup
              </span>
              
              {/* Icon Button */}
              <div className="w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95">
                <span className="material-symbols-outlined text-white text-2xl">close</span>
              </div>
            </button>
            
            {/* Menu Buttons */}
            {moreMenuItems.slice().reverse().map((item, index) => {
              const isAllowed = item.allowedRoles.includes(userRole);
              
              if (!isAllowed) return null;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item.id)}
                  className="flex items-center gap-3 animate-scale-in"
                  style={{ animationDelay: `${(index + 1) * 50}ms` }}
                >
                  {/* Label - Always visible */}
                  <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md whitespace-nowrap">
                    {item.label}
                  </span>
                  
                  {/* Icon Button */}
                  <div className="w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95">
                    <span className="material-symbols-outlined text-white text-xl">
                      {item.icon}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
