import React from 'react';
import { RefreshCw, Globe, LogOut, ShieldCheck } from 'lucide-react';
import { translations } from '../translations';

export default function Navbar({ lang, setLang, countdown, onRefresh, onLogout, user }) {
  const t = translations[lang];

  return (
    <header className="bg-[#1b4332] text-white px-4 md:px-6 py-3 flex items-center justify-between shadow-md select-none sticky top-0 z-30">
      {/* Brand & Hub details */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-[#2d6a4f] flex items-center justify-center text-xl shadow-inner border border-[#40916c]/40">
          🌾
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-lg md:text-xl tracking-tight text-white">{t.adminHeader || "Palle Natural Foods - Admin"}</h1>
          </div>
          <p className="text-xs text-[#a3b899] font-medium hidden sm:block">
            {t.subTitle} • HMT Nagar
          </p>
        </div>
      </div>

      {/* Controls & User Actions */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Auto Refresh countdown */}
        <div 
          onClick={onRefresh}
          className="flex items-center space-x-1.5 bg-[#143427] hover:bg-[#204a37] px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer border border-[#2d6a4f]/50 transition"
          title="Click to refresh data now"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#52b788] animate-spin" style={{ animationDuration: '8s' }} />
          <span className="hidden md:inline text-gray-300">{t.common.autoRefreshing}</span>
          <span className="text-[#52b788] font-bold">{countdown}{t.common.seconds}</span>
        </div>

        {/* Telugu / English Toggle */}
        <button
          onClick={() => setLang(lang === 'en' ? 'te' : 'en')}
          className="flex items-center space-x-1 bg-[#2d6a4f] hover:bg-[#397d5f] text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-[#52b788]/40 transition"
        >
          <Globe className="w-3.5 h-3.5 text-[#a7f3d0]" />
          <span>{lang === 'en' ? 'తెలుగు' : 'English'}</span>
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center space-x-1 bg-red-950/40 hover:bg-red-900/60 text-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-800/40 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.common.logout}</span>
        </button>
      </div>
    </header>
  );
}
