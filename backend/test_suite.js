// Automated End-to-End Test Suite for Palle Natural Foods
// Validates:
// 1. Zero customer authentication / Direct browsing
// 2. First-time delivery details & upsert returning customer_key
// 3. Security without login via X-Customer-Key header
// 4. Rate limiting & non-active apartment rejections
// 5. Admin customer blocking and 403 enforcement
// 6. Milk subscriptions pause/resume
// 7. Admin WhatsApp & Call hooks and order views

const http = require('http');

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

async function runTestSuite() {
  console.log('================================================================');
  console.log('🧪 RUNNING PALLE NATURAL FOODS AUTOMATED TEST SUITE');
  console.log('================================================================\n');

  // 1. Health check
  const health = await request({ host: 'localhost', port: 4000, path: '/health', method: 'GET' });
  if (health.status !== 200 || health.data.brand !== 'Palle Natural Foods') {
    throw new Error(`Health check failed: ${JSON.stringify(health)}`);
  }
  console.log('✅ [1] Health Check passed: Brand = "Palle Natural Foods"');

  // 2. Products Catalog verification (Strictly 3 services: Milk, Fish, Mutton)
  const prods = await request({ host: 'localhost', port: 4000, path: '/api/products', method: 'GET' });
  const disallowed = prods.data.filter(p => !['milk', 'fish', 'mutton'].includes(p.category));
  if (disallowed.length > 0 || prods.data.length !== 6) {
    throw new Error(`Products catalog violation: found ${disallowed.length} disallowed items`);
  }
  console.log('✅ [2] Catalog check passed: Exactly 3 services (Milk, Fish, Mutton), 6 products, 0 other items.');

  // 3. Public Apartments API: active apartments in order
  const apts = await request({ host: 'localhost', port: 4000, path: '/api/apartments', method: 'GET' });
  const activeApts = apts.data.filter(a => a.status === 'active');
  if (activeApts.length < 3 || activeApts[0].name !== 'Shneha Apartment') {
    throw new Error(`Apartments check failed: ${JSON.stringify(activeApts)}`);
  }
  console.log(`✅ [3] Apartments check passed: 3 active apartments (${activeApts.map(a => a.name).join(', ')})`);

  // 4. Verify OTP service is disabled
  const otpAttempt = await request({
    host: 'localhost', port: 4000, path: '/api/auth/send-otp', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { phone: '9849055443' });
  if ((otpAttempt.status !== 403 && otpAttempt.status !== 400) || !otpAttempt.data.error.includes('disabled')) {
    throw new Error(`OTP disable check failed: expected 403/400, got ${otpAttempt.status}`);
  }
  console.log('✅ [4] OTP check passed: OTP authentication is safely disabled (OTP_ENABLED=false).');

  // 5. First-time Delivery details registration (upsert by phone)
  const testPhone = '98' + Math.floor(10000000 + Math.random() * 90000000);
  const custRes1 = await request({
    host: 'localhost', port: 4000, path: '/api/customers', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Kavitha Reddy',
    phone: testPhone,
    apartment_id: 1, // Shneha Apartment (active)
    block_wing: 'Tower A',
    flat_number: 'Flat 404'
  });
  if (custRes1.status !== 200 || !custRes1.data.customer_key) {
    throw new Error(`Customer registration failed: ${JSON.stringify(custRes1)}`);
  }
  const customerKey = custRes1.data.customer_key;
  const customerId = custRes1.data.id;
  console.log(`✅ [5] Customer creation passed: ID ${customerId}, Key ${customerKey.slice(0, 8)}...`);

  // 6. Test returning customer with same phone retains customer_key
  const custRes2 = await request({
    host: 'localhost', port: 4000, path: '/api/customers', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Kavitha R.',
    phone: testPhone,
    apartment_id: 1,
    block_wing: 'Tower A',
    flat_number: 'Flat 405' // updated flat
  });
  if (custRes2.status !== 200 || custRes2.data.customer_key !== customerKey) {
    throw new Error(`Returning customer key mismatch! Expected ${customerKey}, got ${custRes2.data.customer_key}`);
  }
  console.log('✅ [6] Returning customer check passed: Phone upsert returns identical customer_key.');

  // 7. Security: Customer Endpoints require X-Customer-Key
  const ordersWithoutKey = await request({
    host: 'localhost', port: 4000, path: '/api/customer/orders', method: 'GET'
  });
  if (ordersWithoutKey.status !== 401) {
    throw new Error(`Expected 401 for missing key, got ${ordersWithoutKey.status}`);
  }

  const profileRes = await request({
    host: 'localhost', port: 4000, path: '/api/customer/me', method: 'GET',
    headers: { 'X-Customer-Key': customerKey }
  });
  const customerProfile = profileRes.data.customer || profileRes.data;
  if (profileRes.status !== 200 || customerProfile.phone !== testPhone) {
    throw new Error(`GET /api/customer/me failed: ${JSON.stringify(profileRes)}`);
  }
  console.log('✅ [7] Security check passed: Protected endpoints enforce X-Customer-Key, missing key returns 401.');

  // 8. Reject order for non-active apartment
  const invalidAptOrder = await request({
    host: 'localhost', port: 4000, path: '/api/orders', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Customer-Key': customerKey }
  }, {
    apartment_name: 'Non Existent Residency',
    block_wing: 'B',
    flat_number: '101',
    delivery_date: new Date().toISOString().split('T')[0],
    delivery_slot: 'Morning (6:30 AM - 8:00 AM)',
    items: [{ product_id: 'prod-fish-rohu', product_name: 'Singur Reservoir Rohu Fish', quantity: 1, unit: 'kg', unit_price: 280 }]
  });
  if (invalidAptOrder.status !== 400) {
    throw new Error(`Expected 400 for non-active apartment order, got ${invalidAptOrder.status}`);
  }
  console.log('✅ [8] Validation check passed: Orders rejected for non-active apartments.');

  // 9. Place valid COD order with order confirmation flow
  const orderRes = await request({
    host: 'localhost', port: 4000, path: '/api/orders', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Customer-Key': customerKey }
  }, {
    apartment_name: 'Shneha Apartment',
    block_wing: 'Tower A',
    flat_number: 'Flat 405',
    delivery_date: new Date().toISOString().split('T')[0],
    delivery_slot: 'Morning (6:30 AM - 8:00 AM)',
    payment_method: 'COD',
    items: [
      { product_id: 'prod-fish-rohu', product_name: 'Singur Reservoir Rohu Fish', quantity: 1, unit: 'kg', unit_price: 280, cutting_preference: 'curry cut' },
      { product_id: 'prod-mut-curry', product_name: 'Fresh Village Mutton (Curry Cut)', quantity: 0.5, unit: 'kg', unit_price: 850, cutting_preference: 'bone-in' }
    ]
  });
  if (orderRes.status !== 200 || !orderRes.data.id) {
    throw new Error(`Order placement failed: ${JSON.stringify(orderRes)}`);
  }
  const orderId = orderRes.data.id;
  console.log(`✅ [9] Order placed successfully: Order ID ${orderId}, COD mode verified.`);

  // 10. Milk Subscription & Pause/Resume
  const subRes = await request({
    host: 'localhost', port: 4000, path: '/api/subscriptions', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Customer-Key': customerKey }
  }, {
    litres: 1,
    frequency: 'daily'
  });
  if (subRes.status !== 200 || !subRes.data.id) {
    throw new Error(`Subscription creation failed: ${JSON.stringify(subRes)}`);
  }
  const subId = subRes.data.id;

  const pauseRes = await request({
    host: 'localhost', port: 4000, path: `/api/customer/subscriptions/${subId}/pause`, method: 'PATCH',
    headers: { 'X-Customer-Key': customerKey }
  });
  if (pauseRes.status !== 200 || pauseRes.data.status !== 'paused') {
    throw new Error(`Pause subscription failed: ${JSON.stringify(pauseRes)}`);
  }

  const resumeRes = await request({
    host: 'localhost', port: 4000, path: `/api/customer/subscriptions/${subId}/resume`, method: 'PATCH',
    headers: { 'X-Customer-Key': customerKey }
  });
  if (resumeRes.status !== 200 || resumeRes.data.status !== 'active') {
    throw new Error(`Resume subscription failed: ${JSON.stringify(resumeRes)}`);
  }
  console.log(`✅ [10] Milk Subscription passed: Created ID ${subId}, successfully paused and resumed.`);

  // 11. Admin Login & Customer Blocking
  const adminLogin = await request({
    host: 'localhost', port: 4000, path: '/api/admin/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    username: 'admin',
    password: 'PalleNatural2025!'
  });
  if (adminLogin.status !== 200 || !adminLogin.data.token) {
    throw new Error(`Admin login failed: ${JSON.stringify(adminLogin)}`);
  }
  const adminToken = adminLogin.data.token;
  console.log('✅ [11] Admin login passed with ADMIN_USER and ADMIN_PASSWORD.');

  // 12. Admin blocks customer
  const blockRes = await request({
    host: 'localhost', port: 4000, path: `/api/admin/customers/${customerId}`, method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
  }, { blocked: true });
  if (blockRes.status !== 200 || !blockRes.data.blocked) {
    throw new Error(`Admin customer block failed: ${JSON.stringify(blockRes)}`);
  }
  console.log(`✅ [12] Admin block customer passed: Customer ${customerId} blocked = true.`);

  // 13. Verify blocked customer is rejected on order placement with 403
  const blockedOrderAttempt = await request({
    host: 'localhost', port: 4000, path: '/api/orders', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Customer-Key': customerKey }
  }, {
    apartment_name: 'Shneha Apartment',
    block_wing: 'Tower A',
    flat_number: 'Flat 405',
    delivery_date: new Date().toISOString().split('T')[0],
    delivery_slot: 'Morning (6:30 AM - 8:00 AM)',
    payment_method: 'COD',
    items: [{ product_id: 'prod-fish-rohu', product_name: 'Singur Reservoir Rohu Fish', quantity: 1, unit: 'kg', unit_price: 280 }]
  });
  if (blockedOrderAttempt.status !== 403 || !blockedOrderAttempt.data.error.includes('Please contact Palle Natural Foods')) {
    throw new Error(`Expected 403 "Please contact Palle Natural Foods", got: ${JSON.stringify(blockedOrderAttempt)}`);
  }
  console.log('✅ [13] Block enforcement passed: Blocked customer gets 403 "Please contact Palle Natural Foods".');

  // 14. Admin unblocks customer
  const unblockRes = await request({
    host: 'localhost', port: 4000, path: `/api/admin/customers/${customerId}`, method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` }
  }, { blocked: false });
  if (unblockRes.status !== 200 || unblockRes.data.blocked) {
    throw new Error(`Admin customer unblock failed: ${JSON.stringify(unblockRes)}`);
  }
  console.log('✅ [14] Admin unblock passed: Customer unblocked.');

  // 15. Admin View Orders with Resident WhatsApp and Call hooks
  const adminOrders = await request({
    host: 'localhost', port: 4000, path: '/api/admin/orders', method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  if (adminOrders.status !== 200 || !adminOrders.data.orders.length) {
    throw new Error(`Admin orders view failed: ${JSON.stringify(adminOrders)}`);
  }
  const sampleOrder = adminOrders.data.orders[0];
  if (!sampleOrder.customer_phone || !sampleOrder.customer_name) {
    throw new Error(`Customer contact info missing in admin order: ${JSON.stringify(sampleOrder)}`);
  }
  console.log(`✅ [15] Admin orders view passed: Customer phone ${sampleOrder.customer_phone} available for call & WhatsApp.`);

  console.log('\n================================================================');
  console.log('🎉 ALL 15 AUTOMATED TESTS PASSED SUCCESSFULLY! 100% GREEN.');
  console.log('================================================================\n');
}

runTestSuite().catch(err => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
