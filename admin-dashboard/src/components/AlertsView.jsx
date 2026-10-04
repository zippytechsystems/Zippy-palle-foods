import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, ExternalLink, Sparkles, History, CheckCheck, Users } from 'lucide-react';
import { createAlert, getAlerts } from '../api';
import { translations } from '../translations';

export default function AlertsView({ lang, showToast, apartments = [] }) {
  const t = translations[lang];
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all');
  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [pastAlerts, setPastAlerts] = useState([]);

  const templates = [
    {
      title: "Today's Fresh Rates Update",
      audience: 'all',
      message: "Palle Natural Foods: Today's fresh fish and mutton rates are updated. Order now in the app for doorstep delivery in HMT Nagar."
    },
    {
      title: 'Tender Village Mutton Cut Ready',
      audience: 'all',
      message: 'Fresh village sheep from Alair shepherds arrived at our HMT Nagar hub! Washed in turmeric water, bone-in curry cuts & boneless ready. Deliveries start 7:00 AM.'
    },
    {
      title: 'Fresh Singur Tank Katla Fish Arrived',
      audience: 'all',
      message: 'Sweet freshwater Katla fish harvested this dawn. Cleaned & sliced into fresh steaks with zero ice freezing. Book early before stock finishes!'
    },
    {
      title: 'Morning A2 Milk Delivery Schedule',
      audience: 'milk_subscribers',
      message: 'Raw dawn-milked Desi A2 milk will arrive between 7:00 - 10:00 AM tomorrow. Please keep your clean milk container outside the flat door. Thank you!'
    }
  ];

  const fetchAlerts = async () => {
    try {
      const data = await getAlerts();
      setPastAlerts(data);
    } catch (err) {
      console.warn('Could not fetch alerts history:', err);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleApplyTemplate = (tmpl) => {
    setTitle(tmpl.title);
    setMessage(tmpl.message);
    setAudience(tmpl.audience);
    showToast('Template applied', 'success');
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!title || !message) return;

    try {
      setLoading(true);
      const res = await createAlert({ title, message, audience });
      setGeneratedResult(res);
      showToast(`Generated personalized WhatsApp links for ${res.recipients_count} residents`, 'success');
      fetchAlerts();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#e5e2d9] pb-4">
        <h2 className="text-xl md:text-2xl font-bold text-[#1b4332] flex items-center space-x-2">
          <span>{t.alerts.title}</span>
        </h2>
        <p className="text-xs md:text-sm text-[#5f665e] mt-0.5">
          {t.alerts.subtitle}
        </p>
      </div>

      {/* Quick Templates */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{t.alerts.templateTitle}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {templates.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyTemplate(tmpl)}
              className="text-left p-3.5 bg-white hover:bg-[#fbf9f5] border border-[#e2dfd4] rounded-2xl shadow-sm transition hover:border-[#2d6a4f] group"
            >
              <div className="font-bold text-xs text-[#1b4332] group-hover:text-[#2d6a4f]">
                {tmpl.title}
              </div>
              <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">
                {tmpl.message}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Broadcast Form */}
      <div className="bg-white rounded-2xl p-6 border border-[#e2dfd4] shadow-sm">
        <h3 className="font-bold text-base text-[#1b4332] mb-4 flex items-center space-x-2">
          <Send className="w-4 h-4 text-[#2d6a4f]" />
          <span>{t.alerts.broadcastForm}</span>
        </h3>

        <form onSubmit={handleSendBroadcast} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {t.alerts.subject}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fresh Village Mutton Harvested"
                className="w-full px-3 py-2 border rounded-xl font-bold text-sm text-[#1b4332] focus:ring-2 focus:ring-[#2d6a4f] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                {t.alerts.audience}
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-gray-700 focus:ring-2 focus:ring-[#2d6a4f] focus:outline-none"
              >
                <option value="all">{t.alerts.audienceAll}</option>
                <option value="milk_subscribers">{t.alerts.audienceMilk}</option>
                {apartments.map((a) => (
                  <option key={a} value={a}>Apartment: {a}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              {t.alerts.message}
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the message text. It will be pre-filled into customer WhatsApp chats..."
              className="w-full px-3 py-2 border rounded-xl text-xs text-gray-800 focus:ring-2 focus:ring-[#2d6a4f] focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2.5 bg-[#2d6a4f] hover:bg-[#1b4332] text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Preparing...' : t.alerts.sendBtn}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Generated WhatsApp Links (Ready to Send) */}
      {generatedResult && (
        <div className="bg-[#f0fdf4] rounded-2xl p-6 border border-[#bbf7d0] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#bbf7d0] pb-3">
            <div>
              <h3 className="font-extrabold text-base text-[#14532d] flex items-center space-x-1.5">
                <CheckCheck className="w-5 h-5 text-emerald-600" />
                <span>Ready to Send: {generatedResult.recipients_count} WhatsApp Messages</span>
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                Click any customer's button below to immediately open WhatsApp with their personalized message:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {generatedResult.links?.map((linkItem, idx) => (
              <div
                key={idx}
                className="bg-white p-3 rounded-xl border border-emerald-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="font-bold text-sm text-gray-900">{linkItem.customer_name}</div>
                  <div className="text-xs text-gray-500">
                    {linkItem.apartment_name} • Flat {linkItem.flat_number}
                  </div>
                  <div className="text-xs text-emerald-700 font-medium mt-1">
                    {linkItem.phone}
                  </div>
                </div>

                <a
                  href={linkItem.wa_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center space-x-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs py-2 px-3 rounded-lg shadow-sm transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send WhatsApp</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Broadcast History */}
      <div className="bg-white rounded-2xl p-6 border border-[#e2dfd4] shadow-sm">
        <h3 className="font-bold text-base text-[#1b4332] mb-3 flex items-center space-x-2">
          <History className="w-4 h-4 text-gray-500" />
          <span>{t.alerts.sentHistory}</span>
        </h3>

        {pastAlerts.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No broadcasts logged yet.</p>
        ) : (
          <div className="space-y-3">
            {pastAlerts.map((a) => (
              <div key={a.id} className="p-3.5 bg-[#fbf9f5] rounded-xl border border-[#eeebe2] text-xs">
                <div className="flex justify-between font-bold text-[#1b4332]">
                  <span>{a.title}</span>
                  <span className="text-gray-500 font-medium">Audience: {a.audience} ({a.recipients_count} recipients)</span>
                </div>
                <p className="text-gray-600 mt-1">{a.message}</p>
                <div className="text-[10px] text-gray-400 mt-1.5">
                  Sent: {new Date(a.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
