<?php
/**
 * Migration: Add 'staff' role to users table
 * Run this script once to update the database schema
 */
require_once __DIR__ . '/app/config/config.php';
require_once __DIR__ . '/app/core/Database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // ALTER the ENUM to include 'staff'
    $sql = "ALTER TABLE users MODIFY COLUMN role ENUM('user', 'admin', 'staff') DEFAULT 'user'";
    $db->exec($sql);
    echo "✅ ALTER TABLE users: role ENUM updated to include 'staff'\n";

    // Insert a test staff user (password: 'password')
    $hashedPassword = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
    
    // Check if staff user already exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = 'staff@example.com'");
    $stmt->execute();
    
    if (!$stmt->fetch()) {
        $stmt = $db->prepare(
            "INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, 'staff', NOW())"
        );
        $stmt->execute(['Staff User', 'staff@example.com', $hashedPassword]);
        echo "✅ Created test staff user: staff@example.com / password\n";
    } else {
        // Update existing user to staff role
        $db->exec("UPDATE users SET role = 'staff' WHERE email = 'staff@example.com'");
        echo "✅ Staff user already exists, updated role to 'staff'\n";
    }

    echo "\n🎉 Migration completed successfully!\n";
} catch (Exception $e) {
    echo "❌ Migration failed: " . $e->getMessage() . "\n";
}
