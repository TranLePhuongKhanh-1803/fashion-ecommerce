-- Fashion E-Commerce Database - Complete Schema
-- Safe to run on both new and existing databases
-- This version fixes all previous errors

-- 1. DROP existing database if you want fresh start (optional)
-- DROP DATABASE IF EXISTS fashion_ecommerce;

-- 2. CREATE database
CREATE DATABASE IF NOT EXISTS fashion_ecommerce CHARACTER SET utf8 COLLATE utf8_unicode_ci;
USE fashion_ecommerce;

-- 3. DROP existing tables if they exist (optional)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- 4. Users Table (FIXED: removed duplicate timestamp issue)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- 5. Products Table (FIXED: added brand column from beginning)
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2) NULL,
    category VARCHAR(50) NOT NULL,
    brand VARCHAR(100) NULL,
    image VARCHAR(255),
    images TEXT,
    size VARCHAR(20),
    color VARCHAR(50),
    stock INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_featured (featured),
    INDEX idx_brand (brand),
    INDEX idx_color (color)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- 6. Cart Items Table
CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_item (user_id, product_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- 7. Orders Table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_number VARCHAR(50) UNIQUE,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT,
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_order_number (order_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- 8. Order Items Table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- 9. Insert Users FIRST (to avoid foreign key errors)
-- Password for both: 'password' (hashed)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Test User', 'user@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user');

-- 10. Insert Products
INSERT INTO products (name, description, price, discount_price, category, brand, image, size, color, stock, featured) VALUES
-- Shirts (5 products)
('Classic White T-Shirt', 'Premium cotton t-shirt with modern fit. Perfect for everyday wear.', 29.99, 24.99, 'shirts', 'Basic Style', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 'M,L,XL', 'White', 50, TRUE),
('Striped Polo Shirt', 'Classic striped polo shirt for casual occasions.', 49.99, 39.99, 'shirts', 'Polo Club', 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=500', 'S,M,L,XL', 'Navy Blue', 45, TRUE),
('Formal Dress Shirt', 'Crisp white dress shirt for business occasions.', 59.99, 49.99, 'shirts', 'Business Elite', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500', 'S,M,L,XL,XXL', 'White', 50, FALSE),
('Casual Button-Down Shirt', 'Relaxed fit button-down shirt in soft blue.', 44.99, NULL, 'shirts', 'Weekend Wear', 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500', 'S,M,L,XL', 'Light Blue', 35, FALSE),
('Long Sleeve Henley', 'Comfortable henley shirt with three-button placket.', 39.99, 34.99, 'shirts', 'Comfort Zone', 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=500', 'M,L,XL', 'Gray', 40, FALSE),

-- Jackets (5 products)
('Black Leather Jacket', 'Genuine leather jacket with classic design.', 199.99, 179.99, 'jackets', 'Leather Craft', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500', 'S,M,L,XL', 'Black', 30, TRUE),
('Wool Winter Coat', 'Warm wool coat perfect for cold weather.', 249.99, 219.99, 'jackets', 'Winter Wear', 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500', 'M,L,XL', 'Navy', 20, TRUE),
('Denim Jacket', 'Classic blue denim jacket.', 79.99, 69.99, 'jackets', 'Denim Co', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500', 'S,M,L,XL', 'Blue', 38, FALSE),
('Bomber Jacket', 'Sporty bomber jacket with ribbed cuffs.', 89.99, 79.99, 'jackets', 'Urban Style', 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500', 'S,M,L,XL', 'Black', 32, FALSE),
('Trench Coat', 'Elegant trench coat for rainy days.', 179.99, 159.99, 'jackets', 'Elegance', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500', 'S,M,L,XL', 'Beige', 25, FALSE),

-- Pants (5 products)
('Blue Denim Jeans', 'Comfortable denim jeans with perfect fit.', 79.99, 69.99, 'pants', 'Denim Co', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', '28,30,32,34,36', 'Blue', 40, TRUE),
('Athletic Leggings', 'Comfortable athletic leggings for sports.', 44.99, 39.99, 'pants', 'Sport Fit', 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5d?w=500', 'XS,S,M,L', 'Black', 40, TRUE),
('Chino Pants', 'Classic chino pants in khaki.', 59.99, 49.99, 'pants', 'Business Elite', 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500', '30,32,34,36', 'Khaki', 45, FALSE),
('Black Dress Pants', 'Slim-fit dress pants for formal occasions.', 69.99, NULL, 'pants', 'Business Elite', 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500', '30,32,34,36,38', 'Black', 35, FALSE),
('Cargo Pants', 'Utility cargo pants with multiple pockets.', 64.99, 54.99, 'pants', 'Utility Wear', 'https://images.unsplash.com/photo-1624378515194-666023323228?w=500', '30,32,34,36', 'Olive Green', 30, FALSE),

-- Dresses (5 products)
('Summer Floral Dress', 'Elegant floral print dress for summer.', 89.99, 74.99, 'dresses', 'Garden Party', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', 'XS,S,M,L', 'Floral Print', 25, TRUE),
('Elegant Evening Dress', 'Beautiful evening dress for special occasions.', 299.99, 269.99, 'dresses', 'Elegance', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', 'XS,S,M,L', 'Black', 15, TRUE),
('Casual Midi Dress', 'Comfortable midi dress perfect for everyday.', 69.99, 59.99, 'dresses', 'Weekend Wear', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500', 'XS,S,M,L', 'Pink', 28, FALSE),
('Cocktail Dress', 'Chic cocktail dress for parties.', 119.99, 99.99, 'dresses', 'Party Time', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500', 'XS,S,M,L', 'Red', 22, FALSE),
('Maxi Summer Dress', 'Long flowing maxi dress perfect for summer.', 79.99, 69.99, 'dresses', 'Summer Breeze', 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500', 'XS,S,M,L', 'Yellow', 30, FALSE),

-- Shoes (5 products)
('Running Sneakers', 'Comfortable running shoes with cushioning.', 129.99, 109.99, 'shoes', 'Sport Fit', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', '40,41,42,43,44', 'White', 35, TRUE),
('Leather Boots', 'Classic leather boots for all seasons.', 149.99, 129.99, 'shoes', 'Leather Craft', 'https://images.unsplash.com/photo-1608256246200-53bd35f3f44e?w=500', '40,41,42,43,44', 'Brown', 25, TRUE),
('Canvas Sneakers', 'Casual canvas sneakers in classic design.', 49.99, 39.99, 'shoes', 'Casual Steps', 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500', '39,40,41,42,43', 'White', 45, FALSE),
('Dress Shoes', 'Elegant dress shoes for formal occasions.', 179.99, 159.99, 'shoes', 'Business Elite', 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500', '40,41,42,43,44', 'Black', 30, FALSE),
('High-Top Sneakers', 'Stylish high-top sneakers for street style.', 89.99, 79.99, 'shoes', 'Urban Style', 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=500', '40,41,42,43,44', 'Black/White', 35, FALSE),

-- Shorts (3 products)
('Cargo Shorts', 'Practical cargo shorts with multiple pockets.', 59.99, 49.99, 'shorts', 'Utility Wear', 'https://images.unsplash.com/photo-1624378515194-666023323228?w=500', '30,32,34,36', 'Khaki', 30, TRUE),
('Chino Shorts', 'Classic chino shorts for summer.', 44.99, 39.99, 'shorts', 'Summer Breeze', 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500', '30,32,34,36', 'Navy Blue', 40, FALSE),
('Bermuda Shorts', 'Classic Bermuda shorts with knee-length cut.', 54.99, NULL, 'shorts', 'Weekend Wear', 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500', '30,32,34,36', 'Beige', 35, FALSE),

-- Sweaters (4 products)
('Knit Sweater', 'Warm and cozy knit sweater for winter.', 69.99, 59.99, 'sweaters', 'Winter Wear', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500', 'S,M,L,XL', 'Gray', 35, TRUE),
('Casual Hoodie', 'Soft and comfortable hoodie for everyday.', 79.99, 69.99, 'sweaters', 'Comfort Zone', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500', 'M,L,XL,XXL', 'Navy', 45, TRUE),
('Cable Knit Cardigan', 'Classic cable knit cardigan.', 89.99, 79.99, 'sweaters', 'Cozy Home', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500', 'S,M,L,XL', 'Cream', 30, FALSE),
('Turtleneck Sweater', 'Elegant turtleneck sweater.', 74.99, 64.99, 'sweaters', 'Elegance', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500', 'S,M,L,XL', 'Black', 38, FALSE),

-- Accessories (5 products)
('Canvas Backpack', 'Durable canvas backpack with laptop compartment.', 79.99, 69.99, 'accessories', 'Travel Gear', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', 'One Size', 'Navy', 40, TRUE),
('Leather Belt', 'Genuine leather belt with classic buckle.', 34.99, 29.99, 'accessories', 'Leather Craft', 'https://images.unsplash.com/photo-1624222247344-550fb60583fd?w=500', '32,34,36,38', 'Brown', 50, FALSE),
('Leather Wallet', 'Slim leather wallet with multiple card slots.', 49.99, 44.99, 'accessories', 'Leather Craft', 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500', 'One Size', 'Black', 60, FALSE),
('Sun Hat', 'Stylish sun hat for summer protection.', 29.99, 24.99, 'accessories', 'Summer Breeze', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500', 'One Size', 'Beige', 35, FALSE),
('Scarf', 'Soft cashmere blend scarf.', 39.99, 34.99, 'accessories', 'Winter Wear', 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500', 'One Size', 'Red', 45, FALSE);

-- 11. Create trigger for updated_at (optional)
DELIMITER $$
CREATE TRIGGER update_users_timestamp 
BEFORE UPDATE ON users 
FOR EACH ROW 
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER update_products_timestamp 
BEFORE UPDATE ON products 
FOR EACH ROW 
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$
DELIMITER ;

