import { useEffect, useRef, useState } from 'react';
import { useCanvas } from '../hooks/useCanvas';

export default function RealtimeCanvas({ roomId, token }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [cursors, setCursors] = useState(new Map());
  const { socket, isConnected, sendDrawing, sendCursor } = useCanvas(roomId, token);

  useEffect(() => {
    if (!socket) return;

    // Listen for other users' drawings
    socket.on('canvas:draw', (data) => {
      drawOnCanvas(data);
    });

    // Listen for cursor movements
    socket.on('cursor:move', (data) => {
      setCursors(prev => new Map(prev.set(data.userId, {
        x: data.x,
        y: data.y,
        username: data.username
      })));
    });

    // Listen for users joining/leaving
    socket.on('user:joined', (data) => {
      console.log(`${data.username} joined the canvas`);
    });

    socket.on('user:left', (data) => {
      setCursors(prev => {
        const newCursors = new Map(prev);
        newCursors.delete(data.userId);
        return newCursors;
      });
    });

    return () => {
      socket.off('canvas:draw');
      socket.off('cursor:move');
      socket.off('user:joined');
      socket.off('user:left');
    };
  }, [socket]);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    sendDrawing({
      type: 'start',
      x,
      y,
      color: '#000000',
      size: 5
    });
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Send to other users
    sendDrawing({
      type: 'draw',
      x,
      y,
      color: '#000000',
      size: 5
    });
    
    // Send cursor position
    sendCursor(x, y);
    
    // Draw locally
    drawOnCanvas({ type: 'draw', x, y, color: '#000000', size: 5 });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    sendDrawing({ type: 'end' });
  };

  const drawOnCanvas = (data) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.size;
    ctx.lineCap = 'round';
    
    if (data.type === 'start') {
      ctx.beginPath();
      ctx.moveTo(data.x, data.y);
    } else if (data.type === 'draw') {
      ctx.lineTo(data.x, data.y);
      ctx.stroke();
    }
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-300 cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      
      {/* Render other users' cursors */}
      {Array.from(cursors.entries()).map(([userId, cursor]) => (
        <div
          key={userId}
          className="absolute pointer-events-none"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="bg-blue-500 w-3 h-3 rounded-full"></div>
          <span className="text-xs bg-blue-500 text-white px-1 rounded">
            {cursor.username}
          </span>
        </div>
      ))}
      
      {/* Connection status */}
      <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs ${
        isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`}>
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
    </div>
  );
}
