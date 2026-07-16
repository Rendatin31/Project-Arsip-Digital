import { useEffect } from 'react';

export default function ModernAlert({ 
  show, 
  onClose, 
  type = 'info', 
  title, 
  message, 
  confirmText = 'OK',
  cancelText = 'Batal',
  onConfirm,
  showCancel = false 
}) {
  // Auto dismiss after 5 seconds
  useEffect(() => {
    if (show && !showCancel) {
      const timer = setTimeout(() => {
        onClose?.();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose, showCancel]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && show) {
        onClose?.();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [show, onClose]);

  if (!show) return null;

  // Icon and color mapping based on type (flat design like image)
  const typeConfig = {
    success: {
      icon: 'check_circle',
      bgColor: 'bg-[#1ABC9C]',
      iconBgColor: 'bg-[#16A085]',
      textColor: 'text-white'
    },
    error: {
      icon: 'close',
      bgColor: 'bg-[#E74C3C]',
      iconBgColor: 'bg-[#C0392B]',
      textColor: 'text-white'
    },
    warning: {
      icon: 'warning',
      bgColor: 'bg-[#F39C12]',
      iconBgColor: 'bg-[#D68910]',
      textColor: 'text-white'
    },
    info: {
      icon: 'info',
      bgColor: 'bg-[#3498DB]',
      iconBgColor: 'bg-[#2980B9]',
      textColor: 'text-white'
    },
    confirm: {
      icon: 'help',
      bgColor: 'bg-[#9B59B6]',
      iconBgColor: 'bg-[#8E44AD]',
      textColor: 'text-white'
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose?.();
  };

  // If showCancel is true, show as modal dialog
  if (showCancel) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-lg animate-fade-in">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-on-background/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Alert Card */}
        <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant overflow-hidden animate-scale-in">
          {/* Icon Header */}
          <div className={`p-lg flex items-center justify-center ${config.bgColor}`}>
            <div className={`w-16 h-16 rounded-full ${config.iconBgColor} flex items-center justify-center shadow-md`}>
              <span className={`material-symbols-outlined text-5xl ${config.textColor}`}>
                {config.icon}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-lg">
            {title && (
              <h3 className="text-xl font-bold text-on-surface text-center mb-sm">
                {title}
              </h3>
            )}
            
            {message && (
              <div className="text-body-sm text-on-surface-variant text-center leading-relaxed whitespace-pre-line">
                {message}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-lg pb-lg flex gap-sm justify-end">
            <button
              onClick={onClose}
              className="px-lg py-sm bg-surface-container-high text-on-surface rounded-lg font-semibold hover:bg-surface-container-highest transition-all"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-lg py-sm rounded-lg font-semibold hover:brightness-110 active:scale-[0.98] transition-all shadow-sm ${config.bgColor} ${config.textColor}`}
              autoFocus
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Toast notification style (like the image)
  return (
    <div className="fixed top-4 right-4 z-[200] animate-slide-in-right">
      <div className={`flex items-center gap-4 ${config.bgColor} ${config.textColor} rounded-lg shadow-2xl overflow-hidden min-w-[320px] max-w-md`}>
        {/* Icon */}
        <div className={`${config.iconBgColor} p-4 flex items-center justify-center`}>
          <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: '"FILL" 0, "wght" 300, "GRAD" 0, "opsz" 48' }}>
            {config.icon}
          </span>
        </div>
        
        {/* Content */}
        <div className="flex-1 py-4 pr-4">
          {title && (
            <h4 className="font-bold text-lg mb-1">
              {title}
            </h4>
          )}
          {message && (
            <p className="text-sm opacity-90 leading-relaxed whitespace-pre-line">
              {message}
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  );
}
