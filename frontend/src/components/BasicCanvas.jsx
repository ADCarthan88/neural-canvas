import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function RotatingCube({ color = '#ff006e', intensity = 1.0 }) {
  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={color} wireframe />
    </mesh>
  );
}

function RotatingSphere({ color = '#8338ec', intensity = 1.0 }) {
  return (
    <mesh>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial color={color} wireframe transparent opacity={0.6} />
    </mesh>
  );
}

export default function BasicCanvas() {
  const [mode, setMode] = useState('cube');
  const [intensity, setIntensity] = useState(1.0);

  const modes = {
    cube: { name: '🧠 Neural Cube', color: '#ff006e' },
    sphere: { name: '⚛️ Quantum Sphere', color: '#8338ec' },
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
      </div>

      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <OrbitControls enablePan={false} enableZoom={true} />
          
          {mode === 'cube' && (
            <RotatingCube 
              color={modes.cube.color}
              intensity={intensity}
            />
          )}
          
          {mode === 'sphere' && (
            <RotatingSphere 
              color={modes.sphere.color}
              intensity={intensity}
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