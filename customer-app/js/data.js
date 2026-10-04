// Mana Palle Fresh - STRICTLY ONLY 3 SERVICES
// 1. Morning Health Milk | 2. Fresh Village Fish | 3. Fresh Village Mutton

window.MANA_APARTMENTS = [
  { id: "apt-1", name: "Raghavendra Nilayam", area: "HMT Nagar", landmark: "Opp. Community Hall", blocks: ["A", "B"], flatsCount: 48 },
  { id: "apt-2", name: "Aditya Enclave", area: "HMT Nagar", landmark: "Near HMT Water Tank", blocks: ["Wing 1", "Wing 2"], flatsCount: 60 },
  { id: "apt-3", name: "Sri Sai Srinivas Residency", area: "HMT Nagar", landmark: "Road No. 4", blocks: ["A", "B", "C"], flatsCount: 72 },
  { id: "apt-4", name: "Venkateshwara Towers", area: "HMT Nagar", landmark: "Main Road", blocks: ["Block 1", "Block 2"], flatsCount: 54 },
  { id: "apt-5", name: "Harivillu Apartments", area: "HMT Nagar", landmark: "Near Park", blocks: ["Wing A"], flatsCount: 36 },
  { id: "apt-6", name: "Kakatiya Heights", area: "HMT Nagar", landmark: "Road No. 2, Cross Road", blocks: ["North", "South"], flatsCount: 44 },
  { id: "apt-7", name: "Balaji Pride", area: "HMT Nagar", landmark: "Near Bus Stop", blocks: ["Block A"], flatsCount: 32 },
  { id: "apt-8", name: "Gayatri Emerald", area: "HMT Nagar", landmark: "Near D-Mart Road", blocks: ["A Wing", "B Wing"], flatsCount: 50 },
  { id: "apt-9", name: "Vasavi Shanthi Nivas", area: "HMT Nagar", landmark: "Lane 3", blocks: ["Main Block"], flatsCount: 28 },
  { id: "apt-10", name: "Sai Teja Residency", area: "HMT Nagar", landmark: "Near Rama Temple", blocks: ["Tower 1"], flatsCount: 40 }
];

// STRICTLY ONLY THESE 3 SERVICES (EXACT USER ORDER)
window.MANA_CATEGORIES = [
  {
    id: "milk",
    name_en: "Morning Health Milk",
    name_te: "ఉదయపు ఆరోగ్యకరమైన పాలు",
    icon: "🥛",
    tagline_en: "Pure Desi Cow & Buffalo Milk • Delivered 6:00 - 8:00 AM",
    tagline_te: "స్వచ్ఛమైన ఆవు & గేదె పాలు • ప్రతి ఉదయం 6-8 AM కి డెలివరీ",
    bannerImg: "assets/dairy.jpg"
  },
  {
    id: "fish",
    name_en: "Fresh Village Fish",
    name_te: "తాజా చెరువు చేపలు",
    icon: "🐟",
    tagline_en: "Freshwater village pond fish (Rohu, Katla) • Free descaling",
    tagline_te: "మంచినీటి చెరువు చేపలు (రోహు, బొచ్చె) • ఉచిత శుభ్రత & కోత",
    bannerImg: "assets/fish.jpg"
  },
  {
    id: "mutton",
    name_en: "Fresh Village Mutton",
    name_te: "తాజా పల్లెటూరి మటన్",
    icon: "🥩",
    tagline_en: "Grass-fed village sheep • Washed with yellow turmeric",
    tagline_te: "మేక/గొర్రె నాటు మాంసం • పసుపు నీటి శుభ్రత",
    bannerImg: "assets/mutton.jpg"
  }
];

