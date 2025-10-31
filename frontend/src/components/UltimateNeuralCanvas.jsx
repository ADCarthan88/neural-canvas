'use client';

import { Suspense, useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function NeuralMesh({ color, intensity, morphing }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5 * intensity;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * intensity;
      
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2 * intensity;
      meshRef.current.scale.setScalar(scale);
      
      if (morphing) {
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5;
      }
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.3, 100, 16]} />
      <meshStandardMaterial 
        color={color} 
        wireframe 
        transparent 
        opacity={0.8}
        emissive={color}
        emissiveIntensity={intensity * 0.2}
      />
    </mesh>
  );
}

function ParticleField({ count, color, speed }) {
  const pointsRef = useRef();
  
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const colorObj = new THREE.Color(color);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      
      colors[i * 3] = colorObj.r + Math.random() * 0.3;
      colors[i * 3 + 1] = colorObj.g + Math.random() * 0.3;
      colors[i * 3 + 2] = colorObj.b + Math.random() * 0.3;
    }
    
    return { positions, colors };
  }, [count, color]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * speed * 0.1;
      pointsRef.current.rotation.x = state.clock.elapsedTime * speed * 0.05;
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
        size={0.05} 
        vertexColors 
        transparent 
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function FloatingGeometry({ shape, color, position, intensity }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.2;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.5;
    }
  });

  const geometry = shape === 'sphere' ? 
    <sphereGeometry args={[0.5, 16, 16]} /> :
    shape === 'cube' ?
    <boxGeometry args={[0.8, 0.8, 0.8]} /> :
    <octahedronGeometry args={[0.6]} />;

  return (
    <mesh ref={meshRef} position={position}>
      {geometry}
      <meshStandardMaterial 
        color={color} 
        wireframe 
        transparent 
        opacity={0.6}
        emissive={color}
        emissiveIntensity={intensity * 0.1}
      />
    </mesh>
  );
}

