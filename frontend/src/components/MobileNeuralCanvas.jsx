/**
 * Mobile-Optimized Neural Canvas
 * PWA-ready with advanced touch controls and performance optimization
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

import { useMobileOptimization } from '../hooks/useMobileOptimization';
import { useAdvancedTouchGestures } from '../hooks/useAdvancedTouchGestures';
import { AICreativeAssistant } from '../lib/AICreativeAssistant';

// Mobile-optimized particle system
function MobileParticleField({ count, color, speed, performanceTier }) {
  const pointsRef = useRef();
  
  const { positions, colors } = React.useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const colorObj = new THREE.Color(color);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      
      colors[i * 3] = colorObj.r;
      colors[i * 3 + 1] = colorObj.g;
      colors[i * 3 + 2] = colorObj.b;
    }
    
    return { positions, colors };
  }, [count, color]);

  useFrame((state) => {
    if (pointsRef.current) {
      const rotSpeed = performanceTier === 'low' ? 0.005 : 0.01;
      pointsRef.current.rotation.y = state.clock.elapsedTime * speed * rotSpeed;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={performanceTier === 'low' ? 0.03 : 0.05} 
        vertexColors 
        transparent 
        opacity={0.8}
      />
    </points>
  );
}

// Mobile UI controls
function MobileControls({ 
  onIntensityChange, 
  onModeChange, 
  onColorChange, 
  currentMode, 
  intensity,
  deviceInfo 
}) {
  const [showControls, setShowControls] = useState(false);
  const [quickActions, setQuickActions] = useState(false);

  const modes = ['neural', 'quantum', 'cosmic', 'plasma'];
  const colors = ['#ff006e', '#8338ec', '#3a86ff', '#06ffa5', '#ffbe0b'];

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 rounded-full shadow-lg z-50 flex items-center justify-center text-white text-xl"
        onClick={() => setShowControls(!showControls)}
        whileTap={{ scale: 0.9 }}
        style={{
          paddingBottom: `max(env(safe-area-inset-bottom), 24px)`
        }}
      >
        {showControls ? '✕' : '🎨'}
      </motion.button>

      {/* Quick Actions */}
      <AnimatePresence>
        {quickActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-24 right-6 flex flex-col gap-3 z-40"
          >
            {modes.map((mode, index) => (
              <motion.button
                key={mode}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onModeChange(mode)}
                className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white ${
                  currentMode === mode ? 'bg-purple-600' : 'bg-gray-700'
                }`}
              >
                {mode === 'neural' ? '🧠' : mode === 'quantum' ? '⚛️' : mode === 'cosmic' ? '🌌' : '⚡'}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Control Panel */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-purple-500/30 z-40"
            style={{
              paddingBottom: `max(env(safe-area-inset-bottom), 20px)`
            }}
          >
            <div className="p-6 space-y-6">
              {/* Intensity Slider */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  Intensity: {Math.round(intensity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={intensity}
                  onChange={(e) => onIntensityChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none slider"
                />
              </div>

              {/* Mode Selection */}
              <div>
                <label className="text-white text-sm font-medium mb-3 block">Visual Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  {modes.map(mode => (
                    <button
                      key={mode}
                      onClick={() => onModeChange(mode)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                        currentMode === mode
                          ? 'bg-purple-600 border-purple-400 text-white'
                          : 'bg-gray-800 border-gray-600 text-gray-300'
                      }`}
                    >
                      {mode === 'neural' ? '🧠 Neural' : 
                       mode === 'quantum' ? '⚛️ Quantum' : 
                       mode === 'cosmic' ? '🌌 Cosmic' : '⚡ Plasma'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Palette */}
              <div>
                <label className="text-white text-sm font-medium mb-3 block">Colors</label>
                <div className="flex gap-3 justify-center">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => onColorChange(color)}
                      className="w-10 h-10 rounded-full border-2 border-white/30"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Quick Actions Toggle */}
              <button
                onClick={() => setQuickActions(!quickActions)}
                className="w-full py-3 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-300 font-medium"
              >
                {quickActions ? 'Hide Quick Actions' : 'Show Quick Actions'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Performance indicator
function PerformanceIndicator({ metrics, deviceInfo }) {
  const [showDetails, setShowDetails] = useState(false);

  const getPerformanceColor = (fps) => {
    if (fps >= 50) return '#00ff00';
    if (fps >= 30) return '#ffaa00';
    return '#ff0000';
  };

  return (
    <motion.div
      className="fixed top-4 left-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="bg-black/50 backdrop-blur-md rounded-lg px-3 py-2 text-white text-sm border border-gray-600"
      >
        <span style={{ color: getPerformanceColor(metrics.fps) }}>
          ●
        </span>
        {' '}
        {metrics.fps} FPS
      </button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 bg-black/80 backdrop-blur-md rounded-lg p-3 text-white text-xs border border-gray-600"
          >
            <div>Device: {deviceInfo.screenSize}</div>
            <div>Performance: {deviceInfo.performanceTier}</div>
            <div>Particles: {deviceInfo.maxParticles}</div>
            <div>Memory: {Math.round(metrics.memoryUsage)}MB</div>
            {metrics.isThrottling && (
              <div className="text-red-400 mt-1">⚠️ Throttling</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function MobileNeuralCanvas() {
  const canvasRef = useRef();
  const [mode, setMode] = useState('neural');
  const [intensity, setIntensity] = useState(1.0);
  const [primaryColor, setPrimaryColor] = useState('#ff006e');
  const [speed, setSpeed] = useState(1.0);

  // Mobile optimization
  const {
    deviceInfo,
    performanceMetrics,
    getOptimizedSettings,
    setupMobileViewport,
    monitorPerformance
  } = useMobileOptimization();

  // Touch gestures
  const {
    gestures,
    mapGestureToCommand,
    triggerHapticFeedback
  } = useAdvancedTouchGestures(canvasRef);

  // AI Assistant
  const aiAssistant = useRef(new AICreativeAssistant());

  // Setup mobile viewport and performance monitoring
  useEffect(() => {
    setupMobileViewport();
    monitorPerformance();
  }, [setupMobileViewport, monitorPerformance]);

  // Handle gesture commands
  useEffect(() => {
    const handleGestureCommand = (gestureType) => {
      const command = mapGestureToCommand({ type: gestureType, ...gestures[gestureType] });
      
      if (command) {
        triggerHapticFeedback('light');
        
        switch (command) {
          case 'increase_intensity':
            setIntensity(prev => Math.min(2, prev + 0.2));
            break;
          case 'decrease_intensity':
            setIntensity(prev => Math.max(0, prev - 0.2));
            break;
          case 'change_mode':
            const modes = ['neural', 'quantum', 'cosmic', 'plasma'];
            const currentIndex = modes.indexOf(mode);
            setMode(modes[(currentIndex + 1) % modes.length]);
            break;
          case 'next_color':
            const colors = ['#ff006e', '#8338ec', '#3a86ff', '#06ffa5', '#ffbe0b'];
            const colorIndex = colors.indexOf(primaryColor);
            setPrimaryColor(colors[(colorIndex + 1) % colors.length]);
            break;
          case 'toggle_mode':
            triggerHapticFeedback('double');
            break;
          case 'ultimate_mode':
            setIntensity(2);
            setSpeed(2);
            triggerHapticFeedback('success');
            break;
        }
      }
    };

    // Check for active gestures
    Object.keys(gestures).forEach(gestureType => {
      if (gestures[gestureType].active || gestures[gestureType].count > 0) {
        handleGestureCommand(gestureType);
      }
    });
  }, [gestures, mapGestureToCommand, triggerHapticFeedback, mode, primaryColor]);

  // Get optimized settings
  const optimizedSettings = getOptimizedSettings();

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* Performance Indicator */}
      <PerformanceIndicator 
        metrics={performanceMetrics} 
        deviceInfo={deviceInfo} 
      />

      {/* 3D Canvas */}
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{
          antialias: optimizedSettings.antialias,
          powerPreference: optimizedSettings.powerPreference,
          failIfMajorPerformanceCaveat: optimizedSettings.failIfMajorPerformanceCaveat
        }}
        dpr={optimizedSettings.pixelRatio}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} color={primaryColor} />
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={!deviceInfo.isMobile}
          autoRotateSpeed={speed * 0.5}
          maxDistance={20}
          minDistance={2}
        />
        
        <MobileParticleField 
          count={optimizedSettings.particleCount}
          color={primaryColor}
          speed={speed}
          performanceTier={deviceInfo.performanceTier}
        />
      </Canvas>

      {/* Mobile Controls */}
      <MobileControls
        onIntensityChange={setIntensity}
        onModeChange={setMode}
        onColorChange={setPrimaryColor}
        currentMode={mode}
        intensity={intensity}
        deviceInfo={deviceInfo}
      />

      {/* Gesture Feedback */}
      <AnimatePresence>
        {gestures.tap.count > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="fixed pointer-events-none z-30"
            style={{
              left: gestures.tap.position.x - 25,
              top: gestures.tap.position.y - 25
            }}
          >
            <div className="w-12 h-12 border-2 border-white rounded-full animate-ping" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pinch Indicator */}
      {gestures.pinch.active && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-lg font-bold z-30 pointer-events-none">
          {gestures.pinch.scale > 1 ? '🔍 Zoom In' : '🔍 Zoom Out'}
        </div>
      )}

      {/* Swipe Indicator */}
      {gestures.swipe.direction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-1/4 left-1/2 transform -translate-x-1/2 text-white text-lg font-bold z-30 pointer-events-none"
        >
          {gestures.swipe.direction === 'up' && '⬆️ More Particles'}
          {gestures.swipe.direction === 'down' && '⬇️ Less Particles'}
          {gestures.swipe.direction === 'left' && '⬅️ Previous Color'}
          {gestures.swipe.direction === 'right' && '➡️ Next Color'}
        </motion.div>
      )}

      {/* Install PWA Prompt */}
      {deviceInfo.isMobile && (
        <div className="fixed bottom-20 left-4 right-4 bg-purple-600/20 border border-purple-500/30 rounded-lg p-4 text-white text-sm z-20">
          <div className="font-medium mb-1">📱 Install Neural Canvas</div>
          <div className="text-gray-300 text-xs">
            Add to home screen for the best experience
          </div>
        </div>
      )}
    </div>
  );
}