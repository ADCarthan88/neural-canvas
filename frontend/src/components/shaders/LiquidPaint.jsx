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
  `
    uniform float time;
    uniform vec2 mouse;
    uniform vec3 paintColor;
    uniform float viscosity;
    varying vec2 vUv;
    
    vec2 liquidFlow(vec2 uv, float t) {
        vec2 flow = vec2(0.0);
        
        float angle = atan(uv.y - 0.5, uv.x - 0.5);
        float radius = length(uv - 0.5);
        
        flow.x = sin(angle * 3.0 + t * 2.0) * radius * viscosity;
        flow.y = cos(angle * 2.0 + t * 1.5) * radius * viscosity;
        
        return flow * 0.1;
    }
    
    void main() {
      vec2 uv = vUv;
      float t = time * 0.5;
      
      vec2 flowUv = uv + liquidFlow(uv, t);
      
      float mouseDist = distance(uv, mouse);
      float paintStrength = smoothstep(0.1, 0.0, mouseDist);
      
      vec3 color = paintColor * paintStrength;
      color += sin(flowUv.x * 50.0 + t) * sin(flowUv.y * 50.0 + t) * 0.1;
      
      float shine = pow(1.0 - mouseDist * 2.0, 3.0) * paintStrength;
      color += vec3(shine * 0.3);
      
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