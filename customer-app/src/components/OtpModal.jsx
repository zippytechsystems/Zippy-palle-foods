import React, { useState, useEffect } from 'react';
import { X, Phone, KeyRound, ShieldCheck, ArrowRight, UserPlus } from 'lucide-react';
import { sendOtp, verifyOtp, registerCustomer, setToken, setCurrentCustomer, getApartments } from '../api';
import { translations } from '../translations';

export default function OtpModal({ isOpen, onClose, onLoginSuccess, apartment, lang, showToast }) {
  const t = translations[lang];
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'onboard'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [devOtp, setDevOtp] = useState('');
  const [activeApts, setActiveApts] = useState([]);

  // Onboarding fields for new user
  const [name, setName] = useState('');
  const [selectedApartmentId, setSelectedApartmentId] = useState(apartment?.id || 1);
  const [selectedApartment, setSelectedApartment] = useState(apartment?.name || 'Shneha Apartment');
  const [block, setBlock] = useState(apartment?.block || 'Block A');
  const [flat, setFlat] = useState(apartment?.flat || '101');
  const [referral, setReferral] = useState('');

  useEffect(() => {
    getApartments().then(data => {
      const active = (data || []).filter(a => a.status === 'active');
      setActiveApts(active);
      if (active.length && !apartment?.name) {
        setSelectedApartmentId(active[0].id);
        setSelectedApartment(active[0].name);
      }
    }).catch(() => {});
  }, [apartment]);

  // 5 minute countdown timer
  useEffect(() => {
    let timer = null;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      showToast('Enter valid 10-digit Indian phone number', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await sendOtp(cleanPhone);
      setStep('otp');
      setCountdown(300);
      if (res.devOtp) {
        setDevOtp(res.devOtp);
        setOtp(res.devOtp); // Auto-fill in dev for smooth review
      }
      showToast(res.message || 'OTP sent successfully', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      showToast('Enter valid 6-digit OTP', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtp(phone, otp);
      setToken(res.token);

      if (res.isRegistered && res.customer && res.customer.name) {
        setCurrentCustomer(res.customer);
        onLoginSuccess(res.customer);
        showToast(`Welcome back, ${res.customer.name}!`, 'success');
        onClose();
      } else {
        // New user: proceed to quick onboarding
        setStep('onboard');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter your name', 'error');
      return;
    }

    try {
      setLoading(true);
      const profile = await registerCustomer({
        name: name.trim(),
        phone: phone.replace(/[^0-9]/g, ''),
        apartment_id: selectedApartmentId,
        apartment_name: selectedApartment,
        block_wing: block,
        flat_number: flat,
        referred_by: referral.trim() || null
      });

      setCurrentCustomer(profile);
      onLoginSuccess(profile);
      showToast(`Welcome to Palle Natural Foods, ${profile.name}!`, 'success');
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl slide-up-modal">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#2d6a4f]" />
            <h3 className="font-extrabold text-lg text-[#1b4332]">
              {step === 'onboard' ? 'Resident Registration' : 'Apartment Resident Sign In'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Phone */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <p className="text-xs text-gray-600 leading-relaxed">
              Enter your mobile number to receive a secure 6-digit login OTP for your HMT Nagar apartment deliveries.
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  autoFocus
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="98490 12345"
                  className="w-full pl-12 pr-3 py-2.5 border rounded-xl text-base font-extrabold text-[#1b4332] tracking-wider focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length < 10}
              className="w-full py-3 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition disabled:opacity-50 flex items-center justify-center space-x-1.5"
            >
              <span>{loading ? 'Sending OTP...' : 'Send Login OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Verify OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">
                OTP sent to <strong>+91 {phone}</strong>
              </span>
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-[#2d6a4f] font-bold hover:underline"
              >
                Change
              </button>
            </div>

            {devOtp && (
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                ⚡ <strong>Dev Provider OTP:</strong> {devOtp} (Auto-filled)
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Enter 6-Digit OTP (Expires in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')})
              </label>
              <input
                type="text"
                maxLength={6}
                required
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="123456"
                className="w-full text-center py-2.5 border rounded-xl text-2xl font-black text-[#1b4332] tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-3 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>
        )}

        {/* STEP 3: Onboarding */}
        {step === 'onboard' && (
          <form onSubmit={handleOnboardSubmit} className="space-y-3">
            <p className="text-xs text-[#2d6a4f] font-semibold bg-[#e8f5e9] p-2.5 rounded-xl border border-[#a7f3d0]">
              ✓ Number verified! Please confirm your name and apartment flat details for your morning deliveries.
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Varma"
                className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-[#1b4332] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Apartment in HMT Nagar
              </label>
              <select
                value={selectedApartmentId}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedApartmentId(id);
                  const found = activeApts.find(a => a.id === id);
                  if (found) setSelectedApartment(found.name);
                }}
                className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
              >
                {activeApts.map((apt) => (
                  <option key={apt.id} value={apt.id}>{apt.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
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
                  className="w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
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

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Referral Code (Optional)
              </label>
              <input
                type="text"
                value={referral}
                onChange={(e) => setReferral(e.target.value.toUpperCase())}
                placeholder="PALLE-XXX"
                className="w-full px-3 py-2 border rounded-xl text-xs font-semibold tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full py-3 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition disabled:opacity-50"
              >
                {loading ? 'Completing...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
