import { useState, useEffect } from 'react';

const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Detect if already running as standalone (installed)
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || window.navigator.standalone 
      || document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    // Show prompt if iOS and not standalone
    if (iOS && !standalone) {
      // Check if user already dismissed the prompt today
      const lastDismissed = localStorage.getItem('pwa-prompt-dismissed');
      const today = new Date().toDateString();
      
      if (lastDismissed !== today) {
        // Show prompt after 5 seconds
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 5000);

        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal for today
    localStorage.setItem('pwa-prompt-dismissed', new Date().toDateString());
  };

  const handleViewGuide = () => {
    window.open('/pwa-install-guide.html', '_blank');
  };

  if (!showPrompt || !isIOS || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-2xl">
                📂
              </div>
              <div>
                <div className="text-white font-semibold text-sm">
                  Install Arsip Digital
                </div>
                <div className="text-blue-100 text-xs">
                  Tambah ke Layar Utama
                </div>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              aria-label="Tutup"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 py-3">
          <p className="text-gray-600 text-sm mb-3">
            Install aplikasi ini untuk pengalaman lebih baik:
          </p>
          
          <ul className="space-y-2 mb-4">
            <li className="flex items-center gap-2 text-xs text-gray-700">
              <span className="text-green-500">✓</span>
              <span>Akses cepat dari home screen</span>
            </li>
            <li className="flex items-center gap-2 text-xs text-gray-700">
              <span className="text-green-500">✓</span>
              <span>Mode fullscreen tanpa browser bar</span>
            </li>
            <li className="flex items-center gap-2 text-xs text-gray-700">
              <span className="text-green-500">✓</span>
              <span>Bisa digunakan offline</span>
            </li>
          </ul>

          {/* Install Steps - Compact */}
          <div className="bg-blue-50 rounded-lg p-3 mb-3">
            <div className="text-xs font-semibold text-blue-900 mb-2">
              Cara Install:
            </div>
            <ol className="space-y-1 text-xs text-blue-800">
              <li>1. Tap tombol <strong>Share</strong> 📤 di bawah</li>
              <li>2. Pilih <strong>"Add to Home Screen"</strong></li>
              <li>3. Tap <strong>"Add"</strong> untuk install</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleViewGuide}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
            >
              Lihat Panduan Lengkap
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
            >
              Nanti
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
