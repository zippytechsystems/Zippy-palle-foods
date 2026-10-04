import React, { useState } from 'react';
import { Plus, Minus, Check, ShoppingBag, ShieldCheck, Sparkles } from 'lucide-react';
import { translations } from '../translations';

export default function StoreHome({ 
  products, 
  cart, 
  onAddToCart, 
  onOpenMilkSub, 
  lang 
}) {
  const t = translations[lang];

  // Cut Options State for Fish and Mutton
  const [selectedFishVariety, setSelectedFishVariety] = useState('prod-fish-katla');
  const [selectedFishCut, setSelectedFishCut] = useState('steaks');
  const [fishWeight, setFishWeight] = useState(1.0); // 1kg default

  const [selectedMuttonVariety, setSelectedMuttonVariety] = useState('prod-mut-curry');
  const [selectedMuttonCut, setSelectedMuttonCut] = useState('curry');
  const [muttonWeight, setMuttonWeight] = useState(1.0); // 1kg default

  // Helper product lookups
  const milkProd = products.find(p => p.id === 'prod-milk-morning') || {
    id: 'prod-milk-morning',
    name: 'Morning Health Milk',
    price: 90,
    unit: 'Litre',
    available: true
  };

  const currentFish = products.find(p => p.id === selectedFishVariety) || {
    id: 'prod-fish-katla',
    name: 'Katla Fish',
    price: 260,
    unit: 'kg',
    available: true
  };

  const currentMutton = products.find(p => p.id === selectedMuttonVariety) || {
    id: 'prod-mut-curry',
    name: 'Mutton Curry Cut',
    price: 850,
    unit: 'kg',
    available: true
  };

  // Add items with custom cuts
  const handleAddMilk = () => {
    onAddToCart({
      product_id: milkProd.id,
      name: milkProd.name,
      price: milkProd.price,
      quantity: 1,
      unit: milkProd.unit,
      cutting_instructions: 'Glass bottle, unpasteurized raw'
    });
  };

  const handleAddFish = () => {
    const cutName = t.options.fishCuts[selectedFishCut] || 'Cleaned Steaks';
    onAddToCart({
      product_id: currentFish.id,
      name: currentFish.name,
      price: currentFish.price,
      quantity: fishWeight,
      unit: 'kg',
      cutting_instructions: `${cutName} (${fishWeight} kg)`
    });
  };

  const handleAddMutton = () => {
    const cutName = t.options.muttonCuts[selectedMuttonCut] || 'Medium Curry Cut';
    onAddToCart({
      product_id: currentMutton.id,
      name: currentMutton.name,
      price: currentMutton.price,
      quantity: muttonWeight,
      unit: 'kg',
      cutting_instructions: `${cutName} (${muttonWeight} kg, washed in turmeric water)`
    });
  };

  return (
    <div className="space-y-4 px-4 py-3">
      {/* Slogan & Scope Banner */}
      <div className="bg-[#1b4332] text-white p-4 rounded-2xl shadow-sm border border-[#2d6a4f]/60 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-1.5 bg-[#2d6a4f] text-[#a7f3d0] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full mb-1.5 border border-[#52b788]/40">
            <Sparkles className="w-3 h-3" />
            <span>Strictly 3 Village Services Only</span>
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

      {/* ==================================================================== */}
      {/* CARD 1: MORNING HEALTH MILK */}
      {/* ==================================================================== */}
      <div className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition ${
        milkProd.available ? 'border-[#e0ddd2]' : 'border-red-200 bg-red-50/20'
      }`}>
        <div className="relative h-44 w-full bg-gray-100">
          <img
            src="/assets/dairy.jpg"
            alt="Morning Health Milk"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 bg-[#1b4332]/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20">
            🥛 Service 1: Dawn A2 Milk
          </div>
          <div className="absolute bottom-3 right-3 bg-white/95 text-[#1b4332] text-xs font-black px-3 py-1 rounded-xl shadow-md border border-gray-200">
            ₹{milkProd.price} <span className="text-[10px] font-semibold text-gray-500">/Litre</span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-extrabold text-lg text-[#1b4332]">
                {t.services.milkTitle}
              </h3>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                {t.services.milkDesc}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-gray-500 bg-[#fbf9f5] p-2.5 rounded-xl border border-[#ede9df]">
            <span>Delivery: <strong>6:00 - 8:00 AM</strong></span>
            <span className="text-[#2d6a4f] font-bold">Unpasteurized & Pure</span>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={handleAddMilk}
              disabled={!milkProd.available}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center space-x-1 ${
                milkProd.available
                  ? 'bg-[#2d6a4f] hover:bg-[#1b4332] text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{milkProd.available ? t.common.addToCart : t.common.soldOut}</span>
            </button>

            <button
              onClick={onOpenMilkSub}
              className="py-2.5 px-3 bg-[#e8f5e9] hover:bg-[#d8f3dc] text-[#1b4332] border border-[#a7f3d0] rounded-xl text-xs font-extrabold transition shadow-xs flex items-center justify-center space-x-1"
            >
              <span>{t.sub.startSub}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* CARD 2: FRESH VILLAGE FISH */}
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
            🐟 Service 2: Freshwater Pond Fish
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

          {/* Cleaning & Cut Options */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
              {t.common.cutOption}:
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              {[
                { id: 'steaks', label: 'Curry Cut Steaks' },
                { id: 'whole', label: 'Whole Cleaned' },
                { id: 'headOnly', label: 'Steaks + Head' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedFishCut(opt.id)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition leading-tight ${
                    selectedFishCut === opt.id
                      ? 'bg-[#1b4332] text-white border-[#1b4332]'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Weight Selector */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-gray-700">Quantity (kg):</span>
            <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setFishWeight(Math.max(0.5, fishWeight - 0.5))}
                className="w-7 h-7 bg-white rounded-lg flex items-center justify-center font-bold text-gray-700 shadow-xs"
              >
                -
              </button>
              <span className="text-xs font-black text-[#1b4332] px-2">{fishWeight} kg</span>
              <button
                onClick={() => setFishWeight(fishWeight + 0.5)}
                className="w-7 h-7 bg-white rounded-lg flex items-center justify-center font-bold text-gray-700 shadow-xs"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddFish}
            disabled={!currentFish.available}
            className={`w-full py-2.5 rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center space-x-1.5 ${
              currentFish.available
                ? 'bg-[#2d6a4f] hover:bg-[#1b4332] text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>
              {currentFish.available
                ? `Add ${fishWeight} kg Fish • ₹${(currentFish.price * fishWeight).toFixed(0)}`
                : t.common.soldOut}
            </span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* CARD 3: FRESH VILLAGE MUTTON */}
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
            🥩 Service 3: Grass-fed Village Mutton
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

          {/* Mutton Cut Variety */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
              Select Cut Type:
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              {[
                { id: 'prod-mut-curry', cut: 'curry', label: 'Curry Cut', price: 850 },
                { id: 'prod-mut-boneless', cut: 'boneless', label: 'Boneless', price: 980 },
                { id: 'prod-mut-keema', cut: 'keema', label: 'Keema Minced', price: 920 }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSelectedMuttonVariety(opt.id);
                    setSelectedMuttonCut(opt.cut);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition leading-tight ${
                    selectedMuttonVariety === opt.id
                      ? 'bg-[#1b4332] text-white border-[#1b4332]'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-bold">{opt.label}</div>
                  <div className="text-[10px] opacity-80">₹{opt.price}/kg</div>
                </button>
              ))}
            </div>
          </div>

          {/* Weight Selector */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-gray-700">Quantity (kg):</span>
            <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setMuttonWeight(Math.max(0.5, muttonWeight - 0.5))}
                className="w-7 h-7 bg-white rounded-lg flex items-center justify-center font-bold text-gray-700 shadow-xs"
              >
                -
              </button>
              <span className="text-xs font-black text-[#1b4332] px-2">{muttonWeight} kg</span>
              <button
                onClick={() => setMuttonWeight(muttonWeight + 0.5)}
                className="w-7 h-7 bg-white rounded-lg flex items-center justify-center font-bold text-gray-700 shadow-xs"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddMutton}
            disabled={!currentMutton.available}
            className={`w-full py-2.5 rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center space-x-1.5 ${
              currentMutton.available
                ? 'bg-[#2d6a4f] hover:bg-[#1b4332] text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>
              {currentMutton.available
                ? `Add ${muttonWeight} kg Mutton • ₹${(currentMutton.price * muttonWeight).toFixed(0)}`
                : t.common.soldOut}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
