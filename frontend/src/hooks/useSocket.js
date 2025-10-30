import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export function useSocket(token) {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) return;

        const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000', {
            auth: { token },
            transports: ['websocket', 'poling']
        });

        newSocket.on('connect', () => {
            console.log('🔗 Connected to Neural Canvas');
            setIsConnected(true);
            setError(null);
        });

        newSocket.on('disconnect', () => {
            console.log('🔌 Disconnected from Neural Canvas');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (err) => {
            console.error('Connection error:', err.message);
            setError(err.message);
            setIsConnected(false);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [token]);

    return { socket, isConnected, error };
}