// PRODUCTS STRICTLY FOR THE 3 SERVICES
window.MANA_PRODUCTS = [
  // ==========================================
  // 1. MORNING HEALTH MILK (Delivered 6-8 AM, Daily/Alternate Subscriptions, 500ml/1L/2L)
  // ==========================================
  {
    id: "prod-milk-cow",
    categoryId: "milk",
    title_en: "Morning Health Milk - Pure Desi Cow Milk (A2)",
    title_te: "ఉదయపు ఆరోగ్యకరమైన పాలు - స్వచ్ఛమైన ఆవు పాలు (A2)",
    description_en: "Fresh raw unpasteurized A2 milk from indigenous free-grazing cows. Milked at dawn, chilled, and delivered directly to your doorstep between 6:00 AM - 8:00 AM.",
    description_te: "సిద్దిపేట నాటు ఆవుల నుండి తెల్లవారుజామున సేకరించిన స్వచ్ఛమైన పాలు. ఉదయం 6-8 AM లోపు మీ గుమ్మానికి డెలివరీ.",
    unit: "Litre",
    unit_te: "లీటరు",
    basePrice: 90,
    villageSource: "Siddipet Desi Goshala",
    image: "assets/dairy.jpg",
    isAvailable: true,
    isSubscriptionEligible: true,
    badge: "Delivered 6:00 - 8:00 AM",
    badge_te: "ఉదయం 6-8 AM డెలివరీ",
    cuts: [
      { id: "pack-bottle", name_en: "Returnable Sterilized Glass Bottle", name_te: "గాజు సీసా ప్యాకింగ్", priceDelta: 0 },
      { id: "pack-pouch", name_en: "Bio-Grade Sealed Pouch", name_te: "సీల్డ్ పౌచ్", priceDelta: 0 }
    ],
    weights: [
      { label: "500ml", multiplier: 0.5 },
      { label: "1L", multiplier: 1.0, isDefault: true },
      { label: "2L", multiplier: 2.0 }
    ]
  },
  {
    id: "prod-milk-buf",
    categoryId: "milk",
    title_en: "Morning Health Milk - Thick Village Buffalo Milk",
    title_te: "ఉదయపు ఆరోగ్యకరమైన పాలు - చిక్కటి పల్లె గేదె పాలు",
    description_en: "Pure whole cream (7.5%+ fat) village buffalo milk from smallholder dairy farmers in Gajwel. Perfect for thick curd, tea, and homemade ghee. Delivered 6:00 - 8:00 AM.",
    description_te: "గజ్వేల్ గ్రామీణ రైతుల నుండి సేకరించిన స్వచ్ఛమైన చిక్కటి గేదె పాలు. పెరుగు, టీకి అనువైనది.",
    unit: "Litre",
    unit_te: "లీటరు",
    basePrice: 85,
    villageSource: "Gajwel Rural Dairy",
    image: "assets/dairy.jpg",
    isAvailable: true,
    isSubscriptionEligible: true,
    badge: "Delivered 6:00 - 8:00 AM",
    badge_te: "ఉదయం 6-8 AM డెలివరీ",
    cuts: [
      { id: "pack-buf-bottle", name_en: "Returnable Glass Bottle", name_te: "గాజు సీసా", priceDelta: 0 },
      { id: "pack-buf-pouch", name_en: "Sealed Pouch", name_te: "సీల్డ్ పౌచ్", priceDelta: 0 }
    ],
    weights: [
      { label: "500ml", multiplier: 0.5 },
      { label: "1L", multiplier: 1.0, isDefault: true },
      { label: "2L", multiplier: 2.0 }
    ]
  },

  // ==========================================
  // 2. FRESH VILLAGE FISH (Rohu, Katla, etc. • Weights: 500g, 1kg • Whole/Cleaned/Curry cut)
  // ==========================================
  {
    id: "prod-fish-rohu",
    categoryId: "fish",
    title_en: "Fresh Village Fish - Freshwater Rohu (రూపచంద్ / రోహు)",
    title_te: "తాజా చెరువు చేపలు - మంచినీటి రోహు చేప",
    description_en: "Freshly harvested from village irrigation tanks. Cleaned, thoroughly descaled with sea salt and sliced into neat steaks.",
    description_te: "గ్రామీణ చెరువు నుండి పట్టిన తాజా మంచినీటి రోహు చేప. పొలుసులు తీసి శుభ్రపరిచిన ముక్కలు.",
    unit: "kg",
    unit_te: "కిలో",
    basePrice: 240,
    villageSource: "Singur Reservoir Village Ponds",
    image: "assets/fish.jpg",
    isAvailable: true,
    badge: "Pond Catch",
    badge_te: "చెరువు తాజా వేట",
    cuts: [
      { id: "opt-curry", name_en: "Curry Cut (Steaks with Head)", name_te: "కూర ముక్కలు (స్టీక్స్)", priceDelta: 0 },
      { id: "opt-cleaned", name_en: "Cleaned & Gutted (Whole)", name_te: "శుభ్రం చేసినది (ముక్కలు చేయకుండా)", priceDelta: 0 },
      { id: "opt-whole", name_en: "Whole Fish (Uncleaned / Intact)", name_te: "పూర్తి చేప (ముట్టనిది)", priceDelta: -10 }
    ],
    weights: [
      { label: "500g", multiplier: 0.5 },
      { label: "1kg", multiplier: 1.0, isDefault: true }
    ]
  },
  {
    id: "prod-fish-katla",
    categoryId: "fish",
    title_en: "Fresh Village Fish - Freshwater Katla / Bocha (బొచ్చె)",
    title_te: "తాజా చెరువు చేపలు - మంచినీటి బొచ్చె / కాట్లా చేప",
    description_en: "Sweet freshwater pond Katla. Tender flesh, highly praised for traditional tamarind fish pulusu and pan fry.",
    description_te: "పల్లెటూరి మంచినీటి చెరువు నుండి తెచ్చిన బొచ్చె చేప. చేపల పులుసుకు అత్యంత రుచికరమైనది.",
    unit: "kg",
    unit_te: "కిలో",
    basePrice: 260,
    villageSource: "Kaleshwaram Inflow Canal Tanks",
    image: "assets/fish.jpg",
    isAvailable: true,
    badge: "Pond Catch",
    badge_te: "చెరువు తాజా వేట",
    cuts: [
      { id: "opt-katla-curry", name_en: "Curry Cut (Steaks with Head)", name_te: "కూర ముక్కలు (స్టీక్స్)", priceDelta: 0 },
      { id: "opt-katla-cleaned", name_en: "Cleaned & Gutted (Whole)", name_te: "శుభ్రం చేసినది (ముక్కలు చేయకుండా)", priceDelta: 0 },
      { id: "opt-katla-whole", name_en: "Whole Fish (Uncleaned / Intact)", name_te: "పూర్తి చేప", priceDelta: -10 }
    ],
    weights: [
      { label: "500g", multiplier: 0.5 },
      { label: "1kg", multiplier: 1.0, isDefault: true }
    ]
  },

  // ==========================================
  // 3. FRESH VILLAGE MUTTON (Cuts: curry cut, boneless, keema, liver, paya • Weights: 250g, 500g, 1kg)
  // ==========================================
  {
    id: "prod-mut-village",
    categoryId: "mutton",
    title_en: "Fresh Village Mutton",
    title_te: "తాజా పల్లెటూరి మటన్",
    description_en: "Grass-fed free-range Telangana village sheep directly from Alair shepherds. Cleaned with fresh turmeric water, 100% tender, zero cold-storage freezing.",
    description_te: "యాదగిరిగుట్ట, అలేరు గ్రామాల నుండి సేకరించిన నాటు గొర్రె మాంసం. పసుపు నీటితో శుభ్రం చేసిన ఆరోగ్యకరమైన తాజా మాంసం.",
    unit: "kg",
    unit_te: "కిలో",
    basePrice: 850,
    villageSource: "Alair & Yadagirigutta Pastoralists",
    image: "assets/mutton.jpg",
    isAvailable: true,
    badge: "Morning Fresh Cut",
    badge_te: "ఉదయపు తాజా కోత",
    cuts: [
      { id: "cut-curry", name_en: "Curry Cut (Medium Bone-in)", name_te: "కర్రీ కట్ (ఎముకల కూర ముక్కలు)", priceDelta: 0 },
      { id: "cut-boneless", name_en: "Boneless (Tender Hind Leg)", name_te: "బోన్‌లెస్ ముక్కలు (ఎముకలు లేనివి)", priceDelta: 150 },
      { id: "cut-keema", name_en: "Keema (Hand-Minced)", name_te: "చేతితో కొట్టిన తాజా కీమా", priceDelta: 80 },
      { id: "cut-liver", name_en: "Liver (Kaleji - Fresh)", name_te: "తాజా లివర్ (కాలేయం)", priceDelta: -50 },
      { id: "cut-paya", name_en: "Paya (Cleaned Trotters / Soup Bones - 4 Pcs)", name_te: "శుభ్రం చేసిన మేక కాళ్ళు (పాయా - 4 ముక్కలు)", priceDelta: 0 }
    ],
    weights: [
      { label: "250g", multiplier: 0.25 },
      { label: "500g", multiplier: 0.5 },
      { label: "1kg", multiplier: 1.0, isDefault: true }
    ]
  }
];

