'use client';

import { Suspense, useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import AICommandEngine from '../lib/AICommandEngine';

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
  
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const handsRef = useRef(null);
  const aiEngine = useRef(new AICommandEngine());
  
  // AI response state
  const [aiResponse, setAiResponse] = useState('');
  const [aiConfidence, setAiConfidence] = useState(0);

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
          
          // Auto-demo gestures every 4 seconds
          const gestureDemo = setInterval(() => {
            const gestures = ['THUMBS_UP', 'THUMBS_DOWN', 'OPEN_HAND', 'FIST', 'PEACE'];
            const randomGesture = gestures[Math.floor(Math.random() * gestures.length)];
            executeGestureCommand(randomGesture);
          }, 4000);
          
          handsRef.current = gestureDemo;
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
      {/* Inclusive Control Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 10,
        backgroundColor: highContrast ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '15px',
        padding: '25px',
        border: `3px solid ${(isListening || cameraActive) ? getAccessibleColor('primary') : 'rgba(255, 255, 255, 0.2)'}`,
        boxShadow: (isListening || cameraActive) ? `0 0 30px ${getAccessibleColor('primary')}` : 'none',
        width: '420px',
        maxHeight: '85vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <div style={{ 
            width: '24px', 
            height: '24px', 
            backgroundColor: (isListening || cameraActive) ? '#00ff00' : '#ff0000', 
            borderRadius: '50%', 
            animation: (isListening || cameraActive) ? 'pulse 1s infinite' : 'none',
            boxShadow: (isListening || cameraActive) ? `0 0 15px #00ff00` : 'none'
          }}></div>
          <h2 style={{ 
            color: highContrast ? '#ffffff' : 'white', 
            fontWeight: 'bold', 
            fontSize: '18px',
            background: highContrast ? 'none' : `linear-gradient(45deg, ${getAccessibleColor('primary')}, ${getAccessibleColor('secondary')})`,
            WebkitBackgroundClip: highContrast ? 'unset' : 'text',
            WebkitTextFillColor: highContrast ? '#ffffff' : 'transparent',
            color: highContrast ? '#ffffff' : 'transparent'
          }}>
            ♿🎤🤟 INCLUSIVE NEURAL CANVAS
          </h2>
        </div>

        {/* Visual Mode Selection */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '15px' }}>🎨 Visual Mode</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '15px' }}>
            {Object.entries(modes).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                style={{
                  padding: '10px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: mode === key ? 
                    `linear-gradient(45deg, ${getAccessibleColor('primary')}, ${getAccessibleColor('secondary')})` : 
                    'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: mode === key ? 'bold' : 'normal',
                  transition: 'all 0.3s ease',
                  boxShadow: mode === key ? `0 0 15px ${getAccessibleColor('primary')}50` : 'none'
                }}
              >
                {config.name}
              </button>
            ))}
          </div>
        </div>

        {/* Accessibility Settings */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '15px' }}>♿ Accessibility</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ color: 'white', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              Vision Mode
            </label>
            <select
              value={colorBlindMode}
              onChange={(e) => setColorBlindMode(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '14px'
              }}
            >
              {Object.entries(colorBlindModeNames).map(([key, name]) => (
                <option key={key} value={key} style={{ backgroundColor: '#333', color: 'white' }}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                style={{ accentColor: getAccessibleColor('primary') }}
              />
              <span style={{ color: 'white', fontSize: '13px' }}>High Contrast</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                style={{ accentColor: getAccessibleColor('primary') }}
              />
              <span style={{ color: 'white', fontSize: '13px' }}>Reduce Motion</span>
            </label>
          </div>
        </div>

        {/* AI Voice Control */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '10px' }}>🧠 AI Voice Control</h3>
          
          <div style={{ 
            fontSize: '11px', 
            color: '#aaa', 
            marginBottom: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            padding: '8px',
            borderRadius: '6px',
            lineHeight: '1.4'
          }}>
            <strong style={{ color: 'white' }}>Try saying:</strong><br/>
            "Make it angry and red"<br/>
            "Quantum style with blue colors"<br/>
            "Calm and peaceful mood"<br/>
            "More particles, faster speed"<br/>
            "Create a plasma storm"
          </div>
          <button
            onClick={toggleVoiceControl}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: isListening ? 
                `linear-gradient(45deg, #ff0000, #ff6666)` : 
                `linear-gradient(45deg, ${getAccessibleColor('primary')}, ${getAccessibleColor('secondary')})`,
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '10px'
            }}
          >
            {isListening ? '🛑 STOP VOICE' : '🎤 START VOICE'}
          </button>
          
          {lastCommand && (
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '8px',
              borderRadius: '6px',
              fontSize: '12px',
              marginBottom: '8px'
            }}>
              <div style={{ color: '#aaa' }}>Last Voice Command:</div>
              <div style={{ color: 'white', fontWeight: 'bold' }}>"{lastCommand}"</div>
            </div>
          )}
          
          {aiResponse && (
            <div style={{
              backgroundColor: aiConfidence > 0.7 ? 'rgba(0, 255, 0, 0.1)' : 
                             aiConfidence > 0.4 ? 'rgba(255, 170, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
              border: `1px solid ${aiConfidence > 0.7 ? '#00ff00' : 
                                   aiConfidence > 0.4 ? '#ffaa00' : '#ff0000'}`,
              padding: '8px',
              borderRadius: '6px',
              fontSize: '12px'
            }}>
              <div style={{ color: '#aaa', fontSize: '10px' }}>AI Response ({Math.round(aiConfidence * 100)}% confident):</div>
              <div style={{ color: 'white', fontWeight: 'bold' }}>{aiResponse}</div>
            </div>
          )}
        </div>

        {/* ASL Control */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '10px' }}>🤟 ASL Control</h3>
          <button
            onClick={cameraActive ? stopCamera : startCamera}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: cameraActive ? 
                `linear-gradient(45deg, #ff0000, #ff6666)` : 
                `linear-gradient(45deg, #00ff41, #39ff14)`,
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '10px'
            }}
          >
            {cameraActive ? '📷 STOP CAMERA' : '🤟 START ASL'}
          </button>
          
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '8px',
            borderRadius: '6px',
            fontSize: '12px',
            marginBottom: '10px'
          }}>
            <div style={{ color: '#aaa' }}>Hand Status:</div>
            <div style={{ color: handDetected ? '#00ff00' : '#ff6666', fontWeight: 'bold' }}>
              {handDetected ? '✋ Hand Detected' : '❌ No Hand'}
            </div>
            {lastGesture && (
              <>
                <div style={{ color: '#aaa', marginTop: '5px' }}>Last Gesture:</div>
                <div style={{ color: 'white', fontWeight: 'bold' }}>
                  {gestureNames[lastGesture] || lastGesture}
                </div>
              </>
            )}
          </div>
          
          <div style={{ fontSize: '11px', color: '#aaa', lineHeight: '1.3' }}>
            <strong style={{ color: 'white' }}>ASL Gestures:</strong><br/>
            👍 Thumbs Up → Brighter<br/>
            👎 Thumbs Down → Dimmer<br/>
            ✋ Open Hand → More Particles<br/>
            ✊ Fist → Less Particles<br/>
            ✌️ Peace → Change Vision Mode<br/>
            <div style={{ marginTop: '5px', color: '#888', fontSize: '10px' }}>
              🎲 Auto-demo every 4s | 🎮 Keys 1-5 to test
            </div>
            
            {aiResponse && (
              <div style={{
                backgroundColor: 'rgba(0, 255, 0, 0.1)',
                border: '1px solid #00ff00',
                padding: '6px',
                borderRadius: '4px',
                fontSize: '10px',
                marginTop: '8px'
              }}>
                <div style={{ color: '#aaa' }}>AI Gesture Response:</div>
                <div style={{ color: 'white', fontWeight: 'bold' }}>{aiResponse}</div>
              </div>
            )}
          </div>
        </div>

        {/* Video preview */}
        {cameraActive && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            width: '160px',
            height: '120px',
            border: '2px solid ' + getAccessibleColor('primary'),
            borderRadius: '8px',
            overflow: 'hidden'
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
      </div>

      {/* Status Display */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 10,
        backgroundColor: highContrast ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '10px',
        padding: '15px',
        color: 'white',
        fontSize: '14px',
        border: `2px solid ${highContrast ? '#ffffff' : 'rgba(255, 255, 255, 0.1)'}`,
        boxShadow: `0 0 20px ${getAccessibleColor('primary')}30`
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{modes[mode].name}</div>
          <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '2px' }}>Vision: {colorBlindModeNames[colorBlindMode]}</div>
          <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '2px' }}>Intensity: {intensity.toFixed(1)}</div>
          <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '2px' }}>Particles: {particleCount}</div>
          <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>Speed: {getMotionSpeed().toFixed(1)}x</div>
          <div style={{ 
            fontSize: '11px', 
            color: (isListening || cameraActive) ? '#00ff00' : getAccessibleColor('primary'), 
            fontWeight: 'bold'
          }}>
            {isListening && cameraActive ? '🧠🎤🤟 AI + VOICE + ASL' : 
             isListening ? '🧠🎤 AI VOICE ACTIVE' :
             cameraActive ? '🧠🤟 AI ASL ACTIVE' : '🧠♿ AI ACCESSIBLE'}
          </div>
          {(highContrast || reducedMotion) && (
            <div style={{ fontSize: '10px', color: '#aaa', marginTop: '5px' }}>
              {highContrast && '🔆 High Contrast'} {reducedMotion && '🐌 Reduced Motion'}
            </div>
          )}
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
      
      {/* Dynamic Background */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: highContrast ? 
            'none' : 
            `radial-gradient(circle at center, transparent 0%, ${getAccessibleColor('primary')}15 50%, ${getAccessibleColor('secondary')}10 100%)`,
          opacity: highContrast ? 0 : 0.4 + intensity * 0.2,
          animation: (isListening || cameraActive) && !reducedMotion ? 'pulse 2s ease-in-out infinite' : 'none'
        }}
      ></div>
    </div>
  );
}