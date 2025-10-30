import { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  Stats,
  Preload
} from '@react-three/drei';
import * as THREE from 'three';

import SimpleNeuralCanvas from './shaders/SimpleNeuralCanvas';
import ParticleSystem from './shaders/ParticleSystem';

function AudioReactiveController({ children }) {
  const [audioData, setAudioData] = useState({ frequency: 0, amplitude: 0 });
  const analyserRef = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        
        source.connect(analyser);
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        const updateAudio = () => {
          analyser.getByteFrequencyData(dataArray);
          
          const amplitude = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length / 255;
          const frequency = dataArray.slice(0, 32).reduce((sum, value) => sum + value, 0) / 32 / 255;
          
          setAudioData({ frequency, amplitude });
          requestAnimationFrame(updateAudio);
        };
        
        updateAudio();
      })
      .catch(() => {
        console.log('Audio not available, using time-based animation');
      });
  }, []);

  return children({ audioData });
}

export default function UltimateMasterCanvas() {
  const [mode, setMode] = useState('ultimate');
  const [intensity, setIntensity] = useState(1.0);
  const [glitchIntensity, setGlitchIntensity] = useState(0.1);
  const [particleCount, setParticleCount] = useState(3000);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const modes = {
    neural: { name: '🧠 Neural Flow', color: '#ff006e' },
    quantum: { name: '⚛️ Quantum Field', color: '#8338ec' },
    liquid: { name: '🌊 Liquid Paint', color: '#3a86ff' },
    holographic: { name: '👁️ Holographic', color: '#00ffff' },
    ultimate: { name: '🚀 ULTIMATE MODE', color: '#ff4081' }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <AudioReactiveController>
      {({ audioData }) => (
        <div className="w-full h-screen relative overflow-hidden bg-black">
          <div className="absolute top-2 left-2 z-20 bg-black/40 backdrop-blur-lg rounded-lg p-3 border border-white/10 w-48">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <h2 className="text-white font-bold text-sm">NEURAL CANVAS</h2>
            </div>
            
            <div className="space-y-1 mb-3">
              {Object.entries(modes).map(([key, modeData]) => (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-all ${
                    mode === key 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {modeData.name}
                </button>
              ))}
            </div>
            
            <div className="space-y-2">
              <div>
                <label className="text-white text-xs">Intensity: {intensity.toFixed(1)}</label>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={intensity}
                  onChange={(e) => setIntensity(parseFloat(e.target.value))}
                  className="w-full mt-1 accent-pink-500 h-1"
                />
              </div>
              
              <div>
                <label className="text-white text-xs">Particles: {particleCount}</label>
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="500"
                  value={particleCount}
                  onChange={(e) => setParticleCount(parseInt(e.target.value))}
                  className="w-full mt-1 accent-blue-500 h-1"
                />
              </div>
            </div>
            
            <button
              onClick={toggleFullscreen}
              className="w-full mt-3 px-2 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded text-xs font-bold hover:shadow-lg transition-all"
            >
              {isFullscreen ? '🔙 EXIT' : '🚀 FULLSCREEN'}
            </button>
          </div>

          <div className="absolute top-2 right-2 z-20 bg-black/40 backdrop-blur-lg rounded-lg p-2 text-white text-xs">
            <div className="text-center">
              <div>{modes[mode].name}</div>
              <div>Audio: {audioData.amplitude > 0 ? '🎵' : '🔇'}</div>
            </div>
          </div>

          <Canvas
            camera={{ position: [0, 0, 8], fov: 60 }}
            gl={{ 
              antialias: true, 
              alpha: true,
              powerPreference: "high-performance"
            }}
            dpr={[1, 2]}
            frameloop="always"
          >
            <Suspense fallback={null}>
              <Preload all />
              <Environment preset="night" />
              <OrbitControls 
                enablePan={false} 
                enableZoom={true}
                autoRotate={mode === 'ultimate'}
                autoRotateSpeed={0.5}
                maxPolarAngle={Math.PI / 1.5}
                minDistance={3}
                maxDistance={15}
              />
              <Stats showPanel={0} className="stats" />
              
              {(mode === 'neural' || mode === 'ultimate') && (
                <SimpleNeuralCanvas 
                  intensity={intensity + audioData.amplitude} 
                  colors={{
                    primary: modes[mode].color
                  }}
                />
              )}
              
              {(mode === 'quantum' || mode === 'ultimate') && (
                <mesh>
                  <sphereGeometry args={[2, 32, 32]} />
                  <meshStandardMaterial 
                    color={modes.quantum.color} 
                    wireframe 
                    transparent 
                    opacity={0.6}
                  />
                </mesh>
              )}
              
              {(mode === 'liquid' || mode === 'ultimate') && (
                <mesh position={[0, 0, -1]}>
                  <planeGeometry args={[4, 4, 32, 32]} />
                  <meshStandardMaterial 
                    color={modes.liquid.color} 
                    transparent 
                    opacity={0.4}
                  />
                </mesh>
              )}
              
              {(mode === 'holographic' || mode === 'ultimate') && (
                <mesh>
                  <boxGeometry args={[2, 2, 2]} />
                  <meshStandardMaterial 
                    color={modes.holographic.color} 
                    wireframe 
                  />
                </mesh>
              )}
              
              {mode !== 'ultimate' && (
                <ParticleSystem 
                  count={Math.floor(particleCount / 2)} 
                  speed={0.5 + audioData.amplitude}
                />
              )}
              
              {/* Post-processing effects temporarily disabled for stability */}
            </Suspense>
          </Canvas>
          
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, transparent 0%, ${modes[mode].color}10 100%)`,
              opacity: 0.3 + audioData.amplitude * 0.7
            }}
          ></div>
        </div>
      )}
    </AudioReactiveController>
  );
}