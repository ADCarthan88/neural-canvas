/**
 * VR/AR Integration System
 * WebXR support for immersive neural canvas experiences
 */

export class VRARIntegrationEngine {
  constructor() {
    this.xrSession = null;
    this.xrRefSpace = null;
    this.xrRenderer = null;
    this.xrCamera = null;
    this.controllers = [];
    this.handTracking = null;
    this.isVRSupported = false;
    this.isARSupported = false;
    this.currentMode = null; // 'vr', 'ar', or null
    
    this.gestureRecognizer = null;
    this.spatialAnchors = new Map();
    this.virtualObjects = [];
  }

  // Initialize WebXR capabilities
  async initialize() {
    if (!navigator.xr) {
      console.warn('WebXR not supported');
      return false;
    }

    try {
      // Check VR support
      this.isVRSupported = await navigator.xr.isSessionSupported('immersive-vr');
      
      // Check AR support
      this.isARSupported = await navigator.xr.isSessionSupported('immersive-ar');
      
      console.log(`🥽 VR Supported: ${this.isVRSupported}`);
      console.log(`📱 AR Supported: ${this.isARSupported}`);
      
      return this.isVRSupported || this.isARSupported;
    } catch (error) {
      console.error('WebXR initialization failed:', error);
      return false;
    }
  }

  // Start VR session
  async startVR(renderer, scene, camera) {
    if (!this.isVRSupported) {
      throw new Error('VR not supported');
    }

    try {
      this.xrSession = await navigator.xr.requestSession('immersive-vr', {
        requiredFeatures: ['local-floor'],
        optionalFeatures: ['hand-tracking', 'bounded-floor']
      });

      this.xrRenderer = renderer;
      this.xrCamera = camera;
      this.currentMode = 'vr';

      // Enable XR rendering
      renderer.xr.enabled = true;
      renderer.xr.setSession(this.xrSession);

      // Setup reference space
      this.xrRefSpace = await this.xrSession.requestReferenceSpace('local-floor');

      // Setup controllers
      this.setupVRControllers(scene);

      // Setup hand tracking if available
      if (this.xrSession.enabledFeatures?.includes('hand-tracking')) {
        this.setupHandTracking();
      }

      // Session event listeners
      this.xrSession.addEventListener('end', () => {
        this.cleanup();
      });

      console.log('🥽 VR Session started');
      return true;
    } catch (error) {
      console.error('Failed to start VR session:', error);
      return false;
    }
  }

  // Start AR session
  async startAR(renderer, scene, camera) {
    if (!this.isARSupported) {
      throw new Error('AR not supported');
    }

    try {
      this.xrSession = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['local-floor'],
        optionalFeatures: ['dom-overlay', 'hit-test', 'anchors', 'hand-tracking']
      });

      this.xrRenderer = renderer;
      this.xrCamera = camera;
      this.currentMode = 'ar';

      // Enable XR rendering
      renderer.xr.enabled = true;
      renderer.xr.setSession(this.xrSession);

      // Setup reference space
      this.xrRefSpace = await this.xrSession.requestReferenceSpace('local-floor');

      // Setup AR-specific features
      this.setupARFeatures(scene);

      // Setup hand tracking for AR gestures
      if (this.xrSession.enabledFeatures?.includes('hand-tracking')) {
        this.setupHandTracking();
      }

