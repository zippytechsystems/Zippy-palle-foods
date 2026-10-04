const mysql = require('mysql2/promise');
const crypto = require('crypto');

// Configuration from environment variables ONLY
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_NAME = process.env.DB_NAME || 'palle_natural_foods';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';

let pool = null;
let isMySQLConnected = false;

// Create MySQL Connection Pool
try {
  if (process.env.DB_NAME && process.env.DB_USER) {
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT,
      database: DB_NAME,
      user: DB_USER,
      password: DB_PASSWORD,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      decimalNumbers: true, // Auto-parse DECIMAL as numbers
      charset: 'utf8mb4'
    });
    console.log(`📡 MySQL Connection Pool configured for ${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`);
  }
} catch (err) {
  console.warn('⚠️ Could not initialize MySQL pool:', err.message);
}

// ---------------------------------------------------------------------------
// IN-MEMORY FALLBACK (Used if MySQL connection is not configured during local dev)
// Strictly 3 services: Morning Health Milk, Fresh Village Fish, Fresh Village Mutton
// ---------------------------------------------------------------------------
const memoryStore = {
  products: [
    {
      id: 'prod-milk-morning',
      name: 'Morning Health Milk',
      category: 'milk',
      unit: 'Litre',
      price: 90.0,
      buy_price: 70.0,
      available: true,
      image_url: 'assets/dairy.jpg',
      description: 'Fresh raw unpasteurized A2 Desi cow & buffalo milk sourced at dawn from Siddipet & Gajwel farmers. Delivered between 6:00 - 8:00 AM.'
    },
    {
      id: 'prod-fish-rohu',
      name: 'Rohu Fish',
      category: 'fish',
      unit: 'kg',
      price: 240.0,
      buy_price: 180.0,
      available: true,
      image_url: 'assets/fish.jpg',
      description: 'Freshwater pond Rohu fish from Singur irrigation tanks. Free descaling and sliced into neat curry cut steaks.'
    },
    {
      id: 'prod-fish-katla',
      name: 'Katla Fish',
      category: 'fish',
      unit: 'kg',
      price: 260.0,
      buy_price: 195.0,
      available: true,
      image_url: 'assets/fish.jpg',
      description: 'Freshwater pond Katla / Bocha fish. Sweet tender flesh, perfect for traditional tamarind fish pulusu.'
    },
    {
      id: 'prod-mut-curry',
      name: 'Mutton Curry Cut',
      category: 'mutton',
      unit: 'kg',
      price: 850.0,
      buy_price: 680.0,
      available: true,
      image_url: 'assets/mutton.jpg',
      description: 'Grass-fed village sheep from Alair pastoralists. Washed with natural turmeric water, medium bone-in pieces.'
    },
    {
      id: 'prod-mut-boneless',
      name: 'Mutton Boneless',
      category: 'mutton',
      unit: 'kg',
      price: 980.0,
      buy_price: 780.0,
      available: true,
      image_url: 'assets/mutton.jpg',
      description: '100% tender boneless cuts from fresh village sheep hind leg, cleaned with turmeric water.'
    },
    {
      id: 'prod-mut-keema',
      name: 'Mutton Keema',
      category: 'mutton',
      unit: 'kg',
      price: 920.0,
      buy_price: 730.0,
      available: true,
      image_url: 'assets/mutton.jpg',
      description: 'Hand-minced fresh village mutton keema, zero frozen meat, zero preservatives.'
    }
  ],
  rate_history: [
    { id: 1, product_id: 'prod-fish-rohu', old_price: 230, new_price: 240, old_buy_price: 170, new_buy_price: 180, changed_at: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 2, product_id: 'prod-fish-katla', old_price: 250, new_price: 260, old_buy_price: 185, new_buy_price: 195, changed_at: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 3, product_id: 'prod-mut-curry', old_price: 820, new_price: 850, old_buy_price: 650, new_buy_price: 680, changed_at: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: 4, product_id: 'prod-milk-morning', old_price: 85, new_price: 90, old_buy_price: 65, new_buy_price: 70, changed_at: new Date(Date.now() - 5 * 86400000).toISOString() }
  ],
  apartments: [
    { id: 1, name: 'Shneha Apartment', area: 'HMT Nagar', status: 'active', launch_date: null, sort_order: 1, created_at: new Date().toISOString() },
    { id: 2, name: 'Amdur Castle Apartment', area: 'HMT Nagar', status: 'active', launch_date: null, sort_order: 2, created_at: new Date().toISOString() },
    { id: 3, name: 'Pally Residency', area: 'HMT Nagar', status: 'active', launch_date: null, sort_order: 3, created_at: new Date().toISOString() },
    { id: 4, name: 'Srinivasa Heights', area: 'HMT Nagar', status: 'launching_soon', launch_date: '2026-11-01', sort_order: 4, created_at: new Date().toISOString() }
  ],
  apartment_leads: [
    { id: 1, apartment_id: 4, phone: '98490 99887', created_at: new Date().toISOString() }
  ],
  customers: [
    { id: 'c0000001-0000-0000-0000-000000000001', customer_key: 'key-cust-0001-srinivas-9849012345', name: 'Srinivas Rao', phone: '98490 12345', apartment_id: 1, apartment_name: 'Shneha Apartment', block_wing: 'Block A', flat_number: '204', referral_code: 'PALLE-SRI01', blocked: false, created_at: new Date().toISOString() },
    { id: 'c0000002-0000-0000-0000-000000000002', customer_key: 'key-cust-0002-vani-9849023456', name: 'Vani Sharma', phone: '98490 23456', apartment_id: 1, apartment_name: 'Shneha Apartment', block_wing: 'Block B', flat_number: '302', referral_code: 'PALLE-VAN02', blocked: false, created_at: new Date().toISOString() },
    { id: 'c0000003-0000-0000-0000-000000000003', customer_key: 'key-cust-0003-rajesh-9849034567', name: 'Rajesh Kumar', phone: '98490 34567', apartment_id: 2, apartment_name: 'Amdur Castle Apartment', block_wing: 'Wing 1', flat_number: '402', referral_code: 'PALLE-RAJ03', blocked: false, created_at: new Date().toISOString() },
    { id: 'c0000004-0000-0000-0000-000000000004', customer_key: 'key-cust-0004-kavitha-9849045678', name: 'Kavitha Reddy', phone: '98490 45678', apartment_id: 3, apartment_name: 'Pally Residency', block_wing: 'Block B', flat_number: '105', referral_code: 'PALLE-KAV04', blocked: false, created_at: new Date().toISOString() },
    { id: 'c0000005-0000-0000-0000-000000000005', customer_key: 'key-cust-0005-venkat-9849056789', name: 'Venkat Ramana', phone: '98490 56789', apartment_id: 2, apartment_name: 'Amdur Castle Apartment', block_wing: 'Tower 1', flat_number: '501', referral_code: 'PALLE-VEN05', blocked: false, created_at: new Date().toISOString() },
    { id: 'c0000006-0000-0000-0000-000000000006', customer_key: 'key-cust-0006-lakshmi-9849067890', name: 'Lakshmi Prasanna', phone: '98490 67890', apartment_id: 3, apartment_name: 'Pally Residency', block_wing: 'North Wing', flat_number: '203', referral_code: 'PALLE-LAK06', blocked: false, created_at: new Date().toISOString() }
  ],
  orders: [
    {
      id: 'ORD-1001',
      customer_id: 'c0000001-0000-0000-0000-000000000001',
      customer_name: 'Srinivas Rao',
      customer_phone: '98490 12345',
      apartment_name: 'Shneha Apartment',
      block_wing: 'Block A',
      flat_number: '204',
      delivery_date: new Date().toISOString().split('T')[0],
      delivery_slot: 'morning',
      total_amount: 940.0,
      payment_method: 'upi',
      paid: true,
      status: 'confirmed',
      notes: 'Medium curry cut, deliver before 7 AM',
      created_at: new Date().toISOString(),
      items: [
        { id: 1, product_id: 'prod-mut-curry', name: 'Mutton Curry Cut', quantity: 1, unit: 'kg', price: 850, total_price: 850, cutting_instructions: 'Medium bone-in curry pieces' },
        { id: 2, product_id: 'prod-milk-morning', name: 'Morning Health Milk', quantity: 1, unit: 'Litre', price: 90, total_price: 90, cutting_instructions: 'Glass bottle' }
      ]
    },
    {
      id: 'ORD-1002',
      customer_id: 'c0000002-0000-0000-0000-000000000002',
      customer_name: 'Vani Sharma',
      customer_phone: '98490 23456',
      apartment_name: 'Raghavendra Nilayam',
      block_wing: 'Block B',
      flat_number: '302',
      delivery_date: new Date().toISOString().split('T')[0],
      delivery_slot: 'morning',
      total_amount: 260.0,
      payment_method: 'cod',
      paid: false,
      status: 'placed',
      notes: 'Fish cleaned and steaks sliced',
      created_at: new Date().toISOString(),
      items: [
        { id: 3, product_id: 'prod-fish-katla', name: 'Katla Fish', quantity: 1, unit: 'kg', price: 260, total_price: 260, cutting_instructions: 'Cleaned steaks with head' }
      ]
    },
    {
      id: 'ORD-1003',
      customer_id: 'c0000003-0000-0000-0000-000000000003',
      customer_name: 'Rajesh Kumar',
      customer_phone: '98490 34567',
      apartment_name: 'Aditya Enclave',
      block_wing: 'Wing 1',
      flat_number: '402',
      delivery_date: new Date().toISOString().split('T')[0],
      delivery_slot: 'evening',
      total_amount: 850.0,
      payment_method: 'upi',
      paid: true,
      status: 'out_for_delivery',
      notes: 'Tender pieces for dinner',
      created_at: new Date().toISOString(),
      items: [
        { id: 4, product_id: 'prod-mut-curry', name: 'Mutton Curry Cut', quantity: 1, unit: 'kg', price: 850, total_price: 850, cutting_instructions: 'Turmeric washed' }
      ]
    },
    {
      id: 'ORD-1004',
      customer_id: 'c0000004-0000-0000-0000-000000000004',
      customer_name: 'Kavitha Reddy',
      customer_phone: '98490 45678',
      apartment_name: 'Sri Sai Srinivas Residency',
      block_wing: 'Block B',
      flat_number: '105',
      delivery_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      delivery_slot: 'morning',
      total_amount: 500.0,
      payment_method: 'cod',
      paid: false,
      status: 'placed',
      notes: 'Pre-order for tomorrow morning',
      created_at: new Date().toISOString(),
      items: [
        { id: 5, product_id: 'prod-fish-rohu', name: 'Rohu Fish', quantity: 1, unit: 'kg', price: 240, total_price: 240, cutting_instructions: 'Curry cut' },
        { id: 6, product_id: 'prod-fish-katla', name: 'Katla Fish', quantity: 1, unit: 'kg', price: 260, total_price: 260, cutting_instructions: 'Cleaned & gutted whole' }
      ]
    }
  ],
  subscriptions: [
    {
      id: 'SUB-201',
      customer_id: 'c0000001-0000-0000-0000-000000000001',
      customer_name: 'Srinivas Rao',
      customer_phone: '98490 12345',
      apartment_name: 'Raghavendra Nilayam',
      block_wing: 'Block A',
      flat_number: '204',
      product_id: 'prod-milk-morning',
      product_name: 'Morning Health Milk',
      litres: 1.0,
      frequency: 'daily',
      status: 'active',
      start_date: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
      paused_until: null,
      created_at: new Date(Date.now() - 15 * 86400000).toISOString()
    },
    {
      id: 'SUB-202',
      customer_id: 'c0000002-0000-0000-0000-000000000002',
      customer_name: 'Vani Sharma',
      customer_phone: '98490 23456',
      apartment_name: 'Raghavendra Nilayam',
      block_wing: 'Block B',
      flat_number: '302',
      product_id: 'prod-milk-morning',
      product_name: 'Morning Health Milk',
      litres: 2.0,
      frequency: 'daily',
      status: 'active',
      start_date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
      paused_until: null,
      created_at: new Date(Date.now() - 10 * 86400000).toISOString()
    },
    {
      id: 'SUB-203',
      customer_id: 'c0000003-0000-0000-0000-000000000003',
      customer_name: 'Rajesh Kumar',
      customer_phone: '98490 34567',
      apartment_name: 'Aditya Enclave',
      block_wing: 'Wing 1',
      flat_number: '402',
      product_id: 'prod-milk-morning',
      product_name: 'Morning Health Milk',
      litres: 1.0,
      frequency: 'alternate',
      status: 'active',
      start_date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
      paused_until: null,
      created_at: new Date(Date.now() - 7 * 86400000).toISOString()
    },
    {
      id: 'SUB-204',
      customer_id: 'c0000004-0000-0000-0000-000000000004',
      customer_name: 'Kavitha Reddy',
      customer_phone: '98490 45678',
      apartment_name: 'Sri Sai Srinivas Residency',
      block_wing: 'Block B',
      flat_number: '105',
      product_id: 'prod-milk-morning',
      product_name: 'Morning Health Milk',
      litres: 0.5,
      frequency: 'daily',
      status: 'paused',
      start_date: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0],
      paused_until: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      created_at: new Date(Date.now() - 20 * 86400000).toISOString()
    }
  ],
  alerts: [
    {
      id: 1,
      title: 'Tender Village Mutton Harvested',
      message: 'Direct from Alair shepherds. Morning fresh cut delivered before 8:00 AM.',
      audience: 'all',
      recipients_count: 48,
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 2,
      title: 'Fresh Pond Katla Fish Arrived',
      message: 'Sweet freshwater Katla harvested this morning. Cleaned steaks available.',
      audience: 'Raghavendra Nilayam',
      recipients_count: 18,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString()
    }
  ],
  otp_codes: []
};

