-- ============================================================================
-- PALLE NATURAL FOODS - MYSQL SEED DATA
-- STRICTLY 3 SERVICES: 1. Morning Health Milk | 2. Fresh Village Fish | 3. Fresh Village Mutton
-- Absolutely NO rice, vegetables, grains, eggs, chicken or other groceries.
-- ============================================================================

-- 1. SEED STRICTLY 6 PRODUCTS
INSERT INTO `products` (`id`, `name`, `category`, `unit`, `price`, `buy_price`, `available`, `image_url`, `description`) VALUES
('prod-milk-morning', 'Morning Health Milk', 'milk', 'Litre', 90.00, 70.00, 1, 'assets/dairy.jpg', 'Fresh raw unpasteurized A2 Desi cow & buffalo milk sourced at dawn from Siddipet & Gajwel farmers. Delivered between 6:00 - 8:00 AM.'),
('prod-fish-rohu', 'Rohu Fish', 'fish', 'kg', 240.00, 180.00, 1, 'assets/fish.jpg', 'Freshwater pond Rohu fish from Singur irrigation tanks. Free descaling and sliced into neat curry cut steaks.'),
('prod-fish-katla', 'Katla Fish', 'fish', 'kg', 260.00, 195.00, 1, 'assets/fish.jpg', 'Freshwater pond Katla / Bocha fish. Sweet tender flesh, perfect for traditional tamarind fish pulusu.'),
('prod-mut-curry', 'Mutton Curry Cut', 'mutton', 'kg', 850.00, 680.00, 1, 'assets/mutton.jpg', 'Grass-fed village sheep from Alair pastoralists. Washed with natural turmeric water, medium bone-in pieces.'),
('prod-mut-boneless', 'Mutton Boneless', 'mutton', 'kg', 980.00, 780.00, 1, 'assets/mutton.jpg', '100% tender boneless cuts from fresh village sheep hind leg, cleaned with turmeric water.'),
('prod-mut-keema', 'Mutton Keema', 'mutton', 'kg', 920.00, 730.00, 1, 'assets/mutton.jpg', 'Hand-minced fresh village mutton keema, zero frozen meat, zero preservatives.')
ON DUPLICATE KEY UPDATE 
    `price` = VALUES(`price`),
    `buy_price` = VALUES(`buy_price`),
    `available` = VALUES(`available`);

-- 2. SEED INITIAL RATE HISTORY
INSERT INTO `rate_history` (`product_id`, `old_price`, `new_price`, `old_buy_price`, `new_buy_price`, `changed_at`) VALUES
('prod-fish-rohu', 230.00, 240.00, 170.00, 180.00, NOW() - INTERVAL 2 DAY),
('prod-fish-katla', 250.00, 260.00, 185.00, 195.00, NOW() - INTERVAL 2 DAY),
('prod-mut-curry', 820.00, 850.00, 650.00, 680.00, NOW() - INTERVAL 3 DAY),
('prod-milk-morning', 85.00, 90.00, 65.00, 70.00, NOW() - INTERVAL 5 DAY);

-- 3. SEED APARTMENTS (Active in exact order + Launching Soon)
INSERT INTO `apartments` (`id`, `name`, `area`, `status`, `sort_order`) VALUES
(1, 'Shneha Apartment',      'HMT Nagar', 'active', 1),
(2, 'Amdur Castle Apartment', 'HMT Nagar', 'active', 2),
(3, 'Pally Residency',       'HMT Nagar', 'active', 3),
(4, 'Srinivasa Heights',      'HMT Nagar', 'launching_soon', 4)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `status` = VALUES(`status`), `sort_order` = VALUES(`sort_order`);

-- Sample waitlist lead for launching soon apartment
INSERT INTO `apartment_leads` (`apartment_id`, `phone`) VALUES
(4, '98490 99887')
ON DUPLICATE KEY UPDATE `phone` = VALUES(`phone`);

-- 4. SEED 6 PILOT APARTMENT CUSTOMERS IN HMT NAGAR
INSERT INTO `customers` (`id`, `customer_key`, `name`, `phone`, `apartment_id`, `apartment_name`, `block_wing`, `flat_number`, `referral_code`, `blocked`) VALUES
('c0000001-0000-0000-0000-000000000001', 'key-cust-0001-srinivas-9849012345', 'Srinivas Rao', '98490 12345', 1, 'Shneha Apartment', 'Block A', '204', 'PALLE-SRI01', 0),
('c0000002-0000-0000-0000-000000000002', 'key-cust-0002-vani-9849023456', 'Vani Sharma', '98490 23456', 1, 'Shneha Apartment', 'Block B', '302', 'PALLE-VAN02', 0),
('c0000003-0000-0000-0000-000000000003', 'key-cust-0003-rajesh-9849034567', 'Rajesh Kumar', '98490 34567', 2, 'Amdur Castle Apartment', 'Wing 1', '402', 'PALLE-RAJ03', 0),
('c0000004-0000-0000-0000-000000000004', 'key-cust-0004-kavitha-9849045678', 'Kavitha Reddy', '98490 45678', 3, 'Pally Residency', 'Block B', '105', 'PALLE-KAV04', 0),
('c0000005-0000-0000-0000-000000000005', 'key-cust-0005-venkat-9849056789', 'Venkat Ramana', '98490 56789', 2, 'Amdur Castle Apartment', 'Tower 1', '501', 'PALLE-VEN05', 0),
('c0000006-0000-0000-0000-000000000006', 'key-cust-0006-lakshmi-9849067890', 'Lakshmi Prasanna', '98490 67890', 3, 'Pally Residency', 'North Wing', '203', 'PALLE-LAK06', 0)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `customer_key` = VALUES(`customer_key`);

