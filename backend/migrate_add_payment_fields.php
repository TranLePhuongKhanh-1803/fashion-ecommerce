<?php
// Mock REQUEST_METHOD to avoid warning in config.php
$_SERVER['REQUEST_METHOD'] = 'CLI';

require_once __DIR__ . '/app/config/config.php';
require_once __DIR__ . '/app/core/Database.php';

try {
    $dbObj = new Database();
    $db = $dbObj->getConnection();
    
    // Modify ENUM payment_status
    $query1 = "ALTER TABLE orders MODIFY COLUMN payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending'";
    $db->exec($query1);
    echo "Modified payment_status ENUM successfully.\n";

    // Add transaction_id
    try {
        $db->exec("ALTER TABLE orders ADD COLUMN transaction_id VARCHAR(100) AFTER payment_status");
        echo "Added transaction_id column.\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
            echo "transaction_id already exists.\n";
        } else {
            throw $e;
        }
    }

    // Add receipt_image
    try {
        $db->exec("ALTER TABLE orders ADD COLUMN receipt_image VARCHAR(255) AFTER transaction_id");
        echo "Added receipt_image column.\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
            echo "receipt_image already exists.\n";
        } else {
            throw $e;
        }
    }

    // Add paid_at
    try {
        $db->exec("ALTER TABLE orders ADD COLUMN paid_at TIMESTAMP NULL AFTER receipt_image");
        echo "Added paid_at column.\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
            echo "paid_at already exists.\n";
        } else {
            throw $e;
        }
    }

    echo "Migration completed successfully!\n";

} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
