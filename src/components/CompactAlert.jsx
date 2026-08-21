/**
 * Compact Alert Modal - Modern replacement for browser alert()
 * Usage: <CompactAlert show={true} title="Title" message="Message" onClose={handleClose} />
 */

const CompactAlert = ({ show, title, message, icon, onClose }) => {
  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9998] animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-sm w-full pointer-events-auto animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon & Title */}
          <div className="px-5 pt-5 pb-3 text-center">
            {/* Icon */}
            {icon && (
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <span className="text-2xl">{icon}</span>
              </div>
            )}
            
            {/* Title */}
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
            )}
            
            {/* Message */}
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>

          {/* Button */}
          <div className="px-5 pb-5">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
            >
              OK
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default CompactAlert;
