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

  // Menu items untuk "Lainnya" (termasuk Direktori Arsip yang dipindahkan dari main menu)
  const moreMenuItems = [
    { id: 'data-arsip', icon: 'folder', label: 'Direktori Arsip', allowedRoles: ['super_admin', 'admin', 'editor'] },
    { id: 'access', icon: 'admin_panel_settings', label: 'Hak Akses', allowedRoles: ['super_admin', 'admin'] },
    { id: 'history', icon: 'history', label: 'Riwayat Aktivitas', allowedRoles: ['super_admin', 'admin'] },
    { id: 'settings', icon: 'settings', label: 'Pengaturan', allowedRoles: ['super_admin', 'admin', 'editor', 'viewer'] },
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
        <div className="flex items-center justify-between h-18 px-4 relative">
          {/* Left side - 2 items */}
          <div className="flex items-center gap-1">
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
                      isActive && isAllowed ? 'filled-icon text-[28px]' : 'text-[24px]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className={`text-[12px] font-medium ${isActive && isAllowed ? 'font-bold' : ''}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
          
          {/* Center Profile Button - Elevated */}
          <button
            onClick={() => onNavigate?.('profile')}
            className={`absolute left-1/2 -translate-x-1/2 -top-8 w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-white transition-all hover:scale-105 overflow-hidden ${
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
              <span className={`material-symbols-outlined text-secondary text-[36px] filled-icon`}>
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
                      isActive && isAllowed ? 'filled-icon text-[28px]' : 'text-[24px]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className={`text-[12px] font-medium ${isActive && isAllowed ? 'font-bold' : ''}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
            
            {/* More Button */}
            <button
              onClick={handleMoreClick}
              className="flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-lg transition-all duration-200 min-w-[60px] text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[24px]">
                more_horiz
              </span>
              <span className={`text-[12px] font-medium`}>
                Lainnya
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* More Menu Modal */}
      {showMoreMenu && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setShowMoreMenu(false)}
          />
          
          {/* Menu Content */}
          <div className="fixed bottom-0 left-0 right-0 bg-surface-container-lowest rounded-t-2xl z-50 lg:hidden max-h-[70vh] overflow-y-auto">
            <div className="p-lg">
              <div className="flex justify-between items-center mb-md">
                <h3 className="text-title-md font-semibold">Menu Lainnya</h3>
                <button 
                  onClick={() => setShowMoreMenu(false)}
                  className="p-2 rounded-full hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <div className="space-y-xs">
                {moreMenuItems.map((item) => {
                  const isAllowed = item.allowedRoles.includes(userRole);
                  const isActive = currentPage === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => isAllowed && handleMenuItemClick(item.id)}
                      disabled={!isAllowed}
                      className={`w-full flex items-center gap-md px-md py-sm rounded-lg transition-colors duration-200 ${
                        !isAllowed
                          ? 'text-on-surface-variant/40 cursor-not-allowed'
                          : isActive
                          ? 'bg-secondary-container text-on-secondary-container font-semibold'
                          : 'text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      <span 
                        className="material-symbols-outlined block shrink-0" 
                        style={{ fontSize: '24px', width: '24px', height: '24px' }}
                      >
                        {item.icon}
                      </span>
                      <span className="font-body-md text-body-md">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
