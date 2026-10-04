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
  FileText
} from 'lucide-react';
import { updateOrder } from '../api';
import { translations } from '../translations';

export default function OrdersView({ ordersData, onOrderUpdated, showToast, lang }) {
  const t = translations[lang];
  const [filterApartment, setFilterApartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

  const byApartment = ordersData?.by_apartment || {};
  const apartmentsList = Object.keys(byApartment);

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

  // Filter apartments
  const filteredApartments = filterApartment === 'all' 
    ? apartmentsList 
    : apartmentsList.filter(a => a === filterApartment);

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

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e5e2d9] pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1b4332] flex items-center space-x-2">
            <span>{t.orders.title}</span>
          </h2>
          <p className="text-xs md:text-sm text-[#5f665e] mt-0.5">
            {t.orders.subtitle} • {ordersData?.total_orders || 0} active orders (₹{ordersData?.total_revenue || 0})
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Apartment Selector */}
          <select
            value={filterApartment}
            onChange={(e) => setFilterApartment(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#d6d2c4] rounded-xl text-xs font-semibold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
          >
            <option value="all">{t.orders.filterApartment}: {t.common.all}</option>
            {apartmentsList.map(apt => (
              <option key={apt} value={apt}>{apt} ({byApartment[apt]?.length})</option>
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

      {/* Apartment Groups */}
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

                              <div className="text-xs text-gray-600 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                                <span className="font-bold text-gray-800">Flat: {order.block_wing} - {order.flat_number}</span>
                                <span>•</span>
                                <span className="font-medium text-gray-700">{order.customer_name}</span>
                                <span>•</span>
                                <a 
                                  href={`tel:${order.customer_phone}`} 
                                  className="text-[#2d6a4f] font-semibold flex items-center space-x-0.5 hover:underline"
                                >
                                  <Phone className="w-3 h-3 inline mr-0.5" />
                                  {order.customer_phone}
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Quick Actions & Status */}
                          <div className="flex flex-wrap items-center gap-2 pl-7 lg:pl-0">
                            {/* Paid Badge / Toggle */}
                            <button
                              onClick={() => handlePaidToggle(order.id, order.paid)}
                              disabled={updatingId === order.id}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                                order.paid 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                                  : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
                              }`}
                            >
                              ₹{order.total_amount} ({order.paid ? t.orders.markPaid : t.orders.markUnpaid})
                            </button>

                            {/* Status Change Selector */}
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              disabled={updatingId === order.id}
                              className="px-2.5 py-1 text-xs font-bold bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
                            >
                              <option value="placed">{t.orders.placed}</option>
                              <option value="confirmed">{t.orders.confirmed}</option>
                              <option value="out_for_delivery">{t.orders.out_for_delivery}</option>
                              <option value="delivered">{t.orders.delivered}</option>
                              <option value="cancelled">{t.orders.cancelled}</option>
                            </select>

                            {/* Quick Deliver Button */}
                            {order.status !== 'delivered' && (
                              <button
                                onClick={() => handleStatusChange(order.id, 'delivered')}
                                disabled={updatingId === order.id}
                                className="px-3 py-1 bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-bold rounded-lg shadow-sm transition"
                              >
                                {t.orders.markDelivered}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Order Items Accordion */}
                        {isExpanded && (
                          <div className="mt-3 pl-7 pt-3 border-t border-[#f0ede6] space-y-2">
                            <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Order Items ({order.items?.length || 0}):
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {(order.items || []).map((item, idx) => (
                                <div key={idx} className="bg-[#fbf9f5] p-2.5 rounded-xl border border-[#ede9df] text-xs">
                                  <div className="flex justify-between font-bold text-[#1b4332]">
                                    <span>{item.name}</span>
                                    <span>{item.quantity} {item.unit} • ₹{item.total_price}</span>
                                  </div>
                                  {item.cutting_instructions && (
                                    <div className="text-[11px] text-[#c85a17] font-medium mt-1">
                                      ✂️ Cut instructions: {item.cutting_instructions}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {order.notes && (
                              <div className="text-xs text-gray-500 italic mt-1 bg-amber-50/60 p-2 rounded-lg border border-amber-200">
                                📝 Customer note: {order.notes}
                              </div>
                            )}
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
  );
}
