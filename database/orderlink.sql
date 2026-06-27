-- ============================================================
--  OrderLink - B2B Distribution & Delivery Platform
--  Database Schema + Seed Data
--  Compatible: MySQL 8.0+
-- ============================================================

SET FOREIGN_KEY_CHECKS=0;
CREATE DATABASE IF NOT EXISTS orderlink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE orderlink;

-- ============================================================
-- USERS (distributor | retailer | driver)
-- ============================================================
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('distributor','retailer','driver') NOT NULL DEFAULT 'retailer',
    phone VARCHAR(20) NULL,
    address TEXT NULL,
    company_name VARCHAR(255) NULL,
    is_active TINYINT(1) DEFAULT 1,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SANCTUM TOKENS
-- ============================================================
CREATE TABLE personal_access_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    abilities TEXT NULL,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX tokenable (tokenable_type, tokenable_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- PRODUCT CATEGORIES
-- ============================================================
CREATE TABLE product_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT UNSIGNED NULL,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NULL,
    price DECIMAL(15,2) NOT NULL DEFAULT 0,
    wholesale_price DECIMAL(15,2) NULL,
    unit VARCHAR(50) DEFAULT 'pcs',
    stock INT DEFAULT 0,
    min_stock INT DEFAULT 10,
    image VARCHAR(255) NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- STOCK MOVEMENTS
-- ============================================================
CREATE TABLE stock_movements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT UNSIGNED NOT NULL,
    type ENUM('in','out') NOT NULL,
    quantity INT NOT NULL,
    reference VARCHAR(255) NULL,
    notes TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    retailer_id BIGINT UNSIGNED NOT NULL,
    status ENUM('pending','confirmed','processing','shipped','delivered','cancelled') DEFAULT 'pending',
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    notes TEXT NULL,
    delivery_address TEXT NULL,
    scheduled_delivery DATE NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (retailer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- DELIVERIES
-- ============================================================
CREATE TABLE deliveries (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    driver_id BIGINT UNSIGNED NULL,
    status ENUM('assigned','picked_up','on_the_way','delivered','failed') DEFAULT 'assigned',
    lat DECIMAL(10,8) NULL,
    lng DECIMAL(11,8) NULL,
    estimated_arrival DATETIME NULL,
    delivered_at DATETIME NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- DELIVERY PROOFS
-- ============================================================
CREATE TABLE delivery_proofs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    delivery_id BIGINT UNSIGNED NOT NULL,
    photo VARCHAR(255) NULL,
    recipient_name VARCHAR(255) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- INVOICES
-- ============================================================
CREATE TABLE invoices (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    order_id BIGINT UNSIGNED NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    status ENUM('unpaid','paid','overdue') DEFAULT 'unpaid',
    due_date DATE NULL,
    paid_at DATETIME NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NULL,
    type VARCHAR(50) NULL,
    reference_id BIGINT UNSIGNED NULL,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS=1;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Users (password: "password" - bcrypt hash)
INSERT INTO users (name, email, password, role, phone, company_name, is_active, created_at, updated_at) VALUES
('Admin Distributor',  'admin@orderlink.com',    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'distributor', '081234567890', 'PT OrderLink Indonesia', 1, NOW(), NOW()),
('Toko Maju Jaya',     'retailer@orderlink.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'retailer',    '082345678901', 'Toko Maju Jaya',         1, NOW(), NOW()),
('Budi Santoso',       'driver@orderlink.com',   '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'driver',      '083456789012', NULL,                     1, NOW(), NOW()),
('Sinar Abadi Store',  'retailer2@orderlink.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'retailer',    '084567890123', 'Toko Sinar Abadi',       1, NOW(), NOW());

-- Categories
INSERT INTO product_categories (name, description, created_at, updated_at) VALUES
('Sembako',    'Bahan kebutuhan pokok sehari-hari', NOW(), NOW()),
('Minuman',    'Berbagai jenis minuman',             NOW(), NOW()),
('Snack',      'Makanan ringan dan camilan',         NOW(), NOW()),
('Kebersihan', 'Produk kebersihan rumah tangga',     NOW(), NOW());

-- Products
INSERT INTO products (category_id, name, sku, description, price, wholesale_price, unit, stock, min_stock, is_active, created_at, updated_at) VALUES
(1, 'Beras Premium 5kg',    'BRS-001', 'Beras putih premium kualitas terbaik',    75000, 65000, 'karung', 150, 20, 1, NOW(), NOW()),
(1, 'Minyak Goreng 2L',     'MYK-001', 'Minyak goreng kemasan 2 liter',           38000, 32000, 'botol',  200, 30, 1, NOW(), NOW()),
(1, 'Gula Pasir 1kg',       'GLA-001', 'Gula pasir putih 1 kilogram',             15000, 12000, 'bungkus',300, 50, 1, NOW(), NOW()),
(1, 'Tepung Terigu 1kg',    'TPG-001', 'Tepung terigu serbaguna',                 12000,  9500, 'bungkus',250, 40, 1, NOW(), NOW()),
(2, 'Aqua 1.5L',            'AQA-001', 'Air mineral dalam kemasan 1.5 liter',      5000,  3500, 'botol',  500,100, 1, NOW(), NOW()),
(2, 'Teh Botol 350ml',      'TBT-001', 'Minuman teh dalam kemasan botol',          4500,  3000, 'botol',  400, 80, 1, NOW(), NOW()),
(2, 'Kopi Sachet',          'KPI-001', 'Kopi instant dalam sachet',                2000,  1500, 'sachet', 800,150, 1, NOW(), NOW()),
(3, 'Indomie Goreng',       'IDM-001', 'Mie instan rasa goreng',                   3500,  2800, 'bungkus',1000,200,1, NOW(), NOW()),
(3, 'Chitato 68gr',         'CHT-001', 'Keripik kentang aneka rasa',               8000,  6500, 'bungkus',300, 60, 1, NOW(), NOW()),
(4, 'Sabun Cuci Piring 500ml','SBN-001','Sabun cuci piring kemasan 500ml',        12000,  9500, 'botol',  250, 40, 1, NOW(), NOW()),
(4, 'Deterjen Bubuk 1kg',   'DTR-001', 'Deterjen bubuk untuk pakaian',            18000, 14000, 'bungkus',180, 30, 1, NOW(), NOW()),
(4, 'Pewangi Ruangan',      'PWG-001', 'Pewangi ruangan spray 250ml',             22000, 18000, 'botol',  120, 20, 1, NOW(), NOW());
