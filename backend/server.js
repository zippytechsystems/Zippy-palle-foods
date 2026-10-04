require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'palle-natural-foods-secret-jwt-key-2025';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'PalleNatural2025!';

// Security Check: Warn if admin password is under 12 characters
if (ADMIN_PASSWORD.length < 12) {
  console.warn('⚠️ SECURITY WARNING: ADMIN_PASSWORD is under 12 characters. Use a 12+ character pass in production.');
}

// Pre-compute hash for env password
let adminPasswordHash = ADMIN_PASSWORD.startsWith('$2') 
  ? ADMIN_PASSWORD 
  : bcrypt.hashSync(ADMIN_PASSWORD, 10);

// Constant-time password check
function verifyAdminPassword(inputPassword, storedHash) {
  try {
    return bcrypt.compareSync(inputPassword, storedHash);
  } catch (err) {
    return false;
  }
}

// Constant-time string comparator
function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Perform dummy comparison to protect against timing attacks
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

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

// Rate Limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    error: 'Too many OTP requests from this connection. Please try again in 10 minutes.'
  }
});

const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: {
    error: 'Too many OTP verification attempts. Please request a new OTP.'
  }
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
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
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
    brand: 'Palle Natural Foods',
    service: 'Hyperlocal Village Delivery API (HMT Nagar, Hyderabad)',
    uptime: Math.floor(process.uptime()),
    database: process.env.DB_NAME ? 'hostinger_mysql' : 'memory_store_dev',
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// CUSTOMER MOBILE OTP AUTHENTICATION
// ============================================================================

// Pluggable SMS Gateway Interface
async function sendSmsOtp(phone, otp) {
  // DEV / CONSOLE PROVIDER (Active)
  console.log(`\n======================================================`);
  console.log(`📲 [Palle Natural Foods SMS Provider - Console]`);
  console.log(`To: +91 ${phone}`);
  console.log(`Message: Your Palle Natural Foods login OTP is: ${otp}. Valid for 5 minutes.`);
  console.log(`======================================================\n`);

  // PLUG IN YOUR LIVE SMS GATEWAY (e.g. MSG91, Fast2SMS, Twilio) HERE:
  /*
  if (process.env.MSG91_AUTH_KEY) {
    // await sendMsg91Otp(phone, otp);
  } else if (process.env.TWILIO_ACCOUNT_SID) {
    // await sendTwilioSms(phone, otp);
  }
  */
  return true;
}

app.post('/api/auth/send-otp', otpLimiter, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Valid 10-digit mobile number required' });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit Indian phone number' });
    }

    // Generate 6-digit cryptographically random OTP
    const otp = Math.floor(100000 + crypto.randomInt(900000)).toString();
    const otpHash = bcrypt.hashSync(otp, 8);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await db.saveOtp(cleanPhone, otpHash, expiresAt);
    await sendSmsOtp(cleanPhone, otp);

    const isDev = process.env.NODE_ENV !== 'production' || !process.env.DB_NAME;

    res.json({
      success: true,
      message: `OTP sent successfully to +91 ${cleanPhone}`,
      expires_in: 300,
      ...(isDev ? { devOtp: otp } : {})
    });
  } catch (err) {
    console.error('OTP send error:', err);
    res.status(500).json({ error: 'Failed to dispatch OTP. Please try again.' });
  }
});

app.post('/api/auth/verify-otp', otpVerifyLimiter, async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and 6-digit OTP are required' });
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    const record = await db.getLatestOtp(cleanPhone);

    if (!record) {
      return res.status(400).json({ error: 'No active OTP found. Please request a new one.' });
    }

    // Check expiry
    const expiry = new Date(record.expires_at).getTime();
    if (Date.now() > expiry) {
      return res.status(400).json({ error: 'OTP has expired. Please request a fresh code.' });
    }

    // Check attempts limit (max 3)
    if (record.attempts >= 3) {
      return res.status(400).json({ error: 'Max verification attempts exceeded. Request a new OTP.' });
    }

    // Verify hash
    const isValid = bcrypt.compareSync(otp.toString(), record.otp_hash);
    if (!isValid) {
      await db.incrementOtpAttempts(record.id);
      return res.status(400).json({ error: 'Invalid OTP. Please check and re-enter.' });
    }

    // Check if customer exists in HMT Nagar directory
    const existing = await db.getCustomerByPhone(cleanPhone);

    const token = jwt.sign(
      { phone: cleanPhone, customerId: existing?.id, role: 'customer' },
      TOKEN_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      isRegistered: Boolean(existing),
      customer: existing || { phone: cleanPhone }
    });
  } catch (err) {
    console.error('OTP verify error:', err);
    res.status(500).json({ error: 'OTP verification failed' });
  }
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

    if (!safeCompare(username, ADMIN_USER)) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isValid = verifyAdminPassword(password, adminPasswordHash);
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
        brand: 'Palle Natural Foods',
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
    const { status, paid, rating, feedback } = req.body;
    const updated = await db.updateOrder(req.params.id, { status, paid, rating, feedback });
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
// CUSTOMER APIS (Public / Protected)
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
    const { name, phone, apartment_name, block_wing, flat_number, referred_by } = req.body;
    if (!name || !phone || !apartment_name || !flat_number) {
      return res.status(400).json({ error: 'Name, phone, apartment, and flat number are required' });
    }
    const customer = await db.createCustomer({ name, phone, apartment_name, block_wing, flat_number, referred_by });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const {
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
    } = req.body;

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
  console.log(`🚀 Palle Natural Foods Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});
