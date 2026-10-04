const { createClient } = require('@supabase/supabase-js');

// Configuration from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_SERVICE_ROLE_KEY && 
  !SUPABASE_URL.includes('your-project') &&
  !SUPABASE_SERVICE_ROLE_KEY.includes('your-service-role-key')
);

if (isSupabaseConfigured) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    console.log('✅ Connected to Supabase PostgreSQL Database');
  } catch (err) {
    console.warn('⚠️ Could not initialize Supabase client:', err.message);
  }
} else {
  console.log('ℹ️ Supabase credentials not set or placeholder. Running in-memory mock store for local development/testing.');
}

// ---------------------------------------------------------------------------
// IN-MEMORY STORE (Pre-seeded with identical data from seed.sql for local dev)
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
  customers: [
    { id: 'c0000001-0000-0000-0000-000000000001', name: 'Srinivas Rao', phone: '98490 12345', apartment_name: 'Raghavendra Nilayam', block_wing: 'Block A', flat_number: '204', created_at: new Date().toISOString() },
    { id: 'c0000002-0000-0000-0000-000000000002', name: 'Vani Sharma', phone: '98490 23456', apartment_name: 'Raghavendra Nilayam', block_wing: 'Block B', flat_number: '302', created_at: new Date().toISOString() },
    { id: 'c0000003-0000-0000-0000-000000000003', name: 'Rajesh Kumar', phone: '98490 34567', apartment_name: 'Aditya Enclave', block_wing: 'Wing 1', flat_number: '402', created_at: new Date().toISOString() },
    { id: 'c0000004-0000-0000-0000-000000000004', name: 'Kavitha Reddy', phone: '98490 45678', apartment_name: 'Sri Sai Srinivas Residency', block_wing: 'Block B', flat_number: '105', created_at: new Date().toISOString() },
    { id: 'c0000005-0000-0000-0000-000000000005', name: 'Venkat Ramana', phone: '98490 56789', apartment_name: 'Venkateshwara Towers', block_wing: 'Tower 1', flat_number: '501', created_at: new Date().toISOString() },
    { id: 'c0000006-0000-0000-0000-000000000006', name: 'Lakshmi Prasanna', phone: '98490 67890', apartment_name: 'Kakatiya Heights', block_wing: 'North Wing', flat_number: '203', created_at: new Date().toISOString() }
  ],
  orders: [
    {
      id: 'ORD-1001',
      customer_id: 'c0000001-0000-0000-0000-000000000001',
      customer_name: 'Srinivas Rao',
      customer_phone: '98490 12345',
      apartment_name: 'Raghavendra Nilayam',
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
  ]
};

// ---------------------------------------------------------------------------
// DB HELPER FUNCTIONS (PostgreSQL with Supabase & In-Memory Fallback)
// ---------------------------------------------------------------------------

// 1. PRODUCTS
async function getProducts() {
  if (supabase) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('category', ['milk', 'fish', 'mutton'])
      .order('category', { ascending: true });
    if (error) throw error;
    return data;
  }
  return memoryStore.products;
}

