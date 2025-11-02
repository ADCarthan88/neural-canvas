/**
 * ⚡ PERFORMANCE NEURAL CANVAS
 * Ultra-optimized version with real-time performance monitoring
 */

'use client';

import { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import * as THREE from 'three';
import PerformanceManager from '../lib/PerformanceManager';
import OptimizedParticleSystem from './OptimizedParticleSystem';
import AICommandEngine from '../lib/AICommandEngine';
import useMobileDetection from '../hooks/useMobileDetection';
import useTouchGestures from '../hooks/useTouchGestures';
import ExportPanel from './ExportPanel';
import AIGenerationPanel from './AIGenerationPanel';

// Optimized visual modes
const modes = {
  neural: { 
    name: '🧠 Neural',
    geometry: 'torus',
    wireframe: true,
    complexity: 0.8
  },
  quantum: { 
    name: '⚛️ Quantum',
    geometry: 'sphere',
    wireframe: false,
    complexity: 0.6
  },
  cosmic: { 
    name: '🌌 Cosmic',
    geometry: 'octahedron',
    wireframe: true,
    complexity: 1.0
  },
  plasma: { 
    name: '⚡ Plasma',
    geometry: 'icosahedron',
    wireframe: false,
    complexity: 1.2
  }
};

function OptimizedNeuralMesh({ color, intensity, morphing, mode, performanceManager }) {
  const meshRef = useRef();
  const modeConfig = modes[mode] || modes.neural;
  
  // Get performance-based geometry detail
  const geometryDetail = performanceManager?.getGeometryDetail() || 1.0;
  const complexity = modeConfig.complexity * geometryDetail;

  const getOptimizedGeometry = useCallback(() => {
    const segments = Math.max(8, Math.floor(32 * complexity));
    const scale = 1.0;
    
    switch (modeConfig.geometry) {
      case 'sphere': 
        return <sphereGeometry args={[1.2 * scale, segments, segments]} />;
      case 'octahedron': 
        return <octahedronGeometry args={[1.5 * scale]} />;
      case 'icosahedron': 
        return <icosahedronGeometry args={[1.3 * scale]} />;
      default: 
        return <torusKnotGeometry args={[1 * scale, 0.3 * scale, Math.floor(100 * complexity), Math.floor(16 * complexity)]} />;
    }
  }, [modeConfig.geometry, complexity]);

  return (
    <mesh ref={meshRef}>
      {getOptimizedGeometry()}
      <meshStandardMaterial 
        color={color} 
        wireframe={modeConfig.wireframe}
        transparent 
        opacity={modeConfig.wireframe ? 0.8 : 0.6}
        emissive={color}
        emissiveIntensity={intensity * (mode === 'plasma' ? 0.4 : 0.2)}
        roughness={mode === 'quantum' ? 0.1 : 0.5}
        metalness={mode === 'plasma' ? 0.8 : 0.2}
      />
    </mesh>
  );
}

export default function PerformanceNeuralCanvas() {
  const deviceInfo = useMobileDetection();
  const performanceManager = useRef(new PerformanceManager());
  const aiEngine = useRef(new AICommandEngine());
  
  // Canvas state
  const [mode, setMode] = useState('neural');
  const [intensity, setIntensity] = useState(1.0);
  const [particleCount, setParticleCount] = useState(2000);
  const [primaryColor, setPrimaryColor] = useState('#ff006e');
  const [secondaryColor, setSecondaryColor] = useState('#8338ec');
  const [speed, setSpeed] = useState(1.0);
  const [morphing, setMorphing] = useState(true);
  
  // Performance states
  const [performanceStats, setPerformanceStats] = useState({
    fps: 60,
    quality: 'high',
    grade: 'A+',
    memoryUsage: 0
  });
  const [showStats, setShowStats] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  
  // Export states
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);

  // Initialize performance manager
  useEffect(() => {
    const pm = performanceManager.current;
    
    // Initialize for current device
    pm.initializeForDevice();
    
    // Start monitoring
    pm.startMonitoring();
    
    // Subscribe to performance updates
    const handlePerformanceUpdate = (metrics, quality) => {
      setPerformanceStats({
        fps: Math.round(metrics.fps),
        avgFPS: Math.round(pm.getAverageFPS()),
        quality: pm.settings.qualityLevel,
        grade: pm.getPerformanceGrade(),
        memoryUsage: Math.round(metrics.memoryUsage),
        drawCalls: metrics.drawCalls,
        triangles: metrics.triangles
      });
      
      // Auto-adjust particle count based on performance
      const optimalCount = pm.getOptimalParticleCount(particleCount);
      if (optimalCount !== particleCount && Math.abs(optimalCount - particleCount) > 100) {
        setParticleCount(optimalCount);
      }
    };
    
    pm.onPerformanceUpdate(handlePerformanceUpdate);
    
    return () => {
      pm.stopMonitoring();
      pm.offPerformanceUpdate(handlePerformanceUpdate);
    };
  }, []);

  // AI command execution
  const executeAICommand = useCallback((input) => {
    const currentState = { mode, intensity, particleCount, speed, primaryColor, secondaryColor };
    const setters = { setMode, setIntensity, setPrimaryColor, setSecondaryColor, setParticleCount, setSpeed, setMorphing };
    
    const result = aiEngine.current.interpretCommand(input, currentState);
    
    if (result.understood) {
      aiEngine.current.executeActions(result.actions, currentState, setters);
      setAiResponse(result.response);
      setTimeout(() => setAiResponse(''), 3000);
    }
  }, [mode, intensity, particleCount, speed, primaryColor, secondaryColor]);

  // Touch gesture handling
  const handleTouchGesture = useCallback((gesture, confidence) => {
    const gestureCommands = {
      'SWIPE_UP': 'make it brighter and more intense',
      'SWIPE_DOWN': 'make it dimmer and calmer',
      'SWIPE_LEFT': 'change to previous visual mode',
      'SWIPE_RIGHT': 'change to next visual mode',
      'PINCH_OUT': 'add more particles',
      'PINCH_IN': 'reduce particles',
      'LONG_PRESS': 'reset to default settings'
    };
    
    if (gestureCommands[gesture]) {
      executeAICommand(gestureCommands[gesture]);
    }
  }, [executeAICommand]);

  const gestureState = useTouchGestures(handleTouchGesture);
  
  // Get current canvas state for saving
  const getCurrentCanvasState = useCallback(() => {
    return {
      mode,
      intensity,
      particleCount,
      primaryColor,
      secondaryColor,
      speed,
      morphing,
      performanceSettings: {
        quality: performanceStats.quality,
        fps: performanceStats.fps
      }
    };
  }, [mode, intensity, particleCount, primaryColor, secondaryColor, speed, morphing, performanceStats]);
  
  // Load canvas state
  const handleLoadCanvasState = useCallback((state) => {
    if (state.mode) setMode(state.mode);
    if (state.intensity !== undefined) setIntensity(state.intensity);
    if (state.particleCount) setParticleCount(state.particleCount);
    if (state.primaryColor) setPrimaryColor(state.primaryColor);
    if (state.secondaryColor) setSecondaryColor(state.secondaryColor);
    if (state.speed !== undefined) setSpeed(state.speed);
    if (state.morphing !== undefined) setMorphing(state.morphing);
  }, []);

  // Performance-based canvas settings
  const getCanvasSettings = useCallback(() => {
    const quality = performanceManager.current.getCurrentQuality();
    const renderScale = performanceManager.current.getRenderScale();
    
    return {
      antialias: quality.antialiasing,
      alpha: true,
      powerPreference: "high-performance",
      pixelRatio: Math.min(window.devicePixelRatio * renderScale, 2),
      shadowMap: quality.shadowQuality > 0,
      toneMapping: THREE.ACESFilmicToneMapping,
      toneMappingExposure: 1.0
    };
  }, []);

  const canvasSettings = getCanvasSettings();

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#000', 
      position: 'relative', 
      overflow: 'hidden'
    }}>
      {/* Performance Stats Toggle */}
      <button
        onClick={() => setShowStats(!showStats)}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 20,
          padding: '10px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          fontSize: '12px',
          cursor: 'pointer'
        }}
      >
        ⚡ PERF
      </button>

      {/* Performance Dashboard */}
      {showStats && (
        <div style={{
          position: 'absolute',
          top: '60px',
          left: '20px',
          zIndex: 15,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          borderRadius: '10px',
          padding: '15px',
          color: 'white',
          fontSize: '12px',
          minWidth: '200px',
          border: `2px solid ${performanceStats.grade === 'A+' ? '#00ff00' : 
                                performanceStats.grade.startsWith('A') ? '#ffff00' : 
                                performanceStats.grade === 'B' ? '#ff8800' : '#ff0000'}`
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>
            ⚡ PERFORMANCE BEAST MODE
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>FPS: <strong>{performanceStats.fps}</strong></div>
            <div>Avg: <strong>{performanceStats.avgFPS}</strong></div>
            <div>Grade: <strong style={{ color: performanceStats.grade === 'A+' ? '#00ff00' : '#ffaa00' }}>
              {performanceStats.grade}
            </strong></div>
            <div>Quality: <strong>{performanceStats.quality}</strong></div>
            <div>Memory: <strong>{performanceStats.memoryUsage}MB</strong></div>
            <div>Particles: <strong>{particleCount}</strong></div>
          </div>
          
          <div style={{ marginTop: '10px', fontSize: '10px', color: '#aaa' }}>
            🎯 Auto-optimizing for peak performance
          </div>
        </div>
      )}

      {/* AI Response */}
      {aiResponse && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 20,
          backgroundColor: 'rgba(0, 255, 0, 0.1)',
          border: '2px solid #00ff00',
          borderRadius: '10px',
          padding: '15px',
          color: 'white',
          fontSize: '14px',
          maxWidth: '300px'
        }}>
          {aiResponse}
        </div>
      )}

      {/* Touch Feedback */}
      {gestureState.currentGesture && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '20px',
          fontSize: '14px',
          border: '2px solid #00ff00'
        }}>
          {gestureState.currentGesture} ({Math.round(gestureState.confidence * 100)}%)
        </div>
      )}

      {/* Optimized 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={canvasSettings}
        onCreated={({ gl, scene, camera }) => {
          // Store references for export
          rendererRef.current = gl;
          sceneRef.current = scene;
          cameraRef.current = camera;
          canvasRef.current = gl.domElement;
          
          // Additional WebGL optimizations
          gl.setPixelRatio(canvasSettings.pixelRatio);
          gl.setClearColor(0x000000, 1);
          
          // Enable performance extensions if available
          const ext = gl.getExtension('WEBGL_lose_context');
          if (ext) {
            // Context loss recovery
            gl.canvas.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              console.warn('WebGL context lost, attempting recovery...');
            });
          }
        }}
      >
        <Suspense fallback={null}>
          {/* Optimized lighting */}
          <ambientLight intensity={0.4} />
          <pointLight 
            position={[10, 10, 10]} 
            intensity={1} 
            color={primaryColor}
            castShadow={performanceManager.current.shouldEnableFeature('shadows')}
          />
          <pointLight 
            position={[-10, -10, -10]} 
            intensity={0.5} 
            color={secondaryColor} 
          />
          
          {/* Performance-aware controls */}
          <OrbitControls 
            enablePan={false} 
            enableZoom={true} 
            autoRotate={performanceStats.fps > 45} 
            autoRotateSpeed={speed * 0.5}
            enableDamping={performanceStats.fps > 30}
            dampingFactor={0.05}
          />
          
          {/* Optimized mesh */}
          <OptimizedNeuralMesh 
            color={primaryColor}
            intensity={intensity}
            morphing={morphing && performanceStats.fps > 30}
            mode={mode}
            performanceManager={performanceManager.current}
          />
          
          {/* Optimized particle system */}
          <OptimizedParticleSystem 
            count={particleCount}
            color={secondaryColor}
            speed={speed}
            mode={mode}
            performanceManager={performanceManager.current}
            intensity={intensity}
          />
          
          {/* Performance stats in 3D space */}
          {showStats && <Stats />}
        </Suspense>
      </Canvas>

      {/* AI Generation Button */}
      <button
        onClick={() => setShowAIPanel(true)}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          zIndex: 15,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: 'rgba(255, 0, 255, 0.2)',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 0 20px rgba(255, 0, 255, 0.3)',
          border: '2px solid #ff00ff'
        }}
        title="AI Generation"
      >
        🤖
      </button>
      
      {/* Export Button */}
      <button
        onClick={() => setShowExportPanel(true)}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '90px',
          zIndex: 15,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: 'rgba(0, 255, 0, 0.2)',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 0 20px rgba(0, 255, 0, 0.3)',
          border: '2px solid #00ff00'
        }}
        title="Save & Export"
      >
        💾
      </button>
      
      {/* Performance Grade Indicator */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        zIndex: 10,
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: performanceStats.grade === 'A+' ? '#00ff0020' : 
                        performanceStats.grade.startsWith('A') ? '#ffff0020' : '#ff000020',
        border: `3px solid ${performanceStats.grade === 'A+' ? '#00ff00' : 
                             performanceStats.grade.startsWith('A') ? '#ffff00' : '#ff0000'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '16px'
      }}>
        {performanceStats.grade}
      </div>
      
      {/* AI Generation Panel */}
      <AIGenerationPanel
        canvasState={getCurrentCanvasState()}
        isVisible={showAIPanel}
        onClose={() => setShowAIPanel(false)}
        onApplyToCanvas={(aiResult) => {
          // Apply AI-generated style to canvas
          console.log('Applying AI result to canvas:', aiResult);
          setAiResponse(`🎨 Applied AI style: ${aiResult.style}`);
          setTimeout(() => setAiResponse(''), 3000);
        }}
      />
      
      {/* Export Panel */}
      <ExportPanel
        canvasRef={canvasRef}
        rendererRef={rendererRef}
        sceneRef={sceneRef}
        cameraRef={cameraRef}
        canvasState={getCurrentCanvasState()}
        onLoadState={handleLoadCanvasState}
        isVisible={showExportPanel}
        onClose={() => setShowExportPanel(false)}
      />
    </div>
  );
}