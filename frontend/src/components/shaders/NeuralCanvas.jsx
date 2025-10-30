import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float time;
  uniform float intensity;
  
  void main() {
    vUv = uv;
    vPosition = position;
    
    vec3 pos = position;
    pos.z += sin(pos.x * 10.0 + time * 2.0) * 0.1 * intensity;
    pos.z += cos(pos.y * 8.0 + time * 1.5) * 0.08 * intensity;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  uniform float time;
  uniform float intensity;
  uniform vec2 resolution;
  uniform vec3 color1;
  uniform vec3 color2;
  uniform vec3 color3;
  varying vec2 vUv;
  varying vec3 vPosition;

  float neuralNoise(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
      vec2 uv = vUv;
      vec2 center = uv - 0.5;
      float dist = length(center);
      
      float t = time * 0.8;
      
      float pattern = 0.0;
      for(int i = 0; i < 3; i++) {
          pattern += neuralNoise(uv * float(i + 1) * 3.0 + t * 0.5) * (1.0 / float(i + 1));
      }
      
      float pulse = sin(dist * 15.0 - t * 4.0) * 0.5 + 0.5;
      pulse *= smoothstep(0.8, 0.2, dist);
      
      vec3 neuralColor = mix(color1, color2, pattern);
      neuralColor = mix(neuralColor, color3, pulse);
      
      neuralColor += vec3(0.2, 0.6, 1.0) * pulse * intensity;
      
      float vignette = smoothstep(0.8, 0.2, dist);
      neuralColor *= vignette;
      
      gl_FragColor = vec4(neuralColor, 1.0);
  }
`;

const createNeuralMaterial = () => {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      intensity: { value: 1.0 },
      resolution: { value: new THREE.Vector2() },
      color1: { value: new THREE.Color('#ff006e') },
      color2: { value: new THREE.Color('#8338ec') },
      color3: { value: new THREE.Color('#3a86ff') },
    },
    vertexShader,
    fragmentShader,
  });
};
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float time;
    uniform float intensity;
    
    void main() {
      vUv = uv;
      vPosition = position;
      
      vec3 pos = position;
      pos.z += sin(pos.x * 10.0 + time * 2.0) * 0.1 * intensity;
      pos.z += cos(pos.y * 8.0 + time * 1.5) * 0.08 * intensity;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  `
    precision highp float;
    uniform float time;
    uniform float intensity;
    uniform vec2 resolution;
    uniform vec3 color1;
    uniform vec3 color2;
    uniform vec3 color3;
    varying vec2 vUv;
    varying vec3 vPosition;

    float neuralNoise(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float neuralPattern(vec2 uv, float t) {
        float pattern = 0.0;
        float amplitude = 1.0;
        float frequency = 1.0;
        
        for(int i = 0; i < 6; i++) {
            pattern += amplitude * neuralNoise(uv * frequency + t * 0.5);
            amplitude *= 0.5;
            frequency *= 2.0;
        }
        
        return pattern;
    }

    float neuralConnections(vec2 uv, float t) {
        vec2 grid = fract(uv * 20.0) - 0.5;
        float dist = length(grid);
        
        float pulse = sin(t * 3.0 + dist * 10.0) * 0.5 + 0.5;
        float connection = smoothstep(0.4, 0.1, dist) * pulse;
        
        return connection;
    }

    void main() {
        vec2 uv = vUv;
        vec2 center = uv - 0.5;
        float dist = length(center);
        
        float t = time * 0.8;
        
        float pattern = neuralPattern(uv * 3.0, t);
        float connections = neuralConnections(uv, t);
        
        float pulse = sin(dist * 15.0 - t * 4.0) * 0.5 + 0.5;
        pulse *= smoothstep(0.8, 0.2, dist);
        
        vec3 neuralColor = mix(color1, color2, pattern);
        neuralColor = mix(neuralColor, color3, connections);
        
        neuralColor += vec3(0.2, 0.6, 1.0) * pulse * intensity;
        
        float vignette = smoothstep(0.8, 0.2, dist);
        neuralColor *= vignette;
        
        gl_FragColor = vec4(neuralColor, 1.0);
    }
  `
);

export default function NeuralCanvas({ intensity = 1.0, colors }) {
  const materialRef = useRef();
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current && meshRef.current.material) {
      const mat = meshRef.current.material;
      mat.uniforms.time.value = state.clock.elapsedTime;
      mat.uniforms.intensity.value = intensity;
      
      mat.uniforms.resolution.value.set(
        state.viewport.width,
        state.viewport.height
      );
      
      if (colors) {
        mat.uniforms.color1.value.set(colors.primary || '#ff006e');
        mat.uniforms.color2.value.set(colors.secondary || '#8338ec');
        mat.uniforms.color3.value.set(colors.accent || '#3a86ff');
      }
    }
    
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  const geometry = useMemo(() => new THREE.PlaneGeometry(4, 4, 64, 64), []);

  const material = useMemo(() => createNeuralMaterial(), []);

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} />
  );
}