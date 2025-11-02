/**
 * Real-time Collaboration System
 * Multi-user canvas sharing with WebRTC and Socket.io
 */

import { io } from 'socket.io-client';

export class RealtimeCollaborationEngine {
  constructor() {
    this.socket = null;
    this.roomId = null;
    this.userId = this.generateUserId();
    this.peers = new Map();
    this.isHost = false;
    this.collaborators = [];
    this.canvasState = null;
    this.cursors = new Map();
    
    this.rtcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
  }

  // Initialize collaboration
  async initialize(serverUrl = 'ws://localhost:3001') {
    this.socket = io(serverUrl, {
      transports: ['websocket']
    });

    this.setupSocketListeners();
    return new Promise((resolve) => {
      this.socket.on('connect', () => {
        console.log('🔗 Connected to collaboration server');
        resolve(true);
      });
    });
  }

  setupSocketListeners() {
    // Room management
    this.socket.on('room-created', (data) => {
      this.roomId = data.roomId;
      this.isHost = true;
      console.log(`🏠 Room created: ${this.roomId}`);
    });

    this.socket.on('room-joined', (data) => {
      this.roomId = data.roomId;
      this.collaborators = data.users;
      console.log(`👥 Joined room: ${this.roomId}`);
    });

    this.socket.on('user-joined', (user) => {
      this.collaborators.push(user);
      this.onUserJoined?.(user);
    });

    this.socket.on('user-left', (userId) => {
      this.collaborators = this.collaborators.filter(u => u.id !== userId);
      this.cursors.delete(userId);
      this.onUserLeft?.(userId);
    });

    // Canvas state synchronization
    this.socket.on('canvas-state-update', (state) => {
      this.onCanvasStateReceived?.(state);
    });

    this.socket.on('canvas-command', (command) => {
      this.onCommandReceived?.(command);
    });

    // Cursor tracking
    this.socket.on('cursor-update', (data) => {
      this.cursors.set(data.userId, data.position);
      this.onCursorUpdate?.(data);
    });

    // Voice/ASL commands
    this.socket.on('voice-command', (data) => {
      this.onVoiceCommandReceived?.(data);
    });

    this.socket.on('asl-command', (data) => {
      this.onASLCommandReceived?.(data);
    });

    // WebRTC signaling
    this.socket.on('webrtc-offer', (data) => {
      this.handleWebRTCOffer(data);
    });

    this.socket.on('webrtc-answer', (data) => {
      this.handleWebRTCAnswer(data);
    });

    this.socket.on('webrtc-ice-candidate', (data) => {
      this.handleICECandidate(data);
    });
  }

  // Room management
  createRoom(roomName = 'Neural Canvas Session') {
    this.socket.emit('create-room', {
      roomName,
      userId: this.userId,
      userName: this.generateUserName()
    });
  }

  joinRoom(roomId) {
    this.socket.emit('join-room', {
      roomId,
      userId: this.userId,
      userName: this.generateUserName()
    });
  }

  leaveRoom() {
    if (this.roomId) {
      this.socket.emit('leave-room', {
        roomId: this.roomId,
        userId: this.userId
      });
      this.cleanup();
    }
  }

  // Canvas state synchronization
  broadcastCanvasState(state) {
    if (this.socket && this.roomId) {
      this.socket.emit('canvas-state-update', {
        roomId: this.roomId,
        userId: this.userId,
        state,
        timestamp: Date.now()
      });
    }
  }

  broadcastCommand(command, data) {
    if (this.socket && this.roomId) {
      this.socket.emit('canvas-command', {
        roomId: this.roomId,
        userId: this.userId,
        command,
        data,
        timestamp: Date.now()
      });
    }
  }

  // Real-time cursor sharing
  updateCursor(x, y) {
    if (this.socket && this.roomId) {
      this.socket.emit('cursor-update', {
        roomId: this.roomId,
        userId: this.userId,
        position: { x, y },
        timestamp: Date.now()
      });
    }
  }

  // Voice command sharing
  shareVoiceCommand(command, transcript) {
    if (this.socket && this.roomId) {
      this.socket.emit('voice-command', {
        roomId: this.roomId,
        userId: this.userId,
        command,
        transcript,
        timestamp: Date.now()
      });
    }
  }

  // ASL command sharing
  shareASLCommand(letter, word, gesture) {
    if (this.socket && this.roomId) {
      this.socket.emit('asl-command', {
        roomId: this.roomId,
        userId: this.userId,
        letter,
        word,
        gesture,
        timestamp: Date.now()
      });
    }
  }

  // WebRTC for video/audio sharing
  async setupWebRTC(userId) {
    const peerConnection = new RTCPeerConnection(this.rtcConfig);
    this.peers.set(userId, peerConnection);

    // Get user media for video sharing
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      return stream;
    } catch (error) {
      console.error('Failed to get user media:', error);
      return null;
    }
  }

  async createWebRTCOffer(userId) {
    const peerConnection = this.peers.get(userId);
    if (!peerConnection) return;

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    this.socket.emit('webrtc-offer', {
      roomId: this.roomId,
      targetUserId: userId,
      offer
    });
  }

  async handleWebRTCOffer(data) {
    const peerConnection = new RTCPeerConnection(this.rtcConfig);
    this.peers.set(data.userId, peerConnection);

    await peerConnection.setRemoteDescription(data.offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    this.socket.emit('webrtc-answer', {
      roomId: this.roomId,
      targetUserId: data.userId,
      answer
    });
  }

  async handleWebRTCAnswer(data) {
    const peerConnection = this.peers.get(data.userId);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(data.answer);
    }
  }

  async handleICECandidate(data) {
    const peerConnection = this.peers.get(data.userId);
    if (peerConnection) {
      await peerConnection.addIceCandidate(data.candidate);
    }
  }

  // Collaboration permissions
  setPermissions(userId, permissions) {
    if (this.isHost) {
      this.socket.emit('set-permissions', {
        roomId: this.roomId,
        userId,
        permissions // { canEdit: true, canVoice: true, canASL: true }
      });
    }
  }

  // Session recording
  startRecording() {
    if (this.isHost) {
      this.socket.emit('start-recording', {
        roomId: this.roomId,
        userId: this.userId
      });
    }
  }

  stopRecording() {
    if (this.isHost) {
      this.socket.emit('stop-recording', {
        roomId: this.roomId,
        userId: this.userId
      });
    }
  }

  // Utility methods
  generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  generateUserName() {
    const adjectives = ['Creative', 'Artistic', 'Neural', 'Quantum', 'Cosmic'];
    const nouns = ['Artist', 'Designer', 'Creator', 'Visionary', 'Dreamer'];
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
  }

  cleanup() {
    this.peers.forEach(peer => peer.close());
    this.peers.clear();
    this.cursors.clear();
    this.collaborators = [];
    this.roomId = null;
    this.isHost = false;
  }

  // Event handlers (to be set by the UI)
  onUserJoined = null;
  onUserLeft = null;
  onCanvasStateReceived = null;
  onCommandReceived = null;
  onCursorUpdate = null;
  onVoiceCommandReceived = null;
  onASLCommandReceived = null;

  // Getters
  getCollaborators() {
    return this.collaborators;
  }

  getCursors() {
    return Array.from(this.cursors.entries());
  }

  getRoomId() {
    return this.roomId;
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}