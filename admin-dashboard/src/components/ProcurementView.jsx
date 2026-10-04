import React, { useState, useEffect } from 'react';
import { Printer, Calendar, IndianRupee, ShoppingCart, RefreshCw } from 'lucide-react';
import { getProcurement } from '../api';
import { translations } from '../translations';

export default function ProcurementView({ lang, showToast }) {
  const t = translations[lang];
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProcurement = async (date) => {
    try {
      setLoading(true);
      const res = await getProcurement(date);
      setData(res);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcurement(selectedDate);
  }, [selectedDate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e2d9] pb-4 no-print">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1b4332] flex items-center space-x-2">
            <span>{t.procurement.title}</span>
          </h2>
          <p className="text-xs md:text-sm text-[#5f665e] mt-0.5">
            {t.procurement.subtitle}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Date Selector */}
          <div className="flex items-center space-x-1.5 bg-white border border-[#d6d2c4] px-3 py-1.5 rounded-xl shadow-sm">
            <Calendar className="w-4 h-4 text-[#2d6a4f]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-bold text-gray-700 focus:outline-none"
            />
          </div>

          {/* Refresh */}
          <button
            onClick={() => fetchProcurement(selectedDate)}
            className="p-2 bg-white border border-[#d6d2c4] rounded-xl text-gray-600 hover:text-gray-900 shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 bg-[#1b4332] hover:bg-[#2d6a4f] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            <span>{t.common.print}</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="bg-white rounded-2xl p-6 border border-[#e2dfd4] shadow-sm procurement-card">
        {/* Printable Header */}
        <div className="border-b-2 border-[#1b4332] pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-[#1b4332] tracking-tight">
                MANA PALLE FRESH • DAWN VILLAGE BUYING LIST
              </h1>
              <p className="text-xs font-semibold text-gray-600 mt-1">
                Hyperlocal Delivery Hub • HMT Nagar, Hyderabad
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold uppercase text-gray-500">Procurement Date</div>
              <div className="text-lg font-extrabold text-[#1b4332]">{selectedDate}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-500">{t.common.loading}</div>
        ) : !data || data.items.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="font-semibold">No orders or subscriptions scheduled for this date.</p>
          </div>
        ) : (
          <div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f7f5ef] border-y border-[#e2dfd4] text-xs font-bold uppercase text-gray-700">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Village Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">{t.procurement.quantityNeeded}</th>
                  <th className="py-3 px-4 text-right">{t.procurement.estBuyingPrice}</th>
                  <th className="py-3 px-4 text-right">{t.procurement.estTotalCost}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeebe2] text-sm">
                {data.items.map((item, idx) => (
                  <tr key={item.product_id} className="hover:bg-[#faf9f6]">
                    <td className="py-3.5 px-4 font-semibold text-gray-400">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-[#1b4332]">{item.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#e8f5e9] text-[#2d6a4f] border border-[#a7f3d0]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-base font-extrabold text-[#1b4332] bg-[#fbf9f5] px-3 py-1 rounded-lg border border-[#e5e2d9]">
                        {item.quantity} {item.unit}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-gray-700 font-medium">
                      ₹{item.estimated_buy_price} /{item.unit}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-[#1b4332]">
                      ₹{item.estimated_buy_cost}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#1b4332] bg-[#f7f5ef] text-base font-extrabold">
                  <td colSpan="5" className="py-4 px-4 text-right text-gray-800">
                    {t.procurement.totalProcurement}:
                  </td>
                  <td className="py-4 px-4 text-right text-xl text-[#1b4332]">
                    ₹{data.total_estimated_cost}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Village Sourcing Sign-off */}
            <div className="mt-8 pt-6 border-t border-dashed border-gray-300 flex justify-between text-xs text-gray-500">
              <div>
                <p className="font-semibold text-gray-700">Procurement Officer Signature: _______________________</p>
                <p className="mt-1">Prepared at dawn from Siddipet, Gajwel & Alair village farmers.</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-700">Cash Disbursed: ₹{data.total_estimated_cost}</p>
                <p className="mt-1">Mana Palle Fresh Operations Desk</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
