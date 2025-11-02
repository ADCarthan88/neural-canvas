/**
 * ⚡ OPTIMIZED PARTICLE SYSTEM
 * High-performance particle rendering with LOD and culling
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function OptimizedParticleSystem({ 
  count, 
  color, 
  speed, 
  mode, 
  performanceManager,
  intensity = 1.0 
}) {
  const pointsRef = useRef();
  const materialRef = useRef();
  const geometryRef = useRef();
  
  // Performance-optimized particle count
  const optimizedCount = useMemo(() => {
    return performanceManager ? performanceManager.getOptimalParticleCount(count) : count;
  }, [count, performanceManager]);

  // Instanced particle data with memory pooling
  const particleData = useMemo(() => {
    const positions = new Float32Array(optimizedCount * 3);
    const colors = new Float32Array(optimizedCount * 3);
    const velocities = new Float32Array(optimizedCount * 3);
    const lifetimes = new Float32Array(optimizedCount);
    const sizes = new Float32Array(optimizedCount);
    
    const colorObj = new THREE.Color(color);
    const radius = mode === 'quantum' ? 15 : mode === 'cosmic' ? 20 : 10;
    
    for (let i = 0; i < optimizedCount; i++) {
      const i3 = i * 3;
      
      // Position based on mode
      if (mode === 'plasma') {
        // Spherical distribution for plasma
        const phi = Math.random() * Math.PI * 2;
        const costheta = Math.random() * 2 - 1;
        const u = Math.random();
        const theta = Math.acos(costheta);
        const r = radius * Math.cbrt(u);
        
        positions[i3] = r * Math.sin(theta) * Math.cos(phi);
        positions[i3 + 1] = r * Math.sin(theta) * Math.sin(phi);
        positions[i3 + 2] = r * Math.cos(theta);
      } else {
        // Cubic distribution for others
        positions[i3] = (Math.random() - 0.5) * radius;
        positions[i3 + 1] = (Math.random() - 0.5) * radius;
        positions[i3 + 2] = (Math.random() - 0.5) * radius;
      }
      
      // Velocity for animation
      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
      
      // Color variation
      const colorVariation = mode === 'plasma' ? 0.5 : 0.3;
      colors[i3] = Math.min(1, colorObj.r + Math.random() * colorVariation);
      colors[i3 + 1] = Math.min(1, colorObj.g + Math.random() * colorVariation);
      colors[i3 + 2] = Math.min(1, colorObj.b + Math.random() * colorVariation);
      
      // Lifetime and size
      lifetimes[i] = Math.random() * 100;
      sizes[i] = 0.5 + Math.random() * 0.5;
    }
    
    return { positions, colors, velocities, lifetimes, sizes };
  }, [optimizedCount, color, mode]);

  // Performance-aware material settings
  const materialSettings = useMemo(() => {
    const quality = performanceManager?.getCurrentQuality() || { particleSize: 0.1 };
    
    return {
      size: quality.particleSize * (0.5 + intensity * 0.5),
      transparent: true,
      opacity: mode === 'plasma' ? 0.9 : 0.8,
      blending: mode === 'quantum' ? THREE.MultiplyBlending : THREE.AdditiveBlending,
      vertexColors: true,
      sizeAttenuation: true,
      alphaTest: 0.1 // Helps with performance
    };
  }, [mode, intensity, performanceManager]);

  // Frustum culling and LOD
  const shouldRender = useRef(true);
  const lodLevel = useRef(1.0);

  useFrame((state, delta) => {
    if (!pointsRef.current || !geometryRef.current) return;
    
    // Performance-based animation speed
    const animSpeed = speed * (performanceManager?.getAverageFPS() > 45 ? 1.0 : 0.5);
    
    // Rotate particle system
    const rotSpeed = mode === 'quantum' ? 0.05 : mode === 'cosmic' ? 0.15 : mode === 'plasma' ? 0.2 : 0.1;
    pointsRef.current.rotation.y += delta * animSpeed * rotSpeed;
    pointsRef.current.rotation.x += delta * animSpeed * (rotSpeed * 0.5);
    
    if (mode === 'cosmic') {
      pointsRef.current.rotation.z += delta * animSpeed * 0.08;
    }
    
    // Distance-based LOD
    const camera = state.camera;
    const distance = camera.position.distanceTo(pointsRef.current.position);
    lodLevel.current = Math.max(0.1, Math.min(1.0, 20 / distance));
    
    // Frustum culling
    const frustum = new THREE.Frustum();
    const matrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(matrix);
    
    shouldRender.current = frustum.intersectsObject(pointsRef.current);
    
    // Update material size based on LOD and performance
    if (materialRef.current) {
      materialRef.current.size = materialSettings.size * lodLevel.current;
      materialRef.current.opacity = materialSettings.opacity * lodLevel.current;
    }
    
    // Animate particles (only if performance allows)
    if (performanceManager?.getAverageFPS() > 30) {
      const positions = geometryRef.current.attributes.position.array;
      const velocities = particleData.velocities;
      
      for (let i = 0; i < optimizedCount; i++) {
        const i3 = i * 3;
        
        // Simple particle animation
        positions[i3] += velocities[i3] * delta * animSpeed * 10;
        positions[i3 + 1] += velocities[i3 + 1] * delta * animSpeed * 10;
        positions[i3 + 2] += velocities[i3 + 2] * delta * animSpeed * 10;
        
        // Boundary wrapping
        const radius = mode === 'quantum' ? 15 : mode === 'cosmic' ? 20 : 10;
        if (Math.abs(positions[i3]) > radius) velocities[i3] *= -1;
        if (Math.abs(positions[i3 + 1]) > radius) velocities[i3 + 1] *= -1;
        if (Math.abs(positions[i3 + 2]) > radius) velocities[i3 + 2] *= -1;
      }
      
      geometryRef.current.attributes.position.needsUpdate = true;
    }
  });

  // Update particle count when performance changes
  useEffect(() => {
    if (performanceManager) {
      const handlePerformanceUpdate = () => {
        // Trigger re-render with new optimized count
        // This will be handled by the useMemo dependency
      };
      
      performanceManager.onPerformanceUpdate(handlePerformanceUpdate);
      
      return () => {
        performanceManager.offPerformanceUpdate(handlePerformanceUpdate);
      };
    }
  }, [performanceManager]);

  if (!shouldRender.current) {
    return null; // Frustum culled
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={optimizedCount}
          array={particleData.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={optimizedCount}
          array={particleData.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        ref={materialRef}
        {...materialSettings}
      />
    </points>
  );
}