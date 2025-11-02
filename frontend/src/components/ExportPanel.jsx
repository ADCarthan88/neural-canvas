/**
 * 💾 EXPORT PANEL
 * UI for saving, exporting, and sharing Neural Canvas creations
 */

import { useState, useRef, useCallback } from 'react';
import SaveExportManager from '../lib/SaveExportManager';

export default function ExportPanel({ 
  canvasRef, 
  rendererRef, 
  sceneRef, 
  cameraRef, 
  canvasState,
  onLoadState,
  isVisible, 
  onClose 
}) {
  const [exportManager] = useState(() => new SaveExportManager());
  const [isExporting, setIsExporting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const [lastExport, setLastExport] = useState(null);
  const fileInputRef = useRef(null);

  // Initialize export manager
  useState(() => {
    if (canvasRef && rendererRef && sceneRef && cameraRef) {
      exportManager.initialize(canvasRef, rendererRef, sceneRef, cameraRef);
    }
  });

  // Export image
  const handleExportImage = useCallback(async (format = 'png', preset = 'wallpaper') => {
    setIsExporting(true);
    setExportProgress(`Capturing ${preset} ${format.toUpperCase()}...`);
    
    try {
      const imageData = await exportManager.captureImage(format, preset);
      exportManager.downloadFile(imageData.blob, imageData.filename);
      
      setLastExport({
        type: 'image',
        filename: imageData.filename,
        size: `${imageData.width}x${imageData.height}`,
        format: format.toUpperCase()
      });
      
      setExportProgress('✅ Image exported successfully!');
      setTimeout(() => setExportProgress(''), 3000);
      
    } catch (error) {
      console.error('Export failed:', error);
      setExportProgress(`❌ Export failed: ${error.message}`);
      setTimeout(() => setExportProgress(''), 5000);
    } finally {
      setIsExporting(false);
    }
  }, [exportManager]);

  // Record video
  const handleRecordVideo = useCallback(async (duration = 10, format = 'webm', preset = 'wallpaper') => {
    setIsRecording(true);
    setExportProgress(`Recording ${duration}s video...`);
    
    try {
      const videoData = await exportManager.recordVideo(duration, 30, format, preset);
      exportManager.downloadFile(videoData.blob, videoData.filename);
      
      setLastExport({
        type: 'video',
        filename: videoData.filename,
        duration: `${duration}s`,
        format: format.toUpperCase()
      });
      
      setExportProgress('✅ Video recorded successfully!');
      setTimeout(() => setExportProgress(''), 3000);
      
    } catch (error) {
      console.error('Recording failed:', error);
      setExportProgress(`❌ Recording failed: ${error.message}`);
      setTimeout(() => setExportProgress(''), 5000);
    } finally {
      setIsRecording(false);
    }
  }, [exportManager]);

  // Save canvas state
  const handleSaveState = useCallback(() => {
    try {
      const saveData = exportManager.saveCanvasState(canvasState);
      exportManager.downloadFile(saveData.blob, saveData.filename);
      
      setLastExport({
        type: 'save',
        filename: saveData.filename,
        format: 'JSON'
      });
      
      setExportProgress('✅ Canvas state saved!');
      setTimeout(() => setExportProgress(''), 3000);
      
    } catch (error) {
      console.error('Save failed:', error);
      setExportProgress(`❌ Save failed: ${error.message}`);
      setTimeout(() => setExportProgress(''), 5000);
    }
  }, [exportManager, canvasState]);

  // Load canvas state
  const handleLoadState = useCallback(async (file) => {
    setExportProgress('Loading canvas state...');
    
    try {
      const saveData = await exportManager.loadCanvasState(file);
      onLoadState?.(saveData.state);
      
      setExportProgress('✅ Canvas state loaded!');
      setTimeout(() => setExportProgress(''), 3000);
      
    } catch (error) {
      console.error('Load failed:', error);
      setExportProgress(`❌ Load failed: ${error.message}`);
      setTimeout(() => setExportProgress(''), 5000);
    }
  }, [exportManager, onLoadState]);

  // Copy to clipboard
  const handleCopyToClipboard = useCallback(async (format = 'png', preset = 'social') => {
    setExportProgress('Copying to clipboard...');
    
    try {
      const imageData = await exportManager.captureImage(format, preset);
      await exportManager.copyToClipboard(imageData);
      
      setExportProgress('✅ Copied to clipboard!');
      setTimeout(() => setExportProgress(''), 3000);
      
    } catch (error) {
      console.error('Copy failed:', error);
      setExportProgress(`❌ Copy failed: ${error.message}`);
      setTimeout(() => setExportProgress(''), 5000);
    }
  }, [exportManager]);

  // Share to social
  const handleShare = useCallback(async (platform = 'twitter') => {
    setExportProgress(`Sharing to ${platform}...`);
    
    try {
      const imageData = await exportManager.captureImage('png', 'social');
      await exportManager.shareToSocial(imageData, platform);
      
      setExportProgress('✅ Shared successfully!');
      setTimeout(() => setExportProgress(''), 3000);
      
    } catch (error) {
      console.error('Share failed:', error);
      setExportProgress(`❌ Share failed: ${error.message}`);
      setTimeout(() => setExportProgress(''), 5000);
    }
  }, [exportManager]);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 100,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      borderRadius: '20px',
      padding: '30px',
      border: '3px solid #00ff00',
      boxShadow: '0 0 50px #00ff0050',
      maxWidth: '600px',
      maxHeight: '80vh',
      overflowY: 'auto',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          💾 SAVE & EXPORT
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          ×
        </button>
      </div>

      {/* Progress */}
      {exportProgress && (
        <div style={{
          backgroundColor: exportProgress.includes('❌') ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 255, 0, 0.2)',
          border: `2px solid ${exportProgress.includes('❌') ? '#ff0000' : '#00ff00'}`,
          borderRadius: '10px',
          padding: '15px',
          marginBottom: '20px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          {exportProgress}
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#00ff00' }}>⚡ Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            onClick={() => handleExportImage('png', 'wallpaper')}
            disabled={isExporting}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'rgba(0, 255, 0, 0.2)',
              color: 'white',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            📸 Screenshot
          </button>
          
          <button
            onClick={() => handleCopyToClipboard('png', 'social')}
            disabled={isExporting}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'rgba(0, 255, 0, 0.2)',
              color: 'white',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            📋 Copy
          </button>
          
          <button
            onClick={() => handleRecordVideo(10, 'webm', 'wallpaper')}
            disabled={isRecording || isExporting}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'rgba(255, 0, 100, 0.2)',
              color: 'white',
              cursor: (isRecording || isExporting) ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            🎥 Record 10s
          </button>
          
          <button
            onClick={handleSaveState}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'rgba(0, 100, 255, 0.2)',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            💾 Save State
          </button>
        </div>
      </div>

      {/* Image Export */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#00ff00' }}>📸 Image Export</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '15px' }}>
          {['social', 'wallpaper', 'mobile', 'ultra'].map(preset => (
            <button
              key={preset}
              onClick={() => handleExportImage('png', preset)}
              disabled={isExporting}
              style={{
                padding: '10px 8px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                cursor: isExporting ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              {preset === 'social' && '📱 Social (1080x1080)'}
              {preset === 'wallpaper' && '🖥️ Desktop (1920x1080)'}
              {preset === 'mobile' && '📱 Mobile (1080x1920)'}
              {preset === 'ultra' && '💎 4K (3840x2160)'}
            </button>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {['png', 'jpg', 'webp'].map(format => (
            <button
              key={format}
              onClick={() => handleExportImage(format, 'wallpaper')}
              disabled={isExporting}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                cursor: isExporting ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                flex: 1
              }}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Video Recording */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#00ff00' }}>🎥 Video Recording</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {[5, 10, 30].map(duration => (
            <button
              key={duration}
              onClick={() => handleRecordVideo(duration, 'webm', 'wallpaper')}
              disabled={isRecording || isExporting}
              style={{
                padding: '10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: isRecording ? 'rgba(255, 0, 0, 0.3)' : 'rgba(255, 0, 100, 0.2)',
                color: 'white',
                cursor: (isRecording || isExporting) ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              {isRecording ? '🔴 Recording...' : `🎬 ${duration}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Share */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#00ff00' }}>🌐 Share</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
          {[
            { platform: 'twitter', icon: '🐦', name: 'Twitter' },
            { platform: 'facebook', icon: '📘', name: 'Facebook' },
            { platform: 'linkedin', icon: '💼', name: 'LinkedIn' },
            { platform: 'reddit', icon: '🤖', name: 'Reddit' }
          ].map(({ platform, icon, name }) => (
            <button
              key={platform}
              onClick={() => handleShare(platform)}
              style={{
                padding: '10px 8px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '11px',
                textAlign: 'center'
              }}
            >
              {icon}<br/>{name}
            </button>
          ))}
        </div>
      </div>

      {/* Load State */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#00ff00' }}>📂 Load State</h3>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) handleLoadState(file);
          }}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '2px dashed rgba(255, 255, 255, 0.3)',
            backgroundColor: 'transparent',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          📁 Choose Save File (.json)
        </button>
      </div>

      {/* Last Export Info */}
      {lastExport && (
        <div style={{
          backgroundColor: 'rgba(0, 255, 0, 0.1)',
          border: '1px solid #00ff00',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '12px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>✅ Last Export:</div>
          <div>{lastExport.filename}</div>
          <div style={{ color: '#aaa' }}>
            {lastExport.type === 'image' && `${lastExport.size} ${lastExport.format}`}
            {lastExport.type === 'video' && `${lastExport.duration} ${lastExport.format}`}
            {lastExport.type === 'save' && `Canvas State ${lastExport.format}`}
          </div>
        </div>
      )}
    </div>
  );
}