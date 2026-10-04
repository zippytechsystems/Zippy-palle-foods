import React, { useState } from 'react';
import { 
  X, Trash2, Calendar, Clock, CreditCard, Banknote, ShieldCheck, 
  MapPin, User, Phone, CheckCircle2, ArrowLeft, AlertCircle, Loader2 
} from 'lucide-react';
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
  settings,
  onOpenDeliveryDetails,
  onOrderPlacedSuccess,
  showToast,
  lang
}) {
  const t = translations[lang];

  // Operational cut-off calculation (IST)
  const cutoffTime = settings?.order_cutoff_time || '21:00';
  const istFormatter = new Intl.DateTimeFormat('en-GB', { 
    timeZone: 'Asia/Kolkata', 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
  const currentISTTime = istFormatter.format(new Date());
  const isPastCutoff = currentISTTime >= cutoffTime;

  const getISTDate = (offsetDays = 0) => {
    const d = new Date(Date.now() + offsetDays * 86400000);
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(d);
  };

  const todayStr = getISTDate(0);
  const tomorrowStr = getISTDate(1);
  const dayAfterTomorrowStr = getISTDate(2);

  // Steps: 'cart' -> 'confirm' -> 'success'
  const [step, setStep] = useState('cart');
  const [deliveryDate, setDeliveryDate] = useState(() => (isPastCutoff ? dayAfterTomorrowStr : tomorrowStr));
  const [deliverySlot, setDeliverySlot] = useState('morning');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod'
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [orderError, setOrderError] = useState('');

  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCharge = Number(settings?.delivery_charge || 0);
  const finalPayable = totalAmount + deliveryCharge;
  const minOrder = Number(settings?.min_order_amount || 0);

  const handleProceedToReview = () => {
    setOrderError('');
    if (cart.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    if (minOrder > 0 && totalAmount < minOrder) {
      showToast(`Minimum order amount is ₹${minOrder}. Please add more items.`, 'error');
      return;
    }

    if (deliveryDate === tomorrowStr && isPastCutoff) {
      showToast(`Orders for tomorrow closed at 9:00 PM. Please select ${dayAfterTomorrowStr} or later.`, 'error');
      return;
    }

    if (deliveryDate === todayStr && !settings?.allow_same_day_orders) {
      showToast('Same-day delivery is not permitted. Please order for tomorrow or later.', 'error');
      return;
    }

    if (!apartment || !apartment.name || (apartment.status && apartment.status !== 'active')) {
      showToast('Please select an active delivery apartment in HMT Nagar', 'error');
      return;
    }

    // If device has no saved details, prompt delivery details first
    if (!customer || !customer.phone) {
      onOpenDeliveryDetails();
      return;
    }

    setStep('confirm');
  };

  const handleConfirmOrder = async () => {
    setOrderError('');

    if (!customer || !customer.phone) {
      onOpenDeliveryDetails();
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        customer_id: customer.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        apartment_name: apartment.name,
        block_wing: apartment.block || customer.block_wing || 'Block A',
        flat_number: apartment.flat || customer.flat_number || '101',
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

      const placed = await createOrder(orderPayload);
      setPlacedOrder(placed);
      setStep('success');
      onClearCart();
      if (onOrderPlacedSuccess) {
        onOrderPlacedSuccess(placed);
      }
      showToast(lang === 'te' ? 'ఆర్డర్ విజయవంతంగా నమోదైంది!' : 'Order confirmed successfully!', 'success');
    } catch (err) {
      if (err.blocked || (err.message && err.message.includes('contact Palle Natural Foods'))) {
        setOrderError('Please contact Palle Natural Foods');
      } else {
        setOrderError(err.message || 'Failed to place order. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setStep('cart');
    setPlacedOrder(null);
    setOrderError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 fade-in">
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl slide-up-modal max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e5e2d9] pb-3 mb-3">
          <div className="flex items-center space-x-2">
            {step === 'confirm' && (
              <button
                onClick={() => setStep('cart')}
                className="p-1 rounded-lg text-gray-500 hover:text-gray-800 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h3 className="font-extrabold text-base sm:text-lg text-[#1b4332]">
              {step === 'cart' && `${lang === 'te' ? 'మీ తాజా కార్ట్' : 'Your Fresh Cart'} (${cart.length})`}
              {step === 'confirm' && (lang === 'te' ? 'ఆర్డర్ ధ్రువీకరణ' : 'Order Confirmation')}
              {step === 'success' && (lang === 'te' ? 'ఆర్డర్ ధ్రువీకరించబడింది!' : 'Order Placed!')}
            </h3>
          </div>
          <button onClick={handleResetAndClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: CART ITEMS & PREFERENCES */}
        {step === 'cart' && (
          cart.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <p className="text-sm font-semibold">Your cart is empty.</p>
              <p className="text-xs mt-1">Add milk, fresh pond fish or village mutton to begin.</p>
            </div>
          ) : (
            <div className="overflow-y-auto space-y-4 pr-1 flex-1">
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
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Delivery Destination */}
              <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs">
                <span className="font-bold text-[#1b4332]">Doorstep Delivery: </span>
                <span className="text-gray-700 font-medium">
                  {apartment.name}, Flat {apartment.flat} ({apartment.block}) • HMT Nagar
                </span>
              </div>

              {/* Cut-off Notice Banner */}
              {isPastCutoff && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Next-day cut-off passed: </span>
                    <span>Daily orders close at 9:00 PM. Delivering on next available date ({dayAfterTomorrowStr}).</span>
                  </div>
                </div>
              )}

              {/* Date Selection */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-[#2d6a4f]" />
                  <span>{t.common.deliverySlot} & Date</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isPastCutoff}
                    onClick={() => setDeliveryDate(tomorrowStr)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      isPastCutoff
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                        : deliveryDate === tomorrowStr
                        ? 'bg-[#1b4332] text-white border-[#1b4332]'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    {isPastCutoff ? 'Tomorrow (Closed)' : t.common.preorderTomorrow}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryDate(dayAfterTomorrowStr)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      deliveryDate === dayAfterTomorrowStr
                        ? 'bg-[#1b4332] text-white border-[#1b4332]'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    {dayAfterTomorrowStr} (Next Day)
                  </button>
                </div>

                {/* Slot */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setDeliverySlot('morning')}
                    className={`py-2 px-2 rounded-xl text-[11px] font-semibold border transition ${
                      deliverySlot === 'morning'
                        ? 'bg-[#e8f5e9] text-[#1b4332] border-[#2d6a4f] font-bold'
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}
                  >
                    Morning (7:00 AM - 10:00 AM)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliverySlot('evening')}
                    className={`py-2 px-2 rounded-xl text-[11px] font-semibold border transition ${
                      deliverySlot === 'evening'
                        ? 'bg-[#e8f5e9] text-[#1b4332] border-[#2d6a4f] font-bold'
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}
                  >
                    Evening (5:00 PM - 8:00 PM)
                  </button>
                </div>
              </div>

              {/* Special Delivery Notes */}
              <div>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions (e.g. Leave at door / ring bell once)"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-[#d6d2c4] rounded-2xl text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
                />
              </div>

              {/* Price Summary */}
              <div className="pt-2 border-t border-[#ede9df] space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>{t.common.subtotal}</span>
                  <span className="font-bold text-gray-800">₹{totalAmount.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>{t.common.deliveryFee}</span>
                  <span className="font-bold">
                    {deliveryCharge > 0 ? `₹${deliveryCharge}` : t.common.freeDelivery}
                  </span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-[#1b4332] pt-2 border-t border-gray-100">
                  <span>{t.common.toPay}</span>
                  <span>₹{finalPayable.toFixed(0)}</span>
                </div>
              </div>

              {/* Review & Proceed Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleProceedToReview}
                  className="w-full py-3.5 bg-[#2d6a4f] hover:bg-[#1b4332] text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider shadow-md transition active:scale-[0.99]"
                >
                  {customer && customer.phone ? `Review & Confirm (₹${finalPayable.toFixed(0)})` : 'Enter Details & Checkout'}
                </button>
              </div>
            </div>
          )
        )}

        {/* STEP 2: ORDER CONFIRMATION SUMMARY */}
        {step === 'confirm' && (
          <div className="overflow-y-auto space-y-4 pr-1 flex-1">
            {/* Error Banner */}
            {orderError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{orderError}</span>
              </div>
            )}

            {/* Delivery Recipient Summary */}
            <div className="bg-[#f7f5ef] p-4 rounded-2xl border border-[#e5e2d9] space-y-2 text-xs">
              <div className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                Delivering To:
              </div>
              <div className="flex items-center space-x-2 text-gray-900 font-bold text-sm">
                <User className="w-4 h-4 text-[#2d6a4f]" />
                <span>{customer?.name}</span>
                <span className="text-gray-400 font-normal">•</span>
                <Phone className="w-3.5 h-3.5 text-[#2d6a4f]" />
                <span className="font-medium text-gray-600">+91 {customer?.phone}</span>
              </div>
              <div className="flex items-start space-x-2 text-gray-700">
                <MapPin className="w-4 h-4 text-[#2d6a4f] shrink-0 mt-0.5" />
                <span>
                  <strong>{apartment.name}</strong>, {apartment.block}, Flat <strong>{apartment.flat}</strong>, HMT Nagar, Hyderabad
                </span>
              </div>
            </div>

            {/* Scheduled Slot Summary */}
            <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 text-xs flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-900 block">Scheduled Delivery</span>
                <span className="font-extrabold text-[#1b4332] text-sm">
                  {deliveryDate} ({deliverySlot === 'morning' ? 'Morning (7:00 AM - 10:00 AM)' : 'Evening (5:00 PM - 8:00 PM)'})
                </span>
              </div>
              <Clock className="w-5 h-5 text-[#2d6a4f]" />
            </div>

            {/* Order Items Breakdown */}
            <div>
              <div className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-2">
                Order Items ({cart.length})
              </div>
              <div className="divide-y divide-gray-100 bg-gray-50 p-3 rounded-2xl border border-gray-200 text-xs space-y-2">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center pt-2 first:pt-0">
                    <div>
                      <span className="font-bold text-gray-900">{item.name}</span>
                      <span className="text-gray-500 ml-1.5 font-medium">({item.quantity} {item.unit})</span>
                      {item.cutting_instructions && (
                        <div className="text-[10px] text-gray-400">{item.cutting_instructions}</div>
                      )}
                    </div>
                    <span className="font-extrabold text-[#1b4332]">₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Notice */}
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Banknote className="w-4 h-4 text-amber-800" />
                <div>
                  <span className="font-bold text-amber-900">Payment: Cash on Delivery</span>
                  <div className="text-[10px] text-amber-700">Pay after inspecting your fresh order at your doorstep.</div>
                </div>
              </div>
              <span className="font-extrabold text-sm text-[#1b4332]">₹{finalPayable.toFixed(0)}</span>
            </div>

            {/* Confirm Actions */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleConfirmOrder}
                disabled={submitting}
                className="w-full py-3.5 bg-[#2d6a4f] hover:bg-[#1b4332] active:scale-[0.99] text-white rounded-2xl text-sm font-extrabold uppercase tracking-wider shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Confirm Order (₹{finalPayable.toFixed(0)})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('cart')}
                disabled={submitting}
                className="w-full py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 transition"
              >
                Back to Edit Items
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ORDER SUCCESS CELEBRATION */}
        {step === 'success' && placedOrder && (
          <div className="py-6 px-2 text-center space-y-4">
            <div className="w-16 h-16 bg-[#e8f5e9] text-[#2d6a4f] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-xl font-black text-[#1b4332]">
                {lang === 'te' ? 'ధన్యవాదాలు! మీ ఆర్డర్ నమోదైంది' : 'Thank You! Order Confirmed'}
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                Order ID: <strong className="text-[#2d6a4f] font-mono text-sm">{placedOrder.id}</strong>
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Delivering To:</span>
                <span className="font-bold text-gray-800">{placedOrder.apartment_name}, Flat {placedOrder.flat_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Slot:</span>
                <span className="font-bold text-emerald-800">
                  {placedOrder.delivery_date} ({placedOrder.delivery_slot === 'morning' ? 'Morning (7:00 AM - 10:00 AM)' : 'Evening (5:00 PM - 8:00 PM)'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Due (COD):</span>
                <span className="font-extrabold text-[#1b4332]">₹{placedOrder.total_amount}</span>
              </div>
            </div>

            <div className="text-[11px] text-gray-500 italic">
              Our delivery partner will reach your apartment lobby on the delivery morning.
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-3.5 bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md transition"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
