// Mobile Icon Size Fix Script
// This script forces all Material Icons to be larger on mobile devices
(function() {
  'use strict';
  
  console.log('🔧 Mobile Icon Fix Script Loaded');
  
  // More aggressive mobile detection - use screen width as PRIMARY indicator
  function isMobileDevice() {
    // PRIMARY CHECK: Screen width (more reliable than user agent)
    // Most mobile devices: < 900px, Most tablets: < 1100px
    const width = window.innerWidth;
    const isSmallScreen = width < 900;
    
    // SECONDARY CHECK: Touch support
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // TERTIARY CHECK: User agent (least reliable, can be spoofed)
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i;
    const isMobileUA = mobileRegex.test(userAgent.toLowerCase());
    
    // AGGRESSIVE: Consider mobile if screen is small OR (has touch AND not huge screen)
    return isSmallScreen || (hasTouch && width < 1200);
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
        // Header & Nav: 48px (MAXIMUM SIZE - even larger!)
        icon.style.setProperty('font-size', '48px', 'important');
        icon.style.setProperty('width', '48px', 'important');
        icon.style.setProperty('height', '48px', 'important');
        icon.style.setProperty('min-width', '48px', 'important');
        icon.style.setProperty('min-height', '48px', 'important');
      } else {
        // All others: 40px (VERY LARGE)
        icon.style.setProperty('font-size', '40px', 'important');
        icon.style.setProperty('min-width', '40px', 'important');
        icon.style.setProperty('min-height', '40px', 'important');
      }
      
      resizedCount++;
    });
    
    console.log(`✅ RESIZED ${resizedCount} ICONS (Header/Nav: 48px, Others: 40px)`);
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
