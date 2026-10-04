import React, { useState } from 'react';
import { X, Building2, MapPin, Check } from 'lucide-react';
import { APARTMENTS_LIST, translations } from '../translations';

export default function ApartmentModal({ isOpen, onClose, currentApartment, onSave, lang }) {
  const t = translations[lang];
  const [selectedName, setSelectedName] = useState(currentApartment.name);
  const [block, setBlock] = useState(currentApartment.block || 'Block A');
  const [flat, setFlat] = useState(currentApartment.flat || '101');

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSave({
      name: selectedName,
      block,
      flat
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl slide-up-modal max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-[#2d6a4f]" />
            <h3 className="font-extrabold text-lg text-[#1b4332]">
              Select Your Apartment
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          HMT Nagar, Hyderabad • Hyperlocal direct delivery to flat door
        </p>

        <form onSubmit={handleSave} className="space-y-4 overflow-y-auto pr-1">
          {/* Apartments List */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">
              Choose Apartment (10 Pilot Residences):
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
              {APARTMENTS_LIST.map((apt) => {
                const isSelected = selectedName === apt;
                return (
                  <button
                    type="button"
                    key={apt}
                    onClick={() => setSelectedName(apt)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold text-left transition ${
                      isSelected
                        ? 'bg-[#e8f5e9] border-[#2d6a4f] text-[#1b4332] shadow-xs'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{apt}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#2d6a4f]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Block / Flat Number */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Block / Wing
              </label>
              <input
                type="text"
                required
                value={block}
                onChange={(e) => setBlock(e.target.value)}
                placeholder="Block A"
                className="w-full px-3 py-2 border rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Flat Number
              </label>
              <input
                type="text"
                required
                value={flat}
                onChange={(e) => setFlat(e.target.value)}
                placeholder="204"
                className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-[#1b4332] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <button
              type="submit"
              className="w-full py-3 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition"
            >
              Confirm Flat Delivery Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
