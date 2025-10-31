import { useState, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

export default function PerformanceMonitor() {
  const [stats, setStats] = useState({
    fps: 0,
    frameTime: 0,
    drawCalls: 0,
    triangles: 0,
    memory: 0
  });
  
  const { gl } = useThree();
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsHistory = useRef([]);

  useFrame(() => {
    frameCount.current++;
    const now = performance.now();
    const delta = now - lastTime.current;
    
    if (delta >= 1000) { // Update every second
      const fps = Math.round((frameCount.current * 1000) / delta);
      const frameTime = delta / frameCount.current;
      
      fpsHistory.current.push(fps);
      if (fpsHistory.current.length > 60) {
        fpsHistory.current.shift();
      }
      
      const info = gl.info;
      
      setStats({
        fps,
        frameTime: frameTime.toFixed(2),
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
        memory: (performance.memory?.usedJSHeapSize / 1024 / 1024).toFixed(1) || 'N/A'
      });
      
      frameCount.current = 0;
      lastTime.current = now;
    }
  });

  const getPerformanceColor = (fps) => {
    if (fps >= 55) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="absolute bottom-2 left-2 z-20 bg-black/60 backdrop-blur-lg rounded-lg p-2 text-xs font-mono">
      <div className="grid grid-cols-2 gap-2 text-white">
        <div>
          <span className="text-gray-400">FPS:</span>
          <span className={`ml-1 font-bold ${getPerformanceColor(stats.fps)}`}>
            {stats.fps}
          </span>
        </div>
        
        <div>
          <span className="text-gray-400">Frame:</span>
          <span className="ml-1 text-blue-400">{stats.frameTime}ms</span>
        </div>
        
        <div>
          <span className="text-gray-400">Calls:</span>
          <span className="ml-1 text-purple-400">{stats.drawCalls}</span>
        </div>
        
        <div>
          <span className="text-gray-400">Tris:</span>
          <span className="ml-1 text-cyan-400">{stats.triangles.toLocaleString()}</span>
        </div>
        
        <div className="col-span-2">
          <span className="text-gray-400">Memory:</span>
          <span className="ml-1 text-orange-400">{stats.memory} MB</span>
        </div>
      </div>
      
      {/* Mini FPS graph */}
      <div className="mt-2 h-8 bg-black/50 rounded flex items-end gap-px overflow-hidden">
        {fpsHistory.current.slice(-30).map((fps, i) => (
          <div
            key={i}
            className={`w-1 ${getPerformanceColor(fps).replace('text-', 'bg-')}`}
            style={{ height: `${(fps / 60) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}