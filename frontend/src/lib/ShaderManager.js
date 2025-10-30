import * as THREE from 'three';

class ShaderManager {
  constructor() {
    this.shaders = new Map();
    this.uniforms = new Map();
    this.animationCallbacks = new Set();
  }

  registerShader(name, material) {
    this.shaders.set(name, material);
    
    if (material.uniforms) {
      this.uniforms.set(name, material.uniforms);
    }
  }

  updateUniforms(deltaTime, mouse, viewport) {
    this.shaders.forEach((material, name) => {
      if (material.uniforms) {
        if (material.uniforms.time) {
          material.uniforms.time.value += deltaTime;
        }
        
        if (material.uniforms.mouse && mouse) {
          material.uniforms.mouse.value.copy(mouse);
        }
        
        if (material.uniforms.resolution && viewport) {
          material.uniforms.resolution.value.set(viewport.width, viewport.height);
        }
      }
    });

    this.animationCallbacks.forEach(callback => callback(deltaTime));
  }

  addAnimationCallback(callback) {
    this.animationCallbacks.add(callback);
  }

  removeAnimationCallback(callback) {
    this.animationCallbacks.delete(callback);
  }

  getShader(name) {
    return this.shaders.get(name);
  }

  createPostProcessingChain() {
    const composer = new THREE.EffectComposer();
    
    const bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    
    composer.addPass(bloomPass);
    
    return composer;
  }

  dispose() {
    this.shaders.forEach(material => {
      if (material.dispose) {
        material.dispose();
      }
    });
    
    this.shaders.clear();
    this.uniforms.clear();
    this.animationCallbacks.clear();
  }
}

export default new ShaderManager();