// Test MySQL connection availability
async function testMySQL() {
  if (!pool) return false;
  try {
    const [rows] = await pool.query('SELECT 1');
    isMySQLConnected = true;
    return true;
  } catch (err) {
    isMySQLConnected = false;
    return false;
  }
}

// ---------------------------------------------------------------------------
// DB HELPER FUNCTIONS (MySQL with In-Memory Dev Fallback)
// ---------------------------------------------------------------------------

// 1. PRODUCTS
async function getProducts() {
  if (await testMySQL()) {
    const [rows] = await pool.query(
      "SELECT id, name, category, unit, CAST(price AS DECIMAL(10,2)) AS price, CAST(buy_price AS DECIMAL(10,2)) AS buy_price, available, image_url, description FROM products WHERE category IN ('milk', 'fish', 'mutton') ORDER BY category ASC"
    );
    return rows.map(r => ({
      ...r,
      price: Number(r.price),
      buy_price: Number(r.buy_price),
      available: Boolean(r.available)
    }));
  }
  return memoryStore.products;
}

// 2. RATES
async function getRates() {
  if (await testMySQL()) {
    const [rows] = await pool.query(
      'SELECT id, name, category, unit, price, buy_price, available FROM products ORDER BY category ASC'
    );
    return rows.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      unit: p.unit,
      price: Number(p.price),
      buy_price: Number(p.buy_price),
      margin: Number((Number(p.price) - Number(p.buy_price)).toFixed(2)),
      available: Boolean(p.available)
    }));
  }
  return memoryStore.products.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    unit: p.unit,
    price: Number(p.price),
    buy_price: Number(p.buy_price),
    margin: Number((Number(p.price) - Number(p.buy_price)).toFixed(2)),
    available: p.available
  }));
}