export default function UltimateNeuralCanvas() {
  const [mode, setMode] = useState('neural');
  const [intensity, setIntensity] = useState(1.0);
  const [particleCount, setParticleCount] = useState(2000);
  const [primaryColor, setPrimaryColor] = useState('#ff006e');
  const [secondaryColor, setSecondaryColor] = useState('#8338ec');
  const [speed, setSpeed] = useState(1.0);
  const [morphing, setMorphing] = useState(true);
  const [showFloatingObjects, setShowFloatingObjects] = useState(true);

  const modes = {
    neural: { name: '🧠 Neural Flow', baseColor: '#ff006e' },
    quantum: { name: '⚛️ Quantum Field', baseColor: '#8338ec' },
    cosmic: { name: '🌌 Cosmic Dance', baseColor: '#3a86ff' },
    plasma: { name: '⚡ Plasma Storm', baseColor: '#ff4081' },
    matrix: { name: '💚 Matrix Code', baseColor: '#00ff41' }
  };

  const colorPresets = [
    { name: 'Neural Pink', primary: '#ff006e', secondary: '#8338ec' },
    { name: 'Cyber Blue', primary: '#00d4ff', secondary: '#0099cc' },
    { name: 'Quantum Purple', primary: '#8b5cf6', secondary: '#a855f7' },
    { name: 'Plasma Orange', primary: '#ff6b35', secondary: '#f7931e' },
    { name: 'Matrix Green', primary: '#00ff41', secondary: '#39ff14' },
    { name: 'Neon Pink', primary: '#ff1493', secondary: '#ff69b4' }
  ];

  const controlPanelStyle = {
    position: 'absolute',
    top: '20px',
    left: '20px',
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(20px)',
    borderRadius: '15px',
    padding: '25px',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    boxShadow: `0 0 30px ${primaryColor}50, 0 0 60px ${secondaryColor}30`,
    maxHeight: '80vh',
    overflowY: 'auto',
    width: '300px'
  };

  const buttonStyle = (isActive) => ({
    width: '100%',
    textAlign: 'left',
    padding: '10px 15px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: isActive ? primaryColor : 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: isActive ? 'bold' : 'normal'
  });

  const sliderStyle = {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    background: `linear-gradient(90deg, ${secondaryColor}, ${primaryColor})`,
    outline: 'none',
    cursor: 'pointer'
  };

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', position: 'relative', overflow: 'hidden' }}>
      {/* Ultimate Control Panel */}
      <div style={controlPanelStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ 
            width: '15px', 
            height: '15px', 
            backgroundColor: primaryColor, 
            borderRadius: '50%', 
            animation: 'pulse 2s infinite',
            boxShadow: `0 0 10px ${primaryColor}`
          }}></div>
          <h2 style={{ 
            color: 'white', 
            fontWeight: 'bold', 
            fontSize: '20px',
            background: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            NEURAL CANVAS
          </h2>
        </div>
        
        {/* Mode Selection */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '10px' }}>🎨 Visual Modes</h3>
          {Object.entries(modes).map(([key, modeData]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              style={buttonStyle(mode === key)}
            >
              {modeData.name}
            </button>
          ))}
        </div>

        {/* Color Presets */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '10px' }}>🌈 Color Presets</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {colorPresets.map((preset, index) => (
              <button
                key={index}
                onClick={() => {
                  setPrimaryColor(preset.primary);
                  setSecondaryColor(preset.secondary);
                }}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: `linear-gradient(45deg, ${preset.primary}, ${preset.secondary})`,
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '10px' }}>🎯 Custom Colors</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ color: 'white', fontSize: '12px', display: 'block', marginBottom: '5px' }}>Primary</label>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                style={{ width: '100%', height: '35px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ color: 'white', fontSize: '12px', display: 'block', marginBottom: '5px' }}>Secondary</label>
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                style={{ width: '100%', height: '35px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '15px' }}>⚡ Controls</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '5px' }}>
              Intensity: {intensity.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={intensity}
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
              style={sliderStyle}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '5px' }}>
              Particles: {particleCount}
            </label>
            <input
              type="range"
              min="500"
              max="8000"
              step="250"
              value={particleCount}
              onChange={(e) => setParticleCount(parseInt(e.target.value))}
              style={sliderStyle}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '5px' }}>
              Speed: {speed.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              style={sliderStyle}
            />
          </div>
        </div>

        {/* Toggle Options */}
        <div>
          <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '10px' }}>🎛️ Effects</h3>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={morphing}
              onChange={(e) => setMorphing(e.target.checked)}
              style={{ accentColor: primaryColor }}
            />
            <span style={{ color: 'white', fontSize: '14px' }}>Morphing Animation</span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showFloatingObjects}
              onChange={(e) => setShowFloatingObjects(e.target.checked)}
              style={{ accentColor: primaryColor }}
            />
            <span style={{ color: 'white', fontSize: '14px' }}>Floating Objects</span>
          </label>
        </div>
      </div>

      {/* Performance Stats */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '10px',
        padding: '15px',
        color: 'white',
        fontSize: '14px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: `0 0 20px ${primaryColor}30`
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{modes[mode].name}</div>
          <div style={{ fontSize: '12px', color: '#aaa' }}>Particles: {particleCount}</div>
          <div style={{ fontSize: '12px', color: '#aaa' }}>Speed: {speed}x</div>
          <div style={{ fontSize: '12px', color: primaryColor, marginTop: '5px' }}>🚀 NEURAL ENGINE ACTIVE</div>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} color={primaryColor} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color={secondaryColor} />
          <OrbitControls enablePan={false} enableZoom={true} autoRotate autoRotateSpeed={speed * 0.5} />
          
          {/* Main Neural Mesh */}
          <NeuralMesh 
            color={primaryColor}
            intensity={intensity}
            morphing={morphing}
          />
          
          {/* Particle Field */}
          <ParticleField 
            count={particleCount}
            color={secondaryColor}
            speed={speed}
          />
          
          {/* Floating Objects */}
          {showFloatingObjects && (
            <>
              <FloatingGeometry shape="sphere" color={primaryColor} position={[3, 1, 2]} intensity={intensity} />
              <FloatingGeometry shape="cube" color={secondaryColor} position={[-3, -1, 1]} intensity={intensity} />
              <FloatingGeometry shape="octahedron" color={primaryColor} position={[2, -2, -2]} intensity={intensity} />
              <FloatingGeometry shape="sphere" color={secondaryColor} position={[-2, 2, -1]} intensity={intensity} />
            </>
          )}
        </Suspense>
      </Canvas>
      
      {/* Dynamic Background */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(circle at center, transparent 0%, ${primaryColor}15 50%, ${secondaryColor}10 100%)`,
          opacity: 0.4 + intensity * 0.2,
          animation: 'pulse 4s ease-in-out infinite'
        }}
      ></div>
    </div>
  );
}