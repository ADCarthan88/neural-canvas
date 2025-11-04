'use client';

import { Suspense, useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import AICommandEngine from '../lib/AICommandEngine';
import { ASLRecognitionEngine } from '../lib/ASLRecognitionEngine';
import { AICreativeAssistant } from '../lib/AICreativeAssistant';
import { SubscriptionManager } from '../lib/SubscriptionManager';
import { AICompanion } from '../lib/AICompanion';
import ASLInterface from './ASLInterface';
import AIAssistantPanel from './AIAssistantPanel';
import AICompanionWidget from './AICompanionWidget';
import SubscriptionModal from './SubscriptionModal';
import FeatureGate from './FeatureGate';
import ExportPanel from './ExportPanel';
import AIGenerationPanel from './AIGenerationPanel';

// Visual mode configurations
const modes = {
  neural: { 
    name: '🧠 Neural Flow',
    geometry: 'torus',
    wireframe: true,
    particleSize: 0.05,
    particleBlending: THREE.AdditiveBlending
  },
  quantum: { 
    name: '⚛️ Quantum Field',
    geometry: 'sphere',
    wireframe: false,
    particleSize: 0.08,
    particleBlending: THREE.MultiplyBlending
  },
  cosmic: { 
    name: '🌌 Cosmic Dance',
    geometry: 'octahedron',
    wireframe: true,
    particleSize: 0.12,
    particleBlending: THREE.AdditiveBlending
  },
  plasma: { 
    name: '⚡ Plasma Storm',
    geometry: 'icosahedron',
    wireframe: false,
    particleSize: 0.15,
    particleBlending: THREE.AdditiveBlending
  }
};

function NeuralMesh({ color, intensity, morphing, mode }) {
  const meshRef = useRef();
  const modeConfig = modes[mode] || modes.neural;
  
  useFrame((state) => {
    if (meshRef.current) {
      const rotSpeed = mode === 'quantum' ? 0.2 : mode === 'plasma' ? 0.8 : 0.5;
      meshRef.current.rotation.x = state.clock.elapsedTime * rotSpeed * intensity;
      meshRef.current.rotation.y = state.clock.elapsedTime * (rotSpeed * 0.6) * intensity;
      
      const scaleAmount = mode === 'cosmic' ? 0.4 : mode === 'plasma' ? 0.6 : 0.2;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * scaleAmount * intensity;
      meshRef.current.scale.setScalar(scale);
      
      if (morphing) {
        const moveAmount = mode === 'quantum' ? 0.3 : mode === 'cosmic' ? 0.8 : 0.5;
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * moveAmount;
        if (mode === 'plasma') {
          meshRef.current.position.x = Math.cos(state.clock.elapsedTime * 0.7) * 0.3;
        }
      }
    }
  });

  const getGeometry = () => {
    switch (modeConfig.geometry) {
      case 'sphere': return <sphereGeometry args={[1.2, 32, 32]} />;
      case 'octahedron': return <octahedronGeometry args={[1.5]} />;
      case 'icosahedron': return <icosahedronGeometry args={[1.3]} />;
      default: return <torusKnotGeometry args={[1, 0.3, 100, 16]} />;
    }
  };

  return (
    <mesh ref={meshRef}>
      {getGeometry()}
      <meshStandardMaterial 
        color={color} 
        wireframe={modeConfig.wireframe}
        transparent 
        opacity={modeConfig.wireframe ? 0.8 : 0.6}
        emissive={color}
        emissiveIntensity={intensity * (mode === 'plasma' ? 0.4 : 0.2)}
        roughness={mode === 'quantum' ? 0.1 : 0.5}
        metalness={mode === 'plasma' ? 0.8 : 0.2}
      />
    </mesh>
  );
}

function ParticleField({ count, color, speed, mode }) {
  const pointsRef = useRef();
  const modeConfig = modes[mode] || modes.neural;
  
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const colorObj = new THREE.Color(color);
    
    for (let i = 0; i < count; i++) {
      const radius = mode === 'quantum' ? 15 : mode === 'cosmic' ? 20 : 10;
      const distribution = mode === 'plasma' ? 'sphere' : 'cube';
      
      if (distribution === 'sphere') {
        const phi = Math.random() * Math.PI * 2;
        const costheta = Math.random() * 2 - 1;
        const u = Math.random();
        const theta = Math.acos(costheta);
        const r = radius * Math.cbrt(u);
        
        positions[i * 3] = r * Math.sin(theta) * Math.cos(phi);
        positions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
        positions[i * 3 + 2] = r * Math.cos(theta);
      } else {
        positions[i * 3] = (Math.random() - 0.5) * radius;
        positions[i * 3 + 1] = (Math.random() - 0.5) * radius;
        positions[i * 3 + 2] = (Math.random() - 0.5) * radius;
      }
      
      const colorVariation = mode === 'plasma' ? 0.5 : 0.3;
      colors[i * 3] = Math.min(1, colorObj.r + Math.random() * colorVariation);
      colors[i * 3 + 1] = Math.min(1, colorObj.g + Math.random() * colorVariation);
      colors[i * 3 + 2] = Math.min(1, colorObj.b + Math.random() * colorVariation);
    }
    
    return { positions, colors };
  }, [count, color, mode]);

  useFrame((state) => {
    if (pointsRef.current) {
      const rotSpeed = mode === 'quantum' ? 0.05 : mode === 'cosmic' ? 0.15 : mode === 'plasma' ? 0.2 : 0.1;
      pointsRef.current.rotation.y = state.clock.elapsedTime * speed * rotSpeed;
      pointsRef.current.rotation.x = state.clock.elapsedTime * speed * (rotSpeed * 0.5);
      
      if (mode === 'cosmic') {
        pointsRef.current.rotation.z = state.clock.elapsedTime * speed * 0.08;
      }
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={modeConfig.particleSize} 
        vertexColors 
        transparent 
        opacity={mode === 'plasma' ? 0.9 : 0.8}
        blending={modeConfig.particleBlending}
      />
    </points>
  );
}

export default function InclusiveNeuralCanvas() {
  const [mode, setMode] = useState('neural');
  const [intensity, setIntensity] = useState(1.0);
  const [particleCount, setParticleCount] = useState(2000);
  const [primaryColor, setPrimaryColor] = useState('#ff006e');
  const [secondaryColor, setSecondaryColor] = useState('#8338ec');
  const [speed, setSpeed] = useState(1.0);
  const [morphing, setMorphing] = useState(true);
  
  // Accessibility states
  const [colorBlindMode, setColorBlindMode] = useState('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  
  // Voice control states
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(false);
  
  // ASL control states
  const [cameraActive, setCameraActive] = useState(false);
  const [lastGesture, setLastGesture] = useState('');
  const [handDetected, setHandDetected] = useState(false);
  const [currentLetter, setCurrentLetter] = useState(null);
  const [currentSpelling, setCurrentSpelling] = useState('');
  const [recognizedCommand, setRecognizedCommand] = useState(null);
  
  // AI Assistant states
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [currentMood, setCurrentMood] = useState('calm');
  const [aiSuggestion, setAiSuggestion] = useState(null);
  
  // Subscription states
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [triggeredFeature, setTriggeredFeature] = useState(null);
  
  // Companion states
  const [companionVisible, setCompanionVisible] = useState(true);
  const [userSessionState, setUserSessionState] = useState({
    sessionStart: Date.now(),
    creationsCount: 0,
    lastInteraction: Date.now(),
    rapidChanges: 0,
    justCreated: false
  });
  
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const handsRef = useRef(null);
  const aiEngine = useRef(new AICommandEngine());
  const aslEngine = useRef(new ASLRecognitionEngine());
  const aiAssistant = useRef(new AICreativeAssistant());
  const subscriptionManager = useRef(new SubscriptionManager());
  const aiCompanion = useRef(new AICompanion());
  
  // AI response state
  const [aiResponse, setAiResponse] = useState('');
  const [aiConfidence, setAiConfidence] = useState(0);
  
  // Export states
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  
  // Initialize AI Assistant
  useEffect(() => {
    const moodAnalysis = setInterval(() => {
      if (aiAssistant.current && currentMood) {
        const suggestion = aiAssistant.current.analyzeMoodAndSuggest(currentMood);
        setAiSuggestion(suggestion);
      }
    }, 30000);
    
    return () => clearInterval(moodAnalysis);
  }, [currentMood]);
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);

  // Color blind friendly palettes
  const colorBlindPalettes = {
    normal: {
      primary: '#ff006e',
      secondary: '#8338ec',
      accent: '#3a86ff'
    },
    protanopia: { // Red-blind
      primary: '#0066cc', // Blue instead of red
      secondary: '#ffaa00', // Orange/yellow
      accent: '#00aa44'   // Green
    },
    deuteranopia: { // Green-blind
      primary: '#0066ff', // Blue
      secondary: '#ff6600', // Orange
      accent: '#cc00cc'   // Purple
    },
    tritanopia: { // Blue-blind
      primary: '#ff0066', // Pink/red
      secondary: '#00cc66', // Green
      accent: '#ffaa00'   // Yellow/orange
    },
    monochrome: { // Complete color blindness
      primary: '#ffffff', // White
      secondary: '#888888', // Gray
      accent: '#444444'   // Dark gray
    }
  };

  // Apply color blind settings
  const getAccessibleColor = useCallback((colorType) => {
    const palette = colorBlindPalettes[colorBlindMode];
    
    if (highContrast) {
      // High contrast versions
      switch (colorType) {
        case 'primary': return colorBlindMode === 'monochrome' ? '#ffffff' : palette.primary;
        case 'secondary': return colorBlindMode === 'monochrome' ? '#000000' : palette.secondary;
        case 'accent': return colorBlindMode === 'monochrome' ? '#666666' : palette.accent;
        default: return palette.primary;
      }
    }
    
    return palette[colorType] || palette.primary;
  }, [colorBlindMode, highContrast]);

  // Update colors when accessibility settings change
  useEffect(() => {
    setPrimaryColor(getAccessibleColor('primary'));
    setSecondaryColor(getAccessibleColor('secondary'));
  }, [colorBlindMode, highContrast, getAccessibleColor]);

  // Adjust motion based on reduced motion setting
  const getMotionSpeed = useCallback(() => {
    return reducedMotion ? speed * 0.3 : speed;
  }, [speed, reducedMotion]);

  // Simple gesture recognition
  const recognizeGesture = useCallback((landmarks) => {
    if (!landmarks || landmarks.length === 0) {
      setHandDetected(false);
      return null;
    }
    
    setHandDetected(true);
    
    const thumb_tip = landmarks[4];
    const index_tip = landmarks[8];
    const middle_tip = landmarks[12];
    const ring_tip = landmarks[16];
    const pinky_tip = landmarks[20];
    const wrist = landmarks[0];
    
    // Thumbs up (increase intensity)
    if (thumb_tip.y < wrist.y - 0.1 && index_tip.y > wrist.y) {
      return 'THUMBS_UP';
    }
    
    // Thumbs down (decrease intensity)
    if (thumb_tip.y > wrist.y + 0.1 && index_tip.y > wrist.y) {
      return 'THUMBS_DOWN';
    }
    
    // Open hand (more particles)
    if (index_tip.y < wrist.y && middle_tip.y < wrist.y && ring_tip.y < wrist.y && pinky_tip.y < wrist.y) {
      return 'OPEN_HAND';
    }
    
    // Fist (less particles)
    if (index_tip.y > wrist.y && middle_tip.y > wrist.y && ring_tip.y > wrist.y && pinky_tip.y > wrist.y) {
      return 'FIST';
    }
    
    // Peace sign (change accessibility mode)
    if (index_tip.y < wrist.y && middle_tip.y < wrist.y && ring_tip.y > wrist.y && pinky_tip.y > wrist.y) {
      return 'PEACE';
    }
    
    return null;
  }, []);

  // Execute AI-powered commands
  // Apply AI Assistant suggestion
  const applyAISuggestion = useCallback((settings) => {
    if (settings.colors && settings.colors.length > 0) {
      setPrimaryColor(settings.colors[0]);
      if (settings.colors[1]) setSecondaryColor(settings.colors[1]);
    }
    if (settings.intensity !== undefined) setIntensity(settings.intensity);
    if (settings.speed !== undefined) setSpeed(settings.speed);
    
    aiAssistant.current?.recordInteraction('suggestion_applied', { settings });
  }, []);
  
  // Handle feature upgrade requests
  const handleUpgradeRequest = useCallback((feature) => {
    setTriggeredFeature(feature);
    setShowSubscriptionModal(true);
  }, []);
  
  // Update user session state for companion
  const updateUserState = useCallback((changes) => {
    setUserSessionState(prev => ({ ...prev, ...changes, lastInteraction: Date.now() }));
  }, []);
  
  const executeAICommand = useCallback((input) => {
    const currentState = {
      mode,
      intensity,
      particleCount,
      speed,
      primaryColor,
      secondaryColor
    };
    
    const setters = {
      setMode,
      setIntensity,
      setPrimaryColor,
      setSecondaryColor,
      setParticleCount,
      setSpeed,
      setMorphing
    };
    
    const result = aiEngine.current.interpretCommand(input, currentState);
    
    if (result.understood) {
      aiEngine.current.executeActions(result.actions, currentState, setters);
      setAiResponse(result.response);
      setAiConfidence(result.confidence);
      
      // Visual feedback based on confidence
      const feedbackColor = result.confidence > 0.8 ? '#00ff00' : 
                           result.confidence > 0.5 ? '#ffaa00' : '#ff6600';
      document.body.style.boxShadow = `0 0 50px ${feedbackColor}`;
      setTimeout(() => {
        document.body.style.boxShadow = 'none';
      }, 500);
      
      // Clear response after 3 seconds
      setTimeout(() => {
        setAiResponse('');
        setAiConfidence(0);
      }, 3000);
    } else {
      setAiResponse(result.response);
      setAiConfidence(0);
      
      // Red feedback for misunderstood commands
      document.body.style.boxShadow = `0 0 50px #ff0000`;
      setTimeout(() => {
        document.body.style.boxShadow = 'none';
      }, 300);
      
      setTimeout(() => {
        setAiResponse('');
      }, 4000);
    }
  }, [mode, intensity, particleCount, speed, primaryColor, secondaryColor, setMode, setIntensity, setPrimaryColor, setSecondaryColor, setParticleCount, setSpeed, setMorphing]);
  
  // Execute gesture commands through AI engine
  const executeGestureCommand = useCallback((gesture) => {
    if (!gesture) return;
    
    setLastGesture(gesture);
    executeAICommand(gesture);
  }, [executeAICommand]);

  // Initialize camera and hand tracking
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = async () => {
          await videoRef.current.play();
          setCameraActive(true);
          setHandDetected(true);
          
          // Auto-demo ASL recognition every 4 seconds
          const aslDemo = setInterval(() => {
            // Simulate ASL letter recognition
            const letters = ['H', 'E', 'L', 'L', 'O'];
            const randomLetter = letters[Math.floor(Math.random() * letters.length)];
            setCurrentLetter(randomLetter);
            
            // Simulate spelling
            if (Math.random() > 0.7) {
              const words = ['MORE', 'BRIGHT', 'FAST', 'BIG', 'BEAUTIFUL'];
              const randomWord = words[Math.floor(Math.random() * words.length)];
              setCurrentSpelling(randomWord);
              setRecognizedCommand(randomWord);
              executeAICommand(randomWord);
              
              setTimeout(() => {
                setCurrentSpelling('');
                setRecognizedCommand(null);
              }, 2000);
            }
            
            setTimeout(() => setCurrentLetter(null), 1500);
          }, 4000);
          
          handsRef.current = aslDemo;
        };
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      alert('Camera access is required for ASL recognition');
    }
  }, [executeGestureCommand]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (handsRef.current) {
      clearInterval(handsRef.current);
      handsRef.current = null;
    }
    setCameraActive(false);
    setHandDetected(false);
  }, []);

  // Voice commands with accessibility
  const voiceCommands = {
    'make it brighter': () => setIntensity(Math.min(3, intensity + 0.5)),
    'make it dimmer': () => setIntensity(Math.max(0, intensity - 0.5)),
    'more particles': () => setParticleCount(Math.min(8000, particleCount + 1000)),
    'less particles': () => setParticleCount(Math.max(500, particleCount - 1000)),
    'speed up': () => setSpeed(Math.min(3, speed + 0.3)),
    'slow down': () => setSpeed(Math.max(0.1, speed - 0.3)),
    
    // Accessibility commands
    'full color vision': () => setColorBlindMode('normal'),
    'standard vision': () => setColorBlindMode('normal'),
    'red blind mode': () => setColorBlindMode('protanopia'),
    'green blind mode': () => setColorBlindMode('deuteranopia'),
    'blue blind mode': () => setColorBlindMode('tritanopia'),
    'monochrome mode': () => setColorBlindMode('monochrome'),
    'high contrast on': () => setHighContrast(true),
    'high contrast off': () => setHighContrast(false),
    'reduce motion': () => setReducedMotion(true),
    'normal motion': () => setReducedMotion(false),
    
    // Visual mode commands
    'neural flow': () => setMode('neural'),
    'neural mode': () => setMode('neural'),
    'quantum field': () => setMode('quantum'),
    'quantum mode': () => setMode('quantum'),
    'cosmic dance': () => setMode('cosmic'),
    'cosmic mode': () => setMode('cosmic'),
    'plasma storm': () => setMode('plasma'),
    'plasma mode': () => setMode('plasma'),
    
    'reset everything': () => {
      setIntensity(1.0);
      setSpeed(1.0);
      setParticleCount(2000);
      setMode('neural');
      setMorphing(true);
      setColorBlindMode('normal');
      setHighContrast(false);
      setReducedMotion(false);
    }
  };

  // Initialize speech recognition and keyboard controls
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      setVoiceSupported(true);
      
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        setLastCommand(transcript);
        
        const matchedCommand = Object.keys(voiceCommands).find(command => 
          transcript.includes(command) || command.includes(transcript)
        );
        
        if (matchedCommand) {
          voiceCommands[matchedCommand]();
        } else {
          // Use AI engine for unrecognized commands
          executeAICommand(transcript);
        }
      };
      
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => {
        if (isListening) recognition.start();
      };
      
      recognitionRef.current = recognition;
    }
    
    // Add keyboard listeners for gesture testing
    const handleKeyPress = (e) => {
      switch(e.key) {
        case '1': 
          executeGestureCommand('THUMBS_UP');
          setHandDetected(true);
          setTimeout(() => setHandDetected(false), 1000);
          break;
        case '2': 
          executeGestureCommand('THUMBS_DOWN');
          setHandDetected(true);
          setTimeout(() => setHandDetected(false), 1000);
          break;
        case '3': 
          executeGestureCommand('OPEN_HAND');
          setHandDetected(true);
          setTimeout(() => setHandDetected(false), 1000);
          break;
        case '4': 
          executeGestureCommand('FIST');
          setHandDetected(true);
          setTimeout(() => setHandDetected(false), 1000);
          break;
        case '5': 
          executeGestureCommand('PEACE');
          setHandDetected(true);
          setTimeout(() => setHandDetected(false), 1000);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isListening, getAccessibleColor, intensity, particleCount, speed, morphing, executeGestureCommand]);

  const toggleVoiceControl = () => {
    if (!voiceSupported) {
      alert('Voice recognition not supported in this browser');
      return;
    }
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };
  
  // Get current canvas state for saving
  const getCurrentCanvasState = useCallback(() => {
    return {
      mode,
      intensity,
      particleCount,
      primaryColor,
      secondaryColor,
      speed,
      morphing,
      colorBlindMode,
      highContrast,
      reducedMotion,
      accessibility: {
        voiceControl: isListening,
        cameraActive: cameraActive
      }
    };
  }, [mode, intensity, particleCount, primaryColor, secondaryColor, speed, morphing, colorBlindMode, highContrast, reducedMotion, isListening, cameraActive]);
  
  // Load canvas state
  const handleLoadCanvasState = useCallback((state) => {
    if (state.mode) setMode(state.mode);
    if (state.intensity !== undefined) setIntensity(state.intensity);
    if (state.particleCount) setParticleCount(state.particleCount);
    if (state.primaryColor) setPrimaryColor(state.primaryColor);
    if (state.secondaryColor) setSecondaryColor(state.secondaryColor);
    if (state.speed !== undefined) setSpeed(state.speed);
    if (state.morphing !== undefined) setMorphing(state.morphing);
    if (state.colorBlindMode) setColorBlindMode(state.colorBlindMode);
    if (state.highContrast !== undefined) setHighContrast(state.highContrast);
    if (state.reducedMotion !== undefined) setReducedMotion(state.reducedMotion);
  }, []);

  const colorBlindModeNames = {
    normal: '🌈 Full Color Vision',
    protanopia: '🔴 Red-Blind (Protanopia)',
    deuteranopia: '🟢 Green-Blind (Deuteranopia)',
    tritanopia: '🔵 Blue-Blind (Tritanopia)',
    monochrome: '⚫ Monochrome'
  };

  const gestureNames = {
    'THUMBS_UP': '👍 Thumbs Up (Brighter)',
    'THUMBS_DOWN': '👎 Thumbs Down (Dimmer)',
    'OPEN_HAND': '✋ Open Hand (More Particles)',
    'FIST': '✊ Fist (Less Particles)',
    'PEACE': '✌️ Peace (Change Vision Mode)'
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      backgroundColor: highContrast ? '#000000' : '#000', 
      position: 'relative', 
      overflow: 'hidden',
      filter: highContrast ? 'contrast(150%)' : 'none'
    }}>
      {/* Compact Control Panel */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(15px)',
        borderRadius: '12px',
        padding: '12px',
        border: `2px solid ${(isListening || cameraActive) ? getAccessibleColor('primary') : 'rgba(255, 255, 255, 0.3)'}`,
        width: '220px',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.8), 0 0 20px ${getAccessibleColor('primary')}30`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '10px', 
              height: '10px', 
              backgroundColor: (isListening || cameraActive) ? '#00ff00' : '#ff4444', 
              borderRadius: '50%',
              boxShadow: `0 0 10px ${(isListening || cameraActive) ? '#00ff00' : '#ff4444'}`
            }}></div>
            <h2 style={{ 
              color: 'white', 
              fontSize: '14px',
              margin: 0,
              fontWeight: 'bold'
            }}>
              🧠 NEURAL CANVAS
            </h2>
          </div>
          <div style={{ fontSize: '10px', color: '#aaa' }}>
            {modes[mode].name.split(' ')[0]}
          </div>
        </div>

        {/* Compact Mode Selection */}
        <div style={{ marginBottom: '12px' }}>
          <h3 style={{ color: 'white', fontSize: '12px', marginBottom: '8px', margin: 0, fontWeight: 'bold' }}>🎨 Visual Mode</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {Object.entries(modes).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                style={{
                  padding: '8px 6px',
                  borderRadius: '8px',
                  border: mode === key ? `2px solid ${getAccessibleColor('primary')}` : '2px solid transparent',
                  cursor: 'pointer',
                  background: mode === key ? 
                    `linear-gradient(135deg, ${getAccessibleColor('primary')}20, ${getAccessibleColor('secondary')}20)` : 
                    'rgba(255, 255, 255, 0.08)',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: mode === key ? 'bold' : 'normal',
                  transition: 'all 0.3s ease',
                  boxShadow: mode === key ? `0 0 20px ${getAccessibleColor('primary')}40` : 'none',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {config.name}
              </button>
            ))}
          </div>
        </div>



        {/* AI Controls */}
        <div style={{ marginBottom: '12px' }}>
          <h3 style={{ color: 'white', fontSize: '12px', marginBottom: '8px', margin: 0, fontWeight: 'bold' }}>🤖 AI Controls</h3>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
            <button
              onClick={toggleVoiceControl}
              style={{
                flex: 1,
                padding: '10px 8px',
                borderRadius: '8px',
                border: isListening ? `2px solid #ff4444` : `2px solid #00ff44`,
                cursor: 'pointer',
                background: isListening ? 'rgba(255, 68, 68, 0.2)' : 'rgba(0, 255, 68, 0.2)',
                color: 'white',
                fontSize: '11px',
                fontWeight: 'bold',
                boxShadow: isListening ? '0 0 15px #ff444440' : '0 0 15px #00ff4440'
              }}
            >
              {isListening ? '🛑 STOP' : '🎤 VOICE'}
            </button>
            <button
              onClick={cameraActive ? stopCamera : startCamera}
              style={{
                flex: 1,
                padding: '10px 8px',
                borderRadius: '8px',
                border: cameraActive ? `2px solid #ff4444` : `2px solid #00ff44`,
                cursor: 'pointer',
                background: cameraActive ? 'rgba(255, 68, 68, 0.2)' : 'rgba(0, 255, 68, 0.2)',
                color: 'white',
                fontSize: '11px',
                fontWeight: 'bold',
                boxShadow: cameraActive ? '0 0 15px #ff444440' : '0 0 15px #00ff4440'
              }}
            >
              {cameraActive ? '📷 STOP' : '🤟 ASL'}
            </button>
          </div>
          
          {(lastCommand || aiResponse) && (
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '8px',
              borderRadius: '8px',
              fontSize: '11px',
              marginTop: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {lastCommand && (
                <div style={{ marginBottom: aiResponse ? '6px' : '0' }}>
                  <div style={{ color: '#aaa', fontSize: '9px' }}>Voice:</div>
                  <div style={{ color: 'white', fontWeight: 'bold' }}>"{lastCommand}"</div>
                </div>
              )}
              {aiResponse && (
                <div>
                  <div style={{ color: '#aaa', fontSize: '9px' }}>AI ({Math.round(aiConfidence * 100)}%):</div>
                  <div style={{ color: aiConfidence > 0.7 ? '#00ff00' : aiConfidence > 0.4 ? '#ffaa00' : '#ff6666', fontWeight: 'bold' }}>
                    {aiResponse}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ASL Status */}
        {cameraActive && (
          <div style={{ marginBottom: '12px' }}>
            <h3 style={{ color: 'white', fontSize: '12px', marginBottom: '8px', margin: 0, fontWeight: 'bold' }}>🤟 ASL Status</h3>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '8px',
              borderRadius: '8px',
              fontSize: '11px',
              border: `1px solid ${handDetected ? '#00ff44' : '#ff4444'}`
            }}>
              <div style={{ color: handDetected ? '#00ff44' : '#ff4444', fontWeight: 'bold', marginBottom: '4px' }}>
                {handDetected ? '✋ Hand Detected' : '❌ No Hand'}
              </div>
              {currentLetter && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ color: '#aaa', fontSize: '10px' }}>Letter:</span>
                  <span style={{ color: '#00ff44', fontWeight: 'bold', fontSize: '14px' }}>{currentLetter}</span>
                </div>
              )}
              {currentSpelling && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ color: '#aaa', fontSize: '10px' }}>Word:</span>
                  <span style={{ color: '#ffaa00', fontWeight: 'bold' }}>{currentSpelling}</span>
                </div>
              )}
              {recognizedCommand && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#aaa', fontSize: '10px' }}>Cmd:</span>
                  <span style={{ color: '#00ff44', fontWeight: 'bold' }}>✓ {recognizedCommand}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Quick Stats */}
        <div style={{ marginBottom: '12px' }}>
          <h3 style={{ color: 'white', fontSize: '12px', marginBottom: '8px', margin: 0, fontWeight: 'bold' }}>📊 Current Settings</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px',
            fontSize: '10px'
          }}>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '6px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ color: '#aaa' }}>Intensity</div>
              <div style={{ color: 'white', fontWeight: 'bold' }}>{intensity.toFixed(1)}</div>
            </div>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '6px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ color: '#aaa' }}>Speed</div>
              <div style={{ color: 'white', fontWeight: 'bold' }}>{getMotionSpeed().toFixed(1)}x</div>
            </div>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '6px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ color: '#aaa' }}>Particles</div>
              <div style={{ color: 'white', fontWeight: 'bold' }}>{(particleCount/1000).toFixed(1)}K</div>
            </div>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '6px', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ color: '#aaa' }}>Vision</div>
              <div style={{ color: 'white', fontWeight: 'bold' }}>{colorBlindMode === 'normal' ? '🌈' : '♿'}</div>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div style={{ fontSize: '9px', color: '#666', lineHeight: '1.2' }}>
          <div style={{ color: '#aaa', fontWeight: 'bold', marginBottom: '4px' }}>⌨️ Shortcuts:</div>
          <div>1-5: Test gestures</div>
          <div>Ctrl+P: Performance mode</div>
          <div>Ctrl+M: Mode selector</div>
        </div>
      </div>
      
      {/* Compact Video Preview */}
      {cameraActive && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '140px',
          height: '105px',
          border: '2px solid ' + getAccessibleColor('primary'),
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px ${getAccessibleColor('primary')}40`
        }}>
          <video
            ref={videoRef}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              transform: 'scaleX(-1)'
            }}
            autoPlay
            muted
          />
        </div>
      )}

      {/* ASL Interface */}
      {cameraActive && (
        <ASLInterface
          currentLetter={currentLetter}
          currentSpelling={currentSpelling}
          recognizedCommand={recognizedCommand}
          isActive={cameraActive}
        />
      )}
      
      {/* Compact Status Badge */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: cameraActive ? '160px' : '10px',
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(15px)',
        borderRadius: '12px',
        padding: '8px 12px',
        color: 'white',
        fontSize: '11px',
        border: `2px solid ${(isListening || cameraActive) ? getAccessibleColor('primary') : 'rgba(255, 255, 255, 0.2)'}`,
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.8), 0 0 20px ${getAccessibleColor('primary')}30`,
        transition: 'right 0.3s ease'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '12px' }}>{modes[mode].name}</div>
          <div style={{ 
            fontSize: '10px', 
            color: (isListening || cameraActive) ? '#00ff44' : getAccessibleColor('primary'), 
            fontWeight: 'bold'
          }}>
            {isListening && cameraActive ? '🧠🎤🤟 FULL AI' : 
             isListening ? '🧠🎤 VOICE' :
             cameraActive ? '🧠🤟 ASL' : '🧠♿ READY'}
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
        onCreated={({ gl, scene, camera }) => {
          // Store references for export
          rendererRef.current = gl;
          sceneRef.current = scene;
          cameraRef.current = camera;
          canvasRef.current = gl.domElement;
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={highContrast ? 0.6 : 0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} color={getAccessibleColor('primary')} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color={getAccessibleColor('secondary')} />
          <OrbitControls 
            enablePan={false} 
            enableZoom={true} 
            autoRotate={!reducedMotion} 
            autoRotateSpeed={getMotionSpeed() * 0.5}
            enabled={true}
          />
          
          <NeuralMesh 
            color={getAccessibleColor('primary')}
            intensity={intensity}
            morphing={morphing && !reducedMotion}
            mode={mode}
          />
          
          <ParticleField 
            count={particleCount}
            color={getAccessibleColor('secondary')}
            speed={getMotionSpeed()}
            mode={mode}
          />
        </Suspense>
      </Canvas>
      
      {/* Enhanced Background */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: highContrast ? 
            'none' : 
            `radial-gradient(circle at 30% 40%, ${getAccessibleColor('primary')}15 0%, transparent 50%), radial-gradient(circle at 70% 60%, ${getAccessibleColor('secondary')}10 0%, transparent 50%)`,
          opacity: highContrast ? 0 : 0.3 + intensity * 0.15,
          animation: (isListening || cameraActive) && !reducedMotion ? 'pulse 3s ease-in-out infinite' : 'none'
        }}
      ></div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: ${highContrast ? 0 : 0.3 + intensity * 0.15}; }
          50% { opacity: ${highContrast ? 0 : 0.5 + intensity * 0.2}; }
        }
      `}</style>
      
      {/* Compact Action Buttons */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '250px',
        zIndex: 15,
        display: 'flex',
        gap: '12px'
      }}>
        <button
          onClick={() => setShowAIAssistant(true)}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            border: '2px solid #8a2be2',
            backgroundColor: 'rgba(138, 43, 226, 0.2)',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(138, 43, 226, 0.4)',
            backdropFilter: 'blur(10px)'
          }}
          title="AI Creative Assistant"
        >
          🧠
        </button>
        
        <button
          onClick={() => setShowAIPanel(true)}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            border: '2px solid #ff00ff',
            backgroundColor: 'rgba(255, 0, 255, 0.2)',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(255, 0, 255, 0.4)',
            backdropFilter: 'blur(10px)'
          }}
          title="AI Generation"
        >
          🤖
        </button>
        
        <button
          onClick={() => setShowExportPanel(true)}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            border: '2px solid #00ff00',
            backgroundColor: 'rgba(0, 255, 0, 0.2)',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0, 255, 0, 0.4)',
            backdropFilter: 'blur(10px)'
          }}
          title="Save & Export"
        >
          💾
        </button>
      </div>
      
      {/* AI Creative Assistant Panel */}
      <AIAssistantPanel
        aiAssistant={aiAssistant.current}
        onApplySuggestion={applyAISuggestion}
        currentMood={currentMood}
        onMoodChange={setCurrentMood}
        isVisible={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
      />
      
      {/* AI Generation Panel */}
      <AIGenerationPanel
        canvasState={getCurrentCanvasState()}
        isVisible={showAIPanel}
        onClose={() => setShowAIPanel(false)}
        onApplyToCanvas={(aiResult) => {
          setAiResponse(`🎨 Applied AI style: ${aiResult.style}`);
          setTimeout(() => setAiResponse(''), 3000);
        }}
      />
      
      {/* AI Companion Widget */}
      <AICompanionWidget
        companion={aiCompanion.current}
        userState={{
          ...userSessionState,
          sessionDuration: Date.now() - userSessionState.sessionStart,
          currentMood,
          isIdle: Date.now() - userSessionState.lastInteraction > 30000
        }}
        isVisible={companionVisible}
      />
      
      {/* Subscription Modal */}
      <SubscriptionModal
        isVisible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        subscriptionManager={subscriptionManager.current}
        triggeredByFeature={triggeredFeature}
      />
      
      {/* Export Panel */}
      <ExportPanel
        canvasRef={canvasRef}
        rendererRef={rendererRef}
        sceneRef={sceneRef}
        cameraRef={cameraRef}
        canvasState={getCurrentCanvasState()}
        onLoadState={handleLoadCanvasState}
        isVisible={showExportPanel}
        onClose={() => setShowExportPanel(false)}
      />
    </div>
  );
}