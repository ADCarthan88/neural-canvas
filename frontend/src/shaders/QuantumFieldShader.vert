varying vec2 vUv;
uniform float time;

void main() {
  vUv = uv;
  vec3 pos = position;
  
  // Quantum distortion
  pos.z += sin(pos.x * 5.0 + time * 2.0) * 0.1;
  pos.z += cos(pos.y * 3.0 + time * 1.5) * 0.08;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}