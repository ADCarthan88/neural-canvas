import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function DNAHelix({ intensity = 1.0, speed = 1.0 }) {
  const groupRef = useRef();

  const helixGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    
    const segments = 200;
    const radius = 1.5;
    const height = 8;
    
    for (let i = 0; i < segments; i++) {
      const t = i / segments;
      const angle1 = t * Math.PI * 8;
      const angle2 = angle1 + Math.PI;
      const y = (t - 0.5) * height;
      
      // First strand
      positions.push(
        Math.cos(angle1) * radius,
        y,
        Math.sin(angle1) * radius
      );
      colors.push(0.2, 0.8, 1.0); // Cyan
      
      // Second strand
      positions.push(
        Math.cos(angle2) * radius,
        y,
        Math.sin(angle2) * radius
      );
      colors.push(1.0, 0.2, 0.8); // Magenta
      
      // Connecting rungs every 10 segments
      if (i % 10 === 0) {
        const x1 = Math.cos(angle1) * radius;
        const z1 = Math.sin(angle1) * radius;
        const x2 = Math.cos(angle2) * radius;
        const z2 = Math.sin(angle2) * radius;
        
        for (let j = 0; j < 5; j++) {
          const lerp = j / 4;
          positions.push(
            x1 + (x2 - x1) * lerp,
            y,
            z1 + (z2 - z1) * lerp
          );
          colors.push(0.8, 0.8, 0.2); // Yellow
        }
      }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    return geometry;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * speed * 0.5;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * speed) * 0.5;
      
      const scale = 1 + Math.sin(state.clock.elapsedTime * speed * 2) * 0.1 * intensity;
      groupRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={groupRef}>
      <points geometry={helixGeometry}>
        <pointsMaterial
          size={0.1}
          vertexColors
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}