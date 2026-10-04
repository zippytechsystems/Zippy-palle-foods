require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'zfresh-super-secret-jwt-key-2025';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'zfresh2025';

// Pre-compute hash for env password if not already bcrypt hashed
let adminPasswordHash = ADMIN_PASSWORD.startsWith('$2') 
  ? ADMIN_PASSWORD 
  : bcrypt.hashSync(ADMIN_PASSWORD, 10);

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) 
  : '*';

app.use(cors({
  origin: allowedOrigins === '*' ? true : allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rate Limiter for Login (Max 5 attempts per 15 mins)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Admin JWT Authentication Middleware
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. No authorization header provided.' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, TOKEN_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Access denied. Invalid or expired token.' });
  }
}

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Mana Palle Fresh (ZFresh) Backend',
    uptime: Math.floor(process.uptime()),
    database: db.isSupabaseConfigured ? 'supabase_postgres' : 'memory_store_dev',
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// ADMIN AUTHENTICATION
// ============================================================================
app.post('/api/admin/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (username !== ADMIN_USER) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isValid = bcrypt.compareSync(password, adminPasswordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { username: ADMIN_USER, role: 'admin' },
      TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        username: ADMIN_USER,
        role: 'admin'
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// ============================================================================
// ADMIN APIS (Protected by JWT)
// ============================================================================

// 1. Sourcing & Rates
app.get('/api/admin/rates', authenticateAdmin, async (req, res) => {
  try {
    const rates = await db.getRates();
    res.json(rates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/rates/:id', authenticateAdmin, async (req, res) => {
  try {
    const { price, buy_price, available } = req.body;
    const updated = await db.updateRate(req.params.id, { price, buy_price, available });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/rates/:id/history', authenticateAdmin, async (req, res) => {
  try {
    const history = await db.getRateHistory(req.params.id);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Village Buying Procurement List
app.get('/api/admin/procurement', authenticateAdmin, async (req, res) => {
  try {
    const procurement = await db.getProcurement(req.query.date);
    res.json(procurement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Apartment Orders
app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
  try {
    const { status, apartment, date } = req.query;
    const data = await db.getOrders({ status, apartment, date });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/orders/:id', authenticateAdmin, async (req, res) => {
  try {
    const { status, paid } = req.body;
    const updated = await db.updateOrder(req.params.id, { status, paid });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Milk Subscriptions
app.get('/api/admin/subscriptions', authenticateAdmin, async (req, res) => {
  try {
    const data = await db.getSubscriptions();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/subscriptions/:id', authenticateAdmin, async (req, res) => {
  try {
    const { action, until, litres } = req.body;
    const updated = await db.updateSubscription(req.params.id, { action, until, litres });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Sales & Reports
app.get('/api/admin/reports', authenticateAdmin, async (req, res) => {
  try {
    const period = req.query.period || 'daily';
    const report = await db.getReports(period);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Customer Directory
app.get('/api/admin/customers', authenticateAdmin, async (req, res) => {
  try {
    const customers = await db.getCustomers(req.query.q);
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/customers/:id', authenticateAdmin, async (req, res) => {
  try {
    const customer = await db.getCustomerById(req.params.id);
    res.json(customer);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// 7. WhatsApp & Broadcast Alerts
app.post('/api/admin/alerts', authenticateAdmin, async (req, res) => {
  try {
    const { title, message, audience } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }
    const result = await db.createAlert({ title, message, audience });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/alerts', authenticateAdmin, async (req, res) => {
  try {
    const alerts = await db.getAlerts();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// CUSTOMER APIS (Public)
// ============================================================================
app.get('/api/products', async (req, res) => {
  try {
    const products = await db.getProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { name, phone, apartment_name, block_wing, flat_number } = req.body;
    if (!name || !phone || !apartment_name || !flat_number) {
      return res.status(400).json({ error: 'Name, phone, apartment, and flat number are required' });
    }
    const customer = await db.createCustomer({ name, phone, apartment_name, block_wing, flat_number });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customer_id, customer_name, customer_phone, apartment_name, block_wing, flat_number, delivery_date, delivery_slot, items, payment_method, notes } = req.body;
    if (!customer_id || !items || !items.length) {
      return res.status(400).json({ error: 'Customer ID and at least one item are required' });
    }
    const order = await db.createOrder({
      customer_id,
      customer_name,
      customer_phone,
      apartment_name,
      block_wing,
      flat_number,
      delivery_date,
      delivery_slot,
      items,
      payment_method,
      notes
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/subscriptions', async (req, res) => {
  try {
    const { customer_id, litres, frequency } = req.body;
    if (!customer_id) {
      return res.status(400).json({ error: 'Customer ID is required' });
    }
    const sub = await db.createSubscription({ customer_id, litres, frequency });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/customers/:id/orders', async (req, res) => {
  try {
    const customer = await db.getCustomerById(req.params.id);
    res.json(customer.orders || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 ZFresh Production Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});