-- 5. SEED SAMPLE ORDERS
INSERT INTO `orders` (`id`, `customer_id`, `apartment_name`, `block_wing`, `flat_number`, `delivery_date`, `delivery_slot`, `total_amount`, `payment_method`, `paid`, `status`, `notes`) VALUES
('ORD-1001', 'c0000001-0000-0000-0000-000000000001', 'Shneha Apartment', 'Block A', '204', CURDATE(), 'morning', 940.00, 'upi', 1, 'confirmed', 'Medium curry cut, deliver before 7 AM'),
('ORD-1002', 'c0000002-0000-0000-0000-000000000002', 'Shneha Apartment', 'Block B', '302', CURDATE(), 'morning', 260.00, 'cod', 0, 'placed', 'Fish cleaned and steaks sliced'),
('ORD-1003', 'c0000003-0000-0000-0000-000000000003', 'Amdur Castle Apartment', 'Wing 1', '402', CURDATE(), 'evening', 850.00, 'upi', 1, 'out_for_delivery', 'Tender pieces for dinner'),
('ORD-1004', 'c0000004-0000-0000-0000-000000000004', 'Pally Residency', 'Block B', '105', CURDATE() + INTERVAL 1 DAY, 'morning', 500.00, 'cod', 0, 'placed', 'Pre-order for tomorrow morning')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- 5. SEED ORDER ITEMS
INSERT INTO `order_items` (`order_id`, `product_id`, `name`, `quantity`, `unit`, `price`, `total_price`, `cutting_instructions`) VALUES
('ORD-1001', 'prod-mut-curry', 'Mutton Curry Cut', 1.00, 'kg', 850.00, 850.00, 'Medium bone-in curry pieces'),
('ORD-1001', 'prod-milk-morning', 'Morning Health Milk', 1.00, 'Litre', 90.00, 90.00, 'Glass bottle'),
('ORD-1002', 'prod-fish-katla', 'Katla Fish', 1.00, 'kg', 260.00, 260.00, 'Cleaned steaks with head'),
('ORD-1003', 'prod-mut-curry', 'Mutton Curry Cut', 1.00, 'kg', 850.00, 850.00, 'Turmeric washed'),
('ORD-1004', 'prod-fish-rohu', 'Rohu Fish', 1.00, 'kg', 240.00, 240.00, 'Curry cut'),
('ORD-1004', 'prod-fish-katla', 'Katla Fish', 1.00, 'kg', 260.00, 260.00, 'Cleaned & gutted whole');

-- 6. SEED MILK SUBSCRIPTIONS
INSERT INTO `subscriptions` (`id`, `customer_id`, `product_id`, `litres`, `frequency`, `status`, `start_date`) VALUES
('SUB-201', 'c0000001-0000-0000-0000-000000000001', 'prod-milk-morning', 1.00, 'daily', 'active', CURDATE() - INTERVAL 15 DAY),
('SUB-202', 'c0000002-0000-0000-0000-000000000002', 'prod-milk-morning', 2.00, 'daily', 'active', CURDATE() - INTERVAL 10 DAY),
('SUB-203', 'c0000003-0000-0000-0000-000000000003', 'prod-milk-morning', 1.00, 'alternate', 'active', CURDATE() - INTERVAL 7 DAY),
('SUB-204', 'c0000004-0000-0000-0000-000000000004', 'prod-milk-morning', 0.50, 'daily', 'paused', CURDATE() - INTERVAL 20 DAY)
ON DUPLICATE KEY UPDATE `litres` = VALUES(`litres`);

-- 7. SEED PAST ALERTS
INSERT INTO `alerts` (`title`, `message`, `audience`, `recipients_count`, `created_at`) VALUES
('Tender Village Mutton Harvested', 'Direct from Alair shepherds. Morning fresh cut delivered before 8:00 AM.', 'all', 48, NOW() - INTERVAL 1 DAY),
('Fresh Pond Katla Fish Arrived', 'Sweet freshwater Katla harvested this morning. Cleaned steaks available.', 'Raghavendra Nilayam', 18, NOW() - INTERVAL 2 DAY);
