import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  RotateCcw, 
  Star, 
  Copy, 
  Milk,
  Pause,
  Play,
  Calendar,
  AlertCircle 
} from 'lucide-react';
import { getMyOrders, getMySubscriptions, pauseSubscription, resumeSubscription, rateOrder } from '../api';
import { translations } from '../translations';

export default function OrdersView({
  customer,
  onOpenDeliveryDetails,
  onRepeatOrder,
  showToast,
  lang
}) {
  const t = translations[lang];
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingSubId, setUpdatingSubId] = useState(null);
  const [ratingOrder, setRatingOrder] = useState(null);
  const [stars, setStars] = useState(5);
  const [feedback, setFeedback] = useState('');

  const fetchData = async () => {
    if (!customer || !customer.phone) return;
    try {
      setLoading(true);
      const [ordersData, subsData] = await Promise.all([
        getMyOrders().catch(() => []),
        getMySubscriptions().catch(() => [])
      ]);
      setOrders(ordersData || []);
      setSubscriptions(subsData || []);
    } catch (err) {
      console.warn('Could not load orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [customer]);

  const handleToggleSub = async (sub) => {
    try {
      setUpdatingSubId(sub.id);
      if (sub.status === 'active') {
        await pauseSubscription(sub.id);
        showToast('Daily milk delivery paused', 'info');
      } else {
        await resumeSubscription(sub.id);
        showToast('Daily milk delivery resumed!', 'success');
      }
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to update subscription', 'error');
    } finally {
      setUpdatingSubId(null);
    }
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    if (!ratingOrder) return;

    try {
      await rateOrder(ratingOrder.id, stars, feedback);
      showToast('Thank you for your feedback! ⭐', 'success');
      setRatingOrder(null);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const copyReferralCode = () => {
    const code = customer?.referral_code || 'PALLE-FRESH50';
    navigator.clipboard.writeText(code);
    showToast(`Referral code ${code} copied! Share with neighbors.`, 'success');
  };

  if (!customer || !customer.phone) {
    return (
      <div className="p-8 text-center space-y-4">
        <Package className="w-16 h-16 mx-auto text-gray-300" />
        <h3 className="font-extrabold text-base text-gray-700">Track Your Orders & Subscriptions</h3>
        <p className="text-xs text-gray-500">
          Enter your delivery details to track active orders, pause/resume daily milk, and view order history.
        </p>
        <button
          onClick={onOpenDeliveryDetails}
          className="px-6 py-2.5 bg-[#2d6a4f] hover:bg-[#1b4332] text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-sm transition"
        >
          Enter Delivery Details
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 py-3">
      {/* Referral Card */}
      <div className="bg-gradient-to-r from-[#2d6a4f] to-[#1b4332] text-white p-4 rounded-3xl shadow-sm border border-[#40916c]/40 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#a7f3d0]">
            Apartment Neighbor Referral
          </div>
          <div className="font-extrabold text-sm mt-0.5">
            {t.common.referralTitle}
          </div>
          <div className="text-[11px] text-gray-200 mt-0.5">
            Code: <span className="font-mono font-bold text-white bg-white/20 px-2 py-0.5 rounded">{customer.referral_code || 'PALLE-FOODS'}</span>
          </div>
        </div>
        <button
          onClick={copyReferralCode}
          className="p-2.5 bg-white text-[#1b4332] rounded-xl hover:bg-gray-100 transition shadow-sm"
          title="Copy Referral Code"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>

      {/* Active Milk Subscriptions Section */}
      {subscriptions.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="font-extrabold text-sm text-[#1b4332] flex items-center space-x-1.5">
            <Milk className="w-4 h-4 text-[#2d6a4f]" />
            <span>Active Milk Subscriptions ({subscriptions.length})</span>
          </h3>

          <div className="space-y-2">
            {subscriptions.map(sub => {
              const isActive = sub.status === 'active';
              return (
                <div key={sub.id} className="bg-white p-4 rounded-3xl border border-[#e2dfd4] shadow-xs flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-[#1b4332]">
                        {sub.litres}L Morning Health Milk
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        isActive 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      Schedule: <strong>{sub.frequency === 'daily' ? 'Daily Morning' : 'Alternate Days'}</strong> (6:00 - 8:00 AM)
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleSub(sub)}
                    disabled={updatingSubId === sub.id}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 border transition ${
                      isActive
                        ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Pause className="w-3 h-3" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" />
                        <span>Resume</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Orders List */}
      <div>
        <h3 className="font-extrabold text-base text-[#1b4332] mb-3">
          {t.nav.orders} ({orders.length})
        </h3>

        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">{t.common.loading}</div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl text-center border border-gray-200 text-gray-400">
            <Package className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-xs font-semibold">No orders yet.</p>
            <p className="text-[11px] mt-1">Order fresh morning milk, Katla fish or tender mutton today.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((ord) => {
              const isDelivered = ord.status === 'delivered';

              return (
                <div key={ord.id} className="bg-white p-4 rounded-3xl border border-[#e2dfd4] shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-[#1b4332]">{ord.id}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          isDelivered 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}>
                          {ord.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1">
                        Delivery: {ord.delivery_date} • {ord.delivery_slot === 'morning' ? 'Morning 6-8 AM' : 'Evening 4-6 PM'}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-sm text-[#1b4332]">₹{ord.total_amount}</div>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase">
                        {ord.paid ? 'Paid' : 'Unpaid (COD)'}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-2.5 bg-[#fbf9f5] rounded-xl border border-[#ede9df] text-xs space-y-1">
                    {(ord.items || ord.order_items || []).map((it, idx) => (
                      <div key={idx} className="flex justify-between text-gray-700">
                        <span>{it.name} ({it.quantity} {it.unit})</span>
                        <span className="font-semibold text-gray-900">₹{it.total_price || (it.price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      onClick={() => onRepeatOrder(ord)}
                      className="flex items-center space-x-1 font-bold text-[#2d6a4f] hover:underline"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t.common.repeatOrder}</span>
                    </button>

                    {isDelivered && (
                      <button
                        onClick={() => setRatingOrder(ord)}
                        className="flex items-center space-x-1 font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 transition"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{ord.rating ? `Rated ${ord.rating}★` : t.common.rateOrder}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rating & Feedback Modal */}
      {ratingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="font-extrabold text-[#1b4332] text-base mb-1">
              Rate Order {ratingOrder.id}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              How was the freshness and cutting quality of your village delivery?
            </p>

            <form onSubmit={handleRateSubmit} className="space-y-4">
              {/* Star Rating Buttons */}
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStars(s)}
                    className="p-1 hover:scale-110 transition"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        s <= stars
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div>
                <textarea
                  rows={2}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Any feedback for the village farmers or delivery runner?"
                  className="w-full px-3 py-2 border rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRatingOrder(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2d6a4f] text-white rounded-xl text-xs font-bold"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
