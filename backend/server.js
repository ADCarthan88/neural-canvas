import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import pg from 'pg';
import adminRoutes from './routes/admin.js';
import generationRoutes from './routes/generation.js';
import { validateEnvVars } from './config/env.js';

const { Pool } = pg;

dotenv.config();
validateEnvVars();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://admin:secure_password@localhost:5432/neural_canvas'
});

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

app.use(express.json());

app.use('/api/admin', adminRoutes);
app.use('/api/generation', generationRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: '🧠 Neural Canvas Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      admin: '/api/admin/*',
      generation: '/api/generation/*'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Enterprise B2B Server running on port ${PORT}`);
  console.log(`💰 Admin Dashboard: http://localhost:3000/admin`);
  console.log(`🏢 Client Portal: http://localhost:3000/client`);
});