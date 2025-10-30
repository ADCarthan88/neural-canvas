import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

const QuantumMaterial = shaderMaterial(
  {
    time: 0,
    mouse: new THREE.Vector2(),
    resolution: new THREE.Vector2(),
    energy: 1.0,
    quantumFlux: 0.8,
  },
  `
    varying vec2 vUv;
    uniform float time;
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      pos.z += sin(pos.x * 5.0 + time * 2.0) * 0.1;
      pos.z += cos(pos.y * 3.0 + time * 1.5) * 0.08;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  `
    uniform float time;
    uniform vec2 mouse;
    uniform float energy;
    uniform float quantumFlux;
    varying vec2 vUv;
    
    float quantumNoise(vec3 p) {
      return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
    }
    
    void main() {
      vec2 uv = vUv;
      float t = time;
      
      vec3 color = vec3(0.0);
      
      for(int i = 0; i < 4; i++) {
        float layer = float(i);
        vec3 p = vec3(uv * (2.0 + layer), t * 0.5 + layer);
        float noise = quantumNoise(p);
        
        color += vec3(
          sin(noise * 6.28 + t + layer),
          cos(noise * 6.28 + t * 1.3 + layer),
          sin(noise * 6.28 + t * 0.7 + layer)
        ) * (1.0 / (layer + 1.0)) * quantumFlux;
      }
      
      float mouseDist = distance(uv, mouse);
      float disturbance = exp(-mouseDist * 5.0) * energy;
      color += vec3(1.0, 0.2, 0.8) * disturbance;
      
      gl_FragColor = vec4(color * 0.5, 1.0);
    }
  `
);

export default function QuantumField({ energy = 1.0, quantumFlux = 0.8 }) {
  const materialRef = useRef();
  const { mouse, viewport } = useThree();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.elapsedTime;
      materialRef.current.energy = energy;
      materialRef.current.quantumFlux = quantumFlux;
      
      materialRef.current.mouse.set(
        (mouse.x + 1) / 2,
        (mouse.y + 1) / 2
      );
      
      materialRef.current.resolution.set(viewport.width, viewport.height);
    }
  });

  const geometry = useMemo(() => new THREE.PlaneGeometry(6, 6, 128, 128), []);

  return (
    <mesh geometry={geometry}>
      <QuantumMaterial ref={materialRef} />
    </mesh>
  );
}