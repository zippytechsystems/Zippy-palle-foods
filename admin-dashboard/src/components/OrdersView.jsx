import React, { useState } from 'react';
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  CreditCard, 
  ChevronDown, 
  ChevronUp, 
  Phone,
  FileText,
  Plus,
  Edit2,
  Trash2,
  Bell,
  MessageSquare,
  Calendar,
  DollarSign,
  Users,
  Check,
  AlertCircle
} from 'lucide-react';
import { updateOrder, createApartment, updateApartment, deleteApartment } from '../api';
import { translations } from '../translations';

export default function OrdersView({ 
  ordersData, 
  onOrderUpdated, 
  showToast, 
  lang,
  apartments = [],
  onApartmentsUpdated 
}) {
  const t = translations[lang];
  const [subTab, setSubTab] = useState('orders'); // 'orders' | 'apartments'
  const [filterApartment, setFilterApartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

  // Apartment Modal State (Add / Edit)
  const [aptModalOpen, setAptModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState(null);
  const [aptForm, setAptForm] = useState({
    name: '',
    area: 'HMT Nagar',
    status: 'active',
    launch_date: '',
    sort_order: 1
  });
  const [savingApt, setSavingApt] = useState(false);

  const byApartment = ordersData?.by_apartment || {};
  // Dynamic list of apartment names for filter dropdown
  const dynamicApartmentsList = apartments.length 
    ? apartments.map(a => a.name) 
    : Object.keys(byApartment);

  const toggleExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await updateOrder(orderId, { status: newStatus });
      showToast(`Order ${orderId} status updated to ${newStatus}`, 'success');
      if (onOrderUpdated) onOrderUpdated();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePaidToggle = async (orderId, currentPaid) => {
    try {
      setUpdatingId(orderId);
      await updateOrder(orderId, { paid: !currentPaid });
      showToast(`Order ${orderId} marked as ${!currentPaid ? 'Paid' : 'Unpaid'}`, 'success');
      if (onOrderUpdated) onOrderUpdated();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Apartment CRUD handlers
  const handleOpenAddApt = () => {
    setEditingApt(null);
    setAptForm({
      name: '',
      area: 'HMT Nagar',
      status: 'active',
      launch_date: '',
      sort_order: apartments.length + 1
    });
    setAptModalOpen(true);
  };

  const handleOpenEditApt = (apt) => {
    setEditingApt(apt);
    setAptForm({
      name: apt.name,
      area: apt.area || 'HMT Nagar',
      status: apt.status || 'active',
      launch_date: apt.launch_date || '',
      sort_order: apt.sort_order || 1
    });
    setAptModalOpen(true);
  };

  const handleSaveApt = async (e) => {
    e.preventDefault();
    if (!aptForm.name.trim()) {
      showToast('Apartment name is required', 'error');
      return;
    }

    try {
      setSavingApt(true);
      if (editingApt) {
        await updateApartment(editingApt.id, aptForm);
        showToast(`Apartment "${aptForm.name}" updated successfully`, 'success');
      } else {
        await createApartment(aptForm);
        showToast(`Apartment "${aptForm.name}" added successfully`, 'success');
      }
      setAptModalOpen(false);
      if (onApartmentsUpdated) onApartmentsUpdated();
      if (onOrderUpdated) onOrderUpdated();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingApt(false);
    }
  };

  const handleDeleteApt = async (id, name) => {
    if (!window.confirm(`Are you sure you want to deactivate apartment "${name}"?`)) return;
    try {
      await deleteApartment(id);
      showToast(`Apartment "${name}" set to inactive`, 'success');
      if (onApartmentsUpdated) onApartmentsUpdated();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Filter apartments for orders view
  const filteredApartments = filterApartment === 'all' 
    ? dynamicApartmentsList 
    : dynamicApartmentsList.filter(a => a === filterApartment);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'out_for_delivery':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  // Launching soon list
  const launchingSoonApts = apartments.filter(a => a.status === 'launching_soon');

  return (
    <div className="space-y-6">
      {/* Top Navigation & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e2d9] pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSubTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition flex items-center space-x-2 ${
              subTab === 'orders'
                ? 'bg-[#1b4332] text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>🏢 Apartment Orders</span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
              {ordersData?.total_orders || 0}
            </span>
          </button>

          <button
            onClick={() => setSubTab('apartments')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition flex items-center space-x-2 ${
              subTab === 'apartments'
                ? 'bg-[#1b4332] text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>🏢 Apartments Directory & Launch Manager</span>
            <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full">
              {apartments.length || 3}
            </span>
          </button>
        </div>

        {subTab === 'apartments' && (
          <button
            onClick={handleOpenAddApt}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Apartment</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ORDERS BY APARTMENT                                                */}
      {/* ========================================================================= */}
      {subTab === 'orders' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs md:text-sm text-[#5f665e]">
                {t.orders.subtitle} • {ordersData?.total_orders || 0} orders (₹{ordersData?.total_revenue || 0})
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Dynamic Apartment Selector */}
              <select
                value={filterApartment}
                onChange={(e) => setFilterApartment(e.target.value)}
                className="px-3 py-1.5 bg-white border border-[#d6d2c4] rounded-xl text-xs font-semibold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
              >
                <option value="all">{t.orders.filterApartment}: {t.common.all}</option>
                {dynamicApartmentsList.map(apt => (
                  <option key={apt} value={apt}>
                    {apt} {byApartment[apt] ? `(${byApartment[apt].length})` : '(0)'}
                  </option>
                ))}
              </select>

              {/* Status Selector */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 bg-white border border-[#d6d2c4] rounded-xl text-xs font-semibold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
              >
                <option value="all">{t.orders.filterStatus}: {t.common.all}</option>
                <option value="placed">{t.orders.placed}</option>
                <option value="confirmed">{t.orders.confirmed}</option>
                <option value="out_for_delivery">{t.orders.out_for_delivery}</option>
                <option value="delivered">{t.orders.delivered}</option>
                <option value="cancelled">{t.orders.cancelled}</option>
              </select>
            </div>
          </div>

          {/* Grouped Orders List */}
          {filteredApartments.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-gray-500 border border-[#e5e2d9]">
              <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="font-semibold">No orders matching the selected filters.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredApartments.map(apt => {
                const allOrders = byApartment[apt] || [];
                const orders = filterStatus === 'all' 
                  ? allOrders 
                  : allOrders.filter(o => o.status === filterStatus);

                if (orders.length === 0) return null;

                return (
                  <div key={apt} className="bg-white rounded-2xl border border-[#e2dfd4] shadow-sm overflow-hidden">
                    {/* Apartment Header Banner */}
                    <div className="bg-[#f7f5ef] px-4 md:px-6 py-3 border-b border-[#e2dfd4] flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <Building2 className="w-5 h-5 text-[#2d6a4f]" />
                        <h3 className="font-bold text-base md:text-lg text-[#1b4332]">
                          {apt}
                        </h3>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-0.5 bg-[#2d6a4f] text-white rounded-full">
                        {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                      </span>
                    </div>

                    {/* Orders List */}
                    <div className="divide-y divide-[#eeebe2]">
                      {orders.map(order => {
                        const isExpanded = expandedOrders[order.id];

                        return (
                          <div key={order.id} className="p-4 md:p-5 hover:bg-[#faf9f6] transition">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                              {/* Order Summary */}
                              <div className="flex items-start space-x-3">
                                <button
                                  onClick={() => toggleExpand(order.id)}
                                  className="mt-0.5 p-1 rounded-lg hover:bg-gray-200 text-gray-500 transition"
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>

                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-extrabold text-[#1b4332] text-sm md:text-base">
                                      {order.id}
                                    </span>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getStatusBadge(order.status)}`}>
                                      {order.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                      {order.delivery_slot === 'morning' ? t.orders.morning : t.orders.evening}
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-xs text-gray-700 font-medium">
                                    <span className="font-bold text-[#2d6a4f]">{order.customer_name}</span>
                                    <span>•</span>
                                    <span>{order.block_wing}, Flat {order.flat_number}</span>
                                    <span>•</span>
                                    <a
                                      href={`tel:${order.customer_phone}`}
                                      className="inline-flex items-center space-x-1 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-lg text-[11px] font-bold transition"
                                      title="Call Resident"
                                    >
                                      <Phone className="w-3 h-3 text-[#2d6a4f]" />
                                      <span>{order.customer_phone}</span>
                                    </a>
                                    <a
                                      href={`https://wa.me/91${(order.customer_phone || '').replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(`Namaste ${order.customer_name}! Palle Natural Foods here regarding your order #${order.id}.`)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center space-x-1 text-green-700 bg-green-50 hover:bg-green-100 border border-green-300 px-2 py-0.5 rounded-lg text-[11px] font-bold transition"
                                      title="WhatsApp Resident"
                                    >
                                      <MessageSquare className="w-3 h-3 text-green-600" />
                                      <span>WhatsApp</span>
                                    </a>
                                  </div>

                                  <div className="text-[11px] text-gray-400 mt-0.5">
                                    Delivery: <strong>{order.delivery_date}</strong>
                                    {order.notes && <span className="italic ml-2 font-medium text-amber-800">Note: "{order.notes}"</span>}
                                  </div>
                                </div>
                              </div>

                              {/* Amount & Quick Actions */}
                              <div className="flex items-center justify-between lg:justify-end space-x-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                                <div className="text-right">
                                  <div className="font-extrabold text-base text-[#1b4332]">
                                    ₹{order.total_amount}
                                  </div>
                                  <button
                                    onClick={() => handlePaidToggle(order.id, order.paid)}
                                    disabled={updatingId === order.id}
                                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border transition ${
                                      order.paid 
                                        ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100' 
                                        : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                                    }`}
                                  >
                                    {order.paid ? t.orders.paid : t.orders.unpaid} ({order.payment_method?.toUpperCase()})
                                  </button>
                                </div>

                                {/* Status Selector */}
                                <select
                                  value={order.status}
                                  disabled={updatingId === order.id}
                                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                  className="text-xs font-bold px-3 py-1.5 border border-[#d6d2c4] rounded-xl bg-white shadow-xs focus:ring-2 focus:ring-[#2d6a4f] focus:outline-none"
                                >
                                  <option value="placed">{t.orders.placed}</option>
                                  <option value="confirmed">{t.orders.confirmed}</option>
                                  <option value="out_for_delivery">{t.orders.out_for_delivery}</option>
                                  <option value="delivered">{t.orders.delivered}</option>
                                  <option value="cancelled">{t.orders.cancelled}</option>
                                </select>
                              </div>
                            </div>

                            {/* Expanded Order Items */}
                            {isExpanded && (
                              <div className="mt-4 pt-3 border-t border-dashed border-[#e2dfd4] pl-10 space-y-2">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                  Fresh Items in this pack:
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {(order.items || []).map((it, idx) => (
                                    <div key={idx} className="bg-white p-2.5 rounded-xl border border-gray-200 text-xs">
                                      <div className="font-bold text-[#1b4332]">{it.name}</div>
                                      <div className="text-[11px] text-gray-500 mt-0.5">
                                        Qty: {it.quantity} {it.unit} @ ₹{it.price} = <strong>₹{it.total_price}</strong>
                                      </div>
                                      {it.cutting_instructions && (
                                        <div className="text-[10px] text-emerald-800 font-medium mt-1 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                                          Cut preference: {it.cutting_instructions}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: APARTMENTS MANAGER (DIRECTORY & LAUNCH MANAGER)                    */}
      {/* ========================================================================= */}
      {subTab === 'apartments' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <div className="text-xs font-bold text-gray-500">Total Communities</div>
              <div className="text-2xl font-black text-[#1b4332] mt-1">{apartments.length}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <div className="text-xs font-bold text-emerald-700">Active Delivery Hubs</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                {apartments.filter(a => a.status === 'active').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <div className="text-xs font-bold text-amber-700">Launching Soon</div>
              <div className="text-2xl font-black text-amber-700 mt-1">
                {launchingSoonApts.length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <div className="text-xs font-bold text-blue-700">Waitlist Leads</div>
              <div className="text-2xl font-black text-blue-700 mt-1">
                {apartments.reduce((acc, a) => acc + (a.notify_count || 0), 0)}
              </div>
            </div>
          </div>

          {/* Master Table of Apartments */}
          <div className="bg-white rounded-2xl border border-[#e2dfd4] shadow-sm overflow-hidden">
            <div className="px-5 py-4 bg-[#f8f6f0] border-b border-[#e2dfd4] flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#1b4332] flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-[#2d6a4f]" />
                <span>Apartments Directory (HMT Nagar, Hyderabad)</span>
              </h3>
              <span className="text-xs text-gray-500">Ordered by Priority / Sort Order</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 uppercase font-bold bg-gray-50/50">
                    <th className="py-3 px-4">Order</th>
                    <th className="py-3 px-4">Apartment Name</th>
                    <th className="py-3 px-4">Area</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Launch Date</th>
                    <th className="py-3 px-4 text-center">Residents</th>
                    <th className="py-3 px-4 text-center">Today Orders</th>
                    <th className="py-3 px-4 text-right">Today Revenue</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {apartments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-gray-400">#{apt.sort_order}</td>
                      <td className="py-3.5 px-4 font-extrabold text-[#1b4332] text-sm">{apt.name}</td>
                      <td className="py-3.5 px-4 text-gray-600 font-medium">{apt.area || 'HMT Nagar'}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                            apt.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : apt.status === 'launching_soon'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-gray-100 text-gray-600 border-gray-300'
                          }`}
                        >
                          {apt.status === 'launching_soon' ? 'Launching Soon' : apt.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 font-medium">
                        {apt.launch_date ? apt.launch_date : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-gray-700">
                        {apt.customers_count || 0}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-[#1b4332]">
                        {apt.todays_orders_count || 0}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-[#1b4332]">
                        ₹{apt.todays_revenue || 0}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleOpenEditApt(apt)}
                            className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 transition"
                            title="Edit Apartment"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {apt.status !== 'inactive' && (
                            <button
                              onClick={() => handleDeleteApt(apt.id, apt.name)}
                              className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition"
                              title="Deactivate Apartment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Launching Soon & Waitlist Outreach Section */}
          <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-base text-gray-900">
                  Launching Soon Communities & "Notify Me" Waitlists
                </h3>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                {launchingSoonApts.length} Pipeline Communities
              </span>
            </div>

            {launchingSoonApts.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">
                No apartments currently set to "launching_soon".
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {launchingSoonApts.map(apt => {
                  const leadPhones = apt.leads || [];
                  const defaultMessage = `Hello! Great news from Palle Natural Foods. We are officially beginning dawn-fresh village milk, freshwater fish and pasture mutton deliveries at ${apt.name} on ${apt.launch_date || 'this upcoming Monday'}. Order fresh before 7:00 AM!`;

                  return (
                    <div key={apt.id} className="bg-amber-50/40 rounded-2xl p-4 border border-amber-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-black text-sm text-[#1b4332]">{apt.name}</h4>
                          <span className="text-[11px] text-gray-500">
                            Launch Target: <strong>{apt.launch_date || 'TBD'}</strong>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center space-x-1">
                            <Bell className="w-3 h-3" />
                            <span>{apt.notify_count || leadPhones.length} Leads</span>
                          </span>
                        </div>
                      </div>

                      {/* Leads List */}
                      <div>
                        <div className="text-[11px] font-bold text-gray-700 uppercase mb-1.5">
                          Interested Residents ({leadPhones.length}):
                        </div>
                        {leadPhones.length === 0 ? (
                          <div className="text-xs text-gray-400 italic">No resident requests submitted yet.</div>
                        ) : (
                          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                            {leadPhones.map((ph, idx) => {
                              const waUrl = `https://wa.me/91${ph.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(defaultMessage)}`;
                              return (
                                <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-xl border border-gray-200 text-xs">
                                  <span className="font-bold text-gray-800">+91 {ph}</span>
                                  <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 bg-[#25D366] text-white rounded-lg hover:bg-emerald-600 transition"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    <span>WhatsApp</span>
                                  </a>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT APARTMENT                                               */}
      {/* ========================================================================= */}
      {aptModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl slide-up-modal">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-extrabold text-base text-[#1b4332] flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-[#2d6a4f]" />
                <span>{editingApt ? 'Edit Apartment' : 'Add New Apartment'}</span>
              </h3>
              <button
                onClick={() => setAptModalOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveApt} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Apartment Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shneha Apartment"
                  value={aptForm.name}
                  onChange={(e) => setAptForm({ ...aptForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-bold text-gray-800 focus:ring-2 focus:ring-[#2d6a4f] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Area / Locality
                </label>
                <input
                  type="text"
                  placeholder="HMT Nagar"
                  value={aptForm.area}
                  onChange={(e) => setAptForm({ ...aptForm, area: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-gray-800 focus:ring-2 focus:ring-[#2d6a4f] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={aptForm.status}
                    onChange={(e) => setAptForm({ ...aptForm, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-gray-800 focus:ring-2 focus:ring-[#2d6a4f] focus:outline-none"
                  >
                    <option value="active">Active Delivery</option>
                    <option value="launching_soon">Launching Soon</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={aptForm.sort_order}
                    onChange={(e) => setAptForm({ ...aptForm, sort_order: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 border rounded-xl text-gray-800 focus:ring-2 focus:ring-[#2d6a4f] focus:outline-none"
                  />
                </div>
              </div>

              {aptForm.status === 'launching_soon' && (
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">
                    Expected Launch Date
                  </label>
                  <input
                    type="date"
                    value={aptForm.launch_date}
                    onChange={(e) => setAptForm({ ...aptForm, launch_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-gray-800 focus:ring-2 focus:ring-[#2d6a4f] focus:outline-none"
                  />
                </div>
              )}

              <div className="pt-3 border-t flex space-x-2">
                <button
                  type="submit"
                  disabled={savingApt}
                  className="flex-1 py-2.5 bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-xl font-bold shadow-md transition disabled:opacity-50"
                >
                  {savingApt ? 'Saving...' : editingApt ? 'Update Apartment' : 'Create Apartment'}
                </button>
                <button
                  type="button"
                  onClick={() => setAptModalOpen(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
