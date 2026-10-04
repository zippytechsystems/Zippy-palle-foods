// Mana Palle Fresh - Admin & Owner Management Hub
// STRICTLY FOR THE 3 SERVICES: 1. Morning Health Milk | 2. Fresh Village Fish | 3. Fresh Village Mutton

window.ManaAdminUI = {
  currentTab: "sourcing", // "sourcing" | "orders" | "subscriptions" | "reports" | "customers" | "broadcast"
  salesPeriod: "daily", // "daily" | "weekly" | "monthly"

  setTab(tab) {
    this.currentTab = tab;
    const appContent = document.getElementById("appContent");
    if (appContent) this.render(appContent);
  },

  setSalesPeriod(period) {
    this.salesPeriod = period;
    const appContent = document.getElementById("appContent");
    if (appContent) this.render(appContent);
  },

  render(container) {
    const store = window.manaStore;
    const isTe = store.state.lang === "te";
    const sheet = store.calculateProcurementSheet();
    const products = store.state.products;
    const orders = store.state.orders;
    const subs = store.state.subscriptions;
    const deliveryBoys = store.getDeliveryPartners();
    const sales = store.getSalesReports();
    const customers = store.getCustomerDirectory();

    container.innerHTML = `
      <!-- Admin Header -->
      <div style="background: linear-gradient(135deg, #1b4d2e 0%, #143621 100%); color: #fff; border-radius: var(--radius-md); padding: 14px; margin-bottom: 12px; box-shadow: var(--shadow-sm);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:0.68rem; font-weight:800; color:#d4ac0d; text-transform:uppercase; letter-spacing:0.5px;">
            ⚙️ ${isTe ? "ఓనర్ కంట్రోల్ డ్యాష్‌బోర్డ్" : "Owner & Procurement Hub"}
          </div>
          <span style="font-size:0.65rem; background:rgba(255,255,255,0.15); padding:2px 8px; border-radius:999px;">
            HMT Nagar Pilot (10 Apts)
          </span>
        </div>
        <h2 style="font-size:1.15rem; font-weight:800; margin-top:2px;">
          ${isTe ? "పల్లె సేకరణ & వ్యాపార నియంత్రణ" : "Village Sourcing & Business Control"}
        </h2>
        <p style="font-size:0.72rem; opacity:0.88; margin-top:1px;">
          ${isTe ? "స్వచ్ఛమైన పాలు • చెరువు చేపలు • నాటు మటన్" : "Morning Health Milk • Fresh Village Fish • Fresh Village Mutton"}
        </p>
      </div>

      <!-- Quick Metrics Ribbon -->
      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:6px; margin-bottom:12px;">
        <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:8px 4px; text-align:center;">
          <div style="font-size:0.65rem; color:var(--text-muted);">${isTe ? "ఆర్డర్లు" : "Orders"}</div>
          <div style="font-size:1.05rem; font-weight:800; color:var(--primary);">${orders.length}</div>
        </div>
        <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:8px 4px; text-align:center;">
          <div style="font-size:0.65rem; color:var(--text-muted);">${isTe ? "ఆదాయం" : "Revenue"}</div>
          <div style="font-size:1.05rem; font-weight:800; color:var(--accent);">₹${sales.totalRevenue}</div>
        </div>
        <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:8px 4px; text-align:center;">
          <div style="font-size:0.65rem; color:var(--text-muted);">${isTe ? "చేపలు" : "Fish"}</div>
          <div style="font-size:1.05rem; font-weight:800; color:#2980b9;">${sheet.fish.totalKg} kg</div>
        </div>
        <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:8px 4px; text-align:center;">
          <div style="font-size:0.65rem; color:var(--text-muted);">${isTe ? "పాలు ప్లాన్లు" : "Milk Subs"}</div>
          <div style="font-size:1.05rem; font-weight:800; color:#196f3d;">${sheet.milk.totalLitres} L</div>
        </div>
      </div>

      <!-- Owner Feature Navigation Tabs -->
      <div style="display:flex; overflow-x:auto; gap:6px; padding-bottom:8px; margin-bottom:14px; scrollbar-width:none;">
        <button class="btn-lang ${this.currentTab === 'sourcing' ? 'active-admin-tab' : ''}" style="white-space:nowrap; padding:6px 10px; font-size:0.73rem; font-weight:700;" onclick="window.ManaAdminUI.setTab('sourcing')">
          🌾 ${isTe ? "ధరలు & సేకరణ" : "Sourcing & Rates"}
        </button>
        <button class="btn-lang ${this.currentTab === 'orders' ? 'active-admin-tab' : ''}" style="white-space:nowrap; padding:6px 10px; font-size:0.73rem; font-weight:700;" onclick="window.ManaAdminUI.setTab('orders')">
          🏢 ${isTe ? "ఆర్డర్లు & బాయ్ కేటాయింపు" : "Orders & Runners"}
        </button>
        <button class="btn-lang ${this.currentTab === 'subscriptions' ? 'active-admin-tab' : ''}" style="white-space:nowrap; padding:6px 10px; font-size:0.73rem; font-weight:700;" onclick="window.ManaAdminUI.setTab('subscriptions')">
          🥛 ${isTe ? "డైలీ పాలు ప్లాన్లు" : "Milk Subscriptions"}
        </button>
        <button class="btn-lang ${this.currentTab === 'reports' ? 'active-admin-tab' : ''}" style="white-space:nowrap; padding:6px 10px; font-size:0.73rem; font-weight:700;" onclick="window.ManaAdminUI.setTab('reports')">
          📊 ${isTe ? "సేల్స్ రిపోర్ట్స్" : "Sales Reports"}
        </button>
        <button class="btn-lang ${this.currentTab === 'customers' ? 'active-admin-tab' : ''}" style="white-space:nowrap; padding:6px 10px; font-size:0.73rem; font-weight:700;" onclick="window.ManaAdminUI.setTab('customers')">
          👥 ${isTe ? "కస్టమర్లు" : "Customers"}
        </button>
        <button class="btn-lang ${this.currentTab === 'broadcast' ? 'active-admin-tab' : ''}" style="white-space:nowrap; padding:6px 10px; font-size:0.73rem; font-weight:700;" onclick="window.ManaAdminUI.setTab('broadcast')">
          📢 ${isTe ? "వాట్సాప్ & పుష్" : "Broadcast Hub"}
        </button>
      </div>

      <!-- Tab Content Area -->
      <div id="adminTabContent">
        ${this.renderActiveTab(sheet, products, orders, subs, deliveryBoys, sales, customers, isTe, store)}
      </div>
    `;
  },

  renderActiveTab(sheet, products, orders, subs, deliveryBoys, sales, customers, isTe, store) {
    switch (this.currentTab) {
      case "sourcing":
        return this.renderSourcingTab(sheet, products, isTe, store);
      case "orders":
        return this.renderOrdersTab(orders, deliveryBoys, isTe, store);
      case "subscriptions":
        return this.renderSubscriptionsTab(subs, isTe, store);
      case "reports":
        return this.renderReportsTab(sales, isTe, store);
      case "customers":
        return this.renderCustomersTab(customers, isTe, store);
      case "broadcast":
        return this.renderBroadcastTab(store, isTe);
      default:
        return this.renderSourcingTab(sheet, products, isTe, store);
    }
  },

  // --- TAB 1: SOURCING & DAILY RATES ---
  renderSourcingTab(sheet, products, isTe, store) {
    return `
      <!-- 1. Daily Rates & Stock Status -->
      <div class="admin-card" style="border:1.5px solid #d35400; margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <h3 style="font-size:0.92rem; font-weight:800; color:#d35400;">
              📈 ${isTe ? "నేటి చేపలు & మటన్ ధరలు" : "Daily Price & Stock Manager"}
            </h3>
            <p style="font-size:0.7rem; color:var(--text-muted);">
              ${isTe ? "రోజూ మార్కెట్ రేట్ల ప్రకారం ధర మార్చండి & స్టాక్ అందుబాటును నిర్ధారించండి:" : "Update today's live farm rates and mark items Available / Sold Out:"}
            </p>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">
          ${products.map(p => `
            <div style="display:flex; align-items:center; justify-content:space-between; background:var(--surface-alt); padding:8px 10px; border-radius:var(--radius-sm); border:1px solid var(--border);">
              <div>
                <span style="font-size:0.8rem; font-weight:800;">${isTe ? p.title_te : p.title_en}</span>
                <div style="font-size:0.68rem; color:var(--text-muted);">
                  📍 ${p.villageSource} • Base: <b>₹${p.basePrice} / ${p.unit}</b>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <input type="number" id="price-input-${p.id}" value="${p.basePrice}" style="width:68px; padding:4px 6px; font-size:0.75rem; font-weight:700; border:1.5px solid var(--border); border-radius:4px; text-align:right;" />
                <button class="btn-lang" style="padding:4px 8px; font-size:0.72rem; font-weight:700;" onclick="window.ManaAdminUI.saveDailyRate('${p.id}')">
                  💾 Save
                </button>
                <button class="btn-lang" style="padding:4px 8px; font-size:0.7rem; font-weight:800; background:${p.isAvailable ? '#d4efdf' : '#fadbd8'}; color:${p.isAvailable ? '#196f3d' : '#922b21'}; border:1px solid ${p.isAvailable ? '#27ae60' : '#c0392b'};" onclick="window.ManaAdminUI.toggleStock('${p.id}')">
                  ${p.isAvailable ? (isTe ? 'అందుబాటులో ఉంది' : 'Available') : (isTe ? 'స్టాక్ అయిపోయింది' : 'Sold Out')}
                </button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- 2. Daily Village Procurement Sheet -->
      <div class="admin-card" style="border:1.5px solid var(--primary);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <h3 style="font-size:0.92rem; font-weight:800; color:var(--primary);">
              🌾 ${isTe ? "రేపటి ఉదయపు పల్లె సేకరణ జాబితా" : "Daily Village Procurement Sheet"}
            </h3>
            <p style="font-size:0.7rem; color:var(--text-muted);">
              ${isTe ? "రేపు ఉదయం 5:00 AM కి రైతు వద్ద నుండి సేకరించాల్సిన ఖచ్చితమైన పరిమాణం:" : "Exact totals needed from village farmers tomorrow morning at 5:00 AM:"}
            </p>
          </div>
          <button class="btn-lang" style="border-color:var(--primary); color:var(--primary); font-weight:700;" onclick="window.ManaAdminUI.copyProcurementList()">
            📋 ${isTe ? "జాబితా కాపీ చేయండి" : "Copy List"}
          </button>
        </div>

        <table class="procurement-table" style="margin-top:10px;">
          <thead>
            <tr>
              <th>Service</th>
              <th>Total Quantity</th>
              <th>Breakup by Cut / Type</th>
            </tr>
          </thead>
          <tbody>
            <!-- 1. MILK -->
            <tr>
              <td>
                <b>🥛 Morning Health Milk</b><br>
                <span style="font-size:0.68rem; color:var(--text-muted);">Siddipet & Gajwel</span>
              </td>
              <td><b style="color:var(--primary); font-size:1.05rem;">${sheet.milk.totalLitres} Litres</b></td>
              <td>
                <span class="badge-cut">Cow Milk: ${sheet.milk.cowMilkLitres}L</span>
                <span class="badge-cut">Buffalo: ${sheet.milk.buffaloMilkLitres}L</span>
                <span class="badge-cut">Active Subs: ${sheet.milk.subscriptionLitres}L</span>
              </td>
            </tr>

            <!-- 2. FISH -->
            <tr>
              <td>
                <b>🐟 Fresh Village Fish</b><br>
                <span style="font-size:0.68rem; color:var(--text-muted);">Singur Reservoir Ponds</span>
              </td>
              <td><b style="color:var(--primary); font-size:1.05rem;">${sheet.fish.totalKg} kg</b></td>
              <td>
                <span class="badge-cut">Rohu & Katla: ${sheet.fish.rohuKatlaKg}kg</span>
                <div style="margin-top:2px;">
                  <span class="badge-cut">Curry Steaks: ${sheet.fish.options["Curry Cut"]}kg</span>
                  <span class="badge-cut">Cleaned Whole: ${sheet.fish.options["Cleaned"]}kg</span>
                </div>
              </td>
            </tr>

            <!-- 3. MUTTON -->
            <tr>
              <td>
                <b>🥩 Fresh Village Mutton</b><br>
                <span style="font-size:0.68rem; color:var(--text-muted);">Alair Pastoralist Farmers</span>
              </td>
              <td><b style="color:var(--primary); font-size:1.05rem;">${sheet.mutton.totalKg} kg</b></td>
              <td>
                <span class="badge-cut">Curry Cut: ${sheet.mutton.cuts["Curry Cut"]}kg</span>
                <span class="badge-cut">Keema: ${sheet.mutton.cuts["Keema"]}kg</span>
                <span class="badge-cut">Boneless: ${sheet.mutton.cuts["Boneless"]}kg</span>
                ${sheet.mutton.cuts["Liver"] > 0 ? `<span class="badge-cut">Liver: ${sheet.mutton.cuts["Liver"]}kg</span>` : ''}
                ${sheet.mutton.cuts["Paya"] > 0 ? `<span class="badge-cut">Paya: ${sheet.mutton.cuts["Paya"]}kg</span>` : ''}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  // --- TAB 2: ORDERS & DELIVERY BOY ASSIGNMENT ---
  renderOrdersTab(orders, deliveryBoys, isTe, store) {
    return `
      <div class="admin-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div>
            <h3 style="font-size:0.92rem; font-weight:800; color:var(--text-main);">
              🏢 ${isTe ? "అపార్ట్మెంట్ల వారీగా ఆర్డర్లు & డెలివరీ రన్నర్" : "Orders & Delivery Runner Assignment"}
            </h3>
            <p style="font-size:0.7rem; color:var(--text-muted);">
              ${isTe ? "ఆర్డర్లను అపార్ట్మెంట్ మరియు స్లాట్ ప్రకారం క్రమబద్ధీకరించండి:" : "Grouped by apartment & slot. Assign runners to batches:"}
            </p>
          </div>
          <span style="font-size:0.75rem; font-weight:800; background:var(--surface-alt); padding:3px 8px; border-radius:4px; border:1px solid var(--border);">
            ${orders.length} Active Orders
          </span>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          ${orders.map(o => `
            <div style="border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:10px; font-size:0.74rem; background:var(--surface);">
              <!-- Top Header -->
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <span style="font-size:0.68rem; font-weight:800; color:var(--primary);">ORDER #${o.id}</span>
                  <div style="font-size:0.85rem; font-weight:800; color:var(--text-main); margin-top:1px;">
                    🏢 ${o.apartmentName} • Flat ${o.flatNumber} (${o.blockWing || 'Wing A'})
                  </div>
                  <div style="color:var(--text-muted); font-size:0.72rem;">
                    Resident: <b>${o.customerName}</b> • 📞 ${o.customerPhone}
                  </div>
                </div>
                <div style="text-align:right;">
                  <div style="font-size:0.95rem; font-weight:800; color:var(--accent);">₹${o.totalAmount}</div>
                  <span style="font-size:0.65rem; padding:2px 6px; border-radius:4px; font-weight:700; background:${o.paymentMethod === 'cod' ? '#fcf3cf' : '#d4efdf'}; color:${o.paymentMethod === 'cod' ? '#7d6608' : '#196f3d'};">
                    ${o.paymentMethod.toUpperCase()} (${o.paymentStatus.toUpperCase()})
                  </span>
                </div>
              </div>

              <!-- Slot & Items -->
              <div style="margin-top:6px; background:var(--surface-alt); padding:6px 8px; border-radius:4px;">
                <div style="font-weight:700; color:var(--primary); font-size:0.7rem;">
                  ⏰ Slot: ${o.deliverySlot === 'morning' ? 'Morning 6:00 - 8:00 AM' : 'Evening 5:00 - 8:00 PM'}
                </div>
                <div style="margin-top:3px;">
                  ${o.items.map(it => `<span class="badge-cut" style="margin-right:4px;">${it.productTitle} (${it.quantityText})</span>`).join("")}
                </div>
                ${o.notes ? `<div style="font-size:0.68rem; color:#d35400; margin-top:3px;">📝 Note: "${o.notes}"</div>` : ''}
              </div>

              <!-- Controls Row: Status & Delivery Boy Assignment -->
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; margin-top:8px; align-items:center;">
                <!-- Status Updater -->
                <div>
                  <label style="font-size:0.65rem; color:var(--text-muted); font-weight:700; display:block; margin-bottom:2px;">Status</label>
                  <select id="status-select-${o.id}" class="custom-textarea" style="height:30px; font-size:0.72rem; padding:2px;" onchange="window.ManaAdminUI.changeOrderStatus('${o.id}')">
                    <option value="placed" ${o.status === 'placed' ? 'selected' : ''}>Placed</option>
                    <option value="procured" ${o.status === 'procured' ? 'selected' : ''}>Procured from Village</option>
                    <option value="out_for_delivery" ${o.status === 'out_for_delivery' ? 'selected' : ''}>Out for Delivery</option>
                    <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                  </select>
                </div>

                <!-- Runner Assignment -->
                <div>
                  <label style="font-size:0.65rem; color:var(--text-muted); font-weight:700; display:block; margin-bottom:2px;">Delivery Runner</label>
                  <select id="runner-select-${o.id}" class="custom-textarea" style="height:30px; font-size:0.72rem; padding:2px;" onchange="window.ManaAdminUI.assignRunner('${o.id}')">
                    <option value="">Assign Delivery Boy...</option>
                    ${deliveryBoys.map(d => `
                      <option value="${d.id}" ${o.deliveryPartnerId === d.id ? 'selected' : ''}>
                        🛵 ${d.name}
                      </option>
                    `).join("")}
                  </select>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  },

  // --- TAB 3: MILK SUBSCRIPTIONS ---
  renderSubscriptionsTab(subs, isTe, store) {
    const activeCount = subs.filter(s => s.status === 'active').length;
    const totalDailyL = subs.filter(s => s.status === 'active').reduce((sum, s) => sum + s.quantityLitres, 0);

    return `
      <div class="admin-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div>
            <h3 style="font-size:0.92rem; font-weight:800; color:var(--text-main);">
              🥛 ${isTe ? "ఉదయపు పాలు సబ్‌స్క్రిప్షన్ జాబితా" : "Morning Milk Subscription Roster"}
            </h3>
            <p style="font-size:0.7rem; color:var(--text-muted);">
              ${isTe ? "ప్రతి ఉదయం 6-8 AM డెలివరీ కోసం అపార్ట్మెంట్ల వారీగా వివరాలు:" : "Daily / Alternate-day door delivery run-sheet (6:00 - 8:00 AM):"}
            </p>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.95rem; font-weight:800; color:#196f3d;">${totalDailyL} Litres/Day</div>
            <div style="font-size:0.65rem; color:var(--text-muted);">${activeCount} Active Residents</div>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:6px;">
          ${subs.map(s => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--surface-alt); padding:8px 10px; border-radius:var(--radius-sm); border:1px solid var(--border); font-size:0.74rem;">
              <div>
                <div style="font-weight:800; color:var(--primary); font-size:0.8rem;">
                  🏢 ${s.apartmentName} • Flat ${s.flatNumber}
                </div>
                <div style="color:var(--text-muted); font-size:0.72rem;">
                  ${s.customerName} (📞 ${s.customerPhone}) • <b>${s.productTitle}</b>
                </div>
                <div style="font-size:0.68rem; color:var(--accent); font-weight:700; margin-top:1px;">
                  Frequency: ${s.frequency.toUpperCase()} • Slot: 6:00 AM - 8:00 AM
                </div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:0.95rem; font-weight:800; color:var(--primary);">${s.quantityLitres}L / day</div>
                <div style="display:flex; gap:4px; margin-top:4px;">
                  <button class="btn-lang" style="padding:2px 8px; font-size:0.65rem; font-weight:700; background:${s.status === 'active' ? '#d4efdf' : '#fcf3cf'}; color:${s.status === 'active' ? '#196f3d' : '#7d6608'};" onclick="window.manaStore.toggleSubscriptionStatus('${s.id}')">
                    ${s.status === 'active' ? 'Active' : 'Paused'}
                  </button>
                  <button class="btn-lang" style="padding:2px 6px; font-size:0.65rem; color:#c0392b;" onclick="window.manaStore.cancelSubscription('${s.id}')" title="Cancel">
                    ✕
                  </button>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  },

  // --- TAB 4: SALES & REVENUE REPORTS ---
  renderReportsTab(sales, isTe, store) {
    const periodData = sales[this.salesPeriod] || sales.daily;

    return `
      <div class="admin-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div>
            <h3 style="font-size:0.92rem; font-weight:800; color:var(--text-main);">
              📊 ${isTe ? "సేల్స్ & రాబడి నివేదికలు" : "Sales & Revenue Performance"}
            </h3>
            <p style="font-size:0.7rem; color:var(--text-muted);">
              ${isTe ? "రోజువారీ, వారం మరియు నెలవారీ విక్రయాల గణాంకాలు:" : "Real-time metrics for HMT Nagar hyperlocal operations:"}
            </p>
          </div>
        </div>

        <!-- Period Filter Pills -->
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px; margin-bottom:14px;">
          <button class="btn-lang ${this.salesPeriod === 'daily' ? 'active-admin-tab' : ''}" style="justify-content:center; padding:6px; font-size:0.72rem; font-weight:700;" onclick="window.ManaAdminUI.setSalesPeriod('daily')">
            📅 ${isTe ? "ఈ రోజు" : "Today"}
          </button>
          <button class="btn-lang ${this.salesPeriod === 'weekly' ? 'active-admin-tab' : ''}" style="justify-content:center; padding:6px; font-size:0.72rem; font-weight:700;" onclick="window.ManaAdminUI.setSalesPeriod('weekly')">
            🗓️ ${isTe ? "ఈ వారం" : "This Week"}
          </button>
          <button class="btn-lang ${this.salesPeriod === 'monthly' ? 'active-admin-tab' : ''}" style="justify-content:center; padding:6px; font-size:0.72rem; font-weight:700;" onclick="window.ManaAdminUI.setSalesPeriod('monthly')">
            📈 ${isTe ? "నెలవారీ రన్-రేట్" : "Monthly Run-Rate"}
          </button>
        </div>

        <!-- Metric Highlight Cards -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:14px;">
          <div style="background:var(--surface-alt); border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:10px; text-align:center;">
            <div style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">Revenue (${periodData.label})</div>
            <div style="font-size:1.35rem; font-weight:800; color:var(--primary); margin-top:2px;">₹${periodData.revenue}</div>
          </div>
          <div style="background:var(--surface-alt); border:1.5px solid var(--border); border-radius:var(--radius-sm); padding:10px; text-align:center;">
            <div style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">Orders Handled</div>
            <div style="font-size:1.35rem; font-weight:800; color:var(--accent); margin-top:2px;">${periodData.orders} Orders</div>
          </div>
        </div>

        <!-- 3-Service Revenue Breakdown -->
        <div style="border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px; margin-bottom:12px;">
          <h4 style="font-size:0.8rem; font-weight:800; color:var(--text-main); margin-bottom:8px;">
            🌾 Revenue by Service (Strictly 3 Services)
          </h4>
          <div style="display:flex; flex-direction:column; gap:6px;">
            <div style="display:flex; justify-content:space-between; font-size:0.75rem;">
              <span>🥩 1. Fresh Village Mutton:</span>
              <b>₹${sales.categoryBreakdown.mutton}</b>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.75rem;">
              <span>🐟 2. Fresh Village Fish:</span>
              <b>₹${sales.categoryBreakdown.fish}</b>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.75rem;">
              <span>🥛 3. Morning Health Milk:</span>
              <b>₹${sales.categoryBreakdown.milk}</b>
            </div>
          </div>
        </div>

        <!-- Monthly Milk Subscription MRR -->
        <div style="background:linear-gradient(135deg, #e8f8f5 0%, #d4efdf 100%); border:1px solid #a9dfbf; border-radius:var(--radius-sm); padding:10px; font-size:0.75rem;">
          <div style="font-weight:800; color:#196f3d;">🥛 Predictable Milk Subscription MRR:</div>
          <div style="display:flex; justify-content:space-between; margin-top:4px;">
            <span>Monthly Recurring Run-Rate:</span>
            <b style="font-size:0.95rem; color:#196f3d;">₹${sales.subscriptions.monthlyMRR} / month</b>
          </div>
          <div style="font-size:0.68rem; color:#27ae60; margin-top:2px;">
            Based on ${sales.subscriptions.activeCount} active flat subscriptions delivering ${sales.subscriptions.dailyLitres}L every morning.
          </div>
        </div>
      </div>
    `;
  },

  // --- TAB 5: CUSTOMER DIRECTORY & HISTORY ---
  renderCustomersTab(customers, isTe, store) {
    return `
      <div class="admin-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div>
            <h3 style="font-size:0.92rem; font-weight:800; color:var(--text-main);">
              👥 ${isTe ? "అపార్ట్మెంట్ కస్టమర్ల డైరెక్టరీ" : "Customer Directory & Order History"}
            </h3>
            <p style="font-size:0.7rem; color:var(--text-muted);">
              ${isTe ? "10 అపార్ట్మెంట్లలోని రెసిడెంట్లు, వారి ఆర్డర్ల చరిత్ర & ఖర్చు:" : "Residents across 10 HMT Nagar pilot apartments:"}
            </p>
          </div>
          <span style="font-size:0.72rem; font-weight:800; background:var(--surface-alt); padding:3px 8px; border-radius:4px; border:1px solid var(--border);">
            ${customers.length} Residents
          </span>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
          ${customers.map((c, i) => `
            <div style="border:1px solid var(--border); border-radius:var(--radius-sm); padding:10px; font-size:0.74rem; background:var(--surface);">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <div style="font-weight:800; color:var(--text-main); font-size:0.85rem;">
                    👤 ${c.name}
                  </div>
                  <div style="color:var(--primary); font-weight:700; font-size:0.72rem;">
                    🏢 ${c.apartmentName} • Flat ${c.flatNumber}
                  </div>
                  <div style="color:var(--text-muted); font-size:0.7rem;">
                    📞 ${c.phone}
                  </div>
                </div>
                <div style="text-align:right;">
                  <div style="font-size:0.95rem; font-weight:800; color:var(--accent);">₹${c.totalSpend}</div>
                  <span style="font-size:0.65rem; color:var(--text-muted);">${c.ordersCount} Orders Placed</span>
                </div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px; padding-top:6px; border-top:1px dashed var(--border);">
                <div>
                  ${c.hasActiveMilkSub ? `
                    <span style="background:#d4efdf; color:#196f3d; font-size:0.65rem; font-weight:800; padding:2px 6px; border-radius:4px;">
                      🥛 ${c.milkLitres}L Daily Milk Active
                    </span>
                  ` : `
                    <span style="color:var(--text-muted); font-size:0.65rem;">No active subscription</span>
                  `}
                </div>
                <button class="btn-lang" style="padding:2px 8px; font-size:0.68rem;" onclick="window.ManaCustomerUI.showToast('Viewing full history of ${c.name}: ${c.ordersCount} orders')">
                  📜 View History
                </button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  },

  // --- TAB 6: PUSH NOTIFICATIONS & WHATSAPP STUDIO ---
  renderBroadcastTab(store, isTe) {
    return `
      <!-- WhatsApp Broadcast Generator -->
      <div class="admin-card" style="margin-bottom:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3 style="font-size:0.92rem; font-weight:800; color:var(--text-main);">
            📲 ${isTe ? "వాట్సాప్ ఆఫర్ మెసేజ్" : "WhatsApp Daily Broadcast Offer"}
          </h3>
          <button class="btn-lang" style="font-weight:700;" onclick="window.ManaAdminUI.copyWhatsApp()">
            📋 ${isTe ? "మెసేజ్ కాపీ చేయండి" : "Copy Message"}
          </button>
        </div>
        <p style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">
          ${isTe ? "హెచ్.ఎం.టి నగర్ అపార్ట్మెంట్ వాట్సాప్ గ్రూపుల కోసం తయారుచేసిన మెసేజ్:" : "Pre-formatted with today's live rates for 10 HMT Nagar apartment community groups:"}
        </p>
        <pre style="background:var(--surface-alt); border:1px solid var(--border); border-radius:var(--radius-sm); padding:10px; font-size:0.7rem; font-family:inherit; white-space:pre-wrap; margin-top:8px; max-height:130px; overflow-y:auto;">${store.generateWhatsAppDailyOffer()}</pre>
        <div style="margin-top:8px;">
          <a href="https://wa.me/?text=${encodeURIComponent(store.generateWhatsAppDailyOffer())}" target="_blank" class="btn-primary" style="display:inline-flex; align-items:center; gap:6px; padding:6px 12px; font-size:0.75rem; text-decoration:none;">
            🚀 Open WhatsApp & Send
          </a>
        </div>
      </div>

      <!-- In-App Push Notification Broadcaster -->
      <div class="admin-card" style="border:1.5px solid var(--accent);">
        <h3 style="font-size:0.92rem; font-weight:800; color:var(--accent); margin-bottom:4px;">
          🔔 Send In-App Push Notification
        </h3>
        <p style="font-size:0.7rem; color:var(--text-muted); margin-bottom:8px;">
          Broadcast an urgent alert (e.g., fresh mutton batch arrived, rain delay alert) to all 10 apartments:
        </p>

        <div style="display:flex; flex-direction:column; gap:8px;">
          <div>
            <label style="font-size:0.7rem; font-weight:700; color:var(--text-main); display:block; margin-bottom:2px;">Notification Title</label>
            <input type="text" id="pushTitleInput" class="custom-textarea" style="height:32px; padding:4px 8px; font-size:0.75rem;" value="🥩 Fresh Village Mutton Batch Arrived!" />
          </div>
          <div>
            <label style="font-size:0.7rem; font-weight:700; color:var(--text-main); display:block; margin-bottom:2px;">Message</label>
            <textarea id="pushMessageInput" class="custom-textarea" style="height:55px; padding:6px 8px; font-size:0.75rem;">Sourced from Alair farmers at dawn. Tender cuts available for morning 6-8 AM delivery to HMT Nagar. Order now!</textarea>
          </div>
          <button class="btn-primary" style="justify-content:center; padding:8px; font-size:0.78rem;" onclick="window.ManaAdminUI.broadcastPushNotification()">
            📡 Broadcast to All 10 Apartments
          </button>
        </div>
      </div>
    `;
  },

  // --- ACTIONS ---
  saveDailyRate(productId) {
    const store = window.manaStore;
    const input = document.getElementById(`price-input-${productId}`);
    if (input) {
      store.updateDailyPrice(productId, input.value);
      window.ManaCustomerUI.showToast("Daily price updated successfully!");
    }
  },

  toggleStock(productId) {
    const store = window.manaStore;
    const prod = store.state.products.find(p => p.id === productId);
    if (prod) {
      store.updateStockStatus(productId, !prod.isAvailable);
      window.ManaCustomerUI.showToast(`Updated stock status for ${prod.title_en}`);
      this.render(document.getElementById("appContent"));
    }
  },

  changeOrderStatus(orderId) {
    const store = window.manaStore;
    const select = document.getElementById(`status-select-${orderId}`);
    if (select) {
      store.updateOrderStatus(orderId, select.value);
      window.ManaCustomerUI.showToast(`Order #${orderId} status set to ${select.value}`);
    }
  },

  assignRunner(orderId) {
    const store = window.manaStore;
    const select = document.getElementById(`runner-select-${orderId}`);
    if (select && select.value) {
      store.assignDeliveryPartner(orderId, select.value);
      const partner = store.getDeliveryPartners().find(p => p.id === select.value);
      window.ManaCustomerUI.showToast(`Assigned ${partner?.name} to Order #${orderId}`);
    }
  },

  broadcastPushNotification() {
    const title = document.getElementById("pushTitleInput")?.value || "Mana Palle Fresh Update";
    const msg = document.getElementById("pushMessageInput")?.value || "Check today's fresh village produce!";
    window.manaStore.sendPushNotification(title, msg);
    window.ManaCustomerUI.showToast(`🔔 Push broadcast sent to 10 apartments!`);
  },

  copyProcurementList() {
    const store = window.manaStore;
    const sheet = store.calculateProcurementSheet();
    const text = `🌾 MANA PALLE FRESH - VILLAGE PROCUREMENT SHEET 🌾\n` +
      `Tomorrow Morning 5:00 AM Farm Sourcing\n` +
      `-----------------------------------------\n` +
      `🥛 MORNING HEALTH MILK: ${sheet.milk.totalLitres} Litres Total\n` +
      `  • Desi Cow Milk (A2): ${sheet.milk.cowMilkLitres} Litres\n` +
      `  • Thick Buffalo Milk: ${sheet.milk.buffaloMilkLitres} Litres\n` +
      `  • Daily Subscriptions: ${sheet.milk.subscriptionLitres} Litres\n\n` +
      `🐟 FRESH VILLAGE FISH: ${sheet.fish.totalKg} kg Total\n` +
      `  • Freshwater Rohu / Katla: ${sheet.fish.rohuKatlaKg} kg\n` +
      `  • Curry Steaks: ${sheet.fish.options["Curry Cut"]} kg\n` +
      `  • Cleaned Whole: ${sheet.fish.options["Cleaned"]} kg\n\n` +
      `🥩 FRESH VILLAGE MUTTON: ${sheet.mutton.totalKg} kg Total\n` +
      `  • Curry Cut: ${sheet.mutton.cuts["Curry Cut"]} kg\n` +
      `  • Boneless: ${sheet.mutton.cuts["Boneless"]} kg\n` +
      `  • Keema: ${sheet.mutton.cuts["Keema"]} kg\n` +
      `  • Liver: ${sheet.mutton.cuts["Liver"]} kg\n` +
      `  • Paya (Trotters): ${sheet.mutton.cuts["Paya"]} kg\n` +
      `-----------------------------------------`;

    navigator.clipboard.writeText(text);
    window.ManaCustomerUI.showToast("Procurement list copied to clipboard!");
  },

  copyWhatsApp() {
    const store = window.manaStore;
    navigator.clipboard.writeText(store.generateWhatsAppDailyOffer());
    window.ManaCustomerUI.showToast("WhatsApp broadcast message copied!");
  }
};
