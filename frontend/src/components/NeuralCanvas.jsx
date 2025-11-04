import { Suspense, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function NeuralMesh({ intensity = 1.0 }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3 * intensity;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2 * intensity;
      
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1 * intensity;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.3, 128, 16]} />
      <meshStandardMaterial 
        color="#ff006e" 
        wireframe 
        transparent 
        opacity={0.8}
        emissive="#ff006e"
        emissiveIntensity={intensity * 0.2}
      />
    </mesh>
  );
}

function ParticleField({ count = 2000, intensity = 1.0 }) {
  const pointsRef = useRef();
  
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    
    colors[i * 3] = Math.random() * 0.5 + 0.5;
    colors[i * 3 + 1] = Math.random() * 0.3 + 0.7;
    colors[i * 3 + 2] = 1.0;
  }

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * intensity * 0.1;
      pointsRef.current.rotation.x = state.clock.elapsedTime * intensity * 0.05;
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
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function NeuralCanvas() {
  const [intensity, setIntensity] = useState(1.0);
  const [particleCount, setParticleCount] = useState(2000);

  return (
    <div className="w-full h-screen bg-black relative">
      <div className="absolute top-4 left-4 z-20 bg-black bg-opacity-80 rounded-lg p-4 border border-white border-opacity-20">
        <h2 className="text-white font-bold text-lg mb-4">🧠 Neural Canvas</h2>
        
        <div className="mb-4">
          <label className="text-white text-sm block mb-2">
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
        
        <div>
          <label className="text-white text-sm block mb-2">
            Particles: {particleCount}
          </label>
          <input
            type="range"
            min="500"
            max="5000"
            step="100"
            value={particleCount}
            onChange={(e) => setParticleCount(parseInt(e.target.value))}
            className="w-full"
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
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8338ec" />
          
          <OrbitControls 
            enablePan={false} 
            enableZoom={true} 
            autoRotate 
            autoRotateSpeed={0.5}
          />
          
          <NeuralMesh intensity={intensity} />
          <ParticleField count={particleCount} intensity={intensity} />
        </Suspense>
      </Canvas>
      
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, transparent 0%, #ff006e10 100%)`,
          opacity: 0.3 + intensity * 0.2
        }}
      />
    </div>
  );
}