-- ============================================================================
-- MANA PALLE FRESH (ZFRESH) - SEED DATA (STRICTLY 3 SERVICES, 6 ITEMS ONLY)
-- 1. Morning Health Milk | 2. Fresh Village Fish | 3. Fresh Village Mutton
-- ============================================================================

-- Clean existing data
TRUNCATE TABLE public.order_items CASCADE;
TRUNCATE TABLE public.orders CASCADE;
TRUNCATE TABLE public.subscriptions CASCADE;
TRUNCATE TABLE public.rate_history CASCADE;
TRUNCATE TABLE public.customers CASCADE;
TRUNCATE TABLE public.products CASCADE;
TRUNCATE TABLE public.alerts CASCADE;

-- 1. SEED STRICTLY 6 PRODUCTS (ONLY MILK, FISH, MUTTON)
INSERT INTO public.products (id, name, category, unit, price, buy_price, available, image_url, description) VALUES
('prod-milk-morning', 'Morning Health Milk', 'milk', 'Litre', 90.00, 70.00, true, 'assets/dairy.jpg', 'Fresh raw unpasteurized A2 Desi cow & buffalo milk sourced at dawn from Siddipet & Gajwel farmers. Delivered between 6:00 - 8:00 AM.'),
('prod-fish-rohu', 'Rohu Fish', 'fish', 'kg', 240.00, 180.00, true, 'assets/fish.jpg', 'Freshwater pond Rohu fish from Singur irrigation tanks. Free descaling and sliced into neat curry cut steaks.'),
('prod-fish-katla', 'Katla Fish', 'fish', 'kg', 260.00, 195.00, true, 'assets/fish.jpg', 'Freshwater pond Katla / Bocha fish. Sweet tender flesh, perfect for traditional tamarind fish pulusu.'),
('prod-mut-curry', 'Mutton Curry Cut', 'mutton', 'kg', 850.00, 680.00, true, 'assets/mutton.jpg', 'Grass-fed village sheep from Alair pastoralists. Washed with natural turmeric water, medium bone-in pieces.'),
('prod-mut-boneless', 'Mutton Boneless', 'mutton', 'kg', 980.00, 780.00, true, 'assets/mutton.jpg', '100% tender boneless cuts from fresh village sheep hind leg, cleaned with turmeric water.'),
('prod-mut-keema', 'Mutton Keema', 'mutton', 'kg', 920.00, 730.00, true, 'assets/mutton.jpg', 'Hand-minced fresh village mutton keema, zero frozen meat, zero preservatives.');

-- 2. SEED INITIAL RATE HISTORY
INSERT INTO public.rate_history (product_id, old_price, new_price, old_buy_price, new_buy_price, changed_at) VALUES
('prod-fish-rohu', 230.00, 240.00, 170.00, 180.00, NOW() - INTERVAL '2 days'),
('prod-fish-katla', 250.00, 260.00, 185.00, 195.00, NOW() - INTERVAL '2 days'),
('prod-mut-curry', 820.00, 850.00, 650.00, 680.00, NOW() - INTERVAL '3 days'),
('prod-milk-morning', 85.00, 90.00, 65.00, 70.00, NOW() - INTERVAL '5 days');

-- 3. SEED 6 PILOT CUSTOMERS IN HMT NAGAR APARTMENTS
INSERT INTO public.customers (id, name, phone, apartment_name, block_wing, flat_number) VALUES
('c0000001-0000-0000-0000-000000000001', 'Srinivas Rao', '98490 12345', 'Raghavendra Nilayam', 'Block A', '204'),
('c0000002-0000-0000-0000-000000000002', 'Vani Sharma', '98490 23456', 'Raghavendra Nilayam', 'Block B', '302'),
('c0000003-0000-0000-0000-000000000003', 'Rajesh Kumar', '98490 34567', 'Aditya Enclave', 'Wing 1', '402'),
('c0000004-0000-0000-0000-000000000004', 'Kavitha Reddy', '98490 45678', 'Sri Sai Srinivas Residency', 'Block B', '105'),
('c0000005-0000-0000-0000-000000000005', 'Venkat Ramana', '98490 56789', 'Venkateshwara Towers', 'Tower 1', '501'),
('c0000006-0000-0000-0000-000000000006', 'Lakshmi Prasanna', '98490 67890', 'Kakatiya Heights', 'North Wing', '203');

