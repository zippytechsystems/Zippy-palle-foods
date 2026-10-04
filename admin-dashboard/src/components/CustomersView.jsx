import React, { useState, useEffect } from 'react';
import { Search, Phone, Building2, Milk, ChevronRight, X, User, Ban, CheckCircle2, ShieldAlert } from 'lucide-react';
import { getCustomers, getCustomerById, updateCustomer } from '../api';
import { translations } from '../translations';

export default function CustomersView({ lang, showToast }) {
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const fetchCustomers = async (q = '') => {
    try {
      setLoading(true);
      const data = await getCustomers(q);
      setCustomers(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const viewCustomerDetail = async (c) => {
    setSelectedCustomer(c);
    setLoadingDetail(true);
    try {
      const full = await getCustomerById(c.id);
      setCustomerDetail(full);
    } catch (err) {
      showToast('Could not load customer history', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleToggleBlock = async (c) => {
    const newBlockedState = !c.blocked;
    const confirmMsg = newBlockedState
      ? `Are you sure you want to block ${c.name}? They will not be able to place any orders or subscriptions.`
      : `Unblock ${c.name}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setTogglingId(c.id);
      const updated = await updateCustomer(c.id, { blocked: newBlockedState });
      showToast(`${c.name} is now ${newBlockedState ? 'Blocked' : 'Active'}`, newBlockedState ? 'info' : 'success');
      
      // Update local states
      setCustomers(prev => prev.map(item => item.id === c.id ? { ...item, blocked: newBlockedState } : item));
      if (selectedCustomer && selectedCustomer.id === c.id) {
        setSelectedCustomer(prev => ({ ...prev, blocked: newBlockedState }));
      }
      if (customerDetail && customerDetail.id === c.id) {
        setCustomerDetail(prev => ({ ...prev, blocked: newBlockedState }));
      }
    } catch (err) {
      showToast(err.message || 'Failed to update customer status', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e2d9] pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1b4332] flex items-center space-x-2">
            <span>{t.customers.title}</span>
          </h2>
          <p className="text-xs md:text-sm text-[#5f665e] mt-0.5">
            {t.customers.subtitle} ({customers.length} residents registered)
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.customers.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#d6d2c4] rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-[#e2dfd4] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-500">{t.common.loading}</div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <User className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="font-semibold">No customers found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f7f5ef] border-b border-[#e2dfd4] text-xs font-bold uppercase text-gray-700">
                  <th className="py-3 px-4">Resident Name</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Apartment & Flat</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Orders</th>
                  <th className="py-3 px-4 text-center">Milk Sub</th>
                  <th className="py-3 px-4 text-right">Total Spent</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeebe2] text-sm">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#faf9f6] transition">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      <div>{c.name}</div>
                      {c.referral_code && (
                        <div className="text-[10px] text-gray-400 font-mono">{c.referral_code}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <a
                        href={`tel:${c.phone}`}
                        className="text-[#2d6a4f] font-semibold text-xs flex items-center space-x-1 hover:underline"
                      >
                        <Phone className="w-3 h-3 inline" />
                        <span>{c.phone}</span>
                      </a>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-800">{c.apartment_name}</div>
                      <div className="text-xs text-gray-500">
                        {c.block_wing ? `${c.block_wing} - ` : ''}Flat {c.flat_number}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {c.blocked ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-100 text-red-800 border border-red-300">
                          <Ban className="w-2.5 h-2.5" />
                          <span>Blocked</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Active</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-gray-700">
                      {c.orders_count}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {c.has_active_milk ? (
                        <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                          <Milk className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-[#1b4332]">
                      ₹{c.total_spent}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {/* Block / Unblock Button */}
                      <button
                        onClick={() => handleToggleBlock(c)}
                        disabled={togglingId === c.id}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition ${
                          c.blocked
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-red-50 hover:bg-red-100 text-red-800 border-red-300'
                        }`}
                        title={c.blocked ? 'Unblock customer' : 'Block customer'}
                      >
                        {c.blocked ? 'Unblock' : 'Block'}
                      </button>

                      {/* View History Button */}
                      <button
                        onClick={() => viewCustomerDetail(c)}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-[#2d6a4f] hover:text-[#1b4332] bg-[#e8f5e9] hover:bg-[#d8f3dc] px-2.5 py-1 rounded-lg transition"
                      >
                        <span>{t.customers.viewHistory}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#e5e2d9] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-lg text-[#1b4332]">
                    {selectedCustomer.name}
                  </h3>
                  {selectedCustomer.blocked ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 uppercase">
                      Blocked
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedCustomer.apartment_name} • {selectedCustomer.block_wing} Flat {selectedCustomer.flat_number} • {selectedCustomer.phone}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setCustomerDetail(null);
                }}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 flex-1">
              {loadingDetail ? (
                <div className="py-12 text-center text-sm text-gray-500">{t.common.loading}</div>
              ) : customerDetail ? (
                <>
                  {/* Status Toggle Box */}
                  <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-800">Account Ordering Status:</span>
                      <p className="text-[11px] text-gray-500">
                        {customerDetail.blocked 
                          ? 'Customer is BLOCKED. Cannot place orders or start subscriptions.' 
                          : 'Customer is ACTIVE and can place orders.'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleBlock(customerDetail)}
                      disabled={togglingId === customerDetail.id}
                      className={`px-3 py-1.5 rounded-xl font-bold border transition ${
                        customerDetail.blocked
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {customerDetail.blocked ? 'Unblock Account' : 'Block Account'}
                    </button>
                  </div>

                  {/* Active Milk Subscriptions */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                      Milk Subscriptions:
                    </h4>
                    {customerDetail.subscriptions?.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No milk subscription.</p>
                    ) : (
                      <div className="space-y-2">
                        {customerDetail.subscriptions.map((s) => (
                          <div key={s.id} className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs flex justify-between items-center">
                            <div>
                              <span className="font-bold text-[#1b4332]">{s.litres}L Morning Health Milk</span>
                              <span className="text-gray-500 ml-2">({s.frequency})</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                              {s.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Past Orders */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                      Past Delivery Orders ({customerDetail.orders?.length || 0}):
                    </h4>
                    {customerDetail.orders?.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No past orders.</p>
                    ) : (
                      <div className="space-y-2">
                        {customerDetail.orders.map((o) => (
                          <div key={o.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                            <div className="flex justify-between font-bold text-gray-800">
                              <span>{o.id} • {o.delivery_date}</span>
                              <span className="text-[#1b4332]">₹{o.total_amount}</span>
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1">
                              Status: <span className="font-semibold text-gray-700 uppercase">{o.status}</span> • Paid: {o.paid ? 'Yes' : 'No'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            <div className="mt-4 pt-3 border-t flex justify-end">
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setCustomerDetail(null);
                }}
                className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
