import React, { useState } from 'react';
import { Edit2, History, Check, X, ShieldAlert, TrendingUp, Layers, CheckCircle2, Power, Clock, Loader2 } from 'lucide-react';
import { updateRate, getRateHistory, updateAdminService } from '../api';
import { translations } from '../translations';

export default function RatesView({ rates, onRateUpdated, showToast, lang, services = [], onServicesUpdated }) {
  const t = translations[lang];
  const [editingItem, setEditingItem] = useState(null);
  const [historyItem, setHistoryItem] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingService, setUpdatingService] = useState(null);

  const handleToggleService = async (category, currentlyEnabled) => {
    try {
      setUpdatingService(category);
      await updateAdminService(category, !currentlyEnabled);
      showToast(
        `Service "${category.toUpperCase()}" is now ${!currentlyEnabled ? 'LIVE & AVAILABLE' : 'DISABLED / COMING SOON'}`, 
        'success'
      );
      if (onServicesUpdated) onServicesUpdated();
      if (onRateUpdated) onRateUpdated();
    } catch (err) {
      showToast(err.message || 'Failed to update service status', 'error');
    } finally {
      setUpdatingService(null);
    }
  };

  // Edit form state
  const [editPrice, setEditPrice] = useState('');
  const [editBuyPrice, setEditBuyPrice] = useState('');
  const [editAvailable, setEditAvailable] = useState(true);

  const startEdit = (product) => {
    setEditingItem(product);
    setEditPrice(product.price);
    setEditBuyPrice(product.buy_price);
    setEditAvailable(product.available);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      setSubmitting(true);
      const updated = await updateRate(editingItem.id, {
        price: parseFloat(editPrice),
        buy_price: parseFloat(editBuyPrice),
        available: editAvailable
      });
      showToast(`Updated rates for ${updated.name}`, 'success');
      setEditingItem(null);
      if (onRateUpdated) onRateUpdated();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAvailable = async (product) => {
    try {
      const updated = await updateRate(product.id, {
        available: !product.available
      });
      showToast(
        `${product.name} marked as ${updated.available ? 'Available' : 'Sold Out'}`,
        'success'
      );
      if (onRateUpdated) onRateUpdated();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openHistory = async (product) => {
    setHistoryItem(product);
    setLoadingHistory(true);
    try {
      const data = await getRateHistory(product.id);
      setHistoryData(data);
    } catch (err) {
      showToast('Could not load history', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e5e2d9] pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1b4332] flex items-center space-x-2">
            <span>{t.rates.title}</span>
          </h2>
          <p className="text-xs md:text-sm text-[#5f665e] mt-0.5">
            {t.rates.subtitle}
          </p>
        </div>
      </div>

      {/* Services & Feature Flags Control Card */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-[#e2dfd4] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-[#2d6a4f]" />
              <h3 className="font-extrabold text-base md:text-lg text-[#1b4332]">
                Services & Launch Flags (Phase 1)
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Control which categories are live in the customer app. Morning Health Milk is postponed for Phase 1. One-click toggle enables milk instantly without code updates.
            </p>
          </div>
          <div className="flex items-center space-x-1.5 bg-[#f5f3ef] px-3 py-1.5 rounded-xl border border-[#e0ddd2] text-[11px] text-gray-600 font-bold self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5 text-[#2d6a4f]" />
            <span>Next-day order cut-off: 9:00 PM IST</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {[
            {
              category: 'fish',
              title: 'Fresh Village Fish',
              desc: 'Rohu & Katla pond fish • Cleaned / Whole / Curry cut',
              icon: '🐟'
            },
            {
              category: 'mutton',
              title: 'Fresh Village Mutton',
              desc: 'Grass-fed village sheep • Curry, Boneless, Keema, Liver, Paya',
              icon: '🥩'
            },
            {
              category: 'milk',
              title: 'Morning Health Milk',
              desc: 'Raw Desi Cow & Buffalo A2 milk • Postponed (Waitlist Active)',
              icon: '🥛'
            }
          ].map((srv) => {
            const srvData = services.find(s => s.category === srv.category);
            const isEnabled = srvData ? (srvData.enabled === 1 || srvData.enabled === true) : (srv.category !== 'milk');
            const isUpdating = updatingService === srv.category;

            return (
              <div
                key={srv.category}
                className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                  isEnabled 
                    ? 'bg-[#f4f9f4] border-[#a7f3d0] shadow-xs' 
                    : 'bg-[#faf9f6] border-[#e2dfd4] opacity-90'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{srv.icon}</span>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isEnabled 
                          ? 'bg-[#1b4332] text-[#a7f3d0]' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {isEnabled ? 'Live / Active' : 'Postponed'}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-[#1b4332]">{srv.title}</h4>
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {srv.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-600">
                    {isEnabled ? 'Customer ordering open' : 'Coming soon waitlist'}
                  </span>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleToggleService(srv.category, isEnabled)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs ${
                      isEnabled
                        ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                        : 'bg-[#2d6a4f] hover:bg-[#1b4332] text-white'
                    }`}
                  >
                    {isUpdating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Power className="w-3.5 h-3.5" />
                    )}
                    <span>{isEnabled ? 'Turn Off' : 'Enable Service'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Product Rate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rates.map((product) => {
          const margin = (product.price - product.buy_price).toFixed(2);
          const marginPercent = ((margin / product.price) * 100).toFixed(0);

          return (
            <div
              key={product.id}
              className={`bg-white rounded-2xl p-5 border transition shadow-sm hover:shadow-md flex flex-col justify-between ${
                product.available ? 'border-[#e0ddd2]' : 'border-red-200 bg-red-50/20'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#e8f5e9] text-[#2d6a4f] border border-[#a7f3d0]">
                      {product.category}
                    </span>
                    <h3 className="font-bold text-base md:text-lg text-[#1b4332] mt-2">
                      {product.name}
                    </h3>
                  </div>

                  {/* Stock Toggle */}
                  <label className="flex items-center cursor-pointer" title="Toggle Stock">
                    <span className="text-[11px] font-semibold mr-2 text-gray-500">
                      {product.available ? t.common.available : t.common.soldOut}
                    </span>
                    <input
                      type="checkbox"
                      checked={product.available}
                      onChange={() => handleToggleAvailable(product)}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-5 rounded-full transition-colors relative ${
                        product.available ? 'bg-[#2d6a4f]' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-transform ${
                          product.available ? 'left-[22px]' : 'left-[3px]'
                        }`}
                      />
                    </div>
                  </label>
                </div>

                {/* Price Information */}
                <div className="mt-4 grid grid-cols-2 gap-3 bg-[#fbf9f5] p-3 rounded-xl border border-[#ede9df]">
                  <div>
                    <div className="text-[11px] font-medium text-gray-500">{t.rates.sellingPrice}</div>
                    <div className="text-lg font-extrabold text-[#1b4332]">
                      ₹{product.price} <span className="text-xs font-normal text-gray-500">/{product.unit}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium text-gray-500">{t.rates.buyingPrice}</div>
                    <div className="text-lg font-bold text-gray-700">
                      ₹{product.buy_price} <span className="text-xs font-normal text-gray-500">/{product.unit}</span>
                    </div>
                  </div>
                </div>

                {/* Margin metric */}
                <div className="mt-2 flex items-center justify-between text-xs px-1 text-gray-600">
                  <span>{t.rates.margin}:</span>
                  <span className="font-bold text-[#2d6a4f]">
                    +₹{margin}/{product.unit} ({marginPercent}%)
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t border-[#f0ede6] flex items-center justify-between">
                <button
                  onClick={() => openHistory(product)}
                  className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-800 font-medium transition"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>{t.rates.history}</span>
                </button>

                <button
                  onClick={() => startEdit(product)}
                  className="flex items-center space-x-1.5 bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{t.rates.editRate}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Rate Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e5e2d9] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h3 className="font-bold text-lg text-[#1b4332]">
                  {t.rates.editRate}: {editingItem.name}
                </h3>
                <p className="text-xs text-gray-500">Unit: {editingItem.unit}</p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {t.rates.sellingPrice} (₹ per {editingItem.unit})
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-bold text-lg text-[#1b4332] focus:ring-2 focus:ring-[#2d6a4f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {t.rates.buyingPrice} (₹ per {editingItem.unit})
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={editBuyPrice}
                  onChange={(e) => setEditBuyPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-bold text-lg text-gray-700 focus:ring-2 focus:ring-[#2d6a4f] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border">
                <span className="text-sm font-semibold text-gray-700">{t.rates.toggleStock}</span>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editAvailable}
                    onChange={(e) => setEditAvailable(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      editAvailable ? 'bg-[#2d6a4f]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                        editAvailable ? 'left-6' : 'left-1'
                      }`}
                    />
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#2d6a4f] hover:bg-[#1b4332] text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e5e2d9]">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h3 className="font-bold text-lg text-[#1b4332]">
                  {historyItem.name} - Price History
                </h3>
                <p className="text-xs text-gray-500">Historical rate adjustments</p>
              </div>
              <button
                onClick={() => setHistoryItem(null)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingHistory ? (
              <div className="py-8 text-center text-sm text-gray-500">{t.common.loading}</div>
            ) : historyData.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">No past rate adjustments found.</div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {historyData.map((h) => (
                  <div key={h.id} className="p-3 bg-[#fbf9f5] rounded-xl border border-[#eeebe2] text-xs">
                    <div className="flex justify-between font-bold text-[#1b4332]">
                      <span>Customer: ₹{h.old_price} ➔ ₹{h.new_price}</span>
                      <span className="text-gray-500">Buy: ₹{h.old_buy_price} ➔ ₹{h.new_buy_price}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {new Date(h.changed_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 pt-3 border-t flex justify-end">
              <button
                onClick={() => setHistoryItem(null)}
                className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
