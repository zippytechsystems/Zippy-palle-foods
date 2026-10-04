import React, { useState, useEffect } from 'react';
import { X, Building2, Bell, Check, Clock, AlertCircle } from 'lucide-react';
import { getApartments, notifyApartmentLaunch } from '../api';

export default function ApartmentModal({ isOpen, onClose, currentApartment, onSave, lang }) {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApt, setSelectedApt] = useState(null);
  const [block, setBlock] = useState(currentApartment?.block || 'Block A');
  const [flat, setFlat] = useState(currentApartment?.flat || '101');
  
  // Notify Me state for Launching Soon
  const [notifyAptId, setNotifyAptId] = useState(null);
  const [notifyPhone, setNotifyPhone] = useState('');
  const [notifyMsg, setNotifyMsg] = useState('');
  const [notifyLoading, setNotifyLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getApartments()
        .then(data => {
          setApartments(data || []);
          // Find currently selected or default to first active
          const activeApts = (data || []).filter(a => a.status === 'active');
          const current = activeApts.find(a => a.name === currentApartment?.name || a.id === currentApartment?.id) || activeApts[0];
          setSelectedApt(current);
        })
        .catch(err => {
          console.error('Failed to load apartments:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, currentApartment]);

  if (!isOpen) return null;

  const handleSelectActive = (apt) => {
    if (apt.status !== 'active') return;
    setSelectedApt(apt);
  };

  const handleNotifySubmit = async (e, aptId) => {
    e.preventDefault();
    if (!notifyPhone || notifyPhone.replace(/[^0-9]/g, '').length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    setNotifyLoading(true);
    try {
      await notifyApartmentLaunch(aptId, notifyPhone);
      setNotifyMsg('Saved! We will WhatsApp you with special launch offers on delivery day.');
      setTimeout(() => {
        setNotifyAptId(null);
        setNotifyPhone('');
        setNotifyMsg('');
      }, 3000);
    } catch (err) {
      alert(err.message || 'Failed to submit notify request');
    } finally {
      setNotifyLoading(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!selectedApt || selectedApt.status !== 'active') {
      alert('Please select an active delivery apartment');
      return;
    }
    if (!flat.trim()) {
      alert('Flat number is required');
      return;
    }
    onSave({
      id: selectedApt.id,
      name: selectedApt.name,
      block: block.trim() || 'Block A',
      flat: flat.trim()
    });
    onClose();
  };

  const isTelugu = lang === 'te';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl slide-up-modal max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-3">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-[#2d6a4f]" />
            <h3 className="font-extrabold text-lg text-[#1b4332]">
              {isTelugu ? 'మీ అపార్ట్‌మెంట్ ఎంచుకోండి' : 'Select Your Apartment'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-500 mb-3">
          HMT Nagar, Hyderabad • {isTelugu ? 'నేరుగా ఫ్లాట్ డోర్ వద్దకే గ్రామ తాజా డెలివరీ' : 'Direct village-fresh delivery straight to your flat door'}
        </p>

        <form onSubmit={handleSave} className="space-y-4 overflow-y-auto pr-1">
          {/* Apartments List */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              {isTelugu ? 'అపార్ట్‌మెంట్లు (పైలట్ రెసిడెన్సెస్):' : 'Select Apartment (Pilot Residences):'}
            </label>

            {loading ? (
              <div className="p-6 text-center text-xs text-gray-400">Loading apartments...</div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {apartments.map((apt) => {
                  const isActive = apt.status === 'active';
                  const isSelected = selectedApt?.id === apt.id;

                  if (isActive) {
                    return (
                      <div
                        key={apt.id}
                        onClick={() => handleSelectActive(apt)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#e8f5e9] border-[#2d6a4f] shadow-xs'
                            : 'bg-white border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? 'border-[#2d6a4f] bg-[#2d6a4f] text-white'
                                : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-900">{apt.name}</div>
                            <div className="text-[10px] text-gray-500">{apt.area || 'HMT Nagar'} • Active Delivery</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#1b4332]">
                          Active
                        </span>
                      </div>
                    );
                  }

                  // Launching soon
                  return (
                    <div
                      key={apt.id}
                      className="p-3.5 rounded-2xl border border-dashed border-gray-300 bg-gray-50/80 transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-bold text-gray-700">{apt.name}</span>
                        </div>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Launching Soon
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 mb-2">
                        {apt.launch_date
                          ? `Deliveries starting from ${apt.launch_date}`
                          : 'Service expanding to this building shortly.'}
                      </div>

                      {notifyAptId === apt.id ? (
                        <div className="bg-white p-2.5 rounded-xl border border-gray-200 mt-2">
                          {notifyMsg ? (
                            <div className="text-xs text-emerald-700 font-bold flex items-center space-x-1">
                              <Check className="w-4 h-4" />
                              <span>{notifyMsg}</span>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <input
                                type="tel"
                                maxLength="10"
                                placeholder="Enter 10-digit WhatsApp number"
                                value={notifyPhone}
                                onChange={(e) => setNotifyPhone(e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-full text-xs p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                              />
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  disabled={notifyLoading}
                                  onClick={(e) => handleNotifySubmit(e, apt.id)}
                                  className="flex-1 py-1.5 bg-[#1b4332] text-white text-[11px] font-bold rounded-lg hover:bg-emerald-800"
                                >
                                  {notifyLoading ? 'Saving...' : 'Confirm WhatsApp Alert'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setNotifyAptId(null)}
                                  className="px-2 py-1.5 text-gray-400 hover:text-gray-700 text-[11px]"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setNotifyAptId(apt.id);
                            setNotifyMsg('');
                          }}
                          className="flex items-center space-x-1.5 text-[11px] font-bold text-[#2d6a4f] hover:text-[#1b4332] pt-1"
                        >
                          <Bell className="w-3.5 h-3.5" />
                          <span>Notify me on launch day</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Block / Flat Number */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                {isTelugu ? 'బ్లాక్ / వింగ్' : 'Block / Wing'}
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
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                {isTelugu ? 'ఫ్లాట్ నంబర్' : 'Flat Number'}
              </label>
              <input
                type="text"
                required
                value={flat}
                onChange={(e) => setFlat(e.target.value)}
                placeholder="101"
                className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-[#1b4332] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>
          </div>

          {selectedApt && selectedApt.status === 'active' ? (
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center space-x-2 text-xs text-emerald-900">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Delivering to <strong>{selectedApt.name}</strong>, {block}, Flat {flat}
              </span>
            </div>
          ) : (
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center space-x-2 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Please select an active apartment to place orders</span>
            </div>
          )}

          <div className="pt-2 border-t">
            <button
              type="submit"
              disabled={!selectedApt || selectedApt.status !== 'active'}
              className="w-full py-3 bg-[#1b4332] disabled:opacity-50 hover:bg-[#2d6a4f] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition"
            >
              {isTelugu ? 'ఫ్లాట్ చిరునామా నిర్ధారించండి' : 'Confirm Flat Delivery Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
