// Customer App API Client - Palle Natural Foods
// Hyperlocal Village-Fresh Delivery • HMT Nagar, Hyderabad
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

export function getCustomerKey() {
  return localStorage.getItem('palle_customer_key') || '';
}

export function setCustomerKey(key) {
  if (key) {
    localStorage.setItem('palle_customer_key', key);
  } else {
    localStorage.removeItem('palle_customer_key');
  }
}

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
    if (profile.customer_key) {
      setCustomerKey(profile.customer_key);
    }
  } else {
    localStorage.removeItem('palle_customer_profile');
    setCustomerKey('');
  }
}

export function getSelectedApartment() {
  try {
    const raw = localStorage.getItem('palle_selected_apartment');
    if (raw) return JSON.parse(raw);
    const profile = getCurrentCustomer();
    if (profile && profile.apartment_name) {
      return {
        id: profile.apartment_id || 1,
        name: profile.apartment_name,
        block: profile.block_wing || 'Block A',
        flat: profile.flat_number || ''
      };
    }
    return {
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

// Request Helper with automatic X-Customer-Key injection
async function request(endpoint, options = {}) {
  const customerKey = getCustomerKey();
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (customerKey) {
    headers['X-Customer-Key'] = customerKey;
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.error || `HTTP ${res.status}`;
    const err = new Error(errorMsg);
    err.status = res.status;
    err.blocked = Boolean(data.blocked);
    throw err;
  }
  return data;
}

// 1. CUSTOMER REGISTRATION & DELIVERY DETAILS (NO LOGIN / NO OTP)
export async function saveDeliveryDetails({ name, phone, apartment_id, apartment_name, block_wing, flat_number, referred_by }) {
  const customer = await request('/api/customers', {
    method: 'POST',
    body: JSON.stringify({
      name,
      phone,
      apartment_id,
      apartment_name,
      block_wing,
      flat_number,
      referred_by
    })
  });

  if (customer && customer.customer_key) {
    setCurrentCustomer(customer);
    setSelectedApartment({
      id: customer.apartment_id,
      name: customer.apartment_name || customer.apartment,
      block: customer.block_wing || 'Block A',
      flat: customer.flat_number || ''
    });
  }

  return customer;
}

export function getMyProfile() {
  return request('/api/customer/me');
}

export function getMyOrders() {
  return request('/api/customer/orders');
}

export function getMySubscriptions() {
  return request('/api/customer/subscriptions');
}

export function pauseSubscription(subId, until = null) {
  return request(`/api/customer/subscriptions/${subId}/pause`, {
    method: 'PATCH',
    body: JSON.stringify({ until })
  });
}

export function resumeSubscription(subId) {
  return request(`/api/customer/subscriptions/${subId}/resume`, {
    method: 'PATCH'
  });
}

// 2. PRODUCTS
export function getProducts() {
  return request('/api/products');
}

// 3. ORDERS (Cash on Delivery default)
export function createOrder(payload) {
  return request('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function getCustomerOrders(customerId) {
  // If customerId is provided but customer_key exists, route through secure customer endpoint
  if (getCustomerKey()) {
    return getMyOrders();
  }
  return request(`/api/customers/${customerId}/orders`);
}

export function rateOrder(orderId, rating, feedback) {
  return request(`/api/customer/orders/${orderId}/rate`, {
    method: 'POST',
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

// Optional OTP backward compatibility hooks (kept disabled)
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

// 6. SERVICES & OPERATIONAL SETTINGS
export function getServices() {
  return request('/api/services');
}

export function getSettings() {
  return request('/api/settings');
}

export function notifyServiceWaitlist(service_category, phone) {
  return request('/api/services/notify', {
    method: 'POST',
    body: JSON.stringify({ service_category, phone })
  });
}
