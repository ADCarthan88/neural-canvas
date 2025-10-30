import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function SimpleNeuralCanvas({ intensity = 1.0, colors }) {
  const meshRef = useRef();

  const material = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ff006e'),
      wireframe: true,
    });
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1 * intensity;
      meshRef.current.scale.setScalar(scale);
      
      if (colors?.primary) {
        material.color.set(colors.primary);
      }
    }
  });

  return (
    <mesh ref={meshRef} material={material}>
      <torusKnotGeometry args={[1, 0.3, 128, 16]} />
    </mesh>
  );
}