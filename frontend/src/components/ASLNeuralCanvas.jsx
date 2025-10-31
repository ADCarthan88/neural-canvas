'use client';

import { Suspense, useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function NeuralMesh({ color, intensity, morphing }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5 * intensity;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * intensity;
      
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2 * intensity;
      meshRef.current.scale.setScalar(scale);
      
      if (morphing) {
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5;
      }
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1, 0.3, 100, 16]} />
      <meshStandardMaterial 
        color={color} 
        wireframe 
        transparent 
        opacity={0.8}
        emissive={color}
        emissiveIntensity={intensity * 0.2}
      />
    </mesh>
  );
}

function ParticleField({ count, color, speed }) {
  const pointsRef = useRef();
  
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const colorObj = new THREE.Color(color);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      
      colors[i * 3] = colorObj.r + Math.random() * 0.3;
      colors[i * 3 + 1] = colorObj.g + Math.random() * 0.3;
      colors[i * 3 + 2] = colorObj.b + Math.random() * 0.3;
    }
    
    return { positions, colors };
  }, [count, color]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * speed * 0.1;
      pointsRef.current.rotation.x = state.clock.elapsedTime * speed * 0.05;
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
        size={0.05} 
        vertexColors 
        transparent 
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function ASLNeuralCanvas() {
  const [mode, setMode] = useState('neural');
  const [intensity, setIntensity] = useState(1.0);
  const [particleCount, setParticleCount] = useState(2000);
  const [primaryColor, setPrimaryColor] = useState('#ff006e');
  const [secondaryColor, setSecondaryColor] = useState('#8338ec');
  const [speed, setSpeed] = useState(1.0);
  const [morphing, setMorphing] = useState(true);
  
  // Voice control states
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(false);
  
  // ASL control states
  const [cameraActive, setCameraActive] = useState(false);
  const [lastGesture, setLastGesture] = useState('');
  const [handDetected, setHandDetected] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recognitionRef = useRef(null);
  const handsRef = useRef(null);

  // Simple gesture recognition based on hand landmarks
  const recognizeGesture = useCallback((landmarks) => {
    if (!landmarks || landmarks.length === 0) {
      setHandDetected(false);
      return null;
    }
    
    setHandDetected(true);
    
    // Get key landmark points
    const thumb_tip = landmarks[4];
    const index_tip = landmarks[8];
    const middle_tip = landmarks[12];
    const ring_tip = landmarks[16];
    const pinky_tip = landmarks[20];
    const wrist = landmarks[0];
    
    // Simple gesture recognition
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
    
    // Peace sign (change colors)
    if (index_tip.y < wrist.y && middle_tip.y < wrist.y && ring_tip.y > wrist.y && pinky_tip.y > wrist.y) {
      return 'PEACE';
    }
    
    // Point up (speed up)
    if (index_tip.y < wrist.y - 0.15 && middle_tip.y > wrist.y) {
      return 'POINT_UP';
    }
    
    // Point down (slow down)
    if (index_tip.y > wrist.y + 0.15 && middle_tip.y > wrist.y) {
      return 'POINT_DOWN';
    }
    
    return null;
  }, []);

  // Execute gesture commands
  const executeGestureCommand = useCallback((gesture) => {
    if (!gesture) return;
    
    setLastGesture(gesture);
    
    switch (gesture) {
      case 'THUMBS_UP':
        setIntensity(prev => Math.min(3, prev + 0.3));
        break;
      case 'THUMBS_DOWN':
        setIntensity(prev => Math.max(0.1, prev - 0.3));
        break;
      case 'OPEN_HAND':
        setParticleCount(prev => Math.min(8000, prev + 500));
        break;
      case 'FIST':
        setParticleCount(prev => Math.max(500, prev - 500));
        break;
      case 'PEACE':
        // Cycle through colors
        const colors = ['#ff006e', '#00d4ff', '#8b5cf6', '#ff6b35', '#00ff41'];
        const currentIndex = colors.indexOf(primaryColor);
        const nextIndex = (currentIndex + 1) % colors.length;
        setPrimaryColor(colors[nextIndex]);
        setSecondaryColor(colors[(nextIndex + 1) % colors.length]);
        break;
      case 'POINT_UP':
        setSpeed(prev => Math.min(3, prev + 0.2));
        break;
      case 'POINT_DOWN':
        setSpeed(prev => Math.max(0.1, prev - 0.2));
        break;
    }
    
    // Visual feedback
    document.body.style.boxShadow = `0 0 50px ${primaryColor}`;
    setTimeout(() => {
      document.body.style.boxShadow = 'none';
    }, 300);
  }, [primaryColor]);

  // Initialize camera and hand tracking
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraActive(true);
          
          // Start hand detection
          if (typeof window !== 'undefined') {
            import('@mediapipe/hands').then(({ Hands }) => {
              const hands = new Hands({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
              });
              
              hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
              });
              
              hands.onResults((results) => {
                if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                  const gesture = recognizeGesture(results.multiHandLandmarks[0]);
                  if (gesture) {
                    executeGestureCommand(gesture);
                  }
                }
              });
              
              handsRef.current = hands;
              
              // Process video frames
              const processFrame = () => {
                if (videoRef.current && cameraActive) {
                  hands.send({ image: videoRef.current });
                  requestAnimationFrame(processFrame);
                }
              };
              processFrame();
            });
          }
        };
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      alert('Camera access is required for ASL recognition');
    }
  }, [cameraActive, recognizeGesture, executeGestureCommand]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setHandDetected(false);
  }, []);

  // Voice commands (keeping existing functionality)
  const voiceCommands = {
    'make it brighter': () => setIntensity(Math.min(3, intensity + 0.5)),
    'make it dimmer': () => setIntensity(Math.max(0, intensity - 0.5)),
    'more particles': () => setParticleCount(Math.min(8000, particleCount + 1000)),
    'less particles': () => setParticleCount(Math.max(500, particleCount - 1000)),
    'speed up': () => setSpeed(Math.min(3, speed + 0.3)),
    'slow down': () => setSpeed(Math.max(0.1, speed - 0.3)),
    'make it red': () => { setPrimaryColor('#ff0000'); setSecondaryColor('#ff6666'); },
    'make it blue': () => { setPrimaryColor('#0066ff'); setSecondaryColor('#66aaff'); },
    'make it green': () => { setPrimaryColor('#00ff00'); setSecondaryColor('#66ff66'); },
    'psychedelic mode': () => {
      setIntensity(2.5);
      setPrimaryColor('#ff00ff');
      setSecondaryColor('#00ffff');
      setSpeed(2);
      setParticleCount(6000);
    },
    'reset everything': () => {
      setIntensity(1.0);
      setPrimaryColor('#ff006e');
      setSecondaryColor('#8338ec');
      setSpeed(1.0);
      setParticleCount(2000);
      setMode('neural');
      setMorphing(true);
    }
  };

  // Initialize speech recognition
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
          document.body.style.boxShadow = `0 0 50px ${primaryColor}`;
          setTimeout(() => {
            document.body.style.boxShadow = 'none';
          }, 300);
        }
      };
      
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => {
        if (isListening) recognition.start();
      };
      
      recognitionRef.current = recognition;
    }
  }, [isListening, primaryColor, intensity, particleCount, speed, morphing]);

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

  const gestureNames = {
    'THUMBS_UP': '👍 Thumbs Up (Brighter)',
    'THUMBS_DOWN': '👎 Thumbs Down (Dimmer)',
    'OPEN_HAND': '✋ Open Hand (More Particles)',
    'FIST': '✊ Fist (Less Particles)',
    'PEACE': '✌️ Peace Sign (Change Colors)',
    'POINT_UP': '☝️ Point Up (Speed Up)',
    'POINT_DOWN': '👇 Point Down (Slow Down)'
  };

  const modes = {
    neural: { name: '🧠 Neural Flow', baseColor: '#ff006e' },
    quantum: { name: '⚛️ Quantum Field', baseColor: '#8338ec' },
    cosmic: { name: '🌌 Cosmic Dance', baseColor: '#3a86ff' },
    plasma: { name: '⚡ Plasma Storm', baseColor: '#ff4081' },
    matrix: { name: '💚 Matrix Code', baseColor: '#00ff41' }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', position: 'relative', overflow: 'hidden' }}>
      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '15px',
        padding: '25px',
        border: `2px solid ${(isListening || cameraActive) ? primaryColor : 'rgba(255, 255, 255, 0.1)'}`,
        boxShadow: (isListening || cameraActive) ? `0 0 30px ${primaryColor}` : 'none',
        width: '380px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            backgroundColor: (isListening || cameraActive) ? '#00ff00' : '#ff0000', 
            borderRadius: '50%', 
            animation: (isListening || cameraActive) ? 'pulse 1s infinite' : 'none',
            boxShadow: (isListening || cameraActive) ? `0 0 15px #00ff00` : 'none'
          }}></div>
          <h2 style={{ 
            color: 'white', 
            fontWeight: 'bold', 
            fontSize: '20px',
            background: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🎤🤟 VOICE + ASL CANVAS
          </h2>
        </div>
        
        {/* Voice Control */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: 'white', fontSize: '16px', marginBottom: '10px' }}>🎤 Voice Control</h3>
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
                `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`,
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
              fontSize: '12px'
            }}>
              <div style={{ color: '#aaa' }}>Last Voice Command:</div>
              <div style={{ color: 'white', fontWeight: 'bold' }}>"{lastCommand}"</div>
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
            ✌️ Peace → Change Colors<br/>
            ☝️ Point Up → Speed Up<br/>
            👇 Point Down → Slow Down
          </div>
        </div>

        {/* Hidden video element for camera */}
        <video
          ref={videoRef}
          style={{ display: 'none' }}
          width="640"
          height="480"
          autoPlay
          muted
        />
      </div>

      {/* Status Display */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '10px',
        padding: '15px',
        color: 'white',
        fontSize: '14px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: `0 0 20px ${primaryColor}30`
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{modes[mode].name}</div>
          <div style={{ fontSize: '12px', color: '#aaa' }}>Intensity: {intensity.toFixed(1)}</div>
          <div style={{ fontSize: '12px', color: '#aaa' }}>Particles: {particleCount}</div>
          <div style={{ fontSize: '12px', color: '#aaa' }}>Speed: {speed.toFixed(1)}x</div>
          <div style={{ 
            fontSize: '12px', 
            color: (isListening || cameraActive) ? '#00ff00' : primaryColor, 
            marginTop: '5px',
            fontWeight: 'bold'
          }}>
            {isListening && cameraActive ? '🎤🤟 VOICE + ASL' : 
             isListening ? '🎤 VOICE ACTIVE' :
             cameraActive ? '🤟 ASL ACTIVE' : '🚀 READY'}
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
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} color={primaryColor} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color={secondaryColor} />
          <OrbitControls enablePan={false} enableZoom={true} autoRotate autoRotateSpeed={speed * 0.5} />
          
          <NeuralMesh 
            color={primaryColor}
            intensity={intensity}
            morphing={morphing}
          />
          
          <ParticleField 
            count={particleCount}
            color={secondaryColor}
            speed={speed}
          />
        </Suspense>
      </Canvas>
      
      {/* Dynamic Background */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(circle at center, transparent 0%, ${primaryColor}15 50%, ${secondaryColor}10 100%)`,
          opacity: 0.4 + intensity * 0.2,
          animation: (isListening || cameraActive) ? 'pulse 2s ease-in-out infinite' : 'pulse 4s ease-in-out infinite'
        }}
      ></div>
    </div>
  );
}