      console.log('📱 AR Session started');
      return true;
    } catch (error) {
      console.error('Failed to start AR session:', error);
      return false;
    }
  }

  // Setup VR controllers
  setupVRControllers(scene) {
    const controller1 = this.xrRenderer.xr.getController(0);
    const controller2 = this.xrRenderer.xr.getController(1);

    // Controller event listeners
    controller1.addEventListener('selectstart', (event) => {
      this.onControllerSelect(event, 0);
    });

    controller2.addEventListener('selectstart', (event) => {
      this.onControllerSelect(event, 1);
    });

    // Add controller models
    const controllerModelFactory = new XRControllerModelFactory();
    
    const controllerGrip1 = this.xrRenderer.xr.getControllerGrip(0);
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
    
    const controllerGrip2 = this.xrRenderer.xr.getControllerGrip(1);
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));

    scene.add(controller1);
    scene.add(controller2);
    scene.add(controllerGrip1);
    scene.add(controllerGrip2);

    this.controllers = [controller1, controller2];
  }

  // Setup AR-specific features
  setupARFeatures(scene) {
    // Hit testing for object placement
    this.setupHitTesting();
    
    // Plane detection
    this.setupPlaneDetection();
    
    // Light estimation
    this.setupLightEstimation();
  }

  // Setup hand tracking
  setupHandTracking() {
    if (!this.xrSession.inputSources) return;

    this.xrSession.addEventListener('inputsourceschange', (event) => {
      event.added.forEach(inputSource => {
        if (inputSource.hand) {
          console.log('👋 Hand tracking enabled');
          this.handTracking = inputSource.hand;
        }
      });
    });
  }

  // Handle controller interactions
  onControllerSelect(event, controllerIndex) {
    const controller = this.controllers[controllerIndex];
    const intersections = this.getControllerIntersections(controller);
    
    if (intersections.length > 0) {
      const intersection = intersections[0];
      this.onVRInteraction?.(intersection, controllerIndex);
    }
  }

  // Get controller intersections with virtual objects
  getControllerIntersections(controller) {
    const tempMatrix = new THREE.Matrix4();
    const raycaster = new THREE.Raycaster();
    
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
    
    return raycaster.intersectObjects(this.virtualObjects, true);
  }

  // Hand gesture recognition in VR/AR
  recognizeHandGestures(frame) {
    if (!this.handTracking || !frame) return null;

    const inputSources = this.xrSession.inputSources;
    
    for (const inputSource of inputSources) {
      if (inputSource.hand) {
        const joints = frame.getJointPoses(inputSource.hand, this.xrRefSpace);
        
        if (joints) {
          return this.analyzeHandPose(joints);
        }
      }
    }
    
    return null;
  }

  // Analyze hand pose for gestures
  analyzeHandPose(joints) {
    // Convert XR joint poses to gesture recognition format
    const landmarks = [];
    
    const jointNames = [
      'wrist',
      'thumb-metacarpal', 'thumb-phalanx-proximal', 'thumb-phalanx-distal', 'thumb-tip',
      'index-finger-metacarpal', 'index-finger-phalanx-proximal', 'index-finger-phalanx-intermediate', 'index-finger-phalanx-distal', 'index-finger-tip',
      'middle-finger-metacarpal', 'middle-finger-phalanx-proximal', 'middle-finger-phalanx-intermediate', 'middle-finger-phalanx-distal', 'middle-finger-tip',
      'ring-finger-metacarpal', 'ring-finger-phalanx-proximal', 'ring-finger-phalanx-intermediate', 'ring-finger-phalanx-distal', 'ring-finger-tip',
      'pinky-finger-metacarpal', 'pinky-finger-phalanx-proximal', 'pinky-finger-phalanx-intermediate', 'pinky-finger-phalanx-distal', 'pinky-finger-tip'
    ];

    jointNames.forEach(jointName => {
      const joint = joints[jointName];
      if (joint) {
        landmarks.push({
          x: joint.transform.position.x,
          y: joint.transform.position.y,
          z: joint.transform.position.z
        });
      }
    });

    // Use existing ASL recognition on XR hand data
    return this.gestureRecognizer?.recognizeGesture(landmarks);
  }

  // Hit testing for AR object placement
  setupHitTesting() {
    if (!this.xrSession.enabledFeatures?.includes('hit-test')) return;

    this.xrSession.requestHitTestSource({ space: this.xrRefSpace })
      .then(hitTestSource => {
        this.hitTestSource = hitTestSource;
      });
  }

  // Plane detection for AR
  setupPlaneDetection() {
    if (!this.xrSession.enabledFeatures?.includes('plane-detection')) return;

    this.xrSession.addEventListener('planeadded', (event) => {
      console.log('🏠 Plane detected:', event.plane);
      this.onPlaneDetected?.(event.plane);
    });
  }

  // Light estimation for realistic AR rendering
  setupLightEstimation() {
    if (!this.xrSession.enabledFeatures?.includes('light-estimation')) return;

    // Will be used in render loop to adjust lighting
    this.lightEstimation = true;
  }

  // Place virtual neural canvas in AR space
  placeNeuralCanvas(position, scale = 1) {
    if (this.currentMode !== 'ar') return null;

    const canvasAnchor = {
      id: 'neural-canvas-' + Date.now(),
      position: position,
      scale: scale,
      type: 'neural-canvas'
    };

    this.spatialAnchors.set(canvasAnchor.id, canvasAnchor);
    return canvasAnchor;
  }

  // Update VR/AR frame
  updateFrame(frame) {
    if (!frame || !this.xrSession) return;

    // Hand gesture recognition
    const gesture = this.recognizeHandGestures(frame);
    if (gesture) {
      this.onXRGesture?.(gesture);
    }

    // Hit testing for AR
    if (this.hitTestSource && this.currentMode === 'ar') {
      const hitTestResults = frame.getHitTestResults(this.hitTestSource);
      if (hitTestResults.length > 0) {
        this.onARHitTest?.(hitTestResults[0]);
      }
    }

    // Light estimation
    if (this.lightEstimation && frame.getLightEstimate) {
      const lightEstimate = frame.getLightEstimate();
      if (lightEstimate) {
        this.onLightEstimate?.(lightEstimate);
      }
    }
  }

  // Spatial audio for VR
  setupSpatialAudio(audioContext) {
    if (this.currentMode !== 'vr') return;

    // Create spatial audio nodes for immersive sound
    this.spatialAudio = {
      context: audioContext,
      listener: audioContext.listener,
      sources: new Map()
    };
  }

  // Add spatial audio source
  addSpatialAudioSource(id, position, audioBuffer) {
    if (!this.spatialAudio) return;

    const source = this.spatialAudio.context.createBufferSource();
    const panner = this.spatialAudio.context.createPanner();
    
    source.buffer = audioBuffer;
    panner.positionX.value = position.x;
    panner.positionY.value = position.y;
    panner.positionZ.value = position.z;
    
    source.connect(panner);
    panner.connect(this.spatialAudio.context.destination);
    
    this.spatialAudio.sources.set(id, { source, panner });
  }

  // Haptic feedback for controllers
  triggerHaptic(controllerIndex, intensity = 1.0, duration = 100) {
    if (this.controllers[controllerIndex]?.gamepad?.hapticActuators) {
      const actuator = this.controllers[controllerIndex].gamepad.hapticActuators[0];
      actuator.pulse(intensity, duration);
    }
  }

  // End XR session
  async endSession() {
    if (this.xrSession) {
      await this.xrSession.end();
    }
  }

  // Cleanup
  cleanup() {
    this.xrSession = null;
    this.xrRefSpace = null;
    this.controllers = [];
    this.handTracking = null;
    this.currentMode = null;
    this.spatialAnchors.clear();
    this.virtualObjects = [];
    
    if (this.xrRenderer) {
      this.xrRenderer.xr.enabled = false;
    }
    
    console.log('🧹 XR session cleaned up');
  }

  // Event handlers
  onVRInteraction = null;
  onXRGesture = null;
  onARHitTest = null;
  onPlaneDetected = null;
  onLightEstimate = null;

  // Getters
  isInVR() {
    return this.currentMode === 'vr';
  }

  isInAR() {
    return this.currentMode === 'ar';
  }

  getXRSession() {
    return this.xrSession;
  }

  getSpatialAnchors() {
    return Array.from(this.spatialAnchors.values());
  }
}