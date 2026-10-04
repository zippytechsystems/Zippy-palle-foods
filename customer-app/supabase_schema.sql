-- =====================================================================
-- MANA PALLE FRESH (మన పల్లె ఫ్రెష్) - PRODUCTION DATABASE SCHEMA
-- Target Engine: PostgreSQL / Supabase
-- Hyperlocal Village-to-Apartment Food Delivery • HMT Nagar, Hyderabad
-- STRICTLY 3 SERVICES: 1. Morning Health Milk | 2. Fresh Village Fish | 3. Fresh Village Mutton
-- =====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. APARTMENTS TABLE (10 Pilot Gated Communities in HMT Nagar)
CREATE TABLE IF NOT EXISTS public.apartments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    area VARCHAR(100) DEFAULT 'HMT Nagar',
    landmark VARCHAR(150),
    blocks JSONB DEFAULT '["A", "B"]'::jsonb,
    flats_count INT DEFAULT 40,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed HMT Nagar Apartments
INSERT INTO public.apartments (name, area, landmark, blocks, flats_count) VALUES
('Raghavendra Nilayam', 'HMT Nagar', 'Opp. Community Hall', '["A", "B"]'::jsonb, 48),
('Aditya Enclave', 'HMT Nagar', 'Near HMT Water Tank', '["Wing 1", "Wing 2"]'::jsonb, 60),
('Sri Sai Srinivas Residency', 'HMT Nagar', 'Road No. 4', '["A", "B", "C"]'::jsonb, 72),
('Venkateshwara Towers', 'HMT Nagar', 'Main Road', '["Block 1", "Block 2"]'::jsonb, 54),
('Harivillu Apartments', 'HMT Nagar', 'Near Children Park', '["Wing A"]'::jsonb, 36),
('Kakatiya Heights', 'HMT Nagar', 'Road No. 2, Cross Road', '["North", "South"]'::jsonb, 44),
('Balaji Pride', 'HMT Nagar', 'Beside Bus Stop', '["Block A"]'::jsonb, 32),
('Gayatri Emerald', 'HMT Nagar', 'Near D-Mart Road', '["A Wing", "B Wing"]'::jsonb, 50),
('Vasavi Shanthi Nivas', 'HMT Nagar', 'Lane 3, Post Office Rd', '["Main"]'::jsonb, 28),
('Sai Teja Residency', 'HMT Nagar', 'Near Rama Temple', '["Tower 1"]'::jsonb, 40)
ON CONFLICT DO NOTHING;

-- 3. USER PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    apartment_id UUID REFERENCES public.apartments(id),
    block_wing VARCHAR(30),
    flat_number VARCHAR(30),
    role VARCHAR(20) DEFAULT 'customer', -- 'customer', 'admin', 'delivery'
    preferred_lang VARCHAR(5) DEFAULT 'en', -- 'en' or 'te'
    wallet_balance NUMERIC(10, 2) DEFAULT 150.00,
    referral_code VARCHAR(20) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. STRICTLY 3 PRODUCT CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id VARCHAR(50) PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_te VARCHAR(100) NOT NULL,
    icon VARCHAR(20) NOT NULL,
    sort_order INT DEFAULT 0
);

INSERT INTO public.categories (id, name_en, name_te, icon, sort_order) VALUES
('milk', 'Morning Health Milk', 'ఉదయపు ఆరోగ్యకరమైన పాలు', '🥛', 1),
('fish', 'Fresh Village Fish', 'తాజా చెరువు చేపలు', '🐟', 2),
('mutton', 'Fresh Village Mutton', 'తాజా పల్లెటూరి మటన్', '🥩', 3)
ON CONFLICT (id) DO NOTHING;

-- 5. PRODUCTS (DAILY UPDATED BASE PRICES)
CREATE TABLE IF NOT EXISTS public.products (
    id VARCHAR(50) PRIMARY KEY,
    category_id VARCHAR(50) REFERENCES public.categories(id),
    title_en VARCHAR(150) NOT NULL,
    title_te VARCHAR(150) NOT NULL,
    description_en TEXT,
    description_te TEXT,
    unit VARCHAR(20) NOT NULL, -- 'kg' or 'Litre'
    base_price NUMERIC(10, 2) NOT NULL, -- Updated daily by owner
    village_source VARCHAR(150) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    is_subscription_eligible BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. PRODUCT CUTS / PREFERENCES
CREATE TABLE IF NOT EXISTS public.product_variants (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES public.products(id) ON DELETE CASCADE,
    name_en VARCHAR(100) NOT NULL, -- 'Curry Cut', 'Boneless', 'Keema', 'Liver', 'Paya', 'Whole', 'Cleaned'
    name_te VARCHAR(100) NOT NULL,
    price_delta NUMERIC(10, 2) DEFAULT 0.00
);

-- 7. ORDERS & PRE-ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id VARCHAR(50) PRIMARY KEY, -- 'ORD-9101'
    customer_id UUID REFERENCES public.profiles(id),
    apartment_id UUID REFERENCES public.apartments(id),
    block_wing VARCHAR(30),
    flat_number VARCHAR(30) NOT NULL,
    delivery_date VARCHAR(30) NOT NULL,
    delivery_slot VARCHAR(30) NOT NULL, -- 'morning_6_9', 'evening_5_8'
    total_amount NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    delivery_fee NUMERIC(10, 2) DEFAULT 0.00,
    payment_method VARCHAR(20) NOT NULL, -- 'upi', 'cod', 'wallet'
    payment_status VARCHAR(20) DEFAULT 'pending', -- 'paid', 'pending'
    status VARCHAR(30) DEFAULT 'placed', -- 'placed', 'procured', 'out_for_delivery', 'delivered'
    delivery_partner_id UUID REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. ORDER ITEMS WITH CUTTING/CLEANING PREFERENCES
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(50) REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id VARCHAR(50) REFERENCES public.products(id),
    cut_name VARCHAR(100),
    quantity_text VARCHAR(50) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    cutting_instructions TEXT -- Customer cutting note (e.g., small bone pieces)
);

-- 9. MILK SUBSCRIPTIONS (DAILY / ALTERNATE DAYS)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id VARCHAR(50) PRIMARY KEY, -- 'SUB-201'
    customer_id UUID REFERENCES public.profiles(id),
    product_id VARCHAR(50) REFERENCES public.products(id),
    quantity_litres NUMERIC(4, 2) DEFAULT 1.0, -- 500ml, 1L, 2L
    frequency VARCHAR(30) DEFAULT 'daily', -- 'daily' or 'alternate'
    preferred_slot VARCHAR(30) DEFAULT 'morning_6_9',
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'cancelled'
    start_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. REVIEWS & RATINGS
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(50) REFERENCES public.orders(id),
    customer_name VARCHAR(100),
    flat_number VARCHAR(50),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public read apartments" ON public.apartments FOR SELECT USING (true);
