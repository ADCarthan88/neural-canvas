import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Mock database for development
const mockUsers = [
  { id: 1, email: 'admin@demo.com', password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', subscription_tier: 'admin' }
];

const mockClients = [
  { id: 1, username: 'techcorp', email: 'admin@techcorp.com', subscription_tier: 'enterprise' },
  { id: 2, username: 'creative', email: 'team@creative.com', subscription_tier: 'pro' }
];

// Admin Authentication
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = mockUsers.find(u => u.email === email && u.subscription_tier === 'admin');
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ success: true, token, user: { id: user.id, email: user.email, role: 'admin' } });
});

// Client Management
router.get('/clients', (req, res) => {
  res.json({ clients: mockClients });
});

router.post('/clients', (req, res) => {
  const newClient = {
    id: mockClients.length + 1,
    ...req.body,
    subscription_tier: 'free'
  };
  mockClients.push(newClient);
  res.json({ success: true, client: newClient });
});

router.put('/clients/:id', (req, res) => {
  const clientId = parseInt(req.params.id);
  const clientIndex = mockClients.findIndex(c => c.id === clientId);

  if (clientIndex === -1) {
    return res.status(404).json({ error: 'Client not found' });
  }

  mockClients[clientIndex] = { ...mockClients[clientIndex], ...req.body };
  res.json({ success: true, client: mockClients[clientIndex] });
});

router.delete('/clients/:id', (req, res) => {
  const clientId = parseInt(req.params.id);
  const clientIndex = mockClients.findIndex(c => c.id === clientId);

  if (clientIndex === -1) {
    return res.status(404).json({ error: 'Client not found' });
  }

  mockClients.splice(clientIndex, 1);
  res.json({ success: true });
});

// Analytics
router.get('/analytics', (req, res) => {
  res.json({
    totalRevenue: 3000,
    totalUsers: 57,
    totalClients: mockClients.length,
    activeClients: mockClients.length,
    conversions: 12,
    conversionRate: 8.9
  });
});

router.get('/revenue', (req, res) => {
  res.json({
    monthly: 3000,
    yearly: 36000,
    growth: 23.5
  });
});

// Usage tracking
router.get('/usage/:clientId', (req, res) => {
  const clientId = req.params.clientId;

  // Mock usage data
  res.json({
    canvasViews: 1250,
    apiCalls: 8900,
    storageUsed: 2.3,
    storageLimit: 10,
    users: 12,
    userLimit: 50
  });
});

// Billing
router.get('/billing/:clientId', (req, res) => {
  const clientId = parseInt(req.params.id);
  const client = mockClients.find(c => c.id === clientId);

  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }

  res.json({
    plan: client.subscription_tier,
    amount: client.subscription_tier === 'enterprise' ? 2500 : 500,
    nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'active'
  });
});

// Support tickets
router.get('/support', (req, res) => {
  const mockTickets = [
    {
      id: 1,
      clientId: 1,
      subject: 'Canvas loading issues',
      status: 'open',
      priority: 'high',
      created: new Date()
    },
    {
      id: 2,
      clientId: 2,
      subject: 'API rate limit question',
      status: 'resolved',
      priority: 'medium',
      created: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ];

  res.json({ tickets: mockTickets });
});

// Test login endpoint
router.get('/login', (req, res) => {
  res.json({ message: 'Use POST method with email and password', credentials: { email: 'admin@demo.com', password: 'demo123' } });
});

export default router;
