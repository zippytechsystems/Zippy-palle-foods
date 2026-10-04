import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Percent,
  Calendar,
  Building
} from 'lucide-react';
import { getReports } from '../api';
import { translations } from '../translations';

export default function ReportsView({ lang, showToast }) {
  const t = translations[lang];
  const [period, setPeriod] = useState('daily');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReports = async (selectedPeriod) => {
    try {
      setLoading(true);
      const res = await getReports(selectedPeriod);
      setData(res);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(period);
  }, [period]);

  const handleExportCsv = () => {
    if (!data) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'PALLE NATURAL FOODS - BUSINESS REPORT\n';
    csvContent += `Period: ${period.toUpperCase()}\n`;
    csvContent += `Generated On: ${new Date().toLocaleString()}\n\n`;

    // Summary
    csvContent += 'SUMMARY METRICS\n';
    csvContent += `Total Orders,${data.summary.total_orders}\n`;
    csvContent += `Gross Revenue,Rs. ${data.summary.total_revenue}\n`;
    csvContent += `Net Profit,Rs. ${data.summary.total_profit}\n`;
    csvContent += `Average Order Value,Rs. ${data.summary.average_order_value}\n\n`;

    // Products
    csvContent += 'PRODUCT WISE SALES\n';
    csvContent += 'Product,Category,Quantity Sold,Unit,Revenue (Rs),Profit (Rs)\n';
    data.product_wise.forEach(p => {
      csvContent += `"${p.name}","${p.category}",${p.quantity},"${p.unit}",${p.revenue},${p.profit}\n`;
    });
    csvContent += '\n';

    // Apartments
    csvContent += 'APARTMENT WISE REVENUE\n';
    csvContent += 'Apartment Name,Orders Count,Revenue (Rs)\n';
    data.apartment_wise.forEach(a => {
      csvContent += `"${a.apartment_name}",${a.orders},${a.revenue}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zfresh-sales-report-${period}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report exported as CSV', 'success');
  };

  const summary = data?.summary || { total_orders: 0, total_revenue: 0, total_profit: 0, average_order_value: 0 };
  const chartData = data?.chart_data || [];
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 100);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e2d9] pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1b4332] flex items-center space-x-2">
            <span>{t.reports.title}</span>
          </h2>
          <p className="text-xs md:text-sm text-[#5f665e] mt-0.5">
            Real sales and village procurement margins in HMT Nagar
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Period Toggle */}
          <div className="flex items-center bg-white border border-[#d6d2c4] p-1 rounded-xl shadow-sm text-xs font-bold text-gray-600">
            <button
              onClick={() => setPeriod('daily')}
              className={`px-3 py-1.5 rounded-lg transition ${
                period === 'daily' ? 'bg-[#2d6a4f] text-white shadow-sm' : 'hover:text-gray-900'
              }`}
            >
              {t.reports.daily}
            </button>
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-3 py-1.5 rounded-lg transition ${
                period === 'weekly' ? 'bg-[#2d6a4f] text-white shadow-sm' : 'hover:text-gray-900'
              }`}
            >
              {t.reports.weekly}
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1.5 rounded-lg transition ${
                period === 'monthly' ? 'bg-[#2d6a4f] text-white shadow-sm' : 'hover:text-gray-900'
              }`}
            >
              {t.reports.monthly}
            </button>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            disabled={loading || !data}
            className="flex items-center space-x-1.5 bg-[#1b4332] hover:bg-[#2d6a4f] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{t.common.exportCsv}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-500">{t.common.loading}</div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#e2dfd4] shadow-sm">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-bold uppercase">{t.reports.totalOrders}</span>
                <ShoppingBag className="w-4 h-4 text-[#2d6a4f]" />
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-[#1b4332]">
                {summary.total_orders}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Confirmed & delivered</p>
            </div>

            <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#e2dfd4] shadow-sm">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-bold uppercase">{t.reports.totalRevenue}</span>
                <DollarSign className="w-4 h-4 text-[#2d6a4f]" />
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-[#1b4332]">
                ₹{summary.total_revenue}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Customer billings</p>
            </div>

            <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#e2dfd4] shadow-sm">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-bold uppercase">{t.reports.netProfit}</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-emerald-700">
                ₹{summary.total_profit}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">After farmer purchase cost</p>
            </div>

            <div className="bg-white rounded-2xl p-4 md:p-5 border border-[#e2dfd4] shadow-sm">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-bold uppercase">{t.reports.aov}</span>
                <Percent className="w-4 h-4 text-[#2d6a4f]" />
              </div>
              <div className="text-2xl md:text-3xl font-extrabold text-[#1b4332]">
                ₹{summary.average_order_value}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Average order basket</p>
            </div>
          </div>

          {/* Daily Sales Bar Chart */}
          <div className="bg-white rounded-2xl p-6 border border-[#e2dfd4] shadow-sm">
            <h3 className="font-bold text-base text-[#1b4332] mb-4">
              Revenue & Profit Timeline ({period})
            </h3>
            {chartData.length === 0 ? (
              <p className="text-xs text-gray-500">No chart data available for this range.</p>
            ) : (
              <div className="space-y-3">
                <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-gray-200">
                  {chartData.map((d, i) => {
                    const heightPercent = Math.max((d.revenue / maxRevenue) * 100, 4);
                    const profitPercent = Math.max((d.profit / maxRevenue) * 100, 2);

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                        <div className="w-full max-w-[40px] flex items-end space-x-1 justify-center relative">
                          {/* Revenue Bar */}
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-1/2 bg-[#2d6a4f] rounded-t group-hover:bg-[#1b4332] transition"
                            title={`Revenue: ₹${d.revenue}`}
                          />
                          {/* Profit Bar */}
                          <div
                            style={{ height: `${profitPercent}%` }}
                            className="w-1/2 bg-[#74c69d] rounded-t group-hover:bg-[#52b788] transition"
                            title={`Profit: ₹${d.profit}`}
                          />

                          {/* Hover Tooltip */}
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10">
                            ₹{d.revenue} (₹{d.profit})
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-2 truncate max-w-full">
                          {d.date.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-end space-x-4 text-xs font-semibold">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 bg-[#2d6a4f] rounded-sm" />
                    <span className="text-gray-600">Revenue</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 bg-[#74c69d] rounded-sm" />
                    <span className="text-gray-600">Net Profit</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Breakdown Tables (Product-wise & Apartment-wise) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Performance */}
            <div className="bg-white rounded-2xl p-5 border border-[#e2dfd4] shadow-sm">
              <h3 className="font-bold text-base text-[#1b4332] mb-3">
                {t.reports.productBreakdown}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#eeebe2] text-gray-500 uppercase font-bold">
                      <th className="py-2">Item</th>
                      <th className="py-2 text-center">Volume</th>
                      <th className="py-2 text-right">Revenue</th>
                      <th className="py-2 text-right">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eeebe2]">
                    {(data?.product_wise || []).map((p, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-2.5 font-bold text-gray-800">{p.name}</td>
                        <td className="py-2.5 text-center text-gray-600 font-medium">
                          {p.quantity} {p.unit}
                        </td>
                        <td className="py-2.5 text-right font-bold text-[#1b4332]">₹{p.revenue}</td>
                        <td className="py-2.5 text-right font-bold text-emerald-700">₹{p.profit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Apartment Breakdown */}
            <div className="bg-white rounded-2xl p-5 border border-[#e2dfd4] shadow-sm">
              <h3 className="font-bold text-base text-[#1b4332] mb-3 flex items-center space-x-2">
                <Building className="w-4 h-4 text-[#2d6a4f]" />
                <span>{t.reports.apartmentBreakdown}</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#eeebe2] text-gray-500 uppercase font-bold">
                      <th className="py-2">Apartment</th>
                      <th className="py-2 text-center">Orders</th>
                      <th className="py-2 text-right">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eeebe2]">
                    {(data?.apartment_wise || []).map((a, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-2.5 font-bold text-gray-800">{a.apartment_name}</td>
                        <td className="py-2.5 text-center text-gray-600 font-semibold">{a.orders}</td>
                        <td className="py-2.5 text-right font-extrabold text-[#1b4332]">₹{a.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
