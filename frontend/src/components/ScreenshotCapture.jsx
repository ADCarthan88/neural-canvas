import { useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';

export default function ScreenshotCapture({ onCapture }) {
  const { gl, scene, camera } = useThree();
  const [isCapturing, setIsCapturing] = useState(false);

  const captureScreenshot = async (format = 'png', quality = 1.0) => {
    setIsCapturing(true);
    
    try {
      // Render at high resolution
      const originalSize = gl.getSize(new THREE.Vector2());
      const targetWidth = 1920;
      const targetHeight = 1080;
      
      gl.setSize(targetWidth, targetHeight);
      gl.render(scene, camera);
      
      // Capture the canvas
      const canvas = gl.domElement;
      const dataURL = canvas.toDataURL(`image/${format}`, quality);
      
      // Create download link
      const link = document.createElement('a');
      link.download = `neural-canvas-${Date.now()}.${format}`;
      link.href = dataURL;
      link.click();
      
      // Restore original size
      gl.setSize(originalSize.x, originalSize.y);
      
      if (onCapture) onCapture(dataURL);
      
    } catch (error) {
      console.error('Screenshot capture failed:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const captureGIF = async (duration = 3000) => {
    setIsCapturing(true);
    
    try {
      // This would require a GIF library like gif.js
      console.log('GIF capture would be implemented here');
      // Implementation would capture frames over time and compile to GIF
    } catch (error) {
      console.error('GIF capture failed:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="absolute bottom-4 right-4 z-20 bg-black/40 backdrop-blur-lg rounded-lg p-3">
      <div className="flex gap-2">
        <button
          onClick={() => captureScreenshot('png')}
          disabled={isCapturing}
          className="px-3 py-1 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded text-xs font-bold hover:shadow-lg transition-all disabled:opacity-50"
        >
          {isCapturing ? '📸 Capturing...' : '📸 PNG'}
        </button>
        
        <button
          onClick={() => captureScreenshot('jpeg', 0.9)}
          disabled={isCapturing}
          className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded text-xs font-bold hover:shadow-lg transition-all disabled:opacity-50"
        >
          📷 JPG
        </button>
        
        <button
          onClick={() => captureGIF()}
          disabled={isCapturing}
          className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded text-xs font-bold hover:shadow-lg transition-all disabled:opacity-50"
        >
          🎬 GIF
        </button>
      </div>
    </div>
  );
}