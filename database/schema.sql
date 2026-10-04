-- ============================================================================
-- PALLE NATURAL FOODS - HOSTINGER MYSQL PRODUCTION SCHEMA
-- Hyperlocal Village-to-Apartment Fresh Delivery • HMT Nagar, Hyderabad
-- STRICTLY 3 SERVICES: Morning Health Milk | Fresh Village Fish | Fresh Village Mutton
-- ENGINE: InnoDB | CHARSET: utf8mb4 (Full Telugu & Multilingual support)
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. PRODUCTS TABLE (Strictly 3 services: Milk, Fish, Mutton)
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `subscriptions`;
DROP TABLE IF EXISTS `rate_history`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `apartment_leads`;
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `apartments`;
DROP TABLE IF EXISTS `alerts`;
DROP TABLE IF EXISTS `otp_codes`;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `products` (
    `id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `category` ENUM('milk', 'fish', 'mutton') NOT NULL,
    `unit` VARCHAR(30) NOT NULL, -- 'Litre' or 'kg'
    `price` DECIMAL(10, 2) NOT NULL, -- Customer selling price
    `buy_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00, -- Village procurement cost
    `available` TINYINT(1) NOT NULL DEFAULT 1,
    `image_url` TEXT,
    `description` TEXT,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. RATE HISTORY TABLE (Tracks daily market rate changes by owner)
CREATE TABLE `rate_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `product_id` VARCHAR(50) NOT NULL,
    `old_price` DECIMAL(10, 2) NOT NULL,
    `new_price` DECIMAL(10, 2) NOT NULL,
    `old_buy_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `new_buy_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `changed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_rate_history_product_id` (`product_id`),
    CONSTRAINT `fk_rate_history_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. APARTMENTS TABLE (Hyperlocal communities)
CREATE TABLE `apartments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL UNIQUE,
  `area` VARCHAR(120) DEFAULT 'HMT Nagar',
  `status` ENUM('active','launching_soon','inactive') DEFAULT 'launching_soon',
  `launch_date` DATE NULL,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. APARTMENT LEADS TABLE (Waitlist / Notify me for launching_soon apartments)
CREATE TABLE `apartment_leads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `apartment_id` INT NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`apartment_id`) REFERENCES `apartments`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_apartment_lead` (`apartment_id`, `phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. CUSTOMERS TABLE (HMT Nagar apartment residents)
CREATE TABLE `customers` (
    `id` VARCHAR(64) NOT NULL,
    `customer_key` VARCHAR(64) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `apartment_id` INT NULL,
    `apartment_name` VARCHAR(150) NOT NULL,
    `block_wing` VARCHAR(30) DEFAULT 'A',
    `flat_number` VARCHAR(30) NOT NULL,
    `referral_code` VARCHAR(30) DEFAULT NULL,
    `referred_by` VARCHAR(30) DEFAULT NULL,
    `blocked` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_customers_phone` (`phone`),
    UNIQUE KEY `uniq_customers_key` (`customer_key`),
    KEY `idx_customers_apartment` (`apartment_id`),
    CONSTRAINT `fk_customer_apartment` FOREIGN KEY (`apartment_id`) REFERENCES `apartments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ORDERS TABLE
CREATE TABLE `orders` (
    `id` VARCHAR(50) NOT NULL, -- e.g. ORD-1001
    `customer_id` VARCHAR(64) NOT NULL,
    `apartment_name` VARCHAR(150) NOT NULL,
    `block_wing` VARCHAR(30) DEFAULT 'A',
    `flat_number` VARCHAR(30) NOT NULL,
    `delivery_date` DATE NOT NULL,
    `delivery_slot` ENUM('morning', 'evening') NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `payment_method` ENUM('cod', 'upi', 'wallet') NOT NULL DEFAULT 'cod',
    `paid` TINYINT(1) NOT NULL DEFAULT 0,
    `status` ENUM('placed', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled') NOT NULL DEFAULT 'placed',
    `notes` TEXT DEFAULT NULL,
    `rating` TINYINT DEFAULT NULL,
    `feedback` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_orders_delivery_date` (`delivery_date`),
    KEY `idx_orders_customer_id` (`customer_id`),
    KEY `idx_orders_status` (`status`),
    KEY `idx_orders_apartment` (`apartment_name`),
    CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ORDER ITEMS TABLE
CREATE TABLE `order_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` VARCHAR(50) NOT NULL,
    `product_id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL,
    `unit` VARCHAR(30) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `total_price` DECIMAL(10, 2) NOT NULL,
    `cutting_instructions` TEXT DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_order_items_order_id` (`order_id`),
    KEY `idx_order_items_product_id` (`product_id`),
    CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. MILK SUBSCRIPTIONS TABLE (Morning 6:00 - 8:00 AM delivery)
CREATE TABLE `subscriptions` (
    `id` VARCHAR(50) NOT NULL, -- e.g. SUB-201
    `customer_id` VARCHAR(64) NOT NULL,
    `product_id` VARCHAR(50) NOT NULL,
    `litres` DECIMAL(4, 2) NOT NULL DEFAULT 1.00, -- 0.5, 1.0, 2.0
    `frequency` ENUM('daily', 'alternate') NOT NULL DEFAULT 'daily',
    `status` ENUM('active', 'paused', 'cancelled') NOT NULL DEFAULT 'active',
    `paused_until` DATE DEFAULT NULL,
    `start_date` DATE NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_subscriptions_customer_id` (`customer_id`),
    KEY `idx_subscriptions_status` (`status`),
    CONSTRAINT `fk_subscriptions_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_subscriptions_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. WHATSAPP & BROADCAST ALERTS TABLE
CREATE TABLE `alerts` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `audience` VARCHAR(100) NOT NULL DEFAULT 'all',
    `recipients_count` INT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. OTP CODES TABLE (Mobile sign up / login verification)
CREATE TABLE `otp_codes` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(20) NOT NULL,
    `otp_hash` VARCHAR(255) NOT NULL,
    `attempts` TINYINT NOT NULL DEFAULT 0,
    `expires_at` TIMESTAMP NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_otp_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
