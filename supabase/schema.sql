-- ============================================================================
-- MANA PALLE FRESH (ZFRESH) - PRODUCTION SUPABASE (POSTGRESQL) SCHEMA
-- Hyperlocal Village-to-Apartment Delivery System • HMT Nagar, Hyderabad
-- STRICTLY 3 SERVICES: Morning Health Milk | Fresh Village Fish | Fresh Village Mutton
-- ============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PRODUCTS TABLE (Strictly 3 services: Milk, Fish, Mutton)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('milk', 'fish', 'mutton')),
    unit VARCHAR(30) NOT NULL, -- 'Litre' or 'kg'
    price NUMERIC(10, 2) NOT NULL, -- Selling price to customer
    buy_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00, -- Village procurement cost
    available BOOLEAN NOT NULL DEFAULT true,
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. RATE HISTORY TABLE (Tracks daily market rate changes by owner)
CREATE TABLE IF NOT EXISTS public.rate_history (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    old_price NUMERIC(10, 2) NOT NULL,
    new_price NUMERIC(10, 2) NOT NULL,
    old_buy_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    new_buy_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    apartment_name VARCHAR(150) NOT NULL,
    block_wing VARCHAR(30) DEFAULT 'A',
    flat_number VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY, -- e.g. ORD-1001
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    apartment_name VARCHAR(150) NOT NULL,
    block_wing VARCHAR(30),
    flat_number VARCHAR(30) NOT NULL,
    delivery_date DATE NOT NULL,
    delivery_slot VARCHAR(30) NOT NULL CHECK (delivery_slot IN ('morning', 'evening')),
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('upi', 'cod', 'wallet')),
    paid BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(30) NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id),
    name VARCHAR(150) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    cutting_instructions TEXT
);

-- 7. MILK SUBSCRIPTIONS TABLE (Morning 6:00 - 8:00 AM delivery)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id TEXT PRIMARY KEY, -- e.g. SUB-201
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id),
    litres NUMERIC(4, 2) NOT NULL DEFAULT 1.0, -- 0.5, 1.0, 2.0
    frequency VARCHAR(30) NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'alternate')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
    paused_until DATE,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ALERTS / BROADCASTS TABLE
CREATE TABLE IF NOT EXISTS public.alerts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    audience VARCHAR(100) NOT NULL DEFAULT 'all', -- 'all', 'milk_subscribers', or specific apartment name
    recipients_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR HIGH-PERFORMANCE HYPERLOCAL QUERIES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON public.orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_apartment ON public.orders(apartment_name);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON public.subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_rate_history_product_id ON public.rate_history(product_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Security: Block public anon key from direct table modifications.
-- Only the backend via the SERVICE ROLE key has access.
-- ============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Allow public read of active available products only (for customer web catalog)
CREATE POLICY "Public can read available products"
    ON public.products FOR SELECT
    TO anon, authenticated
    USING (available = true);

-- Deny all direct public inserts/updates/deletes on all tables.
-- The backend uses the SUPABASE_SERVICE_ROLE_KEY which bypasses RLS securely.