async function updateRate(id, { price, buy_price, available }) {
  if (await testMySQL()) {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (!rows.length) throw new Error('Product not found');
    const current = rows[0];

    const newPrice = price !== undefined ? Number(price) : Number(current.price);
    const newBuyPrice = buy_price !== undefined ? Number(buy_price) : Number(current.buy_price);
    const newAvail = available !== undefined ? (available ? 1 : 0) : current.available;

    await pool.query(
      'UPDATE products SET price = ?, buy_price = ?, available = ? WHERE id = ?',
      [newPrice, newBuyPrice, newAvail, id]
    );

    // Track rate history if price or buy_price changed
    if (newPrice !== Number(current.price) || newBuyPrice !== Number(current.buy_price)) {
      await pool.query(
        'INSERT INTO rate_history (product_id, old_price, new_price, old_buy_price, new_buy_price) VALUES (?, ?, ?, ?, ?)',
        [id, current.price, newPrice, current.buy_price, newBuyPrice]
      );
    }

    return {
      ...current,
      price: newPrice,
      buy_price: newBuyPrice,
      margin: Number((newPrice - newBuyPrice).toFixed(2)),
      available: Boolean(newAvail)
    };
  }

  // Fallback memory store
  const prod = memoryStore.products.find(p => p.id === id);
  if (!prod) throw new Error('Product not found');
  const oldPrice = prod.price;
  const oldBuy = prod.buy_price;

  if (price !== undefined) prod.price = Number(price);
  if (buy_price !== undefined) prod.buy_price = Number(buy_price);
  if (available !== undefined) prod.available = Boolean(available);

  if (price !== undefined || buy_price !== undefined) {
    memoryStore.rate_history.push({
      id: memoryStore.rate_history.length + 1,
      product_id: id,
      old_price: oldPrice,
      new_price: prod.price,
      old_buy_price: oldBuy,
      new_buy_price: prod.buy_price,
      changed_at: new Date().toISOString()
    });
  }

  return {
    ...prod,
    margin: Number((prod.price - prod.buy_price).toFixed(2))
  };
}

async function getRateHistory(productId) {
  if (await testMySQL()) {
    const [rows] = await pool.query(
      'SELECT id, product_id, price_format(old_price) AS old_price, price_format(new_price) AS new_price, old_buy_price, new_buy_price, changed_at FROM rate_history WHERE product_id = ? ORDER BY changed_at DESC',
      [productId]
    ).catch(async () => {
      const [r] = await pool.query(
        'SELECT * FROM rate_history WHERE product_id = ? ORDER BY changed_at DESC',
        [productId]
      );
      return [r];
    });
    return rows.map(r => ({
      ...r,
      old_price: Number(r.old_price),
      new_price: Number(r.new_price),
      old_buy_price: Number(r.old_buy_price),
      new_buy_price: Number(r.new_buy_price)
    }));
  }
  return memoryStore.rate_history
    .filter(h => h.product_id === productId)
    .sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at));
}

// 3. PROCUREMENT (BUYING LIST FOR DELIVERY DATE)
async function getProcurement(dateStr) {
  const targetDate = dateStr || new Date().toISOString().split('T')[0];
  const products = await getProducts();
  const prodMap = {};
  products.forEach(p => {
    prodMap[p.id] = {
      name: p.name,
      category: p.category,
      unit: p.unit,
      quantity: 0,
      buy_price: Number(p.buy_price || 0)
    };
  });

  if (await testMySQL()) {
    // 1. Orders on target date
    const [orderItems] = await pool.query(
      `SELECT oi.product_id, SUM(oi.quantity) AS total_qty
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.delivery_date = ? AND o.status != 'cancelled'
       GROUP BY oi.product_id`,
      [targetDate]
    );

    orderItems.forEach(item => {
      if (prodMap[item.product_id]) {
        prodMap[item.product_id].quantity += Number(item.total_qty);
      }
    });

    // 2. Active Milk Subscriptions delivering on target date
    const [subs] = await pool.query(
      `SELECT litres, frequency, start_date, paused_until
       FROM subscriptions
       WHERE status = 'active'`
    );

    const targetTime = new Date(targetDate).getTime();
    subs.forEach(sub => {
      if (sub.paused_until && new Date(sub.paused_until).getTime() >= targetTime) {
        return; // Paused
      }
      let deliversToday = false;
      if (sub.frequency === 'daily') {
        deliversToday = true;
      } else if (sub.frequency === 'alternate') {
        const start = new Date(sub.start_date || targetDate).getTime();
        const diffDays = Math.floor((targetTime - start) / 86400000);
        if (diffDays >= 0 && diffDays % 2 === 0) deliversToday = true;
      }

      if (deliversToday && prodMap['prod-milk-morning']) {
        prodMap['prod-milk-morning'].quantity += Number(sub.litres);
      }
    });
  } else {
    // Memory store fallback
    memoryStore.orders
      .filter(o => o.delivery_date === targetDate && o.status !== 'cancelled')
      .forEach(o => {
        (o.items || []).forEach(item => {
          if (prodMap[item.product_id]) {
            prodMap[item.product_id].quantity += Number(item.quantity);
          }
        });
      });

    const targetTime = new Date(targetDate).getTime();
    memoryStore.subscriptions
      .filter(s => s.status === 'active')
      .forEach(sub => {
        if (sub.paused_until && new Date(sub.paused_until).getTime() >= targetTime) {
          return;
        }
        let deliversToday = false;
        if (sub.frequency === 'daily') {
          deliversToday = true;
        } else if (sub.frequency === 'alternate') {
          const start = new Date(sub.start_date || targetDate).getTime();
          const diffDays = Math.floor((targetTime - start) / 86400000);
          if (diffDays >= 0 && diffDays % 2 === 0) deliversToday = true;
        }
        if (deliversToday && prodMap['prod-milk-morning']) {
          prodMap['prod-milk-morning'].quantity += Number(sub.litres);
        }
      });
  }

  const items = Object.keys(prodMap)
    .filter(k => prodMap[k].quantity > 0)
    .map(k => {
      const p = prodMap[k];
      const estCost = Number((p.quantity * p.buy_price).toFixed(2));
      return {
        product_id: k,
        name: p.name,
        category: p.category,
        unit: p.unit,
        quantity: Number(p.quantity.toFixed(2)),
        estimated_buy_price: p.buy_price,
        estimated_buy_cost: estCost
      };
    });

  const total_estimated_cost = items.reduce((sum, item) => sum + item.estimated_buy_cost, 0);

  return {
    date: targetDate,
    items,
    total_estimated_cost: Number(total_estimated_cost.toFixed(2))
  };
}

