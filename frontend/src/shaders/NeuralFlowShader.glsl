// Vertex Shader
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

// Fragment Shader
precision highp float;
uniform float time;
uniform float intensity;
uniform vec2 resolution;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
varying vec2 vUv;
varying vec3 vPosition;

// Neural network noise function
float neuralNoise(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Fractal neural pattern
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

// Electric neural connections
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
    
    // Time-based animation
    float t = time * 0.8;
    
    // Neural flow pattern
    float pattern = neuralPattern(uv * 3.0, t);
    float connections = neuralConnections(uv, t);
    
    // Electric pulse effect
    float pulse = sin(dist * 15.0 - t * 4.0) * 0.5 + 0.5;
    pulse *= smoothstep(0.8, 0.2, dist);
    
    // Color mixing based on neural activity
    vec3 neuralColor = mix(color1, color2, pattern);
    neuralColor = mix(neuralColor, color3, connections);
    
    // Add electric glow
    neuralColor += vec3(0.2, 0.6, 1.0) * pulse * intensity;
    
    // Vignette effect
    float vignette = smoothstep(0.8, 0.2, dist);
    neuralColor *= vignette;
    
    gl_FragColor = vec4(neuralColor, 1.0);
}
