// Mana Palle Fresh - Reactive State Store (Strictly 3 Pure Categories)

class ManaStore {
  constructor() {
    this.STORAGE_KEY = "MANA_PALLE_FRESH_3CATS_V2";
    this.listeners = [];
    this.initState();
  }

  initState() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        this.state = JSON.parse(saved);
        if (!this.state.products || this.state.products.length === 0) {
          this.state.products = [...window.MANA_PRODUCTS];
        }
        if (!this.state.orders || this.state.orders.length === 0) {
          this.state.orders = [...window.MANA_SEED_ORDERS];
        }
        if (!this.state.subscriptions || this.state.subscriptions.length === 0) {
          this.state.subscriptions = [...window.MANA_SEED_SUBSCRIPTIONS];
        }
      } catch (e) {
        console.error("State parse error, restoring defaults:", e);
        this.resetToDefaults();
      }
    } else {
      this.resetToDefaults();
    }
  }

  resetToDefaults() {
    this.state = {
      lang: "en",
      currentRole: "customer", // 'customer' | 'admin' | 'delivery'
      activeCategory: "mutton", // Default first of 3 categories
      user: {
        isLoggedIn: true,
        phone: "98490 12345",
        name: "Srinivas Rao",
        apartmentId: "apt-1",
        apartmentName: "Raghavendra Nilayam",
        blockWing: "A",
        flatNumber: "204",
        walletBalance: 150.00,
        referralCode: "HMT204"
      },
      cart: [
        {
          productId: "prod-mut-1",
          title_en: "Village Country Mutton",
          title_te: "పల్లెటూరి నాటు మటన్",
          cutId: "cut-curry",
          cutName_en: "Curry Cut (Medium Bone-in)",
          cutName_te: "కర్రీ కట్ (ఎముకల కూర ముక్కలు)",
          weightLabel: "1 kg",
          weightMultiplier: 1.0,
          unitPrice: 850,
          quantity: 1,
          totalPrice: 850,
          instructions: "Medium curry pieces, wash with yellow turmeric"
        },
        {
          productId: "prod-milk-1",
          title_en: "Pure Raw A2 Desi Cow Milk",
          title_te: "స్వచ్ఛమైన నాటు ఆవు పాలు",
          cutId: "pack-bottle",
          cutName_en: "Returnable Glass Bottle",
          cutName_te: "గాజు సీసా",
          weightLabel: "1 Litre",
          weightMultiplier: 1.0,
          unitPrice: 90,
          quantity: 1,
          totalPrice: 90,
          instructions: "Deliver in morning 7 AM milk box"
        }
      ],
      subscriptions: [...window.MANA_SEED_SUBSCRIPTIONS],
      products: [...window.MANA_PRODUCTS],
      orders: [...window.MANA_SEED_ORDERS],
      selectedOrderToTrack: "ORD-9101",
      reviews: [
        { customerName: "Vani S.", flat: "A-302, Raghavendra", rating: 5, comment: "The A2 cow milk has genuine golden malai. Mutton was tender and sweet!" },
        { customerName: "Rajesh K.", flat: "W2-402, Aditya", rating: 5, comment: "Korrameenu pond fish was fresh and firm. Free descaling made it so easy." }
      ]
    };
    this.saveState();
  }

  saveState() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn("Storage quota error:", e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  // --- LOCALIZATION & NAVIGATION ---
  setLanguage(lang) {
    this.state.lang = lang;
    this.saveState();
  }

  toggleLanguage() {
    this.state.lang = this.state.lang === "en" ? "te" : "en";
    this.saveState();
  }

  t(key) {
    const lang = this.state.lang || "en";
    const dict = window.MANA_TRANSLATIONS[lang] || window.MANA_TRANSLATIONS.en;
    return dict[key] || window.MANA_TRANSLATIONS.en[key] || key;
  }

  setRole(role) {
    this.state.currentRole = role;
    this.saveState();
  }

  setActiveCategory(catId) {
    this.state.activeCategory = catId;
    this.saveState();
  }

  // --- ADDRESS / APARTMENT ---
  setApartment(aptId, blockWing, flatNumber) {
    const apt = window.MANA_APARTMENTS.find(a => a.id === aptId);
    if (apt) {
      this.state.user.apartmentId = apt.id;
      this.state.user.apartmentName = apt.name;
    }
    if (blockWing) this.state.user.blockWing = blockWing;
    if (flatNumber) this.state.user.flatNumber = flatNumber;
    this.saveState();
  }

  // --- CART OPERATIONS ---
  addToCart(product, cut, weight, instructions = "") {
    const unitPrice = (product.basePrice + (cut?.priceDelta || 0)) * (weight?.multiplier || 1.0);
    const existingIndex = this.state.cart.findIndex(
      item => item.productId === product.id && item.cutId === cut?.id && item.weightLabel === weight?.label
    );

    if (existingIndex > -1) {
      this.state.cart[existingIndex].quantity += 1;
      this.state.cart[existingIndex].totalPrice = this.state.cart[existingIndex].quantity * unitPrice;
    } else {
      this.state.cart.push({
        productId: product.id,
        title_en: product.title_en,
        title_te: product.title_te,
        cutId: cut?.id || "default",
        cutName_en: cut?.name_en || "Standard Cut",
        cutName_te: cut?.name_te || "ప్రామాణిక కట్",
        weightLabel: weight?.label || "1 Unit",
        weightMultiplier: weight?.multiplier || 1.0,
        unitPrice: Math.round(unitPrice),
        quantity: 1,
        totalPrice: Math.round(unitPrice),
        instructions: instructions || ""
      });
    }
    this.saveState();
  }

  updateCartQty(index, delta) {
    if (!this.state.cart[index]) return;
    this.state.cart[index].quantity += delta;
    if (this.state.cart[index].quantity <= 0) {
      this.state.cart.splice(index, 1);
    } else {
      this.state.cart[index].totalPrice = this.state.cart[index].quantity * this.state.cart[index].unitPrice;
    }
    this.saveState();
  }

  getCartTotals() {
    const subtotal = this.state.cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const deliveryFee = 0; // Free for 10 HMT Nagar pilot apartments!
    let walletDiscount = 0;
    if (this.state.user.walletBalance > 0 && subtotal > 0) {
      walletDiscount = Math.min(50, this.state.user.walletBalance);
    }
    const grandTotal = Math.max(0, subtotal + deliveryFee - walletDiscount);
    return { subtotal, deliveryFee, walletDiscount, grandTotal, itemCount: this.state.cart.length };
  }

  // --- ORDERS ---
  placeOrder({ deliveryDate = "Tomorrow", slot = "morning_6_9", paymentMethod = "upi", notes = "" }) {
    const totals = this.getCartTotals();
    const orderNumber = "ORD-" + Math.floor(1000 + Math.random() * 9000);

    const newOrder = {
      id: orderNumber,
      customerName: this.state.user.name || "Resident",
      customerPhone: this.state.user.phone,
      apartmentId: this.state.user.apartmentId,
      apartmentName: this.state.user.apartmentName,
      blockWing: this.state.user.blockWing,
      flatNumber: this.state.user.flatNumber,
      deliveryDate: deliveryDate,
      deliverySlot: slot,
      status: "placed",
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      totalAmount: totals.grandTotal,
      discountAmount: totals.walletDiscount,
      items: this.state.cart.map(item => ({
        productId: item.productId,
        productTitle: this.state.lang === "te" ? item.title_te : item.title_en,
        cutName: this.state.lang === "te" ? item.cutName_te : item.cutName_en,
        quantityText: `${item.quantity} x ${item.weightLabel}`,
        price: item.totalPrice,
        instructions: item.instructions
      })),
      notes: notes,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16)
    };

    if (totals.walletDiscount > 0) {
      this.state.user.walletBalance -= totals.walletDiscount;
    }

    this.state.orders.unshift(newOrder);
    this.state.selectedOrderToTrack = newOrder.id;
    this.state.cart = [];
    this.saveState();
    return newOrder;
  }

  repeatOrder(orderId) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return false;
    this.state.cart = [];
    order.items.forEach(it => {
      const prod = this.state.products.find(p => p.id === it.productId) || this.state.products[0];
      const cut = prod.cuts ? prod.cuts[0] : null;
      const weight = prod.weights ? prod.weights[0] : null;
      this.addToCart(prod, cut, weight, it.instructions || "");
    });
    this.saveState();
    return true;
  }

  // --- MILK SUBSCRIPTIONS ---
  addSubscription({ productId, frequency, quantityLitres }) {
    const prod = this.state.products.find(p => p.id === productId) || this.state.products.find(p => p.categoryId === "milk");
    const subId = "SUB-" + Math.floor(100 + Math.random() * 900);
    const pricePerDay = (prod ? prod.basePrice : 90) * quantityLitres;

    this.state.subscriptions.push({
      id: subId,
      customerName: this.state.user.name,
      customerPhone: this.state.user.phone,
      apartmentName: this.state.user.apartmentName,
      flatNumber: this.state.user.flatNumber,
      productId: prod.id,
      productTitle: prod.title_en,
      productTitle_te: prod.title_te,
      quantityLitres: quantityLitres,
      frequency: frequency, // 'daily' or 'alternate'
      slot: "morning_6_9",
      status: "active",
      pricePerDay: pricePerDay
    });
    this.saveState();
  }

  toggleSubscriptionStatus(subId) {
    const sub = this.state.subscriptions.find(s => s.id === subId);
    if (sub) {
      sub.status = sub.status === "active" ? "paused" : "active";
      this.saveState();
    }
  }

  cancelSubscription(subId) {
    this.state.subscriptions = this.state.subscriptions.filter(s => s.id !== subId);
    this.saveState();
  }

  // --- ADMIN: DAILY MARKET RATES ---
  updateDailyPrice(productId, newPrice) {
    const prod = this.state.products.find(p => p.id === productId);
    if (prod && !isNaN(newPrice)) {
      prod.basePrice = Number(newPrice);
      this.saveState();
    }
  }

  updateStockStatus(productId, isAvailable) {
    const prod = this.state.products.find(p => p.id === productId);
    if (prod) {
      prod.isAvailable = isAvailable;
      this.saveState();
    }
  }

  updateOrderStatus(orderId, newStatus, paymentStatus = null) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      if (paymentStatus) order.paymentStatus = paymentStatus;
      this.saveState();
    }
  }

  // --- ADMIN: DAILY PROCUREMENT SHEET (EXCLUSIVELY 3 CATEGORIES) ---
  calculateProcurementSheet() {
    const sheet = {
      mutton: {
        totalKg: 0,
        cuts: {
          "Curry Cut": 0,
          "Boneless": 0,
          "Keema": 0,
          "Liver": 0,
          "Paya": 0
        }
      },
      fish: {
        totalKg: 0,
        murrelKg: 0,
        rohuKatlaKg: 0,
        options: {
          "Curry Cut": 0,
          "Cleaned": 0,
          "Whole": 0
        }
      },
      milk: {
        totalLitres: 0,
        cowMilkLitres: 0,
        buffaloMilkLitres: 0,
        subscriptionLitres: 0,
        onDemandLitres: 0
      }
    };

    // 1. Tally from active morning milk subscriptions
    this.state.subscriptions.forEach(sub => {
      if (sub.status === "active") {
        sheet.milk.totalLitres += sub.quantityLitres;
        sheet.milk.subscriptionLitres += sub.quantityLitres;
        if (sub.productId.includes("buf") || (sub.productTitle || "").toLowerCase().includes("buffalo")) {
          sheet.milk.buffaloMilkLitres += sub.quantityLitres;
        } else {
          sheet.milk.cowMilkLitres += sub.quantityLitres;
        }
      }
    });

    // 2. Tally from today's/tomorrow's pending orders
    this.state.orders.forEach(order => {
      if (order.status !== "delivered" && order.status !== "cancelled") {
        order.items.forEach(it => {
          const title = (it.productTitle || "").toLowerCase();
          const cut = (it.cutName || "").toLowerCase();
          const qtyText = (it.quantityText || "").toLowerCase();

          // 1. Mutton tally
          if (title.includes("mutton") || it.productId.includes("mut")) {
            let weight = 1.0;
            if (qtyText.includes("250g") || qtyText.includes("0.25")) weight = 0.25;
            else if (qtyText.includes("500g") || qtyText.includes("0.5")) weight = 0.5;
            else if (qtyText.includes("2 kg")) weight = 2.0;

            sheet.mutton.totalKg += weight;
            if (cut.includes("keema")) sheet.mutton.cuts["Keema"] += weight;
            else if (cut.includes("boneless")) sheet.mutton.cuts["Boneless"] += weight;
            else if (cut.includes("liver")) sheet.mutton.cuts["Liver"] += weight;
            else if (cut.includes("paya")) sheet.mutton.cuts["Paya"] += weight;
            else sheet.mutton.cuts["Curry Cut"] += weight;
          }

          // 2. Fish tally
          if (title.includes("fish") || it.productId.includes("fish")) {
            let weight = 1.0;
            if (qtyText.includes("500g") || qtyText.includes("0.5")) weight = 0.5;
            else if (qtyText.includes("2 kg")) weight = 2.0;

            sheet.fish.totalKg += weight;
            if (title.includes("korrameenu") || title.includes("murrel")) {
              sheet.fish.murrelKg += weight;
            } else {
              sheet.fish.rohuKatlaKg += weight;
            }

            if (cut.includes("whole")) sheet.fish.options["Whole"] += weight;
            else if (cut.includes("cleaned")) sheet.fish.options["Cleaned"] += weight;
            else sheet.fish.options["Curry Cut"] += weight;
          }

          // 3. On-demand milk bottles
          if (title.includes("milk") || it.productId.includes("milk")) {
            let litres = 1.0;
            if (qtyText.includes("500ml") || qtyText.includes("0.5")) litres = 0.5;
            else if (qtyText.includes("2 litre") || qtyText.includes("2l")) litres = 2.0;

            sheet.milk.totalLitres += litres;
            sheet.milk.onDemandLitres += litres;
            if (title.includes("buffalo")) sheet.milk.buffaloMilkLitres += litres;
            else sheet.milk.cowMilkLitres += litres;
          }
        });
      }
    });

    return sheet;
  }

  // --- DELIVERY PARTNERS ---
  getDeliveryPartners() {
    return [
      { id: "del-1", name: "Ramu (Active Runner)", phone: "98490 88771", area: "HMT Nagar Main & Community Hall", status: "on_route" },
      { id: "del-2", name: "Shiva (Morning Batch)", phone: "98490 88772", area: "Water Tank & Park Road", status: "available" },
      { id: "del-3", name: "Naresh (Evening)", phone: "98490 88773", area: "D-Mart & Post Office Road", status: "standby" }
    ];
  }

  assignDeliveryPartner(orderId, partnerId) {
    const order = this.state.orders.find(o => o.id === orderId);
    const partner = this.getDeliveryPartners().find(p => p.id === partnerId);
    if (order && partner) {
      order.deliveryPartnerId = partner.id;
      order.deliveryPartnerName = partner.name;
      order.deliveryPartnerPhone = partner.phone;
      this.saveState();
      return true;
    }
    return false;
  }

  // --- USER AUTHENTICATION & PROFILE ---
  loginUser(userData) {
    this.state.user = {
      ...this.state.user,
      ...userData,
      isLoggedIn: true
    };
    this.saveState();
  }

  logoutUser() {
    this.state.user.isLoggedIn = false;
    this.saveState();
  }

  // --- PUSH NOTIFICATION BROADCAST ---
  sendPushNotification(title, message) {
    const notification = {
      id: "NOTIF-" + Date.now(),
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    if (!this.state.notifications) {
      this.state.notifications = [];
    }
    this.state.notifications.unshift(notification);
    this.saveState();
    return notification;
  }

  // --- SALES & REVENUE REPORTS (DAILY / WEEKLY / MONTHLY) ---
  getSalesReports() {
    const orders = this.state.orders;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const paidRevenue = orders.filter(o => o.paymentStatus === "paid").reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const codPendingRevenue = orders.filter(o => o.paymentMethod === "cod" && o.paymentStatus !== "paid").reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Service category revenue breakdown
    let milkRevenue = 0;
    let fishRevenue = 0;
    let muttonRevenue = 0;

    orders.forEach(o => {
      (o.items || []).forEach(it => {
        const title = (it.productTitle || "").toLowerCase();
        const amt = it.totalPrice || 0;
        if (title.includes("milk")) milkRevenue += amt;
        else if (title.includes("fish") || title.includes("rohu") || title.includes("katla")) fishRevenue += amt;
        else if (title.includes("mutton")) muttonRevenue += amt;
      });
    });

    // Subscriptions estimated monthly MRR (30 days)
    const activeSubs = this.state.subscriptions.filter(s => s.status === "active");
    const dailySubLitres = activeSubs.reduce((sum, s) => sum + (s.quantityLitres || 0), 0);
    const dailySubRevenue = activeSubs.reduce((sum, s) => sum + (s.pricePerDay || 0), 0);
    const monthlyMilkMRR = dailySubRevenue * 30;

    return {
      totalOrders: orders.length,
      deliveredOrders: orders.filter(o => o.status === "delivered").length,
      pendingOrders: orders.filter(o => o.status !== "delivered" && o.status !== "cancelled").length,
      totalRevenue,
      paidRevenue,
      codPendingRevenue,
      categoryBreakdown: {
        milk: milkRevenue,
        fish: fishRevenue,
        mutton: muttonRevenue
      },
      subscriptions: {
        activeCount: activeSubs.length,
        dailyLitres: dailySubLitres,
        dailyRevenue: dailySubRevenue,
        monthlyMRR: monthlyMilkMRR
      },
      daily: {
        label: "Today's Deliveries",
        orders: orders.length,
        revenue: totalRevenue,
        topItem: "Village Mutton (1kg)"
      },
      weekly: {
        label: "This Week (Projected)",
        orders: orders.length * 6,
        revenue: totalRevenue * 5.8,
        topItem: "Desi Cow Milk (A2)"
      },
      monthly: {
        label: "Monthly Run-Rate (MRR)",
        orders: orders.length * 26,
        revenue: Math.round(totalRevenue * 24 + monthlyMilkMRR),
        topItem: "Fresh Rohu Steaks"
      }
    };
  }

  // --- CUSTOMER DIRECTORY WITH ORDER HISTORY ---
  getCustomerDirectory() {
    const customerMap = {};

    // From orders
    this.state.orders.forEach(o => {
      const key = o.customerPhone || o.customerName;
      if (!customerMap[key]) {
        customerMap[key] = {
          name: o.customerName,
          phone: o.customerPhone,
          apartmentName: o.apartmentName,
          flatNumber: o.flatNumber,
          ordersCount: 0,
          totalSpend: 0,
          orders: [],
          hasActiveMilkSub: false
        };
      }
      customerMap[key].ordersCount += 1;
      customerMap[key].totalSpend += (o.totalAmount || 0);
      customerMap[key].orders.push(o);
    });

    // Cross-reference with milk subscriptions
    this.state.subscriptions.forEach(s => {
      const key = s.customerPhone || s.customerName;
      if (customerMap[key]) {
        customerMap[key].hasActiveMilkSub = s.status === "active";
        customerMap[key].milkLitres = s.quantityLitres;
      } else {
        customerMap[key] = {
          name: s.customerName,
          phone: s.customerPhone,
          apartmentName: s.apartmentName,
          flatNumber: s.flatNumber,
          ordersCount: 0,
          totalSpend: s.pricePerDay * 30,
          orders: [],
          hasActiveMilkSub: s.status === "active",
          milkLitres: s.quantityLitres
        };
      }
    });

    return Object.values(customerMap);
  }

  // --- WHATSAPP DAILY BROADCAST TEXT ---
  generateWhatsAppDailyOffer() {
    const isTe = this.state.lang === "te";
    const mutPrice = this.state.products.find(p => p.categoryId === "mutton")?.basePrice || 850;
    const fishPrice = this.state.products.find(p => p.categoryId === "fish")?.basePrice || 240;
    const milkPrice = this.state.products.find(p => p.categoryId === "milk")?.basePrice || 90;

    if (isTe) {
      return `🌿 *మన పల్లె ఫ్రెష్ - నేటి తాజా ధరలు (హెచ్.ఎం.టి నగర్)* 🌿\n\n` +
        `గ్రామాల నుండి నేరుగా స్వచ్ఛమైన ఆహారం మీ ఫ్లాట్ డోర్‌స్టెప్ వద్దకు:\n` +
        `🥛 *1. ఉదయపు ఆరోగ్యకరమైన పాలు* - ₹${milkPrice}/లీటరు\n` +
        `   • స్వచ్ఛమైన నాటు ఆవు (A2) & చిక్కటి గేదె పాలు (500ml, 1L, 2L)\n` +
        `   • ప్రతి ఉదయం 6:00 - 8:00 AM లోపు మీ ఫ్లాట్ డెలివరీ | డైలీ సబ్‌స్క్రిప్షన్\n\n` +
        `🐟 *2. తాజా చెరువు చేపలు* - ₹${fishPrice}/kg\n` +
        `   • మంచినీటి రోహు & బొచ్చె (కాట్లా) | ఉచిత పొలుసులు & కూర ముక్కలు\n\n` +
        `🥩 *3. తాజా పల్లెటూరి మటన్* - ₹${mutPrice}/kg\n` +
        `   • పసుపు నీటి శుభ్రత | కర్రీ కట్, బోన్‌లెస్, కీమా, లివర్, పాయా\n\n` +
        `🚚 *డెలివరీ స్లాట్స్:* రేపు ఉదయం 6:00 - 8:00 AM | సాయంత్రం 5:00 - 8:00 PM\n` +
        `👉 ఈ రాత్రి 10:00 లోపు ఆర్డర్ చేయండి:\n` +
        `📲 వెబ్‌సైట్: https://beige-cycles-sleep.loca.lt\n` +
        `📞 కాల్ / వాట్సాప్: 98490 12345`;
    } else {
      return `🌿 *Mana Palle Fresh - Today's Farm Rates (HMT Nagar)* 🌿\n\n` +
        `Direct village farm-fresh harvest delivered to your apartment:\n` +
        `🥛 *1. Morning Health Milk* - ₹${milkPrice}/Litre\n` +
        `   • Pure Desi Cow (A2) & Thick Buffalo Milk (500ml, 1L, 2L)\n` +
        `   • Delivered 6:00 - 8:00 AM daily | Flexible subscription\n\n` +
        `🐟 *2. Fresh Village Fish* - ₹${fishPrice}/kg\n` +
        `   • Freshwater pond Rohu & Katla | Free descaling & curry cut\n\n` +
        `🥩 *3. Fresh Village Mutton* - ₹${mutPrice}/kg\n` +
        `   • Turmeric washed | Curry Cut, Boneless, Keema, Liver, Paya\n\n` +
        `🚚 *Slots:* Morning 6:00 - 8:00 AM | Evening 5:00 - 8:00 PM\n` +
        `👉 Order before 10:00 PM tonight for tomorrow morning batch:\n` +
        `📲 Order at: https://beige-cycles-sleep.loca.lt\n` +
        `📞 Call / WhatsApp: +91 98490 12345`;
    }
  }
}

window.manaStore = new ManaStore();
