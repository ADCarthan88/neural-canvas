/**
 * ⚡ PERFORMANCE BEAST MODE MANAGER
 * Monitors and optimizes performance in real-time
 */

export class PerformanceManager {
  constructor() {
    this.metrics = {
      fps: 60,
      frameTime: 16.67,
      memoryUsage: 0,
      drawCalls: 0,
      triangles: 0,
      lastFrameTime: performance.now()
    };
    
    this.settings = {
      targetFPS: 60,
      minFPS: 30,
      maxParticles: 8000,
      minParticles: 500,
      qualityLevel: 'high', // high, medium, low, potato
      adaptiveQuality: true,
      vsync: true
    };
    
    this.qualityPresets = {
      potato: {
        maxParticles: 300,
        geometryDetail: 0.2,
        shadowQuality: 0,
        antialiasing: false,
        postProcessing: false,
        particleSize: 0.03,
        renderScale: 0.5
      },
      low: {
        maxParticles: 800,
        geometryDetail: 0.4,
        shadowQuality: 0,
        antialiasing: false,
        postProcessing: false,
        particleSize: 0.05,
        renderScale: 0.7
      },
      medium: {
        maxParticles: 2000,
        geometryDetail: 0.7,
        shadowQuality: 1,
        antialiasing: true,
        postProcessing: true,
        particleSize: 0.08,
        renderScale: 0.8
      },
      high: {
        maxParticles: 5000,
        geometryDetail: 1.0,
        shadowQuality: 2,
        antialiasing: true,
        postProcessing: true,
        particleSize: 0.1,
        renderScale: 1.0
      },
      ultra: {
        maxParticles: 8000,
        geometryDetail: 1.2,
        shadowQuality: 3,
        antialiasing: true,
        postProcessing: true,
        particleSize: 0.12,
        renderScale: 1.0
      }
    };
    
    this.frameHistory = [];
    this.performanceCallbacks = [];
    this.isMonitoring = false;
  }

