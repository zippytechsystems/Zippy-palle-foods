// Mana Palle Fresh - Customer UI
// STRICTLY ONLY 3 SERVICES:
// 1. Morning Health Milk | 2. Fresh Village Fish | 3. Fresh Village Mutton

window.ManaCustomerUI = {
  renderHome(container) {
    const store = window.manaStore;
    const isTe = store.state.lang === "te";
    const user = store.state.user;
    const products = store.state.products;

    // Retrieve the exact products for the 3 services
    const milkProd = products.find(p => p.id === "prod-milk-cow") || products.find(p => p.categoryId === "milk");
    const fishProd = products.find(p => p.id === "prod-fish-rohu") || products.find(p => p.categoryId === "fish");
    const muttonProd = products.find(p => p.id === "prod-mut-village") || products.find(p => p.categoryId === "mutton");

    container.innerHTML = `
      <!-- 1. "MANA PALLE" HERO BRAND CARD (FIRST THING USER SEES) -->
      <div style="background: linear-gradient(135deg, #1b4d2e 0%, #2e7d32 100%); color: #ffffff; border-radius: var(--radius-lg); padding: 16px; margin-bottom: 16px; box-shadow: var(--shadow-md); display: flex; align-items: center; gap: 14px;">
        
        <!-- Large Mana Palle Fresh Brand Image -->
        <div style="width: 78px; height: 78px; border-radius: 20px; overflow: hidden; border: 2.5px solid #d4ac0d; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.3); background: #ffffff;">
          <img src="assets/logo.jpg" alt="Mana Palle Fresh" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>

        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
            <span style="background: #d4ac0d; color: #1c2833; font-size: 0.62rem; font-weight: 800; padding: 2px 7px; border-radius: var(--radius-full); text-transform: uppercase;">
              HMT NAGAR PILOT
            </span>
            <span style="font-size: 0.68rem; opacity: 0.9;">10 Apartments</span>
          </div>
          <h2 style="font-size: 1.25rem; font-weight: 800; line-height: 1.2; color: #ffffff;">
            ${isTe ? "మన పల్లె ఫ్రెష్" : "Mana Palle Fresh"}
          </h2>
          <p style="font-size: 0.74rem; opacity: 0.92; line-height: 1.3; margin-top: 3px;">
            ${isTe ? "గ్రామాల నుండి నేరుగా: పాలు • చేపలు • నాటు మటన్" : "Village Farm Direct: Health Milk • Pond Fish • Fresh Mutton"}
          </p>
        </div>
      </div>

      <!-- SECTION TITLE: ONLY 3 SERVICES -->
      <div class="section-header" style="margin-bottom: 12px;">
        <span class="section-title">🌾 ${isTe ? "కేవలం 3 స్వచ్ఛమైన సేవలు" : "Our 3 Village-Fresh Services"}</span>
        <span class="section-count">3 Services Only</span>
      </div>

      <!-- THE EXACT 3 SERVICE CARDS (STRICTLY MILK, FISH, MUTTON) -->
      <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;">

        <!-- CARD 1: MORNING HEALTH MILK -->
        <div class="product-card" id="card-service-milk" style="border: 2px solid #27ae60;">
          <div class="product-card-top" style="height: 190px;">
            <img src="assets/dairy.jpg" alt="Morning Health Milk" class="product-image" loading="lazy" />
            <div class="badge-float">
              <span>⏰</span>
              <span>Delivered 6:00 - 8:00 AM</span>
            </div>
            <span class="stock-tag in-stock">
              ${isTe ? "నేడు అందుబాటులో ఉంది" : "Available Today"}
            </span>
          </div>
          <div class="product-details">
            <span class="product-source-tag">
              🥛 SERVICE 1: ${isTe ? "ఉదయపు ఆరోగ్యకరమైన పాలు" : "Morning Health Milk"}
            </span>
            <h3 class="product-name" style="font-size: 1.1rem;">
              ${isTe ? "స్వచ్ఛమైన పల్లె ఆవు & గేదె పాలు" : "Fresh Village Cow & Buffalo Milk"}
            </h3>
            <p class="product-desc">
              ${isTe ? "సిద్దిపేట & గజ్వేల్ గ్రామాల నుండి సేకరించిన స్వచ్ఛమైన పాలు. ప్రతి ఉదయం 6:00 - 8:00 AM లోపు మీ ఫ్లాట్ గుమ్మానికి డెలివరీ." : "Pure raw cow/buffalo milk delivered every morning between 6:00 - 8:00 AM. Daily/alternate-day subscription with pause anytime."}
            </p>

            <div style="display: flex; gap: 6px; margin-top: 6px;">
              <span style="background: var(--surface-alt); font-size: 0.7rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; border: 1px solid var(--border);">
                📦 Sizes: 500ml, 1L, 2L
              </span>
              <span style="background: var(--gold-soft); color: #7e5109; font-size: 0.7rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; border: 1px solid #f5b041;">
                🔄 Daily Subscription Available
              </span>
            </div>

            <div class="product-footer" style="margin-top: 10px;">
              <div class="product-pricing">
                <span style="font-size: 0.68rem; color: var(--accent); font-weight: 700;">${store.t("todaysRate")}</span>
                <div style="display: flex; align-items: baseline; gap: 4px;">
                  <span class="price-main" style="font-size: 1.25rem;">₹${milkProd.basePrice}</span>
                  <span class="price-unit">/ Litre</span>
                </div>
              </div>
              <div style="display: flex; gap: 6px;">
                <button class="btn-lang" style="padding: 7px 10px; font-size: 0.75rem;" onclick="window.ManaCustomerUI.openSubscriptionModal()">
                  🔄 ${isTe ? "సబ్‌స్క్రిప్షన్" : "Subscribe"}
                </button>
                <button class="btn-select-cut" onclick="window.ManaCustomerUI.openProductPageModal('${milkProd.id}')">
                  + ${isTe ? "ఆర్డర్ చేయండి" : "Order"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- CARD 2: FRESH VILLAGE FISH -->
        <div class="product-card" id="card-service-fish" style="border: 2px solid #2980b9;">
          <div class="product-card-top" style="height: 190px;">
            <img src="assets/fish.jpg" alt="Fresh Village Fish" class="product-image" loading="lazy" />
            <div class="badge-float">
              <span>🐟</span>
              <span>Village Pond Catch • Free Descaling</span>
            </div>
            <span class="stock-tag in-stock">
              ${isTe ? "నేడు అందుబాటులో ఉంది" : "Available Today"}
            </span>
          </div>
          <div class="product-details">
            <span class="product-source-tag">
              🐟 SERVICE 2: ${isTe ? "తాజా చెరువు చేపలు" : "Fresh Village Fish"}
            </span>
            <h3 class="product-name" style="font-size: 1.1rem;">
              ${isTe ? "మంచినీటి చెరువు రోహు & బొచ్చె (కాట్లా) చేపలు" : "Freshwater Village Fish (Rohu, Katla, etc.)"}
            </h3>
            <p class="product-desc">
              ${isTe ? "సింగూరు రిజర్వాయర్ చెరువుల నుండి తెచ్చిన తాజా మంచినీటి చేపలు. పొలుసులు తీసి శుభ్రపరిచి మీ ఇష్టానుసారం కట్ చేస్తాం." : "Freshly caught freshwater pond fish. Sold by weight (500g, 1kg) with options: Whole / Cleaned / Curry Cut Steaks."}
            </p>

            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px;">
              <span style="background: var(--surface-alt); font-size: 0.7rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; border: 1px solid var(--border);">
                ⚖️ 500g / 1kg
              </span>
              <span style="background: var(--surface-alt); font-size: 0.7rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; border: 1px solid var(--border);">
                🔪 Whole / Cleaned / Curry Cut
              </span>
            </div>

            <div class="product-footer" style="margin-top: 10px;">
              <div class="product-pricing">
                <span style="font-size: 0.68rem; color: var(--accent); font-weight: 700;">${store.t("todaysRate")}</span>
                <div style="display: flex; align-items: baseline; gap: 4px;">
                  <span class="price-main" style="font-size: 1.25rem;">₹${fishProd.basePrice}</span>
                  <span class="price-unit">/ kg</span>
                </div>
              </div>
              <button class="btn-select-cut" onclick="window.ManaCustomerUI.openProductPageModal('${fishProd.id}')">
                + ${isTe ? "కట్ & బరువు ఎంచుకోండి" : "Select Weight & Cut"}
              </button>
            </div>
          </div>
        </div>

        <!-- CARD 3: FRESH VILLAGE MUTTON -->
        <div class="product-card" id="card-service-mutton" style="border: 2px solid #c0392b;">
          <div class="product-card-top" style="height: 190px;">
            <img src="assets/mutton.jpg" alt="Fresh Village Mutton" class="product-image" loading="lazy" />
            <div class="badge-float">
              <span>🥩</span>
              <span>100% Free-Range Shepherd Meat</span>
            </div>
            <span class="stock-tag in-stock">
              ${isTe ? "నేడు అందుబాటులో ఉంది" : "Available Today"}
            </span>
          </div>
          <div class="product-details">
            <span class="product-source-tag">
              🥩 SERVICE 3: ${isTe ? "తాజా పల్లెటూరి మటన్" : "Fresh Village Mutton"}
            </span>
            <h3 class="product-name" style="font-size: 1.1rem;">
              ${isTe ? "పల్లెటూరి నాటు గొర్రె/మేక తాజా మటన్" : "Fresh Village Healthy Mutton"}
            </h3>
            <p class="product-desc">
              ${isTe ? "అలేరు & యాదగిరిగుట్ట రైతుల నాటు గొర్రెల మాంసం. పసుపు నీటి శుభ్రత. కర్రీ కట్, బోన్‌లెస్, కీమా, లివర్, పాయా కాళ్ళు." : "Grass-fed village sheep meat washed with turmeric. Cuts: Curry Cut, Boneless, Keema, Liver, Paya. Sold by weight: 250g, 500g, 1kg."}
            </p>

            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px;">
              <span style="background: var(--surface-alt); font-size: 0.68rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border);">
                ⚖️ 250g / 500g / 1kg
              </span>
              <span style="background: var(--surface-alt); font-size: 0.68rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border);">
                🔪 Curry / Boneless / Keema / Liver / Paya
              </span>
            </div>

            <div class="product-footer" style="margin-top: 10px;">
              <div class="product-pricing">
                <span style="font-size: 0.68rem; color: var(--accent); font-weight: 700;">${store.t("todaysRate")}</span>
                <div style="display: flex; align-items: baseline; gap: 4px;">
                  <span class="price-main" style="font-size: 1.25rem;">₹${muttonProd.basePrice}</span>
                  <span class="price-unit">/ kg</span>
                </div>
              </div>
              <button class="btn-select-cut" onclick="window.ManaCustomerUI.openProductPageModal('${muttonProd.id}')">
                + ${isTe ? "కట్ & బరువు ఎంచుకోండి" : "Select Cut & Qty"}
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- APARTMENT REFERRAL CARD -->
      <div style="background: var(--surface); border: 1.5px dashed var(--accent); border-radius: var(--radius-md); padding: 14px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h4 style="font-size: 0.88rem; font-weight: 800; color: var(--accent);">🎁 ${store.t("referralTitle")}</h4>
          <p style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">
            ${isTe ? "మీ అపార్ట్మెంట్ వాట్సాప్ గ్రూప్‌లో షేర్ చేయండి • ఇద్దరికీ ₹50 తగ్గింపు!" : "Share in your flat WhatsApp group • Both get ₹50 off!"}
          </p>
        </div>
        <button class="btn-lang" onclick="window.ManaCustomerUI.openReferralModal()" style="border-color: var(--accent); color: var(--accent); font-weight: 800;">
          ${store.t("copyCode")}
        </button>
      </div>
    `;
  },

  // --- PRODUCT PAGE & QUANTITY / CUTS MODAL ---
  openProductPageModal(productId) {
    const store = window.manaStore;
    const isTe = store.state.lang === "te";
    const prod = store.state.products.find(p => p.id === productId);
    if (!prod) return;

    let selectedWeight = prod.weights ? (prod.weights.find(w => w.isDefault) || prod.weights[0]) : { label: "1 Unit", multiplier: 1.0 };
    let selectedCut = prod.cuts ? prod.cuts[0] : { id: "standard", name_en: "Standard Cut", name_te: "ప్రామాణిక కట్", priceDelta: 0 };

    const modalOverlay = document.createElement("div");
    modalOverlay.className = "modal-overlay";
    modalOverlay.id = "productModalOverlay";

    const renderModal = () => {
      const calculatedPrice = Math.round((prod.basePrice + (selectedCut?.priceDelta || 0)) * (selectedWeight?.multiplier || 1.0));

      modalOverlay.innerHTML = `
        <div class="modal-sheet">
          <div class="modal-drag-handle"></div>

          <!-- Product Image Banner -->
          <div style="position: relative; width: 100%; height: 180px; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 8px;">
            <img src="${prod.image}" alt="${prod.title_en}" style="width: 100%; height: 100%; object-fit: cover;" />
            <button class="btn-close-modal" style="position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.95);" onclick="document.getElementById('productModalOverlay').remove()">✕</button>
            <div style="position: absolute; bottom: 8px; left: 8px; background: rgba(27,77,46,0.92); color: #fff; padding: 3px 10px; border-radius: var(--radius-full); font-size: 0.72rem; font-weight: 700;">
              📍 ${prod.villageSource}
            </div>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <h3 class="modal-title">${isTe ? prod.title_te : prod.title_en}</h3>
                <span style="font-size: 0.75rem; color: var(--accent); font-weight: 700;">${store.t("todaysRate")}: ₹${prod.basePrice} / ${isTe ? prod.unit_te : prod.unit}</span>
              </div>
              <div style="font-size: 1.35rem; font-weight: 800; color: var(--primary);">
                ₹${calculatedPrice}
              </div>
            </div>
            <p style="font-size: 0.74rem; color: var(--text-muted); margin-top: 4px;">
              ${isTe ? prod.description_te : prod.description_en}
            </p>
          </div>

          <!-- 1. Weight / Quantity Selection -->
          <div>
            <label class="option-label">⚖️ ${store.t("weightSelect")}</label>
            <div class="options-row">
              ${prod.weights.map(w => `
                <button class="option-btn ${selectedWeight.label === w.label ? 'selected' : ''}" onclick="window._setWeight('${w.label}')">
                  ${w.label}
                </button>
              `).join("")}
            </div>
          </div>

          <!-- 2. Cutting / Butchery Preference -->
          ${prod.cuts && prod.cuts.length > 0 ? `
            <div>
              <label class="option-label">🔪 ${store.t("cuttingPreference")}</label>
              <div class="cuts-list">
                ${prod.cuts.map(c => `
                  <div class="cut-option-card ${selectedCut.id === c.id ? 'selected' : ''}" onclick="window._setCut('${c.id}')">
                    <div class="cut-option-info">
                      <span class="cut-option-title">${isTe ? c.name_te : c.name_en}</span>
                      <span class="cut-option-price">${c.priceDelta !== 0 ? (c.priceDelta > 0 ? `+₹${c.priceDelta}` : `-₹${Math.abs(c.priceDelta)}`) : (isTe ? 'ఉచిత కోత & శుభ్రం' : 'Free Cleaning')}</span>
                    </div>
                    <span style="font-size: 1.1rem; color: var(--primary);">${selectedCut.id === c.id ? '✓' : '○'}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          ` : ''}

          <!-- 3. Special Cutting Note Input for Fish & Mutton -->
          ${prod.categoryId !== 'milk' ? `
            <div>
              <label class="option-label">📝 ${store.t("cuttingNote")}</label>
              <input type="text" id="cuttingInstructionInput" class="custom-textarea" style="height: 42px;" placeholder="${isTe ? 'ఉదా: చిన్న ఎముక ముక్కలు, పసుపు నీటి కడుగు' : 'e.g. Small bone pieces, wash with turmeric'}" />
            </div>
          ` : ''}

          <!-- Add to Basket Action -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px;">
            <div>
              <span style="font-size: 0.7rem; color: var(--text-muted);">${isTe ? "మొత్తం ధర" : "Total Price"}</span>
              <div style="font-size: 1.25rem; font-weight: 800; color: var(--primary);">₹${calculatedPrice}</div>
            </div>
            <button class="btn-primary" style="padding: 10px 22px;" onclick="window._confirmAdd()">
              🧺 ${store.t("addToCart")}
            </button>
          </div>
        </div>
      `;
    };

    window._setWeight = (label) => {
      selectedWeight = prod.weights.find(w => w.label === label);
      renderModal();
    };

    window._setCut = (cutId) => {
      selectedCut = prod.cuts.find(c => c.id === cutId);
      renderModal();
    };

    window._confirmAdd = () => {
      const notes = document.getElementById("cuttingInstructionInput")?.value || "";
      store.addToCart(prod, selectedCut, selectedWeight, notes);
      modalOverlay.remove();
      window.ManaCustomerUI.showToast(isTe ? "బుట్టలో చేర్చబడింది! 🧺" : "Added to basket! 🧺");
    };

    renderModal();
    document.getElementById("deviceContainer").appendChild(modalOverlay);
  },

  // --- CART BOTTOM SHEET (SLOTS: MORNING 6-8 AM, EVENING 5-8 PM) ---
  openCartModal() {
    const store = window.manaStore;
    const isTe = store.state.lang === "te";
    const cart = store.state.cart;
    const totals = store.getCartTotals();
    const user = store.state.user;

    const modalOverlay = document.createElement("div");
    modalOverlay.className = "modal-overlay";
    modalOverlay.id = "cartModalOverlay";

    let selectedSlot = "morning";
    let selectedDate = "Tomorrow";

    const renderCart = () => {
      const updatedTotals = store.getCartTotals();

      if (cart.length === 0) {
        modalOverlay.innerHTML = `
          <div class="modal-sheet">
            <div class="modal-drag-handle"></div>
            <div class="modal-header">
              <h3 class="modal-title">🧺 ${store.t("myCart")}</h3>
              <button class="btn-close-modal" onclick="document.getElementById('cartModalOverlay').remove()">✕</button>
            </div>
            <div style="text-align: center; padding: 32px 10px;">
              <span style="font-size: 3rem;">🥛</span>
              <h4 style="font-size: 1rem; font-weight: 800; margin-top: 8px;">${store.t("cartEmpty")}</h4>
              <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">${store.t("cartEmptySub")}</p>
              <button class="btn-primary" style="margin: 20px auto 0 auto;" onclick="document.getElementById('cartModalOverlay').remove()">
                ${isTe ? "3 సేవలు చూడండి" : "View 3 Fresh Services"}
              </button>
            </div>
          </div>
        `;
        return;
      }

      modalOverlay.innerHTML = `
        <div class="modal-sheet">
          <div class="modal-drag-handle"></div>
          <div class="modal-header">
            <div>
              <h3 class="modal-title">🧺 ${store.t("myCart")} (${updatedTotals.itemCount})</h3>
              <span style="font-size: 0.72rem; color: var(--text-muted);">Delivering to ${user.apartmentName}, Flat ${user.flatNumber}</span>
            </div>
            <button class="btn-close-modal" onclick="document.getElementById('cartModalOverlay').remove()">✕</button>
          </div>

          <!-- Cart Item List -->
          <div class="cart-list">
            ${cart.map((item, idx) => `
              <div class="cart-item-card">
                <div class="cart-item-info">
                  <span class="cart-item-title">${isTe ? item.title_te : item.title_en}</span>
                  <span class="cart-item-cut">🔪 ${isTe ? item.cutName_te : item.cutName_en} • ${item.weightLabel}</span>
                  ${item.instructions ? `<span style="font-size: 0.68rem; color: var(--text-muted); font-style: italic;">"${item.instructions}"</span>` : ''}
                  <span class="cart-item-price">₹${item.totalPrice}</span>
                </div>
                <div class="qty-counter">
                  <button class="btn-qty" onclick="window._cartQty(${idx}, -1)">-</button>
                  <span class="qty-number">${item.quantity}</span>
                  <button class="btn-qty" onclick="window._cartQty(${idx}, 1)">+</button>
                </div>
              </div>
            `).join("")}
          </div>

          <!-- Delivery Slot Selector (Morning 6-8 AM, Evening 5-8 PM) -->
          <div>
            <label class="option-label">⏰ ${store.t("deliverySlot")}</label>
            <div class="slot-grid">
              <div class="slot-card ${selectedSlot === 'morning' ? 'selected' : ''}" onclick="window._selectSlot('morning')">
                <div class="slot-card-left">
                  <span class="slot-card-title">🌅 ${store.t("slotMorning")}</span>
                  <span class="slot-card-desc">${isTe ? "రేపు ఉదయం అపార్ట్మెంట్ డోర్‌స్టెప్ వద్దకు" : "Tomorrow early morning directly at flat door"}</span>
                </div>
                <span>${selectedSlot === 'morning' ? '✓' : '○'}</span>
              </div>
              <div class="slot-card ${selectedSlot === 'evening' ? 'selected' : ''}" onclick="window._selectSlot('evening')">
                <div class="slot-card-left">
                  <span class="slot-card-title">🌆 ${store.t("slotEvening")}</span>
                  <span class="slot-card-desc">${isTe ? "ఈరోజు సాయంత్రం డిన్నర్ వంట కోసం" : "Today evening for dinner preparation"}</span>
                </div>
                <span>${selectedSlot === 'evening' ? '✓' : '○'}</span>
              </div>
            </div>
          </div>

          <!-- Pre-order Date Toggle -->
          <div style="background: var(--surface-alt); padding: 8px 12px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem;">
            <span>📅 Delivery Day</span>
            <span style="font-weight: 800; color: var(--primary);">Tomorrow Morning</span>
          </div>

          <!-- Bill Summary -->
          <div class="bill-summary-box">
            <div class="bill-row">
              <span>${store.t("itemTotal")}</span>
              <span>₹${updatedTotals.subtotal}</span>
            </div>
            <div class="bill-row">
              <span>${store.t("deliveryFee")}</span>
              <span style="color: var(--primary); font-weight: 700;">${store.t("freeDelivery")}</span>
            </div>
            ${updatedTotals.walletDiscount > 0 ? `
              <div class="bill-row" style="color: var(--accent); font-weight: 700;">
                <span>🎁 ${store.t("walletDiscount")}</span>
                <span>-₹${updatedTotals.walletDiscount}</span>
              </div>
            ` : ''}
            <div class="bill-row total-row">
              <span>${store.t("toPay")}</span>
              <span>₹${updatedTotals.grandTotal}</span>
            </div>
          </div>

          <button class="btn-primary" onclick="window._openCheckoutModal('${selectedSlot}', '${selectedDate}')">
            💳 ${store.t("proceedToCheckout")} (₹${updatedTotals.grandTotal})
          </button>
        </div>
      `;
    };

    window._cartQty = (idx, delta) => {
      store.updateCartQty(idx, delta);
      renderCart();
    };

    window._selectSlot = (s) => {
      selectedSlot = s;
      renderCart();
    };

    window._openCheckoutModal = (slot, date) => {
      modalOverlay.remove();
      window.ManaCustomerUI.openCheckoutModal(slot, date);
    };

    renderCart();
    document.getElementById("deviceContainer").appendChild(modalOverlay);
  },

  // --- CHECKOUT & MULTI-PAYMENT MODAL ---
  openCheckoutModal(slot, date) {
    const store = window.manaStore;
    const isTe = store.state.lang === "te";
    const totals = store.getCartTotals();
    const user = store.state.user;

    let selectedPayment = "upi";

    const modalOverlay = document.createElement("div");
    modalOverlay.className = "modal-overlay";
    modalOverlay.id = "checkoutModalOverlay";

    const renderPaymentView = () => {
      modalOverlay.innerHTML = `
        <div class="modal-sheet">
          <div class="modal-drag-handle"></div>
          <div class="modal-header">
            <div>
              <h3 class="modal-title">💳 ${store.t("paymentHeader")}</h3>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Amount: <b>₹${totals.grandTotal}</b></span>
            </div>
            <button class="btn-close-modal" onclick="document.getElementById('checkoutModalOverlay').remove()">✕</button>
          </div>

          <div class="payment-grid">
            <!-- 1. UPI Intent / QR -->
            <div class="payment-card ${selectedPayment === 'upi' ? 'selected' : ''}" onclick="window._setPayment('upi')">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.4rem;">📱</span>
                <div>
                  <div style="font-size: 0.82rem; font-weight: 800;">${store.t("payUPI")}</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted);">GPay / PhonePe / Paytm / BHIM (0% Fee)</div>
                </div>
              </div>
              <span>${selectedPayment === 'upi' ? '✓' : '○'}</span>
            </div>

            ${selectedPayment === 'upi' ? `
              <div class="upi-qr-box">
                <span style="font-size: 0.74rem; font-weight: 700; color: var(--primary);">
                  Scan & Pay ₹${totals.grandTotal} to <b>manapalle@upi</b>
                </span>
                <svg width="120" height="120" viewBox="0 0 100 100" style="background:#fff; border-radius:6px; padding:4px;">
                  <rect width="100" height="100" fill="#ffffff" />
                  <rect x="5" y="5" width="30" height="30" fill="#1b4d2e" />
                  <rect x="10" y="10" width="20" height="20" fill="#ffffff" />
                  <rect x="15" y="15" width="10" height="10" fill="#1b4d2e" />
                  <rect x="65" y="5" width="30" height="30" fill="#1b4d2e" />
                  <rect x="70" y="10" width="20" height="20" fill="#ffffff" />
                  <rect x="75" y="15" width="10" height="10" fill="#1b4d2e" />
                  <rect x="5" y="65" width="30" height="30" fill="#1b4d2e" />
                  <rect x="10" y="70" width="20" height="20" fill="#ffffff" />
                  <rect x="15" y="75" width="10" height="10" fill="#1b4d2e" />
                  <rect x="45" y="10" width="10" height="20" fill="#1b4d2e" />
                  <rect x="40" y="40" width="20" height="20" fill="#1b4d2e" />
                  <rect x="15" y="45" width="20" height="10" fill="#1b4d2e" />
                  <rect x="65" y="45" width="25" height="10" fill="#1b4d2e" />
                  <rect x="45" y="70" width="15" height="20" fill="#1b4d2e" />
                  <rect x="70" y="65" width="20" height="25" fill="#1b4d2e" />
                </svg>
                <div style="display: flex; gap: 6px; width: 100%;">
                  <button class="btn-lang" style="flex:1; justify-content:center;" onclick="window.ManaCustomerUI.showToast('Launching Google Pay / PhonePe...')">
                    ⚡️ Open UPI App
                  </button>
                  <button class="btn-lang" style="flex:1; justify-content:center;" onclick="navigator.clipboard.writeText('manapalle@upi'); window.ManaCustomerUI.showToast('UPI ID copied!')">
                    📋 Copy ID
                  </button>
                </div>
              </div>
            ` : ''}

            <!-- 2. Cash on Delivery (COD) -->
            <div class="payment-card ${selectedPayment === 'cod' ? 'selected' : ''}" onclick="window._setPayment('cod')">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.4rem;">💵</span>
                <div>
                  <div style="font-size: 0.82rem; font-weight: 800;">${store.t("payCod")}</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted);">${isTe ? "ఇంటి వద్ద డెలివరీ బాయ్‌కి నగదు చెల్లించండి" : "Pay cash directly to runner at flat door"}</div>
                </div>
              </div>
              <span>${selectedPayment === 'cod' ? '✓' : '○'}</span>
            </div>

            <!-- 3. Apartment Wallet -->
            <div class="payment-card ${selectedPayment === 'wallet' ? 'selected' : ''}" onclick="window._setPayment('wallet')">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.4rem;">👛</span>
                <div>
                  <div style="font-size: 0.82rem; font-weight: 800;">${store.t("payWallet")}</div>
                  <div style="font-size: 0.7rem; color: var(--primary); font-weight: 700;">Balance: ₹${user.walletBalance.toFixed(2)}</div>
                </div>
              </div>
              <span>${selectedPayment === 'wallet' ? '✓' : '○'}</span>
            </div>
          </div>

          <button class="btn-primary" onclick="window._confirmOrderPlacement('${selectedPayment}', '${slot}', '${date}')">
            🎉 ${store.t("payNow")} (₹${totals.grandTotal})
          </button>
        </div>
      `;
    };

    window._setPayment = (m) => { selectedPayment = m; renderPaymentView(); };

    window._confirmOrderPlacement = (method, orderSlot, orderDate) => {
      const order = store.placeOrder({
        deliveryDate: orderDate,
        slot: orderSlot,
        paymentMethod: method
      });
      modalOverlay.remove();
      window.ManaCustomerUI.openOrderSuccessModal(order);
    };

    renderPaymentView();
    document.getElementById("deviceContainer").appendChild(modalOverlay);
  },

  // --- ORDER SUCCESS MODAL ---
  openOrderSuccessModal(order) {
    const store = window.manaStore;
    const isTe = store.state.lang === "te";

    const modalOverlay = document.createElement("div");
    modalOverlay.className = "modal-overlay";
    modalOverlay.id = "orderSuccessOverlay";

    modalOverlay.innerHTML = `
      <div class="modal-sheet" style="text-align: center;">
        <div class="modal-drag-handle"></div>
        <div style="padding: 16px 0;">
          <div style="width: 60px; height: 60px; background: var(--primary-soft); border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; margin: 0 auto; font-size: 2rem;">
            ✅
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--primary); margin-top: 12px;">${store.t("orderPlaced")}</h3>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
            ${store.t("orderNumber")} <b>${order.id}</b> • ₹${order.totalAmount}
          </p>
          <div style="background: var(--surface-alt); border-radius: var(--radius-md); padding: 10px; margin: 14px 0; font-size: 0.75rem; text-align: left;">
            <div>📍 <b>${order.apartmentName}</b>, Flat ${order.flatNumber}</div>
            <div>⏰ Slot: <b>${order.deliverySlot === 'morning' ? 'Morning 6:00 - 8:00 AM' : 'Evening 5:00 - 8:00 PM'}</b></div>
            <div>🛵 Status: <b style="color: var(--primary);">Procuring from Village Farm</b></div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button class="btn-primary" onclick="document.getElementById('orderSuccessOverlay').remove(); window.ManaCustomerUI.openTrackingModal('${order.id}')">
              🛵 ${store.t("trackOrder")}
            </button>
            <button class="btn-lang" style="justify-content: center;" onclick="document.getElementById('orderSuccessOverlay').remove()">
              ${isTe ? "మరిన్ని కొనండి" : "Continue Shopping"}
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("deviceContainer").appendChild(modalOverlay);
  },

  // --- LIVE ORDER TRACKING MODAL ---
  openTrackingModal(orderId) {
    const store = window.manaStore;
    const isTe = store.state.lang === "te";
    const order = store.state.orders.find(o => o.id === orderId) || store.state.orders[0];

    const modalOverlay = document.createElement("div");
    modalOverlay.className = "modal-overlay";
    modalOverlay.id = "trackingModalOverlay";

    modalOverlay.innerHTML = `
      <div class="modal-sheet">
        <div class="modal-drag-handle"></div>
        <div class="modal-header">
          <div>
            <h3 class="modal-title">🛵 ${store.t("trackOrder")}</h3>
            <span style="font-size: 0.72rem; color: var(--text-muted);">${order.id} • ${order.apartmentName}, Flat ${order.flatNumber}</span>
          </div>
          <button class="btn-close-modal" onclick="document.getElementById('trackingModalOverlay').remove()">✕</button>
        </div>

        <div class="timeline-box">
          <div class="timeline-step completed">
            <div class="timeline-icon-circle">✓</div>
            <div class="timeline-info">
              <span class="timeline-title">${store.t("orderStatusPlaced")}</span>
              <span class="timeline-desc">Order scheduled for morning village batch</span>
            </div>
          </div>
          <div class="timeline-step active">
            <div class="timeline-icon-circle">🌾</div>
            <div class="timeline-info">
              <span class="timeline-title">${store.t("orderStatusProcured")}</span>
              <span class="timeline-desc">Village shepherds & dairy packing raw harvest</span>
            </div>
          </div>
          <div class="timeline-step">
            <div class="timeline-icon-circle">📦</div>
            <div class="timeline-info">
              <span class="timeline-title">${store.t("orderStatusPacked")}</span>
              <span class="timeline-desc">Cold-packed & quality verified</span>
            </div>
          </div>
          <div class="timeline-step">
            <div class="timeline-icon-circle">🛵</div>
            <div class="timeline-info">
              <span class="timeline-title">${store.t("orderStatusOut")}</span>
              <span class="timeline-desc">Runner arriving at ${order.apartmentName} gate</span>
            </div>
          </div>
          <div class="timeline-step">
            <div class="timeline-icon-circle">🏡</div>
            <div class="timeline-info">
              <span class="timeline-title">${store.t("orderStatusDelivered")}</span>
              <span class="timeline-desc">Handed over at doorstep (6:00 - 8:00 AM)</span>
            </div>
          </div>
        </div>

        <div style="background: var(--surface-alt); border-radius: var(--radius-md); padding: 10px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 0.8rem; font-weight: 800;">Ramu (HMT Nagar Delivery Partner)</div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">Vehicle: EV Scooter</div>
          </div>
          <button class="btn-lang" onclick="window.ManaCustomerUI.showToast('Calling Partner Ramu: +91 98491 55667')">
            📞 Call
          </button>
        </div>

        <button class="btn-primary" style="margin-top: 8px;" onclick="document.getElementById('trackingModalOverlay').remove(); window.ManaCustomerUI.openRatingModal('${order.id}')">
          ⭐️ ${store.t("rateOrder")}
        </button>
      </div>
    `;

    document.getElementById("deviceContainer").appendChild(modalOverlay);
  },

  // --- ORDER HISTORY & REPEAT LAST ORDER ---
  openOrderHistoryModal() {
    const store = window.manaStore;
    const isTe = store.state.lang === "te";
    const orders = store.state.orders;

    const modalOverlay = document.createElement("div");
    modalOverlay.className = "modal-overlay";
    modalOverlay.id = "historyModalOverlay";

    modalOverlay.innerHTML = `
      <div class="modal-sheet">
        <div class="modal-drag-handle"></div>
        <div class="modal-header">
          <h3 class="modal-title">📜 ${store.t("orderHistory")}</h3>
          <button class="btn-close-modal" onclick="document.getElementById('historyModalOverlay').remove()">✕</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; max-height: 450px; overflow-y: auto;">
          ${orders.map(o => `
            <div style="background: var(--surface-alt); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 10px; display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.82rem; font-weight: 800; color: var(--primary);">${o.id}</span>
                <span style="font-size: 0.68rem; background: #d4efdf; color: #196f3d; padding: 2px 6px; border-radius: 4px; font-weight: 700;">
                  ${o.status.toUpperCase()}
                </span>
              </div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">
                ${o.deliveryDate} • ${o.deliverySlot === 'morning' ? 'Morning 6-8 AM' : 'Evening 5-8 PM'} • ${o.paymentMethod.toUpperCase()}
              </div>
              <div style="font-size: 0.74rem; border-top: 1px dashed var(--border); padding-top: 4px; margin-top: 2px;">
                ${o.items.map(it => `<div>• ${it.productTitle} (${it.quantityText})</div>`).join("")}
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                <span style="font-size: 0.88rem; font-weight: 800; color: var(--text-main);">₹${o.totalAmount}</span>
                <button class="btn-lang" onclick="window._repeatOrderAction('${o.id}')">
                  🔄 ${store.t("repeatOrder")}
                </button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    window._repeatOrderAction = (orderId) => {
      store.repeatOrder(orderId);
      modalOverlay.remove();
      window.ManaCustomerUI.openCartModal();
      window.ManaCustomerUI.showToast(isTe ? "గత ఆర్డర్ బుట్టలో చేర్చబడింది! 🧺" : "Past order items re-added to basket! 🧺");
    };

    document.getElementById("deviceContainer").appendChild(modalOverlay);
  },

  // --- MORNING HEALTH MILK SUBSCRIPTION MANAGEMENT ---
  openSubscriptionModal() {
    const store = window.manaStore;
    const isTe = store.state.lang === "te";
    const subs = store.state.subscriptions.filter(s => s.customerName === store.state.user.name);

    let selectedProdId = "prod-milk-cow";
    let selectedFrequency = "daily";
    let selectedQty = 1.0;

    const modalOverlay = document.createElement("div");
    modalOverlay.className = "modal-overlay";
    modalOverlay.id = "subModalOverlay";

    const renderSubModal = () => {
      modalOverlay.innerHTML = `
        <div class="modal-sheet">
          <div class="modal-drag-handle"></div>
          <div class="modal-header">
            <div>
              <h3 class="modal-title">🥛 ${store.t("subscriptionTitle")}</h3>
              <p style="font-size: 0.72rem; color: var(--text-muted);">${store.t("subscriptionSubtitle")}</p>
            </div>
            <button class="btn-close-modal" onclick="document.getElementById('subModalOverlay').remove()">✕</button>
          </div>

          <!-- Existing Active Subscriptions for this Resident -->
          ${subs.length > 0 ? `
            <div style="background: var(--gold-soft); border: 1px solid #f5b041; border-radius: var(--radius-md); padding: 10px;">
              <span style="font-size: 0.74rem; font-weight: 800; color: #7e5109;">${store.t("activeSubscription")}</span>
              ${subs.map(s => `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 0.74rem;">
                  <div>
                    <div style="font-weight: 800;">${isTe ? (s.productTitle_te || s.productTitle) : s.productTitle} (${s.quantityLitres}L)</div>
                    <div style="color: var(--text-muted);">${s.frequency.toUpperCase()} • Daily 6:00 - 8:00 AM</div>
                  </div>
                  <div style="display: flex; gap: 4px;">
                    <button class="btn-lang" style="padding: 2px 8px; font-size: 0.68rem;" onclick="window._toggleSub('${s.id}')">
                      ${s.status === 'active' ? store.t("pauseSubscription") : store.t("resumeSubscription")}
                    </button>
                    <button class="btn-lang" style="padding: 2px 6px; font-size: 0.68rem; color: #922b21;" onclick="window._cancelSub('${s.id}')">
                      ✕
                    </button>
                  </div>
                </div>
              `).join("")}
            </div>
          ` : ''}

          <!-- Choose Milk Variety -->
          <div>
            <label class="option-label">🐄 Milk Variety</label>
            <div class="options-row">
              <button class="option-btn ${selectedProdId === 'prod-milk-cow' ? 'selected' : ''}" onclick="window._setSubProd('prod-milk-cow')">
                Pure Cow Milk (A2) - ₹90/L
              </button>
              <button class="option-btn ${selectedProdId === 'prod-milk-buf' ? 'selected' : ''}" onclick="window._setSubProd('prod-milk-buf')">
                Village Buffalo Milk - ₹85/L
              </button>
            </div>
          </div>

          <!-- Choose Frequency: Daily or Alternate Days -->
          <div>
            <label class="option-label">📅 Delivery Frequency</label>
            <div class="options-row">
              <button class="option-btn ${selectedFrequency === 'daily' ? 'selected' : ''}" onclick="window._setSubFreq('daily')">
                ☀️ ${store.t("subscribeDaily")}
              </button>
              <button class="option-btn ${selectedFrequency === 'alternate' ? 'selected' : ''}" onclick="window._setSubFreq('alternate')">
                🔄 ${store.t("subscribeAlt")}
              </button>
            </div>
          </div>

          <!-- Quantity: 500ml, 1L, 2L -->
          <div>
            <label class="option-label">🥛 Quantity per morning</label>
            <div class="options-row">
              <button class="option-btn ${selectedQty === 0.5 ? 'selected' : ''}" onclick="window._setSubQty(0.5)">500ml</button>
              <button class="option-btn ${selectedQty === 1.0 ? 'selected' : ''}" onclick="window._setSubQty(1.0)">1 Litre</button>
              <button class="option-btn ${selectedQty === 2.0 ? 'selected' : ''}" onclick="window._setSubQty(2.0)">2 Litres</button>
            </div>
          </div>

          <div style="background: var(--surface-alt); border-radius: var(--radius-md); padding: 10px; font-size: 0.74rem;">
            <div>🚚 Doorstep: <b>${store.state.user.apartmentName}, Flat ${store.state.user.flatNumber}</b></div>
            <div>⏰ Delivery Window: <b>6:00 AM - 8:00 AM Every Morning</b></div>
            <div>✨ Pause, modify, or cancel anytime with 1 tap before 9 PM.</div>
          </div>

          <button class="btn-primary" onclick="window._createSub()">
            ✅ ${store.t("startSubscription")}
          </button>
        </div>
      `;
    };

    window._setSubProd = (p) => { selectedProdId = p; renderSubModal(); };
    window._setSubFreq = (f) => { selectedFrequency = f; renderSubModal(); };
    window._setSubQty = (q) => { selectedQty = q; renderSubModal(); };
    window._toggleSub = (id) => {
      store.toggleSubscriptionStatus(id);
      renderSubModal();
      window.ManaCustomerUI.showToast("Subscription status updated!");
    };
    window._cancelSub = (id) => {
      store.cancelSubscription(id);
      renderSubModal();
      window.ManaCustomerUI.showToast("Subscription cancelled!");
    };
    window._createSub = () => {
      store.addSubscription({
        productId: selectedProdId,
        frequency: selectedFrequency,
        quantityLitres: selectedQty
      });
      modalOverlay.remove();
      window.ManaCustomerUI.showToast(isTe ? "పాలు సబ్‌స్క్రిప్షన్ ప్రారంభమైంది! 🥛" : "Daily milk delivery activated! 🥛");
    };

    renderSubModal();
    document.getElementById("deviceContainer").appendChild(modalOverlay);
  },

  // --- REFERRAL & OFFERS MODAL ---
  openReferralModal() {
    const store = window.manaStore;
    const isTe = store.state.lang === "te";
    const user = store.state.user;

    const modalOverlay = document.createElement("div");
    modalOverlay.className = "modal-overlay";
    modalOverlay.id = "referralModalOverlay";

    modalOverlay.innerHTML = `
      <div class="modal-sheet" style="text-align: center;">
        <div class="modal-drag-handle"></div>
        <div class="modal-header">
          <h3 class="modal-title">🎁 ${store.t("referralTitle")}</h3>
          <button class="btn-close-modal" onclick="document.getElementById('referralModalOverlay').remove()">✕</button>
        </div>

        <div style="padding: 10px 0;">
          <span style="font-size: 3rem;">🏘️</span>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 8px;">${store.t("referralDesc")}</p>
          
          <div style="background: var(--primary-soft); border: 2px dashed var(--primary); border-radius: var(--radius-md); padding: 12px; margin: 14px 0;">
            <span style="font-size: 0.72rem; color: var(--text-muted);">Your Apartment Referral Code</span>
            <div style="font-size: 1.4rem; font-weight: 800; color: var(--primary); letter-spacing: 2px; margin: 4px 0;">
              ${user.referralCode}
            </div>
            <button class="btn-primary" style="margin: 8px auto 0 auto; padding: 6px 14px; font-size: 0.76rem;" onclick="navigator.clipboard.writeText('${user.referralCode}'); window.ManaCustomerUI.showToast('${store.t('codeCopied')}')">
              📋 ${store.t("copyCode")}
            </button>
          </div>

          <button class="btn-accent" style="width: 100%;" onclick="window.ManaCustomerUI.showToast('Sharing link to your Apartment WhatsApp Group!')">
            📲 ${store.t("shareWhatsApp")}
          </button>
        </div>
      </div>
    `;

    document.getElementById("deviceContainer").appendChild(modalOverlay);
  },

  // --- RATING MODAL ---
  openRatingModal(orderId) {
    const store = window.manaStore;
    const isTe = store.state.lang === "te";

    const modalOverlay = document.createElement("div");
    modalOverlay.className = "modal-overlay";
    modalOverlay.id = "ratingModalOverlay";

    let rating = 5;

    const renderRating = () => {
      modalOverlay.innerHTML = `
        <div class="modal-sheet" style="text-align: center;">
          <div class="modal-drag-handle"></div>
          <div class="modal-header">
            <h3 class="modal-title">⭐️ ${store.t("rateOrder")}</h3>
            <button class="btn-close-modal" onclick="document.getElementById('ratingModalOverlay').remove()">✕</button>
          </div>

          <div style="padding: 10px 0;">
            <div style="font-size: 2rem; letter-spacing: 6px; cursor: pointer; margin: 12px 0;">
              <span onclick="window._setRate(1)">${rating >= 1 ? '⭐️' : '☆'}</span>
              <span onclick="window._setRate(2)">${rating >= 2 ? '⭐️' : '☆'}</span>
              <span onclick="window._setRate(3)">${rating >= 3 ? '⭐️' : '☆'}</span>
              <span onclick="window._setRate(4)">${rating >= 4 ? '⭐️' : '☆'}</span>
              <span onclick="window._setRate(5)">${rating >= 5 ? '⭐️' : '☆'}</span>
            </div>
            <textarea id="feedbackText" class="custom-textarea" placeholder="${isTe ? 'పాలు లేదా చేపలు లేదా మటన్ నాణ్యత ఎలా ఉంది?' : 'How was the milk sweetness, fish cleaning, or mutton tenderness?'}"></textarea>

            <button class="btn-primary" style="width: 100%; margin-top: 14px;" onclick="window._submitRate()">
              ✅ ${store.t("submitRating")}
            </button>
          </div>
        </div>
      `;
    };

    window._setRate = (r) => { rating = r; renderRating(); };
    window._submitRate = () => {
      const text = document.getElementById("feedbackText")?.value || "Great fresh quality!";
      store.state.reviews.push({
        customerName: store.state.user.name,
        flat: store.state.user.flatNumber,
        rating: rating,
        comment: text
      });
      modalOverlay.remove();
      window.ManaCustomerUI.showToast(store.t("ratingThankYou"));
    };

    renderRating();
    document.getElementById("deviceContainer").appendChild(modalOverlay);
  },

  // --- APARTMENT PICKER MODAL ---
  openApartmentModal() {
    const store = window.manaStore;
    const isTe = store.state.lang === "te";
    const apartments = window.MANA_APARTMENTS;
    const currentUser = store.state.user;

    const modalOverlay = document.createElement("div");
    modalOverlay.className = "modal-overlay";
    modalOverlay.id = "apartmentModalOverlay";

    modalOverlay.innerHTML = `
      <div class="modal-sheet">
        <div class="modal-drag-handle"></div>
        <div class="modal-header">
          <div>
            <h3 class="modal-title">🏢 ${store.t("selectApartment")}</h3>
            <span style="font-size: 0.72rem; color: var(--text-muted);">${store.t("apartmentHelp")}</span>
          </div>
          <button class="btn-close-modal" onclick="document.getElementById('apartmentModalOverlay').remove()">✕</button>
        </div>

        <div>
          <label class="option-label">1. Choose Gated Apartment</label>
          <select id="aptSelectInput" class="custom-textarea" style="height: 42px; padding: 6px;">
            ${apartments.map(a => `
              <option value="${a.id}" ${currentUser.apartmentId === a.id ? 'selected' : ''}>
                ${a.name} (${a.landmark})
              </option>
            `).join("")}
          </select>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <div>
            <label class="option-label">2. Block / Wing</label>
            <input type="text" id="blockInput" class="custom-textarea" style="height: 42px;" value="${currentUser.blockWing || 'A'}" placeholder="e.g. Block A" />
          </div>
          <div>
            <label class="option-label">3. Flat Number</label>
            <input type="text" id="flatInput" class="custom-textarea" style="height: 42px;" value="${currentUser.flatNumber || '204'}" placeholder="e.g. 204" />
          </div>
        </div>

        <button class="btn-primary" onclick="window._saveApt()">
          💾 ${store.t("saveAddress")}
        </button>
      </div>
    `;

    window._saveApt = () => {
      const aptId = document.getElementById("aptSelectInput").value;
      const block = document.getElementById("blockInput").value;
      const flat = document.getElementById("flatInput").value;
      store.setApartment(aptId, block, flat);
      modalOverlay.remove();
      window.ManaCustomerUI.showToast(isTe ? "చిరునామా సేవ్ చేయబడింది! 🏢" : "Apartment address saved! 🏢");
    };

    document.getElementById("deviceContainer").appendChild(modalOverlay);
  },

  // --- MOBILE NUMBER + OTP LOGIN MODAL ---
  openLoginModal() {
    const store = window.manaStore;
    const isTe = store.state.lang === "te";
    const apartments = window.MANA_APARTMENTS;
    const currentUser = store.state.user;

    const modalOverlay = document.createElement("div");
    modalOverlay.className = "modal-overlay";
    modalOverlay.id = "loginModalOverlay";

    let otpSent = false;

    const render = () => {
      modalOverlay.innerHTML = `
        <div class="modal-sheet">
          <div class="modal-drag-handle"></div>
          <div class="modal-header">
            <div>
              <h3 class="modal-title">📱 ${isTe ? "మొబైల్ లాగిన్ / ప్రొఫైల్" : "Mobile Login & Resident Profile"}</h3>
              <span style="font-size: 0.72rem; color: var(--text-muted);">${store.t("loginSubtitle")}</span>
            </div>
            <button class="btn-close-modal" onclick="document.getElementById('loginModalOverlay').remove()">✕</button>
          </div>

          <!-- Phone Number & OTP Section -->
          <div>
            <label class="option-label">1. ${isTe ? "మొబైల్ నంబర్" : "Mobile Number"}</label>
            <div style="display:flex; gap:6px;">
              <input type="tel" id="loginPhoneInput" class="custom-textarea" style="height:42px; font-weight:700;" value="${currentUser.phone || '98490 12345'}" placeholder="e.g. 98490 12345" />
              <button class="btn-lang" style="white-space:nowrap; padding:6px 12px; font-weight:700;" onclick="window._sendLoginOtp()">
                ${otpSent ? (isTe ? "మళ్ళీ పంపండి" : "Resend") : (isTe ? "ఓటీపీ పంపండి" : "Send OTP")}
              </button>
            </div>
            ${otpSent ? `
              <div style="margin-top:8px; background:var(--surface-alt); padding:10px; border-radius:var(--radius-sm); border:1px solid var(--accent);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size:0.72rem; font-weight:800; color:var(--accent);">
                    🔑 ${isTe ? "4 అంకెల ఓటీపీ నమోదు చేయండి" : "Enter 4-Digit OTP"}
                  </span>
                  <span style="font-size:0.68rem; color:var(--primary); font-weight:700;">Demo OTP: 1234</span>
                </div>
                <input type="text" id="otpValueInput" maxlength="4" class="custom-textarea" style="height:40px; font-size:1.1rem; text-align:center; letter-spacing:8px; font-weight:800; margin-top:4px;" value="1234" />
              </div>
            ` : ''}
          </div>

          <!-- Resident Name -->
          <div>
            <label class="option-label">2. ${isTe ? "మీ పేరు" : "Full Name"}</label>
            <input type="text" id="loginNameInput" class="custom-textarea" style="height:42px;" value="${currentUser.name || 'Srinivas Rao'}" placeholder="e.g. Srinivas Rao" />
          </div>

          <!-- Choose Apartment from 10 HMT Nagar list -->
          <div>
            <label class="option-label">3. ${isTe ? "అపార్ట్మెంట్ ఎంచుకోండి" : "Select Apartment (HMT Nagar Pilot)"}</label>
            <select id="loginAptSelect" class="custom-textarea" style="height:42px; padding:6px;">
              ${apartments.map(a => `
                <option value="${a.id}" ${currentUser.apartmentId === a.id ? 'selected' : ''}>
                  ${a.name} (${a.landmark})
                </option>
              `).join("")}
            </select>
          </div>

          <!-- Block & Flat -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div>
              <label class="option-label">4. ${isTe ? "బ్లాక్ / వింగ్" : "Block / Wing"}</label>
              <input type="text" id="loginBlockInput" class="custom-textarea" style="height: 42px;" value="${currentUser.blockWing || 'A'}" placeholder="e.g. Block A" />
            </div>
            <div>
              <label class="option-label">5. ${isTe ? "ఫ్లాట్ నంబర్" : "Flat Number"}</label>
              <input type="text" id="loginFlatInput" class="custom-textarea" style="height: 42px;" value="${currentUser.flatNumber || '204'}" placeholder="e.g. 204" />
            </div>
          </div>

          <!-- Submit Button -->
          <button class="btn-primary" onclick="window._submitLogin()">
            ✓ ${isTe ? "ధృవీకరించి ప్రవేశించండి" : "Verify & Save Resident Profile"}
          </button>
        </div>
      `;
    };

    window._sendLoginOtp = () => {
      otpSent = true;
      render();
      window.ManaCustomerUI.showToast(isTe ? "ఓటీపీ పంపబడింది: 1234 📩" : "OTP Sent: 1234 📩");
    };

    window._submitLogin = () => {
      const phone = document.getElementById("loginPhoneInput")?.value || currentUser.phone;
      const name = document.getElementById("loginNameInput")?.value || currentUser.name;
      const aptId = document.getElementById("loginAptSelect")?.value || currentUser.apartmentId;
      const block = document.getElementById("loginBlockInput")?.value || currentUser.blockWing;
      const flat = document.getElementById("loginFlatInput")?.value || currentUser.flatNumber;
      
      const aptObj = apartments.find(a => a.id === aptId) || apartments[0];

      store.loginUser({
        phone: phone,
        name: name,
        apartmentId: aptObj.id,
        apartmentName: aptObj.name,
        blockWing: block,
        flatNumber: flat
      });

      modalOverlay.remove();
      window.ManaCustomerUI.showToast(isTe ? `స్వాగతం, ${name}! 🏡` : `Welcome, ${name}! 🏡`);
    };

    render();
    document.getElementById("deviceContainer").appendChild(modalOverlay);
  },

  // --- SUBTLE 'Z' STAFF & OWNER GATE MODAL ---
  openStaffGateModal() {
    const store = window.manaStore;
    const isTe = store.state.lang === "te";

    const modalOverlay = document.createElement("div");
    modalOverlay.className = "modal-overlay";
    modalOverlay.id = "staffGateModalOverlay";

    let activeRole = "admin"; // "admin" | "delivery"
    let errorMessage = "";

    const render = () => {
      modalOverlay.innerHTML = `
        <div class="modal-sheet" id="staffGateSheet" style="border: 2px solid ${activeRole === 'admin' ? '#d35400' : '#2980b9'};">
          <div class="modal-drag-handle"></div>
          
          <div class="modal-header">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="background: ${activeRole === 'admin' ? '#d35400' : '#2980b9'}; color:#fff; width:28px; height:28px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; font-weight:800; font-size:0.9rem;">
                Z
              </span>
              <div>
                <h3 class="modal-title">
                  ${activeRole === 'admin' ? 'Owner / Admin Portal' : 'Delivery Partner Run-Sheet'}
                </h3>
                <span style="font-size:0.7rem; color:var(--text-muted);">
                  Restricted Access • Approved Accounts Only
                </span>
              </div>
            </div>
            <button class="btn-close-modal" onclick="document.getElementById('staffGateModalOverlay').remove()">✕</button>
          </div>

          <!-- Role Toggle (Owner vs Delivery Partner) -->
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; margin: 8px 0 12px;">
            <button class="btn-lang ${activeRole === 'admin' ? 'active-admin-tab' : ''}" style="justify-content:center; padding:7px; font-size:0.75rem; font-weight:700;" onclick="window._setGateRole('admin')">
              👑 Owner (Admin)
            </button>
            <button class="btn-lang ${activeRole === 'delivery' ? 'active-admin-tab' : ''}" style="justify-content:center; padding:7px; font-size:0.75rem; font-weight:700;" onclick="window._setGateRole('delivery')">
              🛵 Delivery Partner
            </button>
          </div>

          ${errorMessage ? `
            <div id="gateAlertBox" style="background:#fadbd8; color:#922b21; border:1px solid #e74c3c; border-radius:var(--radius-sm); padding:10px; font-size:0.75rem; font-weight:700; margin-bottom:12px; display:flex; align-items:center; gap:8px;" class="shake-error">
              <span>🚫</span>
              <span>${errorMessage}</span>
            </div>
          ` : ''}

          <!-- Credentials Form -->
          <div style="display:flex; flex-direction:column; gap:10px;">
            <div>
              <label class="option-label">
                ${activeRole === 'admin' ? 'Owner Registered Mobile / Email' : 'Delivery Partner Mobile'}
              </label>
              <input type="text" id="gateUserInput" class="custom-textarea" style="height:42px; font-weight:700;" 
                placeholder="${activeRole === 'admin' ? 'e.g. 98490 99999 or admin@manapallefresh.com' : 'e.g. 98490 88771'}" 
                value="${activeRole === 'admin' ? '98490 99999' : '98490 88771'}" />
              <div style="font-size:0.65rem; color:var(--text-muted); margin-top:2px;">
                ${activeRole === 'admin' ? 'Approved Owner: 98490 99999' : 'Approved Runner: 98490 88771 (Ramu)'}
              </div>
            </div>

            <div>
              <label class="option-label">Security PIN / OTP</label>
              <input type="password" id="gatePassInput" class="custom-textarea" style="height:42px; font-size:1.1rem; letter-spacing:4px; font-weight:800;" 
                placeholder="PIN" value="${activeRole === 'admin' ? '7890' : '1234'}" />
              <div style="font-size:0.65rem; color:var(--text-muted); margin-top:2px;">
                ${activeRole === 'admin' ? 'Default Owner PIN: 7890' : 'Runner PIN: 1234'}
              </div>
            </div>

            <button class="btn-primary" style="justify-content:center; padding:12px; font-size:0.85rem; font-weight:800; background:${activeRole === 'admin' ? '#d35400' : '#2980b9'};" onclick="window._verifyGateCredentials()">
              🔐 Enter Secure ${activeRole === 'admin' ? 'Admin Dashboard' : 'Delivery Portal'}
            </button>

            <!-- Direct URL Links for separate tab / bookmarking -->
            <div style="text-align:center; margin-top:4px;">
              <a href="/admin.html" target="_blank" style="font-size:0.72rem; color:var(--text-muted); text-decoration:underline;">
                ↗ Open dedicated Admin Dashboard in new tab (/admin.html)
              </a>
            </div>
          </div>
        </div>
      `;
    };

    window._setGateRole = (role) => {
      activeRole = role;
      errorMessage = "";
      render();
    };

    window._verifyGateCredentials = () => {
      const user = (document.getElementById("gateUserInput")?.value || "").trim().toLowerCase();
      const pass = (document.getElementById("gatePassInput")?.value || "").trim();

      if (activeRole === "admin") {
        const isApprovedOwner = (user === "98490 99999" || user === "9849099999" || user === "admin@manapallefresh.com" || user === "owner@manapallefresh.com") && (pass === "7890" || pass === "1234");
        
        if (isApprovedOwner) {
          sessionStorage.setItem("MANA_STAFF_AUTH", JSON.stringify({ role: "admin", user: user, verifiedAt: Date.now() }));
          modalOverlay.remove();
          window.ManaCustomerUI.showToast("✓ Owner authenticated! Launching Dashboard...");
          setTimeout(() => {
            window.location.href = "/admin.html";
          }, 350);
        } else {
          errorMessage = "Access denied. Only the owner's approved account can enter.";
          render();
        }
      } else {
        const isApprovedRunner = (user.includes("88771") || user.includes("88772") || user.includes("88773") || user === "ramu") && (pass === "1234");
        
        if (isApprovedRunner) {
          sessionStorage.setItem("MANA_STAFF_AUTH", JSON.stringify({ role: "delivery", user: user, verifiedAt: Date.now() }));
          modalOverlay.remove();
          window.ManaCustomerUI.showToast("✓ Delivery partner verified! Launching Run-Sheet...");
          setTimeout(() => {
            window.location.href = "/delivery.html";
          }, 350);
        } else {
          errorMessage = "Access denied. Only registered delivery runners can enter.";
          render();
        }
      }
    };

    render();
    document.getElementById("deviceContainer").appendChild(modalOverlay);
  },

  showToast(message) {
    const toast = document.createElement("div");
    toast.style.cssText = `
      position: absolute;
      top: 60px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(27, 77, 46, 0.95);
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 9999px;
      font-size: 0.76rem;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      z-index: 9999;
      pointer-events: none;
      animation: fadeIn 0.2s ease;
      white-space: nowrap;
    `;
    toast.textContent = message;
    document.getElementById("deviceContainer")?.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }
};
