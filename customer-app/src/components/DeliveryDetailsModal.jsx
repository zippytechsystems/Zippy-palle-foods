import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, User, Building, Check, AlertCircle, Loader2 } from 'lucide-react';
import { getApartments, saveDeliveryDetails } from '../api';

export default function DeliveryDetailsModal({ 
  isOpen, 
  onClose, 
  currentCustomer, 
  onSaveSuccess, 
  lang = 'en',
  title = null
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [apartmentId, setApartmentId] = useState('');
  const [apartmentName, setApartmentName] = useState('');
  const [blockWing, setBlockWing] = useState('Block A');
  const [flatNumber, setFlatNumber] = useState('');
  const [apartments, setApartments] = useState([]);
  const [loadingApts, setLoadingApts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load active apartments on open
  useEffect(() => {
    if (isOpen) {
      setLoadingApts(true);
      setError('');
      getApartments()
        .then(data => {
          const activeApts = (data || []).filter(a => a.status === 'active');
          setApartments(activeApts);

          // Populate fields from currentCustomer or defaults
          if (currentCustomer) {
            setName(currentCustomer.name || '');
            setPhone(currentCustomer.phone ? currentCustomer.phone.replace(/[^0-9]/g, '').slice(-10) : '');
            setApartmentId(currentCustomer.apartment_id || (activeApts[0]?.id || ''));
            setApartmentName(currentCustomer.apartment_name || currentCustomer.apartment || (activeApts[0]?.name || ''));
            setBlockWing(currentCustomer.block_wing || 'Block A');
            setFlatNumber(currentCustomer.flat_number || '');
          } else if (activeApts.length > 0) {
            if (!apartmentId) {
              setApartmentId(activeApts[0].id);
              setApartmentName(activeApts[0].name);
            }
          }
        })
        .catch(err => {
          console.error('Failed to load apartments:', err);
        })
        .finally(() => setLoadingApts(false));
    }
  }, [isOpen, currentCustomer]);

  if (!isOpen) return null;

  const handleApartmentChange = (e) => {
    const selectedId = Number(e.target.value);
    setApartmentId(selectedId);
    const apt = apartments.find(a => a.id === selectedId);
    if (apt) {
      setApartmentName(apt.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanName = name.trim();
    if (!cleanName) {
      setError(lang === 'te' ? 'దయచేసి మీ పేరు నమోదు చేయండి' : 'Please enter your full name');
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setError(lang === 'te' ? 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి' : 'Please enter a valid 10-digit mobile number');
      return;
    }

    if (!cleanPhone.match(/^[6-9]\d{9}$/)) {
      setError(lang === 'te' ? 'మొబైల్ నంబర్ 6, 7, 8 లేదా 9 తో ప్రారంభం కావాలి' : 'Mobile number must start with 6, 7, 8, or 9');
      return;
    }

    if (!apartmentId) {
      setError(lang === 'te' ? 'దయచేసి మీ అపార్ట్‌మెంట్ ఎంచుకోండి' : 'Please select your apartment');
      return;
    }

    const cleanFlat = flatNumber.trim();
    if (!cleanFlat) {
      setError(lang === 'te' ? 'దయచేసి మీ ఫ్లాట్ నంబర్ నమోదు చేయండి' : 'Please enter your flat number');
      return;
    }

    setSubmitting(true);
    try {
      const saved = await saveDeliveryDetails({
        name: cleanName,
        phone: cleanPhone,
        apartment_id: apartmentId,
        apartment_name: apartmentName,
        block_wing: blockWing.trim() || 'Block A',
        flat_number: cleanFlat
      });

      if (onSaveSuccess) {
        onSaveSuccess(saved);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save delivery details. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e2dfd4] relative my-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#e8f5e9] text-[#1b4332] text-[11px] font-bold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5 text-[#2d6a4f]" />
            <span>HMT Nagar, Hyderabad</span>
          </div>
          <h2 className="text-xl font-extrabold text-[#1b4332]">
            {title || (lang === 'te' ? 'మీ డెలివరీ వివరాలు' : 'Delivery Details')}
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            {lang === 'te' 
              ? 'తాజా ఉత్పత్తులను మీ ఇంటి వద్దకు సులభంగా డెలివరీ చేయడానికి మీ వివరాలు నమోదు చేయండి.' 
              : 'Enter your details once for seamless village-fresh delivery directly to your door.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {lang === 'te' ? 'పూర్తి పేరు' : 'Full Name'} *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Srinivas Rao"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-[#d6d2c4] rounded-2xl text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>
          </div>

          {/* 10-Digit Mobile Phone */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {lang === 'te' ? 'మొబైల్ నంబర్ (10 అంకెలు)' : 'Mobile Number (10 digits)'} *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="98490 12345"
                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-[#d6d2c4] rounded-2xl text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              {lang === 'te' ? 'ఆర్డర్ ధ్రువీకరణ మరియు డెలివరీ అప్‌డేట్స్ కొరకు' : 'For delivery notifications and order confirmation.'}
            </p>
          </div>

          {/* Apartment Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {lang === 'te' ? 'అపార్ట్‌మెంట్' : 'Apartment Community'} *
            </label>
            <div className="relative">
              <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                required
                value={apartmentId}
                onChange={handleApartmentChange}
                disabled={loadingApts}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-[#d6d2c4] rounded-2xl text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a4f] appearance-none"
              >
                {loadingApts ? (
                  <option>Loading communities...</option>
                ) : (
                  apartments.map((apt) => (
                    <option key={apt.id} value={apt.id}>
                      {apt.name} ({apt.area})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Block / Wing & Flat Number Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {lang === 'te' ? 'బ్లాక్ / వింగ్' : 'Block / Wing'}
              </label>
              <input
                type="text"
                value={blockWing}
                onChange={(e) => setBlockWing(e.target.value)}
                placeholder="e.g. Block A"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-[#d6d2c4] rounded-2xl text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {lang === 'te' ? 'ఫ్లాట్ నంబర్' : 'Flat Number'} *
              </label>
              <input
                type="text"
                required
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value)}
                placeholder="e.g. 204"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-[#d6d2c4] rounded-2xl text-xs font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#2d6a4f] hover:bg-[#1b4332] active:scale-[0.99] text-white font-extrabold text-sm rounded-2xl shadow-md transition flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === 'te' ? 'సేవ్ చేయబడుతోంది...' : 'Saving Details...'}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>{lang === 'te' ? 'వివరాలు సేవ్ చేయండి' : 'Save Delivery Details'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
