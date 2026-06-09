<?php
require_once __DIR__ . '/app/config/config.php';

try {
    $db = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8",
        DB_USER,
        DB_PASS
    );
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Adding is_deleted to products table...\n";
    try {
        $db->exec("ALTER TABLE products ADD COLUMN is_deleted TINYINT(1) DEFAULT 0 AFTER status");
        echo "Success: is_deleted added to products.\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
            echo "Column is_deleted already exists in products.\n";
        } else {
            throw $e;
        }
    }

    echo "Adding is_deleted to users table...\n";
    try {
        $db->exec("ALTER TABLE users ADD COLUMN is_deleted TINYINT(1) DEFAULT 0 AFTER role");
        echo "Success: is_deleted added to users.\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
            echo "Column is_deleted already exists in users.\n";
        } else {
            throw $e;
        }
    }

    echo "Migration completed successfully!\n";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
