import React, { useState, useEffect, useCallback } from 'react';
import { 
  login, 
  logout, 
  getToken, 
  setToken,
  getMe,
  setLogoutHandler, 
  getRates, 
  getOrders, 
  getSubscriptions,
  getAdminApartments,
  getAdminServices
} from './api';
import { translations } from './translations';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import RatesView from './components/RatesView';
import OrdersView from './components/OrdersView';
import ProcurementView from './components/ProcurementView';
import SubscriptionsView from './components/SubscriptionsView';
import ReportsView from './components/ReportsView';
import CustomersView from './components/CustomersView';
import AlertsView from './components/AlertsView';
import { ShieldCheck, Lock, User, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState('en');
  const t = translations[lang];

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getToken()));
  const [user, setUser] = useState({ username: '', role: 'admin' });
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // App data state
  const [activeSection, setActiveSection] = useState('rates');
  const [rates, setRates] = useState([]);
  const [services, setServices] = useState([
    { category: 'fish', enabled: true },
    { category: 'mutton', enabled: true },
    { category: 'milk', enabled: false }
  ]);
  const [ordersData, setOrdersData] = useState(null);
  const [subsData, setSubsData] = useState(null);
  const [apartments, setApartments] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(false);

  // Auto-refresh countdown state (60s)
  const [countdown, setCountdown] = useState(60);

  // Toast state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Register 401 logout handler
  useEffect(() => {
    setLogoutHandler((msg) => {
      setIsAuthenticated(false);
      if (msg) showToast(msg, 'error');
    });
  }, []);

  // Verify token with backend /api/admin/me on initial load
  useEffect(() => {
    const token = getToken();
    if (token) {
      getMe()
        .then((res) => {
          setIsAuthenticated(true);
          if (res?.admin) setUser(res.admin);
        })
        .catch(() => {
          setIsAuthenticated(false);
          setToken('');
        });
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Auto logout after 30 minutes of inactivity
  useEffect(() => {
    if (!isAuthenticated) return;

    let timer;
    const resetInactivityTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        logout();
        setIsAuthenticated(false);
        showToast('Logged out due to 30 minutes of inactivity', 'error');
      }, 30 * 60 * 1000); // 30 minutes
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetInactivityTimer));
    resetInactivityTimer();

    return () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, resetInactivityTimer));
    };
  }, [isAuthenticated]);

  // Fetch core data
  const loadData = useCallback(async () => {
    if (!getToken()) return;
    try {
      const [ratesRes, ordersRes, subsRes, aptsRes, srvsRes] = await Promise.all([
        getRates(),
        getOrders(),
        getSubscriptions(),
        getAdminApartments().catch(() => []),
        getAdminServices().catch(() => [])
      ]);
      setRates(ratesRes);
      setOrdersData(ordersRes);
      setSubsData(subsRes);
      setApartments(aptsRes || []);
      if (Array.isArray(srvsRes) && srvsRes.length > 0) {
        setServices(srvsRes);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  }, []);

  // If milk is disabled and currently on subscriptions tab, fallback to rates
  useEffect(() => {
    const isMilkEnabled = services.some(s => s.category === 'milk' && (s.enabled === 1 || s.enabled === true));
    if (!isMilkEnabled && activeSection === 'subscriptions') {
      setActiveSection('rates');
    }
  }, [services, activeSection]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      setLoadingInitial(true);
      loadData().finally(() => setLoadingInitial(false));
    }
  }, [isAuthenticated, loadData]);

  // 60-second auto-refresh timer for orders & subscriptions
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Trigger refresh
          loadData();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, loadData]);

  const handleManualRefresh = () => {
    setCountdown(60);
    loadData();
    showToast('Dashboard data refreshed', 'success');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      const res = await login(loginUsername, loginPassword);
      setIsAuthenticated(true);
      setUser(res.user || { username: loginUsername, role: 'admin' });
      showToast('Welcome back, Admin', 'success');
    } catch (err) {
      setLoginError(err.message || 'Invalid username or password');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    showToast('Logged out successfully', 'success');
  };

  // ---------------------------------------------------------------------------
  // LOGIN SCREEN
  // ---------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f5f3ef] flex flex-col justify-center items-center p-4">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold flex items-center space-x-2 toast-animate ${
              toast.type === 'error'
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{toast.message}</span>
          </div>
        )}

        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#e2dfd4] shadow-xl text-center">
          <div className="w-16 h-16 bg-[#e8f5e9] text-[#1b4332] rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-inner border border-[#a7f3d0] mb-4">
            🌾
          </div>
          <h1 className="text-2xl font-black text-[#1b4332] tracking-tight">Palle Natural Foods - Admin</h1>
          <p className="text-xs text-gray-500 font-semibold mt-1 uppercase tracking-wider">
            {t.login.title} • {t.subTitle}
          </p>
          <p className="text-xs text-gray-600 mt-2">
            {t.login.prompt}
          </p>

          {loginError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl text-left flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {t.login.username}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
                  placeholder="Username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {t.login.password}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 border rounded-xl text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition disabled:opacity-50 mt-2"
            >
              {loggingIn ? t.login.loggingIn : t.login.signInBtn}
            </button>
          </form>

          {/* Slogan */}
          <div className="mt-6 pt-4 border-t text-[11px] text-gray-400">
            {t.slogan}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // DASHBOARD MAIN SHELL
  // ---------------------------------------------------------------------------
  const apartmentsList = apartments.length 
    ? apartments.map(a => a.name) 
    : Object.keys(ordersData?.by_apartment || {});

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f3ef]">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold flex items-center space-x-2 toast-animate ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        lang={lang}
        setLang={setLang}
        countdown={countdown}
        onRefresh={handleManualRefresh}
        onLogout={handleLogout}
        user={user}
      />

      {/* Body Layout: Sidebar + Main Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          lang={lang}
          ordersCount={ordersData?.total_orders || 0}
          subsCount={subsData?.total_active || 0}
          onLogout={handleLogout}
          services={services}
        />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {loadingInitial ? (
            <div className="py-24 text-center text-sm font-semibold text-gray-500">
              {t.common.loading}
            </div>
          ) : (
            <>
              {activeSection === 'rates' && (
                <RatesView
                  rates={rates}
                  onRateUpdated={loadData}
                  showToast={showToast}
                  lang={lang}
                  services={services}
                  onServicesUpdated={loadData}
                />
              )}

              {activeSection === 'orders' && (
                <OrdersView
                  ordersData={ordersData}
                  onOrderUpdated={loadData}
                  showToast={showToast}
                  lang={lang}
                  apartments={apartments}
                  onApartmentsUpdated={loadData}
                />
              )}

              {activeSection === 'procurement' && (
                <ProcurementView
                  lang={lang}
                  showToast={showToast}
                />
              )}

              {activeSection === 'subscriptions' && (
                <SubscriptionsView
                  subsData={subsData}
                  onSubUpdated={loadData}
                  showToast={showToast}
                  lang={lang}
                />
              )}

              {activeSection === 'reports' && (
                <ReportsView
                  lang={lang}
                  showToast={showToast}
                />
              )}

              {activeSection === 'customers' && (
                <CustomersView
                  lang={lang}
                  showToast={showToast}
                />
              )}

              {activeSection === 'alerts' && (
                <AlertsView
                  lang={lang}
                  showToast={showToast}
                  apartments={apartmentsList}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
