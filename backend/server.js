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

// Read credentials strictly from environment variables ONLY - NO DEFAULT FALLBACKS
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const JWT_SECRET = process.env.JWT_SECRET || process.env.TOKEN_SECRET;

// STRICT REFUSAL CHECKS AT STARTUP (Never print secret values)
if (!ADMIN_USER) {
  console.error('FATAL: ADMIN_USER environment variable is missing. Server refused to start.');
  process.exit(1);
}

if (!ADMIN_PASSWORD && !ADMIN_PASSWORD_HASH) {
  console.error('FATAL: ADMIN_PASSWORD or ADMIN_PASSWORD_HASH environment variable is missing. Server refused to start.');
  process.exit(1);
}

if (ADMIN_PASSWORD && ADMIN_PASSWORD.length < 12) {
  console.error('FATAL: ADMIN_PASSWORD is too short (must be at least 12 characters). Server refused to start.');
  process.exit(1);
}

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is missing. Server refused to start.');
  process.exit(1);
}

if (JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET is too short (must be at least 32 characters). Server refused to start.');
  process.exit(1);
}

// Pre-compute hash for env password
let adminPasswordHash = ADMIN_PASSWORD_HASH || (ADMIN_PASSWORD.startsWith('$2') 
  ? ADMIN_PASSWORD 
  : bcrypt.hashSync(ADMIN_PASSWORD, 10));

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

// CORS Configuration (Strictly restricted to CORS_ORIGIN)
const rawCors = process.env.CORS_ORIGIN || '';
const corsOrigins = rawCors ? rawCors.split(',').map(s => s.trim()).filter(Boolean) : [];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (corsOrigins.length === 0 || corsOrigins.includes('*') || corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Customer-Key']
}));

// Request body size limit
app.use(express.json({ limit: '100kb' }));

// Feature Flags
const OTP_ENABLED = process.env.OTP_ENABLED === 'true'; // Disabled by default for frictionless order flow

// Trust proxy before rate limiters
app.set('trust proxy', 1);

// Rate Limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true, // Only failed attempts consume quota
  message: {
    error: 'Too many failed login attempts. Try again later.'
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

// Max 5 orders per hour per customer_key and per IP
const orderPlacementLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => {
    const key = req.headers['x-customer-key'] || req.body?.customer_key || req.body?.customer_id || req.body?.customer_phone || '';
    return `${req.ip}_${key}`;
  },
  message: {
    error: 'Order limit reached (maximum 5 orders per hour allowed). Please contact Palle Natural Foods if you need urgent assistance.'
  },
  skipFailedRequests: true,
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
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Access denied. Invalid or expired token.' });
  }
}

