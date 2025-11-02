/**
 * 👆 TOUCH GESTURES HOOK
 * Advanced touch gesture recognition for mobile devices
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export function useTouchGestures(onGesture) {
  const [gestureState, setGestureState] = useState({
    isActive: false,
    currentGesture: null,
    confidence: 0
  });
  
  const touchData = useRef({
    startTime: 0,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    touches: [],
    lastGesture: null,
    gestureTimeout: null
  });

  const recognizeGesture = useCallback((touch) => {
    const { startX, startY, currentX, currentY, startTime } = touch;
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = Date.now() - startTime;
    const velocity = distance / duration;
    
    // Gesture thresholds
    const minDistance = 50;
    const maxDuration = 1000;
    const minVelocity = 0.1;
    
    if (distance < minDistance || duration > maxDuration || velocity < minVelocity) {
      return null;
    }
    
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    const absAngle = Math.abs(angle);
    
    // Swipe direction detection
    if (absAngle < 30 || absAngle > 150) {
      return deltaX > 0 ? 'SWIPE_RIGHT' : 'SWIPE_LEFT';
    } else if (absAngle > 60 && absAngle < 120) {
      return deltaY > 0 ? 'SWIPE_DOWN' : 'SWIPE_UP';
    }
    
    return null;
  }, []);

  const recognizeTap = useCallback((touch) => {
    const { startX, startY, currentX, currentY, startTime } = touch;
    const distance = Math.sqrt(
      Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2)
    );
    const duration = Date.now() - startTime;
    
    // Tap detection
    if (distance < 20 && duration < 300) {
      return 'TAP';
    }
    
    // Long press detection
    if (distance < 20 && duration > 500) {
      return 'LONG_PRESS';
    }
    
    return null;
  }, []);

  const recognizeMultiTouch = useCallback((touches) => {
    if (touches.length === 2) {
      const touch1 = touches[0];
      const touch2 = touches[1];
      
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      // Store initial distance for pinch detection
      if (!touchData.current.initialPinchDistance) {
        touchData.current.initialPinchDistance = distance;
        return null;
      }
      
      const scale = distance / touchData.current.initialPinchDistance;
      
      if (scale > 1.2) return 'PINCH_OUT';
      if (scale < 0.8) return 'PINCH_IN';
    }
    
    if (touches.length === 3) {
      return 'THREE_FINGER_TAP';
    }
    
    if (touches.length === 4) {
      return 'FOUR_FINGER_TAP';
    }
    
    return null;
  }, []);

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    
    touchData.current = {
      ...touchData.current,
      startTime: Date.now(),
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      touches: Array.from(e.touches),
      initialPinchDistance: null
    };
    
    setGestureState(prev => ({ ...prev, isActive: true }));
  }, []);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    if (e.touches.length === 0) return;
    
    const touch = e.touches[0];
    touchData.current.currentX = touch.clientX;
    touchData.current.currentY = touch.clientY;
    touchData.current.touches = Array.from(e.touches);
    
    // Real-time multi-touch gesture detection
    if (e.touches.length > 1) {
      const gesture = recognizeMultiTouch(Array.from(e.touches));
      if (gesture && gesture !== touchData.current.lastGesture) {
        touchData.current.lastGesture = gesture;
        setGestureState(prev => ({ 
          ...prev, 
          currentGesture: gesture, 
          confidence: 0.8 
        }));
        onGesture?.(gesture, 0.8);
      }
    }
  }, [recognizeMultiTouch, onGesture]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    
    const gesture = e.touches.length === 0 
      ? recognizeGesture(touchData.current) || recognizeTap(touchData.current)
      : recognizeMultiTouch(Array.from(e.touches));
    
    if (gesture && gesture !== touchData.current.lastGesture) {
      const confidence = gesture.includes('SWIPE') ? 0.9 : 
                       gesture === 'TAP' ? 0.95 : 
                       gesture === 'LONG_PRESS' ? 0.85 : 0.7;
      
      setGestureState({
        isActive: false,
        currentGesture: gesture,
        confidence
      });
      
      onGesture?.(gesture, confidence);
      touchData.current.lastGesture = gesture;
      
      // Clear gesture after delay
      if (touchData.current.gestureTimeout) {
        clearTimeout(touchData.current.gestureTimeout);
      }
      
      touchData.current.gestureTimeout = setTimeout(() => {
        setGestureState(prev => ({ 
          ...prev, 
          currentGesture: null, 
          confidence: 0 
        }));
      }, 2000);
    } else {
      setGestureState(prev => ({ ...prev, isActive: false }));
    }
    
    // Reset pinch distance
    touchData.current.initialPinchDistance = null;
  }, [recognizeGesture, recognizeTap, recognizeMultiTouch, onGesture]);

  useEffect(() => {
    const element = document.body;
    
    // Add touch event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      if (touchData.current.gestureTimeout) {
        clearTimeout(touchData.current.gestureTimeout);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return gestureState;
}

export default useTouchGestures;