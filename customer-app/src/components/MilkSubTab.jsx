import React, { useState } from 'react';
import { Milk, Calendar, Clock, Check, ShieldCheck, Pause, Play, XCircle } from 'lucide-react';
import { createSubscription } from '../api';
import { translations } from '../translations';

export default function MilkSubTab({
  customer,
  onOpenLogin,
  apartment,
  showToast,
  lang,
  onSubscriptionCreated
}) {
  const t = translations[lang];
  const [litres, setLitres] = useState('1.0');
  const [frequency, setFrequency] = useState('daily'); // 'daily' | 'alternate'
  const [submitting, setSubmitting] = useState(false);

  const handleStartSub = async (e) => {
    e.preventDefault();

    if (!customer || !customer.id) {
      showToast('Please sign in to start your milk subscription', 'error');
      onOpenLogin();
      return;
    }

    if (!apartment || !apartment.name || (apartment.status && apartment.status !== 'active')) {
      showToast('Please select an active delivery apartment in HMT Nagar', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await createSubscription({
        customer_id: customer.id,
        litres: parseFloat(litres),
        frequency
      });
      showToast(`Milk subscription started! Delivering to ${apartment.name} Flat ${apartment.flat}`, 'success');
      if (onSubscriptionCreated) onSubscriptionCreated(res);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 px-4 py-3">
      {/* Hero Banner */}
      <div className="bg-[#1b4332] text-white p-5 rounded-3xl shadow-sm border border-[#2d6a4f] relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#2d6a4f] text-[#a7f3d0] border border-[#52b788]/40">
            🥛 Daily Morning Ritual
          </span>
          <h2 className="text-xl font-black mt-2 leading-tight">
            {t.sub.title}
          </h2>
          <p className="text-xs text-gray-200 mt-1 leading-relaxed">
            {t.sub.subtitle}
          </p>

          <div className="mt-3 flex items-center space-x-3 text-xs text-[#a7f3d0] font-semibold">
            <span>✓ A2 Desi Cow & Buffalo</span>
            <span>✓ Zero Water Added</span>
          </div>
        </div>
      </div>

      {/* Subscription Form */}
      <form onSubmit={handleStartSub} className="bg-white p-5 rounded-3xl border border-[#e0ddd2] shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
            {t.sub.litres}:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { val: '0.5', label: '0.5 L' },
              { val: '1.0', label: '1.0 L' },
              { val: '1.5', label: '1.5 L' },
              { val: '2.0', label: '2.0 L' }
            ].map(item => (
              <button
                type="button"
                key={item.val}
                onClick={() => setLitres(item.val)}
                className={`py-2 px-1 rounded-xl text-center text-xs font-bold border transition ${
                  litres === item.val
                    ? 'bg-[#1b4332] text-white border-[#1b4332] shadow-xs'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
            {t.sub.frequency}:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFrequency('daily')}
              className={`p-3 rounded-2xl text-left border transition ${
                frequency === 'daily'
                  ? 'bg-[#e8f5e9] border-[#2d6a4f] text-[#1b4332] shadow-xs'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              <div className="font-extrabold text-xs">{t.sub.daily}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">30 days a month</div>
            </button>

            <button
              type="button"
              onClick={() => setFrequency('alternate')}
              className={`p-3 rounded-2xl text-left border transition ${
                frequency === 'alternate'
                  ? 'bg-[#e8f5e9] border-[#2d6a4f] text-[#1b4332] shadow-xs'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              <div className="font-extrabold text-xs">{t.sub.alternate}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Every 2nd day</div>
            </button>
          </div>
        </div>

        {/* Delivery Address Pill */}
        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs">
          <div className="font-bold text-gray-800">Delivering To:</div>
          <div className="text-gray-600 font-medium">
            {apartment.name}, Flat {apartment.flat} ({apartment.block}) • HMT Nagar
          </div>
        </div>

        {/* Estimated monthly bill */}
        <div className="bg-[#fbf9f5] p-3 rounded-2xl border border-[#ede9df] flex justify-between items-center text-xs">
          <span className="font-medium text-gray-600">Rate (₹90/Litre):</span>
          <span className="font-extrabold text-[#1b4332] text-sm">
            ₹{(parseFloat(litres) * 90).toFixed(0)} per delivery
          </span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-[#2d6a4f] hover:bg-[#1b4332] text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md transition disabled:opacity-50"
        >
          {submitting ? 'Starting Subscription...' : t.sub.startSub}
        </button>

        <p className="text-[11px] text-gray-400 text-center">
          * Pause or cancel anytime before 8:00 PM the previous evening.
        </p>
      </form>
    </div>
  );
}
