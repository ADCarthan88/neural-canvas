'use client';

import { Suspense, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function NeuralMesh({ color = '#ff006e', intensity = 1.0 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1 * intensity;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.3, 128, 16]} />
      <meshStandardMaterial color={color} wireframe />
    </mesh>
  );
}

export default function StyledCanvas() {
  const [mode, setMode] = useState('neural');
  const [intensity, setIntensity] = useState(1.0);

  const modes = {
    neural: { name: '🧠 Neural Flow', color: '#ff006e' },
    quantum: { name: '⚛️ Quantum Field', color: '#8338ec' },
    particles: { name: '✨ Particles', color: '#3a86ff' },
  };

  const controlPanelStyle = {
    position: 'absolute',
    top: '16px',
    left: '16px',
    zIndex: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 0 20px rgba(255, 0, 110, 0.5), 0 0 40px rgba(131, 56, 236, 0.3)'
  };

  const buttonStyle = (isActive) => ({
    width: '100%',
    textAlign: 'left',
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: isActive ? '#8b5cf6' : 'transparent',
    color: isActive ? 'white' : '#d1d5db',
    marginBottom: '8px'
  });

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: '#000000' }}>
      {/* Control Panel */}
      <div style={controlPanelStyle} className="neural-glow">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            backgroundColor: '#34d399', 
            borderRadius: '50%', 
            animation: 'pulse 2s infinite' 
          }}></div>
          <h2 style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }} className="holographic-text">
            NEURAL CANVAS
          </h2>
        </div>
        
        <div style={{ marginBottom: '24px' }}>
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
        
        <div>
          <label style={{ color: 'white', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
            Intensity
          </label>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={intensity}
            onChange={(e) => setIntensity(parseFloat(e.target.value))}
            style={{ width: '100%', marginTop: '4px', accentColor: '#ec4899' }}
          />
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>{intensity.toFixed(1)}</span>
        </div>
      </div>

      {/* Status Display */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(20px)',
        borderRadius: '8px',
        padding: '12px',
        color: 'white',
        fontSize: '14px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold' }}>{modes[mode].name}</div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Reality Engine Active</div>
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
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <OrbitControls enablePan={false} enableZoom={true} />
          
          {mode === 'neural' && (
            <NeuralMesh 
              color={modes.neural.color}
              intensity={intensity}
            />
          )}
          
          {mode === 'quantum' && (
            <mesh>
              <sphereGeometry args={[2, 32, 32]} />
              <meshStandardMaterial 
                color={modes.quantum.color} 
                wireframe 
                transparent 
                opacity={0.6}
              />
            </mesh>
          )}
          
          {mode === 'particles' && (
            <mesh>
              <icosahedronGeometry args={[1.5, 1]} />
              <meshStandardMaterial 
                color={modes.particles.color} 
                wireframe 
              />
            </mesh>
          )}
        </Suspense>
      </Canvas>
      
      {/* Background Gradient */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(circle at center, transparent 0%, ${modes[mode].color}10 100%)`,
          opacity: 0.3
        }}
      ></div>
    </div>
  );
}