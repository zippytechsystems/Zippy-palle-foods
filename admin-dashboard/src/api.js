// API client for Mana Palle Fresh Admin Dashboard
// Connected to VITE_API_URL environment variable

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

let logoutHandler = null;

export function setLogoutHandler(handler) {
  logoutHandler = handler;
}

export function getToken() {
  return localStorage.getItem('zfresh_admin_token') || '';
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('zfresh_admin_token', token);
  } else {
    localStorage.removeItem('zfresh_admin_token');
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      setToken('');
      if (logoutHandler) {
        logoutHandler('Access denied. Session expired or unauthorized.');
      }
      throw new Error('Access denied. Please log in again.');
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (err) {
    throw err;
  }
}

// ---------------------------------------------------------------------------
// AUTH
// ---------------------------------------------------------------------------
export async function login(username, password) {
  const data = await apiRequest('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  if (data.token) {
    setToken(data.token);
  }
  return data;
}

export function logout() {
  setToken('');
  if (logoutHandler) logoutHandler();
}

// ---------------------------------------------------------------------------
// 1. SOURCING & RATES
// ---------------------------------------------------------------------------
export function getRates() {
  return apiRequest('/api/admin/rates');
}

export function updateRate(id, payload) {
  return apiRequest(`/api/admin/rates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function getRateHistory(productId) {
  return apiRequest(`/api/admin/rates/${productId}/history`);
}

export function getProcurement(dateStr) {
  const query = dateStr ? `?date=${encodeURIComponent(dateStr)}` : '';
  return apiRequest(`/api/admin/procurement${query}`);
}

// ---------------------------------------------------------------------------
// 2. APARTMENT ORDERS
// ---------------------------------------------------------------------------
export function getOrders(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.apartment && filters.apartment !== 'all') params.append('apartment', filters.apartment);
  if (filters.date) params.append('date', filters.date);

  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest(`/api/admin/orders${query}`);
}

export function updateOrder(id, payload) {
  return apiRequest(`/api/admin/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

// ---------------------------------------------------------------------------
// 3. MILK SUBSCRIPTIONS
// ---------------------------------------------------------------------------
export function getSubscriptions() {
  return apiRequest('/api/admin/subscriptions');
}

export function updateSubscription(id, payload) {
  return apiRequest(`/api/admin/subscriptions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

// ---------------------------------------------------------------------------
// 4. SALES & REPORTS
// ---------------------------------------------------------------------------
export function getReports(period = 'daily') {
  return apiRequest(`/api/admin/reports?period=${period}`);
}

// ---------------------------------------------------------------------------
// 5. CUSTOMER DIRECTORY
// ---------------------------------------------------------------------------
export function getCustomers(q = '') {
  const query = q ? `?q=${encodeURIComponent(q)}` : '';
  return apiRequest(`/api/admin/customers${query}`);
}

export function getCustomerById(id) {
  return apiRequest(`/api/admin/customers/${id}`);
}

// ---------------------------------------------------------------------------
// 6. WHATSAPP & BROADCAST ALERTS
// ---------------------------------------------------------------------------
export function createAlert(payload) {
  return apiRequest('/api/admin/alerts', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function getAlerts() {
  return apiRequest('/api/admin/alerts');
}

// ---------------------------------------------------------------------------
// 7. APARTMENTS MANAGEMENT
// ---------------------------------------------------------------------------
export function getAdminApartments() {
  return apiRequest('/api/admin/apartments');
}

export function createApartment(payload) {
  return apiRequest('/api/admin/apartments', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateApartment(id, payload) {
  return apiRequest(`/api/admin/apartments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteApartment(id) {
  return apiRequest(`/api/admin/apartments/${id}`, {
    method: 'DELETE'
  });
}

