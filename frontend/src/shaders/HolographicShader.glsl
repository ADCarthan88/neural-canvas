// Fragment Shader
precision highp float;
uniform float time;
uniform vec2 resolution;
uniform vec3 hologramColor;
uniform float glitchIntensity;
varying vec2 vUv;

// Holographic interference pattern
float holographicPattern(vec2 uv, float t) {
    float pattern = 0.0;
    
    // Multiple interference waves
    for(int i = 0; i < 5; i++) {
        float freq = float(i + 1) * 2.0;
        pattern += sin(uv.x * freq * 20.0 + t * 3.0) * sin(uv.y * freq * 15.0 + t * 2.0);
    }
    
    return pattern * 0.2;
}

// Digital glitch effect
vec3 digitalGlitch(vec2 uv, float t) {
    vec3 glitch = vec3(0.0);
    
    // Random glitch lines
    float glitchLine = step(0.98, sin(uv.y * 800.0 + t * 50.0));
    glitch += vec3(1.0, 0.0, 0.0) * glitchLine * glitchIntensity;
    
    // Color separation
    float offset = sin(t * 10.0) * 0.01 * glitchIntensity;
    glitch.r += sin(uv.x * 100.0 + offset);
    glitch.g += sin(uv.x * 100.0);
    glitch.b += sin(uv.x * 100.0 - offset);
    
    return glitch * 0.1;
}

// Scanline effect
float scanlines(vec2 uv) {
    return sin(uv.y * resolution.y * 0.7) * 0.04 + 0.96;
}

void main() {
    vec2 uv = vUv;
    float t = time;
    
    // Base holographic pattern
    float holo = holographicPattern(uv, t);
    
    // Apply holographic color
    vec3 color = hologramColor * (1.0 + holo);
    
    // Add digital glitch
    color += digitalGlitch(uv, t);
    
    // Apply scanlines
    color *= scanlines(uv);
    
    // Holographic shimmer
    float shimmer = sin(t * 5.0 + uv.x * 10.0) * 0.1 + 0.9;
    color *= shimmer;
    
    // Edge glow
    float edge = smoothstep(0.0, 0.1, uv.x) * smoothstep(1.0, 0.9, uv.x) *
                 smoothstep(0.0, 0.1, uv.y) * smoothstep(1.0, 0.9, uv.y);
    color *= edge;
    
    gl_FragColor = vec4(color, 0.8);
}
