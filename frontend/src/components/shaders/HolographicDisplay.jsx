import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { shaderMaterial, Text } from '@react-three/drei';
import * as THREE from 'three';

const HolographicMaterial = shaderMaterial(
  {
    time: 0,
    hologramColor: new THREE.Color('#00ffff'),
    glitchIntensity: 0.1,
    resolution: new THREE.Vector2(),
  },
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform float time;
    uniform vec3 hologramColor;
    uniform float glitchIntensity;
    uniform vec2 resolution;
    varying vec2 vUv;
    
    float holographicPattern(vec2 uv, float t) {
      float pattern = 0.0;
      for(int i = 0; i < 3; i++) {
        float freq = float(i + 1) * 2.0;
        pattern += sin(uv.x * freq * 20.0 + t * 3.0) * sin(uv.y * freq * 15.0 + t * 2.0);
      }
      return pattern * 0.2;
    }
    
    void main() {
      vec2 uv = vUv;
      float t = time;
      
      float holo = holographicPattern(uv, t);
      vec3 color = hologramColor * (1.0 + holo);
      
      color *= sin(uv.y * resolution.y * 0.7) * 0.04 + 0.96;
      
      float glitch = step(0.98, sin(uv.y * 800.0 + t * 50.0)) * glitchIntensity;
      color += vec3(1.0, 0.0, 0.0) * glitch;
      
      float shimmer = sin(t * 5.0 + uv.x * 10.0) * 0.1 + 0.9;
      color *= shimmer;
      
      float edge = smoothstep(0.0, 0.1, uv.x) * smoothstep(1.0, 0.9, uv.x) *
                   smoothstep(0.0, 0.1, uv.y) * smoothstep(1.0, 0.9, uv.y);
      color *= edge;
      
      gl_FragColor = vec4(color, 0.8);
    }
  `
);

export default function HolographicDisplay({ children, glitchIntensity = 0.1 }) {
  const materialRef = useRef();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.elapsedTime;
      materialRef.current.glitchIntensity = glitchIntensity;
      materialRef.current.resolution.set(window.innerWidth, window.innerHeight);
    }
  });

  return (
    <group>
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[6, 4]} />
        <HolographicMaterial
          ref={materialRef}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {children}
    </group>
  );
}