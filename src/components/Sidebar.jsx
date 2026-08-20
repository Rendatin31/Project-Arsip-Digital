export default function Sidebar({ user, profile, onLogout, currentPage, onNavigate, isOpen, onClose }) {
  const userRole = profile?.role || 'viewer';
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';
  
  const menuItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard', allowedRoles: ['super_admin', 'admin', 'editor', 'viewer'] },
    { id: 'documents', icon: 'folder_open', label: 'File Saya', allowedRoles: ['super_admin', 'admin', 'editor'] },
    { id: 'data-arsip', icon: 'folder', label: 'Direktori Arsip', allowedRoles: ['super_admin', 'admin', 'editor'] },
    { id: 'search', icon: 'manage_search', label: 'Pencarian Pintar', allowedRoles: ['super_admin', 'admin', 'editor', 'viewer'] },
    { id: 'access', icon: 'admin_panel_settings', label: 'Hak Akses', allowedRoles: ['super_admin', 'admin'] },
    { id: 'history', icon: 'history', label: 'Riwayat Aktivitas', allowedRoles: ['super_admin', 'admin'] },
    { id: 'settings', icon: 'settings', label: 'Pengaturan', allowedRoles: ['super_admin', 'admin', 'editor', 'viewer'] },
  ];

  const handleNavigate = (id) => {
    onNavigate?.(id);
    onClose?.(); // Close sidebar on mobile after navigation
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        w-[230px] h-screen fixed left-0 top-0 bg-surface-container-lowest border-r border-outline-variant 
        flex flex-col py-md pl-sm pr-md gap-md z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        <div className="mb-sm px-sm pb-md">
          <div className="flex items-center gap-3">
            <img 
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjcSV7IWFroU8CkdVfLkDBLM5_-Cgs55QMT7652YgsGrL5n4L5aYExynIBv-WToLfFRJYMXhizKhYe-laxPNqCpW1LCNJx41Z76gFI0ja7V_AB3SwNJYnDHPCikDT4ap08BSJmX3a74gfabJvf0z2ADbX7GaalNkV3zzzjkQTPqhnpeiClC7sJP0Go2orBS/s320/Gemini_Generated_Image_t83gf8t83gf8t83g.jpg"
              alt="Logo KPU"
              className="h-12 w-auto object-contain"
            />
            <h1 className="text-xl font-bold tracking-wide">
              <span className="text-green-700">Arsip</span>
              <span className="text-gray-800"> Digital</span>
            </h1>
          </div>
        </div>
        <div className="px-sm border-b border-outline-variant mb-md">
        </div>
        <nav className="flex flex-col gap-xs flex-1 overflow-y-auto min-h-0 scrollbar-hide">
          {menuItems.map((item) => {
            const isAllowed = item.allowedRoles.includes(userRole);
            const isDisabled = !isAllowed;
            
            // Determine tooltip message based on allowed roles
            let tooltipMessage = '';
            if (isDisabled) {
              if (item.allowedRoles.includes('super_admin') && item.allowedRoles.includes('admin') && item.allowedRoles.includes('editor')) {
                tooltipMessage = 'Hanya untuk Super Admin, Admin, dan Editor';
              } else if (item.allowedRoles.includes('super_admin') && item.allowedRoles.includes('admin')) {
                tooltipMessage = 'Hanya untuk Super Admin dan Admin';
              } else if (item.allowedRoles.includes('admin') && item.allowedRoles.includes('editor')) {
                tooltipMessage = 'Hanya untuk Admin dan Editor';
              } else if (item.allowedRoles.includes('super_admin')) {
                tooltipMessage = 'Hanya untuk Super Admin';
              } else if (item.allowedRoles.includes('admin')) {
                tooltipMessage = 'Hanya untuk Admin';
              }
            }
            
            return (
              <button
                key={item.id}
                onClick={() => isAllowed && handleNavigate(item.id)}
                disabled={isDisabled}
                className={`flex items-center gap-md px-md py-sm rounded-lg transition-colors duration-200 ${
                  isDisabled
                    ? 'text-on-surface-variant/60 cursor-not-allowed'
                    : currentPage === item.id
                    ? 'bg-secondary-container text-on-secondary-container font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
                title={tooltipMessage}
              >
                <span 
                  className="material-symbols-outlined block shrink-0" 
                  data-icon={item.icon}
                  style={{ 
                    fontSize: '24px',
                    width: '24px',
                    height: '24px'
                  }}
                >
                  {item.icon}
                </span>
                <span className="font-body-md text-body-md">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="pt-2xl border-t border-outline-variant">
          <button
            onClick={onLogout}
            className="flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container transition-colors duration-200 rounded-lg w-full text-left mt-md mb-0"
          >
            <span 
              className="material-symbols-outlined block shrink-0" 
              data-icon="logout"
              style={{ 
                fontSize: '24px',
                width: '24px',
                height: '24px'
              }}
            >
              logout
            </span>
            <span className="font-body-md text-body-md">Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
