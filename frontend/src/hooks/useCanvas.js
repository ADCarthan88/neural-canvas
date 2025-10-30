import { useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';

export function useCanvas(roomId, token) {
    const { socket, isConnected } = useSocket(token);

    // Join canvas room
    useEffect(() => {
        if (socket && isConnected && roomId) {
            socket.emit('canvas:join', roomId);
        }
    }, [socket, isConnected, roomId]);

    // Send drawing data
    const sendDrawing = useCallback((drawingData) => {
        if (socket && isConnected) {
            socket.emit('canvas:draw', {
                roomId,
                ...drawingData
            });
        }
    }, [socket, isConnected, roomId]);

    // Send cursor position
    const sendCursor = useCallback((x, y) => {
        if (socket && isConnected) {
          socket.emit('cursor:move', { roomId, x, y });
        }
    }, [socket, isConnected, roomId]);

    // Generate AI art
    const generateAI = useCallback((prompt, style) => {
        if (socket && isConnected) {
            const requestId = Date.now().toString();
            socket.emit('ai:generate', {
                requestId,
                prompt,
                style,
                roomId
            });
            return requestId;
        }
    }, [socket, isConnected, roomId]);

    return {
        socket,
        isConnected,
        sendDrawing,
        sendCursor,
        generateAI
    };
}