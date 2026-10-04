// Mana Palle Fresh - Delivery Partner Run-Sheet UI
// Mobile-first run-sheet for HMT Nagar apartment deliveries

window.ManaDeliveryUI = {
  selectedApartmentFilter: "all",

  setApartmentFilter(aptName) {
    this.selectedApartmentFilter = aptName;
    const appContent = document.getElementById("appContent");
    if (appContent) this.render(appContent);
  },

  render(container) {
    const store = window.manaStore;
    const isTe = store.state.lang === "te";
    const orders = store.state.orders;

    // Filter pending/today deliveries
    let activeDeliveries = orders.filter(o => o.status !== "cancelled");
    if (this.selectedApartmentFilter !== "all") {
      activeDeliveries = activeDeliveries.filter(d => d.apartmentName === this.selectedApartmentFilter);
    }

    // Unique apartments present in active deliveries
    const presentApartments = [...new Set(orders.map(o => o.apartmentName))];

    container.innerHTML = `
      <!-- Delivery Partner Header -->
      <div style="background: linear-gradient(135deg, #2c3e50 0%, #1a252f 100%); color:#fff; border-radius:var(--radius-md); padding:14px; margin-bottom:12px; box-shadow:var(--shadow-sm);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.68rem; font-weight:800; color:#1abc9c; text-transform:uppercase; letter-spacing:0.5px;">
            🛵 Partner: Ramu (Active Delivery Runner)
          </span>
          <span style="font-size:0.65rem; background:#34495e; padding:2px 8px; border-radius:999px;">
            HMT Nagar Route
          </span>
        </div>
        <h2 style="font-size:1.15rem; font-weight:800; margin-top:2px;">${store.t("deliveryTitle")}</h2>
        <p style="font-size:0.72rem; opacity:0.85;">${store.t("deliverySubtitle")}</p>
      </div>

      <!-- Route Summary Cards -->
      <div style="display:flex; justify-content:space-around; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-md); padding:10px; margin-bottom:12px;">
        <div style="text-align:center;">
          <div style="font-size:1.15rem; font-weight:800; color:var(--primary);">${activeDeliveries.length}</div>
          <div style="font-size:0.65rem; color:var(--text-muted); font-weight:700;">Drops on Route</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:1.15rem; font-weight:800; color:var(--accent);">
            ₹${activeDeliveries.filter(d => d.paymentMethod === 'cod' && d.paymentStatus !== 'paid').reduce((sum, d) => sum + d.totalAmount, 0)}
          </div>
          <div style="font-size:0.65rem; color:var(--text-muted); font-weight:700;">Cash to Collect</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:1.15rem; font-weight:800; color:#27ae60;">
            ${activeDeliveries.filter(d => d.status === 'delivered').length}
          </div>
          <div style="font-size:0.65rem; color:var(--text-muted); font-weight:700;">Completed</div>
        </div>
      </div>

      <!-- Apartment Filter Pills -->
      <div style="display:flex; overflow-x:auto; gap:6px; padding-bottom:8px; margin-bottom:12px; scrollbar-width:none;">
        <button class="btn-lang ${this.selectedApartmentFilter === 'all' ? 'active-admin-tab' : ''}" style="white-space:nowrap; padding:4px 10px; font-size:0.72rem; font-weight:700;" onclick="window.ManaDeliveryUI.setApartmentFilter('all')">
          All Apartments (${orders.length})
        </button>
        ${presentApartments.map(apt => `
          <button class="btn-lang ${this.selectedApartmentFilter === apt ? 'active-admin-tab' : ''}" style="white-space:nowrap; padding:4px 10px; font-size:0.72rem; font-weight:700;" onclick="window.ManaDeliveryUI.setApartmentFilter('${apt}')">
            🏢 ${apt}
          </button>
        `).join("")}
      </div>

      <!-- Deliveries List -->
      <div style="display:flex; flex-direction:column; gap:10px;">
        ${activeDeliveries.map((d, idx) => {
          const rawPhone = (d.customerPhone || "").replace(/[^0-9]/g, "");
          const waMessage = encodeURIComponent(`Namaste ${d.customerName} garu! Your fresh village order #${d.id} from Mana Palle Fresh is at your flat door (Flat ${d.flatNumber}).`);

          return `
            <div style="background:var(--surface); border:1.5px solid ${d.status === 'delivered' ? '#a9dfbf' : 'var(--border)'}; border-radius:var(--radius-md); padding:12px; display:flex; flex-direction:column; gap:8px; box-shadow:var(--shadow-sm);">
              <!-- Top Row -->
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <span style="font-size:0.68rem; font-weight:800; color:var(--primary); text-transform:uppercase;">
                    DROP #${idx + 1} • ORDER #${d.id}
                  </span>
                  <h4 style="font-size:0.95rem; font-weight:800; color:var(--text-main); margin-top:1px;">
                    🏢 ${d.apartmentName}
                  </h4>
                  <div style="font-size:0.85rem; font-weight:800; color:var(--accent);">
                    Flat ${d.flatNumber} (${d.blockWing || 'Block A'})
                  </div>
                </div>
                <span style="font-size:0.68rem; padding:3px 8px; border-radius:4px; font-weight:800; background:${d.status === 'delivered' ? '#d4efdf' : '#fcf3cf'}; color:${d.status === 'delivered' ? '#196f3d' : '#7d6608'}; border:1px solid ${d.status === 'delivered' ? '#27ae60' : '#f39c12'};">
                  ${d.status.toUpperCase()}
                </span>
              </div>

              <!-- Resident & Items Details -->
              <div style="font-size:0.74rem; color:var(--text-muted); background:var(--surface-alt); padding:8px; border-radius:var(--radius-sm); border:1px solid var(--border);">
                <div style="color:var(--text-main);">👤 Resident: <b>${d.customerName}</b> (📞 ${d.customerPhone})</div>
                <div style="margin-top:2px;">📦 <b>Items:</b> ${d.items.map(it => `${it.productTitle} (${it.quantityText})`).join(", ")}</div>
                ${d.notes ? `<div style="color:#d35400; font-weight:700; margin-top:2px;">📝 Note: "${d.notes}"</div>` : ''}
              </div>

              <!-- Payment Badge -->
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem;">
                <span>Total Bill: <b style="font-size:0.95rem;">₹${d.totalAmount}</b></span>
                ${d.paymentMethod === 'cod' && d.paymentStatus !== 'paid' ? `
                  <span style="color:#c0392b; font-weight:800; background:#f9ebea; padding:3px 8px; border-radius:4px; border:1px solid #e74c3c;">
                    ⚠️ COLLECT CASH: ₹${d.totalAmount}
                  </span>
                ` : `
                  <span style="color:#27ae60; font-weight:800; background:#e8f8f5; padding:3px 8px; border-radius:4px; border:1px solid #2ecc71;">
                    ✓ PAID (${d.paymentMethod.toUpperCase()})
                  </span>
                `}
              </div>

              <!-- Actions Grid: Call, WhatsApp, Mark Delivered -->
              <div style="display:grid; grid-template-columns: 1fr 1fr 1.2fr; gap:6px; margin-top:2px;">
                <a href="tel:${rawPhone}" class="btn-lang" style="justify-content:center; padding:7px 4px; font-size:0.72rem; text-decoration:none; font-weight:700;">
                  📞 Call
                </a>
                <a href="https://wa.me/91${rawPhone}?text=${waMessage}" target="_blank" class="btn-lang" style="justify-content:center; padding:7px 4px; font-size:0.72rem; text-decoration:none; font-weight:700; color:#1e8449;">
                  💬 WhatsApp
                </a>
                ${d.status === 'delivered' ? `
                  <button class="btn-lang" disabled style="justify-content:center; background:#d4efdf; color:#196f3d; font-weight:800; border:none; padding:7px 4px; font-size:0.72rem;">
                    ✓ Delivered
                  </button>
                ` : `
                  <button class="btn-primary" style="justify-content:center; padding:7px 4px; font-size:0.72rem; font-weight:800;" onclick="window.ManaDeliveryUI.markDelivered('${d.id}')">
                    ✅ ${store.t("markDelivered")}
                  </button>
                `}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  },

  markDelivered(orderId) {
    const store = window.manaStore;
    store.updateOrderStatus(orderId, "delivered", "paid");
    window.ManaCustomerUI.showToast("Order marked Delivered! Cash recorded & customer notified.");
    const appContent = document.getElementById("appContent");
    if (appContent) this.render(appContent);
  }
};
