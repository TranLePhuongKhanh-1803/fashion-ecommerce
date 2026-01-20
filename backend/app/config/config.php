<?php
/**
 * Configuration File
 */

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'fashion_ecommerce');

// Application Configuration
define('BASE_URL', 'http://localhost:8000');
define('FRONTEND_URL', 'http://localhost:5173');

// Security
define('JWT_SECRET', 'your-secret-key-change-in-production');
define('JWT_EXPIRY', 3600 * 24); // 24 hours

// CORS Headers
header('Access-Control-Allow-Origin: ' . FRONTEND_URL);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Timezone
date_default_timezone_set('Asia/Ho_Chi_Minh');

// Error Reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);
