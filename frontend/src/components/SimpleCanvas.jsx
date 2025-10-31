import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import SimpleNeuralCanvas from './shaders/SimpleNeuralCanvas';
import ParticleSystem from './shaders/ParticleSystem';

export default function SimpleCanvas() {
  const [mode, setMode] = useState('neural');
  const [intensity, setIntensity] = useState(1.0);
  const [particleCount, setParticleCount] = useState(3000);

  const modes = {
    neural: { name: '🧠 Neural Flow', color: '#ff006e' },
    quantum: { name: '⚛️ Quantum Field', color: '#8338ec' },
    particles: { name: '✨ Particles', color: '#3a86ff' },
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      <div className="absolute top-2 left-2 z-20 bg-black/40 backdrop-blur-lg rounded-lg p-3 border border-white/10 w-48">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <h2 className="text-white font-bold text-sm">NEURAL CANVAS</h2>
        </div>
        
        <div className="space-y-1 mb-3">
          {Object.entries(modes).map(([key, modeData]) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`w-full text-left px-2 py-1 rounded text-xs transition-all ${
                mode === key 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              {modeData.name}
            </button>
          ))}
        </div>
        
        <div className="space-y-2">
          <div>
            <label className="text-white text-xs">Intensity: {intensity.toFixed(1)}</label>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={intensity}
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
              className="w-full mt-1 accent-pink-500 h-1"
            />
          </div>
          
          <div>
            <label className="text-white text-xs">Particles: {particleCount}</label>
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={particleCount}
              onChange={(e) => setParticleCount(parseInt(e.target.value))}
              className="w-full mt-1 accent-blue-500 h-1"
            />
          </div>
        </div>
      </div>

      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <Suspense fallback={null}>
          <Environment preset="night" />
          <OrbitControls enablePan={false} enableZoom={true} />
          
          {mode === 'neural' && (
            <SimpleNeuralCanvas 
              intensity={intensity} 
              colors={{ primary: modes.neural.color }}
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
            <ParticleSystem 
              count={particleCount} 
              speed={intensity}
            />
          )}
        </Suspense>
      </Canvas>
      
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