import { useRef, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

const LiquidPaintMaterial = shaderMaterial(
  {
    time: 0,
    viscosity: 0.5,
    mouse: new THREE.Vector2(),
    resolution: new THREE.Vector2(),
    paintTexture: null,
    paintColor: new THREE.Color('#ff4081'),
  },
  // Vertex shader
  `
    varying vec2 vUv;
    uniform float time;
    uniform float viscosity;
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      pos.x += sin(uv.y * 8.0 + time * 2.0) * 0.02 * viscosity;
      pos.y += cos(uv.x * 6.0 + time * 1.8) * 0.03 * viscosity;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment shader (simplified version)
  `
    uniform float time;
    uniform vec2 mouse;
    uniform vec3 paintColor;
    varying vec2 vUv;
    
    void main() {
      vec2 uv = vUv;
      float mouseDist = distance(uv, mouse);
      float paintStrength = smoothstep(0.1, 0.0, mouseDist);
      
      vec3 color = paintColor * paintStrength;
      color += sin(uv.x * 50.0 + time) * sin(uv.y * 50.0 + time) * 0.1;
      
      gl_FragColor = vec4(color, paintStrength);
    }
  `
);

export default function LiquidPaint({ viscosity = 0.5, paintColor = '#ff4081' }) {
  const materialRef = useRef();
  const [mousePos, setMousePos] = useState(new THREE.Vector2());
  const { viewport, mouse } = useThree();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.elapsedTime;
      materialRef.current.viscosity = viscosity;
      
      // Convert mouse coordinates to UV space
      const x = (mouse.x + 1) / 2;
      const y = (mouse.y + 1) / 2;
      materialRef.current.mouse.set(x, y);
      
      materialRef.current.resolution.set(viewport.width, viewport.height);
    }
  });

  return (
    <mesh>
      <planeGeometry args={[4, 4, 32, 32]} />
      <LiquidPaintMaterial
        ref={materialRef}
        paintColor={paintColor}
        transparent
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
