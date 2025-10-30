// Vertex Shader
attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float time;
uniform float viscosity;
varying vec2 vUv;

void main() {
    vUv = uv;
    
    // Liquid distortion
    vec3 pos = position;
    pos.x += sin(uv.y * 8.0 + time * 2.0) * 0.02 * viscosity;
    pos.y += cos(uv.x * 6.0 + time * 1.8) * 0.03 * viscosity;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

// Fragment Shader
precision highp float;
uniform float time;
uniform float viscosity;
uniform vec2 mouse;
uniform vec2 resolution;
uniform sampler2D paintTexture;
uniform vec3 paintColor;
varying vec2 vUv;

// Liquid flow simulation
vec2 liquidFlow(vec2 uv, float t) {
    vec2 flow = vec2(0.0);
    
    // Swirl pattern
    float angle = atan(uv.y - 0.5, uv.x - 0.5);
    float radius = length(uv - 0.5);
    
    flow.x = sin(angle * 3.0 + t * 2.0) * radius * viscosity;
    flow.y = cos(angle * 2.0 + t * 1.5) * radius * viscosity;
    
    return flow * 0.1;
}

// Paint mixing algorithm
vec3 mixPaint(vec3 base, vec3 new, float blend) {
    // Realistic paint mixing using subtractive color model
    vec3 mixed = base * (1.0 - blend) + new * blend;
    
    // Add paint texture
    float texture = sin(vUv.x * 100.0) * sin(vUv.y * 100.0) * 0.1;
    mixed += texture * blend;
    
    return mixed;
}

void main() {
    vec2 uv = vUv;
    float t = time * 0.5;
    
    // Apply liquid flow
    vec2 flowUv = uv + liquidFlow(uv, t);
    
    // Sample existing paint
    vec3 existingPaint = texture2D(paintTexture, flowUv).rgb;
    
    // Mouse interaction
    float mouseDist = distance(uv, mouse);
    float paintStrength = smoothstep(0.1, 0.0, mouseDist);
    
    // Mix colors
    vec3 finalColor = mixPaint(existingPaint, paintColor, paintStrength);
    
    // Add liquid shine effect
    float shine = pow(1.0 - mouseDist * 2.0, 3.0) * paintStrength;
    finalColor += vec3(shine * 0.3);
    
    gl_FragColor = vec4(finalColor, 1.0);
}
