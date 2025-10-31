'use client';

import { Suspense, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function RotatingMesh({ color = '#ff006e', intensity = 1.0 }) {
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

export default function WorkingCanvas() {
  const [intensity, setIntensity] = useState(1.0);

  return (
    <div className="w-full h-screen relative bg-black">
      <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 backdrop-blur-md rounded-lg p-4 border border-white border-opacity-20">
        <h2 className="text-white font-bold mb-3">🧠 Neural Canvas</h2>
        
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm">System Online</span>
          </div>
        </div>
        
        <div>
          <label className="text-white text-sm block mb-1">
            Intensity: {intensity.toFixed(1)}
          </label>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={intensity}
            onChange={(e) => setIntensity(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <OrbitControls enablePan={false} enableZoom={true} />
          
          <RotatingMesh 
            color="#ff006e"
            intensity={intensity}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}