import React, { useState, useEffect } from 'react';
import { 
  getProducts, 
  getSelectedApartment, 
  setSelectedApartment, 
  getCurrentCustomer, 
  setCurrentCustomer,
  setToken 
} from './api';
import { translations } from './translations';

import Header from './components/Header';
import StoreHome from './components/StoreHome';
import MilkSubTab from './components/MilkSubTab';
import OrdersView from './components/OrdersView';
import CartDrawer from './components/CartDrawer';
import ApartmentModal from './components/ApartmentModal';
import OtpModal from './components/OtpModal';
import AdminTrigger from './components/AdminTrigger';

import { Store, Milk, ShoppingBag, ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState('en');
  const t = translations[lang];

  // Global state
  const [activeTab, setActiveTab] = useState('store'); // 'store' | 'milk' | 'orders'
  const [apartment, setApartmentState] = useState(getSelectedApartment());
  const [customer, setCustomerState] = useState(getCurrentCustomer());
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  // Modals state
  const [isAptModalOpen, setIsAptModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Fetch products
  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(err => console.log('Products fetch notice:', err.message));
  }, []);

  const handleUpdateApartment = (newApt) => {
    setApartmentState(newApt);
    setSelectedApartment(newApt);
    showToast(`Apartment updated to ${newApt.name}, Flat ${newApt.flat}`, 'success');
  };

  const handleLoginSuccess = (cust) => {
    setCustomerState(cust);
  };

  const handleLogout = () => {
    setCustomerState(null);
    setCurrentCustomer(null);
    setToken('');
    showToast('Logged out', 'success');
  };

  const handleAddToCart = (item) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(i => i.product_id === item.product_id && i.cutting_instructions === item.cutting_instructions);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx].quantity += item.quantity;
        return copy;
      }
      return [...prev, item];
    });
    showToast(`Added ${item.name} to cart!`, 'success');
  };

  const handleRemoveFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleRepeatOrder = (order) => {
    const items = (order.items || order.order_items || []).map(it => ({
      product_id: it.product_id,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      unit: it.unit,
      cutting_instructions: it.cutting_instructions || ''
    }));
    setCart(items);
    setIsCartOpen(true);
    showToast('Previous order items loaded into cart!', 'success');
  };

  const totalCartCount = cart.reduce((sum, item) => sum + (item.quantity > 0 ? 1 : 0), 0);

  return (
    <div className="mobile-app-shell">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full shadow-xl text-xs font-bold flex items-center space-x-2 border fade-in whitespace-nowrap ${
            toast.type === 'error'
              ? 'bg-red-800 text-white border-red-900'
              : 'bg-[#1b4332] text-white border-[#2d6a4f]'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-[#a7f3d0]" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        apartment={apartment}
        onOpenApartmentModal={() => setIsAptModalOpen(true)}
        lang={lang}
        setLang={setLang}
        customer={customer}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main View Area */}
      <main className="flex-1 content-padding-bottom">
        {activeTab === 'store' && (
          <StoreHome
            products={products}
            cart={cart}
            onAddToCart={handleAddToCart}
            onOpenMilkSub={() => setActiveTab('milk')}
            lang={lang}
          />
        )}

        {activeTab === 'milk' && (
          <MilkSubTab
            customer={customer}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            apartment={apartment}
            showToast={showToast}
            lang={lang}
            onSubscriptionCreated={() => setActiveTab('orders')}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersView
            customer={customer}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onRepeatOrder={handleRepeatOrder}
            showToast={showToast}
            lang={lang}
          />
        )}
      </main>

      {/* Discreet 24px 'Z' Admin Trigger on side edge */}
      <AdminTrigger />

      {/* Floating Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/95 backdrop-blur-md border-t border-[#e2dfd4] px-3 py-2 z-40 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('store')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            activeTab === 'store' ? 'text-[#1b4332] font-black' : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          <Store className={`w-5 h-5 ${activeTab === 'store' ? 'text-[#2d6a4f]' : ''}`} />
          <span className="text-[10px] mt-0.5">{t.nav.store}</span>
        </button>

        <button
          onClick={() => setActiveTab('milk')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            activeTab === 'milk' ? 'text-[#1b4332] font-black' : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          <Milk className={`w-5 h-5 ${activeTab === 'milk' ? 'text-[#2d6a4f]' : ''}`} />
          <span className="text-[10px] mt-0.5">{t.nav.milk}</span>
        </button>

        {/* Cart Button with Float Badge */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex flex-col items-center py-1 px-3 rounded-xl text-gray-500 relative transition hover:text-[#1b4332]"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#c85a17] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {totalCartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">{t.nav.cart}</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            activeTab === 'orders' ? 'text-[#1b4332] font-black' : 'text-gray-400 hover:text-gray-700'
          }`}
        >
          <ClipboardList className={`w-5 h-5 ${activeTab === 'orders' ? 'text-[#2d6a4f]' : ''}`} />
          <span className="text-[10px] mt-0.5">{t.nav.orders}</span>
        </button>
      </nav>

      {/* Modals */}
      <ApartmentModal
        isOpen={isAptModalOpen}
        onClose={() => setIsAptModalOpen(false)}
        currentApartment={apartment}
        onSave={handleUpdateApartment}
        lang={lang}
      />

      <OtpModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        apartment={apartment}
        lang={lang}
        showToast={showToast}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={() => {}}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={() => setCart([])}
        apartment={apartment}
        customer={customer}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOrderPlacedSuccess={() => setActiveTab('orders')}
        showToast={showToast}
        lang={lang}
      />
    </div>
  );
}
