import { 
  TrendingUp, 
  Building2, 
  Milk, 
  BarChart3, 
  Users, 
  Send, 
  ClipboardList,
  LogOut 
} from 'lucide-react';
import { translations } from '../translations';

export default function Sidebar({ activeSection, setActiveSection, lang, ordersCount, subsCount, onLogout, services = [] }) {
  const t = translations[lang];

  const isMilkEnabled = services.length === 0 || services.some(s => s.category === 'milk' && (s.enabled === 1 || s.enabled === true));

  const allMenuItems = [
    {
      id: 'rates',
      label: t.sections.rates,
      icon: TrendingUp,
      badge: null
    },
    {
      id: 'orders',
      label: t.sections.orders,
      icon: Building2,
      badge: ordersCount > 0 ? ordersCount : null
    },
    {
      id: 'procurement',
      label: t.sections.procurement,
      icon: ClipboardList,
      badge: 'Dawn'
    },
    {
      id: 'subscriptions',
      label: t.sections.subscriptions,
      icon: Milk,
      badge: subsCount > 0 ? subsCount : null
    },
    {
      id: 'reports',
      label: t.sections.reports,
      icon: BarChart3,
      badge: null
    },
    {
      id: 'customers',
      label: t.sections.customers,
      icon: Users,
      badge: null
    },
    {
      id: 'alerts',
      label: t.sections.alerts,
      icon: Send,
      badge: null
    }
  ];

  const menuItems = allMenuItems.filter(item => {
    if (item.id === 'subscriptions' && !isMilkEnabled) return false;
    return true;
  });

  return (
    <aside className="w-full md:w-64 bg-[#234e3b] text-white flex-shrink-0 flex md:flex-col justify-between border-r border-[#2d6a4f]/60 overflow-x-auto md:overflow-y-auto no-print">
      <div className="p-2 md:p-4 w-full">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#a7f3d0]/70 px-3 py-2 hidden md:block">
          Core Operations
        </div>
        <nav className="flex md:flex-col space-x-1 md:space-x-0 md:space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition whitespace-nowrap md:whitespace-normal ${
                  isActive
                    ? 'bg-[#1b4332] text-white shadow-sm border border-[#52b788]/40'
                    : 'text-gray-200 hover:bg-[#2d6a4f]/70 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#74c69d]' : 'text-[#a3b899]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive 
                      ? 'bg-[#52b788] text-[#0f291e]' 
                      : 'bg-[#1b4332] text-[#a7f3d0] border border-[#40916c]/40'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button in Sidebar */}
        {onLogout && (
          <div className="pt-2 mt-2 border-t border-[#2d6a4f]/50">
            <button
              onClick={onLogout}
              className="flex items-center space-x-2.5 w-full px-3 py-2.5 rounded-xl text-xs md:text-sm font-semibold text-red-200 hover:bg-red-900/40 hover:text-white transition"
            >
              <LogOut className="w-4 h-4 text-red-300" />
              <span>{t.common?.logout || 'Logout'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Village Sourcing Footer Notice */}
      <div className="hidden md:block p-4 m-3 bg-[#18392b] rounded-xl border border-[#2d6a4f]/50 text-xs">
        <div className="font-bold text-[#a7f3d0] flex items-center space-x-1 mb-1">
          <span>🌿 3 Pure Services Only</span>
        </div>
        <p className="text-[11px] text-gray-300 leading-relaxed">
          Morning Health Milk • Freshwater Village Fish • Grass-fed Village Mutton. Zero vegetables or groceries.
        </p>
      </div>
    </aside>
  );
}
