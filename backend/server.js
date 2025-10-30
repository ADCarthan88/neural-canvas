const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const SocketManager = require('./realtime/socketManager');
const aiRoutes = require('./routes/ai');
const canvasRoutes = require('./routes/canvas');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "http://localhost:3000" }
});

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/canvas', canvasRoutes);

// Initialize socket manager
const socketManager = new SocketManager(io);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Neural Canvas is alive and dreaming!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Neural Canvas Backend running on port ${PORT}`);
  console.log(`🔌 WebSocket server ready for real-time magic`);
  console.log(`🤖 AI services loaded and ready to create`);
});
