import { useState, useEffect } from 'react';
import InclusiveNeuralCanvas from './InclusiveNeuralCanvas';
import MobileNeuralCanvas from './MobileNeuralCanvas';
import PerformanceNeuralCanvas from './PerformanceNeuralCanvas';

export default function MasterCanvas() {
  const [deviceType, setDeviceType] = useState('desktop');
  const [performanceMode, setPerformanceMode] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  
  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const width = window.innerWidth;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || width < 768;
      
      // Auto-enable performance mode for lower-end devices
      const isLowEnd = /android.*chrome\/[1-6][0-9]|iphone.*version\/[1-9]\./i.test(userAgent);
      
      setDeviceType(isMobileDevice ? 'mobile' : 'desktop');
      
      // Auto-enable performance mode on low-end devices
      if (isLowEnd) {
        setPerformanceMode(true);
      }
    };
    
    detectDevice();
    window.addEventListener('resize', detectDevice);
    
    // Keyboard shortcut for performance mode (P key)
    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === 'p' && e.ctrlKey) {
        e.preventDefault();
        setPerformanceMode(prev => !prev);
      }
      if (e.key.toLowerCase() === 'm' && e.ctrlKey) {
        e.preventDefault();
        setShowModeSelector(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);
  
  // Render appropriate canvas based on settings
  const renderCanvas = () => {
    if (performanceMode) {
      return <PerformanceNeuralCanvas />;
    }
    return deviceType === 'mobile' ? <MobileNeuralCanvas /> : <InclusiveNeuralCanvas />;
  };
  
  return (
    <>
      {renderCanvas()}
      
      {/* Mode Selector */}
      {showModeSelector && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100,
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          borderRadius: '15px',
          padding: '30px',
          border: '3px solid #00ff00',
          boxShadow: '0 0 50px #00ff0050'
        }}>
          <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '20px' }}>
            ⚡ SELECT CANVAS MODE
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button
              onClick={() => {
                setPerformanceMode(true);
                setShowModeSelector(false);
              }}
              style={{
                padding: '15px 25px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: performanceMode ? '#00ff0020' : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                border: performanceMode ? '2px solid #00ff00' : '2px solid transparent'
              }}
            >
              ⚡ PERFORMANCE BEAST MODE
              <div style={{ fontSize: '12px', color: '#aaa', marginTop: '5px' }}>
                Real-time optimization, adaptive quality, performance monitoring
              </div>
            </button>
            
            <button
              onClick={() => {
                setPerformanceMode(false);
                setShowModeSelector(false);
              }}
              style={{
                padding: '15px 25px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: !performanceMode ? '#00ff0020' : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                border: !performanceMode ? '2px solid #00ff00' : '2px solid transparent'
              }}
            >
              {deviceType === 'mobile' ? '📱 MOBILE OPTIMIZED' : '🖥️ DESKTOP FULL FEATURES'}
              <div style={{ fontSize: '12px', color: '#aaa', marginTop: '5px' }}>
                {deviceType === 'mobile' ? 'Touch gestures, mobile UI, battery optimized' : 'All features, voice control, ASL recognition'}
              </div>
            </button>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#aaa' }}>
            Press Ctrl+M to toggle this menu | Ctrl+P for performance mode
          </div>
          
          <button
            onClick={() => setShowModeSelector(false)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '15px',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
      )}
      
      {/* Performance Mode Indicator */}
      {performanceMode && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          zIndex: 50,
          backgroundColor: 'rgba(0, 255, 0, 0.1)',
          border: '2px solid #00ff00',
          borderRadius: '10px',
          padding: '10px 15px',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          ⚡ PERFORMANCE MODE ACTIVE
        </div>
      )}
      
      {/* Quick Mode Toggle */}
      <button
        onClick={() => setShowModeSelector(true)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 50,
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          fontSize: '20px',
          cursor: 'pointer',
          boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)'
        }}
        title="Switch Canvas Mode (Ctrl+M)"
      >
        ⚙️
      </button>
    </>
  );
}