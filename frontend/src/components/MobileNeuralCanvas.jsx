/**
 * 📱 MOBILE NEURAL CANVAS
 * Optimized for mobile devices with touch gestures and responsive design
 */

'use client';

import { Suspense, useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import AICommandEngine from '../lib/AICommandEngine';
import useMobileDetection from '../hooks/useMobileDetection';
import useTouchGestures from '../hooks/useTouchGestures';
import ExportPanel from './ExportPanel';
import AIGenerationPanel from './AIGenerationPanel';

// Visual mode configurations
const modes = {
  neural: { 
    name: '🧠 Neural',
    geometry: 'torus',
    wireframe: true,
    particleSize: 0.08,
    particleBlending: THREE.AdditiveBlending
  },
  quantum: { 
    name: '⚛️ Quantum',
    geometry: 'sphere',
    wireframe: false,
    particleSize: 0.12,
    particleBlending: THREE.MultiplyBlending
  },
  cosmic: { 
    name: '🌌 Cosmic',
    geometry: 'octahedron',
    wireframe: true,
    particleSize: 0.15,
    particleBlending: THREE.AdditiveBlending
  },
  plasma: { 
    name: '⚡ Plasma',
    geometry: 'icosahedron',
    wireframe: false,
    particleSize: 0.18,
    particleBlending: THREE.AdditiveBlending
  }
};

function MobileNeuralMesh({ color, intensity, morphing, mode, deviceInfo }) {
  const meshRef = useRef();
  const modeConfig = modes[mode] || modes.neural;
  
  // Reduce complexity on mobile
  const complexity = deviceInfo.isMobile ? 0.5 : 1.0;
  
  useFrame((state) => {
    if (meshRef.current) {
      const rotSpeed = (mode === 'quantum' ? 0.2 : mode === 'plasma' ? 0.8 : 0.5) * complexity;
      meshRef.current.rotation.x = state.clock.elapsedTime * rotSpeed * intensity;
      meshRef.current.rotation.y = state.clock.elapsedTime * (rotSpeed * 0.6) * intensity;
      
      const scaleAmount = (mode === 'cosmic' ? 0.4 : mode === 'plasma' ? 0.6 : 0.2) * complexity;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * scaleAmount * intensity;
      meshRef.current.scale.setScalar(scale);
      
      if (morphing) {
        const moveAmount = (mode === 'quantum' ? 0.3 : mode === 'cosmic' ? 0.8 : 0.5) * complexity;
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * moveAmount;
        if (mode === 'plasma') {
          meshRef.current.position.x = Math.cos(state.clock.elapsedTime * 0.7) * 0.3 * complexity;
        }
      }
    }
  });

  const getGeometry = () => {
    const scale = deviceInfo.isMobile ? 0.8 : 1.0;
    switch (modeConfig.geometry) {
      case 'sphere': return <sphereGeometry args={[1.2 * scale, 16, 16]} />;
      case 'octahedron': return <octahedronGeometry args={[1.5 * scale]} />;
      case 'icosahedron': return <icosahedronGeometry args={[1.3 * scale]} />;
      default: return <torusKnotGeometry args={[1 * scale, 0.3 * scale, 50, 8]} />;
    }
  };

  return (
    <mesh ref={meshRef}>
      {getGeometry()}
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

function MobileParticleField({ count, color, speed, mode, deviceInfo }) {
  const pointsRef = useRef();
  const modeConfig = modes[mode] || modes.neural;
  
  // Reduce particle count on mobile
  const mobileCount = deviceInfo.isMobile ? Math.min(count, 1500) : count;
  
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(mobileCount * 3);
    const colors = new Float32Array(mobileCount * 3);
    const colorObj = new THREE.Color(color);
    
    for (let i = 0; i < mobileCount; i++) {
      const radius = (mode === 'quantum' ? 15 : mode === 'cosmic' ? 20 : 10) * (deviceInfo.isMobile ? 0.7 : 1.0);
      const distribution = mode === 'plasma' ? 'sphere' : 'cube';
      
      if (distribution === 'sphere') {
        const phi = Math.random() * Math.PI * 2;
        const costheta = Math.random() * 2 - 1;
        const u = Math.random();
        const theta = Math.acos(costheta);
        const r = radius * Math.cbrt(u);
        
        positions[i * 3] = r * Math.sin(theta) * Math.cos(phi);
        positions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
        positions[i * 3 + 2] = r * Math.cos(theta);
      } else {
        positions[i * 3] = (Math.random() - 0.5) * radius;
        positions[i * 3 + 1] = (Math.random() - 0.5) * radius;
        positions[i * 3 + 2] = (Math.random() - 0.5) * radius;
      }
      
      const colorVariation = mode === 'plasma' ? 0.5 : 0.3;
      colors[i * 3] = Math.min(1, colorObj.r + Math.random() * colorVariation);
      colors[i * 3 + 1] = Math.min(1, colorObj.g + Math.random() * colorVariation);
      colors[i * 3 + 2] = Math.min(1, colorObj.b + Math.random() * colorVariation);
    }
    
    return { positions, colors };
  }, [mobileCount, color, mode, deviceInfo.isMobile]);

  useFrame((state) => {
    if (pointsRef.current) {
      const rotSpeed = mode === 'quantum' ? 0.05 : mode === 'cosmic' ? 0.15 : mode === 'plasma' ? 0.2 : 0.1;
      pointsRef.current.rotation.y = state.clock.elapsedTime * speed * rotSpeed;
      pointsRef.current.rotation.x = state.clock.elapsedTime * speed * (rotSpeed * 0.5);
      
      if (mode === 'cosmic') {
        pointsRef.current.rotation.z = state.clock.elapsedTime * speed * 0.08;
      }
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={mobileCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={mobileCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={modeConfig.particleSize} 
        vertexColors 
        transparent 
        opacity={mode === 'plasma' ? 0.9 : 0.8}
        blending={modeConfig.particleBlending}
      />
    </points>
  );
}

export default function MobileNeuralCanvas() {
  const deviceInfo = useMobileDetection();
  const [mode, setMode] = useState('neural');
  const [intensity, setIntensity] = useState(1.0);
  const [particleCount, setParticleCount] = useState(deviceInfo.isMobile ? 1000 : 2000);
  const [primaryColor, setPrimaryColor] = useState('#ff006e');
  const [secondaryColor, setSecondaryColor] = useState('#8338ec');
  const [speed, setSpeed] = useState(1.0);
  const [morphing, setMorphing] = useState(true);
  
  // Mobile-specific states
  const [showControls, setShowControls] = useState(false);
  const [touchFeedback, setTouchFeedback] = useState('');
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  
  const aiEngine = useRef(new AICommandEngine());
  const [aiResponse, setAiResponse] = useState('');
  
  // Canvas references for export
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);

  // Touch gesture mappings
  const touchGestureCommands = {
    'SWIPE_UP': 'make it brighter and more intense',
    'SWIPE_DOWN': 'make it dimmer and calmer',
    'SWIPE_LEFT': 'change to previous visual mode',
    'SWIPE_RIGHT': 'change to next visual mode',
    'TAP': 'toggle controls',
    'LONG_PRESS': 'reset to default settings',
    'PINCH_OUT': 'add more particles and make it bigger',
    'PINCH_IN': 'reduce particles and make it smaller',
    'THREE_FINGER_TAP': 'random mood and style',
    'FOUR_FINGER_TAP': 'toggle fullscreen mode'
  };

  // Execute AI commands
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

  // Handle touch gestures
  const handleTouchGesture = useCallback((gesture, confidence) => {
    setTouchFeedback(`${gesture} (${Math.round(confidence * 100)}%)`);
    
    if (touchGestureCommands[gesture]) {
      executeAICommand(touchGestureCommands[gesture]);
    }
    
    // Special mobile actions
    switch (gesture) {
      case 'TAP':
        setShowControls(prev => !prev);
        break;
      case 'SWIPE_LEFT':
        const modes_array = Object.keys(modes);
        const currentIndex = modes_array.indexOf(mode);
        const prevIndex = currentIndex === 0 ? modes_array.length - 1 : currentIndex - 1;
        setMode(modes_array[prevIndex]);
        break;
      case 'SWIPE_RIGHT':
        const modes_array2 = Object.keys(modes);
        const currentIndex2 = modes_array2.indexOf(mode);
        const nextIndex = (currentIndex2 + 1) % modes_array2.length;
        setMode(modes_array2[nextIndex]);
        break;
    }
    
    setTimeout(() => setTouchFeedback(''), 2000);
  }, [mode, executeAICommand]);

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
      deviceInfo: {
        isMobile: deviceInfo.isMobile,
        orientation: deviceInfo.orientation,
        screenSize: deviceInfo.screenSize
      }
    };
  }, [mode, intensity, particleCount, primaryColor, secondaryColor, speed, morphing, deviceInfo]);
  
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

  // Adjust particle count based on device
  useEffect(() => {
    if (deviceInfo.isMobile) {
      setParticleCount(prev => Math.min(prev, 1500));
    }
  }, [deviceInfo.isMobile]);

  // Mobile-optimized layout
  const getMobileLayout = () => {
    if (deviceInfo.orientation === 'portrait') {
      return {
        controlsPosition: 'bottom',
        controlsHeight: '30%',
        canvasHeight: '70%'
      };
    } else {
      return {
        controlsPosition: 'right',
        controlsWidth: '30%',
        canvasWidth: '70%'
      };
    }
  };

  const layout = getMobileLayout();

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: '#000', 
      position: 'relative', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: deviceInfo.orientation === 'portrait' ? 'column' : 'row'
    }}>
      {/* Mobile Canvas */}
      <div style={{
        width: layout.canvasWidth || '100%',
        height: layout.canvasHeight || '100%',
        position: 'relative'
      }}>
        <Canvas
          camera={{ position: [0, 0, deviceInfo.isMobile ? 6 : 8], fov: deviceInfo.isMobile ? 70 : 60 }}
          gl={{ 
            antialias: !deviceInfo.isMobile, // Disable on mobile for performance
            alpha: true,
            powerPreference: "high-performance",
            pixelRatio: Math.min(deviceInfo.pixelRatio, 2) // Limit pixel ratio
          }}
          onCreated={({ gl, scene, camera }) => {
            // Store references for export
            rendererRef.current = gl;
            sceneRef.current = scene;
            cameraRef.current = camera;
            canvasRef.current = gl.domElement;
          }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} color={primaryColor} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color={secondaryColor} />
            <OrbitControls 
              enablePan={false} 
              enableZoom={!deviceInfo.isMobile} // Disable zoom on mobile to prevent conflicts
              autoRotate={!deviceInfo.isMobile} 
              autoRotateSpeed={speed * 0.5}
              touches={{
                ONE: deviceInfo.isMobile ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE,
                TWO: deviceInfo.isMobile ? THREE.TOUCH.DOLLY_ROTATE : THREE.TOUCH.DOLLY_PAN
              }}
            />
            
            <MobileNeuralMesh 
              color={primaryColor}
              intensity={intensity}
              morphing={morphing}
              mode={mode}
              deviceInfo={deviceInfo}
            />
            
            <MobileParticleField 
              count={particleCount}
              color={secondaryColor}
              speed={speed}
              mode={mode}
              deviceInfo={deviceInfo}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Mobile Touch Feedback */}
      {(gestureState.isActive || touchFeedback || aiResponse) && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: 'bold',
          border: '2px solid #00ff00',
          boxShadow: '0 0 20px #00ff0050'
        }}>
          {aiResponse || touchFeedback || `${gestureState.currentGesture} (${Math.round(gestureState.confidence * 100)}%)`}
        </div>
      )}

      {/* AI Generation Button */}
      <button
        onClick={() => setShowAIPanel(true)}
        style={{
          position: 'absolute',
          bottom: '90px',
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
      >
        🤖
      </button>
      
      {/* Export Button */}
      <button
        onClick={() => setShowExportPanel(true)}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
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
      >
        💾
      </button>
      
      {/* Mobile Controls Toggle */}
      <button
        onClick={() => setShowControls(prev => !prev)}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 15,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)'
        }}
      >
        ⚙️
      </button>

      {/* Mobile Quick Controls */}
      {showControls && (
        <div style={{
          position: 'absolute',
          bottom: '90px',
          right: '20px',
          zIndex: 15,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          borderRadius: '15px',
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          minWidth: '200px'
        }}>
          <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>
            📱 Touch Controls
          </div>
          
          <div style={{ fontSize: '12px', color: '#aaa', lineHeight: '1.4' }}>
            ⬆️ Swipe Up → Brighter<br/>
            ⬇️ Swipe Down → Dimmer<br/>
            ⬅️ Swipe Left → Prev Mode<br/>
            ➡️ Swipe Right → Next Mode<br/>
            🤏 Pinch → Particles<br/>
            👆 Tap → Toggle Menu<br/>
            ✋ Long Press → Reset
          </div>
          
          <div style={{ textAlign: 'center', color: 'white', fontSize: '12px' }}>
            Current: {modes[mode].name}
          </div>
        </div>
      )}

      {/* Mobile Status */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '10px',
        padding: '10px',
        color: 'white',
        fontSize: '12px',
        minWidth: '120px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{modes[mode].name}</div>
        <div>📱 {deviceInfo.screenSize}</div>
        <div>🔄 {deviceInfo.orientation}</div>
        <div>✨ {particleCount}</div>
        <div>⚡ {intensity.toFixed(1)}</div>
      </div>
      
      {/* AI Generation Panel */}
      <AIGenerationPanel
        canvasState={getCurrentCanvasState()}
        isVisible={showAIPanel}
        onClose={() => setShowAIPanel(false)}
        onApplyToCanvas={(aiResult) => {
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