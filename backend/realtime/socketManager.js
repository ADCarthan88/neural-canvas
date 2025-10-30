const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth');

class SocketManager {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map();
    this.canvasRooms = new Map();
    this.setupSocketAuth();
    this.setupEventHandlers();
  }

  setupSocketAuth() {
    // Authenticate socket connections
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return next(new Error('Authentication error'));
        socket.userId = decoded.id;
        socket.username = decoded.username;
        next();
      });
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔗 User ${socket.username} connected`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, {
        socketId: socket.id,
        username: socket.username,
        joinedAt: new Date()
      });

      // Handle canvas events
      this.handleCanvasEvents(socket);
      
      // Handle AI generation events
      this.handleAIEvents(socket);
      
      // Handle collaboration events
      this.handleCollaborationEvents(socket);

      // Cleanup on disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  handleCanvasEvents(socket) {
    // Real-time drawing/painting
    socket.on('canvas:draw', (data) => {
      socket.to(data.roomId).emit('canvas:draw', {
        ...data,
        userId: socket.userId,
        username: socket.username,
        timestamp: Date.now()
      });
    });

    // Canvas state sync
    socket.on('canvas:sync', (data) => {
      socket.to(data.roomId).emit('canvas:sync', data);
    });

    // Join canvas room
    socket.on('canvas:join', (roomId) => {
      socket.join(roomId);
      
      if (!this.canvasRooms.has(roomId)) {
        this.canvasRooms.set(roomId, new Set());
      }
      
      this.canvasRooms.get(roomId).add(socket.userId);
      
      // Notify others in room
      socket.to(roomId).emit('user:joined', {
        userId: socket.userId,
        username: socket.username
      });
    });
  }

  handleAIEvents(socket) {
    // AI generation progress
    socket.on('ai:generate', async (data) => {
      try {
        // Emit generation started
        socket.emit('ai:generation:started', { requestId: data.requestId });
        
        // Simulate AI generation progress
        const progressInterval = setInterval(() => {
          socket.emit('ai:generation:progress', {
            requestId: data.requestId,
            progress: Math.random() * 100
          });
        }, 500);

        // Clear interval after 5 seconds (replace with actual AI call)
        setTimeout(() => {
          clearInterval(progressInterval);
          socket.emit('ai:generation:complete', {
            requestId: data.requestId,
            imageUrl: 'generated-image-url.jpg'
          });
        }, 5000);

      } catch (error) {
        socket.emit('ai:generation:error', {
          requestId: data.requestId,
          error: error.message
        });
      }
    });
  }

  handleCollaborationEvents(socket) {
    // Cursor tracking
    socket.on('cursor:move', (data) => {
      socket.to(data.roomId).emit('cursor:move', {
        userId: socket.userId,
        username: socket.username,
        x: data.x,
        y: data.y
      });
    });

    // Voice chat toggle
    socket.on('voice:toggle', (data) => {
      socket.to(data.roomId).emit('voice:toggle', {
        userId: socket.userId,
        isEnabled: data.isEnabled
      });
    });
  }

  handleDisconnect(socket) {
    console.log(`🔌 User ${socket.username} disconnected`);
    
    // Remove from connected users
    this.connectedUsers.delete(socket.userId);
    
    // Remove from canvas rooms
    this.canvasRooms.forEach((users, roomId) => {
      if (users.has(socket.userId)) {
        users.delete(socket.userId);
        socket.to(roomId).emit('user:left', {
          userId: socket.userId,
          username: socket.username
        });
      }
    });
  }

  // Broadcast to all connected users
  broadcast(event, data) {
    this.io.emit(event, data);
  }

  // Send to specific user
  sendToUser(userId, event, data) {
    const user = this.connectedUsers.get(userId);
    if (user) {
      this.io.to(user.socketId).emit(event, data);
    }
  }
}

module.exports = SocketManager;
