<?php
require_once __DIR__ . '/app/config/config.php';

try {
    $db = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8",
        DB_USER,
        DB_PASS
    );
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Creating user_addresses table...\n";
    $db->exec("
        CREATE TABLE IF NOT EXISTS user_addresses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            label VARCHAR(50) DEFAULT 'Nhà',
            full_name VARCHAR(100) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            street_address TEXT NOT NULL,
            ward VARCHAR(100),
            district VARCHAR(100),
            province VARCHAR(100),
            ward_code VARCHAR(10),
            district_code VARCHAR(10),
            province_code VARCHAR(10),
            is_default TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL DEFAULT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    ");
    echo "Success: user_addresses table created.\n";

    echo "\nMigration completed successfully!\n";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