-- 4. SEED SAMPLE ORDERS
INSERT INTO public.orders (id, customer_id, apartment_name, block_wing, flat_number, delivery_date, delivery_slot, total_amount, payment_method, paid, status, notes) VALUES
('ORD-1001', 'c0000001-0000-0000-0000-000000000001', 'Raghavendra Nilayam', 'Block A', '204', CURRENT_DATE, 'morning', 940.00, 'upi', true, 'confirmed', 'Medium curry cut, deliver before 7 AM'),
('ORD-1002', 'c0000002-0000-0000-0000-000000000002', 'Raghavendra Nilayam', 'Block B', '302', CURRENT_DATE, 'morning', 260.00, 'cod', false, 'placed', 'Fish cleaned and steaks sliced'),
('ORD-1003', 'c0000003-0000-0000-0000-000000000003', 'Aditya Enclave', 'Wing 1', '402', CURRENT_DATE, 'evening', 850.00, 'upi', true, 'out_for_delivery', 'Tender pieces for dinner'),
('ORD-1004', 'c0000004-0000-0000-0000-000000000004', 'Sri Sai Srinivas Residency', 'Block B', '105', CURRENT_DATE + INTERVAL '1 day', 'morning', 500.00, 'cod', false, 'placed', 'Pre-order for tomorrow morning');

-- 5. SEED ORDER ITEMS
INSERT INTO public.order_items (order_id, product_id, name, quantity, unit, price, total_price, cutting_instructions) VALUES
('ORD-1001', 'prod-mut-curry', 'Mutton Curry Cut', 1.0, 'kg', 850.00, 850.00, 'Medium bone-in curry pieces'),
('ORD-1001', 'prod-milk-morning', 'Morning Health Milk', 1.0, 'Litre', 90.00, 90.00, 'Glass bottle'),
('ORD-1002', 'prod-fish-katla', 'Katla Fish', 1.0, 'kg', 260.00, 260.00, 'Cleaned steaks with head'),
('ORD-1003', 'prod-mut-curry', 'Mutton Curry Cut', 1.0, 'kg', 850.00, 850.00, 'Turmeric washed'),
('ORD-1004', 'prod-fish-rohu', 'Rohu Fish', 1.0, 'kg', 240.00, 240.00, 'Curry cut'),
('ORD-1004', 'prod-fish-katla', 'Katla Fish', 1.0, 'kg', 260.00, 260.00, 'Cleaned & gutted whole');

-- 6. SEED MILK SUBSCRIPTIONS (DAILY / ALTERNATE)
INSERT INTO public.subscriptions (id, customer_id, product_id, litres, frequency, status, start_date) VALUES
('SUB-201', 'c0000001-0000-0000-0000-000000000001', 'prod-milk-morning', 1.0, 'daily', 'active', CURRENT_DATE - INTERVAL '15 days'),
('SUB-202', 'c0000002-0000-0000-0000-000000000002', 'prod-milk-morning', 2.0, 'daily', 'active', CURRENT_DATE - INTERVAL '10 days'),
('SUB-203', 'c0000003-0000-0000-0000-000000000003', 'prod-milk-morning', 1.0, 'alternate', 'active', CURRENT_DATE - INTERVAL '7 days'),
('SUB-204', 'c0000004-0000-0000-0000-000000000004', 'prod-milk-morning', 0.5, 'daily', 'paused', CURRENT_DATE - INTERVAL '20 days');

-- 7. SEED PAST ALERTS
INSERT INTO public.alerts (title, message, audience, recipients_count, created_at) VALUES
('Tender Village Mutton Harvested', 'Direct from Alair shepherds. Morning fresh cut delivered before 8:00 AM.', 'all', 48, NOW() - INTERVAL '1 day'),
('Fresh Pond Katla Fish Arrived', 'Sweet freshwater Katla harvested this morning. Cleaned steaks available.', 'Raghavendra Nilayam', 18, NOW() - INTERVAL '2 days');
