// Mobile Icon Size Fix Script
// This script forces all Material Icons to be larger on mobile devices
(function() {
  'use strict';
  
  console.log('🔧 Mobile Icon Fix Script Loaded');
  
  // Better mobile detection - check user agent AND touch support
  function isMobileDevice() {
    // Check user agent
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i;
    const isMobileUA = mobileRegex.test(userAgent.toLowerCase());
    
    // Check touch support
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Check screen size (as fallback)
    const isSmallScreen = window.innerWidth < 1024;
    
    // Consider mobile if ANY of these are true
    return isMobileUA || (hasTouch && isSmallScreen);
  }
  
  function forceResizeIcons() {
    const isMobile = isMobileDevice();
    
    console.log('🔍 Device Detection:');
    console.log('  - User Agent Mobile:', /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(navigator.userAgent.toLowerCase()));
    console.log('  - Has Touch:', 'ontouchstart' in window || navigator.maxTouchPoints > 0);
    console.log('  - Screen Width:', window.innerWidth);
    console.log('  - Device Pixel Ratio:', window.devicePixelRatio);
    console.log('  - IS MOBILE?', isMobile);
    
    if (!isMobile) {
      console.log('💻 Desktop detected, skipping icon resize');
      return;
    }
    
    console.log('📱 MOBILE DETECTED - Forcing icon resize');
    
    // Get ALL Material Icons
    const icons = document.querySelectorAll('.material-symbols-outlined');
    
    if (icons.length === 0) {
      console.warn('⚠️ No Material Icons found, will retry...');
      return;
    }
    
    let resizedCount = 0;
    
    icons.forEach((icon) => {
      // Check if in header or nav
      const isHeaderIcon = icon.closest('header');
      const isNavIcon = icon.closest('nav');
      
      if (isHeaderIcon || isNavIcon) {
        // Header & Nav: 40px (EXTRA LARGE)
        icon.style.fontSize = '40px';
        icon.style.width = '40px';
        icon.style.height = '40px';
        icon.style.minWidth = '40px';
        icon.style.minHeight = '40px';
      } else {
        // All others: 36px (LARGE)
        icon.style.fontSize = '36px';
        icon.style.minWidth = '36px';
        icon.style.minHeight = '36px';
      }
      
      resizedCount++;
    });
    
    console.log(`✅ RESIZED ${resizedCount} ICONS (Header/Nav: 40px, Others: 36px)`);
  }
  
  // Run multiple times to ensure it catches all icons
  function runMultipleTimes() {
    console.log('🔄 Running icon resize (attempt 1/5)');
    forceResizeIcons();
    
    setTimeout(() => {
      console.log('🔄 Running icon resize (attempt 2/5)');
      forceResizeIcons();
    }, 500);
    
    setTimeout(() => {
      console.log('🔄 Running icon resize (attempt 3/5)');
      forceResizeIcons();
    }, 1000);
    
    setTimeout(() => {
      console.log('🔄 Running icon resize (attempt 4/5)');
      forceResizeIcons();
    }, 2000);
    
    setTimeout(() => {
      console.log('🔄 Running icon resize (attempt 5/5)');
      forceResizeIcons();
    }, 3000);
  }
  
  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runMultipleTimes);
  } else {
    runMultipleTimes();
  }
  
  // Watch for new icons being added
  const observer = new MutationObserver(forceResizeIcons);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Run on resize
  window.addEventListener('resize', forceResizeIcons);
  
  // Run on orientation change
  window.addEventListener('orientationchange', () => {
    setTimeout(forceResizeIcons, 300);
  });
  
  console.log('✅ Mobile Icon Fix Script Active');
})();