// 2. RATES
async function getRates() {
  if (supabase) {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, category, unit, price, buy_price, available')
      .order('category', { ascending: true });
    if (error) throw error;
    return data.map(p => ({
      ...p,
      price: Number(p.price),
      buy_price: Number(p.buy_price),
      margin: Number((Number(p.price) - Number(p.buy_price)).toFixed(2))
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
  if (supabase) {
    // 1. Get old product details
    const { data: current, error: getErr } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (getErr) throw getErr;

    const updates = { updated_at: new Date().toISOString() };
    if (price !== undefined) updates.price = Number(price);
    if (buy_price !== undefined) updates.buy_price = Number(buy_price);
    if (available !== undefined) updates.available = Boolean(available);

    const { data: updated, error: updErr } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (updErr) throw updErr;

    // 2. Insert into rate_history if price or buy_price changed
    if (
      (price !== undefined && Number(price) !== Number(current.price)) ||
      (buy_price !== undefined && Number(buy_price) !== Number(current.buy_price))
    ) {
      await supabase.from('rate_history').insert({
        product_id: id,
        old_price: current.price,
        new_price: updates.price !== undefined ? updates.price : current.price,
        old_buy_price: current.buy_price,
        new_buy_price: updates.buy_price !== undefined ? updates.buy_price : current.buy_price
      });
    }

    return {
      ...updated,
      price: Number(updated.price),
      buy_price: Number(updated.buy_price),
      margin: Number((Number(updated.price) - Number(updated.buy_price)).toFixed(2))
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
  if (supabase) {
    const { data, error } = await supabase
      .from('rate_history')
      .select('*')
      .eq('product_id', productId)
      .order('changed_at', { ascending: false });
    if (error) throw error;
    return data;
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

  if (supabase) {
    // A. Orders on targetDate (excluding cancelled)
    const { data: orders, error: oErr } = await supabase
      .from('orders')
      .select('id, status, order_items(product_id, quantity, unit)')
      .eq('delivery_date', targetDate)
      .neq('status', 'cancelled');
    if (oErr) throw oErr;

    orders.forEach(ord => {
      (ord.order_items || []).forEach(item => {
        if (prodMap[item.product_id]) {
          prodMap[item.product_id].quantity += Number(item.quantity);
        }
      });
    });

    // B. Milk Subscriptions delivering on targetDate
    const { data: subs, error: sErr } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active');
    if (sErr) throw sErr;

    const targetTime = new Date(targetDate).getTime();
    subs.forEach(sub => {
      if (sub.paused_until && new Date(sub.paused_until).getTime() >= targetTime) {
        return; // Currently paused
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
    // Memory store calculation
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

  if (supabase) {
    let query = supabase
      .from('orders')
      .select('*, customers(name, phone), order_items(*)')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') query = query.eq('status', status);
    if (apartment && apartment !== 'all') query = query.eq('apartment_name', apartment);
    if (date) query = query.eq('delivery_date', date);

    const { data, error } = await query;
    if (error) throw error;

    ordersList = data.map(o => ({
      id: o.id,
      customer_id: o.customer_id,
      customer_name: o.customers?.name || 'Customer',
      customer_phone: o.customers?.phone || '',
      apartment_name: o.apartment_name,
      block_wing: o.block_wing,
      flat_number: o.flat_number,
      delivery_date: o.delivery_date,
      delivery_slot: o.delivery_slot,
      total_amount: Number(o.total_amount),
      payment_method: o.payment_method,
      paid: o.paid,
      status: o.status,
      notes: o.notes,
      created_at: o.created_at,
      items: (o.order_items || []).map(i => ({
        id: i.id,
        product_id: i.product_id,
        name: i.name,
        quantity: Number(i.quantity),
        unit: i.unit,
        price: Number(i.price),
        total_price: Number(i.total_price),
        cutting_instructions: i.cutting_instructions
      }))
    }));
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

async function updateOrder(id, { status, paid }) {
  if (supabase) {
    const updates = {};
    if (status !== undefined) updates.status = status;
    if (paid !== undefined) updates.paid = Boolean(paid);

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select('*, customers(name, phone), order_items(*)')
      .single();
    if (error) throw error;

    return {
      ...data,
      total_amount: Number(data.total_amount),
      customer_name: data.customers?.name,
      customer_phone: data.customers?.phone
    };
  }

  const ord = memoryStore.orders.find(o => o.id === id);
  if (!ord) throw new Error('Order not found');
  if (status !== undefined) ord.status = status;
  if (paid !== undefined) ord.paid = Boolean(paid);
  return ord;
}

// 5. MILK SUBSCRIPTIONS
async function getSubscriptions() {
  if (supabase) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, customers(name, phone, apartment_name, block_wing, flat_number), products(name)')
      .order('created_at', { ascending: false });
    if (error) throw error;

    const list = data.map(s => ({
      id: s.id,
      customer_id: s.customer_id,
      customer_name: s.customers?.name || 'Customer',
      customer_phone: s.customers?.phone || '',
      apartment_name: s.customers?.apartment_name || '',
      block_wing: s.customers?.block_wing || '',
      flat_number: s.customers?.flat_number || '',
      product_id: s.product_id,
      product_name: s.products?.name || 'Morning Health Milk',
      litres: Number(s.litres),
      frequency: s.frequency,
      status: s.status,
      paused_until: s.paused_until,
      start_date: s.start_date,
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
  if (supabase) {
    const updates = {};
    if (action === 'pause') {
      updates.status = 'paused';
      updates.paused_until = until || null;
    } else if (action === 'resume') {
      updates.status = 'active';
      updates.paused_until = null;
    } else if (action === 'cancel') {
      updates.status = 'cancelled';
    }

    if (litres !== undefined) {
      updates.litres = Number(litres);
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', id)
      .select('*, customers(name, phone, apartment_name, flat_number)')
      .single();
    if (error) throw error;

    return {
      ...data,
      litres: Number(data.litres),
      customer_name: data.customers?.name,
      customer_phone: data.customers?.phone
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
  if (supabase) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .gte('delivery_date', cutoffDate)
      .neq('status', 'cancelled');
    if (error) throw error;
    orders = data;
  } else {
    orders = memoryStore.orders.filter(o => o.delivery_date >= cutoffDate && o.status !== 'cancelled');
  }

  let total_revenue = 0;
  let total_cost = 0;
  const product_summary = {};
  const apartment_summary = {};
  const daily_summary = {};

  // Initialize daily summary slots
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
    daily_summary[d] = { date: d, revenue: 0, orders: 0, profit: 0 };
  }

  orders.forEach(o => {
    const rev = Number(o.total_amount || 0);
    total_revenue += rev;

    // Daily breakdown
    const d = o.delivery_date;
    if (daily_summary[d]) {
      daily_summary[d].revenue += rev;
      daily_summary[d].orders += 1;
    }

    // Apartment breakdown
    const apt = o.apartment_name || 'Other';
    if (!apartment_summary[apt]) {
      apartment_summary[apt] = { apartment_name: apt, orders: 0, revenue: 0 };
    }
    apartment_summary[apt].orders += 1;
    apartment_summary[apt].revenue += rev;

    // Product breakdown
    (o.order_items || o.items || []).forEach(item => {
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

  if (supabase) {
    let query = supabase
      .from('customers')
      .select('*, orders(id, total_amount), subscriptions(id, status)')
      .order('created_at', { ascending: false });

    if (q) {
      query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,apartment_name.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map(c => {
      const total_spent = (c.orders || []).reduce((acc, o) => acc + Number(o.total_amount), 0);
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        apartment_name: c.apartment_name,
        block_wing: c.block_wing,
        flat_number: c.flat_number,
        orders_count: (c.orders || []).length,
        total_spent: Number(total_spent.toFixed(2)),
        has_active_milk: (c.subscriptions || []).some(s => s.status === 'active'),
        created_at: c.created_at
      };
    });
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
        orders_count: orders.length,
        total_spent: Number(total_spent.toFixed(2)),
        has_active_milk: subs.some(s => s.status === 'active')
      };
    });
}

async function getCustomerById(id) {
  if (supabase) {
    const { data: customer, error: cErr } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    if (cErr) throw cErr;

    const { data: orders } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('customer_id', id)
      .order('created_at', { ascending: false });

    const { data: subs } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('customer_id', id);

    return {
      ...customer,
      orders: orders || [],
      subscriptions: subs || []
    };
  }

  const customer = memoryStore.customers.find(c => c.id === id);
  if (!customer) throw new Error('Customer not found');

  const orders = memoryStore.orders.filter(o => o.customer_id === id);
  const subs = memoryStore.subscriptions.filter(s => s.customer_id === id);

  return {
    ...customer,
    orders,
    subscriptions: subs
  };
}

async function createCustomer({ name, phone, apartment_name, block_wing, flat_number }) {
  if (supabase) {
    const { data, error } = await supabase
      .from('customers')
      .upsert(
        { name, phone, apartment_name, block_wing, flat_number },
        { onConflict: 'phone' }
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  let cust = memoryStore.customers.find(c => c.phone === phone);
  if (cust) {
    cust.name = name;
    cust.apartment_name = apartment_name;
    cust.block_wing = block_wing;
    cust.flat_number = flat_number;
    return cust;
  }

  cust = {
    id: `c000000${memoryStore.customers.length + 1}-0000-0000-0000-000000000000`,
    name,
    phone,
    apartment_name,
    block_wing,
    flat_number,
    created_at: new Date().toISOString()
  };
  memoryStore.customers.push(cust);
  return cust;
}

// 8. ORDERS CREATION
async function createOrder({
  customer_id,
  customer_name,
  customer_phone,
  apartment_name,
  block_wing,
  flat_number,
  delivery_date,
  delivery_slot,
  items,
  payment_method = 'cod',
  notes = ''
}) {
  const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const total_amount = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);

  if (supabase) {
    const { data: ord, error: oErr } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        customer_id,
        apartment_name,
        block_wing,
        flat_number,
        delivery_date: delivery_date || new Date().toISOString().split('T')[0],
        delivery_slot: delivery_slot || 'morning',
        total_amount,
        payment_method,
        paid: false,
        status: 'placed',
        notes
      })
      .select()
      .single();
    if (oErr) throw oErr;

    const orderItems = items.map(item => ({
      order_id: orderId,
      product_id: item.product_id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit || 'kg',
      price: item.price,
      total_price: Number((item.quantity * item.price).toFixed(2)),
      cutting_instructions: item.cutting_instructions || ''
    }));

    const { error: iErr } = await supabase.from('order_items').insert(orderItems);
    if (iErr) throw iErr;

    return {
      ...ord,
      total_amount: Number(ord.total_amount),
      items: orderItems
    };
  }

  const newOrder = {
    id: orderId,
    customer_id,
    customer_name: customer_name || 'Customer',
    customer_phone: customer_phone || '',
    apartment_name,
    block_wing,
    flat_number,
    delivery_date: delivery_date || new Date().toISOString().split('T')[0],
    delivery_slot: delivery_slot || 'morning',
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

  if (supabase) {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        id: subId,
        customer_id,
        product_id: 'prod-milk-morning',
        litres: Number(litres),
        frequency,
        status: 'active',
        start_date: startDate
      })
      .select()
      .single();
    if (error) throw error;
    return data;
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

  if (supabase) {
    let q = supabase.from('customers').select('*');
    if (audience !== 'all' && audience !== 'milk_subscribers') {
      q = q.eq('apartment_name', audience);
    }
    const { data: custs } = await q;
    targetCustomers = custs || [];

    if (audience === 'milk_subscribers') {
      const { data: subs } = await supabase.from('subscriptions').select('customer_id').eq('status', 'active');
      const activeIds = new Set((subs || []).map(s => s.customer_id));
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

  if (supabase) {
    const { data, error } = await supabase
      .from('alerts')
      .insert({
        title,
        message,
        audience,
        recipients_count
      })
      .select()
      .single();
    if (!error && data) {
      alertRecord = data;
    }
  } else {
    memoryStore.alerts.unshift(alertRecord);
  }

  // Generate WhatsApp wa.me personalized links for each customer
  const links = targetCustomers.map(c => {
    const cleanPhone = (c.phone || '').replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const personalizedText = `Namaste ${c.name} garu! 🙏\n\n*${title}*\n\n${message}\n\n- Mana Palle Fresh (HMT Nagar)`;
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
  if (supabase) {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
  return memoryStore.alerts;
}

module.exports = {
  isSupabaseConfigured,
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
  createCustomer,
  createOrder,
  createSubscription,
  createAlert,
  getAlerts
};
