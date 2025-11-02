/**
 * 💾 SAVE/EXPORT MANAGER
 * Captures, saves, and exports Neural Canvas creations
 */

export class SaveExportManager {
  constructor() {
    this.canvasRef = null;
    this.rendererRef = null;
    this.sceneRef = null;
    this.cameraRef = null;
    
    this.exportFormats = {
      png: { ext: 'png', mime: 'image/png', quality: 1.0 },
      jpg: { ext: 'jpg', mime: 'image/jpeg', quality: 0.9 },
      webp: { ext: 'webp', mime: 'image/webp', quality: 0.8 }
    };
    
    this.videoFormats = {
      webm: { ext: 'webm', mime: 'video/webm' },
      mp4: { ext: 'mp4', mime: 'video/mp4' }
    };
    
    this.presets = {
      social: { width: 1080, height: 1080, quality: 0.9 }, // Instagram
      wallpaper: { width: 1920, height: 1080, quality: 1.0 }, // Desktop
      mobile: { width: 1080, height: 1920, quality: 0.8 }, // Phone wallpaper
      thumbnail: { width: 512, height: 512, quality: 0.7 }, // Preview
      ultra: { width: 3840, height: 2160, quality: 1.0 } // 4K
    };
  }

  /**
   * Initialize with Three.js references
   */
  initialize(canvasRef, rendererRef, sceneRef, cameraRef) {
    this.canvasRef = canvasRef;
    this.rendererRef = rendererRef;
    this.sceneRef = sceneRef;
    this.cameraRef = cameraRef;
  }

  /**
   * Capture current canvas as image with validation
   */
  async captureImage(format = 'png', preset = 'wallpaper', customSize = null) {
    // Comprehensive validation
    if (!this.rendererRef?.current) {
      throw new Error('Canvas renderer not ready. Please wait for the canvas to load.');
    }

    const renderer = this.rendererRef.current;
    const scene = this.sceneRef?.current;
    const camera = this.cameraRef?.current;
    
    if (!scene || !camera) {
      throw new Error('3D scene not ready. Please wait for the canvas to fully initialize.');
    }
    
    // Validate format and preset
    if (!this.exportFormats[format]) {
      throw new Error(`Unsupported format: ${format}. Use png, jpg, or webp.`);
    }
    
    if (!customSize && !this.presets[preset]) {
      throw new Error(`Unsupported preset: ${preset}. Use social, wallpaper, mobile, thumbnail, or ultra.`);
    }

    // Get export settings
    const settings = customSize || this.presets[preset];
    const formatConfig = this.exportFormats[format];
    
    if (!formatConfig) {
      throw new Error(`Unsupported format: ${format}`);
    }

    // Store original size
    const originalSize = renderer.getSize(new THREE.Vector2());
    const originalPixelRatio = renderer.getPixelRatio();
    
    try {
      // Set export resolution
      renderer.setSize(settings.width, settings.height);
      renderer.setPixelRatio(1); // Use 1:1 for consistent export
      
      // Update camera aspect ratio
      const originalAspect = camera.aspect;
      camera.aspect = settings.width / settings.height;
      camera.updateProjectionMatrix();
      
      // Render frame
      renderer.render(scene, camera);
      
      // Capture image data
      const canvas = renderer.domElement;
      const dataURL = canvas.toDataURL(formatConfig.mime, formatConfig.quality);
      
      // Restore original settings
      renderer.setSize(originalSize.x, originalSize.y);
      renderer.setPixelRatio(originalPixelRatio);
      camera.aspect = originalAspect;
      camera.updateProjectionMatrix();
      
      return {
        dataURL,
        blob: await this.dataURLToBlob(dataURL),
        filename: this.generateFilename(formatConfig.ext, preset),
        width: settings.width,
        height: settings.height,
        format: format
      };
      
    } catch (error) {
      // Restore settings on error
      renderer.setSize(originalSize.x, originalSize.y);
      renderer.setPixelRatio(originalPixelRatio);
      camera.aspect = originalAspect;
      camera.updateProjectionMatrix();
      throw error;
    }
  }

