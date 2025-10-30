precision highp float;
uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float energy;
uniform float quantumFlux;
varying vec2 vUv;

float quantumNoise(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

vec3 quantumField(vec2 uv, float t) {
    vec3 field = vec3(0.0);
    
    for(int i = 0; i < 8; i++) {
        float layer = float(i);
        vec3 p = vec3(uv * (2.0 + layer), t * 0.5 + layer);
        
        float noise = quantumNoise(p);
        float wave = sin(length(uv - 0.5) * 20.0 - t * 3.0 + layer) * 0.5 + 0.5;
        
        field += vec3(
            sin(noise * 6.28 + t + layer),
            cos(noise * 6.28 + t * 1.3 + layer),
            sin(noise * 6.28 + t * 0.7 + layer)
        ) * wave * (1.0 / (layer + 1.0));
    }
    
    return field * quantumFlux;
}

float quantumParticles(vec2 uv, float t) {
    float particles = 0.0;
    
    for(int i = 0; i < 20; i++) {
        float id = float(i);
        vec2 particlePos = vec2(
            sin(t * 0.8 + id * 2.0) * 0.3 + 0.5,
            cos(t * 0.6 + id * 1.5) * 0.3 + 0.5
        );
        
        float dist = distance(uv, particlePos);
        float particle = 1.0 / (dist * 100.0 + 1.0);
        particles += particle;
    }
    
    return particles;
}

void main() {
    vec2 uv = vUv;
    float t = time;
    
    vec3 field = quantumField(uv, t);
    float particles = quantumParticles(uv, t);
    
    float mouseDist = distance(uv, mouse);
    float disturbance = exp(-mouseDist * 5.0) * energy;
    
    vec3 color = field * 0.5;
    color += vec3(0.0, 0.5, 1.0) * particles * 2.0;
    color += vec3(1.0, 0.2, 0.8) * disturbance;
    
    float glow = smoothstep(0.8, 0.0, length(uv - 0.5));
    color *= (1.0 + glow * 0.5);
    
    gl_FragColor = vec4(color, 1.0);
}