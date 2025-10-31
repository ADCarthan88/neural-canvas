'use client';

import { Suspense, useState, useRef, useMemo, useEffect } from 'react';
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

export default function VoiceControlledCanvas() {
  const [mode, setMode] = useState('neural');
  const [intensity, setIntensity] = useState(1.0);
  const [particleCount, setParticleCount] = useState(2000);
  const [primaryColor, setPrimaryColor] = useState('#ff006e');
  const [secondaryColor, setSecondaryColor] = useState('#8338ec');
  const [speed, setSpeed] = useState(1.0);
  const [morphing, setMorphing] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(false);

  const recognitionRef = useRef(null);

  // Voice command mappings
  const voiceCommands = {
    // Intensity commands
    'make it brighter': () => setIntensity(Math.min(3, intensity + 0.5)),
    'make it dimmer': () => setIntensity(Math.max(0, intensity - 0.5)),
    'max intensity': () => setIntensity(3),
    'minimum intensity': () => setIntensity(0.1),
    'more intense': () => setIntensity(Math.min(3, intensity + 0.3)),
    'less intense': () => setIntensity(Math.max(0, intensity - 0.3)),
    
    // Particle commands
    'more particles': () => setParticleCount(Math.min(8000, particleCount + 1000)),
    'less particles': () => setParticleCount(Math.max(500, particleCount - 1000)),
    'maximum particles': () => setParticleCount(8000),
    'minimum particles': () => setParticleCount(500),
    'add particles': () => setParticleCount(Math.min(8000, particleCount + 500)),
    'remove particles': () => setParticleCount(Math.max(500, particleCount - 500)),
    
    // Speed commands
    'speed up': () => setSpeed(Math.min(3, speed + 0.3)),
    'slow down': () => setSpeed(Math.max(0.1, speed - 0.3)),
    'faster': () => setSpeed(Math.min(3, speed + 0.2)),
    'slower': () => setSpeed(Math.max(0.1, speed - 0.2)),
    'maximum speed': () => setSpeed(3),
    'stop motion': () => setSpeed(0.1),
    
    // Mode commands
    'neural mode': () => setMode('neural'),
    'quantum mode': () => setMode('quantum'),
    'cosmic mode': () => setMode('cosmic'),
    'plasma mode': () => setMode('plasma'),
    'matrix mode': () => setMode('matrix'),
    
    // Color commands
    'make it red': () => { setPrimaryColor('#ff0000'); setSecondaryColor('#ff6666'); },
    'make it blue': () => { setPrimaryColor('#0066ff'); setSecondaryColor('#66aaff'); },
    'make it green': () => { setPrimaryColor('#00ff00'); setSecondaryColor('#66ff66'); },
    'make it purple': () => { setPrimaryColor('#8b5cf6'); setSecondaryColor('#a855f7'); },
    'make it pink': () => { setPrimaryColor('#ff006e'); setSecondaryColor('#ff69b4'); },
    'make it orange': () => { setPrimaryColor('#ff6b35'); setSecondaryColor('#f7931e'); },
    'neon colors': () => { setPrimaryColor('#ff1493'); setSecondaryColor('#00ffff'); },
    'cyber colors': () => { setPrimaryColor('#00d4ff'); setSecondaryColor('#0099cc'); },
    'matrix colors': () => { setPrimaryColor('#00ff41'); setSecondaryColor('#39ff14'); },
    
    // Effect commands
    'start morphing': () => setMorphing(true),
    'stop morphing': () => setMorphing(false),
    'toggle morphing': () => setMorphing(!morphing),
    
    // Preset combinations
    'psychedelic mode': () => {
      setIntensity(2.5);
      setPrimaryColor('#ff00ff');
      setSecondaryColor('#00ffff');
      setSpeed(2);
      setParticleCount(6000);
    },
    'calm mode': () => {
      setIntensity(0.8);
      setPrimaryColor('#4169e1');
      setSecondaryColor('#87ceeb');
      setSpeed(0.5);
      setParticleCount(1500);
    },
    'fire mode': () => {
      setIntensity(2.2);
      setPrimaryColor('#ff4500');
      setSecondaryColor('#ffd700');
      setSpeed(1.8);
      setParticleCount(4000);
    },
    'ice mode': () => {
      setIntensity(1.2);
      setPrimaryColor('#00bfff');
      setSecondaryColor('#e0ffff');
      setSpeed(0.7);
      setParticleCount(3000);
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
        
        // Find matching command
        const matchedCommand = Object.keys(voiceCommands).find(command => 
          transcript.includes(command) || command.includes(transcript)
        );
        
        if (matchedCommand) {
          voiceCommands[matchedCommand]();
          // Visual feedback
          document.body.style.boxShadow = `0 0 50px ${primaryColor}`;
          setTimeout(() => {
            document.body.style.boxShadow = 'none';
          }, 300);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        if (isListening) {
          recognition.start(); // Restart if still listening
        }
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

  const modes = {
    neural: { name: '🧠 Neural Flow', baseColor: '#ff006e' },
    quantum: { name: '⚛️ Quantum Field', baseColor: '#8338ec' },
    cosmic: { name: '🌌 Cosmic Dance', baseColor: '#3a86ff' },
    plasma: { name: '⚡ Plasma Storm', baseColor: '#ff4081' },
    matrix: { name: '💚 Matrix Code', baseColor: '#00ff41' }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', position: 'relative', overflow: 'hidden' }}>
      {/* Voice Control Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '15px',
        padding: '25px',
        border: `2px solid ${isListening ? primaryColor : 'rgba(255, 255, 255, 0.1)'}`,
        boxShadow: isListening ? `0 0 30px ${primaryColor}` : 'none',
        width: '350px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            backgroundColor: isListening ? '#00ff00' : '#ff0000', 
            borderRadius: '50%', 
            animation: isListening ? 'pulse 1s infinite' : 'none',
            boxShadow: isListening ? `0 0 15px #00ff00` : 'none'
          }}></div>
          <h2 style={{ 
            color: 'white', 
            fontWeight: 'bold', 
            fontSize: '22px',
            background: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🎤 VOICE NEURAL CANVAS
          </h2>
        </div>
        
        <button
          onClick={toggleVoiceControl}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            background: isListening ? 
              `linear-gradient(45deg, #ff0000, #ff6666)` : 
              `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`,
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '20px',
            boxShadow: isListening ? '0 0 20px #ff0000' : `0 0 20px ${primaryColor}30`
          }}
        >
          {isListening ? '🛑 STOP LISTENING' : '🎤 START VOICE CONTROL'}
        </button>
        
        {lastCommand && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '15px'
          }}>
            <div style={{ color: '#aaa', fontSize: '12px', marginBottom: '5px' }}>Last Command:</div>
            <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>"{lastCommand}"</div>
          </div>
        )}
        
        <div style={{ fontSize: '12px', color: '#aaa', lineHeight: '1.4' }}>
          <strong style={{ color: 'white' }}>Try saying:</strong><br/>
          • "Make it brighter" / "Make it dimmer"<br/>
          • "More particles" / "Less particles"<br/>
          • "Speed up" / "Slow down"<br/>
          • "Make it red/blue/green/purple"<br/>
          • "Psychedelic mode" / "Fire mode"<br/>
          • "Neural mode" / "Matrix mode"<br/>
          • "Reset everything"
        </div>
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
            color: isListening ? '#00ff00' : primaryColor, 
            marginTop: '5px',
            fontWeight: 'bold'
          }}>
            {isListening ? '🎤 LISTENING...' : '🚀 VOICE READY'}
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
          animation: isListening ? 'pulse 2s ease-in-out infinite' : 'pulse 4s ease-in-out infinite'
        }}
      ></div>
    </div>
  );
}