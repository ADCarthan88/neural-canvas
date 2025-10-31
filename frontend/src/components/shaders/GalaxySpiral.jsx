import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function GalaxySpiral({ intensity = 1.0, starCount = 5000 }) {
  const meshRef = useRef();

  const { geometry, material } = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];
    
    for (let i = 0; i < starCount; i++) {
      // Spiral galaxy distribution
      const angle = Math.random() * Math.PI * 4;
      const radius = Math.random() * 8 + 1;
      const spiralOffset = angle * 0.3;
      
      const x = Math.cos(angle + spiralOffset) * radius + (Math.random() - 0.5) * 2;
      const y = (Math.random() - 0.5) * 2;
      const z = Math.sin(angle + spiralOffset) * radius + (Math.random() - 0.5) * 2;
      
      positions.push(x, y, z);
      
      // Color based on distance from center
      const distance = Math.sqrt(x * x + z * z);
      const hue = (distance / 8) * 0.6; // Blue to red gradient
      const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
      colors.push(color.r, color.g, color.b);
      
      sizes.push(Math.random() * 0.5 + 0.1);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        intensity: { value: intensity },
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float time;
        uniform float intensity;
        
        void main() {
          vColor = color;
          
          vec3 pos = position;
          float angle = atan(pos.z, pos.x);
          float radius = length(pos.xz);
          
          // Rotate galaxy
          angle += time * 0.1 * (1.0 / (radius * 0.1 + 1.0));
          pos.x = cos(angle) * radius;
          pos.z = sin(angle) * radius;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * intensity * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float dist = distance(gl_PointCoord, vec2(0.5));
          if (dist > 0.5) discard;
          
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    
    return { geometry, material };
  }, [starCount]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.time.value = state.clock.elapsedTime;
      meshRef.current.material.uniforms.intensity.value = intensity;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={meshRef} geometry={geometry} material={material} />
  );
}