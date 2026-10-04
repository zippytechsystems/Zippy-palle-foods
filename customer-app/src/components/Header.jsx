import React from 'react';
import { MapPin, Globe, User, LogOut } from 'lucide-react';
import { translations } from '../translations';

export default function Header({ 
  apartment, 
  onOpenApartmentModal, 
  lang, 
  setLang, 
  customer, 
  onOpenLogin,
  onLogout 
}) {
  const t = translations[lang];

  return (
    <header className="bg-[#1b4332] text-white sticky top-0 z-30 shadow-md">
      {/* Brand Top Row */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <img 
            src="/assets/logo.jpg" 
            alt="Palle Natural Foods" 
            className="w-9 h-9 rounded-xl object-cover border border-[#40916c]/60 shadow-xs"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div>
            <h1 className="font-extrabold text-base tracking-tight leading-none text-white">
              {t.brandName}
            </h1>
            <p className="text-[10px] text-[#a7f3d0] font-medium tracking-wide mt-0.5">
              HMT Nagar • Hyperlocal Fresh
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'te' : 'en')}
            className="flex items-center space-x-1 bg-[#2d6a4f] hover:bg-[#3d8564] text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-[#52b788]/40 transition"
          >
            <Globe className="w-3.5 h-3.5 text-[#a7f3d0]" />
            <span>{lang === 'en' ? 'తెలుగు' : 'English'}</span>
          </button>

          {/* User Account / Login */}
          {customer && customer.name ? (
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-[#a7f3d0] hidden sm:inline max-w-[80px] truncate">
                {customer.name}
              </span>
              <button
                onClick={onLogout}
                className="p-1.5 bg-[#2d6a4f] hover:bg-red-900/60 rounded-lg text-gray-200 hover:text-red-200 transition"
                title={t.common.logout}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center space-x-1 bg-[#52b788] hover:bg-[#40916c] text-[#0f291e] font-bold px-2.5 py-1.5 rounded-lg text-xs transition shadow-xs"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t.common.login}</span>
            </button>
          )}
        </div>
      </div>

      {/* Hyperlocal Apartment Bar */}
      <div 
        onClick={onOpenApartmentModal}
        className="bg-[#143427] px-4 py-2 border-t border-[#2d6a4f]/50 flex items-center justify-between cursor-pointer hover:bg-[#194030] transition text-xs"
      >
        <div className="flex items-center space-x-1.5 overflow-hidden">
          <MapPin className="w-3.5 h-3.5 text-[#52b788] flex-shrink-0" />
          <span className="font-semibold text-gray-200 truncate">
            {apartment.name}, Flat {apartment.flat} {apartment.block ? `(${apartment.block})` : ''} • HMT Nagar
          </span>
        </div>
        <span className="text-[11px] font-bold text-[#a7f3d0] bg-[#234e3b] px-2 py-0.5 rounded border border-[#40916c]/40 flex-shrink-0 ml-2">
          {t.common.changeFlat}
        </span>
      </div>
    </header>
  );
}
