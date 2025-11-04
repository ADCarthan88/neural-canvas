attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float time;
uniform float intensity;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
    vUv = uv;
    vPosition = position;
    
    // Neural flow animation
    vec3 pos = position;
    pos.z += sin(pos.x * 10.0 + time * 2.0) * 0.1 * intensity;
    pos.z += cos(pos.y * 8.0 + time * 1.5) * 0.08 * intensity;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}