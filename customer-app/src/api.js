// Customer App API Client - Palle Natural Foods
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

export function getToken() {
  return localStorage.getItem('palle_customer_token') || '';
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('palle_customer_token', token);
  } else {
    localStorage.removeItem('palle_customer_token');
  }
}

export function getCurrentCustomer() {
  try {
    const raw = localStorage.getItem('palle_customer_profile');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setCurrentCustomer(profile) {
  if (profile) {
    localStorage.setItem('palle_customer_profile', JSON.stringify(profile));
  } else {
    localStorage.removeItem('palle_customer_profile');
  }
}

export function getSelectedApartment() {
  try {
    const raw = localStorage.getItem('palle_selected_apartment');
    return raw ? JSON.parse(raw) : {
      id: 1,
      name: 'Shneha Apartment',
      block: 'Block A',
      flat: '101'
    };
  } catch (e) {
    return { id: 1, name: 'Shneha Apartment', block: 'Block A', flat: '101' };
  }
}

export function setSelectedApartment(apt) {
  localStorage.setItem('palle_selected_apartment', JSON.stringify(apt));
}

// Request Helper
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

// 1. AUTH
export function sendOtp(phone) {
  return request('/api/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone })
  });
}

export function verifyOtp(phone, otp) {
  return request('/api/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, otp })
  });
}

export function registerCustomer(profile) {
  return request('/api/customers', {
    method: 'POST',
    body: JSON.stringify(profile)
  });
}

// 2. PRODUCTS
export function getProducts() {
  return request('/api/products');
}

// 3. ORDERS
export function createOrder(payload) {
  return request('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function getCustomerOrders(customerId) {
  return request(`/api/customers/${customerId}/orders`);
}

export function rateOrder(orderId, rating, feedback) {
  return request(`/api/admin/orders/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify({ rating, feedback })
  });
}

// 4. SUBSCRIPTIONS
export function createSubscription(payload) {
  return request('/api/subscriptions', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// 5. APARTMENTS & LAUNCH NOTIFICATIONS
export function getApartments() {
  return request('/api/apartments');
}

export function notifyApartmentLaunch(apartment_id, phone) {
  return request('/api/apartments/notify', {
    method: 'POST',
    body: JSON.stringify({ apartment_id, phone })
  });
}

