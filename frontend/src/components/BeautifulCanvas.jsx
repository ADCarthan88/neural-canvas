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

export default function BeautifulCanvas() {
  const [mode, setMode] = useState('neural');
  const [intensity, setIntensity] = useState(1.0);
  const [particleCount, setParticleCount] = useState(2000);

  const modes = {
    neural: { name: '🧠 Neural Flow', color: '#ff006e' },
    quantum: { name: '⚛️ Quantum Field', color: '#8338ec' },
    particles: { name: '✨ Particles', color: '#3a86ff' },
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      {/* Beautiful Control Panel */}
      <div className="absolute top-4 left-4 z-20 bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 neural-glow">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <h2 className="text-white font-bold text-lg holographic-text">NEURAL CANVAS</h2>
        </div>
        
        <div className="space-y-2 mb-6">
          {Object.entries(modes).map(([key, modeData]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                mode === key 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg neural-glow' 
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              {modeData.name}
            </button>
          ))}
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-white text-sm font-medium">Intensity</label>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={intensity}
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
              className="w-full mt-1 accent-pink-500"
            />
            <span className="text-xs text-gray-400">{intensity.toFixed(1)}</span>
          </div>
          
          <div>
            <label className="text-white text-sm font-medium">Particles</label>
            <input
              type="range"
              min="500"
              max="5000"
              step="250"
              value={particleCount}
              onChange={(e) => setParticleCount(parseInt(e.target.value))}
              className="w-full mt-1 accent-blue-500"
            />
            <span className="text-xs text-gray-400">{particleCount}</span>
          </div>
        </div>
      </div>

      {/* Status Display */}
      <div className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-xl rounded-lg p-3 text-white text-sm border border-white/10">
        <div className="text-center">
          <div className="font-bold">{modes[mode].name}</div>
          <div className="text-xs text-gray-400 mt-1">Reality Engine Active</div>
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
            <ParticleField count={particleCount} />
          )}
        </Suspense>
      </Canvas>
      
      {/* Beautiful Background Gradient */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, transparent 0%, ${modes[mode].color}10 100%)`,
          opacity: 0.3
        }}
      ></div>
    </div>
  );
}