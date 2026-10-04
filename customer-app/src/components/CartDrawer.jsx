import React, { useState } from 'react';
import { X, Trash2, Calendar, Clock, CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import { createOrder } from '../api';
import { translations } from '../translations';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  apartment,
  customer,
  onOpenLogin,
  onOrderPlacedSuccess,
  showToast,
  lang
}) {
  const t = translations[lang];

  const [deliveryDate, setDeliveryDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [deliverySlot, setDeliverySlot] = useState('morning');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'upi'
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!customer || !customer.id) {
      showToast('Please sign in with your mobile number to checkout', 'error');
      onOpenLogin();
      return;
    }

    if (cart.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    try {
      setSubmitting(true);

      const orderPayload = {
        customer_id: customer.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        apartment_name: apartment.name,
        block_wing: apartment.block || 'Block A',
        flat_number: apartment.flat || '101',
        delivery_date: deliveryDate,
        delivery_slot: deliverySlot,
        items: cart.map(it => ({
          product_id: it.product_id,
          name: it.name,
          quantity: it.quantity,
          unit: it.unit || 'kg',
          price: it.price,
          cutting_instructions: it.cutting_instructions || ''
        })),
        payment_method: paymentMethod,
        notes: notes.trim()
      };

      // Clean Hook for Razorpay Online Gateway
      if (paymentMethod === 'upi_online') {
        /*
        const razorpayOrder = await initRazorpay({ amount: totalAmount * 100 });
        // Handle checkout popup
        */
      }

      const placed = await createOrder(orderPayload);
      showToast(t.common.orderSuccess, 'success');
      onClearCart();
      onOrderPlacedSuccess(placed);
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl slide-up-modal max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-3">
          <h3 className="font-extrabold text-lg text-[#1b4332]">
            Your Fresh Cart ({cart.length})
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-sm font-semibold">Your cart is empty.</p>
            <p className="text-xs mt-1">Add milk, fresh pond fish or village mutton to begin.</p>
          </div>
        ) : (
          <form onSubmit={handleCheckout} className="overflow-y-auto space-y-4 pr-1 flex-1">
            {/* Cart Items List */}
            <div className="space-y-2.5">
              {cart.map((item, idx) => (
                <div key={idx} className="bg-[#fbf9f5] p-3 rounded-2xl border border-[#ede9df] flex justify-between items-start text-xs">
                  <div>
                    <div className="font-extrabold text-sm text-[#1b4332]">{item.name}</div>
                    <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                      {item.cutting_instructions}
                    </div>
                    <div className="text-xs font-bold text-emerald-800 mt-1">
                      ₹{item.price} × {item.quantity} {item.unit} = ₹{(item.price * item.quantity).toFixed(0)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(idx)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Delivery Destination */}
            <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs">
              <span className="font-bold text-[#1b4332]">Doorstep Drop: </span>
              <span className="text-gray-700 font-medium">
                {apartment.name}, Flat {apartment.flat} ({apartment.block}) • HMT Nagar
              </span>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-[#2d6a4f]" />
                <span>{t.common.deliverySlot} & Date</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryDate(new Date().toISOString().split('T')[0])}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    deliveryDate === new Date().toISOString().split('T')[0]
                      ? 'bg-[#1b4332] text-white border-[#1b4332]'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {t.common.deliverToday}
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryDate(new Date(Date.now() + 86400000).toISOString().split('T')[0])}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    deliveryDate !== new Date().toISOString().split('T')[0]
                      ? 'bg-[#1b4332] text-white border-[#1b4332]'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {t.common.preorderTomorrow}
                </button>
              </div>

              {/* Slot */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setDeliverySlot('morning')}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition ${
                    deliverySlot === 'morning'
                      ? 'bg-[#e8f5e9] text-[#1b4332] border-[#2d6a4f] font-bold'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}
                >
                  {t.common.morningSlot}
                </button>
                <button
                  type="button"
                  onClick={() => setDeliverySlot('evening')}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition ${
                    deliverySlot === 'evening'
                      ? 'bg-[#e8f5e9] text-[#1b4332] border-[#2d6a4f] font-bold'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}
                >
                  {t.common.eveningSlot}
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                {t.common.paymentMode}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex items-center justify-center space-x-1.5 p-2 rounded-xl text-xs font-bold border transition ${
                    paymentMethod === 'cod'
                      ? 'bg-[#e8f5e9] border-[#2d6a4f] text-[#1b4332]'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Cash on Delivery</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex items-center justify-center space-x-1.5 p-2 rounded-xl text-xs font-bold border transition ${
                    paymentMethod === 'upi'
                      ? 'bg-[#e8f5e9] border-[#2d6a4f] text-[#1b4332]'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>UPI on Delivery</span>
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special notes (e.g. Ring bell once, leave at door)"
                className="w-full px-3 py-2 border rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            {/* Price Summary */}
            <div className="pt-2 border-t space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>{t.common.subtotal}</span>
                <span className="font-bold text-gray-800">₹{totalAmount.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>{t.common.deliveryFee}</span>
                <span className="font-bold">{t.common.freeDelivery}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#1b4332] pt-2 border-t">
                <span>{t.common.toPay}</span>
                <span>₹{totalAmount.toFixed(0)}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition disabled:opacity-50"
              >
                {submitting ? 'Placing Order...' : t.common.placeOrder}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