// INITIAL SEED ORDERS (STRICTLY FOR THE 3 SERVICES)
window.MANA_SEED_ORDERS = [
  {
    id: "ORD-801",
    customerName: "Srinivas Rao",
    customerPhone: "98490 12345",
    apartmentId: "apt-1",
    apartmentName: "Raghavendra Nilayam",
    blockWing: "A",
    flatNumber: "204",
    deliveryDate: "Tomorrow",
    deliverySlot: "morning",
    status: "placed",
    paymentMethod: "upi",
    paymentStatus: "paid",
    totalAmount: 940,
    items: [
      { productId: "prod-mut-village", productTitle: "Fresh Village Mutton", cutName: "Curry Cut (Medium Bone-in)", quantityText: "1kg", price: 850, instructions: "Small bone pieces, wash with turmeric" },
      { productId: "prod-milk-cow", productTitle: "Morning Health Milk - Pure Desi Cow Milk", cutName: "Returnable Glass Bottle", quantityText: "1L", price: 90, instructions: "Morning 6:30 AM drop" }
    ],
    createdAt: "2026-10-04 13:45"
  },
  {
    id: "ORD-802",
    customerName: "Kavitha Reddy",
    customerPhone: "97012 34567",
    apartmentId: "apt-2",
    apartmentName: "Aditya Enclave",
    blockWing: "Wing 2",
    flatNumber: "402",
    deliveryDate: "Tomorrow",
    deliverySlot: "morning",
    status: "procured",
    paymentMethod: "cod",
    paymentStatus: "pending",
    totalAmount: 260,
    items: [
      { productId: "prod-fish-katla", productTitle: "Fresh Village Fish - Freshwater Katla", cutName: "Curry Cut (Steaks with Head)", quantityText: "1kg", price: 260, instructions: "Thin curry steaks" }
    ],
    createdAt: "2026-10-04 14:02"
  },
  {
    id: "ORD-803",
    customerName: "Anand Kumar",
    customerPhone: "99887 65432",
    apartmentId: "apt-3",
    apartmentName: "Sri Sai Srinivas Residency",
    blockWing: "B",
    flatNumber: "105",
    deliveryDate: "Tomorrow",
    deliverySlot: "morning",
    status: "placed",
    paymentMethod: "wallet",
    paymentStatus: "paid",
    totalAmount: 930,
    items: [
      { productId: "prod-mut-village", productTitle: "Fresh Village Mutton", cutName: "Keema (Hand-Minced)", quantityText: "1kg", price: 930, instructions: "Traditional hand-chopped keema" }
    ],
    createdAt: "2026-10-04 14:15"
  }
];

