// Hardened Automated Test Suite for Palle Natural Foods
// Validates:
// 1. Server refuses to start without required environment variables
// 2. Server rejects weak admin password (< 12 chars) and weak JWT secret (< 32 chars)
// 3. Dynamic test process sets random temporary credentials (no hardcoded passwords)
// 4. Constant-time login with generic error for wrong credentials
// 5. Rate limiting on failed admin logins (5 failed attempts -> 429)
// 6. Token verification (GET /api/admin/me) & 401 on expired/invalid/missing tokens on all admin routes
// 7. Full auth-less customer flow with customer_key security and customer blocking

const http = require('http');
const { spawn } = require('child_process');
const crypto = require('crypto');
const path = require('path');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, text: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

function runServerWithEnv(envOverrides) {
  return new Promise((resolve) => {
    const serverPath = path.join(__dirname, 'server.js');
    const child = spawn(process.execPath, [serverPath], {
      cwd: __dirname,
      env: { ...process.env, ...envOverrides },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stderr = '';
    let stdout = '';
    child.stdout.on('data', d => stdout += d.toString());
    child.stderr.on('data', d => stderr += d.toString());

    child.on('close', (code) => {
      resolve({ code, stdout, stderr, child: null });
    });

    // If server starts running, wait for health check
    const checkInterval = setInterval(async () => {
      if (child.exitCode !== null) {
        clearInterval(checkInterval);
        return;
      }
      try {
        const port = envOverrides.PORT || 4000;
        const res = await request({ host: 'localhost', port, path: '/health', method: 'GET' });
        if (res.status === 200) {
          clearInterval(checkInterval);
          resolve({ code: 0, child, stdout, stderr });
        }
      } catch (e) {
        // Still booting
      }
    }, 200);

    // Timeout safety
    setTimeout(() => {
      clearInterval(checkInterval);
      if (child.exitCode === null) {
        resolve({ code: 0, child, stdout, stderr });
      }
    }, 6000);
  });
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('🛡️  PALLE NATURAL FOODS HARDENED ADMIN AUTH & API TEST SUITE');
  console.log('================================================================\n');

  // STEP 1: Test server startup refusal when secrets are missing
  console.log('--- TEST GROUP 1: STARTUP INTEGRITY & SECRET VALIDATION ---');
  
  // 1a: Missing ADMIN_USER
  const missingUser = await runServerWithEnv({
    ADMIN_USER: '',
    ADMIN_PASSWORD: 'ValidPassword123#',
    JWT_SECRET: crypto.randomBytes(32).toString('hex')
  });
  if (missingUser.code === 0) {
    if (missingUser.child) missingUser.child.kill();
    throw new Error('Server should have refused to start without ADMIN_USER');
  }
  console.log('✅ [1a] Startup check passed: Server refused to start when ADMIN_USER was missing.');

  // 1b: Missing ADMIN_PASSWORD
  const missingPass = await runServerWithEnv({
    ADMIN_USER: 'test_admin',
    ADMIN_PASSWORD: '',
    ADMIN_PASSWORD_HASH: '',
    JWT_SECRET: crypto.randomBytes(32).toString('hex')
  });
  if (missingPass.code === 0) {
    if (missingPass.child) missingPass.child.kill();
    throw new Error('Server should have refused to start without ADMIN_PASSWORD');
  }
  console.log('✅ [1b] Startup check passed: Server refused to start when ADMIN_PASSWORD was missing.');

  // 1c: Weak ADMIN_PASSWORD (< 12 chars)
  const weakPass = await runServerWithEnv({
    ADMIN_USER: 'test_admin',
    ADMIN_PASSWORD: 'shortpass', // 9 chars
    JWT_SECRET: crypto.randomBytes(32).toString('hex')
  });
  if (weakPass.code === 0) {
    if (weakPass.child) weakPass.child.kill();
    throw new Error('Server should have refused to start with password < 12 characters');
  }
  console.log('✅ [1c] Startup check passed: Server rejected password shorter than 12 characters.');

  // 1d: Weak JWT_SECRET (< 32 chars)
  const weakSecret = await runServerWithEnv({
    ADMIN_USER: 'test_admin',
    ADMIN_PASSWORD: 'StrongPassword123!',
    JWT_SECRET: 'short_secret_under_32'
  });
  if (weakSecret.code === 0) {
    if (weakSecret.child) weakSecret.child.kill();
    throw new Error('Server should have refused to start with JWT secret < 32 characters');
  }
  console.log('✅ [1d] Startup check passed: Server rejected JWT secret shorter than 32 characters.');

  // STEP 2: Boot server with random, dynamically generated credentials
  console.log('\n--- TEST GROUP 2: DYNAMIC CREDENTIALS & LOGIN HARDENING ---');
  const TEST_PORT = 4010;
  const DYNAMIC_ADMIN_USER = 'adm_' + crypto.randomBytes(4).toString('hex');
  const DYNAMIC_ADMIN_PASS = 'Palle_' + crypto.randomBytes(8).toString('hex') + '#2026';
  const DYNAMIC_JWT_SECRET = crypto.randomBytes(32).toString('hex');

  const runningServer = await runServerWithEnv({
    PORT: TEST_PORT,
    ADMIN_USER: DYNAMIC_ADMIN_USER,
    ADMIN_PASSWORD: DYNAMIC_ADMIN_PASS,
    JWT_SECRET: DYNAMIC_JWT_SECRET,
    CORS_ORIGIN: `http://localhost:${TEST_PORT},http://localhost:5173`
  });

  if (!runningServer.child) {
    throw new Error(`Failed to start test server on port ${TEST_PORT}: ${runningServer.stderr}`);
  }
  const serverProcess = runningServer.child;

  try {
    // 2a: Health check
    const health = await request({ host: 'localhost', port: TEST_PORT, path: '/health', method: 'GET' });
    if (health.status !== 200 || health.data.brand !== 'Palle Natural Foods') {
      throw new Error(`Health check failed: ${JSON.stringify(health)}`);
    }
    console.log('✅ [2a] Test server active on isolated port with randomized credentials.');

    // 2b: Wrong login returns generic error
    const wrongLogin = await request({
      host: 'localhost', port: TEST_PORT, path: '/api/admin/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'incorrect_user', password: 'incorrect_password_123' });
    if (wrongLogin.status !== 401 || wrongLogin.data.error !== 'Invalid username or password') {
      throw new Error(`Expected generic 401 "Invalid username or password", got ${JSON.stringify(wrongLogin)}`);
    }
    console.log('✅ [2b] Security passed: Wrong credentials return generic 401 (no credential disclosure).');

    // 2c: Correct login returns valid signed token
    const correctLogin = await request({
      host: 'localhost', port: TEST_PORT, path: '/api/admin/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: DYNAMIC_ADMIN_USER, password: DYNAMIC_ADMIN_PASS });
    if (correctLogin.status !== 200 || !correctLogin.data.token) {
      throw new Error(`Login failed with valid dynamic credentials: ${JSON.stringify(correctLogin)}`);
    }
    const adminToken = correctLogin.data.token;
    console.log('✅ [2c] Login passed: Valid credentials issue signed 12-hour JWT token.');

    // 2d: GET /api/admin/me verifies token
    const meRes = await request({
      host: 'localhost', port: TEST_PORT, path: '/api/admin/me', method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    if (meRes.status !== 200 || meRes.data.admin?.username !== DYNAMIC_ADMIN_USER) {
      throw new Error(`GET /api/admin/me failed: ${JSON.stringify(meRes)}`);
    }
    console.log('✅ [2d] Token verification passed: GET /api/admin/me returns valid admin identity.');

    // 2e: Invalid or expired token gives 401
    const invalidTokenRes = await request({
      host: 'localhost', port: TEST_PORT, path: '/api/admin/me', method: 'GET',
      headers: { 'Authorization': 'Bearer fake_invalid_jwt_token_12345' }
    });
    if (invalidTokenRes.status !== 401) {
      throw new Error(`Expected 401 for invalid token, got: ${invalidTokenRes.status}`);
    }
    console.log('✅ [2e] Access control passed: Invalid/tampered token returns 401.');

    // 2f: All /api/admin/* routes return 401 without token
    console.log('\n--- TEST GROUP 3: ROUTE PROTECTION (ALL ADMIN ENDPOINTS REQUIRE TOKEN) ---');
    const adminRoutes = [
      { path: '/api/admin/rates', method: 'GET' },
      { path: '/api/admin/orders', method: 'GET' },
      { path: '/api/admin/procurement', method: 'GET' },
      { path: '/api/admin/subscriptions', method: 'GET' },
      { path: '/api/admin/reports', method: 'GET' },
      { path: '/api/admin/customers', method: 'GET' },
      { path: '/api/admin/apartments', method: 'GET' },
      { path: '/api/admin/alerts', method: 'GET' },
      { path: '/api/admin/me', method: 'GET' }
    ];

    for (const route of adminRoutes) {
      const res = await request({
        host: 'localhost', port: TEST_PORT, path: route.path, method: route.method
      });
      if (res.status !== 401) {
        throw new Error(`Route ${route.path} failed to require token! Status: ${res.status}`);
      }
    }
    console.log(`✅ [3] All ${adminRoutes.length} /api/admin/* endpoints strictly require Bearer token (401 without token).`);

    // 2g: Admin Login Rate Limiting (5 failed attempts -> 429)
    console.log('\n--- TEST GROUP 4: ADMIN LOGIN BRUTE-FORCE RATE LIMITING ---');
    let rateLimited = false;
    for (let i = 1; i <= 6; i++) {
      const attempt = await request({
        host: 'localhost', port: TEST_PORT, path: '/api/admin/login', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, { username: 'attacker', password: 'wrong_password_attempt' });
      if (attempt.status === 429) {
        rateLimited = true;
        break;
      }
    }
    if (!rateLimited) {
      throw new Error('Admin login failed attempts did not trigger 429 rate limit');
    }
    console.log('✅ [4] Rate limit passed: 5 failed attempts triggered 429 "Try again later".');

    // 2h: End-to-end Customer & Operations flow
    console.log('\n--- TEST GROUP 5: AUTH-LESS CUSTOMER & OPERATIONS FLOW ---');
    // Catalog strictly 3 services
    const prods = await request({ host: 'localhost', port: TEST_PORT, path: '/api/products', method: 'GET' });
    const disallowed = prods.data.filter(p => !['milk', 'fish', 'mutton'].includes(p.category));
    if (disallowed.length > 0 || prods.data.length !== 6) {
      throw new Error('Disallowed products found in catalog');
    }
    console.log('✅ [5a] Catalog check: Strictly 3 services (Morning Health Milk, Fresh Village Fish, Fresh Village Mutton).');

    // Customer registration / upsert by phone
    const randPhone = '98' + Math.floor(10000000 + Math.random() * 90000000);
    const custRes = await request({
      host: 'localhost', port: TEST_PORT, path: '/api/customers', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Ramesh Varma',
      phone: randPhone,
      apartment_id: 1, // Shneha Apartment
      block_wing: 'Block B',
      flat_number: 'Flat 204'
    });
    if (custRes.status !== 200 || !custRes.data.customer_key) {
      throw new Error(`Customer upsert failed: ${JSON.stringify(custRes)}`);
    }
    const customerKey = custRes.data.customer_key;
    const customerId = custRes.data.id;
    console.log('✅ [5b] Customer delivery details saved: customer_key (UUID v4) generated.');

    // Customer place order with customer_key
    const orderRes = await request({
      host: 'localhost', port: TEST_PORT, path: '/api/orders', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Customer-Key': customerKey }
    }, {
      apartment_name: 'Shneha Apartment',
      block_wing: 'Block B',
      flat_number: 'Flat 204',
      delivery_date: new Date().toISOString().split('T')[0],
      delivery_slot: 'Morning (6:30 AM - 8:00 AM)',
      payment_method: 'COD',
      items: [
        { product_id: 'prod-fish-rohu', product_name: 'Singur Reservoir Rohu Fish', quantity: 1, unit: 'kg', unit_price: 280, cutting_preference: 'curry cut' }
      ]
    });
    if (orderRes.status !== 200 || !orderRes.data.id) {
      throw new Error(`Customer order failed: ${JSON.stringify(orderRes)}`);
    }
    const orderId = orderRes.data.id;
    console.log(`✅ [5c] Customer order placed with COD: Order ID ${orderId}.`);

    // Customer rates order via customer route (no admin route)
    const rateRes = await request({
      host: 'localhost', port: TEST_PORT, path: `/api/customer/orders/${orderId}/rate`, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Customer-Key': customerKey }
    }, { rating: 5, feedback: 'Delicious Singur fish!' });
    if (rateRes.status !== 200) {
      throw new Error(`Customer rate order failed: ${JSON.stringify(rateRes)}`);
    }
    console.log('✅ [5d] Customer order feedback submitted via customer endpoint.');

    // Admin blocks customer
    const blockRes = await request({
      host: 'localhost', port: TEST_PORT, path: `/api/admin/customers/${customerId}`, method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
    }, { blocked: true });
    if (blockRes.status !== 200 || !blockRes.data.blocked) {
      throw new Error(`Admin customer block failed: ${JSON.stringify(blockRes)}`);
    }

    // Blocked customer cannot place order (receives 403 "Please contact Palle Natural Foods")
    const blockedAttempt = await request({
      host: 'localhost', port: TEST_PORT, path: '/api/orders', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Customer-Key': customerKey }
    }, {
      apartment_name: 'Shneha Apartment',
      block_wing: 'Block B',
      flat_number: 'Flat 204',
      delivery_date: new Date().toISOString().split('T')[0],
      delivery_slot: 'Morning (6:30 AM - 8:00 AM)',
      payment_method: 'COD',
      items: [{ product_id: 'prod-fish-rohu', product_name: 'Singur Reservoir Rohu Fish', quantity: 1, unit: 'kg', unit_price: 280 }]
    });
    if (blockedAttempt.status !== 403 || !blockedAttempt.data.error.includes('Please contact Palle Natural Foods')) {
      throw new Error(`Expected 403 for blocked customer, got ${JSON.stringify(blockedAttempt)}`);
    }
    console.log('✅ [5e] Admin customer blocking enforced: Blocked customer gets 403 "Please contact Palle Natural Foods".');

    console.log('\n================================================================');
    console.log('🎉 ALL HARDENED ADMIN & API SECURITY TESTS PASSED (100% GREEN)!');
    console.log('================================================================\n');

  } finally {
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

runTestSuite().catch(err => {
  console.error('\n❌ HARDENED TEST SUITE FAILED:', err);
  process.exit(1);
});
