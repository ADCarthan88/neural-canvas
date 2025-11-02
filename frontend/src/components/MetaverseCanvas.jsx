/**
 * Metaverse Neural Canvas - The Ultimate Experience
 * Combining Multi-Language ASL + Real-time Collaboration + VR/AR + Blockchain NFTs
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

import { MultiLanguageASLEngine } from '../lib/MultiLanguageASL';
import { RealtimeCollaborationEngine } from '../lib/RealtimeCollaboration';
import { VRARIntegrationEngine } from '../lib/VRARIntegration';
import { BlockchainNFTEngine } from '../lib/BlockchainNFT';
import InclusiveNeuralCanvas from './InclusiveNeuralCanvas';

// Collaborative cursor component
function CollaborativeCursor({ position, userId, userName, color }) {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.1;
    }
  });

  return (
    <group position={[position.x * 10 - 5, -position.y * 10 + 5, 0]}>
      <mesh ref={meshRef}>
        <ringGeometry args={[0.1, 0.15, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
      <Html>
        <div style={{
          background: color,
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          transform: 'translate(-50%, -100%)',
          marginBottom: '10px'
        }}>
          {userName}
        </div>
      </Html>
    </group>
  );
}

// VR/AR overlay component
function XROverlay({ isVR, isAR, onExitXR }) {
  if (!isVR && !isAR) return null;

  return (
    <Html>
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        zIndex: 1000
      }}>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>
          {isVR ? '🥽 VR Mode Active' : '📱 AR Mode Active'}
        </div>
        <button
          onClick={onExitXR}
          style={{
            background: '#ff4444',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Exit {isVR ? 'VR' : 'AR'}
        </button>
      </div>
    </Html>
  );
}

export default function MetaverseCanvas() {
  // Core canvas state
  const [canvasState, setCanvasState] = useState({
    mode: 'neural',
    intensity: 1.0,
    particleCount: 2000,
    primaryColor: '#ff006e',
    secondaryColor: '#8338ec'
  });

  // Multi-language ASL state
  const [aslLanguage, setAslLanguage] = useState('ASL');
  const [supportedLanguages, setSupportedLanguages] = useState({});
  const [currentLetter, setCurrentLetter] = useState(null);
  const [currentSpelling, setCurrentSpelling] = useState('');

  // Collaboration state
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [cursors, setCursors] = useState([]);

  // VR/AR state
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [isARSupported, setIsARSupported] = useState(false);
  const [isInVR, setIsInVR] = useState(false);
  const [isInAR, setIsInAR] = useState(false);

  // Blockchain state
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentChain, setCurrentChain] = useState(1);
  const [supportedChains, setSupportedChains] = useState({});
  const [nftMinting, setNftMinting] = useState(false);

  // Engine references
  const aslEngine = useRef(new MultiLanguageASLEngine());
  const collaborationEngine = useRef(new RealtimeCollaborationEngine());
  const vrArEngine = useRef(new VRARIntegrationEngine());
  const blockchainEngine = useRef(new BlockchainNFTEngine());
  const canvasRef = useRef();

  // Initialize all systems
  useEffect(() => {
    initializeMetaverse();
  }, []);

  const initializeMetaverse = async () => {
    console.log('🚀 Initializing Metaverse Neural Canvas...');

    // Initialize Multi-Language ASL
    setSupportedLanguages(aslEngine.current.getSupportedLanguages());

    // Initialize Collaboration
    try {
      await collaborationEngine.current.initialize();
      setupCollaborationHandlers();
    } catch (error) {
      console.warn('Collaboration not available:', error);
    }

    // Initialize VR/AR
    try {
      const xrSupported = await vrArEngine.current.initialize();
      setIsVRSupported(vrArEngine.current.isVRSupported);
      setIsARSupported(vrArEngine.current.isARSupported);
    } catch (error) {
      console.warn('VR/AR not available:', error);
    }

    // Initialize Blockchain
    try {
      const web3Connected = await blockchainEngine.current.initialize();
      setWalletConnected(web3Connected);
      setSupportedChains(blockchainEngine.current.getSupportedChains());
      setCurrentChain(blockchainEngine.current.getCurrentChain());
    } catch (error) {
      console.warn('Blockchain not available:', error);
    }

    console.log('✅ Metaverse initialization complete!');
  };

  // Setup collaboration event handlers
  const setupCollaborationHandlers = () => {
    const engine = collaborationEngine.current;

    engine.onUserJoined = (user) => {
      setCollaborators(prev => [...prev, user]);
    };

    engine.onUserLeft = (userId) => {
      setCollaborators(prev => prev.filter(u => u.id !== userId));
      setCursors(prev => prev.filter(c => c.userId !== userId));
    };

    engine.onCanvasStateReceived = (state) => {
      setCanvasState(state);
    };

    engine.onCursorUpdate = (data) => {
      setCursors(prev => {
        const filtered = prev.filter(c => c.userId !== data.userId);
        return [...filtered, data];
      });
    };

    engine.onASLCommandReceived = (data) => {
      console.log(`🤟 ASL from ${data.userId}:`, data);
    };
  };

  // Multi-Language ASL functions
  const switchASLLanguage = (language) => {
    if (aslEngine.current.setLanguage(language)) {
      setAslLanguage(language);
      console.log(`🌍 Switched to ${language}`);
    }
  };

  // Collaboration functions
  const createCollaborationRoom = () => {
    collaborationEngine.current.createRoom('Metaverse Neural Canvas');
    setIsCollaborating(true);
  };

  const joinCollaborationRoom = (roomId) => {
    collaborationEngine.current.joinRoom(roomId);
    setIsCollaborating(true);
  };

  const shareCanvasState = useCallback(() => {
    if (isCollaborating) {
      collaborationEngine.current.broadcastCanvasState(canvasState);
    }
  }, [isCollaborating, canvasState]);

  // VR/AR functions
  const enterVR = async () => {
    if (!canvasRef.current) return;
    
    try {
      const success = await vrArEngine.current.startVR(
        canvasRef.current.renderer,
        canvasRef.current.scene,
        canvasRef.current.camera
      );
      setIsInVR(success);
    } catch (error) {
      console.error('Failed to enter VR:', error);
    }
  };

  const enterAR = async () => {
    if (!canvasRef.current) return;
    
    try {
      const success = await vrArEngine.current.startAR(
        canvasRef.current.renderer,
        canvasRef.current.scene,
        canvasRef.current.camera
      );
      setIsInAR(success);
    } catch (error) {
      console.error('Failed to enter AR:', error);
    }
  };

  const exitXR = async () => {
    await vrArEngine.current.endSession();
    setIsInVR(false);
    setIsInAR(false);
  };

  // Blockchain functions
  const connectWallet = async () => {
    try {
      const connected = await blockchainEngine.current.initialize();
      setWalletConnected(connected);
      if (connected) {
        setCurrentChain(blockchainEngine.current.getCurrentChain());
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const mintAsNFT = async () => {
    if (!walletConnected) {
      await connectWallet();
      return;
    }

    setNftMinting(true);
    try {
      // Capture canvas as image
      const canvas = canvasRef.current?.renderer?.domElement;
      if (!canvas) throw new Error('Canvas not available');

      canvas.toBlob(async (blob) => {
        const canvasData = {
          imageBlob: blob,
          state: canvasState,
          mode: canvasState.mode,
          intensity: canvasState.intensity,
          particleCount: canvasState.particleCount,
          primaryColor: canvasState.primaryColor,
          secondaryColor: canvasState.secondaryColor,
          accessibility: true,
          aiGenerated: true,
          collaborative: isCollaborating,
          vrArCompatible: true,
          aslLanguage: aslLanguage
        };

        const metadata = {
          name: `Neural Canvas - ${canvasState.mode.toUpperCase()}`,
          description: `Metaverse-ready neural canvas creation with multi-language ASL support, real-time collaboration, and VR/AR compatibility. Created in ${aslLanguage} sign language mode.`
        };

        const result = await blockchainEngine.current.mintNFT(canvasData, metadata);
        console.log('🎉 NFT Minted:', result);
        
        // Share NFT with collaborators
        if (isCollaborating) {
          collaborationEngine.current.broadcastCommand('nft-minted', result);
        }
      });
    } catch (error) {
      console.error('NFT minting failed:', error);
    } finally {
      setNftMinting(false);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Metaverse Control Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '15px',
        padding: '20px',
        border: '2px solid #ff00ff',
        boxShadow: '0 0 30px #ff00ff50',
        width: '350px'
      }}>
        <h2 style={{ 
          color: '#ff00ff', 
          fontSize: '18px', 
          marginBottom: '20px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          🌌 METAVERSE NEURAL CANVAS
        </h2>

        {/* Multi-Language ASL */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: 'white', fontSize: '14px', marginBottom: '10px' }}>
            🌍 Multi-Language ASL
          </h3>
          <select
            value={aslLanguage}
            onChange={(e) => switchASLLanguage(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '5px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '12px'
            }}
          >
            {Object.entries(supportedLanguages).map(([code, name]) => (
              <option key={code} value={code} style={{ background: '#333' }}>
                {name}
              </option>
            ))}
          </select>
          {currentLetter && (
            <div style={{ 
              marginTop: '8px', 
              padding: '8px', 
              background: 'rgba(0, 255, 0, 0.2)',
              borderRadius: '5px',
              textAlign: 'center'
            }}>
              <span style={{ color: '#00ff00', fontSize: '20px', fontWeight: 'bold' }}>
                {currentLetter}
              </span>
              <div style={{ color: '#aaa', fontSize: '10px' }}>
                {aslLanguage} Letter
              </div>
            </div>
          )}
        </div>

        {/* Real-time Collaboration */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: 'white', fontSize: '14px', marginBottom: '10px' }}>
            👥 Real-time Collaboration
          </h3>
          {!isCollaborating ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={createCollaborationRoom}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: 'linear-gradient(45deg, #00ff00, #00aa00)',
                  border: 'none',
                  borderRadius: '5px',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Create Room
              </button>
              <input
                placeholder="Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '5px',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '12px'
                }}
              />
              <button
                onClick={() => joinCollaborationRoom(roomId)}
                disabled={!roomId}
                style={{
                  padding: '8px 12px',
                  background: roomId ? 'linear-gradient(45deg, #0066ff, #0044aa)' : '#666',
                  border: 'none',
                  borderRadius: '5px',
                  color: 'white',
                  fontSize: '12px',
                  cursor: roomId ? 'pointer' : 'not-allowed'
                }}
              >
                Join
              </button>
            </div>
          ) : (
            <div>
              <div style={{ color: '#00ff00', fontSize: '12px', marginBottom: '8px' }}>
                ✅ Connected - {collaborators.length} users
              </div>
              {collaborators.map(user => (
                <div key={user.id} style={{ 
                  color: '#aaa', 
                  fontSize: '11px',
                  padding: '4px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '3px',
                  marginBottom: '2px'
                }}>
                  👤 {user.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* VR/AR Integration */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: 'white', fontSize: '14px', marginBottom: '10px' }}>
            🥽 VR/AR Experience
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={enterVR}
              disabled={!isVRSupported || isInVR || isInAR}
              style={{
                flex: 1,
                padding: '8px',
                background: isVRSupported ? 'linear-gradient(45deg, #ff6600, #ff4400)' : '#666',
                border: 'none',
                borderRadius: '5px',
                color: 'white',
                fontSize: '12px',
                cursor: isVRSupported ? 'pointer' : 'not-allowed'
              }}
            >
              {isInVR ? '🥽 VR Active' : 'Enter VR'}
            </button>
            <button
              onClick={enterAR}
              disabled={!isARSupported || isInVR || isInAR}
              style={{
                flex: 1,
                padding: '8px',
                background: isARSupported ? 'linear-gradient(45deg, #aa00ff, #8800cc)' : '#666',
                border: 'none',
                borderRadius: '5px',
                color: 'white',
                fontSize: '12px',
                cursor: isARSupported ? 'pointer' : 'not-allowed'
              }}
            >
              {isInAR ? '📱 AR Active' : 'Enter AR'}
            </button>
          </div>
          {(isInVR || isInAR) && (
            <button
              onClick={exitXR}
              style={{
                width: '100%',
                marginTop: '8px',
                padding: '8px',
                background: 'linear-gradient(45deg, #ff0000, #cc0000)',
                border: 'none',
                borderRadius: '5px',
                color: 'white',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Exit {isInVR ? 'VR' : 'AR'}
            </button>
          )}
        </div>

        {/* Blockchain NFT */}
        <div>
          <h3 style={{ color: 'white', fontSize: '14px', marginBottom: '10px' }}>
            ⛓️ Blockchain NFT
          </h3>
          {!walletConnected ? (
            <button
              onClick={connectWallet}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(45deg, #ffaa00, #ff8800)',
                border: 'none',
                borderRadius: '5px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🦊 Connect Wallet
            </button>
          ) : (
            <div>
              <div style={{ color: '#00ff00', fontSize: '12px', marginBottom: '8px' }}>
                ✅ Wallet Connected - {supportedChains[currentChain]?.name}
              </div>
              <button
                onClick={mintAsNFT}
                disabled={nftMinting}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: nftMinting ? '#666' : 'linear-gradient(45deg, #ff00ff, #cc00cc)',
                  border: 'none',
                  borderRadius: '5px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: nftMinting ? 'not-allowed' : 'pointer'
                }}
              >
                {nftMinting ? '⏳ Minting...' : '🎨 Mint as NFT'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas */}
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
        onCreated={({ gl, scene, camera }) => {
          canvasRef.current = { renderer: gl, scene, camera };
        }}
      >
        <InclusiveNeuralCanvas />
        
        {/* Collaborative Cursors */}
        {cursors.map(cursor => (
          <CollaborativeCursor
            key={cursor.userId}
            position={cursor.position}
            userId={cursor.userId}
            userName={cursor.userName || 'Anonymous'}
            color={`hsl(${cursor.userId.charCodeAt(0) * 137.5 % 360}, 70%, 50%)`}
          />
        ))}

        {/* XR Overlay */}
        <XROverlay 
          isVR={isInVR} 
          isAR={isInAR} 
          onExitXR={exitXR} 
        />
      </Canvas>

      {/* Status Indicators */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        gap: '10px'
      }}>
        {isCollaborating && (
          <div style={{
            background: 'rgba(0, 255, 0, 0.2)',
            border: '2px solid #00ff00',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            👥
          </div>
        )}
        
        {(isInVR || isInAR) && (
          <div style={{
            background: 'rgba(255, 0, 255, 0.2)',
            border: '2px solid #ff00ff',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            {isInVR ? '🥽' : '📱'}
          </div>
        )}
        
        {walletConnected && (
          <div style={{
            background: 'rgba(255, 170, 0, 0.2)',
            border: '2px solid #ffaa00',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            ⛓️
          </div>
        )}
      </div>
    </div>
  );
}