// MILK SUBSCRIPTION SEED LIST
window.MANA_SEED_SUBSCRIPTIONS = [
  {
    id: "SUB-301",
    customerName: "Srinivas Rao",
    customerPhone: "98490 12345",
    apartmentName: "Raghavendra Nilayam",
    flatNumber: "204",
    productId: "prod-milk-cow",
    productTitle: "Morning Health Milk - Desi Cow Milk",
    quantityLitres: 1.0,
    frequency: "daily",
    slot: "morning",
    status: "active",
    pricePerDay: 90
  },
  {
    id: "SUB-302",
    customerName: "Rajesh Sharma",
    customerPhone: "98480 55443",
    apartmentName: "Aditya Enclave",
    flatNumber: "302",
    productId: "prod-milk-buf",
    productTitle: "Morning Health Milk - Buffalo Milk",
    quantityLitres: 2.0,
    frequency: "daily",
    slot: "morning",
    status: "active",
    pricePerDay: 170
  },
  {
    id: "SUB-303",
    customerName: "Lakshmi Priya",
    customerPhone: "94405 88776",
    apartmentName: "Kakatiya Heights",
    flatNumber: "101",
    productId: "prod-milk-cow",
    productTitle: "Morning Health Milk - Desi Cow Milk",
    quantityLitres: 1.0,
    frequency: "alternate",
    slot: "morning",
    status: "active",
    pricePerDay: 90
  }
];