  /**
   * Record video of the canvas with validation
   */
  async recordVideo(duration = 10, fps = 30, format = 'webm', preset = 'wallpaper') {
    // Comprehensive validation
    if (!this.rendererRef?.current) {
      throw new Error('Canvas renderer not ready. Please wait for the canvas to load.');
    }

    const canvas = this.rendererRef.current.domElement;
    
    if (!canvas || !canvas.captureStream) {
      throw new Error('Video recording not supported in this browser.');
    }
    
    const settings = this.presets[preset];
    const formatConfig = this.videoFormats[format];
    
    if (!formatConfig) {
      throw new Error(`Unsupported video format: ${format}. Use webm or mp4.`);
    }
    
    if (!settings) {
      throw new Error(`Unsupported preset: ${preset}. Use social, wallpaper, mobile, thumbnail, or ultra.`);
    }

    // Check MediaRecorder support
    if (!window.MediaRecorder) {
      throw new Error('Video recording not supported in this browser.');
    }
    
    if (!MediaRecorder.isTypeSupported(formatConfig.mime)) {
      // Try fallback format
      const fallbackFormat = format === 'webm' ? 'mp4' : 'webm';
      const fallbackConfig = this.videoFormats[fallbackFormat];
      
      if (fallbackConfig && MediaRecorder.isTypeSupported(fallbackConfig.mime)) {
        console.warn(`${format} not supported, using ${fallbackFormat}`);
        format = fallbackFormat;
        formatConfig.mime = fallbackConfig.mime;
      } else {
        throw new Error(`Video recording not supported in this browser. Try a different browser.`);
      }
    }

    const stream = canvas.captureStream(fps);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: formatConfig.mime,
      videoBitsPerSecond: 8000000 // 8 Mbps
    });

    const chunks = [];
    
    return new Promise((resolve, reject) => {
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: formatConfig.mime });
        const url = URL.createObjectURL(blob);
        
        resolve({
          blob,
          url,
          filename: this.generateFilename(formatConfig.ext, preset, 'video'),
          duration,
          fps,
          format
        });
      };

      mediaRecorder.onerror = (event) => {
        reject(new Error(`Recording failed: ${event.error}`));
      };

      // Start recording
      mediaRecorder.start();
      
      // Stop after duration
      setTimeout(() => {
        mediaRecorder.stop();
      }, duration * 1000);
    });
  }

  /**
   * Save current canvas state
   */
  saveCanvasState(canvasState) {
    const saveData = {
      timestamp: Date.now(),
      version: '1.0',
      state: canvasState,
      metadata: {
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        devicePixelRatio: window.devicePixelRatio
      }
    };

    const filename = this.generateFilename('json', 'state', 'save');
    const blob = new Blob([JSON.stringify(saveData, null, 2)], { 
      type: 'application/json' 
    });

    return {
      blob,
      filename,
      data: saveData
    };
  }

  /**
   * Load canvas state
   */
  async loadCanvasState(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          
          // Validate save data
          if (!data.state || !data.version) {
            throw new Error('Invalid save file format');
          }
          
          resolve(data);
        } catch (error) {
          reject(new Error(`Failed to load save file: ${error.message}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Download file
   */
  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Share to social media
   */
  async shareToSocial(imageData, platform = 'twitter') {
    const shareData = {
      title: 'Neural Canvas Creation',
      text: 'Check out my AI-powered neural canvas creation! 🧠✨',
      url: window.location.href
    };

    // Try native Web Share API first
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return { success: true, method: 'native' };
      } catch (error) {
        console.log('Native share cancelled or failed');
      }
    }

    // Fallback to platform-specific URLs
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      return { success: true, method: 'url' };
    }

    throw new Error(`Unsupported platform: ${platform}`);
  }

  /**
   * Copy image to clipboard with fallback
   */
  async copyToClipboard(imageData) {
    // Check for clipboard support
    if (!navigator.clipboard) {
      throw new Error('Clipboard not supported in this browser. Try using HTTPS or a modern browser.');
    }

    try {
      // Try modern clipboard API
      if (navigator.clipboard.write && window.ClipboardItem) {
        const clipboardItem = new ClipboardItem({
          [imageData.blob.type]: imageData.blob
        });
        
        await navigator.clipboard.write([clipboardItem]);
        return { success: true };
      }
      
      // Fallback to text clipboard
      if (navigator.clipboard.writeText) {
        await navigator.clipboard.writeText('Neural Canvas creation copied! Paste this link to share: ' + window.location.href);
        return { success: true, fallback: true };
      }
      
      throw new Error('Clipboard API not available');
      
    } catch (error) {
      // Final fallback - create download link
      console.warn('Clipboard failed, creating download instead:', error);
      this.downloadFile(imageData.blob, 'neural-canvas-copy.png');
      return { success: true, downloaded: true };
    }
  }

  /**
   * Generate filename with timestamp
   */
  generateFilename(extension, preset = 'export', type = 'image') {
    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .split('.')[0];
    
    return `neural-canvas_${type}_${preset}_${timestamp}.${extension}`;
  }

  /**
   * Convert data URL to blob
   */
  async dataURLToBlob(dataURL) {
    const response = await fetch(dataURL);
    return response.blob();
  }

  /**
   * Get export presets
   */
  getPresets() {
    return Object.keys(this.presets).map(key => ({
      key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      ...this.presets[key]
    }));
  }

  /**
   * Get supported formats
   */
  getSupportedFormats() {
    return {
      image: Object.keys(this.exportFormats),
      video: Object.keys(this.videoFormats).filter(format => 
        MediaRecorder.isTypeSupported(this.videoFormats[format].mime)
      )
    };
  }

  /**
   * Estimate file size
   */
  estimateFileSize(preset, format) {
    const settings = this.presets[preset];
    const pixels = settings.width * settings.height;
    
    // Rough estimates in bytes
    const estimates = {
      png: pixels * 4, // Uncompressed RGBA
      jpg: pixels * 0.5, // Compressed
      webp: pixels * 0.3 // Highly compressed
    };
    
    return estimates[format] || pixels;
  }
}

export default SaveExportManager;