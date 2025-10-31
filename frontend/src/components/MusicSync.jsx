import { useState, useEffect, useRef } from 'react';

export default function MusicSync({ onBeatDetected, onFrequencyData }) {
  const [isConnected, setIsConnected] = useState(false);
  const [musicData, setMusicData] = useState({ beat: false, energy: 0, frequency: [] });
  const analyserRef = useRef();
  const beatDetectorRef = useRef({ lastBeat: 0, threshold: 0.3 });

  const connectToSpotify = async () => {
    // Spotify Web API integration would go here
    console.log('Spotify integration would be implemented here');
    setIsConnected(true);
  };

  const connectToMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      source.connect(analyser);
      analyser.fftSize = 512;
      analyserRef.current = analyser;
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const timeArray = new Uint8Array(analyser.fftSize);
      
      const updateMusicData = () => {
        analyser.getByteFrequencyData(dataArray);
        analyser.getByteTimeDomainData(timeArray);
        
        // Calculate energy levels
        const bassEnergy = dataArray.slice(0, 32).reduce((sum, val) => sum + val, 0) / 32;
        const midEnergy = dataArray.slice(32, 128).reduce((sum, val) => sum + val, 0) / 96;
        const trebleEnergy = dataArray.slice(128, 256).reduce((sum, val) => sum + val, 0) / 128;
        
        const totalEnergy = (bassEnergy + midEnergy + trebleEnergy) / 3;
        
        // Beat detection
        const now = Date.now();
        const beatDetector = beatDetectorRef.current;
        let beatDetected = false;
        
        if (bassEnergy > beatDetector.threshold * 255 && 
            now - beatDetector.lastBeat > 300) { // Minimum 300ms between beats
          beatDetected = true;
          beatDetector.lastBeat = now;
          
          if (onBeatDetected) onBeatDetected();
        }
        
        const newMusicData = {
          beat: beatDetected,
          energy: totalEnergy / 255,
          bass: bassEnergy / 255,
          mid: midEnergy / 255,
          treble: trebleEnergy / 255,
          frequency: Array.from(dataArray).map(val => val / 255)
        };
        
        setMusicData(newMusicData);
        
        if (onFrequencyData) onFrequencyData(newMusicData);
        
        requestAnimationFrame(updateMusicData);
      };
      
      updateMusicData();
      setIsConnected(true);
      
    } catch (error) {
      console.error('Microphone access failed:', error);
    }
  };

  const musicGenrePresets = {
    electronic: { bassBoost: 2.0, midBoost: 1.5, trebleBoost: 1.8 },
    rock: { bassBoost: 1.8, midBoost: 2.0, trebleBoost: 1.5 },
    classical: { bassBoost: 1.2, midBoost: 1.8, trebleBoost: 1.3 },
    jazz: { bassBoost: 1.5, midBoost: 2.2, trebleBoost: 1.4 },
    ambient: { bassBoost: 1.0, midBoost: 1.0, trebleBoost: 1.0 }
  };

  return (
    <div className="absolute top-2 right-16 z-20 bg-black/40 backdrop-blur-lg rounded-lg p-2 w-48">
      <h3 className="text-white font-bold text-xs mb-2">🎵 Music Sync</h3>
      
      {!isConnected ? (
        <div className="space-y-1">
          <button
            onClick={connectToMicrophone}
            className="w-full px-2 py-1 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded text-xs font-bold hover:shadow-lg transition-all"
          >
            🎤 Connect Microphone
          </button>
          
          <button
            onClick={connectToSpotify}
            className="w-full px-2 py-1 bg-gradient-to-r from-green-400 to-green-600 text-white rounded text-xs font-bold hover:shadow-lg transition-all"
          >
            🎧 Connect Spotify
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-white">Status:</span>
            <div className={`w-2 h-2 rounded-full ${musicData.beat ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-300">Bass</span>
              <div className="w-16 h-1 bg-black/50 rounded overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-100"
                  style={{ width: `${musicData.bass * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex justify-between text-xs">
              <span className="text-gray-300">Mid</span>
              <div className="w-16 h-1 bg-black/50 rounded overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-green-500 transition-all duration-100"
                  style={{ width: `${musicData.mid * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex justify-between text-xs">
              <span className="text-gray-300">Treble</span>
              <div className="w-16 h-1 bg-black/50 rounded overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100"
                  style={{ width: `${musicData.treble * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-center text-gray-400">
            Energy: {(musicData.energy * 100).toFixed(0)}%
          </div>
        </div>
      )}
    </div>
  );
}