  /**
   * Start performance monitoring
   */
  startMonitoring() {
    this.isMonitoring = true;
    this.monitorLoop();
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring() {
    this.isMonitoring = false;
  }

  /**
   * Main monitoring loop
   */
  monitorLoop() {
    if (!this.isMonitoring) return;
    
    const now = performance.now();
    const frameTime = now - this.metrics.lastFrameTime;
    
    // Update metrics
    this.metrics.frameTime = frameTime;
    this.metrics.fps = 1000 / frameTime;
    this.metrics.lastFrameTime = now;
    
    // Track frame history
    this.frameHistory.push(this.metrics.fps);
    if (this.frameHistory.length > 60) {
      this.frameHistory.shift();
    }
    
    // Get memory usage if available
    if (performance.memory) {
      this.metrics.memoryUsage = performance.memory.usedJSHeapSize / 1048576; // MB
    }
    
    // Adaptive quality adjustment
    if (this.settings.adaptiveQuality) {
      this.adjustQuality();
    }
    
    // Notify callbacks
    this.performanceCallbacks.forEach(callback => {
      callback(this.metrics, this.getCurrentQuality());
    });
    
    requestAnimationFrame(() => this.monitorLoop());
  }

  /**
   * Automatically adjust quality based on performance
   */
  adjustQuality() {
    const avgFPS = this.getAverageFPS();
    const currentQuality = this.settings.qualityLevel;
    
    // Performance is too low - reduce quality
    if (avgFPS < this.settings.minFPS) {
      switch (currentQuality) {
        case 'ultra':
          this.setQuality('high');
          break;
        case 'high':
          this.setQuality('medium');
          break;
        case 'medium':
          this.setQuality('low');
          break;
        case 'low':
          this.setQuality('potato');
          break;
      }
    }
    // Performance is good - try to increase quality
    else if (avgFPS > this.settings.targetFPS * 0.9) {
      switch (currentQuality) {
        case 'potato':
          this.setQuality('low');
          break;
        case 'low':
          this.setQuality('medium');
          break;
        case 'medium':
          this.setQuality('high');
          break;
        case 'high':
          if (avgFPS > this.settings.targetFPS * 0.95) {
            this.setQuality('ultra');
          }
          break;
      }
    }
  }

  /**
   * Set quality level
   */
  setQuality(level) {
    if (this.qualityPresets[level]) {
      this.settings.qualityLevel = level;
      console.log(`🎯 Performance: Switched to ${level} quality (FPS: ${this.metrics.fps.toFixed(1)})`);
    }
  }

  /**
   * Get current quality settings
   */
  getCurrentQuality() {
    return this.qualityPresets[this.settings.qualityLevel];
  }

  /**
   * Get average FPS over last 60 frames
   */
  getAverageFPS() {
    if (this.frameHistory.length === 0) return 60;
    return this.frameHistory.reduce((sum, fps) => sum + fps, 0) / this.frameHistory.length;
  }

  /**
   * Get performance grade
   */
  getPerformanceGrade() {
    const avgFPS = this.getAverageFPS();
    if (avgFPS >= 55) return 'A+';
    if (avgFPS >= 45) return 'A';
    if (avgFPS >= 35) return 'B';
    if (avgFPS >= 25) return 'C';
    return 'D';
  }

  /**
   * Optimize particle count based on performance
   */
  getOptimalParticleCount(requestedCount) {
    const quality = this.getCurrentQuality();
    const maxAllowed = quality.maxParticles;
    
    // Apply performance-based scaling
    const avgFPS = this.getAverageFPS();
    let scaleFactor = 1.0;
    
    if (avgFPS < 30) scaleFactor = 0.5;
    else if (avgFPS < 45) scaleFactor = 0.7;
    else if (avgFPS < 55) scaleFactor = 0.9;
    
    return Math.min(requestedCount, Math.floor(maxAllowed * scaleFactor));
  }

  /**
   * Get geometry detail level
   */
  getGeometryDetail() {
    return this.getCurrentQuality().geometryDetail;
  }

  /**
   * Check if feature should be enabled
   */
  shouldEnableFeature(feature) {
    const quality = this.getCurrentQuality();
    
    switch (feature) {
      case 'antialiasing':
        return quality.antialiasing;
      case 'postProcessing':
        return quality.postProcessing;
      case 'shadows':
        return quality.shadowQuality > 0;
      case 'bloom':
        return quality.postProcessing && this.getAverageFPS() > 45;
      case 'motionBlur':
        return quality.postProcessing && this.getAverageFPS() > 50;
      default:
        return true;
    }
  }

  /**
   * Get render scale for resolution scaling
   */
  getRenderScale() {
    return this.getCurrentQuality().renderScale;
  }

  /**
   * Subscribe to performance updates
   */
  onPerformanceUpdate(callback) {
    this.performanceCallbacks.push(callback);
  }

  /**
   * Unsubscribe from performance updates
   */
  offPerformanceUpdate(callback) {
    const index = this.performanceCallbacks.indexOf(callback);
    if (index > -1) {
      this.performanceCallbacks.splice(index, 1);
    }
  }

  /**
   * Force garbage collection (if available)
   */
  forceGarbageCollection() {
    if (window.gc) {
      window.gc();
    }
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    return {
      fps: this.metrics.fps,
      avgFPS: this.getAverageFPS(),
      frameTime: this.metrics.frameTime,
      memoryUsage: this.metrics.memoryUsage,
      qualityLevel: this.settings.qualityLevel,
      grade: this.getPerformanceGrade(),
      drawCalls: this.metrics.drawCalls,
      triangles: this.metrics.triangles
    };
  }

  /**
   * Detect device capabilities
   */
  detectDeviceCapabilities() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) return { tier: 'potato' };
    
    const capabilities = {
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
      extensions: gl.getSupportedExtensions(),
      renderer: gl.getParameter(gl.RENDERER),
      vendor: gl.getParameter(gl.VENDOR)
    };
    
    // Determine device tier based on capabilities
    let tier = 'medium';
    
    if (capabilities.maxTextureSize >= 8192 && capabilities.extensions.length > 20) {
      tier = 'high';
    } else if (capabilities.maxTextureSize < 2048 || capabilities.extensions.length < 10) {
      tier = 'low';
    }
    
    // Check for mobile GPU indicators
    const renderer = capabilities.renderer.toLowerCase();
    if (renderer.includes('adreno') || renderer.includes('mali') || renderer.includes('powervr')) {
      tier = tier === 'high' ? 'medium' : 'low';
    }
    
    return { tier, capabilities };
  }

  /**
   * Initialize with device-appropriate settings
   */
  initializeForDevice() {
    const device = this.detectDeviceCapabilities();
    
    switch (device.tier) {
      case 'high':
        this.setQuality('high');
        break;
      case 'medium':
        this.setQuality('medium');
        break;
      case 'low':
        this.setQuality('low');
        break;
      default:
        this.setQuality('potato');
    }
    
    console.log(`🚀 Performance: Initialized for ${device.tier} tier device`);
    return device;
  }
}

export default PerformanceManager;