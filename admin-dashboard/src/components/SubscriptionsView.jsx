import React, { useState } from 'react';
import { Milk, Pause, Play, X, Calendar, Edit3, Phone, Building2 } from 'lucide-react';
import { updateSubscription } from '../api';
import { translations } from '../translations';

export default function SubscriptionsView({ subsData, onSubUpdated, showToast, lang }) {
  const t = translations[lang];
  const [updatingId, setUpdatingId] = useState(null);
  const [pauseModalSub, setPauseModalSub] = useState(null);
  const [pauseDate, setPauseDate] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  );
  const [editLitresSub, setEditLitresSub] = useState(null);
  const [litresVal, setLitresVal] = useState('1.0');

  const list = subsData?.subscriptions || [];
  const totalActive = subsData?.total_active || 0;
  const litresDaily = subsData?.litres_per_day || 0;

  const handleAction = async (id, action, extra = {}) => {
    try {
      setUpdatingId(id);
      await updateSubscription(id, { action, ...extra });
      showToast(`Subscription ${id} ${action}d successfully`, 'success');
      if (onSubUpdated) onSubUpdated();
      setPauseModalSub(null);
      setEditLitresSub(null);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e2d9] pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1b4332] flex items-center space-x-2">
            <span>{t.subscriptions.title}</span>
          </h2>
          <p className="text-xs md:text-sm text-[#5f665e] mt-0.5">
            {t.subscriptions.subtitle}
          </p>
        </div>

        {/* Quick Metrics Badges */}
        <div className="flex items-center space-x-3">
          <div className="bg-white border border-[#e0ddd2] px-4 py-2 rounded-xl shadow-sm">
            <div className="text-[10px] uppercase font-bold text-gray-500">{t.subscriptions.activeSubs}</div>
            <div className="text-lg font-extrabold text-[#1b4332]">{totalActive}</div>
          </div>
          <div className="bg-[#e8f5e9] border border-[#a7f3d0] px-4 py-2 rounded-xl shadow-sm">
            <div className="text-[10px] uppercase font-bold text-[#2d6a4f]">{t.subscriptions.litresDaily}</div>
            <div className="text-lg font-extrabold text-[#2d6a4f]">{litresDaily} L</div>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-2xl border border-[#e2dfd4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7f5ef] border-b border-[#e2dfd4] text-xs font-bold uppercase text-gray-700">
                <th className="py-3 px-4">Sub ID</th>
                <th className="py-3 px-4">Customer & Phone</th>
                <th className="py-3 px-4">Apartment & Flat</th>
                <th className="py-3 px-4 text-center">Daily Litres</th>
                <th className="py-3 px-4 text-center">Frequency</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeebe2] text-sm">
              {list.map((sub) => {
                const isPaused = sub.status === 'paused';
                const isCancelled = sub.status === 'cancelled';

                return (
                  <tr key={sub.id} className="hover:bg-[#faf9f6] transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#1b4332]">
                      {sub.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{sub.customer_name}</div>
                      <a
                        href={`tel:${sub.customer_phone}`}
                        className="text-xs text-[#2d6a4f] font-semibold hover:underline flex items-center space-x-1"
                      >
                        <Phone className="w-3 h-3 inline" />
                        <span>{sub.customer_phone}</span>
                      </a>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-800">{sub.apartment_name}</div>
                      <div className="text-xs text-gray-500">
                        {sub.block_wing ? `${sub.block_wing} - ` : ''}Flat {sub.flat_number}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center space-x-1.5 bg-[#fbf9f5] border border-[#e5e2d9] px-2.5 py-1 rounded-lg">
                        <Milk className="w-3.5 h-3.5 text-[#2d6a4f]" />
                        <span className="font-extrabold text-[#1b4332] text-sm">{sub.litres} L</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                        {sub.frequency === 'daily' ? t.subscriptions.daily : t.subscriptions.alternate}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                          sub.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : isPaused
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-red-50 text-red-800 border-red-300'
                        }`}
                      >
                        {sub.status}
                      </span>
                      {isPaused && sub.paused_until && (
                        <div className="text-[10px] text-amber-700 mt-0.5">
                          until {sub.paused_until}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Change litres */}
                        <button
                          onClick={() => {
                            setEditLitresSub(sub);
                            setLitresVal(sub.litres.toString());
                          }}
                          className="p-1.5 text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs"
                          title="Change Litres"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Pause / Resume */}
                        {isPaused ? (
                          <button
                            onClick={() => handleAction(sub.id, 'resume')}
                            disabled={updatingId === sub.id}
                            className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                          >
                            <Play className="w-3 h-3" />
                            <span>{t.subscriptions.resume}</span>
                          </button>
                        ) : !isCancelled ? (
                          <button
                            onClick={() => setPauseModalSub(sub)}
                            disabled={updatingId === sub.id}
                            className="flex items-center space-x-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold"
                          >
                            <Pause className="w-3 h-3" />
                            <span>{t.subscriptions.pause}</span>
                          </button>
                        ) : null}

                        {/* Cancel Sub */}
                        {!isCancelled && (
                          <button
                            onClick={() => {
                              if (confirm('Cancel this milk subscription permanently?')) {
                                handleAction(sub.id, 'cancel');
                              }
                            }}
                            disabled={updatingId === sub.id}
                            className="px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold"
                          >
                            {t.subscriptions.cancelSub}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pause Date Modal */}
      {pauseModalSub && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#e5e2d9]">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-bold text-[#1b4332]">
                Pause Milk Subscription: {pauseModalSub.customer_name}
              </h3>
              <button onClick={() => setPauseModalSub(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Pause delivery until:
                </label>
                <input
                  type="date"
                  value={pauseDate}
                  onChange={(e) => setPauseDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-bold text-gray-800 text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  onClick={() => setPauseModalSub(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={() => handleAction(pauseModalSub.id, 'pause', { until: pauseDate })}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
                >
                  Confirm Pause
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Litres Modal */}
      {editLitresSub && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#e5e2d9]">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-bold text-[#1b4332]">
                Change Daily Litres: {editLitresSub.customer_name}
              </h3>
              <button onClick={() => setEditLitresSub(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  New Quantity (Litres per delivery):
                </label>
                <select
                  value={litresVal}
                  onChange={(e) => setLitresVal(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-bold text-[#1b4332] text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:outline-none"
                >
                  <option value="0.5">0.5 Litre (Small Family)</option>
                  <option value="1.0">1.0 Litre (Standard)</option>
                  <option value="1.5">1.5 Litres</option>
                  <option value="2.0">2.0 Litres (Large Family)</option>
                  <option value="3.0">3.0 Litres</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  onClick={() => setEditLitresSub(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={() => handleAction(editLitresSub.id, null, { litres: parseFloat(litresVal) })}
                  className="px-4 py-1.5 bg-[#2d6a4f] hover:bg-[#1b4332] text-white rounded-lg text-xs font-bold"
                >
                  {t.common.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
