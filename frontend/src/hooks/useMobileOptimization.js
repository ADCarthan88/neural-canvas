/**
 * Mobile Optimization Hook
 * Handles device detection, performance scaling, and mobile-specific features
 */

import { useState, useEffect, useCallback } from 'react';

export const useMobileOptimization = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    screenSize: 'desktop',
    orientation: 'landscape',
    pixelRatio: 1,
    maxParticles: 5000,
    performanceTier: 'high'
  });

  const [touchCapabilities, setTouchCapabilities] = useState({
    maxTouchPoints: 0,
    supportsTouch: false,
    supportsForceTouch: false,
    supportsHover: true
  });

  // Detect device capabilities
  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
      const isDesktop = !isMobile && !isTablet;
      
      // Screen size detection
      const width = window.innerWidth;
      let screenSize = 'desktop';
      if (width < 480) screenSize = 'mobile';
      else if (width < 768) screenSize = 'tablet';
      else if (width < 1024) screenSize = 'laptop';

      // Performance tier based on device
      let performanceTier = 'high';
      let maxParticles = 5000;
      
      if (isMobile) {
        // Mobile performance scaling
        const memory = navigator.deviceMemory || 4;
        const cores = navigator.hardwareConcurrency || 4;
        
        if (memory <= 2 || cores <= 2) {
          performanceTier = 'low';
          maxParticles = 500;
        } else if (memory <= 4 || cores <= 4) {
          performanceTier = 'medium';
          maxParticles = 1500;
        } else {
          performanceTier = 'high';
          maxParticles = 3000;
        }
      }

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenSize,
        orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
        pixelRatio: window.devicePixelRatio || 1,
        maxParticles,
        performanceTier
      });

      // Touch capabilities
      setTouchCapabilities({
        maxTouchPoints: navigator.maxTouchPoints || 0,
        supportsTouch: 'ontouchstart' in window,
        supportsForceTouch: 'TouchEvent' in window && 'force' in TouchEvent.prototype,
        supportsHover: window.matchMedia('(hover: hover)').matches
      });
    };

    detectDevice();
    
    // Listen for orientation changes
    const handleOrientationChange = () => {
      setTimeout(detectDevice, 100); // Delay to get accurate dimensions
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Get optimized settings for current device
  const getOptimizedSettings = useCallback(() => {
    const { performanceTier, isMobile, screenSize } = deviceInfo;
    
    const settings = {
      // Particle system optimization
      particleCount: deviceInfo.maxParticles,
      
      // Rendering optimization
      antialias: performanceTier === 'high',
      shadows: performanceTier === 'high',
      pixelRatio: Math.min(deviceInfo.pixelRatio, performanceTier === 'low' ? 1 : 2),
      
      // Animation optimization
      targetFPS: performanceTier === 'low' ? 30 : 60,
      animationQuality: performanceTier,
      
      // UI optimization
      showAdvancedControls: !isMobile,
      compactUI: screenSize === 'mobile',
      
      // WebGL optimization
      powerPreference: isMobile ? 'low-power' : 'high-performance',
      failIfMajorPerformanceCaveat: false,
      
      // Memory optimization
      textureSize: performanceTier === 'low' ? 512 : performanceTier === 'medium' ? 1024 : 2048,
      bufferSize: performanceTier === 'low' ? 'small' : 'large'
    };

    return settings;
  }, [deviceInfo]);

  // Mobile-specific viewport handling
  const setupMobileViewport = useCallback(() => {
    if (!deviceInfo.isMobile) return;

    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);

    // Handle viewport meta tag
    let viewport = document.querySelector('meta[name=viewport]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';

    // Handle safe area insets for notched devices
    document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
    document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
    document.documentElement.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
    document.documentElement.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');
  }, [deviceInfo.isMobile]);

  // Performance monitoring
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 60,
    frameTime: 16.67,
    memoryUsage: 0,
    isThrottling: false
  });

  const monitorPerformance = useCallback(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let fpsArray = [];

    const measureFrame = (currentTime) => {
      frameCount++;
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= 1000) { // Every second
        const fps = Math.round((frameCount * 1000) / deltaTime);
        fpsArray.push(fps);
        
        // Keep only last 10 measurements
        if (fpsArray.length > 10) fpsArray.shift();
        
        const avgFPS = fpsArray.reduce((a, b) => a + b) / fpsArray.length;
        const isThrottling = avgFPS < 30;
        
        setPerformanceMetrics({
          fps: Math.round(avgFPS),
          frameTime: 1000 / avgFPS,
          memoryUsage: (performance.memory?.usedJSHeapSize || 0) / 1024 / 1024,
          isThrottling
        });
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFrame);
    };
    
    requestAnimationFrame(measureFrame);
  }, []);

  // Auto-adjust quality based on performance
  const [autoQualityEnabled, setAutoQualityEnabled] = useState(true);
  
  useEffect(() => {
    if (!autoQualityEnabled) return;
    
    if (performanceMetrics.isThrottling) {
      // Reduce quality automatically
      console.log('🔥 Performance throttling detected, reducing quality');
    }
  }, [performanceMetrics.isThrottling, autoQualityEnabled]);

  // Battery optimization
  const [batteryInfo, setBatteryInfo] = useState({
    level: 1,
    charging: true,
    lowBattery: false
  });

  useEffect(() => {
    if ('getBattery' in navigator) {
      navigator.getBattery().then((battery) => {
        const updateBatteryInfo = () => {
          setBatteryInfo({
            level: battery.level,
            charging: battery.charging,
            lowBattery: battery.level < 0.2 && !battery.charging
          });
        };
        
        updateBatteryInfo();
        battery.addEventListener('chargingchange', updateBatteryInfo);
        battery.addEventListener('levelchange', updateBatteryInfo);
      });
    }
  }, []);

  // Network optimization
  const [networkInfo, setNetworkInfo] = useState({
    effectiveType: '4g',
    downlink: 10,
    saveData: false
  });

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      const updateNetworkInfo = () => {
        setNetworkInfo({
          effectiveType: connection.effectiveType || '4g',
          downlink: connection.downlink || 10,
          saveData: connection.saveData || false
        });
      };
      
      updateNetworkInfo();
      connection.addEventListener('change', updateNetworkInfo);
    }
  }, []);

  return {
    deviceInfo,
    touchCapabilities,
    performanceMetrics,
    batteryInfo,
    networkInfo,
    getOptimizedSettings,
    setupMobileViewport,
    monitorPerformance,
    autoQualityEnabled,
    setAutoQualityEnabled
  };
};