import React, { useState } from 'react';
import { ShoppingBag, Sparkles, Clock, Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { translations } from '../translations';
import { notifyServiceWaitlist } from '../api';

export default function StoreHome({ 
  products = [], 
  cart = [], 
  onAddToCart, 
  lang = 'en',
  customer,
  settings,
  showToast
}) {
  const t = translations[lang] || translations.en;

  // Operational Settings (from admin or default)
  const cutoffTime = settings?.order_cutoff_time || '21:00';
  const cutoffHour = parseInt(cutoffTime.split(':')[0], 10) || 21;

  // Determine current local time in India (IST)
  const now = new Date();
  const istFormatter = new Intl.DateTimeFormat('en-GB', { 
    timeZone: 'Asia/Kolkata', 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
  const currentISTTime = istFormatter.format(now);
  const isPastCutoff = currentISTTime >= cutoffTime;

  // ---------------------------------------------------------------------------
  // FISH STATE: Varieties (Katla, Rohu), Cuts (whole, cleaned, curry), Weights (0.5kg, 1.0kg)
  // ---------------------------------------------------------------------------
  const [selectedFishVariety, setSelectedFishVariety] = useState('prod-fish-katla');
  const [selectedFishCut, setSelectedFishCut] = useState('curry');
  const [fishWeight, setFishWeight] = useState(1.0); // 1kg default

  const currentFish = products.find(p => p.id === selectedFishVariety) || {
    id: 'prod-fish-katla',
    name: 'Katla Fish',
    price: 260,
    unit: 'kg',
    available: true
  };

  // ---------------------------------------------------------------------------
  // MUTTON STATE: Cuts (curry, boneless, keema, liver, paya), Weights (0.25kg, 0.5kg, 1.0kg)
  // ---------------------------------------------------------------------------
  const [selectedMuttonCut, setSelectedMuttonCut] = useState('curry');
  const [muttonWeight, setMuttonWeight] = useState(1.0); // 1kg default

  const muttonCutMapping = {
    curry: { id: 'prod-mut-curry', label: t.options.muttonCuts.curry, defaultPrice: 850 },
    boneless: { id: 'prod-mut-boneless', label: t.options.muttonCuts.boneless, defaultPrice: 980 },
    keema: { id: 'prod-mut-keema', label: t.options.muttonCuts.keema, defaultPrice: 920 },
    liver: { id: 'prod-mut-liver', label: t.options.muttonCuts.liver, defaultPrice: 900 },
    paya: { id: 'prod-mut-paya', label: t.options.muttonCuts.paya, defaultPrice: 450 }
  };

  const currentMuttonCutConfig = muttonCutMapping[selectedMuttonCut] || muttonCutMapping.curry;
  const currentMutton = products.find(p => p.id === currentMuttonCutConfig.id) || {
    id: currentMuttonCutConfig.id,
    name: `Mutton ${currentMuttonCutConfig.label}`,
    price: currentMuttonCutConfig.defaultPrice,
    unit: 'kg',
    available: true
  };

  // ---------------------------------------------------------------------------
  // COMING SOON MILK WAITLIST STATE
  // ---------------------------------------------------------------------------
  const [notifyPhone, setNotifyPhone] = useState(customer?.phone || '');
  const [notifySubmitted, setNotifySubmitted] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);

  const handleAddFish = () => {
    const cutLabel = t.options.fishCuts[selectedFishCut] || 'Curry Cut';
    onAddToCart({
      product_id: currentFish.id,
      name: currentFish.name,
      price: currentFish.price,
      quantity: fishWeight,
      unit: 'kg',
      cutting_instructions: `${cutLabel} (${fishWeight} kg)`
    });
  };

  const handleAddMutton = () => {
    onAddToCart({
      product_id: currentMutton.id,
      name: currentMutton.name,
      price: currentMutton.price,
      quantity: muttonWeight,
      unit: 'kg',
      cutting_instructions: `${currentMuttonCutConfig.label} (${muttonWeight} kg, washed in turmeric water)`
    });
  };

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = (notifyPhone || '').replace(/[^0-9]/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      if (showToast) showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    try {
      setNotifyLoading(true);
      await notifyServiceWaitlist('milk', cleanPhone);
      setNotifySubmitted(true);
      if (showToast) {
        showToast(
          lang === 'te' 
            ? 'ధన్యవాదాలు! పాలు ప్రారంభమైన వెంటనే వాట్సాప్ సందేశం పంపుతాము.' 
            : "You're on the priority WhatsApp waitlist for Morning Health Milk!",
          'success'
        );
      }
    } catch (err) {
      if (showToast) showToast(err.message || 'Failed to save waitlist', 'error');
    } finally {
      setNotifyLoading(false);
    }
  };

  return (
    <div className="space-y-4 px-4 py-3">
      {/* Scope Banner: Phase 1 Fresh Fish & Mutton */}
      <div className="bg-[#1b4332] text-white p-4 rounded-2xl shadow-sm border border-[#2d6a4f]/60 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-1.5 bg-[#2d6a4f] text-[#a7f3d0] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full mb-1.5 border border-[#52b788]/40">
            <Sparkles className="w-3 h-3" />
            <span>Phase 1 Launch: Fish & Mutton Live</span>
          </div>
          <h2 className="text-base font-extrabold text-white leading-snug">
            {t.slogan}
          </h2>
          <p className="text-[11px] text-[#c9dec8] mt-1 leading-relaxed">
            {t.only3Notice}
          </p>
        </div>
        <div className="absolute right-[-10px] bottom-[-15px] text-6xl opacity-10 select-none">
          🌾
        </div>
      </div>

      {/* Operational Order Cut-off Notice */}
      <div className={`p-3.5 rounded-2xl border flex items-start space-x-2.5 text-xs ${
        isPastCutoff 
          ? 'bg-amber-50/90 border-amber-200 text-amber-900' 
          : 'bg-[#f7f5ef] border-[#e2dfd4] text-[#2d6a4f]'
      }`}>
        <Clock className={`w-4 h-4 shrink-0 mt-0.5 ${isPastCutoff ? 'text-amber-700' : 'text-[#1b4332]'}`} />
        <div className="flex-1 leading-snug">
          {isPastCutoff ? (
            <div>
              <span className="font-extrabold text-amber-950">
                {lang === 'te' ? 'రేపటి ఆర్డర్ల సమయం ముగిసింది (9:00 PM కటాఫ్): ' : 'Orders for tomorrow closed (9:00 PM Cut-off): '}
              </span>
              <span>
                {lang === 'te' 
                  ? 'ఇప్పుడు చేసిన ఆర్డర్లు ఎల్లుండి ఉదయం తాజా చెరువు చేపలు / నాటు మటన్ కోత సమయంలో డెలివరీ చేయబడతాయి.' 
                  : 'Orders placed now will be scheduled for day after tomorrow.'}
              </span>
            </div>
          ) : (
            <div>
              <span className="font-extrabold text-[#1b4332]">
                {lang === 'te' ? 'ఆర్డర్ నియమాలు: ' : 'Order Timing & Slots: '}
              </span>
              <span>
                {lang === 'te'
                  ? 'రేపటి ఆర్డర్లు ఈరోజు రాత్రి 9:00 గంటలకు ముగుస్తాయి. ఉదయం 7-10 & సాయంత్రం 5-8 స్లాట్లు అందుబాటులో ఉన్నాయి.'
                  : 'Orders for tomorrow close at 9:00 PM today. Delivery slots: Morning 7:00 - 10:00 AM & Evening 5:00 - 8:00 PM.'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* CARD 1: FRESH VILLAGE FISH (LIVE) */}
      {/* ==================================================================== */}
      <div className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition ${
        currentFish.available ? 'border-[#e0ddd2]' : 'border-red-200 bg-red-50/20'
      }`}>
        <div className="relative h-44 w-full bg-gray-100">
          <img
            src="/assets/fish.jpg"
            alt="Fresh Village Fish"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 bg-[#1b4332]/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20">
            🐟 Service 1: Fresh Village Fish
          </div>
          <div className="absolute bottom-3 right-3 bg-white/95 text-[#1b4332] text-xs font-black px-3 py-1 rounded-xl shadow-md border border-gray-200">
            ₹{currentFish.price} <span className="text-[10px] font-semibold text-gray-500">/kg</span>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-extrabold text-lg text-[#1b4332]">
              {t.services.fishTitle}
            </h3>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
              {t.services.fishDesc}
            </p>
          </div>

          {/* Fish Variety Picker */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
              Fish Variety:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedFishVariety('prod-fish-katla')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  selectedFishVariety === 'prod-fish-katla'
                    ? 'bg-[#e8f5e9] border-[#2d6a4f] text-[#1b4332] shadow-xs'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                Katla / Bocha (₹260/kg)
              </button>
              <button
                type="button"
                onClick={() => setSelectedFishVariety('prod-fish-rohu')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  selectedFishVariety === 'prod-fish-rohu'
                    ? 'bg-[#e8f5e9] border-[#2d6a4f] text-[#1b4332] shadow-xs'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                Singur Rohu (₹240/kg)
              </button>
            </div>
          </div>

          {/* Cleaning & Cut Options: whole / cleaned / curry cut */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
              {t.common.cutOption}:
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              {[
                { id: 'whole', label: t.options.fishCuts.whole },
                { id: 'cleaned', label: t.options.fishCuts.cleaned },
                { id: 'curry', label: t.options.fishCuts.curry }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedFishCut(opt.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition leading-tight ${
                    selectedFishCut === opt.id
                      ? 'bg-[#1b4332] text-white border-[#1b4332] shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Weight Selector: 500g, 1kg */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
              {t.common.weight}:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: 0.5, label: '500 g' },
                { val: 1.0, label: '1 kg' }
              ].map(w => (
                <button
                  key={w.val}
                  type="button"
                  onClick={() => setFishWeight(w.val)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    fishWeight === w.val
                      ? 'bg-[#e8f5e9] border-[#2d6a4f] text-[#1b4332] shadow-xs font-black'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  {w.label} (₹{(currentFish.price * w.val).toFixed(0)})
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddFish}
            disabled={!currentFish.available}
            className={`w-full py-3 rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center space-x-1.5 ${
              currentFish.available
                ? 'bg-[#2d6a4f] hover:bg-[#1b4332] text-white active:scale-[0.99]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>
              {currentFish.available
                ? `Add ${fishWeight >= 1 ? `${fishWeight} kg` : `${fishWeight * 1000} g`} Fish • ₹${(currentFish.price * fishWeight).toFixed(0)}`
                : t.common.soldOut}
            </span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* CARD 2: FRESH VILLAGE MUTTON (LIVE) */}
      {/* ==================================================================== */}
      <div className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition ${
        currentMutton.available ? 'border-[#e0ddd2]' : 'border-red-200 bg-red-50/20'
      }`}>
        <div className="relative h-44 w-full bg-gray-100">
          <img
            src="/assets/mutton.jpg"
            alt="Fresh Village Mutton"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 bg-[#1b4332]/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20">
            🥩 Service 2: Fresh Village Mutton
          </div>
          <div className="absolute bottom-3 right-3 bg-white/95 text-[#1b4332] text-xs font-black px-3 py-1 rounded-xl shadow-md border border-gray-200">
            ₹{currentMutton.price} <span className="text-[10px] font-semibold text-gray-500">/kg</span>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-extrabold text-lg text-[#1b4332]">
              {t.services.muttonTitle}
            </h3>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
              {t.services.muttonDesc}
            </p>
          </div>

          {/* Mutton Options: curry cut, boneless, keema, liver, paya */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
              Select Mutton Cut:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-center">
              {[
                { cut: 'curry', label: t.options.muttonCuts.curry, price: 850 },
                { cut: 'boneless', label: t.options.muttonCuts.boneless, price: 980 },
                { cut: 'keema', label: t.options.muttonCuts.keema, price: 920 },
                { cut: 'liver', label: t.options.muttonCuts.liver, price: 900 },
                { cut: 'paya', label: t.options.muttonCuts.paya, price: 450 }
              ].map(opt => (
                <button
                  key={opt.cut}
                  type="button"
                  onClick={() => setSelectedMuttonCut(opt.cut)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition leading-tight ${
                    selectedMuttonCut === opt.cut
                      ? 'bg-[#1b4332] text-white border-[#1b4332] shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div>{opt.label}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">₹{opt.price}/kg</div>
                </button>
              ))}
            </div>
          </div>

          {/* Weight Selector: 250g, 500g, 1kg */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
              {t.common.weight}:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { val: 0.25, label: '250 g' },
                { val: 0.5, label: '500 g' },
                { val: 1.0, label: '1 kg' }
              ].map(w => (
                <button
                  key={w.val}
                  type="button"
                  onClick={() => setMuttonWeight(w.val)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                    muttonWeight === w.val
                      ? 'bg-[#e8f5e9] border-[#2d6a4f] text-[#1b4332] shadow-xs font-black'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                >
                  <div>{w.label}</div>
                  <div className="text-[10px] opacity-80">₹{(currentMutton.price * w.val).toFixed(0)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddMutton}
            disabled={!currentMutton.available}
            className={`w-full py-3 rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center space-x-1.5 ${
              currentMutton.available
                ? 'bg-[#2d6a4f] hover:bg-[#1b4332] text-white active:scale-[0.99]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>
              {currentMutton.available
                ? `Add ${muttonWeight >= 1 ? `${muttonWeight} kg` : `${muttonWeight * 1000} g`} Mutton • ₹${(currentMutton.price * muttonWeight).toFixed(0)}`
                : t.common.soldOut}
            </span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* CARD 3: COMING SOON - MORNING HEALTH MILK (GREYED CARD) */}
      {/* ==================================================================== */}
      <div className="bg-[#f8f9fa] rounded-3xl border border-gray-300 shadow-xs overflow-hidden opacity-90 relative">
        <div className="relative h-40 w-full bg-gray-200 grayscale filter">
          <img
            src="/assets/dairy.jpg"
            alt="Morning Health Milk"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-[1px]"></div>
          <div className="absolute top-3 left-3 bg-gray-800/90 text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20 flex items-center space-x-1">
            <span>🥛</span>
            <span>Coming Soon</span>
          </div>
          <div className="absolute bottom-3 right-3 bg-gray-800/90 text-amber-300 text-xs font-extrabold px-3 py-1 rounded-xl shadow-md border border-gray-700">
            Postponed for Phase 1
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-extrabold text-base text-gray-800">
              {t.services.milkComingSoon}
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {t.services.milkComingSoonDesc}
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-700">
              <Bell className="w-3.5 h-3.5 text-[#2d6a4f]" />
              <span>Get WhatsApp notification on launch day:</span>
            </div>

            {notifySubmitted ? (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>You're registered! We will WhatsApp you when milk launches.</span>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="flex gap-2">
                <input
                  type="tel"
                  required
                  placeholder="Enter 10-digit phone"
                  value={notifyPhone}
                  onChange={(e) => setNotifyPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                  className="flex-1 px-3 py-2 border rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
                />
                <button
                  type="submit"
                  disabled={notifyLoading}
                  className="px-4 py-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1"
                >
                  <Bell className="w-3 h-3" />
                  <span>{notifyLoading ? 'Saving...' : 'Notify Me'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
