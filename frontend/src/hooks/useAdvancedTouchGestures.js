/**
 * Advanced Touch Gestures Hook
 * Handles complex multi-touch interactions for mobile neural canvas
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export const useAdvancedTouchGestures = (canvasRef) => {
  const [gestures, setGestures] = useState({
    pinch: { scale: 1, velocity: 0, active: false },
    pan: { x: 0, y: 0, velocity: { x: 0, y: 0 }, active: false },
    rotate: { angle: 0, velocity: 0, active: false },
    tap: { count: 0, position: { x: 0, y: 0 }, timestamp: 0 },
    swipe: { direction: null, velocity: 0, distance: 0 },
    force: { pressure: 0, active: false }
  });

  const touchState = useRef({
    touches: [],
    lastTouches: [],
    startTime: 0,
    lastUpdateTime: 0,
    initialDistance: 0,
    initialAngle: 0,
    initialCenter: { x: 0, y: 0 },
    tapTimeout: null,
    swipeThreshold: 50,
    velocityThreshold: 0.5
  });

  // Calculate distance between two touches
  const getDistance = useCallback((touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Calculate angle between two touches
  const getAngle = useCallback((touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  }, []);

  // Calculate center point of touches
  const getCenter = useCallback((touches) => {
    let x = 0, y = 0;
    touches.forEach(touch => {
      x += touch.clientX;
      y += touch.clientY;
    });
    return { x: x / touches.length, y: y / touches.length };
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((event) => {
    event.preventDefault();
    
    const touches = Array.from(event.touches);
    const currentTime = Date.now();
    
    touchState.current.touches = touches;
    touchState.current.startTime = currentTime;
    touchState.current.lastUpdateTime = currentTime;

    if (touches.length === 1) {
      // Single touch - potential tap or swipe
      const touch = touches[0];
      
      // Handle tap detection
      if (touchState.current.tapTimeout) {
        clearTimeout(touchState.current.tapTimeout);
        // Double tap detected
        setGestures(prev => ({
          ...prev,
          tap: {
            count: 2,
            position: { x: touch.clientX, y: touch.clientY },
            timestamp: currentTime
          }
        }));
      } else {
        // Single tap (wait for potential double tap)
        touchState.current.tapTimeout = setTimeout(() => {
          setGestures(prev => ({
            ...prev,
            tap: {
              count: 1,
              position: { x: touch.clientX, y: touch.clientY },
              timestamp: currentTime
            }
          }));
        }, 300);
      }

    } else if (touches.length === 2) {
      // Two touches - pinch/rotate/pan
      touchState.current.initialDistance = getDistance(touches[0], touches[1]);
      touchState.current.initialAngle = getAngle(touches[0], touches[1]);
      touchState.current.initialCenter = getCenter(touches);
      
      setGestures(prev => ({
        ...prev,
        pinch: { ...prev.pinch, active: true },
        rotate: { ...prev.rotate, active: true },
        pan: { ...prev.pan, active: true }
      }));
    }
  }, [getDistance, getAngle, getCenter]);

  // Handle touch move
  const handleTouchMove = useCallback((event) => {
    event.preventDefault();
    
    const touches = Array.from(event.touches);
    const currentTime = Date.now();
    const deltaTime = currentTime - touchState.current.lastUpdateTime;
    
    if (deltaTime < 16) return; // Throttle to ~60fps
    
    touchState.current.lastUpdateTime = currentTime;

    if (touches.length === 1) {
      // Single touch - pan or swipe
      const touch = touches[0];
      const lastTouch = touchState.current.touches[0];
      
      if (lastTouch) {
        const deltaX = touch.clientX - lastTouch.clientX;
        const deltaY = touch.clientY - lastTouch.clientY;
        const velocity = {
          x: deltaX / deltaTime * 1000,
          y: deltaY / deltaTime * 1000
        };
        
        setGestures(prev => ({
          ...prev,
          pan: {
            x: prev.pan.x + deltaX,
            y: prev.pan.y + deltaY,
            velocity,
            active: true
          }
        }));
      }

    } else if (touches.length === 2) {
      // Two touches - pinch/rotate/pan
      const currentDistance = getDistance(touches[0], touches[1]);
      const currentAngle = getAngle(touches[0], touches[1]);
      const currentCenter = getCenter(touches);
      
      // Pinch gesture
      const scale = currentDistance / touchState.current.initialDistance;
      const scaleVelocity = (scale - gestures.pinch.scale) / deltaTime * 1000;
      
      // Rotation gesture
      let angleDelta = currentAngle - touchState.current.initialAngle;
      // Normalize angle to -180 to 180
      while (angleDelta > 180) angleDelta -= 360;
      while (angleDelta < -180) angleDelta += 360;
      
      const rotationVelocity = angleDelta / deltaTime * 1000;
      
      // Pan gesture (center movement)
      const panDeltaX = currentCenter.x - touchState.current.initialCenter.x;
      const panDeltaY = currentCenter.y - touchState.current.initialCenter.y;
      const panVelocity = {
        x: panDeltaX / deltaTime * 1000,
        y: panDeltaY / deltaTime * 1000
      };
      
      setGestures(prev => ({
        ...prev,
        pinch: {
          scale,
          velocity: scaleVelocity,
          active: true
        },
        rotate: {
          angle: prev.rotate.angle + angleDelta,
          velocity: rotationVelocity,
          active: true
        },
        pan: {
          x: prev.pan.x + panDeltaX,
          y: prev.pan.y + panDeltaY,
          velocity: panVelocity,
          active: true
        }
      }));
      
      // Update initial values for next frame
      touchState.current.initialDistance = currentDistance;
      touchState.current.initialAngle = currentAngle;
      touchState.current.initialCenter = currentCenter;
    }

    // Handle force touch (3D Touch / Force Touch)
    if (touches[0] && 'force' in touches[0]) {
      const pressure = touches[0].force;
      setGestures(prev => ({
        ...prev,
        force: {
          pressure,
          active: pressure > 0.5
        }
      }));
    }

    touchState.current.touches = touches;
  }, [getDistance, getAngle, getCenter, gestures.pinch.scale]);

  // Handle touch end
  const handleTouchEnd = useCallback((event) => {
    event.preventDefault();
    
    const touches = Array.from(event.touches);
    const currentTime = Date.now();
    const touchDuration = currentTime - touchState.current.startTime;
    
    // Detect swipe gesture
    if (touches.length === 0 && touchState.current.touches.length === 1) {
      const startTouch = touchState.current.touches[0];
      const endTouch = touchState.current.lastTouches[0] || startTouch;
      
      const deltaX = endTouch.clientX - startTouch.clientX;
      const deltaY = endTouch.clientY - startTouch.clientY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = distance / touchDuration;
      
      if (distance > touchState.current.swipeThreshold && velocity > touchState.current.velocityThreshold) {
        let direction = null;
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        
        if (angle >= -45 && angle <= 45) direction = 'right';
        else if (angle >= 45 && angle <= 135) direction = 'down';
        else if (angle >= 135 || angle <= -135) direction = 'left';
        else if (angle >= -135 && angle <= -45) direction = 'up';
        
        setGestures(prev => ({
          ...prev,
          swipe: { direction, velocity, distance }
        }));
      }
    }

    // Reset active states
    setGestures(prev => ({
      ...prev,
      pinch: { ...prev.pinch, active: false },
      rotate: { ...prev.rotate, active: false },
      pan: { ...prev.pan, active: false },
      force: { ...prev.force, active: false }
    }));

    touchState.current.lastTouches = touchState.current.touches;
    touchState.current.touches = touches;
  }, []);

  // Setup touch event listeners
  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas) return;

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [canvasRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Gesture command mapping for neural canvas
  const mapGestureToCommand = useCallback((gesture) => {
    switch (gesture.type) {
      case 'pinch':
        if (gesture.scale > 1.1) return 'increase_intensity';
        if (gesture.scale < 0.9) return 'decrease_intensity';
        break;
        
      case 'rotate':
        if (Math.abs(gesture.angle) > 30) return 'change_mode';
        break;
        
      case 'swipe':
        switch (gesture.direction) {
          case 'up': return 'increase_particles';
          case 'down': return 'decrease_particles';
          case 'left': return 'previous_color';
          case 'right': return 'next_color';
        }
        break;
        
      case 'tap':
        if (gesture.count === 2) return 'toggle_mode';
        if (gesture.count === 1) return 'pulse_effect';
        break;
        
      case 'force':
        if (gesture.active) return 'ultimate_mode';
        break;
        
      case 'three_finger_tap':
        return 'reset_canvas';
        
      case 'four_finger_swipe':
        return 'save_state';
    }
    
    return null;
  }, []);

  // Advanced gesture patterns
  const detectAdvancedGestures = useCallback(() => {
    // Three finger tap
    if (touchState.current.touches.length === 3) {
      return { type: 'three_finger_tap' };
    }
    
    // Four finger swipe
    if (touchState.current.touches.length === 4 && gestures.swipe.direction) {
      return { type: 'four_finger_swipe', direction: gestures.swipe.direction };
    }
    
    // Heart gesture (trace pattern)
    // Circle gesture (circular motion)
    // Custom ASL gestures
    
    return null;
  }, [gestures.swipe.direction]);

  // Haptic feedback for gestures
  const triggerHapticFeedback = useCallback((intensity = 'medium') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50],
        double: [20, 50, 20],
        success: [10, 30, 10, 30, 10]
      };
      
      navigator.vibrate(patterns[intensity] || patterns.medium);
    }
  }, []);

  return {
    gestures,
    mapGestureToCommand,
    detectAdvancedGestures,
    triggerHapticFeedback,
    touchCapabilities: {
      maxTouchPoints: navigator.maxTouchPoints || 0,
      supportsForceTouch: 'TouchEvent' in window && 'force' in TouchEvent.prototype
    }
  };
};