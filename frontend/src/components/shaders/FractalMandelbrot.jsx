import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function FractalMandelbrot({ intensity = 1.0, zoom = 1.0 }) {
  const meshRef = useRef();

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        intensity: { value: intensity },
        zoom: { value: zoom },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float intensity;
        uniform float zoom;
        uniform vec2 resolution;
        varying vec2 vUv;
        
        vec3 mandelbrot(vec2 c) {
          vec2 z = vec2(0.0);
          float iter = 0.0;
          
          for(int i = 0; i < 100; i++) {
            if(dot(z, z) > 4.0) break;
            z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
            iter += 1.0;
          }
          
          float t = iter / 100.0;
          return vec3(
            sin(t * 6.28 + time) * 0.5 + 0.5,
            sin(t * 6.28 + time + 2.0) * 0.5 + 0.5,
            sin(t * 6.28 + time + 4.0) * 0.5 + 0.5
          ) * intensity;
        }
        
        void main() {
          vec2 uv = (vUv - 0.5) * 4.0 / zoom;
          uv.x += sin(time * 0.1) * 0.5;
          uv.y += cos(time * 0.1) * 0.3;
          
          vec3 color = mandelbrot(uv);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      const mat = meshRef.current.material;
      mat.uniforms.time.value = state.clock.elapsedTime;
      mat.uniforms.intensity.value = intensity;
      mat.uniforms.zoom.value = zoom;
    }
  });

  return (
    <mesh ref={meshRef} material={material}>
      <planeGeometry args={[6, 6]} />
    </mesh>
  );
}