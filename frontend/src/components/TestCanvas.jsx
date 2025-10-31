'use client';

import { Suspense, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedCube({ color, intensity }) {
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
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={color} wireframe />
    </mesh>
  );
}

function ParticleField({ count = 1000 }) {
  const pointsRef = useRef();
  
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    
    colors[i * 3] = Math.random();
    colors[i * 3 + 1] = Math.random();
    colors[i * 3 + 2] = 1;
  }

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.1;
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
      <pointsMaterial size={0.05} vertexColors />
    </points>
  );
}

export default function TestCanvas() {
  const [mode, setMode] = useState('cube');
  const [intensity, setIntensity] = useState(1.0);

  const modes = {
    cube: { name: '🧠 Neural Cube', color: '#ff006e' },
    particles: { name: '✨ Particles', color: '#8338ec' },
  };

  return (
    <div className="w-full h-screen relative bg-black">
      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md rounded-lg p-4 border border-white/20">
        <h2 className="text-white font-bold mb-3">Neural Canvas Test</h2>
        
        <div className="space-y-2 mb-4">
          {Object.entries(modes).map(([key, modeData]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`w-full text-left px-3 py-2 rounded transition-all ${
                mode === key 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {modeData.name}
            </button>
          ))}
        </div>
        
        <div>
          <label className="text-white text-sm">Intensity: {intensity.toFixed(1)}</label>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={intensity}
            onChange={(e) => setIntensity(parseFloat(e.target.value))}
            className="w-full mt-1"
          />
        </div>
      </div>

      {/* Status Indicator */}
      <div className="absolute top-4 right-4 z-10 bg-green-500/20 backdrop-blur-md rounded-lg p-3 border border-green-500/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">System Online</span>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <OrbitControls enablePan={false} enableZoom={true} />
          
          {mode === 'cube' && (
            <AnimatedCube 
              color={modes.cube.color}
              intensity={intensity}
            />
          )}
          
          {mode === 'particles' && (
            <ParticleField count={1000} />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}