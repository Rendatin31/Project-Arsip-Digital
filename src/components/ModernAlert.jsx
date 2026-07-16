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
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && show) {
        onClose?.();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when alert is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [show, onClose]);

  if (!show) return null;

  // Icon and color mapping based on type
  const typeConfig = {
    success: {
      icon: 'check_circle',
      iconColor: 'text-secondary',
      bgColor: 'bg-secondary-container/20',
      borderColor: 'border-secondary/30',
      buttonColor: 'bg-secondary text-on-secondary'
    },
    error: {
      icon: 'error',
      iconColor: 'text-error',
      bgColor: 'bg-error-container/20',
      borderColor: 'border-error/30',
      buttonColor: 'bg-error text-white'
    },
    warning: {
      icon: 'warning',
      iconColor: 'text-[#F59E0B]',
      bgColor: 'bg-[#FEF3C7]',
      borderColor: 'border-[#F59E0B]/30',
      buttonColor: 'bg-[#F59E0B] text-white'
    },
    info: {
      icon: 'info',
      iconColor: 'text-primary',
      bgColor: 'bg-primary-container/20',
      borderColor: 'border-primary/30',
      buttonColor: 'bg-primary text-on-primary'
    },
    confirm: {
      icon: 'help',
      iconColor: 'text-tertiary',
      bgColor: 'bg-tertiary-container/20',
      borderColor: 'border-tertiary/30',
      buttonColor: 'bg-tertiary text-on-tertiary'
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose?.();
  };

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
        <div className={`p-lg flex items-center justify-center ${config.bgColor} border-b ${config.borderColor}`}>
          <div className={`w-16 h-16 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-md`}>
            <span className={`material-symbols-outlined text-5xl ${config.iconColor}`}>
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
          {showCancel && (
            <button
              onClick={onClose}
              className="px-lg py-sm bg-surface-container-high text-on-surface rounded-lg font-semibold hover:bg-surface-container-highest transition-all"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`px-lg py-sm rounded-lg font-semibold hover:brightness-110 active:scale-[0.98] transition-all shadow-sm ${config.buttonColor}`}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