// 4. APARTMENT ORDERS
async function getOrders({ status, apartment, date } = {}) {
  let ordersList = [];

  if (await testMySQL()) {
    let sql = `
      SELECT o.*, c.name AS customer_name, c.phone AS customer_phone
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND o.status = ?';
      params.push(status);
    }
    if (apartment && apartment !== 'all') {
      sql += ' AND o.apartment_name = ?';
      params.push(apartment);
    }
    if (date) {
      sql += ' AND o.delivery_date = ?';
      params.push(date);
    }

    sql += ' ORDER BY o.created_at DESC';

    const [rows] = await pool.query(sql, params);

    // Fetch items for all fetched orders
    if (rows.length > 0) {
      const orderIds = rows.map(r => r.id);
      const [items] = await pool.query(
        'SELECT * FROM order_items WHERE order_id IN (?)',
        [orderIds]
      );

      const itemsMap = {};
      items.forEach(it => {
        if (!itemsMap[it.order_id]) itemsMap[it.order_id] = [];
        itemsMap[it.order_id].push({
          id: it.id,
          product_id: it.product_id,
          name: it.name,
          quantity: Number(it.quantity),
          unit: it.unit,
          price: Number(it.price),
          total_price: Number(it.total_price),
          cutting_instructions: it.cutting_instructions
        });
      });

      ordersList = rows.map(r => ({
        id: r.id,
        customer_id: r.customer_id,
        customer_name: r.customer_name,
        customer_phone: r.customer_phone,
        apartment_name: r.apartment_name,
        block_wing: r.block_wing,
        flat_number: r.flat_number,
        delivery_date: r.delivery_date.toISOString ? r.delivery_date.toISOString().split('T')[0] : r.delivery_date,
        delivery_slot: r.delivery_slot,
        total_amount: Number(r.total_amount),
        payment_method: r.payment_method,
        paid: Boolean(r.paid),
        status: r.status,
        notes: r.notes,
        rating: r.rating,
        feedback: r.feedback,
        created_at: r.created_at,
        items: itemsMap[r.id] || []
      }));
    }
  } else {
    ordersList = memoryStore.orders.filter(o => {
      if (status && status !== 'all' && o.status !== status) return false;
      if (apartment && apartment !== 'all' && o.apartment_name !== apartment) return false;
      if (date && o.delivery_date !== date) return false;
      return true;
    });
  }

  // Group by apartment
  const by_apartment = {};
  let total_revenue = 0;

  ordersList.forEach(ord => {
    total_revenue += ord.total_amount;
    const apt = ord.apartment_name || 'Other';
    if (!by_apartment[apt]) {
      by_apartment[apt] = [];
    }
    by_apartment[apt].push(ord);
  });

  return {
    total_orders: ordersList.length,
    total_revenue: Number(total_revenue.toFixed(2)),
    by_apartment,
    orders: ordersList
  };
}

async function updateOrder(id, { status, paid, rating, feedback }) {
  if (await testMySQL()) {
    const fields = [];
    const params = [];
    if (status !== undefined) {
      fields.push('status = ?');
      params.push(status);
    }
    if (paid !== undefined) {
      fields.push('paid = ?');
      params.push(paid ? 1 : 0);
    }
    if (rating !== undefined) {
      fields.push('rating = ?');
      params.push(Number(rating));
    }
    if (feedback !== undefined) {
      fields.push('feedback = ?');
      params.push(feedback);
    }

    if (fields.length > 0) {
      params.push(id);
      await pool.query(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, params);
    }

    const [rows] = await pool.query(
      `SELECT o.*, c.name AS customer_name, c.phone AS customer_phone 
       FROM orders o JOIN customers c ON o.customer_id = c.id WHERE o.id = ?`,
      [id]
    );
    if (!rows.length) throw new Error('Order not found');
    const ord = rows[0];
    return {
      ...ord,
      total_amount: Number(ord.total_amount),
      paid: Boolean(ord.paid)
    };
  }

  const ord = memoryStore.orders.find(o => o.id === id);
  if (!ord) throw new Error('Order not found');
  if (status !== undefined) ord.status = status;
  if (paid !== undefined) ord.paid = Boolean(paid);
  if (rating !== undefined) ord.rating = Number(rating);
  if (feedback !== undefined) ord.feedback = feedback;
  return ord;
}

// 5. MILK SUBSCRIPTIONS
async function getSubscriptions() {
  if (await testMySQL()) {
    const [rows] = await pool.query(
      `SELECT s.*, c.name AS customer_name, c.phone AS customer_phone,
              c.apartment_name, c.block_wing, c.flat_number,
              p.name AS product_name
       FROM subscriptions s
       JOIN customers c ON s.customer_id = c.id
       JOIN products p ON s.product_id = p.id
       ORDER BY s.created_at DESC`
    );

    const list = rows.map(s => ({
      id: s.id,
      customer_id: s.customer_id,
      customer_name: s.customer_name,
      customer_phone: s.customer_phone,
      apartment_name: s.apartment_name,
      block_wing: s.block_wing,
      flat_number: s.flat_number,
      product_id: s.product_id,
      product_name: s.product_name,
      litres: Number(s.litres),
      frequency: s.frequency,
      status: s.status,
      paused_until: s.paused_until ? (s.paused_until.toISOString ? s.paused_until.toISOString().split('T')[0] : s.paused_until) : null,
      start_date: s.start_date ? (s.start_date.toISOString ? s.start_date.toISOString().split('T')[0] : s.start_date) : null,
      created_at: s.created_at
    }));

    const activeList = list.filter(s => s.status === 'active');
    const litres_per_day = activeList.reduce((acc, s) => {
      return acc + (s.frequency === 'daily' ? s.litres : s.litres * 0.5);
    }, 0);

    return {
      total_active: activeList.length,
      litres_per_day: Number(litres_per_day.toFixed(2)),
      subscriptions: list
    };
  }

  const list = memoryStore.subscriptions;
  const activeList = list.filter(s => s.status === 'active');
  const litres_per_day = activeList.reduce((acc, s) => {
    return acc + (s.frequency === 'daily' ? s.litres : s.litres * 0.5);
  }, 0);

  return {
    total_active: activeList.length,
    litres_per_day: Number(litres_per_day.toFixed(2)),
    subscriptions: list
  };
}

async function updateSubscription(id, { action, until, litres }) {
  if (await testMySQL()) {
    const fields = [];
    const params = [];

    if (action === 'pause') {
      fields.push("status = 'paused', paused_until = ?");
      params.push(until || null);
    } else if (action === 'resume') {
      fields.push("status = 'active', paused_until = NULL");
    } else if (action === 'cancel') {
      fields.push("status = 'cancelled'");
    }

    if (litres !== undefined) {
      fields.push('litres = ?');
      params.push(Number(litres));
    }

    if (fields.length > 0) {
      params.push(id);
      await pool.query(`UPDATE subscriptions SET ${fields.join(', ')} WHERE id = ?`, params);
    }

    const [rows] = await pool.query(
      `SELECT s.*, c.name AS customer_name, c.phone AS customer_phone 
       FROM subscriptions s JOIN customers c ON s.customer_id = c.id WHERE s.id = ?`,
      [id]
    );
    if (!rows.length) throw new Error('Subscription not found');
    const sub = rows[0];
    return {
      ...sub,
      litres: Number(sub.litres)
    };
  }

  const sub = memoryStore.subscriptions.find(s => s.id === id);
  if (!sub) throw new Error('Subscription not found');

  if (action === 'pause') {
    sub.status = 'paused';
    sub.paused_until = until || null;
  } else if (action === 'resume') {
    sub.status = 'active';
    sub.paused_until = null;
  } else if (action === 'cancel') {
    sub.status = 'cancelled';
  }

  if (litres !== undefined) {
    sub.litres = Number(litres);
  }

  return sub;
}

// 6. SALES & REPORTS
async function getReports(period = 'daily') {
  const days = period === 'monthly' ? 30 : period === 'weekly' ? 7 : 1;
  const cutoffDate = new Date(Date.now() - (days - 1) * 86400000).toISOString().split('T')[0];

  const products = await getProducts();
  const prodCostMap = {};
  products.forEach(p => {
    prodCostMap[p.id] = { name: p.name, category: p.category, buy_price: Number(p.buy_price) };
  });

  let orders = [];
  if (await testMySQL()) {
    const [rows] = await pool.query(
      `SELECT o.*, oi.product_id, oi.name AS item_name, oi.quantity, oi.unit, oi.price AS item_price, oi.total_price AS item_total
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.delivery_date >= ? AND o.status != 'cancelled'`,
      [cutoffDate]
    );

    // Group rows by order
    const map = {};
    rows.forEach(r => {
      if (!map[r.id]) {
        map[r.id] = {
          id: r.id,
          delivery_date: r.delivery_date.toISOString ? r.delivery_date.toISOString().split('T')[0] : r.delivery_date,
          apartment_name: r.apartment_name,
          total_amount: Number(r.total_amount),
          items: []
        };
      }
      if (r.product_id) {
        map[r.id].items.push({
          product_id: r.product_id,
          name: r.item_name,
          quantity: Number(r.quantity),
          unit: r.unit,
          price: Number(r.item_price),
          total_price: Number(r.item_total)
        });
      }
    });
    orders = Object.values(map);
  } else {
    orders = memoryStore.orders.filter(o => o.delivery_date >= cutoffDate && o.status !== 'cancelled');
  }

  let total_revenue = 0;
  let total_cost = 0;
  const product_summary = {};
  const apartment_summary = {};
  const daily_summary = {};

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    daily_summary[d] = { date: d, revenue: 0, orders: 0, profit: 0 };
  }

  orders.forEach(o => {
    const rev = Number(o.total_amount || 0);
    total_revenue += rev;

    const d = o.delivery_date;
    if (daily_summary[d]) {
      daily_summary[d].revenue += rev;
      daily_summary[d].orders += 1;
    }

    const apt = o.apartment_name || 'Other';
    if (!apartment_summary[apt]) {
      apartment_summary[apt] = { apartment_name: apt, orders: 0, revenue: 0 };
    }
    apartment_summary[apt].orders += 1;
    apartment_summary[apt].revenue += rev;

    (o.items || []).forEach(item => {
      const pid = item.product_id;
      const meta = prodCostMap[pid] || { name: item.name, category: 'other', buy_price: 0 };
      const itemRev = Number(item.total_price || (item.quantity * item.price));
      const itemCost = Number(item.quantity) * meta.buy_price;
      const itemProfit = itemRev - itemCost;

      total_cost += itemCost;
      if (daily_summary[d]) {
        daily_summary[d].profit += itemProfit;
      }

      if (!product_summary[pid]) {
        product_summary[pid] = {
          name: meta.name,
          category: meta.category,
          quantity: 0,
          unit: item.unit,
          revenue: 0,
          profit: 0
        };
      }
      product_summary[pid].quantity += Number(item.quantity);
      product_summary[pid].revenue += itemRev;
      product_summary[pid].profit += itemProfit;
    });
  });

  const total_orders = orders.length;
  const total_profit = total_revenue - total_cost;
  const avg_order_value = total_orders > 0 ? total_revenue / total_orders : 0;

  return {
    period,
    summary: {
      total_orders,
      total_revenue: Number(total_revenue.toFixed(2)),
      total_profit: Number(total_profit.toFixed(2)),
      average_order_value: Number(avg_order_value.toFixed(2))
    },
    chart_data: Object.values(daily_summary),
    product_wise: Object.values(product_summary),
    apartment_wise: Object.values(apartment_summary)
  };
}

// 7. CUSTOMERS
async function getCustomers(queryStr = '') {
  const q = (queryStr || '').toLowerCase().trim();

  if (await testMySQL()) {
    let sql = `
      SELECT c.*, 
             COUNT(DISTINCT o.id) AS orders_count,
             COALESCE(SUM(o.total_amount), 0) AS total_spent,
             EXISTS(SELECT 1 FROM subscriptions s WHERE s.customer_id = c.id AND s.status = 'active') AS has_active_milk
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      WHERE 1=1
    `;
    const params = [];
    if (q) {
      sql += ' AND (LOWER(c.name) LIKE ? OR c.phone LIKE ? OR LOWER(c.apartment_name) LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    sql += ' GROUP BY c.id ORDER BY c.created_at DESC';

    const [rows] = await pool.query(sql, params);
    return rows.map(c => ({
      id: c.id,
      customer_key: c.customer_key,
      name: c.name,
      phone: c.phone,
      apartment_name: c.apartment_name,
      block_wing: c.block_wing,
      flat_number: c.flat_number,
      referral_code: c.referral_code,
      blocked: Boolean(c.blocked),
      orders_count: Number(c.orders_count),
      total_spent: Number(Number(c.total_spent).toFixed(2)),
      has_active_milk: Boolean(c.has_active_milk),
      created_at: c.created_at
    }));
  }

  return memoryStore.customers
    .filter(c => {
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.apartment_name.toLowerCase().includes(q)
      );
    })
    .map(c => {
      const orders = memoryStore.orders.filter(o => o.customer_id === c.id);
      const total_spent = orders.reduce((acc, o) => acc + Number(o.total_amount), 0);
      const subs = memoryStore.subscriptions.filter(s => s.customer_id === c.id);
      return {
        ...c,
        blocked: Boolean(c.blocked),
        orders_count: orders.length,
        total_spent: Number(total_spent.toFixed(2)),
        has_active_milk: subs.some(s => s.status === 'active')
      };
    });
}

async function getCustomerById(id) {
  if (await testMySQL()) {
    const [custs] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
    if (!custs.length) throw new Error('Customer not found');
    const customer = custs[0];

    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC',
      [id]
    );

    const [subs] = await pool.query(
      'SELECT * FROM subscriptions WHERE customer_id = ? ORDER BY created_at DESC',
      [id]
    );

    return {
      ...customer,
      apartment: customer.apartment_name,
      blocked: Boolean(customer.blocked),
      orders: orders.map(o => ({
        ...o,
        total_amount: Number(o.total_amount),
        delivery_date: o.delivery_date.toISOString ? o.delivery_date.toISOString().split('T')[0] : o.delivery_date
      })),
      subscriptions: subs.map(s => ({
        ...s,
        litres: Number(s.litres)
      }))
    };
  }

  const customer = memoryStore.customers.find(c => c.id === id);
  if (!customer) throw new Error('Customer not found');

  const orders = memoryStore.orders.filter(o => o.customer_id === id);
  const subs = memoryStore.subscriptions.filter(s => s.customer_id === id);

  return {
    ...customer,
    apartment: customer.apartment_name,
    blocked: Boolean(customer.blocked),
    orders,
    subscriptions: subs
  };
}

async function getCustomerByKey(customerKey) {
  if (!customerKey) return null;
  if (await testMySQL()) {
    const [custs] = await pool.query('SELECT * FROM customers WHERE customer_key = ?', [customerKey]);
    if (!custs.length) return null;
    const customer = custs[0];

    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC',
      [customer.id]
    );

    const orderIds = orders.map(o => o.id);
    let itemsMap = {};
    if (orderIds.length > 0) {
      const [items] = await pool.query('SELECT * FROM order_items WHERE order_id IN (?)', [orderIds]);
      items.forEach(it => {
        if (!itemsMap[it.order_id]) itemsMap[it.order_id] = [];
        itemsMap[it.order_id].push(it);
      });
    }

    const [subs] = await pool.query(
      `SELECT s.*, p.name AS product_name 
       FROM subscriptions s JOIN products p ON s.product_id = p.id 
       WHERE s.customer_id = ? ORDER BY s.created_at DESC`,
      [customer.id]
    );

    return {
      ...customer,
      apartment: customer.apartment_name,
      blocked: Boolean(customer.blocked),
      orders: orders.map(o => ({
        ...o,
        total_amount: Number(o.total_amount),
        paid: Boolean(o.paid),
        delivery_date: o.delivery_date.toISOString ? o.delivery_date.toISOString().split('T')[0] : o.delivery_date,
        items: itemsMap[o.id] || []
      })),
      subscriptions: subs.map(s => ({
        ...s,
        litres: Number(s.litres)
      }))
    };
  }

  const customer = memoryStore.customers.find(c => c.customer_key === customerKey);
  if (!customer) return null;

  const orders = memoryStore.orders.filter(o => o.customer_id === customer.id);
  const subs = memoryStore.subscriptions.filter(s => s.customer_id === customer.id);

  return {
    ...customer,
    apartment: customer.apartment_name,
    blocked: Boolean(customer.blocked),
    orders,
    subscriptions: subs
  };
}

async function getCustomerByPhone(phone) {
  const clean = (phone || '').replace(/[^0-9]/g, '');
  if (await testMySQL()) {
    const [rows] = await pool.query('SELECT * FROM customers WHERE phone LIKE ?', [`%${clean.slice(-10)}`]);
    return rows[0] || null;
  }
  return memoryStore.customers.find(c => c.phone.replace(/[^0-9]/g, '').endsWith(clean.slice(-10))) || null;
}

async function updateCustomer(id, { name, apartment_id, apartment_name, block_wing, flat_number, blocked }) {
  if (await testMySQL()) {
    const fields = [];
    const params = [];
    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (apartment_id !== undefined) { fields.push('apartment_id = ?'); params.push(apartment_id ? Number(apartment_id) : null); }
    if (apartment_name !== undefined) { fields.push('apartment_name = ?'); params.push(apartment_name); }
    if (block_wing !== undefined) { fields.push('block_wing = ?'); params.push(block_wing); }
    if (flat_number !== undefined) { fields.push('flat_number = ?'); params.push(flat_number); }
    if (blocked !== undefined) { fields.push('blocked = ?'); params.push(blocked ? 1 : 0); }

    if (fields.length > 0) {
      params.push(id);
      await pool.query(`UPDATE customers SET ${fields.join(', ')} WHERE id = ?`, params);
    }
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
    if (!rows.length) throw new Error('Customer not found');
    const c = rows[0];
    return {
      ...c,
      apartment: c.apartment_name,
      blocked: Boolean(c.blocked)
    };
  }

  const cust = memoryStore.customers.find(c => c.id === id);
  if (!cust) throw new Error('Customer not found');
  if (name !== undefined) cust.name = name;
  if (apartment_id !== undefined) cust.apartment_id = apartment_id ? Number(apartment_id) : null;
  if (apartment_name !== undefined) { cust.apartment_name = apartment_name; cust.apartment = apartment_name; }
  if (block_wing !== undefined) cust.block_wing = block_wing;
  if (flat_number !== undefined) cust.flat_number = flat_number;
  if (blocked !== undefined) cust.blocked = Boolean(blocked);
  return cust;
}

async function createCustomer({ name, phone, apartment_id = null, apartment_name = null, block_wing = 'A', flat_number, referred_by = null }) {
  const customerId = `c-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const referral_code = `PALLE-${name.substring(0, 3).toUpperCase()}${Math.floor(10 + Math.random() * 90)}`;
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);

  if (await testMySQL()) {
    let resolvedAptId = apartment_id ? Number(apartment_id) : null;
    let resolvedAptName = apartment_name;

    if (resolvedAptId && !resolvedAptName) {
      const [aptRows] = await pool.query('SELECT name FROM apartments WHERE id = ?', [resolvedAptId]);
      if (aptRows.length) resolvedAptName = aptRows[0].name;
    } else if (resolvedAptName && !resolvedAptId) {
      const [aptRows] = await pool.query('SELECT id FROM apartments WHERE name = ?', [resolvedAptName]);
      if (aptRows.length) resolvedAptId = aptRows[0].id;
    }

    const [existingRows] = await pool.query('SELECT * FROM customers WHERE phone LIKE ?', [`%${cleanPhone}`]);
    let customerKey;

    if (existingRows.length > 0) {
      const existing = existingRows[0];
      customerKey = existing.customer_key || crypto.randomUUID();
      await pool.query(
        `UPDATE customers SET 
           name = ?, 
           apartment_id = ?, 
           apartment_name = ?, 
           block_wing = ?, 
           flat_number = ?,
           customer_key = ?
         WHERE id = ?`,
        [name, resolvedAptId, resolvedAptName || existing.apartment_name || 'Shneha Apartment', block_wing, flat_number, customerKey, existing.id]
      );
      const [updatedRows] = await pool.query('SELECT * FROM customers WHERE id = ?', [existing.id]);
      const resCust = updatedRows[0] || {};
      return {
        ...resCust,
        apartment: resCust.apartment_name,
        blocked: Boolean(resCust.blocked)
      };
    } else {
      customerKey = crypto.randomUUID();
      await pool.query(
        `INSERT INTO customers (id, customer_key, name, phone, apartment_id, apartment_name, block_wing, flat_number, referral_code, referred_by, blocked)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [customerId, customerKey, name, cleanPhone, resolvedAptId, resolvedAptName || 'Shneha Apartment', block_wing, flat_number, referral_code, referred_by]
      );
      const [newRows] = await pool.query('SELECT * FROM customers WHERE id = ?', [customerId]);
      const resCust = newRows[0] || {};
      return {
        ...resCust,
        apartment: resCust.apartment_name,
        blocked: Boolean(resCust.blocked)
      };
    }
  }

  // MemoryStore
  let resolvedAptId = apartment_id ? Number(apartment_id) : null;
  let resolvedAptName = apartment_name;
  if (resolvedAptId && !resolvedAptName) {
    const apt = memoryStore.apartments.find(a => a.id === resolvedAptId);
    if (apt) resolvedAptName = apt.name;
  } else if (resolvedAptName && !resolvedAptId) {
    const apt = memoryStore.apartments.find(a => a.name.toLowerCase() === resolvedAptName.toLowerCase());
    if (apt) resolvedAptId = apt.id;
  }

  let cust = memoryStore.customers.find(c => (c.phone || '').replace(/[^0-9]/g, '').endsWith(cleanPhone));
  if (cust) {
    cust.name = name;
    cust.apartment_id = resolvedAptId;
    cust.apartment_name = resolvedAptName || cust.apartment_name;
    cust.apartment = cust.apartment_name;
    cust.block_wing = block_wing;
    cust.flat_number = flat_number;
    if (!cust.customer_key) cust.customer_key = crypto.randomUUID();
    cust.blocked = Boolean(cust.blocked);
    return cust;
  }

  const customerKey = crypto.randomUUID();
  cust = {
    id: customerId,
    customer_key: customerKey,
    name,
    phone: cleanPhone,
    apartment_id: resolvedAptId,
    apartment_name: resolvedAptName || 'Shneha Apartment',
    apartment: resolvedAptName || 'Shneha Apartment',
    block_wing,
    flat_number,
    referral_code,
    referred_by,
    blocked: false,
    created_at: new Date().toISOString()
  };
  memoryStore.customers.push(cust);
  return cust;
}

// 8. ORDERS (WITH MYSQL TRANSACTION)
async function createOrder({
  customer_id,
  customer_name,
  customer_phone,
  apartment_name,
  block_wing = 'A',
  flat_number,
  delivery_date,
  delivery_slot = 'morning',
  items = [],
  payment_method = 'cod',
  notes = ''
}) {
  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const total_amount = items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.price)), 0);
  const delDate = delivery_date || new Date().toISOString().split('T')[0];

  if (await testMySQL()) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(
        `INSERT INTO orders (id, customer_id, apartment_name, block_wing, flat_number, delivery_date, delivery_slot, total_amount, payment_method, paid, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'placed', ?)`,
        [orderId, customer_id, apartment_name, block_wing, flat_number, delDate, delivery_slot, total_amount, payment_method, notes]
      );

      for (const item of items) {
        const itemTotal = Number((Number(item.quantity) * Number(item.price)).toFixed(2));
        await conn.query(
          `INSERT INTO order_items (order_id, product_id, name, quantity, unit, price, total_price, cutting_instructions)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [orderId, item.product_id, item.name, Number(item.quantity), item.unit || 'kg', Number(item.price), itemTotal, item.cutting_instructions || '']
        );
      }

      await conn.commit();

      return {
        id: orderId,
        customer_id,
        apartment_name,
        block_wing,
        flat_number,
        delivery_date: delDate,
        delivery_slot,
        total_amount: Number(total_amount.toFixed(2)),
        payment_method,
        paid: false,
        status: 'placed',
        notes,
        items
      };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  const newOrder = {
    id: orderId,
    customer_id,
    customer_name: customer_name || 'Customer',
    customer_phone: customer_phone || '',
    apartment_name,
    block_wing,
    flat_number,
    delivery_date: delDate,
    delivery_slot,
    total_amount: Number(total_amount.toFixed(2)),
    payment_method,
    paid: false,
    status: 'placed',
    notes,
    created_at: new Date().toISOString(),
    items: items.map((item, idx) => ({
      id: Date.now() + idx,
      product_id: item.product_id,
      name: item.name,
      quantity: Number(item.quantity),
      unit: item.unit || 'kg',
      price: Number(item.price),
      total_price: Number((item.quantity * item.price).toFixed(2)),
      cutting_instructions: item.cutting_instructions || ''
    }))
  };

  memoryStore.orders.unshift(newOrder);
  return newOrder;
}

// 9. MILK SUBSCRIPTION CREATION
async function createSubscription({ customer_id, litres = 1.0, frequency = 'daily' }) {
  const subId = `SUB-${Math.floor(200 + Math.random() * 800)}`;
  const startDate = new Date().toISOString().split('T')[0];

  if (await testMySQL()) {
    await pool.query(
      `INSERT INTO subscriptions (id, customer_id, product_id, litres, frequency, status, start_date)
       VALUES (?, ?, 'prod-milk-morning', ?, ?, 'active', ?)`,
      [subId, customer_id, Number(litres), frequency, startDate]
    );

    const [rows] = await pool.query(
      `SELECT s.*, p.name AS product_name 
       FROM subscriptions s JOIN products p ON s.product_id = p.id WHERE s.id = ?`,
      [subId]
    );
    const sub = rows[0];
    return {
      ...sub,
      litres: Number(sub.litres)
    };
  }

  const cust = memoryStore.customers.find(c => c.id === customer_id);
  const newSub = {
    id: subId,
    customer_id,
    customer_name: cust?.name || 'Customer',
    customer_phone: cust?.phone || '',
    apartment_name: cust?.apartment_name || '',
    block_wing: cust?.block_wing || '',
    flat_number: cust?.flat_number || '',
    product_id: 'prod-milk-morning',
    product_name: 'Morning Health Milk',
    litres: Number(litres),
    frequency,
    status: 'active',
    start_date: startDate,
    paused_until: null,
    created_at: new Date().toISOString()
  };

  memoryStore.subscriptions.unshift(newSub);
  return newSub;
}

// 10. WHATSAPP & BROADCAST ALERTS
async function createAlert({ title, message, audience = 'all' }) {
  let targetCustomers = [];

  if (await testMySQL()) {
    let sql = 'SELECT * FROM customers';
    const params = [];
    if (audience !== 'all' && audience !== 'milk_subscribers') {
      sql += ' WHERE apartment_name = ?';
      params.push(audience);
    }
    const [custs] = await pool.query(sql, params);
    targetCustomers = custs || [];

    if (audience === 'milk_subscribers') {
      const [subs] = await pool.query("SELECT DISTINCT customer_id FROM subscriptions WHERE status = 'active'");
      const activeIds = new Set(subs.map(s => s.customer_id));
      targetCustomers = targetCustomers.filter(c => activeIds.has(c.id));
    }
  } else {
    targetCustomers = memoryStore.customers.filter(c => {
      if (audience === 'all') return true;
      if (audience === 'milk_subscribers') {
        return memoryStore.subscriptions.some(s => s.customer_id === c.id && s.status === 'active');
      }
      return c.apartment_name === audience;
    });
  }

  const recipients_count = targetCustomers.length;

  let alertRecord = {
    id: Date.now(),
    title,
    message,
    audience,
    recipients_count,
    created_at: new Date().toISOString()
  };

  if (await testMySQL()) {
    const [res] = await pool.query(
      'INSERT INTO alerts (title, message, audience, recipients_count) VALUES (?, ?, ?, ?)',
      [title, message, audience, recipients_count]
    );
    alertRecord.id = res.insertId;
  } else {
    memoryStore.alerts.unshift(alertRecord);
  }

  // Generate personalized WhatsApp links
  const links = targetCustomers.map(c => {
    const cleanPhone = (c.phone || '').replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const personalizedText = `Namaste ${c.name} garu! 🙏\n\n*Palle Natural Foods (HMT Nagar)*\n*${title}*\n\n${message}\n\nFresh village produce at your flat doorstep.`;
    const wa_link = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(personalizedText)}`;

    return {
      customer_id: c.id,
      customer_name: c.name,
      apartment_name: c.apartment_name,
      flat_number: c.flat_number,
      phone: c.phone,
      wa_link
    };
  });

  return {
    ...alertRecord,
    links
  };
}

async function getAlerts() {
  if (await testMySQL()) {
    const [rows] = await pool.query('SELECT * FROM alerts ORDER BY created_at DESC');
    return rows;
  }
  return memoryStore.alerts;
}

// 11. OTP VERIFICATION
async function saveOtp(phone, otpHash, expiresAt) {
  if (await testMySQL()) {
    await pool.query(
      'INSERT INTO otp_codes (phone, otp_hash, attempts, expires_at) VALUES (?, ?, 0, ?)',
      [phone, otpHash, expiresAt]
    );
    return true;
  }
  memoryStore.otp_codes.push({ phone, otp_hash: otpHash, attempts: 0, expires_at: expiresAt });
  return true;
}

async function getLatestOtp(phone) {
  if (await testMySQL()) {
    const [rows] = await pool.query(
      'SELECT * FROM otp_codes WHERE phone = ? ORDER BY id DESC LIMIT 1',
      [phone]
    );
    return rows[0] || null;
  }
  return memoryStore.otp_codes.filter(o => o.phone === phone).slice(-1)[0] || null;
}

async function incrementOtpAttempts(id) {
  if (await testMySQL()) {
    await pool.query('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?', [id]);
    return;
  }
  const code = memoryStore.otp_codes.find(o => o.id === id);
  if (code) code.attempts += 1;
}

// 12. APARTMENTS (Hyperlocal pilot communities & waitlists)
async function getPublicApartments() {
  if (await testMySQL()) {
    const [rows] = await pool.query(
      "SELECT id, name, area, status, launch_date, sort_order FROM apartments WHERE status IN ('active', 'launching_soon') ORDER BY sort_order ASC, name ASC"
    );
    return rows.map(r => ({
      ...r,
      launch_date: r.launch_date ? (r.launch_date.toISOString ? r.launch_date.toISOString().split('T')[0] : r.launch_date) : null
    }));
  }
  return memoryStore.apartments
    .filter(a => ['active', 'launching_soon'].includes(a.status))
    .sort((a, b) => a.sort_order - b.sort_order);
}

async function getAdminApartments() {
  const today = new Date().toISOString().split('T')[0];
  if (await testMySQL()) {
    const [rows] = await pool.query(`
      SELECT 
        a.id, a.name, a.area, a.status, a.launch_date, a.sort_order, a.created_at,
        COUNT(DISTINCT c.id) AS customers_count,
        COUNT(DISTINCT CASE WHEN o.delivery_date = CURDATE() AND o.status != 'cancelled' THEN o.id END) AS todays_orders_count,
        COALESCE(SUM(CASE WHEN o.delivery_date = CURDATE() AND o.status != 'cancelled' THEN o.total_amount ELSE 0 END), 0) AS todays_revenue,
        COUNT(DISTINCT l.id) AS notify_count
      FROM apartments a
      LEFT JOIN customers c ON (c.apartment_id = a.id OR c.apartment_name = a.name)
      LEFT JOIN orders o ON o.apartment_name = a.name
      LEFT JOIN apartment_leads l ON l.apartment_id = a.id
      GROUP BY a.id
      ORDER BY a.sort_order ASC, a.name ASC
    `);

    // Fetch leads details for each apartment
    const [leadsRows] = await pool.query('SELECT * FROM apartment_leads ORDER BY created_at DESC');
    const leadsMap = {};
    leadsRows.forEach(l => {
      if (!leadsMap[l.apartment_id]) leadsMap[l.apartment_id] = [];
      leadsMap[l.apartment_id].push(l.phone);
    });

    return rows.map(r => ({
      id: r.id,
      name: r.name,
      area: r.area,
      status: r.status,
      launch_date: r.launch_date ? (r.launch_date.toISOString ? r.launch_date.toISOString().split('T')[0] : r.launch_date) : null,
      sort_order: r.sort_order,
      customers_count: Number(r.customers_count || 0),
      todays_orders_count: Number(r.todays_orders_count || 0),
      todays_revenue: Number(Number(r.todays_revenue || 0).toFixed(2)),
      notify_count: Number(r.notify_count || 0),
      leads: leadsMap[r.id] || []
    }));
  }

  return memoryStore.apartments.map(a => {
    const custs = memoryStore.customers.filter(c => c.apartment_id === a.id || c.apartment_name === a.name);
    const todayOrders = memoryStore.orders.filter(o => o.apartment_name === a.name && o.delivery_date === today && o.status !== 'cancelled');
    const todaysRev = todayOrders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
    const leads = (memoryStore.apartment_leads || []).filter(l => l.apartment_id === a.id);
    return {
      id: a.id,
      name: a.name,
      area: a.area,
      status: a.status,
      launch_date: a.launch_date || null,
      sort_order: a.sort_order,
      customers_count: custs.length,
      todays_orders_count: todayOrders.length,
      todays_revenue: Number(todaysRev.toFixed(2)),
      notify_count: leads.length,
      leads: leads.map(l => l.phone)
    };
  }).sort((a, b) => a.sort_order - b.sort_order);
}

async function createApartment({ name, area = 'HMT Nagar', status = 'launching_soon', launch_date = null, sort_order = 0 }) {
  if (await testMySQL()) {
    const [res] = await pool.query(
      'INSERT INTO apartments (name, area, status, launch_date, sort_order) VALUES (?, ?, ?, ?, ?)',
      [name, area, status, launch_date || null, Number(sort_order)]
    );
    const [rows] = await pool.query('SELECT * FROM apartments WHERE id = ?', [res.insertId]);
    return rows[0];
  }

  const nextId = memoryStore.apartments.length ? Math.max(...memoryStore.apartments.map(a => a.id)) + 1 : 1;
  const newApt = {
    id: nextId,
    name,
    area: area || 'HMT Nagar',
    status: status || 'launching_soon',
    launch_date: launch_date || null,
    sort_order: Number(sort_order) || nextId,
    created_at: new Date().toISOString()
  };
  memoryStore.apartments.push(newApt);
  return newApt;
}

async function updateApartment(id, { name, area, status, launch_date, sort_order }) {
  const aptId = Number(id);
  if (await testMySQL()) {
    const fields = [];
    const params = [];
    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (area !== undefined) { fields.push('area = ?'); params.push(area); }
    if (status !== undefined) { fields.push('status = ?'); params.push(status); }
    if (launch_date !== undefined) { fields.push('launch_date = ?'); params.push(launch_date || null); }
    if (sort_order !== undefined) { fields.push('sort_order = ?'); params.push(Number(sort_order)); }

    if (fields.length > 0) {
      params.push(aptId);
      await pool.query(`UPDATE apartments SET ${fields.join(', ')} WHERE id = ?`, params);
    }
    const [rows] = await pool.query('SELECT * FROM apartments WHERE id = ?', [aptId]);
    if (!rows.length) throw new Error('Apartment not found');
    return rows[0];
  }

  const apt = memoryStore.apartments.find(a => a.id === aptId);
  if (!apt) throw new Error('Apartment not found');
  if (name !== undefined) apt.name = name;
  if (area !== undefined) apt.area = area;
  if (status !== undefined) apt.status = status;
  if (launch_date !== undefined) apt.launch_date = launch_date || null;
  if (sort_order !== undefined) apt.sort_order = Number(sort_order);
  return apt;
}

async function deleteApartment(id) {
  const aptId = Number(id);
  if (await testMySQL()) {
    await pool.query("UPDATE apartments SET status = 'inactive' WHERE id = ?", [aptId]);
    return { success: true, id: aptId };
  }
  const apt = memoryStore.apartments.find(a => a.id === aptId);
  if (apt) apt.status = 'inactive';
  return { success: true, id: aptId };
}

async function saveApartmentLead({ apartment_id, phone }) {
  const aptId = Number(apartment_id);
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '').slice(-10);
  if (!cleanPhone || cleanPhone.length !== 10) throw new Error('Valid 10-digit phone required');

  if (await testMySQL()) {
    await pool.query(
      `INSERT INTO apartment_leads (apartment_id, phone) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE phone = VALUES(phone)`,
      [aptId, cleanPhone]
    );
    return { success: true, apartment_id: aptId, phone: cleanPhone };
  }

  if (!memoryStore.apartment_leads) memoryStore.apartment_leads = [];
  const exists = memoryStore.apartment_leads.some(l => l.apartment_id === aptId && l.phone === cleanPhone);
  if (!exists) {
    memoryStore.apartment_leads.push({
      id: memoryStore.apartment_leads.length + 1,
      apartment_id: aptId,
      phone: cleanPhone,
      created_at: new Date().toISOString()
    });
  }
  return { success: true, apartment_id: aptId, phone: cleanPhone };
}

module.exports = {
  isMySQLConnected,
  getProducts,
  getRates,
  updateRate,
  getRateHistory,
  getProcurement,
  getOrders,
  updateOrder,
  getSubscriptions,
  updateSubscription,
  getReports,
  getCustomers,
  getCustomerById,
  getCustomerByPhone,
  getCustomerByKey,
  createCustomer,
  updateCustomer,
  createOrder,
  createSubscription,
  createAlert,
  getAlerts,
  saveOtp,
  getLatestOtp,
  incrementOtpAttempts,
  getPublicApartments,
  getAdminApartments,
  createApartment,
  updateApartment,
  deleteApartment,
  saveApartmentLead
};
