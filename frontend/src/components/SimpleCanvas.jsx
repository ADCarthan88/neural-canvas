import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function NeuralMesh({ intensity = 1.0 }) {
  return (
    <mesh>
      <torusKnotGeometry args={[1, 0.3, 128, 16]} />
      <meshStandardMaterial 
        color="#ff006e" 
        wireframe 
        transparent 
        opacity={0.8}
      />
    </mesh>
  );
}

export default function SimpleCanvas() {
  const [intensity, setIntensity] = useState(1.0);

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      <div className="absolute top-4 left-4 z-20 bg-black/80 backdrop-blur-lg rounded-lg p-4 border border-white/20">
        <h2 className="text-white font-bold text-lg mb-4">🧠 Neural Canvas</h2>
        <div>
          <label className="text-white text-sm">Intensity: {intensity.toFixed(1)}</label>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={intensity}
            onChange={(e) => setIntensity(parseFloat(e.target.value))}
            className="w-full mt-2 accent-pink-500"
          />
        </div>
      </div>

      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#ff006e" />
          <OrbitControls enablePan={false} enableZoom={true} />
          <NeuralMesh intensity={intensity} />
        </Suspense>
      </Canvas>
    </div>
  );
}