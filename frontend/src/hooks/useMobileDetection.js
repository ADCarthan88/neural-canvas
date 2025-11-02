/**
 * 📱 MOBILE DETECTION HOOK
 * Detects device type, orientation, and capabilities
 */

import { useState, useEffect } from 'react';

export function useMobileDetection() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    orientation: 'landscape',
    screenSize: 'large',
    hasTouch: false,
    pixelRatio: 1
  });

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Device type detection
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || width < 768;
      const isTablet = (width >= 768 && width < 1024) || /ipad/i.test(userAgent);
      const isDesktop = width >= 1024 && !isMobile && !isTablet;
      
      // Orientation
      const orientation = width > height ? 'landscape' : 'portrait';
      
      // Screen size categories
      let screenSize = 'large';
      if (width < 480) screenSize = 'small';
      else if (width < 768) screenSize = 'medium';
      else if (width < 1024) screenSize = 'large';
      else screenSize = 'xlarge';
      
      // Touch capability
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Pixel ratio for high-DPI displays
      const pixelRatio = window.devicePixelRatio || 1;
      
      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        orientation,
        screenSize,
        hasTouch,
        pixelRatio,
        width,
        height
      });
    };

    // Initial detection
    detectDevice();
    
    // Listen for resize/orientation changes
    window.addEventListener('resize', detectDevice);
    window.addEventListener('orientationchange', detectDevice);
    
    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('orientationchange', detectDevice);
    };
  }, []);

  return deviceInfo;
}

export default useMobileDetection;