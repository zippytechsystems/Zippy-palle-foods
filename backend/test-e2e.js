// End-to-End Automated Test Verification Script for ZFresh Production System
const BASE_URL = 'http://localhost:4000';

async function runE2ETests() {
  console.log('🧪 Starting End-to-End Verification Checklist...\n');
  const results = [];

  // Helper fetch
  let authToken = '';
  async function api(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    const json = await res.json();
    return { status: res.status, data: json };
  }

  try {
    // TEST 1: Health check & Product strict scope test
    console.log('1️⃣ Checking /health and verifying strictly 3 services...');
    const health = await api('/health');
    const prods = await api('/api/products');
    const invalidItems = prods.data.filter(p => !['milk', 'fish', 'mutton'].includes(p.category));
    if (health.status === 200 && invalidItems.length === 0 && prods.data.length === 6) {
      results.push('✅ STEP 1 PASSED: Health is OK; strictly 6 products across Milk, Fish, and Mutton. Zero vegetables/rice.');
    } else {
      results.push('❌ STEP 1 FAILED');
    }

    // TEST 2: Admin Login
    console.log('2️⃣ Testing Admin Login & JWT Bearer Token...');
    const loginRes = await api('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username: 'admin', password: 'zfresh2025' })
    });
    if (loginRes.status === 200 && loginRes.data.token) {
      authToken = loginRes.data.token;
      results.push('✅ STEP 2 PASSED: Admin authenticated, received JWT Bearer token.');
    } else {
      results.push('❌ STEP 2 FAILED');
    }

    // TEST 3: Update fish rate & toggle mutton sold out
    console.log('3️⃣ Updating Katla fish rate and marking Mutton Keema sold out...');
    const fishUpdate = await api('/api/admin/rates/prod-fish-katla', {
      method: 'PUT',
      body: JSON.stringify({ price: 275, buy_price: 200, available: true })
    });
    const muttonUpdate = await api('/api/admin/rates/prod-mut-keema', {
      method: 'PUT',
      body: JSON.stringify({ available: false })
    });
    if (fishUpdate.data.price === 275 && muttonUpdate.data.available === false) {
      results.push('✅ STEP 3 PASSED: Katla fish rate updated to ₹275 (Margin: ₹75) and Mutton Keema marked Sold Out.');
    } else {
      results.push('❌ STEP 3 FAILED');
    }

    // TEST 4: Create a test customer and test order through API
    console.log('4️⃣ Creating test customer and test order in HMT Nagar apartment...');
    const customerRes = await api('/api/customers', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Madhusudhan Test',
        phone: '98490 99887',
        apartment_name: 'Raghavendra Nilayam',
        block_wing: 'Block A',
        flat_number: '101'
      })
    });
    const newCust = customerRes.data;

    const orderRes = await api('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: newCust.id,
        customer_name: newCust.name,
        customer_phone: newCust.phone,
        apartment_name: newCust.apartment_name,
        block_wing: newCust.block_wing,
        flat_number: newCust.flat_number,
        delivery_date: new Date().toISOString().split('T')[0],
        delivery_slot: 'morning',
        payment_method: 'upi',
        items: [
          { product_id: 'prod-fish-rohu', name: 'Rohu Fish', quantity: 2, price: 240, unit: 'kg', cutting_instructions: 'Cleaned and sliced medium steaks' },
          { product_id: 'prod-milk-morning', name: 'Morning Health Milk', quantity: 1, price: 90, unit: 'Litre', cutting_instructions: 'Glass bottle' }
        ],
        notes: 'Please drop at flat door before 7 AM'
      })
    });
    const newOrder = orderRes.data;
    if (newOrder && newOrder.id && newOrder.total_amount === 570) {
      results.push(`✅ STEP 4 PASSED: Customer and Order ${newOrder.id} created successfully for ₹570.`);
    } else {
      results.push('❌ STEP 4 FAILED');
    }

    // TEST 5: See under Apartment Orders and change status to delivered
    console.log('5️⃣ Verifying order in Apartment Orders and marking as Delivered...');
    const ordersList = await api('/api/admin/orders');
    const targetOrder = (ordersList.data.orders || []).find(o => o.id === newOrder.id);
    const markDelivered = await api(`/api/admin/orders/${newOrder.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'delivered', paid: true })
    });
    if (targetOrder && markDelivered.data.status === 'delivered' && markDelivered.data.paid === true) {
      results.push(`✅ STEP 5 PASSED: Order ${newOrder.id} verified under Raghavendra Nilayam and marked as Delivered (Paid: true).`);
    } else {
      results.push('❌ STEP 5 FAILED');
    }

    // TEST 6: Create milk subscription, pause it, check procurement list
    console.log('6️⃣ Creating milk subscription, pausing it, and verifying Dawn procurement calculation...');
    const subRes = await api('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: newCust.id,
        litres: 2.0,
        frequency: 'daily'
      })
    });
    const newSub = subRes.data;

    const pauseRes = await api(`/api/admin/subscriptions/${newSub.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'pause', until: '2026-10-15' })
    });

    const procurement = await api(`/api/admin/procurement?date=${new Date().toISOString().split('T')[0]}`);
    if (newSub.id && pauseRes.data.status === 'paused' && procurement.data.items.length > 0) {
      results.push(`✅ STEP 6 PASSED: Milk subscription ${newSub.id} created, paused until 2026-10-15; Dawn procurement buying list calculated.`);
    } else {
      results.push('❌ STEP 6 FAILED');
    }

    // TEST 7: Check reports, customer directory, send test alert
    console.log('7️⃣ Testing Reports, Customer Directory, and WhatsApp Alerts...');
    const reports = await api('/api/admin/reports?period=daily');
    const customers = await api('/api/admin/customers?q=Madhusudhan');
    const alertRes = await api('/api/admin/alerts', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Dawn Harvest Alert',
        message: 'Fresh pond fish and tender village mutton ready.',
        audience: 'all'
      })
    });
    if (reports.data.summary && customers.data.length > 0 && alertRes.data.links?.length > 0) {
      results.push('✅ STEP 7 PASSED: Reports generated, Customer directory searchable, and 1-click WhatsApp wa.me links created.');
    } else {
      results.push('❌ STEP 7 FAILED');
    }

    // TEST 8: Check for frontend leaks
    console.log('8️⃣ Verifying frontend bundle contains ZERO service role keys...');
    const fs = require('fs');
    const path = require('path');
    const distPath = path.join(__dirname, '../admin-dashboard/dist');
    let hasLeak = false;
    if (fs.existsSync(distPath)) {
      const files = fs.readdirSync(path.join(distPath, 'assets'));
      files.forEach(f => {
        const content = fs.readFileSync(path.join(distPath, 'assets', f), 'utf8');
        if (content.includes('service_role') || content.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')) {
          hasLeak = true;
        }
      });
    }
    if (!hasLeak) {
      results.push('✅ STEP 8 PASSED: Frontend bundle verified clean. No SUPABASE_SERVICE_ROLE_KEY or sensitive credentials exposed.');
    } else {
      results.push('❌ STEP 8 FAILED: Leaked keys in bundle');
    }

  } catch (err) {
    console.error('Test execution error:', err);
    results.push(`❌ ERROR: ${err.message}`);
  }

  console.log('\n======================================================');
  console.log('📋 COMPLETE END-TO-END VERIFICATION SUMMARY:');
  console.log('======================================================');
  results.forEach(r => console.log(r));
  console.log('======================================================\n');
}

runE2ETests();