// Customer Key Authentication Middleware (Protects customer endpoints without login)
async function requireCustomerKey(req, res, next) {
  const customerKey = req.headers['x-customer-key'] || req.query.customer_key || req.body?.customer_key;
  if (!customerKey) {
    return res.status(401).json({ error: 'Customer key required. Please provide your delivery details.' });
  }

  try {
    const customer = await db.getCustomerByKey(customerKey);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found. Please provide your delivery details.' });
    }
    if (customer.blocked) {
      return res.status(403).json({ error: 'Please contact Palle Natural Foods', blocked: true });
    }
    req.customer = customer;
    next();
  } catch (err) {
    return res.status(500).json({ error: err.message });
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
  if (!OTP_ENABLED) {
    return res.status(403).json({ error: 'OTP authentication is disabled. Delivery details are saved directly.' });
  }
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
  if (!OTP_ENABLED) {
    return res.status(403).json({ error: 'OTP authentication is disabled. Delivery details are saved directly.' });
  }
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
    const { username, password } = req.body || {};
    if (!username || !password) {
      console.warn(`[SECURITY] Failed admin login attempt at ${new Date().toISOString()} from IP: ${req.ip} (missing fields)`);
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const isUserValid = safeCompare(username, ADMIN_USER);
    const isPassValid = verifyAdminPassword(password, adminPasswordHash);

    // Constant-time check: generic error for wrong username OR password (never reveal which one is wrong)
    if (!isUserValid || !isPassValid) {
      console.warn(`[SECURITY] Failed admin login attempt at ${new Date().toISOString()} from IP: ${req.ip}`);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Sign JWT (HS256) with role "admin" and expiry of 12 hours
    const token = jwt.sign(
      { username: ADMIN_USER, role: 'admin' },
      JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '12h' }
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

// Verify token on page load
app.get('/api/admin/me', authenticateAdmin, (req, res) => {
  res.json({
    success: true,
    admin: {
      username: req.admin.username,
      role: req.admin.role
    }
  });
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

app.patch('/api/admin/customers/:id', authenticateAdmin, async (req, res) => {
  try {
    const updated = await db.updateCustomer(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

// 8. Apartments Manager (Admin only)
app.get('/api/admin/apartments', authenticateAdmin, async (req, res) => {
  try {
    const apartments = await db.getAdminApartments();
    res.json(apartments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/apartments', authenticateAdmin, async (req, res) => {
  try {
    const { name, area, status, launch_date, sort_order } = req.body;
    if (!name) return res.status(400).json({ error: 'Apartment name is required' });
    const apt = await db.createApartment({ name, area, status, launch_date, sort_order });
    res.status(201).json(apt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/apartments/:id', authenticateAdmin, async (req, res) => {
  try {
    const apt = await db.updateApartment(req.params.id, req.body);
    res.json(apt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/apartments/:id', authenticateAdmin, async (req, res) => {
  try {
    const result = await db.deleteApartment(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Services & Feature Flags (Admin only)
app.get('/api/admin/services', authenticateAdmin, async (req, res) => {
  try {
    const services = await db.getServices(false);
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/services', authenticateAdmin, async (req, res) => {
  try {
    const { category, enabled, name, description } = req.body || {};
    if (!category) return res.status(400).json({ error: 'Service category is required' });
    const updated = await db.updateService(category, { enabled, name, description });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/services/:category', authenticateAdmin, async (req, res) => {
  try {
    const { enabled, name, description } = req.body || {};
    const updated = await db.updateService(req.params.category, { enabled, name, description });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Operational Settings (Admin only)
app.get('/api/admin/settings', authenticateAdmin, async (req, res) => {
  try {
    const settings = await db.getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/settings', authenticateAdmin, async (req, res) => {
  try {
    const updated = await db.updateSettings(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// CUSTOMER APIS (Public / Protected)
// ============================================================================
app.get('/api/services', async (req, res) => {
  try {
    const services = await db.getServices(true);
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/services/notify', async (req, res) => {
  try {
    const { service_category, phone } = req.body || {};
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Valid 10-digit mobile number required' });
    }
    const lead = await db.saveServiceLead({ service_category: service_category || 'milk', phone: cleanPhone });
    res.json({ success: true, message: 'We will WhatsApp you as soon as this service launches!', lead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    const settings = await db.getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/apartments', async (req, res) => {
  try {
    const apartments = await db.getPublicApartments();
    res.json(apartments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/apartments/notify', async (req, res) => {
  try {
    const { apartment_id, phone } = req.body;
    if (!apartment_id || !phone) {
      return res.status(400).json({ error: 'Apartment ID and phone are required' });
    }
    const lead = await db.saveApartmentLead({ apartment_id, phone });
    res.json({ success: true, message: 'We will WhatsApp you on launch day!', lead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
    const { name, phone, apartment_id, apartment_name, apartment, block_wing, flat_number, referred_by } = req.body;
    const aptName = apartment_name || apartment;
    if (!name || !phone || (!apartment_id && !aptName) || !flat_number) {
      return res.status(400).json({ error: 'Name, phone, apartment, and flat number are required' });
    }

    const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile phone number' });
    }

    // Verify apartment is active
    const apts = await db.getPublicApartments();
    const apt = apts.find(a => 
      (apartment_id && a.id === Number(apartment_id)) || 
      (aptName && a.name.toLowerCase() === aptName.toLowerCase())
    );

    if (!apt || apt.status !== 'active') {
      return res.status(400).json({ error: 'Delivery is currently only available for active apartments.' });
    }

    const customer = await db.createCustomer({
      name: name.trim(),
      phone: cleanPhone,
      apartment_id: apt.id,
      apartment_name: apt.name,
      block_wing: (block_wing || 'A').trim(),
      flat_number: flat_number.toString().trim(),
      referred_by
    });

    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Authenticated Customer Endpoints (Protected via X-Customer-Key header)
app.get('/api/customer/me', requireCustomerKey, async (req, res) => {
  res.json({
    success: true,
    customer: {
      id: req.customer.id,
      customer_key: req.customer.customer_key,
      name: req.customer.name,
      phone: req.customer.phone,
      apartment_id: req.customer.apartment_id,
      apartment_name: req.customer.apartment_name,
      apartment: req.customer.apartment_name,
      block_wing: req.customer.block_wing,
      flat_number: req.customer.flat_number,
      referral_code: req.customer.referral_code,
      blocked: Boolean(req.customer.blocked),
      orders: req.customer.orders || [],
      subscriptions: req.customer.subscriptions || []
    }
  });
});

app.get('/api/customer/orders', requireCustomerKey, async (req, res) => {
  res.json(req.customer.orders || []);
});

app.get('/api/customer/subscriptions', requireCustomerKey, async (req, res) => {
  res.json(req.customer.subscriptions || []);
});

app.patch('/api/customer/subscriptions/:id/pause', requireCustomerKey, async (req, res) => {
  try {
    const sub = (req.customer.subscriptions || []).find(s => s.id === req.params.id);
    if (!sub) {
      return res.status(404).json({ error: 'Subscription not found for this account' });
    }
    const updated = await db.updateSubscription(req.params.id, { 
      action: 'pause', 
      until: req.body?.until || null 
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/customer/subscriptions/:id/resume', requireCustomerKey, async (req, res) => {
  try {
    const sub = (req.customer.subscriptions || []).find(s => s.id === req.params.id);
    if (!sub) {
      return res.status(404).json({ error: 'Subscription not found for this account' });
    }
    const updated = await db.updateSubscription(req.params.id, { action: 'resume' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customer/orders/:id/rate', requireCustomerKey, async (req, res) => {
  try {
    const { rating, feedback } = req.body || {};
    const updated = await db.updateOrder(req.params.id, { rating, feedback });
    res.json({ success: true, message: 'Rating saved', order: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Order (Rate limited to max 5 orders/hr per customer_key & IP)
app.post('/api/orders', orderPlacementLimiter, async (req, res) => {
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

    const customerKey = req.headers['x-customer-key'] || req.body?.customer_key;
    let customer = null;

    if (customerKey) {
      customer = await db.getCustomerByKey(customerKey);
      if (!customer) {
        return res.status(401).json({ error: 'Invalid customer key. Please confirm your delivery details.' });
      }
    } else if (customer_id) {
      customer = await db.getCustomerById(customer_id);
    }

    if (!customer) {
      return res.status(401).json({ error: 'Customer verification required. Please enter your delivery details.' });
    }

    // Check if customer is blocked
    if (customer.blocked) {
      return res.status(403).json({ error: 'Please contact Palle Natural Foods', blocked: true });
    }

    // Verify apartment is active
    const targetAptName = apartment_name || customer.apartment_name;
    const apts = await db.getPublicApartments();
    const apt = apts.find(a => a.name.toLowerCase() === (targetAptName || '').toLowerCase());
    if (!apt || apt.status !== 'active') {
      return res.status(400).json({ error: 'Delivery is currently only available for active apartments.' });
    }

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one product item is required to place an order.' });
    }

    // Validate products exist in catalog and their category is enabled
    const allProds = await db.getProducts(true);
    const prodMap = {};
    allProds.forEach(p => { prodMap[p.id] = p; });

    for (const it of items) {
      const prod = prodMap[it.product_id];
      if (!it.product_id || !prod) {
        return res.status(400).json({ 
          error: `Invalid product: ${it.name || it.product_id}. Only village fresh milk, fish, and mutton are available.` 
        });
      }
      const isEnabled = await db.isCategoryEnabled(prod.category);
      if (!isEnabled) {
        return res.status(400).json({ error: 'This service is not available yet' });
      }
      if (Number(it.quantity) <= 0) {
        return res.status(400).json({ error: 'Product quantity must be greater than zero.' });
      }
    }

    // Operational order rules (Cut-off time & min order amount)
    const settings = await db.getSettings();
    const cutoffTime = settings.order_cutoff_time || '21:00';
    const allowSameDay = String(settings.allow_sameday_orders).toLowerCase() === 'true';
    const minOrderAmount = parseFloat(settings.min_order_amount || '0');

    const targetDateStr = delivery_date || new Date().toISOString().split('T')[0];

    // Check against current IST (Asia/Kolkata) date and time
    const now = new Date();
    const istDateFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' });
    const todayIST = istDateFormatter.format(now);
    const tomorrowDate = new Date(now.getTime() + 86400000);
    const tomorrowIST = istDateFormatter.format(tomorrowDate);

    if (targetDateStr === todayIST && !allowSameDay) {
      return res.status(400).json({ error: 'Same-day orders are not available. Orders for tomorrow close at 9:00 PM today.' });
    }

    if (targetDateStr === tomorrowIST) {
      const istTimeFormatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
      const currentISTTime = istTimeFormatter.format(now);
      if (currentISTTime >= cutoffTime) {
        return res.status(400).json({ error: `Orders for tomorrow closed at ${cutoffTime}. Please choose a later delivery date.` });
      }
    }

    // Check minimum order amount
    const orderTotal = items.reduce((sum, it) => {
      const price = Number(it.price || it.unit_price || (prodMap[it.product_id] && prodMap[it.product_id].price) || 0);
      return sum + (Number(it.quantity) * price);
    }, 0);

    if (minOrderAmount > 0 && orderTotal < minOrderAmount) {
      return res.status(400).json({ error: `Minimum order amount is ₹${minOrderAmount}.` });
    }

    // Cash on Delivery only for now (OTP_ENABLED=false), keep a hook for UPI/Razorpay later
    const selectedPaymentMethod = payment_method === 'upi' ? 'upi' : 'cod';

    const order = await db.createOrder({
      customer_id: customer.id,
      customer_name: customer_name || customer.name,
      customer_phone: customer_phone || customer.phone,
      apartment_name: apt.name,
      block_wing: block_wing || customer.block_wing || 'A',
      flat_number: flat_number || customer.flat_number,
      delivery_date: targetDateStr,
      delivery_slot: delivery_slot === 'evening' ? 'evening' : 'morning',
      items,
      payment_method: selectedPaymentMethod,
      notes: notes || ''
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Subscription (Milk)
app.post('/api/subscriptions', async (req, res) => {
  try {
    const isMilkEnabled = await db.isCategoryEnabled('milk');
    if (!isMilkEnabled) {
      return res.status(400).json({ error: 'This service is not available yet' });
    }

    const { customer_id, litres, frequency } = req.body;
    const customerKey = req.headers['x-customer-key'] || req.body?.customer_key;
    let customer = null;

    if (customerKey) {
      customer = await db.getCustomerByKey(customerKey);
    } else if (customer_id) {
      customer = await db.getCustomerById(customer_id);
    }

    if (!customer) {
      return res.status(401).json({ error: 'Customer details required. Please enter your delivery details.' });
    }

    if (customer.blocked) {
      return res.status(403).json({ error: 'Please contact Palle Natural Foods', blocked: true });
    }

    // Verify apartment is active
    const apts = await db.getPublicApartments();
    const apt = apts.find(a => a.name.toLowerCase() === (customer.apartment_name || '').toLowerCase());
    if (!apt || apt.status !== 'active') {
      return res.status(400).json({ error: 'Subscriptions are currently only available for active apartments.' });
    }

    const parsedLitres = Number(litres) || 1.0;
    const sub = await db.createSubscription({ 
      customer_id: customer.id, 
      litres: parsedLitres, 
      frequency: frequency === 'alternate' ? 'alternate' : 'daily' 
    });
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
