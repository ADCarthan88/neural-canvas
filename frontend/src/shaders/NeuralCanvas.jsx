import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Import shader code
import neuralVertexShader from '../../shaders/NeuralFlowShader.vert?raw';
import neuralFragmentShader from '../../shaders/NeuralFlowShader.frag?raw';

const NeuralMaterial = shaderMaterial(
  {
    time: 0,
    intensity: 1.0,
    resolution: new THREE.Vector2(),
    color1: new THREE.Color('#ff006e'),
    color2: new THREE.Color('#8338ec'),
    color3: new THREE.Color('#3a86ff'),
  },
  neuralVertexShader,
  neuralFragmentShader
);

export default function NeuralCanvas({ intensity = 1.0, colors }) {
  const materialRef = useRef();
  const meshRef = useRef();

  // Update shader uniforms
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.elapsedTime;
      materialRef.current.intensity = intensity;
      
      // Mouse interaction
      materialRef.current.resolution.set(
        state.viewport.width,
        state.viewport.height
      );
    }
    
    // Subtle mesh animation
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  // Memoize geometry for performance
  const geometry = useMemo(() => new THREE.PlaneGeometry(4, 4, 64, 64), []);

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <NeuralMaterial
        ref={materialRef}
        color1={colors?.primary || '#ff006e'}
        color2={colors?.secondary || '#8338ec'}
        color3={colors?.accent || '#3a86ff'}
      />
    </mesh>
  );
}
