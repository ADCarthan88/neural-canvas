const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock data
const mockUsers = [
  { id: 1, email: 'admin@demo.com', password: 'demo123', role: 'admin' }
];

const mockClients = [
  { id: 1, username: 'techcorp', email: 'admin@techcorp.com', subscription_tier: 'enterprise' },
  { id: 2, username: 'creative', email: 'team@creative.com', subscription_tier: 'pro' }
];

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = mockUsers.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({ success: true, token: 'demo_token', user: { id: user.id, email: user.email, role: user.role } });
});

// Get clients
app.get('/api/admin/clients', (req, res) => {
  res.json({ clients: mockClients });
});

// Analytics
app.get('/api/admin/analytics', (req, res) => {
  res.json({
    totalRevenue: 3000,
    totalUsers: 57,
    totalClients: mockClients.length,
    activeClients: mockClients.length,
    conversions: 12,
    conversionRate: 8.9
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Neural Canvas Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      admin_login: 'POST /api/admin/login',
      admin_clients: 'GET /api/admin/clients',
      admin_analytics: 'GET /api/admin/analytics'
    },
    demo_credentials: {
      email: 'admin@demo.com',
      password: 'demo123'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API documentation
app.get('/api', (req, res) => {
  res.json({
    message: 'Neural Canvas API v1.0.0',
    endpoints: {
      'POST /api/admin/login': 'Admin authentication',
      'GET /api/admin/clients': 'Get all clients',
      'GET /api/admin/analytics': 'Get analytics data'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Neural Canvas Backend running on http://localhost:${PORT}`);
  console.log(`💰 Admin Dashboard: http://localhost:3000/admin`);
});